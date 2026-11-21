# 06 — Privacy, security and data-handling plan

**Status:** mixture of implemented controls and operational requirements. This document does **not** certify compliance with any specific privacy law or security standard. Team review with a qualified privacy/legal specialist is required before public policy claims.

## Data collected

The browser collects project category, style, features, goals, budget preference, materials and optional inspiration link. On submission it collects name and email, with explicit consent. The project enquiry server stores the submitted brief and contact data. The Project AI gets limited project context and user questions; the client code intentionally excludes the dedicated email field.

Note: a visitor could still type their email or secrets into a goal or chat question. The UI should advise against sharing passwords, API keys or confidential customer data with AI.

## Data flow and access controls

| Location | Data | Access / safeguards |
| --- | --- | --- |
| Session storage | In-progress brief, possibly name/email | Local tab/browser; cleared on successful submission |
| Public enquiry endpoint | Project brief and contact information | Validation, same-origin checks, consent, rate limiting, private storage |
| Admin console | Enquiry and client project | Authenticated studio admins; do not leak via frontend public state |
| Private portal backend | Client projects, invitation hashes, sessions, messages | Project-scoped access checks and secure cookie session |
| AI inference provider | Questions plus project context | Server-side credentials, bounded input, no intentional email-field forwarding |
| External template/WhatsApp/email links | Outbound navigation | Clearly labeled external service, provider privacy terms apply |

## Implemented constraints to preserve

- Credentials and service-role secrets never enter public JS or documentation.
- Enquiry requests have bounded JSON fields, consent, validation and server-side reference creation.
- One-time client invitations store hashes rather than plaintext in the private database.
- Private portal sessions use secure, HttpOnly cookie settings according to the current backend.
- AI input is bounded and rate limited. The optional AI cannot approve payment or issue tokens.
- Template links open external sites with safe navigation attributes.

## Privacy work to complete before production claims

1. Publish an accurate privacy notice naming the data controller/contact address, collection purposes, retention rules, third-party processors and user request process.
2. Set written retention/deletion periods for rejected enquiries, approved projects, AI logs, portal messages and uploaded media. **No automatic retention policy is asserted here**.
3. Review lawful bases, children's data, cross-border transfers and processor contracts appropriate to the jurisdictions served.
4. Verify no access-code values are written to logs, analytics, client storage or URL tracking parameters.
5. Audit admin access and incident-response permissions; ensure staff can revoke credentials and sessions.
6. Test SQL/RPC authorization and RLS; do not assume private data is secure based only on the frontend.
7. Confirm backup, restore, deletion and data export procedures before making public commitments.

## Incident response basics

If a secret/token is leaked: revoke or regenerate it through the supported admin workflow, check logs, notify authorized staff, and assess notification obligations. If a client can view another project: disable access, isolate the faulty authorization rule, gather evidence without exposing more data and do not restore access until verified.
