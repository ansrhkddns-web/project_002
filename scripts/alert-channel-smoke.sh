#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

SERVER_PID=""
cleanup() {
  if [[ -n "$SERVER_PID" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# Trigger severe metrics to exercise alert routing path.
# NOTE: This script does not validate third-party delivery result; it validates local dispatch path execution.
node server.js >/tmp/p002_alert_smoke_server.log 2>&1 &
SERVER_PID=$!
sleep 1

curl -s -o /tmp/p002_alert_ingest.json -w '%{http_code}' \
  -H 'Authorization: Bearer loopic-analytics-dev-token' \
  -H 'Content-Type: application/json' \
  -d '{"events":[{"id":"a1","eventName":"purchase_started","payload":{},"at":"2026-02-07T00:00:00.000Z"},{"id":"a2","eventName":"purchase_failed","payload":{},"at":"2026-02-07T00:00:01.000Z"}]}' \
  http://127.0.0.1:4173/api/analytics-events >/tmp/p002_alert_ingest_code.txt

CODE="$(cat /tmp/p002_alert_ingest_code.txt)"
if [[ "$CODE" != "202" ]]; then
  echo "[alert-smoke] ingest failed: HTTP $CODE" >&2
  exit 1
fi

echo "[alert-smoke] local dispatch path executed (check env-configured channels separately)"
