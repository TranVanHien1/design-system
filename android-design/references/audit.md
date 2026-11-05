# Audit

`audit` runs systematic technical quality checks on a Compose screen, feature or whole app and writes a scored
report. Use it before a release, after a large change, or when a critique points at accessibility,
performance or theming. It is a code-level audit, not a design critique: it documents issues for other
commands to fix and changes no code. Score against [android-m3.md](android-m3.md) and its slop test, and the
registry in [tells.md](tells.md); read both first.

## Evidence

Audit from source first, then confirm on device. Useful scans:

```bash
rg -n 'Color\(0x|Color\.(Black|White|Gray|Red)' --type kotlin                 # raw colors
rg -n 'fontSize\s*=\s*[0-9.]+\.dp|\.dp\.toSp|TextUnit\(' --type kotlin          # type not in sp
rg -n 'Icon(Button)?\(' --type kotlin | rg 'contentDescription\s*=\s*null'    # unlabeled icons (check context)
rg -n 'clickable\s*\{|pointerInput' --type kotlin                              # custom touch handling
rg -n 'items\(|itemsIndexed\(' --type kotlin                                 # check each for key = / contentType =
rg -n 'enableEdgeToEdge|WindowInsets|imePadding|systemBarsPadding' --type kotlin
rg -n 'BackHandler|PredictiveBackHandler|enableOnBackInvokedCallback' -g '*.kt' -g '*.xml'
rg -n 'screenOrientation|configChanges' -g 'AndroidManifest.xml'
rg -n 'collectAsState\(\)' --type kotlin                                       # vs collectAsStateWithLifecycle
```

Then `./gradlew lint` (Compose and Material3 lint checks ship with the libraries), Compose compiler reports for
stability (see [optimize.md](optimize.md)), and device checks per [verify.md](verify.md): TalkBack on, font
scale 1.3 and 2.0, dark theme, Remove animations, landscape, a medium/expanded window, Force RTL. Measure
frame timing with `adb shell dumpsys gfxinfo <pkg> framestats` on a release build. Say whether evidence came
from an emulator or hardware; scroll jank and gesture feel need hardware.

## Diagnostic scan

First run the static check: `node <skill>/scripts/audit/compose-lint.mjs <module>` (fractional dp, spacing off the scale, colour / font-size literals, tappables under 48dp, `bounceClick` without semantics, unstable status-bar insets, hard-coded text, fixed boxes around text, `lineHeight = fontSize`). It detects the team house style and reports against it ([house-style.md](house-style.md)). Use its counts as evidence; the manual scan below covers what static checks cannot.

Score each dimension 0–4.

### 1. Accessibility (TalkBack)

- **Labels**: `Icon`/`IconButton` with `contentDescription = null` when it carries meaning; decorative images
  that are announced; custom controls with no `Role` (`Modifier.semantics { role = Role.Switch }`) or no
  state (`stateDescription`, `toggleable`/`selectable` instead of bare `clickable`).
- **Traversal**: rows read as fragments instead of one merged node (`semantics(mergeDescendants = true)`),
  illogical order (fix with `isTraversalGroup`/`traversalIndex`), headings not marked (`heading()`), dynamic
  results not announced (`liveRegion`), focus lost after navigation or dialog dismiss.
- **Text scaling**: type in dp or pixel-derived sizes instead of sp; fixed `height` on text containers;
  `maxLines = 1` on text that matters. Layouts that clip or overlap at font scale 1.3 and 2.0 (Android 14+
  scales nonlinearly up to 200%).
- **Touch targets**: under 48×48dp (custom `clickable` on a 24dp icon without
  `minimumInteractiveComponentSize()`), or adjacent targets with less than 8dp between them.
- **Remove animations ignored**: parallax, large slides or looping motion with no reduced path when
  `ANIMATOR_DURATION_SCALE` is 0.
- **Contrast**: text under 4.5:1 (3:1 for large text and UI glyphs) in light or dark, including disabled text
  that still carries information, text on images, and `onSurfaceVariant` on tinted containers.
- **Color-only meaning**: error, status or selection signalled only by hue.

0 TalkBack unusable · 1 major gaps (unlabeled controls, no scaling) · 2 labels exist, order or scaling breaks ·
3 minor gaps · 4 labeled, ordered, scales cleanly to 2.0, Remove animations honored.

### 2. Performance

- **Startup**: heavy work in `Application.onCreate` or before first frame, no baseline profile, splash screen
  hiding slow init.
- **Lazy lists**: `items` without stable `key` (state jumps, full re-layout on insert), no `contentType` for
  mixed rows, `LazyColumn` inside `verticalScroll`, `Column` + `forEach` over unbounded data.
- **Recomposition**: unstable parameters (`List`, `var` properties, classes from non-Compose modules) on hot
  composables, state read in composition that only drawing needs (`Modifier.offset(x)` from scroll state instead
  of `offset { }` or `graphicsLayer { }`), derived booleans recomputed every scroll frame without
  `derivedStateOf`, `collectAsState()` instead of `collectAsStateWithLifecycle()`.
- **Main-thread work**: disk or network on the main thread, sorting or formatting inside composables.
- **Images**: full-size bitmaps decoded for thumbnails, large PNGs via `painterResource`, no memory cache.
- **App weight**: no R8/minification on release, unused libraries, uncompressed assets.

0 janky everywhere · 1 major (unkeyed lists, slow launch) · 2 partial · 3 minor improvements possible ·
4 fast launch, smooth scroll on low-end hardware, lean.

