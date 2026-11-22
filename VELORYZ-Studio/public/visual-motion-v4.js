'use strict';

// Public scroll choreography. The browser owns scrolling, focus and anchor navigation.
(() => {
  const root = document.documentElement;
  const main = document.querySelector('#main');
  if (!main) return;
  const full = () => root.dataset.motion==='full' && !document.hidden;
  const sceneSelector = [
    '.folio-shot', '.type-study', '.motion-hero .logo-stage', '.motion-manifesto', '.ui-study-card', '.project-art',
    '.design-preview', '.creator-visual', '.platform-intro', '.page-intro',
    '.cta-section', '.platform-teaser', '.studio-ai-help', '.lab-stage-wrap',
    '.journey-chapter', '.section-head', '.assembly-sequence', '.reel-strip', '.ticker',
    '.service-item', '.lab-swatch-card', '.studio-band', '.ui-study-grid'
  ].join(',');
  const entranceSelector = [
    '.section-head', '.process-card', '.project-caption', '.service-item', '.people-card',
    '.profile-highlight', '.design-card', '.studio-ai-help', '.platform-teaser',
    '.price-card', '.feature-card', '.guided-step-heading', '.call-card'
  ].join(',');
  const visible = new Set();
  let tracked = [];
  let frame = 0;
  const clock=window.VeloryzMotionClock;
  const frameKey='visual-motion-v4';
  const requestFrame=callback=>clock?clock.request(frameKey,callback):requestAnimationFrame(callback);
  const cancelFrame=()=>clock?clock.cancel(frameKey):cancelAnimationFrame(frame);
  // Lenis owns scroll interpolation. Visuals read the final scroll position;
  // do not apply a second bespoke camera easing to the same wheel input.
  const economical=matchMedia('(max-width:850px), (pointer:coarse)').matches||(navigator.deviceMemory||8)<=4;
  // Presentation throttles to 30fps on low-end devices and 60fps on capable desktops.
  // Never schedule frames when no real scroll changes are happening.
  const frameBudget=economical?32:16;
  let lastPaint=0;

  let backdrop;
  function atmosphere() {
    // The ambient DOM is decorative and costly on handhelds; keep the V sculpture itself.
    if (economical || navigator.connection?.saveData) return;
    if (document.querySelector('.vz-atmosphere')) return;
    const layer = document.createElement('div');
    layer.className = 'vz-atmosphere';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '<div class="vz-atmosphere-grid"></div><div class="vz-orbit vz-orbit-one"><i></i></div><div class="vz-orbit vz-orbit-two"><i></i></div><div class="vz-orbit vz-orbit-three"><i></i></div><div class="vz-atmosphere-ray"></div>';
    document.body.prepend(layer);
    backdrop=layer;
  }

  // Both optical planes use the same source and crop, so the magnifier follows the sculpture.
  function mountStudy() {
    // The duplicate magnifying-lens image is a desktop enhancement only.
    if (economical || navigator.connection?.saveData) return;
    const manifesto = main.querySelector('.motion-manifesto');
    if (!manifesto || manifesto.querySelector('.sculpture-study')) return;
    const stage = document.createElement('div');
    stage.className = 'sculpture-study';
    stage.setAttribute('aria-hidden', 'true');
    const photo = '<img src="/assets/renders/hero-3d.webp" srcset="/assets/renders/hero-3d-sm.webp 720w, /assets/renders/hero-3d.webp 1440w" sizes="(max-width: 740px) 90vw, 44vw" loading="lazy" decoding="async" alt="">';
    stage.innerHTML = photo + '<div class="study-lens">' + photo + '</div><i class="study-crosshair"></i><i class="study-scale"></i>';
    manifesto.querySelector('.manifesto-words').after(stage);
  }

  function schedule() {
    if (full() && !frame) frame = requestFrame(tick); // Shared clock if present; native rAF fallback.
  }

  function tick(time) {
    frame = 0;
    if (!full()) return;
    if(lastPaint&&time-lastPaint<frameBudget){schedule();return;}
    lastPaint=time;
    const actualY = window.scrollY;
    const height = Math.max(1, window.innerHeight);
    // Measure stationary scene boxes first. Only descendants use the resulting transforms.
    const values = [];
    for (const el of visible) {
      const bounds = el.getBoundingClientRect();
      if (bounds.height === 0) continue;
      const top = bounds.top;
      const progress = Math.max(0, Math.min(1, (height - top) / (height + bounds.height)));
      const story=el.classList.contains('assembly-sequence');
      const assembly=story?Math.max(0,Math.min(1,(height*.32-top)/Math.max(1,bounds.height-height*.53))):null;
      values.push([el, progress, assembly]);
    }

    if (backdrop) {
      backdrop.style.setProperty('--vz-flow-y', (Math.sin(actualY / 490) * 9).toFixed(2) + 'px');
      backdrop.style.setProperty('--vz-flow-reverse', (Math.cos(actualY / 620) * -11).toFixed(2) + 'px');
    }
    for (const [el, progress, assembly] of values) {
      if(assembly!==null && (el.assemblyProgress===undefined||Math.abs(assembly-el.assemblyProgress)>.006)){
        el.assemblyProgress=assembly;
        el.style.setProperty('--assembly-progress',assembly.toFixed(3));
        const chapter=String(Math.min(2,Math.floor(assembly*3)));
        if(el.dataset.chapter!==chapter)el.dataset.chapter=chapter;
        el.dispatchEvent(new Event('studio:assembly'));
      }
      // Ignore sub-pixel progress changes to avoid needless style recalculation.
      if(el.vzSceneProgress===undefined || Math.abs(el.vzSceneProgress-progress)>0.003){
        el.vzSceneProgress=progress;
        el.style.setProperty('--scene-progress',progress.toFixed(3));
        el.style.setProperty('--vz-in-view',((progress * 2 - 1) * 14).toFixed(2) + 'px');
      }
    }
    // All scroll-linked layers are driven by the shared Lenis/scroll event.
  }

  const hasObserver = typeof IntersectionObserver === 'function';
  const sceneObserver = hasObserver && new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (!target.isConnected) continue;
      if (isIntersecting) visible.add(target);
      else visible.delete(target);
    }
    schedule();
  }, {rootMargin: '80px 0px'});
  const entrances = hasObserver && new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('vz-entered');
      entrances.unobserve(entry.target);
    }
  }, {threshold: 0.04});

  function refresh() {
    atmosphere();
    mountStudy();
    const hero = main.querySelector('.logo-stage-hero');
    if (hero && !hero.querySelector('.studio-orbits')) {
      const orbits = document.createElement('div');
      orbits.className = 'studio-orbits';
      orbits.setAttribute('aria-hidden', 'true');
      orbits.innerHTML = '<i class="orbit-track"><b></b></i><i class="orbit-track"><b></b></i>';
      hero.prepend(orbits);
    }
    if (sceneObserver) sceneObserver.disconnect();
    if (entrances) entrances.disconnect();
    visible.clear();
    tracked = [...main.querySelectorAll(sceneSelector)];
    for (const el of tracked) {
      if (sceneObserver) sceneObserver.observe(el);
      else visible.add(el);
    }
    if (entrances) {
      for (const el of main.querySelectorAll(entranceSelector)) {
        el.classList.add('vz-enter');
        entrances.observe(el);
      }
    }
    schedule();
  }

  function sync() {
    cancelFrame();
    frame = 0;
    lastPaint = 0;
    if (full()) { schedule(); return; }
    if (document.hidden) return;
    backdrop?.style.removeProperty('--vz-flow-y');
    backdrop?.style.removeProperty('--vz-flow-reverse');
    for (const el of tracked) {
      if(el.classList.contains('assembly-sequence')){
        delete el.assemblyProgress;delete el.dataset.chapter;el.style.removeProperty('--assembly-progress');
      }
      delete el.vzSceneProgress;
      el.style.removeProperty('--scene-progress');
      el.style.removeProperty('--vz-in-view');
    }
  }

  document.addEventListener('studio:route', refresh);
  document.addEventListener('visibilitychange', sync);
  window.StudioMotion?.addEventListener('change', sync);
  window.addEventListener('pageshow', sync);
  window.addEventListener('scroll', schedule, {passive: true});
  // During Lenis animation, subscribe to its actual interpolated scroll progress.
  clock?.subscribeScroll(schedule);
  window.addEventListener('resize', schedule, {passive: true});
  if (typeof ResizeObserver === 'function') new ResizeObserver(schedule).observe(main);
  refresh();
})();
