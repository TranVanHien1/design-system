# Distill

`distill` strips a screen or flow to its essence, removing what does not earn its place: redundant elements,
repeated information, decorative noise, cosmetic complexity. Use it when a screen is cluttered, has competing
actions, or carries more chrome than content. Simplicity is not removing features; it is removing obstacles
between users and their goals. It must not delete functionality users need, weaken accessibility, or move M3
structure off-spec in the name of minimalism.

## Assess current state

1. **Find the complexity sources:**
   - **Too many elements:** competing buttons, a FAB plus a filled button plus three app bar actions, redundant
     labels.
   - **Excessive variation:** many colors, type roles, shapes or card styles without purpose.
   - **Information overload:** everything visible at once on a 412dp-wide screen.
   - **Visual noise:** cards in cards, dividers between every row, shadows, tinted backgrounds that encode
     nothing.
   - **Confusing hierarchy:** no single obvious primary action.
   - **Feature creep:** too many options, filters, settings or paths forward.
2. **Find the essence:** the ONE primary goal of this screen; what is necessary vs nice to have; what can be
   removed, deferred or combined; the 20% that delivers 80% of value.

If the primary goal or a removal's impact is unclear from the code and PRODUCT.md, do not guess. Ask the user
(the structured question tool when available) and wait.

## Plan

- **Core purpose:** the one thing this screen accomplishes.
- **Essential elements:** what that purpose truly needs.
- **Progressive disclosure:** what can wait behind a tap.
- **Consolidation:** what can merge.

Expect to say no to good ideas to make room for great execution.

## Simplify

### Information architecture

- **One primary action per screen:** one FAB or one filled button, not both competing. Secondary actions are
  tonal, outlined or text buttons; the rest go to the overflow menu.
- **Top app bar:** at most two or three action icons; everything else in the overflow (`DropdownMenu`).
- **Navigation:** 3–5 top-level destinations. A sixth goes into a destination or settings, not a crowded bar.
- **Progressive disclosure:** `ModalBottomSheet` for secondary options, an expandable `ListItem` section, a
  "More options" row, a detail screen. Not a dialog chain.
- **Remove redundancy:** if the app bar title says it, the body does not repeat it.

### Visual

- **Color:** one accent role plus neutrals for most screens; container colors only where they encode
  something (see [colorize.md](colorize.md)).
- **Type:** one family, three or four M3 roles per screen, two weights.
- **Decoration:** remove borders, shadows, gradients and tinted panels that serve neither hierarchy nor function.
- **Flatten:** never nest cards; replace a card per list row with `ListItem` rows separated by space or a single
  inset divider; a section is a label and space, not a box.
- **Shapes:** one corner family from `MaterialTheme.shapes`, not a radius per component.
- **Spacing:** one scale (see [layout.md](layout.md)); remove arbitrary gaps.

### Layout

- Linear vertical flow over complex grids on compact width.
- Full-width content with 16dp margins over side-by-side squeezing.
- One alignment: start-aligned content; center only short standalone content.
- Let content breathe; a phone screen that is full edge to edge reads as noise.

### Interaction

- Fewer choices; smart defaults for common cases, ask only when necessary.
- Inline over modal: edit in place, undo in a `Snackbar` instead of confirming in a dialog.
- Remove steps: can the flow lose one? Can a form become two fields and a sheet?
- One obvious next action at every point.

### Content

- Shorter copy: cut filler, not meaning. Active voice: "Save changes", not "Changes will be saved".
- No jargon; no header restating the intro; say it once. See [clarify.md](clarify.md).

### Code

- Remove unused composables, previews of deleted states, orphaned resources (Android Lint
  `UnusedResources`), unused theme tokens.
- Flatten deep `Box`/`Column` nesting and wrapper composables that only forward parameters.
- Collapse one-off `Modifier` chains into the theme or a shared component.
- Reduce variants: does that button need six styles, or do M3's five cover it?
- Collapse duplicate `UiState` branches that render the same thing.

**Avoid:**

- removing functionality users need (simplicity is not feature-less);
- dropping `contentDescription`, labels or 48dp targets for a cleaner look;
- icon-only actions whose meaning is a mystery (mystery is not minimalism);
- removing information users need to decide;
- eliminating hierarchy completely (something must lead);
- oversimplifying a genuinely complex domain; match complexity to the task.

## Verify

Compare before and after on device per [verify.md](verify.md):

- **Faster:** fewer taps and less scrolling to the primary goal.
- **Clearer:** the primary action is obvious in a squint test.
- **Complete:** every removed path still has an access point, or was confirmed unneeded.
- **Accessible:** TalkBack names, targets and contrast unchanged or better.
- **Lighter:** fewer recompositions or overdraw where layers were removed (optional check via Layout Inspector).

## Document removed complexity

Record what was removed and why in the PR or `docs/design/`: removed features, where they moved, and any user
feedback to watch.

When the cuts feel right, hand off to `/android-design polish [target]`. As Antoine de Saint-Exupéry put it:
"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."
