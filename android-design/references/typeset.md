# Typeset

`typeset` improves typography hierarchy, faces and text behavior on Android screens. Use it when type reads as
flat, inconsistent, cramped, generic, or breaks at large font scale or in Vietnamese. It works inside the
established visual world: confirmed families stay and their use improves. Replacing the type identity is new
work ([new-work.md](new-work.md)) and updates DESIGN.md. It never hand-picks sizes per screen and never fixes
text in `dp`.

On Operate screens stability, scanability and measure come first; one well-tuned family on the M3 role scale is
often right. Display roles may carry the voice on onboarding, empty states and celebratory moments.

## Two isolated assessments

Run separately, then synthesize; do not let the grep anchor the design read.

1. **Typographic assessment.** Inspect `ui/theme/Type.kt` and representative screens. Answer with a file, a
   line or a screenshot:
   - **Authority and fit:** which faces and weights are established? Do they fit the product, or are they an
     unexamined default? Is every family necessary?
   - **Hierarchy:** can title, body, label, metadata and numeric roles be told apart at a glance? Are adjacent
     roles too close to carry different jobs (a `titleMedium` beside a `bodyLarge` at the same weight)?
   - **Consistency:** does every text use a `MaterialTheme.typography` role, and does the same job use the same
     role on every screen?
   - **Reading:** do paragraphs stay near 45–75 characters per line on expanded widths? Are line height and
     weight tuned to the face and the language?
   - **Stress:** font scale 200%, a long Vietnamese heading, a missing weight, the brand font failing to load.
2. **Mechanical scan.**

```bash
rg -n 'fontSize\s*=|\.sp\b|TextStyle\(' --glob '*.kt' <target> | rg -v 'ui/theme/'
rg -n 'FontWeight\.(Thin|ExtraLight|Light)' --glob '*.kt' <target>
rg -n 'maxLines\s*=\s*1|\.height\(' --glob '*.kt' <target>
```

Every hit outside the theme is a hand-picked size or a clipping risk until proven otherwise.

## The system: M3 roles are the only sizes

Fifteen roles, and no others: `display`, `headline`, `title`, `body`, `label`, each Large/Medium/Small. Map
every text to a role by its job, never by the size that looked right:

| Job | Role |
|---|---|
| Hero number, onboarding statement | `displaySmall`–`displayLarge` (rare, one per screen) |
| Screen or section heading in content | `headlineSmall`, `titleLarge` |
| Top app bar title | set by the component (`titleLarge`; large bars use `headline*`) |
| List row title, card title | `titleMedium` |
| Paragraphs, row supporting text | `bodyLarge`, `bodyMedium` |
| Captions, timestamps | `bodySmall` |
| Buttons, chips, tabs, field labels | `labelLarge` (components set it) |
| Badges, overlines | `labelMedium`, `labelSmall` |

Fewer roles, farther apart, beat a dense ladder. If two roles look nearly identical on a screen, make them the
same role. Adjust within a role with `.copy(...)` only for weight or a feature, never for size. Hierarchy
comes from size, weight, space and color role together (`onSurface` vs `onSurfaceVariant`), not size alone.

## Brand face through Typography()

Change families in one place and keep the M3 metrics unless the face demands otherwise:

```kotlin
private val base = Typography()
val AppTypography = Typography(
    displayLarge = base.displayLarge.copy(fontFamily = Display),
    displayMedium = base.displayMedium.copy(fontFamily = Display),
    displaySmall = base.displaySmall.copy(fontFamily = Display),
    headlineLarge = base.headlineLarge.copy(fontFamily = Display),
    headlineMedium = base.headlineMedium.copy(fontFamily = Display),
    headlineSmall = base.headlineSmall.copy(fontFamily = Display),
    titleLarge = base.titleLarge.copy(fontFamily = Text),
    // ...title/body/label roles use Text
)
```

Roboto (the system face) is a legitimate body and label face. What reads as default is Roboto as the
*display* voice when the product's world calls for character. Two families at most: one for display/headline,
one for everything else. No third face for numbers or quotes.

## Delivering fonts

- **Bundled (`res/font/*.ttf`):** the default for the brand-critical face. Always present, no first-launch
  swap, works on devices without Google Play services. Ship only the weights you use (usually 2–3), or one
  variable font.
- **Downloadable Google Fonts** (`androidx.compose.ui:ui-text-google-fonts`): smaller APK, shared cache, but
  the first launch may render the fallback, and devices without Play services never get the face.

