/* VELORYZ hero field — original procedural particles and pointer parallax.
   Canvas2D; no network, timers or additional GPU context. Uses existing Motion settings. */
(()=>{
'use strict';
const hero=document.querySelector('.vz-reference-site .vz-aurora-hero');
if(!hero)return;
const canvas=document.createElement('canvas');
canvas.id='vz-hero-particles';canvas.setAttribute('aria-hidden','true');
hero.prepend(canvas);
const glow=document.createElement('div');glow.id='vz-hero-pointer-field';glow.setAttribute('aria-hidden','true');
hero.insertBefore(glow,hero.children[1]);
const ctx=canvas.getContext('2d',{alpha:true});
if(!ctx)return;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const reducedMedia=matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
const allowed=()=>window.StudioMotion?window.StudioMotion.level==='full':!reducedMedia.matches;
let width=0,height=0,dpr=1,visible=true,frame=0,last=0,elapsed=0;
let px=.7,py=.32,tx=.7,ty=.32,hovering=false;
const sparks=[];
function pseudoRandom(seed){return(Math.sin(seed*127.1+21.73)*43758.5453)%1;}
function hash(n){let x=pseudoRandom(n);return x<0?x+1:x;}
function resize(){
 const rect=hero.getBoundingClientRect();
 const w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
 if(w===width&&h===height)return;
 width=w;height=h;dpr=Math.min(1.65,window.devicePixelRatio||1);
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
 canvas.style.width=width+'px';canvas.style.height=height+'px';
 ctx.setTransform(dpr,0,0,dpr,0,0);
 const count=Math.max(24,Math.min(finePointer.matches?74:32,Math.round(width*height/17500)));
 sparks.length=0;
 for(let i=0;i<count;i++)sparks.push({
  x:hash(i*9.97+3),y:hash(i*13.3+8),
  radius:0.7+hash(i*4.1+2)*1.7,
  phase:hash(i*21.2+9)*Math.PI*2,
  drift:.12+hash(i*16.3+4)*.3,
  speed:.23+hash(i*18.2+6)*.46
 });
 draw();
}
function draw(){
 ctx.clearRect(0,0,width,height);
 // A softly illuminated central atmospheric field, visible even with motion disabled.
 const aura=ctx.createRadialGradient(width*(.64+(px-.5)*.045),height*(.43+(py-.5)*.06),12,width*.64,height*.43,width*.65);
 aura.addColorStop(0,'rgba(227,114,119,.075)');
 aura.addColorStop(.5,'rgba(194,133,202,.035)');
 aura.addColorStop(1,'rgba(194,133,202,0)');
 ctx.fillStyle=aura;ctx.fillRect(0,0,width,height);
 const active=allowed()&&visible;
 const time=active?elapsed:0;
 for(const p of sparks){
  let x=(p.x+.005*Math.sin(time*.22+p.phase))*width;
  let y=(p.y+.008*Math.cos(time*p.drift+p.phase))*height;
  if(active&&hovering){
   const dx=x-px*width,dy=y-py*height,dist=Math.hypot(dx,dy);
   const reach=Math.max(160,Math.min(320,width*.32));
   if(dist<reach&&dist>1){
    const pressure=(1-dist/reach)**2;
    x+=dx/dist*pressure*18;
    y+=dy/dist*pressure*18;
   }
  }
  const twinkle=active?.65+.35*Math.sin(time*p.speed+p.phase):.68;
  ctx.beginPath();
  ctx.arc(x,y,p.radius*(.85+twinkle*.22),0,Math.PI*2);
  ctx.fillStyle='rgba(136,81,125,'+(0.14+Math.max(0,twinkle)*.42).toFixed(3)+')';
  ctx.fill();
  if(p.radius>1.8){
   ctx.beginPath();ctx.arc(x,y,p.radius*4.5,0,Math.PI*2);
   ctx.fillStyle='rgba(209,106,135,.028)';ctx.fill();
  }
 }
 const cx=px*width,cy=py*height;
 if(active&&hovering){
  const beam=ctx.createRadialGradient(cx,cy,5,cx,cy,Math.min(225,width*.35));
  beam.addColorStop(0,'rgba(224,94,114,.065)');
  beam.addColorStop(.5,'rgba(165,125,201,.025)');
  beam.addColorStop(1,'rgba(165,125,201,0)');
  ctx.fillStyle=beam;ctx.fillRect(cx-230,cy-230,460,460);
 }
 glow.style.setProperty('--vz-px',(px*100).toFixed(2)+'%');
 glow.style.setProperty('--vz-py',(py*100).toFixed(2)+'%');
}
function wake(){
 if(frame||!visible||document.hidden||!allowed())return;
 frame=requestAnimationFrame(render);
}
function render(t){
 frame=0;if(!visible||document.hidden||!allowed())return;
 const delta=last?clamp((t-last)/1000,0,.05):.016;last=t;
 elapsed+=delta;
 const alpha=1-Math.exp(-delta*5);
 px+=(tx-px)*alpha;py+=(ty-py)*alpha;
 draw();frame=requestAnimationFrame(render);
}
function sync(){
 if(!allowed()||document.hidden||!visible){
  cancelAnimationFrame(frame);frame=0;last=0;draw();return;
 }
 last=0;wake();
}
hero.addEventListener('pointermove',e=>{
 if(e.pointerType==='touch'||!finePointer.matches)return;
 const r=hero.getBoundingClientRect();
 tx=clamp((e.clientX-r.left)/Math.max(1,r.width),0,1);
 ty=clamp((e.clientY-r.top)/Math.max(1,r.height),0,1);
 hovering=true;
 if(!allowed())draw();
},{passive:true});
hero.addEventListener('pointerleave',()=>{hovering=false;tx=.7;ty=.32;});
window.StudioMotion?.addEventListener?.('change',sync);
document.addEventListener('visibilitychange',sync);
window.addEventListener('pageshow',sync);
reducedMedia.addEventListener?.('change',sync);
if(typeof IntersectionObserver==='function'){
 const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync();},{threshold:0.01});
 io.observe(hero);
}
if(typeof ResizeObserver==='function')new ResizeObserver(()=>{resize();sync();}).observe(hero);
else window.addEventListener('resize',()=>{resize();sync();},{passive:true});
resize();sync();
})();