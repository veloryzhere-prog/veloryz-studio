/* Authentic GitHub source previews only. No generated/demo layouts. */
(()=>{'use strict';
const node=document.getElementById('vz-design-data'),view=document.getElementById('vz-concept'),stage=document.getElementById('vz-stage');
if(!node||!view||!stage)return;
let entry;try{entry=JSON.parse(node.textContent||'{}')}catch{return}
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const caption=document.getElementById('vz-preview-caption');
const setCaption=text=>{if(caption)caption.textContent=text};
const sourceLabel=entry.isOriginal?'Original functioning VELORYZ website template':entry.isUpstream?'Exact MIT upstream HTML (linked third-party images/assets may use their own licenses)':'Source-supplied media, not an invented VELORYZ website';
function showSourceImage(){
 view.replaceChildren();
 if(entry.image){
  const img=document.createElement('img');
  img.className='vz-real-source-image';img.src=entry.image;img.alt=entry.name+' — '+entry.imageLabel;
  img.decoding='async';img.loading='eager';img.referrerPolicy='no-referrer';
  img.addEventListener('error',()=>showUnavailable('The upstream image is not available. The source link and license information remain below.'),{once:true});
  view.append(img);
  const label=document.createElement('div');label.className='vz-real-image-label';label.textContent=entry.imageLabel;
  view.append(label);
  setCaption(entry.imageLabel);
 }else showUnavailable('This repository does not publish a verified screenshot or website image.');
}
function showUnavailable(message){
 const box=document.createElement('div');box.className='vz-real-unavailable';
 const k=document.createElement('span');k.textContent='SOURCE MEDIA / NOT AVAILABLE';
 const h=document.createElement('h2');h.textContent=entry.name;
 const p=document.createElement('p');p.textContent=message;
 box.append(k,h,p);view.replaceChildren(box);setCaption(message);
}
function loadOriginal(url,local){
 if(!url)return showSourceImage();
 // Sandbox means an imported template cannot read VELORYZ cookies, tokens or the parent DOM.
 const iframe=document.createElement('iframe');
 iframe.className='vz-real-iframe';
 iframe.title=(local?'Locally hosted source HTML: ':'Original live site: ')+entry.name;
 iframe.loading='eager';iframe.referrerPolicy='no-referrer';
 iframe.setAttribute('sandbox','allow-scripts allow-forms');
 iframe.setAttribute('allow','fullscreen');
 iframe.src=url;
 const frameLabel=document.createElement('div');frameLabel.className='vz-real-frame-label';
 frameLabel.textContent=local?sourceLabel:'Live upstream demo inside VELORYZ — external sites may block embedding';
 view.replaceChildren(iframe,frameLabel);
 setCaption(local?sourceLabel:'Original live demo; if the publisher blocks embedding, use Show source image.');
}
if(entry.localSource)loadOriginal(entry.localSource,true);else showSourceImage();
document.addEventListener('click',event=>{
 const btn=event.target.closest('[data-vz-device],[data-vz-show-image],[data-vz-launch-demo],[data-vz-reload]');
 if(!btn)return;
 if(btn.dataset.vzDevice){
  const size=btn.dataset.vzDevice;
  if(!['desktop','tablet','mobile'].includes(size))return;
  stage.dataset.vzDevice=size;
  document.querySelectorAll('[data-vz-device]').forEach(el=>el.setAttribute('aria-pressed',String(el===btn)));
  return;
 }
 if(btn.hasAttribute('data-vz-show-image'))showSourceImage();
 if(btn.hasAttribute('data-vz-launch-demo'))loadOriginal(entry.liveDemo,false);
 if(btn.hasAttribute('data-vz-reload'))loadOriginal(entry.localSource,true);
});
})();
