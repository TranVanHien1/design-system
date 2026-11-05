#!/usr/bin/env node
// android-design · contrast — check colour pairs before they go into a Figma spec (any theme: tonal, translucent, gradient, image).
// node contrast.mjs <fg> <bg> [more bg …] [--over <base>]   colours: #RRGGBB or rgba(r,g,b,a)
//   --over <base>  composite translucent backgrounds (translucent surfaces, scrims, overlays) over the screen base first.
// Pass every gradient stop and every point of a halo the text can sit on; the worst ratio is the one that counts.
// Thresholds: 4.5:1 body text, 3:1 large text (≥18sp, or ≥14sp bold) and UI marks (icons, borders, focus rings).
const args = process.argv.slice(2);
const oi = args.indexOf('--over'); const base = oi >= 0 ? args.splice(oi, 2)[1] : '#000000';
const parse = (c) => { c = c.trim(); let m = /^#([0-9a-f]{6})$/i.exec(c); if (m) return [...[0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)), 1];
  m = /^rgba?\(([^)]+)\)$/i.exec(c); if (m) { const p = m[1].split(',').map(Number); return [p[0], p[1], p[2], p[3] ?? 1]; } throw new Error('bad colour ' + c); };
const over = (top, under) => top.slice(0, 3).map((v, i) => v * top[3] + under[i] * (1 - top[3])).concat(1);
const lum = (c) => c.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const [fg, ...bgs] = args; if (!fg || !bgs.length) { console.log('usage: node contrast.mjs <fg> <bg> [bg…] [--over <base>]'); process.exit(1); }
const B = parse(base); let worst = Infinity;
for (const b of bgs) { const bg = over(parse(b), B); const f = over(parse(fg), bg); const r = ratio(f, bg); worst = Math.min(worst, r);
  console.log(`${fg} on ${b}${oi >= 0 ? ' over ' + base : ''}: ${r.toFixed(2)}:1  ${r >= 4.5 ? 'body ✓' : r >= 3 ? 'large/UI only' : '✗ fails'}`); }
if (bgs.length > 1) console.log(`worst ${worst.toFixed(2)}:1`);
