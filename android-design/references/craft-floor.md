# Craft floor

Read this immediately before any UI edit, including a one-line refinement; not for planning-only
work. Build without announcing the checklist. A pinned brief
or DESIGN.md overrides anything here except a ban and the Material 3 structure rules in
[android-m3.md](android-m3.md); your own habit overrides nothing.

## Verify

Each line is a check on the built result, not an intention. Run them together in one batched look
([verify.md](verify.md)), all read from the same captures.

- **Contrast.** Body, supporting and label text ≥4.5:1 on its surface; large text (≥24sp, or ≥19sp
  bold) and meaningful marks (field outlines, switch tracks, chart lines, icons that act) ≥3:1. Check
  both schemes plus one dynamic scheme from a real wallpaper. On a colored container, secondary text
  comes from its `on*` role, never a flat grey.
- **Color roles, not literals.** Every color in a composable comes from `MaterialTheme.colorScheme`
  or the project's `ExtendedColors` local. A `Color(0xFF…)` outside the theme files is a second
  palette starting. Containers pair with their own `on*` role.
- **Touch targets.** 48×48dp for everything tappable, 8dp apart; custom clickables get
  `Modifier.minimumInteractiveComponentSize()`.
- **Type.** Every size is `sp` from `MaterialTheme.typography`. At `font_scale 2.0` the real copy
  never clips or overlaps; text containers use `heightIn(min = …)`, not `height`. Numbers that line
  up or update carry `fontFeatureSettings = "tnum"`.
- **Spacing.** Padding, margin and gap only 8 · 12 · 16 · 24dp, picked by component type
  ([layout.md](layout.md) table): 8 icon↔label, chip gaps, badge insets; 12 between sibling tiles/cards
  and buttons, title → content; 16 screen margin, card/banner/row padding, bottom bar; 24 dialog/sheet
  and empty-block insets, between big groups. No 4/6/10/14/20/32. More space above a section title
  than below it.
- **Motion.** Feedback everywhere, one authored moment per flow at most, M3 motion tokens; with
  Remove animations on, a cut or a crossfade.
- **Insets.** `enableEdgeToEdge()` on; content clears status bar, navigation bar, cutout (rotate to
  landscape) and IME. The last row scrolls above the navigation bar.
- **Dark theme.** A designed `darkColorScheme`, not an inversion: elevation as tonal surface steps,
  images that hold up, no pure-white body glaring on black.
- **States.** Every `UiState` variant renders: loading, content, empty (first run and filtered),
  error, offline, partial; every control its pressed, focused, disabled and selected states
  ([operate.md](operate.md)).
- **TalkBack.** Actionable icons have a `contentDescription`, decorative ones `null`. Rows merge
  into one announcement, toggles announce state, swipe actions exist as `customActions`, section
  titles are `heading()`, traversal follows the visual order.
- **Back.** Predictive Back previews the destination on every screen; a `BackHandler` only closes
  something open (sheet, search, selection) or confirms discarding real input.
- **Copy and content.** The product's own words; controls name their action, errors name the
  problem and the recovery. Real data at true magnitude, long names and zeros tried; every brief
  requirement findable within seconds.
- **Icon first, words only when needed.** Visible text is kept for what an icon cannot say: screen
  and section titles, item names, user content (hashtags, names), the primary action's verb, form
  labels and errors. Everything else becomes a familiar Material Symbol with a `contentDescription`:
  "see all" is an arrow button, type/quality marks are icon badges, secondary filters and tabs are
  icon chips (the selected one may show a short label), nav bars may go icon-only with labels in
  `contentDescription`. Cut explanatory sentences under titles, in sheets, dialogs and empty states
  to one short line or none; a sheet option is icon + 1–3 words, not title + subtitle.
- **Vertical balance.** Read each screen top to bottom as weights: no large hole under short
  content and no crowding at the bottom. Short content (empty, error, success, a single form) is
  centred in the space between the top bar and the bottom bar; a hero object (detail card, preview)
  is centred between its top bar and its action row with equal gaps; lists and grids are sized to
  end near the bottom bar (add a row, resize tiles, or let the last field grow) rather than stop
  half-way; choices in sheets are equal tiles side by side, not stacked rows of unequal text.
