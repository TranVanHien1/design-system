# Document

`document` writes DESIGN.md from an existing Compose codebase so every later screen stays on-brand: color roles,
type scale, shapes, spacing, elevation, motion and component conventions, read from the theme code and the
screens that use it. Use it when a coherent theme exists but DESIGN.md does not, when DESIGN.md has drifted from
the code, after the first build of a new world, or before a large redesign to freeze the current state. It does
not change any Kotlin file and does not invent tokens the code does not use.

DESIGN.md opens with YAML frontmatter carrying machine-readable tokens, then up to eight markdown sections in a
fixed order. In an incumbent project **the theme code is the source of truth; DESIGN.md mirrors it.** When the
two disagree, DESIGN.md is stale. Sections may be omitted; those present keep the canonical order and headings.

## When DESIGN.md already exists

Do not silently overwrite it. Show the user the existing file, ask (structured question tool when available)
whether to refresh, overwrite or merge, and wait.

## Two paths

- **Scan mode** (default): there is a theme, components or running screens. Extract, then confirm the
  descriptive language with the user.
- **Seed mode**: pre-implementation. Route through [new-work.md](new-work.md)'s direction round and write a
  directional seed. Offer it when the scan finds no theme and no screens; never switch silently, and never use
  seed mode to replace a coherent incumbent theme (that is a redesign, owned by new-work).

## Scan mode

### Step 1: Find the design sources

Search in this order and record file paths:

1. **Theme files** in `ui/theme/` or `core/designsystem/theme/`: `Theme.kt` (`lightColorScheme`,
   `darkColorScheme`, `dynamicLightColorScheme`/`dynamicDarkColorScheme` and the SDK check guarding them,
   contrast-level schemes), `Color.kt`, `Type.kt` (`Typography(...)`, `FontFamily`, `Font(R.font.*)`,
   `GoogleFont` provider), `Shape.kt` (`Shapes(extraSmall … extraLarge)`).
2. **Custom tokens**: `CompositionLocal`s (`staticCompositionLocalOf`), an `ExtendedColors` data class,
   `Spacing`/`Dimens` objects, `MaterialTheme.*` extension properties, motion constants (`tween`, `spring`,
   `MotionScheme`).
3. **Resources**: `res/values/colors.xml`, `themes.xml` (window background, splash screen theme, status bar
   flags), `res/font/`, `res/values-night/`, launcher icon and monochrome themed icon.
4. **Shared components** in `ui/components/` or `core/designsystem/component/`: buttons, cards, list rows,
   text fields, top bars, empty/error state composables. Note their parameters, defaults objects and which M3
   component they wrap.
5. **Hardcoded literals in screens.** These reveal the real system and its drift:

   ```bash
   rg -n 'Color\(0x[0-9A-Fa-f]{6,8}\)' --type kotlin
   rg -o --no-filename '\b[0-9]+(\.[0-9]+)?\.dp\b' --type kotlin | sort | uniq -c | sort -rn | head -30
   rg -o --no-filename '\b[0-9]+(\.[0-9]+)?\.sp\b' --type kotlin | sort | uniq -c | sort -rn
   rg -n 'RoundedCornerShape\(|CutCornerShape\(|CircleShape' --type kotlin
   rg -n 'tween\(|spring\(|animate\w*AsState|AnimatedVisibility|AnimatedContent' --type kotlin
   rg -n 'fontSize\s*=|fontWeight\s*=|TextStyle\(' --type kotlin
   ```

   The dp frequency list is the spacing scale the team actually uses. Values used once are noise.
6. **Rendered output.** Capture representative screens per [verify.md](verify.md), light and dark. With
   dynamic color on, screenshots show wallpaper-derived colors, not the brand scheme: note which you captured.

### Step 2: Auto-extract

