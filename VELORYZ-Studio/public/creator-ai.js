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
 const store={open:false,busy:false,messages:[],error:''};
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const short=v=>String(v??'').slice(0,350);
 const api=()=>window.VeloryzCreatorV4;
 function mount(){
  const slot=document.getElementById('v4-ai-slot');if(!slot)return;
  const stage=api()?.stage?.();
  if(stage==='welcome'||stage==='success'){slot.innerHTML='';return;}
  slot.innerHTML='<div class="v4-ai-dock"><button type="button" class="v4-ai-toggle" data-v4-ai-toggle aria-expanded="'+store.open+'" aria-controls="v4-ai-panel"><span class="v4-ai-sparkle" aria-hidden="true">✳</span><span>Ask VELORYZ Project AI</span><b aria-hidden="true">'+(store.open?'×':'↗')+'</b></button>'+
  '<section id="v4-ai-panel" class="v4-ai-panel" role="region" aria-label="VELORYZ project planning assistant" '+(store.open?'':'hidden')+'><div class="v4-ai-heading"><div><span>✳ &nbsp; VELORYZ PROJECT AI</span><h2>Build with clarity.</h2><p>Ask about scope, features, budget or the next step.</p></div><button type="button" data-v4-ai-toggle aria-label="Close Project AI">×</button></div>'+
  '<div class="v4-ai-history" id="v4-ai-history" role="log" aria-live="polite" aria-relevant="additions text"></div>'+
  '<div class="v4-ai-prompts" id="v4-ai-prompts">'+PROMPTS.map(q=>'<button type="button" data-v4-ai-prompt="'+escape(q)+'">'+escape(q)+' ↗</button>').join('')+'</div>'+
  '<form id="v4-ai-form"><label class="sr-only" for="v4-ai-input">Your project question</label><textarea id="v4-ai-input" rows="2" maxlength="650" placeholder="Ask a project question…" '+(store.busy?'disabled':'')+' required></textarea><button type="submit" '+(store.busy?'disabled':'')+' aria-label="Send your project question">'+(store.busy?'…':'↑')+'</button></form>'+
  '<p id="v4-ai-status" class="v4-ai-status" role="status"></p>'+
  '<p class="v4-ai-privacy">Project details (not your email) are shared with the configured AI provider. AI suggestions are informational; our team confirms all estimates and commitments. <a href="https://wa.me/919955326740" target="_blank" rel="noopener noreferrer">Talk to the team ↗</a></p></section></div>';
  const history=document.getElementById('v4-ai-history');
  if(history){
   store.messages.forEach(message=>{
    const line=document.createElement('div');line.className='v4-ai-message '+(message.role==='user'?'is-user':'is-assistant');
    const label=document.createElement('span');label.textContent=message.role==='user'?'YOU':'PROJECT AI';
    const p=document.createElement('p');p.textContent=message.content;
    line.append(label,p);history.append(line);
   });
   history.scrollTop=history.scrollHeight;
  }
  const prompts=document.getElementById('v4-ai-prompts');if(prompts)prompts.hidden=store.messages.length>0;
  const status=document.getElementById('v4-ai-status');
  if(status){status.textContent=store.busy?'Preparing your answer…':store.error;status.classList.toggle('is-error',!!store.error);}
 }
 function context(){
  const v=api()?.get?.()||{},e=api()?.estimate?.();
  return {category:short(v.category),style:short(v.style),budget:String(v.budget||''),goal:short(v.goal).slice(0,350),features:Array.isArray(v.features)?v.features.slice(0,16):[],stage:short(api()?.stage?.())};
 }
 function show(open){store.open=open;mount();if(open)document.getElementById('v4-ai-input')?.focus();}
 async function ask(question){
  if(store.busy||!api()||!question.trim())return;
  const text=question.trim().slice(0,650);
  store.messages.push({role:'user',content:text});store.error='';store.busy=true;store.open=true;mount();
  const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),26000);
  try{
   const reply=await fetch('/api/project-ai',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({messages:store.messages.slice(-11),context:context()}),signal:ctrl.signal});
   const data=await reply.json().catch(()=>({error:'The AI service could not respond.'}));
   if(!reply.ok||!data.available||!data.answer)throw Error(data.error||'Project AI is unavailable. Please message the team.');
   store.messages.push({role:'assistant',content:String(data.answer).slice(0,1400)});
  }catch(err){
   store.messages.pop();store.error=err.name==='AbortError'?'Project AI timed out. Please retry or message the team.':err.message;
  }finally{clearTimeout(timeout);store.busy=false;mount();}
 }
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-v4-ai-toggle]')){show(!store.open);return;}
  const prompt=event.target.closest('[data-v4-ai-prompt]');
  if(prompt&&document.querySelector('.v4-root'))ask(prompt.dataset.v4AiPrompt);
 });
 document.addEventListener('submit',event=>{
  if(event.target.id!=='v4-ai-form')return;
  event.preventDefault();
  const q=document.getElementById('v4-ai-input')?.value||'';
  ask(q);
 });
 document.addEventListener('veloryz:creator-render',mount);
 document.addEventListener('DOMContentLoaded',mount);
 if(document.readyState!=='loading')mount();
})();
