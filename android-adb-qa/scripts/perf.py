#!/usr/bin/env python3
"""Background RAM/CPU sampler for the app under test.

  perf.py limits                      print the safe limits derived from this device
  perf.py run CSV [interval_s]        sample until killed (run it in the background for the whole QA run)
  perf.py tag LABEL                   label following samples with the current test step (e.g. A6-charging)
  perf.py summary CSV                 peaks, averages, threshold breaches, per-step table
  perf.py threads [sec]               per-thread CPU of the app right now (RenderThread, glide-*, main ...)
  perf.py frames                      dumpsys gfxinfo summary (janky %, p50/p90/p99) since last reset; resets it

Environment: ANDROID_SERIAL (auto when one device), QA_PKG (required).
Columns: time, activity|tag, pid, pss_mb, java_mb, native_mb, graphics_mb, code_mb, threads, fds, cpu_pct,
sys_avail_mb. cpu_pct is top's per-process value: 100 = one full core.
"""
import csv, os, re, subprocess, sys, time

PKG = os.environ.get("QA_PKG") or sys.exit("set QA_PKG=<package>")
TAG_FILE = os.path.join(os.environ.get("TMPDIR", "/tmp"), f"perftag-{PKG}")  # outside the skill dir (may be read-only)


def pick_serial():
    s = os.environ.get("ANDROID_SERIAL")
    if s:
        return s
    out = subprocess.run(["adb", "devices"], capture_output=True, text=True).stdout
    devs = [l.split()[0] for l in out.splitlines()[1:] if l.strip().endswith("device")]
    return devs[0] if len(devs) == 1 else sys.exit(f"set ANDROID_SERIAL (attached: {devs or 'none'})")


SERIAL = pick_serial()


def adb(*a):
    return subprocess.run(["adb", "-s", SERIAL, *a], capture_output=True, text=True, errors="replace", timeout=30).stdout


def mb(kb):
    return round(int(kb) / 1024, 1)


def prop_mb(name, default):
    v = adb("shell", "getprop", name).strip().lower()
    m = re.match(r"(\d+)([mk]?)", v)
    if not m:
        return default
    n = int(m.group(1))
    return n / 1024 if m.group(2) == "k" else n


def limits():
    """Thresholds scaled to the device, so the same script fits a 2 GB phone and a 12 GB one."""
    mem_total = mb(re.search(r"MemTotal:\s+(\d+)", adb("shell", "cat", "/proc/meminfo")).group(1))
    heap = prop_mb("dalvik.vm.heapsize", 512)  # largeHeap cap; heapgrowthlimit is the normal cap
    growth = prop_mb("dalvik.vm.heapgrowthlimit", 256)
    large = "LARGE_HEAP" in adb("shell", "dumpsys", "package", PKG)
    java_cap = heap if large else growth
    return {
        "java_mb": java_cap * 0.75,               # > 75 % of the Java cap: GC churn, OOM on the next big bitmap
        "pss_mb": min(mem_total * 0.16, 800),     # ~600 MB on 4 GB: LMK starts killing visible apps around here
        "native_mb": min(mem_total * 0.10, 500),  # decoders/ML/Lottie; native OOM aborts the process
        "graphics_mb": min(mem_total * 0.08, 400),
        "threads": 400,                           # thread leak -> "pthread_create failed"
        "fds": 900,                               # fd leak -> "Too many open files" long before the 32k ulimit
        "cpu_pct": 150,                           # sustained > 1.5 cores: heat, throttling, jank/ANR risk
        "_device": f"MemTotal {mem_total:.0f} MB, heap cap {java_cap:.0f} MB (largeHeap={large}), "
                   f"cores {adb('shell', 'nproc').strip()}",
    }


def sample():
    pid = (adb("shell", "pidof", PKG).strip().split() or [""])[0]
    row = {"time": time.strftime("%H:%M:%S"), "pid": pid}
    m = re.search(r"mResumedActivity: ActivityRecord\{\S+ \S+ (\S+)", adb("shell", "dumpsys", "activity", "activities"))
    act = m.group(1).split("/")[-1] if m else ""
    try:
        act += "|" + open(TAG_FILE).read().strip()
    except OSError:
        pass
    row["activity"] = act
    if pid:
        mi = adb("shell", "dumpsys", "meminfo", pid)
        for key, col in (("Java Heap:", "java_mb"), ("Native Heap:", "native_mb"), ("Graphics:", "graphics_mb"),
                         ("Code:", "code_mb"), ("TOTAL PSS:", "pss_mb")):
            m = re.search(re.escape(key) + r"\s+(\d+)", mi)
            row[col] = mb(m.group(1)) if m else ""
        m = re.search(r"Threads:\s+(\d+)", adb("shell", "cat", f"/proc/{pid}/status"))
        row["threads"] = m.group(1) if m else ""
        fd = adb("shell", "run-as", PKG, "ls", f"/proc/{pid}/fd")  # needs a debuggable build
        row["fds"] = len(fd.split()) if fd.strip() and "not debuggable" not in fd else ""
        t = adb("shell", "top", "-b", "-n", "1", "-d", "1", "-p", pid, "-o", "PID,%CPU")
        m = re.search(rf"^\s*{pid}\s+([\d.]+)", t, re.M)
        row["cpu_pct"] = m.group(1) if m else ""
    m = re.search(r"MemAvailable:\s+(\d+)", adb("shell", "cat", "/proc/meminfo"))
    row["sys_avail_mb"] = mb(m.group(1)) if m else ""
    return row


