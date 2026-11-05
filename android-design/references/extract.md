# Extract

`extract` pulls repeated hardcoded values into the Compose theme and repeated composables into a shared
component layer, then migrates every screen to use them. Use it when the same `Color(0x…)`, dp, sp, shape or
row layout appears across screens, or when [document.md](document.md) or [audit.md](audit.md) reported drift.
It must not change how screens look (parity is the acceptance test), must not redesign, and must not abstract
anything used fewer than three times with the same intent. Premature abstraction is worse than duplication.

## Step 1: Find the system's home

In a team project ([house-style.md](house-style.md)) share only small, ad-free components; large screens and sections stay copied per feature so each can carry its own ads.

Locate where shared UI lives and learn its conventions before adding to it:

- Multi-module: a `core/designsystem` (or `core/ui`) module with `theme/` and `component/` packages.
- Single module: `ui/theme/` plus `ui/components/`.
- Note naming (`AppButton`, `NiaButton`, `XxxDefaults`), how tokens are exposed (`MaterialTheme.*`, extension
  properties, `CompositionLocal`s), preview conventions, and screenshot test setup.

If no shared layer exists, do not create one yet. Ask the user (structured question tool when available)
whether they want a `core/designsystem` module or a `ui/components` package, and wait.

## Step 2: Find the patterns

```bash
rg -n 'Color\(0x[0-9A-Fa-f]{6,8}\)' --type kotlin                       # raw colors
rg -o --no-filename '\b[0-9]+(\.[0-9]+)?\.dp\b' --type kotlin | sort | uniq -c | sort -rn
rg -n 'fontSize\s*=\s*[0-9.]+\.sp|TextStyle\(' --type kotlin             # type outside the scale
rg -n 'RoundedCornerShape\([0-9]' --type kotlin                          # shapes outside Shapes
rg -n 'tween\([0-9]+|spring\(' --type kotlin                             # motion constants
rg -n 'Color\.(Black|White|Gray|Red|Green)' --type kotlin                 # named raw colors
```

Look for:

- **Repeated components**: the same Row/Card/Box structure in 3+ places (list rows with avatar + two lines +
  trailing meta, section headers, empty/error states, stat tiles, confirm dialogs).
- **Hardcoded values** that should be roles or tokens: colors, spacing, sizes, corner radii, elevations.
- **Inconsistent variations**: three slightly different empty states, two button heights, 14dp and 16dp
  screen padding.
- **Type styles**: repeated `fontSize` + `fontWeight` + `lineHeight` combinations that are really one M3 role.
- **Motion**: repeated durations and easings.

## Step 3: Plan

Write the plan before touching code and show it to the user:

- **Colors → roles first.** Map every raw color to an existing `MaterialTheme.colorScheme` role. Only colors
  with a meaning M3 lacks (success, warning, chart series, brand accent outside the scheme) go into an
  `ExtendedColors` class, with light and dark values both defined.
- **Type → `MaterialTheme.typography` roles.** Adjust the `Typography` definition if the app's real scale
  differs; do not add parallel text styles.
- **Shapes → the five `Shapes` slots.** A sixth radius usually means one of the existing ones is wrong.
- **Spacing → a small scale** (for example 4, 8, 12, 16, 24, 32 dp) exposed one way only.
- **Components**: name, parameters, variants, which M3 component each wraps.
- **Migration path**: the order of files, and how parity will be checked.

## Step 4: Extract

### Tokens

```kotlin
@Immutable
data class ExtendedColors(val success: Color, val onSuccess: Color, val warning: Color)

val LocalExtendedColors = staticCompositionLocalOf {
    ExtendedColors(Color.Unspecified, Color.Unspecified, Color.Unspecified)
}

@Immutable
data class Spacing(val sm: Dp = 8.dp, val md: Dp = 12.dp, val lg: Dp = 16.dp, val xl: Dp = 24.dp) // the only steps

val LocalSpacing = staticCompositionLocalOf { Spacing() }

val MaterialTheme.extendedColors: ExtendedColors
    @Composable @ReadOnlyComposable get() = LocalExtendedColors.current
val MaterialTheme.spacing: Spacing
    @Composable @ReadOnlyComposable get() = LocalSpacing.current
```

Provide them in the app theme with `CompositionLocalProvider` next to `MaterialTheme(...)`, choosing light or
dark `ExtendedColors` alongside the color scheme. Name tokens semantically (`success`, `screenPadding`), never
by value (`green700`, `pad16`).

### Components

- **Stateless and hoisted.** Values in, events out (`onClick`, `onValueChange`); no ViewModel inside.
- **`modifier: Modifier = Modifier`** as the first optional parameter, applied to the root.
- **Slots over flags.** `leadingContent: (@Composable () -> Unit)? = null` beats `showIcon: Boolean`.
- **Defaults object** (`AppListRowDefaults.colors()`, `.contentPadding`) mirroring M3's `ButtonDefaults` style.
- **Theme only.** Colors from `MaterialTheme.colorScheme`/`extendedColors`, text from `typography`, corners from
  `shapes`. No literals inside the shared layer.
- **Accessibility built in.** 48dp touch targets (`Modifier.minimumInteractiveComponentSize()`), merged
  semantics for rows (`Modifier.semantics(mergeDescendants = true) {}`), `Role` on clickable custom
  elements, `contentDescription` parameters for meaningful icons, `null` for decorative ones.
- **Previews**: `@PreviewLightDark`, `@PreviewFontScale`, and a long-text preview for every component.

Wrap an M3 component only when the wrapper fixes app-wide defaults or composes several pieces. A wrapper that
just renames `Button` adds a layer and no value. Never fork an M3 component by copying its source.

## Step 5: Migrate

- Find every instance with the Step 2 searches and replace it with the role, token or component.
- Migrate one feature at a time; build after each.
- Check parity with the project's screenshot tests (Roborazzi, Paparazzi or Compose Preview Screenshot
  Testing) or with before/after captures per [verify.md](verify.md), light and dark. A pixel diff that is
  not intended is a bug in the extraction.
- Delete the old private composables and unused color constants. Dead tokens in `Color.kt` are drift waiting
  to come back.

## Step 6: Record

Update DESIGN.md through [document.md](document.md) (refresh, not overwrite) so the new tokens and components
are documented, and add KDoc to each shared component saying when to use it.

**Avoid**:

- Extracting one-off, context-specific layouts.
- Components so generic they need ten boolean flags.
- Ignoring the existing design-system conventions.
- A token for every value; tokens carry meaning.
- Merging things that look alike but differ in intent (a destructive confirm button and a primary submit
  button stay separate even if both are filled).
- Hardcoding light-only values in `ExtendedColors`; every extended color needs its dark twin.
