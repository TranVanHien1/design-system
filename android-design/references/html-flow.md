# HTML flow: design an app as a screen-flow map

The default design deliverable before Figma or Compose: every screen designed as a real HTML page in a 360×800dp phone frame and assembled into one `flow.html` in the project (pan/zoom canvas, one card per screen with its "does" list and state thumbnails, arrows labelled with the trigger). `flow.html` embeds the screens as **live HTML**, not pictures: one `<template id="v-<view>">` per screen and per state (state already applied, no scripts) plus the shared CSS in `<template id="screen-css">`, rendered in shadow roots. A reviewing agent reads the components straight from the file; images referenced by screens stay in `img/` next to it. The HTML screens are the source of truth for the later Figma build ([figma.md](figma.md)) and the Compose build (tokens come from the same `theme.mjs` run).

Use it for a whole app from a document, a feature group, or a single feature. Write screen copy in the app's primary locale (Vietnamese unless the brief says otherwise); card names and "does" lines in the user's language.

## Project layout

```
<flow-dir>/
  flow.json          screens, positions, states, links (schema in scripts/flow/build-flow.mjs header)
  tokens.css         generated: node <skill>/scripts/theme.mjs … --css tokens.css   (never hand-edit)
  kit.css, state.js  copied from <skill>/assets/flow/ (phone frame + M3 components + ?state= switching)
  team.css           the team's measured components (references/components.md): ads, nav, dialogs, paywall, buttons…
  img/               illustrations, icons, avatars (real data, supplied by the user, or generated on request from images.json; see "Images" and images.md)
  screens/*.html     one file per screen; states inside the same file via data-when, or separate files
  shots/             optional JPEG renders (--shots) for a visual check or Figma uploads
  flow.html          the deliverable (live HTML views; --images makes a self-contained picture version to send outside)
  brief.md           feature inventory, screen list, direction, image list
```

Start one with `node <skill>/scripts/flow/new-flow.mjs --app "<Name>" --out <flow-dir> --direction "<style>+<palette>+<type>" [--brand "#hex"] [--dark-first] [--ads] [--confirm tick|pill|round] [--common]`. `--common` adds the team's shared screens (paywall, permissions, dialog gallery, ad-unit gallery). It copies the kit, generates `tokens.css`, writes the base screens (splash, language, onboarding 1–4, plus full-screen native pages with `--ads`) from [base-flow.md](base-flow.md) and a starter `flow.json`. Ads are left out unless the user asks for them.

## Workflow

1. **Inventory** (`brief.md`). From the document, the codebase or the reverse-engineered competitor: features, user jobs, permissions, monetisation (ads placements, IAP plans), content types, locales. One line per feature with its entry point. When a competitor app is the source, take its job list, never its look or copy. For thumbnails from a decoded APK, use what the package ships (assets JSON, raster drawables, and its VectorDrawable illustrations converted with `node <skill>/scripts/flow/vd2svg.mjs <res/drawable> --out img --min-kb 12`); content served from the competitor's servers (story covers, wallpapers) is not fetched; label stand-ins as sample in `brief.md`, and leave out the competitor's mascot and logo.
2. **Screen list and flow.** Base flow first from the templates ([base-flow.md](base-flow.md): only app icon, 4 onboarding illustrations and onboarding copy are designed), then — where the effort goes — the functional screens from Home onward: the core loop (home → browse → detail/preview → apply/do → result), create/edit, library/my items, settings, permission guides and dialogs that belong to those features. Paywall and similar secondary screens are skipped unless the user asks (link to a labelled placeholder card if the flow needs the arrow). For each screen: id, name, the 1–4 things it does, its `UiState` variants (loading, empty, error, offline, locked/premium, permission denied, success). Lay it out in `flow.json`: columns follow the main path left→right (`col`), branches stack below (`row`); tabs are `"tab": true` links; back/return/conditional links are `"dashed": true`. Label every link with the user's trigger ("Chạm theme", "Áp dụng", "lần đầu").
3. **Direction.** New app or new look → direction round ([new-work.md](new-work.md)) with the topic worlds in [reference-patterns.md](reference-patterns.md) as extra anti-monotony input; existing app → its tokens. Generate `tokens.css` with `theme.mjs --css`.
4. **Images list.** Before building screens, write the list of every illustration the flow needs (app icon, 4 onboarding illustrations, empty states, category covers, sample content of the functional screens) with a one-paragraph prompt each, sized for its slot (portrait 9:16 for full-bleed, 4:3 or 1:1 for cards). Generate them with the user's image tool, or ask the user for them; until they exist, use a tinted placeholder block with the prompt's title, never a stock photo or an emoji.
5. **Build screens.** One HTML file per screen (template below). Use kit classes and token variables only; screen-specific values go in that screen's `<style>` as `--x-*` variables. Real content at true length (Vietnamese strings ~30% longer than English). Every state the card lists is reachable via `?state=` or its own file.
6. **Build as you go.** After each batch of screens run `node <skill>/scripts/flow/build-flow.mjs <flow-dir>` so `flow.html` is always current and the user can review while you continue. Later flows are appended: add screens/states/links to `flow.json` (and their HTML), rebuild; nothing else changes.
7. **Look.** `build-flow.mjs <flow-dir> --shots [--only id,id]` also renders JPEGs to `shots/` (≈0.2 s each) and warns about overflow, broken images and failed fonts; fix every warning. Look at the shots in batches — `python3 ~/.claude/skills/android-adb-qa/scripts/ui.py montage strip.png shots/a.jpg shots/b.jpg … --w 240` — against [craft-floor.md](craft-floor.md), [tells.md](tells.md) and the base-flow rules. Fix, rebuild, look again. Once, also open `flow.html` itself (headless screenshot) to confirm the live views match the shots.
8. **Deliver** the project's `flow.html` (live, agent-readable) plus the folder; `--images` only when a self-contained file must leave the project. Tell the user which images are placeholders, which states exist per screen, and the open decisions.

