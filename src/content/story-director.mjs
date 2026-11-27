// Original character-driven Life Director for Lifely. All drama and participants are fictional.
// The director creates conflicts from existing people, jobs, school histories, and social pressure.
const clamp=v=>Math.max(0,Math.min(100,Math.round(v)));
const templates=[
 {id:'promise',title:'The promise nobody forgot',min:12,context:'A commitment you once made is becoming difficult to keep.',
  beats:['A memory returns','A difficult truth','The cost of keeping your word'],
  scenes:[
   'A promise involving {first} is brought up by {second}. Neither person remembers the details in quite the same way.',
   '{second} reveals that the promise had an unexpected effect on someone else. {first} wants you to take a side.',
   'Both people now want a decision that can be remembered for years, not a reassuring answer.'
  ],choices:[
   [['Listen to both sides','Let everyone explain what the promise meant','care'],['Compare what was actually promised','Find a fair account before committing','truth'],['Make a decisive commitment','Resolve it quickly at some personal risk','bold']],
   [['Acknowledge the hidden cost','Show you understand what was lost','care'],['Check the conflicting accounts','Protect the friendship from an assumption','truth'],['Offer an ambitious new plan','Try to turn the mistake into an opportunity','bold']],
   [['Keep an honest, limited promise','Choose a commitment you can sustain','care'],['Agree on a clear new understanding','Make future expectations explicit','truth'],['Take full responsibility publicly','Risk your reputation to settle the conflict','bold']]
  ]},
 {id:'rumor',title:'A story gets out of control',min:13,context:'A private story has spread beyond the people involved.',
  beats:['The first whisper','The missing detail','A public decision'],
  scenes:[
   '{second} hears a rumor about {first}. The story is incomplete, and everyone expects you to react.',
   'New information suggests the story may have been distorted. Your earlier response changed whom people trust.',
   '{first} and {second} disagree about whether to address the rumor openly or let it fade.'
  ],choices:[
   [['Protect their privacy','Avoid spreading unverified claims','care'],['Ask what really happened','Seek context without making accusations','truth'],['Confront the rumor directly','Risk an uncomfortable public discussion','bold']],
   [['Check on the person affected','Put their wellbeing first','care'],['Verify the missing information','Choose evidence over gossip','truth'],['Demand an explanation','Force a quick response in front of others','bold']],
   [['Repair the relationship privately','Offer a path forward without spectacle','care'],['Clarify the actual facts','Correct inaccuracies carefully','truth'],['Speak up in front of the group','Turn your reputation into a public defense','bold']]
  ]},
 {id:'credit',title:'Who deserves the credit?',min:16,context:'Shared work creates a dispute over recognition.',
  beats:['The invitation','The disputed contribution','The recognition decision'],
  scenes:[
   '{first} asks you to take part in a project. {second} believes their contribution has been ignored.',
   'A new deadline makes the conflict harder to avoid. Your own opportunity is now tied to the outcome.',
   'The group must decide who receives public recognition and who stays to finish the work.'
  ],choices:[
   [['Include the overlooked teammate','Protect trust by sharing the opportunity','care'],['Review the contributions fairly','Build a clear and verifiable account','truth'],['Take the lead yourself','Accept the spotlight and higher stakes','bold']],
   [['Rebalance the workload','Help everyone finish without resentment','care'],['Set clear responsibilities','Avoid another disagreement over expectations','truth'],['Push for an ambitious delivery','Make a bigger gamble for group recognition','bold']],
   [['Celebrate the whole team','Share credit even when it costs attention','care'],['Explain each contribution','Make the record clear and fair','truth'],['Pitch yourself for the lead','Risk relationships for personal advancement','bold']]
  ]},
 {id:'loyalty',title:'When friends choose sides',min:12,context:'Two people you know are no longer on speaking terms.',
  beats:['An uncomfortable invitation','The breaking point','What friendship means now'],
  scenes:[
   '{first} invites you somewhere, but {second} has been excluded after an argument.',
   'A third person shares a detail that neither friend mentioned. The disagreement is no longer simple.',
   '{first} and {second} are both watching to see whether you can stay fair without abandoning either person.'
  ],choices:[
   [['Make room for both friends','Protect the chance of reconciliation','care'],['Hear both accounts separately','Find the missing details without choosing sides','truth'],['Challenge the exclusion','Take a public stand that may divide the group','bold']],
   [['Offer a private conversation','Lower the temperature between them','care'],['Check what was misunderstood','Trace the conflict to its actual cause','truth'],['Set a firm deadline','Force a decision before the group fractures','bold']],
   [['Offer a lasting truce','Respect different needs and boundaries','care'],['Agree on a fair boundary','Stop the same argument from repeating','truth'],['Choose one clear position','Accept the reputational risk of taking sides','bold']]
  ]},
 {id:'money',title:'A favor with a hidden price',min:18,context:'An apparently generous offer could strain a relationship.',
  beats:['The generous offer','The uncomfortable condition','An independent future'],
  scenes:[
   '{first} proposes a financial favor. {second} is worried it will change how the group works together.',
   'The offer comes with an expectation nobody discussed at first. Another person may pay the cost.',
   'A decision about money is now also a decision about long-term trust.'
  ],choices:[
   [['Discuss everyone’s needs','Consider who benefits and who carries the risk','care'],['Ask for transparent terms','Understand the agreement before accepting','truth'],['Take the opportunity','Bet on an uncertain but potentially useful deal','bold']],
   [['Check on the affected person','Protect relationships before negotiating','care'],['Renegotiate the unclear condition','Make the arrangement fair and explicit','truth'],['Offer a more ambitious deal','Put more of your reputation at stake','bold']],
   [['Choose the sustainable option','Avoid leaving a friend with the risk','care'],['Document a fair agreement','Prevent a future dispute','truth'],['Back a bold new venture','Hope the opportunity changes your future','bold']]
  ]},
 {id:'family',title:'A family expectation changes',min:12,context:'People disagree about what the family should do next.',
  beats:['A surprising request','Two generations disagree','The family remembers'],
  scenes:[
   '{first} wants a change at home. {second} thinks the plan ignores somebody’s needs.',
   'A detail from your family history changes what seemed like a straightforward choice.',
   'The conversation has become a test of whether your family can disagree without breaking apart.'
  ],choices:[
   [['Make time for both relatives','Value the people affected by the plan','care'],['Separate facts from assumptions','Understand the real obstacles','truth'],['Take responsibility for the decision','Lead even without everyone’s approval','bold']],
   [['Support the person under pressure','Find a compassionate compromise','care'],['Ask about the earlier agreement','Learn how the family reached this point','truth'],['Suggest a radical alternative','Take an unexpected path despite resistance','bold']],
   [['Create a new family ritual','Invest in lasting connection','care'],['Set realistic expectations','Make the next promise easier to keep','truth'],['Lead the family toward change','Choose an ambitious but uncertain future','bold']]
  ]},
 {id:'mentor',title:'A mentor has doubts',min:15,context:'Someone more experienced sees promise but worries about your judgment.',
  beats:['The difficult advice','A test of independence','What the lesson became'],
  scenes:[
   '{first} offers guidance on something important to you. {second} thinks you deserve more independence.',
   'Your mentor questions a choice you made. The advice may be useful, but it also carries personal bias.',
   'You must decide whether to preserve the old relationship or define your own approach.'
  ],choices:[
   [['Listen for the real concern','Show respect without surrendering your goals','care'],['Test the advice objectively','Separate useful experience from opinion','truth'],['Prove yourself with a challenge','Take responsibility for a difficult test','bold']],
   [['Invite honest feedback','Allow criticism without turning it into conflict','care'],['Study what actually worked','Learn from the results instead of the personalities','truth'],['Defend your own judgment','Risk the relationship for independence','bold']],
   [['Thank the people who helped','Build an ongoing relationship','care'],['Explain what you learned','Make your next steps transparent','truth'],['Pursue your own path','Choose uncertainty in exchange for autonomy','bold']]
  ]},
 {id:'second-chance',title:'The rival offers a second chance',min:17,context:'A rival offers cooperation for reasons nobody fully trusts.',
  beats:['An offer from the other side','A test of motives','The alliance or the rivalry'],
  scenes:[
   '{first} has competed with you before. Now {second} wants you to consider working together.',
   'A surprise opportunity tests whether your rival has changed, or merely changed tactics.',
   'Your response could turn a rivalry into an alliance—or leave both people more determined than before.'
  ],choices:[
   [['Ask what has changed','Give people room to grow without being naive','care'],['Verify the proposed conditions','Protect yourself with a clear understanding','truth'],['Accept the high-risk partnership','Take the opportunity before it disappears','bold']],
   [['Offer a small trial collaboration','Build trust through limited steps','care'],['Review earlier conflicts','Learn why the last arrangement failed','truth'],['Challenge them to prove it','Test the rival directly','bold']],
   [['Keep a respectful alliance','Let cooperation develop at its own pace','care'],['Agree on fair ground rules','Prevent old disputes returning','truth'],['Compete on new terms','Make the rivalry an exciting but uncertain path','bold']]
  ]}
];
export const emptyStoryDirector=()=>({version:1,active:null,queue:[],completed:[],echoes:[],news:[],recentThemes:[],lastStartAge:null,seen:0});
export function storyDirectorState(s){return s.world?.storyDirector||emptyStoryDirector();}
const ensure=s=>{s.world??={};return s.world.storyDirector??=emptyStoryDirector();};
const npcPool=s=>{
 const alumni=(s.world?.autonomy?.alumni||[]).filter(p=>p&&p.name).map(p=>({id:p.id,name:p.name,kind:'alumni',trust:p.trust??50,rivalry:p.rivalry??10}));
 const family=(s.people||[]).filter(p=>p.alive&&p.age>=8).map(p=>({id:'person-'+p.id,name:p.name,kind:p.role||'person',trust:p.world?.trust??p.bond??50,rivalry:p.world?.rivalry??0}));
 const actors=s.age>=18?[...(s.world?.characters?.athletes||[]).slice(0,3),...(s.world?.characters?.agents||[]).slice(0,2)].map(p=>({id:p.id,name:p.name,kind:'professional',trust:p.trust??p.respect??50,rivalry:p.rivalry??10})):[];
 return [...alumni,...family,...actors].filter(p=>p.id&&p.name).slice(0,18);
};
const getNpc=(s,id)=>{
 if(id.startsWith('person-'))return (s.people||[]).find(p=>'person-'+p.id===id&&p.alive);
 return [...(s.world?.autonomy?.alumni||[]),...(s.world?.characters?.athletes||[]),...(s.world?.characters?.agents||[])].find(p=>p.id===id);
};
const clampStat=(s,key,amount,ctx)=>{ctx.change(s,key,amount);};
function npcInfluence(s,id,trust,rivalry,why,ctx){
 const p=getNpc(s,id);if(!p)return;
 if(p.bond!==undefined)ctx.bond(s,p,trust,why);
 if(p.world){if(Number.isFinite(p.world.trust))p.world.trust=clamp(p.world.trust+trust);if(Number.isFinite(p.world.rivalry))p.world.rivalry=clamp(p.world.rivalry+rivalry);}
 if(Number.isFinite(p.trust))p.trust=clamp(p.trust+trust);
 if(Number.isFinite(p.rivalry))p.rivalry=clamp(p.rivalry+rivalry);
 if(Array.isArray(p.history)){p.history.push({age:s.age,kind:'life-director',event:why});p.history=p.history.slice(-18);}
 if(Array.isArray(p.memories)){p.memories.push({age:s.age,text:why});p.memories=p.memories.slice(-20);}
}
function pickTheme(s,ctx,people){
 const possible=templates.filter(t=>s.age>=t.min&&(t.id!=='second-chance'||people.some(p=>p.rivalry>=35))&&(t.id!=='family'||people.some(p=>['parent','sibling','partner','child','grandparent'].includes(p.kind))));
 const d=ensure(s),recent=d.recentThemes||[];
 const weights=possible.map(t=>{
  let v=recent.includes(t.id)?0.16:1;
  if(t.id==='credit'&&(s.job||s.business||s.profession))v*=2.5;
  if(t.id==='money'&&(s.debt>1000||s.business))v*=2.8;
  if(t.id==='family'&&s.goal==='family')v*=1.6;
  if(t.id==='loyalty'&&s.world?.autonomy?.links?.some(e=>e.rivalry>55))v*=2.2;
  if(t.id==='second-chance'&&people.some(p=>p.rivalry>55))v*=2.4;
  if(t.id==='mentor'&&s.age<=27)v*=1.7;
  return v;
 });
 let total=weights.reduce((a,b)=>a+b,0),pos=ctx.rng(s)*total;
 for(let i=0;i<possible.length;i++){pos-=weights[i];if(pos<=0)return possible[i];}
 return possible.at(-1);
}
function makeEpisode(s,ctx){
 const d=ensure(s);const people=npcPool(s);if(people.length<2)return;
 const theme=pickTheme(s,ctx,people);if(!theme)return;
 let first=people[Math.floor(ctx.rng(s)*people.length)];
 let rivals=people.filter(p=>p.id!==first.id).sort((a,b)=>(b.rivalry||0)-(a.rivalry||0));
 let second=ctx.rng(s)<.48?rivals[0]:people[Math.floor(ctx.rng(s)*people.length)];
 if(!second||second.id===first.id)second=people.find(p=>p.id!==first.id);
 if(!second)return;
 if(theme.id==='family'&&!['parent','sibling','partner','child','grandparent'].includes(first.kind)){
  first=people.find(p=>['parent','sibling','partner','child','grandparent'].includes(p.kind))||first;
  if(first.id===second.id)second=people.find(p=>p.id!==first.id);
 }
 const older=d.completed?.filter(x=>x.firstId===first.id||x.secondId===second.id).at(-1);
 const num=(d.seen||0)+1;
 const episode={id:'director-'+s.generation+'-'+s.age+'-'+num,theme:theme.id,title:theme.title,age:s.age,
  firstId:first.id,firstName:first.name,secondId:second.id,secondName:second.name,
  firstKind:first.kind,secondKind:second.kind,phase:0,choices:[],score:50,tension:clamp(20+(first.rivalry+second.rivalry)/3),
  clarity:clamp(30+(s.stats.knowledge-40)/4),trust:clamp((first.trust+second.trust)/2),status:'ready',
  previous:older?older.title:null,last:null};
 d.queue.push(episode);d.queue=d.queue.slice(-4);d.seen=num;d.lastStartAge=s.age;
 d.recentThemes=[...d.recentThemes,theme.id].slice(-4);
 const message=first.name+' and '+second.name+': '+theme.title.toLowerCase()+'.';
 d.news.push({age:s.age,text:message,kind:'invitation'});d.news=d.news.slice(-50);
 ctx.add(s,'A personal story has begun: '+message,'people');
 return episode;
}
export function storyDirectorYear(s,ctx){
 if(s.age<12)return;
 const d=ensure(s);
 // Clear stale offers without blocking the clock.
 for(const e of d.queue.filter(x=>s.age-x.age>1)){
  e.status='expired';
  const independent=ctx.rng(s)<.52?'resolved the disagreement without you':'grew further apart while you stayed away';
  e.independentResolution=e.firstName+' and '+e.secondName+' '+independent+'.';
  const repair=independent.startsWith('resolved');
  npcInfluence(s,e.firstId,repair?2:-3,repair?-1:4,e.independentResolution,ctx);
  npcInfluence(s,e.secondId,repair?2:-3,repair?-1:4,e.independentResolution,ctx);
  d.completed.push({...e,outcome:'unanswered',endedAge:s.age});
  d.queue=d.queue.filter(x=>x.id!==e.id);
  d.news.push({age:s.age,text:e.independentResolution,kind:'independent'});
  ctx.add(s,e.independentResolution,'people');
 }
 for(const echo of d.echoes){
  if(echo.status!=='scheduled'||s.age<echo.dueAge)continue;
  echo.status='resolved';echo.resolvedAge=s.age;
  const positive=echo.outcome==='reconciled'||echo.outcome==='clarified';
  npcInfluence(s,echo.firstId,positive?3:-3,positive?-2:3,'A past decision returned: '+echo.title,ctx);
  npcInfluence(s,echo.secondId,positive?2:-2,positive?-1:2,'An old conflict left a lasting mark',ctx);
  clampStat(s,positive?'happiness':'stress',positive?3:2,ctx);
  echo.text=positive?echo.firstName+' and '+echo.secondName+' still remember the agreement you reached.':echo.firstName+' and '+echo.secondName+' are still dealing with what happened.';
  d.news.push({age:s.age,text:echo.text,kind:'aftereffect'});ctx.add(s,echo.text,'people');
 }
 d.echoes=d.echoes.slice(-20);d.completed=d.completed.slice(-30);d.news=d.news.slice(-50);
 const never=d.lastStartAge===null||d.lastStartAge===undefined;
 if(s.age%3===0&&(never||s.age-d.lastStartAge>=3)&&d.queue.length===0&&ctx.rng(s)<(never?1:.77)){
  makeEpisode(s,ctx);
 }
}
export function storyDirectorCommands(s){
 if(!s.alive||s.pending!==null||s.mini||s.world?.network?.conversation||s.careerCampaigns?.active||s.everydayScenes?.active||s.world?.storyDirector?.active||(s.justice?.years||0)>0)return [];
 const d=storyDirectorState(s);const available=s.actions>0;
 return d.queue.filter(x=>x.status==='ready'&&x.age===s.age).map(x=>({id:'episode:start:'+x.id,label:'Enter the story: '+x.title,
  detail:x.firstName+' and '+x.secondName+' · 3 interactive choices',enabled:available}));
}
export function startStoryDirector(s,id){
 const command='episode:start:'+id;
 if(!storyDirectorCommands({...s,actions:s.actions+1}).some(c=>c.id===command&&c.enabled))throw Error('Story invitation is not available.');
 const d=ensure(s),e=d.queue.find(x=>x.id===id);
 if(!e)throw Error('Unknown story.');
 e.status='playing';d.active=e;d.queue=d.queue.filter(x=>x.id!==id);
 return e;
}
function withActors(text,e){return text.replaceAll('{first}',e.firstName).replaceAll('{second}',e.secondName);}
export function storyDirectorView(s){
 const d=storyDirectorState(s),e=d.active;if(!e)return null;
 const theme=templates.find(t=>t.id===e.theme);const choices=theme.choices[e.phase];
 const pressure=e.tension>=70?'High tension':e.trust>=65?'An opening for trust':'An uncertain relationship';
 return {id:e.id,title:e.title,theme:e.theme,phase:e.phase,round:e.phase+1,total:3,
  lead:e.firstName,other:e.secondName,headline:theme.beats[e.phase],prompt:withActors(theme.scenes[e.phase],e),
  backstory:(e.previous?'An earlier story with these characters involved '+e.previous+'. ':theme.context+' ')+
   ((s.civicMandates?.completed||[]).findLast(t=>
    t.leaderA===e.firstId||t.leaderA===e.secondId||
    t.leaderB===e.firstId||t.leaderB===e.secondId)?
    (()=>{const t=(s.civicMandates?.completed||[]).findLast(t=>
      t.leaderA===e.firstId||t.leaderA===e.secondId||
      t.leaderB===e.firstId||t.leaderB===e.secondId);
      return 'Their organizations previously disputed '+t.issue+
       ' and the resolution was '+t.ending+'. ';})():'')+
   ((s.publicAftermath?.threads||[]).find(t=>
    t.aId===e.firstId||t.aId===e.secondId||t.bId===e.firstId||t.bId===e.secondId)?
    (()=>{const t=(s.publicAftermath?.threads||[]).find(t=>
      t.aId===e.firstId||t.aId===e.secondId||t.bId===e.firstId||t.bId===e.secondId);
     return 'An old '+t.mode+' involving '+t.aName+' and '+t.bName+
      ' evolved into '+t.kind+' and remains unresolved. ';})():'')+
   ((s.playableEvents?.completed||[]).findLast(x=>
    x.leaderA===e.firstId||x.leaderA===e.secondId||
    x.leaderB===e.firstId||x.leaderB===e.secondId)?
    (()=>{const old=(s.playableEvents?.completed||[]).findLast(x=>
      x.leaderA===e.firstId||x.leaderA===e.secondId||
      x.leaderB===e.firstId||x.leaderB===e.secondId);
     return 'A public '+old.mode+' previously ended '+old.ending+'. ';})():'')+
   ((s.organizationNetwork?.completed||[]).findLast(x=>
    x.initialA===e.firstId||x.initialA===e.secondId||
    x.initialB===e.firstId||x.initialB===e.secondId)?
    (()=>{const old=(s.organizationNetwork?.completed||[]).findLast(x=>
       x.initialA===e.firstId||x.initialA===e.secondId||
       x.initialB===e.firstId||x.initialB===e.secondId);
     return 'Two organizations previously faced '+old.ending+' during a public gathering. ';})():'')+
   ((s.socialCircles?.completed||[]).findLast(x=>x.personId===e.firstId||x.personId===e.secondId)?
    (()=>{const old=(s.socialCircles?.completed||[]).findLast(x=>x.personId===e.firstId||x.personId===e.secondId);
      return old.personName+' remembers the '+old.kind+' circle conflict that ended '+old.ending+'. ';})():'')+
   ((s.socialInfluence?.completed||[]).findLast(x=>x.personId===e.firstId||x.personId===e.secondId)?
    (()=>{const echo=(s.socialInfluence?.completed||[]).findLast(x=>x.personId===e.firstId||x.personId===e.secondId);
     return echo.name+' remembers a reputation-driven decision ending '+echo.ending+'. ';})():'')+
   ((s.competingFutures?.completed||[]).findLast(x=>x.personId===e.firstId||x.personId===e.secondId)?
    (()=>{const c=(s.competingFutures?.completed||[]).findLast(x=>x.personId===e.firstId||x.personId===e.secondId);
     return c.personName+' and the player previously faced '+c.title.toLowerCase()+' ending in '+c.ending+'. ';})():'')+
   ((s.npcAmbitions?.active||[]).find(x=>x.personId===e.firstId||x.personId===e.secondId)?
    (()=>{const plan=(s.npcAmbitions?.active||[]).find(x=>x.personId===e.firstId||x.personId===e.secondId);
     return plan.name+' is pursuing '+plan.goal.toLowerCase()+' with '+plan.progress+'% progress. ';})():'')+
   ((s.crossroads?.completed||[]).filter(x=>[e.firstId,e.secondId].some(id=>x.aId===id||x.bId===id)).at(-1)?
    (()=>{const c=(s.crossroads?.completed||[]).filter(x=>[e.firstId,e.secondId].some(id=>x.aId===id||x.bId===id)).at(-1);
     return 'Their wider social circle remembers '+c.aName+' and '+c.bName+' and an outcome of '+c.ending+'. ';})():'')+
   ((s.fate?.completed||[]).filter(x=>x.personId===e.firstId||x.personId===e.secondId).at(-1)?
    (()=>{const f=(s.fate?.completed||[]).filter(x=>x.personId===e.firstId||x.personId===e.secondId).at(-1);
     return f.personName+' remembers how your story, '+f.title+', ended '+f.ending+'. ';})():'')+
  ((s.emotional?.threads||[]).filter(x=>x.personId===e.firstId||x.personId===e.secondId).at(-1)?
   (()=>{const m=(s.emotional?.threads||[]).filter(x=>x.personId===e.firstId||x.personId===e.secondId).at(-1);
    return m.personName+' remembers your conversation at age '+m.sourceAge+', when they felt '+m.originalOutcome+'.';})():''),

  pressure,meters:{trust:e.trust,tension:e.tension,clarity:e.clarity,score:e.score},
  options:choices.map(([label,note,tactic],index)=>({index,label,note,tactic})),
  last:e.last,transcript:e.choices.slice()};
}
function returnMemory(e,outcome,s,ctx){
 const d=ensure(s);const echo={id:'echo-'+e.id,title:e.title,firstId:e.firstId,secondId:e.secondId,
  firstName:e.firstName,secondName:e.secondName,startedAge:s.age,dueAge:s.age+2,outcome,status:'scheduled'};
 d.echoes.push(echo);d.echoes=d.echoes.slice(-20);
 return echo;
}
export function storyDirectorReply(s,index,ctx){
 const d=ensure(s),e=d.active;if(!e||e.status!=='playing'||!s.alive)throw Error('No active social story.');
 if(index==='leave'){
  e.status='completed';e.outcome='walked away';e.endedAge=s.age;
  d.completed.push({...e});d.completed=d.completed.slice(-30);d.active=null;
  npcInfluence(s,e.firstId,-2,2,'You withdrew from '+e.title,ctx);
  return e;
 }
 if(!Number.isInteger(index)||index<0||index>2)throw Error('Choose one of the three social responses.');
 const theme=templates.find(t=>t.id===e.theme);
 const choice=theme?.choices[e.phase]?.[index];if(!choice)throw Error('Unknown story choice.');
 const tactic=choice[2],skill=tactic==='care'?s.stats.kindness:tactic==='truth'?s.stats.knowledge:s.stats.confidence;
 // Hidden relationship needs change after each turn: repeated tactics cannot guarantee victory.
 const preferred=(e.theme==='rumor'||e.theme==='credit')?'truth':e.theme==='loyalty'||e.theme==='family'?'care':'bold';
 const context=(e.choices.filter(c=>c.success).length+e.tension+e.age+e.phase)%3;
 const preference=e.phase===0?preferred:e.phase===1?['care','truth','bold'][context]:e.choices.some(c=>c.tactic==='bold')?'care':e.clarity<50?'truth':'bold';
 const bonus=tactic===preference?19:-5;
 const chance=clamp(35+skill*.37+(e.trust-50)*.15-(e.tension-30)*.25+bonus+(tactic==='bold'?5:0),11,92);
 const success=ctx.rng(s)*100<chance,tradeoff=tactic==='bold'?3:tactic==='care'?1:0;
 e.score=clamp(e.score+(success?12:-8)+(tactic===preference?3:0));
 e.trust=clamp(e.trust+(success?8:-6)+(tactic==='care'?4:tactic==='bold'?-3:0));
 e.tension=clamp(e.tension+(success?-5:10)+tradeoff);
 e.clarity=clamp(e.clarity+(tactic==='truth'?(success?12:4):success?4:-2));
 const reaction=success?(tactic==='bold'?e.firstName+' likes your conviction, but '+e.secondName+' worries you rushed.':
   tactic==='care'?e.secondName+' feels heard, while '+e.firstName+' wonders if you are avoiding the issue.':
   'Both people appreciate the clarity, even if the truth is uncomfortable.'):
   tactic==='bold'?e.secondName+' is upset that you pushed too quickly.':
   tactic==='care'?e.firstName+' thinks you missed an important practical issue.':
   e.secondName+' questions the evidence you presented.';
 const message=reaction;
 e.last={phase:e.phase,index,tactic,choice:choice[0],success,chance,preference,feedback:message};
 e.choices.push({...e.last});
 const firstDelta=tactic==='bold'?(success?7:-4):tactic==='care'?(success?3:-2):(success?4:-3);
 const secondDelta=tactic==='bold'?(success?-3:-6):tactic==='care'?(success?7:-1):(success?3:-3);
 npcInfluence(s,e.firstId,firstDelta,firstDelta>=0?-2:4,choice[0]+' in '+e.title,ctx);
 npcInfluence(s,e.secondId,secondDelta,secondDelta>=0?-2:4,'The group navigated '+e.title,ctx);
 clampStat(s,success?'social':'stress',success?2:3,ctx);
 if(tactic==='truth')clampStat(s,'knowledge',success?2:1,ctx);
 if(tactic==='care')clampStat(s,'kindness',1,ctx);
 if(tactic==='bold')clampStat(s,'confidence',success?3:-1,ctx);
 e.phase++;
 if(e.phase<3)return e.last;
 const good=e.choices.filter(x=>x.success).length;
 const outcome=good>=2&&e.trust>=53?'reconciled':e.clarity>=62?'clarified':e.tension>=63?'fractured':'complicated';
 e.status='completed';e.outcome=outcome;e.endedAge=s.age;
 const positive=outcome==='reconciled'||outcome==='clarified';
 if(e.theme==='credit'||e.theme==='mentor'||e.theme==='second-chance'){
  if(s.job)clampStat(s,'performance',positive?5:-2,ctx);
  if(s.profession&&Number.isFinite(s.profession.metric))s.profession.metric=clamp(s.profession.metric+(positive?3:-1));
 }else if(e.theme==='money'){
  if(s.business)s.business.demand=clamp((s.business.demand??50)+(positive?5:-4));
  // Financial agreements change business demand; the separate financial-skill system is untouched.
 }else if(e.theme==='family'||e.theme==='loyalty')clampStat(s,'happiness',positive?5:-3,ctx);
 else clampStat(s,'reputation',positive?4:-3,ctx);
 returnMemory(e,outcome,s,ctx);
 d.completed.push({...e});d.completed=d.completed.slice(-30);d.active=null;
 const report=e.firstName+' and '+e.secondName+': '+e.title+' ended '+outcome+'. The consequences may return in two years.';
 d.news.push({age:s.age,text:report,kind:'ending'});d.news=d.news.slice(-50);
 ctx.add(s,report,'people');return e;
}
export function storyDirectorHistory(s){
 const d=storyDirectorState(s);
 return {queue:(d.queue||[]).filter(x=>x.status==='ready').slice().reverse(),
  completed:(d.completed||[]).slice(-15).reverse(),echoes:(d.echoes||[]).slice(-16).reverse(),
  news:(d.news||[]).slice(-12).reverse(),seen:d.seen||0,
  summary:{reconciled:(d.completed||[]).filter(x=>x.outcome==='reconciled').length,
   clarified:(d.completed||[]).filter(x=>x.outcome==='clarified').length,
   fractured:(d.completed||[]).filter(x=>x.outcome==='fractured').length}};
}
export function storyDirectorInheritance(next,old){
 const d=old.world?.storyDirector;if(!d)return;
 const n=ensure(next);
 n.completed=(d.completed||[]).slice(-10).map(x=>({...x,sourceLife:old.name}));
 n.echoes=[];n.queue=[];n.active=null;n.news=[];n.recentThemes=[];n.lastStartAge=null;n.seen=n.completed.length;
}
