# VELORYZ — Smooth Cinematic Opening + Homepage Finale

**This changes the review branch only. It is NOT deployed.**

## Visitor experience

On the homepage a shortened, native 60fps, 2.688-second VELORYZ film uses the official original faceted V, portal and wordmark. When binary assets have not been placed in the site, the project plays a shorter GPU-composited CSS logo version using the same original artwork and an accessible Skip control. The original first-visit motion preference screen still appears afterward.

At the very bottom of the homepage, before the original footer, a dedicated closing brand film shows the full original 7.75-second cinematic identity. The video lazy-loads only as visitors approach, plays muted when visible, pauses when offscreen, and has Replay, Sound, Play/Pause and Fullscreen controls. Its animated fallback is self-contained and uses official brand imagery.

Reduced-motion preferences, paused mode, data saver, browser tab visibility and native mobile scrolling are preserved. No page-layout replacement, 3D V change, scarf change or custom wheel hijacking has been made.

## Four original media files to install

Place these four files in VELORYZ-Studio/public/assets/brand/intro/:

| File | Resolution | Duration | Source frame rate |
| --- | --- | --- | --- |
| veloryz-opening-60fps.mp4 | 1440 x 810 | 2.688 s | native 60 fps |
| veloryz-opening-60fps-mobile.mp4 | 720 x 1280 | 2.688 s | native 60 fps |
| veloryz-cinematic-full.mp4 | 1920 x 1080 | 7.75 s | original 24 fps |
| veloryz-cinematic-full-mobile.mp4 | 1080 x 1920 | 7.75 s | original 24 fps |

The four videos are included in the companion downloadable package. The GitHub connector used for this branch can upload UTF-8 text but cannot push the binary media files. Until the media files are copied to those exact public paths, the production code uses its built-in CSS motion fallback and handles missing media gracefully. The original MP4 footage is NOT automatically hosted by the pull request.

## Architecture

- public/brand-intro.js and brand-intro.css: high-FPS native-clip preference and short composited fallback.
- public/studio-brand-film.js and studio-brand-film.css: closing film insertion, observer-based loading and controls.
- lib/site-shell.ts: loads the new assets without modifying the existing public site structure.
- tools/test-brand-intro.mjs and test-brand-film.mjs: intro lifecycle, original logo and footer film contracts.

## Review checklist

Open the website after installing videos in a preview build. Visit the homepage in a new tab and confirm a short fullscreen intro, Skip support and original motion preference screen. Scroll to the last homepage section; test video playback, mute/unmute, fullscreen, pause and replay. Navigate away and back; confirm no stuck film or scroll issue. Test mobile portrait, reduced motion and low bandwidth. Existing CMS, shop, documentation, client experience and 3D V should remain unchanged.

This update lives in the open GitHub pull request until explicitly merged. Do not claim that it is live or production-deployed.
