/* Shared, DOM-free planning rules. Estimates are illustrative, not quotations. */
(()=>{
 const purposes=['Portfolio','Ecommerce','Gaming','Editorial','SaaS / platform','Something else'];
 const pages=[1,4,6,8,12],timelines=['Flexible','Within 2 weeks','Within a month','Within 2–3 months'];
 const features=['Content management','Booking workflow','Payment integration','AI adviser','Member accounts','Motion direction'];
 const assets=['Brand identity','Written content','Images & media','Existing website'];
 const clean=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
 function normalize(value={}){
  if(!value||typeof value!=='object'||Array.isArray(value))value={};
  const unique=(items,allowed)=>[...new Set(Array.isArray(items)?items.filter(x=>allowed.includes(x)):[])];
  return {purpose:clean(value.purpose,60)||'Portfolio',pages:String(pages.includes(Number(value.pages))?Number(value.pages):4),timeline:timelines.includes(value.timeline)?value.timeline:'Flexible',features:unique(value.features,features),assets:unique(value.assets,assets),goal:clean(value.goal,1000),referenceId:/^[a-z0-9-]{1,90}$/.test(value.referenceId||'')?value.referenceId:''};
 }
 function estimate(value,reference,catalogue=[]){
  const brief=normalize(value);
  const candidates=Array.isArray(catalogue)?catalogue:[];
  const selected=reference||candidates.find(x=>x.id===brief.referenceId)||candidates.find(x=>x.category===brief.purpose);
  const price=Number(selected?.price),base=Number.isFinite(price)&&price>=1&&price<=10000000?Math.round(price):17999;
  const additionalPages=Math.max(0,Number(brief.pages)-4)*1500,featureAllowance=brief.features.length*2500;
  const low=base+additionalPages+featureAllowance;
  // A visible 25% contingency illustrates uncertainty; it is not a studio offer.
  const high=Math.ceil(low*1.25/500)*500;
  return {base,additionalPages,featureAllowance,low,high,contingency:high-low};
 }
 function format(value,reference,catalogue=[]){
  const b=normalize(value),e=estimate(b,reference,catalogue),money=v=>'₹'+Number(v).toLocaleString('en-IN');
  return ['Project direction: '+b.purpose,reference?'Design reference: '+clean(reference.name,160):'', 'Core pages: '+b.pages,'Features: '+(b.features.join(', ')||'Core website'),'Materials ready: '+(b.assets.join(', ')||'To discuss'),'Timeline preference: '+b.timeline,b.goal?'Project goal: '+b.goal:'','Illustrative planning range: '+money(e.low)+'–'+money(e.high)+'. Upper end includes a rounded 25% scope contingency.','Planning assumptions: up to 4 pages in the base, ₹1,500 per additional page, ₹2,500 per selected feature. Provider fees, licenses, hosting and taxes are excluded. Final scope and quote require studio review.'].filter(Boolean).join('\n');
 }
 function restore(raw){try{return normalize(JSON.parse(raw));}catch{return normalize();}}
 function goalError(goal){const s=clean(goal,1000);return s.length<10?'Tell us your main goal in at least 10 characters.':/[<>\x00-\x08\x0b\x0c\x0e-\x1f]/.test(s)?'Use plain text without angle brackets or control characters.':'';}
 globalThis.VeloryzPlanner={purposes,pages,timelines,features,assets,normalize,estimate,format,restore,goalError};
})();
