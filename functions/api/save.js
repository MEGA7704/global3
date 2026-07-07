const responseHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

const json = (obj, init = {}) => new Response(JSON.stringify(obj), {
  ...init,
  headers: { ...responseHeaders, ...(init.headers || {}) }
});

async function ensureDB(env) {
  if (!env.DB) return false;
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`).run();
  return true;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: responseHeaders });
}

export async function onRequestPost(context) {
  const results = { kv: false, d1: false, errors: [] };

  try {
    const body = await context.request.json().catch(() => ({}));
    const companyId = String(body.companyId || 'global3_all').trim() || 'global3_all';
    const payload = Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body;
    const data = JSON.stringify(payload ?? {});
    const now = new Date().toISOString();

    if (context.env.GLOBAL3_KV) {
      try {
        await context.env.GLOBAL3_KV.put('company:' + companyId, data);
        await context.env.GLOBAL3_KV.put('company:' + companyId + ':updated_at', now);
        results.kv = true;
      } catch (error) {
        results.errors.push('KV: ' + (error?.message || String(error)));
      }
    }

    if (context.env.DB) {
      try {
        await ensureDB(context.env);
        await context.env.DB.prepare(
          'INSERT INTO backups (company_id, data, created_at) VALUES (?, ?, ?)'
        ).bind(companyId, data, now).run();
        results.d1 = true;
      } catch (error) {
        results.errors.push('D1: ' + (error?.message || String(error)));
      }
    }

    const saved = results.kv || results.d1;
    return json({
      success: true,
      saved,
      storage: results,
      message: saved
        ? 'Sauvegarde cloud effectuée.'
        : 'Aucun stockage cloud disponible. La sauvegarde locale reste active et non bloquante.'
    });
  } catch (error) {
    return json({
      success: true,
      saved: false,
      warning: 'Sauvegarde cloud différée. La sauvegarde locale reste conservée.',
      detail: error?.message || String(error)
    });
  }
}
