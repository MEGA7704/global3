import { bindingStatus, ensureD1Schema, json, logEvent, nowIso, readJsonBody, safeKey, sameOrigin, DATA_KEY_DEFAULT } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ success: false, ok: false, message: 'Origine refusée.' }, 403);
  }

  const status = bindingStatus(env);
  if (!status.kv || !status.d1) {
    return json({
      success: false,
      ok: false,
      saved: false,
      cloud: false,
      kvSaved: false,
      d1Saved: false,
      bindings: status,
      message: 'Enregistrement en ligne impossible : les bindings GLOBAL3_KV et GLOBAL3_DB sont obligatoires.'
    }, 503);
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    return json({ success: false, ok: false, saved: false, message: error.message || 'JSON invalide.' }, 400);
  }

  const key = safeKey(body.key, DATA_KEY_DEFAULT);
  const data = body.data && typeof body.data === 'object' ? body.data : body;
  const updatedAt = String(body.updatedAt || data.__lastModifiedAt || nowIso());
  const value = JSON.stringify(Object.assign({}, data, { __lastModifiedAt: updatedAt }));
  let d1Saved = false;
  let kvSaved = false;
  const errors = [];

  try {
    await ensureD1Schema(env.GLOBAL3_DB);
    await env.GLOBAL3_DB.prepare(`INSERT INTO global3_data(key, value, updated_at, source)
      VALUES (?1, ?2, ?3, 'api-online-only')
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, source = 'api-online-only'`)
      .bind(key, value, updatedAt)
      .run();
    await env.GLOBAL3_DB.prepare('INSERT INTO global3_backups(key, value, updated_at, created_at, source) VALUES (?1, ?2, ?3, ?4, ?5)')
      .bind(key, value, updatedAt, nowIso(), 'api-online-only')
      .run();
    d1Saved = true;
  } catch (error) {
    errors.push('D1: ' + (error.message || String(error)));
  }

  try {
    await env.GLOBAL3_KV.put(key, value, { metadata: { updatedAt, source: 'api-online-only' } });
    const verification = await env.GLOBAL3_KV.get(key);
    kvSaved = !!verification;
    if (!kvSaved) errors.push('KV: lecture de vérification impossible');
  } catch (error) {
    errors.push('KV: ' + (error.message || String(error)));
  }

  const saved = kvSaved && d1Saved;
  await logEvent(env.GLOBAL3_DB, saved ? 'save_online_confirmed' : 'save_online_failed', saved ? 'Sauvegarde KV + D1 confirmée' : errors.join(' | '));

  return json({
    success: saved,
    ok: saved,
    saved,
    cloud: saved,
    onlineOnly: true,
    kvSaved,
    d1Saved,
    bindings: status,
    errors,
    message: saved ? 'Enregistrement en ligne confirmé dans KV + D1.' : 'Enregistrement en ligne non confirmé. Les données ne doivent pas être considérées comme enregistrées.'
  }, saved ? 200 : 503);
}
