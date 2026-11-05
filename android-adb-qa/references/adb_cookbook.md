# adb cookbook for manual QA

Every command assumes `ANDROID_SERIAL` is exported. When more than one device/emulator is attached, a bare `adb` fails
with "more than one device/emulator" and the step silently does nothing — a common source of false PASS/FAIL.

## Contents
1. Build / device facts
2. Navigation and UI inspection
3. Battery and charging simulation
4. Network
5. Permissions and app ops
6. App state, storage, prefs, DB
7. Services, notifications, jobs, boot
8. Wallpaper, window, insets, keyguard
9. Performance
10. Crash / ANR evidence
11. Gotchas seen in real runs

## 1. Build / device facts
```bash
adb shell dumpsys package $QA_PKG | grep -E "versionName|versionCode|lastUpdateTime|flags="   # record at the top of each run
adb shell getprop ro.product.model; adb shell getprop ro.build.version.release; adb shell getprop ro.build.version.sdk
adb shell wm size; adb shell wm density; adb shell cat /proc/meminfo | head -3; adb shell nproc
adb shell getprop dalvik.vm.heapgrowthlimit; adb shell getprop dalvik.vm.heapsize
```
Re-check `lastUpdateTime` before each test group when the developer is working in parallel — if it changed, a new build
was installed mid-run and earlier results belong to the old build.

## 2. Navigation and UI inspection
```bash
adb shell monkey -p $QA_PKG -c android.intent.category.LAUNCHER 1   # like tapping the launcher icon (resumes the task)
adb shell am start -n $QA_PKG/.SomeActivity                           # explicit start: may stack a 2nd instance
adb shell input keyevent BACK|HOME|APP_SWITCH|26                      # 26 = power
adb shell cmd statusbar expand-notifications                          # open the shade, then tap a notification by text
adb shell settings put system font_scale 1.3                          # text truncation check; restore 1.0
adb shell wm size 720x1280; adb shell wm density 320                  # small-screen check; restore with `reset`
```
- Compose: text nodes often merge into the clickable parent; a label can report `[0,0][0,0]` bounds. Find the target in
  a screenshot and tap `xy=`. Record empty bounds as an accessibility finding (TalkBack and UI tests can't reach it).
- Read a screenshot before tapping anything you haven't seen: dialogs, ad validators, system popups (MTP "Allow access",
  permission sheets) swallow taps.
- To compare states, `ui.py montage out.png a.png b.png c.png` and read one image instead of three.

## 3. Battery and charging simulation
```bash
adb shell dumpsys battery set level 37
adb shell dumpsys battery set temp 455          # tenths of °C → 45.5 °C
adb shell dumpsys battery set ac 1; adb shell dumpsys battery set status 2      # plugged + CHARGING
adb shell dumpsys battery set status 3; adb shell dumpsys battery unplug        # NOT charging, then unplug
adb shell dumpsys battery reset                 # always at the end (real USB state comes back)
```
- Each `set` sends its own `ACTION_BATTERY_CHANGED`; real hardware changes plug + status together. Test **both orders**
  (unplug-then-status and status-then-unplug): a bug that appears only in one order is still real on devices whose
  status lags, but say so in the report.
- While the cable is the adb link, "real unplug" can't be tested over USB; note it, or use `adb tcpip 5555` + wireless.
- With the real cable in, status is often 5 (FULL) which many apps count as charging: during non-charging UI tests set
  `status 3` + `unplug` so a charging overlay doesn't pop up mid-test.

## 4. Network
```bash
adb shell svc wifi disable; adb shell svc data disable
adb shell dumpsys connectivity | grep -m1 "Active default network"   # "none" = really offline
adb shell svc wifi enable; adb shell svc data enable
```
Wait for "Active default network" to be non-none before pressing Retry, or Retry fails for the wrong reason.

## 5. Permissions and app ops
```bash
adb shell appops get $QA_PKG SYSTEM_ALERT_WINDOW        # default | allow | ignore
adb shell appops set $QA_PKG SYSTEM_ALERT_WINDOW allow|ignore|default
adb shell pm grant|revoke $QA_PKG android.permission.POST_NOTIFICATIONS   # API 33+
adb shell dumpsys package $QA_PKG | grep -A60 "runtime permissions"
```
Prefer driving the real system screen once (what the user sees: e.g. Android 11+ opens the overlay *list*, not the
app page), then use appops for repeats.

