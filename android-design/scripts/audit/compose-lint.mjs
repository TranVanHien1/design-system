#!/usr/bin/env node
// android-design · compose-lint — static checks for Compose UI code against the skill's floor and the team house style.
// Usage: node compose-lint.mjs <module-or-src-dir> [--all] [--json] [--max N]
// Exit code 0 always (it is a report). No dependencies.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const root = path.resolve(args.find((a) => !a.startsWith('--')) || '.');
const ALL = args.includes('--all'), JSON_OUT = args.includes('--json');
const MAX = +(args[args.indexOf('--max') + 1] || 8) || 8;

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'build' || e.name === 'test' || e.name === 'androidTest') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.kt')) files.push(p);
  }
})(root);
const ui = files.filter((f) => /@Composable/.test(fs.readFileSync(f, 'utf8')));
const isTheme = (f) => /[\/]theme[\/]/.test(f);
const all = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const team = /LocalAppStrings/.test(all) && /fun Modifier\.bounceClick/.test(all);
const hasStable = /stableStatusBars|statusBarsIgnoringVisibility/.test(all);

const SCALE = new Set([0, 8, 12, 16, 24]);
const checks = {
  'spacing-off-scale': { sev: 'warn', why: 'padding / spacedBy / Spacer off the 8·12·16·24 scale (layout.md)', hits: [] },
  'fractional-dp': { sev: 'error', why: 'raw Figma decimal copied as dp; round to whole dp', hits: [] },
  'color-literal': { sev: 'error', why: 'color literal in feature code; use a Color.kt token / color role', hits: [] },
  'inline-font-size': { sev: 'warn', why: 'inline fontSize; use a Typography token / type role', hits: [] },
  'pill-radius': { sev: 'info', why: 'RoundedCornerShape(≥50.dp) as a pill; use CircleShape / RoundedCornerShape(50)', hits: [] },
  'small-tap-target': { sev: 'error', why: 'tappable visual under 48dp without minimumInteractiveComponentSize()', hits: [] },
  'unstable-status-inset': { sev: 'warn', why: 'statusBars inset drops to 0 under full-screen ads; use stableStatusBars', hits: [] },
  'hardcoded-text': { sev: 'error', why: 'user-facing string literal in Text(); use AppStrings / stringResource', hits: [] },
  'fixed-text-box': { sev: 'warn', why: 'fixed size(w, h) / height on a box that holds text; use heightIn/widthIn(min = …)', hits: [] },
  'tight-line-height': { sev: 'warn', why: 'lineHeight = fontSize clips stacked Vietnamese diacritics', hits: [] },
  'raw-clickable': { sev: 'info', why: 'Modifier.clickable in a team project; the base uses bounceClick', hits: [] },
  'bounce-no-semantics': { sev: 'error', why: 'bounceClick is pointerInput-only (no Role/onClick semantics): TalkBack cannot see the button', hits: [] },
};
const hit = (k, f, i, line) => checks[k].hits.push({ file: path.relative(root, f), line: i + 1, code: line.trim().slice(0, 140) });

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const lines = src.split('\n');
  const theme = isTheme(f);
  if (/fun Modifier\.bounceClick\(/.test(src) && !/semantics\s*\{[^}]*(role|onClick)/s.test(src.slice(src.indexOf('fun Modifier.bounceClick('), src.indexOf('fun Modifier.bounceClick(') + 1500))) {
    hit('bounce-no-semantics', f, src.slice(0, src.indexOf('fun Modifier.bounceClick(')).split('\n').length - 1, 'fun Modifier.bounceClick(…)');
  }
  if (theme && /lineHeight\s*=\s*fontSize/.test(src)) lines.forEach((l, i) => /lineHeight\s*=\s*fontSize/.test(l) && hit('tight-line-height', f, i, l));
  if (!ui.includes(f)) continue;
  lines.forEach((l, i) => {
    if (/^\s*(\/\/|\*|import )/.test(l)) return;
    for (const m of l.matchAll(/(-?\d+\.\d+)\.dp/g)) if (!/\.0+$/.test(m[1]) && !/^-?0\.5$/.test(m[1])) { hit('fractional-dp', f, i, l); break; }
    const sp = [...l.matchAll(/(?:padding\(|spacedBy\(|PaddingValues\(|Spacer\([^)]*?(?:height|width)\()([^)]*)/g)];
    for (const m of sp) {
      const bad = [...m[1].matchAll(/(-?\d+(?:\.\d+)?)\.dp/g)].map((n) => Math.abs(+n[1])).filter((n) => !SCALE.has(n));
      if (bad.length) { hit('spacing-off-scale', f, i, l); break; }
    }
    if (!theme) {
      if (/Color\(0x[0-9A-Fa-f]+\)|Color\.(White|Black|Gray|LightGray|DarkGray|Red|Green|Blue|Yellow|Cyan|Magenta)\b/.test(l)) hit('color-literal', f, i, l);
      if (/fontSize\s*=\s*\d/.test(l)) hit('inline-font-size', f, i, l);
    }
    const r = /RoundedCornerShape\((\d+(?:\.\d+)?)\.dp\)/.exec(l); if (r && +r[1] >= 50) hit('pill-radius', f, i, l);
    if (/\bText\(\s*(text\s*=\s*)?"[^"]*\p{L}[^"]*"/u.test(l)) hit('hardcoded-text', f, i, l);
    if (/(WindowInsets\.statusBars\b|statusBarsPadding\(\))/.test(l) && (team || hasStable)) hit('unstable-status-inset', f, i, l);
    if (team && /\.clickable\s*[({]/.test(l)) hit('raw-clickable', f, i, l);
    // small tap target: size(N.dp) (N<48) and a tap modifier within the same 3-line window
    const win = lines.slice(i, i + 3).join(' ');
    const s = /\.size\((\d+(?:\.\d+)?)\.dp\)/.exec(l);
    if (s && +s[1] < 48 && /(bounceClick|bounceClickOnce|clickable)\s*[({]/.test(win) && !/minimumInteractiveComponentSize/.test(win)) hit('small-tap-target', f, i, l);
    // fixed box around text: size(w,h) or height(N) followed by a Text within 4 lines
    if (/\.size\(\d+(?:\.\d+)?\.dp,\s*\d+(?:\.\d+)?\.dp\)|\.height\(\d+(?:\.\d+)?\.dp\)/.test(l) && /\bText\(|FitText\(/.test(lines.slice(i, i + 5).join(' ')) && !/heightIn|Icon|Image|Spacer|contentScale|stableStatusBars|statusBarsPadding|TopBar|AppBar/.test(l)) hit('fixed-text-box', f, i, l);
  });
}

// whole-module stats
const dps = [...ui.map((f) => fs.readFileSync(f, 'utf8')).join('\n').matchAll(/(\d+(?:\.\d+)?)\.dp/g)].map((m) => +m[1]);
const off4 = dps.filter((v) => v > 2 && v % 4 !== 0).length;
const texts = ui.reduce((n, f) => n + (fs.readFileSync(f, 'utf8').match(/\bText\(/g) || []).length, 0);
const maxl = ui.reduce((n, f) => n + (fs.readFileSync(f, 'utf8').match(/maxLines\s*=/g) || []).length, 0);
const previews = files.reduce((n, f) => n + (fs.readFileSync(f, 'utf8').match(/@Preview/g) || []).length, 0);
const stats = { files: files.length, composableFiles: ui.length, houseStyle: team ? 'team' : 'm3', dpValues: dps.length, offFourDpGrid: dps.length ? Math.round((100 * off4) / dps.length) + '%' : '0%', textCalls: texts, maxLines: maxl, previews };

if (JSON_OUT) { console.log(JSON.stringify({ root, stats, checks }, null, 1)); process.exit(0); }
console.log(`compose-lint · ${root}`);
console.log(`house style: ${stats.houseStyle} · ${stats.composableFiles}/${stats.files} composable files · dp values ${stats.dpValues} (${stats.offFourDpGrid} off the 4dp grid) · Text ${texts}, maxLines ${maxl} · @Preview ${previews}`);
const order = { error: 0, warn: 1, info: 2 };
for (const [k, c] of Object.entries(checks).sort((a, b) => order[a[1].sev] - order[b[1].sev] || b[1].hits.length - a[1].hits.length)) {
  if (!c.hits.length) continue;
  console.log(`\n[${c.sev}] ${k} ×${c.hits.length} — ${c.why}`);
  for (const h of (ALL ? c.hits : c.hits.slice(0, MAX))) console.log(`  ${h.file}:${h.line}  ${h.code}`);
  if (!ALL && c.hits.length > MAX) console.log(`  … ${c.hits.length - MAX} more (--all)`);
}
if (!previews) console.log('\n[warn] no @Preview in the module — add one per UiState for every designed screen (verify.md §team)');
