# Verify: look at what you built

A design change is not done until you have looked at it rendered, at the sizes and settings it ships in. Batch the look: capture every variant you need, read them together, fix everything one look shows, then capture again. Never screenshot after each tweak, and never claim a visual result you did not see. Say which source produced the evidence (device model / emulator / screenshot test).

## Choose the source

| Source | Use when | Gives |
|---|---|---|
| **Device or emulator over adb** | A device is attached (`adb devices`) and the app builds | Real fonts, insets, gestures, system bars, performance. The truth. |
| **Compose screenshot tests** (Roborazzi, Paparazzi, or AGP's Compose Preview Screenshot Testing) | No device, or many variants of one composable | Fast, deterministic PNGs of previews on the JVM. No real insets, IME or system bars. |
| **`@Preview` in the IDE** | The user is looking at Android Studio | Only what the user tells you; you cannot see it. |

Prefer the device for whole screens and final passes; use screenshot tests for component states and wide variant matrices. Emulators give breadth; gestures, refresh rate, haptics and performance need hardware.

## Device run

Building and installing changes the device under test: ask once per session before `./gradlew installDebug` unless the user already asked you to run it. If the `android-adb-qa` skill is installed, reuse its tools: `~/.claude/skills/android-adb-qa/scripts/devstate.sh save|restore <file>` to put settings back, and `scripts/ui.py` (`tap text=…`, `wait`, `shot`, `montage`) to navigate and capture.

```bash
export ANDROID_SERIAL=<serial>                      # always pin the device
RUN=docs/design/shots/$(date +%Y%m%d-%H%M)-<topic>; mkdir -p "$RUN"
./gradlew :app:installDebug && adb shell am start -n <applicationId>/<.MainActivity>
shot() { adb exec-out screencap -p > "$RUN/$1.png"; echo "$RUN/$1.png"; }
```

Read the current value of every setting before you change it and restore it afterwards (or use `devstate.sh`).

| Variant | Set | Restore |
|---|---|---|
| Dark theme | `adb shell cmd uimode night yes` | `… night no` (or the saved value) |
| Font scale 1.3 / 2.0 | `adb shell settings put system font_scale 1.3` | saved value (usually `1.0`) |
| Largest display size | `adb shell wm density <smaller dpi>` (read `wm density` first) | `adb shell wm density reset` |
| Tablet / unfolded width | `adb shell wm size 1600x2560 && adb shell wm density 320` | `wm size reset && wm density reset` |
| Vietnamese locale (Android 13+) | `adb shell cmd locale set-app-locales <pkg> --locales vi` | `… --locales ""` |
| RTL | `adb shell settings put global debug.force_rtl 1`, then restart the app | `… 0` |
| Remove animations | `adb shell settings put global animator_duration_scale 0` (also `transition_` and `window_animation_scale`) | saved values |
| High contrast (Android 14+) | Settings › Accessibility › Color and motion › Color contrast (set by hand; confirm the theme switched) | same |

The minimum matrix for a screen: **light, dark, font scale 2.0**, plus **Vietnamese** when the app ships it, plus **medium/expanded width** when the app runs on tablets or foldables. Add states: drive the app (or a debug menu / fake repository) into Loading, Empty, Error and long-content states and capture each; a screen verified only in its happy state is not verified.

To read several captures at once, combine them: `python3 ~/.claude/skills/android-adb-qa/scripts/ui.py montage "$RUN/strip.png" "$RUN"/*.png --w 300` (needs Pillow), then read the one strip.

## Screenshot tests (no device)

Annotate previews with the variants and render them headlessly:

```kotlin
@PreviewLightDark
@PreviewFontScale
@PreviewScreenSizes
@Composable
private fun HistoryScreenPreview(@PreviewParameter(HistoryStates::class) state: HistoryUiState) {
    AppTheme { HistoryScreen(state = state, onAction = {}) }
}

class HistoryStates : PreviewParameterProvider<HistoryUiState> {
    override val values = sequenceOf(HistoryUiState.Loading, HistoryUiState.Empty, sampleContent(), sampleContent(longNames = true), HistoryUiState.Error("Mất kết nối"))
}
```

- **Roborazzi** (Robolectric): `./gradlew recordRoborazziDebug`; images under `build/outputs/roborazzi/`.
- **Paparazzi**: `./gradlew recordPaparazziDebug`; images under `src/test/snapshots/images/`.
- **Compose Preview Screenshot Testing** (AGP plugin `com.android.compose.screenshot`): previews in `src/screenshotTest`, `./gradlew updateDebugScreenshotTest`.

Only add a screenshot-testing dependency if the project lacks one and the user agrees; otherwise use the device. Feeding `UiState` variants through a `PreviewParameterProvider` is the cheapest way to see every state, and the providers double as fixtures for [harden.md](harden.md).

## The look

Read the images (the Read tool shows PNGs) and check, in one pass per batch:

1. **The screen's one question** is answered in the first screenful ([operate.md](operate.md)).
2. **Floor items** from [craft-floor.md](craft-floor.md): contrast, 48dp targets, insets (nothing under the status bar, the gesture bar or the keyboard), text survives font scale 2.0 without clipping or overlap, Vietnamese diacritics not clipped (`Ặ Ỡ Ữ Ẩ ệ ỹ`).
3. **Tells** from [tells.md](tells.md).
4. **Dark theme** is designed, not inverted; images and illustrations still read.
5. **States**: Loading keeps the layout, Empty keeps the frame and offers the next action, Error names the problem and the recovery.
6. **Consistency** with DESIGN.md: roles, type roles, shapes, spacing scale.

Write what you saw, then fix it all, then capture again. Two clean looks in a row end the loop. Keep the captures in `docs/design/shots/<run>/` so critiques and audits can cite them; do not commit them unless the user wants them in the repo.
