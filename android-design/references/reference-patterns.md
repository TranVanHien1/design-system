# Reference patterns from the team's Figma files

> Overview study (2026-11-04), corrected 2026-11-05 by the deep component study. For exact measurements, component anatomy and the HTML classes, [components.md](components.md) is authoritative; where the two disagree, follow components.md.

Read-only study (2026-11-04) of six team Figma files. Use it to keep the first-run flow and ad anatomy fixed and to pick a visual world unlike the shipped ones. Machine-readable worlds: `data/topic-worlds.json`.

Files (fileKey → name), cited below as **TM**, **TA**, **RI**, **PS**, **RT**, **CV**, **SC**:
- `kGqbd8A2V3p9NCU3wzLvPm` "032 Theme Mix": **TM** = page "067 Theme Flow" (1:7), **TA** = page "057-Theme Art" (1:6), style guide page 1:2.
- `iI1PL2mCd7h0fBpdHShU7I` "063 Rolling Icon 3D Wallpaper" (**RI**): Design 7011:12459, Design Common 1:3.
- `kSBL9MEyTxB9Cin4jyurNg` "Pet Shimeji" (**PS**): 1:5.
- `IW48r9U6LiYel3vXp1TRdL` "MV-022 Ringtone for music" (**RT**): 0:1 (base flow in section 158:17517; its splash is a ThemeArt leftover).
- `7gbr1V8NZ0Osxc0Z8rjB8q` "059 Charge Visuals" (**CV**): page Design 0:1.
- `6swCWvfRgSWqISz6DAu4HU` "045 Santa Call" (**SC**): 0:1, two complete colour versions (red, green).

Frame size in all base-flow frames is **412 x 917** (core screens often 375 x 812). Positions below give the Figma value, then the value scaled to a **360 x 800** frame (x0.874 horizontally, x0.872 vertically).

## 1. Base flow (fixed structure)

Order seen in every file that has it: **Splash → Language list → Language selected → OB1 → (Native full) → OB2 → (Native full) → OB3 → (Native full) → OB4 "Get Started" → Home**. The paywall and permission screens attach later (on the first premium action or feature use), never inside onboarding in these files. Wireframe master with this exact order: TA "Language+OB" 1162:8586 (an orange `#FF6616` placeholder skin, image placeholders, "Title onboarding_1..4").

### 1.1 Splash
Two variants:
- **Brand splash + banner** (TM Splash 1262:22161, SC 124:9033/160:10028): app icon 100–120 r24 centred at 34% height; app name directly below at ~44% in the app's display face (TM pink script "Theme Mix", SC wide bold "Santa Call"); spinner at ~83–89%; **adaptive banner 320x50 test ad pinned to the bottom** (~y 868/917).
- **Loading-text splash** (RI template 5002:13751, PS 2317:17531, CV 107:20569, SC): icon + full store name ("Pet Shimeji: Pet on Screen", "ThemeArt: Themes Widgets Icons") at 35–44%; `Loading 40%` (bold 16) at ~85%; dotted spinner; `This action can contain ads` (14 regular) at ~93%. This line is the disclosure for the interstitial that follows the splash.
- Background carries the topic: pastel iridescent (TM), peach-pink gradient with sparkles (PS), lilac-sky gradient (CV), Christmas illustration (SC); plain white/black only in the RI template.

### 1.2 Language
Zones (TM LFO1/LFO2 1262:22173/22273, identical geometry in TA, PS, CV, SC, RI):
| Zone | 412x917 | 360x800 |
|---|---|---|
| Status bar | 0–52 | 0–45 |
| Title "Choose Language", left, bold 20/28 | x20 y73 h28 | x17 y64 |
| Confirm action, top-right | 24dp icon at x364 y75 | x318 y65 |
| List rows | x20, 372x56, gap 12, from y123 | x17, 325x49, gap 10, from y107 |
| Row inside | flag 28 circle at 16 inset, label at 44, radio/checkbox 24 at right inset 16 | — |
| Native ad "Native Media_Big" | y617–917 (300) = bottom 33% | y538–800 (262) |

