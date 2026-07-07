import { chooseNewest, bindingStatus, ensureD1Schema, json, parseJsonSafe, safeKey, DATA_KEY_DEFAULT } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = safeKey(url.searchParams.get('key'), DATA_KEY_DEFAULT);
  const status = bindingStatus(env);

  if (!status.kv || !status.d1) {
    return json({
      success: false,
      ok: false,
      key,
      data: null,
      found: false,
      bindings: status,
      message: 'Chargement en ligne impossible : GLOBAL3_KV et GLOBAL3_DB sont obligatoires.'
    }, 503);
  }

  await ensureD1Schema(env.GLOBAL3_DB);

  const rawKv = await env.GLOBAL3_KV.get(key);
  const kvData = parseJsonSafe(rawKv);
  const row = await env.GLOBAL3_DB.prepare('SELECT value FROM global3_data WHERE key = ?1').bind(key).first();
  const d1Data = parseJsonSafe(row && row.value);
  const data = chooseNewest(kvData, d1Data);
  const sources = [];
  if (kvData) sources.push('KV');
  if (d1Data) sources.push('D1');

  // Réparation automatique si une source est vide mais l'autre possède les données.
  if (data && !kvData) {
    await env.GLOBAL3_KV.put(key, JSON.stringify(data), { metadata: { repairedAt: new Date().toISOString(), source: 'repair-from-d1' } });
  }
  if (data && !d1Data) {
    const updatedAt = String(data.__lastModifiedAt || new Date().toISOString());
    await env.GLOBAL3_DB.prepare(`INSERT INTO global3_data(key, value, updated_at, source)
      VALUES (?1, ?2, ?3, 'repair-from-kv')
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, source = 'repair-from-kv'`)
      .bind(key, JSON.stringify(data), updatedAt)
      .run();
  }

  return json({
    success: true,
    ok: true,
    key,
    data,
    found: !!data,
    source: sources.join('+') || 'none',
    bindings: status,
    onlineOnly: true,
    message: data ? 'Données en ligne chargées depuis KV/D1.' : 'KV + D1 prêts. Aucune donnée existante.'
  });
}
