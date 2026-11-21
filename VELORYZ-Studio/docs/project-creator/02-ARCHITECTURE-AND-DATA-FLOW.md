# 02 — Technical architecture and data-flow map

## Source layout and loading

`lib/site-shell.ts` serves the public HTML shell. The relevant script order is:

1. `public/planner-model.js` — shared normalization and estimate functions.
2. `public/platform.js` — legacy public catalogue and original Create-page function.
3. `public/creator-proposal.js` — local PDF generation.
4. `public/creator-v4.js` — overrides the Create-page renderer and exposes `window.VeloryzCreatorV4`.
5. `public/app.js` — site-wide SPA route rendering.
6. `public/creator-ai.js` — independent project-AI widget and event handlers.

This dependency order matters: loading the new creator before the shared planner or leaving its script cached can result in the older Create page appearing.

The Create route stays in the public site SPA, but it is visually and behaviorally isolated. `public/app.js` adds `v4-creator-page` to the body, skips global expert/campaign widgets on that route, and does not re-render an active wizard merely because the CMS version changed. The creator uses a scoped event handler that prevents the site's legacy click listeners from swallowing button actions.

## Runtime state and data ownership

| Data | Source | Lifetime / owner |
| --- | --- | --- |
| Category, template, features, goal, budget, contact | `creator-v4.js` state | Browser session draft; user can edit |
| Base and category allowances, promotion metadata | Published CMS `state.site.creatorPricing` | Team-managed, from `/api/site`; code defaults are fallback |
| Planning low/high | `VeloryzPlanner.estimate()` | Recomputed in browser; not binding |
| Project PDF | `VeloryzProposal.build/download()` | Browser-generated file, not automatically submitted |
| Project enquiry | `POST /api/enquiries` | Server-held private inbox, once accepted |
| Project reference | Enquiry API response | Issued by server, shown after success |
| Client invitation token | Private portal admin API | Separately created after workspace setup, one-time use |
| AI messages | `creator-ai.js` in-memory store | Page instance; client sends limited project context to AI API |

## HTTP boundaries

### `POST /api/enquiries`

Accepts a project request with a UUID request ID, name, valid email, nontrivial message, budget preference and consent. The server validates length, origin, rate/fingerprint and database insert. On success returns a reference. See `lib/enquiries.mjs` for authoritative validation logic. A network error does not prove submission failed; safe retries use the same request ID.

### `POST /api/project-ai`

The independent server endpoint is in `lib/cms-api.mjs` and dispatches to `projectCreatorAi()` in `lib/studio-platform.mjs`. It validates a bounded alternating user/assistant conversation and project context, checks configured AI provider / Workers binding, and rate limits requests. It does not issue token, payment or quote actions. Actual availability depends on runtime credentials/bindings.

### `GET /api/site`

Returns the published CMS state. The browser uses `site.creatorPricing` for public planning estimates and the optional, approved promotion. Updates in Studio Control require saving and publishing; an existing quote does not silently change.

### `/api/client-portal/*`

A separate private backend handles admin project creation, invitations, token redemption and client messages. Its storage and authorization are not the same as the public project enquiry form.

## Failure boundaries and graceful degradation

- No project-AI model: optional helper shows clearly labeled *prewritten guide* suggestions; no fabricated live-model output.
- No CMS response: page uses the last published or code fallback where available; do not misstate live prices as an approved quote.
- No enquiry DB: submission fails visibly, draft retained, provide contact alternatives.
- No email provider: invite can require manual owner delivery; never show “email sent” without provider evidence.
- Old scripts cached: bust the creator JS/CSS versions in `site-shell.ts`, reload and test.

## Change-impact checklist

Changes to `creator-v4.js` should update `test-creator-v4.mjs`; changes to AI must update `test-project-ai.mjs`; server API changes require validation/negative-path tests; pricing changes require CMS validation + estimate tests; navigation changes require browser Back/Forward and mobile keyboard tests.
