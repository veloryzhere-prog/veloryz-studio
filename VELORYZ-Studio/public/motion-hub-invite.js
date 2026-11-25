/* Motion Hub invitation: isolated from the existing homepage motion engines. */
(()=>{'use strict';
 if(location.pathname!=='/'||new URLSearchParams(location.search).get('classic')==='1')return;
 let shown=false;
 const show=()=>{
  if(shown||location.pathname!=='/'||!document.body)return;
  shown=true;
  const consent=window.VeloryzPrivacy;
  try{if(consent?.allowed?.('preferences')&&sessionStorage.getItem('vzm.hub.invite.seen')==='1')return;}catch{}
  const invite=document.createElement('aside');
  invite.id='vzm-hub-invite';invite.className='vzm-hub-invite';invite.setAttribute('aria-label','Explore the Motion Hub');
  invite.innerHTML='<span class="vzm-hub-invite-orbit" aria-hidden="true"></span><button class="vzm-hub-close" type="button" aria-label="Dismiss Motion Hub invitation">×</button><span class="vzm-hub-kicker">VELORYZ / NEW EXPERIENCE</span><strong>Motion has a new home.</strong><p>14 interactive chapters. Scroll, touch, explore.</p><a href="/motion-hub/" class="vzm-hub-visit">Visit Motion Hub <span aria-hidden="true">↗</span></a>';
  const dismiss=()=>invite.remove();
  invite.querySelector('.vzm-hub-close').addEventListener('click',dismiss);
  invite.addEventListener('keydown',e=>{if(e.key==='Escape'){dismiss();document.getElementById('mb')?.focus({preventScroll:true});}});
  document.body.append(invite);
  try{if(consent?.allowed?.('preferences'))sessionStorage.setItem('vzm.hub.invite.seen','1');}catch{}
 };
 const start=()=>setTimeout(show,Math.max(0,3500-performance.now()));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
