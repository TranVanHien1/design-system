# Team components (measured from the team's Figma files)

The team's own component set, measured from six Figma files in a read-only deep study (2026-11-05): Theme Mix/067 Theme Flow + Theme Art + the base-flow wireframe master (TM/TA), Rolling Icon (RI), Pet Shimeji (PS), Ringtone (RT), Charge Visuals (CV), Santa Call (SC). Every value below was read from Figma metadata or design context; per-node evidence (nodeIds, 177 components, 43 layouts) is in `data/components.json`. HTML classes live in `assets/flow/team.css`; templates in `assets/flow/base/` and `assets/flow/common/`.

Use these instead of generic Material defaults whenever you design one of the team's apps. Material 3 rules (targets, contrast, insets, back, states) still apply on top: where a team spec is under 48dp, keep the visual size and pad the hit area.

## 1. Frames, grid, rhythm

| Item | Value |
|---|---|
| Base-flow frame (splash, language, onboarding, native full) | **412×917** (status bar 52) |
| Core-screen frame (home, lists, detail, paywall, dialogs) | **375×812** (status bar 22–44, header from y24–52) |
| Side margin | **20** on 412 frames, **16** on 375 frames |
| Header | 56 high (+ status bar → 78 total in TM, 66 band in RI) |
| Header → first content | 12 |
| Section gap | 16 (TM/RI) – 24 (TA, CV settings groups) |
| 2-column content grid | cells **164×292** (9:16), gaps **15 (column) / 12 (row)** @375; RI 182.5×324 @412 |
| Horizontal rails | cards **120×212 r8 gap 8** (TM) or **140×249 r16 gap 8** (CV), bleeding off the right edge |
| Bottom nav | 64–82 high (see §6) |
| Pills | radius **100** everywhere (buttons, search, segmented, tags) |
| Radius scale | 4 (ad tag) · 8 (rows, cards, chips, banner, skeleton, ad logo) · 12 (sheets, plan cards, feature tiles, popup ad) · 16 (preview, CV cards, RT chips/permission cards, update sheet top) · 20–24 (dialogs) |

Screens in a flow pick their frame with `<html data-frame="412x917">` / `"375x812"` (kit.css + build-flow honour it).

## 2. Colour and effects (patterns, per-app values in `data/topic-worlds.json`)

