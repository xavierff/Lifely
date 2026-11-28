import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {outings} from '../src/content/playful-life.mjs';
import {inheritEveryday,everydayYear} from '../src/content/everyday-scenes.mjs';
const life=(age,seed=131001)=>{const s=E.createLife({seed,name:'Alex'});s.age=age;s.pending=null;s.actions=3;return s;};
const key=id=>'scene:start:outing:'+id;
const complete=(s,choices=[0,1,0])=>choices.reduce((n,i)=>E.sceneChoice(n,i),s);
test('1.31: nineteen distinct authored experiences have age gates and different scenes',()=>{
 assert.equal(outings.length,19);assert.equal(new Set(outings.map(d=>d.id)).size,19);
 assert.equal(new Set(outings.flatMap(d=>d.rounds.map(r=>r.cue))).size,57);
 const child=life(8),teen=life(15),adult=life(28),senior=life(70);
 assert.ok(E.commands(child).some(c=>c.id===key('treasure')&&c.enabled));
 assert.ok(!E.commands(child).some(c=>c.id===key('dance-night')));
 assert.ok(E.commands(teen).some(c=>c.id===key('club-election')&&c.enabled));
 assert.ok(!E.commands(teen).some(c=>c.id===key('first-date')));
 assert.ok(!E.commands(adult).some(c=>c.id===key('teen-crush')));
 assert.ok(E.commands(adult).some(c=>c.id===key('career-mixer')&&c.enabled));
 assert.ok(E.commands(senior).some(c=>c.id===key('later-adventure')&&c.enabled));
});
test('1.31: childhood outing creates recurring school peers, three decisions and a real callback',()=>{
 const s=life(9,131002),a=E.act(s,key('treasure'));
 assert.equal(a.actions,2);assert.equal(a.everydayScenes.classmates.length,4);
 const peer=a.everydayScenes.active.classmateId;
 assert.ok(a.everydayScenes.classmates.some(p=>p.id===peer));
 assert.equal(E.everydayView(a).round,1);assert.throws(()=>E.ageUp(a),/everyday scene/);
 assert.throws(()=>E.sceneChoice(a,4),/three responses/);
 const b=E.sceneChoice(a,1);assert.ok(E.validate(JSON.parse(JSON.stringify(b))));
 assert.deepEqual(E.sceneChoice(a,1),b);
 const n=complete(b,[1,1]);
 assert.equal(n.age,9);assert.equal(n.actions,2);assert.equal(E.everydayView(n),null);
 assert.ok(n.everydayScenes.classmates.find(x=>x.id===peer).history.length);
 assert.ok(n.everydayScenes.callbacks.some(x=>x.classmateId===peer));
 assert.ok(E.commands(n).filter(c=>c.id.startsWith('scene:start:outing:')).every(c=>!c.enabled));
 assert.equal(n.cash,s.cash);assert.ok(E.validate(n));
});
test('1.31: school crush requires an existing age-appropriate peer and does not create a partnership',()=>{
 let s=life(15,131003);
 assert.ok(!E.commands(s).some(c=>c.id===key('teen-crush')));
 s=E.act(s,key('dance-night'));s=complete(s);
 s.age++;s.actions=3;
 assert.ok(E.commands(s).some(c=>c.id===key('teen-crush')&&c.enabled));
 const a=E.act(s,key('teen-crush'));
 assert.ok(a.everydayScenes.active.classmateId);assert.equal(a.everydayScenes.active.personId,null);
 const n=complete(a,[0,0,0]);
 assert.equal(n.people.filter(p=>p.role==='partner').length,s.people.filter(p=>p.role==='partner').length);
 assert.ok(E.validate(n));
});
test('1.31: adult date requires a living adult partner and updates their real bond',()=>{
 let s=life(28,131004);
 assert.ok(!E.commands(s).some(c=>c.id===key('first-date')));
 s=E.act(s,'date');s.actions=3;
 const p=s.people.find(p=>p.role==='partner');
 const a=E.act(s,key('first-date'));assert.equal(a.everydayScenes.active.personId,p.id);
 const n=complete(a,[0,0,0]);
 assert.ok(n.people.find(x=>x.id===p.id).bond>=p.bond);
 assert.ok(n.everydayScenes.callbacks.some(x=>x.personId===p.id&&x.dueAge===30));
 assert.equal(n.cash,s.cash);assert.ok(E.validate(n));
});
test('1.31: contrasting strategies change the simulated meters and results',()=>{
 const s=life(25,131005),a=E.act(s,key('street-festival'));
 const cooperative=E.sceneChoice(a,1),daring=E.sceneChoice(a,2);
 assert.ok(cooperative.everydayScenes.active.connection>daring.everydayScenes.active.connection);
 assert.ok(daring.everydayScenes.active.tension>cooperative.everydayScenes.active.tension);
 assert.equal(a.everydayScenes.active.stage,0);
 assert.ok(E.validate(cooperative));assert.ok(E.validate(daring));
});
test('1.31: rare memories survive ordinary scene history and transfer only as ancestor records',()=>{
 let n=null;
 for(let seed=131010;seed<131035;seed++){
  const s=life(10,seed);for(const k of Object.keys(s.stats))s.stats[k]=100;s.stats.stress=0;
  const candidate=complete(E.act(s,key('sleepover')),[0,0,0]);
  if(candidate.everydayScenes.outingCollection?.length){n=candidate;break;}
 }
 assert.ok(n,'high skill and balanced choices should unlock a rare memory');
 const memory=n.everydayScenes.outingCollection[0];
 assert.equal(memory.activityId,'sleepover');assert.ok(E.chronicleView(n).timeline.some(x=>x.title.includes(memory.title)));
 const old=structuredClone(n);delete old.everydayScenes.outingCollection;assert.ok(E.validate(old));
 const corrupt=structuredClone(n);corrupt.everydayScenes.outingCollection.push({...memory});assert.equal(E.validate(corrupt),false);
 const heir=life(0,131006);inheritEveryday(heir,n);
 assert.equal(heir.everydayScenes.outingCollection.length,0);assert.equal(heir.everydayScenes.outingLegacy[0].title,memory.title);
 assert.equal(heir.everydayScenes.classmates.length,0);assert.equal(heir.everydayScenes.callbacks.length,0);assert.ok(E.validate(heir));
});
test('1.31: abandonment spends the original activity only and permits ordinary aging',()=>{
 const a=E.act(life(30,131007),key('career-mixer')),n=E.sceneChoice(a,'leave');
 assert.equal(n.actions,2);assert.equal(n.everydayScenes.completed.at(-1).outcome,'interrupted');
 assert.equal(E.everydayView(n),null);assert.ok(E.validate(n));assert.ok(E.validate(E.ageUp(n)));
});
test('1.31: four additional hobbies are available and preserve old profiles',()=>{
 const s=life(20,131008);assert.equal(E.hobbyTypes.length,12);
 for(const id of ['tabletennis','improv','puzzlerally','craftdesign']){
  const a=E.act(s,'hobby:start:'+id+':practice');assert.equal(E.hobbyView(a).total,3);
  const n=[0,1,2].reduce((x,i)=>E.hobbyDecision(x,i),a);assert.equal(n.actions,2);assert.ok(E.hobbySummary(n).profiles.find(x=>x.id===id).mastery>0);assert.ok(E.validate(n));
 }
});
