# Animate

> **Additional context needed**: target devices (low-end phones?) and any performance budget.

`animate` adds motion that explains state, relationship and hierarchy, or one authored moment the screen has
earned. Use it when transitions are abrupt, feedback is missing, or navigation loses the user's place. It uses
Material motion and Compose animation APIs, honors Remove animations, and never stages page-load choreography
the user must wait through. Decoration without purpose is animation debt.

On Operate screens motion serves feedback, state and continuity: fast, interruptible, never blocking. A single
onboarding or completion moment may carry the brand's voice.

## Find the job

Inspect existing transitions, `NavHost` specs, `animate*` calls and the motion section of DESIGN.md. Animate
only where motion would:

- acknowledge an action;
- make a state change or spatial relationship legible (where did this come from, where did it go);
- preserve continuity through navigation or layout change;
- direct attention at a meaningful moment;
- embody the chosen world.

Four questions per candidate:

1. **How often is it seen?** Once per session: may take its time. Many times: fast and small. Hundreds of times
   (typing, scrolling a list, toggling): no animation beyond the component's own.
2. **What is it for?** "It looks nice" is valid only for the one authored moment.
3. **Which motion?** Entering: decelerate. Moving on screen: emphasized/standard. Leaving for good: accelerate,
   shorter. Color and opacity: effects specs, never bounce.
4. **How long?** See the table below. Exits run at about 70% of the matching entrance.

## Set the motion thesis

- **Focal moment:** the one sequence that deserves authorship, if any, and why it belongs to this product.
- **Continuity:** which navigation and layout changes need explaining, and with which pattern.
- **Feedback:** which controls need acknowledgment beyond M3's ripple and state layers.
- **Budget:** which effects are expensive and how often they run.

One authored moment per app area. A generic fade-and-rise on every item, a staggered entrance on every
screen, or a pulsing badge is not a thesis.

## Tokens: MotionScheme, easing, duration

**material3 1.4+ (expressive):** set a `MotionScheme` and read specs from the theme. Some entry points are
marked `@ExperimentalMaterial3ExpressiveApi`.

```kotlin
MaterialTheme(colorScheme = scheme, motionScheme = MotionScheme.standard()) { … }  // or .expressive()
val offset by animateDpAsState(target, MaterialTheme.motionScheme.defaultSpatialSpec())
val alpha by animateFloatAsState(target, MaterialTheme.motionScheme.fastEffectsSpec())
```

Spatial specs (position, size, scale, rotation) may overshoot under `expressive`; effects specs (color, alpha)
never do. `expressive` is a brand choice recorded in DESIGN.md; `standard` is right for most utility apps.

**material3 1.3 fallback:** define the same tokens yourself in `ui/theme/Motion.kt`:

```kotlin
object Motion {
    val Emphasized = CubicBezierEasing(0.2f, 0f, 0f, 1f)
    val EmphasizedDecelerate = CubicBezierEasing(0.05f, 0.7f, 0.1f, 1f)
    val EmphasizedAccelerate = CubicBezierEasing(0.3f, 0f, 0.8f, 0.15f)
    fun <T> spatial() = spring<T>(dampingRatio = 0.9f, stiffness = 700f)   // standard default spatial
    fun <T> spatialFast() = spring<T>(dampingRatio = 0.9f, stiffness = 1400f)
    fun <T> effects() = spring<T>(dampingRatio = 1f, stiffness = 1600f)
}
```

Prefer springs for anything the user can interrupt (they retarget with velocity); use `tween` with the
easings for fixed choreography.

| Duration (M3 token) | Use |
|---|---|
| 50–150ms (short1–3) | press feedback, small selection change, switch thumb |
| 200–300ms (short4–medium2) | routine state change, icon swap, chip select |
| 300–500ms (medium2–long2) | sheet, dialog, nav transition, container transform |
| 500–700ms (long2–extraLong1) | the one authored entrance |

Long feedback feels like latency. Bounce or elastic by reflex is banned; overshoot exists only through an
`expressive` spatial spec.

## Material patterns in Compose

**Container transform** (a list item becomes its detail, a FAB becomes a screen): `SharedTransitionLayout`
with `Modifier.sharedBounds` (opt in to `ExperimentalSharedTransitionApi`).

