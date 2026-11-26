/* VELORYZ Studio Control / Unified AI Command Centre
 * Reuses existing authenticated persistence for independent agents, persona
 * CMS briefs and the global Gemini/OpenAI provider; no synthetic settings.
 */
'use strict';
let aiHubTab='assistants';
function aiControlPage(){
 const groups=[
  ['assistants','4 Assistants','Help, Contact, Client and Project Creator','Live settings / encrypted keys'],
  ['personas','5 AI Advisers','Specialty briefs for the public advisers','CMS draft and publish'],
  ['provider','Provider Connection','Global Gemini / OpenAI configuration','Protected server settings']
 ];
 const sectionMarkup=aiHubTab==='assistants'
  ?(typeof knowledgeAiAdmin==='function'?knowledgeAiAdmin():'<p>Independent agent tools are unavailable. Reload the admin scripts.</p>')
  :aiHubTab==='personas'
  ?(typeof aiMindsetPage==='function'?aiMindsetPage():'<p>Adviser tools could not be loaded.</p>')
  :'<section class="ad-ai-provider-panel">'+
    '<header class="ad-ai-provider-head"><div class="admin-eyebrow">SECURE SERVICE / MODEL SETTINGS</div><h2>Global AI provider</h2><p>Manage the site-wide provider and model. Provider changes are saved to protected server settings immediately and are separate from published CMS drafts.</p></header>'+
    (typeof aiSettingsForm==='function'?aiSettingsForm():'<p>Provider module unavailable.</p>')+
    '<div class="ai-check-result" id="platform-connections" role="status"></div>'+
    '</section>';
 const description='Configure real AI assistants, edit adviser specialties and test provider connections from one place. Changes in separate tabs follow their own save workflow.';
 return heading('STUDIO INTELLIGENCE / CENTRAL CONTROL','AI Control Centre',description,
  '<a class="admin-button secondary" href="#/documentation">Knowledge sources ↗</a> <a class="admin-button" href="#/health">System diagnostics ↗</a>')+
  '<section class="ad-ai-control" aria-label="AI management">'+
  '<div class="ad-ai-hub-overview"><div><strong>9</strong><span>Configured AI roles</span><small>Five adviser briefs + four independent agents</small></div><div><strong>3</strong><span>Management workspaces</span><small>Independent profiles, shared provider, adviser briefs</small></div><div><strong>0</strong><span>Automatic training jobs</span><small>Changing instructions is not model retraining</small></div></div>'+
  '<div class="ad-ai-hub-tabs" role="tablist" aria-label="AI configuration sections">'+groups.map(([key,name,desc,action])=>
   '<button type="button" role="tab" id="ad-ai-tab-'+key+'" data-ai-hub-tab="'+key+'" aria-controls="ad-ai-hub-panel" aria-selected="'+(key===aiHubTab)+'" class="ad-ai-hub-tab '+(key===aiHubTab?'is-active':'')+'"><strong>'+E(name)+'</strong><span>'+E(desc)+'</span><small>'+E(action)+'</small></button>'
  ).join('')+'</div>'+
  '<section id="ad-ai-hub-panel" role="tabpanel" aria-labelledby="ad-ai-tab-'+E(aiHubTab)+'" class="ad-ai-hub-panel">'+sectionMarkup+'</section>'+
  '<p class="ad-ai-hub-note">Security note: API keys stay server-side. Independent agents save immediately; character adviser briefs require Save draft → Publish site. Use “Test actual reply” to verify a provider before announcing it as working.</p>'+
  '</section>';
}
document.addEventListener('click',event=>{
 const trigger=event.target.closest('[data-ai-hub-tab]');
 if(!trigger)return;
 aiHubTab=trigger.dataset.aiHubTab;
 if(!['assistants','personas','provider'].includes(aiHubTab))aiHubTab='assistants';
 if(section==='ai-control')render();
});
