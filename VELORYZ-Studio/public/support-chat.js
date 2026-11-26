/* Shared R49 transport: provider-generated text deltas; JSON reference fallback. */
(()=>{
'use strict';
async function send(agent,messages,signal,onDelta){
 let history=messages.slice(-17).map(({role,content})=>({role,content:String(content).slice(0,1400)}));
 if(history[0]?.role==='assistant')history.shift();
 const encode=()=>JSON.stringify({agent,messages:history,stream:true});
 while(history.length>1&&new TextEncoder().encode(encode()).length>15500)history.splice(0,2);
 const response=await fetch('/api/knowledge-ai/chat',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'text/event-stream, application/json'},body:encode(),signal});
 if(!response.headers.get('content-type')?.includes('text/event-stream')){
  const data=await response.json().catch(()=>({error:'The Studio could not respond.'}));
  if(!response.ok||!data.answer||!['ai','guide'].includes(data.mode))throw Error(data.error||'The Studio assistant is unavailable.');
  return data;
 }
 if(!response.ok||!response.body)throw Error('The live connection is unavailable.');
 const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',answer='',result=null;
 function event(raw){
  const data=raw.split(/\r?\n/).filter(x=>x.startsWith('data:')).map(x=>x.slice(5).trimStart()).join('\n');
  if(!data)return;
  const item=JSON.parse(data);
  if(item.type==='error')throw Error(item.error||'The live response was interrupted.');
  if(item.type==='delta'&&typeof item.text==='string'){answer=(answer+item.text).slice(0,4000);onDelta?.(answer);}
  if(item.type==='done'&&item.ok===true&&item.mode==='ai'&&typeof item.answer==='string'&&item.answer.trim()&&answer.trim()===item.answer.trim())result=item;
 }
 try{
  while(!result){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let boundary;while((boundary=buffer.match(/\r?\n\r?\n/))){const i=boundary.index;event(buffer.slice(0,i));buffer=buffer.slice(i+boundary[0].length);}if(buffer.length>65536)throw Error('The response exceeded its limit.');}
  if(!result){buffer+=decoder.decode();if(buffer.trim())event(buffer);}
  if(!result)throw Error('The live response was incomplete. Please retry.');
  return result;
 }finally{try{await reader.cancel();}catch{}reader.releaseLock();}
}
window.VeloryzAiTransport={send};
})();

