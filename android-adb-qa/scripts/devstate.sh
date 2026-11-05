#!/usr/bin/env bash
# Snapshot / restore the device settings a QA run tends to change, so the phone goes back as it was received.
#   devstate.sh save  <file>     record settings + app permission state (QA_PKG) to <file>
#   devstate.sh restore <file>   restore settings, battery, network; prints what it cannot restore (wallpaper, data)
#   devstate.sh show             print the current values
# Env: ANDROID_SERIAL (required when several devices), QA_PKG (optional, for appops).
set -euo pipefail
A=(adb ${ANDROID_SERIAL:+-s "$ANDROID_SERIAL"})
KEYS=(
  "system font_scale" "global animator_duration_scale" "global transition_animation_scale"
  "global window_animation_scale" "global stay_on_while_plugged_in" "system screen_off_timeout"
  "global wifi_on" "global mobile_data" "global airplane_mode_on" "global auto_time_zone" "system screen_brightness"
)

show() {
  for k in "${KEYS[@]}"; do echo "$k=$("${A[@]}" shell settings get $k | tr -d '\r')"; done
  echo "timezone=$("${A[@]}" shell getprop persist.sys.timezone | tr -d '\r')"
  echo "wm_size=$("${A[@]}" shell wm size | tail -1 | awk '{print $NF}')"
  echo "wm_density=$("${A[@]}" shell wm density | tail -1 | awk '{print $NF}')"
  if [ -n "${QA_PKG:-}" ]; then
    for op in SYSTEM_ALERT_WINDOW; do
      v=$("${A[@]}" shell appops get "$QA_PKG" $op | head -1 | tr -d '\r')
      case "$v" in "No operations"*|"") v=default ;; *) v=$(echo "$v" | awk '{print $2}' | tr -d ';') ;; esac
      echo "appop_$op=$v"
    done
    echo "granted_install_and_runtime=$("${A[@]}" shell dumpsys package "$QA_PKG" | grep -E 'permission\.[A-Z_]+: granted=true' | grep -v 'install' | sed 's/:.*//;s/^ *//' | sort -u | tr '\n' ' ')"
  fi
  echo "wallpaper=$("${A[@]}" shell dumpsys wallpaper | grep -m1 mWallpaperComponent | sed 's/.*=//')"
}

case "${1:-show}" in
  show) show ;;
  save) show > "$2"; echo "saved to $2"; cat "$2" ;;
  restore)
    "${A[@]}" shell dumpsys battery reset
    while IFS='=' read -r k v; do
      case "$k" in
        # </dev/null: adb shell would otherwise eat the rest of the file the loop is reading
        system\ *|global\ *) [ "$v" != "null" ] && "${A[@]}" shell settings put $k "$v" </dev/null ;;
        wm_size) "${A[@]}" shell wm size reset </dev/null ;;
        wm_density) "${A[@]}" shell wm density reset </dev/null ;;
        appop_*) [ -n "${QA_PKG:-}" ] && "${A[@]}" shell appops set "$QA_PKG" "${k#appop_}" "$v" </dev/null ;;
      esac
    done < "$2"
    grep -q 'global wifi_on=1' "$2" && "${A[@]}" shell svc wifi enable || true
    grep -q 'global mobile_data=1' "$2" && "${A[@]}" shell svc data enable || true
    echo "restored settings/battery/network/appops from $2"
    echo "NOT restorable here: wallpaper image (was: $(grep wallpaper= "$2" | cut -d= -f2-)), app data, runtime permissions (re-grant by hand: $(grep granted_install_and_runtime= "$2" | cut -d= -f2-))"
    ;;
  *) sed -n '2,6p' "$0" ;;
esac
