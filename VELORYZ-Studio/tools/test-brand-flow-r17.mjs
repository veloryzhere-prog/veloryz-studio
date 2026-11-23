import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const shellRaw=read('lib/claude-reference-shell.ts');
const html=JSON.parse(shellRaw.slice(shellRaw.indexOf('export default ')+15).trim().replace(/;$/,''));
const css=read('public/reference-brand-flow-r17.css');
const js=read('public/reference-brand-flow-r17.js');
const smooth=read('public/smooth-scroll.js');

assert(html.includes('/reference-brand-flow-r17.css?v=20261123-brandflow-r17'),'R17 brand flow CSS is not linked');
assert(html.includes('/reference-brand-flow-r17.js?v=20261123-brandflow-r17'),'R17 brand flow JS is not linked');
assert(html.includes('/assets/brand/official/Main-Dark-Ink-Transparent.webp'),'Official header logo asset changed');
assert(html.includes('/assets/brand/official/Main-Transparent.webp'),'Official footer logo asset changed');
assert(html.includes('/assets/brand/veloryz-mark.svg'),'Original VELORYZ mark must remain in the reference shell');

assert(css.includes('.vz-official-header-brand'),'Header brand motion CSS missing');
assert(css.includes('--vz-brand-scroll-opacity'),'Header brand fade variable missing');
assert(css.includes('.vz-footer-official'),'Footer brand treatment missing');
assert(css.includes('footer.vz-footer-in'),'Footer reveal state missing');
assert(css.includes("mask:url('/assets/brand/veloryz-mark.svg')"),'Footer must use the original VELORYZ mark for the background brand frame');
assert(css.includes('@media(prefers-reduced-motion:reduce)'),'R17 reduced-motion fallback missing');
assert(!css.includes('backdrop-filter:blur('),'R17 must not introduce frosted blur effects');

assert(js.includes("addEventListener('scroll',requestSync,{passive:true})"),'Header logo fade must use one passive scroll listener');
assert(js.includes('requestAnimationFrame'),'Header logo scroll updates must be rAF-throttled');
assert(js.includes("IntersectionObserver"),'Footer brand reveal must be intersection-driven');
assert(js.includes("setProperty('--vz-brand-scroll-opacity'"),'Header logo fade value is not updated from scroll');
assert(js.includes("classList.toggle('is-scrolled-away'"),'Header logo should become inert only after it has faded out');
assert(!js.includes('setInterval('),'R17 must not add a perpetual interval loop');
assert(!js.includes('new Lenis'),'R17 must reuse the existing scroll engine instead of creating a second one');

assert(smooth.includes('lerp:0.09'),'Lenis R17 interpolation must stay at the smoother 0.09 profile');
assert(smooth.includes('wheelMultiplier:0.9'),'Lenis R17 wheel multiplier must stay at 0.9');
assert(smooth.includes("touch:'native'"),'Touch scrolling must remain native');
assert(smooth.includes("clock:'shared'"),'Lenis must remain attached to the shared motion clock');

console.log('PASS: R17 brand flow preserves official assets, fades the header logo on scroll, strengthens the footer logo moment, and keeps one smooth scroll engine.');
