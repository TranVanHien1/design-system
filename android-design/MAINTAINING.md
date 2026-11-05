# Maintaining android-design

How this skill was derived and the rules every file in it follows. Read before editing any reference.

## Sources

| Upstream | License | What was taken |
|---|---|---|
| `pbakaus/impeccable` v4.8.0 (skill folder `.claude/skills/impeccable/`) | Apache 2.0 | Workflow, modes, command playbooks, craft floor, native audit/adapt, Android platform rules |
| `Leonxlnx/taste-skill` v2.1.5 (`skills/taste-skill/`) | MIT | Direction-dealing method, palette/type/app-style library, tells registry, app-screen findings |

Upstream files were rewritten, not copied: every web-only mechanism was removed and every rule restated for
native Android (Jetpack Compose + Material 3). See `NOTICE.md` for the attribution and change statement.

## Target

- **Stack:** Kotlin, Jetpack Compose, Material 3 (`androidx.compose.material3`). Android Views/XML get one line
  where the equivalent differs materially; Flutter/React Native are out of scope.
- **Surface:** phone first (compact width), with adaptive rules for medium/expanded (foldables, tablets).
- **Typical app architecture the user writes:** sealed `UiState` + feature ViewModel + reducer + repository, Hilt,
  coroutines/Flow. Screens are stateless composables fed by `UiState`; design states map to `UiState` variants.

## Precedence (the one rule that resolves conflicts)

1. The user's brief and pinned brand decisions.
2. **Material 3 governs structure, navigation, interaction and accessibility** (nav bar/rail/drawer, top app bar,
   FAB, sheets, dialogs, snackbars, predictive back, insets, 48dp targets, `sp` type).
3. Taste/Impeccable aesthetics govern **expression through M3 theming only**: color scheme, typography, shapes,
   motion specs, density, iconography, illustration, copy, and layout composition *inside* the content area.

Where an upstream rule contradicts M3 structure, M3 wins and the rule is restated for theming. Known collisions:
- Taste bans "a coloured pill on the active nav item" and "icons in tinted squares". On Android the M3
  `NavigationBar` indicator pill and tonal containers are the platform; keep them, tune their *color role* instead.
- Impeccable's "no system display face" ban: Roboto stays a legitimate body face on Android; the ban applies
  to using Roboto as the brand *display* voice when the world calls for character.
- Web "hero" / "first viewport" → "first screen above the fold at 412×915dp (compact)".

## Writing rules for references

- English. Imperative, dense, no filler. Keep upstream's voice and its best lines; cut what does not apply.
- **Delete** every mention of: the `impeccable` CLI/binary and its verbs (`context`, `detect`, `live`,
  `generate`, `concept-seed`, `serve-question`, `critique-storage`, `pin`, `hooks`, `doctor`), browser/DOM/CSS/
  HTML/Tailwind, viewport widths in px, hover, cursor, keyboard-only web focus rings, `.impeccable/` paths,
  design hook, image-comp pipeline, Persuade/Read/Experience modes (Android app screens are Operate; note an
  onboarding/paywall screen may lean Persuade in *composition* while staying M3 in structure).
- **Replace** with Android equivalents:
  - CSS tokens → `MaterialTheme.colorScheme.*`, `MaterialTheme.typography.*`, `MaterialTheme.shapes.*`,
    custom tokens via `CompositionLocal` / an `ExtendedColors` data class.
  - px/rem → dp/sp. Breakpoints → `WindowSizeClass` (compact <600dp, medium 600–839dp, expanded ≥840dp).
  - hover/focus → pressed/focused/dragged state layers, ripple, `Modifier.semantics`, TalkBack, switch access.
  - `prefers-reduced-motion` → Settings › Remove animations (`Settings.Global.ANIMATOR_DURATION_SCALE == 0`).
  - `transition`/`@keyframes` → `animate*AsState`, `AnimatedVisibility`, `AnimatedContent`, `updateTransition`,
    shared element transitions, `MotionScheme`/M3 easing & duration tokens.
  - Screenshot verification → `references/verify.md` (adb screencap / Compose screenshot tests).
  - Critique/audit storage → plain markdown files in `docs/design/` of the project.
- Cross-link with relative links, e.g. `[verify.md](verify.md)`. Scripts are referenced as
  `node <skill>/scripts/<name>.mjs`, where `<skill>` is this skill's directory.
- Code samples are Compose/Kotlin, short, and correct for Compose BOM 2025+ / Material3 1.3+.
- Each command reference starts with one paragraph: what it does, when to use it, what it must not do.
- Target length per command reference: 400–1200 words. Shorter beats padded.

## File map (keep links consistent)

`SKILL.md` — router, principles, command table.
`references/`:
- Setup/platform: `context.md` (project discovery that replaced the engine), `android-m3.md` (platform rules),
  `craft-floor.md` (quality floor + bans, read before any UI edit), `tells.md` (Android slop registry),
  `operate.md` (app-screen composition: lists, cards, KPIs, charts, forms, settings, states on a phone),
  `verify.md` (look-and-fix loop on device / screenshot tests).
