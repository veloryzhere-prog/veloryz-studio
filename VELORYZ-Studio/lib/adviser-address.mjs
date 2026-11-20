const aliases = {
 pradeep:'pradeep pradip pradeep pradeeep प्रदीप प्रदिप',
 rupesh:'rupesh roopesh rupes रूपेश रुपेश',
 shivam:'shivam shivum shivamm शिवम शिवम्',
 ayush:'ayush aayush ayushh aayushh आयुष आयुश',
 rupam:'rupam roopam रूपम रुपम', krishna:'krishna krishn krushna krishana कृष्ण कृष्णा',
 tejas:'tejas tejus tejasz तेजस तेजस्', dheeraj:'dheeraj dhiraj dheeruj धीरज',
 animesh:'animesh animeesh animish अनिमेष', ashish:'chiku cheeku chikoo chiku ashish aashish aasish asish aashis आशीष आशिष चीकू चिकू',
 happy:'happy happi हैप्पी', tripti:'tripti tripiti trupti tripthi तृप्ति त्रिप्ति मिल्की milky',
 aryan:'aryan aaryan arian arn आर्यन', nikhil:'nikhil nikhill निकिल निखिल', ritik:'ritik rithik ऋतिक रितिक'
};
const friends=new Set(['shivam','ayush','rupam','krishna','tejas','dheeraj','animesh']);
export function addressFor(value,agent){
 const name=typeof value==='string'?value.normalize('NFC').trim().split(/\s+/u)[0]:'';
 if(!/^[\p{L}][\p{L}\p{M}'’-]{0,39}$/u.test(name))return null;
 const key=name.toLowerCase().normalize('NFD').replace(/(?<=[a-z])\p{M}+/gu,'').normalize('NFC');
 const id=Object.keys(aliases).find(id=>aliases[id].split(' ').includes(key));
 let title=name,style='natural and conversational';
 if(id===agent || id==='tripti'&&agent==='milky'){style='playful namesake; acknowledge the mirror once, then answer normally';}
 else if(id==='pradeep'||id==='rupesh'){
  title=id==='pradeep'&&agent==='milky'||id==='rupesh'&&agent==='aryan'?'Papa':id==='pradeep'?'Tauji':'Uncle ji';
  style='warm family respect throughout; use aap in Hindi and never roast this visitor';
 }else if(id==='ashish'){title=name+' Bhaiya';style='respectful elder-brother affection with light humor';}
 else if(id==='happy'){title=name+' bhai';style='warm brotherly conversation';}
 else if(id==='tripti'){title=name+' didi';style='warm sisterly conversation';}
 else if(friends.has(id)&&['aryan','happy','nikhil'].includes(agent)){title=name+' bhai';style='close Indian friends; use informal Hinglish and witty, occasionally sweary banter';}
 return {title,style,mirror:id===agent||id==='tripti'&&agent==='milky'};
}