- ~7 rows visible above the ad; 20 languages, English first.
- Unselected state (LFO1) has no confirm action; selected state (LFO2) shows it. Variants of the confirm: plain tick icon (TM 1262:22373), green check (PS), filled **"Next" pill** in primary (RI 5002:13751, CV 107:20492), red circular check badge (SC). A hand-cursor hint on the first row appears in TA/PS/CV.
- Row fill: neutral grey `#F6F6F7` (TM), white with a 3px pink bottom "pressed" edge (PS), dark `#18181C`-ish rows in RI dark, deep-green or white pill rows on themed backgrounds (SC). Selection control: radio (TM, TA, CV, RI, SC) or rounded checkbox in accent magenta `#E050D0` (PS).

### 1.3 Onboarding pages 1–4
Zones (TM OBD1 1262:22070, measured):
| Zone | 412x917 | 360x800 |
|---|---|---|
| Illustration, full-bleed from top | 0–471 (51%), bottom 100px fades to bg | 0–411 |
| Title, centred, bold 18–20, **primary colour** | y491 h22 | y428 |
| Body, centred, 14 regular, 2 lines max, ink | y521 h40 | y454 |
| Indicator (left, x20) + CTA (right) row | y575 h24 | y501 |
| Native Media_Big | y617–917 | y538–800 |

- **Indicator**: active pill 18x4 + inactive dots 4x4, gap 4, left-aligned; active pill moves with the page. Colour = ink/primary.
- **CTA**: text button "Next" (bold 18, primary colour) bottom-right on pages 1–3, "Get Started" on page 4. Never a full-width button in onboarding. SC is the exception: a small filled red pill "Next" with a light outline (SC 160:10015). **No Skip** in any file.
- Illustration: phone mock-ups of the app's own screens (TM, PS, CV), 3D collage of product content (TA 1134:21682), 3D mascot + photo composite (SC red). Image frames 412x468 (51%) in PS/CV; 412x574 (63%, under the text fade) in the TA master.
- Copy: 3–5-word benefit title + one sentence.
- No-ad variant: TA OBD2.1/OBD3.1 (1162:8646/8665) keep the same top half and put a hand/swipe glyph in the empty bottom third. PS OB frames (2317:24527…) are drawn with the bottom third blank.

### 1.4 Full-screen native ad page (inside onboarding)
`Native full_Onbroading` 412x917 (TM SDK 1262:22056; CV SDK Light 107:20844 shows 13 variants). Inserted between OB pages: TM 1262:22069 uses OB1 · NF · OB2 · OB3 · NF · OB4; the TA master uses NF after OB1, OB2 and OB3. Anatomy: full-bleed creative; close **X** 32dp top-right (sometimes top-left) at ~y60; optional "Sponsor" label, "Ad 1 of 2" progress bar, or "2 seconds remaining" pill before the X appears; bottom block = advertiser icon + "Ad" badge + headline + 2-line body; full-width CTA pill 372x48 ~y780. Contained variant: media card on a blurred colour field, white text card below, "Continue" CTA. A `Native full_inapp` twin is used inside the app.

### 1.5 Paywall (IAP)
Shared template in RI 5004:21054, RT 111:12162, CV 107:21268 — only hero art, colour and copy change:
- Close X (36 circle rgba(11,10,10,.5)) top-left at x16 y50; hero art top ~28% (topic collage: phones with wallpapers, ringtone UI cards) fading to white.
- Hero variants: **discount** (3D "50% OFF" sticker + "This offer will be expired in" + 4 primary-filled countdown digit boxes) or **premium** (3D crown + gold "Premium" ribbon).
- Title "App Name Pro" / "Upgrade to Premium" / "Unlock All Premium" Bold 24/32 (RT/CV 28/36), subtitle 14; benefit row (3D icon + "All Premium Themes", "No ads anytime", horizontally scrolling).
- Plans: 4 stacked cards (Yearly with **"BEST DEAL"** yellow ribbon, pre-selected, primary 2dp border, strike-through old price, "Free 3days then…"; Monthly; Weekly; Life time "Pay once purchase"), radius 12, selected 2dp brand border, check circle 32 at right.
- Full-width primary pill "Continue"; footer links "Restore Purchase · Terms of Use · Privacy Policy" 10sp underlined.
- The "50% OFF" sticker exists in purple, pink, red, green, orange (RI 5004:21054): recolour to the primary. RT keeps the paywall white in a black app.

