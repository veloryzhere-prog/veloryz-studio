/* Genuine review display and protected owner moderation. No untrusted HTML rendering. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const isAdmin=document.body.dataset.reviewsAdmin==='true';
 const elt=(tag,cls,text)=>{
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!==undefined)node.textContent=String(text);
  return node;
 };
 const formatDate=v=>{
  const d=new Date(v);
  return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('en-IN',{month:'short',year:'numeric'}).format(d):'';
 };
 const stars=n=>'★'.repeat(Math.max(0,Math.min(5,Number(n)||0)))+'☆'.repeat(Math.max(0,5-(Number(n)||0)));
 async function call(path,method='GET',data=null){
  const r=await fetch(path,{method,headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined,credentials:'same-origin',cache:'no-store',redirect:'error'});
  let value={};try{value=await r.json()}catch{}
  if(!r.ok)throw Error(typeof value.error==='string'?value.error:'Request unavailable ('+r.status+').');
  return value;
 }
 function card(review,moderation=false){
  const root=elt('article','review-card');
  const top=elt('div','review-card-top');
  const avatar=elt('span','review-avatar',(String(review.display_name||'V').trim()[0]||'V').toUpperCase());
  avatar.setAttribute('aria-hidden','true');
  const name=elt('div','review-identity');
  name.append(elt('strong','',review.display_name||'Community member'),elt('small','',formatDate(review.created_at)));
  const rating=elt('span','review-stars',stars(review.rating));
  rating.setAttribute('aria-label',review.rating+' out of 5 stars');
  top.append(avatar,name,rating);
  root.append(top,elt('p','review-copy',review.body||''));
  if(moderation){
   const status=elt('span','review-status-pill review-status-'+review.status,review.status);
   root.append(status);
   const actions=elt('div','review-card-actions');
   for(const [value,label] of [['approved','Approve & publish'],['rejected','Reject / hide']]){
    const btn=elt('button',value==='approved'?'review-primary':'review-secondary',label);
    btn.type='button';btn.disabled=review.status===value;
    btn.addEventListener('click',async()=>{
     btn.disabled=true;
     try{await call('/api/reviews/admin/moderate','POST',{id:review.id,status:value});await loadAdmin();}
     catch(e){alert(e.message);btn.disabled=false;}
    });
    actions.append(btn);
   }
   root.append(actions);
  }
  return root;
 }
 function showError(target,message){
  target.replaceChildren(elt('p','review-muted',message));
 }
 async function loadPublic(){
  const feed=$('review-feed'),stat=$('review-stat');
  try{
   const data=await call('/api/reviews');
   const count=Math.max(0,Number(data?.summary?.count)||0);
   stat.textContent=count?count+' published · '+Number(data.summary.average||0).toFixed(1)+'/5 average':'Reviews open · awaiting first publication';
   if(!Array.isArray(data.reviews)||!data.reviews.length){
    feed.replaceChildren(elt('div','review-empty','No published reviews yet. Be the first to share a genuine experience.'));
    return;
   }
   feed.replaceChildren(...data.reviews.map(v=>card(v)));
  }catch(e){stat.textContent='Not available';showError(feed,'Reviews could not be loaded. '+e.message);}
 }
 async function loadAdmin(){
  const root=$('review-admin-list');
  try{
   const data=await call('/api/reviews/admin');
   const items=Array.isArray(data.reviews)?data.reviews:[];
   $('review-admin-summary').textContent=items.filter(x=>x.status==='pending').length+' pending / '+items.length+' recent';
   root.replaceChildren(...(items.length?items.map(x=>card(x,true)):[elt('div','review-empty','No review submissions yet.')]));
  }catch(e){
   $('review-admin-summary').textContent='Session required';
   showError(root,e.message+' — Open Studio Control to sign in, then return here.');
   const link=elt('a','review-primary','Open Studio Control ↗');link.href='/admin/';root.append(link);
  }
 }
 function bindForm(){
  const form=$('review-form');if(!form)return;
  form.addEventListener('submit',async e=>{
   e.preventDefault();
   if(!form.reportValidity())return;
   const fd=new FormData(form),status=$('review-form-status'),btn=$('review-submit');
   const rating=Number(fd.get('rating'));
   if(!Number.isInteger(rating)||rating<1||rating>5){status.textContent='Please select a rating.';return;}
   btn.disabled=true;status.textContent='Sending your review securely…';
   try{
    const value=await call('/api/reviews','POST',{name:String(fd.get('name')||''),rating,review:String(fd.get('review')||''),website:String(fd.get('website')||''),confirm:fd.get('confirm')==='on'});
    status.textContent=value.message||'Submitted for moderation.';
    status.classList.add('review-success');form.reset();
    await loadPublic();
   }catch(err){status.textContent=err.message;status.classList.remove('review-success');}
   finally{btn.disabled=false;}
  });
 }
 if(isAdmin)loadAdmin();else{loadPublic();bindForm();}
})();