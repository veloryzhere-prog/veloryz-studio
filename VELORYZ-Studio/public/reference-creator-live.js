/* Reference-style live brief panel for the real V4 project wizard.
   Reads the EXISTING creator state and estimate; never writes or sends project data. */
(()=>{
'use strict';
let lastStep='',lastForm=null;
const money=n=>Number.isFinite(Number(n))?'₹'+Math.round(Number(n)).toLocaleString('en-IN'):'To be discussed';
const str=(v,max=110)=>{const s=String(v??'').trim();return s.length>max?s.slice(0,max-1).trim()+'…':s||'—';};
const el=(tag,klass,text)=>{
 const node=document.createElement(tag);if(klass)node.className=klass;
 if(text!==undefined)node.textContent=String(text);return node;
};
const getApi=()=>window.VeloryzCreatorV4;
function update(){
 const panel=document.getElementById('vz-creator-live'),api=getApi();
 if(!panel||!api)return;
 const data=api.get(),flow=api.flow(),stage=api.stage(),idx=flow.indexOf(stage);
 const percent=Math.max(0,Math.min(100,Math.round(((idx+1)/Math.max(1,flow.length))*100)));
 const estimate=api.estimate();
 const progress=panel.querySelector('#vz-live-ring-progress');
 if(progress)progress.style.strokeDashoffset=String(289-(289*percent/100));
 const percentNode=panel.querySelector('#vz-live-percent');
 if(percentNode)percentNode.textContent=percent+'%';
 const stageNode=panel.querySelector('#vz-live-step');
 if(stageNode)stageNode.textContent='STEP '+String(Math.max(idx+1,1)).padStart(2,'0')+' / '+String(flow.length).padStart(2,'0');
 const label=panel.querySelector('#vz-live-estimate');
 if(label)label.textContent=estimate&&Number.isFinite(estimate.low)&&Number.isFinite(estimate.high)
  ?money(estimate.low)+' – '+money(estimate.high):'Scope under review';
 const fields=[
  ['Project',data.category],['Style',data.style],['Palette',data.palette],
  ['Pages / screens',data.pages],['Features',Array.isArray(data.features)?data.features.join(', '):''],
  ['Design reference',data.template||data.external||data.reference],['Timeline',data.timeline],
  ['Budget preference',Number(data.budget)>0?money(data.budget):''],['Goal',data.goal]
 ];
 const rows=panel.querySelector('#vz-live-brief-rows');if(!rows)return;
 const selected=fields.filter(([,v])=>v!==null&&v!==undefined&&String(v).trim());
 rows.replaceChildren(...selected.map(([name,value])=>{
  const wrapper=el('div','vz-live-brief-row'),dt=el('dt','',name),dd=el('dd','',str(value,90));wrapper.append(dt,dd);return wrapper;
 }));
 if(!rows.children.length){const empty=el('p','vz-live-brief-empty','Choose a project type to start building your brief.');rows.append(empty);}
}
function mount(){
 const root=document.querySelector('.v4-root'),wrap=root?.querySelector('.v4-question-wrap'),api=getApi();
 if(!root||!wrap||!api)return;
 if(wrap.querySelector('#vz-creator-live')){update();return;}
 const aside=el('aside','vz-creator-live');aside.id='vz-creator-live';aside.setAttribute('aria-label','Live project brief preview');
 const header=el('div','vz-live-header');
 const title=el('h3','', 'Live brief');
 const toggle=el('button','vz-live-toggle','Show ↑');toggle.type='button';toggle.setAttribute('aria-label','Expand or collapse live brief');toggle.setAttribute('aria-expanded','false');
 header.append(title,toggle);
 const info=el('div','vz-live-ring');
 info.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" class="vz-live-track"/><circle cx="50" cy="50" r="46" id="vz-live-ring-progress" class="vz-live-progress"/></svg>';
 const ringText=el('div','vz-live-ring-text');
 ringText.append(el('strong','', '0%'),el('span','', 'STEP / OVERVIEW'));
 ringText.querySelector('strong').id='vz-live-percent';
 ringText.querySelector('span').id='vz-live-step';
 info.append(ringText);
 const rows=el('dl','vz-live-brief-rows');rows.id='vz-live-brief-rows';
 const estimateLabel=el('p','vz-live-estimate-label','Indicative estimate / not a final quote');
 const estimate=el('strong','vz-live-estimate','—');estimate.id='vz-live-estimate';
 const note=el('p','vz-live-note','Your answers are part of this draft. The real project reference is issued by the studio system only after successful submission.');
 aside.append(header,info,rows,estimateLabel,estimate,note);
 wrap.append(aside);
 toggle.addEventListener('click',()=>{
  const open=aside.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded',String(open));
  toggle.textContent=open?'Hide ↓':'Show ↑';
 });
 update();
}
function later(){queueMicrotask(()=>{mount();update();});}
document.addEventListener('veloryz:creator-render',later);
document.addEventListener('input',e=>{if(e.target.closest('.v4-root'))later();});
document.addEventListener('change',e=>{if(e.target.closest('.v4-root'))later();});
document.addEventListener('click',e=>{if(e.target.closest('.v4-root'))later();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',later,{once:true});else later();
})();
