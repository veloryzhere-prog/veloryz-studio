import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {runInNewContext} from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const model=read('public/planner-model.js'),source=read('public/creator-v4.js'),designs=JSON.parse(read('public/veloryz-open-designs.json')).items;
test('Creator welcome and every category question render with the same planner model',()=>{
 for(const category of ['Business','Portfolio','Ecommerce','Agency','SaaS / platform','Restaurant','Editorial','Education','Community','Custom App']){
  const data=new Map([['veloryz.creator.v4',JSON.stringify({category})]]);
  const location={href:'https://veloryz.online/create/'};
  const document={addEventListener(){},querySelector(){return null},readyState:'loading'};
  const window={VeloryzExternalDesignLibrary:{entries:()=>designs},addEventListener(){}};
  const sandbox={window,document,location,URL,sessionStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},setTimeout:()=>0,projectBrief:{},studioCMS:{site:{}}};
  runInNewContext(model,sandbox);runInNewContext(source,sandbox);
  const api=window.VeloryzCreatorV4;
  for(const stage of ['welcome',...api.flow()]){
   location.href='https://veloryz.online/create/'+(stage==='welcome'?'':'?question='+encodeURIComponent(stage));
   const html=api.renderPage();assert.ok(html.includes('data-v2-stage="'+stage+'"'),category+' / '+stage);
   assert.equal((html.match(/id="v4-ai-slot"/g)||[]).length,1);
   if(stage==='welcome')assert.ok(html.includes('Start your project'));
   else {assert.ok(html.includes('id="v4-question-title"'));assert.ok(html.includes('data-v4-action="'+(stage==='review'?'submit':'next')+'"'));}
  }
 }
});
test('Support and Help use distinct functional chat composers and original API',()=>{
 const window={},document={addEventListener(){}};
 const code=read('public/support-chat.js');
 runInNewContext(code,{window,document,sessionStorage:{getItem:()=>null},location:{pathname:'/support/',search:''}});
 for(const id of ['help','support']){
  const html=window.VeloryzSupportChat.render(id);
  assert.ok(html.includes('data-vz-chat="'+id+'"'));assert.ok(html.includes('data-vz-form'));assert.ok(html.includes('v2-chat-status'));assert.ok(html.includes('aria-current="page"'));
 }
 assert.match(code,/\/api\/knowledge-ai\/chat/);
});
test('Warm hero pointer layer is scoped and respects reduced motion',()=>{
 const css=read('public/v2-home-warm.css'),js=read('public/v2-home-warm.js'),security=read('lib/response-security.ts');
 assert.ok(css.includes('main[data-p="home"]'));assert.ok(css.includes('pointer-events:none'));assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.ok(js.includes('pointermove'));assert.ok(js.includes('pointerleave'));assert.ok(js.includes('cancelAnimationFrame'));
 assert.ok(security.includes('/v2-home-warm.css'));assert.ok(security.includes('/v2-workspaces.css'));
});
