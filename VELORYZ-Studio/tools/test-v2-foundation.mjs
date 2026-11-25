import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {test} from 'node:test';
import {runInNewContext} from 'node:vm';
import {characterStyles,conversationName,characterPrompt,guideVoice} from '../lib/persona-behaviour-r35.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=JSON.parse(read('lib/claude-reference-shell.ts').split('export default ')[1].trim().replace(/;$/,''));
const security=read('lib/response-security.ts');
test('five capability cards, original logo, scarf, gallery, journey and Motion Hub remain',()=>{
 for(const marker of ['data-logo-source="official-glb"','id="stmt"','id="hzs"','id="trk"','id="hbar"','id="vz-home-library-track"','id="vz-reference-journey"','<veloryz-frame-cut','class="frame-scarf" autoplay muted loop playsinline','/motion-hub/','/founder/'])assert.ok(html.includes(marker),marker);
 assert.equal((html.match(/<article class="pan">/g)||[]).length,5);
 assert.equal((html.match(/data-vz-stage="[0-4]"/g)||[]).length,5);
 assert.ok(security.includes('/capabilities-scroll-r34.js'));
 assert.ok(security.includes('/capabilities-scroll-r34.css'));
 assert.ok(read('public/app.js').includes("logoStage('lab')"));
 assert.ok(read('public/frame-cut.js').includes('/assets/frame-cut/scarf.mp4'));
 for(const file of ['public/motion-3d.js','public/frame-cut.js','lib/motion-hub-page.ts','public/motion-hub.js']){
  const expected={'public/motion-3d.js':'41fa4d148b2f35f00569d7b096cc6f12731e6747','public/frame-cut.js':'176ba1cab122559cb79f630896b394ba951550b6','lib/motion-hub-page.ts':'ed04ffae510eeedaf21d97a48d083cce87fa7f72','public/motion-hub.js':'3bca3dcd873b72e6c9a26f7931cc993a8d01f8b0'}[file];
  const bytes=readFileSync(new URL('../'+file,import.meta.url));
  assert.equal(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),expected,'Protected original changed: '+file+'; review intentionally before updating baseline');
 }
});
test('capabilities movement starts at zero, reaches the midpoint and end, and resets for reduced motion',()=>{
 let top=0,full=true,active=false;const queue=[],events={};
 const style=()=>({setProperty(k,v){this[k]=v},removeProperty(k){delete this[k]}});
 const shapes=Array.from({length:5},()=>({style:style()}));
 const track={scrollWidth:3000,style:style(),querySelectorAll:()=>shapes};
 const pin={clientWidth:1200,offsetHeight:800};
 const bar={style:style()};
 const section={style:style(),classList:{toggle(_,v){active=v}},querySelector:()=>pin,getClientRects:()=>[1],getBoundingClientRect:()=>({top})};
 const motion={get level(){return full?'full':'reduced'},addEventListener(n,f){events[n]=f}};
 runInNewContext(read('public/capabilities-scroll-r34.js'),{document:{getElementById:id=>({hzs:section,trk:track,hbar:bar}[id]),documentElement:{dataset:{}},addEventListener(){}},window:{StudioMotion:motion},addEventListener(n,f){events[n]=f},requestAnimationFrame(f){queue.push(f);return queue.length},matchMedia:()=>({matches:false})});
 const flush=()=>{while(queue.length)queue.shift()()};flush();
 assert.equal(active,true);assert.equal(track.style.transform,'translate3d(0.00px,0,0)');
 top=-1062;events.scroll();flush();assert.equal(track.style.transform,'translate3d(-900.00px,0,0)');assert.equal(bar.style.transform,'scaleX(0.5)');
 top=-2124;events.scroll();flush();assert.equal(track.style.transform,'translate3d(-1800.00px,0,0)');
 full=false;events.change();flush();assert.equal(active,false);assert.equal(track.style.transform,undefined);
});
test('founder portrait is the original provided WebP asset and is referenced by its page',()=>{
 const b=readFileSync(new URL('../public/assets/brand/founder-portrait.webp',import.meta.url));
 assert.equal(b.subarray(0,4).toString(),'RIFF');assert.equal(b.subarray(8,12).toString(),'WEBP');
 assert.equal(createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),'be10611b58d3e4ee220056411b43656cc4cb411f');
 assert.ok(read('lib/founder-page.ts').includes('/assets/brand/founder-portrait.webp'));
});
test('all five character contracts, optional first names, and guide labeling',()=>{
 const ids=['happy','nikhil','milky','ritik','aryan'];assert.deepEqual(Object.keys(characterStyles).sort(),ids.sort());
 assert.equal(conversationName('',[{role:'user',content:'Mera naam Sam hai'}]),'Sam');
 assert.equal(conversationName('',[{role:'user',content:'Help me build a site'}]),'');
 const messages=[{role:'user',content:'Hey!'}];const greetings=new Set();
 for(const id of ids){const c=characterStyles[id];assert.ok(characterPrompt(id,messages,null).includes(c.voice));const g=guideVoice(id,{answer:'Reference'},messages,null);assert.equal(g.mode,'guide');assert.equal(g.available,false);assert.match(g.answer,/Optional/);greetings.add(g.answer)}
 assert.equal(greetings.size,5);
 assert.ok(read('public/reference-ai-dock.js').includes('messages.slice(-15)'));
 assert.ok(read('public/platform.js').includes('data-name-skip'));
 assert.ok(read('lib/hosted-adviser.mjs').includes('characterPrompt(data.agent'));
 assert.ok(html.includes('reference-ai-dock.js?v=20261126-v2-alpha1'));
 assert.ok(read('lib/site-shell.ts').includes('platform.js?v=20261126-v2-alpha1'));
});