- **Colors**: record the light and dark schemes by M3 role. Note whether dynamic color is enabled and on which
  SDK; if it is, the static scheme is the fallback and brand color survives only where the code pins it. Group
  as Primary / Secondary / Tertiary / Neutral (surface, surface-container family, outline) / Error, plus any
  extended roles. If only primary is customised and the rest are M3 defaults, say so; do not invent meaning
  for defaults.
- **Typography**: map every overridden `TextStyle` to its M3 role (display/headline/title/body/label ×
  large/medium/small). Record family, weight, size and line height in sp, letter spacing. List screens that
  bypass the scale with literal `fontSize`.
- **Shapes**: the five `Shapes` slots and what components use each; literal shapes that bypass them.
- **Spacing and layout**: the observed dp scale, screen edge padding, list row heights, how layout changes at
  medium/expanded `WindowSizeClass`, inset handling (edge-to-edge or not).
- **Elevation**: tonal elevation, shadow elevation, or flat with outlines. State explicitly if the app is flat.
- **Motion**: durations and easing used, shared element or container transitions, navigation transitions,
  whether Remove animations is respected.
- **Components**: for each shared component, the wrapped M3 component, shape slot, color roles, padding,
  states (pressed, focused, disabled, loading, error).

### Step 2b: Stage the frontmatter

```yaml
---
name: <App name>
description: <one-line tagline>
colors:
  primary: "#3A5F0B"
  on-primary: "#FFFFFF"
  surface: "#FBF9F4"
  primary-dark: "#A4D46C"
  surface-dark: "#13140F"
  success: "#2E7D32"          # extended role, only if the code defines it
typography:
  headline-medium:
    fontFamily: "Fraunces"
    fontSize: "28sp"
    fontWeight: 600
    lineHeight: "36sp"
    letterSpacing: "0sp"
  body-large:
    fontFamily: "Roboto"
    fontSize: "16sp"
    fontWeight: 400
    lineHeight: "24sp"
rounded:
  small: "8dp"
  medium: "12dp"
  large: "16dp"
spacing:
  xs: "4dp"
  sm: "8dp"
  md: "16dp"
  lg: "24dp"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-large}"
    rounded: "{rounded.medium}"
    height: "48dp"
---
```

Rules:

- **Keys follow the code.** M3 role names in kebab case (`surface-container-high`); dark values as sibling
  keys with a `-dark` suffix; custom roles keep the project's name. Don't rename the project's tokens.
- **Token refs** use `{path.to.token}`. Components may reference primitives; primitives may not reference each
  other.
- **Units are sp for type and dp for everything else.** Hex in `#RRGGBB` (or `#AARRGGBB` when alpha is part of
  the token).
- **Component sub-tokens are limited to** `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`,
  `size`, `height`, `width`. Elevation, motion and state behavior go in the prose sections.
- **Top-level groups are only** `colors`, `typography`, `rounded`, `spacing`, `components`. No `motion:` or
  `elevation:` groups.
- Skip anything the project does not have. Fabricated tokens pollute the record.

### Step 3: Ask for the qualitative language

These cannot be extracted. Ask in at most two rounds of up to three questions, waiting between rounds:

- **Creative North Star**: one named metaphor for the system ("The Field Notebook", "The Quiet Ledger"). Offer
  2–3 that honor PRODUCT.md's brand commitments.
- **Overview voice**: mood adjectives, the philosophy in 2–3 sentences, confirmed anti-references.
- **Color character**: descriptive names for key colors ("Deep Moss", not "green-800"); offer 2–3 per color.
- **Elevation philosophy**: flat, tonal, or lifted; if shadows exist, ambient or structural?
- **Component feel**: one phrase ("tactile and confident", "quiet and exact").

### Step 4: Write DESIGN.md

At the project root (or where [context.md](context.md) resolved it): the frontmatter, then this body.

