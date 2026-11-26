// Lifely's deterministic emotional continuity layer. This never draws RNG or
// advances the year: old conversations can return through the normal dialogue action.
const MAX_THREADS=24,MAX_ANCESTORS=8;
const safeText=(x,n=160)=>String(x??'').replace(/\s+/g,' ').trim().slice(0,n);
const validNumber=n=>typeof n==='number'&&Number.isFinite(n);
export const emptyEmotional=()=>({version:1,counter:0,threads:[],ancestors:[]});
export const emotionalState=s=>s.emotional||emptyEmotional();
const ensure=s=>s.emotional??=emptyEmotional();
const active=thread=>thread.status==='waiting'||thread.status==='ready';
export const emotionalReadyFor=(s,personId)=>(
 emotionalState(s).threads.findLast(x=>x.personId===personId&&x.status==='ready')||null);
export function emotionalView(s){
 const e=emotionalState(s);
 const rows=(e.threads||[]).slice().reverse();
 return {ready:rows.filter(x=>x.status==='ready'),
  waiting:rows.filter(x=>x.status==='waiting'),
  remembered:rows.filter(x=>x.status==='resolved'||x.status==='faded'||x.status==='superseded').slice(0,12),
  ancestors:(e.ancestors||[]).slice().reverse(),
  count:rows.length};
}
const memoryQuote=(record,profile)=>{
 const line=record.choices?.[0]===0?'you listened without rushing me':
 record.choices?.[0]===1?'you asked what was underneath my worry':
 'you challenged what I believed';
 const emphasis=profile?.personality==='Competitive'?'You never made it easy for me.':
 profile?.personality==='Supportive'?'I held on to the kindness in it.':
 profile?.personality==='Cautious'?'It took me a long time to revisit.':
 profile?.personality==='Driven'?'I kept wondering what we could have done next.':
 profile?.personality==='Creative'?'I still picture that day clearly.':
 'I have thought about that conversation more than once.';
 return safeText('I remember '+line+'. '+emphasis,200);
};
export function emotionalRecordConversation(s,record,profile,{reunionId=null}={}){
 if(!record.complete||!record.id)return null;
 const e=ensure(s);
 if(reunionId){
  const source=e.threads.find(x=>x.id===reunionId&&x.personId===record.id&&x.status==='ready');
  if(source){
   source.status='resolved';
   source.resolvedAge=s.age;
   source.reunionOutcome=record.outcome;
   source.finalLine=safeText(record.outcome==='trusted'?
    'You found a way back to each other. The years did not erase what happened.':
    record.outcome==='strained'?
    'You spoke again, but some distance remains. The story is not neatly fixed.':
    'You understand each other differently now, even if everything is not settled.',200);
  }
 }else{
  // The next conversation may replace an earlier one without falsely claiming a reunion happened.
  for(const old of e.threads.filter(x=>x.personId===record.id&&active(x))){
   old.status='superseded';old.resolvedAge=s.age;
   old.finalLine='A newer conversation changed the direction before this memory returned.';
  }
 }
 const afterYears=reunionId?5:record.outcome==='strained'?2:3;
 const memory={id:'memory-g'+s.generation+'-'+(++e.counter),personId:safeText(record.id,80),
  personName:safeText(record.speaker,70),theme:safeText(record.theme,90),
  personality:safeText(profile?.personality||'Thoughtful',35),
  sourceAge:s.age,dueAge:Math.min(110,s.age+afterYears),
  status:s.age+afterYears>110?'faded':'waiting',
  firstChoice:Number.isInteger(record.choices?.[0])?record.choices[0]:1,
  originalOutcome:record.outcome,quote:memoryQuote(record,profile),
  reunionFrom:reunionId||null,resolvedAge:null,reunionOutcome:null,finalLine:null};
 e.threads.push(memory);
 e.threads=e.threads.slice(-MAX_THREADS);
 return memory;
}
export function emotionalYear(s,{add}){
 const e=s.emotional;if(!e?.threads?.length)return;
 const ids=new Set([
  ...(s.people||[]).filter(p=>p.alive).map(p=>'person-'+p.id),
  ...(s.world?.autonomy?.alumni||[]).map(p=>p.id),
  ...(s.world?.characters?.athletes||[]).map(p=>p.id),
  ...(s.world?.characters?.politicians||[]).map(p=>p.id),
  ...(s.world?.characters?.agents||[]).map(p=>p.id)
 ]);
 for(const memory of e.threads){
  if(!active(memory))continue;
  if(!ids.has(memory.personId)){
   memory.status='faded';memory.resolvedAge=s.age;
   memory.finalLine=memory.personName+' is no longer available to revisit this memory.';
   continue;
  }
  if(memory.status==='waiting'&&s.age>=memory.dueAge){
   memory.status='ready';
   add(s,memory.personName+' remembers a conversation from age '+memory.sourceAge+
    '. You can reconnect through People when ready.','people');
  }
 }
}
export function emotionalInheritance(next,old){
 const prev=emotionalState(old),e=emptyEmotional();
 const last=(prev.threads||[]).filter(x=>x.status==='resolved'||x.status==='ready').slice(-2);
 const note=last.length?last.map(x=>x.personName+': '+x.theme).join(' · '):
  'Stories and relationships shaped this generation.';
 e.ancestors=[...(prev.ancestors||[]),{name:safeText(old.name,32),generation:old.generation,
  note:safeText(note,180)}].slice(-MAX_ANCESTORS);
 next.emotional=e;
}
export function validateEmotional(e){
 if(e===undefined)return true;
 const str=(x,n)=>typeof x==='string'&&x.length<=n;
 const outcomes=['trusted','strained','understood'];
 const statuses=['waiting','ready','resolved','faded','superseded'];
 const thread=x=>x&&str(x.id,80)&&str(x.personId,80)&&str(x.personName,70)&&str(x.theme,90)&&
  str(x.personality,35)&&Number.isInteger(x.sourceAge)&&x.sourceAge>=0&&x.sourceAge<=110&&
  Number.isInteger(x.dueAge)&&x.dueAge>=x.sourceAge&&x.dueAge<=110&&
  statuses.includes(x.status)&&[0,1,2].includes(x.firstChoice)&&
  outcomes.includes(x.originalOutcome)&&str(x.quote,200)&&
  (x.reunionFrom===null||str(x.reunionFrom,80))&&
  (x.resolvedAge===null||(Number.isInteger(x.resolvedAge)&&x.resolvedAge>=0&&x.resolvedAge<=110))&&
  (x.reunionOutcome===null||outcomes.includes(x.reunionOutcome))&&
  (x.finalLine===null||str(x.finalLine,200));
 return !!e&&e.version===1&&Number.isInteger(e.counter)&&e.counter>=0&&
  Array.isArray(e.threads)&&e.threads.length<=MAX_THREADS&&e.threads.every(thread)&&
  new Set(e.threads.map(x=>x.id)).size===e.threads.length&&
  Array.isArray(e.ancestors)&&e.ancestors.length<=MAX_ANCESTORS&&e.ancestors.every(x=>
   str(x.name,32)&&str(x.note,180)&&Number.isInteger(x.generation)&&x.generation>0);
}
