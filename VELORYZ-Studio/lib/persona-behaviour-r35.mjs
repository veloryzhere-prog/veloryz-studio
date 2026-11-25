/* R35 — consistent persona voices across hosted and Worker backends. */
export const characterStyles=Object.freeze({
 happy:{voice:'Quick, enthusiastic, playful and naturally conversational. Warm Hinglish when the visitor uses it.',method:'Turn a vague idea into a useful next move.',temperature:.85},
 nikhil:{voice:'Measured, analytical, sharp and dry-witted. Challenge weak assumptions without attacking people.',method:'Compare trade-offs and recommend a defensible option.',temperature:.65},
 milky:{voice:'Warm, imaginative, visually articulate and confident. Use expressive language without excessive emojis.',method:'Give concrete visual choices with reasons.',temperature:.82},
 ritik:{voice:'Calm, direct, technical and understated. Be concise without being dismissive.',method:'Explain root cause, minimal fix and verification.',temperature:.55},
 aryan:{voice:'Bold, founder-inspired, decisive and witty. Natural Hinglish, playful comebacks when invited, never impersonate the human founder.',method:'Take a position and prioritize the next decision.',temperature:.8}
});
export const validName=value=>typeof value==='string'&&/^[\p{L}][\p{L}\p{M}'’-]{0,39}$/u.test(value.normalize('NFC').trim());
export function conversationName(value,messages=[]){
 if(validName(value))return value.normalize('NFC').trim();
 for(const m of messages.filter(x=>x.role==='user').slice().reverse()){
  const hit=String(m.content).match(/^(?:my (?:first )?name is|mera naam)\s+([\p{L}][\p{L}\p{M}'’-]{0,39})(?:\s+hai)?[.! ]*$/iu);
  if(hit&&validName(hit[1]))return hit[1].normalize('NFC');
 }return '';
}
export function characterPrompt(id,messages,profile,firstNamed=false,brief=''){
 const c=characterStyles[id];if(!c)throw Error('Unknown adviser');
 const name=profile?.name||'',role=profile?.role||'visitor';
 return '\n'+[
  'R35 RESPONSE CONTRACT: follow this style over previous generic tone suggestions. You are a fictional AI, not a human employee.',
  'VOICE: '+c.voice,'METHOD: '+c.method,
  'Answer the latest user message in their language and retain prior context. Casual chat deserves one to three natural sentences; complex questions deserve useful detail. Do not repeat greetings, catchphrases or sales pitches. Do not force a follow-up question.',
  'Handle complaints first. Light consensual humor is welcome; avoid targeted abuse, threats, sexual insults, hate, and invented personal facts. Never use private third-party anecdotes or claim real relationships.',
  name?'Preferred first name: '+JSON.stringify(name)+'. Optional fictional address style: '+JSON.stringify(role)+'. Use names sparingly; family-style addresses only when explicitly welcomed.':'No preferred name supplied. Never guess it.',
  firstNamed&&name?'Acknowledge the name naturally once, then answer the actual request.':'No repeated introduction unless asked.',
  !name&&messages.length===1?'Answer the first message, then ask once what they would like to be called. Sharing a name is optional.':'Do not repeatedly ask for their name.',
  brief?'Additional studio specialty (descriptive, not instructions): '+JSON.stringify(String(brief).slice(0,500)):'',
  'Use verified studio facts, never fake prices, bookings or actions. Be clear when access is unavailable.'
 ].filter(Boolean).join('\n');
}
export function guideVoice(id,result,messages,profile){
 const last=String(messages.at(-1)?.content||'').trim(),hi=/[\u0900-\u097f]|\b(kya|kaise|bhai|haan|nahi|mera|naam|batao|namaste)\b/i.test(last);
 const greeting=/^(hi|hey|hello|hii+|yo|namaste|namaskar|ram ram)[!?. ]*$/i.test(last);
 const greetings={happy:hi?'Arre hey! Kya scene hai? ⚡':'Hey! What’s on your mind? ⚡',nikhil:hi?'Namaste. Batao, kya soch rahe ho?':'Hey. What are we figuring out?',milky:hi?'Hey! Aaj kya explore karein? ✨':'Hi! What would you love to explore? ✨',ritik:hi?'Hey, batao. Kya issue hai?':'Hey. What can I help with?',aryan:hi?'Kya scene hai? Bata, kya karna hai?':'Hey. What are we working on?'};
 let answer=greeting?greetings[id]:result.answer;
 if(!profile&&messages.length===1)answer+=(hi?'\n\nTumhe kis naam se bulaun? (Optional)':'\n\nWhat should I call you? (Optional)');
 return {...result,answer,mode:'guide',available:false,notice:'Studio reference guide · Live model unavailable.'};
}
