---
name: android-design
description: "Design, redesign, critique, audit and polish native Android app UI (Jetpack Compose + Material 3), delivered as an HTML screen-flow map (flow.html), editable Figma frames, or Compose code: whole apps from a document or a reverse-engineered competitor, feature groups, single screens or nodes, with the team's fixed base flow (splash → language → 4 onboarding pages), an app's visual identity (color scheme, fonts, shapes, motion), a generated Compose theme (Color/Type/Shape/Theme.kt with light/dark/high-contrast schemes), UX review with scoring, technical UI audit (accessibility, insets, font scale, dark theme, recomposition), and targeted refinements (layout, typography, color, animation, copy, onboarding, empty/error states, adaptive layouts). Use when the user asks to design or improve an Android app's UI or look — \"thiết kế UI app android\", \"làm đẹp màn hình\", \"chọn màu/font cho app\", \"tạo theme compose\", \"review/critique giao diện\", \"audit UI\", \"màn hình này nhìn generic quá\", \"dựng flow html\", \"thiết kế app theo document\", \"vẽ lên figma\" — or invokes /android-design. Not for web UI, backend work, or device QA runs (android-adb-qa)."
argument-hint: "[flow · figma · init · shape · document · extract · critique · audit · polish · bolder · quieter · distill · harden · onboard · animate · colorize · typeset · layout · delight · overdrive · clarify · adapt · optimize · theme] [target]"
---

# Android design

Design native Android UI that a fluent Android user trusts and that does not look like the template. Work as a senior product designer who ships Compose code: production-grade, with a clear point of view, grounded in what the product's users need.

Derived from Impeccable (Apache 2.0) and Taste Skill (MIT), rewritten for Android; see `NOTICE.md`. Maintenance rules: `MAINTAINING.md`.

Core principles:
- **Finish the job.** The deliverable is complete except assets only the user can provide; list those.
- **Material 3 is the structure, the brand is the theming.** M3 governs navigation, components, interaction and accessibility; identity lives in color roles, type, shapes, motion, iconography, illustration, copy and in-content composition. When anything here conflicts with M3 structure, M3 wins ([android-m3.md](references/android-m3.md)).
- **Decide, don't default.** The category default (template purple, a column of identical cards, a gradient hero) is what every generated app looks like. New worlds come from a dealt direction round, not from habit ([new-work.md](references/new-work.md)).
- **Look at it.** Verify on a device or with screenshot tests in light, dark, font scale 2.0, Vietnamese and every `UiState`; batch the looks ([verify.md](references/verify.md)).
- Write reports and conversation in the user's language; keep code, identifiers and commands as they are. UI copy follows the app's locales.

## Deliverables

- **HTML flow (default before Figma):** every screen as an HTML page in a 360×800dp frame, assembled into one pannable `flow.html` in the project that embeds the screens as live HTML for agent review, rebuilt after every batch ([html-flow.md](references/html-flow.md)). Start with `node <skill>/scripts/flow/new-flow.mjs`.
- **Figma:** editable frames built from the HTML screens or a document, at the scope asked (whole app, feature group, feature, single node) ([figma.md](references/figma.md)). Only when the user has a Figma file.
- **Compose code:** theme files from `theme.mjs` and screens per the playbooks below.

Every app keeps the fixed base flow — Splash → Language → Onboarding ×4 — and changes only its skin ([base-flow.md](references/base-flow.md)); team screens are built from the team's measured components ([components.md](references/components.md), `assets/flow/team.css`, frames 412×917 / 375×812); [reference-patterns.md](references/reference-patterns.md) and `data/topic-worlds.json` hold the team's shipped worlds so a new app does not repeat them. Ads are off unless the user asks for them.

## Where the design effort goes (team priority)

