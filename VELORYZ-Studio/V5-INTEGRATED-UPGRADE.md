# VELORYZ Studio V5 — Integrated Engineering Upgrade

**Release type:** Implementation candidate, based on `VELORYZ-Studio-Readable-Motion-V4.zip` (18 November 2026).  
**Do not treat this as a verified production deployment.** No live Supabase, AI provider, checkout, external media, or hosting credentials were used.

## What this source actually changes

1. **Foundation & SEO:** trusted, configurable `PUBLIC_SITE_URL` with canonical and sitemap consistency, route-specific descriptions, canonical preservation during SPA navigation and noindex for noncanonical production hosts. `/robots.txt` and `/sitemap.xml` were already present and are reused.
2. **Unified design foundations:** semantic warm surface/text/border/focus tokens added to the existing V4 cascade; 44px minimum essential controls, readable form input and focus styles, darker AA-targeted CTA endpoints. Full legacy-CSS deduplication is **not** complete.
3. **Motion & performance:** keep V4 continuous ambient/scroll motion and the motion-first experience. Add accessible **Continue with reduced motion** route to avoid trapping motion-sensitive visitors. Defer the heavyweight 3D engine when full motion is not active; use reduced antialiasing and lower pixel ratio on low-end devices. Replace obsolete Vite 8 `inlineDynamicImports` with `codeSplitting:false` in the 3D build script.
4. **Mobile:** responsive, touch-friendly form/control refinements; all 21 public routes were tested at 390px in an isolated Chromium fixture.
5. **Portfolio trust:** explicitly label the project status and illustrative nature of project artwork in case-study dialogs. No invented clients, dates or outcomes have been added.
6. **Sales workflow:** the three-step planner now downloads an **unapproved proposal outline** with an illustrative estimate, scope, milestones and a clear requirement for human review. Existing enquiries/bookings/payments remain unchanged.
7. **CMS & admin:** protected `GET /api/admin/quality` audits draft content for missing evidence, weak copy, unsafe destinations and incomplete catalogue items. A **Review site content** button appears in the owner overview. The existing version history and restore workflow remain intact.
8. **AI relevance:** smarter intent scoring prevents a cost question mentioning a call from being treated solely as booking, and prioritizes troubleshooting before sales language. AI prompts now avoid irrelevant price catalogue injection for casual greetings. Existing five personas, contextual help and verified route links are preserved.
9. **Consent-based local insights:** optional on-device counters and LCP/CLS buckets, OFF by default, with in-browser export and erase. These **do not** transmit data or provide studio-wide analytics. This is an honest privacy-first baseline, not a replacement for full first-party analytics.
10. **Security and operations:** add a conservative response security header, source/asset guard tests, V5 verification scripts, stricter release assets and a GitHub Actions pipeline for frozen install, typecheck, lint, tests and production build.

## How to run (Windows PowerShell)

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

The 3D source compiles as part of `predev`/`prebuild`. Use Node.js 22.13 or newer. The first install requires network access. Restore private `.dev.vars` from your previous local project; it is never packaged. The intended public origin is `https://veloryz.online` and can be changed through `PUBLIC_SITE_URL` on the server.

## Tests to run after installing dependencies

```powershell
corepack pnpm test:v5
corepack pnpm test:all
corepack pnpm exec tsc --noEmit
corepack pnpm lint
corepack pnpm build
node verify-project.mjs
```

Existing source-level tests have been exercised in the build environment; framework build, typecheck and live runtime have not, because pnpm could not be fetched in that environment.

## What is not complete

- A fully authenticated, per-client portal with RLS-tested project/file separation.
- Live appointment availability, transactional email/WhatsApp notifications, CRM scheduling, payment webhook verification or automated invoice status.
- Studio-wide conversion analytics, centralized event storage or a consent-managed owner dashboard.
- Real internet research for visitor AI, long-term AI memory or authorized AI actions that submit customer data autonomously.
- Full production security audit of the live Supabase schema, backup restoration, dependency vulnerabilities, browser accessibility audit with assistive technologies and deployment rollback drill.
- Verified client case studies, new client results, field Web Vitals or cross-browser GPU measurements.
- Complete removal of conflicting old CSS stylesheets.

These require a staging environment, live provider integrations, security tests, customer permission and/or verified project evidence. Do not advertise them as working features until tested.

## Release/rollback

1. Keep a copy of the untouched V4 ZIP and the deployed version.
2. Deploy V5 to staging first, never directly to the live public domain.
3. Restore your existing private secrets into the staging runtime; do not share them in chat.
4. Run frozen install, typecheck, lint, production build, 21-route browser checks and live API tests.
5. Verify the studio authentication flow, the existing CMS draft/history, manual payment claims and the configured AI connection.
6. If staging fails, redeploy V4; this V5 source does not apply a database migration.

## Security

- API secrets and admin credentials must stay on the server; do not put them in `public/` or `NEXT_PUBLIC_` variables.
- `studio-insights.js` is opt-in local measurement only. It stores counters without PII and does not transmit them.
- The CMS quality report does not execute external links. Link availability and permission checks remain separate release tasks.
