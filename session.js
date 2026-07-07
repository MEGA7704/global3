const responseHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

const json = (obj, init = {}) => new Response(JSON.stringify(obj), {
  ...init,
  headers: { ...responseHeaders, ...(init.headers || {}) }
});

function cookie(name, value, maxAge) {
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax'
  ];
  if (typeof maxAge === 'number') attrs.push(`Max-Age=${maxAge}`);
  return attrs.join('; ');
}

function getCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  const found = raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : '';
}

function token() {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: responseHeaders });
}

export async function onRequestGet(context) {
  try {
    if (!context.env.GLOBAL3_KV) {
      return json({ session: null, cloudSession: false });
    }

    const sid = getCookie(context.request, 'GLOBAL3_SESSION');
    if (!sid) return json({ session: null, cloudSession: true });

    const data = await context.env.GLOBAL3_KV.get('session:' + sid);
    return json({ session: data ? JSON.parse(data) : null, cloudSession: true });
  } catch (error) {
    return json({ session: null, cloudSession: false, error: error?.message || String(error) });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const session = body.session || null;
    const sid = token();

    if (context.env.GLOBAL3_KV && session) {
      await context.env.GLOBAL3_KV.put('session:' + sid, JSON.stringify(session), {
        expirationTtl: 60 * 60 * 24 * 7
      });
    }

    return json({ success: true, cloudSession: !!context.env.GLOBAL3_KV }, {
      headers: { 'Set-Cookie': cookie('GLOBAL3_SESSION', sid, 60 * 60 * 24 * 7) }
    });
  } catch (error) {
    return json({ success: true, cloudSession: false, warning: error?.message || String(error) }, {
      headers: { 'Set-Cookie': cookie('GLOBAL3_SESSION', '', 0) }
    });
  }
}

export async function onRequestDelete(context) {
  try {
    const sid = getCookie(context.request, 'GLOBAL3_SESSION');
    if (context.env.GLOBAL3_KV && sid) {
      await context.env.GLOBAL3_KV.delete('session:' + sid);
    }
    return json({ success: true }, {
      headers: { 'Set-Cookie': cookie('GLOBAL3_SESSION', '', 0) }
    });
  } catch (error) {
    return json({ success: true, warning: error?.message || String(error) }, {
      headers: { 'Set-Cookie': cookie('GLOBAL3_SESSION', '', 0) }
    });
  }
}
