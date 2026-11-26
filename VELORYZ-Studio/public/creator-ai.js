'use strict';
/* Dedicated VELORYZ Project AI. This conversation is not shared with persona chatbots.
   Only actual provider responses are presented as AI; never invent replies. */
(()=>{
 const PROMPTS=[
  'What features do I need?',
  'How can I reduce my budget?',
  'Help me describe my project goal',
  'What happens after I submit?'
 ];
 const store={open:false,busy:false,messages:[],error:'',fallback:false,initialized:false,draft:''};
 function prewrittenGuide(question,context){
  const text=String(question||'').toLowerCase();
  const category=String(context.category||'your project'),features=Array.isArray(context.features)?context.features:[];
  const selection=features.length?features.slice(0,4).join(', '):'a clear homepage or opening screen, contact flow and responsive layout';
  if(/price|cost|budget|cheaper|less|reduce|offer|discount|afford/i.test(text)){
   return 'A practical way to manage the '+category+' budget is to define a small first release. Prioritize the two or three features visitors actually need, postpone optional animations or integrations, and ask the VELORYZ team for a phased scope and written quotation. Discounts are not automatic and only published, eligible offers can be considered.';
  }
  if(/feature|need|include|integrat|account|dashboard|login|payment/i.test(text)){
   return 'For '+category+', begin with the essential user journey. Your current ideas include: '+selection+'. Decide what visitors must do in the first release, and which features can wait. Accounts, payments, AI and custom APIs should be reviewed for data, security, ongoing service costs and delivery effort.';
  }
  if(/goal|brief|describe|vision|word|write/i.test(text)){
   return 'Try this project-goal outline: “We are creating a '+category+' experience for [target audience]. Visitors should be able to [main action]. The project will be successful when [measurable outcome].” Add the content, integrations and brand materials you already have.';
  }
  if(/submit|after|code|email|client|portal|track|activat|invite/i.test(text)){
   return 'After a successful submission, you receive a project reference on screen. The team reviews the enquiry and may contact you at the supplied email. A separate one-time invitation code is issued only after a private client workspace has been created and email delivery is available. That code opens /client/. Submitting a brief does not instantly activate a portal account.';
  }
  return 'For '+category+', start with the audience, the most important action, the content or screens you need, and your preferred budget and launch window. The VELORYZ team can help narrow scope, discuss phased delivery and prepare an individual quote. This is predefined planning guidance, not a live AI reply.';
 }
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const short=v=>String(v??'').slice(0,350);
 const api=()=>window.VeloryzCreatorV4;
 function mount(){
  const slot=document.getElementById('v4-ai-slot');if(!slot)return;
  if(!store.initialized&&!slot.classList.contains('v2-ai-landing-slot')){store.initialized=true;store.open=matchMedia('(min-width:1180px)').matches;}
  const old=slot.querySelector('#v4-ai-input');if(old&&!store.busy)store.draft=old.value;
  // The planner is available from the welcome screen, not only after the first choice.
  slot.innerHTML='<div class="v4-ai-dock"><button type="button" class="v4-ai-toggle" data-v4-ai-toggle aria-expanded="'+store.open+'" aria-controls="v4-ai-panel"><span class="v4-ai-sparkle" aria-hidden="true">✳</span><span>Project AI</span><b aria-hidden="true">'+(store.open?'×':'↗')+'</b></button>'+
  '<section id="v4-ai-panel" class="v4-ai-panel" role="region" aria-label="VELORYZ project planning assistant" '+(store.open?'':'hidden')+'><div class="v4-ai-heading"><div><span>✳ &nbsp; VELORYZ PROJECT AI</span><h2>Plan with confidence.</h2><p>Ask about scope, features, budget or the next step.</p></div><button type="button" data-v4-ai-toggle aria-label="Close Project AI">×</button></div>'+
  '<div class="v4-ai-history" id="v4-ai-history" role="log" aria-live="polite" aria-relevant="additions text"></div>'+
  '<div class="v4-ai-prompts" id="v4-ai-prompts">'+PROMPTS.map(q=>'<button type="button" data-v4-ai-prompt="'+escape(q)+'">'+escape(q)+' ↗</button>').join('')+'</div>'+
  '<form id="v4-ai-form"><label class="sr-only" for="v4-ai-input">Your project question</label><textarea id="v4-ai-input" rows="2" maxlength="650" placeholder="Ask a project question…" '+(store.busy?'disabled':'')+' required>'+escape(store.draft)+'</textarea><button type="submit" '+(store.busy?'disabled':'')+' aria-label="Send your project question">'+(store.busy?'…':'↑')+'</button></form>'+
  '<p id="v4-ai-status" class="v4-ai-status" role="status"></p>'+
  '<p class="v4-ai-privacy">Your messages are sent to the configured AI provider. Avoid sharing private information. AI suggestions are informational; our team confirms all estimates and commitments. <a href="https://wa.me/919955326740" target="_blank" rel="noopener noreferrer">Talk to the team ↗</a></p></section></div>';
  const history=document.getElementById('v4-ai-history');
  if(history){
   store.messages.forEach(message=>{
    const line=document.createElement('div');line.className='v4-ai-message '+(message.role==='user'?'is-user':message.mode==='guide'?'is-guide':'is-assistant');
    const label=document.createElement('span');label.textContent=message.role==='user'?'YOU':message.mode==='guide'?'STUDIO GUIDE · PREWRITTEN':'PROJECT AI · LIVE MODEL';
    const p=document.createElement('p');p.textContent=message.content;
    line.append(label,p);
    if(Array.isArray(message.sources)&&message.sources.length){
     const nav=document.createElement('div');nav.className='v4-ai-source-links';
     for(const source of message.sources.slice(0,3)){
      if(typeof source?.path!=='string'||!/^\/(?:docs|help|create|client|services|pricing|design|work|studio|process|contact|payments|book|developers|motion|velori|veloryz|teamjob|journey)(?:\/[a-z0-9_-]+)*\/$/.test(source.path))continue;
      const a=document.createElement('a');a.href=source.path;a.textContent=String(source.title||'Read source').slice(0,90)+' ↗';nav.append(a);
     }
     if(nav.childElementCount)line.append(nav);
    }
    history.append(line);
   });
   history.scrollTop=history.scrollHeight;
  }
  const prompts=document.getElementById('v4-ai-prompts');if(prompts)prompts.hidden=store.messages.length>0;
  const status=document.getElementById('v4-ai-status');
  if(status){status.textContent=store.busy?'Checking live Project AI…':store.error;status.classList.toggle('is-error',!!store.error&&!store.fallback);status.classList.toggle('is-guide',store.fallback);}
 }
 function context(){
  const v=api()?.get?.()||{},e=api()?.estimate?.();
  return {category:short(v.category),style:short(v.style),budget:String(v.budget||''),goal:short(v.goal).slice(0,350),features:Array.isArray(v.features)?v.features.slice(0,16):[],stage:short(api()?.stage?.())};
 }
 function show(open){store.open=open;mount();if(open)document.getElementById('v4-ai-input')?.focus({preventScroll:true});}
 async function ask(question){
  if(store.busy||!api()||!question.trim())return;
  const text=question.trim().slice(0,650);store.draft='';const field=document.getElementById('v4-ai-input');if(field)field.value='';
  store.messages.push({role:'user',content:text});store.error='';store.fallback=false;store.busy=true;store.open=true;mount();
  const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),26000);
  try{
   const reply=await fetch('/api/knowledge-ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({agent:'creator',messages:store.messages.slice(-11).map(({role,content})=>({role,content}))}),signal:ctrl.signal});
   const data=await reply.json().catch(()=>({error:'The AI service could not respond.'}));
   if(!reply.ok||!data.answer||!['ai','guide'].includes(data.mode))throw Error(data.error||'The configured Project AI is unavailable.');
   if(data.mode==='guide'){store.fallback=true;store.error='Using matching published site references. A live model reply is not available for this request.';}
   store.messages.push({role:'assistant',mode:data.mode,content:String(data.answer).slice(0,1400),sources:Array.isArray(data.sources)?data.sources.slice(0,4):[]});
  }catch(err){
   store.fallback=true;
   store.error='Live AI is unavailable. Below is predefined studio guidance, not a generated answer. You can still try again or contact the team.';
   store.messages.push({role:'assistant',mode:'guide',content:prewrittenGuide(text,context())});
  }finally{clearTimeout(timeout);store.busy=false;mount();}
 }
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-v4-ai-toggle]')?.closest('.v4-root')){event.preventDefault();event.stopImmediatePropagation();show(!store.open);return;}
  const prompt=event.target.closest('[data-v4-ai-prompt]');
  if(prompt?.closest('.v4-root')){event.preventDefault();event.stopImmediatePropagation();ask(prompt.dataset.v4AiPrompt);}
 },true);
 document.addEventListener('submit',event=>{
  if(event.target.id!=='v4-ai-form')return;
  event.preventDefault();
  const q=document.getElementById('v4-ai-input')?.value||'';
  ask(q);
 });
 document.addEventListener('veloryz:creator-render',mount);
 document.addEventListener('studio:route',mount);
 document.addEventListener('DOMContentLoaded',mount);
 if(document.readyState!=='loading')mount();
})();
