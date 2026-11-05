#!/usr/bin/env node
// Rebuilds data/*.json from the Taste Skill library plus Android additions.
// Usage: node build-data.mjs --taste <taste-skill/skills/taste-skill> --gf <google-fonts-metadata.json> --fs <fontshare.json> --out <skill>/data
//   google-fonts-metadata.json: curl -sSL https://fonts.google.com/metadata/fonts
//   fontshare.json: array of {slug,vi,license} built from https://api.fontshare.com/v2/fonts?limit=100&page=N
import fs from 'node:fs';
import path from 'node:path';

const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
const taste = arg('taste'), gfPath = arg('gf'), fsPath = arg('fs'), out = arg('out');
if (!taste || !gfPath || !fsPath || !out) { console.error('usage: --taste <dir> --gf <file> --fs <file> --out <dir>'); process.exit(2); }
const lib = (f) => JSON.parse(fs.readFileSync(path.join(taste, 'library', f), 'utf8'));
const gf = JSON.parse(fs.readFileSync(gfPath, 'utf8').replace(/^\)\]\}'\n?/, ''));
const gfBy = Object.fromEntries(gf.familyMetadataList.map((f) => [f.family, f]));
const fsBy = Object.fromEntries(JSON.parse(fs.readFileSync(fsPath, 'utf8')).map((f) => [f.slug, f]));

const lum = (hex) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };

// ---------- palettes ----------
const palettes = lib('palettes.json').map(({ seenIn, ...p }) => ({ ...p, theme: lum(p.bg) < 0.2 ? 'dark' : 'light', source: 'taste-skill' }));

// ---------- type ----------
const face = (f) => {
  const base = { family: f.family, source: f.source, weights: f.weights, italic: !!f.italic, settings: f.settings };
  if (f.source === 'google') {
    const m = gfBy[f.family];
    return { ...base, vi: !!m && m.subsets.includes('vietnamese'), android: 'downloadable-or-bundle', license: 'OFL (Google Fonts)', axes: m ? (m.axes || []).map((a) => a.tag) : [] };
  }
  const m = fsBy[f.slug];
  return { ...base, slug: f.slug, vi: !!m && m.vi, android: 'bundle', license: m ? m.license : 'unknown' };
};
const type = lib('type.json').map((t) => ({ id: t.id, name: t.name, class: t.class, display: face(t.display), text: face(t.text), standsInFor: t.standsInFor, note: t.note, source: 'taste-skill' }));
const g = (family, weights, settings) => face({ family, source: 'google', weights, settings });
const extras = [
  ['be-vietnam-pro', 'Be Vietnam Pro', 'grotesk-tight', g('Be Vietnam Pro', [600, 700], 'weight 600 · tracking -0.02em'), g('Be Vietnam Pro', [400, 500], 'weight 400'), 'Drawn in Vietnam for Vietnamese first: stacked diacritics sit cleanly at small sizes. The safe neutral for a Vietnamese-first app that still wants a decided voice.'],
  ['inter-only', 'Inter', 'grotesk-tight', g('Inter', [600, 700], 'weight 600 · tracking -0.02em'), g('Inter', [400, 500], 'weight 400 · tnum for figures'), 'One neutral grotesk with optical sizes and excellent figures. Works for dense tools; give the product a face elsewhere (colour, signature element).'],
  ['manrope-only', 'Manrope', 'geometric', g('Manrope', [600, 700, 800], 'weight 700 · tracking -0.02em'), g('Manrope', [400, 500], 'weight 500'), 'Open geometric with strong figures; balances and counts read as the face of the product.'],
  ['jakarta-only', 'Plus Jakarta Sans', 'geometric', g('Plus Jakarta Sans', [600, 700, 800], 'weight 700 · tracking -0.02em'), g('Plus Jakarta Sans', [400, 500], 'weight 400'), 'Friendly geometric for consumer apps; rounder than Inter, calmer than a rounded face.'],
  ['lexend-nunito', 'Lexend + Nunito', 'rounded-friendly', g('Lexend', [600, 700], 'weight 600'), g('Nunito', [400, 600], 'weight 400'), 'Readable and warm: learning, kids, health. Lexend headings, Nunito text.'],
  ['quicksand-nunito', 'Quicksand + Nunito', 'rounded-friendly', g('Quicksand', [600, 700], 'weight 700'), g('Nunito', [400, 600], 'weight 400'), 'Soft rounded display for playful, low-stakes apps; keep body in Nunito for legibility.'],
  ['fraunces-inter', 'Fraunces + Inter', 'serif-display', g('Fraunces', [600, 700], 'weight 600 · opsz auto · SOFT 50'), g('Inter', [400, 500], 'weight 400'), 'A soft, characterful serif for headlines over a neutral text face: food, travel, reading, journaling.'],
  ['lora-roboto', 'Lora + Roboto', 'serif-text', g('Lora', [500, 600], 'weight 600'), g('Roboto', [400, 500], 'weight 400'), 'Literary headings on the platform text face: reading and editorial apps that must feel at home on Android.'],
  ['space-grotesk-plex', 'Space Grotesk + IBM Plex Sans', 'grotesk-light', g('Space Grotesk', [500, 600], 'weight 600 · tracking -0.01em'), g('IBM Plex Sans', [400, 500], 'weight 400'), 'Technical character without costume: tools, monitors, developer utilities.'],
  ['jetbrains-inter', 'JetBrains Mono figures + Inter', 'mono-data', g('JetBrains Mono', [500, 600], 'weight 500 · figures and IDs only'), g('Inter', [400, 500], 'weight 400'), 'Monospace for figures, prices, times and IDs only (digits that stack); Inter for every word.'],
  ['roboto-flex', 'Roboto Flex', 'system-tuned', g('Roboto Flex', [600, 700], 'weight 650 · wdth 90 · tracking -0.01em'), g('Roboto', [400, 500], 'weight 400'), 'The platform voice, tuned: a narrower, heavier Roboto Flex for display roles. For apps that should read as pure Android but not as the baseline template.'],
].map(([id, name, cls, display, text, note]) => ({ id, name, class: cls, display, text, note, source: 'android-design' }));
const typeAll = [...type, ...extras].map((t) => ({ ...t, vi: t.display.vi && t.text.vi }));

