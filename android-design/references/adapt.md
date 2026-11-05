# Adapt

> **Additional context needed**: target device classes (phone, foldable, tablet, Chromebook), orientations,
> and usage contexts.

`adapt` makes an existing Android design work in a different context: another window size, posture,
orientation, input method, font scale, or an origin on another platform (an iOS design, a website). The trap is
treating adaptation as scaling. The job is rethinking the experience for the new context inside Material 3
([android-m3.md](android-m3.md)). It drives structure from window size classes, never from device model checks,
and never hides core functionality on smaller windows or locks orientation to dodge a layout bug.

## Assess the challenge

1. **Source context:** what did it assume? Phone portrait only, touch only, one column, 100% font scale, iOS
   idioms, a website?
2. **Target context:** window size class (width and height), posture (flat, tabletop, book), input (touch,
   keyboard, mouse, stylus), and usage (one-handed on a bus, two hands at a desk, propped on a table).
3. **What breaks:** navigation that does not fit, layouts that stretch instead of restructure, sheets that
   overflow a short window, controls that need a gesture the input cannot make, text that clips at 200%.

## Window size classes drive structure

```kotlin
val info = currentWindowAdaptiveInfo()          // material3-adaptive
val wsc = info.windowSizeClass
val expanded = wsc.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND)
val shortWindow = !wsc.isHeightAtLeastBreakpoint(WindowSizeClass.HEIGHT_DP_MEDIUM_LOWER_BOUND)
```

| Width class | dp | Typical | Structure |
|---|---|---|---|
| Compact | < 600 | phone portrait | one pane, navigation bar, 16dp margins |
| Medium | 600–839 | foldable open, small tablet portrait | navigation rail, one pane or list-detail, 24dp margins |
| Expanded | ≥ 840 | tablet landscape, desktop window | rail or drawer, two panes, 24dp margins |

Height matters too: compact height (< 480dp) is a phone in landscape. (`isWidthAtLeastBreakpoint` needs
androidx.window 1.4+; older code compares `windowWidthSizeClass`.) For a component that sits in different
containers, adapt to its own constraints with `BoxWithConstraints`, not the window.

## Strategies

### Navigation changes shape

Navigation bar on compact, navigation rail on medium and expanded, a permanent or modal drawer on expanded when
there are many destinations or labels matter. Let `NavigationSuiteScaffold` (material3-adaptive-navigation-suite)
switch for you, and override its `layoutType` where its default is wrong for the product; check what it picks
for phone landscape. Never ship a phone bottom bar untouched across a tablet.

### Phone → foldable and tablet: restructure, don't stretch

- **List-detail** with `NavigableListDetailPaneScaffold`: one pane on compact, both on expanded; Back moves from
  detail to list, then leaves. Selection is preserved across resize.
- **Supporting pane** with `SupportingPaneScaffold` for content plus context.
- Grids by `GridCells.Adaptive(minSize)` so columns follow width; reading text capped near 600–840dp.
- A full-screen dialog on compact becomes a centered dialog on expanded; sheets stay width-capped.
- Use the space for more context, not bigger elements: a 48dp row stretched across 1200dp is the failure mode.

### Foldable postures

The adaptive scaffolds avoid the hinge automatically. For custom layouts read the posture:

```kotlin
val posture = currentWindowAdaptiveInfo().windowPosture
if (posture.isTabletop) TabletopLayout() else FlatLayout()   // hinge bounds: posture.hingeList
```

- **Tabletop** (half-open, horizontal hinge): content (video, camera, a recipe) on the top half, controls on the
  bottom half.
- **Book** (half-open, vertical hinge): two panes split at the hinge; nothing important crosses it.
- Views or lower-level code: `WindowInfoTracker.getOrCreate(activity).windowLayoutInfo(activity)` and
  `FoldingFeature` (`state`, `orientation`, `isSeparating`).
- Folding and unfolding resize the running app: state, scroll position and selection survive (ViewModel,
  `rememberSaveable`).

### Landscape

Landscape restructures: side-by-side panes, rail instead of bar, media beside its controls; tall sheets and forms
scroll or split into two columns. Never clip or letterbox. Lock orientation only
when the task truly demands it (a camera viewfinder); apps targeting Android 16 on large screens (smallest width
≥ 600dp) have orientation and resizability locks ignored anyway, so design for every shape.