## 6. App state, storage, prefs, DB (debuggable builds)
```bash
adb shell run-as $QA_PKG ls -R files | head -50
adb shell run-as $QA_PKG ls shared_prefs; adb shell run-as $QA_PKG cat shared_prefs/<name>.xml
adb shell run-as $QA_PKG ls databases
adb exec-out run-as $QA_PKG cat databases/<db> > /tmp/x.db   # WAL may hold recent rows: copy -wal too, or checkpoint
adb shell am force-stop $QA_PKG      # cold start; also kills foreground services and disables boot receivers until next launch
adb shell pm clear $QA_PKG           # first-run test: wipes data — ask first on someone else's device
```

## 7. Services, notifications, jobs, boot
```bash
adb shell dumpsys activity services $QA_PKG | grep -E "ServiceRecord|isForeground"
adb shell dumpsys notification --noredact | grep -A3 "pkg=$QA_PKG" | grep -E "title=|text="
adb shell dumpsys jobscheduler | grep -A5 $QA_PKG
adb shell cmd jobscheduler run -f $QA_PKG <jobId>
adb shell dumpsys activity broadcasts history | grep -B2 -A3 "Permission Denial.*$QA_PKG"
adb reboot; adb wait-for-device; until [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = 1 ]; do sleep 3; done
```
After a reboot a Samsung phone may not reappear in `adb devices` until it is unlocked or the MTP popup is answered.
Wait, ask the user to unlock; avoid `adb kill-server` because it also drops Android Studio's connection (if you had to,
say so in the report).

## 8. Wallpaper, window, insets, keyguard
```bash
adb shell dumpsys wallpaper | grep -E "mWallpaperComponent|mWhich"      # which service is the live wallpaper
adb shell dumpsys window | grep -E "mCurrentFocus|isKeyguardShowing"
adb shell dumpsys window | grep -E "InsetsSource type=ITYPE_(STATUS|NAVIGATION)_BAR" | head -4   # visible=true/false
adb shell dumpsys activity activities | grep -E "Hist #"                 # duplicate activities in the task
adb shell cmd uimode night yes|no                                         # dark mode check
```
`isKeyguardShowing=false` right after screen-off is normal (lock delay); press power twice to get a real keyguard.

## 9. Performance
```bash
perf.py run qa/shots/runN/perf.csv 2   # background, whole run
perf.py tag W6-apply                   # before each test step
perf.py threads 3                      # who burns CPU: RenderThread / main / glide-* / ExoPlayer / mediapipe
perf.py frames                         # janky %, p50/p90/p99 since last reset
adb shell dumpsys meminfo $QA_PKG      # one-off detail (Java/Native/Graphics/Code/TOTAL PSS)
adb shell top -b -n 3 -d 3 -p $(adb shell pidof $QA_PKG) -o PID,%CPU,RES
```
Measure long-running screens (lock screen overlays, live wallpapers, players) for ≥ 30 s in steady state, not only at
open. Separate the app's own UI from services in the same process (wallpaper services, foreground services) by
measuring with the screen shown and hidden.

## 10. Crash / ANR evidence
```bash
adb logcat -b crash -d
adb logcat -d | grep -E "FATAL EXCEPTION|ANR in $QA_PKG|OutOfMemory|lowmemorykiller|am_kill"
adb shell dumpsys dropbox | grep -E "data_app_(crash|anr|native_crash)"
```

## 11. Gotchas seen in real runs
- A shell loop that polls the UI can exceed the 2-minute tool timeout; use `ui.py wait-any REGEX 90` or run it in the
  background.
- `pkill -f "<pattern>"` can kill the very shell running it when the pattern appears in its own command line;
  escape a character so the regex no longer matches its own text: `pkill -f "perf\.py run"`.
- An image that is still loading has no content-desc yet; "0 items" in a dump right after navigation is usually timing.
- Splash/onboarding/consent SDKs can block the app offline; record it, it changes every offline test.
- Tapping a notification created a new task after the old one was swiped away — check `Hist #` when Back behaves oddly.
