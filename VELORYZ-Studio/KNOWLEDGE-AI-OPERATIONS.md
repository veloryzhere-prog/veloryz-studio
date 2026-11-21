# VELORYZ Studio — AI Help & Support Operations

**Release scope:** Help Centre, Contact Support, Client Portal and Project Creator.  
**Repository:** `veloryzhere-prog/veloryz-studio`  
**Private backend:** Supabase project `vgxdfjlqstpbtezxmxtq`, isolated schema `veloryz_studio`  
**AI edge function:** `veloryz-knowledge-ai`  
**Owner settings:** `/admin/#/knowledge-ai`

## Four independently managed assistants

| Assistant | Public location | Purpose |
| --- | --- | --- |
| Help Assistant | `/help/assistant/` and Help Centre CTA | Public documentation search and task guidance |
| Contact Support | `/support/` and contact/help CTAs | Issue triage, human support routing and safe troubleshooting |
| Client Guide | Private `/client/` portal → **AI Guide** tab | Client workspace navigation; does **not** read or reveal confidential records |
| Project Planner | `/create/` → Project AI | Scope, requirements, phased budget and brief planning |

These are not the fictional character chatbots from the Studio's social personality experiences. The legacy personas remain in **Platform pages** and retain their existing separate connection configuration.

## Owner setup

1. Sign in through the protected Studio Control login.
2. Open **AI Management**. The four role cards have independent configuration and 30-day usage counters.
3. Choose **Gemini**, **OpenAI** or **Studio reference mode** for each agent.
4. Enter a provider-supported model (default `gemini-2.5-flash`), your own provider key in the password field, welcome message, assistant instructions and up to four suggested questions.
5. Save the profile. The key is encrypted server-side with AES-GCM and is never returned to the browser. Switching providers clears the previous provider's saved key instead of reusing it accidentally.
6. Select **Test actual reply** to verify provider access, model availability, quota and network connectivity. A "documentation fallback" result is *not* proof of a working Gemini/OpenAI connection.

**No API keys are hardcoded in this repository.** Provider keys are added individually through Studio Control or an authorized server-side runtime secret. API calls originate from Supabase Edge, not the browser.

## Chat and privacy behavior

- Full-page two-column WhatsApp-style interface; not a popup or character widget. The authenticated client portal uses an embedded version.
- Current conversation history persists in the current browser tab through `sessionStorage`. Transcripts are not written to the AI usage database.
- At most 18 alternating user/assistant messages are accepted by the backend, with bounded input sizes, 25-second provider timeout, and per-IP/per-agent limits (currently 28 per hour).
- The service retrieves matching descriptions from 152 published source guides and excerpts from topic-specific documentation chapters to ground replies.
- If provider credentials are missing, invalid or rate-limited, the UI labels the result as **Studio references / offline guidance** and offers actual links. It does not generate fake AI answers.
- The assistant cannot create tickets, access live project records, email the Studio, verify payments, schedule calls or confirm contractual commitments.
- The client assistant deliberately receives **no confidential client portal data**. Private conversations in the portal Messages tab remain separate.
- Sensitive details such as passwords, access codes and payment-card information should never be entered in chat; external provider privacy policies apply.

## Backend architecture

- Migration `supabase/migrations/20261121193500_veloryz_knowledge_ai_profiles.sql`: four private profile records, per-role rate counters and aggregate usage table; RLS is enabled and public/anon/authenticated table privileges revoked.
- Edge `supabase/functions/veloryz-knowledge-ai/index.ts`: owner session check delegates to the existing deployed Studio API via signed `vz_admin` session cookie; private Supabase service-role RPC functions are grant-restricted.
- `lib/cms-api.mjs`: forwards only the known public/admin Knowledge AI HTTP methods and paths to the separate API; it does not forward browser cookies to public chat routes.
- Public interface `public/support-chat.js` + `public/support-chat.css`.
- Admin interface `public/admin-knowledge-ai.js` + `public/admin-knowledge-ai.css`; classic character AI provider settings remain in their original section.
- Source/UI smoke checks: `node tools/test-knowledge-ai.mjs`, which also runs in the GitHub documentation CI workflow.

## Consultation preference

The **Request a consultation** modal now includes **Don't show this consultation suggestion again on this device**. Its value is stored in browser `localStorage` under `veloryz.consultation.no-auto`. Both scheduling and an already-running timer check that preference. Manual booking buttons and the `/book/` page remain accessible.

## Release validation

After website deployment, check the actual production routes `/help/assistant/`, `/support/`, `/client/`, `/create/` and `/admin/#/knowledge-ai`.

Verify both **unconfigured** (guide fallback) and **configured** (genuine provider response) paths for each agent, owner-only access without session, individual settings isolation, quota failure behavior, default mobile layout, keyboard navigation and the automatic consultation preference.

**Current completion distinction:** The SQL migration was applied and the new Supabase Edge function deployed separately. The site and admin/UI source changes were committed to the GitHub repository. Live website build/deployment and a configured provider-key test must be verified independently before describing live model inference as working.
