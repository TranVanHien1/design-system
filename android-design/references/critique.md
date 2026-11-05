# Critique

`critique` is a UX design review of one Android screen or flow: a design-director read of hierarchy, states,
copy and platform fit, Nielsen heuristic scores, cognitive load, and walk-throughs by 2–3 personas, ending with
targeted questions so the user picks what to fix. Use it before a redesign, before polish, or when a screen
"feels off" and nobody can say why. It does not change code (fixes go to the commands it recommends) and does
not replace [audit.md](audit.md), which checks technical quality.

## Hard invariants

- **Evidence is source plus device screenshots.** Read the composables, the `UiState` and ViewModel that feed
  them, and look at real captures from [verify.md](verify.md). A critique from source alone misses what
  users see; a critique from screenshots alone misses states nobody captured.
- **The chat response is the deliverable.** Write the full report in chat first. The saved file is an archive.
- **The question is the last thing in the response.** Write the whole report, the trend line and the saved
  path first, then ask. Nothing follows the question.
- A run that ends with neither the targeted questions nor a literal `Questions skipped: <reason>` line is
  incomplete. The report is not the finish; the close is.

## Setup

1. **Resolve the target** to concrete source: "the home screen" → `feature/home/HomeScreen.kt` (plus
   `HomeViewModel.kt`, `HomeUiState`); "checkout" → the screens of that nav graph. Name the files.
2. **Slug** the target in lower kebab case from the screen or flow name: `home`, `checkout-flow`,
   `settings-notifications`. Reuse the slug earlier reports used for the same target.
3. **Read context**: PRODUCT.md (users, scene of use), DESIGN.md, [android-m3.md](android-m3.md),
   [tells.md](tells.md), and `docs/design/critique/ignore.md` if it exists (drop matching findings silently).
4. **Gather screenshots** per [verify.md](verify.md) into `docs/design/shots/<run>/`, or reuse a run made
   from the current code. At minimum: compact phone light and dark, font scale 2.0, and every `UiState`
   variant reachable (Loading, Content, Empty, Error, plus Offline/PermissionDenied when they exist). States
   that are hard to reach on device come from `@Preview`s or screenshot tests fed fake state. Add a
   medium/expanded capture when the app ships to tablets or foldables. Name in the report which device or
   emulator produced each capture; emulators prove layout, not gesture feel or performance.

## Assessment

Think like a design director who has used this app type for years. Evaluate:

- **Design specificity.** Is the composition, interaction and visual language grounded in this product, or
  could an unrelated app ship it unchanged? Judge this first, from the screenshots, before reading code.
- **Holistic design.** Hierarchy, information architecture, emotional fit, discoverability, composition inside
  the content area, typography, color, accessibility, states, copy, edge cases.
- **Platform fit.** M3 navigation and components, predictive back, edge-to-edge insets, one FAB, snackbars for
  transient feedback, dialogs only for decisions that must interrupt. Check against [tells.md](tells.md).
- **States.** Each `UiState` variant designed, not defaulted: Loading matches Content layout, Empty
  distinguishes first-run from filtered-to-nothing, Error names the cause and offers recovery.
- **Cognitive load**: the checklist below; report failures and decision points with more than 4 visible options.
- **Emotional journey**: peak-end, valleys, reassurance at high-stakes moments (payment, delete, permission).
- **Nielsen heuristics**: score all 10, 0–4, per the guide below.

## Report

Structure it as a design director would.

**First line:** `Method: design review (source + screenshots from <device/emulator>, run <run>)`.

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | ? | |
| 2 | Match System / Real World | ? | |
| 3 | User Control and Freedom | ? | |
| 4 | Consistency and Standards | ? | |
| 5 | Error Prevention | ? | |
| 6 | Recognition Rather Than Recall | ? | |
| 7 | Flexibility and Efficiency | ? | |
| 8 | Aesthetic and Minimalist Design | ? | |
| 9 | Error Recovery | ? | |
| 10 | Help and Documentation | ? | |
| **Total** | | **??/[applicable max]** | **[Rating band]** |

