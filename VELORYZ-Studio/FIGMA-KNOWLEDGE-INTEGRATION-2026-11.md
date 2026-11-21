# VELORYZ Studio — Figma Make Knowledge Integration

**Source:** User-provided `VELORYZ Living Knowledge System.zip` — Figma Make React/Vite export  
**Integration location:** `VELORYZ-Studio/` on `veloryzhere-prog/veloryz-studio`  
**Scope:** `/docs/`, `/help/studio/`, `/docs/studio/`, article readers, `/sitemap/`, `/sitemap.xml`  
**Release date:** 2026-11-21

## What was actually imported

The export is a source-code snapshot of a Figma Make design, **not an editable connected Figma canvas**. The repository retains its existing app framework, actual content and CMS rather than replacing them with an isolated demo.

The original `src/assets/future-assets` folder contains **100 SVG motion illustrations**. All 100 were imported individually into `public/assets/future-assets/{category}/{filename}.svg`, preserving file contents, internal animations and `prefers-reduced-motion` behavior. Their metadata is indexed in `public/assets/future-assets/catalog.json`.

Asset families: ambient, help, sitemap, documentation, media, navigation, loading, status, interaction, transition (10 SVGs each).

The applied design uses the original export's warm white (`#F8F9F7`), navy (`#111C32`), cyan (`#23BDE6`), cobalt (`#4267E8`), and editorial Manrope/DM Mono/Playfair font direction with system-font fallbacks.

## Branding and content safeguards

The Figma export included a **generic V logo placeholder**. The deployed-site integration does **not** use that mark. Knowledge sidebars, the interactive sitemap hub, and article navigation reference the site's existing `/assets/brand/official/Main-Dark-Ink-Transparent.webp` wordmark. The homepage hero and self-made 3D V motion artwork are unchanged.

Existing CMS integrations remain in place. The 121 Studio docs, 20 Help articles and 11 service guides retain their routes, content, draft/publish workflow and internal references. The new visuals are applied as decorative elements, with empty alt text and reduced-motion fallbacks.

## XML sitemap clarification

The browser message **"This XML file does not appear to have any style information associated with it"** is usually an informational display notice, not an XML validation error. The XML sitemap remains machine-readable at `/sitemap.xml`, and its response now includes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
```

`public/sitemap.xsl` presents the XML in a branded, responsive list for browsers supporting XSLT. It is purely presentational. The canonical human-friendly interactive sitemap remains `/sitemap/`, with search, clusters and filter controls. Crawlers still receive the standard sitemap namespace.

## Production assets and scripts

- `public/knowledge-v4.js`: site navigation, search, article reader and Figma asset integration
- `public/knowledge-v4.css`: core knowledge UI
- `public/knowledge-figma.css`: Figma source visual theme and unified article reader
- `public/assets/future-assets/**`: 100 imported original SVGs
- `public/assets/future-assets/catalog.json`: asset registry
- `public/sitemap.xsl`: readable XML stylesheet
- `lib/site-shell.ts`: activates the new stylesheet
- `lib/page-handler.ts`: XML stylesheet processing instruction
- `tools/test-documentation.mjs`: regression assertions for assets, article routes, brand and sitemap

## Verification and deployment

Code-level tests verified JavaScript parsing, article-route rendering from the existing 152-guide index, reference paths for displayed SVGs, manifest counts and XSL tag balance. These tests are **not** a substitute for a clean CI build and a production browser run.

Verify the live host after deploy: `/docs/`, `/help/studio/`, `/docs/studio/`, representative nested articles, `/sitemap/`, `/sitemap.xml`, `/sitemap.xsl`, one sample SVG URL and the protected CMS draft/publish workflow. Confirm the official logo and historical motion art have not changed.

The design export is adapted into the repository; a remote Figma cloud file itself has **not** been edited because the provided source was a ZIP export, not a Figma Design URL.

## Ownership / maintenance

Keep Studio-controlled brand assets distinct from decorative SVGs. Before adding further animated graphics, test actual mobile performance, reduced-motion support and colour contrast. Verify external fonts against deployment CSP rules and retain fallback font stacks. Avoid turning editorial design placeholders into unsupported product claims.