### Multi-window and large font

Split screen hands you a phone-width window on a tablet; desktop windowing and Chromebooks resize continuously.
Size-class layout handles both if you never read the physical display size. At font scale 200% (nonlinear on
Android 14+) rows grow and labels wrap: containers grow with text and button rows may stack
([typeset.md](typeset.md)).

### Keyboard, mouse and stylus (secondary inputs)

Touch stays primary; these must work, not dominate:

- **Keyboard:** Tab and arrow focus traversal reaches every control in visual order with a visible focus state
  (M3 components draw it; custom clickables need `Modifier.focusable()` and an indication). Enter activates,
  Esc closes dialogs and sheets. Common shortcuts (Ctrl+F search, Ctrl+N new, Ctrl+Enter send) through
  `Modifier.onPreviewKeyEvent`, listed in the system shortcuts helper via `Activity.onProvideKeyboardShortcuts`.
  The IME may be absent; never assume an on-screen keyboard for layout.
- **Mouse and trackpad:** scroll wheels scroll lazy lists already; right-click opens the same menu as long-press;
  drag and drop (`Modifier.dragAndDropSource/Target`) between panes and apps where it helps. Never put
  information only in a pointer state.

### Platform → Android

Translate idioms; never transplant them:

| iOS | Android |
|---|---|
| Tab bar | Navigation bar / rail / drawer |
| Edge-swipe back, back chevron | Predictive Back gesture and button, `TopAppBar` navigation icon |
| Switch, segmented control, wheel pickers | M3 `Switch`, `SegmentedButton`, M3 date and time pickers |
| Action sheet | `ModalBottomSheet` or M3 dialog |
| SF Symbols, SF Pro, Dynamic Type | Material Symbols, Roboto or the brand face, `sp` scaling |
| Semantic system colors, materials | M3 color roles, tonal elevation |
| Push and sheet transitions | Container transform, shared axis, fade through |

Carry the brand's expressive layer (palette intent, type accent, motion personality) through M3 theming.

**Web → Android:** reconform, don't reflow. Site navigation becomes the M3 navigation model; form controls
become M3 components; pointer-dependent affordances become touch-first ones with long-press and swipe; fixed type
becomes `sp`. Then hold the result to [android-m3.md](android-m3.md); its slop test is the acceptance bar.

## Implement

- Structure from size classes and posture, never `Build.MODEL` or screen-inch checks.
- Insets in every configuration: system bars, cutouts, the hinge, the IME, free-form caption bars
  (`WindowInsets.safeDrawing`).
- One information architecture across sizes; panes reveal more at once, they do not invent destinations.
- Preview with `@PreviewScreenSizes`, `@PreviewFontScale`, `@PreviewLightDark`; promote key states to
  screenshot tests.

**Avoid:** a stretched phone layout on a tablet; iOS controls or navigation ported onto Android; core
functionality hidden in small windows; orientation locks that dodge a layout bug; trusting emulators alone
(posture, gestures, refresh rate and performance need hardware).

## Verify

Batch the checks per [verify.md](verify.md): a compact phone portrait and landscape, a foldable folded, unfolded
and tabletop (or the resizable emulator), a tablet or `adb shell wm size 2560x1600` with `wm density 320`
(restore with `wm size reset` and `wm density reset`), split screen, font scale 2.0, dark theme, and a hardware
keyboard and mouse when Chromebooks or tablets are targets.

**Custom gesture controls** (sliders, swipe-to-dismiss rows, carousels in a vertical list, drawing surfaces) can
pass every layout check and still refuse to drag. For each in scope:

- **Primary gesture:** tap it, then drag it; the drag must complete, not just start.
- **Scroll across it:** a swipe along the list's scroll axis that crosses the control scrolls the list; a drag
  along the control's axis moves the control. Neither failure throws an error, so try both.
- **Back gesture:** an edge swipe still means Back, not a carousel page.
- **Evidence:** say what produced it: an emulator, `adb shell input swipe`, a Compose UI test, or a physical
  device. Screenshots verify layout, never a gesture. Name what stayed untested; unreachable hardware is a
  reported gap, not a blocker.

When the adaptation feels native in each context, hand off to `/android-design polish [target]`.
