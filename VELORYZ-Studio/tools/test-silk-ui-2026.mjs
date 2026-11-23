/* Integration contract for the two uploaded VELORYZ 2026 motion/UI bundles.
 * Keep existing routes, security headers, and the removed floating project CTA intact. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
const silkJs=read('public/veloryz-silk-2026.js');
const silkCss=read('public/veloryz-silk-2026.css');
const uiCss=read('public/veloryz-ui-2026.css');
const security=read('lib/response-security.ts');
const handler=read('lib/page-handler.ts');
assert.doesNotThrow(()=>new vm.Script(silkJs),'Uploaded motion JS must be syntactically valid');
assert.ok(silkJs.length>5000&&silkCss.length>3000&&uiCss.length>8500,'Both uploaded assets must be fully installed');
for(const [filename,css] of [['silk',silkCss],['UI',uiCss]]){
 assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,filename+' CSS braces must balance');
}
for(const token of ['.vz-silk-progress','animation-timeline: scroll(root block)','vz-silk-settle','vz-mag-release','prefers-reduced-motion','html[data-motion="paused"]']){
 assert.ok(silkCss.includes(token),'Preserve uploaded Silk scroll and accessibility styles: '+token);
}
for(const token of ['--vzu-ease','--vzu-sh-1','.vz-reference-site .btn','.vz-reference-site .pan','range','@media (max-width: 540px)']){
 assert.ok(uiCss.includes(token),'Preserve uploaded VELORYZ UI 2026 polish: '+token);
}
assert.ok(security.includes('!privatePage&&status===200'),'Skip Silk/UI on private, preview and error responses');
const urls=['veloryz-silk-2026.css','veloryz-ui-2026.css','veloryz-silk-2026.js'];
for(const name of urls)assert.ok(security.includes('/'+name+'?v=20261123-route-r4'),'Public asset must have explicit release cache version: '+name);
assert.ok(urls.every((s,i)=>i===0||security.indexOf(urls[i-1])<security.indexOf(s)),'CSS must load before additive motion JS, with UI polish last among styles');

const designDetail=read('lib/design-detail-page.ts');
for (const selector of ['body.v4-creator-page .v4-root .v4-welcome','body.v4-creator-page .v4-root .v4-primary','body.v4-creator-page .v4-root :is(.v4-choice,.v4-template-card','body.vz-market-body:not(.vz-market-immersive) .vz-market-project-hero','body.vz-market-body:not(.vz-market-immersive) .vz-market-pricebox']) {
 assert.ok(uiCss.includes(selector),'Real Create and Design DOM must have visible Silk UI: '+selector);
}
for (const selector of ['.v4-choice','.v4-feature-card','.v4-template-card','.v4-primary','.vz-market-related-card','.vz-market-btn']) {
 assert.ok(silkJs.includes(selector),'Silk must reach functional route interactive components: '+selector);
}
assert.ok(security.includes("const ui2026Release='silk-ui-20261123-r4'"),'Public pages need a traceable release fingerprint');
assert.ok(security.includes("headers['X-VELORYZ-UI-Release']=ui2026Release"),'Live server must reveal its actual installed UI version');
assert.ok(security.includes('<meta name="veloryz-ui-release"'),'Public HTML must expose the active release');
assert.ok(designDetail.includes("mode==='detail'?'<meta name=\"veloryz-ui-release\""),'Design details must load the refinement explicitly');
assert.ok(designDetail.includes('/veloryz-silk-2026.js?v=20261123-route-r4'),'Design detail should animate the actual card and CTA elements');
assert.ok(designDetail.includes('/veloryz-ui-2026.css?v=20261123-route-r4'),'Design detail should get its own UI treatment');
assert.ok(designDetail.includes("mode==='detail'?"),'Embedded original source previews must remain isolated');

for(const token of ["version: 'silk-2026.3'","function burst(","function scrubParagraphs()","--vz-bx","--vz-by","--mx","--my","SCRUB_SKIP"]){
 assert.ok(silkJs.includes(token),'Silk v2 interaction or text scrub missing: '+token);
}
for(const token of ['@property --vz-r','@property --vz-spot','.vz-burst','.vz-w','animation-timeline: --vz-scrub','@keyframes vz-word']){
 assert.ok(silkCss.includes(token),'Silk v2 registered property or scroll effect missing: '+token);
}
for(const token of ['--vz-r: 150%','radial-gradient(circle at var(--vz-bx) var(--vz-by)','body.v4-creator-page .v4-root .v4-primary','body.vz-market-body:not(.vz-market-immersive) .vz-market-btn','var(--vz-spot, 0)']){
 assert.ok(uiCss.includes(token),'Silk v2 cursor-origin liquid/spotlight styles missing: '+token);
}
assert.ok(!silkJs.includes("addEventListener('wheel'"),'New Silk must never compete with the first-party Lenis wheel controller');

assert.ok(!security.includes('const projectLink='),'Do not reinstate the removed floating Create button');
assert.ok(!security.includes("projectLink+'</body>'"),'Do not inject retired Create button into document');
assert.ok(security.includes("'Content-Security-Policy'")&&security.includes('nonce-'),'Existing CSP/nonces must be preserved');
assert.ok(handler.includes('secureHtml(clientPortalShell,200,true)'),'The Client Portal is excluded from Silk injection');
assert.ok(handler.includes('secureHtml(renderDesignFullPreview(design),200,true)'),'Immersive design preview is excluded');
assert.ok(handler.includes('secureHtml(renderDesignPreview(staticDesign),200,true)'),'Design details retain their own UI');
assert.ok(handler.includes('return secureHtml(adminShell,200,true)'),'Admin UI is excluded');
assert.ok(handler.includes('const response=secureHtml(html,known?200:404)'),'Normal public pages use the shared renderer');

// Exercise the actual uploaded motion script against representative page DOMs.
// No custom scroll engine, wheel interception, duplicate progress, or hidden controls.
function boot({existingProgress=false,reduced=false}={}){
 const docEvents=new Map(),winEvents=new Map(),children=[],animations=[];
 class FakeElement {
  constructor(){this.isConnected=true;this.style={setProperty(){}};this.classList={add(){},remove(){}};}
  getBoundingClientRect(){return {left:0,top:0,width:160,height:56};}
  animate(frames,options){
   const result={frames,options,paused:false,played:false,playbackRate:1,pause(){this.paused=true;},play(){this.played=true;}};
   animations.push(result);return result;
  }
  closest(){return this;}
  matches(){return false;}
  contains(){return false;}
  addEventListener(){}
  setAttribute(name,value){this[name]=value;}
 }
 const root={dataset:{motion:'full'},scrollHeight:2000};
 const main=new FakeElement();
 const doc={
  documentElement:root,readyState:'complete',hidden:false,
  body:{append(el){children.push(el);}},
  getElementById(id){return id==='prog'&&existingProgress?{}:id==='main'?main:null;},
  querySelector(){return children.find(x=>x.className==='vz-silk-progress')||null;},
  createElement(){return new FakeElement();},
  addEventListener(name,callback){const group=docEvents.get(name)||[];group.push(callback);docEvents.set(name,group);}
 };
 const window={};
 const context={
  document:doc,window,Element:FakeElement,innerHeight:1000,scrollY:500,
  matchMedia(query){return {matches:query.includes('reduced-motion')?reduced:true};},
  addEventListener(name,callback){const group=winEvents.get(name)||[];group.push(callback);winEvents.set(name,group);},
  requestAnimationFrame(callback){callback();return 1;},setTimeout(){},
  console
 };
 new vm.Script(silkJs).runInNewContext(context,{timeout:2000});
 return {window,doc,root,children,animations,docEvents,winEvents,FakeElement,context};
}
const page=boot();
assert.equal(page.children.length,1,'Only pages lacking #prog receive one progress bar');
assert.equal(page.children[0].className,'vz-silk-progress');
assert.equal(page.children[0].style.transform,'scaleX(0.5)','Fallback progress tracks full-page scroll percentage');
assert.equal(page.window.VeloryzSilk.enabled,true,'Normal page motion must be enabled');
assert.ok(!page.winEvents.has('wheel'),'Never hijack native Lenis/wheel scrolling');
assert.ok(!page.winEvents.has('touchmove'),'Never hijack touch scrolling');
assert.ok(page.docEvents.has('studio:route'),'Existing SPA navigation should receive a lightweight fade');
const button=new page.FakeElement();
page.docEvents.get('pointerdown')[0]({button:0,target:button});
assert.equal(page.animations.length,1,'Tactile press must animate the button');
assert.equal(page.animations[0].played,true);
page.docEvents.get('click')[0]({target:button,clientX:91,clientY:33,detail:1});
assert.equal(page.children.filter(x=>x.className==='vz-burst').length,10,'Silk v2 must render ten burst particles on button click');
assert.equal(page.animations.length,21,'Each particle must have independent travel and fade animations');
const beforePause=page.animations.length;
page.root.dataset.motion='paused';
assert.equal(page.window.VeloryzSilk.enabled,false,'Motion pause setting must stop enhancements');
page.docEvents.get('pointerdown')[0]({button:0,target:new page.FakeElement()});
assert.equal(page.animations.length,beforePause,'No new animations while paused');
page.docEvents.get('click')[0]({target:button,clientX:91,clientY:33,detail:1});
assert.equal(page.animations.length,beforePause,'Click bursts must also stop while paused');
assert.equal(boot({existingProgress:true}).children.length,0,'Original homepage progress bar must not be duplicated');
assert.equal(boot({reduced:true}).window.VeloryzSilk.enabled,true,'Explicit full motion setting retains user override');
const reducedAuto=boot({reduced:true});
reducedAuto.root.dataset.motion='';
assert.equal(reducedAuto.window.VeloryzSilk.enabled,false,'OS reduced-motion preference must be respected by default');
console.log('PASS: uploaded Silk + UI assets, route-safe CSP loading, reduced motion, no duplicate scrollbars, no wheel interception, no retired floating project CTA.');