// ---------- styles ----------
const shapePresets = {
  square: [0, 2, 4, 6, 8], crisp: [4, 6, 8, 12, 16], standard: [4, 8, 12, 16, 28], soft: [8, 12, 16, 24, 32], round: [10, 14, 20, 28, 36],
};
const androidMap = {
  'achromatic-ledger': { shape: 'crisp', density: 'comfortable', motion: 'calm', typeClasses: ['grotesk-tight', 'grotesk-light', 'geometric', 'serif-text', 'system-tuned'], paletteTags: ['light-neutral', 'mono-accent', 'photographic-neutral'], roles: { primary: 'ink', secondary: 'neutral', tertiary: 'accent', neutral: 'ground' },
    m3: ['primary is ink (near-black): filled buttons and the FAB are ink, never the brand hue', 'secondaryContainer stays a neutral grey, so the NavigationBar indicator and tonal buttons carry no hue', 'tertiary (the accent) touches only the main data element: today\'s series, the current period', 'cards are surfaceContainerLowest on a tinted surface, 0dp elevation, separation by one tone step or a 1dp outlineVariant', 'positive/negative appear only as a short coloured figure or a small triangle (ExtendedColors)'] },
  'framed-sheet': { shape: 'crisp', density: 'comfortable', motion: 'calm', typeClasses: ['grotesk-tight', 'grotesk-light', 'mono-data', 'system-tuned'], paletteTags: ['light-neutral', 'mono-accent', 'two-tone'], roles: { primary: 'accent', secondary: 'neutral', tertiary: 'rotate:150', neutral: 'ground' },
    m3: ['the top app bar and NavigationBar sit on one tinted surfaceContainer frame; content sits on a lighter surface sheet with large top corners', 'no shadows: depth is one tone step', 'the accent marks the selected tab (2dp indicator) and the main series; the rest of the chrome is grey', 'IDs, keys and table figures may use a mono face (one job only)'] },
  'accent-ladder': { shape: 'standard', density: 'comfortable', motion: 'standard', typeClasses: ['grotesk-tight', 'geometric', 'grotesk-light', 'rounded-friendly'], paletteTags: ['mono-accent', 'single-field', 'two-tone', 'light-neutral'], roles: { primary: 'accent', secondary: 'accent', tertiary: 'rotate:60', neutral: 'accent-tint' },
    m3: ['this is Material\'s own model played straight: the full hue only on small marks (filled button, active icon, data series)', 'primaryContainer / secondaryContainer tints do all area work: the nav indicator, the plan card, badges, progress tracks', 'one hue family only; tertiary is reserved for one rare highlight', 'never the full hue on a large area or a gradient on an upgrade button'] },
  'editorial-greeting': { shape: 'round', density: 'airy', motion: 'calm', typeClasses: ['serif-display', 'serif-light-large', 'serif-text', 'grotesk-light'], paletteTags: ['earth', 'light-neutral', 'photographic-neutral', 'pastel-fields'], roles: { primary: 'accent', secondary: 'neutral', tertiary: 'rotate:40', neutral: 'surface' },
    m3: ['the home opens with a typeset greeting in headlineMedium/Large naming this person or household and today\'s one fact, never "Welcome back" or an emoji', 'figures at regular weight on tonal surfaceContainer panels, one layer each; one white inner card at most', 'pill buttons (full shape) and 22-28dp card corners', 'people get a stable pale hue on their avatar: identity, not data'] },
  'pastel-consumer': { shape: 'round', density: 'comfortable', motion: 'standard', typeClasses: ['geometric', 'rounded-friendly', 'grotesk-tight'], paletteTags: ['pastel-fields', 'light-neutral', 'mono-accent'], roles: { primary: 'accent', secondary: 'rotate:60', tertiary: 'rotate:150', neutral: 'ground' },
    m3: ['category tiles are pale containers with the dark of their own hue as ink (primary/secondary/tertiaryContainer + on*Container, plus ExtendedColors for more categories)', 'one large radius family: 20dp cards stepping down to 12/8dp inside', 'quiet money polarity: income in success with a plus sign, spending in onSurface, no red on ordinary outgoings', 'balances in a figure face with tabular figures; the minor unit smaller and grey'] },
  'true-black-flat': { shape: 'round', density: 'comfortable', motion: 'standard', typeClasses: ['grotesk-tight', 'extended-heavy', 'condensed-heavy', 'geometric'], paletteTags: ['dark-neutral', 'flat-loud', 'single-field'], roles: { primary: 'ink', secondary: 'neutral', tertiary: 'accent', neutral: 'ground' }, trueBlack: true,
    m3: ['dark scheme on true black (#000 background/surface), elevation by lightness steps of surfaceContainer only, no borders, no shadows', 'primary is inverted ink: a white pill with black text', 'the accent hue lives only on data marks (tertiary), never on buttons, tabs or the nav indicator', 'NavigationBar indicator is a neutral surfaceContainerHighest; the active label goes from onSurfaceVariant to onSurface', 'still ship a light scheme: the user chooses, not the style'] },
  'data-terminal': { shape: 'square', density: 'dense', motion: 'calm', typeClasses: ['mono-data', 'grotesk-light', 'grotesk-tight'], paletteTags: ['dark-neutral', 'mono-accent'], roles: { primary: 'accent', secondary: 'neutral', tertiary: 'positive', neutral: 'ground' },
    m3: ['for screens read in long sessions: figures in a mono face with tabular digits, signs in the text (+24,000) not only colour', 'selection is one accent line (2dp indicator) under tabs and segmented choices; no filled pills in content', 'cards may sit darker than the background (surfaceContainerLowest)', 'secondary text keeps 4.5:1: onSurfaceVariant, never a dimmer custom grey'] },
};
// Drop sentences that point at Taste's web inspector/lint, which this skill does not ship.
const clean = (t) => t.split(/(?<=[.!?])\s+/).filter((x) => !/\b(inspector|Lint|lint)\b/.test(x)).join(' ');
const tasteStyles = lib('app.json').styles.map((s) => ({
  id: s.id, name: s.name, theme: s.theme, suits: s.suits, idea: s.idea, colourBudget: s.colourBudget,
  tokens: Object.fromEntries(Object.entries(s.tokens).filter(([k]) => ['ground', 'surface', 'text', 'muted', 'accent', 'positive', 'negative', 'warning', 'chart'].includes(k))),
  signature: clean(s.signature), identity: s.identity.map(clean), avoid: s.avoid.map(clean), source: 'taste-skill (desktop study; read the m3 lines for the phone translation)',
  android: { ...androidMap[s.id], radii: shapePresets[androidMap[s.id].shape] },
}));
const androidStyles = [
  { id: 'tonal-material', name: 'Tonal Material, decided', theme: 'light', suits: ['utility', 'productivity', 'health-fitness', 'learning', 'travel', 'social'],
    idea: 'Material You played with conviction instead of by default: one brand hue drives every tonal container, surfaces step by tone not shadow, and one signature shape or motion belongs to this product alone.',
    colourBudget: '5-12%, nearly all of it as tonal containers; the full hue only on the one primary action and active states',
    tokens: { ground: '#f7f9f6', surface: '#ffffff', text: '#191c1a', muted: '#5c605c', accent: '#2f6b4f', positive: '#2e7d32', negative: '#ba1a1a', warning: '#8a5300', chart: ['#2f6b4f', '#7a8a80', '#a35a2a'] },
    signature: 'The brand hue shows up as primaryContainer surfaces (the hero status card, the nav indicator, selected chips), never as a large saturated area; the hero of the main screen is a single tonal card that answers the screen\'s question in one figure or sentence; one expressive shape (a cut corner, a blob, a squircle) appears exactly once per screen as the product\'s mark.',
    identity: ['The hue from the product\'s own world (a scanner\'s laser red, a water app\'s river teal), checked at 3:1 on surface, never the baseline purple #6750A4.', 'One signature element only this product has (a cleaner\'s freed-space figure, a step counter\'s route sketch) as the hero.', 'A brand face on display and headline roles only; body stays on the text face.'],
    avoid: ['the baseline M3 purple scheme', 'dynamic color as the only identity (ship a branded static scheme; dynamic is an opt-in)', 'every screen a column of identical Cards', 'elevation shadows on cards'],
    source: 'android-design', android: { shape: 'standard', radii: shapePresets.standard, density: 'comfortable', motion: 'standard', typeClasses: ['grotesk-tight', 'geometric', 'system-tuned', 'rounded-friendly'], paletteTags: ['mono-accent', 'earth', 'single-field', 'two-tone'], roles: { primary: 'accent', secondary: 'accent', tertiary: 'rotate:60', neutral: 'accent-tint' },
      m3: ['default M3 roles: primary for the one action, primaryContainer for the hero card and selected states, secondaryContainer for the nav indicator and chips, tertiary for one rare highlight', 'surfaces: surface for the screen, surfaceContainerLow for grouped content, no shadows', 'dynamic color offered as a setting with the branded scheme as default'] } },
  { id: 'media-canvas', name: 'Media canvas', theme: 'dark', suits: ['photo-video', 'media', 'wallpaper', 'music'],
    idea: 'The user\'s content is the interface: photos, video and art run edge to edge, and the chrome recedes to neutral dark surfaces and scrims that appear only when needed.',
    colourBudget: 'under 2% in the chrome; the content supplies all the colour',
    tokens: { ground: '#0f0f10', surface: '#1a1a1c', text: '#f2f2f2', muted: '#a8a8ad', accent: '#ffb44a', positive: '#7bd88f', negative: '#ff6b6b', warning: '#ffc857', chart: ['#ffb44a', '#e6e6e6', '#6b6b6b'] },
    signature: 'Content full-bleed under transparent system bars; controls sit on a gradient-free scrim (surface at 60-80% alpha) or a floating toolbar; the accent marks only the active tool and the export/save action; the content grid has no gutters wider than 2dp.',
    identity: ['An accent from the product\'s craft (a film-stock amber, a darkroom red, a neon for a wallpaper app), only on the active tool and the primary action.', 'The user\'s own latest work as the hero of the home screen, never a stock sample.', 'Tool icons drawn as one family (Material Symbols Rounded or Sharp, one weight), labelled under the icon in labelSmall.'],
    avoid: ['colourful chrome competing with the content', 'cards with borders around thumbnails', 'controls permanently over the content with no way to hide them', 'a light theme forced on an editor (offer it, default dark)'],
    source: 'android-design', android: { shape: 'soft', radii: shapePresets.soft, density: 'comfortable', motion: 'standard', typeClasses: ['grotesk-tight', 'geometric', 'extended-heavy', 'system-tuned'], paletteTags: ['dark-neutral', 'photographic-neutral', 'flat-loud'], roles: { primary: 'accent', secondary: 'neutral', tertiary: 'accent', neutral: 'ground' },
      m3: ['edge-to-edge with transparent system bars over content; insets applied to controls, not to the content', 'bottom tool row (horizontally scrolling) + ModalBottomSheet for a tool\'s parameters', 'NavigationBar only on browse screens; hidden in editor/viewer', 'secondaryContainer neutral; primary = accent for the one primary action (Save/Export)'] } },
  { id: 'playful-rounded', name: 'Playful rounded', theme: 'light', suits: ['kids', 'learning', 'productivity', 'social', 'health-fitness'],
    idea: 'Saturated pastel fields, big radii and springy motion for apps whose job is encouragement: progress feels like a reward, never a dashboard.',
    colourBudget: '15-30% as pale fields; saturated hue only on progress and the one action',
    tokens: { ground: '#fffaf3', surface: '#ffffff', text: '#1f1b16', muted: '#5f5a52', accent: '#ff7a1a', positive: '#2f9e44', negative: '#d9480f', warning: '#e8a400', chart: ['#ff7a1a', '#4c6ef5', '#12b886'] },
    signature: 'Three hue families as pale containers (primary/secondary/tertiaryContainer) coding sections or subjects; one bold progress element tied to the real goal; buttons as full pills with a 2dp darker bottom edge; spring motion with a gentle overshoot on success only.',
    identity: ['A mascot or drawn character only if the product has one; never a generic emoji.', 'Subject colours from the content itself (math = one hue, reading = another), consistent everywhere.', 'A rounded display face; body text stays a highly legible sans at bodyLarge.'],
    avoid: ['confetti on every action', 'progress rings standing in for real content', 'more than three hue families', 'text on saturated fields under 4.5:1'],
    source: 'android-design', android: { shape: 'round', radii: shapePresets.round, density: 'airy', motion: 'expressive', typeClasses: ['rounded-friendly', 'geometric'], paletteTags: ['pastel-fields', 'flat-loud', 'single-field'], roles: { primary: 'accent', secondary: 'rotate:120', tertiary: 'rotate:240', neutral: 'ground' },
      m3: ['full-pill buttons and 28-36dp card corners (Shapes.extraLarge)', 'MotionScheme.expressive() where available (material3 1.4+), else springs with dampingRatio 0.6-0.7 on success moments only', 'NavigationBar with labels always visible; icons filled when selected'] } },
];
const styles = [...tasteStyles, ...androidStyles];

