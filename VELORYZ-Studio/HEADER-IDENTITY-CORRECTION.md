# VELORYZ Studio — Original 3D V preserved + official header wordmark

**Master source:** `VELORYZ-Studio-Motion-Upgrade-8(1).zip`.
This edition builds on the previous *motion-only / original UI* release. It does not incorporate any redesigned homepage.

## Explicitly preserved from the original source

- Original **interactive 3D V** on the homepage, with drag/rotate, camera, material and replay controls.
- Original **Motion Playground 3D V**, including its orbit/ribbon/mark modes, interaction controls, and original model materials.
- Original `veloryz-logo.glb`, `study-ribbon.glb`, `study-orbit.glb`, `veloryz-mark.svg` and `veloryz-original.png` (each byte-for-byte unchanged from the user's original ZIP).
- Original authored V imagery in the sculpture fallback, assembly scene, identity study, calls to action and service artwork. The unintended global substitution to the official profile icon was removed.
- Existing homepage layout, colors, typesetting, navigation, route handling, content management, bookings, enquiries, admin, and cinematic Frame Cut + looping scarf chapter.

## Updated only as requested

1. The **header's plain VELORYZ + Independent Studio treatment** is replaced by the approved VELORYZ **main dark-ink transparent wordmark**. The official logo is animated with a subtle intro, gentle hover/pointer parallax and a light sweep. It remains a normal accessible home link. Existing CMS-uploaded header logos retain override priority.
2. The small homepage label **“Independent creative & technology studio”** is retained, but the dot preceding it is removed. On desktop pointer hover, only the part of the lettering nearest the cursor fades. There is no effect on touch and no fading for reduced/paused motion.
3. Official favicon SVG/ICO and Apple touch icon, Lenis opt-in, Frame Cut and knitted scarf assets are retained.
4. The footer's original layout remains intact.

## Implementation

- `public/app.js` — scoped header logo branch, original V fallbacks restored and homepage label class added.
- `public/brand-polish.css` and `public/brand-polish.js` — scoped animation and local cursor-fade behavior.
- `lib/site-shell.ts` — includes the additional style and script after the existing files.
- `public/platform.js`, `public/campaigns.js`, `public/motion-ui.js` — restored the original self-made V icon references in supplementary artwork.
- `tools/test-original-v-preservation.mjs` — original model and artwork SHA256 preservation assertions.

## Verification

- Script syntax and browser previews checked. Layout screenshots taken at 1440, 1024, 390 and 320 widths; no horizontal overflow or uncaught page JavaScript errors.
- Preview interactions checked: official header asset loads, original homepage 3D scene/control markup and Playground scene/control markup remain present, the homepage cursor fade applies and resets, and dot is absent.
- The self-contained preview intentionally omits the external WebGL module loader, so it demonstrates the original SVG fallback rather than 3D rendering. The source's 3D assets and module loader are unchanged.
- Full build not verified here because project dependencies are unavailable; run dependency installation and `pnpm build` locally before deploying.
