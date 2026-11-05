#!/usr/bin/env node
// Starts an HTML flow project: copies the kit, generates tokens.css with theme.mjs, writes the fixed base
// screens (splash, language, onboarding 1–4, full-screen native ad) from assets/flow/base and a starter flow.json.
//
// node new-flow.mjs --app "<App name>" --out <dir> (--direction "<style>+<palette>+<type>" | --seed "#hex" [--type id])
//                   [--brand "#hex"] [--lang vi] [--ads] [--dark-first] [--confirm tick|pill|round] [--common] [--force]
// --common adds the team's shared screens (paywall, permissions, dialogs gallery, ad-unit gallery) from assets/flow/common.
// Without --ads the base screens use their no-ad layout and the full-screen native pages are left out.
// Then edit screens/*.html (backgrounds, illustrations, copy) and add the app's own screens to flow.json.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);
const die = (m) => { console.error(`new-flow: ${m}`); process.exit(2); };

const app = opt('app') || die('--app is required');
const out = path.resolve(opt('out') || die('--out is required'));
if (fs.existsSync(path.join(out, 'flow.json')) && !flag('force')) die(`${out} already has a flow.json (use --force to overwrite the base files)`);
fs.mkdirSync(path.join(out, 'screens'), { recursive: true });
fs.mkdirSync(path.join(out, 'img'), { recursive: true });

for (const f of ['kit.css', 'team.css', 'state.js']) fs.copyFileSync(path.join(SKILL, 'assets', 'flow', f), path.join(out, f));

const themeArgs = [path.join(SKILL, 'scripts', 'theme.mjs'), '--css', path.join(out, 'tokens.css')];
if (opt('direction')) themeArgs.push('--direction', opt('direction'));
else if (opt('seed')) themeArgs.push('--seed', opt('seed'), ...(opt('type') ? ['--type', opt('type')] : []));
else die('pass --direction (from deal.mjs) or --seed "#hex"');
if (opt('brand')) themeArgs.push('--brand', opt('brand'));
const t = spawnSync(process.execPath, themeArgs, { encoding: 'utf8' });
if (t.status !== 0) die(`theme.mjs failed:\n${t.stderr}`);
fs.writeFileSync(path.join(out, 'theme-report.md'), t.stdout);

const ads = flag('ads');
const confirm = opt('confirm', 'tick');
if (!['tick', 'pill', 'round'].includes(confirm)) die('--confirm must be tick, pill or round');
const htmlAttr = `${flag('dark-first') ? 'data-theme="dark" ' : ''}data-confirm="${confirm}" class="${ads ? 'has-ads' : 'no-ads'}"`;
const vars = { APP: app, APP_INITIAL: app.trim().charAt(0).toUpperCase(), LANG: opt('lang', 'vi'), HTML_ATTR: htmlAttr };
const fill = (s) => s.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
const baseDir = path.join(SKILL, 'assets', 'flow', 'base');
const withFull = ads;
const written = [];
for (const f of fs.readdirSync(baseDir).filter((f) => f.endsWith('.html'))) {
  if (!withFull && f.startsWith('native-full')) continue;
  fs.writeFileSync(path.join(out, 'screens', f), fill(fs.readFileSync(path.join(baseDir, f), 'utf8')));
  written.push(f);
}

