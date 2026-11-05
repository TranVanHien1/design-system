# Team house style (Compose base of the team's apps)

The team's apps (Ringtone, Santa Call, Pet Shimeji, Rolling Icon, Charge Visuals, Wallpaper 3D, Theme Mix…) are
clones of one base. Their code follows its own conventions, not the M3-roles style the rest of this skill assumes.
In a team project these conventions **override** the M3 code rules in [android-m3.md](android-m3.md) and
[craft-floor.md](craft-floor.md); the design rules (spacing scale, touch targets, contrast, states, insets,
Vietnamese) still hold.

Evidence: 2026-11-05 study of 7 projects in `~/AndroidStudioProjects` (`wallpaper_3d` is the reference architecture
the others mirror; `theme_widget` = current base, `ThemeWidget` = old base).

## 1. Detect

It is a team project when two or more of these exist:

```bash
ls app/src/main/java/*/*/*/presentation/utils/theme/{Color,Typography,Font,Theme}.kt 2>/dev/null   # base theme files
grep -rl "LocalAppStrings" --include=*.kt app/src/main | head -1                                     # strings
grep -rl "fun Modifier.bounceClick" --include=*.kt app/src/main | head -1                           # tap modifier
grep -rl "com.st1.sdk" --include=*.kt app/src/main | head -1                                        # ads SDK (current base)
ls docs/Agents.md CLAUDE.md docs/CLAUDE.md 2>/dev/null                                              # project rules: read them, they win
```

Record "house style: team" in the context note ([context.md](context.md)). Read the project's `CLAUDE.md` and
`docs/Agents.md` before writing code; where they are more specific than this file, they win.

## 2. Skill rule → team convention

| Skill default | In a team project |
|---|---|
| Colors from `MaterialTheme.colorScheme` roles; `Color(0xFF…)` outside theme is a bug | Named tokens in `presentation/utils/theme/Color.kt` (Figma names: `Neutral600`, `ColorPrimary500`, feature sections). Feature code imports tokens; never `Color(0x…)`, `Color.White`, `Color.Black`, `Color.Transparent` literals in feature code (add a token). `MaterialTheme.colorScheme` stays a base default only. |
| Type from `MaterialTheme.typography` roles | Tokens in `Typography.kt`: `T{size}{EB,B,SB,M,R}` (Figtree base) or a Figma-named set (`MT16B` Momo Trust, `RobotoT14R`, semantic `Title1Style`). Use the set the screens already use; add a token rather than an inline `fontSize`. |
| `stringResource(R.string.x)` | `AppStrings` data class + per-locale subclasses, read with `LocalAppStrings.current.x`. |
| `Modifier.clickable` | `Modifier.bounceClick { }`; `bounceClickOnce` for navigation, IAP, downloads. Put it before `clip`/`background`. |
| M3 `Button`, `Card`, `Switch`, `TabRow`, `NavigationBar`, chips | Custom-drawn base kit: `CustomButton(style = Linear/Normal/Secondary, size = Big 52/Popup 44/Small 32, width = FullWidth/Flexible/HalfWidth, isLoading)`, `CustomDialog(buttonLayout = Single/Row/ColumnStacked, adsContent)`, `RewardDialog`, `PremiumBadge` (BoxScope, 24dp), `CustomAppBar`/feature `*TopBar`, pill switches, floating gradient bottom nav (overlay, label on the selected tab). See [components.md](components.md) and `data/compose-map.json`. `Scaffold`, `Dialog`, `ModalBottomSheet`, Lazy lists, `HorizontalPager`, `CircularProgressIndicator` are used directly. |
| Fonts bundled or downloadable | `.ttf` only in `res/font`, registered in `Font.kt` (variable fonts through `FontVariation` are fine). Never downloadable fonts or otf/woff. |
| Icons: Material Symbols | Figma SVG → vector drawable `res/drawable/ic_*.xml`; webp (then png) only for photos and complex art; no remote Figma asset URLs in code. Material icons are almost unused. |
| Light + dark + high-contrast schemes | Light only today (`BaseCodeTheme` builds `lightColorScheme`; `values-night` holds ad colors). A dark-first design needs dark tokens in `Color.kt`; say so in the handoff instead of assuming `darkColorScheme`. |
| Extract repeated UI into one shared component | **Copy, don't share** large screens/sections between features (each feature must be able to get its own ads). Share only small, ad-free pieces: buttons, top bars, chips, cards/items, dialogs, loaders, empty/error views. `extract` respects this ([extract.md](extract.md)). |
| One file per screen | Feature package `presentation/<feature>/{screen,components,model,viewmodel}`; UI files ~150–250 lines, split above ~300; screen files only compose components and wire state. |
| Sealed UiState per screen | One host route + `@HiltViewModel` + `sealed interface <Feature>UiState` per feature flow (loading, list, detail, preview, downloading, applying, success, error); stateless `*Content` per step; platform side effects (wallpaper apply, pickers, permissions, downloads) at the host. Never merge features behind a mode flag. |
| Base flow in Compose | Splash, language and onboarding are **XML activities driven by the ads SDK** (`SplashActivity`, `LanguageScreenActivity`/`LanguageView` + `item_language.xml`, `OnboardingView` + `onb_page.xml` with a 310dp bottom-ad spacer). The design delivers assets and copy for them ([base-flow.md](base-flow.md) §handoff), not composables. |

