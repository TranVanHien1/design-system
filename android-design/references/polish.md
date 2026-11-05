# Polish

`polish` is the final pass on a screen or flow before it ships: it walks the whole path on a device, fixes
drift from the design system, missing states, inconsistent details and leftover code, and closes the open
critique backlog it worked from. Use it last, after harden/layout/typeset and friends, or alone on a feature
that is functionally done. Polish is refinement, never concealed redesign: keep the incumbent visual world,
content, behavior and everything outside scope. If the concept itself is wrong, say so and recommend
`/android-design bolder`, `/android-design shape` or a redesign through [new-work.md](new-work.md) instead of
smuggling in a replacement.

Read [craft-floor.md](craft-floor.md) before the first edit.

## 1. Establish the system

Read DESIGN.md, the theme (`Theme.kt`, `Color.kt`, `Type.kt`, `Shape.kt`, extended tokens), shared components
and two neighboring screens. If there is no DESIGN.md, use the coherent conventions the code already follows.

Classify each drift before fixing it:

- **missing token**: the system needs a reusable value (route larger cases to `/android-design extract`);
- **one-off implementation**: an existing shared component or M3 component should replace it;
- **conceptual mismatch**: flow, information architecture or hierarchy differs from comparable screens;
- **local defect**: simply incomplete or inconsistent.

Fix the cause at the narrowest correct level. Ask when a binding system principle cannot be inferred.

## 2. Gather the evidence

Use the feature yourself on the emulator or a device, captured per [verify.md](verify.md): compact phone, plus
medium/expanded when the app ships there. Establish:

- whether the path is functionally complete;
- the quality bar and the time available;
- known constraints or deliberately unfinished work;
- the states, content lengths, locales, font scales and input methods (touch, TalkBack, hardware keyboard on
  tablets) users will actually hit.

**Read the latest critique** for this target, if any:

```bash
ls docs/design/critique/<slug>-*.md 2>/dev/null | sort | tail -1
```

Use it only if its frontmatter says `status: open`. Check whether the critiqued sources changed since:

```bash
git diff --quiet <commit from frontmatter> -- <sources from frontmatter>   # exit 0 = unchanged
```

- **Unchanged:** its P0/P1 Priority Issues are your backlog. Name the file you read.
- **Changed** (or no commit recorded): treat its issues as hints to re-check, not as a backlog.

Do an independent pass either way; a critique is one input, not the scope.

## 3. Triage

Fix in this order:

1. broken or blocked tasks, data loss, misleading state, inaccessible paths;
2. missing Loading, Empty, Error, success, disabled and permission states;
3. flow, hierarchy, adaptive and design-system drift;
4. visual and motion inconsistencies;
5. code and asset cleanup.

Do not perfect one corner while the rest of the path sits below the same bar.

## 4. Polish the whole path

### Flow and hierarchy

- Match neighboring screens' mental models, terminology, disclosure, navigation, save behavior and
  optimistic or pessimistic updates.
- Make the primary action and current state obvious without flattening everything to equal weight.
- Connect arrival, transitions, empty and recovery paths. System Back from every state lands somewhere sensible;
  predictive back previews the right destination.

### Layout and type

- Align to the spacing scale; fix optical as well as mathematical alignment (icon + text baselines, leading
  edges of list content, `ListItem` slot alignment).
- Group related content tightly, separate distinct groups clearly.
- Same-role text uses the same `MaterialTheme.typography` role everywhere. Test wrapping with long strings,
  localization expansion and font scale 2.0.
- Content clears system bars and the IME; nothing hides under the navigation bar on gesture or 3-button nav.
- Check every supported window size, not only the current screenshot.

### Color, imagery and icons

- Color roles only; stable meaning in light and dark, and with dynamic color on and off.
- Contrast for text, icons and state layers in every state, both themes.
- One icon family (Material Symbols), consistent weight, fill and optical size; directional icons
  auto-mirrored.
- Images reserve their space with a fixed aspect ratio so nothing jumps when they load; meaningful images have
  `contentDescription`, decorative ones `null`.

### Interaction and state

- Every control has default, pressed, focused, dragged, disabled, loading, error and success behavior where
  relevant: M3 state layers and ripple, not custom alpha hacks.
- 48dp targets; TalkBack labels, roles and state; traversal order that matches visual order; focus restored
  after dialogs and sheets close.
- Motion coherent, interruptible, using the theme's motion specs; Remove animations respected. Do not add
  animation to make polish visible.
- Long, missing, localized, offline, slow and permission-limited content handled where the product can meet it.

### Content and code

- Consistent terminology, capitalization (sentence case for M3 buttons and titles), punctuation. Ask before
  changing factual claims.
- All user-facing text in `strings.xml`; plurals via `pluralStringResource`.
- Remove debug logs, dead composables, unused imports and resources, commented-out code, polish-created
  duplication.
- Replace custom implementations with shared or M3 components where the system owns the pattern; promote a
  value to a token only when it is genuinely reused.

## 5. Verify and finish

Walk the complete path again on device with touch and TalkBack. Check:

- compact phone portrait and landscape; medium/expanded where shipped; split screen if supported;
- Loading, Content, Empty, Error, success, disabled, long-content and missing-content states;
- light and dark, font scale 1.3 and 2.0, Force RTL when the app supports RTL locales;
- logcat free of exceptions and StrictMode violations on this path; no visible jank on a release build;
- agreement with DESIGN.md, neighboring screens and the user's scope.

Run the project's lint and screenshot tests. Fix real defects; document only narrow intentional exceptions.

Finish with a source diff review: remove accidental churn, orphaned code, redundant values and temporary
files. Ship only when the feature is functionally complete and consistently finished across the path.

**Close the backlog.** If this pass used a critique as its backlog and cleared every Priority Issue in it, edit
that file's frontmatter to `status: closed` and add `closed: <yyyy-mm-dd>`. Leave it `open` when any Priority
Issue remains, and never close a critique you did not read or a newer one that landed meanwhile.
