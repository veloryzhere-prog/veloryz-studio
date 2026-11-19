# VELORYZ Studio — Motion + Identity Update Only

**Master source:** `VELORYZ-Studio-Motion-Upgrade-8(1).zip` supplied by the user.

This edition deliberately **keeps the master source's existing interface**. It is **not** a Beyond the Frame homepage redesign, and contains no `beyond-home.css` or `beyond-home.js` replacement.

## Scope

- Unchanged original homepage structure, hero, colors, typography, navigation, project grid, services, CMS, booking, owner/admin screens, backend/route logic and existing Motion Playground.
- Added a self-contained cinematic chapter immediately **after the original hero** (before the existing manifesto). The first 62% of its scroll timeline reversibly scrubs the approved **3.0-second V/portal reveal**. The remaining 38% displays the **7.4-second looping knitted scarf** (1440×810, 30 fps) with accessible pause/play control.
- Added the official six identity PNGs (profile and main-wordmark, transparent/dark/navy variants), two optimized wordmark WebPs, official favicon SVG, favicon ICO, Apple touch icon. The default icon/fallback assets in the existing UI now use the approved profile emblem; the original text labels and layouts remain intact. User-uploaded CMS logo overrides are still respected.
- Added an **optional desktop Lenis** smooth-scroll initializer only for enabled/full motion and fine-pointer devices. It loads the pinned Lenis library on demand. If unavailable, the existing native scrolling and original visual-motion choreography continue to work. Touch and reduced-motion remain native.
- Existing route transitions, micro-motion and studio motion preferences still apply. No house/room/3D footage was added.

## Main files added

- `public/frame-cut.js`, `public/frame-cut.css`
- `public/smooth-scroll.js`
- `public/assets/frame-cut/` (both original video files and posters)
- `public/assets/brand/official/` (approved identity files)
- `public/favicon.ico`, `public/assets/favicon.svg`, `public/assets/apple-touch-icon.png`
- `tools/test-frame-cut.mjs`

## Verification

- Original homepage and route templates match the uploaded archive **exactly** after normalizing just the deliberate logo URL replacements and the one inserted cinematic section.
- Original CSS files and untouched infrastructure code are preserved byte-for-byte.
- Source manifest verified, 288 total tracked files.
- `tools/test-frame-cut.mjs`, `test-motion.mjs`, `test-visual-motion-v4.mjs`, `test-motion-lab.mjs`, CMS, booking, admin security and platform regression suites passed in the available runtime.
- Browser screenshots confirmed the original desktop and mobile UI and the scarf visual. Full multi-breakpoint automated browser checks were incomplete due to the restricted browser environment.
- **The complete production build was not verified**, because the required npm dependencies are not installed here. Do not treat this as a deployment. Run the actual build in your local environment.

## Run locally

Install Node.js >=22.13 and the project package manager, then run from `VELORYZ-Studio`:

```bash
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Open the local URL printed by the development server. Some backend or admin pages require your own existing private configuration as documented in `START-HERE.md`. No existing private configuration should be uploaded into a public ZIP.
