/* VELORYZ Studio Control — integrated, owner-only community review workflow.
 * All mutations use the existing protected same-origin review API; no public DB grants.
 */
'use strict';
let ownerReviews=null,ownerReviewLoading=false,ownerReviewError='',ownerReviewFilter='pending',ownerReviewSearch='',ownerReviewFetched=0;
const ownerReviewBusy=new Set();
function loadOwnerReviews(force=false){
 if(ownerReviewLoading)return;
 if(!force&&ownerReviews&&Date.now()-ownerReviewFetched<45000)return;
 ownerReviewLoading=true;ownerReviewError='';
 (async()=>{
  try{
   if(preview)throw new Error('Review moderation is available only after signing in to the deployed admin site.');
   const data=await api('/api/reviews/admin');
   if(!Array.isArray(data.reviews))throw new Error('Review API returned an unexpected response.');
   ownerReviews=data.reviews;
   ownerReviewFetched=Date.now();
  }catch(error){ownerReviewError=error.message||'Could not load reviews.';}
  finally{ownerReviewLoading=false;if(['reviews','overview','command'].includes(section))render();}
 })();
}
function ownerReviewCounts(){
 const items=ownerReviews||[];
 return {pending:items.filter(x=>x.status==='pending').length,approved:items.filter(x=>x.status==='approved').length,rejected:items.filter(x=>x.status==='rejected').length,total:items.length};
}
function ownerReviewCard(review){
 const id=E(review.id),status=String(review.status||'pending');
 const active=ownerReviewBusy.has(String(review.id));
 const rating=Math.min(5,Math.max(1,Number(review.rating)||1));
 const extra=[['Highlights',review.highlights],['Improvement suggestions',review.improvement]].filter(x=>String(x[1]||'').trim());
 const actions=[
  status==='approved'?'':'<button class="admin-button" data-review-moderate="approved" data-review-id="'+id+'" '+(active?'disabled':'')+'>✓ Approve & publish</button>',
  status==='rejected'?'':'<button class="admin-button secondary" data-review-moderate="rejected" data-review-id="'+id+'" '+(active?'disabled':'')+'>Reject / hide</button>'
 ].join('');
 return '<article class="ad-review-card" data-review-card><div class="ad-review-card-head">'+
  '<div class="ad-review-avatar" aria-hidden="true">'+E(String(review.display_name||'C').slice(0,1).toUpperCase())+'</div>'+
  '<div class="ad-review-author"><strong>'+E(review.display_name||'Community member')+'</strong><small>'+E(review.service||'General feedback')+' · '+E(friendlyDate(review.created_at))+'</small></div>'+
  '<div class="ad-review-stars" aria-label="'+rating+' out of 5 stars">'+('★'.repeat(rating)+'☆'.repeat(5-rating))+'</div></div>'+
  (review.headline?'<h3>'+E(review.headline)+'</h3>':'')+
  '<p class="ad-review-body">'+E(review.body||'')+'</p>'+
  (extra.length?'<div class="ad-review-details">'+extra.map(([label,value])=>'<div><b>'+E(label)+'</b><p>'+E(value)+'</p></div>').join('')+'</div>':'')+
  '<footer class="ad-review-card-foot"><span class="ad-review-status ad-review-status-'+E(status)+'">'+E(status)+'</span>'+
  '<div class="ad-review-actions">'+actions+'</div></footer></article>';
}
function ownerReviewFiltered(){
 const records=(ownerReviews||[]).filter(x=>(ownerReviewFilter==='all'||x.status===ownerReviewFilter));
 const term=ownerReviewSearch.toLocaleLowerCase('en').trim();
 const matches=term?records.filter(x=>[x.display_name,x.body,x.headline,x.service].some(v=>String(v||'').toLocaleLowerCase('en').includes(term))):records;
 return matches.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
}
function ownerReviewList(){
 if(ownerReviewLoading&&!ownerReviews)return '<div class="ad-review-empty" role="status">Loading reviews from the secured moderation service…</div>';
 if(ownerReviewError&&!ownerReviews)return '<div class="ad-review-empty" role="alert"><strong>Reviews could not be loaded.</strong><p>'+E(ownerReviewError)+'</p><button class="admin-button" data-review-refresh>Retry connection</button></div>';
 const visible=ownerReviewFiltered();
 if(!visible.length)return '<div class="ad-review-empty"><strong>No matching submissions</strong><p>Try All submissions, change the search, or refresh. We never create sample customer reviews.</p></div>';
 return '<div class="ad-review-grid">'+visible.map(ownerReviewCard).join('')+'</div>';
}
function adminReviewPage(){
 const count=ownerReviewCounts();
 const counts=[['pending','Needs review',count.pending],['approved','Published',count.approved],['rejected','Rejected',count.rejected],['all','All submissions',count.total]];
 return heading('COMMUNITY / MODERATION','Community Reviews','See real visitor feedback, publish authentic experiences and hide spam. Decisions are saved immediately; they do not require site content publication.',
 '<button class="admin-button secondary" data-review-refresh>↻ Refresh reviews</button> <a class="admin-button" href="/reviews.html" target="_blank" rel="noopener">View public reviews ↗</a>')+
 '<section class="ad-review-console" aria-label="Review moderation">'+
 '<div class="ad-review-metrics">'+counts.map(([key,label,value])=>'<button class="ad-review-metric '+(ownerReviewFilter===key?'is-active':'')+'" type="button" data-review-filter="'+key+'" aria-pressed="'+(ownerReviewFilter===key)+'"><span>'+label+'</span><strong>'+value+'</strong><small>'+ (key==='pending'?'Awaiting decision':key==='approved'?'Visible to visitors':key==='rejected'?'Hidden from visitors':'Most recent records')+'</small></button>').join('')+'</div>'+
 '<div class="ad-review-toolbar"><div><strong>Moderation queue</strong><small>Only approved reviews appear on the public site. Critical reviews can be approved too.</small></div>'+
 '<label for="ad-review-search" class="ad-review-search-label"><span class="ad-sr-only">Search customer reviews</span><input id="ad-review-search" type="search" placeholder="Search by name or feedback" value="'+E(ownerReviewSearch)+'" autocomplete="off"></label></div>'+
 '<div class="ad-review-list-status" aria-live="polite" id="ad-review-list-status">'+(ownerReviewLoading?'Refreshing…':ownerReviewError?'Last refresh failed: '+E(ownerReviewError):ownerReviewFiltered().length+' reviews in this view')+'</div>'+
 '<div id="ad-review-list">'+ownerReviewList()+'</div>'+
 '<div class="ad-review-privacy-note">Owner-only moderation · Personal feedback must not be exported into public CMS drafts or used to generate fabricated testimonials.</div></section>';
}
function ownerReviewUpdateList(){
 const list=document.getElementById('ad-review-list'),status=document.getElementById('ad-review-list-status');
 if(!list)return;
 list.innerHTML=ownerReviewList();
 if(status)status.textContent=ownerReviewFiltered().length+' reviews in this view';
 document.querySelectorAll('[data-review-filter]').forEach(button=>{const selected=button.dataset.reviewFilter===ownerReviewFilter;button.classList.toggle('is-active',selected);button.setAttribute('aria-pressed',String(selected));});
}
document.addEventListener('click',async event=>{
 const filter=event.target.closest('[data-review-filter]');
 if(filter){ownerReviewFilter=filter.dataset.reviewFilter;ownerReviewUpdateList();return;}
 if(event.target.closest('[data-review-refresh]')){ownerReviews=null;ownerReviewError='';loadOwnerReviews(true);return;}
 const trigger=event.target.closest('[data-review-moderate]');
 if(!trigger)return;
 const id=String(trigger.dataset.reviewId||''),status=trigger.dataset.reviewModerate;
 if(!/^[0-9a-f-]{32,36}$/i.test(id)||!['approved','rejected'].includes(status)||ownerReviewBusy.has(id))return;
 ownerReviewBusy.add(id);ownerReviewUpdateList();
 try{
  if(preview)throw new Error('Sign in to the published Studio Control to moderate feedback.');
  const result=await api('/api/reviews/admin/moderate',{method:'POST',body:JSON.stringify({id,status})});
  if(!result.ok||result.status!==status)throw new Error('The moderation result was not confirmed. Refresh before retrying.');
  const match=ownerReviews?.find(x=>x.id===id);if(match)match.status=status;
  ownerReviewFetched=Date.now();
  toast(status==='approved'?'Review approved and now visible publicly.':'Review rejected and hidden from the public page.');
 }catch(err){toast(err.message);ownerReviewError=err.message||'Moderation failed.';}
 finally{ownerReviewBusy.delete(id);if(section==='reviews')render();}
});
document.addEventListener('input',event=>{
 if(event.target.id!=='ad-review-search')return;
 ownerReviewSearch=event.target.value;
 ownerReviewUpdateList();
});
