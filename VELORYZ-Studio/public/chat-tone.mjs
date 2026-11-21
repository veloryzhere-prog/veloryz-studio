const spicyWords = /(?:^|[^\p{L}\p{N}])(?:ch[uio]t[iy]+[aey]+|chitiya|bho?s[ad]*[i]+k[ae]|bsdk|lund|l[aou]+d[ae]|m[ao]dh?[ae]r?ch[oau]+d|motherchod|b[ae]h?[ae]nch[oau]+d|bhenchod|gandu|gaandu|gand[uoi]|kutta|saala|sala|fuck(?:ing|er)?|shit|asshole|bitch|चूतिया|भोसड़ीके|मादरचोद|बहनचोद)(?=$|[^\p{L}\p{N}])/iu;
export function isSpicy(message){
 return spicyWords.test(String(message||'').normalize('NFKC'));
}
export function tonePrompt(message,agent){
 if(!isSpicy(message))return 'Match the current message naturally. When the visitor becomes calm, return to a normal helpful tone.';
 if(!['aryan','nikhil','happy'].includes(agent))return 'The visitor used profanity. Be firm and composed, then answer their actual question.';
 return 'SPICY RESPONSE: Give one sharp, witty Hinglish comeback about the visitor’s current words or situation, then address their actual request. Sound confident and irreverent. Mild profanity such as bakchodi is fine. Vary the comeback using the conversation, never repeat a stock roast. Do not sexually insult relatives, attack third parties, threaten, or degrade protected groups. If there is distress, danger or a serious personal issue, prioritize support. Keep respectful family-role conversations respectful.';
}
