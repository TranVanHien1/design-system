# Colorize

> **Additional context needed**: existing brand colors, and whether the app must follow the user's wallpaper.

`colorize` introduces color as hierarchy, meaning and atmosphere through the Material 3 color system. Use it
when screens read as gray, when state and action are hard to find, or when the scheme is the untouched template.
It preserves confirmed brand and semantic conventions; it does not replace a visual world under the guise of
colorizing it (that is [new-work.md](new-work.md)). It never puts a raw hex in a composable.

On Operate screens color primarily encodes action, selection, status and wayfinding; rarity gives an accent its
force. An onboarding or empty-state screen may let a container color own a large region.

## Audit before choosing

Read DESIGN.md, `ui/theme/Color.kt` and `Theme.kt`, and screenshots of light and dark. Identify:

- confirmed brand colors and whether dynamic color is on;
- which roles screens actually use, and where they bypass them;
- places where grayscale hides hierarchy or state;
- contrast failures and color-only meaning;
- whether the scheme is the template default. The baseline M3 purple (`#6750A4`) shipped as a brand is the
  first tell in [tells.md](tells.md).

```bash
rg -n 'Color\(0x|Color\.(White|Black|Gray|Red|Green|Blue)' --glob '*.kt' <target> | rg -v 'ui/theme/'
rg -n 'isSystemInDarkTheme\(\)' --glob '*.kt' <target> | rg -v 'ui/theme/'
```

A screen that branches on dark theme itself, or hardcodes a color, has a second palette starting.

## The M3 role system

Every color comes from `MaterialTheme.colorScheme`. Roles come in pairs; always put `onX` on `X`:

- **Accent families:** `primary`, `secondary`, `tertiary`, each with `onX`, `xContainer`, `onXContainer`.
  Primary is the main action and selection; secondary is lower-emphasis fills (tonal buttons, selected chips);
  tertiary is a contrasting accent for a distinct category or highlight.
- **Surfaces:** `surface` (canvas), the tiers `surfaceContainerLowest` → `surfaceContainerHighest`
  (depth without shadow), `surfaceVariant`, `inverseSurface` (snackbars).
- **Text and lines:** `onSurface` (primary text), `onSurfaceVariant` (secondary text, icons), `outline`
  (field borders, dividers that must be seen), `outlineVariant` (decorative dividers).
- **Error:** `error`, `errorContainer` and their `on` roles. `scrim` behind modals.

Each role resolves to a tone in a tonal palette, so light, dark and contrast variants come free. Raw hex breaks
all three.

## Generate the scheme

Never hand-tune 30 roles. Generate them from seeds:

```bash
node <skill>/scripts/theme.mjs --seed "#1F6F5C" --tertiary "#C2410C" \
  --contrast standard --package com.example.app.ui.theme --out app/src/main/java/com/example/app/ui/theme
```

`--secondary`, `--tertiary` and `--neutral` pin those palettes when the brand owns them; otherwise they derive
from the seed. Run `--contrast medium` and `--contrast high` too when supporting Android 14+ contrast settings.
Commit the generated files and record seeds in DESIGN.md.

Choose hue from product meaning and the chosen world, not category habit (finance ≠ automatically blue). For
warmth, prefer a low-chroma stone or bone neutral with a deep green, brown or oxblood primary over cream plus
terracotta; violet and indigo read as generated unless the brand owns them.

## Dynamic color with a static fallback

```kotlin
@Composable
fun AppTheme(dark: Boolean = isSystemInDarkTheme(), dynamic: Boolean = false, content: @Composable () -> Unit) {
    val ctx = LocalContext.current
    val scheme = when {
        dynamic && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ->
            if (dark) dynamicDarkColorScheme(ctx) else dynamicLightColorScheme(ctx)
        dark -> DarkColors
        else -> LightColors
    }
    MaterialTheme(colorScheme = scheme, typography = AppTypography, shapes = AppShapes, content = content)
}
```

Decide per product, and write the decision into DESIGN.md:

- **Brand-led** (commerce, banking, media with a recognizable color): static scheme, `dynamic = false`.
- **Utility or personal** (notes, launcher-adjacent tools, settings-heavy apps): dynamic on, with a tuned static
  fallback for Android 11 and below.
- Either way, the brand color that must survive (logo, a signature accent) lives in extended colors, not in
  `primary`, so wallpaper never erases it.

## Strategic color through containers

Name the strategy first: emotional temperature, which role owns which region, and the dose. Then:

- Spend `primary` on the main action and current selection only: one `Button` or FAB per screen, the nav
  indicator, the selected tab. Decoration never spends it.
- Use `secondaryContainer` for tonal emphasis: `FilledTonalButton`, selected `FilterChip`, a highlighted row.
- Let one container own a deliberate region: a `primaryContainer` header card on a dashboard, a
  `tertiaryContainer` banner for a promotion or streak. One region per screen, not scattered tints.
- Build depth with surface tiers: `surface` canvas, `surfaceContainerLow` cards, `surfaceContainerHigh` sheets.
- On a colored container, secondary text is `onXContainer` at reduced emphasis, never gray `onSurfaceVariant`.
- The M3 nav indicator pill and tonal icon containers are the platform; keep them and tune their role.

## Extended semantic colors

M3 has no success or warning roles. Add them once, generated as tonal pairs for light and dark:

```kotlin
@Immutable
data class ExtendedColors(
    val success: Color, val onSuccess: Color, val successContainer: Color, val onSuccessContainer: Color,
    val warning: Color, val onWarning: Color, val warningContainer: Color, val onWarningContainer: Color,
)
val LocalExtendedColors = staticCompositionLocalOf<ExtendedColors> { error("No ExtendedColors provided") }

// in AppTheme: CompositionLocalProvider(LocalExtendedColors provides if (dark) DarkExt else LightExt) { MaterialTheme(...) }
object AppTheme { val extended: ExtendedColors @Composable get() = LocalExtendedColors.current }
```

When dynamic color is on, harmonize these toward the dynamic primary (`MaterialColors.harmonize` from
`com.google.android.material`, or generate with the same seed through `theme.mjs`) so a green does not clash
with the wallpaper. Keep meanings consistent across the app; follow domain conventions (red can mean "up" in
some markets).

## Contrast and perception

| Content | Minimum |
|---|---|
| body text | 4.5:1 |
| large text (≥ 18sp, or 14sp bold) | 3:1 |
| icons, field borders, focus indicators | 3:1 |

Correct `on` pairs pass by construction; failures come from mixing roles (`onSurfaceVariant` text on
`secondaryContainer`), alpha on text, text over images and disabled states. Check both themes and the contrast
variants. Use Accessibility Scanner on device and Compose UI Check in Android Studio previews. Simulate
deuteranomaly (Developer options › Simulate color space). Information carried by color also needs text, an
icon or position. Prefer explicit roles over `Color.copy(alpha = …)` stacks whose contrast depends on what is
behind them. Charts follow [operate.md](operate.md): categories differ in lightness and label, not hue alone.

Dark theme is designed, not inverted: surfaces step up in tone with elevation, and saturated brand colors move
to their lighter tones (the generator does this).

## Verify

- Every color in the target comes from `colorScheme` or `AppTheme.extended`; the rerun scan is clean.
- Attention lands on the intended action and state; `primary` appears in few places.
- Light, dark and (if supported) high-contrast schemes are each composed; dynamic-on looks intentional with a
  few wallpapers, including a red and a gray one.
- Contrast and non-color cues pass in pressed, disabled, error and empty states.
- The result is recognizably this product, not "colorful".

When the palette earns its place, hand off to `/android-design polish [target]`.
