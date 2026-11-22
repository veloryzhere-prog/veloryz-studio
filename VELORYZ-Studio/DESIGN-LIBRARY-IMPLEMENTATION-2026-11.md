# VELORYZ Design Explorer — 23 November 2026

## Purpose

This change makes each design card open a **VELORYZ-hosted URL** such as `/design/os-grocery-and-delivery-grocergo/` instead of opening the third-party website. The full `/design/` gallery is organized by niche and source-clearance status and links into `/create/`.

It is intentionally **not a bulk copy of 110 repositories**. The new catalogue records third-party sources, their current research classifications, categories, and rights notices. A displayed motion effect or landing page is an **original VELORYZ concept demonstration**, not the linked project's original UI/source and not an assertion of upstream authorship. This distinction must remain visible to customers.

## Inventory / authoritative data

| Group | Count | Preview | CTA |
| --- | ---: | --- | --- |
| Original VELORYZ templates | 12 | Actual first-party prebuilt HTML demos at `/template-previews/{originalTemplateId}.html` in a same-origin framed viewer | `/create/?template={originalTemplateId}` |
| Research catalogue (external repos/tools) | 110 | Original VELORYZ category-based interactive concept preview | `/create/?reference={catalogueId}` |
| Existing CMS-managed inspiration entries | Up to 40 by current CMS validator; seed contains 20 | Original VELORYZ category-based concept preview with published source metadata | `/create/?reference={cmsId}` |

The catalogue JSON is `public/veloryz-open-designs.json`; `items[]` is the third-party research catalogue and `originals[]` is the twelve original product templates. CMS references remain governed by `lib/defaults.json` and published `state.catalogue`, and are merged on the client; no unpublished draft items are exposed.

## Routes and implementation

- `lib/page-handler.ts`: intercepts safe `/design/{id}/` paths, resolves only IDs in the catalogue or published CMS and returns a secure, index-excluded HTML page. Injects the 122 static records into the main gallery and create pages to support direct/refresh project URLs.
- `lib/design-detail-page.ts`: server-rendered branded VELORYZ design detail with source and license information, original VELORYZ watermark and local project creator CTA. It **does not fetch, proxy, embed or copy remote websites**.
- `public/veloryz-design-preview.{js,css}`: first-party interactive ecommerce, grocery/delivery, project management, agency/portfolio, dashboard, editorial, travel/hospitality, jobs, community, healthcare, logistics, education, real estate and motion components concept UI. Only the twelve original VELORYZ starters open genuine local template demos.
- `public/veloryz-open-library.{js,css}`: searchable, paginated, niche- and rights-filterable catalogue, enhanced original-branded card artwork and local preview links. Uses `window.VeloryzExternalDesignLibrary` and the existing SPA `designPage` integration. The old unrelated catalogue/store files are preserved.
- `public/creator-v4.js`: uses the same consolidated library, directs its thumbnail previews internally, maps new niches to creator purposes and retains the selected reference in a brief.
- `public/reference-site-upgrade.js` and `public/claude-reference-enhancements.js`: homepage slides and cards link to local detail URLs.

## Licensing and attribution

- **Original** means built by VELORYZ, with the original template's one-project license terms.
- **Source candidate** means potentially permissive code with rights **not yet cleared**. Do not treat a metadata classification as a legal license review or asset clearance.
- **License review** means unknown, split or additional terms require inspection.
- **Reference only** means restricted, proprietary, license missing or noncommercial. Do not distribute or rebrand upstream code/assets without permission.
- MIT/BSD license requirements and original author notices must be retained when creating actual derivative source kits. Third-party images, trademarks, fonts, datasets and subdependencies need separate review. GPL/AGPL obligations apply when relevant.
- Do not make false claims like `built by VELORYZ` about upstream projects; VELORYZ branding and `Made with VELORYZ` denote **our original demo and project service**, not upstream intellectual property.
- Customer-facing "Create" routes collect a project brief, not a payment, license transfer or completed source download.

## How to add fully imported templates later

For each candidate: verify the **exact upstream commit**, license and source assets; request permission where necessary; create a distinct *first-party licensed derivative* in its own directory; remove or replace the original branding with licensed VELORYZ assets without erasing author/notice files; implement responsive interactions, reduced-motion and accessibility; run real build/CI; write deployment/fulfillment instructions; and only then change `importStatus` / `previewType` from `catalogued` / `veloryz-original-concept` to a verified local import. Do not switch those metadata fields on the basis of a screenshot.

The existing live payment flow remains a pre-invoice request; third-party products are not sold by this change.

## QA

```bash
cd VELORYZ-Studio
node tools/test-expanded-design-library.mjs
corepack pnpm exec tsc --noEmit
corepack pnpm build
```

The PR workflow `.github/workflows/veloryz-documentation.yml` runs the new design-library regression suite plus existing checks. Verify `/design/`, direct `/design/{id}/` navigation and browser refresh, original and external project handoff, 320/390/768/1440 widths, generated original source previews, keyboard navigation, reduced motion and screen-reader descriptions. Run production browser QA after deployment. **Passing static checks does not prove production publishing or full source-kit installation.**