- **Functional screens from Home onward get the real design work**: Home, browse/detail/preview, the core action and its result, create/edit, library, settings, and every state of them. This is where directions, components, flows and reviews are spent.
- **Base flow (splash, language, onboarding) is template work.** Keep `assets/flow/base/` as is and deliver only: the **app icon** shown on the splash, **4 onboarding illustrations** (one per page: the app's own screens or core object in context, with an image prompt each), and the **onboarding title + subtitle copy** for the 4 pages. Do not restyle the language list, splash layout or onboarding anatomy.
- **Secondary screens such as the paywall are skipped for now** (no design, no flow cards) unless the user asks; when a flow needs them for a link, use the untouched `assets/flow/common/` template or a labelled placeholder card.

## Setup (once per session)

1. Run the discovery in [references/context.md](references/context.md) and keep its note: modules, Compose/Material versions, theme files, design system, architecture, locales, PRODUCT.md/DESIGN.md, devices.
2. Read [references/android-m3.md](references/android-m3.md).
3. Load the playbook for the request: its command reference below, or [references/new-work.md](references/new-work.md) for a new screen, new app or replacement look.
4. Immediately before any UI code edit (not for planning), read [references/craft-floor.md](references/craft-floor.md). Keep [references/tells.md](references/tells.md) in mind for every review.

If a setup step cannot run (no Gradle project yet, no device), say so in one line and continue; missing context never blocks the work.

## How to design

- **The brief wins.** Honor pinned colors, fonts, moods and references even when they trip a tell. Redirecting a clear brief toward your taste is failure.
- **Refinement preserves; redesign replaces.** Refinement keeps the incumbent identity, behaviour, copy and everything outside scope. Redesign keeps product truth, content, function, navigation model and platform affordances, but treats the old look as evidence, runs the direction round and replaces DESIGN.md. Never split the difference into polish on a discarded look.
- **App screens are Operate surfaces:** the user's success is completing a task. Scanability, consistency and platform expectations outrank expression; brand lives in precise details and one signature element ([operate.md](references/operate.md)). Onboarding and paywall screens may lean persuasive in composition while staying M3 in structure.
- **Spacing 8 · 12 · 16 · 24 dp only**, picked by component type (8 inside chips/buttons and badge insets, 12 between sibling tiles and buttons, 16 screen margin and card/row padding, 24 dialog/sheet/empty-block insets and between groups); `build-flow.mjs` flags anything else ([layout.md](references/layout.md)).
- **Icon first, vertically balanced.** Words only where an icon cannot say it (titles, names, user content, the primary verb, form labels); everything else is a Material Symbol with a content description. Each screen balances top to bottom: short content centred, the hero centred between its bars, lists reaching the bottom bar ([craft-floor.md](references/craft-floor.md)).
- **States are design.** Every screen maps to a sealed `UiState`; Loading, Empty, Error, Offline and partial data are designed, previewed and verified like the happy path.
- **Code-level identity.** Color roles and type roles only; no `Color(0xFF…)` or ad-hoc `fontSize` in composables. New tokens enter through the theme and DESIGN.md.
- **Truth binds claims.** Sample data is labelled as sample; no invented prices, ratings, download counts or capabilities.
- **Loaded symbols stay out of decoration.** A subject's world does not license emblems tied to militarism, supremacy or hate movements as motifs; use that world's neutral forms.

## Commands

Invoke as `/android-design <command> [target]` (target: a screen, file, feature or flow).

| Command | Category | What it does | Reference |
|---|---|---|---|
| `flow [app/feature/doc]` | Build | Design an app or feature as an HTML screen-flow map | [html-flow.md](references/html-flow.md) |
| `figma [scope]` | Build | Build the design as editable Figma frames | [figma.md](references/figma.md) |
| `init` | Build | Capture product truth in PRODUCT.md | [init.md](references/init.md) |
| `shape [screen]` | Build | Plan UX/UI and write a screen brief before code | [shape.md](references/shape.md) |
| `theme` | Build | Deal directions and generate the Compose theme (direction round §4–5) | [new-work.md](references/new-work.md) |
| `document` | Build | Write DESIGN.md from existing theme and screens | [document.md](references/document.md) |
| `extract [target]` | Build | Pull hardcoded values and repeated UI into theme + shared components | [extract.md](references/extract.md) |
| `critique [target]` | Evaluate | UX design review with heuristic scoring and personas | [critique.md](references/critique.md) |
| `audit [target]` | Evaluate | Technical UI quality: a11y, insets, scaling, theming, performance | [audit.md](references/audit.md) |
| `polish [target]` | Refine | Final pass before shipping | [polish.md](references/polish.md) |
| `bolder [target]` | Refine | Amplify a safe or bland screen | [bolder.md](references/bolder.md) |
| `quieter [target]` | Refine | Tone down a loud or overstimulating screen | [quieter.md](references/quieter.md) |
| `distill [target]` | Refine | Strip to the essential job | [distill.md](references/distill.md) |
| `harden [target]` | Refine | Errors, i18n, edge cases, lifecycle, permissions | [harden.md](references/harden.md) |
| `onboard [target]` | Refine | First-run, empty states, permission asks, paywall | [onboard.md](references/onboard.md) |
| `animate [target]` | Enhance | Purposeful M3 motion | [animate.md](references/animate.md) |
| `colorize [target]` | Enhance | Strategic color through roles | [colorize.md](references/colorize.md) |
| `typeset [target]` | Enhance | Type roles, brand face, Vietnamese coverage | [typeset.md](references/typeset.md) |
| `layout [target]` | Enhance | Spacing, rhythm, hierarchy | [layout.md](references/layout.md) |
| `delight [target]` | Enhance | Personality: haptics, illustration, small moments | [delight.md](references/delight.md) |
| `overdrive [target]` | Enhance | Push past convention (shaders, shared transitions) | [overdrive.md](references/overdrive.md) |
| `clarify [target]` | Fix | UX copy, labels, errors (Vietnamese-aware) | [clarify.md](references/clarify.md) |
| `adapt [target]` | Fix | Window size classes, foldables, tablets, landscape | [adapt.md](references/adapt.md) |
| `optimize [target]` | Fix | Compose UI performance | [optimize.md](references/optimize.md) |

Routing:
- **No argument:** after setup, offer the 3–4 commands that fit the project's state (no PRODUCT.md → `init`; template theme → `theme`; existing screens and no recent critique → `critique`/`audit`; a fresh critique → `polish` or the commands it recommended). Never auto-run one.
- **Explicit or clearly implied command:** load its reference and follow it. Ask once if two commands fit.
- **Otherwise:** treat it as general design work: a new screen or look goes through [new-work.md](references/new-work.md); a narrow refinement proceeds on the incumbent code, offering `init` afterwards rather than blocking on it.

## Bundled tools

Paths are relative to this skill's directory (`<skill>`); run them from the user's project root. They need Node 18+ and nothing else (no network, no install).

- `node <skill>/scripts/deal.mjs --brief "<brief>" [--kind id] [--brand "#hex"] [--theme light|dark] [--reroll N] [--any-script] [--json]` deals three directions (style + palette + type pair + shape + motion, with the M3 translation). `--list kinds|styles` lists the library.
- `node <skill>/scripts/theme.mjs --direction "<style>+<palette>+<type>" | --seed "#hex" --package <pkg> --out <dir> [--brand "#hex"] [--fonts bundled|downloadable] [--name AppTheme] [--r-package <ns>] [--dry-run] [--force]` writes Color.kt, Theme.kt (light/dark × standard/medium/high contrast, ExtendedColors, opt-in dynamic color), Type.kt and Shape.kt, then prints key colours, WCAG checks and the font files to add. Uses Google's material-color-utilities (vendored).
- `node <skill>/scripts/flow/new-flow.mjs --app "<Name>" --out <dir> --direction "<id>" [--dark-first] [--ads]` starts an HTML flow project (kit, tokens.css, base screens, flow.json); `node <skill>/scripts/flow/build-flow.mjs <dir> [--shots] [--only ids] [--images]` writes the project's `flow.html` with every screen/state embedded as live HTML (agent-readable; rebuild after each batch, append flows by extending `flow.json`); `--shots` also renders JPEGs for a visual check, `--images` makes a picture-only file to send outside. `theme.mjs … --css tokens.css` emits the same tokens as CSS variables.
- `data/` holds the library the scripts read: 10 app styles (7 from Taste's study of real product screens, 3 Android-specific), 56 palettes, 55 type pairs flagged for Vietnamese coverage, 23 product kinds with English and Vietnamese keywords, 33 phone patterns.

## Project files

- `PRODUCT.md` (product truth) and `DESIGN.md` (visual decisions) at the repo or app-module root.
- `docs/design/critique/`, `docs/design/audit/` for reports; `docs/design/shots/<run>/` for verification captures.
- Related skills: `android-adb-qa` (device runs; its `devstate.sh` and `ui.py` are reused by verify), `android-unit-test` (UiState/reducer tests for designed states).