```markdown
# Design System: <App name>

Source of truth: `app/src/main/java/.../ui/theme/` (Theme.kt, Color.kt, Type.kt, Shape.kt). Dynamic color: <on
for API 31+ with static fallback | off>.

## Overview
**Creative North Star: "<metaphor>"**
[2–3 paragraphs: personality, density, philosophy; confirmed rejections. End with **Key Characteristics:**
bullets.]

## Colors
[One sentence on the palette's character.]
### Primary
- **<Descriptive Name>** (`primary`, #HEX / dark #HEX): [where and why it is used.]
### Secondary / Tertiary (omit if unused)
### Neutral
- **<Name>** (`surface`, `surface-container-*`, `outline`): [roles.]
### Extended (omit if none)
- **<Name>** (`ExtendedColors.success`): [role, and why M3 roles could not carry it.]
### Named Rules
**The <Name> Rule.** [Short doctrine, e.g. "The One Voice Rule. `primary` covers under 10% of any screen."]

## Typography
**Display Font:** <family> · **Body Font:** <family> · **Label Font:** <family if distinct>
**Character:** [1–2 sentences.]
### Hierarchy
- **Display / Headline / Title / Body / Label** ([weight], [size]sp, [line height]sp): [where it appears.]
### Named Rules

## Layout
[Screen edge padding, spacing rhythm, list density, how structure changes at medium/expanded width,
edge-to-edge and inset handling. Exact dp only when observed.]

## Elevation & Depth
[Tonal, shadow, or flat; which surfaces sit at which tonal level; scrim use.]

## Shapes
[Corner strategy per `Shapes` slot, which components use which slot, any signature silhouette.]

## Components
### Buttons
- **Shape / Primary / Secondary / Disabled / Loading:** [roles, shape slot, height, padding.]
### Cards / List rows / Inputs / Chips / Navigation / Sheets and dialogs
[Only components that exist. Character line, then shape, color roles, states. Motion lives with the
component it affects.]
### <Signature component> (optional)

## Do's and Don'ts
### Do:
- **Do** [prescription grounded in the code, exact values in parens].
### Don't:
- **Don't** [prohibition the code or the user confirmed].
```

### Step 5: Confirm

Show the full DESIGN.md, highlight the non-obvious choices (color names, named rules), list the drift found in
Step 1 (hardcoded colors, off-scale sizes) as follow-ups for `/android-design extract`, and offer to revise any
section.

## Seed mode

PRODUCT.md is required; run [init.md](init.md) first if missing. Run [new-work.md](new-work.md)'s direction
round for a named first screen and stop after the direction is chosen. Write DESIGN.md with this first line:

```markdown
<!-- SEED: set with the user before implementation; re-run /android-design document once theme code exists. -->
```

Frontmatter carries only `name` and `description`. Fill Overview, Colors, Typography, Layout, Elevation &
Depth, Shapes and Do's and Don'ts from the chosen direction; values only where established, otherwise
`[to be resolved during implementation]`. Omit Components. Tell the user to re-run
`/android-design document` after the theme files exist.

## Style guidelines

- **Descriptive first, value in parens.** "Gently curved cards (16dp, `shapes.large`)", not "large shape".
- **Functional over decorative.** For each token, say where and why it is used.
- **Named Rules**: `**The <Name> Rule.** <doctrine>`, 1–3 per section. They are the lines agents remember.
- **Decisive where the code is decisive**, softer where usage is inconsistent.
- **Group colors by role**, not by hue.
- **Reference PRODUCT.md selectively.** Only durable brand commitments constrain DESIGN.md.

## Pitfalls

- Don't paste Kotlin identifiers as descriptions. Translate them.
- Don't record every literal. Stop at what is reused; one-offs are drift, reported for extract.
- Don't invent components that do not exist.
- Don't duplicate PRODUCT.md. DESIGN.md is strictly visual.
- Don't rename sections. "Colors", not "Color Palette"; tools parse exact headings.
- Don't restate a token value in prose with a different number. The frontmatter mirrors the code.
- Don't document M3 defaults as brand decisions. "Uses M3 baseline secondary" is a fact, not a choice.