### 1.6 Permission
- Full-screen list (RT 100:12541, also in the RT call-screen flow 98:11811): 3D icon, "Permissions" title, "To continue, please provide following permissions", then cards (Allow Notification / Draw over apps / Write setting) each with a short reason and an "Allow" pill that turns into a check.
- Themed modal (SC 137:11121…): scroll-paper card per permission (Notification, Camera, Microphone) with a reason written in the app's voice ("so Santa can let you know…"), green striped "Allow" + red "Don't allow"; denied → "Open Setting / Cancel".

## 2. Ad placements

| Placement | Screens | Size (412w) | Notes |
|---|---|---|---|
| Adaptive banner 320x50 | Splash bottom (TM, SC) | 412x52 | "Nice job! This is test 320x50 test ad." |
| Interstitial | after splash | full | announced by "This action can contain ads" |
| Native Media_Big | Language, every OB page | 412x300, bottom 33% | header row (AdChoices i, icon, **"Ad"** badge, headline, body) + media 412x~176 + CTA pill 372x52 "Learn More" |
| Native full (onboarding / in-app) | between OB pages; in-app transitions | 412x917 | see 1.4 |
| Native Medium / Small / Small_2 / Item / Item Tiny | lists, dialogs | 186, 110, 66, 288, 52 high | catalogued in TM SDK 1262:22054, RT 6:7000/6:7171, CV 107:20673 |
| Native Colab Right/Left/Between | collapsible | 412x300 | collapse chevron in corner |
| Native Popup (Overlay) | over content | 364x312 | X top-right |
| Colab Mini Banner | | 412x68 | |
| Rewarded | unlock premium item | full | triggered by "Watch Ad to …" buttons, see 3.6 |

Ad rules seen everywhere: the native **CTA and "Ad" badge take the app's primary** (TM red-orange `#FE4F3C`, TA lavender `#A875FC`, CV coral `#FF6078`, SC red `#E00000`, wireframe orange `#FF6616`). The ad header order can flip (SC: media first, text block second). The ad is a separate full-width white block; app content never overlaps it.

## 3. Core screen patterns

### 3.1 Top bar + navigation
- Large left title = app wordmark in the display face (TM red script "Theme Flow"; TA/RI chunky display; PS pixel font with a mascot sprite; RT/CV plain bold sans 18–20) + right actions: **premium entry** (crown icon: TM red crown, TA 3D purple crown + 3D gear, RI crown in a lavender rounded square; RT gear + gold crown; CV "PRO" pill in primary).
- Bottom navigation: **5 tabs** in theme apps (TM Home/Icons/Control/Collection/Settings 1262:38190; TA Home/Theme/Icon/Control/Widget; RI Home/Icon/Wallpaper/Library/Setting, labelled "Icon Change" in the concept collage), **4 tabs** in single-purpose apps (CV Charging/Wallpaper/Gallery/Setting; PS Home/Explore/Custom/Settings; RT: "Ringtones" label + wallpaper, video and call glyphs, inferred from icons). Active styles: filled icon + primary label (TM, TA, RI, CV); **expanding pill with label, others icon-only** (PS orange gradient pill, RT pink pill on a dark rounded bar).
- Santa has no bottom nav: one hero home with a mode switch.