## Frames and components

- Use the team's frames: **412×917** for base-flow screens and **375×812** for core screens (`<html data-frame="375x812">`); 360×800 remains the default for generic Android work. Positions and sizes from Figma then apply 1:1.
- Build team apps from `team.css` components (`.t-btn`, `.t-header`, `.t-search`, `.t-chip`, `.t-sec`, `.t-rail`, `.t-grid2`, `.t-nav`/`.t-navpill`, `.t-dialog`, `.t-sheet`, `.t-perm`, `.pw-*`, `.ad-*`) with the measured specs in [components.md](components.md); fall back to `kit.css` (M3) for anything the team has not designed.
- Per-app skin goes in variables (`--x-brand`, `--t-grad`, `--t-font`, `--t-card`…) and the display face, not in new geometry.

## Screen template

```html
<!doctype html><html lang="vi"><head><meta charset="utf-8">
<link rel="stylesheet" href="../tokens.css"><link rel="stylesheet" href="../kit.css"><script src="../state.js"></script>
<style> /* screen-only variables and layout; colours via tokens or --x-* derived from tokens */ </style>
</head><body>
<div class="screen">
  <div class="statusbar"><span>9:41</span><span class="sys"><span class="ms fill">signal_cellular_alt</span><span class="ms fill">wifi</span><span class="ms fill">battery_full</span></span></div>
  <div class="appbar"><div class="title">Tiêu đề</div><button class="icon-btn"><span class="ms">more_vert</span></button></div>
  <main class="content">
    <section data-when="default">…content…</section>
    <section data-when="loading">…skeletons in the same layout…</section>
    <section data-when="empty">…frame kept, one next action…</section>
  </main>
  <nav class="navbar">…</nav>
  <div class="gesturebar"></div>
</div></body></html>
```

- **No scripts in screens.** Every state must come from `data-when` + `?state=` (and `?theme=`, `?lang=`), because the live flow resolves states at build time and drops `<script>`. Repeated markup is generated by a small build script in the project (e.g. `src/gen.py`) that writes static HTML, never by runtime JS.
- Put screen CSS in `<style>` and link `../tokens.css`, `../kit.css` and an optional `../app.css` (app-level components); selectors on `html`, `body`, `:root` and `.no-ads`/`.has-ads` are mapped to the shadow host automatically, others are used as written.
- Full-bleed screens (splash, preview, media) add `overlay-bars` (and `on-dark` when the background is dark) to `.screen` so bars float over the image.
- `data-when="a b"` shows an element in states a or b; `data-when="!noad"` shows it in every state except `noad`. `?theme=dark` switches to the dark scheme; add dark captures as states (`home-dark`) for the screens that need them.
- Icons: Material Symbols Rounded ligatures (`<span class="ms">call</span>`, `.ms.fill` for selected). One style per app. Flags: round images (e.g. `https://flagcdn.com/w80/vn.png` clipped to a circle), never emoji.
- Ads (only when the user asked for them; the project is then created with `--ads`, which sets `html.has-ads`): use `.native-big`, `.native-ad` (with `.ad-tag`), `.banner-ad`, `.full-ad` exactly where [base-flow.md](base-flow.md) and the brief place them, marked `ad-only` so the no-ad layout (`.noad-only`) still works.

## Rules that keep a flow coherent

- **One structure, many skins.** All apps share the base flow and the component kit; an app's identity changes background, palette, illustration, iconography weight, type pairing, shape preset and copy. Never re-invent the language list or the onboarding anatomy per app.
- **Every screen answers one question** ([operate.md](operate.md)) and shows its primary action in the first screenful.
- **Consistency inside the app:** same app bar pattern, same card shape, same CTA style on every screen; a second CTA style needs a reason.
- **States are cards' thumbnails, not afterthoughts.** A screen card without its loading/empty/error/locked states is unfinished.
- **Banner-first Home (team Figma setup):** Home opens with a `.t-hero` banner + `.t-pager`, the way the team's Figma files do ([reference-patterns.md](reference-patterns.md) §3.2); skin it with the app's gradient, radius and core object, keep the anatomy.
- **Flow realism:** first-run paths (lần đầu) and returning paths are both drawn; dialogs and sheets are states of the screen they cover, not separate cards, unless they lead elsewhere.

## Flow review checklist (lessons from the first reviewed app)

