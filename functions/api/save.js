import { bindingStatus, ensureD1Schema, getD1, getKV, json, logEvent, nowIso, readJsonBody, safeKey, sameOrigin, DATA_KEY_DEFAULT } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ success: false, ok: false, message: 'Origine refusée.' }, 403);
  }

  const status = bindingStatus(env);
  const kv = getKV(env);
  const db = getD1(env);
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
  let d1MainSaved = false;
  let d1BackupSaved = false;
  let kvSaved = false;
  let kvVerified = false;
  const errors = [];
  const warnings = [];

  try {
    await ensureD1Schema(db);
    await db.prepare(`INSERT INTO global3_data(key, value, updated_at, source)
      VALUES (?1, ?2, ?3, 'api-online-only')
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, source = 'api-online-only'`)
      .bind(key, value, updatedAt)
      .run();
    const check = await db.prepare('SELECT updated_at FROM global3_data WHERE key = ?1').bind(key).first();
    d1MainSaved = !!check;
    d1Saved = d1MainSaved;
    if (!d1MainSaved) errors.push('D1: écriture principale non retrouvée après sauvegarde');
  } catch (error) {
    errors.push('D1 principal: ' + (error.message || String(error)));
  }

  if (d1MainSaved) {
    try {
      await db.prepare('INSERT INTO global3_backups(key, value, updated_at, created_at, source) VALUES (?1, ?2, ?3, ?4, ?5)')
        .bind(key, value, updatedAt, nowIso(), 'api-online-only')
        .run();
      d1BackupSaved = true;
    } catch (error) {
      // La sauvegarde historique est utile, mais elle ne doit pas refuser l'enregistrement principal
      // si KV et la table D1 principale ont bien confirmé l'écriture.
      warnings.push('D1 backup: ' + (error.message || String(error)));
    }
  }

  try {
    await kv.put(key, value, { metadata: { updatedAt, source: 'api-online-only' } });
    kvSaved = true;
    try {
      const verification = await kv.get(key);
      kvVerified = !!verification;
      if (!kvVerified) warnings.push('KV: écriture acceptée, lecture immédiate non disponible');
    } catch (verifyError) {
      warnings.push('KV vérification: ' + (verifyError.message || String(verifyError)));
    }
  } catch (error) {
    errors.push('KV: ' + (error.message || String(error)));
  }

  const saved = kvSaved && d1Saved;
  const diagnostic = saved
    ? 'Sauvegarde KV + D1 confirmée'
    : errors.join(' | ');
  await logEvent(db, saved ? 'save_online_confirmed' : 'save_online_failed', diagnostic);

  return json({
    success: saved,
    ok: saved,
    saved,
    cloud: saved,
    onlineOnly: true,
    kvSaved,
    kvVerified,
    d1Saved,
    d1MainSaved,
    d1BackupSaved,
    bindings: status,
    errors,
    warnings,
    message: saved
      ? 'Enregistrement en ligne confirmé dans KV + D1.'
      : 'Enregistrement en ligne non confirmé. Les données ne doivent pas être considérées comme enregistrées.'
  }, saved ? 200 : 503);
}