- **One brand colour carries every action**: CTA fill, selected border/check/radio, onboarding title and "Next", nav active, countdown boxes, ad tag + CTA (in app screens), segmented active. Optionally a 2-stop gradient of it (TM #FE513A→#FC4649, RT #FF539B→#E1336D, PS #FF4F15→#FFD117). Set `--x-brand` (+ `--t-grad`).
- **Ink ladder**: title #111111/#12111C · body #363636 · grey #787882/#7B7B7B · disabled #EEF1F6. Neutral scale (TM): #F6F6F7 #EFEFF0 #E7E7EA #CCCCD1 #AAACB4 #8F909A #787882 #555560 #43434E #1A1A1F #0C0C0F. Status: danger #FA4649 / #E24C4C, success #14C96F / #6ACA30 / #1EB724.
- **Surfaces**: light bg white (TM adds a 10% yellow top wash + 10% violet radial top-right), card #F9F9F9; dark bg #000, card #1A1A1F, raised #2E2E37, nav #121921.
- **Effects** (`team.css` variables):
  - `--t-btn-inner` — TM "Button": `inset 2 2 4 #FFB5FF80, inset 0 -4 8 #971B421A` on every filled pill.
  - `--t-pop` — "pop up shadow" for floating sheets/cards; scrim `rgba(0,0,0,.4)` (light) or `rgba(12,12,15,.9)` (dark apps).
  - `--t-arcade` — PS/TA hard offset `0 3 0 <tint 30%>` + `inset 0 2 2 #FFFFFF40`, usually with a 2dp white rim and r6: a playful skin, not a default.
  - Dark apps (RT) use no shadows: separation by surface value #000 → #1A1A1F → #2E2E37.
- **Paywall and rating stay white even in dark apps** (RT); ad blocks stay near-white (#FAFAFA) on any background.

## 3. Typography

- **Default team face: Momo Trust Sans** (Google Fonts, 200–800, **Vietnamese ✓**): ramp T28/36 · T24/32 · T20/28 · T18/22 · T16/20 · T14/20 · T12/16 · T11/14 · T10/12 in Regular/Medium/SemiBold/Bold, letter-spacing 0. Section titles may use Momo Trust Display 16/20 (Vietnamese ✓, 400 only).
- Per-app display faces seen: Lily Script One (TM wordmark), Gorditas (TA/RI wordmark), Press Start 2P / Pixelify Sans (PS), Dela Gothic One + Gluten (SC), Roboto (RT/CV chrome), Poppins (OB "Next", language title), Figtree, Nunito Sans (paywall legal), Inter (all ads).
- **Vietnamese coverage (checked against Google Fonts metadata): Poppins, Figtree, Gorditas, Lily Script One, Press Start 2P, Pixelify Sans and Instrument Sans have NO Vietnamese glyphs.** Never put Vietnamese copy in them; for VI builds use Momo Trust Sans (or another VI face from `data/type.json`) for the OB "Next", language title and body, and keep non-VI display faces to English-only wordmarks. Dela Gothic One, Gluten, Roboto, Inter, Nunito Sans, Playpen Sans are VI-safe.

## 4. Buttons (`.t-btn`)

| Size | Height | Use |
|---|---|---|
| xs / s | 24 / 28 | tags, "Try now" on banners |
| m | 32 | language "Next" pill (72×32), inline actions |
| l | 40 | dialog 2-up buttons, step cards |
| xl | 48 | ad-unlock "Watch ad to …" (343×48, label + 24 ad glyph on the right), RT bottom actions |
| xxl | 52 | primary CTA: paywall Continue (343×52), dialogs (328×52), Set Wallpaper (284×52), native ad CTA |

All radius 100 (RI component library uses 24 for 52-high = same pill). Variants: filled (brand/gradient + inner shadow), `tint` (brand 12% bg + brand text: Cancel), `outline` (1dp brand: "unlock with ad"), `white`, `danger` (#FA4649: Delete), `arcade`. SC skins buttons as candy pills (3dp light-red rim + stripe overlay + inner shadows) — an app skin, same geometry.

## 5. Header, search, chips, sections, content

| Component | Spec | Class |
|---|---|---|
| App header | 56 high, padding 12/16: wordmark (display face 24–28, may be gradient text) left, premium entry right (crown 24–42, or "PRO" pill 32 high r999 brand) | `.t-header` |
| Inner header | back 24 + gap 8 + title Medium 20–24 (or centred) + optional action 24 | `.t-header .ttl` |
| Search | light: 343×38–42, white, r100, 1dp #8F909A/#AAACB4 outline, focus 1.5 brand; dark: 307–343×52, #1A1A1F, r40 | `.t-search`, `.dark` |
| Chips | TM 26 high r8, borderless, active = brand tint bg + brand text; TA 32 r8, active = brand fill | `.t-chip`, `.lg` |
| Segmented | 343×48, track #E7E7EA r100 p4, active segment = brand gradient, Medium 14 white | `.t-seg` |
| Underline tabs | 14 Regular, active = ink + 1dp brand underline (CV editor) | `.t-tabs` |
| Section header | 24 high: (icon 24 +) title SemiBold/Display 16/20 + "Xem tất cả" Medium 12 brand (± chevron), 12 to content | `.t-sec` |
| Hero banner | TM 343×193 r8 image + "Try now" s-pill bottom-left; CV carousel 343×157 r16 + pager 8 below; RI 380×260 white card with 2:1 image | `.t-hero` |
| Pager | 18×4 active + 4×4 dots, gap 4 (same as onboarding indicator) | `.t-pager` |
| Feature tiles | RI 3 × 120×180, gap 10, r12, 120 well tinted brand 10% with bottom r20, name Medium 12/16 + desc 10/12 | `.t-feat` |
| Card badges | 28 circles rgba(28,28,28,.5) at 12dp inset: heart top-left, VIP/diamond top-right; type glyph 24 bottom-right | `.t-badge` |
| Settings rows | TM: 343×48, pitch 64, brand outline icon 24 + Medium 16 + value Medium 14 grey + chevron, no dividers; sections separated by an 80×4 brand bar. CV: white group cards r16 (shadow 0 0 2), rows 40–44, coloured icons, language value in brand | `.t-row`, `.t-group`, `.t-divider-bar` |
| Toggle | 42×20 | `.t-switch` |
| Radio | 24, ring #7B7B7B 2dp, selected brand | `.t-radio` |

## 6. Bottom navigation (two families — not the M3 indicator bar)

- **Line nav** (TM, TA, RI, CV): white bar, 5 tabs (theme apps) or 4 (single-purpose apps); icon 24 + label 12/16; active = brand colour (filled icon), inactive #787882.
  - TM 373×64, 95% white glass, 1dp #E7E7EA top line, a soft brand "brush" blob behind the active icon.
  - RI/TA 82 high, **2dp brand top border**, top radius 12 (RI), padding 12/12/24.
  - CV 70 high, top radius 28, no line.
  - `.t-nav` (+ `.ri`, `.cv`).
- **Pill nav** (PS, RT): the active tab is a **gradient pill with its label that slides to the tapped slot**; inactive tabs are icon-only.
  - RT dark bar #121921, 72 high, top radius 24, pill h44 r44 padding 10/20, Medium 12, filled vs outline icons.
  - PS white bar 68, shadow 0 1 17 16%, pill 132×44 r6, label before icon, Bold 14/20.
  - `.t-navpill` (+ `.light`).

## 7. Dialogs and sheets

| Component | Spec | Class / template |
|---|---|---|
| Rating | 362w, r24, white (RT: 80% white + blur 23), padding 24/16, gap 16, centred: emoji/art 132, title Bold 20/28, sub 16/20 grey, **5 stars 44 gap 16** (outline → orange gradient #FFCB78→#FFA448), button 320–328×52. ≤3 stars adds a #F9F9F9 textarea 100 high r12 with 0/1000 counter (same Submit). Never pre-select stars | `.t-dialog.w362`, `.t-stars`, `.t-textarea` · `common/dialogs.html?state=rating` |
| Force update | TM: full-width bottom sheet, top r16; RI: 375w r24, padding 24, gap 24, title in brand left-aligned + X, app icon 64 r16 + Bold 16 name, Update 328×52 | `.t-sheet-full` · `?state=update` |
| Unlock / reward | RT: 343w r24 #1A1A1F on rgba(12,12,15,.9), padding 16 gap 20, two 48 r40 buttons gap 16: outline "Free unlock with ads" + filled "Remove ads/Premium". PS: 312w r20, art + title + one 288×47 "Watch Video" | `.t-dialog` · `?state=reward` |
| Confirm / delete | TM: floating white card r12, 16 from screen edges, pop-up shadow, header 56 (SemiBold 16 + X 24), two 151.5×40 buttons gap 8: Cancel tint, Delete danger | `.t-sheet .two` · `?state=confirm` |
| Set-as / choose | RI: floating card 343 wide r12, header 56, three solid brand 311×52 buttons gap 8 (Home / Lock / Both) | `.t-sheet .stack` · `?state=setas` |
| Exit | consequence + Stay / Exit; RI ships a full "Uninstall" screen instead (reasons list, "Keep it for now" 328×52, pink "Still want to uninstall?" link) | `?state=exit` |
| Scrim | light .4, dark apps .9 | `.t-scrim`, `.dark` |

## 8. Permissions

- **List screen** (RT): back + title, art, "To continue, please provide following permissions", cards **343×80 r16 padding 12 gap 12** (#1A1A1F dark / card light): icon, name + one-line reason, "Allow" pill 32 high r12 brand → becomes a check. `.t-perm` · `common/permissions.html`.
- **Themed modal** (SC): scroll-paper card on a #00000080 scrim, content 260 wide, title + reason in the app's voice, Allow (confirm colour) above Don't allow.
- The skill's own rules still apply: required vs optional, sequence, system-settings guide state, denied path (see html-flow.md checklist).

## 9. Paywall (shared template — RI 5004:21054, RT 111:12162, CV 107:21268)

Frame 375×812, only hero art, colour and copy change. `common/paywall.html`, classes `.pw-*`.

| Zone | y | Spec |
|---|---|---|
| Hero | 0–199 | art + 83 fade to white; close **36** circle rgba(11,10,10,.5) at x16 y50, white X 24 |
| Offer | 116 / 185 / 213 | discount sticker 152×80 ("50% OFF", recoloured to brand) + expiry line 14/20 #43434E + **countdown boxes 20×30 r2 brand, digits Medium 20/28 white, gap 6, colon 20** (MM:SS) — or premium variant: crown badge 200×94, no countdown |
| Title / subtitle | 248 / 286 | Bold 24/32 (RT/CV 28/36) #111 centred · Regular 14/20 #43434E, 2 lines |
| Benefits | 338 | 36 high, scrolls sideways: icon 32 + Medium 16 #555560, 16 between |
| Plans | 385 | 343 wide, gap 12, **white r12**, padding 10/8, unselected 1dp brand@20%, **selected 2dp brand + check 32**; name SemiBold 18/22, sub Medium 14/20 #7B7B7B, price SemiBold 18/22 right, old price struck. Order: Yearly (BEST DEAL, preselected, trial) / Monthly / Weekly / Lifetime |
| BEST DEAL | card top edge | ≈100×26 pill r32, gold gradient #FFCF4B→#FFF9D4→#FFCF4B, Medium 14 #363636, centred on the border |
| Continue | 726 | 343×52 r100, SemiBold 18/22 |
| Legal | 788 | 3 equal columns, Nunito Sans 10 #787878 underlined: Restore · Terms · Privacy |

Keep the honesty rules on top of the template: CTA names the selected plan's commitment, a line states trial end, renewal and how to cancel.

## 10. States and results

- **Skeleton**: r8 blocks, gradient #E7E7EA→#D9D9D9, optional 56 glyph in the centre (TM). `.t-skel`.
- **Empty / error**: 3D illustration 224 (TM) or 230×256 (PS) + one line Regular 14 #787882 (+ "Try again" 128×47); header and nav stay. `.t-empty`.
- **Apply progress**: progress inside the CTA pill ("Watch Ad to Save" → "60%" → "Download completed" → "Setup") (TM 1262:31723).
- **Next-step card** (after apply): white, 1dp #E7E7EA, r8, p12, "Step n:" Bold 14 brand, solid brand L button 200×40. **Applied chip** 90×28 #14C96F.
- **Result screen** (RT/CV): illustration ~139×132, "Applied successfully" Medium 18 success green, body 14, divider, then a 2-column cross-sell grid (167×297) "You may also like".

## 11. Media and editors

- **Preview / detail**: RI image 340×605 centred, action row below: heart (#FF58A8) 24 · primary 284×52 · fullscreen 24, gap 16. CV pager: centre card 231×479 r16, side cards 154×320, gap 24; row: tool 24 · Unlock 247×48 r40 (lock + 16) · eye 24.
- **Editor** (PS): segmented on a light brand track; slider 327×36: label 12 (w46) + 12-high track r100 (#FFDAC4) + 16 thumb + value 14; swatches 55.8 r8, 5 per row, gap 12, selected 2dp brand, last "+"; fixed Apply 288×47, no nav. CV layer editor: white sheet from y534 (278 high) with a 1dp brand top line, "Layer" 16 + Done pill 81×40, underline tabs, thumbnails 84×149 r12 gap 16.
- **Ringtone detail** (RT): waveform panel 375×170 #1A1A1F, bars 3 wide r32 every 9dp (off #2E2E37, on brand gradient), 12 ruler, playhead 24×186, time labels Roboto 12 #8F909A; transport prev 24 · play 52 gradient circle · next 24, gap 56; function chips 4 × 80×92 r16 padding 12 (coloured icons #FF58A8 #00BECA #FFC743 #A875FC, VIP diamond 20 at 56,4).

## 12. Call screens (SC — closest relative of call-screen apps)

- **Incoming**: background = caller photo blurred 5 + 60% black; avatar 100 (wreath frame, 73 photo inset) at y120; name 28/36 white at y236; "is calling…" 14/20 8 below; **Decline 80 circle (#E00000) at x64 and Accept 80 circle (#59B157) at x231, 48 from the bottom**, icons 32, labels 18/22 8 below, inner shadows `inset 0 2 8 #FFFFFF80, inset 0 -2 8 #00000040`. No quick actions, no slide-to-answer.
- **In call**: full-bleed video; PiP 105×136 at x242 y72 (1dp #7C7D7D); name chip 160×56 #4C4E51 r12 at y599 (name 16 + timer 14); control pill 343×80 rgba(76,78,81,.5) r100 at y671, four 56 circles gap 24 (camera, swap, mic #F9F9F9E6 dark icon, end red); voice call 3 buttons gap 36.
- **Heads-up (in-app incoming)**: white card 343×80 at y38, r16, 5dp brand border, 40 avatar + name 14 + "is calling…" 12, decline/accept 36 circles gap 12.
- **Call ended**: solid dark-brand background, avatar + "Call Ended" 28 + duration 18, Home (48) + Call again (48), "Call someone else" strip (#323336 r100, 3 × 56 avatars).
- Check contrast of white icons on the accept colour (≥3:1) — the team's green #59B157 gives 2.6:1 with white; darken (#15803D / #2E7D32) when you keep white icons.

## 13. Native ads (SDK units — reserved space; full catalogue in `common/ads.html`)

Shared anatomy: full-width **#FAFAFA** block (no radius) · media **full-bleed** · header: logo **44–46 r8** + "Ad" tag (r4, 10/12, weight 400) + headline **Inter 600 12/14 #0B0A0A** + body **Inter 400 10/12 #A6A2A0** · CTA pill **52** (Small/Item 48) in the app primary · AdChoices "i" **12dp top-left**. The SDK library draws tag + CTA in #FF6616; every in-app instance takes the app primary.

| Unit | Size @412 | Layout |
|---|---|---|
| Media_Big | 412×300 (CV Light 310) | header 372×44 at (20,8) → media 412×180 at y56 → CTA 372×52 at y240 |
| Colab Right/Left/Between | 412×300 | media 188 first → header (x40) → CTA 372×52 at y240; collapse control 36 white circle (right / left / X between) |
| Medium | 412×186 (CV 200) | media 182×120 left + text column; CTA full width at y126–140 |
| Small / Small_2 | 412×110 / 412×66 | header + CTA 48 / one row + "Learn" 87×32 |
| Item / Item Tiny | 372×288 (CV 296) / 372×52 | inside grids/lists: media 172, CTA 48 / "Go" 62×32 |
| Popup (overlay) | 364×312 r12 | media 200, X 34 (1.5dp border), CTA 332×48 |
| Adaptive / Mini banner | 412×52 / 412×68 | splash bottom; mini: media 100×60 + 3 lines + CTA 87×32 |
| **Native full — immersive** (8 variants) | 412×917 | creative from y33, top scrim 132, bottom scrim 194; header at y781 (logo 44, white text), CTA 372×52 at y841; top area = **X 36 rgba(11,10,10,.5) at x356 y56** (or left), "Sponsor" label, countdown pill 28 ("2 seconds remaining", right 20, y93), or progress bar 372×6 "Ad 1/2" |
| **Native full — contained** (5 variants) | 412×917 | creative blurred 50 + white wash, square media 240 at (86,285), advertiser icon 80 at y71 (left or right, X mirrors), Ad flag tab, white text card 372×124 r12 at y737 with a 332×48 "Continue" |

Placement in the base flow: Language and every OB page carry Media_Big at y607–617 (RT uses Item 296 at y621; SC uses no ad on Language and Colab_Left on OB; PS and RI templates draw none); native full after OB1 and OB3 (master: after OB1, OB2, OB3); interstitial after splash; adaptive banner variant on splash.

## 15. Measured spacing (2026-11-05 padding pass)

`get_design_context` on TM 1262:28912 (Home), CV 86:10378 (Home), RI 7042:19085 (wallpaper detail), CV 72:1838 (detail pager), TM 1262:31723 (apply flow, sheets), RT 28:6750 (category grid), CV 83:3601 (result), RT 43:8909 (unlock dialog). Values in dp of the 375 frame (RI 412); "→ scale" is what the flow and code use ([layout.md](layout.md)).

| Component | Figma | → scale |
|---|---|---|
| Screen margin | 16 everywhere | 16 |
| Header (title bar) | 56 tall, px16 py12, back 24 ↔ title 12 (CV, RT); RI/TM 66 tall, gap 8; title 20/28 SemiBold (24/32 RI) | 56, px16, gap 12 |
| Feed body (Home) | TM body p16, blocks gap 16; CV header → banner 12, sections 12 apart | 16 between blocks, 12 header → banner |
| Hero banner | 343×193 r8 (TM) / 343×157 (CV); text inset 16 (TM) / 12–16 (CV); CTA pill 28 tall, px12 py6, icon gap 4; pager 8 below (18×4 + 4×4, gap 4) | text 16, CTA 28 (px12), pager 8 |
| Section head | title row py8 px16 (RT) or icon 24 + gap 8 + title 16/20 (TM); → content 8 (RT) / 12 (TM); CV header block 48 tall | py8 px16, → content 12 |
| Horizontal rail | cards 120×212 r8 gap 8 (TM), 140×249 gap 8 (CV) | gap 8 |
| 2-column grid | 164×292 gap 15×12 (TM), 165×221 gap 12 (RT), 167×297 gap 8 (CV result), icon cards gap 16 (TM) | gap 12 (one value per app) |
| Card overlays | heart / VIP 28 circles rgba(28,28,28,.5–.6) at 12 inset; type glyph 24 at 8 inset bottom-right (CV); caption strip px12 py4 gap12 (RT) | 28 @12, 24 @8 |
| Search field | 38 tall, px12, icon ↔ text 8, 1dp outline, pill (TM) | 40 visual / 48 hit, px12, gap 8 |
| Chip tabs | px12 py3 r8, selected = tint fill + brand text, no gap (TM) | px12, gap 8 |
| Detail / preview | column gap 24, top 24 (CV); pager centre 231×479 r16, sides 154×320, gap 24; RI single card 340×605 | 24 between blocks and cards |
| Detail action row | width 343, px8, gap 16: icon 24 · CTA (48 tall, px16, icon ↔ text 8, r40; RI 52 r24) · icon 24 | px8 gap16, CTA 48 |
| Floating bottom sheet | inset 16 from sides and bottom; header 56 (title px16, close 24 at 16); rows 311×56 (px16, trailing button 32 tall); button area p16; two buttons gap 8 (TM) | inset 16, header 56, rows 56, gap 8 |
| Dialog | p16, r24, blocks gap 20, stacked buttons 48 tall gap 16, close 24 at 16 (RT) | p16, blocks 24, buttons gap 16 |
| Result | illustration → text 16; title → body 4; divider; "Similars" head px16 py12; grid gap 8 (CV) | 16, 0 (line height), section py12 |
| Info tiles | 80×92, p12, icon ↔ label 12, r16, row gap 8 (RT) | p12, gap 8 |
| Bottom nav | TM line nav 64 tall, icon ↔ label 4; RT pill nav active pill px20 py10 gap6, items px16 py12, top radius 24 | icon-only 64 (team rule) |

## 14. What the earlier skill had wrong (fixed in templates and kit)

- Language: selected row got a border/tint → **only the radio changes**; confirm was a 40 filled circle → **plain 24 tick at x364 y75**, or a 72×32 "Next" pill (RI/CV), or a 48 round check (SC); rows r12 Medium 15 → **r8 Regular 16/20**, flag gap 16.
- Onboarding: "Next" had a chevron at 17 → **text only, SemiBold 20/24 brand**; title 22 → **Bold 20/28** (CV 18/22); body 14 → **16/20**; indicator 8/24 → **4×4 dots + 18×4 pill, gap 4** (active ink in RI, brand in CV/SC); image 0–411 → **0–468 @412 with a 100 fade**.
- Ads: CTA 40 → **52**; icon 40 → **44–46**; AdChoices top-right → **top-left**; inset rounded media → **full-bleed**; text 14/12 → **12/14 + 10/12**.
- Nav: M3 pill indicator → **line nav or sliding gradient pill** (§6). Dialogs: r28 title 24 → **r20–24, Bold 20/28 centred, full-width 52 button**. Search: 56 filled → **38–42 outlined** (light).
