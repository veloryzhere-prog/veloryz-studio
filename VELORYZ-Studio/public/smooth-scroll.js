'use strict';
// Native browser scrolling stays on the compositor; never cancel wheel input.
// Smooth motion applies only to intentional anchor/programmatic navigation.
(()=>{
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const sync=()=>{root.style.scrollBehavior=window.StudioMotion?.level==='full'&&!reduced.matches?'smooth':'auto';};
 window.StudioMotion?.addEventListener('change',sync);
 reduced.addEventListener?.('change',sync);
 sync();
})();
