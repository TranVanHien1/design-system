# New visual work

Use this flow for a new screen, a new app, or a replacement visual identity. PRODUCT.md owns product truth, DESIGN.md owns durable visual decisions, the theme files (`ui/theme/*.kt`) are the executable form of DESIGN.md. Complete [init.md](init.md) first when PRODUCT.md is missing and the work creates a surface; a missing DESIGN.md does not route back to init.

## 1. Decide what is already true

Read DESIGN.md, the theme files, representative screens and shared components (your [context.md](context.md) note has the paths).

- **Established world:** a branded theme and coherent screens exist. Inherit it. A missing DESIGN.md does not erase an identity that lives in code; offer `/android-design document` instead of inventing a replacement.
- **Redesign:** the user wants the look replaced. Preserve product truth, content, function, navigation model and explicit brand commitments; replace the visual world rather than polishing it. The old look is evidence of what the subject is, not authority over what it becomes.
- **Incomplete brand:** a logo colour or a typeface is pinned, the rest is the template. Keep the pinned assets, decide the rest with the user.
- **No visual authority:** the Android Studio template theme (purple `#6750A4`/`#6650a4`, default `Typography()`) or nothing. Create a world with the user.

A section, component, feature or state inside an established screen inherits that screen. Never turn a local addition into an identity exercise.

## 2. Ask what will change the work

Before implementation, confirm through the structured question tool: two or three related questions; a precise request needs only a compact confirmation. Skip what PRODUCT.md or the brief already settles. Ask about the task, the information, the important states, how often it is used, and the scene (one hand on a bus, a desk, a dark bedroom). Ask what success looks like, what must stay untouched, and what would make a polished result feel wrong. Never ask for hex values or "modern vs minimal" style lanes.

## 3. Choose the right amount of invention

**Extend an existing screen.** Inherit its world and composition. Resolve only purpose, content, hierarchy, states and how the addition joins its neighbours. No round, no DESIGN.md change unless the user approves a durable system change.

**A new screen inside an established world.** The visual system is fixed; decide structure. Derive three materially different compositions from the content and the task (use the phone patterns in [operate.md](operate.md) and `node <skill>/scripts/deal.mjs --list kinds` / the pattern list it prints for the kind), ordered by how directly each answers the screen's one question. Present them as options with a small monospace phone sketch in each option's preview (412dp-wide frame: app bar, first-screen blocks, nav), the user locks one, then go to [shape.md](shape.md) Phase 3 or straight to build for a narrow request.

**Create or replace the visual world.** Run the direction round (§4). No substitute, no skip: writing theme or screen code for a new world before the round has run and a direction is chosen is a contract violation, whatever the time pressure. The round is what keeps every run from converging on the category default.

## 4. The direction round

1. **Name the truth.** In your notes, one sentence each: the product's unique mechanism; the audience's real scene of use; its cultural home (Vietnamese students? small shop owners? night-shift nurses?); what the first screen must prove. Then name the rut: the screen this category always ships (for a cleaner: a big circular gauge and a "Boost" button on blue-purple; for a budget app: a gradient balance card over four tinted KPI tiles) and its predictable opposite. Both are excluded.
2. **Deal.** Run
   `node <skill>/scripts/deal.mjs --brief "<the product in one or two lines, user's language is fine>" [--kind <id>] [--brand "#hex"] [--theme light|dark]`
   Pass `--brand` when the brand colour is pinned, `--theme` only when the brief pins it, `--kind` when the inferred kind is wrong (`--list kinds`). The script deals three directions: two researched for the kind and one **challenger** from outside it, each with its style, palette, type pair (Vietnamese-capable unless `--any-script`), shape preset, motion character, the Material 3 translation, the "give it a face" moves, and the exact `theme.mjs` command.
