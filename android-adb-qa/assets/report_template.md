# QA run <N> — <App> (<project code>), <date> <start>–<end>

Plan: `<test plan path>` (case IDs). Build: <package> <versionName>, <debuggable?>, `lastUpdateTime <…>` (<installed
by whom; reinstalled during the run? no>). Device: <model> `<serial>` (<Android/API>, <resolution>, <RAM>, <cores>,
heap <growth>/<large>). Evidence: `qa/shots/run<N>/` (<count> files). Ads/billing: <real / test / mock / none served>.

## Tools
- `ui.py`, `perf.py run <csv> 2` (sampled every ~2 s for the whole run, steps tagged), `perf.py threads`, `frames`,
  simulations: <dumpsys battery, svc wifi/data, appops, …>.

## Summary — <P> PASS / <F> FAIL / <NA> N/A / <NR> not run; crash = <n>, ANR = <n>

## Logic layer (unit tests)
Suite before → after: <89 → 101> pass / <0> fail (`tests.py run`). Added: <files> (local, uncommitted if the test
folder is gitignored). Red on purpose: <test → bug row, or none>. Cases checked only by unit tests: <IDs>.

## Bugs (most severe first)
| # | Severity | Bug | Repro / evidence | Where to look | Unit test |
|---|---|---|---|---|---|
| B1 | **High** | <one-line defect, user-visible effect> | <exact steps incl. adb commands; what was observed (focus window, dumpsys line, log line); screenshot names> | <file:line + the cause you verified; a fix direction if obvious; what is still unverified> | <`XViewModelTest.<name>` red = logic bug / passes = host/platform bug / none> |

Severity: **High** = crash/data loss/core action wrong or stuck, or a perf issue that will crash/kill/overheat;
Medium = main flow degraded, workaround exists; Low = cosmetic, copy, a11y, edge case; Note = observation/decision.

## Performance (<samples> samples, <start>–<end>)
Device limits (`perf.py limits`): Java <…> MB, PSS <…> MB, native <…> MB, graphics <…> MB, threads 400, fds 900,
CPU 150 % sustained.

| Metric | Peak | When | Avg | Over limit |
|---|---|---|---|---|

| Step | CPU avg / max | PSS max | Notes |
|---|---|---|---|

Crash risks (ranked): <what exceeded which limit, why that matters on smaller devices, the thread/decoder responsible>.
Not seen: <leaks (first→last fds/threads/PSS per pid), Java OOM, LMK kills>.

## Results by case
| ID | Result | Notes / evidence |
|---|---|---|
| H1 | PASS | `00-launch.png` |
| H3 | PASS (unit) | `PremiumGateTest.locked pack asks…`; device: reward dialog not run (no test ads) |

`PASS*` = passed with a caveat written in Notes. `PASS (unit)` = only the logic was checked (test name in Notes;
the device check still pending).

## Changed on the device (not restored)
- <wallpaper, permissions now granted, data created, settings>. Restored: <battery reset, network, font scale …>.
- <disruptive actions taken: reboot, adb server restart, pm clear>.

## Next run
<cases not run and what they need: real hardware action, ads enabled, pm clear, other API levels, other devices>.
