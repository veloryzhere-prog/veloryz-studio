/* Original VELORYZ website template interactions. Demo transactions are never submitted. */
(()=>{'use strict';
let count=0,total=0,timer=null;
const one=q=>document.querySelector(q),all=q=>[...document.querySelectorAll(q)];
const notify=message=>{const el=one('#demo-toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),3500);};
document.addEventListener('click',event=>{
 const menu=event.target.closest('.demo-menu-toggle');
 if(menu){const nav=one('#demo-nav');const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));return;}
 if(event.target.closest('#demo-nav a')){one('#demo-nav')?.classList.remove('open');one('.demo-menu-toggle')?.setAttribute('aria-expanded','false');}
 const filter=event.target.closest('[data-filter]');
 if(filter){const kind=filter.dataset.filter;all('[data-filter]').forEach(el=>{el.classList.toggle('active',el===filter);el.setAttribute('aria-pressed',String(el===filter))});all('.demo-product').forEach(el=>{el.hidden=kind!=='all'&&el.dataset.category!==kind});return;}
 const add=event.target.closest('[data-add]');
 if(add){count++;total+=Number(add.dataset.price)||0;one('#demo-bag-count').textContent=count+' item'+(count===1?'':'s');one('#demo-bag-total').textContent='₹'+total.toLocaleString('en-IN');notify(add.dataset.add+' added to your demo bag — no order or payment was made.');return;}
 const tab=event.target.closest('[data-demo-tab]');
 if(tab){const selected=tab.dataset.demoTab;all('[data-demo-tab]').forEach(el=>el.classList.toggle('active',el===tab));one('#demo-tab-title').textContent=({overview:'Your overview',planning:'Plan with clarity',insights:'Useful insights'})[selected]||'Your overview';one('#demo-stat-one').textContent=selected==='planning'?'12':selected==='insights'?'36':'24';one('#demo-stat-two').textContent=selected==='planning'?'06':selected==='insights'?'18':'08';return;}
 const reading=event.target.closest('[data-open-reading]');
 if(reading){const box=one('#demo-reading-detail');box.hidden=false;box.replaceChildren();const small=document.createElement('small'),title=document.createElement('h3'),description=document.createElement('p'),close=document.createElement('button');small.textContent='VELORYZ / SAMPLE CONTENT';title.textContent=reading.dataset.openReading;description.textContent='This is an interactive sample of the front-end reading experience. Replace the illustrative content with your own licensed editorial or course material before launching.';close.type='button';close.textContent='Close sample';close.addEventListener('click',()=>{box.hidden=true;reading.focus()},{once:true});box.append(small,title,description,close);box.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});box.focus({preventScroll:true});return;}
});
document.addEventListener('submit',event=>{if(!event.target.matches('.demo-booking'))return;event.preventDefault();const form=event.target;if(!form.reportValidity())return;const name=String(new FormData(form).get('demoName')||'').trim();one('.demo-booking-result').textContent='Interactive preview only, '+name+'. No reservation or appointment was submitted or confirmed.';notify('Sample form completed — nothing was booked.');});
document.addEventListener('input',event=>{if(event.target.id!=='demo-search')return;const q=event.target.value.trim().toLowerCase();all('.demo-reading').forEach(el=>{el.hidden=!el.textContent.toLowerCase().includes(q)});});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&typeof IntersectionObserver==='function'){
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   observer.unobserve(entry.target);
   entry.target.animate([{opacity:.7,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)'});
  });
 },{threshold:.1});
 all('.demo-services-grid article,.demo-project-grid .demo-tile,.demo-reading').forEach(el=>observer.observe(el));
}
})();
