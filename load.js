const responseHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function jsonObject(obj = {}) {
  return new Response(JSON.stringify(obj), { headers: responseHeaders });
}

function rawJson(data) {
  return new Response(data || '{}', { headers: responseHeaders });
}

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

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const companyId = String(url.searchParams.get('companyId') || 'global3_all').trim() || 'global3_all';
  const errors = [];

  if (context.env.GLOBAL3_KV) {
    try {
      const kvData = await context.env.GLOBAL3_KV.get('company:' + companyId);
      if (kvData) return rawJson(kvData);
    } catch (error) {
      errors.push('KV: ' + (error?.message || String(error)));
    }
  }

  if (context.env.DB) {
    try {
      await ensureDB(context.env);
      const last = await context.env.DB.prepare(
        'SELECT data FROM backups WHERE company_id = ? ORDER BY id DESC LIMIT 1'
      ).bind(companyId).first();
      if (last?.data) return rawJson(last.data);
    } catch (error) {
      errors.push('D1: ' + (error?.message || String(error)));
    }
  }

  return jsonObject(errors.length ? { _cloudErrors: errors } : {});
}
