---
name: android-adb-qa
description: Plan and run a systematic manual QA pass of an Android app on a real device or emulator over adb, with a background RAM/CPU sampler, then write a run report (bugs with repro + file:line, perf peaks vs. safe limits, per-case PASS/FAIL table). Use this whenever the user wants an Android app tested on a connected phone/emulator — "test the app on my device", "QA all features", "build a test plan and run it with adb", "kiểm thử app trên adb", "lập kế hoạch test", "đo hiệu năng RAM/CPU", "check for crashes / memory / jank", or hands over a sample QA report/script to follow — even if they don't say "QA" or "skill". Also use it to resume or extend a previous QA run (docs/qa/report.md, qa/shots/runN). Runs a unit-test layer alongside the device run (via android-unit-test): preflights the JVM suite, covers logic of cases the device can't run, and turns device bugs into regression tests. For writing tests without a device run, use android-unit-test directly.
---

# Android adb QA

Turns "test everything on my phone" into: a feature inventory read from the code → a test plan with stable IDs →
an adb-driven run with evidence and live RAM/CPU sampling → a report a developer can act on. The bundled scripts
make the device work deterministic so the effort goes into finding real bugs.

Bundled files (paths relative to this skill's directory):
- `scripts/ui.py` — uiautomator dump/tap/wait/shot/montage/logs driver. `scripts/perf.py` — sampler + summary +
  per-thread CPU + frame stats. `scripts/devstate.sh` — save/restore device settings.
- `references/adb_cookbook.md` — simulation and inspection commands (battery, network, appops, services, jobs, boot,
  wallpaper, insets, perf, crash evidence) and pitfalls. Read it before the run, and when a step needs a simulation.
- `assets/test_plan_template.md`, `assets/report_template.md` — structure of the two deliverables.
- Unit-test layer: `~/.claude/skills/android-unit-test` (`scripts/tests.py run|map|summary`, templates, patterns).
  **Read its `references/qa_layer.md`** — how U / D / U+D cases, preflight and bug→regression-test work.

Write the plan and report in the user's language (match how they write to you); keep IDs, commands and code
identifiers as-is.

## 0. Ground rules (why they matter)

The device usually holds a build the developer considers stable, and they keep coding while you test. So:
- **Test what is installed.** Don't build or `adb install` unless asked — it would change the thing under test and
  the developer's device. Record `lastUpdateTime` at the start and re-check before each group; if it changes, note
  that later results belong to a new build.
- **Always pin the device**: `export ANDROID_SERIAL=<serial>` in every shell. The scripts auto-pick a single device, but
  the moment an emulator appears, bare `adb` calls fail ("more than one device") and steps silently don't happen.
- **Snapshot first, restore last**: `devstate.sh save qa/shots/runN/devstate.before`. At the end `restore` it and
  list what can't be restored (wallpaper images, app data, permissions you granted).
- **Disruptive actions** — `pm clear` (wipes user data), `adb reboot`, uninstall, changing the lock screen, `adb
  kill-server` (drops Android Studio's connection) — ask first unless the user already said the device is yours to
  use for this; then do them late in the run and report them.
- Don't tap ads, don't make real purchases. Debug/mock billing flows may be exercised; say which.
- Unit tests you add are QA evidence, not product changes: put them in the project's test folders, never edit
  production code for them, and never commit them (some projects keep `app/src/test/` gitignored on purpose).

## 1. Inventory the features (from code, not guesses)

Read the project's own docs first (CLAUDE.md, README, docs/, any analysis of a reference app). Then map every flow
reachable from the entry point. For a sizeable app delegate this to a read-only exploration agent so the file dumps
stay out of your context; ask it for:
1. Entry points (tabs, banners, "more" links, menus) and where each navigates.
2. Per flow: state machine / screens, every user action, side effects (permissions, pickers, downloads, services,
   WallpaperManager/notifications/jobs, ML, storage), error/offline/retry states, what gets persisted (DB, prefs,
   files with paths).
3. Background/system behavior: services, receivers, boot, notifications, permission revocation handling.
4. Ads/billing/analytics placements touching these flows.
5. The user-visible strings for key buttons/titles (so you can find them in a UI dump).
6. Anything stubbed (`TODO()`, `else -> Unit`, "Coming soon") → becomes N/A, not FAIL.
Ask for `file:line` references and a word cap. Treat its report as a map; verify on the device.

## 1b. Logic layer preflight (unit tests)

From the project root: `python3 ~/.claude/skills/android-unit-test/scripts/tests.py run` (whole JVM suite, seconds)
and `tests.py map` (which ViewModels / reducers / UiStates / repositories have tests). Record the totals for the
report. A red or non-compiling suite is the first finding of the run — note the failing areas as suspects and keep
going. If the installed APK is older than the working tree (`lastUpdateTime` vs. recent edits), say which one each
verdict belongs to.

## 2. Write the plan

Copy the structure of `assets/test_plan_template.md` into the project (default `docs/qa/test_plan.md`; follow the
project's conventions if it has a QA folder). Rules of thumb:
- One table per area; IDs short and stable (H1, W6, A10 …) because every future run report refers to them.
- Expected results must be observable over adb: a screen text, a `dumpsys` line, a file in `run-as … ls`, a pref
  value, a wallpaper component. Vague expectations ("works") produce vague verdicts.
- For each flow cover happy path, permission deny/allow/revoke, offline/failure + retry, locked/premium gate, Back
  at every step, persistence after process death, and the system side (service survives Recents swipe, reboot).
- Add cross-cutting rows: insets, Back chain, font scale 1.3, accessibility bounds, PERF, CRASH.
- Put device-specific tool notes in the plan (e.g. coordinates for tabs whose labels have empty bounds).
- Give each case a **Layer**: `U` (logic, a JVM test proves it), `D` (device only: rendering, platform, timing),
  `U+D`. For U / U+D name the test class. Cases the device can't run here (personal device, real wallpaper change,
  real purchase, personal media) should get a U test for their logic.

Then write the missing U tests the plan names (android-unit-test templates; pure helpers first, then ViewModel
steps) and run them. Logic that is `private` or inside a composable: don't refactor; note "not unit-testable,
suggest extracting <fun>" for the report.

Tell the user the plan is ready (path + case count) and start running without waiting, unless they asked to review.

## 3. Run it

Setup:
```bash
export ANDROID_SERIAL=<serial> QA_PKG=<package> QA_SHOTS=<project>/qa/shots/run<N>
S=<this skill>/scripts
echo "qa/shots/" >> <project>/.git/info/exclude      # evidence stays local, doesn't pollute git status
$S/devstate.sh save $QA_SHOTS/devstate.before
$S/perf.py limits                                     # thresholds for this device
$S/ui.py logs mark
```
Start the sampler as a **background** command for the whole run: `$S/perf.py run $QA_SHOTS/perf.csv 2`. Before
each case/group: `$S/perf.py tag <ID>` so the summary can attribute peaks to steps.

Driving the UI:
- `ui.py tree [filter]` to see what's on screen; `tap text=…|desc=…|textc=…|xy=x,y`; `wait`, `wait-any REGEX 90` for
  progress ("Downloading 40%" → "Apply") instead of hand-written sleep loops (those hit the tool timeout).
- Look at a screenshot whenever the dump is ambiguous or before declaring visual PASS — dumps miss overlays, images,
  clipping, wrong colors. Combine several states with `ui.py montage out.png a.png b.png …` and read one image.
- Compose labels with `[0,0][0,0]` bounds: `ui.py tap` refuses them; tap by coordinates from the screenshot and log
  the a11y finding.
- After each group: `ui.py logs check` (crash / ANR / OOM-kill count).
- Give a one-line progress note to the user between groups (what passed, what just broke) — runs take a long time.

When something fails:
1. Reproduce it a second time, minimal steps.
2. Separate simulation artifacts from real bugs (e.g. `dumpsys battery` sends one broadcast per `set`; try both
   orders). If it only happens under simulation, still report it, labelled, with what a real-device check needs.
3. Find the cause in the code and cite `file:line`; suggest a fix direction only when you've read the code. Don't edit
   the code — the developer is working on the branch; the report is the hand-off (unless they ask you to fix).
4. **Triage with a unit test** when the path goes through a ViewModel/reducer/helper: replay the same steps in a
   JVM test. It fails → logic bug; keep it as the (red) regression test and cite it in the bug row. It passes → the
   logic is right and the bug is in the host composable, platform glue, SDK or data — say so in the bug row.
5. Keep going; one failure rarely blocks the rest of the plan.

Performance while running:
- Long-lived screens (lock-screen overlays, live wallpapers, players, editors with animated media) need a ≥ 30 s
  steady-state sample: tag it, wait, then `perf.py threads 3` (which thread burns CPU) and `perf.py frames`.
- Heavy one-shot operations (ML segmentation, image export, big downloads/decodes) are where PSS/native peaks
  happen — tag them precisely.

## 4. Analyze perf

Stop the sampler, run `perf.py summary $QA_SHOTS/perf.csv`. It prints peaks vs. device-scaled limits, a per-step
table and a leak check. Interpret, don't just paste:
- What can crash or get the app killed: native/PSS peaks near the limits (native OOM aborts; LMK kills on 2–3 GB
  devices), Java heap > 75 % of the cap, threads/fds climbing without returning (leak).
- What degrades: sustained CPU > 150 % (heat, throttling, battery drain, ANR risk if the main thread is in the top
  threads), janky frames.
- What is fine: metrics that return to baseline after each flow — say so explicitly ("no leak seen").
- Several pids = the process restarted; check whether you caused it (reboot, force-stop) or it crashed.

## 5. Report

Write `docs/qa/report.md` (or the project's equivalent) with the structure of `assets/report_template.md`; if the user
supplied a sample report, mirror its layout and tone instead. Essentials:
- Header: build identity + `lastUpdateTime`, device facts, evidence folder, ads/billing mode.
- Bugs table first, most severe first, each with exact repro (adb commands included), observed evidence (dump line,
  log line, screenshot name), and `file:line` cause. This is what the developer acts on.
- Perf section: limits, peak table, per-step table, ranked crash risks, and what was *not* seen.
- Per-case results table using the plan's IDs (`PASS*` for pass-with-caveat; N/A for unimplemented; NOT RUN with the
  reason and what it needs; `PASS (unit)` + test name when only the logic could be checked — keep the pending
  device check in the notes).
- Logic layer block: suite totals before → after, tests added (files; local/uncommitted if the folder is ignored),
  regression tests that are red on purpose (each with its bug row).
- What you changed on the device and didn't restore; disruptive actions taken.
- Next run: what's missing and what it requires.
If you append to an existing report, add a new `# QA run <N>` section on top of the old ones rather than rewriting.

## 6. Hand back

`devstate.sh restore $QA_SHOTS/devstate.before`, `dumpsys battery reset`, network on, stop the sampler. Then reply
briefly: counts, the 3–6 bugs that matter most (one line each with the file), the perf points that exceed limits,
what changed on the device, unit tests added / red on purpose, and the paths of plan/report/perf.csv. The detail
lives in the report.
