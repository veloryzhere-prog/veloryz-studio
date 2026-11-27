/* R52.2.9 — versioned browser registration transport, no cross-endpoint fallback. */
(()=>{
'use strict';
const KEY='veloryz.creator.registration.pending.v1';
const clean=v=>String(v??'').replace(/[<>\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,' ').trim();
const url=v=>{try{const u=new URL(String(v||'').trim());return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}};
function payload(d,id){
 const features=Array.isArray(d.features)?d.features:[],answers=Object.fromEntries(features.filter(k=>typeof d.answers?.[k]==='string').map(k=>[k,clean(d.answers[k])]));
 const b={};
 for(const k of ['category','template','style','palette','motion','timeline','priority','goal','businessName','industry','businessStage','businessDescription','audience','technicalNotes','notes','external','referenceId','referenceRights','briefMode'])b[k]=clean(d[k]);
 Object.assign(b,{pages:Number(d.pages),budget:Number(d.budget),pageNames:d.pageNames||[],features,answers,assets:d.assets||[],technologies:d.technologies||[],referenceLikes:d.referenceLikes||[],reference:url(d.reference),extraReferences:String(d.extraReferences||'').split(/\r?\n/).map(url).filter(Boolean).slice(0,3),materialLink:url(d.materialLink),promoRequested:d.promoRequested===true});
 return {contractVersion:1,intent:'create-project',requestId:id,consent:d.consent===true,website:'',contact:{name:clean(d.name),email:clean(d.email).toLowerCase(),phone:clean(d.phone),company:clean(d.company||d.businessName),preferredContact:clean(d.preferredContact)},brief:b};
}
function pending(){try{const x=JSON.parse(sessionStorage.getItem(KEY));return x&&['legacy','structured'].includes(x.mode)&&x.body&&typeof x.body.requestId==='string'?x:null;}catch{return null;}}
function persist(x){sessionStorage.setItem(KEY,JSON.stringify(x));}
const clear=()=>{try{sessionStorage.removeItem(KEY);}catch{}};
async function config(){const r=await fetch('/api/project-submissions/config',{cache:'no-store',signal:AbortSignal.timeout(8000)});const x=await r.json();if(!r.ok||x.contractVersion!==1||!['legacy','structured'].includes(x.mode)||(x.mode==='structured'&&typeof x.sitekey!=='string'))throw Error('Registration service is temporarily unavailable. Your draft is safe.');return x;}
let loader;
function script(){
 if(window.turnstile?.render)return Promise.resolve();
 if(loader)return loader;
 loader=new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.async=true;
  const timer=setTimeout(()=>{s.remove();reject(Error('Security verification could not load. Try again.'));},15000);
  s.onload=()=>{clearTimeout(timer);window.turnstile?.render?resolve():reject(Error('Security verification unavailable.'));};
  s.onerror=()=>{clearTimeout(timer);s.remove();reject(Error('Security verification could not load.'));};document.head.append(s);
 }).catch(e=>{loader=null;throw e;});return loader;
}
async function challenge(sitekey){
 await script();
 return new Promise((resolve,reject)=>{
  const dialog=document.createElement('dialog');dialog.className='v52-challenge';dialog.setAttribute('aria-label','Project security verification');
  const heading=document.createElement('h2');heading.textContent='Verify your request';
  const description=document.createElement('p');description.textContent='Complete this security check to send your project. Your brief stays in this tab.';
  const mount=document.createElement('div'),cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancel';dialog.append(heading,description,mount,cancel);document.body.append(dialog);
  let widget=null,done=false;
  const end=(value,error)=>{if(done)return;done=true;clearTimeout(timer);if(widget!==null)try{window.turnstile.remove(widget);}catch{}dialog.close();dialog.remove();error?reject(error):resolve(value);};
  const fail=()=>end(null,Error('Security check was cancelled, expired or failed. Please retry.'));
  const timer=setTimeout(fail,120000);dialog.addEventListener('cancel',e=>{e.preventDefault();fail();});cancel.onclick=fail;
  try{dialog.showModal();widget=window.turnstile.render(mount,{sitekey,action:'project_registration',theme:'light',size:'flexible',callback:t=>end(t),'error-callback':fail,'expired-callback':fail,'timeout-callback':fail});if(done&&widget!==null)window.turnstile.remove(widget);}catch{fail();}
 });
}
async function send(data,legacy){
 const old=pending();let cfg,body,mode;
 if(old){
  mode=old.mode;body=old.body;
  const candidate=mode==='structured'?payload(data,body.requestId):{...legacy,requestId:body.requestId};
  if(JSON.stringify(candidate)!==JSON.stringify(body)&&!window.confirm('A previous submission has an unconfirmed result. Retry its original saved details instead of sending a different project?'))throw Error('Original request retained. Retry it or contact the studio before starting another submission.');
 }else{
  cfg=await config();mode=cfg.mode;body=mode==='structured'?payload(data,legacy.requestId):legacy;
 }
 const endpoint=mode==='structured'?'/api/project-submissions':'/api/enquiries';
 const post=async token=>{
  const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(mode==='structured'?{...body,challengeToken:token||''}:body),signal:AbortSignal.timeout(mode==='structured'?65000:18000)});
  const out=await r.json();return {r,out};
 };
 let response;
 if(mode==='structured'){
  // Retry without a challenge first; committed records can be recovered even if the widget is unavailable.
  if(old){response=await post('');if(response.r.ok&&response.out.ok===true){}else if(response.r.status===400&&/security verification/i.test(response.out.error||'')){response=null;}else throw Error(response.out.error||'The previous registration could not be confirmed. Retry safely.');}
  if(!response){cfg=cfg||await config();if(cfg.mode!=='structured')throw Error('The original registration service is unavailable. No duplicate request was sent.');const token=await challenge(cfg.sitekey);persist({mode,body,category:old?.category||data.category});response=await post(token);}
 }else{persist({mode,body,category:old?.category||data.category});response=await post('');}
 const {r,out}=response;
 // A definite first-attempt validation/rate-limit rejection did not commit. Allow correction.
 if(!old&&!r.ok&&[400,413,415,429].includes(r.status))clear();
 const expected='VZ-SUB-'+body.requestId.replaceAll('-','').toUpperCase();
 if(!r.ok||out.ok!==true||typeof out.reference!=='string'||(mode==='structured'?out.reference!==expected:!/^VZ-[A-Z0-9-]{6,40}$/i.test(out.reference)))throw Error(out.error||'The studio did not confirm your request. Retry safely.');
 clear();return {...out,mode,submittedEmail:mode==='structured'?body.contact.email:body.email,submittedCategory:mode==='structured'?body.brief.category:old?.category||data.category};
}
window.VeloryzRegistrationTransport={send,payload,pending};
})();
