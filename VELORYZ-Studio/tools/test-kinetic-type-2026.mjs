/* VELORYZ 2026 kinetic typography and page performance regression. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('public/app.js');
const css=read('public/kinetic-type-2026.css');
const js=read('public/kinetic-type-2026.js');
const shell=read('lib/site-shell.ts');
const scarf=read('public/frame-cut.js');
assert.doesNotThrow(()=>new vm.Script(js));
assert.match(app,/<h1[^>]*hero-kinetic-title[^>]*>Built to be<br><span class="hero-kinetic-word"/);
assert.match(app,/data-kinetic-word="remembered\."/);
assert.doesNotMatch(app,/<span class="serif">remembered\.<\/span>/);
assert.match(css,/\.hero-kinetic-word/);
assert.match(css,/@keyframes vz-letter-enter/);
assert.match(css,/font-family:Impact/);
assert.match(css,/\.section-head h2/);
assert.match(css,/\.services-section \.split-intro h2/);
assert.match(css,/\.ui-explorations \.section-head h2/);
assert.match(css,/\.studio-band h2/);
assert.match(css,/\.page-intro h1/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/\.vz-kinetic-ambient::before/,'Avoid expensive always-blurred animated ambience');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Style rules must be balanced');
assert.match(js,/aria-hidden','Decorative letter spans must be hidden from assistive technology');
assert.doesNotMatch(js,/addEventListener\(['"]scroll['"]|setInterval|requestAnimationFrame/,'Typography must not require scroll polling');
assert.match(shell,/\/kinetic-type-2026\.css/);
assert.match(shell,/\/kinetic-type-2026\.js/);
assert.ok(shell.indexOf('/kinetic-type-2026.css')>shell.indexOf('/lenis-motion-2026.css'),'New heading accents must win legacy stylesheet priority');
assert.doesNotMatch(scarf,/\.frame-toggle|class="frame-overlay"/);
const handlers={},media=Object.assign(new EventTarget(),{matches:false});
const word={dataset:{kineticWord:'remembered.'},textContent:'remembered.',isConnected:true,classes:new Set(),style:{setProperty(){}},classList:{add(...xs){for(const x of xs)word.classes.add(x)}},replaceChildren(...nodes){this.children=nodes}};
class Node{
 constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.style={setProperty(k,v){this[k]=v}};}
 appendChild(v){this.children.push(v)}
 setAttribute(k,v){this.attributes[k]=v}
}
let observerCallback,observed=null;
const document={
 readyState:'complete',hidden:false,documentElement:{dataset:{motion:'full'}},
 querySelector:()=>word,
 createElement:tag=>new Node(tag),
 addEventListener:(type,fn)=>{handlers[type]=fn}
};
const window={StudioMotion:Object.assign(new EventTarget(),{level:'full'})};
vm.runInNewContext(js,{document,window,matchMedia:()=>media,IntersectionObserver:class{constructor(fn){observerCallback=fn}observe(n){observed=n}disconnect(){}},console});
assert(word.classes.has('is-ready'),'Hero enhancement must be initialized');
assert.equal(word.children.length,2,'Accessibility source text plus decorative letters');
assert.equal(word.children[0].textContent,'remembered.','Accessible word must remain intact');
assert.equal(word.children[1].attributes['aria-hidden'],'true');
assert.equal(word.children[1].children.length,[...'remembered.'].length,'Every glyph should be animated once');
assert.equal(observed,word,'Observe only the visible word');
observerCallback([{isIntersecting:true,target:word}]);
assert(word.classes.has('is-activated'),'Visible word should animate once');
console.log('PASS: kinetic remembered headline, varied typography across the site, lightweight entrance, accessibility and Lenis coexistence.');
