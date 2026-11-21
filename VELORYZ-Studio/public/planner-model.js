/* Shared, DOM-free planning rules. Estimates are illustrative, not quotations. */
(()=>{
 const purposes=['Portfolio','Ecommerce','Gaming','Editorial','SaaS / platform','Something else'];
 const pages=[1,4,6,8,12],timelines=['Flexible','Within 2 weeks','Within a month','Within 2–3 months'];
 const features=['Content management','Booking workflow','Payment integration','AI adviser','Member accounts','Motion direction','SEO foundations','Blog & publishing','Search & filters','Multilingual support','Email notifications','Admin dashboard','Product catalogue','Inventory management','Analytics dashboard','API integrations'];
 const assets=['Brand identity','Written content','Images & media','Existing website'];
 const styles=['Editorial','Minimal','Bold','Immersive'];
 const budgetRange={min:20000,max:300000,step:5000};
 const CATEGORY_BASES={"Business":17999,"Portfolio":17999,"Ecommerce":49999,"Agency":29999,"SaaS / platform":199999,"Restaurant":24999,"Editorial":22999,"Education":79999,"Community":79999,"Custom App":249999};
 const TECH_REVIEW=['Payment integration','Member accounts','API integrations','AI adviser','Admin dashboard','Inventory management'];
 const clean=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
 function normalize(value={}){
  if(!value||typeof value!=='object'||Array.isArray(value))value={};
  const unique=(items,allowed)=>[...new Set(Array.isArray(items)?items.filter(x=>allowed.includes(x)):[])];
  return {purpose:clean(value.purpose,60)||'Portfolio',pages:String(pages.includes(Number(value.pages))?Number(value.pages):4),timeline:timelines.includes(value.timeline)?value.timeline:'Flexible',features:unique(value.features,features),assets:unique(value.assets,assets),style:styles.includes(value.style)?value.style:'Editorial',budget:Number.isFinite(Number(value.budget))&&Number(value.budget)>=budgetRange.min?Math.round(Math.min(budgetRange.max,Math.max(budgetRange.min,Number(value.budget)))/budgetRange.step)*budgetRange.step:50000,goal:clean(value.goal,1000),referenceId:/^[a-z0-9-]{1,90}$/.test(value.referenceId||'')?value.referenceId:''};
 }
 function estimate(value,reference,catalogue=[],pricing={}){
  const clamp=(v,def,min,max)=>{const n=Number(v);return Number.isFinite(n)&&n>=min&&n<=max?Math.round(n):def;};
  const rule={base:clamp(pricing?.base,17999,1000,10000000),pageAllowance:clamp(pricing?.pageAllowance,1500,0,100000),featureAllowance:clamp(pricing?.featureAllowance,2500,0,100000),contingencyPct:clamp(pricing?.contingencyPct,25,0,100)};
  const brief=normalize(value);
  const candidates=Array.isArray(catalogue)?catalogue:[];
  const selected=reference||candidates.find(x=>x.id===brief.referenceId)||candidates.find(x=>x.category===brief.purpose);
  const price=Number(selected?.price),custom=Number(pricing?.categoryBases?.[brief.purpose]);
  const categoryBase=Number.isFinite(custom)&&custom>=1000&&custom<=10000000?Math.round(custom):brief.purpose==='Portfolio'||brief.purpose==='Business'?rule.base:CATEGORY_BASES[brief.purpose]||rule.base;
  const base=Number.isFinite(price)&&price>=1&&price<=10000000?Math.round(price):categoryBase;
  const additionalPages=Math.max(0,Number(brief.pages)-4)*rule.pageAllowance,featureAllowance=brief.features.reduce((sum,name)=>sum+({ 'SEO foundations':1500,'Search & filters':2000,'Email notifications':2000,'Analytics dashboard':2000,'Admin dashboard':3000,'API integrations':3500,'Inventory management':3000 }[name]??rule.featureAllowance),0);
  const low=base+additionalPages+featureAllowance;
  // A visible 25% contingency illustrates uncertainty; it is not a studio offer.
  const reviewItems=brief.features.filter(x=>TECH_REVIEW.includes(x));
  const high=Math.ceil(low*(1+rule.contingencyPct/100+Math.min(.3,reviewItems.length*.07))/500)*500;
  return {base,additionalPages,featureAllowance,low,high,contingency:high-low,reviewItems,category:brief.purpose};
 }
 function format(value,reference,catalogue=[]){
  const b=normalize(value),e=estimate(b,reference,catalogue),money=v=>'₹'+Number(v).toLocaleString('en-IN');
  return ['Project direction: '+b.purpose,reference?'Design reference: '+clean(reference.name,160):'', 'Core pages: '+b.pages,'Visual style: '+b.style,'Budget preference (not a quote): '+money(b.budget),'Features: '+(b.features.join(', ')||'Core website'),'Materials ready: '+(b.assets.join(', ')||'To discuss'),'Timeline preference: '+b.timeline,b.goal?'Project goal: '+b.goal:'','Illustrative planning range: '+money(e.low)+'–'+money(e.high)+'. Upper end includes a rounded 25% scope contingency.','Planning assumptions: up to 4 pages in the base, ₹1,500 per additional page, variable feature planning allowances from ₹1,500 to ₹3,500. Provider fees, licenses, hosting and taxes are excluded. Final scope and quote require studio review.'].filter(Boolean).join('\n');
 }
 function restore(raw){try{return normalize(JSON.parse(raw));}catch{return normalize();}}
 function goalError(goal){const s=clean(goal,1000);return s.length<10?'Tell us your main goal in at least 10 characters.':/[<>\x00-\x08\x0b\x0c\x0e-\x1f]/.test(s)?'Use plain text without angle brackets or control characters.':'';}
 globalThis.VeloryzPlanner={purposes,pages,timelines,features,assets,styles,budgetRange,normalize,estimate,format,restore,goalError};
})();
