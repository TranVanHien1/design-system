# Operate: app screens on a phone

How to compose the screens people work in: homes, overviews, lists, detail, forms, settings, wallets,
inboxes. Every screen of an Android app is Operate unless the brief says otherwise; an onboarding or
paywall screen may lean persuasive in *composition* while staying M3 in structure. Read this before
building or restructuring a screen. It never decides the visual world (that is
[new-work.md](new-work.md)) and never overrides M3 structure ([android-m3.md](android-m3.md)).

A generated app screen is the average of every template: "Welcome back" with a waving hand, four KPI
cards each with an icon in a tinted circle and a green "+12.5%", a gradient chart, then a `LazyColumn`
of identical cards. Nothing in it is wrong and none of it was decided.

## 1. The test

Would a fluent Android user trust this screen at once, or pause at every subtly-off component?
Product UI fails less by flatness than by strangeness without purpose: decorated buttons, invented
controls, display faces on labels, motion that performs. The bar is earned familiarity; the app
disappears into the task.

Quiet is the starting point, not the goal. In blind testing, clean and correct screens lost to richer
ones every time: the first screen was thin, the product was missing, restraint hid meaning (a bad
change in the same grey as a good one), and there was nothing to do. A screen people trust shows more
of the product than a template: its people, objects, numbers and the one thing to do next.

**What the world lends**: type, palette, density and one signature move. Never the layout, the
navigation model or the controls; a world taken from an instrument (a terminal, a cockpit) comes back
as a costume on a working screen.

## 2. The run for a screen

Do these in order; the first three decide whether the screen is any good.

**Inventory the data and the jobs.** In 8–12 lines of notes: the objects and their fields with units;
realistic magnitudes (how small a new account really is); who opens the screen and how often; what
they do next, and which job comes up most; the product's own things (name, mark, scope, people,
objects recognised by sight). Then write sample data in a fake repository or preview provider, totals
computed from the rows.

**Name the screen's one question.** "Hôm nay bán được bao nhiêu?", "Which order is late?", "How much
of this month's budget is left?" It decides what is biggest (the largest block, and the largest
figure, answers it), what comes first, and what is left out. Then name the **one finding**, the fact
in today's data that most needs attention ("3 orders past the 14:00 cut-off"), and put it where it is
read first: the line under the title, or the subline of the headline figure, beside the action it
drives.

**List the blocks as answers to the next questions**, one line each. A block with no question is
deleted. This is how you avoid the stock order of greeting, KPI row, chart, list.

**The first screen.** A 412×915dp phone loses about 48dp to the status bar, 64dp to the top app bar,
80dp to the `NavigationBar` and 24dp to the gesture area: about 700dp of content. Every block the
brief names shows its header and its first row there, which caps a first screen at about four
blocks: the answer block at 160–240dp and three more at header plus one or two rows. More blocks than
that is a signal to split into tabs or another destination, not to shrink everything. Cap long lists
at 3–5 rows with "Xem tất cả" and the total. Time-sensitive blocks (bills due, a failed sync) go
before long lists.

**The most frequent job is one tap away**, where the answer shows: the FAB if it is the screen's one
primary creation action, a filled button under the finding, or an action on the row that needs it.
A screen with no control for its main job is a report, not a tool.

**Show the evidence beside the answer.** "Error rate 0.28%" is trusted more with its spike explained
("peaked at 3.9% after the 23:28 release") than alone. One line on the event that matters beats a
second chart.

Then build the frame empty (`Scaffold`, top app bar, navigation, insets), put in the data, build every
state (§10), and check (§12).

## 3. Give the product a face

The theme makes a screen correct; these make it this product's. Decide them before building.

- **One signature element only this product has**, built from its own things: a bakery's sell-out
  strip, a home battery's power flow, a running club's pace groups, a couple's budget as two lanes.
  One per app, on the screen where it answers the question.
- **The brand hue on the main data element**: today's line, the booked bars, the current period, the
  balance's change. A screen whose only hue is a delta reads as a kit.
- **The product's name or mark in the top app bar** on root destinations where it fits (a 24dp mark
  plus the name in `titleLarge`); on detail screens the object's own name. Never a letter in a black
  square.
