// Lifely original, deterministic everyday gameplay. All courtroom events are fictional.
const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
const tracks=[
 {name:'Science fair',focus:'knowledge',symbol:'⌬',goal:'Explain a new invention clearly'},
 {name:'Debate finals',focus:'confidence',symbol:'✦',goal:'Build a thoughtful case for an audience'},
 {name:'Arts showcase',focus:'creativity',symbol:'◈',goal:'Create a memorable group performance'},
 {name:'Sports day',focus:'health',symbol:'◉',goal:'Help the team compete fairly'},
 {name:'Community project',focus:'kindness',symbol:'♡',goal:'Coordinate a useful local project'}
];
const peerNames=['Avery Chen','Mika Reed','Noah Tan','Sofia Park','Riley Noor','Samira Vale','Leo Hart','Aria Costa'];
const twists=[
 'A teammate disappears before an important deadline.',
 'Someone repeats an incomplete version of a private conversation.',
 'A surprise opportunity arrives, but there is room for only one person.',
 'A personal worry has been hidden behind a cheerful smile.',
 'A mentor questions a decision everybody thought was settled.',
 'Another friend asks you to choose sides in an old disagreement.',
 'An unexpected schedule change tests everybody’s patience.',
 'A helpful stranger challenges one of your group’s assumptions.'
];
const bondTwists=[
 'Someone you both trust has misunderstood a private conversation.',
 'A long-hidden ambition comes to light.',
 'A major opportunity may change your shared plans.',
 'A promise from years ago has suddenly become important.',
 'An old rumor reappears and divides the people around you.',
 'Your companion asks for more independence than you expected.',
 'A sudden change tests how each of you handles uncertainty.',
 'An unexpected act of generosity changes the mood.'
];
const courtTwists=[
 'A witness recalls a previously unmentioned detail.',
 'A dated record conflicts with another account.',
 'The fictional judge requests a clearer timeline.',
 'A scheduled witness cannot attend the next session.',
 'The hearing pauses over a procedural question.',
 'A new document requires careful verification.',
 'One part of the record remains genuinely uncertain.',
 'A witness offers an explanation that changes the tone.'
];
const options={
 bond:[
  [['Listen to what matters','Understand their needs before responding','listen'],['Plan a small adventure','Build a new shared memory','adventure'],['Offer practical help','Be dependable when it counts','practical']],
  [['Invite their perspective','Give them space to explain a difficult moment','listen'],['Explore another possibility','Risk something different together','adventure'],['Set a kind boundary','Take responsibility without losing yourself','practical']],
  [['Promise a regular check-in','Follow through consistently','practical'],['Plan a new experience','Create a moment they may remember','adventure'],['Let them decide the next step','Offer attention and genuine autonomy','listen']]
 ],
 school:[
  [['Research the challenge','Find a foundation for the project','study'],['Organize the group','Bring classmates into a shared plan','team'],['Pitch an unexpected idea','Creativity brings risk and opportunity','creative']],
  [['Review the requirements','Adapt to the new school rules','study'],['Hear your classmate out','Resolve the conflict together','team'],['Try a fresh approach','Change the strategy before it is too late','creative']],
  [['Polish the evidence','Ensure the work is accurate','study'],['Practice as a team','Recover momentum through cooperation','team'],['Present something memorable','Stand out without ignoring the substance','creative']]
 ],
 court:[
  [['Check the case file','Compare fictional records for consistency','record'],['Request a fair review','Respect procedural safeguards','fairness'],['Prepare a clear timeline','Explain what is known and unknown','clarity']],
  [['Verify the statement','Avoid unsupported conclusions','record'],['Respect the witness','Maintain a fair, orderly proceeding','fairness'],['Explain the discrepancy','Keep calm when questioned','clarity']],
  [['Summarize documented facts','Present the information responsibly','record'],['Request careful consideration','Recognize uncertainty and due process','fairness'],['Speak with composure','Avoid exaggeration in a final statement','clarity']]
 ]
};
const phases={
 bond:['An invitation','An unexpected complication','An honest decision'],
 school:['Project kickoff','A surprising setback','The showcase'],
 court:['Case review','Witness examination','Closing statements']
};
export const emptyEverydayScenes=()=>({active:null,completed:[],callbacks:[],used:{},classmate:null,classmates:[]});
export function everydayState(s){return s.everydayScenes||emptyEverydayScenes();}
const ensure=s=>(s.everydayScenes??=emptyEverydayScenes());
const pick=(ctx,s,size)=>Math.floor(ctx.rng(s)*size);
const human=(s,id)=>s.people.find(p=>p.alive&&p.id===id);
const memory=(p,age,text)=>{p.memories??=[];p.memories.push({age,text});p.memories=p.memories.slice(-20);};
export function everydayCommands(s){
 if(!s.alive||s.pending!==null||s.mini||s.world?.network?.conversation||s.careerCampaigns?.active||s.everydayScenes?.active||(s.justice?.years||0)>0)return [];
 const e=everydayState(s),active=s.actions>0,out=[];
 if(s.age>=7)for(const p of s.people.filter(x=>x.alive&&x.age>=5).slice(0,9))
  out.push({id:'scene:start:bond:'+p.id,label:'Share an interactive day with '+p.name,detail:'Three decisions · surprises · relationship memories',enabled:active&&e.used['bond-'+p.id]!==s.age&&!s.justice?.case});
 if(s.age>=6&&s.age<=18)out.push({id:'scene:start:school',label:'Play a school-life challenge',detail:'Classmates · surprise setbacks · final showcase',enabled:active&&e.used.school!==s.age});
 if(s.age>=18&&s.justice?.case)out.push({id:'scene:start:court',label:'Enter the fictional courtroom',detail:'Three courtroom decisions · evidence · final verdict',enabled:active&&e.used.court!==s.age});
 for(const cb of e.callbacks||[])if(cb.status==='open'&&cb.dueAge===s.age)for(const index of [0,1])
  out.push({id:'scene:callback:'+cb.id+':'+index,label:index?'Set a boundary with '+cb.personName:'Reconnect with '+cb.personName,detail:cb.title+' · from age '+cb.startedAge,enabled:active});
 return out;
}
export function beginEveryday(s,id,ctx){
 if(!id.startsWith('scene:start:')||!everydayCommands({...s,actions:s.actions+1}).some(x=>x.id===id&&x.enabled))throw Error('This everyday scene is not available.');
 const e=ensure(s),parts=id.split(':'),type=parts[2];let person=null,track=null;
 if(type==='bond'){person=human(s,Number(parts[3]));if(!person)throw Error('Relationship unavailable.');}
 else if(type==='school'){
  track=tracks[pick(ctx,s,tracks.length)];
  if(!Array.isArray(e.classmates)||!e.classmates.length){
   const prior=e.classmate;
   const first=prior?Math.max(0,peerNames.indexOf(prior.name)):pick(ctx,s,peerNames.length);
   e.classmates=Array.from({length:4},(_,i)=>{
    if(i===0&&prior)return {...prior,id:'alum-0',history:(prior.history||[]).slice(-16),joinedAge:prior.joinedAge??s.age};
    return {id:'alum-'+i,name:peerNames[(first+i*3)%peerNames.length],trust:clamp(46+pick(ctx,s,14)),rivalry:clamp(11+pick(ctx,s,20)),
     preference:pick(ctx,s,3),joinedAge:s.age,history:[]};
   });
  }
  person=e.classmates[(e.schoolResults?.length||0)%e.classmates.length];
  e.classmate=person;
 }else if(type!=='court')throw Error('Unknown everyday scene.');
 const preference=type==='bond'?(person.world?.personality==='Restless'?1:person.world?.personality==='Pragmatic'?2:pick(ctx,s,3)):type==='school'?person.preference:pick(ctx,s,3);
 const a={id:'scene-'+type+'-'+s.age+'-'+(e.completed.length+1),type,startedAge:s.age,stage:0,personId:type==='bond'?person.id:null,classmateId:type==='school'?person.id:null,personName:person?.name||'Court officials',personRole:type==='bond'?person.role:type==='school'?'Classmate':'Fictional court',track:track?.name||null,trackFocus:track?.focus||null,preference,twist:pick(ctx,s,twists.length),momentum:48,trust:50,composure:58,evidence:42,tension:14,choices:[],last:null,score:0};
 e.active=a;e.used[type==='bond'?'bond-'+person.id:type]=s.age;
 ctx.add(s,'Started '+(type==='school'?'a school showcase':type==='bond'?'a meaningful day with '+a.personName:'a fictional courtroom hearing')+'.','activity');
 return a;
}
function prompt(a){
 if(a.type==='bond')return [
  a.personName+' has an important day ahead. What you do first will shape how the conversation unfolds.',
  bondTwists[a.twist]+' '+a.personName+' looks to you for a response.',
  a.personName+' wants to know what this relationship could become after today.'
 ][a.stage];
 if(a.type==='school')return [
  a.personName+' joins you to '+(tracks.find(t=>t.name===a.track)?.goal||'complete a school challenge').toLowerCase()+'. Your group needs a plan.',
  twists[a.twist]+' You must decide how the project and your classmates move forward.',
  'The showcase is here. Your teacher, classmates and '+a.personName+' are waiting for your final decision.'
 ][a.stage];
 return [
  'A fictional legal case is before the court. Begin with documented information and procedural fairness.',
  courtTwists[a.twist]+' The simulated hearing raises a new question.',
  'The fictional hearing reaches its final stage. The decision will be recorded in your life history.'
 ][a.stage];
}
export function everydayView(s){
 const a=everydayState(s).active;if(!a)return null;
 const stage=options[a.type]?.[a.stage];if(!stage)return null;
 return {id:a.id,type:a.type,title:{bond:'The relationship between us',school:a.track+' challenge',court:'The fictional hearing'}[a.type],
  stage:a.stage,round:a.stage+1,total:3,phase:phases[a.type][a.stage],prompt:prompt(a),
  personName:a.personName,personRole:a.personRole,track:a.track,twist:a.twist,
  meters:{momentum:a.momentum,trust:a.trust,composure:a.composure,evidence:a.evidence,tension:a.tension},
  options:stage.map(([label,note,tactic],index)=>({index,label,note,tactic})),
  last:a.last,history:a.choices.slice(),disclaimer:a.type==='court'?'Fictional game only. Not real legal advice or court procedure.':null};
}
const affinity={bond:['listen','adventure','practical'],school:['study','team','creative'],court:['record','fairness','clarity']};
export function replyEveryday(s,index,ctx){
 const e=ensure(s),a=e.active;if(!s.alive||!a)throw Error('No active everyday scene.');
 if(index==='leave'){
  if(a.type==='court')ctx.change(s,'stress',2);
  e.completed.push({...a,outcome:'interrupted',endedAge:s.age});e.completed=e.completed.slice(-45);e.active=null;return null;
 }
 if(!Number.isInteger(index)||index<0||index>2)throw Error('Choose one of the three scene responses.');
 const stage=options[a.type]?.[a.stage],option=stage?.[index];if(!option)throw Error('Invalid scene response.');
 const approach=option[2];
 const currentPreference=(a.preference+(a.stage===1?a.twist%3:a.stage===2?(a.choices.some(c=>c.success)?1:2):0))%3;
 const fitted=affinity[a.type][currentPreference]===approach;
 const relevant=a.type==='bond'?Math.round(((s.stats.social||40)+(s.stats.kindness||40))/2):
  a.type==='school'?s.stats[a.trackFocus]||45:Math.round(((s.stats.knowledge||45)+(s.stats.confidence||45))/2);
 const difficulty=a.twist%3===0?10:a.twist%3===1?4:0;
 const odds=clamp(43+(relevant-50)*.18+(fitted?23:-7)+(a.stage===2?a.momentum-50:0)*.10-difficulty,12,93);
 const succeeded=ctx.rng(s)*100<odds;
 a.momentum=clamp(a.momentum+(succeeded?13:-7)+(fitted?5:-2));
 a.composure=clamp(a.composure+(succeeded?4:-3)+(approach==='practical'||approach==='clarity'?2:0));
 a.trust=clamp(a.trust+(succeeded?9:-7)+(fitted?5:-1));
 a.tension=clamp(a.tension+(succeeded?-3:7)+(a.twist===5?3:0));
 if(a.type==='court')a.evidence=clamp(a.evidence+(succeeded?10:-2)+(approach==='record'?6:approach==='fairness'?3:1));
 if(a.type==='bond'){
  const p=human(s,a.personId);
  if(p){ctx.bond(s,p,succeeded?(fitted?7:3):-4,'Interactive relationship memory');if(p.world){p.world.trust=clamp(p.world.trust+(succeeded?4:-5));p.world.rivalry=clamp(p.world.rivalry+(succeeded?-2:5));}}
  ctx.change(s,succeeded?'happiness':'stress',succeeded?2:3);
 }else if(a.type==='school'){
  const p=e.classmates?.find(x=>x.id===a.classmateId)||e.classmate;if(p){p.trust=clamp(p.trust+(succeeded?5:-5));p.rivalry=clamp(p.rivalry+(succeeded?-2:6));}
  ctx.change(s,succeeded?'confidence':'stress',succeeded?2:3);
 }else ctx.change(s,succeeded?'confidence':'stress',succeeded?2:3);
 const reaction=a.personName+(succeeded?(fitted?' notices you understood what mattered.':' appreciates the effort, though the outcome surprised them.'):' reacts unexpectedly and asks you to reconsider your approach.');
 a.score+=(succeeded?2:0)+(fitted?1:0);
 a.last={index,stage:a.stage,success:succeeded,odds,signal:fitted?'Your approach fit this character’s priorities.':'The response did not fully fit their expectations.',reaction};
 a.choices.push({stage:a.stage,index,approach,success:succeeded,fit:fitted,odds});
 a.stage++;
 if(a.stage<3)return a.last;
 const grade=a.score>=7?'breakthrough':a.score>=4?'progress':a.score>=2?'complicated':'setback';
 const record={...a,endedAge:s.age,outcome:grade,successful:a.choices.filter(c=>c.success).length};
 if(a.type==='bond'){
  const p=human(s,a.personId);
  if(p){const ending=grade==='breakthrough'?'A shared turning point deepened the relationship.':grade==='setback'?'The day exposed unresolved tension.':'A complicated but memorable day changed the relationship.';memory(p,s.age,ending);}
  ctx.change(s,'social',grade==='breakthrough'?4:1);
 }else if(a.type==='school'){
  e.schoolResults??=[];e.schoolResults.push({id:a.id,age:s.age,track:a.track,score:a.score,grade,classmate:a.personName});e.schoolResults=e.schoolResults.slice(-30);
  ctx.change(s,a.trackFocus,grade==='breakthrough'?7:grade==='progress'?5:2);
  ctx.change(s,'knowledge',grade==='breakthrough'?4:1);
  if(grade==='breakthrough'&&s.club)s.club.level=Math.min(5,s.club.level+1);
  // Each school year changes the classmate's expectations; last year's best tactic may not work again.
  const graduatingPeer=e.classmates?.find(x=>x.id===a.classmateId)||e.classmate;
  if(graduatingPeer){graduatingPeer.preference=(graduatingPeer.preference+1+a.twist%3)%3;graduatingPeer.history??=[];graduatingPeer.history.push({age:s.age,track:a.track,grade});graduatingPeer.history=graduatingPeer.history.slice(-16);}
 }else{
  const preparation=clamp((a.evidence+a.composure+a.momentum)/3+Math.min(10,a.score));
  ctx.hearing(s,preparation);
  record.verdict=s.justice.history.at(-1)?.verdict||'Unresolved';
  record.courtPreparation=preparation;
 }
 e.completed.push(record);e.completed=e.completed.slice(-45);e.active=null;
 if(a.type==='bond'||a.type==='school'){
  e.callbacks.push({id:'callback-'+a.id,title:a.type==='bond'?'The day '+a.personName+' remembered':'The '+a.track+' reunion',type:a.type,startedAge:s.age,dueAge:s.age+(a.type==='school'?1:2),personId:a.personId,classmateId:a.classmateId,personName:a.personName,grade,status:'scheduled'});
  e.callbacks=e.callbacks.slice(-24);
 }
 ctx.add(s,(a.type==='court'?'Fictional courtroom concluded: '+record.verdict:a.type==='school'?a.track+' ended with '+grade:'Relationship day with '+a.personName+' ended with '+grade)+'.','milestone');
 return record;
}
export function everydayYear(s,ctx){
 const e=s.everydayScenes;if(!e?.callbacks?.length)return;
 for(const cb of e.callbacks){
  if(cb.status==='scheduled'&&s.age>=cb.dueAge){
   cb.status=s.age===cb.dueAge?'open':'expired';
   const p=cb.type==='bond'?human(s,cb.personId):(e.classmates?.find(x=>x.id===cb.classmateId)||e.classmate);
   if(!p||(!p.alive&&cb.type==='bond')){cb.status='expired';continue;}
   cb.message=cb.type==='bond'?
    cb.personName+' brings up your conversation from age '+cb.startedAge+'. They have their own interpretation of what happened.':
    cb.personName+' asks whether you remember the '+(cb.title.replace('The ','').replace(' reunion',''))+'. Your old project has opened another door.';
   const positive=['breakthrough','progress'].includes(cb.grade);
   if(cb.type==='bond'){ctx.bond(s,p,positive?2:-2,'An older conversation returned');}
   else {p.trust=clamp(p.trust+(positive?2:-2));ctx.change(s,'knowledge',positive?2:0);}
   ctx.add(s,cb.message,'people');
  }else if(cb.status==='open'&&s.age>cb.dueAge)cb.status='expired';
 }
}
export function everydayCallback(s,id,ctx){
 const e=ensure(s),parts=id.split(':'),index=Number(parts.at(-1)),key=parts.slice(2,-1).join(':');
 const cb=e.callbacks.find(x=>x.id===key);
 if(!cb||cb.status!=='open'||cb.dueAge!==s.age||!Number.isInteger(index)||index<0||index>1)throw Error('The old conversation is no longer available.');
 cb.status='resolved';cb.response=index;
 if(cb.type==='bond'){
  const p=human(s,cb.personId);
  if(p){ctx.bond(s,p,index===0?7:-2,'A remembered life decision');if(p.world)p.world.trust=clamp(p.world.trust+(index===0?5:-3));memory(p,s.age,index===0?'We reconnected after a long period apart.':'We agreed to maintain separate boundaries.');}
 }else {const peer=e.classmates?.find(x=>x.id===cb.classmateId)||e.classmate;if(peer){peer.trust=clamp(peer.trust+(index===0?7:-2));ctx.change(s,index===0?'knowledge':'stress',index===0?3:-2);}}
 ctx.add(s,(index===0?'Reconnected with ':'Kept a respectful distance from ')+cb.personName+' after a story from age '+cb.startedAge+'.','people');
 return cb;
}
export function everydayHistory(s){
 const e=everydayState(s);return {active:e.active,completed:(e.completed||[]).slice(-16).reverse(),callbacks:(e.callbacks||[]).slice(-12).reverse(),schoolResults:(e.schoolResults||[]).slice(-12).reverse(),classmate:e.classmate,classmates:(e.classmates||[]).slice()};
}
export function inheritEveryday(next,previous){
 const e=previous.everydayScenes;if(!e)return next;
 next.everydayScenes={...emptyEverydayScenes(),completed:(e.completed||[]).slice(-8).map(x=>({...x,inheritedFrom:previous.name})),callbacks:[]};
 return next;
}
