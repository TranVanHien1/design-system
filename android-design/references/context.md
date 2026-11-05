# Project context (run once per session)

This replaces upstream's context engine. Before any design work, learn what the project already is, so you neither invent a world that exists nor break one. Do it once per session, keep the result as a short note in your working memory, and do not repeat it per command.

## 1. Discover

Run from the repository root (adapt paths for a multi-module project). Read results, not every file.

```bash
# modules, plugins, SDK levels, Compose / Material versions
ls; cat settings.gradle* 2>/dev/null | grep -E "include|rootProject"
grep -rEn "com.android.application|namespace|minSdk|targetSdk|compileSdk|compose = true" --include=build.gradle* . | head -40
grep -nE "compose-bom|material3|navigation|adaptive|hilt|coil|vico|lottie|roborazzi|paparazzi|screenshot" gradle/libs.versions.toml 2>/dev/null | head -40
# existing theme, design system and components
grep -rlE "lightColorScheme|darkColorScheme|MaterialTheme\(" --include=*.kt . | head
grep -rlE "Typography\(|Shapes\(" --include=*.kt . | head
find . -path ./build -prune -o -type d \( -name components -o -name designsystem -o -name ui \) -print | head
# hardcoded values (debt the design will inherit)
grep -rEn "Color\(0x|\.sp\b" --include=*.kt . | grep -v "/theme/" | wc -l
# product/design context and earlier reports
ls PRODUCT.md DESIGN.md */PRODUCT.md */DESIGN.md docs/design 2>/dev/null
# locales the app ships
ls -d */src/main/res/values-* 2>/dev/null | sed 's#.*/values-##' | sort -u | tr '\n' ' '
# devices for verification
adb devices -l 2>/dev/null
```

## 2. Record the note

Keep these fields (one line each) and refer back to them instead of re-reading:

- **App:** module(s), namespace/applicationId, minSdk/targetSdk.
- **UI stack:** Compose (BOM, material3 version) / Views / mixed. Material3 ≥1.4 means expressive APIs (`MotionScheme`, `MaterialShapes`, `ButtonGroup`) are available; otherwise use the fallbacks the references give.
- **Theme:** file paths of Theme/Color/Type/Shape; branded scheme or template purple; dynamic color on/off; dark theme present; extended colors present.
- **Design system:** shared components package/module and what it holds.
- **Architecture:** screen = stateless composable fed by `UiState`? ViewModel per feature? Navigation library and graph location.
- **Locales:** shipped `values-*` (Vietnamese present? RTL locales present?).
- **Context files:** PRODUCT.md, DESIGN.md (paths or "missing"); latest `docs/design/critique|audit` report.
- **Verification:** connected devices/emulators; screenshot-test library if any.

## 3. Decide what applies

- **PRODUCT.md missing** and the work is a new surface or a replacement world → run [init.md](init.md) first, then continue.
- **PRODUCT.md missing** and the work is a narrow refinement of existing code → proceed on the incumbent implementation; offer `/android-design init` at the end.
- **DESIGN.md missing but a coherent theme exists in code** → the code is the visual authority. Offer `/android-design document` when the decision record matters; never treat a missing file as a blank slate.
- **Template theme** (purple `#6750A4`/`#6650a4` family, default `Typography()`) with no brand decisions → the visual world is unset; new screens route through [new-work.md](new-work.md).
- **Views/XML screens** → the same rules apply through `Theme.Material3.*` styles and Material Components for Android; give View equivalents where you write code.
- **Compose version too old** for an API a reference names → use the stated fallback; do not upgrade dependencies unless the user asks.

## 4. Load platform and floor

Read [android-m3.md](android-m3.md) once per session. Read [craft-floor.md](craft-floor.md) immediately before any UI edit (not for planning-only work). Keep [tells.md](tells.md) in mind for every review.

If a discovery command fails (no Gradle files, not a git repo, no adb), say so in one line and continue with what you have; missing context never blocks the work.
