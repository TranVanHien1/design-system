# Layout

`layout` turns product priority into reading order, grouping, rhythm and usable space on an Android screen. Use
it when a screen feels cramped, flat, monotonous or disordered, or when it stretches badly beyond a phone. It
changes structure inside the established visual world; it does not restyle the theme (that is
[new-work.md](new-work.md)) and it never moves M3 structure (app bars, navigation, FAB, sheets) off-spec. Diagnose
the structural problem before moving boxes.

Operate screens (most of an app) need predictable structure, stable density and linear reading; those are
affordances, not a lack of ambition. An onboarding, paywall or empty-state screen may lean Persuade in
composition (asymmetric, one large element, more air) while its scaffold stays M3. Platform structure lives in
[android-m3.md](android-m3.md); app-screen patterns (lists, cards, KPIs, forms, settings) in
[operate.md](operate.md).

## Two isolated assessments

Run these separately (a sub-agent for one when available), then synthesize before editing.

1. **Layout assessment.** Inspect representative states on a compact phone (412×915dp) and, when the app ships
   there, a medium/expanded window. Answer each with a screenshot or source evidence:
   - **Reading order:** squint at the screenshot. Can you still name the primary element, the secondary one,
     and the major groups, in order?
   - **Grouping:** are related items close and groups separated by space, or are `Card`s and dividers
     compensating for weak proximity?
   - **Rhythm:** do tight and generous intervals create a cadence, or is `16.dp` repeated until everything has
     equal weight?
   - **Structure:** do repeated cards, rows or grid cells hold genuinely equivalent content, or is it a
     template default?
   - **Density:** does information per region fit use frequency and decision complexity?
   - **Adaptation:** at medium/expanded width, landscape, font scale 200% and a long localized string, what
     reflows, wraps, scrolls or stays fixed? Does TalkBack traversal order still match the visual order?
   - **Extremes:** long names, empty and error `UiState`s, the IME open, 3-button nav, display cutouts.
2. **Mechanical scan.** Grep for spacing off the scale and inset mistakes:

```bash
rg -n '[0-9]+(\.[0-9]+)?\.dp' --glob '*.kt' <target> | rg -v '\b(0|8|12|16|24)\.dp'
rg -n 'statusBarsPadding|navigationBarsPadding|systemBarsPadding|WindowInsets|imePadding|contentPadding' --glob '*.kt' <target>
rg -n 'Card\s*\(' --glob '*.kt' <target>
```

Component dimensions (a 56dp FAB, a 40dp icon button) are not spacing; judge the rest. A clean scan cannot
prove hierarchy or rhythm.

## Set the spatial thesis

Before editing, name: the primary task path; what belongs together and what must separate; which element leads
and which supports; the intended density and rhythm; and how the structure changes across window size classes,
font scale and content extremes. Choose the simplest structural model that expresses those relationships.

## The spacing scale

**Team rule: padding, margin and gap use only 8 · 12 · 16 · 24 dp** (0 allowed), and the step is chosen
by what the component is, not by eye:

| Token | dp | Job (pick by component) |
|---|---|---|
| `sm` | 8 | icon ↔ label inside buttons, chips, badges, tabs; between chips; **between cards in a horizontal rail**; **between side-by-side buttons in a sheet**; small glyph (24) inset from a card corner; banner → pager dots; vertical padding of pills, tabs and list rows; inset of small tiles (≤110dp wide) |
| `md` | 12 | **grid gutters** (2-column wallpaper/theme grids); section title → its content; header icon ↔ title; badge (28) inset from a card corner; inner padding of small cards, pills' long side, caption strips; header → first block |
| `lg` | 16 | screen side margin; between blocks of a feed (banner, search, sections); card, banner text and list-row padding; dialog and floating-sheet padding; floating sheet inset from the screen edges; between stacked buttons in a dialog; bottom bar; leading icon → text in a list row; button side with an icon; between the icons and the CTA in a detail action row |
| `xl` | 24 | between blocks of a detail / preview screen (header → pager → actions) and between pager cards; between blocks inside a dialog (art → text → buttons); empty / success block insets; screen margin (medium+) |

Measured on the team's Figma (2026-11-05 padding pass, [components.md](components.md) §15): the files use 16 for the margin and feed gaps, 8 for rails, 12–15 for grid gutters, 12 for header and badge insets, 24 for detail columns, 16 for dialog/sheet padding; their odd values (4 title→subtitle, 13, 14, 15, 20) map to the steps above. Title → subtitle stacks use no gap: the line height carries it.

