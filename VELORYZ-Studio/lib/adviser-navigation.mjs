// Every suggested destination is a real, public VELORYZ route. No model-generated URL is trusted.
export const STUDIO_ROUTES=Object.freeze({
 '/':'Studio home','/work/':'View studio work','/design/':'Explore design directions',
 '/services/':'Explore services','/studio/':'Meet the studio','/teamjob/':'Meet the team',
 '/pricing/':'View starting prices','/create/':'Build a project brief','/client/':'Track your project in the Client Portal','/book/':'Request a discovery call',
 '/contact/':'Contact the studio','/process/':'How we work','/journey/':'Explore the project journey',
 '/developers/':'Integrations & development','/payments/':'Project payment information',
 '/motion/':'Motion playground','/velori/':'VELORI product','/veloryz/':'Studio platform'
});
const canonical=p=>typeof p==='string'&&Object.hasOwn(STUDIO_ROUTES,p)?p:'/';
const TOPICS=[
 {id:'client',words:/\b(track|tracking|progress|milestones?|client portal|existing project|already created|invitation code|project status)\b|ट्रैक|प्रगति/i,links:['/client/','/contact/'],next:['How do I access the Client Portal?','What is the difference between a project reference and an invitation code?','How can I contact the team about my current project?']},
 {id:'booking',words:/\b(book|appointment|meeting|schedule|consult|call|talk to a human|talk to staff)\b|बुक|मीटिंग|कॉल/i,links:['/book/','/contact/'],next:['How does the consultation work?','What should I prepare for the call?','Can I submit my project requirements?']},
 {id:'pricing',words:/\b(price|pricing|budget|cost|quote|afford|estimate|discount|charges?|payment plan)\b|कीमत|बजट|दाम/i,links:['/pricing/','/create/'],next:['What affects the final project cost?','Show me suitable design options','Help me prepare a cost-conscious brief']},
 {id:'project',words:/\b(build|create|develop|launch|project|website|web app|store|ecommerce|business idea|start a brand|portfolio)\b|प्रोजेक्ट|वेबसाइट/i,links:['/create/','/work/'],next:['Help me define the essential features','What would the first milestone be?','Which services should I choose?']},
 {id:'design',words:/\b(design|theme|ui|ux|aesthetic|logo|brand|graphic|colors?|visual|motion|animate)\b|डिज़ाइन|लोगो/i,links:['/design/','/work/'],next:['Suggest a visual direction for my brand','What does a design project include?','How can motion improve my website?']},
 {id:'technology',words:/\b(api|backend|database|code|bug|program|integration|hosting|deploy|server|supabase|typescript|react)\b|कोड|सर्वर/i,links:['/developers/','/create/'],next:['How would you structure this integration?','What information do you need to debug it?','Can this be part of a larger project?']},
 {id:'payment',words:/\b(invoice|receipt|checkout|pay|paid|refund|payment failed|transaction)\b|भुगतान|पेमेंट/i,links:['/payments/','/contact/'],next:['How are payment milestones handled?','I need to speak with the human studio','What should an invoice include?']},
 {id:'people',words:/\b(team|who (are|is)|founder|people|staff|aryan|happy|nikhil|milky|ritik)\b/i,links:['/teamjob/','/studio/'],next:['Tell me about the studio team','What are your core services?','How can I start working with VELORYZ?']},
 {id:'service',words:/\b(service|offer|what do you do|capabilit|what can you help|agency|studio|work with you)\b|सेवा|क्या करते/i,links:['/services/','/work/'],next:['Which service is right for me?','Show me relevant work','How do I get a proposal?']}
];
const PAGE_DEFAULTS={
 '/client/':{links:['/contact/','/create/'],next:['How do I activate my private workspace?','Where can I find project milestones?','What does my reference code mean?']},
 '/pricing/':{links:['/create/','/book/'],next:['Which option fits my budget?','What is included in the price?','Can we discuss a custom proposal?']},
 '/design/':{links:['/create/','/work/'],next:['Help me choose a design direction','How would this look for my brand?','What does customization cost?']},
 '/create/':{links:['/pricing/','/book/'],next:['What are the must-have features?','Can you review my project idea?','What should I do after this brief?']},
 '/book/':{links:['/services/','/contact/'],next:['What happens on the discovery call?','How do I prepare for a meeting?','Can I contact the studio directly?']},
 '/contact/':{links:['/services/','/book/'],next:['What information should I send?','Can I book a discovery call?','What services do you provide?']},
 '/services/':{links:['/work/','/create/'],next:['Which service is suitable for my project?','Show me related work','How do we begin?']},
 '/developers/':{links:['/create/','/book/'],next:['How would you build my integration?','Can you review an API plan?','What technical details do you need?']}
};
// Score complete intent, not the first regex match. Keep tech troubleshooting above sales;
// keep explicit quotations above mentions of future calls/meetings.
export function rankTopic(message){
 const value=String(message||'').trim().slice(0,1200);
 const scores=new Map();
 for(const topic of TOPICS){
  if(topic.words.test(value))scores.set(topic.id,1);
 }
 const boost=(id,n)=>scores.set(id,(scores.get(id)||0)+n);
 if(/\b(debug|bug|broken|crash|error|stack trace|fix (my|this)|doesn'?t work|not working|timeout|syntax error|deploy fail)\b/i.test(value))boost('technology',6);
 if(/\b(how much|cost|price|quote|quotation|budget|estimated price|pricing)\b|कितना|कीमत/i.test(value))boost('pricing',7);
 if(/\b(refund|payment failed|receipt|paid|invoice)\b/i.test(value))boost('payment',6);
 if(/\b(track|tracking|milestone|project progress|client portal|existing project|already created|project status)\b/i.test(value))boost('client',10);
 if(/\b(book a call|schedule a meeting|make an appointment|reserve|available time)\b/i.test(value))boost('booking',5);
 if(/\b(logo|brand identity|ui design|visual identity|colour palette|color palette)\b/i.test(value))boost('design',3);
 if(/\b(sell|selling|customers|conversion|launch my business)\b/i.test(value))boost('project',2);
 if(!scores.size)return null;
 return [...TOPICS].filter(t=>scores.has(t.id)).sort((a,b)=>scores.get(b.id)-scores.get(a.id)||TOPICS.indexOf(a)-TOPICS.indexOf(b))[0];
}
function greetingOnly(value){return /^(hi+|hey+|hello|yo|sup|namaste|namaskar|good (morning|evening)|how are you|how r u|how are u|kaise ho|kya haal hai|thanks|thank you|shukriya|bye|goodbye)[!?. ]*$/i.test(value);}
export function adviserNavigation(message,page='/',agent='happy'){
 const query=String(message||'').trim().slice(0,1200);
 const current=canonical(page);
 const casual=greetingOnly(query);
 const topic=casual?null:rankTopic(query); 
 const base=casual?{links:['/studio/','/services/'],next:['What can you help me with?','What does VELORYZ do?','Can I speak Hindi with you?']}:topic||PAGE_DEFAULTS[current]||{links:['/services/','/create/'],next:['What can VELORYZ help me build?','Show me examples of your work','How do I begin a project?']};
 const links=[...new Set(base.links)].filter(p=>p!==current).slice(0,2).map(path=>({label:STUDIO_ROUTES[path],url:path,action:'navigate'}));
 // ARYAN is a deliberate escalation option, not the initial adviser.
 const suggestions=[...base.next];
 if(agent!=='aryan'&&/\b(complex|difficult|critical|strategy|advanced|high stakes|escalat)\b/i.test(query))suggestions[2]='Bring in ARYAN for an executive review';
 const action=topic?.id==='booking'?{type:'open_booking_form',label:'Open consultation form'}:topic?.id==='project'?{type:'open_project_planner',label:'Open project planner'}:topic?.id==='payment'?{type:'open_contact',label:'Contact the studio'}:null;
 return {links,suggestions:suggestions.slice(0,3),action,topic:topic?.id||'general',page:current};
}
export function validStudioRoute(path){return typeof path==='string'&&Object.hasOwn(STUDIO_ROUTES,path);}
