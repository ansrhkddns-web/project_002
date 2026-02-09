#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORT="${ROOT_DIR}/docs/play_upload_verification_last_run.md"

STATUS="${STATUS:-FAIL}"
REASON="${REASON:-unknown}"
TRACK="${PLAY_TRACK:-internal}"
PACKAGE_NAME="${PACKAGE_NAME:-com.timeflow.app}"
RUN_URL="${RUN_URL:-}"
RUN_ID="${RUN_ID:-}"

mkdir -p "${ROOT_DIR}/docs"
cat > "$REPORT" <<RPT
# Play Upload Verification Last Run

- startedAt: $(date -Iseconds)
- status: ${STATUS}
- reason: ${REASON}
- packageName: ${PACKAGE_NAME}
- track: ${TRACK}
- runId: ${RUN_ID}
- runUrl: ${RUN_URL}

## Interpretation
- PASS means upload workflow step completed with injected production secrets.
- FAIL means verification was not executed (usually missing secrets in CI environment).
RPT

echo "[play-verify] wrote ${REPORT}"
