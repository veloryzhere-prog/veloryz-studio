# VELORYZ Studio — Warm Motion & AI Quality Release

Base: `VELORYZ-Studio-Journey-AI-ONLY-Upgraded-v2.zip` (the latest uploaded/updated Journey Edition in this conversation). This release does **not** reuse the AETHER or Motion Live variants as its source.

## 1. Global visual system

`public/studio-warm-v3.css` is intentionally loaded last in the public shell (`lib/site-shell.ts`), after all legacy page, journey, motion and finish styles. It corrects dark-purple overrides that previously reappeared throughout the website. The new public palette uses warm ivory (#f7f0e5), near-black text (#241e1a), muted warm taupe (#635950), caramel rules (#d8c8b7), and rose-to-iris CTA accents.

The stylesheet covers the global canvas, animated ambient gradients, navigation, hero, 3D stage/fallback, service bands, process cards, catalogue, pricing, planner, form panels, AI chat, consultation CTA and *the entire footer including CMS/platform links*. Original fictional concept showcases retain their own visual identity where appropriate. Animations respect the central Full / Automatic / Reduced / Pause policy.

The original hero ambient `::before` used negative 5vw horizontal inset, causing ~72 px overflow at 1440 px and ~20 px at 390 px. This is removed. Independent browser checks now show no meaningful horizontal overflow on those viewports.

## 2. Motion onboarding: exact interaction sequence

Implementation: `public/motion.js`, `public/studio-warm-v3.css` and campaign-deferral code in `public/app.js`.

1. On the first page load in a tab session, the full page blurs and becomes non-interactive. Only the top header motion icon stays sharp and clickable; it pulses, its bars move, and the page does not scroll.
2. Clicking the motion icon opens a native accessible dialog. **Full motion** is visually highlighted and is the only enabled choice. Automatic, Reduced and Pause are disabled for this introductory step. The dialog's Close and backdrop dismissals are disabled during this step.
3. Selecting Full motion removes the focus overlay, restores interactivity and scroll position, closes the dialog, enables full motion and persists the preference.
4. When the saved preference is **Full**, the introduction is shown only once per **tab session**. A new browser tab/session can show it again.
5. When the saved preference is **Automatic**, **Reduced** or **Paused**, the introduction is shown on every **full page refresh**. After the visitor enters the site, all four motion settings become available through the ordinary header button.
6. Promotional announcements and automatic consultation popups are deferred until onboarding completes, so they cannot block the initial flow.

Accessibility note: the requested introductory step intentionally enforces Full before opening other settings. Visitors can change to Reduced or Pause from the top icon immediately after they enter. The motion control remains keyboard accessible.

## 3. 3D and ambient movement

The existing Three.js logo renderer and model are preserved. A browser-native fallback now animates the logo when WebGL is not available, along with slow orbit rings, breathing light and caption movement. It follows the saved motion preference; no renderer settings or hardware defaults were replaced.

## 4. Five AI personalities

The original fictional avatar portraits remain available as real WebP images in `public/assets/ai-avatars/`: ARYAN, Happy, Nikhil, Milky and Ritik. The chat presents those portraits with small movements in Full motion and high-contrast light chat surfaces.

`lib/adviser-personas.mjs` now supplies an explicit response contract: answer the latest user message first, use history for context, keep greetings to 1–2 natural lines, separate irrelevant studio catalogue facts from general conversation, maintain distinct character tones, and respond in the user's language. ARYAN stays confident and witty; the other four use their respective social, analytical, imaginative and technical voices. Model request variation was moderated slightly for more consistent relevance. `lib/adviser-guide.mjs` returns consistent metadata for short social responses.

The chat backend (`lib/studio-platform.mjs`) still requires an **actual server-side Gemini or OpenAI API key and access to that model** for genuine AI-generated answers. If the provider fails, it reports an error and does not fabricate a model reply. This release does **not** bundle a credential, claim that every AI answer is perfect, or turn on live web research. API keys must be configured in the protected owner/admin settings or server environment, never in the browser.

## 5. Verification completed

- `node --check` on modified JavaScript/ESM files: passed.
- `tools/test-cms.mjs`, `tools/test-enquiries.mjs`, `tools/test-admin-password-only.mjs`, `tools/test-platform.mjs`: passed.
- `tools/test-motion.mjs`, `tools/test-motion-lab.mjs`, `tools/test-broadcasts.mjs`, `tools/test-guided-planner.mjs`, `tools/test-gemini.mjs` and `tools/test-ai-conversation-quality.mjs`: passed.
- Isolated Chromium test: first-load gate, disabled non-Full choices, keyboard/focus state, enabling Full and releasing inert content, saved-Full skip in the same tab session, Paused refresh forcing gate: passed.
- Isolated Chromium visual audits: Home, Pricing, Studio, Services, Project Planner and People routes, including footer/CMS links: rendered without uncaught JS exceptions. Home desktop/mobile horizontal overflow was corrected.

**Not verified here:** a full dependency-based Vinext production build (this workspace does not contain the dependency installation, including TypeScript and Three.js), physical-GPU WebGL performance, your live Supabase/Cloudflare bindings, or live Gemini/OpenAI generated replies. Please verify those in your configured local and hosting environments before production deployment.

## 6. Windows development

From the extracted `VELORYZ-Studio` folder in PowerShell:

```powershell
node --version
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Then visit the URL printed by Vite/Vinext (usually `http://localhost:5173`). Node >= 22.13.0 is required. `npm install` or `pnpm install` must be run before `pnpm dev` if `vite` is missing. Do not paste a password, API key or `.env` secrets into a public chat or repo.

For an accurate check of the gate: use a fresh tab/window, or temporarily clear `veloryz.motion.introDone.v3` from session storage. For an off-state retest select Pause after entering, then refresh. For the on-state retest select Full and refresh again in the same tab: the gate should not reappear.

## 7. Fonts

Binary font files from the uploaded project are not redistributed in this modified archive. The site uses the system-font fallback so it can render without missing font requests. If you own appropriate rights and need the exact original typefaces, restore your licensed font assets and declarations from your own original source locally.
