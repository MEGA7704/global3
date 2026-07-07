import { bindingStatus, ensureD1Schema, getD1, getKV, json, logEvent, nowIso } from '../_utils.js';

export async function onRequestGet({ env }) {
  const status = bindingStatus(env);
  const kv = getKV(env);
  const db = getD1(env);
  const result = {
    success: false,
    ok: false,
    app: 'GLOBAL 3',
    mode: 'online-only-kv-d1',
    storage: [],
    bindings: status,
    checkedAt: nowIso()
  };

  if (!status.kv || !status.d1) {
    result.kv = { ok: !!status.kv, binding: status.kvName, message: status.kv ? 'Binding KV présent' : 'Binding KV non configuré' };
    result.d1 = { ok: !!status.d1, binding: status.d1Name, message: status.d1 ? 'Binding D1 présent' : 'Binding D1 non configuré' };
    result.message = 'Mode en ligne obligatoire : GLOBAL3_KV et GLOBAL3_DB doivent être liés ensemble.';
    return json(result, 503);
  }

  try {
    const key = 'global3:health';
    await kv.put(key, JSON.stringify({ ok: true, at: result.checkedAt }), { metadata: { checkedAt: result.checkedAt } });
    const raw = await kv.get(key);
    result.kv = { ok: !!raw, binding: status.kvName };
    if (raw) result.storage.push('KV');
  } catch (error) {
    result.kv = { ok: false, binding: status.kvName, message: error.message || String(error) };
  }

  try {
    await ensureD1Schema(db);
    await db.prepare('SELECT 1 AS ok').first();
    result.d1 = { ok: true, binding: status.d1Name };
    result.storage.push('D1');
  } catch (error) {
    result.d1 = { ok: false, binding: status.d1Name, message: error.message || String(error) };
  }

  result.ok = result.success = !!(result.kv && result.kv.ok && result.d1 && result.d1.ok);
  result.message = result.ok ? 'KV + D1 disponibles. Enregistrements en ligne activés.' : 'KV + D1 non confirmés. Les enregistrements doivent rester refusés.';
  if (result.ok) await logEvent(db, 'health_online_only', 'Contrôle KV + D1 réussi');

  return json(result, result.ok ? 200 : 503);
}
