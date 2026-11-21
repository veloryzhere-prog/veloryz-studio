# VELORYZ Studio — Original Template Store / Operations

Release: 2026-11-21. Source: `veloryzhere-prog/veloryz-studio` / `VELORYZ-Studio`.

## Template collection

Twelve original VELORYZ front-end website starters, each with a responsive standalone live showcase, functional client-side interactions (where appropriate), original vector product cover, and private source fulfillment ZIP:

| ID | Design | Category | Front-end source license (INR) |
| --- | --- | --- | --- |
| studio | The Practice | Business | ₹7,999 |
| edit | The Edit | Ecommerce | ₹10,999 |
| works | Selected Works | Portfolio | ₹8,999 |
| collective | The Collective | Agency | ₹14,999 |
| saas | Launchpad | SaaS / platform | ₹16,999 |
| gather | Gather | Restaurant | ₹8,999 |
| personal | Independent | Portfolio | ₹7,999 |
| book | The Appointment | Business | ₹9,999 |
| journal | Paper & Ink | Editorial | ₹8,999 |
| together | Common Ground | Community | ₹12,999 |
| learn | Open Classroom | Education | ₹11,999 |
| product | New Territory | Custom App | ₹18,999 |

**These are published catalog listing prices, not automatically charged or final custom-development quotes.** Any taxes, production hosting, CMS, payment gateway, account systems, custom media or integration costs are separately confirmed. A source-license order is an enquiry until approved and paid.

## How storefront purchasing works

The public `/design/` (also `/designs/`) page shows the current original collection. Customers search/filter/sort, inspect the full interactive `/template-previews/{id}.html` site, switch desktop/mobile in a preview, add templates to a persistent bag, and submit a **purchase request**. The bag references authoritative catalog prices and sends a `kind=project` enquiry via the site's existing `/api/enquiries` endpoint, which creates a reference in Studio Control's Enquiries inbox. The checkout never collects payment credentials and never claims to have processed a payment or delivered a license.

The purchase request confirmation is provided only when the backend confirms saving an enquiry. After receiving it, the Studio team must verify scope, invoice and payment, and agree licensing in writing. The store should not call this a paid checkout until a provider-confirmed payment integration and audited fulfillment workflow exist.

## Actual source fulfillment

The production/build process runs:

1. `node scripts/build-template-gallery.mjs` — generates 12 browser-ready standalone showcase HTML pages in public/template-previews, original SVG covers in public/template-covers and JS/JSON product catalogs in public.
2. `node scripts/build-template-kits.mjs` — generates **12 genuine standalone ZIP source kits** under `private/template-kits`, which is outside the publicly served directory and should never be committed or made available through the public web root. Each kit includes portable index.html, styles.css, interactions.js, README.md and LICENSE.txt. The kits are for approved internal fulfillment only.
3. `node tools/test-template-store.mjs` — validates all live showcases, responsive scripts and packages.

Original templates use CSS gradients, procedural vector compositions and code authored for VELORYZ. No third-party marketplace templates, screenshots or creator assets are passed off as VELORYZ work. Demo names, metrics, items, bookings and transactions are illustrative; they must be replaced or integrated before being presented as live business operations.

**Rights:** The included commercial license, after verified purchase, permits customization and deployment on one end-product website. Reselling the underlying template or making a competing product is prohibited; the source is *not* public domain or automatically copyright-free. Do not assert exclusivity or transfer of ownership without a separate signed agreement.

## How Create Project uses the same products

The project wizard offers the same twelve original entries and live previews; it reads `?template={id}` links from the storefront, preselects the matching template, and continues its normal guided brief flow. The source template price is shown separately from any custom-build planning estimate; selecting a direction creates no payment or reservation.

## Keeping products up to date

Canonical product descriptions, categories, prices and themes: `scripts/template-products.mjs`.
Original showcase compiler: `scripts/template-showcase.mjs`.
Design and functional UI: `public/template-preview.css`, `public/template-preview-runtime.js`.
Storefront: `public/template-store.js`, `public/template-store.css`.
Run `pnpm build:templates` to regenerate all assets and private archives. Change and redeploy catalog prices only from an authorized repository change. Protect private purchase/license records; never expose customer delivery files in `public`.

## Release QA

Test the live route, all 12 preview files, template mobile interactions, sample commerce/cart (demo-only), article search, booking demo (not submitted), bag and filters, actual backend order reference, Create Project template preselection, reduced motion, keyboard access and CI build results. CI tests do not prove the hosting provider published the latest commit; verify the actual production deployment separately.
