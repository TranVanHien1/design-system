# Base flow (fixed across every app)

Every app the team ships opens with the same first-run structure. Its anatomy is fixed; each app changes only its skin. Templates: `<skill>/assets/flow/base/` (written into a project by `scripts/flow/new-flow.mjs`). Measured geometry and the per-app evidence: [reference-patterns.md](reference-patterns.md) §1.

## How much to design here (team priority)

The base flow is reused, not redesigned. Per app, deliver only:
1. **App icon** for the splash (and launcher): one mark in the app's world, readable at 48dp and on the splash at 120dp; give the image prompt or the drawn asset.
2. **4 onboarding illustrations**, one per page, each showing the app's own screens or its core object in context (never a stock hero), with an image prompt and the target size (412×468 area, important content above the 100dp fade).
3. **Onboarding copy**: per page a title (3–5 words) and a subtitle (one sentence, ≤2 lines), in the app's languages.

Everything else on splash, language and onboarding comes from the templates unchanged (colours follow the app tokens automatically). Spend the design effort on the functional screens from Home onward ([html-flow.md](html-flow.md)).

## Order

**Splash → Language (first run) → Onboarding 1 → 2 → 3 → 4 → (paywall on first run, if the app sells premium) → Home.**
- Onboarding is **always 4 pages**, **no Skip**.
- With ads: an interstitial after splash, a Native Big ad on the bottom third of Language and every onboarding page, and a full-screen native page after OB1 and OB3. Without ads (default until the user asks for ads): none of these, and the screens use their no-ad layout.
- Returning users: Splash → Home (language and onboarding never repeat; language changes live in Settings).
- Permission screens and the paywall attach to the first action that needs them (or right after OB4 for a first-run offer), never between onboarding pages. Closing either returns to the screen that opened it; the first-run paywall returns to a first-run Home state.
- An optional preference step after OB4 (e.g. "phong cách bạn thích") is allowed only with "Bỏ qua" and an always-enabled CTA, and its picks must show on the first Home.
- Without ads the onboarding pages keep the ad-ready geometry (hero 0–411, title ~424, body ~456, indicator/CTA row ~500–512) with a quiet swipe hint in the reserved bottom third, so adding ads later moves nothing.

## Fixed anatomy (do not change) — measured, frame 412×917

Templates in `assets/flow/base/` implement exactly this; full anatomy and per-app variants in [components.md](components.md).

| Screen | Fixed |
|---|---|
| Splash | App icon **120 r24 at x146 y239** (optional 3dp brand ring); app name Bold 20/28 at y375 in the display face; loading block from y743: "Đang tải 40%" Bold 16/20 + spinner 32; with ads "Thao tác này có thể chứa quảng cáo" Medium 14/20 at y818, or the spinner + 412×52 adaptive-banner variant. |
| Language | Title Medium 20/24 at **x20 y75**; confirm top-right **only after a choice** — plain 24 tick at x364 y75 (default), or "Next" pill 72×32 r100 at x324 y71, or 48 round check (`new-flow --confirm tick|pill|round`); rows **372×56 at x20 from y123, step 68, r8**, padding 12/16, round flag 28, gap 16, label **Regular 16/20**, radio 24 right; **selecting changes only the radio** (no row border/tint); hand hint on the first row before a choice; English first, then the device language. |
| Onboarding 1–4 | Illustration **0–468 full-bleed with a 100dp fade** (the app's own screens/core object); text block x16 w380 from **y480**: title **Bold 20/28 brand**, gap 8, body **Regular 16/20**, centred; row at **y572**: indicator x16 (**18×4 pill + 4×4 dots, gap 4**) and a **text-only CTA SemiBold 20/24 brand, right edge x396, no chevron** ("Bắt đầu" on page 4). Never Skip, never a full-width button. |
| Ads (when on) | Language + each OB page: Native Media_Big 412×300–310 at **y607–617**; native full after OB1 and OB3; interstitial after splash. Some apps deviate deliberately (RT Item 296; SC no ad on Language, Colab_Left on OB) — follow the brief. |
| Full-screen native | Immersive: creative + scrims, X 36 at x356 y56 / countdown pill 28 at y93 / progress bar, header y781, CTA 372×52 at y841; or the contained family (blurred bg, 240 media, white card). |

**Vietnamese:** the files set "Next" and the language title in Poppins, which has no Vietnamese glyphs. Base templates use Momo Trust Sans (the team's text face, Vietnamese ✓); keep it for any Vietnamese copy.

## Per-app levers (change these)

- **Background** of splash and onboarding: topic illustration, gradient, flat colour, or black.
- **Colours**: brand colour on the icon tile, onboarding title, indicator, CTA text, language selection, ad badge/CTA when ads exist.
- **Illustrations**: one family per app (3D clay, flat vector, photo-real, neon render, pixel…). Onboarding art shows the app's own screens or its core object in context, re-skinned for the topic, never a stock hero.
- **Type**: display face for the app name and titles; body stays a clean sans with Vietnamese coverage.
- **Copy**: the app's own benefits, in its voice; Vietnamese first when the app ships it.
- **Row and control style** on Language (fill, radius, selected treatment, confirm as tick / check badge / "Tiếp" pill).

## Anti-monotony (pick a combination no sibling app uses)

Before choosing a direction, read `data/topic-worlds.json` and [reference-patterns.md](reference-patterns.md) §4–6: the shipped worlds are light pastel/red script (Theme Mix), lavender + chunky display (Theme Art, Rolling Icon), cream + pixel (Pet Shimeji), black + pink gradient (Ringtone), soft coral (Charge Visuals), saturated Christmas red/green (Santa Call). A new app takes a different {background × colour × display face × illustration family} combination, its topic visible on the splash, and one signature component of its own.

## Checks before handing over

- All 4 onboarding pages exist, same anatomy, different illustration and copy; the indicator matches the page.
- Language shows both states (before choice with hint, after choice with confirm).
- The splash says what the app is from its background, icon and name alone.
- No placeholder text from a template or a sibling app remains ("Tiêu đề lợi ích", "Minh họa", another app's name).
