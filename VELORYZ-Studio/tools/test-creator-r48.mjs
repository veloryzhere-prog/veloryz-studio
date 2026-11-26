import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {TextDecoder,TextEncoder} from 'node:util';

const read=name=>fs.readFileSync(new URL('../public/'+name,import.meta.url),'utf8');
const listeners={},storage=new Map();
let output='',fetchCount=0,request,serverConfirmed=false;
const location={href:'https://veloryz.online/create/'};
const history={
 pushState(_state,_title,path){location.href='https://veloryz.online'+path;},
 replaceState(_state,_title,path){location.href='https://veloryz.online'+path;}
};
const root={set outerHTML(text){output=text},get outerHTML(){return output}};
const doc={
 addEventListener(type,handler){listeners[type]=handler;},
 querySelector(key){
  if(key==='.v4-root')return root;
  if(key==='#v4-question-title')return {focus(){}};
  if(key==='#v4-error')return {textContent:'',hidden:true};
  return null;
 },
 getElementById(){return null}
};
const win={
 scrollTo(){},VeloryzProjectEmail:'',
 addEventListener(type,handler){listeners['window:'+type]=handler}
};
const sessionStorage={
 getItem:key=>storage.get(key)??null,
 setItem:(key,value)=>storage.set(key,String(value)),
 removeItem:key=>storage.delete(key)
};
const ctx=vm.createContext({
 console,window:win,document:doc,sessionStorage,location,history,URL,
 TextEncoder,TextDecoder,setTimeout,clearTimeout,
 crypto:{randomUUID:()=> 'c162bb72-2d79-44da-bc7f-7bf073b62933'},
 navigator:{clipboard:{writeText:async()=>{}}},
 AbortController,
 fetch:async(url,options)=>{
  assert.equal(url,'/api/enquiries');
  fetchCount++;request=JSON.parse(options.body);
  return {ok:true,json:async()=>serverConfirmed?({ok:true,reference:'VZ-EXAMPLE-123'}):({ok:true})};
 }
});
vm.runInContext(read('planner-model.js'),ctx);
ctx.window.VeloryzPlanner=ctx.VeloryzPlanner;
vm.runInContext('let projectBrief=VeloryzPlanner.normalize(),chosenDesign=null;let createPage=()=>"";',ctx);
vm.runInContext(read('creator-v4.js'),ctx);
const creator=ctx.window.VeloryzCreatorV5;
assert.equal(creator.version,5);
assert.equal(creator,ctx.window.VeloryzCreatorV4);
output=creator.renderPage();
assert(output.includes('Quick brief'));
assert(output.includes('data-v48-import'));
const attr=key=>'data-'+key.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase());
function click(dataset){
 const control={dataset,hasAttribute:key=>Object.hasOwn(dataset,key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())),closest:selector=>selector==='.v4-root'?root:null};
 listeners.click({target:{closest:()=>control},preventDefault(){},stopImmediatePropagation(){}});
 return output;
}
function input(field,value){
 const target={dataset:{v4Field:field},value,closest:()=>root,hasAttribute:key=>key==='data-v4-field'};
 listeners.input({target});
}

click({v4Action:'quick-start'});
assert.equal(creator.flow().length,10);
assert.equal(creator.stage(),'discover');
assert(output.includes('v4-top-next'));
creator.go('review');
assert(output.includes('expand-brief'));
click({v4Action:'expand-brief'});
assert(creator.flow().length>15);
assert.equal(creator.stage(),'style');
creator.go('reference');
input('reference','javascript:alert(1)');
click({v4Action:'next'});
assert.equal(creator.stage(),'reference');
input('reference','https://example.com/');
input('extraReferences','https://example.org/\nhttps://example.net/');
click({v4Action:'next'});
assert.equal(creator.stage(),'pages');
creator.go('goal');
input('goal','Build a useful and secure customer website.');
creator.go('name');input('name','Example Client');
creator.go('email');input('email','client@example.com');
creator.go('review');
assert(output.includes('exact project message'));
click({v4Action:'submit'});
assert.equal(fetchCount,0,'Consent required');
listeners.change({target:{closest:()=>root,checked:true,hasAttribute:key=>key==='data-v4-consent'}});
click({v4Action:'submit'});
await new Promise(resolve=>setImmediate(resolve));
assert.equal(fetchCount,1);
assert.equal(creator.stage(),'review','A missing reference must not show a success screen');
assert(storage.has('veloryz.creator.v4'));
serverConfirmed=true;
click({v4Action:'submit'});
await new Promise(resolve=>setImmediate(resolve));
assert.equal(fetchCount,2);
assert.equal(request.requestId,'c162bb72-2d79-44da-bc7f-7bf073b62933');
assert(request.message.startsWith('PROJECT CREATOR V5'));
assert(request.message.includes('Goal: Build a useful and secure customer website.'));
assert(request.message.length<=2000);
assert(request.message.includes('https://example.org/'));
assert(output.includes('VZ-EXAMPLE-123'));
assert(!storage.has('veloryz.creator.v4'));
console.log('PASS: R48 quick and detailed flows, reference validation, consent and confirmed submission handling.');
