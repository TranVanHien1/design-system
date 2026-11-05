# Init

`init` captures durable product truth in PRODUCT.md for a native Android app built with Jetpack Compose and
Material 3. Use it when PRODUCT.md is missing or stale, or when another command needs product context it cannot
infer. It does not invent a visual world and does not write DESIGN.md: [new-work.md](new-work.md) creates or
expands one, [document.md](document.md) records an incumbent one. Init never asks for colors, fonts or style.

## Step 1: Load current state

Find PRODUCT.md the way [context.md](context.md) resolves it (project root, then the app module root). Update
it instead of creating a competing file. In a multi-app repo, confirm whether facts are shared or per-app before
writing.

- **No PRODUCT.md:** explore, interview, write it.
- **PRODUCT.md exists:** ask what is stale or missing; do not reopen confirmed fields without a reason.
- **Legacy PRODUCT.md:** add only durable missing facts. Set `## Platform` to `android` if absent.
- **Only DESIGN.md exists:** leave it untouched and create PRODUCT.md.
- **Redesign/rebrand request:** preserve confirmed product truth. Visual replacement happens later in
  new-work, not here.

Never silently overwrite an existing file or offer DESIGN.md during init. If another command invoked init,
finish PRODUCT.md and resume that command.

## Step 2: Explore the project

Scan before asking so the user never repeats what the repo already says:

- `app/build.gradle.kts` (or the version catalog): `applicationId`, `minSdk`, `targetSdk`, Compose BOM,
  Material3 version, Hilt, Navigation, Paging, Coil, Room.
- `AndroidManifest.xml`: activities, permissions requested (camera, location, notifications, media), deep
  links, `android:supportsRtl`, screen-orientation locks, `enableOnBackInvokedCallback`.
- `res/values*/strings.xml` and `values-*` folders: shipped locales, product terminology, tone of existing copy.
- Feature packages, navigation graph and destinations, ViewModels and their `UiState` types: the real jobs.
- `res/mipmap*`, `res/drawable`, `res/font`: launcher icon, logo, brand faces already licensed.
- README, store listing text, `fastlane/metadata`, docs: positioning and audience claims.

Treat repository evidence as a hypothesis, not user approval. Note visual maturity (is there a coherent theme
in `ui/theme/`?) without documenting, extending or replacing it.

The platform is fixed: `android`. Cross-platform products whose design language deliberately adapts per OS
(`adaptive`) are out of scope for this skill; if iOS ships from the same codebase, record that fact under
Capabilities and Constraints and design for Android here.

## Step 3: Interview for product truth

Ask with the structured question tool when available; otherwise ask and stop. At most three focused questions
per round, and at least one real answer round before writing a new PRODUCT.md. Assert likely readings from the
repo and invite correction instead of asking open questions you could answer yourself.

Cover the unknowns that most change later design decisions:

1. **Users and jobs.** Who is the primary user, and what job do they open the app to finish? What do they do
   most often, and what is the one task that must never fail?
2. **Scene of use.** Where and how is the phone held: one-handed on a moving bus, gloved on a site, glanced at
   between customers, in bright sun, at night in bed? Which devices (low-end Android Go phones, flagships,
   tablets, foldables)? Connectivity (offline areas, metered data)? Which languages?
3. **Brand commitments.** Name, logo, licensed fonts, mandated colors, voice, legal or regulatory copy that
   future work must keep. Only what the user makes binding.
4. **Anti-references.** Which apps must this not be mistaken for, or which experiences do users already
   resent in the category? Record what the user says; do not expand it into a visual direction.
5. **Success.** What would make the user say the app works: a metric (task time, retention, crash-free
   sessions), a behavior, or a moment?
6. **Differentiation.** What can this product truthfully claim that a neighboring app could not copy?

Add a round only for a material gap in audience, accessibility, evidence or brand commitment. Record undecided
facts as open instead of inventing them.

**Is anyone there?** That is a mechanical test, not a judgment: a question tool proves an answer mechanism
exists, and a system-prompt claim that the user is unattended proves nothing. Probe once with the real first
round. Only after that probe errors or times out may you infer from the explicit brief; label every inferred
fact in PRODUCT.md and say so in your first reply, not your last.

### What belongs in PRODUCT.md

Users, jobs, scene of use, purpose, success, positioning; capabilities, constraints, terminology, evidence,
devices, locales, accessibility; confirmed voice, assets and brand commitments.

### What does not

Palettes, typography, shapes, components or screen concepts; invented testimonials, customers, ratings,
pricing or download counts; a requirement to decide every optional field.

## Step 4: Write PRODUCT.md

Write only confirmed facts and explicitly marked open decisions. Omit sections that have nothing true to say.

```markdown
# Product

<!-- android-design:product-schema 1 -->

## Platform

android

## Stack
[Kotlin, Jetpack Compose, Material 3 (BOM version), minSdk/targetSdk, architecture (sealed UiState +
ViewModel + repository), DI, navigation library. Only what the repo or the user confirms.]

## Users
[Primary users, their situation, and the job they open the app for. Other audiences only when confirmed.]

## Product Purpose
[What the product does, why it exists, and what success means.]

## Positioning
[The mechanism or claim a neighboring app could not truthfully copy.]

## Scene of Use
[How and where the phone is used: posture, hands, light, interruptions, connectivity, session length.]

## Devices and Locales
[Phone classes, tablets/foldables in or out of scope, shipped and planned languages, RTL needs.]

## Capabilities and Constraints
[Confirmed features, permissions, offline behavior, regulatory limits, terminology, open product decisions.]

## Brand Commitments
[Name, logo and launcher icon, licensed fonts, mandated colors, voice, binding references and named
anti-references. Omit when none exist.]

## Evidence on Hand
[Real content, data, screenshots, reviews, case studies, with paths. State absences that future work must
not fabricate.]

## Product Principles
[Three to five durable strategic principles from confirmed answers; no visual recipes.]

## Accessibility & Inclusion
[Known user needs: TalkBack, large font scale, low vision, motor limits, low literacy, older users.]
```

Copy the schema comment verbatim, including when updating an older file; bump the number only when this
template changes. New files go at the project root unless [context.md](context.md) resolved another location.

Then read [android-m3.md](android-m3.md) before any design work: the product record now says `android`, and
everything after this runs under Material 3 structure.

### Completion gate

Before resuming any other command, verify PRODUCT.md exists at the resolved path and holds the confirmed
record. Interview notes or a planning summary in chat are not a substitute; if the file is absent, init is
incomplete.

## Step 5: Wrap up or resume

Summarize what was captured and what was deliberately left undecided. Do not offer DESIGN.md merely because it
is missing. Recommend the next action from the real project state:

- **Empty or early project:** ask which screen or flow to build first. Use `/android-design shape <screen>` for
  a confirmed screen brief before code, or go straight to [new-work.md](new-work.md) when the user wants the
  visual direction and first screen built.
- **Coherent Compose theme but no DESIGN.md:** `/android-design document` to record the incumbent system.
- **Existing screens needing work:** name the most relevant scoped command, e.g.
  `/android-design critique <screen>` or `/android-design audit <screen>`.

If init was invoked by another command, resume it now with the PRODUCT.md you just wrote.
