import { bindingStatus, ensureD1Schema, getD1, getKV, json, nowIso, parseJsonSafe, readJsonBody, safeKey, sameOrigin, SESSION_KEY_DEFAULT } from '../_utils.js';

function requireBindings(env) {
  const status = bindingStatus(env);
  return { status, ok: !!(status.kv && status.d1) };
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = safeKey(url.searchParams.get('key'), SESSION_KEY_DEFAULT);
  const { status, ok } = requireBindings(env);
  const kv = getKV(env);
  const db = getD1(env);
  if (!ok) return json({ success: false, ok: false, session: null, source: 'none', bindings: status, message: 'Session en ligne indisponible : binding KV et binding D1 obligatoires.' }, 503);

  let session = parseJsonSafe(await kv.get(key));
  let source = session ? 'KV' : 'none';
  if (!session) {
    await ensureD1Schema(db);
    const row = await db.prepare('SELECT value FROM global3_sessions WHERE key = ?1').bind(key).first();
    session = parseJsonSafe(row && row.value);
    if (session) source = 'D1';
  }

  return json({ success: true, ok: true, session, source, bindings: status });
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ success: false, ok: false, message: 'Origine refusée.' }, 403);
  const { status, ok } = requireBindings(env);
  const kv = getKV(env);
  const db = getD1(env);
  if (!ok) return json({ success: false, ok: false, saved: false, bindings: status, message: 'Session en ligne non enregistrée : binding KV et binding D1 obligatoires.' }, 503);

  const body = await readJsonBody(request);
  const key = safeKey(body.key, SESSION_KEY_DEFAULT);
  const session = body.session || null;
  const value = JSON.stringify(session);

  await kv.put(key, value, { expirationTtl: 60 * 60 * 24 * 7 });
  await ensureD1Schema(db);
  await db.prepare(`INSERT INTO global3_sessions(key, value, updated_at)
    VALUES (?1, ?2, ?3)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`)
    .bind(key, value, nowIso())
    .run();

  return json({ success: true, ok: true, saved: true, kvSaved: true, d1Saved: true, bindings: status });
}

export async function onRequestDelete({ request, env }) {
  if (!sameOrigin(request)) return json({ success: false, ok: false, message: 'Origine refusée.' }, 403);
  const url = new URL(request.url);
  const key = safeKey(url.searchParams.get('key'), SESSION_KEY_DEFAULT);
  const { status, ok } = requireBindings(env);
  const kv = getKV(env);
  const db = getD1(env);
  if (!ok) return json({ success: false, ok: false, deleted: false, bindings: status, message: 'Session en ligne indisponible : binding KV et binding D1 obligatoires.' }, 503);

  await kv.delete(key);
  await ensureD1Schema(db);
  await db.prepare('DELETE FROM global3_sessions WHERE key = ?1').bind(key).run();

  return json({ success: true, ok: true, deleted: true, bindings: status });
}
