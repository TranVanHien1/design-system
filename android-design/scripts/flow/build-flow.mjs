#!/usr/bin/env node
// Assembles the team's pannable flow map (cards with screen, "does" list, state thumbnails, labelled links).
//
// Default (live): every screen and state is embedded as real HTML — one <template id="v-…"> per view with the state
// already applied (data-when resolved, no scripts) — rendered in shadow roots with the shared screen CSS. Agents review
// the components by reading flow.html; nothing is rasterised. Images referenced by screens stay files next to it.
//   --images   embed JPEG renders instead (self-contained file to send outside the project)
//   --shots    also render every view to shots/<view>.jpg with headless Chrome, for a visual check
//
// node build-flow.mjs <project-dir> [--out flow.html] [--images] [--shots] [--only id,id] [--scale 1.3334] [--quality 86]
//
// <project-dir>/flow.json:
// { "app": "Name", "start": "splash",
//   "screens": [ { "id": "home", "name": "Trang chủ", "src": "screens/home.html", "does": ["…"], "col": 5, "row": 0,
//                  "states": [ { "name": "home-loading", "src": "screens/home.html?state=loading" } ] } ],
//   "links": [ { "from": "home", "to": "detail", "label": "Chạm theme", "dashed": false, "tab": false } ] }
// A state src may carry ?state=<name> (shows data-when matches), ?theme=dark|light, ?lang=xx.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);
const VALUED = new Set(['--out', '--only', '--scale', '--quality', '--width', '--height']);
const dir = path.resolve(args.find((a, i) => !a.startsWith('--') && !VALUED.has(args[i - 1])) || '.');
const flowPath = path.join(dir, 'flow.json');
if (!fs.existsSync(flowPath)) { console.error(`build-flow: ${flowPath} not found`); process.exit(2); }
const flow = JSON.parse(fs.readFileSync(flowPath, 'utf8'));
const W = Number(opt('width', 360)), H = Number(opt('height', 800)), SCALE = Number(opt('scale', 1.3334)), Q = Number(opt('quality', 86));
const only = opt('only') ? new Set(opt('only').split(',')) : null;
const out = path.resolve(dir, opt('out', 'flow.html'));
const outDir = path.dirname(out);
const IMAGES = flag('images'), SHOTS = flag('shots') || IMAGES;

// ---------- validate ----------
const ids = new Set(flow.screens.map((s) => s.id));
const problems = [];
const views = []; // { key, name, src }
for (const s of flow.screens) {
  s.src = s.src || `screens/${s.id}.html`;
  if (!fs.existsSync(path.join(dir, s.src.split('?')[0]))) problems.push(`screen ${s.id}: missing ${s.src}`);
  views.push({ key: s.id, src: s.src });
  for (const st of s.states || []) {
    st.src = st.src || `screens/${st.name}.html`;
    if (!fs.existsSync(path.join(dir, st.src.split('?')[0]))) problems.push(`state ${st.name}: missing ${st.src}`);
    views.push({ key: st.name, src: st.src });
  }
  if (s.col == null || s.row == null) problems.push(`screen ${s.id}: col/row required`);
}
const keys = views.map((v) => v.key);
for (const k of new Set(keys)) if (keys.filter((x) => x === k).length > 1) problems.push(`view name "${k}" is used twice`);
for (const l of flow.links || []) for (const e of [l.from, l.to]) if (!ids.has(e)) problems.push(`link ${l.from}→${l.to}: unknown screen ${e}`);
if (!ids.has(flow.start)) problems.push(`start ${flow.start} is not a screen`);
if (problems.length) { console.error(problems.map((p) => `  - ${p}`).join('\n')); process.exit(2); }