## 3. What the team code already gets right (keep)

- Figma frame values go in 1:1 as dp, and frame-shaped items use **one `aspectRatio` constant per item type**
  (`CARD_ASPECT_RATIO = 184f / 327f`) instead of fixed width × height.
- Banners whose art is placed in design units use `BoxWithConstraints` with a design width
  (`designX(x) = maxWidth * x / 343`), so they scale with the screen.
- Content containers take their height from content (`wrapContentHeight`, padding, `Arrangement`, `weight`);
  fixed heights only for chrome, touch targets and fixed-format visuals.
- Custom top bars pad with `WindowInsets.stableStatusBars` (= `statusBarsIgnoringVisibility`) because full-screen
  ads hide the status bar and `statusBars` drops to 0; bottom bars pad with `WindowInsets.navigationBars`; the app
  draws edge-to-edge with the navigation bar hidden.
- Ad slots are part of the layout: collapsible native above the bottom nav across tabs, `NativeExampleAd` as a grid
  cell at the card's aspect ratio (after row 3, then every 3 rows), small native rows in lists, natives in
  language/onboarding. A card or stage is sized from the design, never from "the space left" next to an ad
  (a collapsible ad changing size must not resize content).

## 4. Known gaps across the team's apps (fix when you touch the code; flag in audits)

Counts are from the 2026-11-05 study (7 apps).

| Gap | Seen | Fix |
|---|---|---|
| `bounceClick` is `pointerInput` only: TalkBack/Switch Access see no button | all apps | Add semantics in the base modifier (below). |
| Tappable visuals under 48dp (24dp back chevrons, 16–20dp icons) | 8–28 per app | Keep the visual size, give the hit area 48dp: `Modifier.minimumInteractiveComponentSize()` or a 48dp `Box` around a 24dp icon. |
| 15–27% of dp values off the 4dp grid, raw Figma decimals (`451.821.dp`), `RoundedCornerShape(100.dp)` | all | Snap spacing to 8/12/16/24 ([layout.md](layout.md)); round sizes to whole dp; pills use `CircleShape`/`RoundedCornerShape(50)`. |
| `lineHeight = fontSize` in `appTextStyle` | Figtree base | Stacked Vietnamese diacritics (Ấ, Ộ, Ữ) clip in tight boxes; give tokens a real line height (≈1.25–1.4×) or `LineHeightStyle(Alignment.Center, Trim.None)`. |
| No font-scale handling; `maxLines` on ~10% of `Text` | all | Labels in fixed-width slots (tabs, chips, buttons, nav) get `maxLines = 1` + ellipsis or the `FitText` auto-size pattern (Charge Visuals `utils/composables/FitText.kt`: `BasicText(autoSize = TextAutoSize.StepBased(minFontSize, maxFontSize = style.fontSize))`); fixed `size(w, h)` around text becomes `widthIn/heightIn(min = …)`. |
| Several ratios for one item type (0.45 / 0.562 / 0.566) | Theme Mix | One aspect constant per item type, declared once and reused. |
| Single-density PNGs (blurry), large rasters decoded on tab switch | Theme Mix, Charge | Vector when possible; raster as webp at xxhdpi or in `drawable-nodpi` sized to the slot; `contentType` on lazy items. |
| No `@Preview`, no screenshot tests; Figma matched by eye ("fix UI" commits) | all | Previews per state + device-vs-design montage ([verify.md](verify.md) §team). |
| White status-bar icons on light screens | Rolling Icon QA | Set light/dark status-bar icons per screen background. |

Base modifier with semantics (drop-in for the team's `ModifierExt.kt`, same signature):

```kotlin
fun Modifier.bounceClick(
    pressedScale: Float = 0.92f,
    role: Role = Role.Button,
    onClickLabel: String? = null,
    onClick: () -> Unit,
) = composed {
    val scale = remember { Animatable(1f) }
    val scope = rememberCoroutineScope()
    semantics { this.role = role; onClick(label = onClickLabel) { onClick(); true } }
        .graphicsLayer { scaleX = scale.value; scaleY = scale.value }
        .pointerInput(onClick) {
            detectTapGestures(
                onPress = {
                    scope.launch { scale.animateTo(pressedScale, spring(stiffness = Spring.StiffnessHigh)) }
                    tryAwaitRelease()
                    scope.launch { scale.animateTo(1f, spring(Spring.DampingRatioLowBouncy, Spring.StiffnessMedium)) }
                },
                onTap = { onClick() },
            )
        }
}
```

## 5. Design → code handoff in a team project

1. **Tokens**: run `node <skill>/scripts/handoff/team-theme.mjs <flow-dir> --package <pkg> --out <dir>`; it writes
   `Color.kt` / `Typography.kt` / `Font.kt` / `Theme.kt` in the team's format from the flow's `tokens.css` +
   `app.css` (same names on both sides), and a merge note when the project already has them.
2. **Per screen**: the handoff sheet from `build-flow.mjs --handoff` ([html-flow.md](html-flow.md)): frame width,
   spacing used, aspect constants, which team component each block maps to, ad slots, states.
3. **Lint** the result with `node <skill>/scripts/audit/compose-lint.mjs <app module>` ([audit.md](audit.md)).
4. **Verify** with previews per state and a device capture next to the flow shot ([verify.md](verify.md)).
