export const DATA_KEY_DEFAULT = 'global3:data';
export const SESSION_KEY_DEFAULT = 'global3:session';
export const MAX_JSON_BYTES = 8 * 1024 * 1024;

export function securityHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cache-Control': 'no-store'
  };
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: securityHeaders() });
}

export function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  try {
    return origin === new URL(request.url).origin;
  } catch (_error) {
    return false;
  }
}

export async function readJsonBody(request, maxBytes = MAX_JSON_BYTES) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length && length > maxBytes) {
    throw new Error('Payload trop volumineux. Réduisez la taille des données ou des images.');
  }
  const text = await request.text();
  if (text.length > maxBytes) {
    throw new Error('Payload trop volumineux. Réduisez la taille des données ou des images.');
  }
  if (!text.trim()) return {};
  return JSON.parse(text);
}

export function safeKey(key, fallback = DATA_KEY_DEFAULT) {
  const value = String(key || fallback).trim();
  if (!/^[a-zA-Z0-9:_./-]{3,120}$/.test(value)) return fallback;
  return value;
}

export function nowIso() {
  return new Date().toISOString();
}

export function parseJsonSafe(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch (_error) { return null; }
}

export function modifiedAt(data) {
  const value = data && (data.__lastModifiedAt || data.updatedAt || data.createdAt);
  const time = Date.parse(value || 0);
  return Number.isFinite(time) ? time : 0;
}

export function chooseNewest(a, b) {
  if (!a) return b || null;
  if (!b) return a || null;
  return modifiedAt(b) > modifiedAt(a) ? b : a;
}

export async function ensureD1Schema(db) {
  if (!db || !db.prepare) return false;
  await db.prepare(`CREATE TABLE IF NOT EXISTS global3_data (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    source TEXT DEFAULT 'api'
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS global3_backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    source TEXT DEFAULT 'api'
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_global3_backups_key_created ON global3_backups(key, created_at)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS global3_sessions (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS global3_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    message TEXT,
    created_at TEXT NOT NULL
  )`).run();
  return true;
}

export async function logEvent(db, type, message = '') {
  try {
    if (!db || !db.prepare) return;
    await ensureD1Schema(db);
    await db.prepare('INSERT INTO global3_events(type, message, created_at) VALUES (?1, ?2, ?3)')
      .bind(String(type || 'event'), String(message || '').slice(0, 500), nowIso())
      .run();
  } catch (_error) {}
}

export function bindingStatus(env) {
  return {
    kv: !!(env && env.GLOBAL3_KV),
    d1: !!(env && env.GLOBAL3_DB)
  };
}
