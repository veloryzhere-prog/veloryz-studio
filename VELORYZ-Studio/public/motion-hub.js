'use strict';
/**
 * VELORYZ Motion Hub: all motion, one page.
 * One master requestAnimationFrame loop drives every chapter; canvases and heavy work only run while visible.
 * Smooth scrolling uses the site's vendored Lenis (window.Lenis) when present and falls back to native scrolling.
 * Honours prefers-reduced-motion (with an explicit "play anyway" opt-in) and a Motion on/off toggle.
 */
(() => {
 const $ = (s, r = document) => r.querySelector(s);
 const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
 const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
 const lerp = (a, b, t) => a + (b - a) * t;
 const rnd = (a, b) => a + Math.random() * (b - a);
 const root = document.documentElement;
 const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
 const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
 const EASE = 'cubic-bezier(.16,1,.3,1)';
 let optIn = !!window.__VZ_HUB_PREVIEW, motionOff = false; // the standalone preview plays motion even if the device asks for less
 const reduced = () => (mqReduce.matches && !optIn) || motionOff;
 const canAnimate = typeof Element.prototype.animate === 'function';
 const TEST = !!window.__VZ_HUB_TEST, PREVIEW = !!window.__VZ_HUB_PREVIEW;
 // Preview mode (the embedded demo only): links play their transition but stay on the page, with a short notice.
 const toast = msg => {
  let t = document.getElementById('hub-toast');
  if (!t) { t = document.createElement('div'); t.id = 'hub-toast'; t.style.cssText = 'position:fixed;left:50%;bottom:22px;translate:-50% 0;z-index:9600;background:#f6efe3;color:#07060a;padding:12px 20px;border-radius:99px;font:600 .82rem Inter Tight,system-ui,sans-serif;box-shadow:0 20px 50px -10px rgba(0,0,0,.7);transition:opacity .4s;pointer-events:none;white-space:nowrap'; document.body.append(t); }
  t.textContent = msg; t.style.opacity = 1; clearTimeout(t._h); t._h = setTimeout(() => { t.style.opacity = 0; }, 2800);
 };

 /* ------------------------------------------------------------------ shared state */
 const S = { w: innerWidth, h: innerHeight, mx: innerWidth / 2, my: innerHeight / 2, moved: 0, down: false, sy: scrollY, svel: 0, t: 0, dt: .016 };
 addEventListener('resize', () => { S.w = innerWidth; S.h = innerHeight; for (const fn of resizers) fn(); }, { passive: true });
 const resizers = [];
 const subs = [];
 const tick = fn => subs.push(fn);

 /* ------------------------------------------------------------------ smooth scroll (Lenis) + master loop */
 let lenis = null;
 function initScroll() {
  if (reduced() || typeof window.Lenis !== 'function') return;
  try {
   lenis = new window.Lenis({ autoRaf: false, lerp: .09, wheelMultiplier: .95, smoothWheel: true, syncTouch: false, anchors: false });
   root.classList.add('lenis', 'lenis-smooth');
  } catch (_) { lenis = null; }
 }
 const scrollToY = (y, dur = 1.5) => {
  if (lenis) lenis.scrollTo(y, { duration: dur, easing: t => 1 - Math.pow(1 - t, 4) });
  else scrollTo({ top: y, behavior: reduced() ? 'auto' : 'smooth' });
 };
 const scrollToEl = (el, off = 0) => scrollToY(el.getBoundingClientRect().top + scrollY + off);
 let last = 0;
 function loop(t) {
  requestAnimationFrame(loop);
  if (document.hidden) { last = 0; return; }
  S.dt = clamp((t - (last || t)) / 1000, .001, .05);
  last = t; S.t = t / 1000;
  if (lenis) lenis.raf(t);
  const y = scrollY;
  S.svel = lerp(S.svel, (y - S.sy) / S.dt, clamp(S.dt * 9, 0, 1));
  S.sy = y;
  for (let i = 0; i < subs.length; i++) subs[i](S);
 }

 /* ------------------------------------------------------------------ visibility helper */
 function watch(el, margin = '120px') {
  const st = { vis: false };
  new IntersectionObserver(es => { st.vis = es[0].isIntersecting; }, { rootMargin: margin + ' 0px ' + margin + ' 0px' }).observe(el);
  return st;
 }

 /* ------------------------------------------------------------------ pointer */
 addEventListener('pointermove', e => { S.mx = e.clientX; S.my = e.clientY; S.moved = performance.now(); }, { passive: true });
 addEventListener('pointerdown', () => { S.down = true; }, { passive: true });
 addEventListener('pointerup', () => { S.down = false; }, { passive: true });
 addEventListener('pointercancel', () => { S.down = false; }, { passive: true });

 /* ------------------------------------------------------------------ text splitting + reveal */
 function wrapWord(tok, i) {
  const wd = document.createElement('span'); wd.className = 'wd'; wd.setAttribute('aria-hidden', 'true');
  const wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--i', i); wi.textContent = tok;
  wd.append(wi); return wd;
 }
 function splitHeading(el) {
  const label = el.textContent.replace(/\s+/g, ' ').trim();
  let i = 0; const out = [];
  el.childNodes.forEach(n => {
   const target = n.nodeType === 3 ? null : n.cloneNode(false);
   const push = n.nodeType === 3 ? x => out.push(x) : x => target.append(x);
   n.textContent.split(/(\s+)/).forEach(tok => {
    if (!tok) return;
    if (/^\s+$/.test(tok)) push(document.createTextNode(' '));
    else push(wrapWord(tok, i++));
   });
   if (target) out.push(target);
  });
  el.textContent = '';
  out.forEach(n => el.append(n));
  el.setAttribute('aria-label', label);
 }
 const held = [];
 function initReveal() {
  $$('[data-split]').forEach(splitHeading);
  $$('[data-reveal]').forEach((el, i) => { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', String((i % 4) * 90)); });
  const io = new IntersectionObserver(es => es.forEach(e => {
   if (!e.isIntersecting) return;
   io.unobserve(e.target);
   // The hero waits for the loader curtain to open before it builds in.
   if (e.target.closest('#top') && !root.classList.contains('hub-ready')) held.push(e.target); else e.target.classList.add('in');
  }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal],[data-split]').forEach(el => io.observe(el));
  // Safety net: anything on screen for more than a moment is shown, whatever the observer did.
  setInterval(() => $$('[data-reveal]:not(.in),[data-split]:not(.in)').forEach(el => {
   if (el.closest('#top') && !root.classList.contains('hub-ready')) return;
   const r = el.getBoundingClientRect();
   if (r.top < S.h * .96 && r.bottom > 0) el.classList.add('in');
  }), 1500);
 }

 /* ------------------------------------------------------------------ chapters: rail, progress, background hue */
 const chapters = [];
 let hue = 12, hueTarget = 12, activeCh = -1;
 function initChapters() {
  const rail = $('#hub-rail');
  $$('.ch[data-ch]').forEach((el, i) => {
   const b = document.createElement('button');
   b.type = 'button'; b.setAttribute('aria-label', 'Go to chapter: ' + el.dataset.ch);
   b.innerHTML = '<span></span><i></i>'; b.firstChild.textContent = el.dataset.ch;
   b.addEventListener('click', () => scrollToEl(el));
   rail.append(b);
   chapters.push({ el, btn: b, hue: +el.dataset.hue || 12 });
  });
  const bar = $('.hub-progress i');
  tick(() => {
   const mid = S.h * .5;
   let idx = 0;
   for (let i = 0; i < chapters.length; i++) if (chapters[i].el.getBoundingClientRect().top <= mid) idx = i;
   if (idx !== activeCh) {
    chapters.forEach((c, i) => c.btn.classList.toggle('on', i === idx));
    const b = chapters[idx].btn; b.classList.add('flash'); setTimeout(() => b.classList.remove('flash'), 1500);
    activeCh = idx; hueTarget = chapters[idx].hue;
   }
   const max = document.documentElement.scrollHeight - S.h;
   bar.style.transform = 'scaleX(' + (max > 0 ? clamp(S.sy / max, 0, 1) : 0).toFixed(4) + ')';
   if (Math.abs(hueTarget - hue) > .05) { hue += (hueTarget - hue) * clamp(S.dt * 1.6, 0, 1); root.style.setProperty('--hue', hue.toFixed(2)); }
  });
 }

 /* ------------------------------------------------------------------ loader */
 function initLoader() {
  const L = $('#hub-loader');
  const finish = () => { root.classList.add('hub-ready'); held.splice(0).forEach((el, i) => setTimeout(() => el.classList.add('in'), 120 + i * 110)); };
  if (reduced() || TEST) { L.classList.add('gone'); finish(); return; }
  const n = $('.n', L); let opened = false;
  const open = () => {
   if (opened) return; opened = true;
   L.classList.add('open'); finish();
   setTimeout(() => L.classList.add('gone'), 1500);
  };
  const t0 = performance.now(), total = 2100;
  const step = () => {
   if (opened) return;
   const p = Math.min(1, 1 - Math.pow(1 - (performance.now() - t0) / total, 3));
   n.textContent = String(Math.round(p * 100)).padStart(3, '0');
   L.style.setProperty('--p', p);
   if (p < 1) requestAnimationFrame(step); else setTimeout(open, 250);
  };
  requestAnimationFrame(step);
  $('#hub-skip').addEventListener('click', open);
  addEventListener('keydown', open, { once: true });
  setTimeout(open, 5000);
  setTimeout(finish, 7000);
 }

 /* ------------------------------------------------------------------ cursor, trail and click starburst */
 const cur = $('#hub-cur'), curD = $('.d', cur), curR = $('.r', cur), curT = $('.t', cur);
 const trailCv = $('#hub-trail'), tctx = trailCv.getContext('2d');
 const trail = []; let rx = S.mx, ry = S.my, tdpr = 1;
 const cursorOn = () => mqFine.matches && !reduced();
 function sizeTrail() { tdpr = Math.min(2, devicePixelRatio || 1); trailCv.width = S.w * tdpr; trailCv.height = S.h * tdpr; tctx.setTransform(tdpr, 0, 0, tdpr, 0, 0); }
 resizers.push(sizeTrail);
 function initCursor() {
  sizeTrail();
  addEventListener('pointermove', e => {
   if (e.pointerType !== 'mouse') return;
   if (!cursorOn()) { root.classList.remove('hub-cur-on'); cur.classList.add('hide'); return; }
   root.classList.add('hub-cur-on'); cur.classList.remove('hide');
   const t = e.target instanceof Element ? e.target : null;
   const lab = t && t.closest('[data-drag-label]');
   const link = t && t.closest('a,button,[data-hover],.chip,.kbtn,input[type=range],.rc,.j-node');
   curT.textContent = lab ? lab.dataset.dragLabel : '';
   cur.classList.toggle('label', !!lab && !link);
   cur.classList.toggle('link', !!link && !(lab && !link));
  }, { passive: true });
  addEventListener('pointerdown', () => cur.classList.add('down'), { passive: true });
  addEventListener('pointerup', () => cur.classList.remove('down'), { passive: true });
  document.documentElement.addEventListener('mouseleave', () => cur.classList.add('hide'));
  document.documentElement.addEventListener('mouseenter', () => { if (cursorOn()) cur.classList.remove('hide'); });
  tick(() => {
   if (!cursorOn()) { if (trail.length) { trail.length = 0; tctx.clearRect(0, 0, S.w, S.h); } return; }
   rx += (S.mx - rx) * clamp(S.dt * 14, 0, 1); ry += (S.my - ry) * clamp(S.dt * 14, 0, 1);
   curD.style.transform = 'translate(' + S.mx.toFixed(1) + 'px,' + S.my.toFixed(1) + 'px)';
   // `translate` is applied outside `scale`, so the hover-grow scale can't push the ring away from the pointer.
   curR.style.translate = rx.toFixed(1) + 'px ' + ry.toFixed(1) + 'px';
   curT.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
   const now = performance.now();
   if (now - S.moved < 700) { const l = trail[trail.length - 1]; if (!l || Math.hypot(rx - l.x, ry - l.y) > 1.5) trail.push({ x: rx, y: ry, t: now }); }
   while (trail.length && now - trail[0].t > 460) trail.shift();
   tctx.clearRect(0, 0, S.w, S.h);
   if (trail.length < 2) return;
   tctx.lineCap = 'round';
   for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1], b = trail[i], life = 1 - (now - b.t) / 460, pos = i / trail.length;
    tctx.strokeStyle = 'rgba(255,' + Math.round(120 + pos * 90) + ',' + Math.round(60 + pos * 40) + ',' + (life * .7).toFixed(3) + ')';
    tctx.lineWidth = 1 + 6 * pos * life;
    tctx.beginPath(); tctx.moveTo(a.x, a.y); tctx.lineTo(b.x, b.y); tctx.stroke();
   }
  });
 }
 function fxEl(cls, css) {
  const el = document.createElement('i');
  el.className = 'fx ' + (cls || ''); el.setAttribute('aria-hidden', 'true');
  if (css) el.style.cssText = css;
  document.body.append(el); return el;
 }
 function run(el, frames, opts) { const a = el.animate(frames, Object.assign({ fill: 'both' }, opts)); a.onfinish = () => el.remove(); return a; }
 // Global click design: expanding double ring + radial rays + centre pulse.
 function starburst(x, y) {
  if (!canAnimate || reduced()) return;
  [[0, 90, 2], [120, 56, 1.2]].forEach(([delay, size, w]) => {
   const r = fxEl('', 'width:' + size + 'px;height:' + size + 'px;border-radius:50%;border:' + w + 'px solid #ffb347;box-shadow:0 0 24px rgba(226,72,43,.55)');
   run(r, [{ transform: 'translate(' + (x - size / 2) + 'px,' + (y - size / 2) + 'px) scale(.1)', opacity: .95 }, { transform: 'translate(' + (x - size / 2) + 'px,' + (y - size / 2) + 'px) scale(1.7)', opacity: 0 }], { duration: 700, delay, easing: EASE });
  });
  const n = 10;
  for (let i = 0; i < n; i++) {
   const ang = (360 / n) * i + rnd(-8, 8), len = rnd(14, 26), d0 = 14, d1 = rnd(46, 84);
   const ray = fxEl('', 'width:2px;height:' + len + 'px;border-radius:2px;background:linear-gradient(#ffb347,#e2482b)');
   run(ray, [
    { transform: 'translate(' + (x - 1) + 'px,' + (y - len / 2) + 'px) rotate(' + ang + 'deg) translateY(-' + d0 + 'px) scaleY(.2)', opacity: 1 },
    { transform: 'translate(' + (x - 1) + 'px,' + (y - len / 2) + 'px) rotate(' + ang + 'deg) translateY(-' + d1 + 'px) scaleY(1)', opacity: 0 }
   ], { duration: rnd(480, 720), easing: EASE });
  }
  const dot = fxEl('', 'width:12px;height:12px;border-radius:50%;background:#fff');
  run(dot, [{ transform: 'translate(' + (x - 6) + 'px,' + (y - 6) + 'px) scale(1)', opacity: 1 }, { transform: 'translate(' + (x - 6) + 'px,' + (y - 6) + 'px) scale(0)', opacity: 0 }], { duration: 380, easing: 'ease-out' });
 }
 addEventListener('pointerdown', e => {
  if (e.button !== 0 || e.target.closest('input,textarea,.kbtn,[data-noburst]')) return;
  starburst(e.clientX, e.clientY);
 }, { passive: true });

 /* ------------------------------------------------------------------ magnetic + liquid buttons */
 function initButtons() {
  $$('.mbtn').forEach(b => {
   const setO = e => { const r = b.getBoundingClientRect(); b.style.setProperty('--bx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); b.style.setProperty('--by', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); };
   b.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; setO(e); if (b.hasAttribute('data-mag') && !reduced()) b.classList.add('mag-on'); });
   b.addEventListener('pointerleave', e => { if (e.pointerType !== 'mouse') return; setO(e); b.classList.remove('mag-on'); b.style.translate = ''; });
   b.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !b.hasAttribute('data-mag') || reduced()) return;
    const r = b.getBoundingClientRect();
    b.style.translate = ((e.clientX - (r.left + r.width / 2)) * .28).toFixed(1) + 'px ' + ((e.clientY - (r.top + r.height / 2)) * .4).toFixed(1) + 'px';
   });
  });
 }

 /* ------------------------------------------------------------------ marquees (scroll-velocity driven) */
 function initMarquees() {
  $$('[data-marquee]').forEach(el => {
   const mt = $('.mt', el), words = (el.dataset.words || '').split(',');
   const group = words.map(w => '<span>' + w + '<b>\u2726</b></span>').join('');
   const st = { off: 0, dir: +(el.dataset.dir || 1), speed: +(el.dataset.speed || 70), slow: 1, slowT: 1, gw: 0, k: 1, skew: 0, vis: watch(el) };
   const build = () => {
    mt.innerHTML = group; st.gw = mt.scrollWidth || 1;
    st.k = Math.max(1, Math.ceil((S.w * 1.3) / st.gw));
    mt.innerHTML = group.repeat(st.k * 2); st.span = st.gw * st.k;
   };
   build(); resizers.push(build);
   el.addEventListener('pointerenter', () => { st.slowT = .2; });
   el.addEventListener('pointerleave', () => { st.slowT = 1; });
   el.addEventListener('click', () => { st.dir *= -1; });
   tick(() => {
    if (!st.vis.vis) return;
    st.slow += (st.slowT - st.slow) * clamp(S.dt * 6, 0, 1);
    const sp = reduced() ? 0 : st.speed * st.dir * st.slow + S.svel * .11 * st.dir;
    st.off = (st.off + sp * S.dt) % st.span; if (st.off < 0) st.off += st.span;
    st.skew += (clamp(S.svel * .004, -9, 9) - st.skew) * clamp(S.dt * 8, 0, 1);
    mt.style.transform = 'translate3d(' + (-st.off).toFixed(2) + 'px,0,0) skewX(' + (reduced() ? 0 : -st.skew).toFixed(2) + 'deg)';
   });
  });
 }

 /* ------------------------------------------------------------------ hero: physics letters */
 function initMega() {
  const el = $('#mega'), txt = el.textContent;
  el.textContent = '';
  const L = [...txt].map((ch, idx) => {
   const s = document.createElement('span'); s.className = 'mg'; s.setAttribute('aria-hidden', 'true'); s.style.setProperty('--i', idx); s.textContent = ch; el.append(s);
   return { el: s, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0 };
  });
  const vis = watch(el);
  const kick = (cx, cy, power) => L.forEach(l => {
   const b = el.getBoundingClientRect(), lx = b.left + l.el.offsetLeft + l.el.offsetWidth / 2, ly = b.top + l.el.offsetTop + l.el.offsetHeight / 2;
   const dx = lx - cx, dy = ly - cy, d = Math.hypot(dx, dy) || 1;
   l.vx += dx / d * power * rnd(.7, 1.3); l.vy += dy / d * power * rnd(.7, 1.3); l.vr += rnd(-1, 1) * power * .03;
  });
  addEventListener('pointerdown', e => { if (vis.vis && !reduced() && el.getBoundingClientRect().bottom > e.clientY && e.clientY > el.getBoundingClientRect().top - 40) kick(e.clientX, e.clientY, 900); }, { passive: true });
  el.addEventListener('click', () => kick(S.mx, S.my, 700));
  const heroInner = $('#top');
  tick(() => {
   if (!vis.vis) return;
   const b = el.getBoundingClientRect(), active = !reduced() && performance.now() - S.moved < 3000;
   for (const l of L) {
    let ax = -l.x * 60, ay = -l.y * 60;
    if (active) {
     const lx = b.left + l.el.offsetLeft + l.el.offsetWidth / 2, ly = b.top + l.el.offsetTop + l.el.offsetHeight / 2;
     const dx = lx - S.mx, dy = ly - S.my, d = Math.hypot(dx, dy) || 1, R = 300;
     if (d < R) { const f = Math.pow(1 - d / R, 2) * 5200; ax += dx / d * f; ay += dy / d * f; }
    }
    l.vx = (l.vx + ax * S.dt) * Math.pow(.0009, S.dt); l.vy = (l.vy + ay * S.dt) * Math.pow(.0009, S.dt);
    l.vr = (l.vr - l.r * 70 * S.dt + clamp(l.vx * .0009, -.1, .1)) * Math.pow(.002, S.dt);
    l.x += l.vx * S.dt; l.y += l.vy * S.dt; l.r += l.vr * S.dt * 60;
    l.el.style.transform = 'translate3d(' + l.x.toFixed(2) + 'px,' + l.y.toFixed(2) + 'px,0) rotate(' + l.r.toFixed(2) + 'deg)';
   }
   if (!reduced()) { const p = clamp(S.sy / S.h, 0, 1.2); el.style.translate = '0 ' + (p * 14).toFixed(2) + 'vh'; }
  });
 }

 /* ------------------------------------------------------------------ 01 particle field */
 function groupChips(sel, fn) {
  const chips = $$(sel + ' .chip');
  chips.forEach(c => c.addEventListener('click', () => { chips.forEach(x => x.classList.toggle('on', x === c)); fn(c.dataset.v); }));
 }
 function initField() {
  const cv = $('#field-cv'), ctx = cv.getContext('2d'), vis = watch(cv, '60px');
  const PAL = [['#e2482b', '#ffb347', '#ff4d8d'], ['#46d9ff', '#8b5cff', '#3ee6a8'], ['#f6efe3', '#8a8478', '#ffffff']];
  let W = 0, H = 0, dpr = 1, mode = 'attract', pal = 0, groups = [[], [], []]; const rings = []; let painted = false;
  function size() {
   const r = cv.getBoundingClientRect(); dpr = Math.min(1.6, devicePixelRatio || 1);
   W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
   ctx.fillStyle = '#07060a'; ctx.fillRect(0, 0, W, H);
   const n = Math.round(clamp(W * H / 650, 500, 1500)); groups = [[], [], []];
   for (let i = 0; i < n; i++) groups[i % 3].push({ x: rnd(0, W), y: rnd(0, H), vx: 0, vy: 0 });
   painted = false;
  }
  resizers.push(size); size();
  groupChips('[data-group="mode"]', v => { mode = v; ctx.fillStyle = '#07060a'; ctx.fillRect(0, 0, W, H); });
  groupChips('[data-group="palette"]', v => { pal = +v; });
  cv.addEventListener('pointerdown', e => {
   const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
   rings.push({ x, y, t: 0 });
   for (const g of groups) for (const p of g) { const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1; if (d < 300) { const f = (1 - d / 300) * 14; p.vx += dx / d * f; p.vy += dy / d * f; } }
  });
  tick(() => {
   if (!vis.vis) return;
   if (reduced()) { if (!painted) { painted = true; ctx.fillStyle = '#07060a'; ctx.fillRect(0, 0, W, H); groups.forEach((g, ci) => { ctx.fillStyle = PAL[pal][ci]; g.forEach(p => ctx.fillRect(p.x, p.y, 2, 2)); }); } return; }
   const r = cv.getBoundingClientRect(), px = S.mx - r.left, py = S.my - r.top;
   const inside = px >= 0 && py >= 0 && px <= W && py <= H && performance.now() - S.moved < 2500;
   ctx.globalCompositeOperation = 'source-over';
   ctx.fillStyle = mode === 'ink' ? 'rgba(7,6,10,.035)' : 'rgba(7,6,10,.17)'; ctx.fillRect(0, 0, W, H);
   ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = mode === 'ink' ? 2 : 1.2; ctx.globalAlpha = .75;
   const t = S.t, boost = S.down ? 2.6 : 1;
   groups.forEach((g, ci) => {
    ctx.strokeStyle = PAL[pal][ci]; ctx.beginPath();
    for (const p of g) {
     const a = Math.sin(p.x * .0035 + t * .3) * Math.cos(p.y * .0035 - t * .25) * 6.2832;
     p.vx += Math.cos(a) * .07; p.vy += Math.sin(a) * .07;
     if (inside) {
      const dx = px - p.x, dy = py - p.y, d2 = dx * dx + dy * dy;
      if (d2 < 52900) {
       const d = Math.sqrt(d2) || 1, f = (1 - d / 230) * boost, ux = dx / d, uy = dy / d;
       if (mode === 'attract' || mode === 'ink') { p.vx += ux * f * .9; p.vy += uy * f * .9; }
       else if (mode === 'repel') { p.vx -= ux * f * 1.6; p.vy -= uy * f * 1.6; }
       else { p.vx += (-uy * 1.1 + ux * .25) * f; p.vy += (ux * 1.1 + uy * .25) * f; }
      }
     }
     p.vx *= .955; p.vy *= .955; p.x += p.vx; p.y += p.vy;
     if (p.x < 0) p.x += W; else if (p.x > W) p.x -= W;
     if (p.y < 0) p.y += H; else if (p.y > H) p.y -= H;
     ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
    }
    ctx.stroke();
   });
   ctx.globalAlpha = 1;
   for (let i = rings.length - 1; i >= 0; i--) {
    const q = rings[i]; q.t += S.dt * 1.4;
    if (q.t > 1) { rings.splice(i, 1); continue; }
    ctx.strokeStyle = 'rgba(255,255,255,' + (1 - q.t).toFixed(3) + ')'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(q.x, q.y, q.t * 260, 0, 6.2832); ctx.stroke();
   }
  });
 }

 /* ------------------------------------------------------------------ 02 scroll journey */
 const JOURNEY = [
  { t: 'Discover', p: 'Audience, goals and a brief sharp enough to design against.', href: '/book/', lab: 'Plan a conversation' },
  { t: 'Design', p: 'Direction, interface and brand systems built to feel considered.', href: '/design/', lab: 'Browse the designs' },
  { t: 'Motion', p: 'Scroll, hover and page choreography that supports the content.', href: '/motion/', lab: 'Open the Motion Lab' },
  { t: 'Build', p: 'Fast, accessible, production-ready code with the motion wired in.', href: '/create/', lab: 'Start a project' },
  { t: 'Launch', p: 'Release, measure and keep improving with a team that stays.', href: '/contact/', lab: 'Talk to the studio' }
 ];
 function initJourney() {
  const sec = $('#journey'), base = $('#j-base'), prog = $('#j-prog'), glow = $('#j-glow'), orbg = $('#j-orbg'), orb = $('#j-orb'), nodes = $('#j-nodes'), panel = $('#j-panel');
  const steps = $('#j-steps'), ix = $('#j-ix'), tt = $('#j-t'), pp = $('#j-p'), link = $('#j-link'), vis = watch(sec, '0px');
  const L = base.getTotalLength(), stops = [.06, .28, .5, .73, .94], NS = 'http://www.w3.org/2000/svg';
  prog.style.strokeDasharray = L; prog.style.strokeDashoffset = L; glow.style.strokeDasharray = L; glow.style.strokeDashoffset = L;
  const nodeEls = [], stepEls = [];
  const jump = i => { const rect = sec.getBoundingClientRect(), total = rect.height - S.h; scrollToY(rect.top + scrollY + stops[i] * total + 2, 1.8); };
  stops.forEach((s, i) => {
   const pt = base.getPointAtLength(L * s);
   const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'j-node'); g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', 'Journey stage ' + (i + 1) + ': ' + JOURNEY[i].t);
   g.innerHTML = '<circle class="p" cx="' + pt.x + '" cy="' + pt.y + '" r="22"/><circle class="o" cx="' + pt.x + '" cy="' + pt.y + '" r="22"/><text x="' + pt.x + '" y="' + (pt.y + 5) + '">' + (i + 1) + '</text>';
   g.addEventListener('click', () => jump(i)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jump(i); } });
   nodes.append(g); nodeEls.push(g);
   const b = document.createElement('button'); b.type = 'button'; b.textContent = String(i + 1).padStart(2, '0'); b.setAttribute('aria-label', 'Stage ' + (i + 1) + ': ' + JOURNEY[i].t);
   b.addEventListener('click', () => jump(i)); steps.append(b); stepEls.push(b);
  });
  let cur = -1;
  const setStage = i => {
   const j = JOURNEY[i];
   nodeEls.forEach((n, k) => n.classList.toggle('on', k <= i)); stepEls.forEach((b, k) => b.classList.toggle('on', k === i));
   panel.classList.add('swap');
   setTimeout(() => { ix.textContent = String(i + 1).padStart(2, '0'); tt.textContent = j.t; pp.textContent = j.p; link.textContent = j.lab + ' \u2197'; link.setAttribute('href', j.href); panel.classList.remove('swap'); }, reduced() ? 0 : 260);
  };
  setStage(0); cur = 0;
  const floats = $$('.j-float', sec).map(el => ({ el, k: +el.dataset.speed }));
  tick(() => {
   if (!vis.vis) return;
   const rect = sec.getBoundingClientRect(), total = rect.height - S.h;
   const p = clamp(-rect.top / (total || 1), 0, 1);
   const pt = base.getPointAtLength(L * p);
   orb.setAttribute('cx', pt.x); orb.setAttribute('cy', pt.y); orbg.setAttribute('cx', pt.x); orbg.setAttribute('cy', pt.y);
   prog.style.strokeDashoffset = L * (1 - p); glow.style.strokeDashoffset = L * (1 - p);
   let idx = 0; stops.forEach((s, i) => { if (p >= s - .035) idx = i; });
   if (idx !== cur) { cur = idx; setStage(idx); }
   if (!reduced()) floats.forEach(f => { f.el.style.translate = (S.mx / S.w - .5) * 40 * f.k + 'px ' + ((p - .5) * S.h * f.k).toFixed(1) + 'px'; });
  });
 }

 /* ------------------------------------------------------------------ 03 scarf studio */
 function initScarf() {
  const cv = $('#scarf-cv'), ctx = cv.getContext('2d'), vis = watch(cv, '60px');
  const PALS = [[[255, 154, 60], [226, 72, 43]], [[120, 134, 255], [34, 35, 122]], [[255, 122, 168], [163, 32, 79]], [[68, 224, 168], [13, 107, 82]]];
  const N = 48; let W = 0, H = 0, dpr = 1, seg = 14, pal = 0, wind = .45, pinned = false, drawnOnce = false;
  const pts = [], head = { x: 0, y: 0 };
  function init() {
   pts.length = 0;
   for (let i = 0; i < N; i++) pts.push({ x: W * .3 - i * seg * .9, y: H * .5, px: W * .3 - i * seg * .9, py: H * .5 });
   head.x = W * .3; head.y = H * .5;
  }
  function size() {
   const r = cv.getBoundingClientRect(); dpr = Math.min(1.6, devicePixelRatio || 1);
   W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
   seg = clamp(W / 58, 9, 19); init(); drawnOnce = false;
  }
  resizers.push(size); size();
  groupChips('[data-group="scarf"]', v => { pal = +v; });
  $('#scarf-wind').addEventListener('input', e => { wind = e.target.value / 100; });
  const flutter = amt => pts.forEach((p, i) => { p.px += rnd(-1, 1) * amt * (i / N + .2); p.py += rnd(-1, 1) * amt * (i / N + .2); });
  $('#scarf-flutter').addEventListener('click', () => flutter(46));
  const pinBtn = $('#scarf-pin');
  pinBtn.addEventListener('click', () => { pinned = !pinned; pinBtn.classList.toggle('on', pinned); pinBtn.setAttribute('aria-pressed', String(pinned)); });
  cv.addEventListener('pointerdown', () => flutter(30));
  function simulate(wd, tx, ty, dt) {
   head.x += (tx - head.x) * clamp(dt * 5, 0, 1); head.y += (ty - head.y) * clamp(dt * 5, 0, 1);
   for (let s = 0; s < 2; s++) {
    pts[0].x = head.x; pts[0].y = head.y; pts[0].px = head.x; pts[0].py = head.y;
    for (let i = 1; i < N; i++) {
     const p = pts[i], vx = (p.x - p.px) * .983, vy = (p.y - p.py) * .983;
     p.px = p.x; p.py = p.y;
     p.x += vx + Math.sin(S.t * 1.3 + i * .22) * wd * .55;
     p.y += vy + .2 + Math.cos(S.t * 1.7 + i * .3) * wd * .45;
    }
    for (let k = 0; k < 6; k++) {
     for (let i = 1; i < N; i++) {
      const a = pts[i - 1], b = pts[i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, diff = (d - seg) / d;
      if (i === 1) { b.x -= dx * diff; b.y -= dy * diff; } else { a.x += dx * diff * .5; a.y += dy * diff * .5; b.x -= dx * diff * .5; b.y -= dy * diff * .5; }
     }
     pts[0].x = head.x; pts[0].y = head.y;
    }
   }
  }
  function draw(wd) {
   ctx.clearRect(0, 0, W, H);
   const [front, back] = PALS[pal], Lp = [], Rp = [], folds = [];
   const maxW = clamp(W / 10.5, 46, 104);
   for (let i = 0; i < N; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)], tx = b.x - a.x, ty = b.y - a.y, tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl, ny = tx / tl, taper = 1 - clamp((i - (N - 10)) / 10, 0, 1) * .32;
    const w = maxW * (.5 + .5 * Math.sin(i / (N - 1) * 2.7 + .35)) * taper;
    const tw = i * .4 - S.t * (1.3 + wd * 3) + Math.sin(S.t + i * .1) * .6, fold = Math.cos(tw), half = w * .5 * fold;
    Lp.push({ x: pts[i].x - nx * half, y: pts[i].y - ny * half }); Rp.push({ x: pts[i].x + nx * half, y: pts[i].y + ny * half }); folds.push(fold);
   }
   for (let i = 0; i < N - 1; i++) {
    const f = (folds[i] + folds[i + 1]) / 2, col = f >= 0 ? front : back, shade = .5 + .5 * Math.abs(f);
    const rgb = 'rgb(' + (col[0] * shade | 0) + ',' + (col[1] * shade | 0) + ',' + (col[2] * shade | 0) + ')';
    ctx.fillStyle = rgb; ctx.strokeStyle = rgb; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(Lp[i].x, Lp[i].y); ctx.lineTo(Lp[i + 1].x, Lp[i + 1].y); ctx.lineTo(Rp[i + 1].x, Rp[i + 1].y); ctx.lineTo(Rp[i].x, Rp[i].y); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (i % 4 === 0) { ctx.fillStyle = 'rgba(255,255,255,' + (.1 * Math.abs(f)).toFixed(3) + ')'; ctx.fill(); }
   }
   // fringe at the tail
   const e = pts[N - 1], ep = pts[N - 2], ex = e.x - ep.x, ey = e.y - ep.y, el = Math.hypot(ex, ey) || 1, ux = ex / el, uy = ey / el;
   ctx.strokeStyle = 'rgba(' + front[0] + ',' + front[1] + ',' + front[2] + ',.9)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
   for (let k = 0; k <= 8; k++) {
    const t = k / 8, bx = lerp(Lp[N - 1].x, Rp[N - 1].x, t), by = lerp(Lp[N - 1].y, Rp[N - 1].y, t), len = 14 + Math.sin(k * 1.7 + S.t * 3) * 4;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + ux * len + Math.sin(S.t * 4 + k) * 2, by + uy * len + Math.cos(S.t * 3 + k) * 2); ctx.stroke();
   }
   ctx.fillStyle = 'rgba(255,179,71,.22)'; ctx.beginPath(); ctx.arc(head.x, head.y, 13, 0, 6.2832); ctx.fill();
   ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.arc(head.x, head.y, 4.5, 0, 6.2832); ctx.fill();
  }
  tick(() => {
   if (!vis.vis) return;
   if (reduced()) { if (!drawnOnce) { drawnOnce = true; for (let i = 0; i < 160; i++) simulate(wind, W * .5 + Math.cos(i * .05) * W * .2, H * .5, .016); draw(wind); } return; }
   const r = cv.getBoundingClientRect(), recent = performance.now() - S.moved < 2500;
   const inside = S.mx >= r.left && S.mx <= r.right && S.my >= r.top && S.my <= r.bottom;
   let tx, ty;
   if ((inside && recent) || pinned) { tx = clamp(S.mx - r.left, 0, W); ty = clamp(S.my - r.top, 0, H); }
   else { tx = W * .5 + Math.cos(S.t * .55) * W * .3; ty = H * .5 + Math.sin(S.t * .9) * H * .22; }
   const wd = wind + clamp(Math.abs(S.svel) * .0004, 0, .5);
   simulate(wd, tx, ty, S.dt); draw(wd);
  });
 }

 /* ------------------------------------------------------------------ 04 type in motion */
 function letters(text) {
  let i = 0;
  return text.split(' ').map(w => '<span style="display:inline-block;white-space:nowrap">' + [...w].map(ch => '<span class="c2" style="--i:' + (i++) + '">' + ch + '</span>').join('') + '</span>').join(' ');
 }
 function scramble(el, finalText, dur = 900) {
  const glyphs = '!<>-_\\/[]{}=+*^?#%&', t0 = performance.now();
  const step = now => {
   const p = clamp((now - t0) / dur, 0, 1);
   el.textContent = [...finalText].map((ch, i) => (ch === ' ' || i < p * finalText.length * 1.15 ? ch : glyphs[(Math.random() * glyphs.length) | 0])).join('');
   if (p < 1) requestAnimationFrame(step); else el.textContent = finalText;
  };
  requestAnimationFrame(step);
 }
 function initType() {
  const grid = $('#tgrid');
  const T = [
   { k: 'Split rise', cls: 'rise', text: 'Motion is a language' },
   { k: 'Decode', cls: 'decode', text: 'Decode the signal' },
   { k: 'Wave', cls: 'wave', text: 'Ride the wave' },
   { k: 'Proximity', cls: 'prox', text: 'Come a little closer' },
   { k: 'Velocity skew', cls: 'vel', text: 'Scroll to bend me' },
   { k: 'Outline sweep', cls: 'sweep', text: 'Fill me in' }
  ];
  const prox = [], vel = [];
  T.forEach((d, n) => {
   const card = document.createElement('article'); card.className = 'tcard';
   card.innerHTML = '<div class="k"><span>' + String(n + 1).padStart(2, '0') + ' \u00B7 ' + d.k + '</span><button type="button" aria-label="Replay ' + d.k + '">\u21BB</button></div><div class="tb ' + d.cls + '"></div><div></div>';
   const tb = $('.tb', card), replay = $('button', card);
   if (d.cls === 'rise' || d.cls === 'wave' || d.cls === 'prox') { tb.innerHTML = letters(d.text); tb.setAttribute('aria-label', d.text); }
   else tb.textContent = d.text;
   if (d.cls === 'vel') { tb.innerHTML = '<span class="vel">' + d.text + '</span>'; vel.push($('.vel', tb)); }
   if (d.cls === 'prox') $$('.c2', tb).forEach(c => prox.push(c));
   const play = () => {
    if (d.cls === 'rise') { tb.classList.remove('play'); void tb.offsetWidth; tb.classList.add('play'); }
    else if (d.cls === 'decode') scramble(tb, d.text);
    else if (d.cls === 'sweep') { tb.classList.add('play'); setTimeout(() => tb.classList.remove('play'), 1400); }
    else card.animate([{ translate: '0 0' }, { translate: '0 -8px' }, { translate: '0 0' }], { duration: 500, easing: EASE });
   };
   replay.addEventListener('click', play);
   if (d.cls === 'decode') tb.addEventListener('pointerenter', () => scramble(tb, d.text));
   new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { play(); io.disconnect(); } }, { threshold: .5 }).observe(card);
   grid.append(card);
  });
  const vis = watch(grid, '40px');
  tick(() => {
   if (!vis.vis || reduced()) return;
   for (const c of prox) {
    const r = c.getBoundingClientRect(), d = Math.hypot(S.mx - (r.left + r.width / 2), S.my - (r.top + r.height / 2));
    const inf = clamp(1 - d / 170, 0, 1);
    c.style.scale = '1 ' + (1 + inf * .9).toFixed(3); c.style.translate = '0 ' + (-inf * 10).toFixed(2) + 'px'; c.style.color = inf > .15 ? 'hsl(' + (40 - inf * 25) + ' 95% 62%)' : '';
   }
   const sk = clamp(S.svel * .006, -14, 14);
   for (const v of vel) v.style.transform = 'skewX(' + (-sk).toFixed(2) + 'deg) scaleX(' + (1 + Math.min(Math.abs(S.svel) * .00018, .35)).toFixed(3) + ')';
  });
 }

 /* ------------------------------------------------------------------ 05 click feedback (ten designs) */
 const COLORS = ['#e2482b', '#ffb347', '#ff4d8d', '#46d9ff', '#3ee6a8', '#8b5cff', '#f6efe3'];
 function particles(x, y, o) {
  if (!canAnimate) return;
  for (let i = 0; i < o.n; i++) {
   const el = fxEl('', 'display:grid;place-items:center;line-height:1');
   const size = rnd(o.size[0], o.size[1]);
   if (o.glyph) { el.textContent = o.glyph; el.style.fontSize = size * 2.4 + 'px'; el.style.color = o.colors[i % o.colors.length]; }
   else { el.style.width = size + 'px'; el.style.height = (o.shape === 'rect' ? size * 1.8 : size) + 'px'; el.style.borderRadius = o.shape === 'rect' ? '2px' : '50%'; el.style.background = o.colors[i % o.colors.length]; }
   const ang = o.angle ? rnd(o.angle[0], o.angle[1]) : rnd(0, 6.2832), dist = rnd(o.dist[0], o.dist[1]), life = rnd(o.life[0], o.life[1]);
   const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist, g = o.gravity || 0, rot = o.rot ? rnd(-540, 540) : 0, sway = o.sway ? rnd(-30, 30) : 0;
   const at = (f, extra) => 'translate(' + (x + dx * f + (extra || 0)) + 'px,' + (y + dy * f + g * f * f) + 'px)';
   run(el, [
    { transform: at(0) + ' rotate(0deg) scale(.4)', opacity: 1 },
    { transform: at(.45, sway) + ' rotate(' + rot * .5 + 'deg) scale(1)', opacity: 1, offset: .45 },
    { transform: at(1, -sway) + ' rotate(' + rot + 'deg) scale(.3)', opacity: 0 }
   ], { duration: life, easing: 'cubic-bezier(.2,.7,.3,1)' });
  }
 }
 function ringFx(x, y, size, color, delay = 0, w = 2) {
  const el = fxEl('', 'width:' + size + 'px;height:' + size + 'px;border-radius:50%;border:' + w + 'px solid ' + color);
  run(el, [{ transform: 'translate(' + (x - size / 2) + 'px,' + (y - size / 2) + 'px) scale(.1)', opacity: .9 }, { transform: 'translate(' + (x - size / 2) + 'px,' + (y - size / 2) + 'px) scale(1.8)', opacity: 0 }], { duration: 750, delay, easing: EASE });
 }
 const KFX = [
  ['Ripple', 'A wave from the touch point', (b, x, y, lx, ly) => {
   const s = Math.max(b.offsetWidth, b.offsetHeight) * 2.2, r = document.createElement('span'); r.className = 'ripple';
   r.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (lx - s / 2) + 'px;top:' + (ly - s / 2) + 'px'; b.append(r);
   r.animate([{ transform: 'scale(0)', opacity: .55 }, { transform: 'scale(1)', opacity: 0 }], { duration: 800, easing: EASE }).onfinish = () => r.remove();
  }],
  ['Burst', 'Sixteen coloured dots', (b, x, y) => particles(x, y, { n: 16, dist: [60, 130], size: [4, 9], life: [550, 950], colors: COLORS })],
  ['Shockwave', 'Three expanding rings', (b, x, y) => { ringFx(x, y, 160, '#ffb347', 0, 3); ringFx(x, y, 160, '#ff4d8d', 110, 2); ringFx(x, y, 160, '#46d9ff', 220, 1.5); }],
  ['Confetti', 'Paper that falls', (b, x, y) => particles(x, y, { n: 44, dist: [140, 340], size: [5, 9], life: [1200, 1900], colors: COLORS, shape: 'rect', gravity: 280, rot: true, angle: [-2.6, -0.5] })],
  ['Ink', 'A colour floods in', (b, x, y, lx, ly) => {
   const ink = document.createElement('span'); ink.className = 'ink'; b.append(ink);
   ink.animate([{ clipPath: 'circle(0 at ' + lx + 'px ' + ly + 'px)' }, { clipPath: 'circle(150% at ' + lx + 'px ' + ly + 'px)' }], { duration: 650, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' })
    .onfinish = () => ink.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: 250, fill: 'forwards' }).onfinish = () => ink.remove();
  }],
  ['Jelly', 'Squash and spring', b => b.animate([{ scale: '1' }, { scale: '.9 1.1' }, { scale: '1.08 .93' }, { scale: '.97 1.03' }, { scale: '1' }], { duration: 750, easing: 'ease-in-out' })],
  ['Check', 'Confirm with a drawn tick', b => { b.classList.add('done'); setTimeout(() => b.classList.remove('done'), 1800); }],
  ['Hearts', 'Floating, swaying', (b, x, y) => particles(x, y, { n: 9, glyph: '\u2665', dist: [90, 200], size: [5, 9], life: [1300, 2000], colors: ['#ff4d8d', '#e2482b', '#ff8fb5'], angle: [-2.1, -1.04], sway: true })],
  ['Sparkle', 'Stars that spin away', (b, x, y) => particles(x, y, { n: 11, glyph: '\u2726', dist: [50, 120], size: [4, 9], life: [700, 1200], colors: ['#ffb347', '#fff', '#46d9ff'], rot: true })],
  ['Shake', 'A firm no, with feedback', (b, x, y) => {
   b.animate([{ translate: '0' }, { translate: '-9px' }, { translate: '9px' }, { translate: '-6px' }, { translate: '6px' }, { translate: '0' }], { duration: 460, easing: 'ease-out' });
   ringFx(x, y, 110, '#e2482b', 0, 3); if (navigator.vibrate) { try { navigator.vibrate(12); } catch (_) { /* unsupported */ } }
  }]
 ];
 function initClicks() {
  const grid = $('#kgrid'), out = $('#kcount'); let count = 0;
  KFX.forEach(([name, sub, fn], i) => {
   const b = document.createElement('button'); b.type = 'button'; b.className = 'kbtn';
   b.innerHTML = '<span class="kn">' + String(i + 1).padStart(2, '0') + '</span><span class="kt">' + name + '<small>' + sub + '</small></span><svg class="ok" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="16" fill="none" stroke="#3ee6a8" stroke-width="2"/><path d="M9 17.5l5.5 5.5L25 12" fill="none" stroke="#3ee6a8" stroke-width="3" stroke-linecap="round"/></svg>';
   b.addEventListener('click', e => {
    const r = b.getBoundingClientRect(), kb = !e.clientX && !e.clientY;
    const x = kb ? r.left + r.width / 2 : e.clientX, y = kb ? r.top + r.height / 2 : e.clientY;
    if (!reduced()) fn(b, x, y, x - r.left, y - r.top);
    else if (name === 'Check') fn(b);
    count++; out.textContent = count;
    out.animate([{ scale: '1' }, { scale: '1.5' }, { scale: '1' }], { duration: 320, easing: EASE });
   });
   grid.append(b);
  });
 }

 /* ------------------------------------------------------------------ 06 depth: draggable 3D ring */
 const DEST = [
  ['Home', 'The studio', '/', 'linear-gradient(150deg,#e2482b,#7a1f12)'],
  ['Create', 'Start a project', '/create/', 'linear-gradient(150deg,#ff4d8d,#5a0f33)'],
  ['Design', 'Browse the designs', '/design/', 'linear-gradient(150deg,#8b5cff,#1f1450)'],
  ['Work', 'Selected projects', '/work/', 'linear-gradient(150deg,#46d9ff,#0b3a52)'],
  ['Studio', 'Who we are', '/studio/', 'linear-gradient(150deg,#ffb347,#6b3a05)'],
  ['Motion Lab', '3D and playground', '/motion/', 'linear-gradient(150deg,#3ee6a8,#0a4a35)'],
  ['Process', 'How a project runs', '/process/', 'linear-gradient(150deg,#ff7a45,#6a1d0d)'],
  ['Contact', 'Say hello', '/contact/', 'linear-gradient(150deg,#b57bff,#2b1560)']
 ];
 function initDepth() {
  const stage = $('#d-stage'), ring = $('#d-ring'), tilt = $('#d-tilt'), vis = watch(stage, '40px');
  const N = DEST.length, STEP = 360 / N; let R = 480;
  const cards = DEST.map((d, i) => {
   const c = document.createElement('a'); c.className = 'rc'; c.href = d[2]; c.setAttribute('data-transition', ''); c.style.background = d[3];
   c.innerHTML = '<div class="rn">' + String(i + 1).padStart(2, '0') + '</div><div><h3>' + d[0] + '</h3><p>' + d[1] + '</p></div><span class="go">Travel there \u2197</span>';
   ring.append(c); return c;
  });
  const place = () => { R = clamp(S.w * .3, 250, 500); cards.forEach((c, i) => { c.style.transform = 'rotateY(' + i * STEP + 'deg) translateZ(' + R + 'px)'; }); };
  place(); resizers.push(place);
  let ry = 0, vel = 0, drag = false, lastX = 0, moved = 0, snap = null, idle = 0, front = -1, tx = 0, ty = 0, sx = 0, sy = 0;
  let captured = false, hovering = false;
  stage.addEventListener('pointerenter', () => { hovering = true; });
  stage.addEventListener('pointerleave', () => { hovering = false; });
  stage.addEventListener('pointerdown', e => { drag = true; moved = 0; lastX = e.clientX; vel = 0; snap = null; idle = 0; captured = false; });
  stage.addEventListener('pointermove', e => {
   const nx = e.clientX / S.w - .5, ny = e.clientY / S.h - .5; tx = nx; ty = ny;
   if (!drag) return;
   const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); ry += dx * .32; vel = dx * .32 / Math.max(S.dt, .008);
   if (!captured && moved > 6 && stage.setPointerCapture) { captured = true; try { stage.setPointerCapture(e.pointerId); } catch (_) { /* pointer already released */ } }
  });
  const end = () => { if (!drag) return; drag = false; if (Math.abs(vel) < 25) snap = Math.round(ry / STEP) * STEP; };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  stage.addEventListener('click', e => {
   if (moved > 6) { e.preventDefault(); e.stopPropagation(); return; }
   const c = e.target.closest('.rc'); if (!c) return;
   const i = cards.indexOf(c);
   if (i !== front) { e.preventDefault(); e.stopPropagation(); const k = Math.round((-ry) / 360); let target = -i * STEP + k * 360; snap = ((target - ry + 540) % 360) - 180 + ry; snap = Math.round(snap / STEP) * STEP; }
  }, true);
  const shapes = $$('.d-shape', stage).map(el => ({ el, k: +el.dataset.depth }));
  tick(() => {
   if (!vis.vis) return;
   if (!drag) {
    if (Math.abs(vel) > 4) { ry += vel * S.dt; vel *= Math.pow(.04, S.dt); if (Math.abs(vel) <= 4) snap = Math.round(ry / STEP) * STEP; }
    else if (snap !== null) { ry += (snap - ry) * clamp(S.dt * 6, 0, 1); if (Math.abs(snap - ry) < .05) { ry = snap; snap = null; idle = 0; } }
    else if (Math.abs(ry - Math.round(ry / STEP) * STEP) > .4 && Math.abs(S.svel) < 60) snap = Math.round(ry / STEP) * STEP; // scroll nudged it off a card: settle squarely
    else { idle += S.dt; if (idle > 3.6 && !reduced() && !hovering) { snap = Math.round(ry / STEP) * STEP - STEP; idle = 0; } } // every few seconds, step to the next card
   }
   if (!reduced()) ry += S.svel * S.dt * .02;
   sx += (tx - sx) * clamp(S.dt * 4, 0, 1); sy += (ty - sy) * clamp(S.dt * 4, 0, 1);
   ring.style.transform = 'translateZ(-' + R + 'px) rotateY(' + ry.toFixed(2) + 'deg)';
   tilt.style.transform = 'rotateX(' + (-sy * 10).toFixed(2) + 'deg) rotateY(' + (sx * 12).toFixed(2) + 'deg)';
   shapes.forEach(s => { s.el.style.transform = 'translate(' + (sx * s.k).toFixed(1) + 'px,' + (sy * s.k).toFixed(1) + 'px)'; });
   const f = ((Math.round(-ry / STEP) % N) + N) % N;
   if (f !== front) { front = f; cards.forEach((c, i) => c.classList.toggle('front', i === f)); }
  });
 }

 /* ------------------------------------------------------------------ 07 page transitions */
 const VT = [
  ['curtain', 'Curtain', 'Two panels meet in the middle'],
  ['iris', 'Iris', 'A circle opens from your click'],
  ['slices', 'Slices', 'Ten bars sweep down the page'],
  ['blocks', 'Pixel dissolve', 'A grid of blocks flickers in'],
  ['ink', 'Ink bloom', 'Three colours flood the screen'],
  ['zoom', 'Zoom fade', 'The page falls away into the dark']
 ];
 let vtId = 'curtain';
 try { vtId = sessionStorage.getItem('vz-hub-vt') || 'curtain'; } catch (_) { /* storage unavailable */ }
 const layer = $('#vt-layer');
 const IO = 'cubic-bezier(.76,0,.24,1)';
 const fin = a => a.finished.catch(() => 0);
 function mk(css) { const d = document.createElement('div'); d.style.cssText = css; layer.append(d); return d; }
 function buildTransition(id, ox, oy) {
  layer.innerHTML = '';
  const E = '#e2482b', A = '#ffb347', D = '#100d14';
  if (id === 'curtain') {
   const a = mk('left:0;top:0;width:100%;height:50.4%;background:' + E), b = mk('left:0;bottom:0;width:100%;height:50.4%;background:' + E);
   return {
    cover: () => Promise.all([fin(a.animate([{ transform: 'translateY(-101%)' }, { transform: 'none' }], { duration: 650, easing: IO, fill: 'forwards' })), fin(b.animate([{ transform: 'translateY(101%)' }, { transform: 'none' }], { duration: 650, easing: IO, fill: 'forwards' }))]),
    reveal: () => Promise.all([fin(a.animate([{ transform: 'none' }, { transform: 'translateY(-101%)' }], { duration: 650, easing: IO, fill: 'forwards' })), fin(b.animate([{ transform: 'none' }, { transform: 'translateY(101%)' }], { duration: 650, easing: IO, fill: 'forwards' }))])
   };
  }
  if (id === 'iris') {
   const c = mk('inset:0;background:' + E);
   return {
    cover: () => fin(c.animate([{ clipPath: 'circle(0px at ' + ox + 'px ' + oy + 'px)' }, { clipPath: 'circle(150vmax at ' + ox + 'px ' + oy + 'px)' }], { duration: 850, easing: IO, fill: 'forwards' })),
    reveal: () => fin(c.animate([{ clipPath: 'circle(150vmax at 50% 50%)' }, { clipPath: 'circle(0px at 50% 50%)' }], { duration: 800, easing: IO, fill: 'forwards' }))
   };
  }
  if (id === 'slices') {
   const bars = Array.from({ length: 10 }, (_, i) => mk('left:' + i * 10 + '%;top:0;width:10.2%;height:100%;background:' + (i % 2 ? E : A)));
   return {
    cover: () => Promise.all(bars.map((b, i) => { b.style.transformOrigin = 'top'; return fin(b.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 520, delay: i * 45, easing: IO, fill: 'forwards' })); })),
    reveal: () => Promise.all(bars.map((b, i) => { b.style.transformOrigin = 'bottom'; return fin(b.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 520, delay: (9 - i) * 45, easing: IO, fill: 'forwards' })); }))
   };
  }
  if (id === 'blocks') {
   const cols = 12, rows = Math.ceil(cols * S.h / S.w) + 1, bw = 100 / cols, bh = 100 / rows;
   const cells = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push(mk('left:' + c * bw + '%;top:' + r * bh + '%;width:' + (bw + .2) + '%;height:' + (bh + .3) + '%;background:' + ((r + c) % 2 ? E : D)));
   const delays = cells.map(() => rnd(0, 380));
   return {
    cover: () => Promise.all(cells.map((c, i) => fin(c.animate([{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 260, delay: delays[i], easing: 'ease-out', fill: 'forwards' })))),
    reveal: () => Promise.all(cells.map((c, i) => fin(c.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0)' }], { duration: 260, delay: rnd(0, 380), easing: 'ease-in', fill: 'forwards' }))))
   };
  }
  if (id === 'ink') {
   const cols = [E, A, D], ls = cols.map(c => mk('inset:0;background:' + c));
   return {
    cover: () => Promise.all(ls.map((l, i) => fin(l.animate([{ clipPath: 'circle(0px at ' + ox + 'px ' + oy + 'px)' }, { clipPath: 'circle(150vmax at ' + ox + 'px ' + oy + 'px)' }], { duration: 800, delay: i * 130, easing: IO, fill: 'forwards' })))),
    reveal: () => Promise.all(ls.slice().reverse().map((l, i) => fin(l.animate([{ clipPath: 'circle(150vmax at 50% 50%)' }, { clipPath: 'circle(0px at 50% 50%)' }], { duration: 750, delay: i * 130, easing: IO, fill: 'forwards' }))))
   };
  }
  // Zoom fade: toggles a class on #main (a CSS transition) instead of a held animation, so it can never get stuck.
  const veil = mk('inset:0;background:' + D), main = $('#main');
  return {
   cover: () => { if (main) main.classList.add('vt-zoom'); return fin(veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 650, easing: 'ease-in', fill: 'forwards' })); },
   reveal: () => { if (main) main.classList.remove('vt-zoom'); return fin(veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 650, easing: 'ease-out', fill: 'forwards' })); }
  };
 }
 let busy = false;
 // Always returns the page to a clean state: no overlay, no zoom class, no held animations.
 function clearTransition() {
  layer.innerHTML = ''; layer.style.pointerEvents = 'none';
  const m = $('#main');
  if (m) { m.classList.remove('vt-zoom'); m.getAnimations().forEach(x => x.cancel()); }
  busy = false;
 }
 async function preview(id, ox, oy) {
  if (busy) return; busy = true;
  try {
   if (!canAnimate || reduced()) { const v = mk('inset:0;background:#100d14'); await fin(v.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 420 })); return; }
   layer.style.pointerEvents = 'auto';
   const t = buildTransition(id, ox, oy);
   await t.cover(); await new Promise(r => setTimeout(r, 160)); await t.reveal();
  } catch (_) { /* fall through to cleanup */ } finally { clearTransition(); }
 }
 async function go(url, ox, oy) {
  if (TEST || PREVIEW) { window.__VZ_HUB_LAST = { url, style: vtId }; if (PREVIEW) toast('On the live site this opens ' + url); await preview(vtId, ox, oy); return; }
  if (busy) return; busy = true;
  try { if (canAnimate && !reduced()) { layer.style.pointerEvents = 'auto'; await buildTransition(vtId, ox, oy).cover(); } } catch (_) { clearTransition(); }
  location.assign(url);
  setTimeout(clearTransition, 8000); // if the navigation never happens, never leave the page covered
 }
 function initTransitions() {
  const styles = $('#t-styles'), dest = $('#t-dest'), rows = [];
  VT.forEach(([id, name, desc], i) => {
   const b = document.createElement('button'); b.type = 'button'; b.className = 't-style' + (id === vtId ? ' on' : '');
   b.innerHTML = '<span class="ix">' + String(i + 1).padStart(2, '0') + '</span><span><b>' + name + '</b><small>' + desc + '</small></span><span class="pl" aria-hidden="true">\u25B6</span>';
   b.addEventListener('click', e => {
    vtId = id; rows.forEach(r => r.classList.toggle('on', r === b));
    try { sessionStorage.setItem('vz-hub-vt', id); } catch (_) { /* storage unavailable */ }
    const r = b.getBoundingClientRect(); preview(id, e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
   });
   styles.append(b); rows.push(b);
  });
  [['Home', '/'], ['Create', '/create/'], ['Design', '/design/'], ['Work', '/work/'], ['Studio', '/studio/'], ['Motion Lab', '/motion/'], ['Process', '/process/'], ['Contact', '/contact/']].forEach(([n, h], i) => {
   const a = document.createElement('a'); a.className = 't-card'; a.href = h; a.setAttribute('data-transition', '');
   a.innerHTML = '<span class="a"><span>' + String(i + 1).padStart(2, '0') + '</span><span>\u2197</span></span><b>' + n + '</b>';
   dest.append(a);
  });
 }
 function initLinks() {
  document.addEventListener('click', e => {
   const a = e.target instanceof Element && e.target.closest('a[data-transition]');
   if (a && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !a.target) {
    e.preventDefault();
    const r = a.getBoundingClientRect();
    go(a.getAttribute('href'), e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
    return;
   }
   const g = e.target instanceof Element && e.target.closest('[data-go]');
   if (g) { const t = $(g.dataset.go); if (t) scrollToEl(t); }
  });
  addEventListener('pageshow', e => { if (e.persisted) clearTransition(); });
 }

 /* ------------------------------------------------------------------ 08 velocity cards */
 function initVelocityCards() {
  const wrap = $('#v-cards'), vis = watch(wrap, '60px');
  const D = [['Ease', 'linear-gradient(160deg,#e2482b,#7a1f12)'], ['Spring', 'linear-gradient(160deg,#8b5cff,#1f1450)'], ['Inertia', 'linear-gradient(160deg,#46d9ff,#0b3a52)'], ['Momentum', 'linear-gradient(160deg,#ffb347,#6b3a05)']];
  const cards = D.map(([t, bg], i) => { const c = document.createElement('div'); c.className = 'v-card'; c.style.background = bg; c.innerHTML = t + '<small>Leans with your scroll speed</small>'; wrap.append(c); return c; });
  tick(() => {
   if (!vis.vis || reduced()) return;
   const sk = clamp(S.svel * .005, -9, 9);
   cards.forEach((c, i) => {
    const off = (i % 2 ? 1 : -1) * clamp(S.svel * .02, -40, 40);
    c.style.transform = 'skewY(' + (sk * (i % 2 ? -1 : 1)).toFixed(2) + 'deg) translateY(' + off.toFixed(1) + 'px)';
   });
  });
 }

 /* ------------------------------------------------------------------ 09 morph + line draw */
 function initMorph() {
  const path = $('#m-path'), ringEl = $('#m-ring'), svg = $('#m-svg'), vis = watch(svg, '60px'), M = 12;
  const ang = i => i / M * Math.PI * 2 - Math.PI / 2;
  const SH = {
   circle: Array(M).fill(200),
   blob: [200, 235, 185, 225, 170, 230, 195, 240, 180, 220, 205, 232],
   star: [245, 120, 245, 120, 245, 120, 245, 120, 245, 120, 245, 120],
   squircle: Array.from({ length: M }, (_, i) => { const a = ang(i) + Math.PI / 2; return 196 / Math.pow(Math.pow(Math.abs(Math.cos(a)), 4) + Math.pow(Math.abs(Math.sin(a)), 4), .25) * .93; }),
   drop: [252, 214, 168, 140, 136, 150, 170, 150, 136, 140, 168, 214]
  };
  const keys = Object.keys(SH); let cur = SH.circle.slice(), target = SH.circle, idx = 0;
  const build = rad => {
   const P = rad.map((r, i) => [Math.cos(ang(i)) * r, Math.sin(ang(i)) * r]); let d = 'M' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1);
   for (let i = 0; i < M; i++) {
    const p0 = P[(i - 1 + M) % M], p1 = P[i], p2 = P[(i + 1) % M], p3 = P[(i + 2) % M];
    d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ',' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ',' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
   }
   return d + 'Z';
  };
  const chips = $$('[data-group="shape"] .chip');
  const choose = k => { idx = keys.indexOf(k); target = SH[k]; chips.forEach(c => c.classList.toggle('on', c.dataset.v === k)); };
  chips.forEach(c => c.addEventListener('click', () => choose(c.dataset.v)));
  svg.addEventListener('click', () => choose(keys[(idx + 1) % keys.length]));
  path.setAttribute('d', build(cur));
  tick(() => {
   if (vis.vis) {
    const k = reduced() ? 1 : 1 - Math.exp(-S.dt * 6);
    for (let i = 0; i < M; i++) cur[i] += (target[i] + (reduced() ? 0 : Math.sin(S.t * 1.2 + i * 1.7) * 7) - cur[i]) * k;
    path.setAttribute('d', build(cur));
    if (!reduced()) { ringEl.style.transformOrigin = '0 0'; ringEl.style.rotate = (S.t * 12).toFixed(1) + 'deg'; }
   }
  });
  const draws = $$('[data-draw]').map(el => { const len = el.getTotalLength ? el.getTotalLength() : 600; el.style.strokeDasharray = len; el.style.strokeDashoffset = len; return { el, len, svg: el.ownerSVGElement }; });
  tick(() => {
   for (const d of draws) {
    const r = d.svg.getBoundingClientRect(); if (r.bottom < -50 || r.top > S.h + 50) continue;
    const p = reduced() ? 1 : clamp((S.h * .92 - r.top) / (S.h * .55), 0, 1);
    d.el.style.strokeDashoffset = (d.len * (1 - p)).toFixed(1);
   }
  });
 }

 /* ------------------------------------------------------------------ 10 dot grid */
 function initGrid() {
  const cv = $('#grid-cv'), ctx = cv.getContext('2d'), vis = watch(cv, '60px'), SP = 30; const ripples = [];
  let W = 0, H = 0, dpr = 1, cols = 0, rows = 0, painted = false;
  const size = () => { const r = cv.getBoundingClientRect(); dpr = Math.min(1.6, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cols = Math.ceil(W / SP) + 1; rows = Math.ceil(H / SP) + 1; painted = false; };
  resizers.push(size); size();
  cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: 0 }); });
  tick(() => {
   if (!vis.vis) return;
   if (reduced() && painted) return; painted = reduced();
   const r = cv.getBoundingClientRect(), px = S.mx - r.left, py = S.my - r.top, inside = px >= 0 && py >= 0 && px <= W && py <= H && !reduced();
   ctx.clearRect(0, 0, W, H);
   for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].t += S.dt * .75; if (ripples[i].t > 1) ripples.splice(i, 1); }
   for (let cy = 0; cy < rows; cy++) for (let cx = 0; cx < cols; cx++) {
    const gx = cx * SP, gy = cy * SP; let ox = 0, oy = 0;
    if (!reduced()) {
     oy += Math.sin(gx * .02 + S.t * 1.4 + gy * .02) * 2.4;
     if (inside) { const dx = gx - px, dy = gy - py, d = Math.hypot(dx, dy); if (d < 170 && d > 0) { const f = Math.pow(1 - d / 170, 2) * 30; ox += dx / d * f; oy += dy / d * f; } }
     for (const q of ripples) { const dx = gx - q.x, dy = gy - q.y, d = Math.hypot(dx, dy) || 1, w = Math.exp(-Math.pow((d - q.t * 620) / 70, 2)) * 22 * (1 - q.t); ox += dx / d * w; oy += dy / d * w; }
    }
    const disp = Math.hypot(ox, oy), s = 1.5 + Math.min(disp * .09, 4);
    ctx.fillStyle = disp > 3 ? 'hsl(' + (38 - Math.min(disp, 40) * .6) + ' 95% ' + (58 + Math.min(disp, 20)) + '%)' : 'rgba(246,239,227,.38)';
    ctx.beginPath(); ctx.arc(gx + ox, gy + oy, s, 0, 6.2832); ctx.fill();
   }
  });
 }

 /* ------------------------------------------------------------------ 11 numbers + 12 easing */
 const bounce = t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; };
 const EASINGS = [
  ['Linear', t => t],
  ['Ease in-out cubic', t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)],
  ['Ease out expo', t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))],
  ['Ease out back', t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)],
  ['Ease out elastic', t => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * 2.0944) + 1)],
  ['Ease out bounce', bounce],
  ['Spring', t => 1 - Math.exp(-6 * t) * Math.cos(t * 14)],
  ['Anticipate', t => 2.70158 * t * t * t - 1.70158 * t * t]
 ];
 function initNumbers() {
  const wrap = $('#nums'), data = [[$$('.ch[data-ch]').length, 'Chapters', 1], [KFX.length, 'Click designs', .72], [VT.length, 'Page transitions', .55], [EASINGS.length, 'Easing curves', .62]];
  const cells = data.map(([v, lb, f]) => {
   const c = document.createElement('div'); c.className = 'num-c';
   c.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="bgc" cx="60" cy="60" r="54"/><circle class="fg" cx="60" cy="60" r="54"/></svg><div class="v">0</div><div class="lb">' + lb + '</div>';
   wrap.append(c); return { c, v, f, fg: $('.fg', c), out: $('.v', c) };
  });
  const play = () => cells.forEach(({ v, f, fg, out }, i) => {
   const t0 = performance.now() + i * 140, dur = 1700;
   const step = now => {
    const p = clamp((now - t0) / dur, 0, 1), e = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
    out.textContent = Math.round(v * (reduced() ? 1 : e)); fg.style.strokeDashoffset = (339.3 * (1 - f * (reduced() ? 1 : e))).toFixed(1);
    if (p < 1 && !reduced()) requestAnimationFrame(step);
   };
   requestAnimationFrame(step);
  });
  new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { play(); io.disconnect(); } }, { threshold: .35 }).observe(wrap);
  $('#n-replay').addEventListener('click', play);
 }
 function initEasing() {
  const list = $('#e-list'), runs = new Map(), rowsEls = [];
  EASINGS.forEach(([name, fn], i) => {
   const row = document.createElement('button'); row.type = 'button'; row.className = 'e-row';
   const pts = Array.from({ length: 41 }, (_, k) => { const t = k / 40; return (2 + t * 86).toFixed(1) + ',' + (40 - fn(t) * 34).toFixed(1); }).join(' ');
   row.innerHTML = '<b>' + name + '</b><svg viewBox="0 0 90 44" style="overflow:visible" aria-hidden="true"><polyline points="' + pts + '"/></svg><div class="tr"><i class="ba"></i></div>';
   row.addEventListener('click', () => start(i)); list.append(row); rowsEls.push({ row, ball: $('.ba', row), tr: $('.tr', row), fn });
  });
  function start(i) { runs.set(i, performance.now()); }
  $('#e-race').addEventListener('click', () => { const t = performance.now(); rowsEls.forEach((_, i) => runs.set(i, t)); });
  new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { rowsEls.forEach((_, i) => runs.set(i, performance.now() + i * 90)); io.disconnect(); } }, { threshold: .3 }).observe(list);
  tick(() => {
   if (!runs.size) return;
   const now = performance.now();
   for (const [i, t0] of runs) {
    const o = rowsEls[i], tw = Math.max(0, o.tr.clientWidth - 0), p = clamp((now - t0) / 1700, 0, 1);
    o.ball.style.transform = 'translateX(' + (o.fn(reduced() ? 1 : p) * tw).toFixed(1) + 'px)';
    if (p >= 1) runs.delete(i);
   }
  });
 }

 /* ------------------------------------------------------------------ motion toggle + boot */
 function syncReduced() {
  const r = reduced(), t = $('#hub-motion-toggle');
  root.classList.toggle('hub-reduced', r);
  t.textContent = 'Motion: ' + (r ? 'off' : 'on'); t.setAttribute('aria-pressed', String(!r));
 }
 function setMotion(on) {
  if (on) { optIn = true; motionOff = false; if (!lenis) initScroll(); }
  else { motionOff = true; if (lenis) { lenis.destroy(); lenis = null; root.classList.remove('lenis', 'lenis-smooth'); } }
  try { sessionStorage.setItem('vz-hub-motion', on ? 'on' : 'off'); } catch (_) { /* storage unavailable */ }
  syncReduced();
 }
 function initMotionToggle() {
  let saved = null; try { saved = sessionStorage.getItem('vz-hub-motion'); } catch (_) { /* storage unavailable */ }
  if (saved === 'on') { optIn = true; motionOff = false; if (!lenis) initScroll(); } else if (saved === 'off') motionOff = true;
  // One button, always truthful: if the page is calm (device setting or toggled off) it turns motion ON, otherwise it turns it OFF.
  $('#hub-motion-toggle').addEventListener('click', () => setMotion(reduced()));
  $('#hub-play-anyway').addEventListener('click', () => setMotion(true));
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', syncReduced);
  syncReduced();
 }
 function boot() {
  initScroll(); initReveal(); initChapters(); initButtons(); initCursor(); initMarquees(); initMega();
  initField(); initJourney(); initScarf(); initType(); initClicks(); initDepth(); initTransitions(); initLinks();
  initVelocityCards(); initMorph(); initGrid(); initNumbers(); initEasing(); initMotionToggle(); initLoader();
  requestAnimationFrame(loop);
  window.VeloryzMotionHub = { version: 'hub-1.0', chapters: chapters.length, go, playTransition: preview, get lenis() { return !!lenis; } };
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
