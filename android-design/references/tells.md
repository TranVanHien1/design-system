# Tells — the dated registry

A tell is a device that makes an Android app read as generated or templated. Most began as good ideas
in good apps; they became tells by being produced by default, everywhere, without a reason. That is
why this registry is dated (last revised 2026-11) and why "do instead" is a procedure, never a named
font, color or library: every published "use this instead" list becomes the next wave of tells
within months.

**ban** means fix it before the screen ships. **warn** means it needs a reason you can state in one
sentence to a designer. [critique.md](critique.md) and [audit.md](audit.md) check this list; the
floor in [craft-floor.md](craft-floor.md) carries the bans that hold even against a brief.

Material 3 structure is not a tell. The `NavigationBar` indicator pill, tonal containers, FAB, top
app bar and floating labels are the platform; a tell is a default *expression* left untouched, or a
web or iOS habit carried in.

## 1. Theming tells

| Tell | Status | Do instead |
| --- | --- | --- |
| The baseline scheme shipped unchanged: primary `#6750A4` (the template's `#6650A4`), `Purple40` / `PurpleGrey40` / `Pink40` still in `Color.kt` | ban | Derive the scheme from the product's seed (`node <skill>/scripts/theme.mjs`, [colorize.md](colorize.md)); every role set, light and dark |
| Dynamic color as the only scheme, with the template purple as its fallback | warn | A designed brand scheme; dynamic color as an opt-in, with brand-critical marks pinned in `ExtendedColors` |
| Only primary, secondary and tertiary set; surface and container roles left at baseline | warn | The full role set, including the five `surfaceContainer*` steps, tuned per scheme |
| Gradient everything: app bar, buttons, cards, the balance header | ban | Flat roles; one gradient at most, under a single line chart at ≤15% alpha |
| Violet or indigo as the "safe tech" accent | ban (unless the brand owns it) | The dealt palette from [new-work.md](new-work.md) |
| Cream ground with terracotta or rust accent as the "warm" fix | ban | Warmth from a low-chroma stone ground, a deep ink, photographs, or one full warm field |
| Neon accent on near-black, with a glow | ban | A designed dark scheme; depth from tonal steps, color on data |
| Glass panels, `Modifier.blur`, translucent cards | warn | Opaque surfaces one tonal step from the ground |
| `ElevatedCard` or an 8dp shadow under every card | ban | Tonal elevation or `OutlinedCard`; shadow only on what floats |
| One hand-typed `RoundedCornerShape(16.dp)` on everything, beside other hand-typed radii | warn | `MaterialTheme.shapes` tuned once, tight or soft, nested radii stepping down |
| `Typography()` untouched when the world calls for a voice | warn | A tuned type scale; a bundled display face on display and headline roles ([typeset.md](typeset.md)) |
| The accent on chrome: primary-filled top app bar, primary FAB, every button filled | warn | Color on data, the one primary action, and the selected state; app bars on surface roles |
| Saturated status chips with white text | ban | Pale container role with its `on*` ink (`errorContainer` / `onErrorContainer`, custom success and warning pairs) |
| An icon in a tinted circle on every row, card or KPI | warn | Tonal containers where they are the component (avatars, `FilledTonalIconButton`); elsewhere one plain 24dp icon or none |
| Rainbow charts: a hue per bar, one subject in two hues | ban | One hue per series, `primary` on the main series, neutrals for the rest |

## 2. Structure tells

| Tell | Status | Do instead |
| --- | --- | --- |
| iOS patterns on Android: "‹ Back" text buttons, centered titles on every screen, Cupertino switches, action sheets, stacked alert buttons | ban | M3 `TopAppBar` with navigation icon, `Switch`, `ModalBottomSheet`, `AlertDialog` ([android-m3.md](android-m3.md)) |
| A custom bottom bar: a `Row` of icons in a shadowed `Box`, or a floating blurred pill | ban | `NavigationBar` with 3–5 labelled destinations; `NavigationSuiteScaffold` when the app is adaptive |
| Two FABs, a FAB for a secondary task, a FAB on every screen | ban | One FAB for the screen's one primary action, or none |
| Cards inside cards | ban | One container; group inside it with space and dividers |
| Every screen a `LazyColumn` of identical cards | warn | `ListItem` rows with dividers or spacing; cards only for peer objects with their own actions |
| A navigation drawer on a phone with five destinations or fewer | warn | `NavigationBar` |
| A confirmation dialog for a reversible action; a dialog as the first idea | warn | Act, then a `Snackbar` with Undo |
| `Toast` for feedback | warn | `Snackbar`, actionable when useful |
| A greeting or illustrated banner over half the first screen | warn | A noun title; the screen's answer above the fold ([operate.md](operate.md)) |
| Overline or tracked uppercase label above every section | ban | A `titleMedium` section title in sentence case, or nothing |
| Zebra rows, uppercase table headers, left-aligned numbers | ban | Dividers or spacing, sentence-case headers, right-aligned tabular figures |
| Pagination buttons under a list | ban | Capped rows with "View all", or load-more with the range shown |
| The phone layout stretched onto a tablet | warn | Window size classes; rail or list-detail on medium and expanded ([adapt.md](adapt.md)) |
| A splash Activity with a two-second logo, then a three-slide carousel before any value | warn | `core-splashscreen`, then the first useful screen; onboarding in context ([onboard.md](onboard.md)) |

## 3. Content tells

| Tell | Status | Do instead |
| --- | --- | --- |
| "Welcome back, Minh 👋" as the title of a working screen | ban | A noun title; a greeting only on a personal home, never with emoji |
| KPI tiles: icon in a tinted circle, value, green "+12.5%" pill, sparkline | ban | Figures as type: label over value, the delta in words with its window ([operate.md](operate.md)) |
| Fake numbers: round vanity totals, growth on a week-old account, totals that don't add up | ban | Data computed from rows, small numbers at their real size |
| Emoji as icons, bullets or status | ban | Material Symbols, one style, or words |
| Lorem ipsum, "John Doe", "Nguyễn Văn A", "Acme", "User 1" | ban | Believable sample data listed in the report for replacement |
| A fat donut with labels on the slices and the total in the hole | warn | A thin ring for 3–5 parts, or a sorted bar list; values in a legend list |
| A smoothed gradient area chart with a dot on every point | warn | A 2dp straight line, no markers, fill ≤15% or none |
| Status color on a zero change: green "+0%", red "0.00%" | ban | Grey, or the change in words: "+4 (mới)" |
| An illustration and "Không có dữ liệu" in an empty list or chart | warn | The frame kept, the zero line drawn, one sentence in the trade's words and the next action |
| A screen that names no product and offers no action | warn | The product's mark or object in the top app bar; its main job one tap away |
| A different colored icon per category down a list | warn | One icon set in `onSurfaceVariant`; color, if any, on the numbers |

## 4. Copy tells

| Tell | Status | Do instead |
| --- | --- | --- |
| Genre verbs: unlock, supercharge, seamless, elevate, effortless, all-in-one; "Trải nghiệm tuyệt vời", "Khám phá ngay" | ban | The specific noun and the real number |
| "OK", "Submit", "Get started", "Learn more" as button labels | warn | The verb and object: "Lưu ghi chú", "Gửi 3 ảnh" |
| "Something went wrong" / "Đã xảy ra lỗi" | ban | What failed and the recovery: "Không tải được đơn hàng. Thử lại" |
| "Are you sure?" as a dialog title | ban | The action and object: "Xoá 3 ảnh?", buttons "Xoá" and "Huỷ" |
| Title Case or ALL CAPS buttons and headers | warn | Sentence case everywhere |
| A placeholder standing in for a text field's label | ban | `label` plus `supportingText` |
| Hard-coded strings, mixed English and Vietnamese on one screen, "1 items" | ban | `strings.xml`, `pluralStringResource`, one language per locale |
| Tricolons and em dashes as habit; captions narrating the design | warn | One plain sentence; a full stop |

## 5. Motion tells

| Tell | Status | Do instead |
| --- | --- | --- |
| The same fade-and-slide on every list item, or staggered entrances on screen load | ban | Content present at once; `animateItem()` only for real insert, remove and reorder |
| High-bounce springs on fades and color changes | warn | `MotionScheme` springs for spatial movement, effects specs for color and opacity |
| A shimmer sweep across skeletons | warn | Flat placeholder bars at the real size, no sweep |
| A Lottie loader where a progress indicator belongs; confetti on routine success | warn | `LinearProgressIndicator` or a skeleton; delight saved for rare moments ([delight.md](delight.md)) |
| Pulsing dots and infinite loops that mean nothing | ban | Motion only when state changes |
| Custom screen transitions that fight predictive back | ban | Navigation transitions that follow the back gesture's progress |
| Animations that ignore Remove animations | ban | A cut or crossfade when the system scale is 0 ([animate.md](animate.md)) |

## 6. Why removal is not enough

An app with every tell removed and nothing put in their place is an empty app with good manners, and
that is a tell too: the avoidance aesthetic, which anyone could guess from the category plus this
list. The tells were filling a gap where an idea should have been. Fill the gap first: the product's
own data at its real size, the screen's one question answered by its biggest element, one signature
element only this product has, a committed palette and type. Only then run the checks.