The applicable maximum is 4 × the heuristics actually scored: /40 when all apply. A heuristic that genuinely
cannot apply (7 and 10 on a splash, a single-purpose onboarding or a paywall screen) is `n/a` with a one-line
reason, and the total is renormalized (24/32). Never print /40 over a partial set. Be honest: most real
screens score 20–32 of 40; a 4 means genuinely excellent.

### Design Specificity Verdict

**Start here.** Does this screen feel authored for this product, or category-interchangeable? Cover coherence,
structural sameness, interchangeable choices, Android slop tells, missed chances for product character.

### Overall Impression
Gut reaction: what works, what doesn't, the single biggest opportunity.

### What's Working
2–3 specific things and why they work.

### Priority Issues
The 3–5 most impactful problems, ordered by importance. For each:

- **[P?] What**: the problem, named precisely ("the Save action is a top-app-bar icon with no label").
- **Why it matters**: how it hurts users or the product goal.
- **Fix**: concrete, in M3 terms.
- **Evidence**: file:line and screenshot filename.
- **Suggested command**: one of `/android-design` + `adapt`, `animate`, `audit`, `bolder`, `clarify`,
  `colorize`, `critique`, `delight`, `distill`, `document`, `extract`, `harden`, `layout`, `onboard`,
  `optimize`, `overdrive`, `polish`, `quieter`, `shape`, `typeset`.

### Persona Red Flags
2–3 personas from the selection table, plus 1–2 project personas when PRODUCT.md's Users section supports
them. Walk the primary action as each and name exactly what broke:

**Casey (Distracted Mobile User)**: "Pay" sits in the top app bar, out of thumb reach. Backgrounding the app
on the address step and returning after process death empties the form.

### Minor Observations
Short notes on smaller issues.

### Questions to Consider
Provocative questions that might unlock better solutions: "What if the empty state were the onboarding?"

Be direct and specific. Say what is wrong and why it matters. Cut "consider exploring". Prioritize
ruthlessly. Don't soften criticism.

## Save the report

After the report is in chat, write the same body (header line through Questions to Consider; not the user
questions or the action summary) to `docs/design/critique/<slug>-<yyyy-mm-dd>.md`. Same slug and date twice:
append `-2`. Frontmatter:

```yaml
---
target: <slug>
date: 2026-11-04
sources: [feature/home/HomeScreen.kt, feature/home/HomeViewModel.kt]
commit: <git rev-parse --short HEAD, or "none">
shots: docs/design/shots/<run>/
total_score: 26
max_score: 40
na_heuristics: ""
p0_count: 0
p1_count: 2
status: open
---
```

`status: open` makes the Priority Issues a backlog; [polish.md](polish.md) reads it and closes it.

**Trend.** Read the frontmatter of earlier `docs/design/critique/<slug>-*.md` files (sorted by date, last 5
including this one) and append one line after the report:

> **Trend for `home` (last 5 runs): 22 → 26 → 29 (out of 40)**
> Wrote `docs/design/critique/home-2026-11-04.md`.

When maxima differ, print each with its own denominator (`24/32 → 30/40`) and say the runs scored different
heuristic sets. First run: "First run for this target, no trend yet." A write failure is reported in one line
and does not block the close.

## Ask the user

In the same message, after everything above, ask targeted questions with the structured question tool and wait:

1. **Priority direction**: "I found problems with hierarchy, state coverage and thumb reach. Which first?"
   Offer the top 2–3 categories.
2. **Design intent**: if the tone missed, ask whether it was intended, with 2–3 tonal directions as options.
3. **Scope**: "Top 3 only", "All issues", "P0/P1 only".
4. **Constraints** (only when findings span many areas): what must stay as-is.

Every question references specific findings and offers 2–3 concrete options; 2–4 questions total. Skipping is
allowed only when the report listed fewer than 3 Priority Issues; then print `Questions skipped: <n> priority
issues`.

