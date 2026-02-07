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
const ipHits = new Map();

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

function hasTokenAccess(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice('Bearer '.length).trim();
  return TOKEN_SET.has(token);
}

function serveStatic(req, res, pathname) {
  const safePath = path.normalize(pathname).replace(/^([.][.][/\\])+/, '');
  const filePath = path.join(ROOT, safePath === '/' ? 'index.html' : safePath);
  if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden');

  if (path.basename(filePath) === 'sdk_keys.json') {
    return send(res, 403, 'sdk_keys.json direct access is disabled');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return send(res, 404, 'Not found');
    }
    const ext = path.extname(filePath);
    send(res, 200, data, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  });
}

function serveSignedBundle(req, res) {
  const ip = req.socket.remoteAddress || 'unknown';
  if (limited(ip)) return send(res, 429, JSON.stringify({ error: 'rate_limited' }), { 'Content-Type': 'application/json; charset=utf-8' });
  if (!hasOriginAccess(req)) return send(res, 403, JSON.stringify({ error: 'origin_forbidden' }), { 'Content-Type': 'application/json; charset=utf-8' });
  if (!hasTokenAccess(req)) return send(res, 401, JSON.stringify({ error: 'unauthorized' }), { 'Content-Type': 'application/json; charset=utf-8', 'WWW-Authenticate': 'Bearer realm="sdk-keys"' });

  fs.readFile(BUNDLE_FILE, (err, data) => {
    if (err) return send(res, 500, JSON.stringify({ error: 'bundle_unavailable' }), { 'Content-Type': 'application/json; charset=utf-8' });
    send(res, 200, data, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method not allowed');
  }

  if (url.pathname === '/api/sdk-keys') {
    return serveSignedBundle(req, res);
  }
  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] http://localhost:${PORT}`);
  console.log('[server] Use Authorization: Bearer <token> for /api/sdk-keys');
});
