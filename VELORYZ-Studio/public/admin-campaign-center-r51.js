/* R51.9 — Campaign and marketing operations, using existing CMS records. */
(()=>{
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const placements=[['popup','Announcement popup'],['slider','Sliding advertisement'],['inline','In-page card'],['pinned','Pinned message']];
const placement=o=>placements.some(([id])=>id===o.placement)?o.placement:'popup';
const priority=o=>Number(o.priority)||0;
function status(o,at){
 if(!o.enabled)return 'Paused';
 const start=o.startAt?Date.parse(o.startAt):-Infinity,end=o.endAt?Date.parse(o.endAt):Infinity;
 if(Number.isNaN(start)||Number.isNaN(end)||start>=end)return 'Invalid';
 if(end<=at)return 'Ended';
 if(start>at)return 'Scheduled';
 return 'Active';
}
function eligible(items,at){return items.filter(o=>status(o,at)==='Active').sort((a,b)=>priority(b)-priority(a));}
function select(items,q,kind,where,filter,at){
 q=q.trim().toLowerCase();return items.filter(o=>(kind==='all'||o.kind===kind)&&(where==='all'||placement(o)===where)&&(filter==='all'||status(o,at)===filter)&&(!q||[o.title,o.eyebrow,o.body,o.id].some(v=>String(v||'').toLowerCase().includes(q)))).sort((a,b)=>priority(b)-priority(a));
}
function boundary(items,at){
 return items.filter(o=>o.enabled).flatMap(o=>[o.startAt,o.endAt]).filter(Boolean).map(Date.parse).filter(n=>Number.isFinite(n)&&n>at).sort((a,b)=>a-b)[0]??null;
}
function issues(o){
 const out=[];
 if(!String(o.title||'').trim())out.push('Missing title');
 if(!!String(o.buttonLabel||'').trim()!==!!String(o.buttonUrl||'').trim())out.push('Primary label / destination mismatch');
 if(!!String(o.secondaryLabel||'').trim()!==!!String(o.secondaryUrl||'').trim())out.push('Secondary label / destination mismatch');
 if(['image','video'].includes(o.mediaType)&&!o.media)out.push('Selected media type has no file');
 const start=o.startAt?Date.parse(o.startAt):-Infinity,end=o.endAt?Date.parse(o.endAt):Infinity;
 if(Number.isNaN(start)||Number.isNaN(end)||start>=end)out.push('Invalid schedule');
 return out;
}
function summary(items,at){
 const active=eligible(items,at);
 return {active,counts:Object.fromEntries(['Active','Scheduled','Paused','Ended','Invalid'].map(s=>[s,items.filter(o=>status(o,at)===s).length])),groups:Object.fromEntries(placements.map(([id])=>[id,active.filter(o=>placement(o)===id)])),next:boundary(items,at)};
}
let query='',kind='all',where='all',filter='all',timeValue='',live=null,liveError='',liveLoading=false,liveAt=null,liveRequest=0;
const localTime=v=>v?new Date(v).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'—';
const zone=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'device local time';
const time=()=>timeValue?Date.parse(timeValue):Date.now();
const button=(action,label,id)=>'<button type="button" class="admin-button secondary" data-action="'+action+'"'+(id?' data-id="'+esc(id)+'"':'')+'>'+esc(label)+'</button>';
const opt=(values,current)=>values.map(([v,l])=>'<option value="'+esc(v)+'" '+(v===current?'selected':'')+'>'+esc(l)+'</option>').join('');
function liveView(){
 if(liveLoading)return '<p role="status">Checking the published CMS response…</p>';
 if(liveError)return '<p role="alert">'+esc(liveError)+'</p>';
 if(!live)return '<p>Not checked. Query the real public CMS endpoint to compare published records with your current draft. No analytics are collected.</p>';
 const pub=summary(live.items,Date.now()),draft=workspace.state.offers,byId=new Map(live.items.map(o=>[o.id,o]));
 const changed=draft.filter(o=>!byId.has(o.id)||fingerprint(o)!==fingerprint(byId.get(o.id))).length,removed=live.items.filter(o=>!draft.some(d=>d.id===o.id)).length;
 const revision=String(live.version)===String(workspace.publishedVersion)?'Matches the loaded owner published revision.':'Revision differs from the loaded owner workspace; refresh both before relying on the comparison.';
 return '<p><strong>Published CMS revision '+esc(live.version)+'</strong> · checked '+esc(localTime(liveAt))+' · '+esc(revision)+'</p><p>'+live.items.length+' published records · '+pub.active.length+' schedule-eligible now · '+changed+' new or different draft records · '+removed+' published-only records.</p><p>Public API returned '+live.serverActive+' active record(s) at the time of the check. This is not an impression count or proof of placement rendering.</p>';
}
function fingerprint(o){
 const fields=['id','title','eyebrow','body','kind','media','mediaType','buttonLabel','buttonUrl','enabled','startAt','endAt','priority','entrance','pace','placement','logo','logoLink','theme','animation','frequency','delay','ribbon','dismissible','secondaryLabel','secondaryUrl'];
 return JSON.stringify(fields.map(k=>k==='priority'||k==='delay'?Number(o[k]):o[k]??''));
}
async function checkLive(){
 if(preview){liveError='Run this check from the deployed owner workspace, not a local preview.';renderLive();return;}
 if(liveLoading)return;liveLoading=true;liveError='';const request=++liveRequest;renderLive();
 try{
  const r=await fetch('/api/site',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!r.ok)throw Error('Published CMS returned HTTP '+r.status+'.');
  const d=await r.json();if(!Array.isArray(d.state?.offers)||!Array.isArray(d.activeOffers)||!Number.isFinite(Number(d.version)))throw Error('Published CMS returned an incomplete response.');
  if(request!==liveRequest)return;live={items:d.state.offers,version:d.version,serverActive:d.activeOffers.length};liveAt=Date.now();
 }catch(e){live=null;liveError=e.message;}finally{if(request===liveRequest){liveLoading=false;renderLive();}}
}
function renderLive(){const el=document.getElementById('cm-live');if(el)el.innerHTML=liveView();const b=document.querySelector('[data-cm-live]');if(b)b.disabled=liveLoading;}
function scheduleView(){
 const at=time(),s=summary(workspace.state.offers,at);
 return '<div class="cm-stats">'+Object.entries(s.counts).map(([k,v])=>'<div><small>'+k+'</small><strong>'+v+'</strong></div>').join('')+'</div><p class="cm-muted">Schedule evaluated at '+esc(localTime(at))+' ('+esc(zone())+'). Next enabled schedule boundary: '+esc(s.next?localTime(s.next):'None configured')+'.</p><div class="cm-placements">'+placements.map(([id,name])=>{
  const group=s.groups[id],first=group[0],others=group.slice(1);
  return '<article><h3>'+esc(name)+'</h3><strong>'+group.length+' eligible</strong><p>'+esc(first?'First by priority: '+first.title:'No eligible draft campaigns')+'</p>'+(others.length?'<p class="cm-muted">'+esc(id==='pinned'?'Other pins wait behind the first eligible message; visitor dismissal may alter selection.':id==='popup'?'Other popups may be skipped or deferred based on visitor state.':id==='slider'?'Rotation includes the other eligible ads.':'Eligible cards are rendered together.')+'</p>':'')+(first?button('preview-offer','Preview creative',first.id):'')+'</article>';
 }).join('')+'</div>';
}
function inventory(){
 const all=workspace.state.offers,at=time(),list=select(all,query,kind,where,filter,at);
 return '<p role="status">'+list.length+' of '+all.length+' draft campaigns · maximum 30 records</p>'+(list.length?'<div class="cm-list">'+list.map(o=>{
  const warnings=issues(o),p=placements.find(([id])=>id===placement(o))[1];
  return '<article class="cm-row"><div class="cm-row-main"><span class="cm-muted">'+esc(p)+' · '+esc(o.kind||'offer')+'</span><h3>'+esc(o.title||'Untitled campaign')+'</h3><span class="cm-status">'+esc(status(o,at))+' in draft simulation · Priority '+esc(priority(o))+'</span><p>'+esc(o.startAt?localTime(o.startAt):'No start restriction')+' → '+esc(o.endAt?localTime(o.endAt):'No expiry')+'</p>'+(warnings.length?'<p class="cm-warning">'+esc(warnings.join(' · '))+'</p>':'')+'</div><label class="toggle"><input type="checkbox" data-offer-toggle="'+esc(o.id)+'" '+(o.enabled?'checked':'')+'>Enabled in draft</label><div class="cm-actions">'+button('preview-offer','Preview',o.id)+button('edit-offer','Edit',o.id)+button('duplicate-offer','Duplicate',o.id)+button('delete-offer','Remove',o.id)+'</div></article>';
 }).join('')+'</div>':'<div class="empty-state"><h3>No matching campaigns</h3><p>Change the filters or create a new campaign.</p></div>');
}
function refresh(){const s=document.getElementById('cm-schedule'),i=document.getElementById('cm-inventory');if(s)s.innerHTML=scheduleView();if(i)i.innerHTML=inventory();renderLive();}
function page(){
 const add=(k,p,label)=>'<button type="button" class="admin-button secondary" data-action="new-offer" data-kind="'+k+'" data-placement="'+p+'">'+label+'</button>';
 return heading('Growth operations','Campaign & marketing center','Plan and manage real announcements, advertisements, offers and their creative schedules.','<button type="button" class="admin-button" data-action="new-offer">'+icon('plus')+'New campaign</button>')+
 '<div class="notice-bar">Website draft controls. Saving does not activate a campaign; publishing applies the entire saved CMS draft. Schedule eligibility is not proof that a visitor sees a campaign.</div>'+
 '<section class="form-card cm-console"><div class="form-card-header"><div><h2>Create campaign</h2><p>Use the existing creative editor and original animation system.</p></div></div><div class="cm-actions">'+add('announcement','popup','Announcement popup')+add('ad','slider','Sliding advertisement')+add('ad','inline','In-page advertisement')+add('announcement','pinned','Pinned update')+add('offer','popup','Offer')+'</div></section>'+
 '<section class="form-card cm-console"><div class="form-card-header"><div><h2>Schedule & placement forecast</h2><p>Simulate the loaded draft, including unsaved edits. Actual visitor frequency, dismissal, focus, reduced motion and modal conflicts are not simulated.</p></div></div><div class="admin-form-grid"><div class="admin-field"><label for="cm-time">Simulate date / time ('+esc(zone())+')</label><input type="datetime-local" id="cm-time" value="'+esc(timeValue)+'"><small>Empty means current device time; no schedule is changed.</small></div>'+field('Slider rotation interval · seconds','site.adInterval',{type:'number',minNumber:4,maxNumber:30,help:'Website draft setting. Applies only on routes using the campaign runtime.'})+'</div><div class="cm-actions"><button type="button" class="admin-button secondary" data-cm-now>Use current time</button><button type="button" class="admin-button secondary" data-cm-refresh>Refresh forecast</button></div><div id="cm-schedule">'+scheduleView()+'</div></section>'+
 '<section class="form-card cm-console"><div class="form-card-header"><div><h2>Published campaign diagnostics</h2><p>Read-only comparison against the actual public CMS API.</p></div><button type="button" class="admin-button secondary" data-cm-live '+(liveLoading?'disabled':'')+'>Check published CMS</button></div><div id="cm-live" aria-live="polite">'+liveView()+'</div><div class="cm-coverage"><h3>Renderer coverage</h3><p>Source inspection: the standard SPA renderer implements all four placements; Project Creator suppresses them. The current editorial homepage uses a separate shell without the standard campaign runtime. Standalone pages may also use separate renderers. Do not assume site-wide placement.</p><div class="cm-actions"><a class="admin-button secondary" href="/?classic=1" target="_blank" rel="noopener noreferrer">Classic homepage ↗</a><a class="admin-button secondary" href="/" target="_blank" rel="noopener noreferrer">Editorial homepage ↗</a><a class="admin-button secondary" href="/services/" target="_blank" rel="noopener noreferrer">Standard public route ↗</a></div></div></section>'+
 '<section class="form-card cm-console"><div class="form-card-header"><div><h2>Campaign inventory</h2><p>Inspect or edit real draft records. No impressions, click counts or conversion rates are invented.</p></div></div><div class="admin-form-grid"><div class="admin-field full"><label for="cm-search">Search campaigns</label><input type="search" id="cm-search" value="'+esc(query)+'" placeholder="Title, message, ID…"></div><div class="admin-field"><label for="cm-kind">Type</label><select id="cm-kind">'+opt([['all','All types'],['announcement','Announcements'],['ad','Advertisements'],['offer','Offers']],kind)+'</select></div><div class="admin-field"><label for="cm-where">Placement</label><select id="cm-where">'+opt([['all','All placements'],...placements],where)+'</select></div><div class="admin-field"><label for="cm-status">Simulated status</label><select id="cm-status">'+opt([['all','All statuses'],...['Active','Scheduled','Paused','Ended','Invalid'].map(s=>[s,s])],filter)+'</select></div></div><div id="cm-inventory">'+inventory()+'</div></section>';
}
document.addEventListener('input',e=>{if(e.target.id==='cm-search'){query=e.target.value;const el=document.getElementById('cm-inventory');if(el)el.innerHTML=inventory();}});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='cm-time'){timeValue=t.value;if(timeValue&&!Number.isFinite(Date.parse(timeValue)))timeValue='';}else if(t.id==='cm-kind')kind=t.value;else if(t.id==='cm-where')where=t.value;else if(t.id==='cm-status')filter=t.value;else if(t.hasAttribute('data-offer-toggle')){queueMicrotask(()=>{if(section==='offers')refresh();});return;}else return;refresh();});
document.addEventListener('click',e=>{if(e.target.closest('[data-cm-live]'))checkLive();if(e.target.closest('[data-cm-now]')){timeValue='';const input=document.getElementById('cm-time');if(input)input.value='';refresh();}if(e.target.closest('[data-cm-refresh]'))refresh();});
window.VeloryzCampaignCenter={page,refresh,issues};
})();