const commonDir = path.join(SKILL, 'assets', 'flow', 'common');
const withCommon = flag('common');
if (withCommon) for (const f of fs.readdirSync(commonDir).filter((f) => f.endsWith('.html'))) {
  fs.writeFileSync(path.join(out, 'screens', f), fill(fs.readFileSync(path.join(commonDir, f), 'utf8')));
  written.push(f);
}
const S = (id, name, col, does, states = [], src) => ({ id, name, src: src || `screens/${id}.html`, does, col, row: 0, states });
const order = ['splash', 'language', 'onboarding-1', ...(withFull ? ['native-full-1'] : []), 'onboarding-2', 'onboarding-3', ...(withFull ? ['native-full-2'] : []), 'onboarding-4'];
const meta = {
  splash: ['Splash', ['Mở app, tải cấu hình', ...(ads ? ['Báo "có thể chứa quảng cáo" trước inter'] : [])], [{ name: 'splash-loading', src: 'screens/splash.html?state=loading' }]],
  language: ['Ngôn ngữ (lần đầu)', ['Chọn ngôn ngữ; nút xác nhận hiện sau khi chọn'], [{ name: 'language-selected', src: 'screens/language.html?state=selected' }]],
  'onboarding-1': ['Onboarding 1', ['Lợi ích #1']], 'onboarding-2': ['Onboarding 2', ['Lợi ích #2']], 'onboarding-3': ['Onboarding 3', ['Lợi ích #3']],
  'onboarding-4': ['Onboarding 4', ['Lợi ích #4', 'Bắt đầu → màn chính (paywall lần đầu nếu có)']],
  'native-full-1': ['Native toàn màn', ['Quảng cáo native full, đóng sau 2 s'], [], 'screens/native-full.html'],
  'native-full-2': ['Native toàn màn', ['Quảng cáo native full, đóng sau 2 s'], [], 'screens/native-full.html'],
};
const screens = order.map((id, i) => S(id, meta[id][0], i, meta[id][1], meta[id][2] || [], meta[id][3]));
const L = (from, to, label, extra = {}) => ({ from, to, label, ...extra });
const links = order.slice(1).map((to, i) => L(order[i], to, i === 0 ? 'lần đầu' : order[i] === 'language' ? 'Xác nhận' : order[i].startsWith('native') ? 'Đóng' : 'Tiếp'));
if (withCommon) {
  const st = (id, names) => names.map((n) => ({ name: `${id}-${n}`, src: `screens/${id}.html?state=${n}` }));
  const col = order.length;
  screens.push(
    { id: 'paywall', name: 'Premium (mẫu chung của team)', src: 'screens/paywall.html', does: ['Hero + giảm giá + đếm ngược', '4 gói, gói năm dùng thử', 'CTA ghi rõ cam kết, pháp lý'], col, row: 0, states: st('paywall', ['premium']) },
    { id: 'permissions', name: 'Quyền (mẫu chung)', src: 'screens/permissions.html', does: ['Danh sách quyền + lý do', 'CTA bật khi đủ quyền bắt buộc'], col, row: 1, states: st('permissions', ['all']) },
    { id: 'dialogs', name: 'Dialog (mẫu chung)', src: 'screens/dialogs.html', does: ['Đánh giá, cập nhật, mở khóa', 'Xác nhận, đặt làm, thoát'], col: col + 1, row: 0, states: st('dialogs', ['rating', 'rating-low', 'update', 'reward', 'confirm', 'setas', 'exit']) },
    { id: 'ads', name: 'Đơn vị quảng cáo (mẫu chung)', src: 'screens/ads.html', does: ['Big, Colab, Medium, Small, Item, Tiny, Popup, Banner'], col: col + 1, row: 1, states: st('ads', ['colab', 'medium', 'small', 'item', 'popup', 'banner']) });
  links.push({ from: order[order.length - 1], to: 'paywall', label: 'lần đầu', dashed: true });
}
fs.writeFileSync(path.join(out, 'flow.json'), JSON.stringify({ app, start: 'splash', screens, links }, null, 1) + '\n');
if (!fs.existsSync(path.join(out, 'brief.md'))) fs.writeFileSync(path.join(out, 'brief.md'), `# ${app}\n\n## Inventory\n\n## Screens\n\n## Direction\n\n## Images\n`);

console.log(`new-flow: ${out}\n  kit.css, state.js, tokens.css (${opt('direction') || opt('seed')}), screens/${written.join(', screens/')}\n  next: edit base screens (background, colours, illustrations, copy), add the app's screens to flow.json, then\n  node ${path.join(SKILL, 'scripts', 'flow', 'build-flow.mjs')} ${out}`);
