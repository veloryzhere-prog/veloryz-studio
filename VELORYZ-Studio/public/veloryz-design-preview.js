/* VELORYZ Studio premium project and full-site preview controller.
   Actual site motion runs in its own scrolling document; parent page never
   fakes the website scroll. Sandbox intentionally omits allow-same-origin. */
(()=>{'use strict';
const data=document.getElementById('vz-design-data');
const content=document.getElementById('vz-concept');
const stage=document.getElementById('vz-stage');
const caption=document.getElementById('vz-preview-caption');
if(!data||!content||!stage)return;
let design;
try{design=JSON.parse(data.textContent||'{}')}catch{return}
const live=design.mode==='immersive',id=design.id;
let frame=null,currentPercent=0,readyTimer=0;
const setStatus=message=>{if(caption)caption.textContent=message};
const escape=s=>String(s||'');
function updateProgress(value){
 currentPercent=Math.max(0,Math.min(100,Math.round(Number(value)||0)));
 const bar=document.getElementById('vz-progress-fill');
 const label=document.getElementById('vz-progress-text');
 if(bar)bar.style.transform='scaleX('+(currentPercent/100)+')';
 if(label)label.textContent=currentPercent+'%';
}
function placeholder(title,message){
 const box=document.createElement('div');box.className='vz-market-preview-unavailable';
 const mark=document.createElement('span');mark.textContent='VELORYZ / PREVIEW';
 const h=document.createElement('h2');h.textContent=title;
 const p=document.createElement('p');p.textContent=message;
 const a=document.createElement('a');a.href='/create/?reference='+encodeURIComponent(id);
 a.textContent='Customize with VELORYZ ↗';
 box.append(mark,h,p,a);if(design.demo&&/^https:\/\//.test(design.demo)){const source=document.createElement('a');source.href=design.demo;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Open publisher demo ↗';box.append(source);}content.replaceChildren(box);setStatus(message);
}
function imagePreview(){
 clearTimeout(readyTimer);frame=null;stage.dataset.previewState='visual';updateProgress(0);
 if(!design.image)return placeholder('Preview under preparation','A full interactive website has not been installed for this project. You can use the visual direction in your VELORYZ project brief.');
 const img=document.createElement('img');
 img.className='vz-market-screenshot';img.src=design.image;
 img.decoding='async';img.referrerPolicy='no-referrer';
 img.alt=design.name+' — actual publisher or repository project media';
 img.addEventListener('error',()=>{
  if(!img.dataset.fallback&&design.fallbackImage&&img.src!==design.fallbackImage){
   img.dataset.fallback='yes';img.src=design.fallbackImage;return;
  }
  placeholder('Preview temporarily unavailable','The original media host cannot supply this preview right now. You can still request a tailored design from the Studio.');
 });
 content.replaceChildren(img);
 setStatus((design.previewKind==='upstream-screenshot'?'Source screenshot':design.previewKind==='github-repository-cover'?'Repository cover':'Source reference')+' · interactive preview unavailable');
}
function loadSite(){
 clearTimeout(readyTimer);stage.dataset.previewState='loading';updateProgress(0);
 if(!design.isRunnable||!design.localSource){imagePreview();return}
 const iframe=document.createElement('iframe');
 iframe.className='vz-market-live-iframe';
 iframe.title=escape(design.name)+' — original website, scroll to explore';
 iframe.src=design.localSource+'?v=20261126-r43';
 iframe.loading='eager';
 iframe.referrerPolicy='strict-origin-when-cross-origin';
 // Browser-enforced opaque origin isolates upstream source from Studio login/DOM.
 // Do NOT add allow-same-origin to this sandbox.
 iframe.setAttribute('sandbox','allow-scripts allow-forms allow-modals allow-pointer-lock');
 iframe.setAttribute('allow','fullscreen');
 iframe.addEventListener('load',()=>{
  if(frame!==iframe||stage.dataset.previewState==='ready')return;
  setStatus('Checking the original website assets…');
  command('report');
 },{once:true});
 iframe.addEventListener('error',()=>{if(frame!==iframe)return;if(design.image)imagePreview();else placeholder('Website temporarily unavailable','The preview could not load. The Studio can still help you scope this direction.')},{once:true});
 frame=iframe;
 content.replaceChildren(iframe);
 readyTimer=setTimeout(()=>{if(frame===iframe&&stage.dataset.previewState!=='ready')imagePreview()},18000);
 setStatus('Loading the real website...');
}
function command(name,delta=0){
 if(!frame?.contentWindow)return;
 // No secrets or user data pass through the untrusted iframe boundary.
 frame.contentWindow.postMessage({type:'veloryz:preview-command',id,command:name,delta:Math.max(-1800,Math.min(1800,Math.round(delta)))},'*');
}
window.addEventListener('message',event=>{
 if(!frame?.contentWindow||event.source!==frame.contentWindow)return;
 const msg=event.data;
 if(!msg||msg.id!==id)return;
 if(msg.type==='veloryz:preview-ready'){if(msg.ok===true){clearTimeout(readyTimer);stage.dataset.previewState='ready';setStatus('Interactive preview · scroll inside the website');}return;}
 if(msg.type!=='veloryz:preview-progress')return;
 const percent=Number(msg.percent);
 if(Number.isFinite(percent)&&percent>=0&&percent<=100)updateProgress(percent);
});
loadSite();
document.addEventListener('click',event=>{
 const control=event.target.closest('[data-vz-device],[data-vz-restart],[data-vz-reload],[data-vz-fullscreen],[data-vz-close],#vz-made-with');
 if(!control)return;
 if(control.dataset.vzDevice){
  const width=control.dataset.vzDevice;
  if(!['desktop','tablet','mobile'].includes(width))return;
  stage.dataset.vzDevice=width;
  document.querySelectorAll('[data-vz-device]').forEach(button=>button.setAttribute('aria-pressed',String(button===control)));
  setStatus('Viewport: '+width+(stage.dataset.previewState==='ready'?' · interactive website':' · visual reference'));
  command('report');
  return;
 }
 if(control.matches('[data-vz-restart]')){if(frame)command('top');else content.scrollTop=0;setStatus('Returned to the beginning of the preview');return}
 if(control.matches('[data-vz-reload]')){loadSite();return}
 if(control.matches('[data-vz-fullscreen]')){
  if(document.fullscreenElement){document.exitFullscreen?.().catch(()=>{});return}
  stage.requestFullscreen?.().catch(()=>setStatus('Fullscreen is unavailable on this device.'));
  return;
 }
 const dlg=document.getElementById('vz-studio-about');
 if(control.id==='vz-made-with'){if(dlg?.showModal)dlg.showModal();return}
 if(control.matches('[data-vz-close]'))dlg?.close?.();
});
const dlg=document.getElementById('vz-studio-about');
dlg?.addEventListener('click',event=>{if(event.target===dlg)dlg.close()});
// When user wheels over a static preview overlay (badge / shell), forward it to
// the real website instead of making the outer page move while the site stays put.
// Native mouse wheel *inside* the iframe remains untouched.
stage.addEventListener('wheel',event=>{
 if(!frame||!design.isRunnable)return;
 if(event.target.closest('button,a'))return;
 event.preventDefault();
 command('wheel',event.deltaY);
},{passive:false});
// Full viewer is 100dvh and cannot scroll externally. Touch/mouse/trackpad
// inside the iframe scroll the source document itself, driving IntersectionObserver,
// CSS scroll timelines, Lenis, GSAP ScrollTrigger and native scroll effects.
if(live){
 window.addEventListener('wheel',event=>{
  if(!frame||!design.isRunnable)return;
  if(event.target.closest('button,a,.vz-market-devices'))return;
  if(stage.contains(event.target))return; // stage already forwards its overlay wheel
  event.preventDefault();command('wheel',event.deltaY);
 },{passive:false});
}
document.addEventListener('error',event=>{
 const node=event.target;
 if(!(node instanceof HTMLImageElement))return;
 if(!node.matches('.vz-market-cover,.vz-market-related-card img'))return;
 const fallback=node.dataset.fallbackSrc;
 if(fallback&&!node.dataset.fallbackTried&&node.src!==fallback){
  node.dataset.fallbackTried='1';node.src=fallback;
 }else node.style.opacity='.2';
},true);
})();
