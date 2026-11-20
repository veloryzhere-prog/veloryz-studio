import {adviserPrompt,personas} from './adviser-personas.mjs';
import {addressFor} from './adviser-address.mjs';

// The hosted API validates the transcript and applies its quota before enabling inference.
export async function enhanceGuide(response,data,ai,loadState){
 if(!ai||!response.ok)return response;
 const guide=await response.clone().json();
 if(!guide.canUseStudioModel||guide.mode!=='guide')return response;
 try{
  const {state}=await loadState();
  const profile=addressFor(data.firstName,data.agent);
  let system=adviserPrompt(data.agent,state,guide.handoff,data.messages,guide.extras.page);
  if(profile)system+=' Visitor address: '+JSON.stringify(profile.title)+'. Requested tone: '+profile.style+'. Use the address naturally. '+(profile.mirror&&data.firstNamed?'Open with a one-time joke about talking to your AI double.':'');
  system+=' If insulted, respond with a sharp, short situational roast and offer practical project help. Keep family interactions respectful.';
  const result=await ai.run('@cf/meta/llama-3.1-8b-instruct',{messages:[{role:'system',content:system},...data.messages],max_tokens:650});
  let answer=result?.response?.trim();
  if(!answer)return response;
  if(profile&&!answer.toLowerCase().includes(profile.title.toLowerCase()))answer=profile.title+', '+answer;
  return Response.json({...guide,answer:answer.slice(0,4500),mode:'ai',available:true,agent:personas[data.agent].name,notice:'VELORYZ Studio AI · Responses may contain mistakes.'},{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  const code=String(error?.message||'').match(/\b[1-9][0-9]{3,5}\b/)?.[0]||'unavailable';
  return Response.json({...guide,studioInference:code},{headers:{'Cache-Control':'no-store'}});
 }
}
