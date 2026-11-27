/* R51.11 — VELORYZ Flightdeck. Evidence-led, read-only infrastructure operations. */
(()=>{
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defs=[
 ['edge','Public edge','/','public','Public HTML response and deployed release headers.'],
 ['backend','Core backend','/api/health','public','Existing service health contract; not a full database or storage test.'],
 ['cms','Published content','/api/site','public','Published revision and JSON response contract.'],
 ['owner','Owner gateway','/api/admin/state','owner','Authorized session and owner state response.'],
 ['config','Runtime connections','/api/admin/connections','owner','Reported database, storage, password and AI configuration.'],
 ['media','Media metadata','/api/admin/media','owner','Bounded inventory read; no upload or object-write test.'],
 ['asset','Official brand asset','/assets/brand/official/Main-Dark-Ink-Transparent.webp','public','Expected image response; no browser rendering certification.'],
 ['scarf','Original motion asset','/assets/frame-cut/reveal.mp4','public','Expected video response; no playback certification.'],
 ['ai','Shared AI configuration','/api/admin/ai/settings','owner','Credential metadata only; no model inference.'],
 ['mail','Client email configuration','/api/client-portal/admin/delivery','owner','Credential metadata only; no message sent.'],
 ['quality','Content preflight','/api/admin/quality','owner','Saved draft content audit, not a security scan.'],
 ['anonymous','Anonymous owner access','/api/admin/state','anonymous','No-cookie request should be refused; response body never retained.'],
 ['history','CMS revision history','/api/admin/history','owner','Up to 50 content publications; not Worker deployments.'],
 ['docs','Documentation source','/admin/docs-source','owner','Owner article-source inventory contract.']
];
const byId=Object.fromEntries(defs.map(d=>[d[0],d]));
const tabs=[['overview','Flight deck','01'],['services','Service ledger','02'],['security','Trust & security','03'],['releases','Release control','04'],['recovery','Recovery lab','05']];
const states={pass:'Verified response',config:'Configured only',warn:'Attention',fail:'Check failed',unknown:'Not checked',running:'Checking'};
const critical=new Set(['edge','backend','cms','owner','anonymous']);
function aggregate(records){
 const rows=defs.map(d=>records[d[0]]||{state:'unknown'}),count=k=>rows.filter(r=>r.state===k).length;
 const criticalFailure=[...critical].some(k=>records[k]?.state==='fail');
 return {pass:count('pass'),config:count('config'),warn:count('warn'),fail:count('fail'),unknown:count('unknown'),running:count('running'),criticalFailure};
}
function evaluate(id,data,status,headers){
 const ok=status>=200&&status<300,type=(headers.type||'').toLowerCase();
 const result=(state,detail,extra={})=>({state,detail,...extra});
 if(id==='anonymous')return [401,403].includes(status)?result('pass','Anonymous request denied (HTTP '+status+').'):result(status===200?'fail':'warn','Expected HTTP 401/403; received '+status+'. Review gateway behavior.');
 if(!ok)return result('fail','HTTP '+status+' — expected successful response.');
 if(id==='edge')return type.startsWith('text/html')?result('pass','Public HTML responded.',{release:headers.release||null,commit:headers.commit||null,security:{csp:headers.csp,hsts:headers.hsts,nosniff:headers.nosniff,referrer:headers.referrer}}):result('fail','Unexpected public content type.');
 if(id==='asset'||id==='scarf')return type.startsWith(id==='asset'?'image/':'video/')?result('pass','Expected '+(id==='asset'?'image':'video')+' content type.'):result('fail','Unexpected or missing asset content type.');
 if(id==='backend')return data?.ok===true?result('pass','Backend health contract returned ok.'):result('fail','Backend did not report ok.');
 if(id==='cms')return data?.state&&Number.isFinite(Number(data.version))?result('pass','Published CMS revision '+data.version+'.',{revision:Number(data.version)}):result('fail','Incomplete published CMS contract.');
 if(id==='owner')return data?.state&&Number.isFinite(Number(data.draftVersion))&&Number.isFinite(Number(data.publishedVersion))?result('pass','Owner session and CMS state responded.',{draftRevision:Number(data.draftVersion),publishedRevision:Number(data.publishedVersion)}):result('fail','Incomplete owner state response.');
 if(id==='config')return typeof data?.database==='string'&&typeof data?.storage==='string'?result(data.password===true?'config':'warn','Runtime provider labels reported; not connectivity proof.',{database:data.database.slice(0,100),storage:data.storage.slice(0,100),password:data.password===true,aiStatus:String(data.ai?.status||'not reported').slice(0,70)}):result('fail','Runtime configuration contract incomplete.');
 if(id==='media')return Array.isArray(data?.items)?result('pass',data.items.length+' active metadata records returned (maximum 200).',{count:data.items.length}):result('fail','Media inventory contract incomplete.');
 if(id==='ai'||id==='mail')return typeof data?.configured==='boolean'?result(data.configured?'config':'warn',data.configured?'Credential reported configured; live delivery not tested.':'Credential not reported configured.'):result('warn','Configuration status not reported.');
 if(id==='quality')return Array.isArray(data?.issues)?result(data.ok===false?'warn':'pass',data.issues.filter(x=>x.severity==='error').length+' errors · '+data.issues.filter(x=>x.severity==='warning').length+' warnings in saved content.',{errors:data.issues.filter(x=>x.severity==='error').length,warnings:data.issues.filter(x=>x.severity==='warning').length}):result('fail','Content audit contract incomplete.');
 if(id==='history')return Array.isArray(data?.items)?result('pass',data.items.length+' recent content revisions returned.',{history:data.items.slice(0,50).filter(x=>x&&typeof x.id==='string'&&Number.isFinite(Number(x.revision))).map(x=>({id:x.id,revision:Number(x.revision),created_at:String(x.created_at||''),summary:String(x.summary||'').slice(0,200)}))}):result('fail','History contract incomplete.');
 if(id==='docs')return Array.isArray(data?.items)?result('pass',data.items.length+' source article records returned.',{count:data.items.length}):result('fail','Documentation source contract incomplete.');
 return result('unknown','No contract available.');
}
let owner=null,records={},runs=[],busy=false,tab='overview',selected='edge',sequence=0,filter='all',review={},finishedAt=0;
function syncOwner(){if(owner===workspace)return;owner=workspace;records={};runs=[];busy=false;sequence++;review={};finishedAt=0;}
function time(v){return v?new Date(v).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'Not checked';}
function token(state){return '<span class="fd-state fd-'+esc(state)+'"><i></i>'+esc(states[state]||states.unknown)+'</span>';}
function status(id){return records[id]?.state||'unknown';}
function action(label,attr){return '<button type="button" class="fd-button" '+attr+'>'+esc(label)+'</button>';}
function jump(id,label){return '<a class="fd-link" href="#/'+id+'">'+esc(label)+' ↗</a>';}
function ext(url,label){return '<a class="fd-link" target="_blank" rel="noopener noreferrer" href="'+url+'">'+esc(label)+' ↗</a>';}
function header(){
 const s=aggregate(records),total=defs.length,done=s.pass+s.config+s.warn+s.fail,headline=busy?'Observation in progress':!done?'Awaiting first observation':s.criticalFailure?'Critical response needs review':s.fail||s.warn?'Evidence requires attention':'Observed checks completed';
 return '<header class="fd-hero"><div class="fd-hero-copy"><div class="fd-kicker"><span class="fd-beacon"></span> VELORYZ SYSTEMS / FLIGHTDECK <span>R51.11</span></div><h1>Infrastructure<br><em>command.</em></h1><p>Observe the real estate of your studio — from the public edge to private service contracts. Every signal carries evidence and a boundary.</p><div class="fd-hero-actions"><button type="button" class="fd-primary" data-fd-run '+(busy||preview?'disabled':'')+'>'+(busy?'Observing…':'Run observation')+' <span>↗</span></button>'+action('Export evidence','data-fd-export '+(!done?'disabled':''))+'</div></div><div class="fd-hero-instrument"><div class="fd-instrument-label">OBSERVATION / CURRENT TAB</div><div class="fd-count">'+String(done).padStart(2,'0')+'<span> / '+total+'</span></div><div class="fd-track" aria-label="'+done+' of '+total+' checks completed"><span style="width:'+(100*done/total)+'%"></span></div><strong role="status">'+esc(headline)+'</strong><small>'+esc(finishedAt?'Last completed '+time(finishedAt):'No completed observation')+'</small><div class="fd-mini-stats"><span>Verified <b>'+s.pass+'</b></span><span>Config <b>'+s.config+'</b></span><span>Attention <b>'+(s.warn+s.fail)+'</b></span></div></div></header>';
}
function topology(){
 const groups=[['01 / ENTRY','edge','backend'],['02 / CONTROL','owner','cms','config'],['03 / SERVICES','media','ai','mail'],['04 / ASSURANCE','anonymous','quality','history','docs']];
 return '<section class="fd-panel fd-topology"><div class="fd-panel-heading"><div><span class="fd-index">SYSTEM MAP / 01</span><h2>From edge to evidence.</h2><p>Logical service relationships, not an observed network trace. Select a node to inspect its last response.</p></div><span class="fd-tag">NO SYNTHETIC SIGNALS</span></div><div class="fd-topology-map">'+groups.map((g,i)=>'<div class="fd-lane"><span class="fd-lane-label">'+g[0]+'</span>'+g.slice(1).map(id=>'<button type="button" class="fd-node" data-fd-node="'+id+'" aria-pressed="'+(selected===id)+'"><span class="fd-node-icon">'+String(defs.findIndex(d=>d[0]===id)+1).padStart(2,'0')+'</span><span><strong>'+esc(byId[id][1])+'</strong>'+token(status(id))+'</span></button>').join('')+(i<groups.length-1?'<span class="fd-connector" aria-hidden="true">→</span>':'')+'</div>').join('')+'</div>'+inspector()+'</section>';
}
function inspector(){
 const d=byId[selected],r=records[selected]||{};
 return '<div class="fd-inspect"><div><span class="fd-index">SELECTED NODE</span><h3>'+esc(d[1])+'</h3><code>'+esc(d[2])+'</code></div><div>'+token(r.state||'unknown')+'<p>'+esc(r.detail||d[4])+'</p><small>'+esc(r.at?time(r.at)+' · '+r.ms+' ms browser response time':'No observation yet')+'</small></div><div><p>'+esc(d[4])+'</p>'+action('Inspect this service','data-fd-single="'+d[0]+'" '+(busy||preview?'disabled':''))+'</div></div>';
}
function trend(){
 const s=runs.slice(-10);
 return '<section class="fd-panel"><div class="fd-panel-heading"><div><span class="fd-index">SIGNAL STRIP / 02</span><h2>Observation samples</h2><p>Actual on-demand browser response durations for the public edge and core backend. Not uptime or server percentile telemetry.</p></div></div>'+(s.length?'<div class="fd-trend">'+s.map((r,i)=>'<div class="fd-sample"><small>'+String(i+1).padStart(2,'0')+'</small><strong>'+esc(r.edge==null?'—':r.edge+' ms')+'</strong><span>Edge</span><strong>'+esc(r.backend==null?'—':r.backend+' ms')+'</strong><span>Backend</span><small>'+esc(new Date(r.at).toLocaleTimeString('en-IN'))+'</small></div>').join('')+'</div>':'<div class="fd-empty"><strong>No observation samples</strong><p>Run a full observation to populate the strip. Samples stay in this tab only.</p></div>')+'</section>';
}
function signals(){
 return '<section class="fd-panel"><div class="fd-panel-heading"><div><span class="fd-index">SRE COVERAGE / 03</span><h2>Signals we can establish</h2><p>Four golden signals, with explicit coverage.</p></div></div><div class="fd-signal-grid">'+[['Latency','Sampled','Browser request duration, not server p95.'],['Errors','Sampled','HTTP and response-contract failures for these checks.'],['Traffic','Not connected','Use Cloudflare request volume and origin logs.'],['Saturation','Not connected','Use Supabase reports and Cloudflare resource metrics.']].map(([a,b,c])=>'<article><span class="fd-index">'+esc(a)+'</span><h3>'+esc(b)+'</h3><p>'+esc(c)+'</p></article>').join('')+'</div></section>';
}
function ledger(){
 const list=defs.filter(d=>filter==='all'||status(d[0])===filter);
 return '<section class="fd-panel"><div class="fd-panel-heading"><div><span class="fd-index">EVIDENCE REGISTER</span><h2>Service ledger</h2><p>Read-only contracts, grouped by scope. Never assume configuration equals availability.</p></div><label class="fd-select">Filter <select id="fd-filter">'+[['all','All services'],...Object.entries(states)].map(([v,l])=>'<option value="'+v+'" '+(filter===v?'selected':'')+'>'+esc(l)+'</option>').join('')+'</select></label></div><div class="fd-table-wrap"><table class="fd-table"><thead><tr><th>Service / scope</th><th>Evidence state</th><th>Response</th><th>Observation</th><th>Action</th></tr></thead><tbody>'+list.map(d=>{const r=records[d[0]]||{};return '<tr><td><strong>'+esc(d[1])+'</strong><small>'+esc(d[3]+' · '+d[2])+'</small></td><td>'+token(r.state||'unknown')+'</td><td>'+esc(r.ms==null?'—':r.ms+' ms')+'</td><td>'+esc(r.detail||d[4])+'<small>'+esc(time(r.at))+'</small></td><td>'+action('Check','data-fd-single="'+d[0]+'" '+(busy||preview?'disabled':''))+'</td></tr>';}).join('')+'</tbody></table></div></section>';
}
function security(){
 const h=records.edge?.security||{},config=records.config||{},checks=[['Content Security Policy',h.csp],['Strict Transport Security',h.hsts],['X-Content-Type-Options: nosniff',h.nosniff],['Referrer Policy',h.referrer],['Password configured',config.password]];
 return '<section class="fd-panel"><div class="fd-panel-heading"><div><span class="fd-index">TRUST BOUNDARY</span><h2>Security evidence, not a security score.</h2><p>Only the public homepage headers and a single anonymous owner API denial are inspected.</p></div></div><div class="fd-security">'+checks.map(([l,v])=>'<article><strong>'+esc(l)+'</strong>'+token(v===undefined?'unknown':v?'pass':'warn')+'<p>'+esc(v===undefined?'Run observation first.':v?'Observed present / configured.':'Not observed; review.')+'</p></article>').join('')+'<article><strong>Anonymous owner API</strong>'+token(status('anonymous'))+'<p>'+esc(records.anonymous?.detail||'No-cookie GET must be rejected.')+'</p></article></div><p class="fd-note">Header presence does not validate CSP strength, RLS policies, object permissions, access separation or all authentication routes. No penetration tests are run.</p></section><section class="fd-panel"><div class="fd-panel-heading"><div><span class="fd-index">PROVIDER ASSURANCE</span><h2>Inspect the actual control plane.</h2><p>Use native logs, security advisors and policies; no provider management token is stored here.</p></div></div><div class="fd-link-grid">'+ext('https://supabase.com/dashboard','Supabase project & advisors')+ext('https://developers.cloudflare.com/workers/observability/','Cloudflare observability guidance')+ext('https://dash.cloudflare.com/','Cloudflare dashboard')+jump('ai-control','AI provider controls')+'</div></section>';
}
function releases(){
 const e=records.edge||{},c=records.cms||{},o=records.owner||{},history=records.history?.history||[],sha=/^[a-f0-9]{7,40}$/i.test(e.commit||'')?e.commit:null;
 const diff=c.revision!=null&&o.publishedRevision!=null?c.revision===o.publishedRevision?'Observed public and owner revisions match.':'Observed revisions differ; check release propagation.':'Run observation to compare revisions.';
 return '<section class="fd-panel"><div class="fd-panel-heading"><div><span class="fd-index">TWO RELEASE TRACKS</span><h2>Code deployment ≠ content publication.</h2><p>Keep these timelines separate to avoid restoring the wrong system.</p></div></div><div class="fd-release-grid"><article><span class="fd-index">01 / CLOUDFLARE WORKER</span><h3>'+esc(e.release||'Release not reported')+'</h3><code>'+esc(e.commit||'Commit not reported')+'</code><p>From the public HTML response header, not the GitHub branch head.</p>'+ext('https://dash.cloudflare.com/','Worker deployments')+(sha?ext('https://github.com/veloryzhere-prog/veloryz-studio/commit/'+sha,'Reported Git commit'):'')+'</article><article><span class="fd-index">02 / WEBSITE CMS</span><h3>v'+esc(workspace.publishedVersion)+'</h3><p>Loaded owner revision · draft v'+esc(workspace.draftVersion)+(workspace.dirty?' · unsaved changes':workspace.hasDraft?' · saved draft':' · no draft changes reported')+'.</p><p>'+esc(diff)+'</p>'+jump('history','Open full CMS history')+'</article></div></section><section class="fd-panel"><div class="fd-panel-heading"><div><span class="fd-index">CONTENT RELEASE JOURNAL</span><h2>Recent publications</h2><p>Restore only to a draft. Code and database backups are separate.</p></div>'+action('Refresh journal','data-fd-single="history" '+(busy||preview?'disabled':''))+'</div>'+(history.length?'<div class="fd-journal">'+history.map(h=>'<article><span class="fd-version">v'+esc(h.revision)+'</span><div><strong>'+esc(h.summary)+'</strong><small>'+esc(time(h.created_at))+'</small></div>'+action('Review restore','data-fd-restore="'+esc(h.id)+'" '+(preview||workspace.dirty||busy?'disabled':''))+'</article>').join('')+'</div>':'<div class="fd-empty"><p>'+esc(records.history?.detail||'Observe the history service to load publications.')+'</p></div>')+(workspace.dirty?'<p class="fd-note">Save or discard unsaved edits in the content console before restoring.</p>':'')+'</section>';
}
const readiness=[['headers','Review security headers and anonymous denial','Check the Trust & security view.'],['provider','Inspect provider logs, error rate and saturation','Cloudflare and Supabase native dashboards.'],['backup','Confirm database backup and restore plan','Do not assume a CMS history entry is a database backup.'],['journeys','Verify public, owner and private-client browser journeys','Include low-end device and mobile checks.'],['assets','Validate official motion playback and media operations','Use a controlled test asset; never overwrite brand originals.'],['rollback','Confirm release target and rollback compatibility','Check migrations and bindings before code rollback.']];
function recovery(){
 return '<section class="fd-panel"><div class="fd-panel-heading"><div><span class="fd-index">RECOVERY PLAYBOOK</span><h2>Recover without collateral damage.</h2><p>Operator-run steps. No automatic rollback, deletion or provider mutation is available.</p></div></div><div class="fd-playbook">'+[['01','Capture evidence','Export a redacted observation and note the affected visitor journey.'],['02','Locate the failing layer','Compare the public response, CMS revision and service contracts with provider logs.'],['03','Choose the correct recovery','CMS: restore a content revision to draft. Worker: review version and resource compatibility. Database: use the verified provider recovery procedure.'],['04','Verify before declaring recovery','Recheck browser journeys and provider metrics. Do not infer uptime from one successful request.']].map(([n,t,b])=>'<article><span>'+n+'</span><div><h3>'+t+'</h3><p>'+b+'</p></div></article>').join('')+'</div><div class="fd-link-grid">'+jump('history','Restore CMS content to draft')+ext('https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/','Cloudflare rollback procedure')+ext('https://supabase.com/docs/guides/platform/backups','Supabase backup guidance')+'</div></section><section class="fd-panel"><div class="fd-panel-heading"><div><span class="fd-index">OPERATOR READINESS</span><h2>Release acceptance checklist</h2><p>Manual attestations for this browser tab only; not certified or persisted.</p></div><strong>'+readiness.filter(r=>review[r[0]]).length+' / '+readiness.length+'</strong></div><div class="fd-checklist">'+readiness.map(([id,t,b])=>'<label><input type="checkbox" data-fd-review="'+id+'" '+(review[id]?'checked':'')+'><span><strong>'+t+'</strong><small>'+b+'</small></span></label>').join('')+'</div></section>';
}
function page(){
 syncOwner();
 return '<div id="fd-root" class="fd-root">'+header()+'<nav class="fd-nav" aria-label="Infrastructure console views">'+tabs.map(([id,label,n])=>'<button type="button" data-fd-tab="'+id+'" aria-pressed="'+(tab===id)+'"><span>'+n+'</span>'+label+'</button>').join('')+'</nav><div class="fd-body">'+(preview?'<p class="fd-note">Local design preview. Live observations require the owner workspace.</p>':'')+(tab==='overview'?topology()+trend()+signals():tab==='services'?ledger():tab==='security'?security():tab==='releases'?releases():recovery())+'<footer class="fd-footer"><span>VELORYZ SYSTEMS / R51.11</span><span>Read-only observation · No continuous monitoring · No fabricated uptime</span></footer></div></div>';
}
function refresh(){if(section!=='health')return;const el=document.getElementById('fd-root');if(!el)return;const focus=document.activeElement?.closest?.('button');const attr=focus?['data-fd-tab','data-fd-node','data-fd-single','data-fd-run','data-fd-export'].find(a=>focus.hasAttribute(a)):null,val=attr?focus.getAttribute(attr):null;el.outerHTML=page();if(attr){const next=[...document.querySelectorAll('['+attr+']')].find(b=>b.getAttribute(attr)===val);if(next&&!next.disabled)next.focus({preventScroll:true});}}
async function probe(id,seq,session){
 const d=byId[id],started=performance.now();
 try{
  const raw=id==='edge'||id==='asset'||id==='scarf'||id==='anonymous';
  const response=await fetch(d[2],{method:'GET',credentials:d[3]==='owner'?'same-origin':'omit',cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(15000),...(id==='asset'||id==='scarf'?{headers:{Range:'bytes=0-0'}}:{})});
  const h=response.headers,headers={type:h.get('content-type')||'',release:h.get('x-veloryz-release'),commit:h.get('x-veloryz-commit'),csp:!!h.get('content-security-policy'),hsts:!!h.get('strict-transport-security'),nosniff:h.get('x-content-type-options')?.toLowerCase()==='nosniff',referrer:!!h.get('referrer-policy')};
  let data=null;
  if(raw||!response.ok){if(response.body)await response.body.cancel().catch(()=>{});}
  else data=await response.json();
  const result=evaluate(id,data,response.status,headers);
  if(seq===sequence&&owner===session&&workspace===session)records[id]={...result,ms:Math.round(performance.now()-started),at:Date.now(),http:response.status};
 }catch{if(seq===sequence&&owner===session&&workspace===session)records[id]={state:'fail',detail:'Request unavailable, timed out or returned invalid JSON.',ms:Math.round(performance.now()-started),at:Date.now()};}
}
async function run(ids=defs.map(d=>d[0])){
 if(preview||busy)return;
 syncOwner();busy=true;const seq=++sequence,session=owner;for(const id of ids)records[id]={state:'running'};refresh();
 for(let i=0;i<ids.length;i+=3){if(seq!==sequence||workspace!==session)return;await Promise.all(ids.slice(i,i+3).map(id=>probe(id,seq,session)));refresh();}
 if(seq!==sequence||workspace!==session)return;busy=false;finishedAt=Date.now();if(ids.length===defs.length){runs.push({at:finishedAt,edge:records.edge?.state==='pass'?records.edge.ms:null,backend:records.backend?.state==='pass'?records.backend.ms:null});runs=runs.slice(-10);}refresh();
}
function exportEvidence(){
 const clean=Object.fromEntries(Object.entries(records).map(([id,r])=>[id,{state:r.state,detail:r.detail,at:r.at,ms:r.ms,http:r.http,...(id==='edge'?{release:r.release,commit:r.commit,security:r.security}:{})}]));
 const payload={format:'veloryz-flightdeck-evidence-v1',exportedAt:new Date().toISOString(),scope:'On-demand browser checks only; no secrets, client records, history payloads or provider credentials.',records:clean,samples:runs,manualChecklist:review};
 const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='veloryz-flightdeck-evidence.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.addEventListener('click',e=>{
 if(section!=='health')return;
 const t=e.target.closest('[data-fd-tab]');if(t){tab=t.dataset.fdTab;refresh();return;}
 const node=e.target.closest('[data-fd-node]');if(node){selected=node.dataset.fdNode;refresh();return;}
 const single=e.target.closest('[data-fd-single]');if(single&&byId[single.dataset.fdSingle]){run([single.dataset.fdSingle]);return;}
 if(e.target.closest('[data-fd-run]')){run();return;}
 if(e.target.closest('[data-fd-export]')){exportEvidence();return;}
 const restore=e.target.closest('[data-fd-restore]');if(restore){if(preview||busy||workspace.dirty){toast('Resolve unsaved changes before restoring.');return;}const h=records.history?.history?.find(x=>x.id===restore.dataset.fdRestore);if(!h)return;confirmAction('Restore CMS revision v'+h.revision+'?','This replaces the entire saved website draft, not the deployed Worker or database. The public site stays unchanged until a separate publication.',async()=>{if(workspace.dirty)throw Error('New unsaved changes detected.');const before=workspace,data=await api('/api/admin/restore',{method:'POST',body:JSON.stringify({id:h.id,draftVersion:workspace.draftVersion})});if(workspace!==before)return;workspace={...data,dirty:false};safeRender();toast('Content revision restored to draft. Review it before publishing.');},'Restore to draft');}
});
document.addEventListener('change',e=>{if(section!=='health')return;const t=e.target;if(t.id==='fd-filter'){filter=t.value;refresh();}else if(t.dataset.fdReview){review[t.dataset.fdReview]=t.checked;refresh();}});
window.VeloryzFlightdeck={page};
})();
