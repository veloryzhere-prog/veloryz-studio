# VELORYZ Client Portal · operational workflow

## Request to invitation

1. A visitor opens **/create/**, chooses the project scope and enters a **required valid email** in the review step. The final project enquiry form reuses this address and requires explicit consent.
2. The submitted enquiry is saved in the protected Studio Control **Project console**. The visitor receives a reference number. **No invitation is sent merely for submitting a brief.**
3. The owner opens that enquiry and clicks **Create client workspace**. Client name, email, service and description are prefilled; the owner reviews and edits them. Alternatively, create a project directly under **Admin → Client portal**.
4. The owner saves the workspace. Add milestones (with statuses and dates), deliverable links, approval requests and project updates. These are separate from public portfolio projects.
5. The owner clicks **Generate invitation**. The server creates **16 cryptographically random bytes** (128 bits), renders them as `VZ-XXXX-XXXX-...`, hashes a canonical version with SHA-256 and stores **only the hash** in the isolated private database. The code is tied to one project. Previous invitations and current client sessions for that project are revoked. The new invitation expires after **14 days**.
6. The server attempts to send a branded invitation to the **stored client email** using Resend **only if both** `RESEND_API_KEY` and `PORTAL_FROM_EMAIL` are configured on the `veloryz-client-portal-api` Supabase Edge Function. The owner sees one of **accepted by provider**, **manual delivery required**, or **delivery failed**. Provider acceptance is *not* guaranteed inbox delivery. If unconfigured/failed, use the manual code/link or open the prepared email draft and explicitly send it.
7. The client opens **/client/**, pastes the invitation code (or opens the private URL). The server atomically **consumes** the invitation and sets a **Secure, HttpOnly, SameSite=Strict** session cookie valid for seven days. The invitation cannot be used again.
8. During the session, the client can see **only that project's** milestones, shared HTTPS file links, pending approvals and messages. Approving or requesting changes is written to the project's records. Messages are visible to both parties in the same conversation.
9. Admin editing is available any time under **Admin → Client portal**. Changes are saved privately and become visible to clients when they next fetch their workspace. To revoke a session or reset an invitation, generate a new invitation.

## Email setup

In the Supabase Dashboard, choose the project used by VELORYZ Studio and open **Edge Functions → Secrets**. Add:
- `RESEND_API_KEY`: Resend secret API key. Never put it in frontend code or GitHub.
- `PORTAL_FROM_EMAIL`: a verified sending identity for your own domain, for example `VELORYZ Studio <projects@veloryz.online>` *only after you have verified that domain with the provider*.
- Optional `PORTAL_REPLY_TO`: the studio inbox for replies.

The sender's domain must be verified with the provider (DNS records for sending authentication). Use the owner page's delivery indicator and test with a real client email. No secrets or fake sent confirmations are stored in the code.

## Security and practical limits

- The client room is isolated within the existing `veloryz_studio` schema. Only the service-role backend can access these tables. Public/anonymous database grants are revoked and RLS is enabled.
- The backend verifies the existing owner session before any admin operation.
- Link delivery is **not an attachment-hosting service**. Files appear as HTTPS links and retain the original host's access permissions. Do not insert confidential files into publicly readable URLs.
- This is currently a **single workspace per invitation**. Multiple projects for one client require separate invitations for now.
- This system does not process payments, offer automatic contract signatures, or confirm the availability of appointments.
- Creating a project does not automatically open a client account or email someone. The owner makes the decision to issue the invitation.
