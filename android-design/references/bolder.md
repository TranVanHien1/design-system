# Bolder

> **Additional context needed**: which screen or region is the target, and what must stay untouched.

`bolder` raises one named part of an existing app to the conviction the rest of its system already implies.
Use it when a screen, section or component reads flat or timid next to its neighbors. The surrounding app, its
theme and its conventions are the given; the job is amplification in the system's own vocabulary, not a
rebuild. It never adds colors, fonts, shapes or components the theme does not own, and never bends M3
structure (navigation, app bars, Back, targets) to look louder. The reflex answer, more effects, is the
opposite of bold; reject it first.

An open direction round owns the word first: "bolder" said while directions are on the table in
[new-work.md](new-work.md) means a fresh, more committed deal, not this command. This command refines a screen
whose world already shipped.

## Scope is sovereign

"Everything else stays" is a literal instruction. Touch only the named target. Do not restyle its neighbors,
migrate the screen to a new idea, or add roles, type families, corner families, elevation styles or a new
`MotionScheme` the app does not already use. If the existing theme genuinely cannot express the direction, do
not expand it on your own: ask the user (structured question tool when available), name the exact addition and
the job it would do, and wait.

## Why it reads flat

A region usually reads flat for reasons its neighbors have already solved. Look at what the rest of the app does
that this target does not:

- the display or headline role at full strength (the target uses `titleMedium` where the system speaks in
  `headlineMedium`);
- the signature container (a `primaryContainer` or `tertiaryContainer` region the home screen owns);
- the system's shape motif (a large corner, a cut, a `MaterialShapes` form on material3 1.4+);
- its imagery, illustration or iconography style;
- its density and pacing.

A flat region typically opts out of the system's own strongest moves. The most reliable bolder pass brings it up
to the expressive level its neighbors already reach.

## The amplification

- **Amplify what the system owns.** Reuse its type roles, containers, shapes and motion at full strength, turned
  up for this target. The bolder version looks more like the same brand, not less.
- **Scale contrast is the main lever.** One element much larger (a `displaySmall` number, a full-width image, a
  large-corner container) and everything else clearly smaller. Weight is a secondary lever; bold on everything is
  noise.
- **Color by region, not by sprinkling.** Let one container role own the target's region edge to edge (within
  the screen margins) instead of tinting five small things.
- **Commit, then clarify.** Half-measures read as noise. Make the one decisive move completely, then quiet
  everything around it so the move is legible. If every element got louder, the region got flatter.
- **Give it its own rhythm.** The target reads as a peak in the scroll: a shift in density, scale or surface
  tier from what surrounds it, not more of the same.
- **Motion, if any, is the system's.** The `expressive` spatial spec or the app's existing authored moment; never
  a new bounce.
- **Keep content true.** Existing claims and numbers stay unless the user supplies replacements. If real
  evidence (a photo, a figure) is essential to the direction but absent, ask for it.

## The skeleton test

Imagine the target with every string replaced by gray bars (or screenshot a preview with placeholder text).
Does the skeleton still say what this region is and why it matters, through hierarchy, scale, surfaces and the
system's devices alone? If it only works once the words return, the boldness is in the text size, not the
design. An image placeholder names a job (anchor, evidence), not a cue to drop in decorative stock; fill it with
what the product actually has.

## Platform guardrails

- The primary action keeps its M3 form and position (FAB, filled button). Bolder never adds a second FAB or a
  second filled button.
- Contrast holds: large type still needs 3:1, body 4.5:1, on the new container.
- Font scale 200% and the Vietnamese string still fit; a display-size number wraps or scales down by role, it
  never clips.
- Dark theme is checked: a container region that sings in light can turn muddy in dark.

## Before you finish

- Everything outside the named target is unchanged (diff confirms it).
- No new color role, family, shape or system primitive appeared without being asked for.
- Conventions the target carried, especially anything that drives an action, still work the same way.
- It is unmistakably the same brand, only more sure of itself.

Verify on device per [verify.md](verify.md). When the target holds its own without pulling the screen apart,
hand off to `/android-design polish [target]`.
