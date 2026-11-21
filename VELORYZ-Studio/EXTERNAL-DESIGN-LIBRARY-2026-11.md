# VELORYZ Studio — Curated Real-World Design Library
Release: 21 November 2026

## Purpose and provenance
The public design library at `/design/` now uses third-party design references instead of presenting twelve variations of the same original VELORYZ presentation engine. The old in-house HTML showcase generator is retained in source for historical internal use; the public design store and the Create Project inspiration gallery now display the curated CMS catalogue instead.

This is an **inspiration and custom-implementation request library**, not an inventory of third-party source code owned by VELORYZ. Each reference includes its original name, creator or provider, source page, image, category, summary, suggested custom-build planning price, and rights notice. Do not copy a source website or brand without appropriate rights, and do not sell or deliver proprietary third-party template source as VELORYZ work.

## User experience
- `/design/` and `/designs/`: distinct cards from the published CMS catalogue; category filters; text search; sort; screenshot previews; original source links; modal external website view with desktop/mobile widths; Create Project handoff. External sites can block iframe embedding. "Open original" remains the supported fallback.
- `/`: selected-work section replaced with **exactly three** clearly identified independent design examples: Agentura motion studio, Linear SaaS platform, Anon ecommerce. These are *references*, not client projects.
- `/create/?reference=ID`: opens the project wizard and saves the selected design's name, provider, source and URL as inspiration. The customer receives a project-scoping request, not third-party intellectual-property ownership or a purchase confirmation.
- `/work/`: original VELORYZ portfolio and historical project information remain separate. The homepage original brand mark, 3D V sculpture, scarf animation, and global scroll system are not changed by the library update.

## Source of truth and admin
Published CMS data: `state.catalogue`, using existing Studio Control > **Design catalogue** and normal **Save Draft → Preview → Publish** workflow. Admin can change individual IDs, names, category, description, screenshot URL, provider, source URL, demo URL, licence notes, price estimate, timeline, scope, and visible/enabled status. Existing protected CMS permissions and publication remain unchanged. Up to 40 entries are supported by the existing CMS validator. Do not treat the CMS field named `price` as the original template owner's checkout price: this is a VELORYZ *custom-development estimate* to be agreed before work begins.

The defaults in `lib/defaults.json` provide the twenty-entry seed. `lib/cms-api.mjs` migrates only the legacy default four-entry catalogue and preserves subsequent admin edits. Both public galleries use the same live state. The original 12-source-template price list and original catalogue are no longer the displayed public store.

## Preview availability and external dependencies
- `demo` is the remote destination for the inline preview and original tab. Some records point to an actual deployed example, and some to the creator's marketplace listing. An individual live demonstration is **not guaranteed** for a marketplace listing.
- External sites may set X-Frame-Options or CSP to disallow embedding, require login, change their content, or be removed. The source link should still be provided; maintainers must periodically check availability and licensing.
- `image` defaults to an independent screenshot from WordPress mshots at `https://s.wordpress.com/mshots/v1/...`. The screenshot provider may fail or be slow. An admin may replace each record with a licensed uploaded screenshot or another controlled image.
- The library does not scrape, clone, download, export, or transfer code or assets from any external website.
- A published reference is not a statement of endorsement, official partnership, or project authorship.

## Source files
- `public/external-design-library.js` — catalogue, filter/search/sort, preview modal, homepage highlights, route handoff.
- `public/external-design-library.css` — responsive cards, controls, modal and homepage displays.
- `public/creator-v4.js` — Create Project design inspiration selector and URL handoff.
- `public/app.js` — homepage selection.
- `lib/site-shell.ts` — script and style wiring.
- `lib/defaults.json`, `lib/cms-api.mjs` — default catalogue and migration.

## Acceptance and operational checks
1. Start a local preview or deploy a tested revision; visit `/design/` on desktop, tablet and small mobile widths.
2. Confirm all cards have different URLs. Check each remote preview as an individual user session; use the "Open original" fallback for blocked embeds.
3. Check filters, search, sorting, keyboard focus, Escape to close, image loading and reduced-motion preferences.
4. Verify the homepage displays exactly three different source examples, with accurate external-reference labels.
5. Open `/create/?reference=agentura-motion` and verify the source URL appears in the project brief.
6. In Studio Control > Design catalogue, change a description, save draft, preview, and publish. Verify the change on both `/design/` and `/create/`, then undo if testing on production.
7. Check that the original V mark, motion playground, scarf animation, AI help/documentation, support flows, and admin login remain intact.
8. Review each third-party marketplace licence before quoting resale or adaptation; never infer free commercial redistribution.

## Deployment status
Changes to this feature have been committed to the GitHub main branch. CI and source syntax checks can be inspected in GitHub Actions. A committed change does **not** prove a production deployment or successful remote iframe rendering. Validate the deployed site and external providers separately.