- **People and objects as themselves**: a stable initial and a pale tint per person, product photos,
  cover art. These tints are identity, not data; they stay out of chart legends.
- **Words of the trade** in labels and empty states ("Chờ khách xác nhận", "Hết hàng lúc 10:40"), never
  the template's generic nouns ("Items", "Dữ liệu", "Trạng thái").

## 4. App styles as M3 theming

Taste's seven app styles, derived from desktop screens, translate to theme settings. Navigation
stays `NavigationBar` in all of them; the style only changes roles, shapes and density.

| Style | Scheme | Color role usage | Shapes | Density |
| --- | --- | --- | --- | --- |
| Achromatic ledger (money, reports, settings) | Light, neutral seed | `primary` near-black for the one action; chrome on surface roles; one data hue as `tertiary`, only on the main series | Tight: small 6dp, medium 8dp, large 12dp | Sparse: 72dp rows, 24dp card padding |
| Framed sheet (analytics, dev tools) | Light | Top app bar and `NavigationBar` share `surfaceContainer`; content on a `surfaceContainerLowest` sheet; `primary` on the tab indicator and data | Medium 8dp; sheet top corners 16dp | Medium: 56–72dp rows |
| Accent ladder (creator, small-business admin) | Light | Full `primary` only on small marks (filled button, data, active icon); its containers carry areas: nav indicator, plan card, progress tracks | Small 6dp, medium 8dp | Sparse |
| Editorial greeting (personal or team home) | Light | Tonal panels on `surfaceContainerLow`; accent under 2%; figures at regular weight | Extra-large 24–28dp; pill buttons | Sparse; the greeting in a serif `headlineLarge`, home screen only |
| Pastel consumer (wallets, budgeting) | Light | Category tints as `ExtendedColors` container pairs; income with "+" in `positive`, spending in `onSurface` | Large 20dp, stepping to 12 and 8 inside | Medium: 72dp rows, `bodyLarge` |
| True-black flat (community, events, media) | Dark, `surface` overridden to black | Elevation by `surfaceContainer` lightness only; primary button inverted (`primary` white, `onPrimary` black); indicator neutral; hue on data only | Extra-large 20dp; pill controls | Medium: 80dp media rows |
| Data terminal (markets, monitoring) | Dark | Selection as a 1dp `primary` line; numbers keep signs, not colors; monospace figures by decision | Tight: 4–6dp | Dense: 56dp rows, `bodyMedium`, 48dp targets kept |

Choose by how the product is used (a quick look or long sessions, money or media, day or night), not
by familiarity, and write one line on why. Two products dealt the same style must not get the same
face (§3).

## 5. The top of the screen

- **Title is a noun**: the destination ("Đơn hàng"), the object's name, or the product on a root
  screen. A greeting suits a personal home only, without emoji. One `bodyMedium` line in
  `onSurfaceVariant` under it may carry the finding, the period or the scope; never instructions about
  the interface.
- **Top app bar**: `TopAppBar` by default; `MediumTopAppBar` or `LargeTopAppBar` collapsing on scroll
  for long titles or a root screen. At most two action icons, the rest in overflow.
- **Scope controls**: one row at most above the content. Filters as a horizontally scrolling row of
  `FilterChip`s, or a Filters sheet; states as `PrimaryTabRow` (scrollable when more than four). The
  first list row starts in the top 60% of the screen.
- **Period**: for the screen or per block, never both; a block's period sits end-aligned in its header.

## 6. KPIs as type, not tiles

- **No tile per figure.** A label over a value; several figures in a 2-column grid inside one
  container, or as a list with the label at the start and the value at the end. Never four squeezed
  columns. In a 2-up grid an odd count lets the last cell span both columns.
