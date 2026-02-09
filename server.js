const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4173);
const BUNDLE_FILE = path.join(ROOT, 'sdk_keys.json');
const DEFAULT_TOKEN = 'loopic-ops-dev-token';
const TOKEN_SET = new Set((process.env.SDK_KEY_BEARER_TOKENS || DEFAULT_TOKEN).split(',').map((v) => v.trim()).filter(Boolean));
const ALLOWED_ORIGINS = new Set((process.env.SDK_KEY_ALLOWED_ORIGINS || '').split(',').map((v) => v.trim()).filter(Boolean));
const RATE_LIMIT_PER_MIN = Number(process.env.SDK_KEY_RATE_LIMIT_PER_MIN || 60);
const ANALYTICS_INGEST_TOKEN = process.env.ANALYTICS_INGEST_TOKEN || 'loopic-analytics-dev-token';
const ALERT_WEBHOOK_URL = (process.env.ALERT_WEBHOOK_URL || '').trim();

const ipHits = new Map();
const analyticsStore = {
  events: [],
  ids: new Set(),
  lastAlertAt: 0,
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(body);
}

function json(res, status, payload, headers = {}) {
  return send(res, status, JSON.stringify(payload), {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
}

function limited(ip) {
  const now = Date.now();
  const windowStart = now - (60 * 1000);
  const entries = (ipHits.get(ip) || []).filter((at) => at >= windowStart);
  entries.push(now);
  ipHits.set(ip, entries);
  return entries.length > RATE_LIMIT_PER_MIN;
}

function hasOriginAccess(req) {
  if (ALLOWED_ORIGINS.size === 0) return true;
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const source = origin || referer;
  if (!source) return false;
  try {
    const parsed = new URL(source);
    return ALLOWED_ORIGINS.has(parsed.origin);
  } catch {
    return false;
  }
}

function bearerToken(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.slice('Bearer '.length).trim();
}

function hasSdkToken(req) {
  return TOKEN_SET.has(bearerToken(req));
}

function hasAnalyticsToken(req) {
  const token = bearerToken(req);
  return token === ANALYTICS_INGEST_TOKEN || TOKEN_SET.has(token);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 512 * 1024) {
        reject(new Error('payload_too_large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function cleanupAnalyticsStore() {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000);
  analyticsStore.events = analyticsStore.events.filter((e) => new Date(e.at || 0).getTime() >= cutoff);
  if (analyticsStore.events.length > 5000) {
    analyticsStore.events = analyticsStore.events.slice(-5000);
  }
}

function summarizeAnalytics() {
  cleanupAnalyticsStore();
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  const recent = analyticsStore.events.filter((e) => new Date(e.at || 0).getTime() >= oneHourAgo);

  const byName = {};
  for (const e of recent) {
    byName[e.eventName] = (byName[e.eventName] || 0) + 1;
  }

  const total = recent.length;
  const purchaseStarted = byName.purchase_started || 0;
  const purchaseFailed = byName.purchase_failed || 0;
  const adStarted = byName.ad_started || 0;
  const adFailed = byName.ad_failed || 0;
  const sdkBundleLoaded = byName.sdk_key_bundle_loaded || 0;
  const sdkBundleLoadFailed = byName.sdk_key_bundle_load_failed || 0;

  const pct = (a, b) => (b ? (a / b) * 100 : 0);

  return {
    window: '1h',
    total,
    byName,
    failureRates: {
      purchaseFailedPct: Number(pct(purchaseFailed, purchaseStarted).toFixed(2)),
      adFailedPct: Number(pct(adFailed, adStarted).toFixed(2)),
      sdkBundleLoadFailedPct: Number(pct(sdkBundleLoadFailed, sdkBundleLoaded + sdkBundleLoadFailed).toFixed(2)),
    },
  };
}

async function sendAlertIfNeeded(summary) {
  if (!ALERT_WEBHOOK_URL) return;

  const severe = summary.failureRates.purchaseFailedPct >= 20
    || summary.failureRates.adFailedPct >= 20
    || summary.failureRates.sdkBundleLoadFailedPct >= 20;
  if (!severe) return;

  if (Date.now() - analyticsStore.lastAlertAt < 5 * 60 * 1000) return;
  analyticsStore.lastAlertAt = Date.now();

  try {
    await fetch(ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'timeflow-server',
        type: 'analytics_failure_rate_alert',
        summary,
      }),
    });
  } catch {
    // alerting failure should not break ingestion
  }
}

function serveStatic(req, res, pathname) {
  const safePath = path.normalize(pathname).replace(/^([.][.][/\\])+/, '');
  const filePath = path.join(ROOT, safePath === '/' ? 'index.html' : safePath);
  if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden');

  if (path.basename(filePath) === 'sdk_keys.json') {
    return send(res, 403, 'sdk_keys.json direct access is disabled');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    const ext = path.extname(filePath);
    send(res, 200, data, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  });
}

function serveSignedBundle(req, res) {
  const ip = req.socket.remoteAddress || 'unknown';
  if (limited(ip)) return json(res, 429, { error: 'rate_limited' });
  if (!hasOriginAccess(req)) return json(res, 403, { error: 'origin_forbidden' });
  if (!hasSdkToken(req)) return json(res, 401, { error: 'unauthorized' }, { 'WWW-Authenticate': 'Bearer realm="sdk-keys"' });

  fs.readFile(BUNDLE_FILE, (err, data) => {
    if (err) return json(res, 500, { error: 'bundle_unavailable' });
    send(res, 200, data, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    });
  });
}

