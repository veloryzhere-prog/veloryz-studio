/* Contract: all reference top-right actions must be clickable, full-site bug reports
   must be real private enquiries, and decorative motion may not stall input/scroll. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const decode=file=>{const source=read(file),ix=source.indexOf('export default ');assert(ix>=0);return JSON.parse(source.slice(ix+15).trim().replace(/;$/,''));};
const home=decode('lib/claude-reference-shell.ts');
const shell=decode('lib/site-shell.ts');
const headerCSS=read('public/reference-header-interactions.css');
const chrome=read('public/reference-restored-features.js');
const motion=read('public/motion.js');
const app=read('public/app.js');
const menu=read('public/reference-shared-menu.js');
const enquiries=read('lib/enquiries.mjs');
const page=read('lib/page-handler.ts');
const bug=read('public/bug-report.js');
const bugCSS=read('public/bug-report.css');
assert(home.includes('class="vz-header-actions"'),'Menu and Quick Create must share a proper fixed toolbar');
assert(home.includes('class="vz-header-create" href="/create/"'),'Quick Create must lead to real Creator');
assert(home.includes('id="mb" class="mbtn" type="button"'),'Original Menu must retain its working button');
assert(home.includes('aria-controls="mn"'),'Menu must expose controls metadata');
assert(chrome.includes('actions.insertBefore(motionButton,actions.querySelector(\'#mb\'))'),'Real motion button must be inserted into same header toolbar');
assert(headerCSS.includes('body.vz-reference-site > nav {')&&headerCSS.includes('pointer-events:none !important'),'Transparent full-width nav cannot steal click events');
assert(headerCSS.includes('> nav .vz-official-header-brand {')&&headerCSS.includes('pointer-events:auto !important'),'Official logo remains clickable');
assert(headerCSS.includes('z-index:144')&&headerCSS.includes('#mn {')&&headerCSS.includes('z-index:138'),'Toolbar must be above fullscreen menu, not beneath it');
assert(headerCSS.includes('#mn.open')&&headerCSS.includes('pointer-events:auto'),'Open menu must receive pointer events');
assert(headerCSS.includes('visibility:hidden')&&headerCSS.includes('pointer-events:none'),'Closed menu must not steal clicks');
assert(headerCSS.includes('background:rgba(248,241,230,.79)'),'Official wordmark needs a restrained translucent contrast plate');
assert(home.includes("$('#mb').onclick=function()")&&home.includes("mn.classList.toggle('open')"),'Original working Menu click behaviour must remain');
assert(motion.includes("if(btn.hasAttribute('data-motion-control'))panel()"),'Motion button must invoke the real preferences panel');
assert(home.includes('scrollEase=1-Math.exp(-frameDt*8.2)')&&home.includes('cursorEase=1-Math.exp(-frameDt*13.4)'),'Scroll and cursor smoothing must use elapsed time, not fixed per-frame easing');
assert(home.includes('document.hidden')&&home.includes("visibilitychange"),'Decorative homepage ticker must stop in hidden tabs and resume');
for(const name of ['Report a Bug','/report-bug/']){
 assert(home.includes(name),'Bug reporting must be reachable in reference menu and footer');
 assert(app.includes(name),'Bug reporting must be reachable in original site routes and footer');
 assert(menu.includes(name),'Bug reporting must be reachable through shared menu');
}
assert(home.split('href="/report-bug/"').length>=3,'Reference menu and footer need distinct real links');
assert(shell.includes('/bug-report.js')&&shell.includes('/bug-report.css'),'Dedicated bug form must load on all standard site pages');
assert(shell.indexOf('/bug-report.js')<shell.indexOf('/app.js'),'Bug report renderer must load before app navigation');
assert(app.includes("'/report-bug/':{title:'Report a Bug"),'Bug route must render the real form');
assert(page.includes("'/report-bug':'Report a Bug'"),'Bug route must return HTTP 200, not a 404');
assert(menu.includes("['Report a Bug','/report-bug/']"),'Shared menu must link to a real URL');
assert(enquiries.includes("['design','project','payment','bug']"),'Existing private backend must accept the bug category');
assert(enquiries.includes("input.kind==='bug'?'Website bug report'"),'Admin reports must have a distinct service label');
assert(enquiries.includes('validateSchedule')&&enquiries.includes('if(!discussion)validateSchedule'),'Bug reports must not require consultation slots');
assert(enquiries.includes('rateKey')&&enquiries.includes('networkKey'),'Existing anti-spam limits must apply');
assert(bug.includes('window.VeloryzBugReport={render,templates}'),'Bug form must publish the route renderer');
for(const category of ['navigation','motion','performance','logo','layout','media','ai','other'])
 assert(bug.includes(category+':{'),'Missing editable bug example '+category);
assert(bug.includes('editable example')&&bug.includes('not confirmed open bugs'),'Templates must not falsely claim these bugs are confirmed');
assert(bug.includes("fetch('/api/enquiries'")&&bug.includes("kind:'bug'"),'Submission must call the existing real endpoint');
assert(bug.includes('body.reference')&&bug.includes('Report another issue'),'Display real server reference and support new submissions');
assert(bug.includes("values.get('consent')==='on'"),'Consent must be explicit');
assert.doesNotThrow(()=>new vm.Script(bug),'Public bug report JS must parse');
const inline=[...home.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
assert.equal(inline.length,1,'Keep original reference page animation code');
assert.doesNotThrow(()=>new vm.Script(inline[0]),'Reference homepage JS must parse after motion refinement');
for(const css of [headerCSS,bugCSS]){
 assert.equal(css.split('{').length,css.split('}').length,'Styles must have balanced blocks');
}
assert(bugCSS.includes('max-width:980px')&&bugCSS.includes('max-width:580px'),'Bug report must be responsive');

/* A regression test for the ACTUAL route controller and header DOM:
   CSS :has() alone must never decide whether Quick Create remains clickable. */
