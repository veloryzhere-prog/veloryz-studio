'use strict';
/**
 * VELORYZ Silk 2026 v2 (real-site R4 adapter): cursor-origin liquid hover, jelly press, burst particles, word scrub and card spotlight.
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

 const closest = (target, sel) => target instanceof Element ? target.closest(sel) : null;
 // Keep the V4 Creator and marketplace selectors added after the first ZIP integration.
 const LIFT = '.dc,.fl,.vz-doc-guide,.vz-studio-full-grid>a,.pc,.v4-choice,.v4-feature-card,.v4-style-card,.v4-template-card,.v4-number-card,.vz-market-related-card,.project-link,.process-card,.feature-card,.delivery-card,.team-card';
 const SPOT = '.pan,.fl,.pc,.brief,.mt,.vz-doc-guide,.vz-live-review-card,.v4-choice,.v4-template-card,.v4-feature-card,.v4-style-card,.v4-number-card,.vz-market-related-card,.project-link,.process-card,.feature-card,.service-item,.delivery-card,.team-card';
 const PRESS = '.btn,.button,.motion-secondary,.cta-orb,.project-link,.chip,.mbtn,.vz-header-create,.stars button,.v4-choice,.v4-primary,.v4-top-next,.v4-template-card,.v4-feature-card,.v4-style-card,.v4-number-card,.vz-market-btn';
 const BTN = '.btn,.button,.motion-secondary,.cta-orb,.v4-primary,.vz-market-btn';
 const SCRUB_SKIP = '.hero,.cta,footer,nav,#mn,details,form,.fm,.pan,.sc,.cs,.lib,.po,.v4-root,.vz-market-body,.vz-kinetic-card,.btn,[data-lenis-prevent],[contenteditable]';

 const FRAMES = {
  lift: [{ translate: '0 0', scale: '1' }, { translate: '0 -6px', scale: '1.008' }],
  press: [{ scale: '1' }, { scale: '.955' }],
  spot: [{ '--vz-spot': '0' }, { '--vz-spot': '1' }]
 };
 const TIMING = {
  lift: { duration: 600, easing: EASE_OUT },
  press: { duration: 140, easing: 'ease-out' },
  spot: { duration: 450, easing: 'ease-out' }
 };
 const rigs = new WeakMap();
 function rig(el, kind) {
  let set = rigs.get(el);
  if (!set) { set = {}; rigs.set(el, set); }
  if (set[kind]) return set[kind];
  const a = el.animate(FRAMES[kind], { ...TIMING[kind], fill: 'both' });
  a.pause();
  set[kind] = a;
  return a;
 }
 function drive(el, kind, dir) {
  if (!canAnimate || !el.isConnected || !allowed()) return;
  const a = rig(el, kind);
  a.playbackRate = dir;
  a.play();
 }

 /* Pointer tracking: card lift, spotlight and entry/exit origin for liquid buttons. */
 const lifted = new Set(), spotted = new Set();
 function setOrigin(el, e) {
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  el.style.setProperty('--vz-bx', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
  el.style.setProperty('--vz-by', ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
 }
 doc.addEventListener('pointerover', e => {
  if (e.pointerType !== 'mouse') return;
  const btn = closest(e.target, BTN);
  if (btn && !btn.contains(e.relatedTarget) && allowed()) setOrigin(btn, e);
  const mag = closest(e.target, '.mag.vz-mag-release');
  if (mag && !mag.contains(e.relatedTarget)) mag.classList.remove('vz-mag-release');
  if (!finePointer.matches || !allowed()) return;
  const l = closest(e.target, LIFT);
  if (l && !lifted.has(l)) { lifted.add(l); drive(l, 'lift', 1); }
  const card = closest(e.target, SPOT);
  if (card && !spotted.has(card)) { spotted.add(card); drive(card, 'spot', 1); }
 }, { passive: true });

 doc.addEventListener('pointerout', e => {
  if (e.pointerType !== 'mouse') return;
  const btn = closest(e.target, BTN);
  if (btn && !btn.contains(e.relatedTarget) && allowed()) setOrigin(btn, e);
  const l = closest(e.target, LIFT);
  if (l && lifted.has(l) && !l.contains(e.relatedTarget)) { lifted.delete(l); drive(l, 'lift', -1); }
  const card = closest(e.target, SPOT);
  if (card && spotted.has(card) && !card.contains(e.relatedTarget)) { spotted.delete(card); drive(card, 'spot', -1); }
  // Existing magnetic motion sets inline transforms. Spring the return, don't add a second motion engine.
  const mag = closest(e.target, '.mag');
  if (mag && !mag.contains(e.relatedTarget) && allowed()) {
   mag.classList.add('vz-mag-release');
   const done = () => mag.classList.remove('vz-mag-release');
   mag.addEventListener('transitionend', ev => { if (ev.propertyName === 'transform') done(); }, { once: true });
   setTimeout(done, 900);
  }
 }, { passive: true, capture: true });
 const dropAll = () => {
  for (const el of lifted) drive(el, 'lift', -1);
  for (const el of spotted) drive(el, 'spot', -1);
  lifted.clear(); spotted.clear();
 };
 addEventListener('blur', dropAll);
 doc.addEventListener('visibilitychange', () => { if (doc.hidden) dropAll(); });

 /* Cursor spotlight position, at most one requestAnimationFrame per pointer move. */
 let spotEl = null, sx = 0, sy = 0, sframe = 0;
 doc.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || !finePointer.matches) return;
  spotEl = closest(e.target, SPOT);
  if (!spotEl || !allowed()) return;
  sx = e.clientX; sy = e.clientY;
  if (sframe) return;
  sframe = requestAnimationFrame(() => {
   sframe = 0;
   if (!spotEl || !spotEl.isConnected || !allowed()) return;
   const rect = spotEl.getBoundingClientRect();
   spotEl.style.setProperty('--mx', (sx - rect.left).toFixed(0) + 'px');
   spotEl.style.setProperty('--my', (sy - rect.top).toFixed(0) + 'px');
  });
 }, { passive: true });

 /* Press / jelly release / optional touch haptic tick. */
 const pressed = new Set();
 doc.addEventListener('pointerdown', e => {
  if (e.button !== 0 || !allowed()) return;
  const el = closest(e.target, PRESS);
  if (!el || el.matches('[disabled],[aria-disabled="true"]') || pressed.has(el)) return;
  pressed.add(el);
  drive(el, 'press', 1);
  if (e.pointerType === 'touch' && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
   try { navigator.vibrate(6); } catch { /* haptic unavailable */ }
  }
 }, { passive: true, capture: true });
 const release = e => {
  const cancelled = e && e.type === 'pointercancel';
  for (const el of pressed) {
   const set = rigs.get(el);
   if (set && set.press) { set.press.cancel(); delete set.press; }
   if (canAnimate && el.isConnected && allowed() && !cancelled) {
    el.animate([
     { scale: '.955', easing: 'ease-out' },
     { scale: '1.05', offset: .42, easing: 'ease-in-out' },
     { scale: '.985', offset: .72, easing: 'ease-in-out' },
     { scale: '1' }
    ], { duration: 560 });
   }
  }
  pressed.clear();
 };
 for (const type of ['pointerup', 'pointercancel']) doc.addEventListener(type, release, { passive: true, capture: true });
 addEventListener('blur', release);

 /* Ten warm-coloured click particles with separate easing for movement and fade. */
 const COLORS = ['#e2482b', '#f0a24f', '#ffe2b8'];
 function burst(x, y) {
  const count = 10;
  for (let i = 0; i < count; i++) {
   const p = doc.createElement('i');
   p.className = 'vz-burst';
   p.setAttribute('aria-hidden', 'true');
   const size = 5 + Math.random() * 5;
   p.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;background:' + COLORS[i % COLORS.length] + ';translate:-50% -50%';
   doc.body.append(p);
   const ang = (Math.PI * 2 * i) / count + Math.random() * .5, dist = 44 + Math.random() * 40;
   const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;
   const dur = 560 + Math.random() * 280;
   p.animate(
    [{ translate: '-50% -50%' }, { translate: 'calc(-50% + ' + dx.toFixed(1) + 'px) calc(-50% + ' + dy.toFixed(1) + 'px)' }],
    { duration: dur, easing: EASE_OUT, fill: 'forwards' }
   );
   const fade = p.animate(
    [{ scale: 1, opacity: 1 }, { scale: .9, opacity: 1, offset: .55 }, { scale: .1, opacity: 0 }],
    { duration: dur, easing: 'ease-in', fill: 'forwards' }
   );
   fade.onfinish = () => p.remove();
  }
 }
 doc.addEventListener('click', e => {
  if (!canAnimate || !allowed()) return;
  const el = closest(e.target, BTN);
  if (!el || el.matches('[disabled],[aria-disabled="true"]')) return;
  let x = e.clientX, y = e.clientY;
  if (!e.detail && !x && !y) {
   const rect = el.getBoundingClientRect();
   x = rect.left + rect.width / 2; y = rect.top + rect.height / 2;
  }
  burst(x, y);
 }, { passive: true });

 /* Word-by-word scroll scrub: 14 long paragraphs max, never editor / creator / forms. */
 function scrubParagraphs() {
  if (!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) || !allowed()) return;
  let budget = 14 - doc.querySelectorAll('[data-vz-scrub]').length;
  for (const p of doc.querySelectorAll('main p, section p, .pg p')) {
   if (budget <= 0) break;
   if (p.dataset.vzScrub || p.children.length || p.closest(SCRUB_SKIP)) continue;
   const text = p.textContent.trim();
   if (text.length < 90 || text.length > 520) continue;
   const words = text.split(/\s+/);
   const n = words.length;
   p.textContent = '';
   const frag = doc.createDocumentFragment();
   words.forEach((word, i) => {
    const wordSpan = doc.createElement('span');
    wordSpan.className = 'vz-w';
    const a = 8 + (i / n) * 25;
    wordSpan.style.setProperty('--a', a.toFixed(1) + '%');
    wordSpan.style.setProperty('--b', (a + 22).toFixed(1) + '%');
    wordSpan.textContent = word;
    frag.append(wordSpan);
    if (i < n - 1) frag.append(doc.createTextNode(' '));
   });
   p.append(frag);
   p.dataset.vzScrub = '1';
   budget--;
  }
 }

 /* ----- Scroll progress bar ----- */
 function mountProgress() {
  if (doc.getElementById('prog') || doc.getElementById('site-progress') || doc.querySelector('.vz-silk-progress') || !doc.body) return;
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
  if (canAnimate && allowed()) {
   const main = doc.getElementById('main');
   if (main) main.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 460, easing: EASE_OUT });
  }
  setTimeout(scrubParagraphs, 160);
 });
 const start = () => { mountProgress(); setTimeout(scrubParagraphs, 400); };
 if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, { once: true });
 else start();

 window.VeloryzSilk = { version: 'silk-2026.3', get enabled() { return allowed(); } };
})();
