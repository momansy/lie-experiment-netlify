export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response('', {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const appsScriptUrl = Netlify.env.get('GOOGLE_APPS_SCRIPT_WEB_APP_URL');
  if (!appsScriptUrl) {
    return new Response(JSON.stringify({
      ok: false,
      message: 'Missing GOOGLE_APPS_SCRIPT_WEB_APP_URL Netlify environment variable'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const bodyText = await req.text();
    const upstream = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyText
    });

    const responseText = await upstream.text();
    return new Response(responseText, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      message: error && error.message ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
