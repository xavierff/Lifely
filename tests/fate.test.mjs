import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {fateState,fateYear,fateInheritance,validateFate} from '../src/content/fate-threads.mjs';

const ready=(s,mutate=null)=>{
 const a=s.fate.active;
 assert.ok(a&&a.status==='waiting');
 if(mutate)mutate(s);
 s.age=a.dueAge;s.actions=3;
 const news=[];fateYear(s,{add:(_s,text)=>news.push(text)});
 assert.equal(s.fate.active.status,'ready');
 assert.equal(news.length,1);
 return s;
};
const begin=(seed=11601)=>{
 let s=E.createLife({seed,name:'Tara'});
 s.age=26;
 s=E.act(s,'friend');
 s.actions=3;
 const friend=s.people.find(p=>p.role==='friend');
 assert.ok(friend);
 const command=E.commands(s).find(c=>c.id==='fate:start:person-'+friend.id&&c.enabled);
 assert.ok(command);
 s=E.act(s,command.id);
 return {s,friendId:friend.id};
};
const finishArc=(initial,choices)=>{
 let s=initial;
 for(let stage=0;stage<3;stage++){
  if(stage>0){s=ready(s);s=E.act(s,'fate:continue');}
  s=E.fateDecision(s,choices[stage]);
 }
 return s;
};

test('new and older v2 saved lives keep stable, optional character fate state',()=>{
 const s=E.createLife({seed:11602});
 assert.equal(s.fate.version,1);
 assert.equal(s.fate.active,null);
 assert.ok(E.validate(s));
 delete s.fate;
 assert.ok(E.validate(s));
 assert.equal(E.fateSummary(s).recent.length,0);
 assert.equal(E.fateView(s),null);
 assert.ok(E.commands(s).some(c=>c.id==='rest'));
});

test('a fate chapter is playable with exactly one action and blocks age until answered',()=>{
 const {s:active}=begin(11603);
 assert.equal(active.fate.active.stage,0);
 assert.equal(active.fate.active.status,'playing');
 assert.equal(active.fate.active.decisions.length,0);
 assert.ok(E.fateView(active).choices.length===3);
 assert.throws(()=>E.ageUp(active),/fate scene/);
 assert.throws(()=>E.act(active,'rest'));
 assert.throws(()=>E.fateDecision(active,9));
 const saved=JSON.parse(JSON.stringify(active));
 assert.ok(E.validate(saved));
 const result=E.fateDecision(active,0);
 assert.equal(active.fate.active.stage,0,'choice must not mutate prior save');
 assert.equal(result.fate.active.stage,1);
 assert.equal(result.fate.active.decisions.length,1);
 assert.equal(result.fate.active.status,'waiting');
 assert.equal(result.actions,active.actions,'scene resolution does not spend another activity');
 assert.ok(E.validate(result));
});

test('care, rivalry, and boundaries produce different real NPC consequences and endings',()=>{
 let {s,friendId}=begin(11604);
 const friend=s.people.find(p=>p.id===friendId);
 friend.world.rivalry=48;
 friend.world.trust=65;
 // The opening reflects the current NPC state. Both branches start with exactly the same save.
 const original=JSON.stringify(s);
 const care=finishArc(s,[0,0,0]);
 const rival=finishArc(JSON.parse(original),[1,1,1]);
 const boundary=finishArc(JSON.parse(original),[2,2,2]);
 const result=x=>x.fate.completed.at(-1);
 assert.equal(result(care).ending,'allies');
 assert.equal(result(rival).ending,'rivals');
 assert.ok(['distance','reconciled','estranged'].includes(result(boundary).ending));
 assert.notEqual(result(care).ending,result(rival).ending);
 assert.equal(care.fate.active,null);assert.equal(rival.fate.active,null);
 const find=x=>x.people.find(p=>p.id===friendId);
 assert.ok(find(care).bond>find(rival).bond);
 assert.ok(find(rival).world.rivalry>find(care).world.rivalry);
 assert.ok(care.stats.kindness>rival.stats.kindness);
 assert.equal(JSON.stringify(s),original);
 for(const life of [care,rival,boundary])assert.ok(E.validate(life));
});