### 3.2 Home layouts
- **Content feed** (TM 1262:28912): hero banner 343x~190 (radius 12, "Try now" pill, pager dash) → outlined search pill → section header (icon + bold 16 + primary "See all ›") → horizontal tall phone-ratio cards (~120x212) → chip tabs (active = tint fill + primary text).
- **Hub + shortcuts** (TA 1052:18556, RI 7014:12797): hero card with "Start/Try Now" pill, then 3–4 feature tiles (3D render top, name, one-line description), then a "Trending" grid.
- **Section stack** (CV 86:10378): carousel banners each with its own gradient, then 4 horizontal rails with "More ›"; cards 140x249 r16 gap 8 bleeding right, heart top-left and VIP top-right as 28 circles at 12dp inset, type glyph 24 bottom-right.
- **Category grid** (RT 28:6750): 2-col photo cards (164x220, name + "27 Tracks" + chevron on a dark strip), then rows with a gradient square icon.
- **Slot board** (PS 2041:10982): enable-toggle card, hero illustration + gradient "Explore" button, 3-col grid of dashed-border slots (pet / "+" Choose / lock Unlock) with a small outlined pill under each.
- **Single hero** (SC 158:15436): "Merry Christmas" lettering, 3D illustration, segmented Video call/Audio call/Message (or a carousel with arrows in green v1 137:9387), candy-stripe "Start ›" pill.

### 3.3 List / detail / preview
- Lists: item cards with name + circular arrow (TA), 2-col tall wallpaper grids (RI 7042:19085), sticker category cards (PS).
- Detail/preview: big centred preview card (radius 16), action row "♡ + primary pill + fullscreen icon" (RI "Set Wallpaper"), or a pager of neighbouring previews with "🔒 Unlock" pill + eye icon (CV 72:1838). RT detail: waveform trimmer with playhead, prev/play/next, 4 function chips (Set Call Ringtone, Set Message, Set Notification, Set Alarm) with diamond VIP badges.
- Customise editors: preview on top, segmented tabs (Snake Head/Trail/Setting in RI; Theme/Emoji/Battery/Setting in PS; Bottom/Middle/Top layer in CV), sliders, swatch grid, sticky "Apply" (PS full-width orange gradient, CV "Apply/Done" pills top-right).

### 3.4 Apply / set flow and success
- Download/apply with a progress pill: "Watch Ad to Save" → "60%" → "Download completed" → "Setup" (TM Apply Theme 1262:31723).
- Set-as dialog: "Set Wallpaper / Set as Wallpaper" with Home Screen, Lock Screen, Home & Lock Screen (RI stacked lavender pills 7042:19794; TM rows with "Setup" pills).
- Step checklist after apply: "✓ Applied" + "Step 2: Set your icons" + "Step 3: Set your widgets" each with a pill (TM).
- Loading: app glyph + "Almost Ready / Setting everything up for you…" (RT).
- Result: 3D success illustration + "Congratulations" / "Applied Successfully" (green text in CV) + cross-sell grid ("Similars", "Call Screen", "Wallpaper"), home icon top-right (RT 43:9199, CV 83:3601).

### 3.5 Settings, rating, update, exit
- Settings: grouped rows (24 coloured icon + label + value/chevron/switch: Language "English" in primary, Permissions, Rate, Share, Privacy, Terms, Version); premium promo card on top in RT/CV; white pill rows on red in SC.
- Rating dialog (TM 1283:46608; also RI 3023:24239, RT 111:12263): 3D emoji face, "Having a great time?", 5 outline stars → filled; ≤3 stars opens a feedback text field; primary pill. Force update dialog "Update available" with app icon (TM 1283:46593, RI, RT). Uninstall/exit section exists in RI 5011:21361 (not screenshotted).
- Delete confirm: "Do you want to delete this DIY?" Cancel (tint) / Delete (primary) (TM 1283:45973).

### 3.6 Reward unlock UI
- Button with an ad glyph: "Watch Ad to Save / Apply / Download", "Unlock all ▶" (TM).
- Dialog: 3D mascot + "Video Reward · Watch the short video ads to download this item" + gradient "▶ Watch Video" (PS 2041:13318).
- Two-option dialog: "Free Unlock With Ads" (outline) + "♛ Remove Ads" (filled) (RT 43:8909); a follow-up "Cool ringtones ahead! View a quick ad…" with "Accept".
- Locked item markers: lock glyph tiles + "Unlock" pill (PS), diamond badge (CV, RT), crown (TM).

