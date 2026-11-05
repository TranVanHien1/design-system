# Base flow (fixed across every app)

Every app the team ships opens with the same first-run structure. Its anatomy is fixed; each app changes only its skin. Templates: `<skill>/assets/flow/base/` (written into a project by `scripts/flow/new-flow.mjs`). Measured geometry and the per-app evidence: [reference-patterns.md](reference-patterns.md) §1.

## Order

**Splash → Language (first run) → Onboarding 1 → 2 → 3 → 4 → (paywall on first run, if the app sells premium) → Home.**
- Onboarding is **always 4 pages**, **no Skip**.
- With ads: an interstitial after splash, a Native Big ad on the bottom third of Language and every onboarding page, and a full-screen native page after OB1 and OB3. Without ads (default until the user asks for ads): none of these, and the screens use their no-ad layout.
- Returning users: Splash → Home (language and onboarding never repeat; language changes live in Settings).
- Permission screens and the paywall attach to the first action that needs them (or right after OB4 for a first-run offer), never between onboarding pages. Closing either returns to the screen that opened it; the first-run paywall returns to a first-run Home state.
- An optional preference step after OB4 (e.g. "phong cách bạn thích") is allowed only with "Bỏ qua" and an always-enabled CTA, and its picks must show on the first Home.
- Without ads the onboarding pages keep the ad-ready geometry (hero 0–411, title ~424, body ~456, indicator/CTA row ~500–512) with a quiet swipe hint in the reserved bottom third, so adding ads later moves nothing.

## Fixed anatomy (do not change)

| Screen | Fixed |
|---|---|
| Splash | App icon ~92dp centred at 34% height; app name below in the display face; loading line ("Đang tải 40%" + thin progress) near the bottom; with ads, "Thao tác này có thể chứa quảng cáo" under it (or spinner + 320×50 banner variant). |
| Language | Title top-left ("Chọn ngôn ngữ"); confirm action top-right **only after a choice**; one list of 56dp rows: round flag, native language name, radio; hand hint on the first row before any choice; English first, then the device language. |
| Onboarding 1–4 | Full-bleed illustration from the top fading into the background; centred title (3–5 words, title colour) + centred body (one sentence, ≤2 lines); indicator bottom-left (18×4 pill + 4×4 dots); text CTA "Tiếp ›" bottom-right, "Bắt đầu ›" on page 4. Never a full-width button, never Skip. |
| Full-screen native (ads only) | Full-bleed creative, "Ad" badge + countdown then close X top-right, advertiser icon + headline + body, full-width CTA pill. |

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
