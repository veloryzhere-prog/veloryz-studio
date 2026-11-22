/* Visible but light, hero-only moving particles.
   30 fps max, limited device-pixel ratio, no second WebGL scene and no global layout changes. */
(()=>{
'use strict';
const hero=document.querySelector('.vz-reference-site .vz-material-hero');
if(!hero)return;
const canvas=document.createElement('canvas');
canvas.id='vz-hero-particles';
canvas.setAttribute('aria-hidden','true');
hero.prepend(canvas);
const glow=document.createElement('div');
glow.id='vz-hero-pointer-field';
glow.setAttribute('aria-hidden','true');
hero.insertBefore(glow,canvas.nextSibling);
const ctx=canvas.getContext('2d',{alpha:true});
if(!ctx)return;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const media=matchMedia('(prefers-reduced-motion:reduce)');
const fine=matchMedia('(hover:hover) and (pointer:fine)');
const canMove=()=>window.StudioMotion
 ?window.StudioMotion.level==='full'
 :!media.matches;
const hash=i=>{
 const n=Math.sin(i*91.83+17.7)*42758.743;
 return n-Math.floor(n);
};
const points=[];
let w=0,h=0,dpr=1,visible=true,frame=0,lastTime=0,seconds=0,hover=false;
let mx=.71,my=.38,targetX=.71,targetY=.38;
function resize(){
 const rect=hero.getBoundingClientRect();
 const width=Math.round(rect.width),height=Math.round(rect.height);
 if(width<=0||height<=0)return;
 if(w===width&&h===height)return;
 w=width;h=height;
 dpr=Math.min(1.35,devicePixelRatio||1);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
 canvas.style.width=w+'px';canvas.style.height=h+'px';
 ctx.setTransform(dpr,0,0,dpr,0,0);
 const targetCount=Math.round(w*h/(fine.matches?19000:28500));
 const count=clamp(targetCount,fine.matches?32:19,fine.matches?58:32);
 points.length=0;
 for(let i=0;i<count;i++){
  points.push({
   x:hash(i*13.1+1),y:hash(i*7.9+6),
   vx:9+hash(i*2.9+5)*17,
   vy:-4+hash(i*5.1+3)*8,
   size:1.3+hash(i*8.3+4)*1.35,
   phase:hash(i*4.7+8)*Math.PI*2,
   color:i%5===0?'132,78,107':i%3===0?'117,87,94':'82,67,68'
  });
 }
 paint();
}
function paint(){
 if(!w||!h)return;
 ctx.clearRect(0,0,w,h);
 const moving=canMove()&&visible&&!document.hidden;
 const time=moving?seconds:0;
 const cx=mx*w,cy=my*h;
 // The particles traverse the hero, rather than only vibrating within 5 pixels.
 for(const p of points){
  let x=(p.x*w+time*p.vx)%w;
  let y=(p.y*h+time*p.vy+h)%h;
  const wave=Math.sin(time*.42+p.phase);
  x+=wave*10;y+=Math.cos(time*.36+p.phase)*11;
  if(moving&&hover){
   const dx=x-cx,dy=y-cy,dist=Math.hypot(dx,dy);
   if(dist>0&&dist<185){
    const magnitude=(1-dist/185)**2*42;
    x+=dx/dist*magnitude;y+=dy/dist*magnitude;
    if(dist<115){
     ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);
     ctx.strokeStyle='rgba(92,65,78,'+((1-dist/115)*.13).toFixed(3)+')';
     ctx.lineWidth=.75;ctx.stroke();
    }
   }
  }
  const pulse=.67+.33*Math.sin(time*.6+p.phase);
  const alpha=moving?.36+.34*pulse:.47;
  ctx.beginPath();ctx.arc(x,y,p.size,0,Math.PI*2);
  ctx.fillStyle='rgba('+p.color+','+alpha.toFixed(3)+')';
  ctx.fill();
  if(p.size>2.25){
   ctx.beginPath();ctx.arc(x,y,p.size*2.7,0,Math.PI*2);
   ctx.fillStyle='rgba('+p.color+',.048)';ctx.fill();
  }
 }
 glow.style.setProperty('--vz-px',(mx*100).toFixed(1)+'%');
 glow.style.setProperty('--vz-py',(my*100).toFixed(1)+'%');
}
function step(now){
 frame=0;
 if(!visible||document.hidden||!canMove()){lastTime=0;return;}
 // Explicit 30fps ceiling: main scroll/3D engines get the frame budget first.
 if(lastTime&&now-lastTime<33){
  frame=requestAnimationFrame(step);return;
 }
 const delta=lastTime?clamp((now-lastTime)/1000,0,.06):.033;
 lastTime=now;seconds+=delta;
 const easing=1-Math.exp(-delta*6.5);
 mx+=(targetX-mx)*easing;my+=(targetY-my)*easing;
 paint();
 frame=requestAnimationFrame(step);
}
function sync(){
 if(!canMove()||document.hidden||!visible){
  cancelAnimationFrame(frame);frame=0;lastTime=0;paint();return;
 }
 if(!frame)frame=requestAnimationFrame(step);
}
hero.addEventListener('pointermove',event=>{
 if(!fine.matches||event.pointerType==='touch')return;
 const r=hero.getBoundingClientRect();
 targetX=clamp((event.clientX-r.left)/Math.max(1,r.width),0,1);
 targetY=clamp((event.clientY-r.top)/Math.max(1,r.height),0,1);
 hover=true;
 if(!canMove()){mx=targetX;my=targetY;paint();}
},{passive:true});
hero.addEventListener('pointerleave',()=>{hover=false;targetX=.71;targetY=.38;});
document.addEventListener('visibilitychange',sync);
window.addEventListener('pageshow',sync);
window.StudioMotion?.addEventListener?.('change',sync);
media.addEventListener?.('change',sync);
if(typeof IntersectionObserver==='function'){
 new IntersectionObserver(entries=>{
  visible=entries.some(x=>x.isIntersecting);sync();
 },{threshold:.01}).observe(hero);
}
if(typeof ResizeObserver==='function')new ResizeObserver(()=>{resize();sync();}).observe(hero);
else window.addEventListener('resize',()=>{resize();sync();},{passive:true});
const brand=document.querySelector('.vz-official-header-brand img');
if(brand){
 // Keep the approved original colours; PNG backup only if WebP fails to load.
 let tried=false;
 brand.addEventListener('error',()=>{
  if(!tried){tried=true;brand.src='/assets/brand/official/Main-Dark-Ink-Transparent.png';}
  else{
   brand.hidden=true;
   if(!brand.parentNode.querySelector('.vz-brand-text-fallback')){
    const fallback=document.createElement('span');fallback.className='vz-brand-text-fallback';
    fallback.textContent='VELORYZ';brand.parentNode.append(fallback);
   }
  }
 });
}
resize();sync();
})();