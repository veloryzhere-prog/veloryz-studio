# VELORYZ Studio · AI Mind Upgrade

**Source:** `VELORYZ-Studio-Warm-Motion-AI-Final.zip` (November 18, 2026).  
**Scope:** AI personalities, real model prompts, non-human avatars, per-page AI help, verified navigation and safe on-site actions.  
**Preserved:** Existing motion onboarding, motion switches, warm site theme, public routes, CMS, enquiries, booking validation, payment verification and admin security.

## What visitors now experience

The AI launcher starts with **Happy**. Five fictional stylized non-human AI portraits are included as locally hosted WebP images. The line-up is Happy (friendly but assertive), Nikhil (analytical and intelligent), Milky (female creative specialist), Ritik (technical specialist), and **ARYAN** (executive escalation, last in the roster). Each is independently prompted and maintains distinct in-tab chat history. Visitors can deliberately choose ARYAN; he is not the automatic first adviser.

The chat speaks in the visitor's language when the configured model supports it. Its prompts differentiate casual conversation from business enquiries. ARYAN's tone is especially commanding, energetic and high-standard, without personal abuse. No personality can guarantee a perfectly correct answer, and no tone instruction overrides safety or accuracy.

Every **successful live-model reply** can include a short set of contextual site links and next-message suggestions, selected by deterministic server-side rules. A reply about pricing recommends pricing/brief routes; booking questions give a usable booking route and an **Open consultation form** button; project questions give a **Open project planner** button. On-site actions open the existing forms; they do **not** submit an enquiry, reserve a meeting, charge a payment, change CMS content or send a message without the visitor's subsequent action. AI responses are untrusted text, not instructions to browse arbitrary URLs.

All public pages receive a page-aware **Help for this page** section and the existing floating AI launcher. The dedicated help section provides a suggested question about that page and a verified link to the next appropriate route.

## Provider behavior and disclosure

The visitor UI and public AI API responses present the service as **VELORYZ Studio AI** without advertising the underlying model vendor. Administrator connection settings continue to identify the actual external provider to the site owner for truthful configuration and billing diagnostics. The public privacy note discloses that messages are sent to an external AI service and that vendor details can be requested. No claim is made that VELORYZ operates its own proprietary foundation model.

For live, context-aware answers, connect a real model account in the existing private owner AI settings and test a live reply. Without valid credentials, the visitor sees a clear unavailable state. The app **does not fabricate scripted responses** when the provider is down. Keys remain on the server and are not packaged into the public browser bundle.

## Files changed

- `lib/adviser-personas.mjs`: complete prompts, language behavior and persona hierarchy.
- `lib/adviser-navigation.mjs`: fixed allowlist of public pages, intent detection, follow-up prompts and approved UI actions.
- `lib/studio-platform.mjs`: page-aware prompt context, validated response extras, safe provider-name-neutral public errors and increased output budget for complex tasks.
- `lib/cms-api.mjs`: brand-neutral public provider availability status.
- `public/platform.js`: Happy as default, per-page help, follow-up buttons, verified links, explicit escalation and site actions.
- `public/app.js`: privacy explanation for AI message processing.
- `public/studio-warm-v3.css`: non-human portrait animation, responsive AI layouts, action chips, contrast improvements and stable persona-switching modal behavior.
- `public/assets/ai-avatars/{happy,nikhil,milky,ritik,aryan}.webp`: original computer-generated fictional characters, optimized for local loading.
- `tools/test-ai-mind.mjs` and `tools/test-gemini.mjs`: new and updated AI contract assertions.

## Verify locally

Run from the extracted `VELORYZ-Studio` project root (Node.js 22.13+):

```powershell
node tools/test-ai-mind.mjs
node tools/test-platform.mjs
node tools/test-gemini.mjs
node tools/test-motion.mjs
node tools/test-cms.mjs
```

Install the project dependencies to use the framework dev/build commands. Use `corepack pnpm install --frozen-lockfile` then `corepack pnpm dev` if `corepack` and the specified package manager are installed. The local URL is printed by the dev server. Never include secrets in public source control.

## QA already performed

- Syntax checks on all modified JavaScript/ES modules.
- AI platform and provider transport tests using **mocked** provider responses; secure credential storage and server-side role routing preserved.
- Browser tests with the locally loaded page fixture: seven major routes, page help presence, correct AI order, chat history retention, multilingual controls, safe suggestion links, ARYAN escalation and planner navigation.
- Browser visual inspection at 1440px and 390px: all five avatar files load when served, and Milky's representation is correct. The prior disappearing AI modal was fixed.
- Motion, CMS, owner authentication, enquiry, broadcast and planner checks passed. Motion onboarding source was **not** changed.

**Not verified:** Real provider answer quality and response latency (no user's live API credentials), final framework production build (framework dependencies absent in the extracted environment), production deployment, external billing/quotas or WebGL performance in a real production browser. Do not treat scripted UI test text as evidence of real model intelligence.
