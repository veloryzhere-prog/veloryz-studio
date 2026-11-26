/* Studio Control · independent AI agent and provider management */
'use strict';
let knowledgeAiProfiles=null,knowledgeAiUsage=[],knowledgeAiLoading=false,knowledgeAiSelected='help',knowledgeAiError='',knowledgeAiTesting=false;
const knowledgeAiNames={help:'Help Centre',support:'Contact Support',client:'Client Portal',creator:'Project Creator'};
async function loadKnowledgeAi(){
 if(knowledgeAiLoading)return;knowledgeAiLoading=true;knowledgeAiError='';
 try{const data=preview?{profiles:[],usage:[]}:await api('/api/admin/knowledge-ai/agents');knowledgeAiProfiles=data.profiles||[];knowledgeAiUsage=data.usage||[]}
 catch(e){knowledgeAiProfiles=[];knowledgeAiError=e.message||'Unable to load the assistant service.'}
 finally{knowledgeAiLoading=false;if(section==='knowledge-ai'||section==='ai-control'&&['assistants','usage','playground','sources'].includes(aiHubTab))render();}
}
function knowledgeAiAdmin(){
 const profiles=knowledgeAiProfiles,chosen=profiles?.find(a=>a.id===knowledgeAiSelected)||profiles?.[0],totals=knowledgeAiUsage||[];
 const usage=id=>totals.filter(t=>t.agent===id).reduce((acc,x)=>acc+Number(x.total||0),0);
 const cards=['help','support','client','creator'].map(id=>{const x=profiles?.find(p=>p.id===id),name=knowledgeAiNames[id];return '<button type="button" class="ka-agent-card '+(knowledgeAiSelected===id?'is-active':'')+'" data-ka-select="'+id+'"><span class="ka-agent-symbol">✳</span><strong>'+E(name)+'</strong><small>'+(x?E(x.provider)+' · '+(x.provider==='guide'?'Reference-only mode':x.configured?'Credential route configured · test required':'Provider not connected'):'Loading connection…')+'</small><span class="ka-agent-card-meta">'+(profiles&&!knowledgeAiError?usage(id):'—')+' recorded outcomes (report window) ↗</span></button>'}).join('');
 const edit=chosen?'<form id="ka-form" data-ka-agent="'+E(chosen.id)+'" class="ka-form" autocomplete="off"><div class="ka-status-bar"><span class="'+(chosen.enabled?'is-enabled':'')+'"></span><strong>'+E(knowledgeAiNames[chosen.id])+'</strong><small>Independent agent settings · version '+Number(chosen.version)+'</small></div>'+
 '<div class="ka-form-grid">'+
 '<label class="ka-field"><span>Assistant display name</span><input name="name" maxlength="80" required value="'+E(chosen.name)+'"></label>'+
 '<label class="ka-field"><span>Provider</span><select name="provider" id="ka-provider"><option value="gemini" '+(chosen.provider==='gemini'?'selected':'')+'>Google Gemini</option><option value="openai" '+(chosen.provider==='openai'?'selected':'')+'>OpenAI</option><option value="guide" '+(chosen.provider==='guide'?'selected':'')+'>Studio reference mode · no paid AI</option></select></label>'+
 '<label class="ka-field"><span>Model identifier</span><input name="model" id="ka-model" maxlength="100" spellcheck="false" value="'+E(chosen.model)+'" placeholder="gemini-3.5-flash-lite"><small>Availability depends on the provider account.</small></label>'+
 '<label class="ka-field"><span>API key (new or replacement)</span><input name="apiKey" type="password" maxlength="512" spellcheck="false" autocomplete="new-password" placeholder="'+(chosen.keySaved?'Encrypted key saved — leave blank to keep':'Paste a Gemini or OpenAI key')+'"><small>Encrypted server-side. Never included in site content, chat responses or future exports.</small></label>'+
 '<label class="ka-field ka-full"><span>Welcome message</span><input name="welcome" maxlength="400" required value="'+E(chosen.welcome)+'"></label>'+
 '<label class="ka-field ka-full"><span>Agent-specific instructions</span><textarea name="instructions" rows="6" maxlength="2600" required>'+E(chosen.instructions)+'</textarea><small>Define purpose, tone, and escalation rules. Server-enforced security rules cannot be overridden.</small></label>'+
 '<label class="ka-field ka-full"><span>Suggested first questions (one per line, max 4)</span><textarea name="suggestions" rows="4" maxlength="430">'+E((chosen.suggestions||[]).join('\n'))+'</textarea></label>'+
 '</div><div class="ka-form-options"><label><input name="enabled" type="checkbox" '+(chosen.enabled?'checked':'')+'> Enable this assistant</label><label><input name="clearKey" type="checkbox"> Remove saved per-agent API key</label></div>'+
 '<div class="ka-actions"><button class="admin-button" type="submit">Save assistant settings ↗</button><button class="admin-button secondary" type="button" data-ka-test="'+E(chosen.id)+'">Test actual reply</button><button class="admin-button secondary" type="button" data-ka-refresh>Refresh</button></div><p class="ka-error" id="ka-error" role="alert"></p><div class="ka-test-result" id="ka-test-result" role="status"></div></form>':'<p class="ka-loading" role="status">'+E(knowledgeAiError||'Loading the private profile settings…')+'</p>';
 const summary='<div class="ka-summary"><div><strong>04</strong><span>Independent assistants</span></div><div><strong>02</strong><span>External providers supported</span></div><div><strong>'+totals.reduce((n,x)=>n+Number(x.total||0),0)+'</strong><span>Requests (last 30 days)</span></div></div>';
 return (section==='ai-control'?'':heading('STUDIO INTELLIGENCE','AI Management Centre','Manage four separate assistant roles, models, Gemini/OpenAI API credentials, access and usage. These settings are owner-only and apply independently of site publishing.'))+
 '<section class="ka-management">'+summary+'<div class="ka-agent-grid">'+cards+'</div>'+
 '<div class="ka-panel"><div class="ka-panel-intro"><div><span class="admin-eyebrow">PROTECTED ASSISTANT PROFILE</span><h2>Configure '+E(chosen?knowledgeAiNames[chosen.id]:'an assistant')+'</h2><p>Each assistant retains its own instructions, provider and model. Agents without a key may use the enabled Help assistant’s same-provider credential. Reference-only mode never calls a model.</p></div><a href="/help/assistant/" target="_blank" rel="noopener">Preview chat ↗</a></div>'+edit+'</div>'+
 '<div class="ka-info"><div><h3>How routing works</h3><p><strong>Help AI:</strong> documentation support. <strong>Contact AI:</strong> customer support and escalation. <strong>Client AI:</strong> portal navigation only, no private project data. <strong>Creator AI:</strong> project planning and scope.</p></div><div><h3>Other Studio personalities</h3><p>All five character briefs are available in the <a href="#/ai-control" data-ai-hub-tab="personas">Advisers tab</a>; shared model settings are in the <a href="#/ai-control" data-ai-hub-tab="provider">Provider tab</a>. Independent assistant settings remain separate to prevent unintended changes.</p></div><div><h3>Security and cost controls</h3><p>Owner-only configuration, AES-GCM encrypted keys, per-agent rate limits, 30-day aggregate usage counters, request timeouts and explicit non-AI fallback. No transcripts are kept by this backend.</p></div></div></section>';
}
document.addEventListener('click',event=>{
 const pick=event.target.closest('[data-ka-select]');if(pick){if(window.VeloryzAiDraft?.dirty&&!confirm('Discard unsaved assistant changes?'))return;if(window.VeloryzAiDraft)window.VeloryzAiDraft.dirty=false;knowledgeAiSelected=pick.dataset.kaSelect;if(section==='knowledge-ai'||section==='ai-control'&&aiHubTab==='assistants')render();return}
 if(event.target.closest('[data-ka-refresh]')){if(window.VeloryzAiDraft?.dirty&&!confirm('Discard unsaved assistant changes?'))return;if(window.VeloryzAiDraft)window.VeloryzAiDraft.dirty=false;knowledgeAiProfiles=null;loadKnowledgeAi();return}
 const test=event.target.closest('[data-ka-test]');if(!test||knowledgeAiTesting||preview)return;if(window.VeloryzAiDraft?.dirty&&!confirm('Test the saved profile? Unsaved changes are not used.'))return;
 knowledgeAiTesting=true;const target=document.getElementById('ka-test-result');test.disabled=true;if(target)target.textContent='Requesting a real response from the selected provider…';
 (async()=>{try{const data=await api('/api/admin/knowledge-ai/agents/'+test.dataset.kaTest,{method:'POST',body:'{}'});if(target)target.textContent=(data.mode==='ai'?'Verified live AI reply:\n':'Reference guidance (no live model reply):\n')+(data.providerStatus?'Provider status: '+data.providerStatus+'\n':'')+(data.answer||'No response')+(data.sources?.length?'\nReferences: '+data.sources.map(x=>x.path).join(', '):'')}
 catch(e){if(target)target.textContent='Test failed: '+e.message}
 finally{knowledgeAiTesting=false;test.disabled=false}})();
});
document.addEventListener('change',e=>{if(e.target.id!=='ka-provider')return;const input=document.getElementById('ka-model');if(input)input.value=e.target.value==='gemini'?'gemini-3.5-flash-lite':e.target.value==='openai'?'gpt-4.1-mini':''});
document.addEventListener('submit',async event=>{
 const form=event.target;if(form.id!=='ka-form')return;event.preventDefault();const error=document.getElementById('ka-error'),button=form.querySelector('[type=submit]');if(error)error.textContent='';if(!form.reportValidity())return;button.disabled=true;
 const current=knowledgeAiProfiles?.find(x=>x.id===form.dataset.kaAgent);
 try{if(preview)throw Error('Configure assistants in the deployed owner workspace.');if(!current)throw Error('Reload the assistant profile first.');
 const f=new FormData(form),suggestions=String(f.get('suggestions')||'').split('\n').map(x=>x.trim()).filter(Boolean);
 const payload={version:current.version,name:f.get('name'),provider:f.get('provider'),model:f.get('model'),apiKey:f.get('apiKey'),welcome:f.get('welcome'),instructions:f.get('instructions'),suggestions,enabled:form.elements.enabled.checked,clearKey:form.elements.clearKey.checked};
 const response=await api('/api/admin/knowledge-ai/agents/'+current.id,{method:'PUT',body:JSON.stringify(payload)});
 if(response.profile){if(window.VeloryzAiDraft)window.VeloryzAiDraft.dirty=false;knowledgeAiProfiles=knowledgeAiProfiles.map(x=>x.id===current.id?response.profile:x);render();toast('Assistant profile saved securely.');}
 }catch(e){if(error)error.textContent=e.message}finally{button.disabled=false}
});
