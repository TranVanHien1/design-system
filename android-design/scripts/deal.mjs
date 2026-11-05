#!/usr/bin/env node
// Deals three design directions for an Android app brief, so the choice is made among researched
// options instead of the category default. Each direction = app style + palette + type pair + shape
// preset + motion, with the Material 3 translation and the exact theme.mjs command to build it.
//
// node deal.mjs --brief "<one or two lines>" [--kind <id>] [--theme light|dark] [--reroll N]
//               [--brand "#RRGGBB"] [--any-script] [--json] [--list kinds|styles]
import { load, rng, hashSeed, normalize, pickWeighted, swatch } from './lib/common.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);

const { styles, palettes, type, kinds, patterns } = load();

if (opt('list')) {
  const what = opt('list');
  if (what === 'kinds') for (const k of kinds) console.log(`${k.id.padEnd(16)} ${k.note}  →  ${k.styles.join(', ')}`);
  else if (what === 'styles') for (const s of styles) console.log(`${s.id.padEnd(20)} ${s.theme.padEnd(5)} ${s.idea}`);
  else console.error('--list kinds|styles');
  process.exit(0);
}

const brief = opt('brief');
if (!brief) { console.error('usage: node deal.mjs --brief "<brief>" [--kind id] [--theme light|dark] [--reroll N] [--brand #hex] [--any-script] [--json]'); process.exit(2); }
const reroll = Number(opt('reroll', 0));
const themeWanted = opt('theme');
const brand = opt('brand');
const requireVi = !flag('any-script');

// ---- infer kind ----
const nb = ` ${normalize(brief)} `;
let kind = kinds.find((k) => k.id === opt('kind'));
let kindScores = [];
if (!kind) {
  kindScores = kinds.map((k) => ({ k, score: k.keywords.reduce((s, w) => s + (nb.includes(` ${w.trim()}`) ? (w.trim().includes(' ') ? 2 : 1) : 0), 0) })).sort((a, b) => b.score - a.score);
  kind = kindScores[0].score > 0 ? kindScores[0].k : null;
}

// ---- deal ----
// Rerolls replay the earlier deals with the same seed so nothing already shown comes back.
const used = { styles: new Set(), palettes: new Set(), type: new Set() };
let hand;
for (let r = 0; r <= reroll; r++) hand = dealHand(r);

function dealHand(r) {
  const rand = rng(hashSeed(`${brief}|${kind?.id}|${themeWanted}|${r}`));
  const styleOk = (s) => !themeWanted || s.theme === themeWanted;
  const fresh = (s) => !used.styles.has(s.id) || r === 0;
  const kindStyles = (kind ? kind.styles : []).map((id) => styles.find((s) => s.id === id)).filter((s) => s && styleOk(s));
  const others = styles.filter((s) => styleOk(s) && !kindStyles.includes(s));
  const picks = [];
  // Slots 1-2: styles researched for this kind (weighted toward the first listed). Slot 3: a challenger
  // from outside the kind, so the hand always holds one direction the category would not reach for.
  const pool1 = kindStyles.filter(fresh).length ? kindStyles.filter(fresh) : kindStyles;
  while (picks.length < 2 && pool1.filter((x) => !picks.some((p) => p.style === x)).length) {
    const s = pickWeighted(pool1.filter((x) => !picks.some((p) => p.style === x)), (x) => 3 - Math.min(2, kindStyles.indexOf(x)), rand);
    picks.push({ style: s, role: 'researched for this kind' });
  }
  const pool2 = (others.filter(fresh).length ? others.filter(fresh) : others.length ? others : styles.filter((s) => !picks.some((p) => p.style === s)));
  while (picks.length < 3) {
    const s = pickWeighted(pool2.filter((x) => !picks.some((p) => p.style === x)), () => 1, rand);
    picks.push({ style: s, role: kind ? 'challenger from outside the kind' : 'dealt' });
  }
  const out = picks.map(({ style, role }, i) => {
    const want = style.theme;
    const palPool = palettes.filter((p) => p.theme === want && !used.palettes.has(p.id));
    const palette = pickWeighted(palPool.length ? palPool : palettes.filter((p) => p.theme === want), (p) => (p.tags.some((t) => style.android.paletteTags.includes(t)) ? 4 : 1), rand);
    used.palettes.add(palette.id);
    const tPool = type.filter((t) => (!requireVi || t.vi) && !used.type.has(t.id));
    const tFit = tPool.filter((t) => style.android.typeClasses.includes(t.class));
    const face = pickWeighted(tFit.length ? tFit : tPool, () => 1, rand);
    used.type.add(face.id);
    used.styles.add(style.id);
    return { n: i + 1, role, style, palette, face };
  });
  return out;
}

