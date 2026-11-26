import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {emotionalView,emotionalYear,emotionalInheritance,emotionalRecordConversation,validateEmotional} from '../src/content/emotional-memory.mjs';

function completeDialogue(s,id='person-1',choices=[0,1,0]){
 s=E.act(s,'dialogue:open:'+id);
 for(const choice of choices){s=E.dialogueReply(s,choice);assert.ok(E.validate(s));}
 return s;
}
test('first personal conversation plants a bounded age-specific memory without changing RNG',()=>{
 let s=E.createLife({seed:991501,name:'Mika'});s.age=20;s.actions=3;
 const startRng=s.rng;
 s=completeDialogue(s);
 const x=emotionalView(s).waiting[0];
 assert.ok(x);
 assert.equal(s.rng,startRng);
 assert.equal(x.personId,'person-1');
 assert.equal(x.sourceAge,20);
 assert.equal(x.dueAge,23);
 assert.equal(x.originalOutcome,'trusted');
 assert.match(x.quote,/I remember/);
 assert.equal(E.dialogueView(s),null);
 assert.equal(E.validate(JSON.parse(JSON.stringify(s))),true);
});

test('memories mature in later years with no forced story, reward or extra RNG',()=>{
 let s=E.createLife({seed:991502});s.age=20;s=completeDialogue(s);
 const before={cash:s.cash,stats:{...s.stats},rng:s.rng};
 s.age=23;const added=[];
 emotionalYear(s,{add:(_s,text,kind)=>added.push({text,kind})});
 assert.equal(emotionalView(s).ready.length,1);
 assert.equal(s.cash,before.cash);
 assert.deepEqual(s.stats,before.stats);
 assert.equal(s.rng,before.rng);
 assert.equal(added.length,1);
 emotionalYear(s,{add:(_s,text)=>added.push(text)});
 assert.equal(added.length,1,'no repeated yearly notifications');
 assert.ok(E.validate(s));
});

test('reunion has three playable stages, different replies and lasting records',()=>{
 let s=E.createLife({seed:991503});s.age=20;s=completeDialogue(s,'person-1',[2,2,2]);
 assert.equal(s.emotional.threads[0].originalOutcome,'strained');
 s.age=22;s.actions=3;emotionalYear(s,{add:()=>{}});
 assert.equal(emotionalView(s).ready.length,1);
 const original=JSON.stringify(s);
 let recon=E.act(s,'dialogue:open:person-1');
 assert.equal(JSON.stringify(s),original,'starting a reunion is immutable');
 assert.equal(recon.actions,2);
 assert.equal(E.dialogueView(recon).reunion.years,2);
 assert.match(E.dialogueView(recon).line,/2 years/);
 assert.match(E.dialogueView(recon).choices[0].text,/Acknowledge/);
 recon=E.dialogueReply(recon,0);
 assert.ok(E.dialogueView(recon).reaction.includes('more open'));
 assert.match(E.dialogueView(recon).line,/You remembered/);
 recon=E.dialogueReply(recon,1);
 assert.match(E.dialogueView(recon).line,/did not forget/i);
 recon=E.dialogueReply(recon,0);
 assert.equal(E.dialogueView(recon),null);
 assert.equal(recon.emotional.threads[0].status,'resolved');
 assert.equal(recon.emotional.threads[0].resolvedAge,22);
 assert.equal(recon.emotional.threads[0].reunionOutcome,'trusted');
 assert.equal(recon.world.network.dialogues.at(-1).reunionFrom,recon.emotional.threads[0].id);
 assert.equal(emotionalView(recon).waiting.length,1);
 assert.ok(E.chronicleView(recon).timeline.some(x=>x.title.includes('Reunion with')));
 assert.ok(E.validate(recon));
});

test('someone leaving or dying prevents false reunion without punishing the player',()=>{
 let s=E.createLife({seed:991504});s.age=20;s=completeDialogue(s);
 s.people[0].alive=false;s.age=23;
 const initialCash=s.cash,initialRng=s.rng,initialHappiness=s.stats.happiness;
 emotionalYear(s,{add:()=>{}});
 assert.equal(emotionalView(s).ready.length,0);
 assert.equal(s.emotional.threads[0].status,'faded');
 assert.equal(s.cash,initialCash);assert.equal(s.rng,initialRng);
 assert.equal(s.stats.happiness,initialHappiness);
 assert.ok(E.validate(s));
});

test('a newer direct talk supersedes an unscheduled earlier echo',()=>{
 let s=E.createLife({seed:991505});s.age=20;s=completeDialogue(s);
 s.age=21;s.actions=3;
 s=completeDialogue(s,'person-1',[1,1,1]);
 assert.equal(s.emotional.threads[0].status,'superseded');
 assert.equal(s.emotional.threads[1].status,'waiting');
 assert.equal(s.emotional.threads[1].sourceAge,21);
 assert.ok(E.validate(s));
});

test('old saves and heirs remain compatible without resurrecting old callbacks',()=>{
 const older=E.createLife({seed:991506});delete older.emotional;
 assert.ok(E.validate(older));assert.equal(emotionalView(older).ready.length,0);
 let parent=E.createLife({seed:991507});parent.age=23;parent=completeDialogue(parent);
 const heir=E.createLife({seed:991508});emotionalInheritance(heir,parent);
 assert.ok(E.validate(heir));
 assert.equal(heir.emotional.threads.length,0);
 assert.equal(heir.emotional.ancestors[0].name,parent.name);
 assert.equal(heir.emotional.ancestors[0].generation,1);
});

test('only 24 emotional echoes survive and malformed memory invalidates saves',()=>{
 const s=E.createLife({seed:991509});s.age=18;
 const original={cash:s.cash,rng:s.rng,stats:{...s.stats}};
 for(let i=0;i<40;i++){s.age=18+i%10;emotionalRecordConversation(s,
  {id:'person-1',speaker:s.people[0].name,theme:'A difficult decision',choices:[0,1,2],complete:true,outcome:'understood'},
  {personality:'Driven'});}
 assert.equal(s.emotional.threads.length,24);
 assert.ok(s.emotional.counter===40);
 assert.equal(new Set(s.emotional.threads.map(x=>x.id)).size,24);
 assert.equal(s.cash,original.cash);assert.deepEqual(s.stats,original.stats);assert.equal(s.rng,original.rng);
 assert.ok(validateEmotional(s.emotional));assert.ok(E.validate(s));
 s.emotional.threads[0].dueAge=-1;
 assert.equal(validateEmotional(s.emotional),false);
 assert.equal(E.validate(s),false);
});

test('reuniting in a normal simulation retains yearly action and decision gates',()=>{
 let s=E.createLife({seed:991510});s.age=20;s=completeDialogue(s);
 for(let i=0;i<3;i++){
  s=E.ageUp(s);
  if(s.pending!==null)s=E.resolve(s,0);
  assert.ok(E.validate(s));
 }
 assert.equal(emotionalView(s).ready.length,1);
 const command=E.commands(s).find(c=>c.id==='dialogue:open:person-1');
 assert.ok(command.enabled);
 s=E.act(s,command.id);
 assert.throws(()=>E.ageUp(s));
 assert.equal(s.actions,2);
 s=E.dialogueReply(s,'leave');
 assert.equal(emotionalView(s).ready.length,1,'leaving does not fabricate a completed reunion');
 assert.throws(()=>E.act(s,command.id));
 assert.ok(E.validate(s));
});