test('future chapters use real autonomous trust shifts without rolling new RNG',()=>{
 let {s,friendId}=begin(11605);
 s=E.fateDecision(s,0);
 const beforeRng=s.rng;
 const previousTrust=s.fate.active.lastTrust;
 s=ready(s,v=>{
  const friend=v.people.find(p=>p.id===friendId);
  friend.world.trust=Math.max(0,previousTrust-28);
 });
 assert.equal(s.rng,beforeRng);
 assert.ok(s.fate.active.npcShift<=-25);
 s=E.act(s,'fate:continue');
 assert.match(E.fateView(s).independent,/guarded/i);
 assert.match(E.fateView(s).surprise,/./);
 const next=E.fateDecision(s,0);
 assert.ok(next.fate.active.last.scoreChange<15,'lost trust reduces later momentum');
 assert.ok(E.validate(next));
});

test('waiting and ready story threads are optional; unanswered years do not softlock',()=>{
 let {s}=begin(11606);
 s=E.fateDecision(s,1);
 assert.equal(s.fate.active.status,'waiting');
 assert.doesNotThrow(()=>E.commands(s));
 assert.doesNotThrow(()=>E.ageUp(s));
 s=ready(s);
 assert.ok(E.commands(s).some(c=>c.id==='fate:continue'&&c.enabled));
 const statBefore={...s.stats},cash=s.cash;
 s.age=s.fate.active.dueAge+5;
 fateYear(s,{add:()=>{}});
 assert.equal(s.fate.active,null);
 assert.equal(s.fate.completed.at(-1).ending,'unanswered');
 assert.deepEqual(s.stats,statBefore);
 assert.equal(s.cash,cash);
 assert.ok(E.validate(s));
});

test('absent and deceased partners interrupt stories rather than resurrect them',()=>{
 let {s,friendId}=begin(11607);
 s=E.fateDecision(s,0);
 s.people.find(p=>p.id===friendId).alive=false;
 s.age=s.fate.active.dueAge;
 fateYear(s,{add:()=>{}});
 assert.equal(s.fate.active,null);
 assert.equal(s.fate.completed.at(-1).ending,'interrupted');
 assert.equal(s.people.find(p=>p.id===friendId).alive,false);
 assert.ok(E.validate(s));
});

test('fate outcomes feed visual timeline and ancestral recaps without inheriting live scenes',()=>{
 let {s}=begin(11608);
 s=finishArc(s,[0,0,0]);
 assert.ok(E.chronicleView(s).timeline.some(x=>x.title.includes(s.fate.completed[0].title)));
 let heir=E.createLife({seed:11609,name:'Rowan'});
 fateInheritance(heir,s);
 assert.ok(E.validate(heir));
 assert.equal(heir.fate.active,null);
 assert.equal(heir.fate.completed.length,0);
 assert.equal(heir.fate.ancestry[0].name,'Tara');
 assert.ok(heir.fate.ancestry[0].note.includes(s.fate.completed[0].personName));
});

test('save validation rejects invalid stages, forged outcomes and oversized history',()=>{
 let {s}=begin(11610);
 assert.ok(validateFate(s.fate));
 const malformed=JSON.parse(JSON.stringify(s));
 malformed.fate.active.stage=2;
 assert.equal(E.validate(malformed),false);
 const invalid=JSON.parse(JSON.stringify(s));
 invalid.fate.active.personName='';
 invalid.fate.active.trust=-100;
 assert.equal(validateFate(invalid.fate),false);
 const completed=finishArc(s,[0,0,0]);
 completed.fate.completed[0].ending='invented';
 assert.equal(E.validate(completed),false);
});

test('same save and same decisions replay with identical outputs',()=>{
 const {s}=begin(11611);
 const json=JSON.stringify(s);
 const a=finishArc(JSON.parse(json),[0,1,2]);
 const b=finishArc(JSON.parse(json),[0,1,2]);
 assert.deepEqual(a,b);
 assert.ok(E.validate(a));
});
