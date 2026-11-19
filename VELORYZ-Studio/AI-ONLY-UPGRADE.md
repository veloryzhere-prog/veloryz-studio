# VELORYZ Studio — Journey Edition / AI-only upgrade

## What this release changes
This is a patch of **VELORYZ-Studio-Journey-Edition.zip**, not an AETHER or Motion Live rebuild. All original site motion settings, animations, layout, navigation, homepage, design catalogue, booking, payments, and hosting configuration were preserved. Only the AI chat UI, AI backend/connection status, AI admin descriptive text, AI tests, and new synthetic avatar assets were changed.

### Five character personas
- **ARYAN** — the flagship AI character. Confident, sharp and a little teasing, but respectful and useful, especially on serious topics.
- **Happy** — approachable, cheerful, friendly conversation.
- **Nikhil** — calm, analytical, planning, estimates and practical trade-offs.
- **Milky** — imaginative, visual and creative.
- **Ritik** — direct, technical, helpful for debugging and coding.

The characters are fictional AI personas with original generated headshot-style avatars, **not photos or voices of actual people**. Images are in `public/assets/ai-avatars/*.webp`. Existing motion controls are untouched. AI-only CSS adds portrait hover movement, active-typing glow, message arrival, and avatar pulse; these animations pause when the original global motion preference is paused.

### What is genuinely AI and what is not
The backend routes chat messages to the selected configured **Gemini or OpenAI API** with the correct system persona instructions and up to 16 of the visitor's recent user turns. It passes previous replies back as context, supports Unicode text (Hindi/Devanagari, Hinglish, English, other languages), and does not force generic marketing replies. It separates each persona's conversation in memory while the page remains open; there is a New chat button to reset that persona. The chat does not save visitor transcripts to the studio database.

A **real API key and an accessible model** are mandatory for genuine, open-ended language generation. No API key is included in this source archive. The interface no longer invents 'AI' replies via the old keyword guide: a missing/invalid, rate-limited, or failing provider produces a clear *live AI unavailable* status (HTTP 503) and allows retries. Real-world accuracy still depends on the chosen model. **Live web search/browsing is not included**, so the personas must not claim they researched live information.

### Connect live AI in your existing admin dashboard
1. Deploy or run this Journey Edition as described in your unchanged `START-HERE.md` (Node.js 22.13+ and the existing hosting/database setup are still needed).
2. Sign in to your existing owner-only `/admin` panel.
3. In **Studio platform → Your adviser connection**, select **Gemini**, enter your valid Gemini API key and choose a model supported by your own Google project. Use **Save connection & test reply**. The key is encrypted in the existing owner-only provider-settings record, not exposed in browser JavaScript.
4. Alternatively, set `AI_PROVIDER=openai`, `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in the **server's private environment**, then select the OpenAI provider in the protected admin form. OpenAI credentials cannot be entered into that form; they must be server-side secrets.
5. Open the public site, launch **ARYAN**, ask "How are you?", then ask a technical question, switch to Hindi and return to an earlier context. Test all five characters. Ensure you see `Live AI · Gemini` or `Live AI · OpenAI` after a real reply. The startup status "Ready to connect" only means a key is configured, not that an AI call has succeeded.

Do not paste API keys into chat messages or commit `.dev.vars`/secrets to GitHub. API usage may be billable; review provider quotas and usage. The legacy `guide` provider selection still exists for compatibility in the admin settings but **disables live chat** rather than returning misleading generated-sounding filler.

### Tests run
- `node tools/test-gemini.mjs` — PASS, including encrypted settings, Gemini REST payload, multi-turn history, five personas, quota failure and recovery.
- `node tools/test-platform.mjs` — PASS, including OpenAI Responses adapter, admin security, error handling, enquiries and payments.
- `node tools/test-motion.mjs` — PASS, confirming the original motion policy is preserved.
- AI chat isolated Chromium UI at 1440px and 390px — PASS for selecting a character, sending a request to a **mock provider**, switching characters, restoring per-persona conversation, with no JS exceptions.
- Additional available Node tests for CMS, enquiries, Supabase gateway, planning, broadcast and admin — PASS.
- `test-logo-model` and `test-production` could not run because the uploaded ZIP does not contain the `three` and `typescript` dependencies (`node_modules` is absent). No full application build or connected-provider test was claimed.

**Limits:** Maximum 1,200 characters per user message, 31 alternating messages in a request (latest 16 user turns), and a server-side rate limit of 45 calls/hour per IP or fallback agent identifier. Real AI replies do not contain fake browsing results or pretend to act as human staff.
