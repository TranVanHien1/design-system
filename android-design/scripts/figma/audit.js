// android-design · Figma audit — READ-ONLY script for the Figma MCP `use_figma` tool (Plugin API, top-level await/return).
// Paste the file as `code` after setting PAGE_ID (and optionally FRAMES). One call per page; run pages in parallel.
// It never mutates the file. Returns a compact JSON report: per-frame hard rules (H*) and soft signals (S*), plus a
// component-set inventory for library pages. Fix every H finding before handing over (references/figma.md §Gates).
const PAGE_ID = '__PAGE_ID__';            // e.g. '15:2009'
const FRAMES = null;                       // or ['18:2231', ...] to audit only these top-level frames
const SPACING = [0, 8, 12, 16, 24];        // padding / itemSpacing scale (layout.md)
const RADII = [0, 4, 8, 12, 16, 20, 24, 28, 32];
const EXAMPLES = 4;                        // example node ids per finding
const COMPONENT_NAMES = [];                // names of the file's component sets (e.g. ['Theme tile','App row']): a FRAME with that name on a screen = drawn copy

const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
const tops = page.children.filter((n) => (FRAMES ? FRAMES.includes(n.id) : ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'SECTION'].includes(n.type)));

const lum = (c) => { const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const solid = (paints) => (Array.isArray(paints) ? paints.filter((p) => p.visible !== false && p.type === 'SOLID') : []);
const insideInstance = (n) => { for (let p = n.parent; p; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };
function bgColor(n) { // nearest ancestor with an (almost) opaque solid fill; null when only translucent layers / images / gradients are behind
  for (let p = n.parent; p && p.type !== 'PAGE'; p = p.parent) {
    if (!('fills' in p) || !Array.isArray(p.fills)) continue;
    const vis = p.fills.filter((f) => f.visible !== false);
    if (!vis.length) continue;
    const top = vis[vis.length - 1];
    if (top.type === 'SOLID' && (top.opacity ?? 1) >= 0.9 && (p.opacity ?? 1) >= 0.9) return top.color;
    return null;
  }
  return null;
}
function unbound(n, key) { // solid paints without a variable binding or a style
  if (!(key in n) || !Array.isArray(n[key])) return false;
  if (key === 'fills' && n.fillStyleId) return false;
  if (key === 'strokes' && n.strokeStyleId) return false;
  return solid(n[key]).some((p) => !(p.boundVariables && p.boundVariables.color));
}

function auditFrame(frame) {
  const H = {}, S = {};
  const add = (bag, k, n) => { (bag[k] = bag[k] || { n: 0, ex: [] }).n++; if (bag[k].ex.length < EXAMPLES) bag[k].ex.push(n.id + ' ' + n.name.slice(0, 24)); };
  const fonts = new Set();
  let nodes = 0, inst = 0, text = 0;
  const all = frame.findAll(() => true);
  for (const n of all) {
    nodes++;
    if (n.type === 'INSTANCE') inst++;
    const owned = !insideInstance(n);            // layers the screen owns (instance internals belong to their component)
    if (n.type === 'TEXT') {
      text++;
      if (n.hasMissingFont) add(H, 'H1 missing font', n);
      const fn = n.fontName; if (fn && typeof fn === 'object') fonts.add(fn.family);
      if (owned && !n.textStyleId) add(H, 'H2 text without text style', n);
      if (owned && n.textAutoResize === 'NONE' && n.textTruncation !== 'ENDING') add(S, 'S1 fixed-size text box (may clip)', n);
      const fill = solid(n.fills)[0], bg = bgColor(n);
      if (fill && bg) { const r = ratio(fill.color, bg), big = (n.fontSize || 14) >= 18 || ((n.fontSize || 14) >= 14 && /Bold/.test(n.fontName && n.fontName.style)); if (r < (big ? 3 : 4.5)) add(H, `H3 contrast < ${big ? 3 : 4.5}:1`, n); }
      else if (fill) add(S, 'S2 text on translucent/image/gradient bg — check contrast on the render', n);
    }
    if (owned && n !== frame && !/placeholder/i.test(n.name) && (unbound(n, 'fills') || unbound(n, 'strokes'))) add(H, 'H4 hard-coded colour (no variable/style)', n);
    if (owned && n.type === 'FRAME' && COMPONENT_NAMES.includes(n.name.split(/ [\/·] /)[0].trim())) add(H, 'H8 drawn copy of a component (use an instance)', n);
    if (owned && 'layoutMode' in n && n.type !== 'INSTANCE') {
      if (n.layoutMode === 'NONE' && n !== frame && 'children' in n && n.children.length > 1 && n.type !== 'GROUP' && !/bg|background|halo|art|illustration|pattern/i.test(n.name)) add(S, 'S3 frame with several children but no auto layout', n);
      if (n.layoutMode !== 'NONE') {
        const vals = [n.itemSpacing, n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].filter((v) => typeof v === 'number');
        if (vals.some((v) => !SPACING.includes(Math.round(v))) && !(n.boundVariables && (n.boundVariables.itemSpacing || n.boundVariables.paddingLeft))) add(H, 'H5 spacing off 0/8/12/16/24', n);
      }
    }
    if (owned && 'cornerRadius' in n && typeof n.cornerRadius === 'number' && n.cornerRadius > 0) {
      const round = n.cornerRadius >= Math.min(n.width, n.height) / 2 - 0.5;
      if (!round && !RADII.includes(Math.round(n.cornerRadius))) add(S, 'S4 radius off scale', n);
    }
    if (owned && (n.type === 'VECTOR' || n.type === 'BOOLEAN_OPERATION') && n.parent && n.parent.type !== 'COMPONENT') add(H, 'H6 loose vector (icons must be instances)', n);
    if (n.placeholder === true) add(H, 'H7 placeholder shimmer left on', n);
    if (owned && n.type === 'FRAME' && n.name.match(/^(Frame|Group|Rectangle) \d+/)) add(S, 'S5 default layer name', n);
  }
  // overflow: owned direct children of the screen that stick out of it
  if ('children' in frame) for (const c of frame.children) {
    if (c.absoluteBoundingBox && frame.absoluteBoundingBox) {
      const a = c.absoluteBoundingBox, b = frame.absoluteBoundingBox;
      if (a.x < b.x - 1 || a.y < b.y - 1 || a.x + a.width > b.x + b.width + 1 || a.y + a.height > b.y + b.height + 1) add(S, 'S6 child outside the screen bounds', c);
    }
  }
  return { id: frame.id, name: frame.name, size: `${Math.round(frame.width)}x${Math.round(frame.height)}`, nodes, instances: inst, instanceShare: nodes ? Math.round((100 * inst) / nodes) + '%' : '0%', text, fonts: [...fonts], H, S };
}

function auditSets() { // library pages: every component set needs a description, ≥2 variants and properties for its text/icons
  return page.findAllWithCriteria({ types: ['COMPONENT_SET'] }).map((s) => {
    const defs = s.componentPropertyDefinitions || {};
    const kinds = Object.values(defs).reduce((m, d) => ((m[d.type] = (m[d.type] || 0) + 1), m), {});
    const issues = [];
    if (!s.description) issues.push('no description');
    if (s.children.length < 2) issues.push('single variant');
    if (s.findAllWithCriteria({ types: ['TEXT'] }).length && !kinds.TEXT) issues.push('text not exposed as TEXT property');
    if (s.findAllWithCriteria({ types: ['INSTANCE'] }).some((i) => /icon/i.test(i.name)) && !kinds.INSTANCE_SWAP) issues.push('icon not swappable');
    const loose = s.findAll((n) => 'fills' in n && Array.isArray(n.fills) && !n.fillStyleId && n.fills.some((p) => p.visible !== false && p.type === 'SOLID' && !(p.boundVariables && p.boundVariables.color)) && !(() => { for (let q = n.parent; q && q !== s; q = q.parent) if (q.type === 'INSTANCE') return true; return false; })()).length;
    if (loose) issues.push(loose + ' unbound paints');
    return { id: s.id, name: s.name, variants: s.children.length, props: kinds, issues };
  });
}

const frames = tops.filter((n) => n.type !== 'SECTION').map(auditFrame);
const sum = {};
for (const f of frames) for (const bag of [f.H, f.S]) for (const [k, v] of Object.entries(bag)) sum[k] = (sum[k] || 0) + v.n;
const sets = auditSets();
const out = { page: page.name, frames: frames.length, totals: sum, componentSets: sets.length, setsWithIssues: sets.filter((s) => s.issues.length), frameReports: frames.filter((f) => Object.keys(f.H).length || Object.keys(f.S).length) };
const json = JSON.stringify(out);
return json.length > 60000 ? { ...out, frameReports: out.frameReports.map((f) => ({ id: f.id, name: f.name, H: Object.fromEntries(Object.entries(f.H).map(([k, v]) => [k, v.n])), S: Object.fromEntries(Object.entries(f.S).map(([k, v]) => [k, v.n])) })), note: 'trimmed: examples dropped to fit' } : out;
