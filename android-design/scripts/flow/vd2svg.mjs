#!/usr/bin/env node
// android-design · vd2svg — Android VectorDrawable XML → SVG, so a flow built from a decoded APK (apktool / jadx
// res/drawable) can use the app's own illustrations at any size. Handles <group> transforms, <clip-path>, paths
// (fill/stroke, alpha, evenOdd, caps/joins) and aapt:attr linear/radial gradients. @color/?attr references are dropped.
// Usage: node vd2svg.mjs <file.xml | drawable-dir> [...] --out <dir> [--min-kb 8] [--prefix img_]
//   a directory converts every <vector> file whose size ≥ --min-kb (illustrations, not 24dp icons).
// No dependencies. The output is the target app's artwork: use it for review flows, not in a shipped product.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const out = opt('out') || (console.error('--out <dir> is required'), process.exit(1));
const minKb = +opt('min-kb', 8);
const prefix = opt('prefix', '');
const inputs = args.filter((a, i) => !a.startsWith('--') && !['--out', '--min-kb', '--prefix'].includes(args[i - 1]));

// --- tiny XML tree (VectorDrawable files are well-formed and small) ---
function parse(xml) {
  xml = xml.replace(/<\?xml[\s\S]*?\?>/, '').replace(/<!--[\s\S]*?-->/g, '');
  const root = { tag: '#root', attrs: {}, kids: [] }, stack = [root];
  for (const m of xml.matchAll(/<(\/?)([\w:.-]+)((?:\s+[\w:.-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g)) {
    const [, close, tag, rawAttrs, self] = m;
    if (close) { stack.pop(); continue; }
    const attrs = {};
    for (const a of rawAttrs.matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"/g)) attrs[a[1].replace(/^android:/, '')] = a[2];
    const node = { tag, attrs, kids: [] };
    stack[stack.length - 1].kids.push(node);
    if (!self) stack.push(node);
  }
  return root.kids[0];
}

const num = (s, d = 0) => { const v = parseFloat(String(s ?? '').replace(/di?p$/, '')); return Number.isFinite(v) ? v : d; };
function col(c) {
  if (!c || c[0] !== '#') return [null, 1];
  let h = c.slice(1), a = 1;
  if (h.length === 3) h = [...h].map((x) => x + x).join('');
  if (h.length === 4) { a = parseInt(h[0] + h[0], 16) / 255; h = [...h.slice(1)].map((x) => x + x).join(''); }
  if (h.length === 8) { a = parseInt(h.slice(0, 2), 16) / 255; h = h.slice(2); }
  return h.length === 6 ? ['#' + h, a] : [null, 1];
}

function convert(file) {
  const root = parse(fs.readFileSync(file, 'utf8'));
  if (!root || root.tag !== 'vector') return null;
  const defs = []; let id = 0;
  const gradient = (g) => {
    const gid = `g${++id}`, A = g.attrs;
    let stops = '';
    const items = g.kids.filter((k) => k.tag === 'item');
    if (items.length) for (const it of items) { const [c, a] = col(it.attrs.color); stops += `<stop offset="${it.attrs.offset || 0}" stop-color="${c}" stop-opacity="${a.toFixed(3)}"/>`; }
    else for (const [k, o] of [['startColor', 0], ['centerColor', 0.5], ['endColor', 1]]) if (A[k]) { const [c, a] = col(A[k]); stops += `<stop offset="${o}" stop-color="${c}" stop-opacity="${a.toFixed(3)}"/>`; }
    defs.push(A.type === 'radial'
      ? `<radialGradient id="${gid}" gradientUnits="userSpaceOnUse" cx="${A.centerX || 0}" cy="${A.centerY || 0}" r="${A.gradientRadius || 1}">${stops}</radialGradient>`
      : `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${A.startX || 0}" y1="${A.startY || 0}" x2="${A.endX || 0}" y2="${A.endY || 0}">${stops}</linearGradient>`);
    return `url(#${gid})`;
  };
  const paint = (n, attr) => {
    const aa = n.kids.find((k) => k.tag === 'aapt:attr' && k.attrs.name === `android:${attr}`);
    const g = aa && aa.kids.find((k) => k.tag === 'gradient');
    return g ? [gradient(g), 1] : col(n.attrs[attr]);
  };
  const walk = (n) => {
    let body = '', clip = null;
    for (const k of n.kids) {
      const A = k.attrs;
      if (k.tag === 'clip-path') { clip = `c${++id}`; defs.push(`<clipPath id="${clip}"><path d="${A.pathData}"/></clipPath>`); }
      else if (k.tag === 'path') {
        let [f, fa] = paint(k, 'fillColor'); let [s, sa] = paint(k, 'strokeColor');
        fa *= num(A.fillAlpha, 1); sa *= num(A.strokeAlpha, 1);
        let at = `d="${A.pathData || ''}" fill="${f || 'none'}"`;
        if (f && fa < 1) at += ` fill-opacity="${fa.toFixed(3)}"`;
        if (A.fillType === 'evenOdd') at += ' fill-rule="evenodd"';
        if (s) {
          at += ` stroke="${s}" stroke-width="${num(A.strokeWidth, 1)}"`;
          if (sa < 1) at += ` stroke-opacity="${sa.toFixed(3)}"`;
          if (A.strokeLineCap) at += ` stroke-linecap="${A.strokeLineCap}"`;
          if (A.strokeLineJoin) at += ` stroke-linejoin="${A.strokeLineJoin}"`;
        }
        body += `<path ${at}/>`;
      } else if (k.tag === 'group') {
        const px = num(A.pivotX), py = num(A.pivotY);
        body += `<g transform="translate(${num(A.translateX) + px} ${num(A.translateY) + py}) rotate(${num(A.rotation)}) scale(${num(A.scaleX, 1)} ${num(A.scaleY, 1)}) translate(${-px} ${-py})">${walk(k)}</g>`;
      }
    }
    return clip ? `<g clip-path="url(#${clip})">${body}</g>` : body;
  };
  const A = root.attrs, body = walk(root);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${A.viewportWidth} ${A.viewportHeight}" width="${num(A.width, num(A.viewportWidth))}" height="${num(A.height, num(A.viewportHeight))}"><defs>${defs.join('')}</defs>${body}</svg>`;
}

fs.mkdirSync(out, { recursive: true });
let n = 0, skipped = 0;
for (const inp of inputs) {
  const files = fs.statSync(inp).isDirectory()
    ? fs.readdirSync(inp).filter((f) => f.endsWith('.xml') && (!prefix || f.startsWith(prefix))).map((f) => path.join(inp, f)).filter((f) => fs.statSync(f).size >= minKb * 1024)
    : [inp];
  for (const f of files) {
    const svg = convert(f);
    if (!svg) { skipped++; continue; }
    fs.writeFileSync(path.join(out, path.basename(f, '.xml') + '.svg'), svg);
    n++;
  }
}
console.log(`vd2svg: ${n} SVG → ${out}${skipped ? ` (${skipped} non-vector skipped)` : ''}. Check them in a browser: some use @color refs or shapes that need the app theme.`);