## Recommended actions

After the answers, list commands in the user's priority order, each with enough context to act on:

1. **`/android-design harden home`**: Error state has no retry; offline shows a blank list.
2. **`/android-design layout home`**: move Pay to a bottom-anchored button.

Only commands from the list above; skip commands that address nothing; respect scope and off-limits areas; end
with `/android-design polish <target>` if any fix was recommended. Then say:

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `/android-design critique <target>` after fixes to see your score improve.

---

## Cognitive load

Intrinsic load is the task itself: structure it. Extraneous load is bad design: eliminate it. Germane load is
learning: support it with consistent patterns and feedback.

**Checklist** (count failures: 0–1 low, 2–3 moderate, 4+ critical):

- [ ] **Single focus**: the primary task is completable without competing elements.
- [ ] **Chunking**: information in groups of ≤4.
- [ ] **Grouping**: related items visually grouped (proximity, shared container).
- [ ] **Visual hierarchy**: the most important thing is obvious at a glance.
- [ ] **One thing at a time**: one decision before the next.
- [ ] **Minimal choices**: ≤4 visible options at any decision point.
- [ ] **Working memory**: nothing must be remembered from a previous screen.
- [ ] **Progressive disclosure**: complexity appears only when needed.

**Working memory rule**: ≤4 items is manageable, 5–7 is the edge, 8+ overloads. On Android: 1 primary action, 1–2
secondary, the rest in an overflow menu; 3–5 navigation bar destinations; ≤2 top-app-bar action icons.

**Common violations**: the wall of options; the memory bridge (step 3 needs data from step 1); hidden
navigation (no selected indicator, no screen title); the jargon barrier; the visual noise floor (everything
equal weight); the inconsistent pattern (swipe deletes here, archives there); the multi-task demand; the
context switch (opening three screens to make one decision).

## Heuristics scoring guide

Each heuristic, 0–4. Android checks first.

1. **Visibility of System Status.** Progress for async work, pull-to-refresh indicator, snackbar confirming
   save/delete, selected state in NavigationBar, inline validation, upload progress in a notification.
   0 no feedback · 1 rare · 2 partial, major gaps · 3 most operations confirmed · 4 every action confirms.
2. **Match System / Real World.** User's words, not API words; logical order; recognizable Material Symbols;
   localized dates, numbers, currency. 0 pure jargon · 1 mostly confusing · 2 mixed · 3 mostly natural ·
   4 fluent.
3. **User Control and Freedom.** System Back and predictive back always work; Undo in snackbars after
   destructive actions; cancel in dialogs and sheets; clear filters; exit from multi-step flows without
   losing work. 0 trapped · 1 obscure exits · 2 main flows only · 3 most actions undoable · 4 full control.
4. **Consistency and Standards.** M3 components and navigation, same action same result, same gesture same
   behavior, consistent terms and color roles. 0 stitched-together apps · 1 many inconsistencies · 2 main
   flows match · 3 occasional deviation · 4 cohesive.
5. **Error Prevention.** Confirmation for irreversible actions (or undo instead), input constraints (date
   pickers, keyboard types, `KeyboardOptions`), smart defaults, draft autosave. 0 no guardrails · 1 few ·
   2 common errors caught · 3 most blocked · 4 nearly impossible.
6. **Recognition Rather Than Recall.** Labeled navigation and icons, visible options, recent items, search
   suggestions, autofill. 0 heavy memorization · 1 mostly recall · 2 secondary hidden · 3 most discoverable ·
   4 nothing to memorize.
7. **Flexibility and Efficiency.** Swipe actions, long-press multi-select and bulk actions, app shortcuts,
   search, sensible defaults, hardware keyboard support on tablets. 0 one rigid path · 1 few alternatives ·
   2 some accelerators · 3 good accelerators · 4 highly flexible.
