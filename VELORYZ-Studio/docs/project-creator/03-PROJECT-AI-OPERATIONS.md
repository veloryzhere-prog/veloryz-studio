# 03 — Dedicated VELORYZ Project AI: operation and support

## Intent and identity

VELORYZ Project AI is a **project-scoping assistant**, not Nikhil, Happy or another persona bot. It helps with requirements, feature selection, budgets, milestones, MVP phasing and questions about post-submission access. It is advisory only; it cannot approve contracts, discounts, deliverables or client invitations.

**Client widget:** `public/creator-ai.js`.
**Route:** `POST /api/project-ai` in `lib/cms-api.mjs`.
**Server implementation:** `projectCreatorAi()` in `lib/studio-platform.mjs`, using `resolveAiSettings()` and model-provider request logic.

## Production activation

1. Deploy the latest code containing the route and the JS/CSS. The frontend button and the endpoint must be deployed together.
2. Choose a live provider in **Studio Control → AI settings**, or provide a production Worker AI binding. Provider credentials stay server-side. For OpenAI/Gemini, follow the existing server configuration; never place keys in browser code, GitHub markdown, HTML or screenshots.
3. Verify the provider actually responds to a bounded question on the production host. A configured key, build success or AI icon is **not** evidence of live inference.
4. Confirm the response has `available:true`, `mode:'ai'` and a meaningful `answer`; check provider billing/quota and permitted models.
5. Test both direct visit `/create/` and SPA navigation into Create from another site page.

The project AI backend attempts the configured provider; if that fails and the Cloudflare Workers `AI` binding is available, it attempts the configured Workers model. If neither is operational, the API returns **503**, `PROJECT_AI_UNAVAILABLE` (or a specific validation/rate error).

## Non-AI fallback

The client includes **prewritten studio guidance** for common project questions. When the live endpoint cannot respond, the widget labels the material `STUDIO GUIDE · PREWRITTEN`, and says the live AI is unavailable. This fallback is not a generative answer, not proof that the model is connected, and cannot issue a quotation or client code. Visitors may keep using the creator or contact the team.

## Data minimization and restrictions

The client sends message text, stage, category, visual style, budget preference, project goal and feature names. It does not intentionally include the visitor's dedicated email field. Visitors can nevertheless enter personal information in free-text goals or messages; warn them not to submit secrets. The server limits message count/size, applies origin checks and rate limits. Its system instructions forbid secrets, impersonation and fictional pricing commitments.

Live-model outputs are informational and may contain errors; the final brief, scope, quote and invitation must be reviewed by the team.

## Troubleshooting decision tree

1. **No launcher**: check creator script order, `creator-ai.js` response status, client console, `studio:route` event and presence of `#v4-ai-slot`.
2. **Launcher visible but cannot click**: inspect overlays, pointer-events, z-index, stale CSS, capture/bubble event conflicts, and left-screen position.
3. **Panel opens, send fails**: inspect Network → `POST /api/project-ai`; log HTTP status and server request ID if provided. Do not send passwords to support.
4. **HTTP 503**: check binding, provider health, billing, API key permissions and model name in protected config; test from production runtime.
5. **HTTP 429**: existing rate limit is operating. Do not disable limits to fix an overloaded client.
6. **HTTP 4xx validation**: review bounded conversation shape and message lengths; client must send alternating user/assistant roles.
7. **Only prewritten guidance**: a useful fallback exists, but the live provider is not functioning. Confirm the exact provider path before advertising “live AI”.

## Verification checklist

- Opens and closes on desktop/mobile from the bottom-left.
- Supports mouse, touch and keyboard.
- A valid live-provider test produces an actual provider reply.
- No provider yields visible offline status and correctly labeled guide.
- Messages are not sent to unrelated persona chats.
- No personal client email or access code is automatically injected into prompt context.
- Long, malformed and repeated requests fail safely; core wizard stays usable.
