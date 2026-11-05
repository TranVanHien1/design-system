# Onboard

> **Additional context needed**: the "aha moment" users should reach, and their experience level.

`onboard` designs first-run flows, empty states and feature discovery so users reach first value fast. Use it
for welcome and setup screens, sign-in placement, permission timing, empty `UiState`s and in-context hints.
Onboarding's job is not to teach the product; it is to get people to the moment that proves the app is worth
their time. It must never block the app behind a mandatory carousel, ask for every permission at launch, or
build a tutorial mode disconnected from the real screens.

A welcome or paywall screen may lean Persuade in composition (one large statement, an image, more air) while
staying M3 in structure: system bars, Back, 48dp targets and real components.

## Assess

1. **The challenge:** what are users trying to accomplish, where do they stall or drop (store reviews,
   analytics funnels, support tickets), and what is the aha moment?
2. **The users:** experience level, motivation (curious vs required by work), time available, what they used
   before.
3. **Success:** the minimum to learn, the key first action (first transaction, first note, first sync), and how
   you will know it worked (activation rate, time to first value).

Teach the 20% that delivers 80% of value. Save the rest for contextual discovery.

## Principles

- **Show, don't tell.** Real functionality with real or sample data, not slides describing it.
- **Optional when possible.** A visible "Skip" on anything that is not required; never block the product.
- **Time to value.** Front-load the action that produces the aha moment; defer account creation, profile
  details and preferences until they pay off.
- **Context over ceremony.** Teach a feature when the user reaches it. Empty states are onboarding.
- **Respect intelligence.** Users know standard Android patterns; do not explain Back, pull-to-refresh or a FAB.

## First run on Android

**Launch.** Use the SplashScreen API (`installSplashScreen()`) for the cold-start icon only; never a second,
branded splash Activity with a timer. The first real screen appears as soon as the app can draw it.

**Welcome.** One screen at most before value: the product's promise in one line, the primary action, and "Sign
in" for returning users. A three-page `HorizontalPager` of value propositions with dot indicators is the
default pattern and usually a tell ([tells.md](tells.md)); cut it, or keep a single page that leads into the
product.

**Account.** Let users try the core job before signing up when the product allows it. When sign-in is
required, use Credential Manager (passkeys, Sign in with Google, saved passwords) before a manual form; ask for
the minimum fields, explain any non-obvious one, and use smart defaults.

**Permissions.** Ask each at the moment its feature is used, after a one-line in-app rationale naming the
benefit. `POST_NOTIFICATIONS` (Android 13+) is asked after the user has seen something worth being notified
about, never on first launch. Design the denied state of every permission-dependent screen.

**Core concepts.** Introduce one to three, interactively, with progress shown ("Step 1 of 3", or a
`LinearProgressIndicator`) when there are steps. Each step is a real screen of the app, pre-filled where
possible. System Back steps backwards through setup; Back on step one leaves the flow, it never traps.

**First success.** Guide the user to a real outcome with templates or sample data, acknowledge it in proportion
(a snackbar or a short authored moment, see [delight.md](delight.md)), and show the next step.

## Empty states

Every list and dashboard `UiState` needs designed empty variants. Model them explicitly, e.g.
`sealed interface ProjectsUiState { data object FirstUse; data object NoResults; data class Error(...); ... }`,
so the screen cannot fall through to a blank `LazyColumn`.

Each empty state carries:

- **What will be here:** "Your projects will appear here."
- **Why it matters,** when it is not obvious, in one line.
- **How to start:** one primary `Button` ("Create project") and optionally a secondary ("Start from a
  template").
- **Visual interest** from the product's world (an illustration or icon in the theme's roles, not a stock
  mascot), sized so the action stays above the fold at 412×915dp and at font scale 2.0.

Kinds, each with its own copy and action:

- **First use:** emphasize value, offer a template or sample.
- **User cleared:** light touch, easy to recreate, no lecture.
- **No results:** echo the query, suggest a different one, offer "Clear filters".
- **No permission:** say what is missing and give a button to grant it or to app settings.
- **Error:** what failed and "Try again" (see [clarify.md](clarify.md)).

## Feature discovery

- **Contextual hints:** M3 `TooltipBox` with a `RichTooltip` (title, one sentence, an action) anchored to the
  real control, shown once at the moment the user first reaches it, with `rememberTooltipState(isPersistent =
  true)` so it waits for dismissal. Never several at once.
- **New feature markers:** a `Badge` on a nav item or `BadgedBox` on an icon, cleared once visited.
- **Announcements:** a dismissible card at the top of the relevant screen or a short bottom sheet that lets the
  user try the feature immediately; never a modal on launch.
- **Progressive complexity:** advanced options behind "More options", an expandable section or an overflow
  menu, not on the first screen.

Guided tours (dimmed screen, spotlight on a control) are rarely right on a phone. When a complex tool needs one:
three to five steps, each with the real control usable, "Skip tour" always visible, Back exits, replayable from
Help.

## State and storage

Track what has been seen in DataStore, read by the ViewModel and reflected in `UiState`, never in composable
`remember` state:

```kotlin
private val Context.onboarding by preferencesDataStore("onboarding")
private val SEEN_EXPORT_HINT = booleanPreferencesKey("seen_export_hint")

val seenExportHint: Flow<Boolean> = context.onboarding.data.map { it[SEEN_EXPORT_HINT] ?: false }
suspend fun markExportHintSeen() = context.onboarding.edit { it[SEEN_EXPORT_HINT] = true }
```

Show onboarding once and respect dismissals. Decide whether onboarding flags should restore with Auto Backup:
returning users on a new phone usually should not see the welcome flow again. Log completion and drop-off per
step.

**Avoid:**

- forcing long onboarding before any use;
- patronizing explanations of standard patterns;
- the same hint shown again after dismissal;
- blocking the whole UI during a tour;
- a separate tutorial mode disconnected from the real product;
- hiding "Skip", or making Back leave the app mid-setup without warning;
- asking for notifications, location or contacts on first launch;
- showing first-run flows to returning users.

## Verify

Run the flow on a device from a fresh install (`adb shell pm clear <package>`) and as a returning user, per
[verify.md](verify.md):

- time from launch to the aha moment, and the number of taps it takes;
- every step is skippable or justified, and Back behaves at each step;
- each permission is asked in context and its denied state is designed;
- every empty `UiState` variant renders with copy and an action, in light and dark, at font scale 2.0;
- hints appear once and stay dismissed after process death.

With real users, watch completion rate, skip rate, and time to first value; if completion is low, simplify.
When users reach the aha moment fast and do not drop off, hand off to `/android-design polish [target]`.