// ---------- kinds ----------
const k = (id, styles, keywords, note) => ({ id, styles, keywords, note });
const kinds = [
  k('finance', ['achromatic-ledger', 'pastel-consumer', 'tonal-material'], ['finance', 'budget', 'expense', 'bank', 'accounting', 'invoice', 'tai chinh', 'chi tieu', 'ngan sach', 'ngan hang', 'ke toan', 'hoa don', 'thu chi'], 'money homes, budgeting, accounting'),
  k('wallet', ['pastel-consumer', 'achromatic-ledger', 'tonal-material'], ['wallet', 'crypto', 'payment', 'pay', 'transfer', 'vi dien tu', 'thanh toan', 'chuyen tien', 'vi '], 'consumer wallets, payments, crypto'),
  k('commerce', ['achromatic-ledger', 'accent-ladder', 'editorial-greeting'], ['shop', 'store', 'seller', 'order', 'ecommerce', 'cart', 'cua hang', 'ban hang', 'don hang', 'mua sam', 'gio hang'], 'shops and sellers'),
  k('analytics', ['framed-sheet', 'achromatic-ledger', 'accent-ladder'], ['analytics', 'dashboard', 'stats', 'report', 'metric', 'phan tich', 'thong ke', 'bao cao', 'chi so'], 'analytics and reports'),
  k('devtools', ['data-terminal', 'framed-sheet', 'achromatic-ledger'], ['developer', 'api', 'deploy', 'server', 'log', 'monitor', 'uptime', 'terminal', 'ssh'], 'developer and monitoring tools'),
  k('creator', ['accent-ladder', 'editorial-greeting', 'true-black-flat'], ['creator', 'newsletter', 'blog', 'channel', 'sang tao', 'kenh'], 'creators and publishing'),
  k('smb-admin', ['accent-ladder', 'framed-sheet', 'tonal-material'], ['admin', 'crm', 'pos', 'staff', 'booking', 'appointment', 'quan ly', 'nhan vien', 'dat lich', 'lich hen'], 'small-business admin'),
  k('workspace', ['editorial-greeting', 'achromatic-ledger', 'tonal-material'], ['team', 'workspace', 'project', 'nhom', 'du an'], 'team homes and projects'),
  k('community', ['true-black-flat', 'accent-ladder'], ['community', 'forum', 'club', 'event', 'cong dong', 'su kien', 'cau lac bo'], 'communities and events'),
  k('support', ['achromatic-ledger', 'framed-sheet'], ['support', 'ticket', 'helpdesk', 'ho tro', 'phieu'], 'support and ticketing'),
  k('markets', ['data-terminal', 'true-black-flat'], ['stock', 'trading', 'market', 'exchange', 'chung khoan', 'giao dich', 'co phieu', 'coin'], 'markets and trading'),
  k('utility', ['tonal-material', 'achromatic-ledger', 'framed-sheet'], ['tool', 'utility', 'scanner', 'cleaner', 'battery', 'vpn', 'flashlight', 'qr', 'converter', 'calculator', 'file', 'cleaner', 'booster', 'tien ich', 'quet', 'don dep', 'pin', 'cong cu', 'may tinh', 'chuyen doi', 'tap tin', 'den pin'], 'tools and utilities'),
  k('photo-video', ['media-canvas', 'true-black-flat', 'tonal-material'], ['photo', 'editor', 'camera', 'video', 'collage', 'filter', 'ai art', 'sticker', 'anh', 'chinh sua', 'may anh', 'ghep anh', 'bo loc', 'cat ghep'], 'photo and video creation'),
  k('media', ['media-canvas', 'true-black-flat', 'editorial-greeting'], ['music', 'player', 'podcast', 'stream', 'movie', 'radio', 'ringtone', 'nhac', 'phim', 'nghe', 'nhac chuong'], 'listening and watching'),
  k('call-screen', ['media-canvas', 'true-black-flat', 'playful-rounded'], ['call screen', 'caller', 'incoming call', 'color phone', 'call theme', 'call flash', 'flash alert', 'dialer', 'cuoc goi', 'man hinh cuoc goi', 'nguoi goi', 'goi den', 'nhac chuong', 'den flash', 'nhay den'], 'call screen themes, caller looks, flash alerts'),
  k('wallpaper', ['media-canvas', 'playful-rounded', 'true-black-flat'], ['wallpaper', 'theme', 'icon pack', 'launcher', 'live wallpaper', 'hinh nen', 'chu de', 'giao dien'], 'personalisation'),
  k('health-fitness', ['tonal-material', 'pastel-consumer', 'true-black-flat'], ['health', 'fitness', 'workout', 'step', 'sleep', 'diet', 'water', 'period', 'meditation', 'suc khoe', 'tap luyen', 'giac ngu', 'uong nuoc', 'calo', 'thien', 'buoc chan'], 'health and fitness'),
  k('learning', ['playful-rounded', 'tonal-material', 'editorial-greeting'], ['learn', 'course', 'language', 'quiz', 'study', 'flashcard', 'vocabulary', 'exam', 'hoc', 'khoa hoc', 'tu vung', 'on thi', 'ngoai ngu', 'bai tap'], 'learning'),
  k('social', ['accent-ladder', 'tonal-material', 'true-black-flat'], ['chat', 'messenger', 'social', 'dating', 'friends', 'tro chuyen', 'nhan tin', 'ban be', 'hen ho', 'mang xa hoi'], 'social and messaging'),
  k('travel', ['editorial-greeting', 'tonal-material', 'pastel-consumer'], ['travel', 'booking', 'hotel', 'flight', 'map', 'trip', 'du lich', 'dat phong', 'chuyen bay', 'ban do', 'khach san'], 'travel'),
  k('food', ['editorial-greeting', 'pastel-consumer', 'accent-ladder'], ['food', 'recipe', 'delivery', 'restaurant', 'cooking', 'do an', 'cong thuc', 'giao hang', 'nha hang', 'nau an', 'mon an'], 'food and cooking'),
  k('productivity', ['achromatic-ledger', 'tonal-material', 'editorial-greeting'], ['todo', 'notes', 'calendar', 'task', 'habit', 'reminder', 'planner', 'ghi chu', 'lich', 'cong viec', 'thoi quen', 'nhac nho', 'ke hoach'], 'tasks, notes, habits'),
  k('kids', ['playful-rounded', 'pastel-consumer'], ['kids', 'children', 'baby', 'toddler', 'tre em', 'be ', 'thieu nhi'], 'children and families'),
  k('reading', ['editorial-greeting', 'achromatic-ledger', 'true-black-flat'], ['news', 'reader', 'ebook', 'manga', 'comic', 'novel', 'bible', 'tin tuc', 'doc ', 'truyen', 'sach'], 'reading'),
];

