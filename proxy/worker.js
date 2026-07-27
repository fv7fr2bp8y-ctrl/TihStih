/**
 * Cloudflare Worker — proxy към Google Gemini (Generative Language API).
 *
 * Защо: GitHub Pages е статичен сайт, а организационната политика на Google
 * не позволява „гол" (unbound) браузърен API ключ. Затова ключът стои ТУК
 * (Worker secret GEMINI_API_KEY), никога в браузъра. Браузърът вика този
 * Worker, а Worker-ът добавя ключа и препраща заявката към Google.
 *
 * Деплой:
 *   cd proxy
 *   npx wrangler deploy
 *   npx wrangler secret put GEMINI_API_KEY   # постави ключа, когато пита
 * После сложи публичния URL на Worker-а в GitHub секрета VITE_GEMINI_PROXY.
 */

const ALLOWED_ORIGINS = new Set([
  'https://askbible.online',
  'https://www.askbible.online',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

const UPSTREAM = 'https://generativelanguage.googleapis.com'
// Пропускаме само generateContent към конкретен модел — нищо друго.
const ALLOWED_PATH = /^\/v1beta\/models\/[A-Za-z0-9._-]+:generateContent$/

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const cors = corsHeaders(origin)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors)
    if (!ALLOWED_ORIGINS.has(origin)) return json({ error: 'Forbidden origin' }, 403, cors)

    const url = new URL(request.url)
    if (!ALLOWED_PATH.test(url.pathname)) return json({ error: 'Not found' }, 404, cors)
    if (!env.GEMINI_API_KEY) return json({ error: 'Key not configured' }, 500, cors)

    const upstreamUrl = `${UPSTREAM}${url.pathname}?key=${env.GEMINI_API_KEY}`
    let upstream
    try {
      upstream = await fetch(upstreamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: await request.text(),
      })
    } catch {
      return json({ error: 'Upstream error' }, 502, cors)
    }

    const text = await upstream.text()
    return new Response(text, {
      status: upstream.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  },
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://askbible.online'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, 'Content-Type': 'application/json' } })
}
