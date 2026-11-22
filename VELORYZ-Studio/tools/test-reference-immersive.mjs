/* VELORYZ official-assets and immersive hero regression suite.
   The user-selected design must retain actual 3D model geometry and real AI portraits. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const text=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const htmlText=text('lib/claude-reference-shell.ts');
const html=JSON.parse(htmlText.slice(htmlText.indexOf('export default ')+15).trim().replace(/;$/,''));
const source=text('src/motion/experience.mjs');
const build=text('scripts/build-motion.mjs');
const assets=['aryan','happy','milky','nikhil','ritik'];
const ai=text('public/reference-ai-dock.js'),studio=text('public/claude-reference-enhancements.js');
const heritage=text('public/reference-restored-features.js');
const hero=text('public/reference-hero-immersive.js');
const immersiveCSS=text('public/reference-hero-immersive.css'),portraitsCSS=text('public/reference-ai-avatars.css');
const polish=text('public/reference-final-polish.css');
assert(!html.includes('Independent creative experience / 01'),'Removed placeholder should stay removed');
assert(html.includes('class="hero vz-aurora-hero"'),'Interactive hero needs its scoped canvas stage');
assert(html.includes('data-logo-source="official-glb"'),'Homepage must load the actual original GLB, not only flat SVG');
assert(html.includes('/assets/brand/official/Main-Dark-Ink-Transparent.webp'),'Original wordmark is mandatory');
assert(html.includes('/reference-hero-immersive.js')&&html.includes('/reference-hero-immersive.css'),'Real interactive background must load');
assert(html.includes('/reference-ai-avatars.css'),'All five real AI avatars must be visible');
assert(!html.includes(") rotateY('+(t*18"),'Never simulate model rotation by spinning the 2D canvas surface');
assert(source.includes("GLTFLoader")&&source.includes("three/addons/loaders/GLTFLoader.js"),'Three.js GLTFLoader must be present');
assert(source.includes("container.dataset.logoSource==='official-glb'"),'Archived model only replaces homepage V');
assert(source.includes("new GLTFLoader().load('/assets/brand/veloryz-logo.glb'"),'Load the self-hosted original actual 3D model');
assert(source.includes("renderer.render(scene,camera)")&&source.includes("pivot.quaternion"),'True WebGL model rotation must remain active');
assert(source.includes("model.userData.parts||[]"),'Imported rigid GLB must not be treated as procedural split mesh');
assert(source.includes("useOriginalGlb")&&source.includes("elapsed*.33")&&source.includes("orbitStyle==='orbit'"),'True full-orbit rotation must be selectable while retaining recognisable gentle default');
assert(build.includes("veloryz-logo.glb")&&build.includes("motion-3d.js"),'Prebuild must produce actual GLB and corresponding WebGL bundle');
for(const asset of assets){
 const f='public/assets/ai-avatars/'+asset+'.webp';
 assert(fs.statSync(new URL('../'+f,import.meta.url)).size>10000,'Real official avatar missing: '+f);
 assert(ai.includes("id:'"+asset+"'")&&ai.includes("ai-avatars/"+asset+".webp"),'Registered AI portrait must match '+asset);
 assert(studio.includes("'"+asset+"'")||studio.includes("'"+asset+".webp'"),'Studio chooser must resolve the correct avatar '+asset);
}
assert(ai.includes('headerPortrait')&&ai.includes("portrait.src=a.avatar")&&ai.includes('img.src=agent.avatar'),'Portraits must appear for current persona, selector tabs and launcher');
assert(portraitsCSS.includes('vz-ai-current-avatar')&&portraitsCSS.includes('vz-studio-agent-portrait'),'Portrait UI must be fully styled');
assert(heritage.includes('http://www.w3.org/2000/svg')&&heritage.includes('viewBox')&&heritage.includes('wa-symbol'),'Bottom-right WhatsApp icon must be SVG rather than a dot');
assert(heritage.includes('wa.me/919955326740'),'Preserve existing contact destination');
assert(hero.includes('getContext(\'2d\'')&&hero.includes('pointermove')&&hero.includes('requestAnimationFrame'),'Original pointer-response particle system is required');
assert(hero.includes('IntersectionObserver')&&hero.includes("document.hidden")&&hero.includes("StudioMotion"),'Hero animation must respect viewport, tab visibility and motion choices');
assert(immersiveCSS.includes('vz-aurora-hero')&&immersiveCSS.includes('vz-official-header-brand img'),'Animated background and high-contrast logo styles must exist');
assert(polish.includes('vz-ref-public-route')&&polish.includes('.cp-body'),'Public site and secure client portal share nonbreaking visual polish');
assert(text('lib/site-shell.ts').includes('/reference-final-polish.css'),'Old public pages must receive scoped visual polish');
assert(text('lib/client-portal-shell.ts').includes('/reference-final-polish.css'),'Client portal must receive matching scoped design');
for(const p of ['reference-hero-immersive.js','reference-ai-dock.js','reference-restored-features.js','claude-reference-enhancements.js'])
 assert.doesNotThrow(()=>new vm.Script(text('public/'+p)),p+' JavaScript must parse');
for(const css of [immersiveCSS,portraitsCSS,polish])
 assert.equal(css.split('{').length,css.split('}').length,'CSS block syntax must balance');
console.log('PASS: original real GLB 3D, interactive hero, five real avatars, readable wordmark, WhatsApp brand icon, motion and original site.');
