# Overdrive

Start your response with:

```
──────────── ⚡ OVERDRIVE ─────────────
》》》 Entering overdrive mode...
```

`overdrive` pushes one part of an Android app past conventional limits, using the full power of the platform:
a list that scrolls 100k rows without a dropped frame, a card that morphs into its detail, a shader that reacts
to the user's drag, a chart that animates between states at 120Hz. Use it when the fundamentals are already
solid and the user wants one extraordinary moment. It enhances how a feature feels, not what the product does
(offline sync or collaboration are product decisions). It never ships an effect without a fallback, never breaks
M3 structure or Back, and never layers several extraordinary moments on one screen.

Context decides what "extraordinary" means. A particle field on a creative app's onboarding is impressive; the
same field on a settings screen is embarrassing. A settings screen with instant optimistic saves and seamless
state transitions is extraordinary too.

## Propose before building

This command has the highest potential to misfire. Do not jump to implementation:

1. **Think through 2–3 directions** with different techniques, levels of ambition and aesthetics. For each,
   describe what the user would see and feel.
2. **Get the user's pick before writing code.** Ask with the structured question tool when available and wait.
   Put each direction's description and trade-offs (minimum API level, fallback, frame cost, APK size,
   complexity) inside the option itself, so the user chooses between things they can read.
3. Build only the confirmed direction.

## What "extraordinary" means here

Ask: what would make a user of THIS app say "wow, that's nice"?

- **Onboarding, empty and celebratory screens:** sensory. A shader ground that responds to touch or tilt, a
  shape that morphs as the user advances, a cinematic container transform into the first real screen.
- **Functional UI:** how it feels. A card that expands into its detail with shared bounds, a list item you can
  fling away with physics and undo, a bottom sheet whose content reflows as it drags, predictive back that
  previews exactly where you land.
- **Performance-critical UI:** invisible but felt. Search that filters 50k items per keystroke without a hitch,
  an editor that applies filters in real time, a timeline that never blanks.
- **Data-heavy screens:** fluid. Canvas-drawn charts that morph between ranges, pinch-zoom on a dense time
  series, values that count to their new state.

## The toolkit

### Cinematic transitions

- **Shared element / container transform:** `SharedTransitionLayout` + `sharedBounds`/`sharedElement`, across
  Navigation Compose destinations (see [animate.md](animate.md)).
- **Predictive back as a feature:** `PredictiveBackHandler` driving a custom scale, corner and reveal so the
  gesture itself becomes the moment.
- **Springs everywhere the finger is:** `Animatable` with `animateTo(spring(...), initialVelocity)` after a
  drag, `animateDecay(velocity, splineBasedDecay(density))` for flings, `AnchoredDraggable` for snapping states.

### Rendering beyond components

- **Custom drawing:** `Canvas`, `Modifier.drawWithCache` (cache paths and brushes), `drawBehind`. Charts,
  gauges, generative grounds.
- **AGSL `RuntimeShader` (API 33+):** GPU shaders as brushes or as an effect on any composable.

```kotlin
@Composable
fun ShaderGround(modifier: Modifier = Modifier) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val shader = remember { RuntimeShader(GROUND_AGSL) }
        val time by produceState(0f) {
            val start = withFrameMillis { it }
            while (true) withFrameMillis { value = (it - start) / 1000f }
        }
        Canvas(modifier) {
            shader.setFloatUniform("size", size.width, size.height)
            shader.setFloatUniform("time", time)
            drawRect(ShaderBrush(shader))
        }
    } else {
        Box(modifier.background(Brush.verticalGradient(listOf(Ground1, Ground2))))  // composed fallback
    }
}
```

  Also `RenderEffect.createRuntimeShaderEffect(shader, "content")` applied through
  `Modifier.graphicsLayer { renderEffect = … .asComposeRenderEffect() }` to distort real content.
  `Modifier.blur` works on API 31+ and is a no-op below. Every shader stops its time loop when the setting
  Remove animations is on and when off screen.
- **Shape morphing:** `androidx.graphics:graphics-shapes` (`RoundedPolygon`, `Morph`) works on any material3;
  material3 1.4+ (expressive) adds `MaterialShapes` presets and morphing indicators.
- **Video and motion assets:** Media3 ExoPlayer for a looping ground (muted, paused off screen), Lottie for
  authored vector sequences.

### Data that feels alive

- **Huge lists:** `LazyColumn` with stable `key`, `contentType`, immutable item models, Paging 3 for unbounded
  data; no work in item composition that can be precomputed in the ViewModel.
- **Animated data transitions:** interpolate chart geometry with `Animatable` per series rather than redrawing
  from zero.
- **Off the main thread:** filtering, diffing, decoding and image processing on `Dispatchers.Default`; UI only
  collects results.

### The device

- **Haptics** synced to motion (`HapticFeedbackType.SegmentTick` per snap point, `Confirm` at completion); see
  [delight.md](delight.md).
- **Sensors** (rotation vector for parallax tilt) sparingly, unregistered when not resumed, with a static
  fallback.
- **High refresh rate:** 90–120Hz panels expose every dropped frame; the budget is 8–11ms per frame.

## Implement with discipline

### Fallback is non-negotiable

Every technique degrades to a composed, good-looking alternative: API-gated code paths
(`Build.VERSION.SDK_INT`), a gradient or still image behind a shader, a crossfade behind a shared transition,
a still frame under Remove animations. The fallback is designed, not an afterthought.

### Performance rules

- Target the panel's refresh rate on a mid-range device in a release build with a baseline profile; if frames
  drop, simplify.
- Measure with Macrobenchmark `FrameTimingMetric`, JankStats or Perfetto, not by eye on a flagship.
- Keep animated values in draw-phase lambdas (`graphicsLayer {}`, `drawBehind {}`) so frames skip composition
  and layout.
- Lazy-initialize heavy resources (shaders, players, large bitmaps) when the screen is reached; release them in
  `DisposableEffect`/lifecycle callbacks.
- Pause everything you cannot see.

See [optimize.md](optimize.md) for diagnosis.

### Polish is the difference

The gap between "cool" and "extraordinary" is the last 20%: the damping of a spring, the moment a haptic
lands, the secondary motion that makes a transform feel physical. Ship the version that feels inevitable, not
the first that runs.

**Never:**

- ship an effect that janks on a mid-range phone;
- use an API above `minSdk` without a designed fallback;
- add sound without explicit opt-in;
- use technical ambition to mask weak fundamentals (fix those with [layout.md](layout.md),
  [typeset.md](typeset.md), [colorize.md](colorize.md) first);
- intercept Back, hide system bars or trap gestures for an effect;
- layer competing extraordinary moments. Focus creates impact; excess creates noise.

## Verify on device

Ambitious effects rarely work on the first try. Verify on hardware, not from code: an effect that runs can still
stutter, ease wrong or land on the wrong frame. Record with `adb shell screenrecord` and step through frames;
batch fixes between looks (see [verify.md](verify.md)).

- **The wow test:** show someone who has not seen it. Do they react?
- **The removal test:** take it away. Does the experience feel diminished, or does nobody notice?
- **The device test:** a mid-range phone, a tablet or foldable, the lowest supported API level (fallback path).
  Still smooth, still good?
- **The context test:** does this make sense for THIS brand and audience?
- **The settings test:** Remove animations, dark theme, font scale 2.0, TalkBack.

"Technically extraordinary" is not about the newest API. It is about making an app do something users did not
think an app could do.