COLS = ["time", "activity", "pid", "pss_mb", "java_mb", "native_mb", "graphics_mb", "code_mb", "threads", "fds",
        "cpu_pct", "sys_avail_mb"]


def run(path, interval):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    new = not os.path.exists(path)
    with open(path, "a", newline="") as f:
        w = csv.DictWriter(f, COLS)
        if new:
            w.writeheader()
        while True:
            t0 = time.time()
            try:
                w.writerow({c: v for c, v in sample().items() if c in COLS})
                f.flush()
            except Exception as e:  # device rebooting/offline: keep going
                print("sample failed:", e, file=sys.stderr)
                time.sleep(3)
            time.sleep(max(0.0, interval - (time.time() - t0)))


def num(r, k):
    try:
        return float(r[k])
    except (KeyError, TypeError, ValueError):
        return None


def summary(path):
    rows = list(csv.DictReader(open(path)))
    if not rows:
        sys.exit("no samples")
    lim = limits()
    print(f"samples={len(rows)} {rows[0]['time']}–{rows[-1]['time']}   device: {lim['_device']}")
    pids = list(dict.fromkeys(r["pid"] for r in rows if r["pid"]))
    print(f"pids={pids}  (>1 = process died/restarted: check it was intended, e.g. reboot/force-stop)")
    print("\n| metric | peak | at | avg | limit | samples over |\n|---|---|---|---|---|---|")
    for k in ["pss_mb", "java_mb", "native_mb", "graphics_mb", "threads", "fds", "cpu_pct"]:
        vals = [(num(r, k), r) for r in rows if num(r, k) is not None]
        if not vals:
            continue
        peak, pr = max(vals, key=lambda x: x[0])
        avg = sum(v for v, _ in vals) / len(vals)
        over = sum(v > lim[k] for v, _ in vals)
        print(f"| {k} | {peak:.0f} | {pr['time']} {pr['activity']} | {avg:.0f} | {lim[k]:.0f} | {over} |")
    av = [num(r, "sys_avail_mb") for r in rows if num(r, "sys_avail_mb")]
    print(f"\nmin device MemAvailable = {min(av):.0f} MB" if av else "")
    by = {}
    for r in rows:
        tag = r["activity"].split("|", 1)[1] if "|" in r["activity"] else r["activity"]
        by.setdefault(tag, []).append(r)
    print("\n| step | n | cpu avg | cpu max | pss max | native max | threads max | fds max |\n|---|---|---|---|---|---|---|---|")
    def mx(rs, k):
        v = [num(r, k) for r in rs if num(r, k) is not None]
        return max(v) if v else 0
    for tag, rs in sorted(by.items(), key=lambda x: -mx(x[1], "cpu_pct")):
        cpu = [num(r, "cpu_pct") for r in rs if num(r, "cpu_pct") is not None]
        print(f"| {tag} | {len(rs)} | {sum(cpu) / len(cpu) if cpu else 0:.0f} | {mx(rs, 'cpu_pct'):.0f} | "
              f"{mx(rs, 'pss_mb'):.0f} | {mx(rs, 'native_mb'):.0f} | {mx(rs, 'threads'):.0f} | {mx(rs, 'fds'):.0f} |")
    print("\nleak check (first -> last per pid: fds threads pss):")
    for p in pids:
        rs = [r for r in rows if r["pid"] == p and r["fds"]]
        if rs:
            print(f"  {p}: {rs[0]['fds']} {rs[0]['threads']} {rs[0]['pss_mb']} -> {rs[-1]['fds']} {rs[-1]['threads']} "
                  f"{rs[-1]['pss_mb']} @{rs[-1]['time']}")


def threads(sec):
    pid = adb("shell", "pidof", PKG).strip().split()[0]
    out = adb("shell", "top", "-H", "-b", "-n", "1", "-d", str(sec), "-p", pid, "-o", "TID,%CPU")
    rows = [l.split() for l in out.splitlines() if re.match(r"\s*\d+\s+[\d.]+\s*$", l)]
    rows = sorted(rows, key=lambda x: -float(x[1]))[:12]
    for tid, cpu in rows:
        if float(cpu) == 0:
            break
        name = adb("shell", "cat", f"/proc/{pid}/task/{tid}/comm").strip()
        print(f"{cpu:>6}%  {tid:>6}  {name}")


def frames():
    out = adb("shell", "dumpsys", "gfxinfo", PKG)
    for l in out.splitlines():
        if re.search(r"Total frames|Janky frames:|50th|90th|99th", l):
            print(l.strip())
    adb("shell", "dumpsys", "gfxinfo", PKG, "reset")


if __name__ == "__main__":
    c = sys.argv[1] if len(sys.argv) > 1 else ""
    if c == "run":
        run(sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else 2)
    elif c == "tag":
        open(TAG_FILE, "w").write(sys.argv[2])
    elif c == "summary":
        summary(sys.argv[2])
    elif c == "limits":
        for k, v in limits().items():
            print(k, v if isinstance(v, str) else round(v))
    elif c == "threads":
        threads(sys.argv[2] if len(sys.argv) > 2 else "2")
    elif c == "frames":
        frames()
    else:
        print(__doc__)
