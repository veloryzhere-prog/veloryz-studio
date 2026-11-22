/* Actual VELORYZ character AI. Uses the existing five-agent /api/adviser endpoint. */
(()=>{
'use strict';
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
const launchLabel=document.createElement('span');launchLabel.textContent='Happy AI · Ask the studio';
launch.append(img,launchLabel);
const drawer=document.createElement('section');drawer.id='vz-ai-drawer';drawer.className='vz-ai-drawer';drawer.setAttribute('aria-label','AI conversation');
const header=document.createElement('div');header.className='vz-ai-header';
const heading=document.createElement('div');const kicker=document.createElement('span');kicker.className='tag';kicker.textContent='VELORYZ / STUDIO CONVERSATIONS';
const title=document.createElement('h2');title.id='vz-ai-dock-heading';title.textContent='Happy AI';heading.append(kicker,title);
const close=document.createElement('button');close.type='button';close.className='vz-ai-close';close.setAttribute('aria-label','Close AI conversation');close.textContent='×';
header.append(heading,close);
const tabs=document.createElement('div');tabs.className='vz-ai-personas';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Choose studio AI personality');
const log=document.createElement('div');log.className='vz-ai-log';log.setAttribute('role','log');log.setAttribute('aria-live','polite');log.setAttribute('aria-relevant','additions');
const disclaimer=document.createElement('p');disclaimer.className='vz-ai-disclaimer';
disclaimer.textContent='AI assistant · Not human staff. For account-specific help, use official support or your secure client portal.';
const form=document.createElement('form');form.className='vz-ai-form';
const input=document.createElement('textarea');input.className='vz-ai-input';input.rows=1;input.required=true;input.maxLength=2000;input.placeholder='Ask Happy a question…';input.setAttribute('aria-label','Message to VELORYZ AI');
const send=document.createElement('button');send.type='submit';send.className='vz-ai-send';send.textContent='➤';send.setAttribute('aria-label','Send message');
form.append(input,send);
const status=document.createElement('p');status.className='vz-ai-status';status.setAttribute('role','status');status.textContent='Live answers · Grounded in VELORYZ studio information';
drawer.append(header,tabs,log,disclaimer,form,status);root.append(drawer,launch);
document.body.append(root);
let active='happy',busy=false,controller=null;
const histories=new Map(agents.map(a=>[a.id,[]]));let previousFocus=null;
const findAgent=()=>agents.find(x=>x.id===active)||agents[0];
const addMessage=(role,text,err=false)=>{
 const item=document.createElement('p');item.className='vz-ai-message';item.dataset.role=role;
 if(err)item.dataset.error='true';item.textContent=String(text);log.append(item);log.scrollTop=log.scrollHeight;
 return item;
};
function renderHistory(){
 const agent=findAgent();title.textContent=agent.name+' AI';input.placeholder='Ask '+agent.name+' a question…';
 log.replaceChildren();const messages=histories.get(active)||[];
 if(!messages.length)addMessage('assistant','You’re chatting with '+agent.name+' AI. '+agent.hint+'. What would you like to work on?');
 else for(const m of messages)addMessage(m.role,m.content);
 tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.agent===active)));
}
for(const a of agents){
 const b=document.createElement('button');b.type='button';b.textContent=a.name;b.dataset.agent=a.id;b.setAttribute('aria-pressed',String(a.id===active));
 b.addEventListener('click',()=>{if(busy)return;active=a.id;renderHistory();input.focus();});
 tabs.append(b);
}
function open(next){
 const isOpen=typeof next==='boolean'?next:root.dataset.open!=='true';
 root.dataset.open=String(isOpen);launch.setAttribute('aria-expanded',String(isOpen));
 if(isOpen){previousFocus=document.activeElement;renderHistory();input.focus({preventScroll:true});}
 else {if(controller){controller.abort();controller=null;}busy=false;send.disabled=false;(previousFocus?.isConnected?previousFocus:launch).focus({preventScroll:true});}
}
launch.addEventListener('click',()=>open());
close.addEventListener('click',()=>open(false));
document.addEventListener('keydown',e=>{
 if(root.dataset.open!=='true')return;
 if(e.key==='Escape'){e.preventDefault();open(false);}
 if(e.key==='Tab'){
  const focusables=[...drawer.querySelectorAll('button:not(:disabled),textarea')].filter(el=>el.getClientRects().length);
  const first=focusables[0],last=focusables[focusables.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;
 const question=input.value.trim();if(!question)return;
 const thisAgent=active;const messages=histories.get(thisAgent);
 messages.push({role:'user',content:question});addMessage('user',question);input.value='';
 busy=true;send.disabled=true;status.textContent='Connecting to '+findAgent().name+'…';
 const thinking=addMessage('assistant','Thinking…');
 controller=new AbortController();const timeout=setTimeout(()=>controller?.abort(),36000);
 try{
  const response=await fetch('/api/adviser',{method:'POST',headers:{'Content-Type':'application/json'},
   credentials:'same-origin',signal:controller.signal,body:JSON.stringify({agent:thisAgent,allowGuide:true,firstName:'',firstNamed:false,
    messages:messages.slice(-14),page:location.pathname})});
  const result=await response.json().catch(()=>({error:'Unable to read assistant response'}));
  if(!response.ok||!result.answer||!['ai','guide'].includes(result.mode))throw Error(result.error||'Live AI is temporarily unavailable.');
  messages.push({role:'assistant',content:String(result.answer)});thinking.textContent=result.answer;
  status.textContent=result.mode==='guide'?'Using the studio guidance system':'Connected · Live AI reply';
 }catch(error){
  // A failed request must not be mistaken for an AI-generated answer.
  messages.pop();thinking.textContent=error.name==='AbortError'?'Request timed out. Please try again.':String(error.message||'AI unavailable');
  thinking.dataset.error='true';status.textContent='No AI reply was generated';
 }finally{
  clearTimeout(timeout);controller=null;busy=false;send.disabled=false;input.focus({preventScroll:true});
  log.scrollTop=log.scrollHeight;
 }
});
window.VeloryzReferenceAI={open(agentId='happy'){if(agents.some(x=>x.id===agentId))active=agentId;open(true);},close(){open(false);}};
renderHistory();
})();
