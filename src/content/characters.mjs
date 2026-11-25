// Character-driven simulation, deterministic and entirely offline.
// NPC IDs, conflict records and arc history are persisted within the existing world save.
// No real sports organizations, parties or celebrity agents are represented.
const names=['Ari Tan','Morgan Vale','Samira Noor','Jules Park','Rafael Costa','Nadia Brooks','Leo Hart','Mira Chen','Elena Reyes','Kai Morgan','Tessa Reed','Amir Rahman','Yuna Sato','Noah Clarke','Sofia Bell','Darius Cole','Lina Torres','Ishan Patel'];
const dispositions=['Determined','Diplomatic','Restless','Principled','Ambitious','Pragmatic'];
const disciplines=['Football','Basketball','Tennis','Track and field'];
const specialties=['Film actor','Recording musician','Film director'];
const hash=s=>{let x=2166136261;for(const c of String(s)){x=Math.imul(x^c.charCodeAt(0),16777619)>>>0;}return x;};
const value=(s,offset,min,max)=>min+(hash(String(s.lifeId||s.name)+':'+offset)%(max-min+1));
const personName=(s,offset)=>names[value(s,'npc-name-'+offset,0,names.length-1)];
export function initialCharacters(s){
 return {version:1,
  athletes:disciplines.map((sport,i)=>({id:'ath-'+i,name:personName(s,1+i),sport,age:Math.max(18,s.age+value(s,'ath-age-'+i,-3,5)),form:value(s,'ath-form-'+i,42,77),wins:0,losses:0,trophies:0,rivalry:20,respect:48,personality:dispositions[i],history:[]})),
  politicians:[0,1,2].map(i=>({id:'pol-'+i,name:personName(s,7+i),party:['Civic Forum','Community Alliance','Progress Union'][i],age:Math.max(25,s.age+value(s,'pol-age-'+i,1,15)),approval:value(s,'pol-appr-'+i,43,70),campaignFunds:value(s,'pol-funds-'+i,800,2500),wins:0,losses:0,office:null,term:0,rivalry:24,respect:45,personality:dispositions[2+i],history:[]})),
  agents:specialties.map((specialty,i)=>({id:'agent-'+i,name:personName(s,12+i),specialty,network:55+i*12,commission:[14,11,16][i],trust:50,projects:0,agreements:0,personality:dispositions[i+1],history:[]})),
  agency:null,conflicts:[],arc:null,completedArcs:[],news:[],crossGenerations:0};
}
export function ensureCharacters(s){s.world??={};return s.world.characters??=initialCharacters(s);}
export function characterView(s){return s.world?.characters||initialCharacters(s);}
function chronicle(s,text,ctx,topic='people'){
 const ch=ensureCharacters(s);const record={age:s.age,text,topic};
 ch.news.push(record);if(ch.news.length>45)ch.news.shift();
 s.world.news??=[];s.world.news.push({age:s.age,text,domain:'characters'});if(s.world.news.length>32)s.world.news.shift();
 ctx.add(s,text,'world');
}
const peek=(group,id)=>group.find(p=>p.id===id);
const conflictFor=(chars,id)=>chars.conflicts.find(c=>c.personId===id&&c.status==='open');
const family=s=>s.people.filter(p=>p.alive&&['partner','parent','child','sibling','grandparent'].includes(p.role));
function arcStart(s){
 const h=hash(s.lifeId||s.name),variants=[
 {title:'The Letters Across Generations',promise:'Preserve a relative’s collection of letters',artifact:'letters'},
 {title:'The Family Workshop Promise',promise:'Keep a family craft accessible to the next generation',artifact:'workshop'},
 {title:'The Unfinished Family Garden',promise:'Restore a community garden tied to your family history',artifact:'garden'},
 {title:'The Forgotten Scholarship',promise:'Honor a promise to fund learning for future relatives',artifact:'scholarship'}];
 const a=variants[h%variants.length];
 return {id:'arc-'+h,kind:a.artifact,title:a.title,promise:a.promise,status:'active',stage:0,startedAge:s.age,nextAge:s.age+2,lastStepAge:s.age,generationStarted:s.generation,generations:1,sourceName:s.name,contributions:0,choices:[],outcome:null};
}
export function characterCommands(s){
 if(!s.alive||s.pending!==null||s.mini||(s.justice?.years||0)>0)return [];
 const ch=characterView(s),out=[],act=s.actions>0,adult=s.age>=18,free=!(s.justice?.case);
 const put=(id,label,detail,enabled=true)=>out.push({id,label,detail,enabled:!!enabled&&act&&free});
 if(adult){
   const sport=s.world?.sports?.sport;
   if(sport){for(const rival of ch.athletes.filter(x=>x.sport===sport)){
     put('character:sport:challenge:'+rival.id,'Challenge '+rival.name+' to a rivalry match','Form '+rival.form+' · '+rival.wins+' wins · $250 entry',s.cash>=250&&rival.lastMatchAge!==s.age);
     put('character:sport:respect:'+rival.id,'Train alongside '+rival.name,'Improve form and mutual respect',rival.lastTrainingAge!==s.age);
   }}
   if(s.world?.politics?.party)for(const rival of ch.politicians){
     put('character:politics:debate:'+rival.id,'Debate '+rival.name,rival.party+' · approval '+rival.approval+' · $300',s.cash>=300&&rival.lastDebateAge!==s.age);
     put('character:politics:coalition:'+rival.id,'Seek agreement with '+rival.name,'A cooperative policy negotiation · $200',s.cash>=200&&rival.lastCoalitionAge!==s.age);
   }
   if(s.world?.entertainment?.path){
     const e=s.world.entertainment;
     if(!ch.agency)for(const agent of ch.agents.filter(x=>x.specialty===e.path)){
       put('character:agent:sign:'+agent.id,'Hire '+agent.name+' as your agent',agent.commission+'% simulated commission · network '+agent.network,s.cash>=450);
     }
     if(ch.agency){
       const agent=ch.agents.find(x=>x.id===ch.agency.agentId);
       if(agent){
         put('character:agent:pitch:'+agent.id,'Pitch a project with '+agent.name,'Network '+agent.network+' · $600 · possible deal',s.cash>=600&&ch.agency.lastPitchAge!==s.age);
         put('character:agent:renegotiate:'+agent.id,'Renegotiate agency terms','Cost $250 · improve trust or reduce commission',s.cash>=250&&ch.agency.lastNegotiationAge!==s.age);
         put('character:agent:dismiss:'+agent.id,'End representation by '+agent.name,'Buy out agreement · $750',s.cash>=750);
       }
     }
   }
   for(const p of family(s)){
     const c=conflictFor(ch,p.id);
     if(c){
       put('character:family:listen:'+p.id,'Hear '+p.name+' out','Lower tension, build understanding · stage '+(c.steps+1),c.lastActionAge!==s.age);
       put('character:family:mediate:'+p.id,'Seek mediation with '+p.name,'$350 · repair bond and family standing',s.cash>=350&&c.lastActionAge!==s.age);
       put('character:family:boundary:'+p.id,'Set boundaries with '+p.name,'Protect independence; may reduce closeness',c.lastActionAge!==s.age);
     }else if(p.bond<90){
       put('character:family:start:'+p.id,'Discuss a difficult issue with '+p.name,'Begin an ongoing family conflict and reconciliation arc',!ch.conflicts.some(x=>x.personId===p.id&&x.closedAge===s.age));
     }
   }
   const arc=ch.arc;
   if(!arc&&family(s).length){
     put('character:legacy:start','Begin a multi-generation family promise','Four chapters spread across several years and potentially multiple lives',s.age>=25);
   }else if(arc?.status==='active'){
     if(s.age>=arc.nextAge){
       const stage=arc.stage;
       if(stage===0){
         put('character:legacy:listen','Chapter 1 · Listen to both sides',arc.title+' · build trust and clarify the promise');
         put('character:legacy:challenge','Chapter 1 · Question the promise','Improve independence, but risk family trust');
       }else if(stage===1){
         put('character:legacy:archive','Chapter 2 · Preserve the evidence','$800 · document family history',s.cash>=800);
         put('character:legacy:share','Chapter 2 · Share the story','Build understanding without spending money');
       }else if(stage===2){
         put('character:legacy:invest','Chapter 3 · Honor the promise','$1,500 · tangible support and family standing',s.cash>=1500);
         put('character:legacy:revise','Chapter 3 · Renegotiate the promise','Seek a sustainable compromise');
       }else if(stage===3){
         put('character:legacy:resolve','Final chapter · Complete the family legacy','Your decisions determine the inherited ending');
         put('character:legacy:stepaway','Final chapter · End the old obligation','Close the story with a new understanding');
       }
     }
   }
 }
 return out;
}
function resolveConflict(s,p,c,type,ctx){
 const w=p.world??={},chars=ensureCharacters(s);
 c.steps++;c.lastActionAge=s.age;
 const {clamp,change,bond,spend}=ctx;
 if(type==='listen'){c.tension=clamp(c.tension-19);bond(s,p,9,'Listened to family concerns');c.good=(c.good||0)+1;change(s,'kindness',3);}
 if(type==='mediate'){spend(s,350);c.tension=clamp(c.tension-31);bond(s,p,11,'Family mediation');c.good=(c.good||0)+2;change(s,'stress',-5);}
 if(type==='boundary'){c.tension=clamp(c.tension+8);bond(s,p,-5,'Set family boundaries');change(s,'confidence',5);}
 if(c.tension<=15&&c.steps>=2){c.status='resolved';c.closedAge=s.age;c.outcome='reconciled';s.world.dynasty.reputation=clamp(s.world.dynasty.reputation+10);chronicle(s,'A longstanding disagreement with '+p.name+' ended in reconciliation.',ctx,'family');}
 else if(c.tension>=95&&c.steps>=2){c.status='resolved';c.closedAge=s.age;c.outcome='estranged';s.world.dynasty.reputation=clamp(s.world.dynasty.reputation-9);chronicle(s,'You and '+p.name+' became estranged after a difficult conflict.',ctx,'family');}
 else chronicle(s,'Family conflict with '+p.name+': '+c.tension+' tension remaining.',ctx,'family');
}
export function characterAct(s,id,ctx){
 if(!characterCommands({...s,actions:s.actions+1}).some(a=>a.id===id&&a.enabled))throw Error('Unavailable character action.');
 const [prefix,kind,verb,arg]=id.split(':');if(prefix!=='character')throw Error('Invalid character action.');
 const ch=ensureCharacters(s),rng=ctx.rng,cl=ctx.clamp,change=ctx.change,spend=ctx.spend;
 if(kind==='sport'){
   const rival=peek(ch.athletes,arg);if(!rival)throw Error('Unknown sports rival.');
   if(verb==='challenge'){
     spend(s,250);rival.lastMatchAge=s.age;
     const player=s.world.sports,playerPower=player.form*.63+s.stats.health*.20+s.stats.confidence*.17+rng(s)*20;
     const otherPower=rival.form*.75+(rival.wins>2?8:0)+rng(s)*20;
     if(playerPower>=otherPower){player.wins++;rival.losses++;rival.rivalry=cl(rival.rivalry+10);rival.respect=cl(rival.respect+4);player.form=cl(player.form+5);s.cash+=750;change(s,'reputation',5);chronicle(s,'Defeated '+rival.name+' in a '+rival.sport+' rivalry match.',ctx,'sport');}
     else{player.losses++;rival.wins++;rival.rivalry=cl(rival.rivalry+5);player.form=cl(player.form-4);change(s,'stress',5);chronicle(s,rival.name+' won your latest '+rival.sport+' rivalry match.',ctx,'sport');}
     rival.history.push({age:s.age,result:'head-to-head'});if(rival.history.length>15)rival.history.shift();
   }else if(verb==='respect'){rival.lastTrainingAge=s.age;rival.respect=cl(rival.respect+14);rival.rivalry=cl(rival.rivalry-8);s.world.sports.form=cl(s.world.sports.form+7);change(s,'kindness',3);}
   else throw Error('Unknown sports rivalry action.');
 }else if(kind==='politics'){
   const rival=peek(ch.politicians,arg);if(!rival)throw Error('Unknown political rival.');const p=s.world.politics;
   if(verb==='debate'){
     spend(s,300);rival.lastDebateAge=s.age;
     const player=s.stats.knowledge*.25+s.stats.social*.3+p.approval*.45+rng(s)*20;
     const opponent=rival.approval*.65+rival.rivalry*.22+rng(s)*30;
     if(player>=opponent){p.approval=cl(p.approval+7);rival.approval=cl(rival.approval-4);rival.respect=cl(rival.respect+4);change(s,'reputation',4);chronicle(s,'Won a fictional civic debate against '+rival.name+'.',ctx,'politics');}
     else{p.approval=cl(p.approval-6);rival.approval=cl(rival.approval+5);change(s,'stress',6);chronicle(s,rival.name+' gained support after your civic debate.',ctx,'politics');}
     rival.rivalry=cl(rival.rivalry+7);
   }else if(verb==='coalition'){
     spend(s,200);rival.lastCoalitionAge=s.age;const success=ctx.rng(s)<Math.min(.9,.35+rival.respect*.004+s.stats.social*.002);
     if(success){p.approval=cl(p.approval+5);rival.respect=cl(rival.respect+12);rival.rivalry=cl(rival.rivalry-15);s.world.dynasty.reputation=cl(s.world.dynasty.reputation+3);chronicle(s,'Reached a public-service compromise with '+rival.name+'.',ctx,'politics');}
     else{p.approval=cl(p.approval-2);change(s,'stress',4);}
   }else throw Error('Unknown political interaction.');
 }else if(kind==='agent'){
   const agent=peek(ch.agents,arg);if(!agent)throw Error('Unknown agent.');
   if(verb==='sign'){spend(s,450);ch.agency={agentId:agent.id,years:3,earned:0,fees:0,deals:0,lastPitchAge:-1,lastNegotiationAge:-1};agent.agreements++;agent.trust=cl(agent.trust+8);chronicle(s,'Signed a three-year representation agreement with '+agent.name+'.',ctx,'entertainment');}
   else if(verb==='pitch'){
     spend(s,600);ch.agency.lastPitchAge=s.age;const odds=Math.min(.9,.13+agent.network*.006+(s.world.entertainment.fame||0)*.003+agent.trust*.001);
     if(rng(s)<odds){const gross=Math.round(2500+agent.network*48+(s.world.entertainment.fame||0)*20),fee=Math.round(gross*agent.commission/100);
       s.cash+=gross-fee;ch.agency.earned+=gross-fee;ch.agency.fees+=fee;ch.agency.deals++;agent.projects++;agent.network=cl(agent.network+3);s.world.entertainment.fame=cl(s.world.entertainment.fame+7);chronicle(s,agent.name+' negotiated a creative project worth $'+gross.toLocaleString('en-US')+' before commission.',ctx,'entertainment');
     }else{agent.trust=cl(agent.trust-3);change(s,'stress',4);chronicle(s,agent.name+' could not secure a project this year.',ctx,'entertainment');}
   }else if(verb==='renegotiate'){spend(s,250);ch.agency.lastNegotiationAge=s.age;if(rng(s)<Math.min(.9,.3+(s.skills?.communication||0)*.001+agent.trust*.004)){agent.commission=Math.max(7,agent.commission-1);agent.trust=cl(agent.trust+7);}else agent.trust=cl(agent.trust-5);}
   else if(verb==='dismiss'){spend(s,750);ch.agency=null;chronicle(s,'Ended representation by '+agent.name+'.',ctx,'entertainment');}
   else throw Error('Unknown representation action.');
 }else if(kind==='family'){
   const idNumber=Number(arg),p=s.people.find(x=>x.id===idNumber&&x.alive);
   if(!p)throw Error('Unavailable relative.');
   if(verb==='start'){const tension=cl(Math.max(34,95-p.bond+(p.world?.rivalry||0)*.2));ch.conflicts.push({id:'conflict-'+idNumber+'-'+s.age,personId:idNumber,personName:p.name,status:'open',startedAge:s.age,lastActionAge:s.age,steps:0,tension,good:0,outcome:null});change(s,'stress',5);chronicle(s,'A conflict over family expectations began with '+p.name+'.',ctx,'family');}
   else{const conflict=conflictFor(ch,p.id);if(!conflict)throw Error('Conflict not active.');resolveConflict(s,p,conflict,verb,ctx);}
 }else if(kind==='legacy'){
   if(verb==='start'){ch.arc=arcStart(s);chronicle(s,'Family promise begun: '+ch.arc.promise+'. The first chapter will unfold in two years.',ctx,'legacy');}
   else{
     const arc=ch.arc;if(!arc||arc.status!=='active'||s.age<arc.nextAge)throw Error('Family story is not ready.');
     if(verb==='archive'||verb==='invest')spend(s,verb==='archive'?800:1500);
     const generous=['listen','archive','invest','resolve'].includes(verb);
     arc.choices.push({age:s.age,generation:s.generation,verb,actor:s.name});
     arc.contributions+=generous?2:verb==='share'||verb==='revise'?1:-1;
     arc.stage++;arc.lastStepAge=s.age;arc.nextAge=s.age+2;
     s.world.dynasty.reputation=cl(s.world.dynasty.reputation+(generous?7:verb==='share'||verb==='revise'?3:-4));
     for(const p of family(s).slice(0,3))ctx.bond(s,p,generous?3:-2,'Family legacy promise');
     if(arc.stage>=4){arc.status='completed';arc.outcome=arc.contributions>=4?'fulfilled':arc.contributions>=0?'reimagined':'unfinished';
       ch.completedArcs.push({...arc});if(ch.completedArcs.length>20)ch.completedArcs.shift();
       chronicle(s,'The family promise concluded as '+arc.outcome+' after '+arc.generations+' generation(s).',ctx,'legacy');ch.arc=null;
     }else chronicle(s,'Family promise — chapter '+arc.stage+'/4: '+verb+'. Return in two years.',ctx,'legacy');
   }
 }else throw Error('Unknown character domain.');
}
export function characterYear(s,ctx){
 if(s.age<18&&!s.world?.characters)return {income:0};
 const ch=ensureCharacters(s),rng=ctx.rng,cl=ctx.clamp;
 for(const rival of ch.athletes){rival.age++;if(rival.age>=49){rival.form=cl(rival.form-5);continue;}
   rival.form=cl(rival.form+Math.round((rng(s)-.48)*12));
   if(rng(s)<Math.min(.85,.12+rival.form*.006)){rival.wins++;if(rival.wins>=5&&rival.wins%5===0){rival.trophies++;if(s.world.sports.sport===rival.sport)chronicle(s,rival.name+' won another '+rival.sport+' championship.',ctx,'sport');}}
   else rival.losses++;
   rival.rivalry=cl(rival.rivalry-(rng(s)<.4?2:0));}
 for(const rival of ch.politicians){rival.age++;rival.approval=cl(rival.approval+Math.round((rng(s)-.5)*9));rival.campaignFunds+=Math.round(rng(s)*450);
   if(rival.term>0){rival.term--;if(!rival.term)rival.office=null;}
   if(s.age%4===0&&rival.age>=25&&rival.age<85){const win=rng(s)<Math.max(.15,Math.min(.85,.22+rival.approval*.006));if(win){rival.wins++;rival.office=rival.wins>=2?'Representative':'Councillor';rival.term=4;}else rival.losses++;
     if(s.world.politics.party&&rival.rivalry>45)chronicle(s,rival.name+(win?' won':' lost')+' a fictional civic election.',ctx,'politics');}}
 let income=0;
 if(ch.agency){const contract=ch.agency,agent=ch.agents.find(a=>a.id===contract.agentId);
   if(!agent||!s.world.entertainment.path){ch.agency=null;}
   else{const chance=Math.min(.6,.10+agent.network*.0035+(s.world.entertainment.fame||0)*.001);
     if(!ctx.inCustody&&rng(s)<chance){const gross=Math.round((450+agent.network*14)*ctx.country(s).salary);const fee=Math.round(gross*agent.commission/100);income+=gross-fee;contract.fees+=fee;contract.earned+=gross-fee;contract.deals++;agent.projects++;}
     contract.years--;if(contract.years<=0){chronicle(s,'Your representation contract with '+agent.name+' expired.',ctx,'entertainment');ch.agency=null;}}
 }
 for(const conflict of ch.conflicts.filter(x=>x.status==='open')){const p=s.people.find(x=>x.id===conflict.personId&&x.alive);
   if(!p){conflict.status='resolved';conflict.outcome='ended';conflict.closedAge=s.age;continue;}
   if(conflict.lastActionAge!==s.age){conflict.tension=cl(conflict.tension+Math.round((rng(s)-.25)*8));if(conflict.tension>75){ctx.bond(s,p,-3,'Unresolved family disagreement');s.world.dynasty.reputation=cl(s.world.dynasty.reputation-1);}}
 }
 if(s.age>=38&&!ch.arc&&ch.completedArcs.length<4&&s.people.some(p=>p.alive&&p.role==='child')&&rng(s)<.018){
   ch.arc=arcStart(s);chronicle(s,'Your family uncovered an old promise: '+ch.arc.promise+'.',ctx,'legacy');}
 return {income};
}
export function characterInheritance(next,previous){
 const prior=previous.world?.characters;if(!prior)return next;
 const newRecord=JSON.parse(JSON.stringify(prior));
 newRecord.crossGenerations=(prior.crossGenerations||0)+1;
 newRecord.agency=null; // professional representation is not transferable by inheritance
 for(const rival of newRecord.athletes)rival.rivalry=Math.max(0,Math.round(rival.rivalry*.6));
 for(const rival of newRecord.politicians)rival.rivalry=Math.max(0,Math.round(rival.rivalry*.6));
 for(const c of newRecord.conflicts){if(c.status==='open'){c.status='resolved';c.outcome='inherited-memory';c.closedAge=next.age;}}
 if(newRecord.arc?.status==='active'){
   newRecord.arc.generations=(newRecord.arc.generations||1)+1;
   newRecord.arc.nextAge=next.age+2;
   newRecord.arc.sourceName=previous.name;
   newRecord.news.push({age:next.age,text:'Inherited '+newRecord.arc.title+' from '+previous.name+'.',topic:'legacy'});
 }
 next.world.characters=newRecord;
 return next;
}
