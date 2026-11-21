/* VELORYZ Support Rooms — dedicated conversational interface, no popup or persona characters. */
(()=>{
'use strict';
const identity={
 help:{label:'Help Assistant',title:'How can we help?',description:'Answers from VELORYZ Studio documentation.',short:'Help Centre AI',back:'/help/studio/',backLabel:'Help Centre'},
 support:{label:'Contact Support',title:'Talk to support.',description:'Find the right next step, troubleshoot an issue or contact the Studio team.',short:'Support AI',back:'/contact/',backLabel:'Contact Studio'},
 client:{label:'Client Guide',title:'Your project guide.',description:'Help with your private workspace, messages, milestones and reviews. No private project records are shared.',short:'Client AI',back:'/client/',backLabel:'Client portal'},
 creator:{label:'Project Planner',title:'Shape your next idea.',description:'Project scope, features, estimates and what happens next.',short:'Project AI',back:'/create/',backLabel:'Create project'}
};
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(n)=>({spark:'✳',send:'➤',link:'↗',back:'←',clear:'↺',chat:'▤',more:'···',human:'✉'}[n]||'✳');
const norm=t=>String(t||'').slice(0,4000);
const storageKey=k=>'veloryz.knowledge.chat.v1.'+k;
const state=new Map();
function restore(k){if(state.has(k))return state.get(k);let messages=[];try{const v=JSON.parse(sessionStorage.getItem(storageKey(k))||'[]');if(Array.isArray(v))messages=v.filter(x=>['user','assistant'].includes(x.role)&&typeof x.content==='string').slice(-18)}catch{}const s={messages,busy:false,error:'',mode:'',selected:true,abort:null,ready:false};state.set(k,s);return s}
function save(k){const s=restore(k);try{sessionStorage.setItem(storageKey(k),JSON.stringify(s.messages.slice(-16).map(({role,content,mode,sources})=>({role,content,mode,sources}))))}catch{}}
function getAgent(){let x=new URLSearchParams(location.search).get('agent');if(x&&identity[x])return x;return location.pathname.startsWith('/support')?'support':'help'}
function render(agent='help',options={}){
 agent=identity[agent]?agent:'help';const p=identity[agent],embed=options.embed===true,s=restore(agent);
 return '<section class="vz-chat '+(embed?'is-embedded':'')+'" data-vz-chat="'+agent+'" aria-label="'+escape(p.label)+' conversation">'+
 '<aside class="vz-chat-side"><div class="vz-chat-side-head"><a href="/" class="vz-chat-brand"><img src="/assets/brand/official/Main-Dark-Ink-Transparent.webp" alt="VELORYZ Studio"></a><span>STUDIO / AI ASSISTANTS</span></div>'+
 '<div class="vz-chat-side-title">YOUR SUPPORT</div><nav aria-label="Assistant navigation">'+
 Object.entries(identity).map(([id,info])=>'<a href="'+(id==='support'?'/support/':'/help/assistant/?agent='+id)+'" class="'+(agent===id?'is-active':'')+'"><span class="vz-chat-nav-icon">'+icon('spark')+'</span><span>'+escape(info.label)+'</span><small>↗</small></a>').join('')+'</nav>'+
 '<div class="vz-chat-side-divider"></div><div class="vz-chat-side-title">QUICK LINKS</div><div class="vz-chat-quick"><a href="/docs/">All documentation ↗</a><a href="/help/studio/">Help Centre ↗</a><a href="/contact/">Contact team ↗</a><a href="/sitemap/">Site map ↗</a></div>'+
 '<div class="vz-chat-side-bottom"><div class="vz-chat-side-info"><b>AI, not a team member.</b><p>AI may make mistakes. For private or urgent issues, contact the Studio directly.</p></div><a href="'+p.back+'">'+icon('back')+' Back to '+escape(p.backLabel)+'</a></div></aside>'+
 '<div class="vz-chat-main"><header class="vz-chat-header"><div class="vz-chat-avatar">'+icon('spark')+'</div><div class="vz-chat-header-name"><b>VELORYZ '+escape(p.label)+'</b><span><i aria-hidden="true"></i> Studio guidance · private records not connected</span></div><button type="button" class="vz-chat-reset" data-vz-reset aria-label="Clear this conversation" title="New conversation">'+icon('clear')+' <span>New chat</span></button></header>'+
 '<div class="vz-chat-log" id="vz-chat-log-'+agent+'" role="log" aria-label="Conversation" aria-live="polite"><div class="vz-chat-messages"></div></div>'+
 '<div class="vz-chat-compose"><div class="vz-chat-error" role="alert" hidden></div><div class="vz-chat-suggestions"></div><form class="vz-chat-form" data-vz-form><label for="vz-chat-text-'+agent+'" class="vz-visually-hidden">Your question to '+escape(p.label)+'</label><textarea id="vz-chat-text-'+agent+'" name="question" rows="1" maxlength="1400" placeholder="Ask anything about VELORYZ…" required aria-label="Type your question"></textarea><button type="submit" aria-label="Send message" class="vz-chat-send">'+icon('send')+'</button></form>'+
 '<p class="vz-chat-privacy">Your messages are sent to the selected AI provider if configured. Do not share passwords, card details, or private client records. Chat history stays in this browser tab. <a href="/contact/">Human support ↗</a></p></div></div></section>';
}
function bubble(m){
 const role=m.role==='user'?'is-user':'is-assistant',label=m.role==='user'?'YOU':m.mode==='guide'?'STUDIO REFERENCES · OFFLINE':'VELORYZ AI';
 const text=escape(norm(m.content)).replace(/\n/g,'<br>');
 const links=Array.isArray(m.sources)?m.sources.filter(x=>/^\/(?:docs|help|contact|create|client|book)\/[a-z0-9/_-]*\/?$/.test(x.path||'')).slice(0,5):[];
 return '<article class="vz-chat-message '+role+'"><span class="vz-chat-message-avatar">'+(m.role==='user'?'YOU':'✳')+'</span><div class="vz-chat-bubble-wrap"><span class="vz-chat-message-label">'+label+'</span><div class="vz-chat-bubble">'+text+'</div>'+
 (links.length?'<div class="vz-chat-sources"><strong>Useful references</strong>'+links.map(x=>'<a href="'+escape(x.path)+'">'+escape(x.title||'Open guide')+' ↗</a>').join('')+'</div>':'')+'</div></article>';
}
async function config(agent,root){const s=restore(agent);if(s.ready)return;try{const r=await fetch('/api/knowledge-ai/agents',{credentials:'same-origin',cache:'no-store'}),j=await r.json();if(r.ok){s.config=j.profiles?.find(p=>p.id===agent);s.ready=true}}catch{}if(root?.isConnected)draw(root)}
function draw(root){if(!root?.isConnected)return;const agent=root.dataset.vzChat,s=restore(agent),p=identity[agent];root.querySelector('.vz-chat-messages').innerHTML=s.messages.length?s.messages.map(bubble).join(''):'<div class="vz-chat-welcome"><span class="vz-chat-welcome-art"><img src="/assets/future-assets/help/help-beacon.svg" alt=""></span><span class="vz-chat-eyebrow">VELORYZ / SUPPORT INTELLIGENCE</span><h1>'+escape(s.config?.welcome||p.title)+'</h1><p>'+escape(p.description)+'</p></div>';
 const suggestions=root.querySelector('.vz-chat-suggestions'),prompts=(s.config?.suggestions?.length?s.config.suggestions:['How do I start a new project?','How can I reach the Studio team?','Where can I find documentation?']);suggestions.innerHTML=s.messages.length?'':prompts.map(t=>'<button type="button" data-vz-suggest="'+escape(t)+'">'+escape(t)+' ↗</button>').join('');
 const submit=root.querySelector('.vz-chat-send'),input=root.querySelector('textarea');if(submit)submit.disabled=s.busy;if(input)input.disabled=s.busy;root.classList.toggle('is-busy',s.busy);
 const errors=root.querySelector('.vz-chat-error');if(errors){errors.hidden=!s.error;errors.textContent=s.error;}
 const list=root.querySelector('.vz-chat-log');if(list)list.scrollTop=list.scrollHeight;
}
function mount(container,opts={}){const root=typeof container==='string'?document.querySelector(container):container;if(!root)return;const host=root.matches?.('.vz-chat')?root:root.querySelector?.('.vz-chat');if(!host)return;config(host.dataset.vzChat,host);draw(host);}
function updateAll(agent){document.querySelectorAll('.vz-chat[data-vz-chat="'+agent+'"]').forEach(root=>draw(root))}
async function ask(agent,q,root){const s=restore(agent);const content=String(q||'').trim();if(!content||s.busy)return;s.error='';s.messages.push({role:'user',content:content.slice(0,1400)});if(s.messages.length>18)s.messages=s.messages.slice(-17);s.busy=true;save(agent);updateAll(agent);
 const controller=new AbortController();s.abort=controller;const timer=setTimeout(()=>controller.abort(),28000);
 try{const res=await fetch('/api/knowledge-ai/chat',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({agent,messages:s.messages.slice(-17).map(({role,content})=>({role,content}))}),signal:controller.signal});const data=await res.json().catch(()=>({error:'Support could not respond.'}));if(!res.ok)throw Error(data.error||'Support is unavailable');s.messages.push({role:'assistant',content:norm(data.answer||'No response available.'),mode:data.mode,sources:data.sources});if(s.messages.length>18)s.messages=s.messages.slice(-18)}
 catch(e){s.error=e.name==='AbortError'?'The request took too long. Please try again.':e.message||'Unable to connect. You can still contact the Studio team.'; // Keep conversation alternating on retry.
 s.messages.pop();}
 finally{clearTimeout(timer);s.abort=null;s.busy=false;save(agent);updateAll(agent);root?.querySelector('textarea')?.focus({preventScroll:true})}
}
document.addEventListener('submit',e=>{const form=e.target.closest?.('[data-vz-form]');if(!form)return;e.preventDefault();const root=form.closest('.vz-chat'),input=form.querySelector('textarea');if(root)ask(root.dataset.vzChat,input.value,root);if(input)input.value=''});
document.addEventListener('click',e=>{const suggest=e.target.closest?.('[data-vz-suggest]');if(suggest){const root=suggest.closest('.vz-chat');if(root)ask(root.dataset.vzChat,suggest.dataset.vzSuggest,root);return}const reset=e.target.closest?.('[data-vz-reset]');if(reset){const root=reset.closest('.vz-chat');if(root){const s=restore(root.dataset.vzChat);s.abort?.abort();s.messages=[];s.error='';save(root.dataset.vzChat);draw(root)}}});
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.shiftKey||!e.target.matches?.('.vz-chat textarea'))return;e.preventDefault();e.target.closest('form')?.requestSubmit()});
document.addEventListener('studio:route',()=>{const root=document.querySelector('.vz-chat');if(root)mount(root)});
window.VeloryzSupportChat={render,mount,ask};
})();