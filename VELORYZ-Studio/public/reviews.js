/* VELORYZ Reviews V2: real submissions, richer information and opt-in AI editing.
 * Every visitor-provided value is a text node. AI never publishes or moderates automatically. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const isAdmin=document.body.dataset.reviewsAdmin==='true';
 const el=(tag,cls,value)=>{
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(value!==undefined)node.textContent=String(value);
  return node;
 };
 const date=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('en-IN',{month:'short',year:'numeric'}).format(d):'';};
 const stars=n=>'★'.repeat(Math.max(0,Math.min(5,Number(n)||0)))+'☆'.repeat(Math.max(0,5-(Number(n)||0)));
 let reviews=[],adminReviews=[],aiSuggestion='';
 async function call(path,method='GET',payload){
  const r=await fetch(path,{method,headers:payload?{'Content-Type':'application/json'}:{},body:payload?JSON.stringify(payload):undefined,credentials:'same-origin',cache:'no-store',redirect:'error'});
  let value={};try{value=await r.json()}catch{}
  if(!r.ok)throw Error(typeof value.error==='string'?value.error:'Request unavailable ('+r.status+').');
  return value;
 }
 function reviewCard(item,owner=false){
  const article=el('article','review-card');
  const top=el('div','review-card-top');
  const avatar=el('span','review-avatar',(String(item.display_name||'V').trim()[0]||'V').toUpperCase());
  avatar.setAttribute('aria-hidden','true');
  const identity=el('div','review-identity');
  identity.append(el('strong','',item.display_name||'Community member'),el('small','',date(item.created_at)));
  const rating=el('span','review-stars',stars(item.rating));
  rating.setAttribute('aria-label',item.rating+' out of 5 stars');
  top.append(avatar,identity,rating);
  article.append(top);
  if(item.service)article.append(el('div','review-service',item.service));
  if(item.headline)article.append(el('h3','review-card-headline',item.headline));
  article.append(el('p','review-copy',item.body||''));
  for(const [heading,value,kind] of [
   ['WHAT STOOD OUT',item.highlights,'positive'],
   ['ROOM TO IMPROVE',item.improvement,'constructive']
  ]){
   if(typeof value==='string'&&value.trim()){
    const section=el('div','review-detail review-detail-'+kind);
    section.append(el('strong','',heading),el('p','',value));
    article.append(section);
   }
  }
  const note=el('p','review-authenticity','Human-moderated feedback · Not purchase verified');
  article.append(note);
  if(owner){
   article.classList.add('review-admin-card');
   const status=el('span','review-status-pill review-status-'+item.status,item.status);
   article.append(status);
   const actions=el('div','review-card-actions');
   for(const [next,label] of [['approved','Approve & publish'],['rejected','Reject / hide']]){
    const btn=el('button',next==='approved'?'review-primary':'review-secondary',label);
    btn.type='button';btn.disabled=next===item.status;
    btn.addEventListener('click',async()=>{
     btn.disabled=true;
     try{await call('/api/reviews/admin/moderate','POST',{id:item.id,status:next});await loadAdmin();}
     catch(err){showMessage($('review-admin-summary'),err.message,false);btn.disabled=false;}
    });
    actions.append(btn);
   }
   article.append(actions);
  }
  return article;
 }
 function showMessage(node,message,ok=false){
  if(!node)return;
  node.textContent=String(message);
  node.classList.toggle('review-success',ok);
 }
 function empty(message){
  const div=el('div','review-empty');
  div.append(el('span','review-empty-symbol','✳'),el('h3','','A community starts with a conversation.'),el('p','',message));
  const link=el('a','review-primary','Share your experience ↗');link.href='#share-review';div.append(link);
  return div;
 }
 function renderPublic(){
  const root=$('review-feed');if(!root)return;
  const selected=$('review-filter-rating')?.value||'all';
  const sort=$('review-sort')?.value||'newest';
  const visible=reviews.filter(x=>selected==='all'||Number(x.rating)===Number(selected)).slice();
  visible.sort((a,b)=>{
   if(sort==='highest')return Number(b.rating)-Number(a.rating)||new Date(b.created_at)-new Date(a.created_at);
   if(sort==='lowest')return Number(a.rating)-Number(b.rating)||new Date(b.created_at)-new Date(a.created_at);
   return new Date(b.created_at)-new Date(a.created_at);
  });
  showMessage($('review-results'),visible.length+' '+(visible.length===1?'review':'reviews')+' shown');
  if(!reviews.length){root.replaceChildren(empty('No reviews have been published yet. We never populate empty space with invented testimonials.'));return;}
  if(!visible.length){root.replaceChildren(el('p','review-empty','No real reviews match that rating. Try another filter.'));return;}
  root.replaceChildren(...visible.map(v=>reviewCard(v)));
 }
 function ratingBreakdown(summary){
  const score=$('review-average'),label=$('review-average-label'),root=$('review-rating-distribution');
  const count=Number(summary?.count)||0;
  score.textContent=count?Number(summary.average||0).toFixed(1):'—';
  label.textContent=count?count+' published community '+(count===1?'review':'reviews'):'No published reviews yet';
  const map=new Map((Array.isArray(summary?.distribution)?summary.distribution:[]).map(x=>[Number(x.rating),Number(x.count)||0]));
  const nodes=[];
  for(let n=5;n>=1;n--){
   const total=map.get(n)||0;
   const row=el('div','review-rating-row');
   row.append(el('span','',n+' ★'));
   const track=el('span','review-rating-bar'),bar=el('span','review-rating-bar-fill');
   bar.style.width=count?Math.min(100,Math.round(total/count*100))+'%':'0%';
   track.append(bar);
   row.append(track,el('span','',total.toLocaleString('en-IN')));
   nodes.push(row);
  }
  root.replaceChildren(...nodes);
 }
 async function loadPublic(){
  try{
   const data=await call('/api/reviews');
   reviews=Array.isArray(data.reviews)?data.reviews:[];
   const count=Math.max(0,Number(data?.summary?.count)||0);
   showMessage($('review-stat'),count?count+' real '+(count===1?'review':'reviews')+' · '+Number(data.summary.average||0).toFixed(1)+'/5':'Community feedback / Opening chapter');
   ratingBreakdown(data.summary);
   renderPublic();
  }catch(err){
   showMessage($('review-stat'),'Temporarily unavailable');
   const feed=$('review-feed');if(feed)feed.replaceChildren(el('div','review-empty','The review service is temporarily unavailable. Please try again later.'));
  }
 }
 function renderAdmin(){
  const selected=$('review-admin-filter')?.value||'pending';
  const visible=adminReviews.filter(x=>selected==='all'||x.status===selected);
  const root=$('review-admin-list');
  if(!root)return;
  root.replaceChildren(...(visible.length?visible.map(x=>reviewCard(x,true)):[el('div','review-empty','No submissions for this status yet.')]));
 }
 async function loadAdmin(){
  try{
   const data=await call('/api/reviews/admin');
   adminReviews=Array.isArray(data.reviews)?data.reviews:[];
   showMessage($('review-admin-summary'),adminReviews.filter(x=>x.status==='pending').length+' pending · '+adminReviews.length+' recent');
   renderAdmin();
  }catch(err){
   showMessage($('review-admin-summary'),'Sign-in required');
   const root=$('review-admin-list');if(!root)return;
   const message=el('p','review-empty','Please sign in to Studio Control before moderating reviews.');
   const link=el('a','review-primary','Open Studio Control ↗');link.href='/admin/';
   root.replaceChildren(message,link);
  }
 }
 function fields(){
  const form=$('review-form');
  if(!form)return null;
  const f=new FormData(form);
  return {name:String(f.get('name')||''),service:String(f.get('service')||''),rating:Number(f.get('rating')),headline:String(f.get('headline')||''),highlights:String(f.get('highlights')||''),improvement:String(f.get('improvement')||''),review:String(f.get('review')||''),website:String(f.get('website')||''),confirm:f.get('confirm')==='on'};
 }
 function validateReview(data){
  if(!Number.isInteger(data.rating)||data.rating<1||data.rating>5)return 'Choose a star rating.';
  if(data.review.trim().length<25)return 'Write at least 25 characters about your real experience.';
  return '';
 }
 function bindAI(){
  const btn=$('review-ai-button'),textarea=$('review-body'),status=$('review-ai-status'),preview=$('review-ai-preview');
  if(!btn||!textarea)return;
  btn.addEventListener('click',async()=>{
   const data=fields();
   if(!data||data.review.trim().length<25){showMessage(status,'Write at least 25 characters of your own experience first.');textarea.focus();return;}
   btn.disabled=true;
   preview.hidden=true;
   showMessage(status,'Review AI is reading your notes and preparing a more natural draft…');
   try{
    const out=await call('/api/reviews/assist','POST',{draft:data.review,style:$('review-ai-tone').value,service:data.service,highlights:data.highlights,improvement:data.improvement});
    if(typeof out.suggestion!=='string'||out.suggestion.length<25)throw Error('No usable suggestion was returned.');
    aiSuggestion=out.suggestion;
    $('review-ai-suggestion').textContent=aiSuggestion;
    preview.hidden=false;
    showMessage(status,out.disclosure||'AI suggested wording only. Please verify every detail.');
    preview.scrollIntoView({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   }catch(err){showMessage(status,err.message);}
   finally{btn.disabled=false;}
  });
  $('review-ai-use')?.addEventListener('click',()=>{
   if(!aiSuggestion)return;
   textarea.value=aiSuggestion;
   textarea.dispatchEvent(new Event('input',{bubbles:true}));
   preview.hidden=true;
   showMessage(status,'Suggestion applied. Check it carefully, edit as needed, and submit only when you are satisfied.',true);
   textarea.focus();
  });
  $('review-ai-dismiss')?.addEventListener('click',()=>{
   preview.hidden=true;
   aiSuggestion='';
   showMessage(status,'Your original wording has been kept.',true);
   textarea.focus();
  });
 }
 function bindForm(){
  const form=$('review-form');if(!form)return;
  const input=$('review-body');
  input?.addEventListener('input',()=>showMessage($('review-character-count'),input.value.length+' / 800'));
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   if(!form.reportValidity())return;
   const data=fields(),error=validateReview(data),status=$('review-form-status'),btn=$('review-submit');
   if(error){showMessage(status,error);return;}
   btn.disabled=true;showMessage(status,'Saving your genuine feedback privately for moderation…');
   try{
    const out=await call('/api/reviews','POST',data);
    showMessage(status,out.message||'Thank you. Your review is awaiting human moderation.',true);
    form.reset();
    showMessage($('review-character-count'),'0 / 800');
    $('review-ai-preview').hidden=true;
    aiSuggestion='';
    await loadPublic();
   }catch(err){showMessage(status,err.message);}
   finally{btn.disabled=false;}
  });
  bindAI();
 }
 if(isAdmin){
  $('review-admin-filter')?.addEventListener('change',renderAdmin);
  loadAdmin();
 }else{
  $('review-filter-rating')?.addEventListener('change',renderPublic);
  $('review-sort')?.addEventListener('change',renderPublic);
  loadPublic();
  bindForm();
 }
})();