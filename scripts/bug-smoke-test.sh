#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

node --check app.js
node --check server.js

SDK_KEY_RATE_LIMIT_PER_MIN=20 node server.js >/tmp/p002_bug_smoke_server.log 2>&1 &
SERVER_PID=$!
cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
  wait "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT
sleep 1

unauth_code=$(curl -s -o /tmp/p002_unauth.json -w '%{http_code}' http://127.0.0.1:4173/api/sdk-keys)
auth_code=$(curl -s -o /tmp/p002_auth.json -w '%{http_code}' -H 'Authorization: Bearer loopic-ops-dev-token' http://127.0.0.1:4173/api/sdk-keys)
direct_code=$(curl -s -o /tmp/p002_direct.txt -w '%{http_code}' http://127.0.0.1:4173/sdk_keys.json)

[[ "$unauth_code" == "401" ]]
[[ "$auth_code" == "200" ]]
[[ "$direct_code" == "403" ]]

# backend analytics ingest + summary
analytics_code=$(curl -s -o /tmp/p002_ingest.json -w '%{http_code}' \
  -H 'Authorization: Bearer loopic-analytics-dev-token' \
  -H 'Content-Type: application/json' \
  -d '{"events":[{"id":"e-smoke-1","eventName":"purchase_started","payload":{},"at":"2026-02-07T00:00:00.000Z"},{"id":"e-smoke-2","eventName":"purchase_failed","payload":{},"at":"2026-02-07T00:01:00.000Z"}]}' \
  http://127.0.0.1:4173/api/analytics-events)
summary_code=$(curl -s -o /tmp/p002_summary.json -w '%{http_code}' -H 'Authorization: Bearer loopic-ops-dev-token' http://127.0.0.1:4173/api/analytics-summary)
[[ "$analytics_code" == "202" ]]
[[ "$summary_code" == "200" ]]

node - <<'NODE'
const fs = require('fs');
const crypto = require('crypto');
const envelope = JSON.parse(fs.readFileSync('sdk_keys.json', 'utf8'));
const key = crypto.createPublicKey({
  format: 'jwk',
  key: {
    kty: 'RSA',
    n: 'vpT4zNBwo8oJoG9ZOKOMNEf3KQ_-S4snOrLuqqRXzvxcwoKh_nWOPN_cHUsi2gJbrLiqY4u7D9r4oTjV6FbNbRUE01VE1q1pPjpn7-7H6Gl2SmnNlhoV4RbLGcbEsutgB59p_DIZgrBBFSLtz37aptSsp6x0rMwRKMvSlOY-O16aCvFH661tcf1-x51a3Ho_YdhxW4FydBnmO5Dt_ALlziNEsJIlCesokbwwWrd9mcL6xc-K6N90kLl8zWpa_l5v9LAbLtOCXhcP8emGdS4SjlmfnMuUtKT35dbCGG4cjeDSoL22wz66TNBb43XgtajihuSQme3YWhF0UqR3nbUP3w',
    e: 'AQAB',
  },
});
const verify = crypto.createVerify('RSA-SHA256');
verify.update(`${envelope.protected}.${envelope.payload}`);
verify.end();
if (!verify.verify(key, Buffer.from(envelope.signature, 'base64url'))) {
  throw new Error('JWS signature verification failed');
}

const summary = JSON.parse(fs.readFileSync('/tmp/p002_summary.json', 'utf8'));
if (!summary || !summary.failureRates) {
  throw new Error('analytics summary format invalid');
}
NODE

echo "bug smoke test passed"