### 3. Appearance & Theming

- **Hardcoded colors**: `Color(0x…)` or `Color.White/Black` in screens instead of `MaterialTheme.colorScheme`
  roles or extended tokens; text color set without its matching `on*` role.
- **Dark theme**: missing `darkColorScheme`, quick inverts, images or illustrations that glare in dark,
  `isSystemInDarkTheme()` ignored by custom tokens.
- **Dynamic color** (Android 12+): no static fallback, or brand-critical color lost to the wallpaper scheme.
- **Elevation**: arbitrary shadows instead of tonal elevation and the surface-container family.
- **Type scale**: literal `fontSize`/`fontWeight` instead of `MaterialTheme.typography` roles.
- **Shapes**: literal `RoundedCornerShape` values instead of `MaterialTheme.shapes`.

0 hardcoded everything · 1 minimal theming · 2 roles exist, inconsistently used · 3 a few literals ·
4 roles throughout, both themes first-class.

### 4. Platform Conformance (critical)

- **Back**: predictive back not enabled (`android:enableOnBackInvokedCallback`), `BackHandler` that traps the
  user or swallows Back without a visible reason, custom back arrows that diverge from system Back.
- **Insets / edge-to-edge**: content under the status bar, navigation bar, display cutout or IME; missing
  `enableEdgeToEdge()`; `Scaffold` `innerPadding` ignored; fields hidden by the keyboard.
- **Navigation**: iOS patterns on Android (top-left text "Back", segmented tab bars as global nav, action
  sheets), more than 5 NavigationBar destinations, phone navigation unchanged on tablets.
- **Controls**: hand-rolled buttons, switches, dialogs or toasts where M3 components exist; Toast for
  feedback that should be a snackbar; two FABs.
- **Icons**: mixed icon sets instead of Material Symbols; non-mirrored directional icons
  (`Icons.AutoMirrored`).
- **System drift**: repeated decorative patterns or shortcuts that conflict with the product, M3 or DESIGN.md.

0 web or iOS port · 1 3–4 kinds of violation · 2 1–2 noticeable · 3 subtle issues · 4 a fluent Android user
trusts every screen.

### 5. Adaptivity

- **Window sizes**: stretched phone layout at medium/expanded instead of `WindowSizeClass`-driven structure
  (rail, list-detail panes); decisions from device model or `Configuration.screenWidthDp` hacks.
- **Orientation**: landscape clipped or locked without reason; state lost on rotation.
- **IME**: inputs hidden behind the keyboard, no `imePadding()`, wrong `KeyboardOptions`.
- **Multi-window and foldables**: broken layout in split screen, hinge-unaware layouts, state lost on fold or
  unfold, tabletop posture ignored for media.
- **RTL**: `absolutePadding`, `AbsoluteAlignment`, left/right-hardcoded offsets, non-mirrored arrows; layout
  broken under Force RTL.

0 one size only · 1 landscape or tablet broken · 2 partial · 3 minor edge cases · 4 adapts across sizes,
orientations, windowing and direction.

## Report

Write it in chat and save it to `docs/design/audit/<slug>-<yyyy-mm-dd>.md` (slug as in
[critique.md](critique.md); frontmatter `target`, `date`, `commit`, `total_score`, `p0_count`, `p1_count`).

### Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | ? | |
| 2 | Performance | ? | |
| 3 | Appearance & Theming | ? | |
| 4 | Platform Conformance | ? | |
| 5 | Adaptivity | ? | |
| **Total** | | **??/20** | **[Rating band]** |

Bands: 18–20 Excellent (minor polish) · 14–17 Good · 10–13 Acceptable (significant work) · 6–9 Poor (major
overhaul) · 0–5 Critical.

### Platform Conformance Verdict
**Start here.** Pass/fail: does this read as a native Android app or a port? List the violations. Be brutally
honest.

### Executive Summary
Score and band; issue counts by P0–P3; top 3–5 issues; next steps.

### Detailed Findings by Severity
P0 Blocking (task impossible) · P1 Major (significant difficulty, M3 or accessibility violation; before
release) · P2 Minor (workaround exists) · P3 Polish. For each:

- **[P?] Issue name**
- **Location**: screen, file:line
- **Category**: Accessibility / Performance / Theming / Conformance / Adaptivity
- **Impact**: how it affects users
- **Guideline**: the M3 or Android accessibility rule it breaks
- **Recommendation**: the fix, in Compose terms
- **Suggested command**: `/android-design <command> <target>`

### Patterns & Systemic Issues
Recurring gaps, e.g. "`Color(0xFF…)` in 23 files; theme roles bypassed in every feature module" or "icon
buttons in all list rows are 32dp targets".

### Positive Findings
What works and should be kept.

## Recommended actions

Commands in priority order (P0 first), each with specific context:

1. **[P1] `/android-design harden checkout`**: card field loses input on process death.
2. **[P1] `/android-design adapt home`**: phone layout stretched at 840dp; needs rail + list-detail.

Only from: adapt, animate, audit, bolder, clarify, colorize, critique, delight, distill, document, extract,
harden, layout, onboard, optimize, overdrive, polish, quieter, shape, typeset. End with
`/android-design polish <target>` if any fix was recommended. Then tell the user:

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `/android-design audit <target>` after fixes to see your score improve.

Keep P3s few: a long tail buries what matters.

**Avoid**: issues without impact; generic recommendations; skipping positive findings; everything P0;
unverified false positives (a `contentDescription = null` on an icon next to a text label is correct).