### 3.7 Empty / error / loading
Skeleton cards (TM 1279:39305); 3D empty-state illustration + one line (TM search, RT "Oops! No files found.", PS 2346:18178); SC "No Internet Connection · Try again" with a sleigh.

## 4. Per-topic visual worlds

### 4.1 Theme Mix / Theme Flow (TM 1:7)
Topic: themes, icons, widgets, DIY. Light. Palette: primary `#FF3240` (style-guide page lists `#FF321F`; component library `#FF3E7B`), CTA gradient `#FE513A`→`#FC4649`, logo gradient pink `#FF5A88`→violet `#F488F4`, bg white with faint pink-cream top wash, surface `#F6F6F7`, ink `#12111C` (style-guide page `#272538`), success `#14C96F`. Type: **Momo Trust Sans** T28…T11 (style guide 3:778); wordmark in Lily Script One 28 with gradient `#FE3A82`→`#FC6846` (no Vietnamese glyphs). Radius: cards/hero/chips 8, sheets 12, rating 24, button pill. Icons: filled red glyphs in nav, 3D emoji in dialogs. Content: kawaii clay 3D theme packs. Signature: script wordmark + red crown; pastel iridescent splash.

### 4.2 Theme Art (TA 1:6)
Same product rebranded. Light lavender. bg `#FCF4FF`, primary `#A875FC`, light tint `#F4ECFC`, ink `#101018`. Type: heavy slab/rounded display for screen titles ("Theme Widgets", "Icon Setup"), sans body. Radius: card 12–16, chip 8 (active filled purple, inactive outline), pill buttons. Icons: 3D glossy purple (gear, crown, collection tiles). Illustration: kawaii purple cat 3D renders. Signature: lavender everywhere, 3D purple header icons.

### 4.3 Rolling Icon (RI 7011:12459)
Light white + purple. primary `#A875FC`, banner `#9C68F8`, tint `#F4F0FC`, ink `#10101C`; neon content (LED borders, lightning). Type: chunky black display wordmark, geometric sans body. Radius: card 12, feature tile 12, pill buttons. Icons: outline lavender nav; 3D app-icon renders (rolling, heart, cube). Signature: flying 3D app icons on a purple hero; light and dark Language/OB templates (5002:13751 / 5002:58488).

### 4.4 Pet Shimeji (PS 1:5)
Light cream. bg `#FFF8F2`, primary gradient `#FF4F15`→`#FFD117`, OB title `#FF8548`, card tint `#FFEBDF`, 2dp dashed `#FF4F15` slot border (tile border 1dp `#FFDAC4`), language checkbox gradient `#FF62B3`→`#B339FF`, success `#1EB724`. Type: **pixel/8-bit monospace** headers ("Pet Shimeji", "Choose Pet"), sans body. Radius: small (tiles and buttons 6, cards 12, dialog 20; not pills); arcade elevation (2dp white rim + hard 0 3 0 tinted shadow + inner gloss), dashed slot tiles. Icons: pixel-art lock, paw, home. Illustration: chibi anime pets and stickers. Signature: pixel font + dashed slot grid + expanding gradient nav pill.

### 4.5 Ringtone (RT 0:1)
**Dark**. bg `#000000`, surface `#1A1A1F`, nav bar `#121921` (top radius 24), primary gradient `#FF539B`→`#E1336D`, ink white, muted `#8F909A`, VIP gold. Type: neutral grotesk (Inter/SF-like), bold 18 titles. Radius: cards 12, chips/permission cards 16, dialogs 24, pills r40/44/100. Icons: filled white glyphs, pink gradient app glyph (note + bars). Content: seasonal photo-real category art (Autumn, Halloween, Christmas, Valentine, World Cup). Signature: waveform trimmer + pink gradient on black.

