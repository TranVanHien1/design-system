# Shape

`shape` plans a screen or flow before any Compose code exists: it discovers the job, the information, every
`UiState` variant, where the screen sits in navigation, the primary action and the Material 3 components, then
returns a written screen brief for the user to confirm. Use it for a new screen, a new flow, or a screen whose
structure is in question. It never writes code, never edits the theme, and never picks a visual world;
[new-work.md](new-work.md) owns direction and build.

Read PRODUCT.md first (run [init.md](init.md) if it is missing) and [android-m3.md](android-m3.md). Read
[operate.md](operate.md) for how app screens compose on a phone. If DESIGN.md exists, the visual world is
settled; shape only decides structure inside it.

## Phase 1: Discovery interview

Do not write code or choose a visual direction yet.

### Cadence

- Use the structured question tool when available; otherwise ask and stop.
- Two or three related questions per round, then wait. One round is the default; add a second only when the
  answers expose a material gap.
- Do not dump a questionnaire, repeat settled facts, or turn obvious facts into menus. Assert the likely
  reading from PRODUCT.md and the code, and invite correction.
- A sparse prompt needs at least one answer round. A precise prompt may need only a compact confirmation.

### Round 1: job, person, outcome

Pick the two or three that most change the result:

- What is this screen for, and which job does the user come to finish here?
- Who reaches it, from where (cold launch, notification, deep link, a list row), and in what state of mind?
- What is the one thing they must understand or do? What does success look like when they leave?
- What is uniquely true here that a template screen from another app could not claim?

### Round 2: material, behavior, boundaries

Only for decisions still open:

- What real data does the screen carry? Realistic minimum, typical and maximum: zero items, one, 30, 5 000;
  a 4-character name and a 60-character Vietnamese or German one.
- Which states matter: first run, loading, refreshing, empty, partial, offline, error, permission denied,
  success, read-only, expert use?
- Fidelity and breadth: one screen, a full flow, phone only or also medium/expanded widths?
- What must stay untouched? What would make the result feel wrong even if it looked polished?
- Binding constraints: minSdk, offline, performance on low-end devices, accessibility, localization.

Never ask for hex values, dp values or canned aesthetic lanes.

## Phase 2: Resolve direction (only when open)

Inside an established DESIGN.md world, keep the visual system fixed and decide structure only. For a new app,
a brand expansion or a replacement world, run [new-work.md](new-work.md) through its direction round, then come
back here before any implementation. Onboarding and paywall screens may lean Persuade in composition while
staying Material 3 in structure.

## Phase 3: Write the screen brief

Write the smallest brief that lets a builder start without inventing decisions. Three to five bullets are
enough for a settled, single-state screen; use the full template for a new screen, a flow or anything
ambiguous. Do not restate the conversation.

```markdown
# Screen brief: <ScreenName>

## Job
- Who arrives, from where, and the job they finish here.
- Success: <observable outcome>. Must never fail: <the one task>.

## Information
- Priority order of what the screen shows (1 = seen first at 412×915dp).
- Data ranges: min / typical / max for each list and field. Longest realistic strings.
- What is hidden behind disclosure (overflow menu, detail screen, bottom sheet).

## UiState variants
| Variant | Trigger | What the user sees | Primary action available? |
|---|---|---|---|
| Loading | first load, no cache | skeleton matching Content layout / progress | no |
| Content | data present | ... | yes |
| Empty | zero items, first run vs. filtered-to-nothing | message + next action | yes: <action> |
| Error | network/server failure, no cache | cause in plain words + Retry | Retry |
| <others> | Refreshing, Offline with cache, PermissionDenied, Partial, Submitting, Success | ... | ... |
Transient feedback (snackbar, not a state): <list>. State to survive process death: <fields>.

## Navigation placement
- Kind: top-level destination (NavigationBar item) / pushed detail / bottom sheet / dialog / full-screen dialog.
- Entry points and deep link. Back: where system Back and predictive back go; unsaved-change handling.
- Medium/expanded width: rail or drawer; list-detail pane or single pane.

## Primary action
- The one action, its placement (FAB / bottom-anchored button / top app bar action / inline) and why it sits
  in thumb reach. Secondary actions and where they live (≤2 app-bar icons, rest in overflow).

## M3 components
| Need | Component | Rejected alternative and why |
|---|---|---|
| Screen frame | Scaffold + TopAppBar (small/medium/large, scroll behavior) | |
| ... | ListItem, Card (filled/elevated/outlined), FilterChip, SegmentedButton, ModalBottomSheet, SearchBar, PullToRefreshBox, Snackbar, ... | |

## Scope and boundaries
- Fidelity, breadth, what stays untouched, explicit anti-goals.

## Constraints and open decisions
- Accessibility (TalkBack order, font scale 2.0), localization, offline, performance, permissions.
- Decisions a builder must not invent; list them for the user.
```

Rules for a good brief:

- **Every state is designed, not defaulted.** A screen with only Content specified is not shaped. Empty
  distinguishes first-run from filtered-to-nothing; Error says what failed and offers recovery; Loading
  matches the Content layout so nothing jumps.
- **States map one-to-one to `UiState` variants** the ViewModel will expose. Name them as the code will.
  Transient events (saved, undo, copied) are snackbars, not states.
- **One primary action per screen.** Never two FABs; never a FAB spent on a secondary task.
- **Navigation is M3.** NavigationBar for 3–5 top-level destinations on compact width; rail or drawer on
  medium/expanded. System Back always works and is never hijacked.
- **Components come from Material 3** before anything custom. A custom component needs a reason the brief
  states.
- **Intent, not values.** Hierarchy, grouping, reach and feedback, not dp or hex.

## Confirm and stop

Present the brief for explicit confirmation or one correction round, then stop. Shape never writes code,
theme files or DESIGN.md. Once confirmed, the user builds with [new-work.md](new-work.md) (or a scoped command
on an existing screen); save the brief to `docs/design/briefs/<screen>.md` only if the user asks.

When no human or answer mechanism exists, mark assumptions plainly, return the brief, and stop.
