# VELORYZ Project Creator — Documentation Library

**Maintainer:** VELORYZ Studio team · **Edition:** 2026-11-21 · **Audience:** visitors, designers, developers, studio administrators and reviewers.

This library documents the **implemented Creator V4 wizard**, its supporting services and requirements that still need operational confirmation. It is maintained in source control alongside the application. It is **not** a public terms of service, a copyright certificate, proof of deployment, or a claim that external providers are configured.

## Read these documents in order

| File | Who needs it | Purpose |
| --- | --- | --- |
| [01 — Experience and navigation](./01-EXPERIENCE-AND-NAVIGATION.md) | Design, support, visitors | Screen-by-screen flow, button behavior, accessibility |
| [02 — Architecture and data flow](./02-ARCHITECTURE-AND-DATA-FLOW.md) | Developers | Browser, CMS, APIs, persistence and integration boundaries |
| [03 — Project AI operations](./03-PROJECT-AI-OPERATIONS.md) | Developers, admin, support | Provider setup, fallback behavior, troubleshooting and limits |
| [04 — Pricing and promotions](./04-PRICING-AND-PROMOTIONS.md) | Sales and admin | Estimate calculation, category settings and offer controls |
| [05 — Enquiries and portal](./05-ENQUIRIES-AND-CLIENT-PORTAL.md) | Operations and support | Reference codes, invitations, portal access and email handoff |
| [06 — Privacy and security](./06-PRIVACY-AND-SECURITY.md) | Operations, security, legal reviewer | Personal-data boundaries and controls |
| [07 — Copyright and licensing plan](./07-COPYRIGHT-AND-LICENSING.md) | Studio management, creative team, legal adviser | Ownership, external templates, licensing evidence and contract checklist |
| [08 — QA, accessibility and release](./08-QA-ACCESSIBILITY-RELEASE.md) | Developers and testers | Reproducible test cases and launch gates |
| [09 — Incident and troubleshooting](./09-TROUBLESHOOTING.md) | Support and engineering | Diagnosing broken controls, AI, email and pricing |
| [10 — Content and support copy](./10-CONTENT-AND-COMMUNICATION.md) | UX writers, sales, support | Approved claims, safe wording and messaging sequence |

## Where the implementation lives

- UI and wizard state: `public/creator-v4.js`, `public/creator-v4.css`
- Project assistant: `public/creator-ai.js`, `lib/studio-platform.mjs`, `lib/cms-api.mjs`
- Shared estimator: `public/planner-model.js`; proposal PDF: `public/creator-proposal.js`
- Main-page shell, old route and shared widgets: `lib/site-shell.ts`, `public/app.js`, `public/platform.js`
- Enquiry handling: `lib/enquiries.mjs`; admin: `public/admin.js`, `public/admin-client.js`
- Private portal: `public/client-portal.js`, `supabase/functions/veloryz-client-portal-api/index.ts`
- Tests: `tools/test-creator-v4.mjs`, `tools/test-project-ai.mjs`

## Status legend

**Implemented in source** means a code path exists and was reviewed/tested at source level. **Requires deployment verification** means only a live request or browser check can confirm operation. **Requires configuration** means credentials, host binding, email domain verification or admin setup are still necessary. **Planned** means no claim of implementation is made.

## Update procedure

When changing a feature, update the corresponding document in the same commit, adjust tests, and record any behavioral change in the pull-request or commit description. Claims of delivery or rights ownership require evidence rather than marketing language.
