'use strict';
/* Dependency-free three-page, vector PDF proposal created entirely in the browser.
   Budget and timeline are clearly marked as a client-side draft, not a quote. */
(function(){
 const W=595,H=842,INK=[.14,.18,.15],MUTED=[.46,.53,.48],TERRA=[.26,.45,.32],CREAM=[1,1,1],SOFT=[.958,.976,.957],WHITE=[1,1,1],LINE=[.88,.92,.88];
 const nums=c=>c.map(v=>Number(v).toFixed(3)).join(' ');
 function plain(value){
  return String(value??'').replace(/₹/g,'INR ').replace(/[–—−]/g,'-').replace(/[“”]/g,'"').replace(/[‘’]/g,"'")
  .normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[\x00-\x1f]/g,' ').replace(/[^\x20-\x7e]/g,'?');
 }
 function quote(value){return plain(value).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');}
 function textWidth(value,size){return plain(value).length*size*.51;}
 function wrap(value,width,size){
  const lines=[];for(const paragraph of String(value??'').split(/\n/)){
   if(!paragraph.trim()){lines.push('');continue;}
   let current='';
   for(const word of plain(paragraph).split(/\s+/)){
    if(!word)continue;
    if(!current){current=word;continue;}
    if(textWidth(current+' '+word,size)<=width)current+=' '+word;
    else{lines.push(current);current=word;}
   }
   if(current)lines.push(current);
  }
  return lines;
 }
 function page(){
  const cmd=[];
  return {
   cmd,
   rect(x,top,w,h,color){cmd.push(nums(color)+' rg '+x+' '+(H-top-h)+' '+w+' '+h+' re f');},
   line(x1,top1,x2,top2,color=LINE,width=1){cmd.push(nums(color)+' RG '+width+' w '+x1+' '+(H-top1)+' m '+x2+' '+(H-top2)+' l S');},
   text(txt,x,top,size=11,bold=false,color=INK){cmd.push('BT '+nums(color)+' rg /'+(bold?'F2':'F1')+' '+size+' Tf 1 0 0 1 '+x+' '+(H-top-size)+' Tm ('+quote(txt)+') Tj ET');},
   paragraph(txt,x,top,width=490,size=11,lineHeight=17,maxLines=30,color=MUTED,bold=false){
    const lines=wrap(txt,width,size);const display=lines.slice(0,maxLines);
    display.forEach((line,i)=>{this.text(line,x,top+i*lineHeight,size,bold,color);});
    return top+display.length*lineHeight;
   },
   footer(n,total=3){
    this.line(42,800,553,800,LINE,.7);
    this.text('VELORYZ STUDIO  /  PROJECT OUTLINE',42,810,8,true,MUTED);
    this.text('DRAFT - NOT A STUDIO QUOTATION',341,810,8,false,MUTED);
    this.text(String(n).padStart(2,'0')+' / '+String(total).padStart(2,'0'),515,810,8,true,INK);
   }
  };
 }
 function build(input){
  const b=input.brief||{},e=input.estimate||{},ref=input.reference,creator=input.creator||null;
  const formatMoney=v=>'INR '+Math.round(Number(v)||0).toLocaleString('en-IN');
  const now=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  const docs=[page(),page(),page(),...(creator?[page()]:[])];const p1=docs[0],p2=docs[1],p3=docs[2];
  // Cover and project definition
  p1.rect(0,0,W,H,CREAM);p1.rect(0,0,W,8,TERRA);p1.rect(42,35,8,8,TERRA);
  p1.text('VELORYZ / STUDIO',62,30,13,true,INK);
  p1.text('A PROJECT STARTS HERE',42,76,9,true,TERRA);
  p1.text('An idea,',40,102,40,true,INK);p1.text('made possible.',40,151,40,true,INK);
  p1.text('PERSONAL PROJECT OUTLINE     /     '+now.toUpperCase(),42,205,9,false,MUTED);
  p1.text('CLIENT-SIDE DRAFT - NOT A STUDIO QUOTATION',42,252,9,true,TERRA);
  p1.text('Your project at a glance.',42,278,23,true,INK);p1.line(42,322,553,322,LINE,1);
  const summary=[['PROJECT DIRECTION',b.purpose||'Portfolio'],['VISUAL DIRECTION',b.style||'Editorial'],['CORE PAGES',String(b.pages||4)],['PREFERRED LAUNCH',b.timeline||'Flexible']];
  summary.forEach((row,i)=>{
   const y=344+i*39;p1.text(row[0],45,y,9,true,MUTED);p1.paragraph(row[1],240,y-2,295,12,16,2,INK,true);
   if(i<3)p1.line(42,y+29,553,y+29,LINE,.55);
  });
  p1.text('THE OUTCOME WE ARE WORKING TOWARD',42,525,9,true,TERRA);
  p1.paragraph(b.goal||'Project goals will be shaped together during the studio discovery conversation.',42,548,510,11,17,10,INK);
  p1.rect(42,736,510,42,SOFT);
  p1.text('Your selected direction is a starting point, not a final specification.',55,749,10,false,INK);
  /* Footer added after all pages are assembled. */
  // Budget breakdown + materials
  p2.rect(0,0,W,H,CREAM);p2.rect(42,43,8,8,TERRA);p2.text('VELORYZ  /  SCOPE & BUDGET',61,38,10,true,MUTED);
  p2.text('Budget, explained.',42,86,29,true,INK);
  p2.text('Transparent planning assumptions. No hidden certainty.',42,126,11,false,MUTED);
  p2.rect(42,165,510,144,SOFT);
  p2.text('ILLUSTRATIVE PROJECT RANGE',60,184,10,true,TERRA);
  p2.text(formatMoney(e.low)+'  -  '+formatMoney(e.high),60,222,24,true,INK);
  p2.text('Upper range includes a planning contingency; the actual rate is configured by the studio.',60,276,9,false,MUTED);
  p2.text('WHAT MAKES UP THE RANGE',42,337,10,true,TERRA);
  const costs=[
   ['Starting point',e.base],['Additional pages beyond four',e.additionalPages],
   ['Selected feature allowances',e.featureAllowance],['Range contingency',e.contingency]
  ];
  costs.forEach((row,i)=>{const y=365+i*36;p2.text(row[0],46,y,11,false,INK);p2.text(formatMoney(row[1]),380,y,11,true,INK);p2.line(42,y+28,552,y+28,LINE,.7);});
  p2.rect(42,532,510,70,SOFT);
  p2.text('YOUR COMFORTABLE WORKING BUDGET',56,547,9,true,MUTED);
  p2.text(formatMoney(b.budget||50000),56,568,19,true,INK);
  p2.text('A preference, not a guaranteed cap or studio offer.',282,575,9,false,MUTED);
  p2.text('SELECTED FEATURES',42,626,10,true,TERRA);
  const feats=Array.isArray(b.features)&&b.features.length?b.features:['Core website planning'];
  feats.slice(0,7).forEach((feature,i)=>p2.text((i+1)+'.  '+feature,49,651+i*18,10,false,INK));
  p2.text('Provider costs, hosting, licenses, subscriptions and taxes are excluded.',42,766,9,false,MUTED);
  /* Footer added after all pages are assembled. */
  // Roadmap and next steps
  p3.rect(0,0,W,H,CREAM);p3.rect(42,43,8,8,TERRA);p3.text('VELORYZ  /  HOW WE GET THERE',61,38,10,true,MUTED);
  p3.text('The road ahead.',42,85,29,true,INK);p3.text('A suggested sequence, not a booked schedule.',42,126,11,false,MUTED);
  const roadmap=[
   ['01','Discovery','Goals, audience, materials and priorities.'],
   ['02','Written scope','Confirm deliverables, schedule, quote and payment terms.'],
   ['03','Design review','Direction, interface layouts and review decisions.'],
   ['04','Development & testing','Build the agreed scope and check quality.'],
   ['05','Handover','Delivery, launch guidance and agreed support.']
  ];
  roadmap.forEach((item,i)=>{
   const y=180+i*84;
   p3.rect(42,y,42,42,i%2?SOFT:INK);
   p3.text(item[0],52,y+10,15,true,i%2?INK:WHITE);
   p3.text(item[1],102,y-1,15,true,INK);
   p3.paragraph(item[2],102,y+25,440,10,15,3,MUTED);
   if(i<4)p3.line(102,y+62,553,y+62,LINE,.8);
  });
  p3.text('REFERENCE: '+(ref?.name||'To be agreed'),42,570,9,true,MUTED);
  p3.text('MATERIALS: '+((b.assets||[]).join(', ')||'To be discussed'),42,590,9,false,MUTED);
  p3.rect(42,615,510,154,SOFT);p3.text('BEFORE ANY PROJECT BEGINS',58,630,10,true,TERRA);
  p3.paragraph('CLIENT-SIDE DRAFT - NOT A STUDIO QUOTATION. Scope, schedule, total price, payment terms, final deliverables, hosting, third-party providers, licenses, taxes and support must be reviewed and confirmed in writing by VELORYZ Studio. No purchase or booking is created by this document.',58,653,477,10,17,7,INK);
  p3.text('Contact: veloryz.here@gmail.com   /   veloryz.online',58,744,9,true,INK);
  /* Footer added after all pages are assembled. */

  if(creator){
   const p4=docs[3];
   p4.rect(0,0,W,H,CREAM);p4.rect(42,43,8,8,TERRA);
   p4.text('VELORYZ  /  PRODUCT REQUIREMENTS',61,38,10,true,MUTED);
   p4.text('Your experience, defined.',42,85,28,true,INK);
   p4.text('A record of the selected ideas for the studio discovery conversation.',42,127,10,false,MUTED);
   const pairs=[['CATEGORY',creator.category||b.purpose||'To be discussed'],['STARTING POINT',ref?.name||'Original direction'],['VISUAL PALETTE',creator.palette||'To be discussed'],['PRIORITY',creator.priority||'Balanced quality and speed']];
   pairs.forEach(([key,value],i)=>{const y=169+i*41;p4.text(key,45,y,9,true,MUTED);p4.paragraph(value,235,y,305,10,14,2,INK,true);p4.line(42,y+28,553,y+28,LINE,.6);});
   p4.text('CAPABILITIES FOR STUDIO REVIEW',42,356,10,true,TERRA);
   const capabilities=Array.isArray(creator.features)?creator.features:(b.features||[]);
   capabilities.slice(0,16).forEach((feature,i)=>{const x=i<8?46:305,y=382+(i%8)*26;p4.rect(x,y+3,6,6,TERRA);p4.paragraph(feature,x+15,y,230,10,13,2,INK);});
   p4.line(42,612,553,612,LINE,.8);p4.text('REQUIREMENTS AND DECISIONS',42,624,10,true,TERRA);
   const answers=Object.entries(creator.answers||{}).filter(([name,v])=>String(v||'').trim()).slice(0,4);let y=648;
   for(const [key,value] of answers){const lines=wrap(key+': '+value,475,9).slice(0,2);lines.forEach((line,i)=>p4.text(line,46,y+i*13,9,false,INK));y+=Math.max(1,lines.length)*13+4;if(y>730)break;}
   if(creator.source&&!answers.length)p4.paragraph('External inspiration: '+creator.source,46,y,477,9,13,3,MUTED);
   p4.text('These selections are editable. Third-party licenses are not included.',42,764,9,false,MUTED);
  }
  docs.forEach((p,i)=>p.footer(i+1,docs.length));
  const objects=[];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids ['+docs.map((_,i)=>(5+i*2)+' 0 R').join(' ')+'] /Count '+docs.length+' >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  for(let i=0;i<docs.length;i++){
   const pageId=5+i*2,streamId=pageId+1,content=docs[i].cmd.join('\n')+'\n';
   objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+streamId+' 0 R >>');
   objects.push('<< /Length '+content.length+' >>\nstream\n'+content+'endstream');
  }
  let output='%PDF-1.4\n%VELORYZ\n',offsets=[0];
  objects.forEach((obj,i)=>{offsets.push(output.length);output+=(i+1)+' 0 obj\n'+obj+'\nendobj\n';});
  const xref=output.length;
  output+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
  offsets.slice(1).forEach(offset=>{output+=String(offset).padStart(10,'0')+' 00000 n \n';});
  output+='trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n';
  return new TextEncoder().encode(output);
 }
 function download(args){
  const content=build(args),blob=new Blob([content],{type:'application/pdf'}),url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='VELORYZ-Project-Proposal-Draft.pdf';link.style.display='none';
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 }
 globalThis.VeloryzProposal={build,download};
})();
