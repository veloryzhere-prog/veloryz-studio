# VELORYZ Design System 3.0 (R45)

## Scope
First-party studio interface only. The current homepage composition, official brand images, original V models, scarf, Motion Hub chapters, third-party preview HTML, business logic and database are retained. Existing component CSS is incrementally migrated to semantic tokens.

## Shared contract
`public/veloryz-design-system-r45.css` defines the common font, colors, control border and focus colors, radius, spacing and touch target. R42 layout repair, Creator/Support, Knowledge, Admin, Client and Library styles consume these tokens. Prefer these tokens for future components. Distinguish semantic status from brand accent. Do not apply blanket resets to embedded websites or WebGL.

## Quality gates
Run `node tools/test-design-system-r45.mjs` from VELORYZ-Studio. It tests token references, selected color pair contrast, shell integration and scoped accessibility contracts. It does not establish WCAG conformance. The existing Playwright visual QC now covers 320, 390, 768, 1024, 1440 and 1920px viewports. Review actual screenshots and interaction results; a successful CSS source test is not deployment verification.

## Change discipline
Keep R45 token migrations compatible with older styles via fallbacks. Consolidate redundant component CSS only after browser parity tests. Do not alter private data, workflow behavior or third-party license text as part of visual changes.
