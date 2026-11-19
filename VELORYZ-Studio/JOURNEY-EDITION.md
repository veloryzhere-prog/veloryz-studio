# VELORYZ Studio — Journey Edition

This release builds on Motion Lab. It adds a scroll-driven project story and replaces the basic project calculator with a guided brief. Existing logo models, motion preferences, concepts, CMS and Supabase workflows are retained.

## Explore
- Homepage: the new illustrated project journey replaces the short process grid.
- /journey/: a dedicated presentation of the five stages.
- /create/: the new three-step guided planner.
- /book/: the existing consultation form receives the reviewed brief.

## The project story
Five stages — Sketch, Structure, Design, Build and Review — change the browser composition as you scroll. The presentation uses perspective, layered layouts, transitions and a final Aryan Raj Singh creator signature.

Desktop uses a sticky visual beside the readable chapters. Mobile uses selectable stages and one chapter at a time. Reduced/paused motion preserves the content and stage controls without animated transitions.

The interface study and checklist are explicitly illustrative. They are not verified client outcomes, a live deployment status or a claim that all launch checks have already been completed.

## The guided planner
1. Direction: choose a project purpose and core page count.
2. Scope: choose features, identify prepared materials and express a timing preference.
3. Review: check the summary, add a meaningful project goal and continue to consultation.

The sidebar shows an illustrative planning range with visible assumptions. Pricing uses the chosen catalogue reference or a matching category; otherwise the illustrative base is ₹17,999. It retains the previous calculator's ₹1,500 per additional page and ₹2,500 per selected feature allowances. The new upper end adds a 25% scope contingency rounded up to ₹500.

This is not a quotation, payment request or promise of a particular integration at a fixed price. Complex workflows require separate scope review. Hosting, licenses, provider subscriptions and taxes are excluded. Prepared materials do not automatically change the estimate.

Choices and the project goal are saved in this tab's session storage when available. Clear draft clears the answers. No contact details are collected in the planner. The brief is sent to the studio only after the visitor submits the existing consultation form. It can also be downloaded as a local text file.

The generated brief is bounded to fit the enquiry service's 2,000-character message limit. The goal must contain at least 10 characters and no angle brackets/control characters.

## Source
- public/planner-model.js: shared, DOM-free state normalization, pricing and brief formatting.
- public/platform.js: guided planner templates, summary and consultation handoff.
- public/app.js: project story and /journey/ page.
- public/journey-planner.js: wizard progression, local drafts and responsive story behaviour.
- public/journey-planner.css: responsive story and planner styling.

Edit illustrative planning allowances in public/planner-model.js, and update the visible assumptions in public/platform.js if those business rules change.

## Run and verify
Follow UPGRADE-AND-SUPABASE.md for initial local configuration. Existing private runtime settings can remain in place. Run pnpm install --frozen-lockfile, then pnpm dev.

Run pnpm test:journey for planner/story logic, motion preferences and production response checks. The guided-planner test also exercises step visibility, validation, focus/status behaviour, draft preservation, compact/desktop story states and consultation navigation against a DOM adapter.

The production build and the existing CMS, enquiry, login, platform/payment, campaign, model and Supabase-adapter tests passed. No new database migration is required.

## Verification and deployment limits
The browser could not connect to the managed preview again during this release. Real desktop/mobile visual review, sticky behaviour, keyboard interaction in an actual browser and GPU performance remain unverified. The automated controller and rendering tests do not replace those checks.

The source has NOT been deployed to the original website. That hosting project remains inaccessible here. Use the existing deployment and old-data migration notes before publishing to a live host. No live Supabase records were changed for this UI release.
