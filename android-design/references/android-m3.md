# Android platform rules (Material 3, Jetpack Compose)

Material 3 governs structure, navigation, interaction and accessibility on every screen. Brand expresses itself through M3 theming: color scheme, type scale, shapes, motion, iconography, illustration and copy. Read this before designing any screen; [craft-floor.md](craft-floor.md) holds the quality floor and [tells.md](tells.md) the template tells.

## The Android slop test

Would a fluent Android user trust this app, or trip on off-spec components? The most common tell is an iOS app wearing Android's skin: a bottom bar copied from iPhone, a back chevron that ignores system Back, Cupertino switches and alert sheets. The second is the Android Studio template shipped as a product: the baseline purple scheme, Roboto everywhere, a column of identical `Card`s. Material 3 is the rulebook; the product's identity lives inside it.

## Navigation and structure

| Need | Compact (<600dp) | Medium (600–839dp) | Expanded (≥840dp) |
|---|---|---|---|
| 3–5 top-level destinations | `NavigationBar` | `NavigationRail` | `NavigationRail` or `PermanentNavigationDrawer` |
| 6+ destinations / account switching | `ModalNavigationDrawer` | `ModalNavigationDrawer` | `PermanentNavigationDrawer` |
| List → detail | push detail screen | `ListDetailPaneScaffold` | `ListDetailPaneScaffold` (two panes) |

- `NavigationSuiteScaffold` (material3-adaptive-navigation-suite) switches bar/rail/drawer from the window size class; prefer it over hand-rolled `if` chains.
- **Top app bar gives screen context.** `CenterAlignedTopAppBar` for top-level screens with a short title, `TopAppBar` for detail, `MediumTopAppBar`/`LargeTopAppBar` with `exitUntilCollapsedScrollBehavior` when the title is the screen's identity. Up arrow on every non-root screen.
- **One FAB, one primary action**, only when a screen has a single dominant creation action. `ExtendedFloatingActionButton` when the label helps; collapse to icon on scroll. Never stack FABs or spend one on a secondary task.
- **System Back always works.** Set `android:enableOnBackInvokedCallback="true"`; use `BackHandler` only to close in-screen state (a sheet, search, selection mode), and `PredictiveBackHandler` when the screen animates its own back preview. Never trap the user or swallow Back to show an ad or a rating prompt.
- **Edge-to-edge is the default** (enforced from targetSdk 35). Call `enableEdgeToEdge()` before `setContent`, let `Scaffold` pass `innerPadding` to content, use `contentWindowInsets`, `Modifier.windowInsetsPadding(WindowInsets.safeDrawing)`, `imePadding()` on forms, and `WindowInsets.displayCutout` for full-bleed media. Lists draw under the navigation bar with `contentPadding`, never with a bottom margin that leaves a dead strip.

## Components (use these; do not invent equivalents)

| Job | Material 3 composable | Notes |
|---|---|---|
| Primary / secondary / low-emphasis action | `Button`, `FilledTonalButton`, `OutlinedButton`, `TextButton` | One filled button per area. Labels name the action ("Lưu ảnh", not "OK"). |
| Icon action | `IconButton`, `FilledIconButton`, `FilledTonalIconButton` | `contentDescription` always. |
| Choice / filter / input / suggestion | `FilterChip`, `InputChip`, `AssistChip`, `SuggestionChip` | Chips scroll in a `LazyRow`; never wrap into 4 lines. |
| 2–5 exclusive options | `SingleChoiceSegmentedButtonRow` | Not tabs: segmented buttons change a view's filter, tabs change the content set. |
| Content sections | `PrimaryTabRow` / `SecondaryTabRow` + `HorizontalPager` | Max ~4 fixed tabs on compact; scrollable tabs beyond. |
| Binary setting | `Switch` (in a `ListItem` with `Modifier.toggleable` on the row) | The whole row toggles. |
| List row | `ListItem` | headline / supporting / overline / leading / trailing slots; 56, 72, 88dp heights. |
| Transient feedback | `Snackbar` via `SnackbarHostState` | Actionable ("Hoàn tác") when useful. Never `Toast` for in-app feedback. |
| Decision that must interrupt | `AlertDialog` | Title as a question, buttons name outcomes. Confirm only destructive or irreversible actions. |
| Contextual tools / pickers | `ModalBottomSheet` | Drag handle on; `skipPartiallyExpanded` for short forms. |
| Search | `SearchBar` / `DockedSearchBar` | Expanded search shows recent queries and suggestions. |
| Progress | `LinearProgressIndicator`, `CircularProgressIndicator` | Determinate when the fraction is known. Skeletons for layout-shaped loading (see [operate.md](operate.md)). |
| Date / time | `DatePicker`, `DateRangePicker`, `TimePicker` in dialogs or sheets | Locale-aware formatting. |
| Pull to refresh | `PullToRefreshBox` | Only where data can change remotely. |
| Badges | `BadgedBox` + `Badge` | Counts ≤ 99+, dot for "new". |

## Touch targets

