> Updated by Motion Lab. See [MOTION-LAB.md](MOTION-LAB.md) for the latest additions.

# VELORYZ Studio — Motion Edition

This release builds on the Supabase upgrade. It changes the public experience; it does not migrate or modify your live studio records.

## What changed
- Dark plum visual direction with the latest pink, violet and blue VELORYZ identity.
- Original supplied PNG preserved at public/assets/brand/veloryz-original.png.
- Transparent SVG reconstruction for crisp navigation, favicon, project artwork and static fallbacks.
- A real, bevelled and extruded 3D V with faceted faces, directional lighting, orbit rings and ambient points.
- Homepage and studio-page logo scenes with pointer tilt, floating movement, a two-piece assembly animation, solid/glass/wireframe choices and replay.
- Downloadable/exportable GLB model at public/assets/brand/veloryz-logo.glb.
- Large DESIGN / DEVELOP / MOVE section.
- Animated “Designed & built by Aryan Raj Singh” hero credit, personal founder section, signature line and footer credit.
- Updated identity project preview, subtle project-card perspective and active process-stage treatment.
- Five CSS 3D service studies for websites, product interfaces, identity, systems and motion.
- Matching enquiry-dialogue entrances and campaign colours, with the new mark as the campaign fallback.
- Responsive styles and the existing Full / Reduced / Pause motion preferences.

## Run
1. Extract the source and open VELORYZ-Studio.
2. Use the pinned package manager: pnpm@11.25.0.
3. Run pnpm install --frozen-lockfile.
4. Follow UPGRADE-AND-SUPABASE.md to configure your private runtime settings if not already done.
5. Run pnpm dev and open the printed local URL.

The existing .dev.vars file on your own computer can remain in place. Secrets are excluded from this archive.

## Edit the motion
- src/motion/logo-model.mjs defines the traced geometry and materials.
- src/motion/experience.mjs controls the WebGL scene, assembly, pointer response, lifecycle and material choices.
- public/motion-edition.css controls the public theme, service studies and CSS animations.
- public/motion-ui.js adds progressive interface interactions.
- public/app.js contains the public page sections and creator copy.
- Run pnpm build:motion after editing either 3D source module. It rebuilds both the self-hosted runtime and GLB.
- pnpm dev and pnpm build also rebuild the motion assets automatically.

Three.js is pinned and bundled locally. No runtime CDN or third-party 3D embed is required.

## Performance and accessibility
The renderer caps pixel ratio, pauses outside the viewport and when the document is hidden, and disposes GPU resources when a route removes its scene. Reduced or paused motion renders a still scene. Unsupported/lost WebGL falls back to the SVG, with unavailable 3D controls hidden. CSS animation follows the same saved motion preference. The introduction is a short, nonblocking corner signature, not a loading gate.

## Validation
Passed automated checks for:
- Real geometry depth and silhouette bounds.
- Solid/glass/wire material switching.
- GLB export and re-import with matching bounds.
- Device motion settings, saved preferences, pause/reduced motion and visibility recovery.
- Existing CMS, enquiry, owner login, platform/payment, campaign and production-security suites.
- Production build.

Browser visual verification is incomplete: the managed preview reported a local URL, but the cloud browser could not connect. Test desktop/mobile appearance, WebGL rendering, focus navigation, dialogue interactions and mobile performance before publishing. No frame-rate measurement or full visual audit is claimed.

## Deployment status
The old hosting project is still inaccessible in this account. This is an updated source package, not a published update. Keep the original hosting identity only when deploying back into that same project. The existing Supabase schema, data-isolation model, and setup instructions remain unchanged. Old D1/R2 records still require migration if they contain content or uploads absent from this source.

The glass mode is an artistic translucent material. Custom CMS logos, content, offers and project settings retain their existing authority. This release does not add unrelated accounts or new database features.