- Build: `init.md`, `shape.md`, `new-work.md` (direction round with `deal.mjs`, theme via `theme.mjs`),
  `document.md`, `extract.md`.
- Evaluate: `critique.md`, `audit.md`.
- Refine: `polish.md`, `bolder.md`, `quieter.md`, `distill.md`, `harden.md`, `onboard.md`.
- Enhance: `animate.md`, `colorize.md`, `typeset.md`, `layout.md`, `delight.md`, `overdrive.md`.
- Fix: `clarify.md`, `adapt.md`, `optimize.md`.
`references/base-flow.md`, `html-flow.md`, `figma.md`, `reference-patterns.md` (Figma study of the team's apps, 2026-11-04).
`assets/flow/` — `kit.css` (360×800 frame + M3 components + ad slots), `state.js` (?state= / ?theme=), `flow-template.html` (the team's flow map viewer, picture mode, `__FLOW_JSON__`/`__TITLE__`/`__APP__`), `flow-template-live.html` (same viewer mounting `<template id="v-…">` views in shadow roots; adds `__HEAD_LINKS__`/`__VIEWS__`), `base/` (fixed base screens with `{{APP}}`, `{{APP_INITIAL}}`, `{{LANG}}`, `{{HTML_ATTR}}`).
`scripts/flow/new-flow.mjs`, `scripts/flow/build-flow.mjs` (live HTML by default: resolves data-when per state, strips scripts, scopes document selectors to :host; Chrome over CDP only for --shots/--images, JPEG 480×1066).
`data/topic-worlds.json` — the team's shipped visual worlds (anti-monotony input).
`scripts/deal.mjs` — deals three directions (style + palette + type + shape) for a brief.
`scripts/theme.mjs` — turns a chosen direction or seed colors into Compose theme files (Color/Type/Shape/Theme.kt).
`data/` — trimmed Taste library (palettes, type, app styles, app patterns) used by the scripts.

Also: `NOTICE.md` (attribution), `licenses/`, `scripts/lib/common.mjs`, `scripts/vendor/material-color-utilities/`
(npm 0.4.0, compiled JS only; 10 extensionless imports patched to `.js`), `scripts/maintain/build-data.mjs`.

## Rebuilding data

```bash
curl -sSL https://fonts.google.com/metadata/fonts -o gf.json
for p in 1 2 3; do curl -sS "https://api.fontshare.com/v2/fonts?limit=100&page=$p" -o fs$p.json; done
node -e 'const a=[1,2,3].flatMap(p=>require(`./fs${p}.json`).fonts||[]);require("fs").writeFileSync("fs.json",JSON.stringify(a.map(f=>({slug:f.slug,vi:(f.languages||"").includes("Vietnamese"),license:f.license_type}))))'
node scripts/maintain/build-data.mjs --taste <taste-skill>/skills/taste-skill --gf gf.json --fs fs.json --out data
```

Android styles, kinds, keywords, patterns and the M3 mapping of Taste's styles are authored inside
`build-data.mjs`; edit them there, never in `data/` by hand.

## Verified

- 2026-11-04: themes generated by `theme.mjs` in three modes (bundled Fontshare face; downloadable Google
  face + true-black + mono figures; seed colour) compiled with AGP 8.12.3, Kotlin 2.2.20, Compose BOM
  2025.09.00, compileSdk 36. Kotlin samples inside references were not compiled; APIs newer than
  material3 1.3 are marked with their version and a fallback.

## Deliberate departures from upstream (for future merges)

- No detector/engine: critique is a single native review (source + screenshots); its report frontmatter
  records `commit` and `sources`, and polish closes the backlog itself.
- DESIGN.md mirrors the theme code in an existing project (code is the source of truth); dark values are
  `-dark` sibling keys. No `.impeccable/design.json` sidecar.
- Taste's desktop measurements are dropped; "every block visible on the first screen" is re-derived as
  ≈700dp of content at 412×915dp (about four blocks).
- M3 floating labels, Switch colours, NavigationBar indicator pill and tonal containers stay (Taste bans
  softened per the precedence rule); settings group headers use `primary` or `onSurfaceVariant`, one choice
  app-wide.
- Violet/indigo accent ban kept with "unless the brand owns it"; shimmer softened to a warning.
- Overshoot motion allowed only through an `expressive` spec recorded in DESIGN.md.
- Fact to re-check when Android Studio's template changes: its `Purple40` is `#6650a4` (baseline `#6750A4`).

## Project files the skill reads and writes

- `PRODUCT.md` (product truth: users, jobs, brand, platform `android`), `DESIGN.md` (durable visual decisions:
  color roles, type scale, shapes, motion, components) at the project root or the app module root.
- `docs/design/critique/<target>-<yyyy-mm-dd>.md`, `docs/design/audit/<…>.md` — reports.
- `docs/design/shots/<run>/` — screenshots from verify.