const kindPatterns = kind ? patterns.filter((p) => p.kinds.includes(kind.id)) : [];
const result = {
  brief, reroll, kind: kind ? kind.id : null, kindGuess: kindScores.slice(0, 3).filter((x) => x.score).map((x) => `${x.k.id}:${x.score}`),
  directions: hand.map((d) => ({
    id: `${d.style.id}+${d.palette.id}+${d.face.id}`,
    role: d.role,
    style: { id: d.style.id, name: d.style.name, theme: d.style.theme, idea: d.style.idea, colourBudget: d.style.colourBudget, signature: d.style.signature, identity: d.style.identity, avoid: d.style.avoid, m3: d.style.android.m3, shape: d.style.android.shape, radii: d.style.android.radii, density: d.style.android.density, motion: d.style.android.motion },
    palette: d.palette,
    type: d.face,
  })),
  patterns: kindPatterns.map((p) => ({ id: p.id, name: p.name, phone: p.phone })),
};

if (flag('json')) { console.log(JSON.stringify(result, null, 1)); process.exit(0); }

const L = [];
const p = (s = '') => L.push(s);
p(`# Direction round${reroll ? ` (re-roll ${reroll})` : ''}`);
p(`Brief: ${brief}`);
p(kind ? `Kind: **${kind.id}** (${kind.note})${kindScores.length ? ` · matched ${result.kindGuess.join(', ')}` : ''}` : 'Kind: none matched — pass --kind (see --list kinds); styles dealt from the whole library.');
p(requireVi ? 'Type filter: Vietnamese-capable faces only (pass --any-script to lift).' : 'Type filter: any script.');
p();
for (const d of result.directions) {
  const s = d.style, pal = d.palette, t = d.type;
  p(`## ${d.role.startsWith('challenger') ? '[challenger] ' : ''}D${result.directions.indexOf(d) + 1}. ${s.name} · ${pal.name} · ${t.name}`);
  p(`id: \`${d.id}\``);
  p();
  p(`**Idea.** ${s.idea}`);
  p(`**Colour budget.** ${s.colourBudget}`);
  p(`**Signature (desktop study wording; translate with the M3 lines).** ${s.signature}`);
  p(`**On Material 3:**`);
  for (const m of s.m3) p(`- ${m}`);
  p(`**Give it a face — choose one and write it in the brief:**`);
  for (const m of s.identity) p(`- ${m}`);
  p(`**Avoid:** ${s.avoid.join('; ')}.`);
  p();
  p(`**Palette — ${pal.name}** (${pal.tags.join(', ')}, ${pal.theme}): bg ${swatch(pal.bg)} · surface ${swatch(pal.surface)} · ink ${swatch(pal.ink)} · muted ${swatch(pal.muted)} · accent ${swatch(pal.accent)}${brand ? ` → brand override ${swatch(brand)}` : ''}`);
  p(`> ${pal.note}`);
  p();
  const fv = (f) => `${f.family} ${f.weights.join('/')} (${f.source}${f.android === 'bundle' ? ', bundle in res/font' : ''}${f.vi ? ', Vietnamese ✓' : ', NO Vietnamese'}; ${f.license})`;
  p(`**Type — ${t.name}** [${t.class}]: display ${fv(t.display)}; text ${fv(t.text)}.`);
  p(`> ${t.note}${t.display.settings ? ` Display: ${t.display.settings}.` : ''}`);
  p();
  p(`**Shape** ${s.shape} (extraSmall→extraLarge: ${s.radii.join('/')} dp) · **Density** ${s.density} · **Motion** ${s.motion}`);
  p();
  p('Build its theme:');
  p('```');
  p(`node <skill>/scripts/theme.mjs --direction "${d.id}"${brand ? ` --brand "${brand}"` : ''} --package <app.package>.ui.theme --out <module>/src/main/java/<path>/ui/theme`);
  p('```');
  p();
}
if (result.patterns.length) {
  p('## Phone patterns for this kind');
  for (const pt of result.patterns.slice(0, 8)) p(`- **${pt.name}** (\`${pt.id}\`): ${pt.phone}`);
  p();
}
p('## How to use this hand');
p('1. Weigh each direction against the brief on two axes only: does the audience recognise itself, and does the product\'s job read faster. Write one line per direction.');
p('2. Present all three to the user (structured question tool: one option per direction, the challenger included, plus "re-roll" and "the category standard, played straight"). Never pre-select by taste.');
p('3. On a choice: run its theme.mjs command, then record the decision in DESIGN.md (references/new-work.md §5).');
p(`4. Re-roll: same command with --reroll ${reroll + 1}; it never repeats a style, palette or type pair already shown.`);
console.log(L.join('\n'));