const quickHelper=home.match(/function syncQuickCreate\(n\)\{[\s\S]*?\n\}\nfunction show\(n\)/)?.[0]?.replace(/\nfunction show\(n\)$/,'');
assert.ok(quickHelper,'Reference router must control real Quick Create header visibility');
const quickState={view:'',important:'',display:'',tabindex:null,ariaHidden:null,hidden:false};
const quickLink={
 style:{setProperty(name,value,priority){assert.equal(name,'display');quickState.display=value;quickState.important=priority;}},
 setAttribute(name,value){if(name==='tabindex')quickState.tabindex=value;if(name==='aria-hidden')quickState.ariaHidden=value;},
 removeAttribute(name){if(name==='tabindex')quickState.tabindex=null;},
 set hidden(value){quickState.hidden=value;},
 get hidden(){return quickState.hidden;}
};
const quickEnv={
 document:{body:{setAttribute(name,value){assert.equal(name,'data-vz-view');quickState.view=value;}},activeElement:null},
 $:selector=>selector==='.vz-header-create'?quickLink:null
};
vm.runInNewContext(quickHelper+';this.quickRouter=syncQuickCreate;',quickEnv,{timeout:2000});
for(const pageName of ['design','create','library','designs']){
 quickEnv.quickRouter(pageName);
 assert.equal(quickState.view,pageName);
 assert.equal(quickState.display,'none','Quick Create must not remain visible on '+pageName);
 assert.equal(quickState.important,'important','Inline author priority must override old component CSS');
 assert.equal(quickState.hidden,true);
 assert.equal(quickState.ariaHidden,'true');
 assert.equal(quickState.tabindex,'-1','A hidden link must not be keyboard focusable');
}
for(const pageName of ['home','work','studio']){
 quickEnv.quickRouter(pageName);
 assert.equal(quickState.display,'inline-flex','Quick Create should remain available on '+pageName);
 assert.equal(quickState.hidden,false);
 assert.equal(quickState.ariaHidden,'false');
 assert.equal(quickState.tabindex,null);
}
assert.match(home,/function route\(\)\{[\s\S]*?syncQuickCreate\(n\);if\(first\)/,'Synchronize button immediately on hash navigation, not after animation delay');
assert.match(chrome,/a\.dataset\.vzQuickCreate='footer'/,'Footer Quick Create link needs a route-targetable marker');
assert.match(headerCSS,/data-vz-view="design"/,'Design hash route should also have CSS no-flash fallback');
assert.match(headerCSS,/vz-reference-support-links \[data-vz-quick-create\]/,'Footer shortcut must be hidden on blocked routes');
assert.ok(home.includes('reference-header-interactions.css?v=20261123-router-quick-create-v3'),'Updated header CSS must bypass old browser caches');
assert.ok(home.includes('reference-restored-features.js?v=20261123-router-quick-create-v3'),'Updated footer JS must bypass old browser caches');

console.log('PASS: clickable Quick Create/Motion/Menu, translucent logo, smooth frame-independent scroll, and persisted secure bug report with real reference and accessible entrypoints.');