8. **Aesthetic and Minimalist Design.** Only what this step needs; clear hierarchy; color with purpose; no
   decorative clutter. 0 everything competes · 1 cluttered · 2 noisy periphery · 3 minor noise ·
   4 every element earns its place.
9. **Error Recovery.** Plain-language cause, specific problem ("Card number is 15 digits, needs 16"), next
   step, error next to its field (`supportingText`, `isError`), input preserved. 0 cryptic or silent ·
   1 "Something went wrong" · 2 names problem not fix · 3 problem and fix · 4 pinpoints, fixes, preserves work.
10. **Help and Documentation.** Contextual hints at decision points, empty states that teach, help reachable
    without leaving the task. 0 none · 1 hard to find · 2 exists, not contextual · 3 mostly task-focused ·
    4 right help at the right moment.

**Bands** (by percentage when n/a lowers the max): 90%+ Excellent (36–40, ship it) · 70%+ Good (28–35) ·
50%+ Acceptable (20–27) · 30%+ Poor (12–19) · below that Critical (0–11, redesign).

**Severity**: P0 Blocking (task impossible; fix now) · P1 Major (significant difficulty or M3/accessibility
violation; before release) · P2 Minor (workaround exists; next pass) · P3 Polish (no real impact). Unsure?
"Would a user contact support or leave a 1-star review about this?" If yes, at least P1.

## Personas

Pick 2–3 for the screen type. Report specific red flags, not generic concerns.

**Alex, impatient power user.** Expert in the category; skips onboarding; wants speed. Checks: core task under
60 seconds? Swipe actions, multi-select, bulk edit? Onboarding skippable? Animations short and interruptible?
Red flags: forced tutorials, one-at-a-time where batch is natural, confirmation dialogs on low-risk actions.

**Jordan, confused first-timer.** New to the category; reads everything; takes labels literally. Checks: first
action obvious in 5 seconds? Icons labeled? Help at decision points? Back always available? Red flags:
icon-only actions, jargon, no confirmation that something worked, ambiguous next step.

**Sam, accessibility-dependent user.** TalkBack, switch access, font scale 200%, low vision or motor limits.
Checks: whole flow completable with TalkBack swipe navigation? Logical traversal order and merged rows? Every
control labeled with state announced? Contrast 4.5:1 in light and dark? Layout intact at font scale 2.0?
Targets 48dp? Red flags: icon buttons without `contentDescription`, color-only meaning, clipped text at large
font scale, custom controls without `Role`, time limits, gesture-only actions with no alternative.

**Riley, deliberate stress tester.** Pushes past the happy path. Checks: 0 items, 1 000 items, 80-character
names, emoji, rotation mid-form, process death mid-flow, Back mid-submit, double tap on Submit, airplane mode.
Red flags: silent failures, raw exception text, empty states with no next step, data lost on rotation or
process death, inconsistent behavior across similar screens.

**Casey, distracted mobile user.** One-handed, on the move, interrupted, slow network. Checks: primary action
in the bottom half? State kept after switching apps and returning? Usable on slow 3G? Autofill and pickers
instead of typing? Red flags: primary actions in the top app bar only, progress lost on interruption, large
free-text inputs where a choice would do, targets too small or too close.

| Screen type | Personas |
|---|---|
| Onboarding / sign-up / paywall | Jordan, Casey, Riley |
| Feed / list / search | Alex, Casey, Sam |
| Dashboard / data-heavy | Alex, Sam |
| Form / checkout / multi-step | Jordan, Sam, Casey |
| Settings | Jordan, Sam |
| Camera / media / map | Casey, Riley, Sam |

**Project personas.** When PRODUCT.md's Users and Scene of Use describe an archetype the five miss (a
pharmacist scanning boxes with gloves, a farmer on a 2018 low-end phone in sun), add 1–2 using: Profile (2–3
traits from PRODUCT.md), Behaviors (3–4), Red Flags (3–4). Never invent audience details PRODUCT.md does not
state.
