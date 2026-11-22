# VELORYZ Studio — Cinematic Brand Intro

**Scope:** A branded first-session homepage opening sequence and a three-concept interactive gallery, using existing *official* VELORYZ logos.

## Research references and decisions

- [Codrops — R—K ’26](https://tympanus.net/codrops/2026/04/07/r-k-26-the-thinking-and-code-behind-a-portfolio-led-by-presence/): brand logo mask and expanding cutout illustrate how a loading sequence can become a site reveal.
- [Codrops — 1820 Productions](https://tympanus.net/codrops/2026/02/13/1820-productions-minimal-design-maximal-motion/): separate incoming and outgoing motion timelines for controlled orchestration.
- [Codrops — Dondre Green](https://tympanus.net/codrops/2025/01/07/case-study-dondre-green/): cinematic preloader transitions that lead into the site's visual identity.
- [web.dev — Reduced motion](https://web.dev/articles/prefers-reduced-motion): honor the operating system's motion setting.
- [web.dev — Optimize LCP](https://web.dev/articles/optimize-lcp/): avoid expensive blocking assets and animation-induced page render delays.

These are inspiration and engineering references, **not sources of visual assets, logos, third-party licensed code or copied animation**. All artwork and wording are original or VELORYZ-owned project assets.

## Three playable concepts

Visit `/intro-concepts.html` on a deployment of this branch and click any **PLAY FULLSCREEN** button.

| Concept | Direction | Main animation |
| --- | --- | --- |
| **01 / Prismatic Portal** | Midnight violet, hot pink and electric cyan, official multicolor V and light wordmark | Emblem rises with orbit rings; light crosses; complete wordmark fades and rises; the two opposing curtains open into the existing homepage |
| **02 / Orbit Signature** | Deep indigo, cool blue signature rings | Larger-dimensional ring system with the unchanged V and official light wordmark |
| **03 / Editorial Monogram** | Warm ivory, ink blue and minimal elegant framing | Prismatic V remains true to brand while dark-ink official wordmark takes center stage |

**Chosen production default: 01 / Prismatic Portal.** The gallery is a standalone comparison page; selecting a sample does not automatically modify the live site.

## Premiere choreography

1. Initial paint: original dark gradient covers the viewport, header/counter labels and skip control appear.
2. ~0–870 ms: V mark is assembled by rotating/light-catching elliptical arcs; no 3D library or external source needed.
3. ~880–1,600 ms: official VELORYZ wordmark reveals and studio motto emerges.
4. ~1,250–2,110 ms: the identity holds while the non-factual motion progress decoration completes.
5. ~2,110–2,850 ms: branded panels split and uncover the *already rendered* original homepage.

The animation does **not** claim to track actual network progress. Its ~2.85-second total is a motion design sequence, not an artificial loading requirement. Visitors can **Skip intro** immediately.

## Existing systems preserved

- Original homepage visual structure, 3D V mark and motion playground remain unchanged.
- The first-visit **motion on / reduced** decision remains mandatory as before, and appears immediately **after** the logo intro. It is not hidden or overridden.
- On subsequent navigations within the same session, the intro does not repeat. On a new tab session, it can play on the homepage again.
- System reduced motion, saved Reduced / Paused preference, low-memory devices, and data-saver bypass the intro; existing motion choice remains accessible.
- Public page remains available without intro script. The optional `skip` control never depends on external API results.
- Existing first-party Lenis scrolling and 3D motion are deferred until the intro completes, and then recover via `studio:brand-intro-complete`.
- Admin, API, Supabase, CMS drafts/publishing, client portal and all other routes remain unchanged.

## Files introduced

- `public/brand-intro.css`: all three concept motion styles with responsive and reduced-motion rules.
- `public/brand-intro.js`: session-level controller, skip, replay and accessibility cleanup.
- `public/intro-concepts.html`: interactive concept gallery with real official identity assets.
- `tools/test-brand-intro.mjs`: functional lifecycle mocks and integration contract checks.

## Files minimally updated

- `lib/site-shell.ts`: new controller/style inclusion and entry overlay using real brand assets.
- `public/motion.js`: defer existing required motion gate until logo intro completion.
- `public/motion-boot.js` and `public/smooth-scroll.js`: resume existing motion systems after entrance.
- `package.json` / CI workflow: add regression test.

## Validation and remaining checks

Run from `VELORYZ-Studio`:

```bash
node tools/test-brand-intro.mjs
node tools/test-smooth-motion.mjs
node tools/test-motion.mjs
corepack pnpm test:all
corepack pnpm build
```

Source checks and mocked intro lifecycle verify keyboard skip, gallery replay, stored first-session state, reduced-motion bypass, official asset paths and event handoff. Full visual browser QA still needs viewport testing after deployment for 390px / 768px / 1440px, especially with bandwidth throttling and mobile browsers.

**Deployment:** Review and merge the feature pull request, then deploy. The public homepage uses concept 01 automatically. The preview gallery is available at `/intro-concepts.html` on a deployed build.
