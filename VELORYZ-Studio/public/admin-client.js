'use strict';
let cpProjects=[],cpWorkspace=null,cpSelected='',cpLoaded=false,cpLoading=false,cpEditMode='',cpError='';
const cpReq=(path,options={})=>api('/api/client-portal/admin'+path,options);
const cpEsc=v=>E(v??'');
const cpOption=(v,name,current)=>'<option value="'+cpEsc(v)+'" '+(v===current?'selected':'')+'>'+cpEsc(name)+'</option>';
const cpSelect=(name,options,current)=>'<select name="'+name+'">'+options.map(x=>cpOption(Array.isArray(x)?x[0]:x,Array.isArray(x)?x[1]:x,current)).join('')+'</select>';
const cpField=(label,name,value='',attr='')=>'<label class="cp-field"><span>'+cpEsc(label)+'</span><input name="'+name+'" value="'+cpEsc(value)+'" '+attr+'></label>';
const cpTextArea=(label,name,value='',max=1200)=>'<label class="cp-field wide"><span>'+cpEsc(label)+'</span><textarea name="'+name+'" rows="3" maxlength="'+max+'">'+cpEsc(value)+'</textarea></label>';
function cpEditor(p){
 return '<section class="cp-admin-card"><h2>'+(p.id?'Edit this project.':'A new collaboration.')+'</h2><p>These details stay private to the client and the studio owner.</p><form data-cp-form="project" class="cp-grid">'+
 cpField('Client name','client_name',p.client_name,'required maxlength="100"')+
 cpField('Client email','client_email',p.client_email,'type="email" required maxlength="180"')+
 cpField('Project title','title',p.title,'required maxlength="160"')+
 cpField('Progress / 0–100','progress',p.progress||0,'type="number" min="0" max="100"')+
 '<label class="cp-field"><span>Phase</span>'+cpSelect('phase',['Discover','Define','Design','Develop','Review','Launch'],p.phase||'Discover')+'</label>'+
 '<label class="cp-field"><span>Status</span>'+cpSelect('status',[['planning','Planning'],['in-progress','In progress'],['in-review','In review'],['on-hold','On hold'],['launched','Launched']],p.status||'planning')+'</label>'+
 cpField('Expected handover','due_date',p.due_date,'type="date"')+
 cpTextArea('Project summary','summary',p.summary,1700)+cpTextArea('What happens next','next_step',p.next_step,1200)+
 '<div class="wide cp-actions"><button class="admin-button" type="submit">Save project ↗</button><button class="admin-button secondary" type="button" data-cp-action="cancel">Cancel</button></div></form></section>';
}
function cpItemForm(item={}){
 return '<section class="cp-admin-card"><h2>'+(item.id?'Edit project item.':'Add to their journey.')+'</h2><p>Milestones, private review requests, and linked deliverables all live in this project.</p><form data-cp-form="item" class="cp-grid" data-item-id="'+cpEsc(item.id||'')+'">'+
 '<label class="cp-field"><span>Kind</span>'+cpSelect('type',[['milestone','Milestone'],['approval','Approval request'],['file','Shared file']],item.type||'milestone')+'</label>'+
 '<label class="cp-field"><span>Status</span>'+cpSelect('state',[['upcoming','Upcoming'],['in-progress','In progress'],['done','Complete'],['waiting','Needs approval'],['approved','Approved'],['changes','Changes requested']],item.state||'upcoming')+'</label>'+
 cpField('Title','title',item.title,'required maxlength="160"')+
 cpField('Due date','due_date',item.due_date,'type="date"')+
 cpTextArea('Description','details',item.details,1400)+cpField('HTTPS deliverable link','url',item.url,'type="url" maxlength="1500"')+
 '<div class="wide cp-actions"><button class="admin-button" type="submit">Save item ↗</button><button class="admin-button secondary" type="button" data-cp-action="cancel">Cancel</button></div></form></section>';
}
function cpDashboard(){
 const p=cpWorkspace?.project;
 if(!p)return '<div class="cp-admin-card"><p>Choose a private project to view milestones and messages.</p></div>';
 const items=cpWorkspace.items||[],messages=cpWorkspace.messages||[];
 return '<div class="cp-admin-card cp-intro"><small>PRIVATE PROJECT / '+cpEsc(p.phase)+'</small><h2>'+cpEsc(p.title)+'</h2><p>'+cpEsc(p.client_name)+' · '+cpEsc(p.client_email)+'</p><div class="cp-actions"><button class="admin-button secondary" data-cp-action="edit-project">Edit project</button><button class="admin-button" data-cp-action="invite">Generate invitation ↗</button></div><p class="cp-hint">A new invitation revokes previous invites and current client sessions. Share only with your verified client.</p></div>'+
 '<div class="cp-admin-card"><div class="cp-panel-heading"><h2>Project timeline & files.</h2><button class="admin-button secondary" data-cp-action="new-item">Add item +</button></div>'+
 (items.length?items.map(i=>'<article class="cp-admin-row"><div><span>'+cpEsc(i.type)+' / '+cpEsc(i.state)+'</span><strong>'+cpEsc(i.title)+'</strong><p>'+cpEsc(i.details)+'</p></div><div><button data-cp-action="edit-item" data-id="'+cpEsc(i.id)+'">Edit</button><button data-cp-action="delete-item" data-id="'+cpEsc(i.id)+'">Remove</button></div></article>').join(''):'<p class="cp-hint">No milestones yet. Add a step to get started.</p>')+'</div>'+
 '<div class="cp-admin-card"><h2>Client conversation.</h2><div class="cp-thread">'+(messages.length?messages.slice(-30).map(m=>'<article class="cp-thread-entry"><small>'+cpEsc(m.sender)+' · '+cpEsc(new Date(m.created_at).toLocaleDateString('en-IN'))+'</small><p>'+cpEsc(m.body)+'</p></article>').join(''):'<p class="cp-hint">Start the conversation with a welcome note.</p>')+'</div><form data-cp-form="message"><label class="cp-field"><span>Your message to the client</span><textarea name="body" required rows="3" maxlength="2000" placeholder="Share a useful update…"></textarea></label><button class="admin-button" type="submit">Send message ↗</button></form></div>';
}
function clientPortalAdmin(){
 const p=cpWorkspace?.project;
 return heading('VELORYZ / private collaboration','Client portal','Manage individual client projects without publishing private records to the public portfolio.')+
 '<div class="cp-main-actions"><span>'+cpProjects.length+' client project(s)</span><a class="admin-button secondary" href="/client/" target="_blank" rel="noopener">Client entrance ↗</a><button class="admin-button" data-cp-action="new">New client project +</button></div>'+
 (cpError?'<p class="cp-error" role="alert">'+cpEsc(cpError)+' <button data-cp-action="reload">Retry</button></p>':'')+
 (!cpLoaded?'<p class="cp-admin-card" role="status">Loading private client projects…</p>':
 '<div class="cp-admin-layout"><aside class="cp-list"><strong>CLIENT SPACES / '+cpProjects.length+'</strong>'+
 cpProjects.map(x=>'<button data-cp-action="select" data-id="'+cpEsc(x.id)+'" class="'+(cpSelected===x.id?'active':'')+'"><span>'+cpEsc(x.client_name)+'</span><strong>'+cpEsc(x.title)+'</strong><small>'+cpEsc(x.phase)+' · '+cpEsc(x.progress)+'%</small></button>').join('')+
 '<button data-cp-action="new">+ Start a new client project</button></aside><div class="cp-detail">'+
 (cpEditMode==='project'?cpEditor(p&&cpNewProject===false?p:{}):cpEditMode==='item'?cpItemForm(cpEditingItem?cpWorkspace?.items?.find(i=>i.id===cpEditingItem):{}):cpDashboard())+
 '</div></div>');
}
let cpNewProject=false,cpEditingItem='';
async function cpLoad(selected=''){
 if(cpLoading)return;
 cpLoading=true;cpError='';
 try{
  const data=await cpReq('/projects'+(selected?'?id='+encodeURIComponent(selected):''));
  cpProjects=data.projects;cpSelected=selected||cpSelected||cpProjects[0]?.id||'';
  cpWorkspace=data.workspace||null;cpLoaded=true;
  if(cpSelected&&!cpWorkspace){cpLoading=false;return await cpLoad(cpSelected)}
  if(section==='client-portal')render();
 }catch(e){cpError=e.message;cpLoaded=true;if(section==='client-portal')render()}
 finally{cpLoading=false}
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-cp-action]');if(!b||section!=='client-portal')return;
 const action=b.dataset.cpAction;
 if(action==='new'){cpNewProject=true;cpEditMode='project';render();return}
 if(action==='cancel'){cpEditMode='';cpNewProject=false;cpEditingItem='';render();return}
 if(action==='edit-project'){cpNewProject=false;cpEditMode='project';render();return}
 if(action==='new-item'){cpEditingItem='';cpEditMode='item';render();return}
 if(action==='edit-item'){cpEditingItem=b.dataset.id;cpEditMode='item';render();return}
 if(action==='select'){cpSelected=b.dataset.id;cpWorkspace=null;cpEditMode='';render();cpLoad(cpSelected);return}
 if(action==='reload'){cpLoaded=false;cpWorkspace=null;cpLoad(cpSelected);return}
 b.disabled=true;
 try{
  if(action==='invite'){
   const data=await cpReq('/invite',{method:'POST',body:JSON.stringify({project_id:cpSelected})});
   showModal('A private invitation.','Valid for 14 days. Sharing is manual to protect your client.', '<div class="cp-invite"><label>Invitation URL</label><input readonly value="'+cpEsc(data.url)+'"><p>Copy this URL privately to your verified client. Anyone holding the invitation can access the project.</p></div>', '<button class="admin-button secondary" data-action="close-modal">Close</button>','medium');
  }
  if(action==='delete-item'){
   await cpReq('/items/'+b.dataset.id+'?project_id='+encodeURIComponent(cpSelected),{method:'DELETE'});await cpLoad(cpSelected);toast('Project item removed.');
  }
 }catch(err){toast(err.message)}finally{b.disabled=false}
});
document.addEventListener('submit',async e=>{
 const f=e.target;if(!f.matches('[data-cp-form]'))return;
 e.preventDefault();if(!f.reportValidity())return;
 const btn=f.querySelector('[type="submit"]');btn.disabled=true;
 try{
  const data=Object.fromEntries(new FormData(f));
  if(f.dataset.cpForm==='project'){
   const edit=!cpNewProject&&Boolean(cpSelected);
   const result=await cpReq(edit?'/projects/'+cpSelected:'/projects',{method:edit?'PUT':'POST',body:JSON.stringify(data)});
   cpSelected=result.id;cpEditMode='';cpNewProject=false;cpWorkspace=null;await cpLoad(result.id);toast('Client project saved.');
  }
  if(f.dataset.cpForm==='item'){
   await cpReq('/items',{method:'POST',body:JSON.stringify({...data,id:cpEditingItem||undefined,project_id:cpSelected})});
   cpEditMode='';cpEditingItem='';await cpLoad(cpSelected);toast('Project item saved.');
  }
  if(f.dataset.cpForm==='message'){
   await cpReq('/messages',{method:'POST',body:JSON.stringify({...data,project_id:cpSelected})});
   await cpLoad(cpSelected);toast('Client update sent.');
  }
 }catch(err){toast(err.message);btn.disabled=false}
});
