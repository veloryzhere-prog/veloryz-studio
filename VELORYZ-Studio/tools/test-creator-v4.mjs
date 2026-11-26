import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {TextDecoder,TextEncoder} from 'node:util';

const read=name=>fs.readFileSync(new URL('../public/'+name,import.meta.url),'utf8');
const listeners={},storage=new Map();
let output='',fetchCount=0,request;
const location={href:'https://veloryz.online/create/'};
const history={
 pushState(_state,_title,path){location.href='https://veloryz.online'+path;},
 replaceState(_state,_title,path){location.href='https://veloryz.online'+path;}
};
const root={querySelector(){return null},set outerHTML(text){output=text},get outerHTML(){return output}};
const doc={
 addEventListener(type,handler){if(!listeners[type])listeners[type]=handler;},
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
 TextEncoder,TextDecoder,setTimeout,clearTimeout,queueMicrotask,
 crypto:{randomUUID:()=> 'c162bb72-2d79-44da-bc7f-7bf073b62933'},
 navigator:{clipboard:{writeText:async()=>{}}},
 AbortController,
 fetch:async(url,options)=>{
  assert.equal(url,'/api/enquiries');
  fetchCount++;request=JSON.parse(options.body);
  return {ok:true,json:async()=>({ok:true,reference:'VZ-EXAMPLE-123'})};
 }
});
vm.runInContext(read('planner-model.js'),ctx);
ctx.window.VeloryzPlanner=ctx.VeloryzPlanner;
vm.runInContext('let projectBrief=VeloryzPlanner.normalize(),chosenDesign=null;let createPage=()=>"";',ctx);
vm.runInContext(read('creator-v4.js'),ctx);
const creator=ctx.window.VeloryzCreatorV4;
assert.equal(creator.templateCount,12);
assert.equal(creator.referenceCount,26);
assert.equal(ctx.VeloryzPlanner.features.length,16);
output=vm.runInContext('createPage()',ctx);
assert(output.includes('Start a project'));
assert(output.includes('v4-welcome'));
assert(!output.includes('v4-category-grid'));
assert(!output.includes('v4-top-next')); // Only Start is shown on welcome.
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
click({v4Action:'start'});
assert(location.href.includes('question=discover'));
assert(output.includes('What are you thinking of creating?'));
assert(output.includes('v4-top-actions'));
assert(output.includes('v4-top-next'));
assert(!output.includes('v4-bottom'));
assert(!output.includes('v4-library-grid'));
click({v4Pick:'category',value:'SaaS / platform'});
assert(location.href.includes('question=template'));
assert(output.includes('data-v4-template="saas"'));
assert(output.includes('Web inspiration'));
click({v4Template:'saas'});
assert(location.href.includes('question=style'));
assert.equal(creator.get().features.length,3);
click({v4Pick:'style',value:'Bold'});
assert(location.href.includes('question=palette'));
click({v4Pick:'palette',value:'Warm white'});
assert(location.href.includes('question=reference'));
click({v4Action:'next'});
assert(location.href.includes('question=pages'));
click({v4Pick:'pages',value:'8'});
assert(location.href.includes('question=goal'));
assert(creator.flow().some(step=>step.startsWith('detail-Member')));
assert(creator.flow().includes('assets'));
assert(creator.flow().length>15);
input('goal','Build a secure, useful client dashboard for a small agency.');
click({v4Action:'next'});
assert(output.includes('What should you be able to update?'));
const saved=JSON.parse(storage.get('veloryz.creator.v4'));
assert(saved.lastQuestion.startsWith('features-'));
assert.equal(saved.style,'Bold');
creator.go('name');
input('name','Sample Client');
creator.go('email');
input('email','client@example.com');
assert.equal(win.VeloryzProjectEmail,'client@example.com');
creator.go('review');
assert(output.includes('v4-review-sheet'));
assert(output.includes('Send my project'));
assert(output.includes('v4-consent'));
listeners.change({target:{closest:()=>root,checked:true,hasAttribute:key=>key==='data-v4-consent'}});
click({v4Action:'submit'});
await new Promise(resolve=>setImmediate(resolve));
assert.equal(fetchCount,1);
assert.equal(request.kind,'project');
assert.equal(request.email,'client@example.com');
assert.equal(request.requestId,'c162bb72-2d79-44da-bc7f-7bf073b62933');
assert(request.message.startsWith('PROJECT CREATOR V5'));
assert(request.message.includes('Member accounts'));
assert(request.message.length<=2000);
assert.equal(request.consent,true);
assert(output.includes('VZ-EXAMPLE-123'));
assert(output.includes('PROJECT REQUEST CONFIRMED'));
assert(output.includes('private invitation'));
assert(output.includes('/client/'));
assert(output.includes('12 hours'));
assert(output.includes('team'));
assert(output.includes('Project submitted'));
assert(!storage.has('veloryz.creator.v4'));
assert(!storage.has('veloryz.planner.v1'));
vm.runInContext(read('creator-proposal.js'),ctx);
const brief=ctx.VeloryzPlanner.normalize({purpose:'SaaS / platform',pages:'8',features:['Member accounts','Admin dashboard'],goal:'A project dashboard for the team.'});
const bytes=ctx.VeloryzProposal.build({brief,estimate:ctx.VeloryzPlanner.estimate(brief),creator:{category:'SaaS / platform',features:brief.features,answers:{'Member accounts':'Multi-role accounts'}}});
const text=new TextDecoder().decode(bytes),xref=Number(text.match(/startxref\n(\d+)/)?.[1]);
assert(text.startsWith('%PDF-1.4'));
assert.equal((text.match(/\/Type \/Page \/Parent/g)||[]).length,4);
assert.equal(text.slice(xref,xref+4),'xref');
assert(text.includes('Multi-role accounts'));
console.log('PASS: one-question wizard, 12 concepts, 26 refs, conditional questions, user navigation, draft persistence, signed enquiry submission and 4-page proposal.');