// ---------- live HTML views ----------
const matchWhen = (list, state) => {
  if (list.includes(state)) return true;
  const neg = list.filter((w) => w.startsWith('!'));
  return neg.length > 0 && !neg.includes(`!${state}`) && list.every((w) => w.startsWith('!'));
};
const isLocal = (u) => u && !/^(https?:|data:|#|mailto:|tel:|\/\/)/i.test(u);
function scopeSelector(sel) {
  const t = sel.trim();
  let m = /^(:root|html|body)((?:\[[^\]]*\]|\.[\w-]+)*)([\s\S]*)$/.exec(t);
  if (m) return `:host${m[2] ? `(${m[2]})` : ''}${m[3]}`;
  m = /^(\.no-ads|\.has-ads)([\s\S]*)$/.exec(t);
  if (m) return `:host(${m[1]})${m[2]}`;
  return t;
}
function scopeCss(css) { // map document-level selectors to :host so the CSS works inside a shadow root
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let outCss = '', i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) { outCss += css.slice(i); break; }
    const prelude = css.slice(i, open);
    let depth = 1, j = open + 1;
    while (j < css.length && depth) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
    const body = css.slice(open + 1, j - 1);
    const p = prelude.trim();
    if (p.startsWith('@media') || p.startsWith('@supports')) outCss += `${p}{${scopeCss(body)}}\n`;
    else if (p.startsWith('@')) outCss += `${p}{${body}}\n`;
    else outCss += `${p.split(',').map(scopeSelector).join(', ')}{${body}}\n`;
    i = j;
  }
  return outCss;
}
const cssFiles = []; // in first-seen order
const fontImports = new Set();
function screenView(src) {
  const [file, query] = src.split('?');
  const abs = path.join(dir, file), sdir = path.dirname(abs);
  const q = new URLSearchParams(query || '');
  const state = q.get('state') || 'default';
  let html = fs.readFileSync(abs, 'utf8');
  const htmlTag = /<html([^>]*)>/i.exec(html);
  const attrs = {};
  if (htmlTag) for (const m of htmlTag[1].matchAll(/([\w-]+)="([^"]*)"/g)) attrs[m[1]] = m[2];
  if (q.get('theme')) attrs['data-theme'] = q.get('theme');
  if (q.get('lang')) attrs.lang = q.get('lang');
  attrs['data-state'] = state;
  const fr = /^(\d+)x(\d+)$/.exec(attrs['data-frame'] || '');
  attrs['data-frame'] = fr ? fr[0] : `${W}x${H}`;
  for (const m of html.matchAll(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gi)) {
    const href = m[1];
    if (!isLocal(href)) { fontImports.add(href); continue; }
    const f = path.resolve(sdir, href);
    if (!cssFiles.includes(f)) cssFiles.push(f);
  }
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  let body = (/<body[^>]*>([\s\S]*)<\/body>/i.exec(html) || [, html])[1];
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  body = body.replace(/<(\w+)([^>]*?)\sdata-when="([^"]*)"([^>]*)>/g, (all, tag, a, when, b) => {
    if (!matchWhen(when.trim().split(/\s+/), state)) return all;
    const rest = a + b;
    if (/\sclass="/.test(` ${rest}`)) return `<${tag}${a.replace(/class="([^"]*)"/, 'class="$1 when-on"')} data-when="${when}"${b.replace(/class="([^"]*)"/, 'class="$1 when-on"')}>`;
    return `<${tag}${a} class="when-on" data-when="${when}"${b}>`;
  });
  body = body.replace(/(\s(?:src|href)=")([^"]+)"/g, (all, pre, u) => (isLocal(u) ? `${pre}${path.relative(outDir, path.resolve(sdir, u)).split(path.sep).join('/')}"` : all));
  const rebase = (css) => css.replace(/url\((['"]?)([^'")]+)\1\)/g, (all, qt, u) => (isLocal(u) ? `url(${qt}${path.relative(outDir, path.resolve(sdir, u)).split(path.sep).join('/')}${qt})` : all));
  const used = new Set([...body.matchAll(/\sclass="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean));
  return { attrs, css: scopeCss(rebase(styles)), body: body.trim(), used, ownCss: styles };
}

let viewsHtml = '', headLinks = '';
const undefinedWarnings = [];
if (!IMAGES) {
  const built = views.map((v) => ({ ...v, ...screenView(v.src) }));
  let shared = '';
  for (const f of cssFiles) {
    let css = fs.readFileSync(f, 'utf8');
    for (const m of css.matchAll(/@import\s+url\((['"]?)([^'")]+)\1\)[^;]*;/g)) fontImports.add(m[2]);
    css = css.replace(/@import\s+url\((['"]?)[^)]*?\1\)[^;]*;/g, '').replace(/@import\s+(['"])[^'"]*\1[^;]*;/g, '').replace(/url\((['"]?)([^'")]+)\1\)/g, (all, qt, u) => (isLocal(u) ? `url(${qt}${path.relative(outDir, path.resolve(path.dirname(f), u)).split(path.sep).join('/')}${qt})` : all));
    shared += `/* ${path.relative(dir, f)} */\n${scopeCss(css)}\n`;
  }
  // lint: classes used in a screen but defined in no stylesheet it loads (typo or a class from another project)
  const defined = new Set([...shared.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1]));
  const IGNORE = new Set(['when-on', 'fill', 'on', 'grow', 'row', 'col']);
  const undef = new Map();
  for (const v of built) {
    const own = new Set([...v.ownCss.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1]));
    for (const c of v.used) if (!defined.has(c) && !own.has(c) && !IGNORE.has(c)) { if (!undef.has(c)) undef.set(c, []); undef.get(c).push(v.key); }
  }
  for (const [c, keys] of undef) undefinedWarnings.push(`class .${c} is not defined in any loaded CSS (${[...new Set(keys.map((k) => k.split('-')[0]))].slice(0, 4).join(', ')}${keys.length > 4 ? ', …' : ''})`);
  // lint: padding / margin / gap only on the 8 · 12 · 16 · 24 dp scale (0 and auto allowed). Ad units (SDK-rendered)
  // and template screens marked <html data-spacing="template"> (base flow, paywall) are exempt.
  const SCALE = new Set([0, 8, 12, 16, 24]);
  const SPACING = /(?<![\w-])(padding(?:-(?:top|right|bottom|left|inline|block))?|margin(?:-(?:top|right|bottom|left|inline|block))?|gap|row-gap|column-gap)\s*:\s*([^;}"]+)/g;
  const AD = /(^|[\s,>+~])\.(ad|native)(\b|-)|\.ad-|\.native-|\.pw-/;
  const offScale = (decls) => [...decls.matchAll(SPACING)].flatMap((m) => [...m[2].matchAll(/(-?\d+(?:\.\d+)?)px/g)].filter((n) => !SCALE.has(Math.abs(+n[1]))).map((n) => `${m[1]} ${n[1]}px`));
  const lintCss = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}@]+)\{([^{}]*)\}/g)]
    .filter((r) => !AD.test(r[1])).flatMap((r) => offScale(r[2]).map((x) => `${r[1].trim().split(/\s*,\s*/)[0]} ${x}`));
  const spacing = new Map();
  const note = (where, list) => { if (list.length) spacing.set(where, [...(spacing.get(where) || []), ...list]); };
  for (const f of cssFiles) note(path.relative(dir, f), lintCss(fs.readFileSync(f, 'utf8')));
  for (const v of built) {
    if (v.attrs['data-spacing'] === 'template') continue;
    note(v.src.split('?')[0], [...new Set([...lintCss(v.ownCss), ...[...v.body.matchAll(/\sstyle="([^"]*)"/g)].flatMap((m) => offScale(m[1]).map((x) => `style="… ${x}"`))])]);
  }
  for (const [where, list] of spacing) { const u = [...new Set(list)]; undefinedWarnings.push(`spacing off the 8/12/16/24 scale in ${where}: ${u.slice(0, 6).join('; ')}${u.length > 6 ? ` (+${u.length - 6} more)` : ''}`); }
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/'/g, '&#39;');
  viewsHtml = `\n<!-- Shared screen CSS (tokens + kit + app), scoped for shadow roots. -->\n<template id="screen-css"><style>\n${shared}</style></template>\n` +
    built.map((v) => `\n<!-- view: ${v.key} · ${v.src} -->\n<template id="v-${v.key}" data-attrs='${esc(JSON.stringify(v.attrs))}'>\n${v.css.trim() ? `<style>\n${v.css}</style>\n` : ''}${v.body}\n</template>`).join('\n') + '\n';
  headLinks = [...fontImports].map((u) => `<link rel="stylesheet" href="${u.replace(/&/g, '&amp;')}">`).join('\n');
}

// ---------- chrome renders (only for --shots / --images) ----------
const imgs = {};
const warnings = [];
let rendered = 0;
if (SHOTS) {
  const chromeBin = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/opt/google/chrome/chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => fs.existsSync(p)) || process.env.CHROME;
  if (!chromeBin) { console.error('build-flow: no Chrome/Chromium found (set CHROME=/path/to/chrome)'); process.exit(2); }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-chrome-'));
  const chrome = spawn(chromeBin, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = '';
    const t = setTimeout(() => reject(new Error('Chrome did not start')), 20000);
    chrome.stderr.on('data', (d) => { buf += d; const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf); if (m) { clearTimeout(t); resolve(m[1]); } });
    chrome.on('exit', (c) => reject(new Error(`Chrome exited ${c}`)));
  });
  const browser = new WebSocket(wsUrl);
  await new Promise((r, j) => { browser.onopen = r; browser.onerror = j; });
  let seq = 0; const pending = new Map(); const events = [];
  browser.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); } else if (msg.method) events.push(msg); };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); browser.send(JSON.stringify({ id, method, params, sessionId })); });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S('Page.enable'); await S('Runtime.enable');
  await S('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: SCALE, mobile: false });
  const shotsDir = path.join(dir, 'shots');
  fs.mkdirSync(shotsDir, { recursive: true });
  try {
    for (const v of views) {
      const shotFile = path.join(shotsDir, `${v.key}.jpg`);
      if (only && !only.has(v.key) && fs.existsSync(shotFile)) { imgs[v.key] = fs.readFileSync(shotFile).toString('base64'); continue; }
      const [file, query] = v.src.split('?');
      const fm = /<html[^>]*data-frame="(\d+)x(\d+)"/i.exec(fs.readFileSync(path.join(dir, file), 'utf8'));
      const vw = fm ? Number(fm[1]) : W, vh = fm ? Number(fm[2]) : H;
      await S('Emulation.setDeviceMetricsOverride', { width: vw, height: vh, deviceScaleFactor: SCALE * W / vw, mobile: false });
      events.length = 0;
      await S('Page.navigate', { url: pathToFileURL(path.join(dir, file)).href + (query ? `?${query}` : '') });
      for (let i = 0; i < 200 && !events.some((e) => e.method === 'Page.loadEventFired'); i++) await new Promise((r) => setTimeout(r, 50));
      await S('Runtime.evaluate', { expression: 'Promise.all([document.fonts.ready, ...[...document.images].map(i => i.complete ? 0 : new Promise(r => i.onload = i.onerror = r))]).then(() => new Promise(r => setTimeout(r, 250)))', awaitPromise: true });
      const { result } = await S('Runtime.evaluate', { expression: 'JSON.stringify({ w: document.documentElement.scrollWidth, broken: [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute("src")).slice(0,5), fonts: [...document.fonts].filter(f => f.status === "error").map(f => f.family).slice(0,5) })', returnByValue: true });
      const info = JSON.parse(result.value);
      const { data } = await S('Page.captureScreenshot', { format: 'jpeg', quality: Q, clip: { x: 0, y: 0, width: vw, height: vh, scale: 1 } });
      fs.writeFileSync(shotFile, Buffer.from(data, 'base64'));
      imgs[v.key] = data; rendered++;
      if (info.w > vw + 1) warnings.push(`${v.key}: content ${info.w}px wide overflows the ${vw}dp frame`);
      if (info.broken.length) warnings.push(`${v.key}: images failed: ${info.broken.join(', ')}`);
      if (info.fonts.length) warnings.push(`${v.key}: fonts failed: ${info.fonts.join(', ')}`);
    }
  } finally {
    try { await send('Browser.close'); } catch {}
    await new Promise((r) => { if (chrome.exitCode !== null) return r(); chrome.once('exit', r); setTimeout(() => { chrome.kill('SIGKILL'); r(); }, 3000); });
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* leftover temp profile is harmless */ }
  }
}

// ---------- assemble ----------
const outFlow = { app: flow.app, start: flow.start, links: flow.links || [], screens: flow.screens.map((s) => {
  const base = { id: s.id, name: s.name, does: s.does || [], col: s.col, row: s.row };
  if (IMAGES) return { ...base, img: `data:image/jpeg;base64,${imgs[s.id]}`, states: (s.states || []).map((st) => ({ name: st.name, img: `data:image/jpeg;base64,${imgs[st.name]}` })) };
  return { ...base, view: s.id, states: (s.states || []).map((st) => ({ name: st.name, view: st.name })) };
}) };
const tpl = fs.readFileSync(path.join(SKILL, 'assets', 'flow', IMAGES ? 'flow-template.html' : 'flow-template-live.html'), 'utf8');
const escT = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = tpl.replace('__FLOW_JSON__', () => JSON.stringify(outFlow, null, IMAGES ? 0 : 1).replace(/<\/script/gi, '<\\/script'))
  .replace('__TITLE__', () => escT(flow.app)).replace('__APP__', () => escT(flow.app))
  .replace('__HEAD_LINKS__', () => headLinks).replace('__VIEWS__', () => viewsHtml);
fs.writeFileSync(out, html);
const nStates = outFlow.screens.reduce((a, s) => a + s.states.length, 0);
console.log(`flow (${IMAGES ? 'images' : 'live HTML'}): ${outFlow.screens.length} screens, ${nStates} states, ${outFlow.links.length} links → ${out} (${(fs.statSync(out).size / 1e3).toFixed(0)} kB)${SHOTS ? `; rendered ${rendered} shots in ${path.join(dir, 'shots')}` : ''}`);
warnings.push(...undefinedWarnings);
if (warnings.length) { console.log('warnings:'); for (const w of warnings) console.log(`  - ${w}`); }
