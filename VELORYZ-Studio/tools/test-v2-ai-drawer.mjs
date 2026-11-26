import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
async function verifyDock(source){
 class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.events={};this.attributes={};this.value='';this.textContent='';this.isConnected=true;}
  append(...nodes){for(const n of nodes){this.children.push(n);n.parentElement=this;}}
  insertBefore(n,ref){this.children.splice(this.children.indexOf(ref),0,n);n.parentElement=this;}
  replaceChildren(...n){this.children=[];this.append(...n)}
  remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(x=>x!==this);this.isConnected=false;}
  setAttribute(k,v){this.attributes[k]=String(v)}
  removeAttribute(k){delete this.attributes[k]}
  addEventListener(k,f){(this.events[k]??=[]).push(f)}
  emit(k,e={}){return Promise.all((this.events[k]||[]).map(f=>f({preventDefault(){},...e})))}
  focus(){doc.activeElement=this;}
  querySelectorAll(s){let result=[];for(const n of this.children){if(n.tagName===s)result.push(n);result.push(...n.querySelectorAll(s));}return result}
  contains(e){return this===e||this.children.some(n=>n.contains(e))}
 }
 const body=new Element('body'),doc={body,activeElement:body,createElement:t=>new Element(t),addEventListener(){}};
 const win={},requests=[],result=[];
 const fetch=(_url,opt)=>new Promise(resolve=>requests.push({payload:JSON.parse(opt.body),resolve,signal:opt.signal}));
 class Abort {constructor(){this.signal={aborted:false}}abort(){this.signal.aborted=true}}
 new Function('document','window','fetch','AbortController','location','setTimeout','clearTimeout',source)(doc,win,fetch,Abort,{pathname:'/'},()=>1,()=>{});
 const root=body.children[0],drawer=root.children[0],input=drawer.querySelectorAll('textarea')[0],form=input.parentElement,send=form.children[1];
 const check=(name,ok)=>{result.push({name,pass:!!ok});if(!ok)throw Error(name)};
 win.VeloryzReferenceAI.open('happy');input.value='First draft';
 const one=form.emit('submit');
 check('First request dispatched',requests.length===1&&requests[0].payload.agent==='happy');
 win.VeloryzReferenceAI.close();check('Close cancels request',requests[0].signal.aborted&&drawer.inert);
 win.VeloryzReferenceAI.open('nikhil');input.value='Second question';const two=form.emit('submit');
 requests[0].resolve({ok:true,json:async()=>({mode:'ai',answer:'Stale response'})});await one;
 check('Stale response cannot unlock new request',send.disabled===true);
 requests[1].resolve({ok:true,json:async()=>({mode:'ai',answer:'Fresh answer'})});await two;
 check('New request completes',send.disabled===false&&drawer.querySelectorAll('p').some(x=>x.textContent==='Fresh answer'));
 win.VeloryzReferenceAI.open('happy');check('Cancelled draft survives persona switch',input.value==='First draft');
 const three=form.emit('submit');check('Cancelled turn not duplicated',requests[2].payload.messages.length===1);
 requests[2].resolve({ok:false,json:async()=>({error:'Test failure'})});await three;
 check('Failed request restores draft',input.value==='First draft'&&send.disabled===false);
 win.VeloryzReferenceAI.open('nikhil');check('Persona history independent',drawer.querySelectorAll('p').some(x=>x.textContent==='Fresh answer')&&!drawer.querySelectorAll('p').some(x=>x.textContent==='Stale response'));
 return result;
}
test('AI drawer cancellation, stale responses, drafts and persona isolation',async()=>{const source=readFileSync(new URL('../public/reference-ai-dock.js',import.meta.url),'utf8');const results=await verifyDock(source);assert.equal(results.length,8);assert.ok(results.every(r=>r.pass));});