Nothing else: no 2, 4, 6, 10, 14, 20, 28, 32. Larger air comes from stacking steps (24 + 24) or from
centring short content in its space, never from a one-off 40 or 56. Combined spacing must still land on
the scale (a 12dp `gap` plus a 12dp margin = 24, not 12 + 8 = 20). Component dimensions (a 48dp target, a
56dp FAB, a 40dp icon button's fill) and positions of overlays are not spacing, but overlay insets
(badge at 8, card content at 12/16) follow the same steps. A 40dp control inside a 48dp target is drawn
inside the target, not offset with a 4dp margin.

Expose the scale as an object or a `CompositionLocal` in `ui/theme/Spacing.kt` so screens never type raw
values. In the HTML flow, `build-flow.mjs` warns on every off-scale value (ad units and template screens
marked `data-spacing="template"` are exempt).

## Compose primitives by relationship

- **Siblings with one rhythm:** `Column(verticalArrangement = Arrangement.spacedBy(8.dp))`. Prefer `spacedBy`
  over per-child `padding` or `Spacer` chains; use a `Spacer` only where one gap deliberately breaks the rhythm.
- **Overlay:** `Box` with `Modifier.align`. **Proportional split:** `Row` with `Modifier.weight`.
- **Scrolling lists:** `LazyColumn` with stable `key`s, `contentType`, and `verticalArrangement =
  Arrangement.spacedBy(...)`. Never nest a vertically scrolling list inside `verticalScroll`.
- **Grids:** `LazyVerticalGrid(columns = GridCells.Adaptive(minSize = 160.dp))` so column count follows width
  instead of a hardcoded 2.
- **Rows of variable chips or tags:** `FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp))`.

## Scaffold, insets and margins

Apps are edge-to-edge (`enableEdgeToEdge()` in the Activity; enforced when targeting Android 15+). Let the
`Scaffold` own insets and pass them through, so content scrolls under translucent bars but rests clear of them:

```kotlin
Scaffold(topBar = { TopAppBar(title = { Text(title) }, scrollBehavior = scroll) }) { inner ->
    LazyColumn(
        modifier = Modifier.nestedScroll(scroll.nestedScrollConnection),
        contentPadding = PaddingValues(
            start = 16.dp, end = 16.dp,
            top = inner.calculateTopPadding() + 8.dp,
            bottom = inner.calculateBottomPadding() + 24.dp,
        ),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) { items(rows, key = { it.id }) { Row(it) } }
}
```

- Apply insets once. Double padding (Scaffold padding plus `systemBarsPadding()`) is the common bug.
- Use `contentPadding`, not `Modifier.padding`, on lazy lists, so the last item scrolls clear of the nav bar.
- Forms and chat: `Modifier.imePadding()` (or `WindowInsets.ime`) so the focused field stays above the keyboard.
- Full-bleed imagery may draw under the status bar; text and controls never do (`WindowInsets.safeDrawing`).
- **M3 margins:** 16dp on compact, 24dp on medium and expanded. On expanded, cap reading content near 600–840dp
  with `Modifier.widthIn(max = …)` and let panes use the rest; never stretch a paragraph to 1200dp.

## Canonical layouts beyond the phone

Restructure by `WindowSizeClass`, never by device model ([adapt.md](adapt.md)): **list-detail**
(`NavigableListDetailPaneScaffold`) for inboxes, contacts, settings and files; **supporting pane**
(`SupportingPaneScaffold`) for content plus context (a document and its comments, a player and its queue);
**feed** as a `LazyVerticalGrid` with adaptive cells.

## Apply

- Group by meaning. Use proximity before adding a `Card`, `Surface` or divider.
- **Hierarchy without extra cards:** a section is a `titleMedium` label plus 8dp to its rows plus 32dp before
  the next section. Reach for a container only when it does a job: a tappable unit, a distinct surface tier
  (`surfaceContainerLow` vs `surface`), or content that moves as one. Never nest a card inside a card, and
  never wrap every list row in its own card; `ListItem` rows with space or an inset divider read faster.
- Create rhythm through contrast between tight and generous gaps; the gap between groups is clearly larger than
  any gap inside one, and a heading has more space above it than below.
- **Alignment:** one left edge per column of content; text baselines and icon centers align across rows; the
  leading icon column in a list is fixed-width so titles line up. Center only short, standalone content
  (empty states, a single hero number); never center paragraphs or forms.
- Keep touch targets at 48×48dp even when the visible mark is smaller
  (`Modifier.minimumInteractiveComponentSize()`, or padding inside the clickable), with 8dp between targets.
- Put the primary action where the thumb is (FAB, bottom-anchored button, end of the form), not in the top app
  bar alone. Use depth (tonal elevation, surface tiers) only to clarify hierarchy, never as garnish.
- Make optical corrections only after looking at a screenshot.

Variation is not a goal. Repetition supports recognition; break it only when content or priority changes.

## Verify

Look at device or screenshot-test output per [verify.md](verify.md): compact portrait and landscape, medium or
expanded when shipped, font scale 2.0, dark theme, a long Vietnamese string, the IME open.

- The squint test still shows primary, secondary and major groups in order.
- Nothing hides behind system bars or cutouts; nothing is padded twice; no card exists only to separate.
- Spacing comes from the scale; the rerun scan has no unexplained values.
- TalkBack order matches visual order (`Modifier.semantics { isTraversalGroup = true }` where an overlay
  confuses it).

Answer each with evidence, not a bare "yes". When the structure holds, hand off to `/android-design polish
[target]`.
