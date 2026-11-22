# VELORYZ — Private Client Email and Order PDF Workflow

## Each email is sent only by an individual Admin button

1. A visitor submits a full project request in /create/. The original brief, reference, contact details, selected options, budget, and links reach Studio Control → Project Console.
2. The authorized owner clicks **Accept & Onboard Client**. This saves one linked private client workspace and six initial milestones. **Accepting does NOT send any email or generate a private access code.**
3. In **Client Management**, open the accepted project and click **Send Project Summary + PDF**. Confirm the email address. The server builds and attempts one branded Gmail email with the complete original order data, all submitted reference links, studio URLs, milestone roadmap, and an attached official **one-page A4 PDF**.
4. When the client should receive access, click **Send Client Invitation** separately. That action creates a single-use 14-day activation code and attempts a second email containing the project reference, activation code, private portal link, expiry and instructions. Reissuing access revokes older invitations and client sessions.
5. Each attempt creates an owner-only email activity record. A status of SENT means Gmail SMTP accepted the message after SMTP DATA 250, **not** proof of Inbox delivery. Failed delivery leaves the project safe. Summary mail can be sent again from its own button; a failed invitation gives the owner the secret code for a secure manual handoff.

## Industrial email and PDF design

The official email uses VELORYZ vector-inspired V mark and wordmark, clean charcoal-and-paper industrial typography, a prominent order reference, clear section rules and accessible email-client-compatible tables. It includes HTML and plain text versions.

The PDF has exactly **one A4 page**, a VELORYZ vector brand mark, order reference, client and project identity, acceptance date, status/phase, initial roadmap and important internal/external links. A long project cannot physically fit unabridged on one readable page: the complete request is retained in the HTML/plain-text email and included as an embedded TXT attachment inside the same PDF, plus the original private project record. No access code is included in the summary PDF or acceptance email.

This summary is not a binding final invoice, guaranteed delivery date or payment receipt. Separate written contractual terms prevail.

## Gmail connection (no Resend)

From: VELORYZ <veloryz.here@gmail.com>
Host: smtp.gmail.com
Transport: implicit TLS on port 465
Supabase secret: VELORYZ_GMAIL_APP_PASSWORD
Supabase project: vgxdfjlqstpbtezxmxtq

The secret must be a Google App Password associated with the correct account, stored only in Supabase Edge Function Secrets. Do not paste it into the public CMS, code or chat. Ports 25 and 587 and the Resend service are not used.

Use the protected **Send test email to studio mailbox** button for an intentional live delivery test. A configured secret is not proof that the Gmail SMTP connection can authenticate or that messages arrive; inspect the result and Gmail Inbox, Sent and Spam. Sending is subject to Google limits.

## Protected routes

- POST /api/client-portal/admin/accept: create client workspace only.
- POST /api/client-portal/admin/send-summary: send full order email + one-page PDF, owner-only.
- POST /api/client-portal/admin/invite: create and send private one-time code, owner-only.
- GET /api/client-portal/admin/projects/<id>/summary: view protected PDF.
- GET /api/client-portal/admin/mail-events?project_id=<id>: owner-only delivery results.
- POST /api/client-portal/admin/test-email: explicit test only to the studio sender mailbox.
- GET /api/client-portal/summary: authenticated client downloads their own PDF.

## Release steps

Run node tools/test-premium-mail-handoff.mjs and node tools/test-client-lifecycle.mjs, followed by TypeScript checks and production build. Deploy the updated Supabase Edge Function independently from the GitHub website build. The website host must also publish the updated Admin JavaScript to show the separate buttons.

Privacy choices persist in the public website footer and privacy policy, not a floating pill. The floating Make your project button is removed, while normal project navigation links remain.
