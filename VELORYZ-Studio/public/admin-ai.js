'use strict';
function aiSettingsForm(){
 if(!aiSettings)return '<p class="admin-platform-copy" role="status">Loading your protected provider settings…</p>';
 return `<form id="ai-provider-form" class="ai-provider-form" autocomplete="off"><div class="admin-form-grid"><div class="admin-field"><label for="ai-provider">Reply provider</label><select id="ai-provider" name="provider"><option value="gemini" ${aiSettings.provider==='gemini'?'selected':''}>Gemini</option><option value="openai" ${aiSettings.provider==='openai'?'selected':''}>OpenAI · existing server key</option><option value="guide" ${aiSettings.provider==='guide'?'selected':''}>Studio guide only · disables live AI chat</option></select></div><div class="admin-field"><label for="ai-model">Model identifier</label><input id="ai-model" name="model" maxlength="100" value="${E(aiSettings.provider==='guide'?'':aiSettings.model||'gemini-3.5-flash-lite')}" list="ai-model-list" spellcheck="false"><datalist id="ai-model-list"><option value="gemini-3.5-flash-lite"><option value="gemini-3.8-flash"></datalist><small>Recommended for short replies: gemini-3.5-flash-lite. Model access depends on your Google project.</small></div><div class="admin-field full"><label for="gemini-key">Gemini API key</label><input id="gemini-key" name="apiKey" type="password" ${aiSettings.provider!=='gemini'?'disabled':''} autocomplete="new-password" spellcheck="false" autocapitalize="off" maxlength="512" placeholder="${aiSettings.source==='encrypted-owner-setting'?'A key is saved · leave blank to keep it':'Enter your Gemini API key here'}"><small>This owner-only form sends the key securely to the server. It is encrypted separately from site content and is never returned, published, logged, or included in code exports. The field clears after saving.</small></div></div><div class="ai-provider-status"><span class="provider-status-dot ${aiSettings.configured?'ready':''}" aria-hidden="true"></span><span>${E(aiSettings.provider==='guide'?'Studio guide selected':aiSettings.configured?'Provider key configured':'Gemini key needed')} · ${E(aiSettings.source==='encrypted-owner-setting'?'Encrypted owner setting':aiSettings.source==='runtime-secret'?'Server runtime secret':'No saved key')}</span></div><p class="ai-setup-note">Connection settings apply immediately. They are separate from Save draft / Publish. Only short questions and recent chat history are sent to the selected provider. Google’s free-tier data policy differs from its paid tier; avoid sensitive customer information.</p><p id="ai-save-error" role="alert"></p><button class="admin-button" type="submit">Save connection & test reply ↗</button><button class="admin-button secondary" type="button" data-ai-reload>Reload settings</button></form>`;
}
async function loadAiSettings(){
 if(aiSettingsLoading)return;aiSettingsLoading=true;
 try{aiSettings=preview?{provider:'gemini',model:'gemini-3.5-flash-lite',configured:false,source:'none',version:-1,secureStorageReady:true}:await api('/api/admin/ai/settings');}
 catch(e){aiSettings={provider:'gemini',model:'gemini-3.5-flash-lite',configured:false,source:'none',version:-1,loadError:e.message};}
 finally{aiSettingsLoading=false;if(section==='platform'||section==='ai-control'&&aiHubTab==='provider'){render();if(aiSettings.loadError){const error=$('#ai-save-error');if(error)error.textContent=aiSettings.loadError;}}}
}
function showAiConnectionResult(box,result){
 box.textContent=(result.status==='live'?'Live '+result.providerLabel+' reply verified. ':'Live '+result.providerLabel+' is not ready. ')+result.message+'\nStudio guide remains available when the provider cannot answer.';
 if(['quota','billing','access','auth'].includes(result.status)&&result.provider==='gemini'){
  const link=document.createElement('a');link.href='https://aistudio.google.com/';link.target='_blank';link.rel='noopener';link.className='text-link';link.textContent='Review your Google AI Studio project ↗';box.append(document.createElement('br'),link);
 }
}
document.addEventListener('change',event=>{
 if(event.target.id!=='ai-provider')return;
 const model=$('#ai-model'),key=$('#gemini-key');model.value=event.target.value==='openai'?'gpt-4.1-mini':event.target.value==='guide'?'':'gemini-3.5-flash-lite';model.disabled=event.target.value==='guide';key.disabled=event.target.value!=='gemini';key.value='';
});
document.addEventListener('click',event=>{if(event.target.closest('[data-ai-reload]')){aiSettings=null;loadAiSettings();}});
document.addEventListener('submit',async event=>{
 const form=event.target;if(form.id!=='ai-provider-form')return;event.preventDefault();if(!form.reportValidity())return;
 const button=event.submitter,error=$('#ai-save-error'),key=$('#gemini-key');error.textContent='';button.disabled=true;
 try{
  if(preview)throw Error('Configure your real key only in the deployed owner workspace. This is a design preview.');
  if(aiSettings.loadError)throw Error('Reload the connection settings before saving.');
  const fields=Object.fromEntries(new FormData(form));
  const result=await api('/api/admin/ai/settings',{method:'PUT',body:JSON.stringify({...fields,version:aiSettings.version})});
  key.value='';aiSettings=result;key.placeholder=result.source==='encrypted-owner-setting'?'A key is saved · leave blank to keep it':'Enter your Gemini API key here';const status=$('.ai-provider-status>span:last-child',form);if(status)status.textContent=(result.configured?'Provider key configured':'Studio guide selected')+' · '+(result.source==='encrypted-owner-setting'?'Encrypted owner setting':result.source==='runtime-secret'?'Server runtime secret':'No saved key');$('.provider-status-dot',form)?.classList.toggle('ready',result.configured);const box=$('#platform-connections');box.textContent='Connection saved securely. Testing a real reply…';
  const check=await api('/api/admin/ai/check',{method:'POST',body:'{}'});showAiConnectionResult(box,check);toast(check.status==='live'?'Live '+check.providerLabel+' reply verified.':'Provider saved. Review the connection result below.');
 }catch(e){error.textContent=e.message;}finally{key.value='';button.disabled=false;}
});
