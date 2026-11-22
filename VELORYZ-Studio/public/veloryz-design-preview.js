/* VELORYZ studio viewer — displays authentic locally hosted HTML or original media. */
(()=>{'use strict';
const script=document.getElementById('vz-design-data');
const frameRoot=document.getElementById('vz-concept');
const stage=document.getElementById('vz-stage');
const caption=document.getElementById('vz-preview-caption');
if(!script||!frameRoot||!stage)return;
let design;
try{design=JSON.parse(script.textContent||'{}')}catch{return}
const setStatus=(message)=>{if(caption)caption.textContent=message};
let current='preview';
function makeScreenshot(){
 const image=String(design.image||'');
 if(!image){
  const box=document.createElement('div');box.className='vz-studio-unavailable';
  const star=document.createElement('span');star.textContent='V / DESIGN COLLECTION';
  const name=document.createElement('h2');name.textContent=design.name;
  const body=document.createElement('p');body.textContent='An interactive preview is not available for this directory yet. You can explore more studio designs or use this as your project reference.';
  const link=document.createElement('a');link.href='/create/?reference='+encodeURIComponent(design.id);link.textContent='Create a project ↗';
  box.append(star,name,body,link);frameRoot.replaceChildren(box);
  setStatus('Preview not available');return;
 }
 const pic=document.createElement('img');pic.className='vz-studio-preview-image';pic.src=image;
 pic.alt=design.name+' — published project preview';pic.decoding='async';pic.referrerPolicy='no-referrer';
 pic.addEventListener('error',()=>{if(!pic.dataset.fallbackTried&&design.fallbackImage&&pic.src!==design.fallbackImage){pic.dataset.fallbackTried='1';pic.src=design.fallbackImage;return}showUnavailable()});
 frameRoot.replaceChildren(pic);
 setStatus('Gallery view');
}
function showUnavailable(){
 const container=document.createElement('div');container.className='vz-studio-unavailable';
 const mark=document.createElement('strong');mark.textContent='V.';
 const h=document.createElement('h2');h.textContent='This preview is temporarily unavailable.';
 const p=document.createElement('p');p.textContent='Some external media providers restrict embedded content. You can still continue with this design in the VELORYZ project planner.';
 const link=document.createElement('a');link.href='/create/?reference='+encodeURIComponent(design.id);link.textContent='Create with VELORYZ ↗';
 container.append(mark,h,p,link);
 frameRoot.replaceChildren(container);setStatus('Preview unavailable');
}
function loadPreview(){
 current='preview';
 if(!design.localSource)return makeScreenshot();
 const iframe=document.createElement('iframe');iframe.className='vz-studio-iframe';
 iframe.title=design.name+' — interactive design website';
 iframe.loading='eager';iframe.referrerPolicy='strict-origin-when-cross-origin';
 // No allow-same-origin: third-party preview code cannot read VELORYZ cookies
 // or access the parent document. This is intentional security isolation.
 iframe.setAttribute('sandbox','allow-scripts allow-forms allow-modals allow-pointer-lock');
 iframe.setAttribute('allow','fullscreen');
 iframe.src=design.localSource;
 iframe.addEventListener('load',()=>setStatus('Interactive preview · scroll inside to explore'),{once:true});
 iframe.addEventListener('error',()=>{if(design.image)makeScreenshot();else showUnavailable()},{once:true});
 frameRoot.replaceChildren(iframe);
 setStatus('Opening interactive preview...');
}
loadPreview();
document.addEventListener('click',event=>{
 const el=event.target.closest('[data-vz-device],[data-vz-reload],[data-vz-fullscreen],[data-vz-close],#vz-made-with');
 if(!el)return;
 if(el.dataset.vzDevice){
  const width=el.dataset.vzDevice;if(!['desktop','tablet','mobile'].includes(width))return;
  stage.dataset.vzDevice=width;
  document.querySelectorAll('[data-vz-device]').forEach(button=>button.setAttribute('aria-pressed',String(button===el)));
  return;
 }
 if(el.hasAttribute('data-vz-reload')){if(design.localSource)loadPreview();else makeScreenshot();return}
 if(el.hasAttribute('data-vz-fullscreen')){
  if(document.fullscreenElement){document.exitFullscreen?.().catch(()=>{});return}
  if(stage.requestFullscreen)stage.requestFullscreen().catch(()=>setStatus('Fullscreen is not available in this browser.'));
  else setStatus('Fullscreen is not available in this browser.');
  return;
 }
 const dialog=document.getElementById('vz-studio-about');
 if(el.id==='vz-made-with'){if(dialog?.showModal)dialog.showModal();return}
 if(el.hasAttribute('data-vz-close'))dialog?.close?.();
});
const dialog=document.getElementById('vz-studio-about');
dialog?.addEventListener('click',event=>{
 if(event.target===dialog)dialog.close();
});
})();
