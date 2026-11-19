# VELORYZ Studio — Supabase upgrade

## Included
- Expanded service descriptions and scope guidance.
- A dedicated /process/ page covering discovery, scope, reviews, launch and handover.
- Responsive delivery cards and expanded ownership, hosting, support and database FAQs.
- Supabase-backed CMS drafts, publishing, history, enquiries, booking requests, payment requests, admin rate limits, encrypted AI configuration and media metadata.
- Private Supabase Storage for new media uploads. Media is streamed through the existing /media/ routes.
- Database and storage information in the owner workspace's connection check.
- The existing editorial design, project catalogue, campaigns, advisers, admin password flow and payment-provider links are retained.

## Database status
The new studio schema and private media bucket have already been installed in the same Supabase project as THE DAILY SHOP 2.0:
https://vgxdfjlqstpbtezxmxtq.supabase.co

Studio data lives in veloryz_studio, separate from the shop's public tables. The browser never receives the server key. A server-only RPC accepts registered query identifiers and bound parameters; it cannot accept arbitrary SQL. Anonymous and normal signed-in users cannot execute it. Studio admin access uses the studio owner password, independently of shop staff permissions.

Do not reset your Supabase database. The migration supplied under supabase/migrations is a record of the installation already performed; do not rerun it on the connected project.

The original hosting project referenced by this ZIP could not be accessed in this account. This upgrade has NOT been deployed to that website. Existing Cloudflare D1 records and uploaded R2 files have NOT been exported or migrated. Only content included in the source ZIP was used to initialise this new studio database. If your old site has newer published content, export and import it before switching the live site. New media uses the new private bucket; old /media/ links need their original objects and metadata migrated.

## Run locally (Windows Terminal / VS Code)
1. Install Node.js 22.13 or newer. Use Node.js 24 to run the included Node SQLite tests.
2. Open the extracted VELORYZ-Studio folder in VS Code.
3. Install the pinned package manager: npm install --global pnpm@11.25.0
4. Install dependencies: pnpm install --frozen-lockfile
5. Configure: node scripts/configure-studio.mjs
6. Enter the Supabase project URL above, your project's server secret/service-role key, and a NEW studio owner password. The script hides secrets and writes an ignored .dev.vars file. Never upload or commit that file.
7. Start: pnpm dev
8. Open the URL printed by the terminal. Use /admin for the owner workspace and /process/ for the new page.

Use Supabase Dashboard → Project Settings → API keys to obtain the server key. Do not use a publishable/anonymous key for the server adapter. Do not add NEXT_PUBLIC_ or VITE_ prefixes to server secrets.

The setup script can generate local runtime configuration; it does not change your existing hosted runtime settings or transfer those settings automatically. Keep your chosen password in your password manager.

## Deploy
This project is a Vinext/Cloudflare Worker application. It is NOT a static Netlify drop-in export.
- Build with pnpm build.
- Configure your Worker host for the server output and assets emitted by the project.
- Add the settings from .dev.vars as private runtime secrets. Never publish them inside assets, source archives or hosting.json.
- Preserve existing AI provider/encryption settings if moving from an existing installation.
- Confirm /api/health, submit a test consultation, sign in at /admin, save a draft, publish it, and test a media upload.
- Move the domain only after importing any required old D1/R2 data.

The uploaded .openai/hosting.json retains its original project identity; it does not grant access to or publish that old project. A new host needs its own project configuration. D1 and R2 compatibility remains available when STUDIO_DATABASE is not set to supabase, which allows a controlled rollback.

## Verification
Run:
- node tools/test-supabase.mjs
- node tools/test-cms.mjs
- node tools/test-enquiries.mjs
- node tools/test-admin-password-only.mjs
- node tools/test-platform.mjs
- node tools/test-production.mjs
- pnpm build

The live Supabase query gateway was tested under the service_role database role in a rolled-back transaction for read, draft save, revision insert and publication. Anonymous/authenticated gateway access was checked and denied. A live REST check also passed for public content, health and the database rate-limit upsert. The production build and the listed test suites passed. Browser visual QA could not be completed because the managed preview URL failed to connect; final visual verification on your hosting environment remains required.

## Future development
New SQL templates added to the CMS must be registered in veloryz_studio.query_contracts, keyed by the SHA-256 of the exact original query. Register changes with a new migration. Keep each batch in one RPC call to preserve transaction atomicity. Do not expose a general SQL-execution endpoint.

Payments continue to use individual provider links and manual studio verification. No payment gateway settlement or automatic payment verification was added.
