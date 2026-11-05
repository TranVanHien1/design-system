# Optimize

Performance is a feature. `optimize` finds the actual bottleneck in a Compose screen or the app's startup,
fixes it, and proves the fix with numbers: measure → find → fix → re-measure. Use it when scrolling stutters,
an interaction lags, launch is slow, or an audit scored Performance below 3. It must not change the design,
trade accessibility for speed, or optimize what isn't slow. Optimizing without a measurement spends effort on
things that do not matter.

## Rules of measurement

- **Measure release builds only.** Debug Compose runs interpreted, with debugging hooks, and is many times
  slower; a debug-build jank report is noise. Use a `release`-like build type (`isMinifyEnabled = true`,
  signed with the debug key if needed, `isDebuggable = false`).
- **Measure on a low-end physical device** (an Android Go or 4 GB phone), not only an emulator or flagship.
  Emulators prove nothing about frame timing.
- **Know the frame budget**: 16.7 ms at 60 Hz, 11.1 ms at 90 Hz, 8.3 ms at 120 Hz.
- Record the numbers before touching code, in the same scenario you will re-run after.

## 1. Measure

**Startup** (cold, TTID):

```bash
adb shell am start-activity -S -W -n <pkg>/<launcher activity>   # TotalTime = time to initial display
```

Run 5–10 times and take the median. For time to full display, call `ReportDrawnWhen { uiState is Content }`
(androidx.activity.compose) in the first screen and read `Fully drawn` from logcat. For CI-grade numbers, a
Macrobenchmark with `StartupTimingMetric()`.

**Jank** (a scenario: scroll the feed, open a detail, type in search):

```bash
adb shell dumpsys gfxinfo <pkg> reset
# perform the scenario, e.g. a few flings:
adb shell input swipe 540 1600 540 400 150
adb shell dumpsys gfxinfo <pkg>             # Janky frames %, 50th/90th/95th/99th percentile frame time
adb shell dumpsys gfxinfo <pkg> framestats  # per-frame timestamps (ns) for the most recent frames
```

In `framestats`, frame duration is `FRAME_COMPLETED − INTENDED_VSYNC`; count frames over budget and look for
clusters (a cluster at the same point in every run is a real cause). For repeatable numbers, a Macrobenchmark
with `FrameTimingMetric()` (`frameDurationCpuMs` P50/P90/P99, `frameOverrunMs`).

**Recomposition**: Android Studio Layout Inspector with recomposition counts enabled; scroll or interact and
see which composables recompose and how often they skip. A row that recomposes on every scroll frame, or a
whole screen that recomposes when one field changes, is a finding.

**Stability**: Compose compiler reports.

```kotlin
// app/build.gradle.kts
composeCompiler {
    reportsDestination = layout.buildDirectory.dir("compose_compiler")
    metricsDestination = layout.buildDirectory.dir("compose_compiler")
}
```

Build release, then read `*-classes.txt` (which classes are `unstable`) and `*-composables.txt` (which
composables are `restartable` but not `skippable`).

**Memory and size**: `adb shell dumpsys meminfo <pkg>` before and after scrolling a long image list; APK
Analyzer for size by library and resource.

**Traces** when the cause is unclear: a Perfetto system trace with Compose runtime tracing
(`androidx.compose.runtime:runtime-tracing`) shows which composable, layout or draw pass took the frame.

## 2. Find

Match the symptom to the likely cause before fixing anything:

| Symptom | Likely cause |
|---|---|
| Slow cold start | work in `Application.onCreate`, eager DI graphs, disk or network before first frame, no baseline profile |
| First scroll janky, later smooth | no baseline profile (code is JIT-compiled on first use) |
| Scroll jank every frame | unkeyed or unstable list items, state read in composition on scroll, heavy item layout, image decode |
| Jank when one value changes | an unstable parameter forcing a parent screen to recompose |
| Typing lag in a field | text state routed through a slow ViewModel pipeline, filtering on the main thread per keystroke |
| Stutter on enter/exit animation | animating layout size each frame, heavy content composed during the transition |
| Memory climbs while scrolling | full-size bitmaps for thumbnails, no image memory cache limits |

## 3. Fix

### Startup

