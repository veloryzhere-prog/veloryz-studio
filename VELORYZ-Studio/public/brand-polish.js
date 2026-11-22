/* Lightweight pointer finish for the official header wordmark and homepage label.
   Delegation is intentional: app.js swaps page markup on navigation. */
(() => {
  'use strict';
  const root = document.documentElement;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeWordmark = null;
  let activeTagline = null;
  function enabled() {
    return (!prefersReduced.matches||root.dataset.motion==='full') && root.dataset.motion !== 'reduced' && root.dataset.motion !== 'paused';
  }
  function clearWordmark() {
    if (!activeWordmark) return;
    activeWordmark.style.removeProperty('--brand-tilt-x');
    activeWordmark.style.removeProperty('--brand-tilt-y');
    activeWordmark = null;
  }
  function clearTagline() {
    if (!activeTagline) return;
    activeTagline.style.removeProperty('--tagline-fade-x');
    activeTagline.style.removeProperty('--tagline-fade-y');
    activeTagline = null;
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !enabled()) {
      clearWordmark(); clearTagline(); return;
    }
    const target = event.target instanceof Element ? event.target : null;
    const logo = target?.closest('.site-header .brand--official') || null;
    const tagline = target?.closest('.hero-topline [data-cursor-fade]') || null;
    if (activeWordmark && activeWordmark !== logo) clearWordmark();
    if (activeTagline && activeTagline !== tagline) clearTagline();
    if (logo) {
      activeWordmark = logo;
      const rect = logo.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / Math.max(1, rect.width) - .5) * 8;
      const y = (.5 - (event.clientY - rect.top) / Math.max(1, rect.height)) * 6;
      logo.style.setProperty('--brand-tilt-x', x.toFixed(2) + 'deg');
      logo.style.setProperty('--brand-tilt-y', y.toFixed(2) + 'deg');
    }
    if (tagline) {
      activeTagline = tagline;
      const rect = tagline.getBoundingClientRect();
      tagline.style.setProperty('--tagline-fade-x', (event.clientX - rect.left).toFixed(1) + 'px');
      tagline.style.setProperty('--tagline-fade-y', (event.clientY - rect.top).toFixed(1) + 'px');
    }
  }, { passive: true });
  document.addEventListener('pointerout', event => {
    const next = event.relatedTarget;
    if (activeWordmark && !activeWordmark.contains(next)) clearWordmark();
    if (activeTagline && !activeTagline.contains(next)) clearTagline();
  }, {passive:true});
  window.addEventListener('blur', () => {clearWordmark(); clearTagline();});
  prefersReduced.addEventListener?.('change', () => {clearWordmark(); clearTagline();});
  new MutationObserver(() => {
    if (!enabled()) {clearWordmark(); clearTagline();}
  }).observe(root,{attributes:true,attributeFilter:['data-motion']});
})();
