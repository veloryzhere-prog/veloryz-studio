# VELORYZ Client Lifecycle and Gmail Delivery Setup

## Acceptance to onboarding
A visitor submits a full project brief at https://veloryz.online/create/. The request appears privately in Studio Control / Project Console with a reference code that is NOT a private portal password.

The authorized owner selects Accept & Onboard Client. The server checks the owner session, creates only one client project per enquiry, retains the full original specification, and prepares six starter milestones. The acceptance step uses a single database transaction and stable milestone identifiers to avoid duplicate client workspaces on retries.

On acceptance, the server prepares a detailed multi-page PDF with the client information, original project brief and planning notes, request reference, milestone roadmap, next steps, scope caveats, studio links and security rules.

The server then attempts two separate branded Gmail messages:
1. VELORYZ project acceptance, with the detailed PDF attached.
2. Private client invitation with the cryptographically random single-use activation code.

Invitation codes expire after 14 days. Only a SHA-256 hash is stored. The one-time code is separate from the PDF and the public request reference.

Once the code is activated at https://veloryz.online/client/, the client can review stages, deliverables, private messages and approval decisions. Milestone completion automatically updates overall project progress. The admin interface includes the original request reference, PDF download and private email audit. Chat messages are stored immediately and email notifications are best-effort.

## Configure the Gmail mailbox without Resend

Sender mailbox: veloryz.here@gmail.com
Sender display name: VELORYZ
SMTP host: smtp.gmail.com
SMTP port: 465 with implicit TLS, not ports 25 or 587
Credential secret name: VELORYZ_GMAIL_APP_PASSWORD
SMTP provider cost: Gmail's regular account sending within its current limits; no Resend subscription.

1. Sign into the correct Google account, veloryz.here@gmail.com.
2. Enable Google 2-Step Verification.
3. If offered under Google Account security, generate an App Password for the studio's server application. Standard Gmail account passwords must not be used. App Passwords may be unavailable for some organization-managed or Advanced Protection accounts.
4. In Supabase project vgxdfjlqstpbtezxmxtq, open Edge Functions > Secrets and create an encrypted secret named VELORYZ_GMAIL_APP_PASSWORD with that App Password as its value. NEVER put it in GitHub, Studio CMS, public source or browser requests.
5. Open Studio Control > Client Management > Gmail setup and choose Send test email to studio mailbox. The test does not create any client record or invitation.
6. Check the test message in Gmail inbox, Spam and Sent. A successful SMTP acceptance is not proof of final inbox receipt.
7. Check project-level Automatic email activity to see the actual result of acceptance, invitation or message notifications.

## When Gmail is unavailable
The accepted project, detailed PDF and private invite still exist, but the backend records not-configured or failed instead of claiming email delivery. The owner must copy the private code securely while it is shown. Previously generated secret codes cannot be recovered; explicit reissue revokes the previous code and active project sessions.

Gmail has sending limits and anti-spam policies. Port 465 must be reachable from Supabase Edge Functions. Do not use the client chat for bulk marketing.

## Boundaries and privacy
The full PDF contains project references and planning information, not the secret invitation code. The private client PDF is accessible only through an authorized owner or active client session. Client portal data, messages and Gmail secrets are never included in public CMS indexes. Email notifications do not copy private chat message bodies into mail.

## Protected API
Owner-only:
POST /api/client-portal/admin/accept
GET /api/client-portal/admin/projects/<project-id>/summary
GET /api/client-portal/admin/mail-events?project_id=<project-id>
POST /api/client-portal/admin/test-email
POST /api/client-portal/admin/invite
POST /api/client-portal/admin/messages/read

Client session:
GET /api/client-portal/summary
POST /api/client-portal/messages/read
Existing project messages, milestones, approval decisions and private session endpoints.

## Verification and deployment
Run node tools/test-client-lifecycle.mjs, corepack pnpm exec tsc --noEmit and the production build. Supabase database migrations and Edge Functions are deployed independently from GitHub. Deploy the updated website host before expecting these changes on veloryz.online. Do not accept a real customer's request or issue a real invitation as a smoke test without authorization.
