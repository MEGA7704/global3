const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    ok: true,
    project: 'GLOBAL 3',
    api: 'Cloudflare Pages Functions',
    storage: {
      kv: !!context.env.GLOBAL3_KV,
      d1: !!context.env.DB
    },
    time: new Date().toISOString()
  }), { headers });
}
