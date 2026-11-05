# QA test plan — <App name> (<project code>), <scope, e.g. "from Home onward">

Manual tests driven over adb on a real device. Each case has a fixed ID so every run (`<report path>`) records
PASS / FAIL / N/A / NOT RUN plus evidence (`qa/shots/run<N>/`, kept out of git).

## 0. Scope and conditions
- Reference device: <model> `<serial>` (<Android version / API>, <resolution>, <dpi>, <RAM>).
  Add when available: <emulator API 34+ for new-API branches>, <device at minSdk>.
- Build: <the build installed on the device: versionName, debuggable?, mock billing?>. Do not reinstall over it during
  a run; record `lastUpdateTime` at the start of each run and re-check before each group.
- Out of scope: <screens before the entry point, analytics if not wired, ads not placed in these flows>.
- Known not implemented (mark N/A, never FAIL): <placeholders, `else -> Unit` branches, TODOs from the inventory>.

### Tools
- `ui.py` (tree / tap / wait / wait-any / shot / montage / top / logs), `perf.py` (run / tag / summary / threads /
  frames), `devstate.sh` (save / restore). Device-specific tips: <e.g. bottom-bar labels have empty bounds → tap by
  coordinates: Tab1 x,y · Tab2 x,y …>.
- Simulation commands used by this plan: <battery / network / appops / ...> (see the skill's adb cookbook).

### Conventions
- Priority: **P0** release blocker (crash, data loss, core action does the wrong thing), **P1** main flow or visibly
  wrong result, **P2** detail / edge case.
- End of every group: `ui.py logs check` → crash=0 anr=0 (case CRASH).
- Give the device back as received: `devstate.sh restore`; list anything that can't be restored (wallpaper, app data).

## 1. <Entry screen / tab host>
| ID | Pri | Layer | Steps | Expected (U: test class) |
|---|---|---|---|---|
| H1 | P0 | D | Open the app (past first run) | <entry screen with sections X, Y, Z> |
| H2 | P1 | D | <each tab / banner / "More"> | <correct destination; Back returns to …> |
| H3 | P0 | U+D | Tap a premium/locked item as a free user | <gate dialog with options …> |
| H4 | P1 | D | Offline cold start with cache | <cached content / clear error + Retry> |
| H5 | P2 | D | Rotate / background and return | <keeps tab and scroll; no crash> |

## 2..N. One section per feature flow
Cover, for each flow: list → filter → detail → customize/edit → preview → apply/save → result; each permission prompt
(deny, allow, revoke later); download/progress/failure/retry; locked content (reward ad, purchase); Back at every
step; what is persisted (files, prefs, DB rows — verify with run-as).

| ID | Pri | Layer | Steps | Expected (U: test class) |
|---|---|---|---|---|
| X1 | P1 | D | | |

## <Background / system behavior>
Foreground services, receivers, notifications, alarms/jobs, boot, process death (swipe from Recents, force-stop),
permission revoked while running, lock screen.

## <Purchases / paywall>
Plans, close-button delay, restore, terms/privacy links, premium state hides locks/ads.

## Cross-cutting
| ID | Pri | Expected |
|---|---|---|
| INS | P1 | No title/button under the status bar or navigation bar on any screen captured |
| BACK | P1 | System Back follows the documented chain in every flow |
| FONT | P2 | font_scale 1.3: no important text cut |
| A11Y | P2 | Tappable elements have real bounds and meaningful content-desc |
| PERF | P1 | No step over the perf limits (perf.py summary); long-running screens measured ≥ 30 s |
| CRASH | P0 | crash=0 anr=0 at the end of every group |
