// Lifely original playable hobby circuits. All actions are offline and seed-replayable.
// A good tactical read dominates luck; rival ratings and real mastery make outcomes matter.
const clamp=x=>Math.max(0,Math.min(100,Math.round(x)));
const phases=['Opening','Adaptation','Final moment'];
const hobbyContent=[
 {id:'chess',name:'Chess & strategy',glyph:'♟',minAge:7,stat:'knowledge',benefit:'knowledge',theme:'The local chess club has a new challenger.',
  moments:[
   {cue:'Your opponent leaves an open file while advancing too far.',options:[['Protect the king','Give up initiative for safety'],['Claim the open file','Use the space they abandoned'],['Sacrifice immediately','Make a dramatic but unsupported attack']],ideal:1,lesson:'Controlling the open file wins the initiative.'},
   {cue:'A tempting pawn is defended by two hidden pieces.',options:[['Calculate the full exchange','Check every defender before moving'],['Grab the pawn','Trust that the reward is worth the risk'],['Make a random waiting move','Avoid the tension without a plan']],ideal:0,lesson:'Careful calculation avoids an expensive trap.'},
   {cue:'A close endgame is running out of time.',options:[['Play quickly with no plan','Hope speed alone is enough'],['Trade pieces blindly','Remove complexity at any price'],['Activate your king','Coordinate your pieces for the ending']],ideal:2,lesson:'Active pieces matter more than panicked trades.'}
  ]},
 {id:'streetball',name:'Street basketball',glyph:'🏀',minAge:9,stat:'health',benefit:'health',theme:'Your neighborhood court has its own legends.',
  moments:[
   {cue:'The defender overcommits to your shooting hand.',options:[['Force the same shot','Shoot directly into tight pressure'],['Change direction and drive','Exploit the defender\'s momentum'],['Hold the ball indefinitely','Allow the defense to reset']],ideal:1,lesson:'Recognizing defensive momentum creates space.'},
   {cue:'A teammate cuts unmarked toward the basket.',options:[['Pass into the open lane','Trust the teammate and create a better attempt'],['Keep dribbling alone','Ignore the open passing option'],['Throw a desperate deep shot','Avoid the coordinated play']],ideal:0,lesson:'Good team play creates higher-quality chances.'},
   {cue:'The opponent is tired and defending a narrow lead.',options:[['Sprint directly into a crowd','Trade control for speed'],['Give up the possession','Wait for the clock to run out'],['Use a controlled change of pace','Create one deliberate final opening']],ideal:2,lesson:'Patience and timing beat frantic movement.'}
  ]},
 {id:'openmic',name:'Open-mic music',glyph:'♫',minAge:8,stat:'creativity',benefit:'creativity',theme:'The next local showcase might change everything.',
  moments:[
   {cue:'The venue audio is muddy and the first verse is hard to hear.',options:[['Turn everything louder','Overpower the room without adjusting'],['Simplify the arrangement','Let the melody and vocal come through'],['Skip the first verse','Avoid the real sound issue']],ideal:1,lesson:'Clarity connects more effectively than sheer volume.'},
   {cue:'A collaborator has written a moving but unusual bridge.',options:[['Rehearse it together','Use the surprise while keeping the timing tight'],['Discard it without listening','Protect your original version at all costs'],['Improvise without warning','Leave your collaborator guessing']],ideal:0,lesson:'Rehearsed collaboration makes creative risks work.'},
   {cue:'The audience is quiet, but still listening near the ending.',options:[['Rush the final chorus','Treat silence as rejection'],['Stop and apologize','Abandon the performance'],['Deliver a confident final refrain','Trust the material and land the ending']],ideal:2,lesson:'A committed ending can turn attention into connection.'}
  ]},
 {id:'cooking',name:'Cooking challenge',glyph:'🍳',minAge:8,stat:'knowledge',benefit:'kindness',theme:'The neighborhood kitchen hosts original recipe battles.',
  moments:[
   {cue:'Your ingredients are fresh but the dish needs contrast.',options:[['Add everything at once','Create more complexity without control'],['Balance texture and acidity','Choose ingredients that complement each other'],['Ignore the dish until service','Hope the problem resolves itself']],ideal:1,lesson:'Balanced taste and texture beat excess.'},
   {cue:'A teammate notices a possible food-safety issue during preparation.',options:[['Check storage and handling','Protect everyone before continuing'],['Hide the concern','Save time at the expense of trust'],['Serve immediately','Ignore the kitchen procedure']],ideal:0,lesson:'Safe preparation is part of a good meal.'},
   {cue:'The dish is ready but presentation time is running out.',options:[['Add a random garnish','Make changes without a reason'],['Restart the whole dish','Throw away the useful work'],['Plate simply and intentionally','Present the food at its best']],ideal:2,lesson:'Intentional presentation makes the recipe shine.'}
  ]},
 {id:'dance',name:'Dance battle',glyph:'✦',minAge:8,stat:'confidence',benefit:'confidence',theme:'Dance crews bring new moves to the neighborhood.',
  moments:[
   {cue:'The beat changes and your competitor is relying on repeated moves.',options:[['Copy their whole sequence','Give up your own identity'],['Shift your rhythm with the beat','Use timing to make the move feel new'],['Freeze for the entire round','Ignore the music completely']],ideal:1,lesson:'Musical timing is more powerful than imitation.'},
   {cue:'Your partner nearly misses a transition.',options:[['Make space and match their tempo','Help the crew regain synchrony'],['Call them out on stage','Break the flow to assign blame'],['Continue without looking','Lose the coordinated movement']],ideal:0,lesson:'A strong crew can recover gracefully together.'},
   {cue:'The audience responds to originality, not speed.',options:[['Perform every move at once','Trade clarity for chaos'],['Repeat the first sequence','Avoid a new ending'],['Finish with a distinctive signature move','Create a memorable, clean finale']],ideal:2,lesson:'A signature finish creates lasting identity.'}
  ]},
 {id:'gamejam',name:'Indie game jam',glyph:'🎮',minAge:12,stat:'creativity',benefit:'knowledge',theme:'A small game-making festival is accepting new teams.',
  moments:[
   {cue:'Your prototype has a huge feature list and a short deadline.',options:[['Add a second game mode','Expand scope without finishing the core'],['Make the core loop satisfying','Polish something players can actually enjoy'],['Replace the art engine tonight','Restart under pressure']],ideal:1,lesson:'Finishing a fun core loop beats feature overload.'},
   {cue:'Playtesters keep getting stuck at the same point.',options:[['Observe and fix the confusing step','Use evidence from real gameplay'],['Tell players to read a long manual','Shift responsibility away from the design'],['Hide the problem screen','Ignore what they experienced']],ideal:0,lesson:'Watching real players reveals where the fun stops.'},
   {cue:'You have one hour before the final playable showcase.',options:[['Introduce an untested system','Take on unnecessary release risk'],['Rewrite the entire game','Discard stable work'],['Fix crashes and polish onboarding','Make the completed experience reliable']],ideal:2,lesson:'A playable build makes a better impression than a broken promise.'}
  ]},
 {id:'photography',name:'Photo adventures',glyph:'📷',minAge:9,stat:'creativity',benefit:'creativity',theme:'Every neighborhood has a story worth capturing.',
  moments:[
   {cue:'The scene is beautifully lit, but the main subject blends into the background.',options:[['Add more random objects','Make the composition even busier'],['Change position to isolate the subject','Find a simpler visual story'],['Shoot without looking','Give up control of composition']],ideal:1,lesson:'Subject separation makes the image readable.'},
   {cue:'A portrait subject seems uncomfortable with the camera.',options:[['Ask permission and build trust','Respect the person in front of your lens'],['Capture them secretly','Ignore consent and relationship damage'],['Push them to perform','Create pressure instead of connection']],ideal:0,lesson:'Good portraits begin with trust and consent.'},
   {cue:'Your series needs one final image to connect its theme.',options:[['Pick the most dramatic unrelated shot','Chase spectacle over coherence'],['Submit every picture','Avoid making a clear selection'],['Choose the image that finishes the story','Make the sequence meaningful']],ideal:2,lesson:'The final frame should complete the visual narrative.'}
  ]},
 {id:'gardening',name:'Garden & nature club',glyph:'🌿',minAge:6,stat:'kindness',benefit:'health',theme:'A small patch of green connects unlikely neighbors.',
  moments:[
   {cue:'The seedlings are wilting despite frequent watering.',options:[['Add much more water','Treat every problem as thirst'],['Check drainage and soil first','Find the cause before changing the care plan'],['Abandon the seedlings','Avoid learning from the mistake']],ideal:1,lesson:'Healthy roots need the right balance of water and air.'},
   {cue:'A neighbor offers native plants that support local pollinators.',options:[['Plan a native-plant section','Create habitat while improving the garden'],['Use an unsuitable invasive plant','Ignore the local ecosystem'],['Cover the entire bed in concrete','Prevent new growth']],ideal:0,lesson:'Native plants can support a resilient local ecosystem.'},
   {cue:'The community garden needs care after a difficult season.',options:[['Replace everything immediately','Lose useful mature plants'],['Stop checking the garden','Let the problem become worse'],['Build a realistic shared care rota','Give each plant and person a chance']],ideal:2,lesson:'Sustainable care requires a dependable community.'}
  ]}
];
export const hobbyTypes=hobbyContent.map(({id,name,glyph,minAge,stat,benefit,theme})=>({id,name,glyph,minAge,stat,benefit,theme}));
const rivalNames=['Morgan Vale','Avery Brooks','Skyler Reed','Jordan Finch','Casey Lin','Taylor Moss','Alex Rowan','Sam River','Robin Clark','Drew Ellis','Emery Hart','Riley Stone','Quinn Park','Kai Mercer','Jules Hart','Morgan Ellis'];
export const emptyHobbyCircuit=()=>({version:1,active:null,disciplines:{},recent:[],hallOfFame:[],news:[],playedThisAge:0,year:null});
export const hobbyState=s=>s.hobbyCircuit||emptyHobbyCircuit();
const ensure=s=>(s.hobbyCircuit??=emptyHobbyCircuit());
const league=r=>r>=85?4:r>=65?3:r>=42?2:r>=20?1:0;
const leagues=['Neighborhood','Local','Regional','National','Legend'];
function profile(s,id,ctx){
 const h=ensure(s);
 if(h.disciplines[id])return h.disciplines[id];
 const type=hobbyContent.find(x=>x.id===id);
 if(!type)throw Error('Unknown hobby.');
 const picked=Math.floor(ctx.rng(s)*rivalNames.length),rivals=[0,1].map((_,i)=>({
  id:id+'-rival-'+i,name:rivalNames[(picked+i*7)%rivalNames.length],
  rating:clamp(17+i*11+Math.floor(ctx.rng(s)*13)),respect:42,rivalry:12+i*5,
  wins:0,losses:0,encounters:0,lastAge:-1,history:[]
 }));
 const p={id,name:type.name,mastery:0,level:0,points:0,practice:0,contests:0,wins:0,losses:0,trophies:0,
  bestStreak:0,streak:0,lastAge:-1,lastResult:null,history:[],rivals};
 h.disciplines[id]=p;return p;
}
const roundFor=(session)=>{
 const d=hobbyContent.find(x=>x.id===session.hobbyId);
 const index=(session.pattern+session.stage*2)%d.moments.length;
 return d.moments[index];
};
const playerScore=(s,hobby)=>Math.round((s.stats[hobby.stat]||45)*.4+(s.hobbyCircuit?.disciplines?.[hobby.id]?.mastery||0)*.6);
function pending(s){return !!(s.pending!==null||s.mini||s.world?.network?.conversation||s.careerCampaigns?.active||s.everydayScenes?.active||s.world?.storyDirector?.active||s.hobbyCircuit?.active||(s.justice?.years||0)>0);}
export function hobbyCommands(s){
 if(!s.alive||pending(s)||s.age<6)return [];
 const h=hobbyState(s);
 const count=h.year===s.age?h.playedThisAge||0:0;
 return hobbyContent.filter(t=>s.age>=t.minAge).flatMap(t=>{
  const p=h.disciplines?.[t.id],once=p?.lastAge===s.age,ready=s.actions>0&&count<2&&!once;
  return [
   {id:'hobby:start:'+t.id+':practice',label:'Practice '+t.name,detail:'3 playable decisions · build technique and master new tactics',enabled:ready},
   ...(s.age>=t.minAge+1?[{id:'hobby:start:'+t.id+':contest',label:'Enter '+t.name+' contest',detail:'3 rounds vs evolving rivals · '+leagues[league(p?.mastery||0)]+' division',enabled:ready}]:[])
  ];
 });
}
export function beginHobby(s,id,ctx){
 if(!hobbyCommands({...s,actions:s.actions+1}).some(c=>c.id===id&&c.enabled))throw Error('Hobby challenge is unavailable.');
 const [,start,discipline,mode]=id.split(':');
 if(start!=='start'||!['practice','contest'].includes(mode))throw Error('Invalid hobby action.');
 const h=ensure(s),p=profile(s,discipline,ctx);
 if(h.year!==s.age){h.year=s.age;h.playedThisAge=0;}
 const chosen=(p.contests+p.practice+Math.floor(ctx.rng(s)*2))%p.rivals.length,opponent=p.rivals[chosen];
 h.playedThisAge++;
 p.lastAge=s.age;
 const session={id:'hobby-'+discipline+'-'+s.age+'-'+(p.contests+p.practice+1),hobbyId:discipline,
  mode,startedAge:s.age,stage:0,pattern:Math.floor(ctx.rng(s)*3),
  opponentId:opponent.id,opponentName:mode==='contest'?opponent.name:'Practice partner',
  opponentRating:mode==='contest'?clamp(opponent.rating+league(p.mastery)*3):clamp(Math.round((opponent.rating+p.mastery)/3)),
  score:0,focus:50,momentum:50,choices:[],last:null,observer:null};
 const candidates=[...(s.people||[]).filter(x=>x.alive&&x.age>=6).map(x=>({id:'person-'+x.id,name:x.name})),
  ...(s.world?.autonomy?.alumni||[]).map(x=>({id:x.id,name:x.name}))];
 if(candidates.length)session.observer=candidates[Math.floor(ctx.rng(s)*candidates.length)];
 h.active=session;ctx.add(s,'Started '+(mode==='contest'?'a '+leagues[league(p.mastery)]+' competition':'a practice session')+' in '+p.name+'.','activity');
 return session;
}
export function hobbyView(s){
 const h=hobbyState(s),a=h.active;if(!a)return null;
 const type=hobbyContent.find(x=>x.id===a.hobbyId),p=h.disciplines[a.hobbyId],round=roundFor(a);
 const difficulty=clamp(36+a.opponentRating*.39+(a.stage*3)-p.mastery*.32);
 return {id:a.id,title:type.name,glyph:type.glyph,mode:a.mode,round:a.stage+1,total:3,phase:phases[a.stage],
  prompt:round.cue,opponent:a.opponentName,opponentRating:a.opponentRating,
  observer:a.observer?.name||null,league:leagues[league(p.mastery)],mastery:p.mastery,
  meters:{focus:a.focus,momentum:a.momentum,opponent:a.opponentRating},score:a.score,
  risk:difficulty,options:round.options.map(([label,note],index)=>({index,label,note})),
  last:a.last,choices:a.choices.map(x=>({...x})),hint:'Read the situation, then choose the response that actually solves it. Skill and preparation matter more than luck.'};
}
function improveSpectator(s,session,ctx){
 const o=session.observer;if(!o)return;
 if(o.id.startsWith('person-')){
  const p=s.people.find(x=>'person-'+x.id===o.id&&x.alive);
  if(p)ctx.bond(s,p,2,'Enjoyed '+session.hobbyId+' together');
 }else{
  const p=s.world?.autonomy?.alumni?.find(x=>x.id===o.id);
  if(p)p.trust=clamp((p.trust||45)+2);
 }
}
function finishHobby(s,ctx){
 const h=ensure(s),a=h.active,type=hobbyContent.find(x=>x.id===a.hobbyId),p=h.disciplines[a.hobbyId],
  won=a.score>=2,perfect=a.score===3,contest=a.mode==='contest';
 const gain=(contest?8:12)+a.score*4;
 p.mastery=clamp(p.mastery+gain);p.level=league(p.mastery);p.points+=a.score*35+(contest&&won?100:0);
 p[contest?'contests':'practice']++;p.streak=contest?(won?p.streak+1:0):p.streak;
 p.bestStreak=Math.max(p.bestStreak,p.streak);
 if(contest){if(won)p.wins++;else p.losses++;}
 const rival=p.rivals.find(x=>x.id===a.opponentId);
 if(contest&&rival){rival.encounters++;rival.lastAge=s.age;
  if(won){rival.losses++;rival.respect=clamp(rival.respect+4);rival.rivalry=clamp(rival.rivalry+(perfect?8:3));}
  else{rival.wins++;rival.respect=clamp(rival.respect-1);rival.rivalry=clamp(rival.rivalry+5);}
  rival.history.push({age:s.age,against:s.name,won:!won});rival.history=rival.history.slice(-10);}
 const tier=leagues[league(p.mastery)],newTrophy=contest&&won&&(perfect||p.wins%3===0);
 if(newTrophy)p.trophies++;
 const reward=contest&&won&&s.age>=18?Math.min(1500,100+league(p.mastery)*200+(perfect?150:0)):0;
 if(reward)s.cash+=reward;
 // Each completed activity gives benefits even when the player does not win.
 ctx.change(s,type.benefit,won?5:2);
 if(won){ctx.change(s,'happiness',contest?5:3);ctx.change(s,'confidence',3);improveSpectator(s,a,ctx);}
 else if(contest){ctx.change(s,'stress',3);}
 if(type.id==='streetball'||type.id==='dance')ctx.change(s,'health',2);
 if(contest&&won&&type.id==='streetball'&&s.world?.sports)s.world.sports.form=clamp(s.world.sports.form+2);
 if(contest&&won&&type.id==='openmic'&&s.world?.entertainment)s.world.entertainment.fame=clamp(s.world.entertainment.fame+2);
 if(contest&&won&&type.id==='gamejam'&&s.business)s.business.quality=clamp((s.business.quality||50)+2);
 const status=contest?(won?'won':'lost'):'practiced';
 const summary={id:a.id,age:s.age,hobbyId:a.hobbyId,hobbyName:p.name,mode:a.mode,status,
  score:a.score,opponent:a.opponentName,mastery:p.mastery,league:tier,reward,perfect,trophy:newTrophy,
  lessons:a.choices.map(x=>({phase:x.stage,cue:x.cue,correct:x.correct,lesson:x.lesson}))};
 p.lastResult=summary;p.history.push(summary);p.history=p.history.slice(-16);
 h.recent.push(summary);h.recent=h.recent.slice(-40);
 if(newTrophy)h.hallOfFame.push({age:s.age,hobbyId:p.id,title:tier+' '+p.name+' title',opponent:a.opponentName});
 h.hallOfFame=h.hallOfFame.slice(-35);
 const statement=(contest?status+' the '+tier+' competition against '+a.opponentName:'trained in the '+p.name+' circuit')+
  ' · '+a.score+'/3 rounds'+(reward?' · earned $'+reward:'')+'.';
 h.news.push({age:s.age,text:p.name+': '+statement});h.news=h.news.slice(-40);
 ctx.add(s,p.name+': '+statement,'activity');
 h.active=null;return summary;
}
export function hobbyChoose(s,index,ctx){
 const h=ensure(s),a=h.active;if(!s.alive||!a)throw Error('No active hobby challenge.');
 if(index==='leave'){
  const p=h.disciplines[a.hobbyId];
  p.history.push({id:a.id,age:s.age,hobbyId:a.hobbyId,hobbyName:p.name,mode:a.mode,status:'abandoned',score:a.score,mastery:p.mastery});
  p.history=p.history.slice(-16);h.active=null;ctx.add(s,'Ended the '+p.name+' session early.','activity');return null;
 }
 if(!Number.isInteger(index)||index<0||index>2)throw Error('Choose one of the three tactical responses.');
 const moment=roundFor(a),p=h.disciplines[a.hobbyId],t=hobbyContent.find(x=>x.id===a.hobbyId);
 const correct=index===moment.ideal;
 const related=s.stats[t.stat]||45,mastery=p.mastery,opponent=a.opponentRating;
 // Narrow random swing: correct strategy dominates; experienced opponents still challenge veterans.
 const performance=38+mastery*.4+related*.25-opponent*.26+(correct?32:-16)+a.momentum*.09+
  (ctx.rng(s)-.5)*15-(a.stage*2);
 const success=performance>=54;
 a.score+=success?1:0;
 a.focus=clamp(a.focus+(correct?10:-11)+(success?4:-6));
 a.momentum=clamp(a.momentum+(success?9:-10));
 const reaction=success?'You read the situation and gained the advantage.':
  correct?'The decision was sound, but the opponent still made it difficult.':'The rival exploited your tactical mistake.';
 const record={stage:a.stage,index,cue:moment.cue,correct,success,lesson:moment.lesson,reaction};
 a.choices.push(record);a.last=record;a.stage++;
 if(a.stage===3)return finishHobby(s,ctx);
 return record;
}
export function hobbyYear(s,ctx){
 const h=s.hobbyCircuit;if(!h||!s.alive)return;
 if(h.year!==s.age){h.year=s.age;h.playedThisAge=0;}
 for(const p of Object.values(h.disciplines||{})){
  for(const r of p.rivals||[]){
   const delta=Math.floor(ctx.rng(s)*7)-1;
   r.rating=clamp(r.rating+delta);
   if(s.age%4===0&&ctx.rng(s)<.25){r.respect=clamp(r.respect+4);r.rivalry=clamp(r.rivalry+2);}
  }
  if(s.age>p.lastAge&&s.age%4===0&&p.contests>0){
   const best=p.rivals.slice().sort((a,b)=>b.rating-a.rating)[0];
   if(best){const text=best.name+' is challenging you again in '+p.name+'; their rating is now '+best.rating+'.';
    h.news.push({age:s.age,text});ctx.add(s,text,'activity');}
  }
 }
 h.news=h.news.slice(-40);
}
export function hobbySummary(s){
 const h=hobbyState(s);
 return {types:hobbyTypes,playedThisAge:h.year===s.age?h.playedThisAge||0:0,
  profiles:hobbyTypes.map(t=>{
   const p=h.disciplines?.[t.id];return {...t,mastery:p?.mastery||0,level:league(p?.mastery||0),
    league:leagues[league(p?.mastery||0)],practice:p?.practice||0,contests:p?.contests||0,wins:p?.wins||0,
    losses:p?.losses||0,trophies:p?.trophies||0,points:p?.points||0,streak:p?.streak||0,
    rivals:(p?.rivals||[]).map(x=>({...x})),lastResult:p?.lastResult||null};
  }),history:(h.recent||[]).slice(-15).reverse(),hallOfFame:(h.hallOfFame||[]).slice(-10).reverse(),news:(h.news||[]).slice(-10).reverse()};
}
export function hobbyInheritance(next,old){
 const prior=old.hobbyCircuit;if(!prior)return;
 const h=ensure(next);
 h.hallOfFame=(prior.hallOfFame||[]).slice(-12).map(x=>({...x,ancestor:old.name}));
 h.active=null;h.disciplines={};h.recent=[];h.news=[];h.year=null;h.playedThisAge=0;
}
