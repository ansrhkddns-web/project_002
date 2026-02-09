#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APK_PATH="${1:-$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk}"
PACKAGE="com.timeflow.app"
ACTIVITY=".MainActivity"
LOG_OUT="${ROOT_DIR}/android_device_qa_logcat.txt"
REPORT_OUT="${ROOT_DIR}/docs/android_device_qa_last_run.md"

STATUS="FAIL"
REASON="unknown"
STARTED_AT="$(date -Iseconds)"

write_report() {
  local finished_at
  finished_at="$(date -Iseconds)"
  cat > "$REPORT_OUT" <<RPT
# Android Device QA Last Run

- startedAt: $STARTED_AT
- finishedAt: $finished_at
- status: $STATUS
- reason: $REASON
- apkPath: $APK_PATH
- logPath: ${LOG_OUT}

## Next Action
- If status is FAIL due to environment/tooling (e.g. adb missing), run again on a machine with Android SDK Platform Tools + connected device.
RPT
}
trap write_report EXIT

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    REASON="missing_command:$1"
    echo "[android-qa] missing command: $1" >&2
    exit 1
  fi
}

require adb

if [[ ! -f "$APK_PATH" ]]; then
  REASON="apk_not_found"
  echo "[android-qa] APK not found: $APK_PATH" >&2
  echo "[android-qa] Build first: npm run android:debug" >&2
  exit 1
fi

if [[ "$(adb devices | awk 'NR>1 && $2=="device" {count++} END {print count+0}')" -lt 1 ]]; then
  REASON="no_connected_device"
  echo "[android-qa] no connected android device found" >&2
  exit 1
fi

echo "[android-qa] installing: $APK_PATH"
adb install -r "$APK_PATH" >/dev/null

echo "[android-qa] granting runtime permissions"
adb shell pm grant "$PACKAGE" android.permission.CAMERA >/dev/null 2>&1 || true
adb shell pm grant "$PACKAGE" android.permission.RECORD_AUDIO >/dev/null 2>&1 || true

echo "[android-qa] launching activity"
adb shell am start -n "$PACKAGE/$ACTIVITY" >/dev/null

echo "[android-qa] collecting logcat (15s) -> $LOG_OUT"
adb logcat -c >/dev/null || true
(timeout 15 adb logcat | tee "$LOG_OUT") >/dev/null 2>&1 || true

echo "[android-qa] scanning logcat for critical patterns"
if rg -n "FATAL EXCEPTION|CRASH|AndroidRuntime|Uncaught|TypeError|ReferenceError" "$LOG_OUT" >/tmp/android_qa_errors.txt; then
  REASON="critical_log_pattern_detected"
  echo "[android-qa] potential critical logs detected"
  cat /tmp/android_qa_errors.txt
  exit 2
fi

STATUS="PASS"
REASON="no_critical_log_pattern"
echo "[android-qa] basic device QA smoke passed (no critical log pattern found)"