- **Vietnamese.** Run the app in `vi-VN`: stacked diacritics (Ấ, Ỗ, Ự) unclipped by tight
  `lineHeight` or fixed-height chips; the brand face covers Vietnamese, or glyphs fall back mid-word;
  buttons and tabs survive longer strings; `1.250.000 ₫` and `04/11/2026` come from locale formatters.

**The parts you didn't draw** still carry the design. They ship with defaults that belong to no
theme, and theming them is the cheapest proof the app was built rather than assembled:

- Status bar icons: dark on light surfaces, light on dark, including under a colored or image header.
- Navigation bar: transparent under gestures; under 3-button navigation a scrim matching the bottom
  surface, never a stray black band.
- Ripple and state layers in theme colors (`RippleConfiguration`).
- Text cursor, selection handles and highlight from the palette (`LocalTextSelectionColors`).
- Long lists people jump through (contacts, an archive): a fast-scroll thumb; Compose draws none.
- Keyboard: the right `KeyboardType`, an `ImeAction` naming the next step, autofill hints.
- Splash screen via `core-splashscreen`: themed background, icon in its safe circle, no extra delay.
- App icon: adaptive, mark inside the 66dp safe zone, plus a monochrome layer for themed icons.
- Notification small icon: a 24dp white silhouette on transparent, accent set with `setColor`.

## Refuse

The category's defaults, not bans: the brief's own words can earn any of them. Reaching for one when
the axis is free means you were not deciding; recognizing that means rewriting the element, not
softening it.

Screen scaffolds:

- Every screen a `LazyColumn` of same-size cards, each an icon plus title plus text. Cards are the
  lazy container; a `ListItem` does most of their jobs.
- The hero-metric template: a big number, a small label, three supporting stats, an accent.
- Section numbers (01, 02, 03) unless the sequence carries information the user needs.
- A dialog for a task that needs neither interruption nor protected focus. Inline first, then a
  sheet or a screen; feedback is a snackbar.

Surface habits:

- Gradient brushes on text, buttons, app bars or cards. Emphasis comes from weight and size.
- Blur and translucency as decoration rather than one specific effect.
- A colored stripe thicker than 1dp down the start edge of cards, list items or alerts.
- Hard offset shadows outside a neobrutalist world; shadow on a resting card where a tonal step works.
- Progress rings, sparklines and rounded placeholder blocks standing in for content.
- Monospace as a costume for "technical" rather than for code, IDs or measurement.
- Roboto as the display voice of an app whose world calls for character. Roboto stays a fine body
  face; a display face is bundled in `res/font` and checked for Vietnamese. The closest installed
  font is a failure, not a fallback.
- Dynamic color as the whole color decision for an app whose brand must be recognized.
- Light or dark picked by category. Both ship; pick which is designed first from the use scene.

## Bans

Never acceptable, whatever the brief says:

- An eyebrow or overline label above a heading. The heading carries its own weight.
- A card inside a card.
- Emoji or Unicode glyphs as icons, bullets or status. Icons come from one Material Symbols style
  (outlined, rounded or sharp) at one weight, filled only for the selected state.
- iOS controls or navigation on Android: Cupertino switches, action sheets, a custom tab bar in
  place of `NavigationBar`.
- Blocking or hijacking system Back; content under system bars or the keyboard.
- Disabling font scaling (overriding `LocalDensity`'s `fontScale`, sizing text in `dp`).
- Meaning carried by color alone: status, errors and selection also have text, an icon or a shape.
- Invented proof or placeholder data in a shipped build: lorem ipsum, "Nguyễn Văn A", vanity totals,
  ratings nobody measured.

The floor holds the mechanics; it never picks the direction. With every check green, spend the screen
on the committed world, and when torn between refined and committed, commit. For the dated list of
what reads as generated, see [tells.md](tells.md).
