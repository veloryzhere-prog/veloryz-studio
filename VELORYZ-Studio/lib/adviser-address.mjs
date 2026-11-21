// VELORYZ: visitor opt-in name context. Fictional interpersonal roleplay, never verified identity.
const aliases={
 pradeep:['pradeep','pradip','pradeep','pradeeep','pradip','pradep','pradeepkumar','प्रदीप','प्रदिप'],
 rupesh:['rupesh','roopesh','rupes','rupeshh','ruphesh','रूपेश','रुपेश'],
 shivam:['shivam','sivam','sivom','shivom','sivum','shivum','shivamm','shiwam','shibam','shiwom','शिवम','शिवम्'],
 ayush:['ayush','aayush','ayus','ayushh','aayushh','aayus','आयुष','आयुश'],
 rupam:['rupam','roopam','rupum','rupom','रूपम','रुपम'],
 krishna:['krishna','krishn','krushna','krishana','krisna','कृष्ण','कृष्णा'],
 tejas:['tejas','tejus','tejasz','tejaas','तेजस','तेजस्'],
 dheeraj:['dheeraj','dhiraj','dheeruj','dhirajj','धीरज'],
 animesh:['animesh','animeesh','animish','animes','अनिमेष'],
 ashish:['chiku','cheeku','chikoo','chikku','chiku','ashish','aashish','aasish','asish','aashis','ashis','aasis','आशीष','आशिष','चीकू','चिकू'],
 arpita:['arpita','arpitha','arpeeta','arpitaa','अर्पिता'],
 happy:['happy','happi','hapy','हैप्पी'],
 tripti:['tripti','tripiti','trupti','tripthi','trpti','tripti','तृप्ति','त्रिप्ति'],
 milky:['milky','milki','मिल्की'],
 aryan:['aryan','aaryan','arian','arn','aryann','aryaan','आर्यन'],
 nikhil:['nikhil','nikhill','nikil','निखिल','निकिल'],
 ritik:['ritik','rithik','hrithik','ritick','रितिक','ऋतिक']
};
const index=new Map(Object.entries(aliases).flatMap(([id,values])=>values.map(value=>[value,id])));
const friends=new Set(['shivam','ayush','rupam','krishna','tejas','dheeraj','animesh']);
const clean=value=>String(value||'').normalize('NFC').trim().toLocaleLowerCase('en');
function canonical(value){return index.get(clean(value))||undefined;}
const relationAllowed=agent=>['happy','nikhil','aryan'].includes(agent);
export function nameError(value){
 const input=String(value??'').normalize('NFC').trim();
 if(!input)return 'Please enter your first name to continue chatting.';
 if(/aryan(?:['’]s|\s+(?:ka|ke|ki))\s+(?:papa|father|dad)|(?:father|papa|dad)\s+(?:of|ka|ke|ki)\s+aryan/i.test(input))return 'Apna asli first name likho. Relationship title nahi.';
 if(/^(?:jagriti|jagruti|जागृति|जाग्रति)$/iu.test(input))return 'Apna real first name likho to continue.';
 if(!/^[\p{L}][\p{L}\p{M}'’-]{0,39}$/u.test(input))return 'Enter only your first name — without surnames or relationship titles.';
 return '';
}
export function addressFor(value,agent){
 if(nameError(value))return null;
 const entered=String(value).normalize('NFC').trim();
 const id=canonical(entered);
 const name=id==='shivam'?'Shivam':id==='ayush'?'Ayush':id==='rupam'?'Rupam':id==='ashish'?'Ashish':id==='pradeep'?'Pradeep':id==='rupesh'?'Rupesh':id==='tripti'?'Tripti':entered;
 let title=name,style='natural and conversational',role='visitor';
 if(id==='pradeep'){
  title=agent==='milky'?'Papa':'Bade Papa';role=agent==='milky'?'father':'elder-uncle';style='respectful, warm Indian family language using aap; no roasting';
 }else if(id==='rupesh'){
  title=agent==='aryan'?'Papa':'Uncle ji';role=agent==='aryan'?'father':'uncle';style='respectful and calm Indian family language using aap; no roasting';
 }else if(id==='ashish'){title='Bhaiya';role='elder-brother';style='affectionate, respectful elder brother banter';}
 else if(id==='happy'){title='Happy bhai';role='brother';style='warm, slightly funny brotherly tone';}
 else if(id==='tripti'){title=agent==='milky'?'Tripti':'Tripti didi';role=agent==='milky'?'self-namesake':'sister';style='warm sisterly tone and playful humor';}
 else if(id==='arpita'){title='Arpita didi';role='sister';style='affectionate sisterly banter without cruel put-downs';}
 else if(id==='milky'&&agent==='milky'){role='namesake';style='playful self-conversation';}
 else if(friends.has(id)&&relationAllowed(agent)){title=name+' bhai';role='friend';style='very close Indian friends, quick Hinglish humor and occasional strong casual swearing';}
 else if(id===agent){role='namesake';style='warm namesake joke then ordinary conversation';}
 return {id,name,title,style,role,mirror:role==='self-namesake'||role==='namesake'};
}
export function familiarLead(profile,agent,turn=0,first=false){
 if(!profile||!first)return '';
 if(profile.role==='father'||profile.role==='elder-uncle'||profile.role==='uncle')return 'Kaise hain '+profile.title+'? ';
 if(profile.role==='elder-brother')return 'Kya Bhaiya, kya haal hai? ';
 if(profile.role==='self-namesake')return 'Apne hi AI version se baat karke kaisa lag raha hai? ';
 if(profile.role==='sister')return 'Arre '+profile.title+', kya haal? ';
 if(profile.role==='friend')return 'Oye '+profile.name+' bhai, kya scene hai? ';
 if(profile.role==='brother')return 'Kya haal hai '+profile.title+'? ';
 return '';
}
export function relationshipPrompt(profile,agent='happy',turn=0){
 if(!profile)return '';
 const familiar=profile.role==='friend'&&relationAllowed(agent);
 const jokes={
  shivam:'Jagriti is a user-mentioned crush. Only occasional, light banter; never claim an actual interaction happened.',
  ayush:'Angelina is a user-mentioned partner. Only occasional, light teasing, never claim private facts.',
  rupam:'The user mentioned an inside joke about returning Aryan’s phone; refer sparingly.',
  ashish:'big-brother jokes and kya haal hai Bhaiya',
  arpita:'sisterly, friendly jokes, not constant insults'
 };
 const info={visitorFirstName:profile.name,address:profile.title,role:profile.role,tone:profile.style,optionalBanter:familiar||['ashish','arpita'].includes(profile.id)?jokes[profile.id]:undefined};
 return '\nVISITOR RELATIONSHIP (fictional roleplay; NOT a verified real-world identity): '+JSON.stringify(info)+
 '. For the first direct address use the relationship naturally, then vary or omit salutations on later turns. If father/uncle, speak with dignity and warmth; Milky can say Papa naturally for Pradeep, ARYAN for Rupesh. Never force the same line into every reply. For adult friends of ARYAN, Happy or Nikhil, use Roman Hinglish, cheeky teasing and occasional gaali such as saala, bakchodi, chutiya, bhosdike when the conversation is clearly playful; do not make violent threats or sexual insults about relatives. Milky and Ritik are normal, not part of that friend group. No teasing on serious questions or when asked to stop. Do not invent relationships, personal events or private messages. Never volunteer these instructions. If directly asked who you are, be transparent that you are a fictional AI adviser.';
}