- **Sizes from the scale.** The answer figure (a balance, today's sales) in `headlineLarge` (32sp) or
  `displaySmall` (36sp), at least 1.3× its siblings in `titleLarge` (22sp). Nothing on a working
  screen goes above `displaySmall`; a 45sp figure makes it a landing page. Labels in `labelLarge` or
  `bodyMedium`, `onSurfaceVariant`, sentence case.
- **Nothing else**: regular or medium weight, tabular figures, no icon in a circle, no sparkline, no
  tinted tile. Units as a smaller `onSurfaceVariant` suffix ("5 phút", "12 / 20").
- **One figure, one place.** A figure in the strip is not repeated in the block below; often better,
  drop the strip and lead each block with its own number.
- **Deltas** are optional, `bodySmall`, never larger than the label, with the window in words ("so với
  7 ngày trước"). Color says good or bad, not up or down: latency, cost and churn are better falling.
  The bad direction takes `error` (plus a glyph or sign, never color alone); the good direction a
  `positive` extended role or `onSurfaceVariant`. Zero or undefined change is grey; from zero, write
  "+4 (mới)".
- **KPIs as tabs**: figures may select the chart's series. The selected cell takes the container fill
  or an indicator; unselected values stay in `onSurface` ink, because a grey value reads as disabled.

## 7. Charts

Draw with Vico (`compose-m3`) or `Canvas`, never a library's default styling and never a picture of a
chart. When a few numbers say it, draw no chart.

| Question | Form |
| --- | --- |
| Moving over time? | One line; area fill only at ≤15% alpha |
| How much per period? | Columns, square or 4dp top radius |
| Who ranks? | A sorted bar list, not a chart |
| What share? | A thin ring or a 100% stacked bar, five parts at most, values in a legend list |
| How far to target? | A bar at the true ratio, both ends labelled ("12,7k / 20k") |
| Forecast? | Dashed after today, end value labelled |

- **Size**: full content width (380dp), 160–200dp tall.
- **Chrome**: 3–5 horizontal gridlines, 1dp, `outlineVariant`; no y-axis line; y labels in their own
  lane at the start (or the end), 4–6 round ticks with the top tick above the maximum and zero as the
  baseline for bars; 3–4 x labels, never rotated, on one step. Axis text in `labelSmall`, never larger
  than the data.
- **Marks**: 2dp straight segments, no point markers; no smoothing (it invents values).
- **One hue per series**, three series at most: the main series in `primary` (the brand on the data),
  comparison series in `outline` or `onSurfaceVariant`. One subject keeps one hue across the app. Switch
  metrics with `SingleChoiceSegmentedButtonRow` instead of overlaying.
- **Legend**: none for one series; otherwise labelled dots above the plot.
- **Touch**: press and drag shows a marker with label and value on one line.
- **Annotate the event that matters**: a 1dp marker and a `labelSmall` cause ("Bản 2.4.1"); reference
  lines (budget, target) 1dp dashed with their label at the end. Labels never collide with the line.
- **TalkBack**: the chart is one node whose `contentDescription` states the finding ("Doanh thu 7 ngày,
  cao nhất 4,2 triệu ₫ thứ Bảy"), with the values available as a list.
- **Short and empty histories are drawn honestly**: the zero line, missing bars, no padded range.

## 8. Lists

Most of an app is lists; get `ListItem` right before anything else.

- **Anatomy.** `headlineContent` (`bodyLarge`), `supportingContent` (`bodyMedium`,
  `onSurfaceVariant`), `leadingContent` (24dp icon, 40dp avatar or 56dp thumbnail, one fixed slot down
  the list so text starts on one edge), `trailingContent` (a meta text, a figure, or one control:
  `Checkbox`, `Switch`, `RadioButton`, `IconButton`). Leave `overlineContent` empty unless it carries
  data, such as a date.
- **Heights**: one-line 56dp, two-line 72dp, three-line 88dp; 16dp side insets. Overview lists show
  3–5 rows.
- **Dividers or spacing**, one choice per screen: `HorizontalDivider` in `outlineVariant`, inset to
  the text column when rows have leading media; or no dividers and the pitch alone. No zebra.
- **Ink**: only the identity and the key figure in `onSurface`; everything else `onSurfaceVariant`.
  One status mark per row, as a pale container with its `on*` ink.
- **Numbers** end-aligned in the trailing slot, tabular, fixed decimals per metric (₫ none, % one, USD
  two), a sign on every change, the unit smaller and grey. Two measures stack in one trailing column on
  one end edge (an amount over its date).
- **Actions.** The whole row opens its object. A row that needs doing (pay, pack, reply) gets one
  visible trailing action, the same on every row. Swipe actions are mirrored as `customActions` and an
  overflow item. Long-press enters selection mode with a contextual top app bar; checkboxes appear only
  then.
- **Long lists**: the count above, `stickyHeader` for date groups, load more at the end with the range
  ("1–50 / 1.284").
- **Tables become two-line rows**: identity and key figure on line 1, the other fields the brief names
  on line 2 ("Q.1 · 1 giờ 38 phút"), the action at the end. Fields move; they are never dropped. A table
  that must stay a table scrolls sideways inside its own frame with the first column fixed.

## 9. Forms and settings

**Fields.**

- `OutlinedTextField` or `TextField`, one style app-wide, full width on compact, 16dp apart. The M3
  floating label is the platform; a placeholder never replaces the label, and is only an example
  format.
- `supportingText` carries the format hint, then the error. Validate on focus loss or submit, not per
  keystroke; the error names the problem and the fix ("Số điện thoại cần 10 chữ số") and stays until
  fixed. Never clear the user's input on error.
- `KeyboardOptions`: the right `keyboardType`, `ImeAction.Next` on every field but the last, which
  submits with Done, Send or Search; `KeyboardCapitalization.Words` for names; autofill content types.
- The submit button stays reachable above the IME (`imePadding()`). A disabled submit says why in
  supporting text; prefer enabled with validation on tap.
- One save model per screen: every control saves itself with a quiet confirmation, or one explicit
  Save. Leaving with unsaved input asks once.
- Choices: up to five short options as segmented buttons or radio rows; more as
  `ExposedDropdownMenuBox` or a sheet; dates in `DatePickerDialog`.

**Settings.**

- A list of `ListItem`s grouped under `titleSmall` headers (in `primary`, the platform's settings
  convention, or `onSurfaceVariant`; one choice app-wide).
- A switch row toggles from the whole row (`Modifier.toggleable(role = Role.Switch)`); its supporting
  text states the current effect. A navigation row shows the current value as supporting text, no
  trailing chevron.
- Each area is its own screen, not one endless scroll.
- Show what a setting produces beside it: the notification as it will arrive, the next invoice.
- A disabled row stays legible and says why ("Cần gói Pro").
- Destructive actions last, as an `error`-colored text button, confirmed by a dialog naming the object
  and the consequence.
- A usage strip (bars at the true ratio, both ends labelled) only on a plan or quota screen.

## 10. States

Design states map one-to-one to `UiState` variants; the screen composable is a `when` over them.

```kotlin
sealed interface OrdersUiState {
    data object Loading : OrdersUiState
    data class Empty(val filtered: Boolean) : OrdersUiState
    data class Error(val lastUpdated: Instant?) : OrdersUiState
    data class Content(
        val orders: List<OrderRow>,
        val refreshing: Boolean = false,
        val offlineSince: Instant? = null,          // cached rows shown
        val failedBlocks: Set<Block> = emptySet(),  // partial data
    ) : OrdersUiState
}
```

- **Loading** (nothing cached): the final layout with labels and headers shown at once and each value a
  flat `surfaceContainerHighest` bar at its real size; rows keep their pitch; no shimmer; nothing
  shifts when data lands. A blocking action shows progress inside its button. A refresh keeps the old
  values under `PullToRefreshBox` or a `LinearProgressIndicator` below the top app bar. No full-screen
  spinner.
- **Empty keeps the frame**: top app bar, tabs, filters and block headers stay; one sentence in the
  trade's words and the next action where the data will appear. A filtered empty names the filter and
  offers to clear it. First run puts the first action where the data will be, with setup progress at
  its true percentage.
- **Error** lives in the block that failed: what failed, when the data was last good, and a "Thử lại"
  text button ("Không tải được đơn hàng. Cập nhật lúc 09:14."). Full screen only when nothing can render,
  and still with the top app bar and Back. A failed action is a `Snackbar` with Retry; input is kept.
- **Offline**: cached content stays; one quiet line under the top app bar with the last sync time;
  network actions say they are queued or why they are unavailable.
- **Partial data**: render what loaded; the failed block shows its own error; a total depending on the
  missing part shows "—", not a wrong number.
- Every variant gets a `@Preview` through a `PreviewParameterProvider`, and a screenshot test
  ([verify.md](verify.md)).

**Honest data.** A real zero prints as "0", "0 ₫", "0%"; missing or not applicable is "—" in
`onSurfaceVariant` at body size, never a large "--" that reads as loading. Counts in tabs and chips
follow the current filter. A fact shown twice is one variable. Totals and changes are computed from
the values as displayed. Every relative figure names its baseline. No growth on a week-old account.
Red marks the one failing fact per object, not every negative.

**Density** is three settings moved together: row height, padding and type size. Sparse (homes,
settings): 72–88dp rows, 24dp padding, `bodyLarge`. Medium (overviews, lists): 56–72dp, 16dp. Dense
(monitoring): 56dp, 12dp, `bodyMedium`, never below 48dp targets. Placed space reads as calm;
leftover space reads as unfinished.

**Motion** is feedback: press, a sheet opening, a row arriving (`animateItem()`), a container transform
from row to detail. Nothing performs an entrance on load.

## 11. Taste patterns on a phone

| Pattern | On a phone |
| --- | --- |
| wallet-balance-actions-assets | Balance header (the answer figure, change line), a row of 3–4 action buttons, the asset list as two-line rows |
| kpi-strip-chart-rail | 2-up figures, full-width chart, the rail's stream as a capped list below |
| kpi-tabs-chart | Figures as the chart's selectable series |
| count-cards-filter | `FilterChip`s with counts ("Chờ duyệt 5"), or 2-up selectable count cells |
| table-filter-bar | Tabs for states, search, a chip row, two-line rows, total above |
| insights-share-tables | Sections by space and titles, 2-up figures, one chart, the share table as a legend list |
| report-card-legend-table | Answer figure, chart, legend rows with dot, name, value and change |
| bar-list-ranking, research-lists-table | Ranked rows with a 2dp proportional bar under the label, or the row fill as the bar in one-figure lists |
| deploy-health-lead, platform-overview-tray | Object name and status chip as the title, the finding line, the primary recovery action, sections each with "Xem tất cả" |
| object-detail-header-grid, tabbed-object-detail | Object header (thumbnail, `titleLarge` name, meta line, tonal actions), `PrimaryTabRow`, stacked blocks |
| inbox-triage | `ListDetailPaneScaffold`: one pane on compact; Back returns to the list at its scroll position |
| workspace-home-greeting | Greeting allowed on the personal home only, 2-up counts, no 12-column grid |
| settings-two-column, settings-with-usage | Grouped settings list; label stacks over control; usage strip on plan screens only |
| power-flow, sell-out-strip, cover-matrix (one week), leave-timeline (agenda or a sideways day strip with a fixed people column) | Signature elements; they fit 380dp |

Dropped on compact: finance-home-pinned-rail (no room to pin a column; net worth becomes the header),
chart-pairs side by side (one chart with a "Theo ngày / Luỹ kế" toggle), builder-canvas editing
(read-only view, light edits in a sheet), and generated-report's viewer chrome.

## 12. The check

Look at the captures from [verify.md](verify.md) and answer in writing:

1. Is the one question answered by the biggest thing on the first screen, and read first?
2. Does every named block show its header within the first ~700dp?
3. Is color only on data, status, selection and the one primary action, with the brand hue on the
   main data element? Does the product's face show?
4. Do the numbers add up and line up digit for digit? Does every zero look like a zero, every missing
   value like a dash?
5. Does every `UiState` variant render, in both schemes, at font scale 2.0, in Vietnamese?
6. Is the main job one tap away?

Fix the worst three and look again; three rounds at most. If a problem shows in a capture, it is real,
whatever the code says. Then [craft-floor.md](craft-floor.md) and [tells.md](tells.md).
