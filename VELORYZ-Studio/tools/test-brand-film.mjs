/* VELORYZ final-film and high-frame-rate opening integration checks. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
const shell=JSON.parse(read('lib/site-shell.ts').replace(/^export default\s*/,'').replace(/;\s*$/,''));
const code=read('public/studio-brand-film.js'),css=read('public/studio-brand-film.css');
const opening=read('public/brand-intro.js');
assert.doesNotThrow(()=>new vm.Script(code),'Closing brand film controller must parse.');
assert.doesNotThrow(()=>new vm.Script(opening),'Opening film controller must parse.');
assert.ok(shell.includes('/studio-brand-film.css')&&shell.includes('/studio-brand-film.js'),'Main shell must mount final film files.');
assert.ok(shell.indexOf('/brand-intro.js')<shell.indexOf('/motion.js'),'First-visit motion gate must follow brand film controller.');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Film stylesheet must be balanced.');
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'),'Reduced-motion presentation must be available.');
assert.ok(css.includes('vz-film-fallback-animate'),'The original-logo animated fallback must remain available without video binaries.');
for(const asset of ['public/assets/brand/veloryz-mark.svg','public/assets/brand/official/Profile-Transparent.png','public/assets/brand/official/Main-Dark-Ink-Transparent.webp'])
 assert.ok(fs.existsSync(new URL('../'+asset,import.meta.url)),'Original studio brand asset missing: '+asset);
for(const match of ['play','replay','sound','fullscreen']){
 assert.ok(code.includes('data-vz-film-action="'+match+'"'),'Missing functional '+match+' film control.');
}
for(const match of ['veloryz-cinematic-full.mp4','veloryz-cinematic-full-mobile.mp4','IntersectionObserver','preload','visibilitychange','studio:route','loadeddata','error','ended'])
 assert.ok(code.includes(match),'Missing closing film lifecycle behavior: '+match);
assert.match(opening,/veloryz-opening-60fps\.mp4/,'Full screen opening should prefer native 60fps film.');
assert.match(opening,/veloryz-opening-60fps-mobile\.mp4/,'Phones should prefer portrait 60fps film.');
assert.match(opening,/removeClip\(\)/,'Video element must be cleaned up after the opening.');
assert.match(opening,/setTimeout\(\(\)=>exit\(false\),1750\)/,'CSS fallback is short when the film is not installed.');
assert.match(code,/if\(!homepage\(\)\)\{dispose\(\);return;\}/,'Brand film is home-only and must clean up on route change.');
assert.match(code,/section=host\.querySelector\('#'\+ID\)/,'The film mounts inside the homepage after existing content.');
assert.match(code,/if\(document\.hidden\)pause\(\)/,'Offscreen or background film must pause.');
assert.match(code,/if\(explicit\)pendingManualPlay=true/,'Manual play must survive deferred video loading.');
assert.match(code,/host\.classList\.add\('vz-film-fallback-animate'\)/,'Unavailable video should still play original motion.');
assert.match(code,/if\(running\)pause\(\);else play\(true,complete\)/,'Film pause/play button must have real behavior.');
console.log('PASS: original logos, 60fps opening preference, short CSS backup, full-length footer film, lazy playback, access, lifecycle and graceful fallback.');
