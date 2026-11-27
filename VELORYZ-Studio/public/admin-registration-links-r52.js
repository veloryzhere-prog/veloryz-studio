/* R52.2.7 — explicit, owner-scoped request/workspace handoff. */
(()=>{
'use strict';
const e=v=>E(v??'');
const validId=v=>typeof v==='string'&&/^[0-9a-f-]{36}$/i.test(v);
const exact=(rows,reference)=>rows.filter(r=>r?.reference===reference);
const money=v=>Number.isSafeInteger(v)&&v>=0?'₹'+(v/100).toLocaleString('en-IN',{maximumFractionDigits:2}):'Not recorded';
let token=0;
async function openRoom(record,structured){
 if(preview||!workspace||cpBusy||cpLoading||!record?.reference)return;
 const session=workspace,start=section,seq=++token;
 try{
  let id=structured?record.accepted_project_id:'';
  if(structured&&!id){toast('No accepted workspace is recorded for this registration.');return;}
  if(!structured){
   const data=await cpReq('/projects',{signal:AbortSignal.timeout(15000)});
   if(seq!==token||session!==workspace||section!==start)return;
   const matches=(Array.isArray(data.projects)?data.projects:[]).filter(p=>p.request_reference===record.reference);
   if(matches.length!==1){toast(matches.length?'Multiple returned workspaces share this reference. Review manually.':'No matching workspace in the returned directory. This does not prove none exists.');return;}
   id=matches[0].id;
  }
  if(!validId(id))throw Error('Invalid workspace identifier.');
  const data=await cpReq('/projects?id='+encodeURIComponent(id),{signal:AbortSignal.timeout(15000)});
  if(seq!==token||session!==workspace||section!==start||cpBusy||cpLoading)return;
  const p=data.workspace?.project;
  if(p?.id!==id||p.request_reference!==record.reference)throw Error('Workspace reference could not be verified.');
  window.VeloryzCRM?.openDirectory();
  cpNewProject=false;cpNewDraft=null;cpEditMode='';cpEditingItem='';cpTab='overview';cpSearch='';cpFilter='all';
  cpSelected=id;cpWorkspace=null;cpEmailEvents=[];cpLoaded=false;
  location.hash='#/client-portal';render();
 }catch(err){if(seq===token&&session===workspace&&section===start)toast(err.message||'Workspace lookup failed.');}
}
function panel(p){
 if(!p.request_reference)return '';
 return '<section class="cr-panel"><span class="cr-label">ORIGINAL SUBMISSION</span><h3>Registration & estimate</h3><p>Check the immutable registration linked to this project. Legacy enquiries do not have a verified estimate snapshot.</p><button type="button" class="cr-button" data-r52-original>Inspect original registration ↗</button><a class="cr-button" href="#/submission-center">Submission intelligence ↗</a><a class="cr-button" href="#/client-identities">Client identities ↗</a></section>';
}
async function inspect(p){
 if(preview||!workspace||!p?.request_reference||cpBusy||cpLoading)return;
 const session=workspace,id=p.id,reference=p.request_reference,seq=++token;
 const still=()=>seq===token&&workspace===session&&section==='client-portal'&&cpSelected===id&&cpWorkspace?.project?.id===id&&cpWorkspace.project.request_reference===reference;
 try{
  const data=await api('/api/admin/project-submissions?status=all&page=0&q='+encodeURIComponent(reference),{signal:AbortSignal.timeout(15000)});
  if(!still())return;
  if(data.source!=='structured-v1'||!Array.isArray(data.items))throw Error('Registration service unavailable.');
  const matches=exact(data.items,reference);
  if(matches.length!==1){toast(matches.length?'Multiple matching registrations; review manually.':'No verified registration returned for this reference.');return;}
  const r=matches[0];
  if(r.accepted_project_id!==id){toast('The registration does not record this workspace as its accepted project.');return;}
  const q=r.quote||{},b=r.brief?.brief||{};
  const fact=(k,v)=>'<div><span>'+e(k)+'</span><strong>'+e(v??'Not recorded')+'</strong></div>';
  const html='<div class="enquiry-detail-grid">'+fact('Reference',reference)+fact('Category',b.category)+fact('Planning range',money(q.lowPaise)+' – '+money(q.highPaise))+fact('Published pricing revision',q.publishedRevision)+fact('Amount due',money(q.amountDuePaise))+fact('Pricing version',q.pricingVersion)+'</div><p>Original indicative estimate only. It is not a final invoice or agreed price.</p><div class="enquiry-message"><span>PROJECT OBJECTIVE</span><p>'+e(b.goal)+'</p></div><details><summary>Original structured brief</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere">'+e(JSON.stringify(r.brief,null,2))+'</pre></details><details><summary>Original pricing snapshot</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere">'+e(JSON.stringify(q,null,2))+'</pre></details>';
  showModal('Original registration',e(reference),html,'<button type="button" class="admin-button secondary" data-action="close-modal">Close</button>');
 }catch{if(still())toast('Verified registration service is unavailable. The existing project has not changed.');}
}
document.addEventListener('click',ev=>{if(section!=='client-portal'||!ev.target.closest('[data-r52-original]'))return;void inspect(cpWorkspace?.project);});
window.VeloryzRegistrationLinks={openRoom,panel,exact};
})();
