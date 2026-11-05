#!/usr/bin/env python3
"""Small adb UI driver for manual QA runs (uiautomator dump + input events).

Environment (all optional):
  ANDROID_SERIAL  device serial; auto-picked when exactly one device is attached
  QA_PKG          app package (needed for `logs check` filtering and `pid`)
  QA_SHOTS        screenshot directory (default ./qa/shots/run1)

Commands:
  tree [filter]                 nodes with text/desc/id/clickable + bounds ('*' = clickable, [on] = checked/selected)
  tap SEL [idx]                 tap the idx-th match (default 0); refuses nodes with empty [0,0][0,0] bounds
  has SEL                       exit 0 if present
  wait SEL [sec]                wait until present (default 15 s)
  wait-gone SEL [sec]           wait until absent
  wait-any REGEX [sec]          poll visible texts until one matches REGEX; prints each change (good for
                                "Downloading 40%" -> "Apply" progress); exit 0 on match
  type TEXT                     input text (spaces handled)
  key NAME                      keyevent (BACK, HOME, APP_SWITCH, 26 ...)
  swipe x1 y1 x2 y2 [ms]
  shot NAME                     save PNG to $QA_SHOTS/NAME.png and print the path
  montage OUT IMG... [--w 240]  side-by-side strip of screenshots (needs Pillow); read one image instead of many
  top                           resumed activity + focused window
  pid                           pid of $QA_PKG
  logs mark | check             clear logcat (incl. crash buffer) / count FATAL + ANR for $QA_PKG since mark

SEL: text=Exact | textc=contains | desc=Exact | descc=contains | id=suffix | xy=x,y
"""
import os, re, subprocess, sys, time, xml.etree.ElementTree as ET


def pick_serial():
    s = os.environ.get("ANDROID_SERIAL")
    if s:
        return s
    out = subprocess.run(["adb", "devices"], capture_output=True, text=True).stdout
    devs = [l.split()[0] for l in out.splitlines()[1:] if l.strip().endswith("device")]
    if len(devs) == 1:
        return devs[0]
    sys.exit(f"set ANDROID_SERIAL (attached: {devs or 'none'})")


SERIAL = pick_serial() if not (len(sys.argv) > 1 and sys.argv[1] == 'montage') else ''  # montage needs no device
PKG = os.environ.get("QA_PKG", "")
SHOTS = os.environ.get("QA_SHOTS", os.path.join(os.getcwd(), "qa", "shots", "run1"))


def adb(*args, check=True):
    r = subprocess.run(["adb", "-s", SERIAL, *args], capture_output=True, text=True, errors="replace")  # logcat has binary junk
    if check and r.returncode != 0:
        sys.exit(f"adb {' '.join(args)} failed: {r.stderr.strip()}")
    return r.stdout


def dump():
    for _ in range(4):
        out = adb("exec-out", "uiautomator", "dump", "/dev/tty", check=False)
        i, j = out.find("<?xml"), out.rfind("</hierarchy>")
        if i >= 0 and j > 0:
            return ET.fromstring(out[i:j + len("</hierarchy>")])
        time.sleep(0.7)  # "could not get idle state" while animations run
    sys.exit("uiautomator dump failed (screen animating? try again)")


def bounds(n):
    return tuple(map(int, re.findall(r"\d+", n.get("bounds"))))


def match(n, sel):
    k, v = sel.split("=", 1)
    t, d = (n.get("text") or "").strip(), (n.get("content-desc") or "").strip()
    return {
        "text": t == v, "textc": v.lower() in t.lower(),
        "desc": d == v, "descc": v.lower() in d.lower(),
        "id": (n.get("resource-id") or "").endswith(v),
    }.get(k, False)


def find(sel, root=None):
    root = root if root is not None else dump()
    return [n for n in root.iter("node") if match(n, sel)]


