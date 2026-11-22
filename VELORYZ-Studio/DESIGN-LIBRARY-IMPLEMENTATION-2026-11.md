# VELORYZ Studio — Design Collection Refresh
Updated: 23 November 2026

## Product goal

The public site presents a cohesive creative studio design collection, while preserving exact original GitHub HTML sources where imported. Main design pages no longer show technical GitHub status, license-disclaimer paragraphs, raw repository links, or broken “Try original live demo” buttons. Do not misrepresent third-party source ownership: required notices remain unchanged and accessible through a separate legal directory.

## Public behavior

### https://veloryz.online/#design

The homepage's scroll-driven collection **no longer uses old published CMS inspiration records**. The homepage route selects eleven real source HTML showcase designs, including 8B Studio, Sillage, Midblock, Ombrelle, Grilli, Wren, Lumen and others. The existing scroll clock and horizontal pinned gallery remain intact. Design cards open `/design/{id}/` on VELORYZ, and photos use the same-origin VELORYZ image gateway, with direct original-host fallback.

The separate homepage design-story page is also seeded with these real screenshots instead of the former synthetic placeholder graphics, and its detailed panel shows studio categorization rather than technical source metadata.

### https://veloryz.online/design/

The **110 reviewed third-party research references and 12 original Studio templates** remain catalogued; original CMS inspiration cards no longer appear in the public design library. They still exist in CMS/Admin for future review. Scroll behavior is IntersectionObserver-based, with a visible non-JS fallback and late initialization after SPA DOM insertion. Cards show genuine source-supplied screenshots, linked GitHub covers (when an actual screenshot does not exist) or a neutral availability message — no generated design mockups.

Gallery copy, niche filters, cards and CTAs now have a studio presentation. The “interactive” category accurately contains the 11 imported working HTML templates; other app/framework references are not silently represented as installed functioning websites.

### /design/{id}/

A redesigned VELORYZ frame provides device sizes, a reload button, fullscreen and a branded, clickable **Made with VELORYZ** badge. Clicking it opens a native accessible dialog describing Studio customization and linking to `/create/?reference={id}` and `/studio/`. The copy does **not** claim that imported third-party software originated from VELORYZ. The local HTML remains the upstream source with only asset-path and base URL adjustments to support same-site previews.

An original published image is shown when a complete HTML website was not imported. Broken external media degrades to a clear fallback; the visitor is not asked to click a nonfunctional external demo.

## Loading and navigation fixes

- **`/studio-preview-assets/{approved-id}/{path}`**: strictly allowlisted Cloudflare-side proxy for relative CSS, JS, fonts, original photographs, 3D assets and media in six imported HTML projects (Grilli, Wren, StartBootstrap Agency, StartBootstrap Freelancer, Lumen and Volt Arc). Assets are streamed from the actual upstream GitHub repository; there is an official GitHub Pages fallback if a file is unavailable. Unsupported extensions and unknown IDs are rejected.
- The six imported `index.html` files have their injected external `<base>` elements removed and relative asset references changed to local proxy paths, so internal `#section` links no longer jump to the external website.
- **`/studio-preview-images/{id}`** serves allowlisted gallery media from a static source record, with exact MIME checks, an image allowlist and cache headers. The browser may retry the original publisher image URL on failure.
- Imported iframe content remains under `sandbox="allow-scripts allow-forms allow-modals allow-pointer-lock"` **without `allow-same-origin`**, to keep third-party JavaScript away from VELORYZ auth storage and parent DOM.
- The listing's old visual blank-card bug is fixed by scheduling entry animations *after* the SPA inserts markup and by showing all cards by default if the animation never starts.
- CSS and JS asset versions are bumped to prevent clients mixing cached old HTML with new gallery scripts.

### Known limitations

The imported third-party applications may call authentication services, proprietary APIs, request storage or depend on remote fonts, frameworks or media that cannot be mirrored automatically. These limitations cannot all be solved by a front-end wrapper alone. Full production apps require independent deployments and legal approvals. Remote CDNs/iframes may remain inaccessible due to publisher policies or networking limits. Fallbacks preserve library usability without pretending that these third-party backend services are installed.

## Required legal acknowledgements

No LICENSE, README, or CREDITS files from any of the eleven imported projects have been deleted. The legal information is removed from the primary design viewing surface, but **`/legal/design-notices/`** remains a publicly accessible acknowledgement index, linked discreetly from every design preview and from the main library. The index links original publishers, software terms and included license notices where present. Some media, fonts and scripts are licensed separately from the GitHub source.

An admin-editable public attribution/licensing CMS is **not part of this release**. The Studio may add that later, but must retain all legally required notices.

## Verification

```bash
cd VELORYZ-Studio
node tools/test-expanded-design-library.mjs
pnpm exec tsc --noEmit
pnpm build
```

Regression coverage includes current catalog counts, all eleven HTML imports and their original licenses, safe image and asset routing, homepage curated-source population, editor output, clickable studio watermark, removal of technical source-copy and external-demo UI, SPA scroll timing, sandbox isolation and reduced-motion support.

Manual browser QA after deploy: homepage `/#design`, /design/, all eleven local /design/{id}/ routes, README image/CDN failure fallback, original #section links, desktop/tablet/mobile controls, Escape/backdrop dialog closure, navigation to /studio/, /create/?reference=, and /legal/design-notices/. Do not claim complete live-deployment verification without completing these checks.