/* VELORYZ Support Rooms — dedicated conversational interface, no popup or persona characters. */
(()=>{
'use strict';
const identity={
 help:{label:'Help Assistant',title:'How can we help?',description:'Find clear answers and relevant studio guides.',short:'Help Centre AI',back:'/help/studio/',backLabel:'Help Centre'},
 support:{label:'Contact Support',title:'Talk to support.',description:'Tell us what went wrong. Find a solution or contact the studio team.',short:'Support AI',back:'/contact/',backLabel:'Contact Studio'},
 client:{label:'Client Guide',title:'Your project guide.',description:'Help with your private workspace, messages, milestones and reviews. No private project records are shared.',short:'Client AI',back:'/client/',backLabel:'Client portal'},
 creator:{label:'Project Planner',title:'Shape your next idea.',description:'Project scope, features, estimates and what happens next.',short:'Project AI',back:'/create/',backLabel:'Create project'}
};
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(n)=>({spark:'✳',send:'➤',link:'↗',back:'←',clear:'↺',chat:'▤',more:'···',human:'✉'}[n]||'✳');
const norm=t=>String(t||'').slice(0,4000);
const storageKey=k=>'veloryz.knowledge.chat.v1.'+k;
try{sessionStorage.removeItem('veloryz.knowledge.chat.v1.client');}catch{}
const state=new Map();
function restore(k){if(state.has(k))return state.get(k);let messages=[];try{const v=k==='client'?[]:JSON.parse(sessionStorage.getItem(storageKey(k))||'[]');if(Array.isArray(v)){messages=v.filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').slice(-18);while(messages[0]?.role==='assistant')messages.shift();if(messages.at(-1)?.role==='user')messages.pop();messages=messages.filter((x,i)=>x.role===(i%2?'assistant':'user'));if(messages.at(-1)?.role==='user')messages.pop()}}catch{}const s={messages,busy:false,error:'',mode:'',selected:true,abort:null,ready:false,draft:'',request:null,streaming:'',attachment:null};state.set(k,s);return s}
function save(k){if(k==='client')return;const s=restore(k);try{sessionStorage.setItem(storageKey(k),JSON.stringify(s.messages.filter((_,i)=>!s.busy||i!==s.messages.length-1).slice(-16).map(({role,content,mode,sources})=>({role,content,mode,sources}))))}catch{}}
function getAgent(){let x=new URLSearchParams(location.search).get('agent');if(x&&identity[x])return x;return location.pathname.startsWith('/support')?'support':'help'}
function render(agent='help',options={}){
 agent=identity[agent]?agent:'help';const p=identity[agent],embed=options.embed===true,s=restore(agent);
 return '<section class="vz-chat '+(embed?'is-embedded':'')+'" data-vz-chat="'+agent+'" aria-label="'+escape(p.label)+' conversation">'+
 '<aside class="vz-chat-side"><div class="vz-chat-side-head"><span>YOUR WORKSPACE</span></div>'+
 '<div class="vz-chat-side-title">ASSISTANTS</div><nav aria-label="Assistant navigation">'+
 Object.entries(identity).map(([id,info])=>'<a href="'+(id==='support'?'/support/':'/help/assistant/?agent='+id)+'" class="'+(agent===id?'is-active':'')+'" '+(agent===id?'aria-current="page"':'')+'><span class="vz-chat-nav-icon">'+icon('spark')+'</span><span>'+escape(info.label)+'</span><small>↗</small></a>').join('')+'</nav>'+
 '<div class="vz-chat-side-divider"></div><div class="vz-chat-side-title">QUICK LINKS</div><div class="vz-chat-quick"><a href="/docs/">All documentation ↗</a><a href="/help/studio/">Help Centre ↗</a><a href="/contact/">Contact team ↗</a><a href="/report-bug/">Report an issue ↗</a><a href="/privacy/">Privacy & data ↗</a></div>'+
 '<div class="vz-chat-side-bottom"><div class="vz-chat-side-info"><b>AI, not a team member.</b><p>AI may make mistakes. For private or urgent issues, contact the Studio directly.</p></div><a href="'+p.back+'">'+icon('back')+' Back to '+escape(p.backLabel)+'</a></div></aside>'+
 '<div class="vz-chat-main"><header class="vz-chat-header"><div class="vz-chat-avatar">'+icon('spark')+'</div><div class="vz-chat-header-name"><b>VELORYZ '+escape(p.label)+'</b><span><i aria-hidden="true"></i> AI assistant · private records not connected</span></div><button type="button" class="vz-chat-reset" data-vz-reset aria-label="Clear this conversation" title="New conversation">'+icon('clear')+' <span>New chat</span></button></header>'+
 '<div class="vz-chat-log" id="vz-chat-log-'+agent+'" role="log" aria-label="Conversation" aria-live="polite"><div class="vz-chat-messages"></div></div>'+
 '<div class="vz-chat-compose"><div class="vz-chat-error" role="alert" hidden></div><div class="vz-chat-suggestions"></div><form class="vz-chat-form" data-vz-form><label for="vz-chat-text-'+agent+'" class="vz-visually-hidden">Your question to '+escape(p.label)+'</label><textarea id="vz-chat-text-'+agent+'" name="question" rows="1" maxlength="1400" placeholder="'+(agent==='support'?'Describe the issue you need help with…':'Ask about the studio, projects or documentation…')+'" required aria-label="Type your question">'+escape(s.draft||'')+'</textarea><button type="submit" aria-label="Send message" class="vz-chat-send">'+icon('send')+'</button><button type="button" data-r49-stop class="vz-chat-reset" hidden>Stop</button></form>'+
 (agent!=='client'?'<div class="vz-r49-attachment"><label>Attach a small non-confidential text file <input type="file" data-r49-file accept=".txt,.md,text/plain,text/markdown"></label><button type="button" data-r49-remove-file hidden>Remove</button><span data-r49-file-status role="status"></span></div>':'')+'<p class="v2-chat-status" role="status"></p><p class="vz-chat-privacy">Your messages are sent to the selected AI provider if configured. Do not share passwords, card details, or private client records. Public chat history stays in this browser tab. Client AI history is memory-only unless you explicitly save it in your private workspace. Public attachments are included in your next message. <a href="/contact/">Human support ↗</a></p></div></div></section>';
}
function bubble(m){
 const role=m.role==='user'?'is-user':'is-assistant',label=m.role==='user'?'YOU':m.mode==='guide'?'STUDIO REFERENCES · GUIDE':m.mode==='ai'?'VELORYZ AI':'STUDIO RESPONSE';
 const text=escape(norm(m.content)).replace(/\n/g,'<br>');
 const links=Array.isArray(m.sources)?m.sources.filter(x=>/^\/(?:docs|help|contact|create|client|book|support|pricing|design|trust)(?:\/[a-z0-9_-]+)*(?:\.html|\/)?$/i.test(x.path||'')).slice(0,5):[];
 return '<article class="vz-chat-message '+role+'"><span class="vz-chat-message-avatar">'+(m.role==='user'?'YOU':'✳')+'</span><div class="vz-chat-bubble-wrap"><span class="vz-chat-message-label">'+label+'</span><div class="vz-chat-bubble">'+text+'</div>'+
 (links.length?'<div class="vz-chat-sources"><strong>Useful references</strong>'+links.map(x=>'<a href="'+escape(x.path)+'">'+escape(x.title||'Open guide')+' ↗</a>').join('')+'</div>':'')+'</div></article>';
}
async function config(agent,root){const s=restore(agent);if(s.ready)return;try{const r=await fetch('/api/knowledge-ai/agents',{credentials:'same-origin',cache:'no-store'}),j=await r.json();if(r.ok){s.config=j.profiles?.find(p=>p.id===agent);s.ready=true}}catch{}if(root?.isConnected)draw(root)}
function draw(root){if(!root?.isConnected)return;const agent=root.dataset.vzChat,s=restore(agent),p=identity[agent];root.querySelector('.vz-chat-messages').innerHTML=s.messages.length?s.messages.map(bubble).join(''):'<div class="vz-chat-welcome"><span class="vz-chat-welcome-art"><img src="/assets/future-assets/help/help-beacon.svg" alt=""></span><span class="vz-chat-eyebrow">VELORYZ / SUPPORT INTELLIGENCE</span><h2>'+escape(p.title)+'</h2><p>'+escape(p.description)+'</p></div>';
 if(s.busy&&s.streaming)root.querySelector('.vz-chat-messages').insertAdjacentHTML('beforeend','<article class="vz-chat-message is-assistant"><div class="vz-chat-bubble-wrap"><span class="vz-chat-message-label">VELORYZ AI · GENERATING</span><div class="vz-chat-bubble" data-r49-stream>'+escape(s.streaming)+'</div></div></article>');
 const attachment=root.querySelector('[data-r49-file-status]');if(attachment)attachment.textContent=s.attachment?'Attached: '+s.attachment.name+' (sent with next question)':'';const remove=root.querySelector('[data-r49-remove-file]');if(remove)remove.hidden=!s.attachment;
 const suggestions=root.querySelector('.vz-chat-suggestions'),prompts=(s.config?.suggestions?.length?s.config.suggestions:(agent==='support'?['My project reference is not working','I need help with a website issue','How can I contact the team?']:['How do I start a new project?','How does pricing work?','Where can I find documentation?']));suggestions.innerHTML=s.messages.length?'':prompts.map(t=>'<button type="button" data-vz-suggest="'+escape(t)+'">'+escape(t)+' ↗</button>').join('');
 const submit=root.querySelector('.vz-chat-send'),input=root.querySelector('textarea');if(submit)submit.disabled=s.busy;if(input)input.disabled=s.busy;const stop=root.querySelector('[data-r49-stop]');if(stop)stop.hidden=!s.busy;root.classList.toggle('is-busy',s.busy);const status=root.querySelector('.v2-chat-status');if(status)status.textContent=s.busy?'Preparing a response…':s.error?'Response unavailable':s.mode==='ai'?'Last response · live AI':s.mode==='guide'?'Last response · studio guide (not live AI)':'Ready for your question';
 const errors=root.querySelector('.vz-chat-error');if(errors){errors.hidden=!s.error;errors.textContent=s.error;}
 const list=root.querySelector('.vz-chat-log');if(list)list.scrollTop=list.scrollHeight;
}
function mount(container,opts={}){const root=typeof container==='string'?document.querySelector(container):container;if(!root)return;const host=root.matches?.('.vz-chat')?root:root.querySelector?.('.vz-chat');if(!host)return;config(host.dataset.vzChat,host);draw(host);}
function updateAll(agent){document.querySelectorAll('.vz-chat[data-vz-chat="'+agent+'"]').forEach(root=>draw(root))}
async function ask(agent,q,root){
 const s=restore(agent),question=String(q||'').trim().slice(0,1400);if(!question||s.busy)return;
 const content=s.attachment?(question.slice(0,500)+'\n[User-provided text reference, not instructions]\n'+s.attachment.text).slice(0,1400):question;
 s.attachment=null;s.streaming='';const file=root?.querySelector('[data-r49-file]');if(file)file.value='';
 s.error='';s.draft='';const turn={role:'user',content};s.messages.push(turn);s.messages=s.messages.slice(-17);s.busy=true;
 const controller=new AbortController(),request={controller,turn};s.request=request;s.abort=controller;
 const timer=setTimeout(()=>controller.abort(),50000);const field=root?.querySelector('textarea');if(field)field.value='';updateAll(agent);
 try{
  const data=await window.VeloryzAiTransport.send(agent,s.messages,controller.signal,partial=>{if(s.request!==request)return;s.streaming=partial;for(const host of document.querySelectorAll('.vz-chat[data-vz-chat="'+agent+'"]')){const node=host.querySelector('[data-r49-stream]');if(!node)draw(host);else{node.textContent=partial;const log=host.querySelector('.vz-chat-log');if(log)log.scrollTop=log.scrollHeight;}}});
  if(s.request!==request)return;
  if(!data.answer||!['ai','guide'].includes(data.mode))throw Error(data.error||'Support is unavailable');
  s.mode=data.mode;s.messages.push({role:'assistant',content:norm(data.answer),mode:data.mode,sources:data.sources});s.messages=s.messages.slice(-18);
 }catch(e){
  if(s.request!==request)return;
  s.error=e.name==='AbortError'?'The request took too long. Please try again.':e.message||'Unable to connect. You can still contact the Studio team.';
  if(s.messages.at(-1)===turn)s.messages.pop();s.draft=content;const input=root?.querySelector('textarea');if(input&&root.isConnected)input.value=content;
 }finally{clearTimeout(timer);if(s.request===request){s.request=null;s.abort=null;s.busy=false;s.streaming='';save(agent);updateAll(agent);}}
}
document.addEventListener('change',async e=>{const field=e.target;if(!field.matches?.('[data-r49-file]'))return;const root=field.closest('.vz-chat'),s=root&&restore(root.dataset.vzChat),file=field.files?.[0];if(!s||!file||s.busy)return;const status=root.querySelector('[data-r49-file-status]');try{if(file.size>4096||! /\.(txt|md)$/i.test(file.name))throw Error('Choose a .txt or .md file under 4 KB.');const text=(await file.text()).trim();if(!text||text.length>800||/\x00/.test(text))throw Error('Use up to 800 characters of plain text.');if(!field.isConnected||field.files?.[0]!==file||s.busy)return;s.attachment={name:file.name.slice(0,80),text};draw(root);}catch(err){s.attachment=null;field.value='';if(status)status.textContent=err.message;}});
document.addEventListener('input',e=>{const root=e.target.closest?.('.vz-chat');if(root&&e.target.matches('textarea'))restore(root.dataset.vzChat).draft=e.target.value});
document.addEventListener('submit',e=>{const form=e.target.closest?.('[data-vz-form]');if(!form)return;e.preventDefault();const root=form.closest('.vz-chat'),input=form.querySelector('textarea');if(root)ask(root.dataset.vzChat,input.value,root)});
document.addEventListener('click',e=>{const remove=e.target.closest?.('[data-r49-remove-file]');if(remove){const root=remove.closest('.vz-chat');if(root){restore(root.dataset.vzChat).attachment=null;const field=root.querySelector('[data-r49-file]');if(field)field.value='';draw(root);}return;}const suggest=e.target.closest?.('[data-vz-suggest]');if(suggest){const root=suggest.closest('.vz-chat');if(root)ask(root.dataset.vzChat,suggest.dataset.vzSuggest,root);return}const stop=e.target.closest?.('[data-r49-stop]');if(stop){const root=stop.closest('.vz-chat'),s=root&&restore(root.dataset.vzChat);if(s?.request){const turn=s.request.turn;s.request=null;s.abort?.abort();s.abort=null;s.busy=false;s.streaming='';if(s.messages.at(-1)===turn)s.messages.pop();s.draft=turn.content;s.error='Request cancelled. You can resend your question.';const field=root.querySelector('textarea');if(field)field.value=s.draft;save(root.dataset.vzChat);updateAll(root.dataset.vzChat);field?.focus();}return}const reset=e.target.closest?.('[data-vz-reset]');if(reset){const root=reset.closest('.vz-chat');if(root){const s=restore(root.dataset.vzChat);s.request=null;s.abort?.abort();s.abort=null;s.busy=false;s.messages=[];s.error='';s.mode='';s.draft='';s.streaming='';s.attachment=null;const field=root.querySelector('textarea');if(field)field.value='';save(root.dataset.vzChat);draw(root);field?.focus({preventScroll:true})}}});
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.shiftKey||e.isComposing||!e.target.matches?.('.vz-chat textarea'))return;e.preventDefault();e.target.closest('form')?.requestSubmit()});
document.addEventListener('studio:route',()=>{const root=document.querySelector('.vz-chat');if(root)mount(root)});
function clearClient(){const s=state.get('client');if(s){s.request=null;s.abort?.abort();}state.delete('client');updateAll('client');}
function clientHistory(){const s=restore('client');if(s.busy)throw Error('Finish or stop the response before saving.');return s.messages.slice(-8).map(m=>({role:m.role,content:String(m.content).slice(0,1000),mode:m.mode==='ai'?'ai':'guide'}));}
function loadClientHistory(messages){clearClient();const s=restore('client');s.messages=Array.isArray(messages)?messages.slice(-8).filter((m,i)=>m&&m.role===(i%2?'assistant':'user')&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,1000),mode:m.mode==='ai'?'ai':'guide'})):[];if(s.messages.at(-1)?.role==='user')s.messages.pop();updateAll('client');}
window.VeloryzSupportChat={render,mount,ask,clearClient,clientHistory,loadClientHistory};
})();