3. **Fuse each direction with the product.** For each, write: which face move it takes (one, from its list) and the **signature element only this product has** (a cleaner's freed-space figure, a budget app's month as a ledger column, a vocabulary app's word of the day set as type); how the first screen looks in one sentence; how it carries the mechanism. The direction supplies form and discipline; the product supplies every fact; clarity wins conflicts.
4. **Weigh on two axes only:** does the audience recognise itself, and does the product's job read faster. Give each a verdict line. A challenger that loses still donates one discipline the leading direction lacks (a palette's total commitment, a density's courage); write that raise into the leading direction as a named line. Donations transfer discipline, never clothes: a borrowed button style is a costume.
5. **Present.** Structured question tool, one option per direction in the order dealt, each with: name, the one-sentence first screen, palette accent and type pair, honest risk. A preview per option may sketch the first screen in monospace. Add **"Re-roll"** (fresh hand, nothing repeats) and, last, the standing exit **"Category standard, played straight"**. Never recommend the standing exit and never pre-select by your taste. If the user re-rolls, rerun with `--reroll <n>`; after two re-rolls in a row, ask what quality is missing.
6. **Pinned beats dealt.** A user- or brief-pinned colour, face or mood always wins; the deal fills only the open dimensions. Re-roll on your own only on factual grounds (the direction cannot carry the product's task), never on taste.

The standing exit is the user's door: when they take it, convention becomes the commitment. Ask for two or three apps it should sit alongside, make their craft the bar, and execute the M3 standard at full fidelity with a branded (non-purple) scheme, a decided type pairing and real content. Record the preference in PRODUCT.md's Brand Commitments.

## 5. Commit the direction

1. **Theme files.** Run the direction's `theme.mjs` command with the real package and output path (`--r-package` when the app namespace differs from the theme package's prefix; `--name` to match the existing theme function). If theme files exist, the script refuses to overwrite: show the user what will change (old vs new key colours), then rerun with `--force`. Default `--fonts bundled` (works without Google Play services); `--fonts downloadable` only when the user prefers a smaller APK.
2. **Fonts.** Add the files the script lists under `res/font/`, static TTFs of exactly those weights. Confirm each renders `Ứng dụng Ặ Ỡ Ữ Ẩ ệ ỹ`. A Fontshare face needs its licence checked for app embedding before release; say so to the user.
3. **Contrast.** Read the script's contrast table. Every ✗ is fixed before any screen work: adjust `--brand`, or choose a palette's darker accent, and regenerate. Never hand-edit generated colour values.
4. **Wire it.** `enableEdgeToEdge()` then `AppTheme { … }` at the root; dark-first directions default the app's theme setting to Dark. Dynamic colour stays an opt-in setting unless the user decides otherwise.
5. **Record it.** Write DESIGN.md with [document.md](document.md) (seed mode if no screens exist yet): the direction id, the role-usage rules from its M3 lines, the face move, the signature element, shape preset, motion character, and the Avoid list as Don'ts. Add any brand commitment the user stated to PRODUCT.md.

## 6. Build the first screen

1. Write the screen brief ([shape.md](shape.md) Phase 3) unless the request is narrow: job, information, `UiState` variants, navigation placement, primary action, M3 components.
2. Compose it with [operate.md](operate.md): the one question answered first, every block's header and first rows in the first screenful (412×915dp), the signature element as the lead.
3. Read [craft-floor.md](craft-floor.md) immediately before editing UI code.
4. Build stateless screens fed by `UiState`, with previews for every variant (they become the screenshot-test fixtures).
5. [verify.md](verify.md): light, dark, font scale 2.0, Vietnamese, every state; fix, look again.
6. Before handing over, check the result against the chosen direction: if the first screenshot does not show the face move and the signature element, the direction was not built, only themed. Fix that before calling it done.

## Truth

Every direction must be viable: what it visualizes is true, its palette and components exist, its composition works at phone width within the app's assets and performance budget. Truth binds claims, not demonstrations: in greenfield work, author illustrative content at full fidelity (real-sounding Vietnamese names, plausible amounts), label it as sample data in previews and fake repositories, and hand the user the list of what must be replaced with real material. Never invent commercial or factual claims: prices, ratings, download counts, benchmarks, capabilities the product does not have. Refusing a bold direction because its demonstration data does not exist yet is the timidity reflex wearing honesty's clothes.