```kotlin
val provider = GoogleFont.Provider(
    providerAuthority = "com.google.android.gms.fonts",
    providerPackage = "com.google.android.gms",
    certificates = R.array.com_google_android_gms_fonts_certs,
)
val Text = FontFamily(
    Font(GoogleFont("Be Vietnam Pro"), provider, FontWeight.Normal),
    Font(GoogleFont("Be Vietnam Pro"), provider, FontWeight.Medium),
)
```

Pick a fallback of the same kind (sans for sans) whose metrics are close, so the swap does not reflow the
screen. Judge screenshots only after the real face rendered.

## Vietnamese coverage

A face without full Vietnamese coverage does not fail loudly: Android falls back per glyph, so `Đường` renders
with `ư` and `ờ` from Roboto inside a word set in the brand face. Before adopting any face:

1. Check the family's language support lists Vietnamese (on Google Fonts, the "vietnamese" subset). Families
   that ship it include Be Vietnam Pro, Inter, Roboto/Roboto Flex, Noto Sans/Serif, Lexend, Montserrat, Lora;
   verify the exact version you bundle.
2. Render a stress line in every role you use, at font scale 1.0 and 2.0:
   `Ặng ẵm, ỡm ờ, những ữa, Ẫn ỷ, Quyết định. Đường phố HÀ NỘI.`
   Stacked marks (ặ ẫ ỡ ữ ẩ ỷ) must render whole, in one face, with the hook and tilde distinguishable.
3. Capital letters with stacked marks rise above cap height. With tight line height or a fixed-height container
   they clip or collide with the line above. Keep `lineHeight` at or above the M3 role value (about 1.25× size
   for display, 1.4–1.5× for body), do not trim display line height for Vietnamese locales, and never put a
   heading in a fixed `Modifier.height`. If marks still clip, set
   `platformStyle = PlatformTextStyle(includeFontPadding = true)` on that style and
   `lineHeightStyle = LineHeightStyle(LineHeightStyle.Alignment.Center, LineHeightStyle.Trim.None)`.
4. Avoid ALL CAPS for Vietnamese text: capitals with stacked diacritics are harder to read and collide. If a
   label must be uppercase, use `uppercase(Locale.forLanguageTag("vi"))`.

## Font scale

Users run up to 200%. Android 14+ scales nonlinearly: large text grows less than body text, so hierarchy
compresses at high scales.

- Text sizes and line heights in `sp` (or `em`), never `dp`. Compose role styles already are.
- Containers grow with text: `heightIn(min = …)`, never `height(…)` around text. Rows wrap or stack instead of
  truncating the primary label; truncate metadata only.
- Test with `adb shell settings put system font_scale 2.0` (read and restore the old value; see
  [verify.md](verify.md)). Bottom navigation labels, buttons in a `Row`, chips and dialog buttons are where it
  breaks first.

## Details

- **Numbers:** `style.copy(fontFeatureSettings = "tnum")` for prices, timers, tables and anything that updates
  in place, so digits do not jitter. Prefer a face with real tabular figures.
- **Line breaking:** headings use `lineBreak = LineBreak.Heading` (balanced lines); body uses
  `LineBreak.Paragraph`. `hyphens = Hyphens.Auto` helps narrow English or German columns; set `Hyphens.None`
  for headings and for Vietnamese, which does not hyphenate.
- Break a heading by hand only between phrases, and check it at every width and font scale it renders at.
- Light text on dark surfaces: keep body weight at Normal or above, never Light; consider one step more weight
  for small labels in dark theme.
- Measure: on medium/expanded, cap paragraph width (`Modifier.widthIn(max = 600.dp)` at `bodyLarge`).
- Paragraph rhythm: space between paragraphs (8–12dp) or an indent, not both.
- Real punctuation in strings: curly quotes, `…`, en dash for ranges.
- Never add shadow, outline or gradient fills to display type.

## Verify

- Primary, secondary, body and metadata roles are recognizable without reading the copy.
- Every text resolves to a `MaterialTheme.typography` role; the rerun scan has no unexplained hits.
- Vietnamese stress line renders in one face with no clipped marks at 1.0 and 2.0 scale.
- Nothing truncates the primary label at 200%; nothing overlaps.
- The brand face actually rendered in the screenshots (no silent fallback).

Answer each with a screenshot or source evidence. When the hierarchy holds, hand off to
`/android-design polish [target]`.
