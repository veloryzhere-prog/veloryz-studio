'use strict';
/**
 * VELORYZ Silk 2026: additive motion layer. Companion to veloryz-silk-2026.css.
 *
 *  - Springy hover lift on selected cards (Web Animations, compositor-friendly).
 *  - Tactile press feedback on buttons and chips.
 *  - Soft spring-back for magnetic (.mag) buttons.
 *  - Scroll progress bar for pages without one (CSS scroll timeline; JS only as a fallback).
 *  - Gentle fade when the single-page router swaps routes.
 *
 * It adds no scroll engine, no wheel listeners and no animation loop. It uses the individual
 * 'translate' / 'scale' properties, so it composes with the existing transform-based motion
 * instead of replacing it, and it stands down for reduced-motion and paused-motion settings.
 */
(() => {
 if (window.VeloryzSilk) return;
 const doc = document, root = doc.documentElement;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
 const canAnimate = typeof Element.prototype.animate === 'function';
 const EASE_OUT = 'cubic-bezier(.16,1,.3,1)';

 // Same gating the site's own kinetic layer uses.
 const allowed = () => {
  const m = root.dataset.motion;
  return (!reduced.matches || m === 'full') && m !== 'paused' && m !== 'reduced' && !doc.hidden;
 };

 const LIFT = '.dc,.fl,.vz-doc-guide,.vz-studio-full-grid>a,.pc,.v4-choice,.v4-feature-card,.v4-style-card,.v4-template-card,.v4-number-card,.vz-market-related-card';
 const PRESS = '.btn,.chip,.mbtn,.vz-header-create,.stars button,.v4-choice,.v4-primary,.v4-top-next,.v4-template-card,.v4-feature-card,.v4-style-card,.v4-number-card,.vz-market-btn';

 /* One lazily created, paused animation per element and effect; we only drive it forwards or back. */
 const rigs = new WeakMap();
 function rig(el, kind) {
  let set = rigs.get(el);
  if (!set) { set = {}; rigs.set(el, set); }
  if (set[kind]) return set[kind];
  const lift = kind === 'lift';
  const frames = lift
   ? [{ translate: '0 0', scale: '1' }, { translate: '0 -6px', scale: '1.008' }]
   : [{ scale: '1' }, { scale: '.965' }];
  const a = el.animate(frames, { duration: lift ? 600 : 170, easing: lift ? EASE_OUT : 'ease-out', fill: 'both' });
  a.pause();
  set[kind] = a;
  return a;
 }
 function drive(el, kind, dir) {
  if (!canAnimate || !el.isConnected) return;
  const a = rig(el, kind);
  a.playbackRate = dir;
  a.play();
 }

 /* ----- Hover lift ----- */
 const lifted = new Set();
 doc.addEventListener('pointerover', e => {
  if (e.pointerType !== 'mouse' || !finePointer.matches || !allowed() || !(e.target instanceof Element)) return;
  const el = e.target.closest(LIFT);
  if (!el || lifted.has(el)) return;
  lifted.add(el);
  drive(el, 'lift', 1);
 }, { passive: true });
 doc.addEventListener('pointerout', e => {
  if (e.pointerType !== 'mouse' || !(e.target instanceof Element)) return;
  const el = e.target.closest(LIFT);
  if (!el || !lifted.has(el) || el.contains(e.relatedTarget)) return;
  lifted.delete(el);
  drive(el, 'lift', -1);
 }, { passive: true });
 const dropAllLifts = () => { for (const el of lifted) drive(el, 'lift', -1); lifted.clear(); };
 addEventListener('blur', dropAllLifts);
 doc.addEventListener('visibilitychange', () => { if (doc.hidden) dropAllLifts(); });

 /* ----- Press feedback ----- */
 const pressed = new Set();
 doc.addEventListener('pointerdown', e => {
  if (e.button !== 0 || !allowed() || !(e.target instanceof Element)) return;
  const el = e.target.closest(PRESS);
  if (!el || el.matches('[disabled],[aria-disabled="true"]') || pressed.has(el)) return;
  pressed.add(el);
  drive(el, 'press', 1);
 }, { passive: true, capture: true });
 const releaseAll = () => { for (const el of pressed) drive(el, 'press', -1); pressed.clear(); };
 for (const type of ['pointerup', 'pointercancel']) doc.addEventListener(type, releaseAll, { passive: true, capture: true });
 addEventListener('blur', releaseAll);

 /* ----- Magnetic buttons: spring back on leave ----- */
 // pointerout fires before the compatibility mouseleave the existing script listens for,
 // so the class is on before its inline transform is cleared and the return is animated.
 doc.addEventListener('pointerout', e => {
  if (e.pointerType !== 'mouse' || !(e.target instanceof Element)) return;
  const el = e.target.closest('.mag');
  if (!el || el.contains(e.relatedTarget) || !allowed()) return;
  el.classList.add('vz-mag-release');
  const done = () => el.classList.remove('vz-mag-release');
  el.addEventListener('transitionend', ev => { if (ev.propertyName === 'transform') done(); }, { once: true });
  setTimeout(done, 900);
 }, { passive: true, capture: true });
 doc.addEventListener('pointerover', e => {
  if (!(e.target instanceof Element)) return;
  const el = e.target.closest('.mag.vz-mag-release');
  if (el && !el.contains(e.relatedTarget)) el.classList.remove('vz-mag-release'); // follow the cursor crisply again
 }, { passive: true });

 /* ----- Scroll progress bar ----- */
 function mountProgress() {
  if (doc.getElementById('prog') || doc.querySelector('.vz-silk-progress') || !doc.body) return;
  const bar = doc.createElement('div');
  bar.className = 'vz-silk-progress';
  bar.setAttribute('aria-hidden', 'true');
  doc.body.append(bar);
  const native = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
  if (native) return; // pure CSS: nothing else to do
  let frame = 0;
  const paint = () => {
   frame = 0;
   const h = root.scrollHeight - innerHeight;
   bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0) + ')';
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  paint();
 }

 /* ----- Soft fade when the single-page router swaps routes ----- */
 // Opacity only: a transform here would become a containing block for fixed descendants.
 doc.addEventListener('studio:route', () => {
  if (!canAnimate || !allowed()) return;
  const main = doc.getElementById('main');
  if (main) main.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 460, easing: EASE_OUT });
 });

 if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', mountProgress, { once: true });
 else mountProgress();

 window.VeloryzSilk = { version: 'silk-2026.1', get enabled() { return allowed(); } };
})();