// ---------- patterns ----------
const tastePatterns = lib('app.json').patterns.filter((p) => p.phone).map((p) => ({ id: p.id, name: p.name, screen: p.screen || 'signature', kinds: p.kinds || [], phone: p.phone, source: 'taste-skill' }));
const P = (id, name, screen, kinds, phone) => ({ id, name, screen, kinds, phone, source: 'android-design' });
const androidPatterns = [
  P('tool-hero-action', 'One hero action with live status', 'home', ['utility'], 'The screen answers "what state is my device/file in and what do I do": a tonal hero card with the one figure (free space, battery health, scan count) and a full-width primary button for the tool\'s main job; below, a short list of recent results as ListItems with trailing values; secondary tools as a 2-column grid of labelled icon tiles, never more than 6.'),
  P('media-grid-viewer', 'Grid and full-screen viewer', 'browse', ['photo-video', 'wallpaper', 'media'], 'LazyVerticalGrid with 3 columns at compact (4 at medium), 2dp gutters, square or 9:16 cells by content; date or album headers as sticky labelSmall; tap opens a full-screen pager with controls on a scrim that hide on tap; long-press enters multi-select with a contextual top app bar.'),
  P('editor-canvas-tools', 'Canvas with tool row and sheet', 'editor', ['photo-video'], 'The canvas fills the space between a slim top app bar (back, undo, redo, Export as the one filled action) and a bottom row of tools that scrolls horizontally (icon + labelSmall, active tool in the accent); choosing a tool raises a ModalBottomSheet or an inline panel with its sliders; compare-with-original on press-and-hold.'),
  P('feed-cards', 'Content feed', 'feed', ['social', 'reading', 'creator', 'community'], 'One column of items whose anatomy repeats (author row, content, action row); media keeps its real ratio; no card border around each item, separation by 8-12dp space or a divider; a pull-to-refresh and a "new items" chip instead of auto-jumping.'),
  P('onboarding-paywall', 'Onboarding to honest paywall', 'onboarding', ['utility', 'photo-video', 'learning', 'health-fitness', 'wallpaper'], 'Two or three screens that each show the product doing its job on the user\'s data or a real example, not feature icons; the paywall names the price per period, the trial length and when billing starts above the button, offers a close affordance from the first second, and restores purchases; no fake countdowns.'),
  P('progress-path', 'Today and the path', 'home', ['learning', 'health-fitness', 'productivity', 'kids'], 'Today\'s one goal as the hero (a figure against its target, e.g. "3 of 5 lessons"), then the path or streak as a horizontal or vertical sequence of real steps with the next one actionable; history in a secondary screen; rewards only on real completion.'),
  P('now-playing', 'Now playing', 'player', ['media'], 'Artwork at full width with its real ratio, title and artist in titleLarge/bodyMedium, a scrubber with elapsed and remaining in tabular figures, transport controls with play/pause as the largest target; queue and lyrics behind tabs or a sheet; a mini-player bar above the NavigationBar elsewhere.'),
  P('settings-list', 'Settings list', 'settings', ['utility', 'productivity', 'photo-video', 'media', 'health-fitness', 'learning', 'wallpaper', 'social', 'finance', 'wallet'], 'Grouped ListItems with a group title in labelLarge/primary; each row: leading icon optional, headline, supporting text with the current value, trailing Switch or chevron; destructive actions at the end in error colour; no cards around groups unless the style asks for tonal panels.'),
];
const patterns = [...tastePatterns, ...androidPatterns];

fs.mkdirSync(out, { recursive: true });
const w = (f, v) => fs.writeFileSync(path.join(out, f), JSON.stringify(v, null, 1) + '\n');
w('palettes.json', palettes); w('type.json', typeAll); w('styles.json', styles); w('kinds.json', kinds); w('patterns.json', patterns); w('shapes.json', shapePresets);
console.log(`palettes ${palettes.length}, type ${typeAll.length} (vi ${typeAll.filter((t) => t.vi).length}), styles ${styles.length}, kinds ${kinds.length}, patterns ${patterns.length}`);
