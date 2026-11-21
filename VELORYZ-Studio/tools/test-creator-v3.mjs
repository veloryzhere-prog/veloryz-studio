import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {TextEncoder,TextDecoder} from 'node:util';

const file=name=>fs.readFileSync(new URL('../public/'+name,import.meta.url),'utf8');
const listeners={};
let rendered='';
const root={scrollIntoView(){},get outerHTML(){return rendered;},set outerHTML(value){rendered=value;}};
const focus={setAttribute(){},focus(){}};
const document={
 addEventListener(type,callback){listeners[type]=callback;},
 querySelector(key){
  if(key==='[data-v3-root]')return {scrollIntoView(){},querySelector(){return focus;}};
  if(key==='.v3-root')return root;
  return null;
 },
 createElement(){return {innerHTML:'',querySelector(){return null}}}
};
const storage=new Map();
const sessionStorage={
 getItem:key=>storage.get(key)||null,
 setItem:(key,value)=>storage.set(key,value),
 removeItem:key=>storage.delete(key)
};
const window={scrollY:0,scrollTo(){},VeloryzProjectEmail:''};
const ctx=vm.createContext({console,document,window,sessionStorage,TextEncoder,TextDecoder,setTimeout,clearTimeout,crypto:{randomUUID:()=> 'a0a0a0a0-a0a0-4a0a-8a0a-a0a0a0a0a0a0'},navigator:{},confirm:()=>true,alert:()=>{},fetch:async()=>({ok:true,json:async()=>({ok:true,reference:'VZ-TEST123'})})});
vm.runInContext(file('planner-model.js'),ctx);
ctx.window.VeloryzPlanner=ctx.VeloryzPlanner;
vm.runInContext("let projectBrief=VeloryzPlanner.normalize(),chosenDesign=null;const catalogue=()=>[];let createPage=()=>'';",ctx);
vm.runInContext(file('creator-v3.js'),ctx);
const model=ctx.VeloryzPlanner,creator=ctx.window.VeloryzCreatorV3;
assert.equal(creator.templates.length,12);
assert.equal(creator.external.length,26);
assert(creator.external.every(x=>x.url.startsWith('https://')));
assert.equal(model.features.length,16);
let html=vm.runInContext("createPage()",ctx);
assert(html.includes('data-v3-root'));
assert(html.includes('data-v3-category="Business"'));
assert(html.includes('data-v3-step="4"'));
assert(html.includes('ILLUSTRATIVE PLANNING RANGE'));
assert(html.includes('creator')===false || html.includes('v3-hero'));
assert.equal(creator.estimate().low,21999);
assert(creator.format().startsWith('PROJECT CREATOR V3'));
assert.equal(model.estimate(model.normalize({pages:'8',features:['Member accounts']}),null,[],{base:30000,pageAllowance:2000,featureAllowance:4000,contingencyPct:30}).low,42000);
function click(data){
 listeners.click({target:{closest:()=>({dataset:data})}});
 return rendered;
}
html=click({v3Step:'1'});
assert(html.includes('data-v3-template="works"'));
assert(html.includes('Framer'));
assert(html.includes('https://www.framer.com/marketplace/templates/velia/'));
html=click({v3Step:'2'});
assert(html.includes('data-v3-feature="Member accounts"'));
assert(html.includes('data-v3-feature="API integrations"'));
html=click({v3Step:'3'});
assert(html.includes('data-v3-budget'));
assert(html.includes('data-v3-time="Flexible"'));
html=click({v3Step:'4'});
assert(html.includes('id="v3-submit-form"'));
assert(html.includes('name="email"'));
assert(html.includes('data-v3-consent'));
vm.runInContext(file('creator-proposal.js'),ctx);
const brief=model.normalize({purpose:'SaaS / platform',pages:'8',style:'Minimal',budget:50000,features:['Member accounts','Admin dashboard'],goal:'A useful web application for customers and staff.'});
const basic=ctx.VeloryzProposal.build({brief,estimate:model.estimate(brief)});
const rich=ctx.VeloryzProposal.build({brief,estimate:model.estimate(brief),creator:{category:'SaaS / platform',palette:'Warm ivory',priority:'Balanced quality',features:brief.features,answers:{'Member accounts':'Private client portal'}}});
function checkPDF(bytes,count){
 const text=new TextDecoder().decode(bytes);
 assert(text.startsWith('%PDF-1.4\n'));
 assert(text.endsWith('%%EOF\n'));
 assert.equal((text.match(/\/Type \/Page \/Parent/g)||[]).length,count);
 const offset=Number(text.match(/startxref\n(\d+)/)?.[1]);
 assert.equal(text.slice(offset,offset+4),'xref');
}
checkPDF(basic,3);checkPDF(rich,4);
assert(new TextDecoder().decode(rich).includes('Private client portal'));
console.log('PASS: Creator V3, twelve starters, twenty-six marketplace references, sixteen features, five stages, pricing, enquiry gate and proposal PDF.');
