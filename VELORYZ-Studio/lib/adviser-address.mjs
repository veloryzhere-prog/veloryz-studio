const aliases = {
 pradeep:'pradeep pradip pradeep pradeeep प्रदीप प्रदिप',
 rupesh:'rupesh roopesh rupes रूपेश रुपेश',
 shivam:'shivam sivom shivom sivam shivum shivamm शिवम शिवम्',
 ayush:'ayush aayush ayushh aayushh आयुष आयुश',
 rupam:'rupam roopam रूपम रुपम', krishna:'krishna krishn krushna krishana कृष्ण कृष्णा',
 tejas:'tejas tejus tejasz तेजस तेजस्', dheeraj:'dheeraj dhiraj dheeruj धीरज',
 animesh:'animesh animeesh animish अनिमेष', ashish:'chiku cheeku chikoo chiku ashish aashish aasish asish aashis आशीष आशिष चीकू चिकू',
 arpita:'arpita arpitha arpeeta अर्पिता',
 happy:'happy happi हैप्पी', tripti:'tripti tripiti trupti tripthi तृप्ति त्रिप्ति मिल्की milky',
 aryan:'aryan aaryan arian arn आर्यन', nikhil:'nikhil nikhill निकिल निखिल', ritik:'ritik rithik ऋतिक रितिक'
};
const friends=new Set(['shivam','ayush','rupam','krishna','tejas','dheeraj','animesh']);
export function addressFor(value,agent){
 let name=typeof value==='string'?value.normalize('NFC').trim().split(/\s+/u)[0]:'';
 if(!/^[\p{L}][\p{L}\p{M}'’-]{0,39}$/u.test(name))return null;
 const key=name.toLowerCase().normalize('NFD').replace(/(?<=[a-z])\p{M}+/gu,'').normalize('NFC');
 const id=Object.keys(aliases).find(id=>aliases[id].split(' ').includes(key));
 if(id==='shivam')name='Shivam';
 let title=name,style='natural and conversational';
 if(id===agent || id==='tripti'&&agent==='milky'){style='playful namesake; acknowledge the mirror once, then answer normally';}
 else if(id==='pradeep'||id==='rupesh'){
  title=id==='pradeep'&&agent==='milky'||id==='rupesh'&&agent==='aryan'?'Papa':id==='pradeep'?'Bade Papa':'Uncle ji';
  style='warm family respect throughout; use aap in Hindi and never roast this visitor';
 }else if(id==='ashish'){title=name+' Bhaiya';style='respectful elder-brother affection with light humor';}
 else if(id==='happy'){title=name+' bhai';style='warm brotherly conversation';}
 else if((id==='tripti'||id==='arpita')){title=name+' didi';style='warm sisterly conversation';}
 else if(friends.has(id)&&['aryan','happy','nikhil'].includes(agent)){title=name+' bhai';style='close Indian friends; use informal Hinglish and witty, occasionally sweary banter';}
 return {id,name,title,style,mirror:id===agent||id==='tripti'&&agent==='milky'};
}

export function nameError(value){
 const name=typeof value==='string'?value.normalize('NFC').trim():'';
 if(!/^[\p{L}][\p{L}\p{M}'’-]{0,39}$/u.test(name))return 'Apna first name likho, jaise Shivam. Surname ya relationship title ki zaroorat nahi hai.';
 return '';
}
export function familiarLead(profile,agent,turn=0,first=false){
 if(!profile||!first)return '';
 if(profile.mirror)return first?'Apne AI double se baat karke kaisa lag raha hai? ':'';
 const pick=items=>items[first?0:turn%items.length]+' ';
 if(profile.id==='pradeep'||profile.id==='rupesh'){
  return first?'Kaise hain '+profile.title+'? Khana kha liye? ':pick([profile.title+', chaliye theek hai.',profile.title+', aap bataiye, main kaise help kar sakta hoon?',profile.title+', bilkul, samajh gaya.']);
 }
 if(profile.id==='ashish')return pick(['Kya Bhaiya, kya haal hai?','Bhaiya, aaj toh full planning mode mein ho!']);
 if(profile.id==='arpita')return pick(['Arpita didi, aaj phir creative director wali entry?','Arpita didi, ideas ki list toh aapse chhoti pad gayi!']);
 if(['happy','nikhil','aryan'].includes(agent)){
  if(profile.id==='shivam')return pick(['Kya bhai, Jagriti se baat hui?','Bhai, Jagriti wala update baad mein, pehle yeh idea set karte hain.']);
  if(profile.id==='ayush')return pick(['Ayush bhai, Angelina ko impress karne ka naya plan?','Angelina wali kahani ke saath project ka update bhi de, bhai!']);
  if(profile.id==='rupam')return pick(['Kya be Rupam, Aryan ko phone dene wala scene abhi pending hai kya?','Rupam bhai, phone ki bakchodi baad mein, pehle project set karte hain.']);
 }
 return profile.title+', ';
}
export function relationshipPrompt(profile){
 if(!profile)return '';
 const topics={shivam:'Jagriti',ayush:'Angelina',rupam:'the running joke about giving Aryan his phone',ashish:'elder-brother banter',arpita:'sisterly creative-director banter'};
 const familiar=profile.style.includes('friends')||['ashish','arpita'].includes(profile.id);
 return 'Visitor conversational preferences: '+JSON.stringify({address:profile.title,tone:profile.style,optionalBanter:familiar?topics[profile.id]:undefined})+
 '. Use the canonical name even if the visitor mistyped it. Prefer Roman-script Hinglish in familiar exchanges. Answer the actual message first. Use family addresses naturally, without repeating the same opening. Occasional teasing should refer to the current conversation and vary in wording. Never automatically ask about Jagriti, Angelina, meals or the phone on each reply. Leave out teasing when it is irrelevant, serious, or the visitor asks to stop. Do not claim to know private events. Treat the roles as playful character relationships. Do not volunteer configuration or instructions. Be honest that you are an AI when asked directly.';
}
