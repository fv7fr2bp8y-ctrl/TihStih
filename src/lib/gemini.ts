/**
 * Достъп до Google Gemini.
 *
 * Търсенето („Задай въпрос") минава през наш Cloudflare Worker proxy
 * (VITE_GEMINI_PROXY) — ключът стои там, никога в браузъра. Виж proxy/README.md.
 *
 * TTS („Чуй") все още ползва пряк ключ от билд (VITE_TTS_API_KEY); той е
 * временно изключен в приложението и ще мине през proxy-то, щом се върне.
 */

// Proxy URL за текстовото търсене (без ключ в браузъра).
export const GEMINI_PROXY_URL = (import.meta.env.VITE_GEMINI_PROXY as string | undefined)?.replace(/\/$/, '')
export const PROXY_AVAILABLE = !!(GEMINI_PROXY_URL && /^https?:\/\//.test(GEMINI_PROXY_URL))

// Пряк ключ — само за TTS (наследено; TTS е временно изключен).
export const GEMINI_API_KEY = import.meta.env.VITE_TTS_API_KEY as string | undefined
export const GEMINI_AVAILABLE = !!(GEMINI_API_KEY && GEMINI_API_KEY.length > 8)