async function ingestAnalytics(req, res) {
  if (!hasAnalyticsToken(req)) return json(res, 401, { error: 'unauthorized' });

  let payload;
  try {
    const raw = await readBody(req);
    payload = raw ? JSON.parse(raw) : {};
  } catch (error) {
    const code = error?.message === 'payload_too_large' ? 413 : 400;
    return json(res, code, { error: 'invalid_payload' });
  }

  const events = Array.isArray(payload?.events) ? payload.events : [];
  let accepted = 0;
  for (const e of events.slice(-300)) {
    const id = typeof e?.id === 'string' ? e.id : '';
    const eventName = typeof e?.eventName === 'string' ? e.eventName : '';
    if (!id || !eventName || analyticsStore.ids.has(id)) continue;
    analyticsStore.ids.add(id);
    analyticsStore.events.push({
      id,
      eventName,
      payload: e.payload && typeof e.payload === 'object' ? e.payload : {},
      at: e.at || new Date().toISOString(),
    });
    accepted += 1;
  }

  if (analyticsStore.ids.size > 20000) {
    analyticsStore.ids = new Set(analyticsStore.events.map((e) => e.id));
  }

  const summary = summarizeAnalytics();
  sendAlertIfNeeded(summary).catch(() => {});
  return json(res, 202, { ok: true, accepted, summary });
}

function analyticsSummary(req, res) {
  if (!hasSdkToken(req)) return json(res, 401, { error: 'unauthorized' });
  return json(res, 200, summarizeAnalytics());
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/api/sdk-keys') {
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    return serveSignedBundle(req, res);
  }

  if (url.pathname === '/api/analytics-events') {
    if (req.method !== 'POST') return send(res, 405, 'Method not allowed');
    return ingestAnalytics(req, res);
  }

  if (url.pathname === '/api/analytics-summary') {
    if (req.method !== 'GET') return send(res, 405, 'Method not allowed');
    return analyticsSummary(req, res);
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method not allowed');
  }

  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] http://localhost:${PORT}`);
  console.log('[server] Use Authorization: Bearer <token> for /api/sdk-keys');
  console.log('[server] Use Authorization: Bearer <token> for /api/analytics-events and /api/analytics-summary');
});