- Ship a **baseline profile**: the `androidx.baselineprofile` Gradle plugin, a generator module (Android Studio
  "Baseline Profile Generator" template) that walks the critical path (launch, first scroll, main
  navigation), and `androidx.profileinstaller` in the app. Compare with Macrobenchmark
  `CompilationMode.None()` vs `CompilationMode.Partial()`; expect 20–40% on startup and first-scroll frames.
- Move non-critical init off the launch path (lazy Hilt providers, App Startup initializers, WorkManager).
  No disk or network on the main thread; enable StrictMode in debug to catch it.
- The SplashScreen API is a brand moment, not a place to hide slow init. Keep it to the minimum.

### Recomposition

- **Stable parameters.** With strong skipping (default with the Kotlin 2.0.20+ Compose compiler), unstable
  parameters are compared by instance, so a new `List` instance every emission still recomposes. Pass
  `ImmutableList` (kotlinx.collections.immutable), mark genuinely immutable UI models `@Immutable`, or list
  external types in a stability configuration file (`stabilityConfigurationFiles`).
- **Pass what is needed.** A row takes `title: String, onClick: () -> Unit`, not the whole `UiState`.
- **Defer state reads to the phase that needs them.** Read scroll or animation values in layout or draw, not
  composition:

  ```kotlin
  Modifier.offset { IntOffset(0, -scrollState.value / 2) }      // not Modifier.offset(y = …)
  Modifier.graphicsLayer { alpha = fade.value }                 // not Modifier.alpha(fade.value)
  Modifier.drawBehind { drawRect(color.value) }                 // not Modifier.background(color.value)
  ```

- **`derivedStateOf`** for values derived from fast-changing state, so readers recompose only when the result
  changes:

  ```kotlin
  val showJumpToTop by remember { derivedStateOf { listState.firstVisibleItemIndex > 5 } }
  ```

- `collectAsStateWithLifecycle()` so hidden screens stop collecting; no backwards writes (writing state that
  was already read in the same composition).

### Lazy lists

- `items(items, key = { it.id }, contentType = { it.type })`. Keys keep item state and animations correct on
  insert/move; content types let Compose reuse compositions across similar rows.
- Never nest a `LazyColumn` in `Modifier.verticalScroll`; never build unbounded content with `Column` +
  `forEach`.
- Keep item layouts shallow; do formatting (dates, prices) in the ViewModel or mapper, not in the item.
- Placeholders and images keep fixed sizes so items don't re-measure when content arrives.
- `Modifier.animateItem()` only where movement means something.

### Images (Coil)

- Give the image a bounded size (`Modifier.size` or `aspectRatio` + width) so Coil decodes at display size
  instead of full resolution; set `size(...)` on the `ImageRequest` explicitly when the composable's size
  is not bounded.
- Thumbnails come from the server at thumbnail size when the API allows.
- Large bundled bitmaps: ship WebP at the needed densities; use vector drawables for icons and simple
  illustrations; never load a 3000×3000 PNG through `painterResource` for a 96dp slot.
- Crossfade is fine; heavy transformations (blur, rounded-corner bitmaps) belong in the request, cached, not
  recomputed per frame. `Modifier.blur` only works on Android 12+ and costs a pass; use sparingly.

### Animation and drawing

- Animate `graphicsLayer` properties (translation, scale, alpha, rotation) for movement; animate size or
  padding only when the layout change is the point, and keep it short.
- **Overdraw**: stacked opaque backgrounds (window background + `Scaffold` + `Surface` + `Card` all painting
  the same color). Check with `adb shell setprop debug.hwui.overdraw show` (restart the app; `false` to
  turn off); aim for no red regions on scrolling content.
- Defer offscreen work: don't compose heavy tabs or sheets until shown.

## 4. Re-measure

Run the same scenario on the same device and build type. Report before → after for each metric you touched
(TotalTime median, janky frames %, P90/P99 frame time, recomposition counts on the hot composable). If a
number did not move, revert the change: it added complexity for nothing. Check for regressions: behavior,
TalkBack, Remove animations, dark theme.

Then ask whether it *feels* faster on the low-end device, and say which device produced the evidence.

When the user-facing numbers move, hand off to `/android-design polish <target>` for the final pass.

**Avoid**: optimizing without a baseline number; measuring debug builds; micro-optimizing (`remember`
everywhere) while an unkeyed list or missing baseline profile dominates; marking classes `@Stable` that are
not, which hides bugs; lazy-composing the content of the first screen; trading accessibility or Remove
animations support for frames.
