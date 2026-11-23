/* Regression guard: hero fix must retain the approved 3D, official colors,
   original whole-site background, and functional easy-to-use playback controls. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const shell=read('lib/claude-reference-shell.ts');
const html=JSON.parse(shell.slice(shell.indexOf('export default ')+15).trim().replace(/;$/,''));
const model=read('src/motion/experience.mjs');
const inspector=read('src/motion/inspection.mjs');
const css=read('public/reference-hero-immersive.css');
const particles=read('public/reference-hero-immersive.js');
assert(html.includes('class="hero vz-aurora-hero vz-material-hero vz-editorial-r5"'),'Only the approved editorial homepage hero gets the revised background');
assert(html.includes('data-logo-source="official-glb"'),'Keep the original full-depth VELORYZ 3D asset');
assert(html.includes('/assets/brand/official/Main-Dark-Ink-Transparent.webp'),'Approved official logo remains in navigation');
assert(html.includes('/assets/brand/veloryz-mark.svg'),'Logo fallback remains');
assert(html.includes('id="vz-home-library"')&&html.includes('id="vz-home-reviews-track"'),'Do not remove approved library or reviews');
for(const action of ['gentle','spin','pause','continue','left','right','front','reset']){
 assert(html.includes('data-logo-action="'+action+'"'),'Missing visible 3D operation: '+action);
 assert(model.includes("action==='"+action+"'"),'3D action not connected: '+action);
}
assert(html.includes('data-logo-state')&&html.includes('aria-live="polite"'),'Expose rotation state visibly and accessibly');
assert(!/bigV\\.style\\.transform=[^\\n]*rotateY/.test(html),'Canvas must not simulate rotation in 2D');
assert(model.includes('GLTFLoader')&&model.includes("'/assets/brand/veloryz-logo.glb'"),'Use real GLB geometry');
assert(model.includes('native.position.copy(centre).multiplyScalar(-scale)'),'GLB centre must be rescaled in correct order');
assert(model.includes('renderer.toneMapping=THREE.ACESFilmicToneMapping'),'Correct physically plausible material lighting');
assert(model.includes('officialHero?.95:1.65'),'Do not bleach original V with high-power coloured lights');
assert(model.includes('transitionPose')&&model.includes('.slerp('),'Resume rotation without snapping to a new orientation');
assert(model.includes('autoResumeTimer=setTimeout')&&model.includes('continueRotation()'),'Manual drag must not freeze forever');
assert(inspector.includes('release=()=>{}')&&inspector.includes('release();')&&inspector.includes('rotateYaw'),'Pointer release and 30-degree control must remain functional');
assert(css.includes('.vz-reference-site .vz-material-hero')&&css.includes('linear-gradient(126deg'),'Restrict new warm treatment to top hero');
assert(!css.includes('conic-gradient(')&&!css.includes('@keyframes vzHeroAura'),'Remove disliked neon animated aurora entirely');
assert(css.includes('filter:none!important')&&css.includes('.vz-official-header-brand img'),'Do not recolour approved official wordmark with filters');
assert(css.includes('vz-3d-controls')&&css.includes('vz-3d-control-buttons'),'Visible model control panel required');
assert(particles.includes("if(hero.classList.contains('vz-editorial-r5'))"),'Approved R5 editorial home must skip the old particle canvas and preserve its logo fallback');
assert(particles.includes('visible')&&particles.includes('document.hidden')&&particles.includes("window.StudioMotion"),'Particle motion must stop offscreen and respect preferences');
assert(particles.includes("now-lastTime<33"),'Particle animation must cap at 30fps to leave scroll render budget');
assert(particles.includes('time*p.vx')&&particles.includes('time*p.vy'),'Particles must genuinely travel, not merely twinkle');
assert(particles.includes('const count=clamp('),'Mobile particle population must be capped');
assert(particles.includes('brand.src=\'/assets/brand/official/Main-Dark-Ink-Transparent.png\''),'Correct wordmark fallback is required');
assert.doesNotThrow(()=>new vm.Script(particles),'Particle JS must parse');
for(const p of ['public/reference-hero-immersive.css','public/reference-hero-immersive.js'])assert(read(p).length>1000,'Hero asset missing: '+p);
console.log('PASS: original-color 3D logo, correctly centered model, user rotation/continue/reset controls, hero-only warm background and legacy capped particle fallback disabled in R5.');