### 4.6 Charge Visuals (CV 0:1)
Light, soft. bg white with pink header wash `#FCF0F4`, primary coral `#FF6078`, splash gradient `#FCECFC`→`#ECD4FC`→`#BCDCFC`, OB hero art dark night-sakura with neon pink ring. Type: neutral sans, medium weight. Radius: card 10, banner 12, pills. Icons: outline nav, colourful setting icons. Content: cute seasonal charging animations (Halloween cat, Snoopy). Signature: multi-gradient hero carousel + heart/diamond corner badges.
Anti-example: its splash still shows the Theme Art icon and name ("ThemeArt: Themes Widgets Icons", 107:20569).

### 4.7 Santa Call (SC 0:1), red 137:* and green 110:*/124:*
Saturated full-bleed seasonal bg. Red: bg `#B8081C`, CTA `#E00000` with candy-stripe texture, gold `#F4C03C`. Green: bg `#1A704C`, red striped CTAs (Start, Call). In the red version the setup "Call" and permission "Allow" pills are green striped (`#3C9A3C` approx): the two versions swap the complementary colour. Type: wide extra-bold display ("Santa Call", "Video Call"), hand-lettered "Merry Christmas", quirky rounded body. Radius: full pills for rows and buttons; dialogs shaped as scroll paper. Icons: 3D Christmas props, characters in wreath frames. Signature: candy-cane buttons, wreath avatars, scroll dialogs, photo-real Santa call screen.

## 5. Variation levers

May change per app (designers did change these):
- Background treatment of splash/OB/home (pastel iridescent, warm gradient, lavender, black, full illustration).
- Primary/accent colour, also applied to the ad CTA, "Ad" badge, paywall sticker, countdown boxes, indicator and Next text.
- Display face for wordmark and titles (script, slab, pixel, wide, plain sans); body stays a clean sans.
- Illustration family (clay 3D, kawaii 3D, chibi 2D, photo-real, neon render) and the onboarding mock-up content.
- Icon style (filled, outline, 3D, pixel), radius scale (8 square-ish → full pill), nav active style (filled icon vs expanding pill), language row style and confirm action.
- Copy voice ("Santa needs microphone access so you can talk…").

Must not change:
- Screen order and count: Splash → Language → 4 OB pages (+ native-full pages) → Home; no Skip.
- Language: title top-left, confirm top-right after selection, 56dp rows, native Big ad bottom 300/917.
- OB: illustration top half, centred title + body, indicator bottom-left + Next/Get Started bottom-right, ad bottom third.
- Ad component geometry and labels ("Ad" badge, AdChoices, CTA pill), "This action can contain ads" on splash.
- Paywall template (plans, BEST DEAL, Continue, legal links), rating and update dialogs.

## 6. Anti-monotony rules

1. Pick a world combination not used yet: {light pastel, light cream, light white, black, full-bleed saturated} × {red, lavender/purple, orange, pink-on-black, coral, Christmas red/green} × {script, slab, pixel, wide display, plain sans}. TA and RI already share lavender `#A875FC` with chunky display type; avoid a third purple app.
2. The topic must show on the first frame: splash background + icon + wordmark face (TM, PS, SC do this; RI template and CV do not).
3. Onboarding art shows the app's own screens or its core object in context, re-skinned for the topic, never a generic stock hero.
4. Give each app one signature component: script crown header (TM), dashed slot grid (PS), waveform (RT), corner badges (CV), candy-stripe CTA + wreath avatars (SC).
5. Recolour everything that inherits brand: native ad CTA, paywall sticker and countdown, nav active state, chips, success screen accents.
6. Never copy a sibling app's splash icon/name or placeholder text into a new file (CV 107:20569 reuses the ThemeArt splash; the TA master still reads "Title onboarding_1").
7. A seasonal app can ship two whole colour versions of the same flow (SC red/green); use that for A/B or seasonal swaps instead of a new layout.
8. Dark is a deliberate choice for media/audio topics (RT); its paywall and ad blocks stay light.
