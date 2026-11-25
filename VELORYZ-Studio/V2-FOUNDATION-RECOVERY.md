# VELORYZ V2.0.0-alpha.1 — Foundation & Recovery

Status: **source checkpoint prepared; production release blocked pending backend and browser verification.**
Baseline: `0b4baac140c9ef135191a5d71aa83e9592235249`.
Recovery reference: `backup/pre-v2-20261126` (same repository, not an independent off-site backup).
Development branch: `v2/foundation`. Production `main` remains untouched.

## Protected experiences
| Experience | Current implementation | Required release regression |
|---|---|---|
| Hero V | `lib/claude-reference-shell.ts`, `public/motion-3d.js` | Original model, drag, keyboard, rotation, offscreen handling |
| Playground V | `public/app.js` logoStage('lab'), shared 3D engine | Original V selection and material/rotation controls |
| Capabilities | `public/capabilities-scroll-r34.js/css`, #hzs/#trk/#hbar | All five cards and shapes, scroll start/middle/end, mobile and reduced motion |
| Studio statement | #stmt in reference shell | Scroll-linked word reveal |
| Library | `public/reference-site-upgrade.js`, #vz-home-library-track | Scroll changes actual catalogue previews |
| Scarf | `public/frame-cut.js`, /assets/frame-cut/scarf.mp4 | Muted looping original animation; no new media |
| Journey | `public/reference-restored-features.js`, .vz-journey-stage | Five stages, scroll-driven presentation, real links |
| Motion Hub | `lib/motion-hub-page.ts`, `public/motion-hub.js/css` | Existing fourteen chapters, controls and popup |
| Reviews | `public/reference-review-loop.js` | Continuous published reviews, no fabricated feedback |

## Styling inventory
Reference homepage combines inline shell styles, reference-site-upgrade.css, motion-system.css, and the security-injected styles in this order: veloryz-silk-2026.css, veloryz-ui-2026.css, veloryz-brand-motion-r9.css, veloryz-experience-r20.css, reference-elegance-r5.css, reference-menu-morph-r6.css, reference-qc-layout-r7.css, home-editorial-r32.css, capabilities-scroll-r34.css. make-project.css and chat-experience.css are also injected. Do not remove legacy layers wholesale; inspect computed styles and motion dependencies in alpha.2 and alpha.3 before consolidating.

## Completed on development branch
- Exact founder portrait binary: public/assets/brand/founder-portrait.webp, 900 × 1125, 57,644 bytes; Git blob be10611b58d3e4ee220056411b43656cc4cb411f. Existing /founder/ page already references this path. AI-styled image, not a rigged 3D model.
- Public and shared chat interface cache keys updated.
- Hosted Workers AI fallback now uses R35 persona contracts and configured character temperature. It does not replace a successful hosted provider answer.
- Added `pnpm test:v2:foundation` for protected markup and asset checks, mocked scroll geometry, portrait integrity and persona contracts.
- 25 equivalent source/fixture checks run against the committed branch successfully. These are not a production build, browser or provider evaluation.

## Release blockers
1. Supabase hosted studio API last verified version 13 without R35. Previous deployment attempt was blocked; no credential changes or bypass. Deploy the reviewed canonical R35 backend through the authorized deployment workflow and test all five assistants with real inference, name skipping, language matching and follow-ups.
2. Full dependency installation/build and actual browser verification of branch not run in this session. Run `pnpm test:v2:foundation`, `pnpm test:all`, `pnpm build`; investigate failures, do not suppress tests.
3. Verify preview routes /, /founder/, /motion-hub/, /motion/, /create/, /design/, /docs/ and all protected interactions across desktop and mobile, including accessibility and touch.
4. Confirm deployment identifiers and production health before promoting. Preserve recovery branch. Database backup and independent repository backup are not performed in this checkpoint.

## Scope
No new design tokens, homepage redesign, schema changes, provider key edits, or production promotion. Release is not certified production-ready until the above gates pass.
