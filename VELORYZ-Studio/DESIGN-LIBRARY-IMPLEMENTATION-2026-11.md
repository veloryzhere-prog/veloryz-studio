# VELORYZ authentic open-source design library — 23 November 2026

## What the studio now serves

This release replaces the generic generated concept screens with **real upstream source media and actual MIT-licensed website HTML** wherever it has been imported. Each design has a same-origin detail URL under `/design/{slug}/`. The top navigation, “Made with VELORYZ” source-viewer watermark, device-size controls, source/author/license details and “Create with VELORYZ” CTA belong to VELORYZ; the underlying code/visuals remain credited to their original creators.

| Entry group | Quantity | Viewer behavior | Status |
|---|---:|---|---|
| Original VELORYZ HTML templates | 12 | Real existing first-party generated HTML under `/template-previews/{id}.html` | Locally runnable |
| Imported open-source source sites | 11 | **Actual upstream HTML** under `/design-source-previews/{id}/index.html` loaded in a sandboxed iframe | Locally staged; some source dependencies/media load from upstream domains |
| Remaining researched sources | 99 | Actual publisher screenshot when verified, otherwise clearly labeled repository cover or no-media notice; optional verified official live demo within wrapper | Not all cloned or deployable |
| Existing CMS inspirations | Published entries | Existing published reference image; source rights disclosed | Reference only |

The source catalogue has 110 external records in 16 niches plus the 12 original VELORYZ templates. It is wrong to describe the 110 records as 110 installed production websites. Some records describe **libraries, frameworks, backends, design collections or GPL/AGPL/proprietary products**, not standalone static websites. Those require project-specific imports, dependencies, legal assessment and deployment.

## The eleven imported real designs

These copies are based on actual upstream MIT website source, and each staged site includes the original `LICENSE` and `README.md` (8B sites additionally include `CREDITS.md`).

| Category | Website | Upstream author | Asset mode |
|---|---|---|---|
| Creative agency | Sillage — Creative Agency | 8B | Original HTML/JS/CSS; remote Unsplash photos / fonts, detailed CREDITS.md |
| Design studio | Onda — Design Studio | 8B | Original HTML/JS/CSS; remote photos/fonts with credits |
| Architecture | Midblock — Architecture | 8B | Original HTML/JS/CSS; linked original media |
| Coworking | Isoline — Coworking | 8B | Original HTML/JS/CSS; linked original media |
| Restaurant | Ombrelle — Restaurant | 8B | Original HTML/JS/CSS; linked original media |
| Restaurant | Grilli | codewithsadee | Original HTML, upstream-hosted relative CSS/JS/photos (base URL) |
| Editorial | Wren | codewithsadee | Original HTML, upstream-hosted relative CSS/JS/photos (base URL) |
| Agency | Agency | Start Bootstrap | Original dist HTML, upstream GitHub Pages styles/assets |
| Personal portfolio | Freelancer | Start Bootstrap | Original dist HTML, upstream GitHub Pages styles/assets |
| Cinematic SaaS | Lumen | Vantle/MiddleSugar7000 | Original HTML, upstream GitHub Pages linked CSS/Three.js/assets |
| Product launch | Volt Arc | Vantle/MiddleSugar7000 | Original HTML, upstream GitHub Pages linked photos/JS/media |

Other repo entries use actual README screenshot URLs where available; a GitHub OpenGraph cover is **not** misidentified as a screenshot. User-visible source labels distinguish these cases.

## Route and security controls

- `public/veloryz-open-designs.json`: catalogue, upstream screenshot URL, original demo URL, license classification, importStatus and `localSource` allowlisted path.
- `lib/design-detail-page.ts`: server source resolver allows only predeclared `/design-source-previews/{id}/index.html` when `importStatus=real-upstream-html`, or original first-party template builds.
- `public/veloryz-design-preview.js`: embeds real local or independently hosted upstream content using `sandbox="allow-scripts allow-forms"` **without allow-same-origin**. External sites that forbid embedding can be viewed as publisher screenshots. Never relay authentication tokens to iframe scripts.
- `public/veloryz-open-library.js/.css`: responsive images, original-source badges, niche filters, paginated results and intersection-observed scrolling transitions; CSS `animation-timeline:view()` where available, with reduced-motion support.
- `public/creator-v4.js`: project creator shows source thumbnails and links to the same in-house viewer. It passes the selected design/source into the project brief. No automatic claim that software and image redistribution rights are cleared.
- Existing checkout is a request/proposal workflow, **not** a completed e-commerce sale or transfer of third-party licenses.

## Important upstream rights

The MIT license of a repository is not necessarily an MIT license for external imagery, fonts, third-party scripts and customer-specific content. Preserve the source's `LICENSE`, `README`, `CREDITS` and any included author notices in redistributed material. 8B photo credits list separate Unsplash licenses. Do not rebrand the original design as solely authored by VELORYZ. The watermark means “previewed/assisted by VELORYZ Studio”.

Restricted/no-license/CC BY-NC/Commons-Clause inspirations remain references; they are **not** installed as licensed source products. GPL/AGPL project adaptations must comply with their obligations and may require source disclosure.

## Verification

```bash
cd VELORYZ-Studio
node tools/test-expanded-design-library.mjs
corepack pnpm exec tsc --noEmit
corepack pnpm build
```

Check direct routes and refresh, all eleven imported desktop/mobile pages, scroll-gallery motion on real images, 320/390/768/1440 responsive views, iframe isolation, reduced-motion, source credits, image loading from GitHub/CDN, and create-project selection.

Remaining work for a true 110-site offline library: audit each repo's exact pinned commit/license, identify a runnable website target, install dependencies in an isolated build, pin/archive assets under their rightful licenses, deploy each separately (including databases/APIs), generate screenshots from the **running actual source**, add preview route and CI, and mark `importStatus` only once tested. Static component packages and repository lists cannot honestly be presented as standalone live websites.
