// A transparent, deterministic guide. It never impersonates a live model.
const money=n=>'₹'+Number(n).toLocaleString('en-IN');
export function studioGuide(agent,messages,state){
 const latest=messages.at(-1)?.content||'';
 const question=latest.toLowerCase().trim();
 const context=messages.filter(m=>m.role==='user').slice(-2).map(m=>m.content).join(' ').toLowerCase();
 const designs=(state.catalogue||[]).filter(x=>x.enabled).sort((a,b)=>a.price-b.price);
 const kind=/e.?commerce|online (?:shop|store)|sell|shopping/.test(context)?'commerce':/gam(?:e|ing)/.test(context)?'gaming':/blog|editorial|news/.test(context)?'editorial':/portfolio|personal/.test(context)?'portfolio':'';
 const selected=kind?designs.find(x=>(x.category+' '+x.name).toLowerCase().includes(kind))||designs[0]:designs[0];
 const handoff=messages.filter(m=>m.role==='user').length>=4||/human|person|refund|urgent|unresolved|still not|payment failed|security|breach|whatsapp/.test(question);
 const isHindi=/[\u0900-\u097F]/.test(latest)||/\b(kya|kaise|haan|nahi|bhai|acha|theek|thik|namaste|aur)\b/i.test(latest);
 const say=(en,hi)=>isHindi?(hi||en):en;
 let answer,links=[];
 if(/^(hi|hello|hey|hii+|yo|sup|what'?s up|namaste|namaskar|ram ram|good (morning|afternoon|evening))\b/.test(question)){
  answer=say(`${agent.name} here. Hey — what’s up?`,`Namaste, ${agent.name} yahan. Bolo, kya scene hai?`);
  return {answer,agent:agent.name,mode:'guide',available:false,handoff:false,links:[],notice:'Local studio guide · Not a live AI response.'};
 }
 if(/^(how are you|how r u|howre you|how are u|kaise ho|kese ho|kya haal hai|haal chal|aur sunao|sab theek|how's it going)\??$/.test(question)){
  const replies={
   aryan:say('Doing sharp, obviously 😎. What’s up with you?','Full form me hoon 😎. Tu bata, kya scene hai?'),
   happy:say('I’m doing pretty good 😊. How are you?','Main badhiya hoon 😊. Tum kaise ho?'),
   nikhil:say('Doing well, thanks. How about you?','Main theek hoon, shukriya. Aap kaise ho?'),
   milky:say('I’m in a good mood ✨. How are you doing?','Main achhe mood me hoon ✨. Tum kaise ho?'),
   ritik:say('All good here. What’s going on?','Sab theek hai. Batao, kya chal raha hai?')
  };
  answer=replies[agent.id]||say('Doing well. How are you?','Main theek hoon. Tum kaise ho?');
  return {answer,agent:agent.name,mode:'guide',available:false,handoff:false,links:[],notice:'Local studio guide · Not a live AI response.'};
 }
 if(handoff){answer=`The studio should review this with you directly. Share your goals and any project reference on WhatsApp +${state.site.phone}, or email ${state.site.email}. I cannot confirm appointments, payments or account changes.`;links=[{label:'Contact the studio',url:'/contact/'}];}
 else if(/offer|discount|coupon|sale/.test(question)){
  const t=Date.now(),offers=(state.offers||[]).filter(o=>o.kind==='offer'&&o.enabled&&(!o.startAt||Date.parse(o.startAt)<=t)&&(!o.endAt||Date.parse(o.endAt)>t));
  answer=offers.length?`The studio is currently sharing: ${offers.slice(0,2).map(o=>o.title+': '+o.body).join(' ')} Confirm eligibility and scope with the studio.`:'There is no published offer to quote right now. I can help you compare starting prices, or you can ask the studio for a proposal within your budget.';links=[{label:'View starting prices',url:'/pricing/'}];
 }else if(/book|consult|appointment|call|meeting/.test(question)){
  answer='Use the booking page to request a complimentary discovery conversation. Choose a preferred time in IST and describe your idea; your appointment is confirmed only after the studio responds.';links=[{label:'Request a discovery call',url:'/book/'}];
 }else if(/price|cost|budget|charge|afford|kitn|pricing|amount/.test(question)){
  answer=selected?`${kind?selected.name.split(' / ')[0]+' starts': 'Our published design adaptations start'} from ${money(selected.price)}. ${selected.scope.slice(0,2).join('; ')}. This is a starting estimate; backend complexity, provider costs and the agreed scope affect the final proposal.`:'Pricing depends on your pages, features and integrations. Use the planner for a brief, then request a scoped proposal.';links=[{label:'Compare pricing',url:'/pricing/'},{label:'Plan your project',url:'/create/'}];
 }else if(/timeline|how long|delivery|deadline|week|days/.test(question)){
  answer=selected?`The published planning window for ${selected.name.split(' / ')[0]} is ${selected.timeline}. The studio confirms delivery after reviewing content, integrations and scope; this is not a guaranteed completion date.`:'The studio agrees a delivery window after reviewing your scope and content.';links=[{label:'Discuss your timeline',url:'/book/'}];
 }else if(/velori/.test(question)){
  answer='VELORI is a VELORYZ product. Explore its studio page for the project, or visit the product through the link provided there. What would you like to build for your own audience?';links=[{label:'Meet VELORI',url:'/velori/'}];
 }else if(/payment|invoice|upi/.test(question)){
  answer='Payments follow an agreed proposal and individual payment request from the studio. Available methods depend on the hosted checkout provider. Never share a card number, password or UPI PIN in chat.';links=[{label:'Payment information',url:'/payments/'}];
 }else if(kind&&selected){
  answer=`For ${kind==='commerce'?'an online store':kind==='gaming'?'a gaming project':kind==='editorial'?'an editorial site':'a personal portfolio'}, ${selected.name.split(' / ')[0]} is a useful starting direction from ${money(selected.price)}. ${selected.scope.slice(0,2).join('; ')}. What features matter most to your idea?`;links=[{label:'Explore the designs',url:'/design/'},{label:'Create a brief',url:'/create/'}];
 }else if(/api|backend|database|integrat|develop|website|design|service|figma|brand/.test(question)){
  answer=`VELORYZ can help with ${state.services.map(s=>s.name).slice(0,4).join(', ')}. Start with your purpose, pages and must-have features so the studio can prepare a suitable scope. Do you need design, development, or both?`;links=[{label:'Explore services',url:'/services/'},{label:'Shape your brief',url:'/create/'}];
 }else if(/^(hi|hello|hey|hii|namaste)[ !.]*$/.test(question)){
  answer=agent.greeting||`Hi, I’m ${agent.name}. I can help with studio services, design directions, starting prices and booking. What would you like to create?`;links=[{label:'Explore designs',url:'/design/'}];
 }else{
  answer='I can help with published studio information about services, designs, starting prices and booking. For a custom or technical question, the studio can review the details with you on WhatsApp. What kind of project are you planning?';links=[{label:'Plan a project',url:'/create/'}];
 }
 return {answer:answer.slice(0,1400),agent:agent.name,mode:'guide',available:false,handoff,links,notice:'Studio guide reply · Live AI is temporarily unavailable. This answer uses published studio information.'};
}
