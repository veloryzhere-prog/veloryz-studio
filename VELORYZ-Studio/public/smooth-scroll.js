// Native wheel, touch and keyboard scrolling keep the page on the compositor.
// Respect the studio preference for in-page links as well as its scroll effects.
(() => {
 const sync = () => {
  document.documentElement.style.scrollBehavior =
   window.StudioMotion?.level === 'full' ? 'smooth' : 'auto';
 };
 window.StudioMotion?.addEventListener('change',sync);
 sync();
})();