Run it before handing over, or hand it with the rulebook to an independent reviewer agent that reads `flow.html`.

- **Previews show the whole object.** A scaled preview keeps the object's full aspect (a 360×800 screen is 9:20, not 9:16); never crop away the part the product is about (e.g. call buttons).
- **One source of truth for sample data.** People, items, counts and "who uses what" come from one table in the generator; every screen that repeats a fact reads it from there.
- **First-run states exist** for every screen a new user reaches: Home before anything is applied ("chưa áp dụng"), empty libraries, 0 permissions granted.
- **No dead ends.** Every screen has an outbound link (back target included); a paywall or permission screen returns to the screen that opened it.
- **Permissions:** required vs optional decided per job; asked in sequence with one enabled CTA naming the next step; system-settings permissions get a guide state; a denied path never leaves a disabled CTA as the only way out.
- **Paywall honesty:** CTA names the commitment for the selected plan, the price line states trial end date, renewal and how to cancel, close is visible at once, restore/terms/privacy are 48dp targets; success, error and restore-none states exist.
- **Text containers grow:** no fixed `height` with `line-height = height` on anything holding text; bottom actions sit in a bottom bar under a scrolling content area (`.content` + `.bottombar`), never absolutely over content.
- **Targets and contrast:** every tappable thing ≥48dp (pad small visuals with a 48dp hit area); icons that act ≥3:1 against their own button fill; inactive tracks/dots ≥3:1.
- **Style rules hold everywhere:** if the direction says no shadows/borders/glow or "accent only on data", check every component, including mock-ups inside onboarding and paywall heroes.
- **Copy:** one noun per concept across the app (e.g. Premium, not PRO + Premium), sentence case (no ALL-CAPS overlines, they break Vietnamese diacritics), currency through the locale format (399.000 ₫).
- **Ratings/feedback:** never pre-filled; the submit stays disabled until the user chooses.
- **Handoff sheets:** `build-flow.mjs <dir> --handoff` measures every screen in Chrome and writes `handoff/<screen>.md` + `handoff/index.md`: frame, team component per block (`data/compose-map.json`), spacing, text styles → `T{size}{weight}` tokens (flags line-height ≤ size), colours → token names (flags literals), repeated blocks → `aspectRatio` constants (flags ratios that vary), radii, touch targets under 48dp, ad slots. Run it when the flow goes to code; pair it with `scripts/handoff/team-theme.mjs` for the theme files ([house-style.md](house-style.md) §5).
- **Spacing on the 8/12/16/24 scale:** `build-flow.mjs` prints `spacing off the 8/12/16/24 scale in <file>` for every other padding/margin/gap value in shared CSS, screen CSS and inline styles; fix them by component type ([layout.md](layout.md) table) until the build is clean. Base-flow and paywall templates carry `data-spacing="template"` and keep their measured values.
- **Icon first:** count the words on each screen; any sentence that explains what an icon, an image or the layout already shows is cut, "Xem tất cả" is an arrow button, badges and secondary chips are icons with `aria-label` (see [craft-floor.md](craft-floor.md)). Text stays for titles, names, user content, the primary verb and form labels.
- **Vertical balance:** look at each shot as top / middle / bottom thirds; empty, error and success content is centred (`.content > .empty { flex:1; justify-content:center }`), the hero card is centred between its bars, grids and lists reach the bottom bar, sheet choices are equal tiles.
- **Skinning a template element:** a template screen's own `<style>` is scoped and placed after the shared CSS, so an app.css rule for the same element loses unless it is more specific (`.screen .icon.app-icon`), and it inherits the template's layout props (e.g. `align-items:center` collapses empty grid cells to 0 height; reset with `stretch`). Check the shot, not the code.
- **Icons: the team set is Lucide.** The team's Figma `System-Icon` component (Rolling Icon file `iI1PL2mCd7h0fBpdHShU7I`, page Design Common, frame 3001:25608, 1 514 icons named `Icon=<lucide-name>`) is Lucide at 24px / stroke 2. Pick names from that list, take the SVGs from `lucide-static` (same geometry; exporting one by one from Figma costs a call per icon), keep a Material→Lucide map with the Figma node ids, and render them as CSS masks with **inlined data-URI SVGs** (an external SVG used as a mask fails on file:// pages). Material Symbols stay only for the status bar and base-template glyphs.
- **Never reuse a template's class names in app.css** (`.hero`, `.icon`, `.name`, `.txt`, `.ind`, `.next`, `.swipe`, `.ld`, `.disc`, `.ph`): the template's scoped rules and the app's rules both apply, so an app banner `.hero::after { inset: 0 }` merged with the onboarding `.hero::after { bottom: 0; height: 100px }` paints a band across the top of every onboarding page. Name app components distinctly (`.bnr`); `build-flow.mjs` warns when app.css styles a class a template screen defines.
- **Icon glyphs, not names:** a rule like `.tabs span { font: … }` also hits the `.ms` span inside and prints "download" instead of the icon; style container children with `>` (`.tabs > span`). `kit.css` pins the icon font with `!important` as a guard, but check the shots for icon names shown as words.
