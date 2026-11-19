# VELORYZ Studio — Readable Motion V4
**Release:** 2026-11-18  |  **Base:** VELORYZ Studio AI Mind Upgrade V3

## What changed
The original V3 warm theme and motion logic were retained; V4 adds one **last-loading public CSS layer** and a lightweight scrolling/ambient animation runtime. No AI-provider secrets, production database records or nonpublic credentials are included.

**Global UI:** clearer warm ivory/cream/sand backgrounds, dark charcoal foregrounds, larger desktop/mobile labels, body text, buttons, navigation and form fields. Footer and all platform links now have a readable light background. Section cards have a coherent light surface; illustrated comparison panels retain their intentional dark side but use bright foreground copy.

**High-impact bug fixes:** `remembered.` was invisible because its parent had background-clipped gradient text but the motion renderer split its letters into animated child spans. Gradient is now applied to the child text. Mobile `.project-art.render-art` was expanding beyond its grid; it is constrained to 100% of available width. The project planner (`.guided-planner` and `.guided-summary`) had near-black headings on dark-purple panels; those are now warm light panels with dark text. The founder mailbox note and motion-playground study links were nearly invisible; their font size and color were corrected.

**Motion:** a fixed, purely decorative five-part backdrop (grid, three orbital glass forms and light ray). Orbits animate continuously in Full mode. Scroll-linked offsets are smoothed with requestAnimationFrame and kept small (roughly ±23 px) to avoid jerky motion. Important cards and section headings reveal over approximately 760 ms as they enter the viewport. All of this obeys the existing `StudioMotion` Full/Reduced/Paused states; motion preference storage, onboarding, and the top-icon-first gate were not redesigned.

## Important files
- `public/visual-motion-v4.css` — final visual-theme/contrast/type/spacing cascade
- `public/visual-motion-v4.js` — scroll and ambient motion runtime
- `lib/site-shell.ts` — loads CSS and JS after the V3 styles and sets a warm browser theme color
- `tools/test-visual-motion-v4.mjs` — framework-independent V4 source assertions

## Verification performed
- Browser-rendered 21 public routes at 1440×900 and 390×844: **42 / 42 passed**, with **0 reported page JavaScript exceptions** and **0 horizontal overflow**.
- Captured **126 screenshots**: top, middle and bottom/footer for each public route at each width. Screenshot archive and contact sheets are supplied separately; screenshots are isolated browser renderings of actual project HTML/CSS/JS and local static assets, not images drawn by a generator.
- The critical gradient headline appears at both widths. The project planner and motion playground contrast changes were visually checked.
- In Chromium, background scroll offset changed from `0.00px` at rest to `17.49px` after scrolling 940px. Switching to Paused resets the offset to `0px` and pauses the orbital animation.
- Motion-first onboarding: initial main is inert; header motion button opens modal; only Full is enabled; accepting Full unlocks the page.
- Framework-independent Node tests passed for AI Mind, platform API, AI provider contracts, CMS, enquiries, password authentication, motion, motion lab, broadcasts, guided planner, Supabase gateway and V4 visual source assertions.
- Source integrity was checked with `node verify-project.mjs`.

## What is NOT verified
The isolated Chromium browser is blocked by an administrator policy from navigating to a local HTTP server, so tests used the same source HTML/CSS/JS loaded as an isolated page, with the local image assets substituted as data URIs and simulated API responses. **This is not a live deployment or WebGL performance certification.** The 3D runtime, authenticated admin, live AI-provider conversations, production database, payment processing and contact form submission require testing against actual localhost/staging services.

The extracted source does not include installed NPM packages, so `tools/test-production.mjs` cannot import `typescript` and `tools/test-logo-model.mjs` cannot import `three`. Run them after `pnpm install`. This is missing environment dependencies, not a demonstrated failure in either module.

The user-requested Full-only first-visit onboarding is preserved. It can be problematic for visitors relying on OS reduced-motion preferences. A reduced-motion or skip option is strongly recommended before a public accessibility certification.

## Local Windows setup
From PowerShell inside `VELORYZ-Studio`:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Then open the local address printed by Vite (typically `http://127.0.0.1:5173/`). Keep the previous private `.dev.vars` outside public repositories and copy it into the new project only on your trusted computer if needed. Do not disclose secrets in screenshots or support messages.

After installing dependencies, verify:

```powershell
node verify-project.mjs
node tools/test-visual-motion-v4.mjs
node tools/test-logo-model.mjs
node tools/test-production.mjs
corepack pnpm build
```

Use Chrome/Brave DevTools Console and Network to confirm that all fonts, motion assets and backend requests load in your **real browser**. Check actual WebGL visuals and frame smoothness on both laptop and phone.

## Public routes included in the screenshot audit
`/`, `/work/`, `/design/`, `/services/`, `/studio/`, `/teamjob/`, `/process/`, `/journey/`, `/motion/`, `/veloryz/`, `/velori/`, `/pricing/`, `/create/`, `/book/`, `/contact/`, `/developers/`, `/payments/`, `/concepts/aurel/`, `/concepts/orbit/`, `/concepts/forme/`, `/teamjob/aryan-raj-singh/`.

**Scope:** this update addresses site-wide design and movement. It does not replace the AI V3 backend, train a new model, or promise perfect response quality.


## Final post-screenshot corrections
The final audit found a legacy `platform.css` desktop navigation rule that forced text to 11 px with `!important`. V4 now overrides it at 14 px. The Motion Playground's Reset button inherited light-plum text over a light background; it now has strong dark text, a visible warm button surface, and a keyboard focus outline. The **126 route screenshots were recaptured after both corrections**.

Additional widths of 320, 768, 1024 and 1920 px were spot-checked on the homepage, Work, Create and Motion Playground routes: **16 combinations, no horizontal overflow**. The motion onboarding and chat interfaces were also captured separately at desktop and mobile sizes.
