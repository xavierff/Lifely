// Life Chronicle records verifiable decision outcomes and presents existing history.
// It does not roll RNG, create quests, grant resources or change player outcomes.
const MAX_ENTRIES=72;
const MAX_ANCESTORS=12;
const LABELS={health:'Health',happiness:'Happiness',knowledge:'Knowledge',confidence:'Confidence',stress:'Stress',kindness:'Kindness',social:'Social life',creativity:'Creativity',reputation:'Reputation',performance:'Performance',financialSkill:'Financial skill',experience:'Experience'};
const STAGES=[
 {id:'roots',label:'Roots',start:0,end:12,symbol:'✿'},
 {id:'discovery',label:'Discovery',start:13,end:17,symbol:'✧'},
 {id:'becoming',label:'Becoming',start:18,end:34,symbol:'◆'},
 {id:'building',label:'Building',start:35,end:59,symbol:'◇'},
 {id:'legacy',label:'Legacy',start:60,end:110,symbol:'✦'}
];
const THEMES={
 family:{symbol:'♡',tone:'warm',reflection:'A family chapter is rarely a single conversation.'},
 relationship:{symbol:'♡',tone:'warm',reflection:'Someone may remember how this moment felt.'},
 relationships:{symbol:'♡',tone:'warm',reflection:'Someone may remember how this moment felt.'},
 childhood:{symbol:'✿',tone:'warm',reflection:'Small choices can become formative memories.'},
 career:{symbol:'▤',tone:'hope',reflection:'A professional life is built one decision at a time.'},
 money:{symbol:'◇',tone:'cool',reflection:'The numbers changed. What they allow comes next.'},
 justice:{symbol:'⚖',tone:'storm',reflection:'The aftermath depends on what happens next.'},
 health:{symbol:'✚',tone:'hope',reflection:'Wellbeing changes the possibilities ahead.'},
 saga:{symbol:'✦',tone:'storm',reflection:'This is one chapter of a longer story.'},
 story:{symbol:'✦',tone:'hope',reflection:'The next chapter is still unwritten.'},
 personal:{symbol:'✧',tone:'cool',reflection:'A small moment can say something about who you become.'}
};
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const compact=s=>String(s??'').replace(/\s+/g,' ').trim();
const clip=(s,n=240)=>compact(s).slice(0,n);
export const chronicleStage=age=>STAGES.find(x=>age>=x.start&&age<=x.end)||STAGES[STAGES.length-1];
export const chronicleState=s=>s.chronicle||{version:1,entries:[],ancestors:[],spotlight:null};
const sceneTone=category=>THEMES[category]||THEMES.personal;
const safeDiff=value=>finite(value)?Math.round(value):0;
const describeImpact=(entry)=>{
 const bond=entry.bonds.slice().sort((a,b)=>Math.abs(b.change)-Math.abs(a.change))[0];
 if(bond)return bond.name+(bond.change>=0?' grew closer (+':' became more distant (')+Math.abs(bond.change)+' bond).';
 const strongest=entry.changes.slice().sort((a,b)=>Math.abs(b.change)-Math.abs(a.change))[0];
 if(strongest)return strongest.label+(strongest.change>0?' rose by ':' fell by ')+Math.abs(strongest.change)+' points.';
 if(entry.netWorth)return 'Net worth '+(entry.netWorth>0?'increased':'decreased')+' by $'+Math.abs(entry.netWorth).toLocaleString('en-US')+'.';
 return 'No immediate stat, bond or net-worth change was recorded.';
};
function scheduledFutures(s,e,latest){
 const future=[];
 if(latest?.ripple&&Number.isInteger(latest.ripple.dueAge)){
  future.push({id:'ripple',age:latest.ripple.dueAge,label:clip(latest.ripple.title,100),detail:'A follow-up storyline has been scheduled.'});
 }
 const due=(s.story?.due||[]).find(x=>e.followId!==undefined&&x.id===e.followId);
 if(due)future.push({id:'arc',age:due.age,label:'A previous choice returns',detail:'An event is queued; the outcome is not decided yet.'});
 if(e.trial){
  const trial=(s.story?.due||[]).find(x=>x.id===e.trial.winId||x.id===e.trial.lossId);
  if(trial)future.push({id:'trial',age:trial.age,label:'Your attempt is tested',detail:'A result is queued for a later year.'});
 }
 const saga=(s.sagas?.active||[]).find(x=>e.saga&&x.id===e.saga.id);
 if(saga&&Number.isInteger(saga.due))future.push({id:'saga',age:saga.due,label:'The relationship story continues',detail:'A multi-year story is active.'});
 return future.slice(0,3);
}
export function chronicleRecordDecision(s,e,choice,latest){
 const c=s.chronicle??={version:1,entries:[],ancestors:[],spotlight:null};
 const changes=Object.entries(latest?.changes||{}).filter(([,v])=>finite(v)&&v!==0)
  .map(([key,change])=>({key,label:LABELS[key]||key,change:safeDiff(change)})).slice(0,12);
 const bonds=(latest?.bonds||[]).filter(x=>typeof x.name==='string'&&finite(x.change)&&x.change!==0)
  .map(x=>({name:clip(x.name,60),change:safeDiff(x.change)})).slice(0,6);
 const netWorth=safeDiff(latest?.netWorth);
 const category=clip(latest?.category||e.category||'personal',30);
 const future=scheduledFutures(s,e,latest);
 const turning=!!(e.arcStart||e.arcEnd||e.trial||e.saga||e.origin==='dramatic'||e.origin==='character-drama'||e.origin==='world-drama'||future.length||
  changes.some(x=>Math.abs(x.change)>=7)||bonds.some(x=>Math.abs(x.change)>=7)||Math.abs(netWorth)>=2000);
 const entry={
  id:'g'+s.generation+'-choice-'+(s.scenario?.choices||0),
  age:s.age,title:clip(e.title,120),choice:clip(choice.text,160),
  prompt:clip(e.prompt,240),category,turning,
  changes,bonds,netWorth,future,reflection:sceneTone(category).reflection
 };
 entry.impact=describeImpact(entry);
 c.entries=[...c.entries,entry].slice(-MAX_ENTRIES);
 if(turning)c.spotlight=entry;
 return entry;
}
function historyRows(s,entries){
 const firstRecorded=entries.length?entries[0].age:Infinity;
 const raw=(s.history||[]).filter((h)=>h.kind==='milestone'||h.kind==='achievement'||
  (h.kind==='decision'&&h.age<firstRecorded));
 // Prior version-2 lives have a journal but not a structured Chronicle.
 return raw.slice(-120).map((h,i)=>({
  id:'journal-'+h.age+'-'+i,age:h.age,
  title:clip(h.text,175),choice:'',category:h.kind==='achievement'?'achievement':h.kind==='decision'?'story':'milestone',
  turning:h.kind!=='decision',source:'history',symbol:h.kind==='achievement'?'★':'✦',
  changes:[],bonds:[],future:[],netWorth:0
 }));
}
export function chronicleView(s){
 const c=chronicleState(s),entries=Array.isArray(c.entries)?c.entries:[];
 const journal=historyRows(s,entries);
 const echoes=(s.emotional?.threads||[]).filter(m=>(m.status==='ready'||m.status==='resolved')&&
  (m.status!=='ready'||m.dueAge<=s.age)).map(m=>({
   id:'reunion-'+m.id,age:m.status==='resolved'?(m.resolvedAge??m.dueAge):m.dueAge,
   title:m.status==='resolved'?'Reunion with '+m.personName+': '+m.reunionOutcome:
    m.personName+' remembered your conversation from age '+m.sourceAge,
   category:'relationship',turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]
  }));
 const fates=(s.fate?.completed||[]).map(x=>({
  id:'fate-'+x.id,age:x.endedAge,title:x.title+': '+x.ending,
  category:'relationship',turning:true,source:'memory',choice:'',netWorth:0,
  changes:[],bonds:[],future:[]
 }));
 const social=(s.crossroads?.completed||[]).filter(x=>['alliance','reconciled','estranged','rivals'].includes(x.ending)).map(x=>({
  id:'crossroads-'+x.id,age:x.endedAge,
  title:x.aName+' & '+x.bName+': '+x.title+' — '+x.ending,
  category:'relationship',turning:true,source:'memory',choice:'',netWorth:0,
  changes:[],bonds:[],future:[]
 }));
 const npcPlans=(s.npcAmbitions?.completed||[]).filter(x=>x.ending==='achieved'||x.ending==='redirected').map(x=>({
  id:'npc-ambition-'+x.id,age:x.endedAge,
  title:x.name+': '+x.goal+' — '+x.ending,
  category:'relationship',turning:true,source:'memory',choice:'',netWorth:0,
  changes:[],bonds:[],future:[]
 }));
 const competingFutures=(s.competingFutures?.completed||[]).filter(x=>
  ['alliance','partnership','rivals','compromise','diverged'].includes(x.ending)).map(x=>({
   id:'competing-futures-'+x.id,age:x.endedAge,
   title:x.personName+': '+x.title+' — '+x.ending,
   category:x.kind==='business'?'business':'relationship',turning:true,source:'memory',
   choice:'',netWorth:0,changes:[],bonds:[],future:[]
 }));
 const influence=(s.socialInfluence?.completed||[]).filter(x=>
  ['earned','repaired','strained','dismissed'].includes(x.ending)).map(x=>({
   id:'social-influence-'+x.id,age:x.endedAge,
   title:x.name+': '+x.title+' — '+x.ending,
   category:x.group==='professional'?'career':'relationship',turning:true,source:'memory',
   choice:'',netWorth:0,changes:[],bonds:[],future:[]
 }));
 const circleStories=(s.socialCircles?.completed||[]).filter(x=>
  ['alliance','rivalry','negotiated'].includes(x.ending)).map(x=>({
  id:'social-circle-'+x.id,age:x.endedAge,
  title:x.personName+': '+x.title+' — '+x.ending,
  category:x.kind==='professional'?'career':'relationship',
  turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]
 }));
 const institutions=(s.socialCircles?.groups||[]).flatMap(g=>(g.institution?.history||[]).filter(h=>['split','merger','defection','declining','recovered'].includes(h.kind)).map((h,i)=>({id:'institution-'+g.id+'-'+h.age+'-'+i,age:h.age,title:g.name+' — '+h.text,category:g.kind==='professional'?'career':'relationship',turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]})));
 const leadership=(s.socialCircles?.groups||[]).flatMap(g=>(g.governance?.results||[]).filter(r=>r.outcome==='new-leadership').map(r=>({id:'leadership-'+r.id,age:r.age,title:g.name+' — '+r.winnerName+' elected',category:g.kind==='professional'?'career':'relationship',turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]})));
 const publicAlliances=(s.organizationNetwork?.completed||[]).filter(x=>
  ['coalition','public-feud','negotiated','fractured'].includes(x.ending)).map(x=>({
  id:'intergroup-'+x.id,age:x.endedAge,
  title:x.aName+' & '+x.bName+' — '+x.ending,
  category:'relationship',turning:true,source:'memory',
  choice:'',netWorth:0,changes:[],bonds:[],future:[]
 }));
 const playablePublic=(s.playableEvents?.completed||[]).filter(x=>[
   'agreement','celebrated','merit','new-leader','escalation','controversy','disputed'
  ].includes(x.ending)).map(x=>({
   id:'played-event-'+x.id,age:x.endedAge,
   title:'Hosted '+x.mode+': '+x.groupA+' & '+x.groupB+' — '+x.ending,
   category:x.mode==='competition'?'career':'relationship',
   turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]
  }));
 const aftermath=[...(s.publicAftermath?.threads||[]),...(s.publicAftermath?.archive||[])]
  .flatMap(t=>(t.history||[]).filter(h=>h.kind==='player'||h.kind==='ending')
  .map((h,i)=>({
   id:'aftermath-'+t.id+'-'+h.kind+'-'+h.age+'-'+i,
   age:h.age,title:t.title+' — '+h.text,
   category:t.kind.includes('professional')?'career':'relationship',
   turning:h.kind==='ending',source:'memory',
   choice:'',netWorth:0,changes:[],bonds:[],future:[]
  })));
 const civic=(s.civicMandates?.completed||[]).map(t=>({
  id:'civic-'+t.id,age:t.endedAge,
  title:'Public mandate: '+({
   'family-support':'Family care & neighborhood support',
   'skills-access':'Apprenticeship & skills access',
   'shared-space':'Shared neighborhood spaces',
   'community-standards':'Community program standards'
  }[t.issue]||t.issue)+' — '+t.groupAName+' & '+t.groupBName+' — '+t.ending,
  category:t.issue==='skills-access'?'career':'relationship',
  turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]
 }));
 const delivery=(s.civicMandates?.deliveries||[]).filter(x=>x.ending&&x.endedAge!==null).map(x=>({id:'delivery-'+x.id,age:x.endedAge,title:'Public delivery review — '+x.groupAName+' & '+x.groupBName+' — '+x.ending,category:'relationship',turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]}));
 const reversals=(s.civicMandates?.reversals||[]).filter(x=>x.ending&&x.endedAge!==null).map(x=>({id:'reversal-'+x.id,age:x.endedAge,title:'Public accountability — '+x.issue.replaceAll('-',' ')+' — '+x.ending,category:'relationship',turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]}));
 const outings=(s.everydayScenes?.completed||[]).filter(x=>x.type==='outing'&&x.outcome!=='interrupted'&&!x.inheritedFrom).map(x=>({id:'outing-'+x.id,age:x.endedAge,title:x.track+' — '+(x.collectible||x.outcome.replaceAll('-',' ')),category:'relationship',turning:!!x.collectible,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]}));
 const romance=(s.romance?.history||[]).filter(x=>['engaged','wedding','reunited','repair','separated','parenting'].includes(x.kind)).map(x=>({id:'romance-'+x.id,age:x.age,title:x.name+' — '+x.description,category:'relationship',turning:x.kind!=='parenting',source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]}));
 const estates=(s.estatePlan?.history||[]).filter(x=>['plan','dispute','agreement','unresolved'].includes(x.kind)).map(x=>({id:'estate-'+x.id,age:x.age,title:x.message,category:'relationship',turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]}));
 const businessStories=(s.empire?.history||[]).filter(x=>['acquisition','closure','crisis','comeback'].includes(x.kind)).map(x=>({id:'empire-'+x.id,age:x.age,title:x.message,category:'career',turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]}));
 const celebrityStories=(s.celebrity?.history||[]).filter(x=>['hit','award','contract','fulfilled','controversy','comeback'].includes(x.kind)).map(x=>({id:'celebrity-'+x.id,age:x.age,title:x.message,category:'career',turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]}));
 const sportStories=(s.sportContracts?.history||[]).filter(x=>['contract','transfer','completed','release'].includes(x.kind)).map(x=>({id:'sportdeal-'+x.id,age:x.age,title:x.message,category:'career',turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]}));
 const spotlightStories=(s.spotlight?.history||[]).filter(x=>['completed','collaboration','competition','ceremony'].includes(x.kind)).map(x=>({id:'spotlight-'+x.id,age:x.age,title:x.message,category:'career',turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]}));
 const justiceStories=(s.justiceJourney?.history||[]).filter(x=>['verdict','released','recovery','case-result'].includes(x.kind)).map(x=>({id:'justice-'+x.id,age:x.age,title:x.message,category:'justice',turning:true,source:'memory',choice:'',netWorth:0,changes:[],bonds:[],future:[]}));
 const all=[...journal,...echoes,...fates,...social,...npcPlans,...competingFutures,...influence,...circleStories,...institutions,...leadership,...publicAlliances,...playablePublic,...aftermath,...civic,...delivery,...reversals,...outings,...romance,...estates,...businessStories,...celebrityStories,...sportStories,...spotlightStories,...justiceStories,...entries.map(e=>({...e,source:'choice'}))]
  .sort((a,b)=>a.age-b.age||(a.source==='history'?-1:1));
 const timeline=all.slice(-90);
 // Include the birth marker even in long lives, without affecting chronology.
 if(timeline.length&&timeline[0].age>0){
  const birth=journal.find(x=>x.age===0);
  if(birth)timeline.unshift(birth);
 }
 const highlights=entries.filter(x=>x.turning).slice(-4).reverse();
 const spotlight=c.spotlight||highlights[0]||null;
 const chapters=STAGES.map(stage=>({
  ...stage,active:s.age>=stage.start&&s.age<=stage.end,
  count:timeline.filter(e=>e.age>=stage.start&&e.age<=stage.end).length
 }));
 return {stage:chronicleStage(s.age),chapters,timeline,highlights,spotlight,
  totalChoices:s.scenario?.choices||0,turningCount:entries.filter(x=>x.turning).length,
  ancestors:(c.ancestors||[]).slice(-MAX_ANCESTORS).reverse(),
  hasLegacyHistory:!!(s.history||[]).length&&!entries.length,
  currentAge:s.age,alive:s.alive};
}
export function chronicleInheritance(next,old){
 const previous=chronicleState(old),best=[...(previous.entries||[])].filter(x=>x.turning).slice(-1)[0];
 next.chronicle={version:1,entries:[],spotlight:null,ancestors:[
  ...(previous.ancestors||[]),
  {name:clip(old.name,32),generation:old.generation,age:old.age,
   note:clip(best?.title||old.history?.at(-1)?.text||'A life remembered',130)}
 ].slice(-MAX_ANCESTORS)};
}
export function validateChronicle(c){
 if(c===undefined)return true;
 const string=s=>typeof s==='string'&&s.length<=300;
 const entry=e=>e&&string(e.id)&&Number.isInteger(e.age)&&e.age>=0&&e.age<=110&&
  string(e.title)&&string(e.choice)&&string(e.category)&&typeof e.turning==='boolean'&&
  Array.isArray(e.changes)&&e.changes.length<=12&&e.changes.every(x=>string(x.key)&&string(x.label)&&finite(x.change))&&
  Array.isArray(e.bonds)&&e.bonds.length<=6&&e.bonds.every(x=>string(x.name)&&finite(x.change))&&
  finite(e.netWorth)&&Array.isArray(e.future)&&e.future.length<=3&&e.future.every(x=>string(x.id)&&string(x.label)&&string(x.detail)&&Number.isInteger(x.age)&&x.age>=0&&x.age<=110);
 return !!c&&c.version===1&&Array.isArray(c.entries)&&c.entries.length<=MAX_ENTRIES&&
  c.entries.every(entry)&&new Set(c.entries.map(x=>x.id)).size===c.entries.length&&
  (c.spotlight===null||entry(c.spotlight))&&Array.isArray(c.ancestors)&&
  c.ancestors.length<=MAX_ANCESTORS&&c.ancestors.every(x=>string(x.name)&&string(x.note)&&Number.isInteger(x.age)&&x.age>=0&&x.age<=110&&Number.isInteger(x.generation)&&x.generation>0);
}