def texts(root):
    return [(n.get("text") or n.get("content-desc") or "").strip() for n in root.iter("node")]


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd == "tree":
        flt = args[0].lower() if args else None
        for n in dump().iter("node"):
            t = (n.get("text") or "").replace("\n", " ")
            d = (n.get("content-desc") or "").replace("\n", " ")
            rid = (n.get("resource-id") or "").split("/")[-1]
            cl = n.get("clickable") == "true"
            if not (t or d or cl or rid):
                continue
            line = f"{'*' if cl else ' '} {n.get('bounds'):<26} t={t!r} d={d!r} id={rid} {n.get('class', '').split('.')[-1]}"
            if n.get("checked") == "true" or n.get("selected") == "true":
                line += " [on]"
            if not flt or flt in line.lower():
                print(line)
    elif cmd in ("tap", "has"):
        sel = args[0]
        if sel.startswith("xy="):
            x, y = sel[3:].split(",")
            adb("shell", "input", "tap", x, y)
            print(f"tap {x},{y}")
            return
        found = find(sel)
        if cmd == "has":
            print("yes" if found else "no")
            sys.exit(0 if found else 1)
        idx = int(args[1]) if len(args) > 1 else 0
        if len(found) <= idx:
            print(f"NOT found {sel} (matches: {len(found)})")
            sys.exit(1)
        a, b, c, d = bounds(found[idx])
        if c - a <= 0 or d - b <= 0:
            # Compose sometimes reports [0,0][0,0] for visible labels; tapping 0,0 silently does nothing.
            print(f"{sel} has empty bounds {found[idx].get('bounds')} -> tap by xy= from a screenshot instead")
            sys.exit(2)
        x, y = (a + c) // 2, (b + d) // 2
        adb("shell", "input", "tap", str(x), str(y))
        print(f"tap {sel} @ {x},{y} ({len(found)} match)")
    elif cmd in ("wait", "wait-gone"):
        sel, limit = args[0], float(args[1]) if len(args) > 1 else 15
        t0 = time.time()
        while time.time() - t0 < limit:
            if bool(find(sel)) == (cmd == "wait"):
                print(f"{cmd} {sel} ok after {time.time() - t0:.1f}s")
                return
            time.sleep(1)
        print(f"{cmd} {sel} TIMEOUT {limit}s")
        sys.exit(1)
    elif cmd == "wait-any":
        rx, limit = re.compile(args[0]), float(args[1]) if len(args) > 1 else 60
        t0, last = time.time(), None
        while time.time() - t0 < limit:
            visible = [t for t in texts(dump()) if t]
            hits = [t for t in visible if rx.search(t)]
            cur = hits[0] if hits else None
            state = " | ".join(t for t in visible if re.search(r"\d+%|…|\.\.\.", t))[:120]
            if state != last:
                print(f"{time.time() - t0:5.1f}s {state}")
                last = state
            if cur:
                print(f"{time.time() - t0:5.1f}s matched {cur!r}")
                return
            time.sleep(1)
        print("TIMEOUT")
        sys.exit(1)
    elif cmd == "type":
        adb("shell", "input", "text", " ".join(args).replace(" ", "%s"))
    elif cmd == "key":
        adb("shell", "input", "keyevent", args[0])
    elif cmd == "swipe":
        adb("shell", "input", "swipe", *args[:4], args[4] if len(args) > 4 else "300")
    elif cmd == "shot":
        os.makedirs(SHOTS, exist_ok=True)
        path = os.path.join(SHOTS, args[0] + ".png")
        png = subprocess.run(["adb", "-s", SERIAL, "exec-out", "screencap", "-p"], capture_output=True).stdout
        with open(path, "wb") as f:
            f.write(png)
        print(path)
    elif cmd == "montage":
        from PIL import Image
        w = 240
        if "--w" in args:
            i = args.index("--w"); w = int(args[i + 1]); args = args[:i] + args[i + 2:]
        out, files = args[0], args[1:]
        ims = [Image.open(f).convert("RGB") for f in files]
        ims = [im.resize((w, int(im.height * w / im.width))) for im in ims]
        h = max(im.height for im in ims)
        strip = Image.new("RGB", (w * len(ims), h), "white")
        for i, im in enumerate(ims):
            strip.paste(im, (i * w, 0))
        strip.save(out)
        print(out)
    elif cmd == "top":
        out = adb("shell", "dumpsys", "activity", "activities")
        for l in out.splitlines():
            if "mResumedActivity" in l or "topResumedActivity" in l:
                print(l.strip()); break
        win = adb("shell", "dumpsys", "window")
        m = re.search(r"mCurrentFocus=.*", win)
        print(m.group(0) if m else "")
    elif cmd == "pid":
        print(adb("shell", "pidof", PKG, check=False).strip())
    elif cmd == "logs":
        if args[0] == "mark":
            adb("logcat", "-c", check=False)
            adb("logcat", "-b", "crash", "-c", check=False)
            print("logcat cleared")
        else:
            crash = adb("logcat", "-b", "crash", "-d", check=False).splitlines()
            main_log = adb("logcat", "-d", check=False).splitlines()
            fatal = [l for l in crash if "FATAL" in l or (PKG and PKG in l)]
            anr = [l for l in main_log if PKG and ("ANR in " + PKG) in l]
            oom = [l for l in main_log if PKG and PKG in l and re.search(r"OutOfMemory|lowmemorykiller|am_kill", l)]
            print(f"crash={sum('FATAL' in l for l in fatal)} anr={len(anr)} oom/kill={len(oom)}")
            for l in (fatal + anr + oom)[:40]:
                print(l)
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
