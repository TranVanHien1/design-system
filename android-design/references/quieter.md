# Quieter

`quieter` reduces visual intensity in screens that are too loud, aggressive or overstimulating, without losing
personality or collapsing into generic. Use it when everything shouts: saturated containers everywhere, heavy
weights, bouncy motion, stacked elevation. Quiet design is harder than bold design; subtlety needs precision. It
works through the theme (color scheme, type weights, shapes, motion scheme, elevation) and never removes the
affordances M3 needs: the primary action, the nav indicator, error states and 48dp targets stay legible.

On Operate screens quieter means less noise: fewer container tints, flatter surfaces, less color, less motion,
so the tool disappears into the task. On an onboarding or empty-state screen it means a more restrained palette
and more air; drama is reduced, not eliminated, and the point of view survives.

## Assess

1. **Intensity sources:**
   - **Color:** saturated seed, `primary` and `primaryContainer` spent on decoration, several container colors
     on one screen.
   - **Contrast extremes:** high-contrast juxtapositions everywhere instead of where it matters.
   - **Weight:** Bold on every title, `display` roles used as section headings, filled buttons in every row.
   - **Motion:** `expressive` springs on routine changes, staggered entrances on every screen, looping
     decoration.
   - **Complexity:** gradients, patterns, illustrations competing with content.
   - **Depth:** shadow elevation on cards, multiple surface tiers stacked, scrims.
2. **Context:** what is the screen for, who uses it how often, what is working, and what must survive.

If purpose or audience is unclear, ask the user (structured question tool when available) and wait.

"Quieter" means refined and easier on the eyes, not generic. Generic quiet is gray text on white, one weight
everywhere and a grid of identical cards; restraint still needs a point of view.

## Plan

- **Color:** desaturate the scheme, or move color from regions to accents?
- **Hierarchy:** which very few elements stay strong, which recede?
- **Removal:** what can go entirely?
- **Quality signal:** how does restraint show care (spacing precision, type detail, one refined accent)?

## Refine

### Color

- Regenerate from a lower-chroma seed, or pin a quieter neutral:
  `node <skill>/scripts/theme.mjs --seed "#…" --neutral "#…" …` (see [colorize.md](colorize.md)). Shift
  saturation down about 15–30% rather than to gray.
- Let `surface` and the surface-container tiers do most of the work; color appears on the primary action, the
  selection and status. Under ~10% of any screen carries accent color.
- Replace `primaryContainer` regions with `surfaceContainerLow`; replace container-colored chips with outlined
  or `surfaceContainerHigh` ones.
- On colored containers, secondary text is the container's `on` role at lower emphasis, never gray.
- Keep `error` loud: quiet never mutes a real problem.

### Weight and type

- Bring weights down one step (Bold → SemiBold or Medium, SemiBold → Medium). Remove bold from body copy.
- Reduce scale jumps: a `headlineSmall` where a `displaySmall` was shouting; one role dominates per screen.
- Hierarchy through size, space and `onSurface` vs `onSurfaceVariant`, not color and boldness.

### Components and surfaces

- Filled buttons for the primary action only; secondary become tonal, outlined or text.
- Cards: `tonalElevation` and `shadowElevation` to 0, or `OutlinedCard`; or drop the card for space.
- Dividers: `outlineVariant`, inset, or removed when spacing already separates.
- Shapes: pull extremes toward the middle of `MaterialTheme.shapes` (a pill everywhere → medium corners), one
  corner family.
- Remove decorative gradients, blurs, patterns and glows that serve nothing.

### Motion

- Switch `MotionScheme.expressive()` to `MotionScheme.standard()` (material3 1.4+), or raise damping to 1.0 in
  the fallback springs: no overshoot.
- Shorter distances (8–16dp instead of a full-width slide), effects over spatial movement.
- Remove decorative loops and per-item staggers; keep feedback and continuity.
- Remove an animation entirely if it serves no purpose. See [animate.md](animate.md).

### Composition

- More air: step spacing up one notch between groups; fewer items per screen.
- Bring rogue elements back to the grid and the spacing scale.
- Even out extreme spacing variations into a consistent rhythm.

**Avoid:**

- making everything the same size and weight (hierarchy still matters);
- removing all color (quiet is not grayscale);
- erasing personality instead of refining it;
- weakening affordances: the primary action, selection and errors must still be obvious;
- making everything small and light; a quiet screen still needs an anchor.

## Verify

On device, light and dark, per [verify.md](verify.md):

- **Functional:** tasks are as fast as before; the primary action is found in a squint.
- **Distinctive:** it still looks like this product, not a template.
- **Comfortable:** easier to read and use for a long session.
- **Restrained, not absent:** the point of view survives the cuts.

When the result feels right, hand off to `/android-design polish [target]`.
