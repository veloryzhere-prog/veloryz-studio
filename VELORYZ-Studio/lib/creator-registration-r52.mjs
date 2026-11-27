// R52.2: strict, versioned public Creator contract. No email, account or invoice side effects.
export const CONTRACT_VERSION=1;
export const PRICING_VERSION='creator-v4-20261127-v1';
const categories=['Business','Portfolio','Ecommerce','Agency','SaaS / platform','Restaurant','Editorial','Education','Community','Custom App'];
const styles=['Editorial','Minimal','Bold','Immersive','Luxury','Futuristic','Playful','Cinematic','Motion First','Brutalist'];
const pages=[1,4,6,8,12];
const features=['Content management','Booking workflow','Payment integration','AI adviser','Member accounts','Motion direction','SEO foundations','Blog & publishing','Search & filters','Multilingual support','Email notifications','Admin dashboard','Product catalogue','Inventory management','Analytics dashboard','API integrations'];
const assets=['Brand identity','Written content','Images & media','Existing website'];
const technologies=['Existing domain','Existing hosting','Existing backend','Existing database','Existing API','Authentication','Payment provider','Analytics','CMS','Third-party integrations'];
const timelines=['Flexible','Within 2 weeks','Within a month','Within 2–3 months'];
const templates=['studio','edit','works','collective','saas','gather','personal','book','journal','together','learn','product'];
const bases={'Business':17999,'Portfolio':17999,'Ecommerce':49999,'Agency':29999,'SaaS / platform':199999,'Restaurant':24999,'Editorial':22999,'Education':79999,'Community':79999,'Custom App':249999};
const specific={'SEO foundations':1500,'Search & filters':2000,'Email notifications':2000,'Analytics dashboard':2000,'Admin dashboard':3000,'API integrations':3500,'Inventory management':3000};
const technical=['Payment integration','Member accounts','API integrations','AI adviser','Admin dashboard','Inventory management'];
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function invalid(message,status=400){throw Object.assign(new Error(message),{status});}
function object(v,label){if(!v||typeof v!=='object'||Array.isArray(v))invalid('Check '+label+'.');return v;}
function string(v,max,label,required=false){if(v===undefined&&!required)return '';if(typeof v!=='string')invalid('Check '+label+'.');const s=v.trim().normalize('NFC');if(s.length>max||required&&!s||/[<>\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(s))invalid('Check '+label+' and its length.');return s;}
function choice(v,allowed,label,optional=false){if(optional&&(v===undefined||v===''))return '';if(!allowed.includes(v))invalid('Choose a valid '+label+'.');return v;}
function number(v,min,max,label){if(!Number.isInteger(v)||v<min||v>max)invalid('Check '+label+'.');return v;}
function list(v,max,label,allowed){if(v===undefined)return [];if(!Array.isArray(v)||v.length>max)invalid('Check '+label+'.');const out=v.map(x=>allowed?choice(x,allowed,label):string(x,160,label,true));if(new Set(out).size!==out.length)invalid('Remove duplicate '+label+'.');return out;}
function link(v,label){const s=string(v,1024,label);if(!s)return '';let u;try{u=new URL(s);}catch{invalid('Enter a valid '+label+'.');}if(!['https:','http:'].includes(u.protocol)||u.username||u.password||!u.hostname)invalid('Use a public HTTP or HTTPS '+label+'.');return u.href;}
export function normalizeSubmission(input){
 const x=object(input,'submission');
 if(x.contractVersion!==CONTRACT_VERSION||x.intent!=='create-project'||x.consent!==true||x.website)invalid('Check the project registration and consent.');
 const requestId=string(x.requestId,36,'submission identifier',true).toLowerCase();if(!uuid.test(requestId))invalid('Reload the Creator and try again.');
 const c=object(x.contact,'contact details'),b=object(x.brief,'project brief');
 const email=string(c.email,180,'email',true).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))invalid('Enter a valid email address.');
 const phone=string(c.phone,20,'phone');if(phone&&(!/^\+?[0-9 ()-]{8,20}$/.test(phone)||!/^\d{8,15}$/.test(phone.replace(/\D/g,''))))invalid('Enter a valid phone or leave it empty.');
 const category=choice(b.category,categories,'project category');
 const selectedFeatures=list(b.features,features.length,'features',features).sort();
 const goal=string(b.goal,1000,'project goal',true);if(goal.length<10)invalid('Describe the project goal in at least ten characters.');
 const referenceId=string(b.referenceId,90,'reference identifier');if(referenceId&&!/^[a-z0-9-]+$/.test(referenceId))invalid('Choose a valid design reference.');
 const answerInput=object(b.answers??{},'feature answers'),answers={};
 if(Object.keys(answerInput).length>features.length)invalid('Too many feature answers.');
 for(const key of Object.keys(answerInput).sort()){if(!selectedFeatures.includes(key))invalid('An answer refers to an unselected feature.');answers[key]=string(answerInput[key],300,'feature answer');}
 const extra=b.extraReferences??[];if(!Array.isArray(extra)||extra.length>3)invalid('Provide at most three additional references.');
 const pageCount=number(b.pages,1,12,'page count');if(!pages.includes(pageCount))invalid('Choose a supported page allowance.');
 const budgetPreference=number(b.budget,6000,1500000,'budget preference');
 const brief={category,template:choice(b.template,templates,'studio concept',true),style:choice(b.style,styles,'visual style'),palette:string(b.palette,100,'palette'),pages:pageCount,pageNames:list(b.pageNames,20,'page names'),features:selectedFeatures,answers,assets:list(b.assets,assets.length,'materials',assets).sort(),technologies:list(b.technologies,technologies.length,'technologies',technologies).sort(),motion:string(b.motion,100,'motion level'),timeline:choice(b.timeline,timelines,'timeline'),budgetPreference,priority:string(b.priority,160,'priority'),goal,businessName:string(b.businessName,160,'business name'),industry:string(b.industry,160,'industry'),businessStage:string(b.businessStage,160,'business stage'),businessDescription:string(b.businessDescription,1400,'business description'),audience:string(b.audience,1000,'audience'),technicalNotes:string(b.technicalNotes,1200,'technical notes'),notes:string(b.notes,1200,'notes'),external:string(b.external,300,'external inspiration'),referenceId,referenceRights:choice(b.referenceRights,['review','independent'],'source preference',true),reference:link(b.reference,'reference URL'),extraReferences:extra.map(v=>link(v,'reference URL')).filter(Boolean),materialLink:link(b.materialLink,'materials URL'),referenceLikes:list(b.referenceLikes,20,'reference qualities'),briefMode:choice(b.briefMode,['quick','detailed'],'brief mode'),promoRequested:b.promoRequested===true};
 return {contractVersion:CONTRACT_VERSION,intent:'create-project',requestId,consent:true,contact:{name:string(c.name,100,'name',true),email,phone,company:string(c.company,200,'company'),preferredContact:string(c.preferredContact,60,'contact preference')},brief};
}
function categoryForReference(ref){const x=String(ref.category||'').toLowerCase();if(/ecommerce|commerce|grocery|delivery|food|b2b|marketplace|shop/.test(x))return 'Ecommerce';if(/saas|fintech|dashboard|project management|tasks|kanban/.test(x))return 'SaaS / platform';if(/social|community/.test(x))return 'Community';if(/portfolio|creative/.test(x))return 'Portfolio';if(/agency|motion|components/.test(x))return 'Agency';if(/editorial|publish|blog|magazine/.test(x))return 'Editorial';if(/education|learning|lms/.test(x))return 'Education';return 'Business';}
export function calculateQuote(submission,published){
 // A trusted published revision is mandatory. No client-supplied totals, catalogue or promo prices.
 if(!published||!Number.isInteger(published.version)||published.version<0||!published.state?.site?.creatorPricing)invalid('Published pricing is temporarily unavailable.',503);
 const b=submission.brief,p=published.state.site.creatorPricing;
 const clamp=(v,def,min,max)=>Number.isFinite(Number(v))&&Number(v)>=min&&Number(v)<=max?Math.round(Number(v)):def;
 const rule={base:clamp(p.base,17999,1000,10000000),pageAllowance:clamp(p.pageAllowance,1500,0,100000),featureAllowance:clamp(p.featureAllowance,2500,0,100000),contingencyPct:clamp(p.contingencyPct,25,0,100)};
 let base=clamp(p.categoryBases?.[b.category],['Business','Portfolio'].includes(b.category)?rule.base:bases[b.category],1000,10000000),referenceStatus='not-selected',source='category';
 if(b.referenceId){
  const ref=(Array.isArray(published.state.catalogue)?published.state.catalogue:[]).find(x=>x.id===b.referenceId&&x.enabled===true);
  const restricted=ref&&(ref.rights==='restricted'||/NO LICENSE|CC BY-NC|RESTRICTED|PROPRIETARY|COMMONS CLAUSE/i.test(ref.license||''));
  if(b.referenceRights==='independent'||restricted)referenceStatus='independent-design';
  else if(ref&&categoryForReference(ref)===b.category&&Number.isInteger(ref.price)&&ref.price>=1&&ref.price<=10000000){base=ref.price;referenceStatus='published-reference';source='catalogue';}
  else referenceStatus='manual-reference-review';
 }
 const lines=[{code:'base',label:'Project planning allowance',amountPaise:base*100},{code:'additional-pages',label:'Additional page allowance',amountPaise:Math.max(0,b.pages-4)*rule.pageAllowance*100},...b.features.map(f=>({code:'feature',label:f,amountPaise:(specific[f]??rule.featureAllowance)*100}))];
 const lowPaise=lines.reduce((sum,x)=>sum+x.amountPaise,0),reviewItems=b.features.filter(x=>technical.includes(x)),highPaise=Math.ceil(lowPaise*(100+rule.contingencyPct+Math.min(30,reviewItems.length*7))/5000000)*50000;
 return {pricingVersion:PRICING_VERSION,publishedRevision:published.version,currency:'INR',kind:'indicative-estimate',status:'pending-review',source,referenceStatus,rules:rule,lines,lowPaise,highPaise,contingencyPaise:highPaise-lowPaise,reviewItems,promotionRequested:b.promoRequested,promotionApplied:false,taxesIncluded:false,amountDuePaise:0,notes:['Final scope, third-party fees, hosting, licenses and applicable taxes require review.','No payment is requested.','Marketplace references not present in the trusted published catalogue require manual price and rights review.']};
}
export async function fingerprint(submission){const bytes=new TextEncoder().encode(JSON.stringify(submission));const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');}
export async function readSubmission(request){
 if(!request.headers.get('content-type')?.toLowerCase().includes('application/json'))invalid('Send JSON.',415);
 const reader=request.body?.getReader();if(!reader)invalid('The submission is empty.');const chunks=[];let size=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>32768){await reader.cancel();invalid('Keep the structured brief below 32 KB.',413);}chunks.push(value);}}finally{reader.releaseLock();}
 const buffer=new Uint8Array(size);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.length;}
 let parsed;try{parsed=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));}catch{invalid('The submission could not be read.');}
 return normalizeSubmission(parsed);
}
