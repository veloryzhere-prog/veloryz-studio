# VELORYZ Studio — Motion Lab

This source release extends Motion Edition with more original interface designs and interactive motion. It does not change your Supabase schema or publish the website.

## New UI
- /motion/ — a dedicated interactive motion playground, linked in desktop/mobile navigation and the footer.
- Three original concept previews on the homepage, design library and playground:
  - SPECTRA: expressive creative-studio layout with kinetic typography and an orbital composition.
  - NOVA: a lavender product-workspace visual with animated interface layers.
  - MUSE: a warm editorial objects layout with a sculptural product study.
- Each concept opens an enlarged, keyboard-accessible dialogue with a path to the existing project brief.
- These are labelled visual concepts. They are not client results or working product/commerce services.

## New interactions
- Front, Orbit and Explode views on the real 3D scenes.
- V mark, Ribbon and Orbital sculpture choices in the playground, sharing one renderer.
- A playground 3D speed control.
- A draggable, touch-friendly illustrative before/after study, with a native keyboard-accessible slider and reset.
- Orchid, Aurora and Ember atmosphere choices local to the playground.
- Design / Build / Move tabs with arrow-key, Home and End support.
- Staggered word reveals on page headlines.
- Browser-native page transitions where supported, with the existing route transition as fallback.
- Refined link underlines, pressed feedback, focused fields and additional ambient motion.

## Models and source
- public/assets/brand/veloryz-logo.glb
- public/assets/brand/study-ribbon.glb
- public/assets/brand/study-orbit.glb
- src/motion/study-models.mjs — new sculptures.
- src/motion/experience.mjs — scene lifecycle, camera and object controls.
- public/motion-lab.js — interactive comparison, previews, tabs, moods and headline motion.
- public/motion-lab.css — additional layouts, concepts and transitions.
- public/app.js — page templates.
- public/platform.js — design-library integration.

Rebuild procedural models and the locally bundled 3D runtime using pnpm build:motion. The main dev/build scripts do this automatically. No additional CDN or external 3D service is required. A small bootstrap loads the 3D engine only when the current route contains a scene.

## Start
Use the existing Supabase configuration described in UPGRADE-AND-SUPABASE.md. Run pnpm install --frozen-lockfile, then pnpm dev. Open the terminal's local URL and visit /motion/.

Keep your own .dev.vars settings. Credentials and installed dependencies are excluded from this source ZIP.

## Verification
Automated checks passed for:
- Comparison endpoints, clamping, reset and pointer-release behaviour.
- Mood selection and pressed states.
- Keyboard tab navigation, focus and reduced-motion handling.
- Validated concept-preview selection.
- Real 3D logo geometry and all three GLB export/import checks.
- The shared motion-preference system.
- Existing CMS, enquiries, password login, platform/payment, campaign and production-security tests.
- Production build.

The source geometry and application logic are tested. Browser visual verification and real-device GPU/frame-rate measurements remain unverified because the managed preview connection has not been available. Test the final layouts, mobile spacing, render appearance, keyboard focus and shader performance in your deployment environment before publishing.

## Accessibility and fallbacks
The existing Full / Reduced / Pause preferences remain authoritative. The comparison includes a real range input. Tabs support keyboard controls. A still SVG remains available when WebGL fails. 3D controls are hidden for unsupported rendering. New page transitions are skipped when reduced/paused motion is active.

## Deployment
This release has NOT been deployed. The original hosting project referenced in the uploaded source remains inaccessible in this account. The source still targets Vinext/Cloudflare Workers; it is not a static Netlify drop-in. Follow the prior deployment/migration notes before switching a live website.
