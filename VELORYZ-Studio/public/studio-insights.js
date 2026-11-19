'use strict';
/* V5 optional, local-only quality analytics. No third-party scripts, cookies, or server upload.
   Not an aggregate business analytics service. Visitors opt in before any recording. */
(()=>{
 const KEY='veloryz.measurement.optin.v1',DATA='veloryz.measurement.local.v1';
 const blocked=()=>navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'||window.doNotTrack==='1';
 const getConsent=()=>{try{return localStorage.getItem(KEY)==='yes'&&!blocked();}catch{return false;}};
 const read=()=>{try{const d=JSON.parse(localStorage.getItem(DATA)||'{}');return d&&typeof d==='object'&&!Array.isArray(d)?d:{};}catch{return {};}};
 const write=d=>{try{localStorage.setItem(DATA,JSON.stringify(d));}catch{}};
 function record(type,value){
  if(!getConsent())return;
  const allowed=new Set(['page_view','service_interest','brief_start','booking_interest','help_open','proposal_download','lcp_bucket','cls_bucket']);
  if(!allowed.has(type))return;
  const state=read(),key=type+(value&&['good','needs-improvement','poor'].includes(value)?'.'+value:'');
  state[key]=Math.min(100000,(Number(state[key])||0)+1);
  state.lastRecorded=new Date().toISOString().slice(0,10);
  write(state);
 }
 const bucket=(value,good,poor)=>value<=good?'good':value<=poor?'needs-improvement':'poor';
 function webVitals(){
  if(!('PerformanceObserver'in window))return;
  try{const observer=new PerformanceObserver(list=>{for(const e of list.getEntries())if(e.entryType==='largest-contentful-paint')window.__vzLastLcp=e.startTime;});observer.observe({type:'largest-contentful-paint',buffered:true});window.addEventListener('pagehide',()=>{if(getConsent()&&Number.isFinite(window.__vzLastLcp))record('lcp_bucket',bucket(window.__vzLastLcp,2500,4000));observer.disconnect();},{once:true});}catch{}
  try{let cls=0;const observer=new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)cls+=e.value;});observer.observe({type:'layout-shift',buffered:true});window.addEventListener('pagehide',()=>{if(getConsent())record('cls_bucket',bucket(cls,.1,.25));observer.disconnect();},{once:true});}catch{}
 }
 function open(){
  const previous=document.querySelector('#studio-measure-dialog');if(previous)previous.remove();
  const dialog=document.createElement('dialog');dialog.id='studio-measure-dialog';dialog.className='studio-measure-dialog';
  const isOn=getConsent();const data=read();
  dialog.innerHTML='<form method="dialog"><button aria-label="Close measurement settings" class="studio-measure-close">×</button></form><h2>Privacy & site quality</h2><p>Help this browser measure navigation and performance. Off by default, and disabled automatically when your browser requests no tracking. All counters stay on this device: nothing is sent to the studio or a third party.</p><label class="studio-measure-toggle"><input type="checkbox" '+(isOn?'checked':'')+(blocked()?' disabled':'')+' data-measure-consent> Allow local, anonymous measurement</label><p class="studio-measure-stats">Local events saved: '+Object.entries(data).filter(([k])=>k!=='lastRecorded').reduce((n,[,v])=>n+(Number(v)||0),0)+'. This is not a studio-wide report.</p><div class="studio-measure-actions"><button type="button" data-measure-clear>Clear my measurements</button><button type="button" data-measure-export>Export local summary</button></div>';
  document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.showModal?.();
  if(!dialog.open)dialog.setAttribute('open','');
  dialog.querySelector('[data-measure-consent]').addEventListener('change',e=>{try{localStorage.setItem(KEY,e.target.checked?'yes':'no');if(!e.target.checked)localStorage.removeItem(DATA);}catch{}dialog.close();});
  dialog.querySelector('[data-measure-clear]').addEventListener('click',()=>{try{localStorage.removeItem(DATA);}catch{}dialog.close();});
  dialog.querySelector('[data-measure-export]').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(read(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='veloryz-local-measurement.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);});
 }
 function mount(){const footer=document.querySelector('#footer .footer-bottom');if(!footer||footer.querySelector('[data-open-measure]'))return;const control=document.createElement('button');control.type='button';control.className='studio-measure-entry';control.dataset.openMeasure='';control.textContent='Privacy & site quality';control.addEventListener('click',open);footer.append(control);}
 document.addEventListener('studio:route',()=>{mount();record('page_view');});
 document.addEventListener('click',e=>{
  const target=e.target.closest('a,button');if(!target)return;
  if(target.matches('[data-expert],[data-ai-help],[data-help-open]'))record('help_open');
  if(target.matches('[data-proposal-draft]'))record('proposal_download');
  if(target.matches('[data-book],a[href^="/book/"]'))record('booking_interest');
  if(target.matches('a[href^="/services/"],a[href^="/pricing/"]'))record('service_interest');
  if(target.matches('a[href^="/create/"],[data-brief-book]'))record('brief_start');
 },{passive:true});
 document.addEventListener('DOMContentLoaded',()=>{mount();webVitals();});
 if(document.readyState!=='loading'){mount();webVitals();}
 window.VeloryzLocalInsights={get enabled(){return getConsent();},summary:()=>({...read()})};
})();
