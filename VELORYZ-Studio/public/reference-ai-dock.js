/* Actual VELORYZ character AI. Uses the existing five-agent /api/adviser endpoint. */
(()=>{
'use strict';
const el=(tag,klass,text)=>{const e=document.createElement(tag);if(klass)e.className=klass;if(text!==undefined)e.textContent=String(text);return e;};
const agents=[
 {id:'happy',name:'Happy',avatar:'/assets/ai-avatars/happy.webp',hint:'Creative ideas, first contact, project inspiration'},
 {id:'nikhil',name:'Nikhil',avatar:'/assets/ai-avatars/nikhil.webp',hint:'Strategy, scope and careful comparisons'},
 {id:'milky',name:'Milky',avatar:'/assets/ai-avatars/milky.webp',hint:'Design direction, visual explorations'},
 {id:'ritik',name:'Ritik',avatar:'/assets/ai-avatars/ritik.webp',hint:'Technical issues and software'},
 {id:'aryan',name:'ARYAN',avatar:'/assets/ai-avatars/aryan.webp',hint:'Executive strategy and critical review'}
];
const root=document.createElement('aside');root.className='vz-ai-dock';root.id='vz-ai-dock';root.dataset.open='false';root.setAttribute('aria-label','VELORYZ AI advisers');
const launch=document.createElement('button');launch.type='button';launch.className='vz-ai-launch';
launch.setAttribute('aria-expanded','false');launch.setAttribute('aria-controls','vz-ai-drawer');
const img=document.createElement('img');img.src=agents[0].avatar;img.alt='';
const launchLabel=document.createElement('span');launchLabel.textContent='Need a hand? Ask Happy';
launch.append(img,launchLabel);
const drawer=document.createElement('section');drawer.id='vz-ai-drawer';drawer.className='vz-ai-drawer';drawer.setAttribute('role','dialog');drawer.setAttribute('aria-labelledby','vz-ai-dock-heading');drawer.setAttribute('aria-modal','false');drawer.inert=true;
const header=document.createElement('div');header.className='vz-ai-header';
const heading=document.createElement('div');const kicker=document.createElement('span');kicker.className='tag';kicker.textContent='VELORYZ / STUDIO CONVERSATIONS';
const title=document.createElement('h2');title.id='vz-ai-dock-heading';title.textContent='Happy AI';heading.append(kicker,title);
const headerPortrait=document.createElement('img');
headerPortrait.className='vz-ai-current-avatar';headerPortrait.src=agents[0].avatar;
headerPortrait.alt='';headerPortrait.width=52;headerPortrait.height=52;headerPortrait.decoding='async';
const close=document.createElement('button');close.type='button';close.className='vz-ai-close';close.setAttribute('aria-label','Close AI conversation');close.textContent='×';
header.append(headerPortrait,heading,close);
const tabs=document.createElement('div');tabs.className='vz-ai-personas';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Choose studio AI personality');
const log=document.createElement('div');log.className='vz-ai-log';log.setAttribute('role','log');log.setAttribute('aria-live','polite');log.setAttribute('aria-relevant','additions');
const disclaimer=document.createElement('p');disclaimer.className='vz-ai-disclaimer';
disclaimer.textContent='AI assistant · Not human staff. Messages and any supplied name are sent to the studio AI service. Do not share passwords or payment details.';
const form=document.createElement('form');form.className='vz-ai-form';
const input=document.createElement('textarea');input.className='vz-ai-input';input.rows=1;input.required=true;input.maxLength=1200;input.placeholder='Ask Happy a question…';input.setAttribute('aria-label','Message to VELORYZ AI');
const send=document.createElement('button');send.type='submit';send.className='vz-ai-send';send.textContent='➤';send.setAttribute('aria-label','Send message');
form.append(input,send);
const status=document.createElement('p');status.className='vz-ai-status';status.setAttribute('role','status');status.textContent='Studio AI · Live availability checked on reply';
drawer.append(header,tabs,log,disclaimer,form,status);root.append(drawer,launch);
document.body.append(root);
let active='happy',busy=false,controller=null;
let visitorFirstName='',nameRequested=false;
const introducedTo=new Set();
const histories=new Map(agents.map(a=>[a.id,[]]));const drafts=new Map();let previousFocus=null,pending=null;
function saveDraft(){drafts.set(active,input.value)}
function cancelPending(){const p=pending;if(!p)return;pending=null;controller=null;p.controller.abort();const i=p.messages.indexOf(p.turn);if(i>=0)p.messages.splice(i,1);if(!drafts.get(p.agent))drafts.set(p.agent,p.question);busy=false;send.disabled=false;status.textContent='Request cancelled. You can retry.';}
const findAgent=()=>agents.find(x=>x.id===active)||agents[0];
const addMessage=(role,text,err=false)=>{
 const item=document.createElement('p');item.className='vz-ai-message';item.dataset.role=role;
 if(err)item.dataset.error='true';item.textContent=String(text);log.append(item);log.scrollTop=log.scrollHeight;
 return item;
};
function askVisitorName(){
 if(visitorFirstName||nameRequested)return;
 nameRequested=true;
 const wrap=el('div','vz-ai-name-capture');
 const label=el('label','vz-ai-name-label','What should we call you? (Optional)');
 label.htmlFor='vz-ai-first-name';
 const field=el('input','vz-ai-name-input');field.id='vz-ai-first-name';field.type='text';field.required=true;
 field.maxLength=40;field.placeholder='Your first name';field.autocomplete='given-name';
 const save=el('button','vz-ai-name-save','Continue ↗');save.type='submit';
 const form=el('form','vz-ai-name-form');const skip=el('button','vz-ai-name-save','Skip');skip.type='button';skip.addEventListener('click',()=>{wrap.remove();input.focus({preventScroll:true});});form.append(label,field,save,skip);
 form.addEventListener('submit',e=>{
  e.preventDefault();const name=field.value.normalize('NFC').trim();
  if(!/^[\p{L}][\p{L}\p{M}'’-]{0,39}$/u.test(name)){field.setCustomValidity('Please use a first name only.');field.reportValidity();field.oninput=()=>field.setCustomValidity('');return;}
  visitorFirstName=name;wrap.remove();
  status.textContent='Thank you, '+name+'. Your name will be included in your AI conversation.';
  input.focus({preventScroll:true});
 });
 wrap.append(form);drawer.insertBefore(wrap,disclaimer);
}
function renderHistory(){
 const agent=findAgent();
 title.textContent=agent.name+' AI';input.placeholder='Ask '+agent.name+' a question…';
 headerPortrait.src=agent.avatar;img.src=agent.avatar;
 launchLabel.textContent='Need a hand? Ask '+agent.name;
 launch.setAttribute('aria-label','Open '+agent.name+' AI studio conversation');
 root.dataset.agent=agent.id;
 input.value=drafts.get(active)||'';
 log.replaceChildren();const messages=histories.get(active)||[];
 if(!messages.length)addMessage('assistant','You’re chatting with '+agent.name+' AI. '+agent.hint+'. What would you like to work on?');
 else for(const m of messages)addMessage(m.role,m.content);
 if(!messages.length){
  const prompts=el('div','vz-ai-suggestions');
  for(const example of ['Help me choose a design','How do I request a project?','Hinglish mein baat karein']){
   const b=el('button','',example);b.type='button';
   b.addEventListener('click',()=>{input.value=example;form.requestSubmit();});prompts.append(b);
  }
  log.append(prompts);
 }
 tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.agent===active)));
}
for(const a of agents){
 const b=document.createElement('button');b.type='button';b.dataset.agent=a.id;b.setAttribute('aria-pressed',String(a.id===active));
 const portrait=document.createElement('img');portrait.src=a.avatar;portrait.alt='';portrait.loading='lazy';portrait.decoding='async';portrait.width=35;portrait.height=35;
 const name=document.createElement('span');name.textContent=a.name;
 b.append(portrait,name);
 b.setAttribute('aria-label','Chat with '+a.name+' AI');
 b.addEventListener('click',()=>{if(active===a.id)return;saveDraft();cancelPending();active=a.id;renderHistory();input.focus({preventScroll:true});});
 tabs.append(b);
}
function open(next){
 const isOpen=typeof next==='boolean'?next:root.dataset.open!=='true';
 if(isOpen===(root.dataset.open==='true'))return;
 root.dataset.open=String(isOpen);launch.setAttribute('aria-expanded',String(isOpen));drawer.inert=!isOpen;
 if(isOpen){previousFocus=document.activeElement;renderHistory();input.focus({preventScroll:true});}
 else {saveDraft();cancelPending();(previousFocus?.isConnected?previousFocus:launch).focus({preventScroll:true});}
}
launch.addEventListener('click',()=>open());
close.addEventListener('click',()=>open(false));
document.addEventListener('keydown',e=>{
 if(root.dataset.open!=='true')return;
 if(e.key==='Escape'&&(root.contains(document.activeElement))){e.preventDefault();open(false);}
});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();form.requestSubmit();}});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;
 const question=input.value.trim();if(!question)return;
 const thisAgent=active;const messages=histories.get(thisAgent);
 const turn={role:'user',content:question};messages.push(turn);addMessage('user',question);input.value='';drafts.delete(thisAgent);
 busy=true;send.disabled=true;status.textContent='Connecting to '+findAgent().name+'…';
 const thinking=addMessage('assistant','Thinking…');
 const requestController=new AbortController();controller=requestController;const request={controller:requestController,agent:thisAgent,messages,turn,question};pending=request;const timeout=setTimeout(()=>requestController.abort(),36000);
 try{
  const response=await fetch('/api/adviser',{method:'POST',headers:{'Content-Type':'application/json'},
   credentials:'same-origin',signal:requestController.signal,body:JSON.stringify({agent:thisAgent,allowGuide:true,firstName:visitorFirstName,firstNamed:Boolean(visitorFirstName)&&!introducedTo.has(thisAgent),
    messages:messages.slice(-15),page:location.pathname})});
  const result=await response.json().catch(()=>({error:'Unable to read assistant response'}));
  if(pending!==request)return;
  if(!response.ok||!result.answer||!['ai','guide'].includes(result.mode))throw Error(result.error||'Live AI is temporarily unavailable.');
  messages.push({role:'assistant',content:String(result.answer)});thinking.textContent=result.answer;
  if(visitorFirstName)introducedTo.add(thisAgent);
  if(!visitorFirstName&&root.dataset.open==='true')askVisitorName();
  status.textContent=result.mode==='guide'?'Using the studio guidance system':'Connected · Live AI reply';
 }catch(error){
  // A failed request must not be mistaken for an AI-generated answer.
  if(pending!==request)return;
  const i=messages.indexOf(turn);if(i>=0)messages.splice(i,1);if(!input.value.trim())input.value=question;saveDraft();thinking.textContent=error.name==='AbortError'?'Request timed out. Please try again.':String(error.message||'AI unavailable');
  thinking.dataset.error='true';status.textContent='No AI reply was generated';
 }finally{
  clearTimeout(timeout);if(pending===request){pending=null;controller=null;busy=false;send.disabled=false;if(root.dataset.open==='true'&&active===thisAgent)log.scrollTop=log.scrollHeight;}
 }
});
window.VeloryzReferenceAI={open(agentId='happy'){if(agents.some(x=>x.id===agentId)&&active!==agentId){saveDraft();cancelPending();active=agentId;if(root.dataset.open==='true')renderHistory();}open(true);},close(){open(false);}};
renderHistory();
})();
