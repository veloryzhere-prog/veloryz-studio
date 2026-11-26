import {characterStyles,conversationName,characterPrompt,guideVoice} from './persona-behaviour-r35.mjs';
import {adviserPrompt,personas} from './adviser-personas.mjs';
import {addressFor} from './adviser-address.mjs';

// The hosted API validates the transcript and applies its quota before enabling inference.
export async function enhanceGuide(response,data,ai,loadState){
 if(!ai||!response.ok)return response;
 const guide=await response.clone().json();
 if(!guide.canUseStudioModel||guide.mode!=='guide')return response;
 try{
  const {state}=await loadState();
  if(!Object.hasOwn(characterStyles,data.agent)||!Array.isArray(data.messages)||data.messages.at(-1)?.role!=='user')return response;
  const profile=addressFor(conversationName(data.firstName,data.messages),data.agent);
  const system=adviserPrompt(data.agent,state,guide.handoff,data.messages,guide.extras?.page||'/')+characterPrompt(data.agent,data.messages,profile,data.firstNamed===true,state.site?.[data.agent+'Brief']);
  const result=await ai.run('@cf/meta/llama-3.1-8b-instruct',{messages:[{role:'system',content:system},...data.messages],max_tokens:650,temperature:characterStyles[data.agent].temperature});
  let answer=result?.response?.trim();
  if(!answer)return response;
  return Response.json({...guide,answer:answer.slice(0,4500),mode:'ai',available:true,behaviourVersion:'r35',agent:personas[data.agent].name,notice:'VELORYZ Studio AI · Responses may contain mistakes.'},{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  const code=String(error?.message||'').match(/\b[1-9][0-9]{3,5}\b/)?.[0]||'unavailable';
  return Response.json({...guide,studioInference:code},{headers:{'Cache-Control':'no-store'}});
 }
}