- **48×48dp minimum** for every interactive element, with ≥8dp between targets. M3 components enforce it through `minimumInteractiveComponentSize()`; custom clickables must add it (or `Modifier.sizeIn(minWidth = 48.dp, minHeight = 48.dp)`).
- Make whole rows clickable, not just their trailing icon. Use `Modifier.clickable(role = Role.Button, onClickLabel = …)` so TalkBack announces the action.

## Typography

- **Only the M3 type roles** (display/headline/title/body/label × large/medium/small). Map text to roles; never hand-pick `fontSize` per screen. Changing a role in `Typography` is a design decision recorded in DESIGN.md.
- **`sp` for text, always.** Text must survive font scale 2.0 (Android 14 scales nonlinearly above 1.3): no fixed-height containers around text, no `maxLines = 1` on content that matters without an ellipsis and a way to read the rest.
- Roboto is the system face and a fine text face. A brand face enters through `Typography` (display/headline/title roles), bundled in `res/font` or via downloadable Google Fonts. Check Vietnamese diacritics coverage before choosing (see [typeset.md](typeset.md)).
- Numbers that line up (prices, times, counts in lists) use tabular figures: `TextStyle(fontFeatureSettings = "tnum")`.

## Color and theming

- **Color roles only** in UI code: `MaterialTheme.colorScheme.primary`, `onSurfaceVariant`, `surfaceContainerLow`, … Raw `Color(0xFF…)` in a composable is a bug: it breaks dark theme, contrast levels and dynamic color.
- **Surfaces step by tone, not shadow.** `surface` for the screen; `surfaceContainerLowest…Highest` for grouped content, sheets, cards and bars. Cards default to 0dp shadow elevation; elevation shadows are for things that float (FAB, menus, dragged items).
- **Dark theme is a first-class scheme**, designed and verified, never an inversion. **High-contrast schemes** (Android 14+ contrast setting) ship too; `scripts/theme.mjs` generates all six.
- **Dynamic color (Material You)** is a user-facing option with the branded scheme as default for a branded product; utilities that want to blend with the system may default to it. Always keep a static fallback for Android < 12.
- Semantic colors M3 lacks (success, warning, data hue) go in an `ExtendedColors` `CompositionLocal` with light/dark/contrast variants, generated by `theme.mjs`. Never hardcode a green.
- State layers (pressed 10%, focused 10%, dragged 16%, hover 8%) and ripple come from M3; custom clickables use `indication = ripple()` so they match.

## Motion

- Use M3 motion patterns: **container transform** (card → detail, `SharedTransitionLayout` + `sharedBounds`), **shared axis** (steps in a flow, tabs: slide + fade on one axis), **fade through** (unrelated destinations, bottom-nav switches), **fade** (enter/exit inside a screen).
- Durations and easing from M3 tokens (`MotionScheme` on material3 1.4+, or `tween(durationMillis = 300, easing = EmphasizedDecelerate…)` equivalents) or springs; never ad-hoc 1000ms tweens. Details in [animate.md](animate.md).
- **Honor Remove animations** (`Settings.Global.ANIMATOR_DURATION_SCALE == 0f`): Compose's animation APIs already scale to zero; custom `withFrameNanos` loops, Lottie and AGSL must check it and show the end state.
- Predictive back: system animations for activities/back-to-home come free with the manifest flag; Navigation Compose 2.8+ animates in-app pops; custom screens use `PredictiveBackHandler` progress.

## Icons, launcher and system surfaces

- One icon family and one style (Material Symbols Outlined *or* Rounded *or* Sharp, one weight), imported as vector drawables; filled variant for the selected nav item only. Never emoji or Unicode glyphs as icons.
- Adaptive launcher icon with a **monochrome layer** (themed icons on Android 13+). Notification small icon is a white silhouette. Splash screen via `androidx.core:core-splashscreen` with the icon and `windowSplashScreenBackground` from the theme, no extra splash activity.
- Status bar and navigation bar icons must contrast with what sits under them: `enableEdgeToEdge(SystemBarStyle.auto(…))` or explicit light/dark styles per screen (media viewers use dark).

## Accessibility (TalkBack, switch access, scaling)

- Every icon-only control has a `contentDescription` that names the action; decorative images pass `null`.
- Group related text into one focus stop: `Modifier.semantics(mergeDescendants = true) {}` on list rows; mark section titles with `semantics { heading() }`.
- Custom controls expose `role`, `stateDescription`, and `toggleableState`; changing values announce through `liveRegion = LiveRegionMode.Polite`.
- Never carry meaning by color alone: a sign, an icon or a word goes with every status color.
- Test with TalkBack on, font scale 2.0, display size largest, and high contrast (see [verify.md](verify.md)).

## Adaptive and large screens

Window size classes from `currentWindowAdaptiveInfo().windowSizeClass`. Compact designs stretch badly: on medium/expanded use rails, two panes, max content widths (~600–840dp for reading/forms) and grids that add columns. Foldables: avoid placing controls across the hinge (`WindowInfoTracker` folding features). Full rules in [adapt.md](adapt.md).

## Verifying the build

Screenshots come from an emulator/device or from Compose screenshot tests, never from a browser or a mental render. Capture light and dark, font scale 1.3 and 2.0, and every device class the app ships to; say which source produced the evidence. Procedure in [verify.md](verify.md).
