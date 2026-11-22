/* VELORYZ continuous public review showcase + respectful two-minute invitation.
   Real approved reviews only. No fake content, no hover interruptions.
   Manual pause and prefers-reduced-motion are available for accessibility. */
(()=>{'use strict';
 const INVITE_AFTER_MS=120000;
 const ELAPSED_KEY='vz.review.prompt.elapsed.v2';
 const SEEN_KEY='vz.review.prompt.seen.v2';
 let reviewsPromise=null,carouselToken=0,interval=null,activeSince=null,elapsed=0,dialog=null,previousFocus=null;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const $=id=>document.getElementById(id);
 const mk=(tag,cls,value)=>{
  const n=document.createElement(tag);
  if(cls)n.className=cls;
  if(value!==undefined)n.textContent=String(value);
  return n;
 };
 const remember=(key,value)=>{try{sessionStorage.setItem(key,String(value))}catch{}};
 const recall=key=>{try{return sessionStorage.getItem(key)}catch{return null}};
 try{elapsed=Math.max(0,Math.min(INVITE_AFTER_MS,Number(recall(ELAPSED_KEY))||0));}catch{elapsed=0;}
 function reviewSlide(review){
  const article=mk('article','vz-reviews-marquee-card');
  article.setAttribute('aria-label','Community review by '+String(review.display_name||'a visitor'));
  const top=mk('div','vz-review-slide-top');
  const avatar=mk('span','vz-review-slide-avatar',(String(review.display_name||'V').trim()[0]||'V').toUpperCase());
  avatar.setAttribute('aria-hidden','true');
  const byline=mk('div','vz-review-slide-byline');
  byline.append(mk('strong','',review.display_name||'Community member'),mk('small','',review.service||'Community experience'));
  const stars=mk('span','vz-review-slide-stars','★'.repeat(Math.max(1,Math.min(5,Number(review.rating)||1)))+'☆'.repeat(Math.max(0,5-(Number(review.rating)||1))));
  stars.setAttribute('aria-label',review.rating+' of 5 stars');
  top.append(avatar,byline,stars);
  article.append(top);
  if(review.headline)article.append(mk('h3','',review.headline));
  const content=String(review.body||'');
  article.append(mk('p','vz-review-slide-body',content.length>260?content.slice(0,257).trimEnd()+'…':content));
  if(review.highlights)article.append(mk('p','vz-review-slide-highlight','✳ '+String(review.highlights).slice(0,125)));
  article.append(mk('span','vz-review-slide-footer','HUMAN-MODERATED · READ FULL REVIEW ↗'));
  return article;
 }
 async function getReviews(){
  if(reviewsPromise)return reviewsPromise;
  reviewsPromise=fetch('/api/reviews',{cache:'no-store',credentials:'same-origin'}).then(r=>{if(!r.ok)throw Error('Reviews unavailable');return r.json();})
   .catch(err=>{reviewsPromise=null;throw err;});
  return reviewsPromise;
 }
 function reviewReady(node){
  if(!node)return;
  const current=++carouselToken,track=$('vz-review-track'),state=$('vz-review-section-state'),count=$('vz-review-count');
  if(!track||!state||!count)return;
  getReviews().then(data=>{
   if(current!==carouselToken||!document.contains(track))return;
   const items=Array.isArray(data.reviews)?data.reviews:[];
   const total=Math.max(0,Number(data?.summary?.count)||0);
   count.textContent=total?total+' PUBLISHED '+(total===1?'REVIEW':'REVIEWS'):'OPEN TO FIRST REVIEWS';
   if(!items.length){
    track.replaceChildren();
    node.classList.add('vz-reviews-spotlight-empty');
    state.textContent='Our public review collection is just beginning. No invented testimonials—only real experiences will appear here.';
    const cta=mk('a','vz-reviews-empty-cta','Be the first to share ↗');
    cta.href='/reviews.html#share-review';track.append(cta);
    return;
   }
   node.classList.remove('vz-reviews-spotlight-empty');
   state.textContent='Genuine visitor feedback · human-reviewed, not purchase-verified';
   const first=mk('div','vz-review-set');
   for(const review of items)first.append(reviewSlide(review));
   const second=first.cloneNode(true);
   second.setAttribute('aria-hidden','true');
   second.inert=true;
   track.replaceChildren(first,second);
   track.style.setProperty('--vz-review-run',Math.max(28,items.length*10)+'s');
   const btn=$('vz-review-pause');
   if(btn){btn.disabled=false;btn.hidden=false;btn.setAttribute('aria-pressed','false');btn.textContent=reduce.matches?'Motion reduced':'Pause motion ‖';}
   if(reduce.matches)track.classList.add('vz-review-paused');
   else track.classList.remove('vz-review-paused');
  }).catch(()=>{
   if(current!==carouselToken)return;
   track.replaceChildren();
   state.textContent='Community reviews are temporarily unavailable.';
   count.textContent='REVIEW SERVICE';
  });
 }
 function mount(){
  const section=$('vz-reviews-spotlight');
  if(!section)return;
  if(section.dataset.mounted==='true')return;
  section.dataset.mounted='true';
  const pause=$('vz-review-pause');
  pause?.addEventListener('click',()=>{
   const track=$('vz-review-track');if(!track)return;
   const paused=track.classList.toggle('vz-review-paused');
   pause.setAttribute('aria-pressed',String(paused));
   pause.textContent=paused?'Resume motion ▶':'Pause motion ‖';
  });
  reviewReady(section);
 }
 function stopClock(){
  clearTimeout(interval);interval=null;
  if(activeSince!==null){elapsed=Math.min(INVITE_AFTER_MS,elapsed+Math.max(0,performance.now()-activeSince));activeSince=null;remember(ELAPSED_KEY,Math.round(elapsed));}
 }
 function eligible(){
  return document.visibilityState==='visible'&&!recall(SEEN_KEY)&&location.pathname!=='/reviews.html'&&location.pathname!=='/admin/reviews.html';
 }
 function scheduleClock(){
  stopClock();
  if(!eligible())return;
  activeSince=performance.now();
  const remaining=Math.max(0,INVITE_AFTER_MS-elapsed);
  interval=setTimeout(()=>{
   stopClock();
   if(!eligible())return;
   if(elapsed+5>=INVITE_AFTER_MS)showInvite();
   else scheduleClock();
  },remaining);
 }
 function closeInvite(){
  if(!dialog)return;
  dialog.remove();dialog=null;
  document.body.classList.remove('vz-review-dialog-open');
  if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  previousFocus=null;
 }
 function showInvite(){
  if(dialog||recall(SEEN_KEY))return;
  // The invitation occurs once per tab session; closing it never forces an action.
  remember(SEEN_KEY,'true');
  previousFocus=document.activeElement;
  const overlay=mk('div','vz-review-invite-shade');
  const panel=mk('section','vz-review-invite');
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
  panel.setAttribute('aria-labelledby','vz-review-invite-title');
  panel.setAttribute('aria-describedby','vz-review-invite-copy');
  const decor=mk('div','vz-review-invite-decor','V');decor.setAttribute('aria-hidden','true');
  const close=mk('button','vz-review-invite-close','×');
  close.type='button';close.setAttribute('aria-label','Close review invitation');
  close.addEventListener('click',closeInvite);
  panel.append(decor,close,mk('div','vz-review-invite-kicker','✳  TWO MINUTES OF DISCOVERY'));
  panel.append(mk('h2','', 'Your perspective matters.'));
  panel.querySelector('h2').id='vz-review-invite-title';
  const copy=mk('p','','You have been exploring VELORYZ for a little while. Would you share what you think? Positive, critical or somewhere in between—your own words help us improve.');
  copy.id='vz-review-invite-copy';panel.append(copy);
  const badges=mk('div','vz-review-invite-badges');
  badges.append(mk('span','','✦ Your own words'),mk('span','','✦ Human reviewed'),mk('span','','✦ 1–2 minutes'));
  panel.append(badges);
  const actions=mk('div','vz-review-invite-actions');
  const open=mk('a','vz-review-invite-primary','Write a review ↗');
  open.href='/reviews.html#share-review';
  open.addEventListener('click',()=>{closeInvite()});
  const later=mk('button','vz-review-invite-secondary','Maybe later');
  later.type='button';later.addEventListener('click',closeInvite);
  actions.append(open,later);panel.append(actions);
  panel.append(mk('small','vz-review-invite-footnote','No obligation. We never publish without moderation.'));
  overlay.append(panel);
  overlay.addEventListener('mousedown',e=>{if(e.target===overlay)closeInvite();});
  overlay.addEventListener('keydown',e=>{
   if(e.key==='Escape'){e.preventDefault();closeInvite();return;}
   if(e.key==='Tab'){
    const controls=[close,open,later],index=controls.indexOf(document.activeElement);
    if(e.shiftKey&&index===0){e.preventDefault();later.focus();}
    else if(!e.shiftKey&&index===2){e.preventDefault();close.focus();}
   }
  });
  document.body.append(overlay);dialog=overlay;
  document.body.classList.add('vz-review-dialog-open');
  close.focus({preventScroll:true});
 }
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleClock();else stopClock()});
 addEventListener('pagehide',stopClock);
 reduce.addEventListener?.('change',()=>{
  const track=$('vz-review-track'),pause=$('vz-review-pause');
  if(track&&reduce.matches){track.classList.add('vz-review-paused');if(pause)pause.textContent='Motion reduced';}
  else if(track&&pause?.getAttribute('aria-pressed')!=='true'){track.classList.remove('vz-review-paused');pause.textContent='Pause motion ‖';}
 });
 window.VeloryzReviewExperience={mount,showInviteForPreview:()=>{if(location.hostname==='localhost')showInvite();}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleClock,{once:true});
 else scheduleClock();
})();