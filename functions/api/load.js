import { chooseNewest, bindingStatus, getD1, getKV, json, parseJsonSafe, safeKey, DATA_KEY_DEFAULT, readLargeJsonFromD1, saveLargeJsonToD1, nowIso } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = safeKey(url.searchParams.get('key'), DATA_KEY_DEFAULT);
  const status = bindingStatus(env);
  const kv = getKV(env);
  const db = getD1(env);

  if (!status.kv || !status.d1) {
    return json({
      success: false,
      ok: false,
      key,
      data: null,
      found: false,
      bindings: status,
      message: 'Chargement en ligne impossible : un binding KV et un binding D1 sont obligatoires.'
    }, 503);
  }

  const errors = [];
  let kvData = null;
  let d1Data = null;

  try {
    const rawKv = await kv.get(key);
    kvData = parseJsonSafe(rawKv);
  } catch (error) {
    errors.push('KV lecture: ' + (error.message || String(error)));
  }

  try {
    d1Data = await readLargeJsonFromD1(db, key);
  } catch (error) {
    errors.push('D1 lecture chunkée: ' + (error.message || String(error)));
  }

  const data = chooseNewest(kvData, d1Data);
  const sources = [];
  if (kvData) sources.push('KV');
  if (d1Data) sources.push('D1');

  // Réparation automatique si une source est vide mais l'autre possède les données.
  if (data && !kvData) {
    await kv.put(key, JSON.stringify(data), { metadata: { repairedAt: nowIso(), source: 'repair-from-d1' } });
    sources.push('KV-réparé');
  }
  if (data && !d1Data) {
    const updatedAt = String(data.__lastModifiedAt || nowIso());
    await saveLargeJsonToD1(db, key, JSON.stringify(data), updatedAt, 'repair-from-kv-chunked');
    sources.push('D1-réparé');
  }

  return json({
    success: true,
    ok: true,
    key,
    data,
    found: !!data,
    source: sources.join('+') || 'none',
    storageMode: 'kv-full-plus-d1-chunks',
    bindings: status,
    onlineOnly: true,
    errors,
    message: data ? 'Données en ligne chargées depuis KV/D1.' : 'KV + D1 prêts. Aucune donnée existante.'
  });
}
