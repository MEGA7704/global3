import { bindingStatus, getD1, getKV, json, logEvent, nowIso, readJsonBody, safeKey, sameOrigin, DATA_KEY_DEFAULT, saveLargeJsonToD1 } from '../_utils.js';

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
      message: 'Enregistrement en ligne impossible : un binding KV et un binding D1 sont obligatoires.'
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
  let kvVerified = false;
  let d1Chunks = null;
  const errors = [];
  const warnings = [];

  try {
    d1Chunks = await saveLargeJsonToD1(db, key, value, updatedAt, 'api-online-only-chunked');
    d1Saved = true;
  } catch (error) {
    errors.push('D1 principal chunké: ' + (error.message || String(error)));
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

  if (d1Saved) {
    try {
      const backupValue = JSON.stringify({
        __storage: 'kv-d1-confirmed',
        key,
        updatedAt,
        chunks: d1Chunks && d1Chunks.chunks,
        chars: d1Chunks && d1Chunks.chars,
        source: 'api-online-only-chunked'
      });
      await db.prepare('INSERT INTO global3_backups(key, value, updated_at, created_at, source) VALUES (?1, ?2, ?3, ?4, ?5)')
        .bind(key, backupValue, updatedAt, nowIso(), 'metadata-only')
        .run();
    } catch (error) {
      warnings.push('D1 backup metadata: ' + (error.message || String(error)));
    }
  }

  const saved = kvSaved && d1Saved;
  const diagnostic = saved
    ? `Sauvegarde KV + D1 confirmée (${d1Chunks ? d1Chunks.chunks : 0} morceau(x) D1)`
    : errors.join(' | ');
  await logEvent(db, saved ? 'save_online_confirmed_chunked' : 'save_online_failed', diagnostic);

  return json({
    success: saved,
    ok: saved,
    saved,
    cloud: saved,
    onlineOnly: true,
    storageMode: 'kv-full-plus-d1-chunks',
    kvSaved,
    kvVerified,
    d1Saved,
    d1Chunks,
    bindings: status,
    errors,
    warnings,
    message: saved
      ? 'Enregistrement en ligne confirmé dans KV + D1 chunké.'
      : 'Enregistrement en ligne non confirmé. Les données ne doivent pas être considérées comme enregistrées.'
  }, saved ? 200 : 503);
}
