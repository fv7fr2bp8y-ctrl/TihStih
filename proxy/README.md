# Gemini proxy (Cloudflare Worker)

Малък proxy, за да не излагаме Gemini API ключа в браузъра. Браузърът вика
Worker-а; Worker-ът добавя ключа (свой secret) и препраща към Google.

## Еднократна настройка

1. Безплатен акаунт в https://cloudflare.com
2. В тази папка (`proxy/`):
   ```bash
   npx wrangler login          # отваря браузър за вход
   npx wrangler deploy         # качва Worker-а
   npx wrangler secret put GEMINI_API_KEY   # постави Gemini ключа при подкана
   ```
3. `wrangler deploy` показва публичния URL, напр.:
   `https://askbible-gemini-proxy.<твой-subdomain>.workers.dev`
4. Сложи този URL в GitHub секрета **`VITE_GEMINI_PROXY`**
   (repo Settings → Secrets and variables → Actions → New secret).
5. Пусни наново деплоя на сайта — търсенето вече минава през proxy-то.

## Ключът
- Стои само като Worker secret (`GEMINI_API_KEY`) — никога в git, никога в браузъра.
- На него в Google Cloud стигат само **API restriction → Generative Language API**
  и (по желание) таван на разхода. Referrer restriction НЕ е нужен — ключът
  вече не е публичен.
- Може да е и обвързаният (service-account) ключ от AI Studio — тук работи без проблем.

## Локален тест
```bash
npx wrangler dev   # вдига Worker-а локално на http://localhost:8787
```
