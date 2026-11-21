# 09 — Support and incident troubleshooting runbook

## Symptom: Continue/Start is unresponsive

1. Check the actual deployed `creator-v4.js` version and browser console errors.
2. Confirm the DOM includes `.v4-root` and the clicked control has `data-v4-action`.
3. Verify `/create/` has the `v4-creator-page` body class.
4. Confirm legacy click handlers are not canceling events; creator controls use a scoped capturing click handler with default prevention and propagation isolation.
5. Check form validation. Missing goal/name/email/consent should display an inline message rather than silently advance.
6. Test mouse, touch and keyboard. Retest on an incognito browser to eliminate stale cache.
7. Check whether a CMS refresh or SPA navigation is unexpectedly replacing `#main`; the current creator must not be wiped during form entry.

## Symptom: Old Create your project visible under the wizard

- Inspect `#main` children and the active route; the page should contain only the mounted Creator V4 root for the creator view.
- Verify `body.v4-creator-page` CSS loaded and the creator's stylesheet has the newest version.
- Check `public/platform.js` old `createPage()` and any late-injected planner widgets.
- A stale script order can cause the older route renderer to win. See [Architecture](./02-ARCHITECTURE-AND-DATA-FLOW.md).
- Do not delete the old planner source blindly: other pages may still depend on it. Isolate it by route.

## Symptom: Project AI button missing or unresponsive

- Confirm `creator-ai.js` was served, has no syntax errors, and `#v4-ai-slot` exists.
- It should mount at initial DOM ready, `studio:route`, or `veloryz:creator-render`.
- Examine overlay/z-index/pointer-events and left positioning on narrow screens.
- If panel opens but replies fail, inspect the POST to `/api/project-ai`; distinguish a frontend event problem from an unavailable inference provider.
- When provider unavailable, the client should show explicitly **prewritten** guidance, not an invented model reply.

## Symptom: The wrong pricing or an unavailable promotion appears

- Check published `site.creatorPricing`, not just admin draft.
- Verify that category-specific amounts are numbers and that the current backend recognizes the category/pricing schema.
- Check whether the promotion is enabled, terms complete and expiry current.
- Confirm an offer is not being subtracted from the automatic estimate. Recompute in a new browser session if necessary.

## Symptom: Enquiry reference missing

- Check browser Network response from `POST /api/enquiries`. A 2xx with `reference` is required for success.
- If 503, inspect the private database/backend, not the UI alone.
- Preserve the request UUID for retries; do not generate multiple unrelated references after a timeout unless necessary.
- If the server accepted a request but browser lost the response, ask the team to check the private inbox.

## Symptom: Activation email not delivered

- First confirm the team actually created a private client workspace and generated an invitation.
- Check backend delivery status (accepted/manual/failed). Confirm `RESEND_API_KEY`, verified `PORTAL_FROM_EMAIL`, sender DNS records and recipient.
- Never show the client the API key or token hash.
- Distinguish project reference from invitation code.
- Do not promise delivery in twelve hours; escalate internally if a new enquiry remains untouched.

## Incident severity examples

**P1:** cross-project data leak, unauthorized portal access, leaked provider key, payment/security issue — immediately disable affected access and escalate.
**P2:** no one can submit a project / production endpoint down / all creator controls blocked — prioritize restore or rollback and display a safe contact alternative.
**P3:** Project AI offline while creator is functional, noncritical layout issue — use labeled prewritten guidance and investigate provider/UX.
**P4:** editorial typo, broken inspiration reference or documentation inconsistency — log, assign, fix in normal release.

## Evidence to record

Timestamp, URL+query (without private tokens), browser version, screenshot with PII redacted, request status and error code, deployed commit SHA, reproduction steps, affected users (anonymized), mitigation and follow-up owner. Do not paste customer emails, private invite codes, production keys or full AI chat transcripts into public issues.