```kotlin
SharedTransitionLayout {
    NavHost(nav, startDestination = Home) {
        composable<Home> { HomeScreen(this@SharedTransitionLayout, this@composable, onOpen = { nav.navigate(Detail(it)) }) }
        composable<Detail> { DetailScreen(this@SharedTransitionLayout, this@composable, it.toRoute<Detail>().id) }
    }
}
// on both sides, inside SharedTransitionScope:
Modifier.sharedBounds(rememberSharedContentState("item-$id"), animatedVisibilityScope = scope)
```

Use `sharedElement` for the same content (an image) and `sharedBounds` for a container whose content changes.

**Shared axis** (steps of a flow, tabs with a spatial order): `AnimatedContent` with a direction-aware spec.

```kotlin
AnimatedContent(step, transitionSpec = {
    val dir = if (targetState > initialState) 1 else -1
    (slideInHorizontally { dir * it / 8 } + fadeIn()) togetherWith (slideOutHorizontally { -dir * it / 8 } + fadeOut())
}, label = "step") { s -> StepContent(s) }
```

**Fade through** (unrelated destinations, e.g. bottom-nav tabs): outgoing fades in ~90ms, incoming fades and
scales from 0.92 after it.

```kotlin
fadeIn(tween(210, delayMillis = 90)) + scaleIn(tween(210, delayMillis = 90), initialScale = 0.92f) togetherWith
    fadeOut(tween(90))
```

**Navigation Compose:** set `enterTransition`, `exitTransition`, `popEnterTransition`, `popExitTransition` on
`NavHost` (app-wide) or a `composable` (per destination). Top-level tab switches fade through; drill-down uses
shared axis or container transform.

**Lists:** `Modifier.animateItem()` on lazy items for insert, remove and reorder. Stagger only when a list
first appears as a list: 50–90ms per item, at most four steps.

**Small state:** `animateColorAsState`, `animateContentSize()`, `AnimatedVisibility`, `Crossfade`;
`updateTransition` when several values move together.

## Predictive back

Back is previewable: the user drags and sees where Back goes before committing.

- Opt in with `android:enableOnBackInvokedCallback="true"` (default for apps targeting Android 16).
- Navigation Compose 2.8+ plays the pop transition as the gesture progresses; make `popEnter`/`popExit` read
  well when scrubbed and when cancelled.
- M3 `ModalBottomSheet`, `ModalNavigationDrawer` and `SearchBar` animate predictive back already.
- Custom surfaces use `PredictiveBackHandler`: drive scale/offset from `BackEventCompat.progress`, restore on
  cancellation (rethrow the `CancellationException`), commit on completion. Never intercept Back for anything
  but closing what is on top.

## Remove animations

Settings › Accessibility › Remove animations sets `ANIMATOR_DURATION_SCALE` to 0. Compose's built-in animations
then jump to their end state. Your job:

- No meaning may exist only in motion: the end state must explain itself (the moved item is visibly in its new
  place, the success state has text).
- Hand-rolled loops (`withFrameNanos`, `rememberInfiniteTransition` driving decoration, shader time uniforms,
  Lottie) must check the setting and show a still frame.

```kotlin
@Composable
fun animationsOff(): Boolean {
    val resolver = LocalContext.current.contentResolver
    return remember { Settings.Global.getFloat(resolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f }
}
```

Use it to swap a spatial transition for a crossfade or an instant cut, not to drop feedback.

## Performance

- Animate in the draw phase: `Modifier.graphicsLayer { translationY = y.value }`, `Modifier.offset { … }`
  lambdas, `drawBehind`. Avoid animating `padding`, `height` or `size` per frame on large subtrees.
- Read animated state as late as possible (lambda modifiers) so only drawing reruns, not composition.
- Judge smoothness on a release build with a baseline profile, on a mid-range device; debug builds lie.
  Use [optimize.md](optimize.md) for jank.
- Nonessential loops stop when off screen or when the lifecycle is not resumed.

## Verify

- The focal moment is specific to this product; each supporting animation explains feedback, state or place.
- Interrupting mid-animation (tap again, Back mid-transition) retargets cleanly.
- Predictive back scrubs, cancels and commits without a jump.
- With Remove animations on, every state still reads and no loop runs.
- Smooth on the target device; removing any animation would lose meaning, not merely decoration.

Capture motion with `adb shell screenrecord` per [verify.md](verify.md). When motion earns its place, hand off
to `/android-design polish [target]`.
