# 05 — Enquiry submission, reference numbers and client invitation

## Important: two unrelated codes

1. **Project reference:** the enquiry service returns a code like `VZ-...` after a successful request. It identifies an enquiry for support and is **not a password**, credential or activation token.
2. **Client invitation / activation code:** a cryptographically generated, one-time secret created by an authorized team administrator **after** the team creates or approves a private client workspace. It is used at `/client/`.

A project request must never automatically create an invitation or display a fake token. A reference code is not accepted as a portal login code.

## Visitor journey

1. Complete the question-by-question brief and enter a **required email**.
2. Give explicit contact-data consent.
3. Click the top **Send my project** action at the review screen. The browser sends `POST /api/enquiries` with a UUID request ID and structured summary.
4. Wait for an actual successful HTTP response. Show **Project submitted successfully** and the real `reference` from the server.
5. Give the visitor clear next steps: save the reference, check inbox/spam, allow team review, receive a later separate invitation if workspace created, open `/client/` and redeem it.

The suggested “check email within 12 hours” is a **check-in suggestion**, not a guaranteed response, token or email delivery SLA.

## Server behavior

`lib/enquiries.mjs` validates required fields, consent, JSON shape, maximum message length and request id. It uses database fingerprints for safe retries and applies source-based rate limits. It persists an entry in the private enquiry store and returns an actual reference on success. Invalid or unavailable requests must show a visible error; keep draft data for retry.

## Team management procedure

1. In Studio Control → Project console, open the new enquiry and review the requested project and email.
2. Mark status / add a response note according to the team's internal process. New requests older than 12 hours are flagged as needing follow-up; this is a reminder, not proof of contact.
3. If appropriate, create a private client project using the enquiry's contact and scope, then add status, phase, next step, milestones, deliverable links, approvals and messages.
4. Generate an invitation through the **private** portal admin operation. Do not create it in browser JavaScript or manually invent a “secret code.”
5. Inspect delivery status. The provider can accept, fail or be unavailable. If configured but delivery fails, follow the explicitly supported manual process.
6. Instruct the client to enter the actual invitation at `https://veloryz.online/client/`. Never ask them to send the secret to unrelated chats or public support threads.

## Invitation mechanics — current private backend

The private edge-function code and existing `CLIENT-PORTAL-WORKFLOW.md` specify 128-bit random invite material, server-side hash storage, a 14-day invitation expiry, one-time redemption and a 7-day secure session cookie. The client can then see only its project. Generating a replacement invitation revokes previous invitations/sessions for that project.

Email is attempted through **Resend** only when `RESEND_API_KEY` and `PORTAL_FROM_EMAIL` are configured in the private edge-function environment. Sender identity must be verified. A provider “accepted” response does not guarantee arrival in the inbox.

## Support scripts

**Request confirmation:** “Your project request has been received. Save the reference shown on screen; our team will review the scope and contact you using the email in your brief.”

**Portal explanation:** “The project reference is not the access code. A separate private invitation is issued after your workspace is set up. When you receive it, open /client/ and redeem the one-time code.”

**If code not received:** “Check the entered email and spam folder. Please share your *reference number*, not a private invitation token, so our team can locate the enquiry.”

## Things not implemented automatically

No immediate access token on submission, no guaranteed 12-hour email delivery, no automatic project acceptance, no automatic legal agreement, no payment charge and no automatic quote approval.
