import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {emptyProfile,mergeLife,validProfile} from '../src/profile.mjs';
import {miniRound} from '../src/content/minigames.mjs';
import {rippleTypes,ensureRipples,rippleFromChoice} from '../src/content/ripples.mjs';
import {ensureNetwork,conversationPeople,relationshipYear} from '../src/content/relationships.mjs';
test('1000 full lifetimes preserve invariants',()=>{for(let i=1;i<=1000;i++){let s=E.createLife({seed:i,country:i%6});while(s.alive){if(s.pending!==null)s=E.resolve(s,i%2);else{if(s.age>=18&&s.age<60&&!s.job&&!s.profession&&!s.retired&&!s.business){let job=E.commands(s).find(c=>c.id.startsWith('job:')&&c.enabled);if(job)s=E.act(s,job.id);}if(s.actions&&s.stats.stress>40)s=E.act(s,'rest');s=E.ageUp(s);}assert.ok(E.validate(s));}assert.ok(s.age<=110);}});
test('same seed, immutable state and save roundtrip',()=>{let s=E.createLife({seed:42});assert.deepEqual(E.ageUp(s),E.ageUp(s));assert.equal(s.age,0);assert.ok(E.validate(JSON.parse(JSON.stringify(s))));assert.equal(E.validate({version:2}),false);});
test('asset accounting and inheritance',()=>{let s=E.createLife({seed:9});s.age=30;s.cash=500000;s.stats.knowledge=90;s=E.act(s,'buy:house');assert.equal(E.worth(s),500000);s=E.act(s,'invest:10000');assert.equal(E.worth(s),500000);s=E.act(s,'date');s.actions=3;s=E.act(s,'child');let child=s.people.find(p=>p.role==='child');s.alive=false;s.pending=null;let heir=E.legacy(s,child.id);assert.equal(heir.generation,2);assert.equal(heir.age,child.age);assert.equal(heir.cash,E.worth(s));assert.ok(E.validate(heir));});
test('gates and decisions',()=>{let s=E.createLife({seed:42});assert.throws(()=>E.act(s,'buy:house'));s=E.ageUp(s);assert.throws(()=>E.ageUp(s));assert.throws(()=>E.resolve(s,99));assert.equal(E.resolve(s,0).pending,null);});
test('content identifiers and choice coverage',()=>{assert.equal(new Set(E.events.map(e=>e.id)).size,E.events.length);assert.ok(E.events.length>=60);for(let e of E.events){assert.ok(e.choices.length>=2&&e.choices.length<=3);assert.ok(e.min<=e.max);}});

test('story chain follows the original choice',()=>{const start=E.events.find(e=>e.arcStart);let s=E.createLife({seed:1});s.age=start.min;s.pending=start.id;s=E.resolve(s,0);assert.equal(s.story.due.length,1);for(let i=0;i<start.delay;i++){s=E.ageUp(s);if(i<start.delay-1&&s.pending!==null)s=E.resolve(s,0);}assert.equal(s.pending,start.followId);s=E.resolve(s,1);assert.equal(s.story.due.length,0);});
test('skills and medical actions respect eligibility',()=>{let s=E.createLife({seed:1});s.age=18;s.cash=1000;s.condition={name:'Sleep difficulty',severity:2};s=E.act(s,'skill:technical');assert.equal(s.skills.technical,8);s=E.act(s,'clinic');assert.equal(s.condition.severity,1);s=E.act(s,'clinic');assert.equal(s.condition,null);assert.ok(E.validate(s));});

test('club, pet, sector, creator and relocation mechanics',()=>{let s=E.createLife({seed:11});s.age=12;s=E.act(s,'club:science');s=E.act(s,'club:practice');assert.equal(s.club.level,2);s=E.act(s,'pet:cat');assert.equal(s.pets.length,1);s.age=30;s.cash=100000;s.actions=3;s=E.act(s,'business:studio');assert.equal(s.business.sector,'studio');s=E.act(s,'business:sell');s=E.act(s,'move:1');assert.equal(s.country,1);s.actions=3;s.stats.creativity=80;s=E.act(s,'publish');assert.ok(s.audience>0);assert.ok(E.validate(s));});

test('new scenarios retain old IDs and report actual consequences',()=>{assert.equal(E.events.length,1109);let s=E.createLife({seed:9});s.age=30;const e=E.events.find(e=>e.title==='A tempting shortcut');s.pending=e.id;const oldCash=s.cash;s=E.resolve(s,2);assert.equal(s.cash,oldCash+800);assert.equal(s.legalRisk,35);assert.equal(s.scenario.last.netWorth,800);assert.equal(s.scenario.seen[e.id],1);assert.equal(s.scenario.counts.justice,1);assert.ok(E.validate(s));});
test('challenge completion persists after progress falls',()=>{let s=E.createLife({seed:9});s.age=30;s.cash=1000000;s=E.act(s,'rest');assert.ok(s.completedChallenges.includes('wealth'));s.cash=0;s=E.act(s,'rest');assert.ok(E.challengeProgress(s).find(c=>c.id==='wealth').completed);});
test('education funding and budget actions',()=>{let s=E.createLife({seed:9});s.age=18;s.cash=0;s.stats.knowledge=85;s=E.act(s,'study:grant');assert.ok(s.study&&s.debt>0);s=E.act(s,'budget:frugal');assert.equal(s.budget,'frugal');assert.ok(E.validate(s));});

test('skill trials have deterministic odds and distinct future outcomes',()=>{const e=E.events.find(e=>e.trial);let s=E.createLife({seed:333});s.age=20;s.pending=e.id;s.stats[e.trial.stat]=20;const low=E.trialChance(s,e,0);s.stats[e.trial.stat]=90;assert.ok(E.trialChance(s,e,0)>low);assert.ok(E.trialChance(s,e,1)>E.trialChance(s,e,0));const a=E.resolve(s,0),b=E.resolve(s,0);assert.deepEqual(a,b);assert.ok([e.trial.winId,e.trial.lossId].includes(a.story.due[0].id));assert.equal(a.scenario.trials,1);assert.ok(E.validate(a));});
test('childhood costs do not create consumer debt',()=>{let s=E.createLife({seed:1});s.age=8;s.cash=0;s.pending=E.events.find(e=>e.title==='A costly pet visit'||e.title==='The costly pet visit').id;s=E.resolve(s,0);assert.equal(s.debt,0);assert.ok(E.validate(s));});

test('ambitious trial outcomes apply real trade-offs',()=>{const e=E.events.find(e=>e.result==='success');let s=E.createLife({seed:2});s.age=25;s.pending=e.id;s.pendingJourney={id:e.id,ambitious:true};s.stats.confidence=30;s.stats.reputation=30;let high=E.resolve(s,0);s.pendingJourney.ambitious=false;let low=E.resolve(s,0);assert.equal(high.stats.confidence-low.stats.confidence,6);assert.equal(high.stats.reputation-low.stats.reputation,6);assert.equal(high.pendingJourney,null);});

test('ten professions are gated and have deterministic unique activities',()=>{
 assert.equal(E.professions.length,10);
 for(const p of E.professions){let s=E.createLife({seed:100});assert.throws(()=>E.act(s,'profession:'+p.id));s.age=p.age;s.cash=500000;s.education=3;s.stats[p.stat]=90;s.skills={technical:90,communication:90,art:90};
 if(p.id==='entrepreneur')s=E.act(s,'business:studio');if(p.id==='investor')s=E.act(s,'invest:10000');
 s=E.act(s,'profession:'+p.id);assert.equal(s.profession.id,p.id);assert.equal(s.job,null);s.actions=3;const odds=E.professionalOdds(s);s=E.act(s,'pro:prepare');assert.ok(E.professionalOdds(s)>odds);let a=E.act(s,'pro:attempt'),b=E.act(s,'pro:attempt');assert.deepEqual(a,b);assert.equal(a.profession.attempts,1);assert.ok(E.validate(a));a=E.act(a,'pro:leave');assert.equal(a.profession,null);assert.equal(a.professionHistory[0].id,p.id);}
});
test('living world transfers conserve cash and trust evolves',()=>{let s=E.createLife({seed:5});s.age=25;s.cash=10000;let p=s.people[0],initial=p.world.cash+p.world.debt*0;let id=p.id,before=E.npcWorth(p);s=E.act(s,'support:'+id);assert.equal(s.cash,9500);assert.equal(E.npcWorth(s.people[0]),before+500);assert.ok(s.people[0].world.trust>p.world.trust);let a=E.ageUp(s);assert.equal(a.people[0].age,p.age+1);assert.ok(E.validate(a));});
test('saga persists exact participant, advances over years and branches',()=>{let s=E.createLife({seed:7});s.age=25;s.cash=100000;s=E.act(s,'date');let p=s.people.find(x=>x.role==='partner');const e=E.events.find(x=>x.saga?.id==='partnership'&&x.saga.stage==='start');s.pending=e.id;s.pendingSagaPerson=p.id;assert.ok(E.scenarioPrompt(s,e).includes(p.name));let a=E.resolve(s,0),b=E.resolve(s,1);assert.equal(a.sagas.active[0].personId,p.id);assert.ok(a.sagas.active[0].score>b.sagas.active[0].score);for(let mode of [0,1]){let x=mode?b:a;while(x.alive&&!x.sagas.completed.length&&x.age<40){if(x.pending!==null)x=E.resolve(x,mode);else x=E.ageUp(x);}assert.equal(x.sagas.completed[0].outcome,mode?'bad':'good');assert.ok(x.sagas.completed[0].endedAge-x.sagas.completed[0].startedAge>=7);assert.ok(E.validate(x));}});
test('older version 2 saves migrate lazily without losing identity',()=>{let s=E.createLife({seed:17});delete s.sagas;delete s.profession;delete s.professionHistory;delete s.worldNews;for(let p of s.people)delete p.world;assert.ok(E.validate(s));let a=E.ageUp(s);assert.equal(a.name,s.name);assert.equal(a.people[0].id,s.people[0].id);assert.ok(a.people[0].world);assert.ok(a.sagas);assert.ok(E.validate(a));});
test('legacy carries an adult heir’s earned assets and education',()=>{let s=E.createLife({seed:8});s.age=30;s.cash=40000;s=E.act(s,'date');s=E.act(s,'child');let p=s.people.find(p=>p.role==='child');p.age=30;p.world.cash=15000;p.world.debt=1000;p.world.education=2;p.world.talent=88;s.alive=false;s.pending=null;let h=E.legacy(s,p.id);assert.equal(h.cash,55000);assert.equal(h.debt,1000);assert.equal(h.education,2);assert.equal(h.stats.knowledge,88);assert.ok(E.validate(h));});

test('each profession exposes a signature action with annual cooldown',()=>{for(const p of E.professions){let s=E.createLife({seed:8});s.age=p.age;s.cash=500000;s.education=3;s.stats[p.stat]=90;if(p.id==='entrepreneur')s=E.act(s,'business:studio');if(p.id==='investor')s=E.act(s,'invest:10000');s=E.act(s,'profession:'+p.id);s.profession.wins=3;s.profession.attempts=3;s.audience=3000;s.actions=3;assert.ok(E.commands(s).some(c=>c.id==='pro:special'&&c.enabled));s=E.act(s,'pro:special');assert.equal(s.profession.specials,1);assert.ok(!E.commands(s).some(c=>c.id==='pro:special'&&c.enabled));assert.ok(E.validate(s));}});

test('catalog targets, distinct prompts and valid IDs',()=>{let s=E.createLife({seed:2});assert.equal(E.events.length,1109);assert.equal(new Set(E.events.map(e=>e.prompt)).size,1109);assert.equal(E.careers.length,150);assert.equal(new Set(E.careers.map(j=>j.title)).size,150);assert.equal(E.achievementStatus(s).length,126);assert.equal(new Set(E.achievementStatus(s).map(a=>a.name)).size,126);assert.equal(E.challengeProgress(s).length,62);assert.equal(new Set(E.challengeProgress(s).map(c=>c.id)).size,62);for(let i=0;i<E.events.length;i++)assert.equal(E.events[i].id,i);});
test('bank savings conserve net worth and earn simulated interest',()=>{let s=E.createLife({seed:5});s.age=30;s.cash=100000;const before=E.worth(s);s=E.act(s,'save:10000');assert.equal(E.worth(s),before);assert.equal(s.bankSavings,10000);s=E.act(s,'unsave:1000');assert.equal(E.worth(s),before);assert.equal(s.bankSavings,9000);s=E.ageUp(s);assert.equal(s.bankSavings,9225);assert.equal(s.annual.savingsInterest,225);assert.ok(E.validate(s));});
test('company hiring, products, marketing and cash flow',()=>{let s=E.createLife({seed:4});s.age=30;s.cash=500000;s=E.act(s,'business:studio');s=E.act(s,'company:hire');s=E.act(s,'company:product');assert.equal(s.business.employees,1);assert.equal(s.business.products.length,1);assert.equal(s.progression.productsLaunched,1);s.actions=3;let worth=E.worth(s);s=E.act(s,'company:capital');assert.equal(E.worth(s),worth);s=E.act(s,'company:marketing');assert.ok(s.business.demand>=70);s=E.ageUp(s);assert.equal(s.business.lastProfit,s.business.revenue-s.business.payroll-s.business.operating);assert.equal(s.annual.business,s.business.lastProfit);assert.ok(E.validate(s));});
test('every regular job is reachable and supports industry-specific training',()=>{for(const j of E.careers){let s=E.createLife({seed:20});s.age=25;s.education=3;s.stats.knowledge=100;s=E.act(s,'job:'+j.id);s=E.act(s,'careertrain');assert.equal(s.job.id,j.id);assert.equal(s.job.experience,12);assert.equal(s.skills[j.skill],6);assert.ok(E.validate(s));}});
test('all scenario options resolve without invalid state in prepared fixtures',()=>{for(const e of E.events){for(let i=0;i<e.choices.length;i++){let s=E.createLife({seed:e.id+100});s.age=e.min;s.cash=100000;s.education=3;s.stats.knowledge=100;s.pending=e.id;if(e.requires==='business')s.business={capital:15000,quality:60,sector:'studio'};if(e.requires==='job')s.job={id:0,level:0};if(e.requires==='pet')s.pets=[{id:20,name:'Mochi',type:'cat',age:2,bond:65,alive:true,lifespan:15}];let a=E.resolve(s,i);assert.ok(E.validate(a));}}});
test('new optional save fields can be initialized safely',()=>{let s=E.createLife({seed:7});delete s.progression;delete s.bankSavings;delete s.financialSkill;delete s.experience;assert.ok(E.validate(s));let a=E.ageUp(s);assert.ok(a.progression);assert.equal(a.bankSavings,0);assert.ok(E.validate(a));});

test('market trades conserve wealth and portfolio tracks annual performance',()=>{let s=E.createLife({seed:42});s.age=30;s.cash=100000;let w=E.worth(s);s=E.act(s,'marketbuy:index');assert.equal(E.worth(s),w);s=E.act(s,'marketbuy:bond');assert.equal(E.portfolioWorth(s),2000);s=E.act(s,'marketsell:index');assert.equal(E.worth(s),w);s=E.ageUp(s);assert.ok(Number.isFinite(s.annual.dividends));assert.ok(E.validate(s));});
test('rental property supports tenant search and maintenance',()=>{let s=E.createLife({seed:42});s.age=30;s.cash=1000000;s=E.act(s,'buy:rental');s=E.act(s,'renttenant:rental');s=E.act(s,'rentrepair:rental');assert.equal(s.properties[0].rental.condition,100);s=E.ageUp(s);assert.ok(s.properties[0].rental.condition<100);assert.equal(s.annual.rent,s.properties[0].rental.lastRent);assert.ok(E.validate(s));});
test('court outcomes include custody, rehabilitation and release',()=>{let convicted=false;for(let seed=1;seed<100;seed++){let s=E.createLife({seed});s.age=30;s.cash=100000;s.legalRisk=100;s=E.ageUp(s);assert.ok(s.justice.case);if(s.pending!==null)s=E.resolve(s,0);s=E.act(s,'justice:hearing');if(!s.justice.years)continue;convicted=true;assert.ok(!E.commands(s).some(c=>c.id.startsWith('job:')));s=E.act(s,'justice:rehab');assert.equal(s.justice.rehab,1);while(s.justice.years>0&&s.alive)s=E.ageUp(s);assert.equal(s.justice.years,0);assert.ok(s.justice.probation>0);assert.ok(E.validate(s));break;}assert.ok(convicted);});
test('three career games score actual answers and persist round state',()=>{for(let type of ['logic','memory','judgment']){let s=E.createLife({seed:12});s.age=30;s=E.act(s,'job:0');s=E.act(s,'mini:'+type);assert.throws(()=>E.ageUp(s));for(let i=0;i<5;i++){let q=miniRound(type,s.mini.seed,i);s=JSON.parse(JSON.stringify(s));if(type==='memory'){assert.ok(E.miniView(s).preview);s=E.miniAction(s,'ready');assert.equal(E.miniView(s).preview,undefined);}s=E.miniAction(s,q.correct);assert.ok(E.validate(s));}assert.equal(s.miniHistory[type].score,5);assert.equal(s.mini,null);assert.ok(!E.commands(s).some(x=>x.id==='mini:'+type&&x.enabled));}});
test('player profile deduplicates completed lives and retains collections',()=>{let s=E.createLife({seed:12});s.age=100;s.alive=false;s.achievements=['centenarian'];s.completedChallenges=['wealth'];let p=mergeLife(emptyProfile(),s,E.worth(s));let p2=mergeLife(p,s,E.worth(s));assert.equal(Object.keys(p2.completed).length,1);assert.ok(p2.ribbons.includes(E.lifeEnding(s).id));assert.ok(p2.achievements.includes('centenarian'));assert.ok(p2.challenges.includes('wealth'));assert.ok(validProfile(p2));let t=E.createLife({seed:13});t.age=80;t.alive=false;p2=mergeLife(p2,t,E.worth(t));assert.equal(Object.keys(p2.completed).length,2);});

test('six world domains, stable content IDs and new collection are present',()=>{
 let s=E.createLife({seed:7});assert.equal(E.domains.length,6);assert.equal(E.destinations.length,18);assert.equal(E.events.length,1109);assert.equal(new Set(E.events.map(e=>e.prompt)).size,1109);
 assert.equal(E.events.filter(e=>e.origin==='world-drama').length,48);assert.ok(E.events.slice(1036).every((e,i)=>e.id===1036+i));
 assert.equal(E.achievementStatus(s).length,126);assert.equal(E.challengeProgress(s).length,62);assert.equal(E.ribbons.length,32);
 for(const d of E.domains)assert.equal(E.events.filter(e=>e.domain===d.id).length,8);
});
test('entertainment release and sport competition carry financial and annual consequences',()=>{
 let s=E.createLife({seed:91});s.age=30;s.cash=180000;s.stats.creativity=90;s.stats.health=90;
 s=E.act(s,'world:ent:start:1');s=E.act(s,'world:ent:rehearse');s=E.act(s,'world:ent:release');
 assert.equal(s.world.entertainment.path,'Recording musician');assert.ok(s.world.entertainment.fame>0);
 s.actions=3;s=E.act(s,'world:sport:start:0');s=E.act(s,'world:sport:train');s=E.act(s,'world:sport:compete');
 assert.ok(s.world.sports.seasons>=1);assert.ok(E.validate(s));s=E.ageUp(s);
 assert.ok(Number.isFinite(s.annual.worldIncome));assert.ok(s.world.entertainment.fame>=0);assert.ok(E.validate(s));
});
test('civic elections consume fundraising and office terms persist',()=>{
 let s=E.createLife({seed:14});s.age=33;s.cash=150000;s.stats.reputation=90;s.stats.social=90;
 s=E.act(s,'world:pol:join');s=E.act(s,'world:pol:fundraise');s=E.act(s,'world:pol:fundraise');s.actions=3;
 let raised=s.world.politics.campaignFunds;assert.ok(raised>=1500);s=E.act(s,'world:pol:election');
 assert.equal(s.world.politics.campaignFunds,raised-1500);assert.equal(s.world.politics.elections,1);assert.ok(s.world.politics.lastElectionAge===33);
 s=E.ageUp(s);assert.ok(E.validate(s));assert.ok(s.world.politics.term>=0);
});
test('royal upbringing is selectable and succession is earned by public duty',()=>{
 let s=E.createLife({seed:9,background:'royal'});assert.equal(s.world.royalty.title,'Royal heir');assert.equal(s.background,'royal');
 s.age=35;s.cash=30000;for(let i=0;i<5;i++){s.actions=3;s=E.act(s,'world:royal:duty');}
 assert.ok(E.commands(s).some(c=>c.id==='world:royal:succession'&&c.enabled));s=E.act(s,'world:royal:succession');
 assert.equal(s.world.royalty.title,'Monarch');s=E.ageUp(s);assert.ok(s.annual.worldIncome>0);assert.ok(E.validate(s));
});
test('youth sports academy grows into adult competition with retained form',()=>{
 let s=E.createLife({seed:4});s.age=13;s.stats.health=80;assert.ok(E.commands(s).some(c=>c.id==='world:sport:youth:0'&&c.enabled));
 s=E.act(s,'world:sport:youth:0');s=E.act(s,'world:sport:youthtrain');assert.equal(s.world.sports.sport,'Football');assert.equal(s.world.sports.youthSeasons,1);
 s.age=18;s.actions=3;assert.ok(E.commands(s).some(c=>c.id==='world:sport:compete'&&c.enabled));assert.ok(E.validate(s));
});
test('travel records exact cities and respects one journey per year',()=>{
 let s=E.createLife({seed:11});s.age=30;s.cash=100000;
 s=E.act(s,'world:travel:visit:kyoto');assert.equal(s.world.travel.stamps[0],'kyoto');assert.equal(s.world.travel.trips[0].age,30);
 assert.ok(!E.commands(s).some(c=>c.id==='world:travel:visit:bali'&&c.enabled));s=E.ageUp(s);
 if(s.pending!==null)s=E.resolve(s,0);assert.ok(E.commands(s).some(c=>c.id==='world:travel:visit:bali'&&c.enabled));assert.ok(E.validate(s));
});
test('family trust conserves assets and generation inheritance does not double-count',()=>{
 let s=E.createLife({seed:8});s.age=35;s.cash=50000;s=E.act(s,'date');s=E.act(s,'child');const child=s.people.find(x=>x.role==='child');child.age=12;
 s.actions=3;let worth=E.worth(s);s=E.act(s,'world:dynasty:fund');assert.equal(E.worth(s),worth);assert.equal(s.world.dynasty.trustFund,2000);
 s=E.act(s,'world:dynasty:mentor:'+child.id);assert.ok(s.world.dynasty.mentored.includes(child.id));
 let prior=E.worth(s);s=E.act(s,'world:dynasty:grant:'+child.id);assert.equal(E.worth(s),prior-2000);assert.equal(s.people.find(x=>x.id===child.id).world.cash>=2000,true);
 s.alive=false;s.pending=null;let heir=E.legacy(s,child.id);assert.equal(heir.world.dynasty.trustFund,0);assert.equal(heir.world.dynasty.ancestors[0].name,s.name);
 assert.equal(heir.cash,Math.max(0,E.worth(s))+s.people.find(x=>x.id===child.id).world.cash);assert.ok(E.validate(heir));
});
test('world drama choices apply domain-specific consequences',()=>{
 let s=E.createLife({seed:61,background:'royal'});s.age=30;
 const event=E.events.find(e=>e.title==='A public promise');assert.ok(event&&event.domain==='royalty');s.pending=event.id;const before=s.world.royalty.support;
 let a=E.resolve(s,0);assert.equal(a.world.royalty.support,Math.min(100,before+8));
 assert.equal(a.scenario.counts.royalty,1);assert.ok(E.validate(a));
});
test('old version-2 saves gain world defaults without losing family and money',()=>{
 let s=E.createLife({seed:6});s.age=29;s.cash=75100;delete s.world;assert.ok(E.validate(s));
 let a=E.ageUp(s);assert.equal(a.cash+ a.debt>=0,true);assert.ok(a.world?.dynasty);assert.equal(a.world.travel.visitedCountries[0],s.country);assert.ok(E.validate(a));
});

test('entertainment specializations have distinct preparation and live work',()=>{
 for(let i=0;i<3;i++){let s=E.createLife({seed:54+i});s.age=30;s.cash=500000;s.stats.creativity=95;s.stats.social=90;s.stats.knowledge=95;
 s=E.act(s,'world:ent:start:'+i);s=E.act(s,'world:ent:rehearse');s=E.act(s,'world:ent:release');s.actions=3;
 if(i===0){assert.ok(E.commands(s).some(c=>c.id==='world:ent:screen'&&c.enabled));s=E.act(s,'world:ent:screen');assert.equal(s.world.entertainment.screenCraft,12);}
 if(i===1){s.world.entertainment.releases=Math.max(1,s.world.entertainment.releases);assert.ok(E.commands(s).some(c=>c.id==='world:ent:tour'&&c.enabled));s=E.act(s,'world:ent:tour');assert.equal(s.world.entertainment.lastTourAge,30);}
 if(i===2){assert.ok(E.commands(s).some(c=>c.id==='world:ent:cast'&&c.enabled));s=E.act(s,'world:ent:cast');assert.equal(s.world.entertainment.productionQuality,15);}
 assert.ok(E.validate(s));}
});
test('preferred family heir inherits crown and full estate while others retain a share',()=>{
 let s=E.createLife({seed:9,background:'royal'});s.age=40;s.cash=100000;s=E.act(s,'date');s=E.act(s,'child');s.actions=3;s=E.act(s,'child');
 let children=s.people.filter(p=>p.role==='child');s.world.dynasty.heirId=children[0].id;s.alive=false;s.pending=null;
 let chosen=E.legacy(s,children[0].id),other=E.legacy(s,children[1].id);
 assert.equal(chosen.cash,100000);assert.equal(other.cash,40000);
 assert.equal(other.people.find(p=>p.id===children[0].id).world.cash,60000);
 assert.equal(chosen.world.royalty.title,'Royal heir');assert.equal(other.world.royalty.title,null);
 assert.ok(E.validate(chosen)&&E.validate(other));
});
test('winning elected office replaces full-time employment',()=>{
 let winner=null;for(let seed=1;seed<=80;seed++){let s=E.createLife({seed});s.age=32;s.cash=100000;s.stats.reputation=95;s.stats.social=95;s=E.act(s,'job:0');
 s.world.politics.party='Civic Renewal';s.world.politics.approval=95;s.world.politics.campaignFunds=5000;s.actions=3;
 s=E.act(s,'world:pol:election');if(s.world.politics.wins){winner=s;break;}}
 assert.ok(winner);assert.equal(winner.job,null);winner=E.ageUp(winner);assert.equal(winner.annual.salary,0);
 assert.ok(winner.annual.worldIncome>0);assert.ok(E.validate(winner));
});
test('travel destinations provide distinct cultural and wellbeing effects',()=>{
 let s=E.createLife({seed:19});s.age=30;s.cash=50000;let oldCreativity=s.stats.creativity;
 s=E.act(s,'world:travel:visit:tokyo');assert.equal(s.stats.creativity,oldCreativity+4);
 let t=E.createLife({seed:19});t.age=30;t.cash=50000;let oldHealth=t.stats.health;
 t=E.act(t,'world:travel:visit:bali');assert.equal(t.stats.health,oldHealth+3);
 assert.ok(E.validate(s)&&E.validate(t));
});

test('character cast is deterministic and old saves migrate without RNG changes',()=>{
 let a=E.createLife({seed:44}),b=E.createLife({seed:44});
 assert.deepEqual(a.world.characters,b.world.characters);
 assert.equal(a.world.characters.athletes.length,4);assert.equal(a.world.characters.politicians.length,3);assert.equal(a.world.characters.agents.length,3);
 let rng=a.rng;delete a.world.characters;assert.ok(E.validate(a));assert.equal(E.characterView(a).agents.length,3);assert.equal(a.rng,rng);
 a.age=30;a=E.ageUp(a);assert.ok(E.validate(a));assert.equal(a.world.characters.athletes.length,4);
});
test('sports opponent matches change both competitors and persist through years',()=>{
 let s=E.createLife({seed:50});s.age=30;s.cash=100000;s=E.act(s,'world:sport:start:0');
 let opponent=s.world.characters.athletes.find(p=>p.sport==='Football');const start=opponent.wins+opponent.losses;
 s=E.act(s,'character:sport:challenge:'+opponent.id);
 assert.equal(s.world.characters.athletes.find(p=>p.id===opponent.id).wins+s.world.characters.athletes.find(p=>p.id===opponent.id).losses,start+1);
 assert.equal(s.world.sports.wins+s.world.sports.losses,1);
 assert.ok(!E.commands(s).some(c=>c.id==='character:sport:challenge:'+opponent.id&&c.enabled));
 s=E.ageUp(s);assert.ok(E.validate(s));assert.ok(s.world.characters.athletes[0].age>18);
});
test('political rivals participate in debates and independent elections',()=>{
 let s=E.createLife({seed:35});s.age=31;s.cash=100000;s.stats.reputation=90;s.stats.social=85;s=E.act(s,'world:pol:join');
 let opponent=s.world.characters.politicians[0];const before=opponent.rivalry;
 s=E.act(s,'character:politics:debate:'+opponent.id);assert.ok(s.world.characters.politicians[0].rivalry>before);
 const first=s.world.characters.politicians[0].wins+s.world.characters.politicians[0].losses;
 s.age=35;s.actions=3;s=E.ageUp(s);assert.ok(E.validate(s));
 const later=s.world.characters.politicians[0].wins+s.world.characters.politicians[0].losses;
 assert.ok(later>=first);
});
test('agents negotiate real project income with commission and contract expiry',()=>{
 let s=E.createLife({seed:17});s.age=30;s.cash=100000;s.stats.creativity=90;s=E.act(s,'world:ent:start:0');
 s=E.act(s,'character:agent:sign:agent-0');assert.equal(s.world.characters.agency.years,3);
 const agent=s.world.characters.agents[0];assert.equal(agent.agreements,1);
 s=E.act(s,'character:agent:pitch:agent-0');const record=s.world.characters.agency;
 assert.equal(record.deals,s.world.characters.agents[0].projects);
 assert.ok(record.fees>=0&&record.earned>=0);
 for(let i=0;i<3;i++){if(s.pending!==null)s=E.resolve(s,0);s=E.ageUp(s);}
 assert.equal(s.world.characters.agency,null);assert.ok(E.validate(s));
});
test('family conflict tracks tension and can genuinely reconcile',()=>{
 let s=E.createLife({seed:64});s.age=28;s.cash=30000;const relative=s.people.find(p=>p.role==='parent');
 s=E.act(s,'character:family:start:'+relative.id);assert.equal(s.world.characters.conflicts.length,1);
 s.age++;s.actions=3;s=E.act(s,'character:family:mediate:'+relative.id);let c=s.world.characters.conflicts[0];
 s.age++;s.actions=3;s=E.act(s,'character:family:listen:'+relative.id);c=s.world.characters.conflicts[0];
 assert.equal(c.status,'resolved');assert.equal(c.outcome,'reconciled');assert.ok(E.validate(s));
});
test('four chapter family saga continues across inherited generations',()=>{
 let s=E.createLife({name:'Ada',seed:91});s.age=48;s.cash=120000;s=E.act(s,'date');s=E.act(s,'child');
 const child=s.people.find(p=>p.role==='child');child.age=26;s.actions=3;s=E.act(s,'character:legacy:start');
 const original=s.world.characters.arc.id;
 s.age+=2;s.actions=3;s=E.act(s,'character:legacy:listen');assert.equal(s.world.characters.arc.stage,1);
 s.alive=false;s.pending=null;let heir=E.legacy(s,child.id);
 assert.equal(heir.world.characters.arc.id,original);assert.equal(heir.world.characters.arc.generations,2);
 assert.equal(heir.world.characters.arc.nextAge,heir.age+2);
 heir.age+=2;heir.actions=3;heir=E.act(heir,'character:legacy:archive');
 heir.age+=2;heir.actions=3;heir=E.act(heir,'character:legacy:invest');
 heir.age+=2;heir.actions=3;heir=E.act(heir,'character:legacy:resolve');
 assert.equal(heir.world.characters.arc,null);
 assert.equal(heir.world.characters.completedArcs.length,1);
 assert.equal(heir.world.characters.completedArcs[0].generations,2);
 assert.equal(heir.world.characters.completedArcs[0].choices.length,4);
 assert.ok(E.validate(heir));
});
test('name-aware character events affect their recurring participants',()=>{
 let s=E.createLife({seed:4});s.age=32;s.cash=100000;s=E.act(s,'world:sport:start:0');
 const e=E.events.find(e=>e.cast==='athlete');
 assert.ok(E.scenarioPrompt(s,e).includes(s.world.characters.athletes[0].name));
 const before=s.world.characters.athletes[0].respect;s.pending=e.id;s=E.resolve(s,0);
 assert.equal(s.world.characters.athletes[0].respect,Math.min(100,before+10));
 assert.equal(E.events.length,1109);assert.equal(E.events.filter(e=>e.origin==='character-drama').length,25);
 assert.equal(new Set(E.events.map(e=>e.prompt)).size,1109);
 assert.ok(E.validate(s));
});
test('character actions require eligibility and cannot be replayed in one year',()=>{
 let s=E.createLife({seed:9});s.age=30;s.cash=2000;
 assert.throws(()=>E.act(s,'character:agent:sign:agent-0'));
 s=E.act(s,'world:sport:start:0');s=E.act(s,'character:sport:challenge:ath-0');
 assert.throws(()=>E.act(s,'character:sport:challenge:ath-0'));
 assert.ok(E.validate(s));
});

test('generational arc chapters use different authored prose and inherited context',()=>{
 const chapterTexts=new Set();for(let seed=1;seed<=60;seed++){let s=E.createLife({seed});s.age=44;s=E.act(s,'character:legacy:start');chapterTexts.add(E.characterArcView(s).chapterText);}
 assert.equal(chapterTexts.size,4);
 let s=E.createLife({name:'Evelyn',seed:14});s.age=45;s.cash=90000;s=E.act(s,'date');s=E.act(s,'child');const child=s.people.find(p=>p.role==='child');child.age=23;s.actions=3;
 s=E.act(s,'character:legacy:start');s.alive=false;let heir=E.legacy(s,child.id);
 const chapter=E.characterArcView(heir);assert.ok(chapter.chapterText.includes('Evelyn'));assert.equal(chapter.remainingYears,2);assert.ok(E.validate(heir));
});
test('new generation has fresh age-appropriate competitors but retains rivalry archive',()=>{
 let s=E.createLife({seed:28});s.age=48;s.cash=100000;s=E.act(s,'date');s=E.act(s,'child');const child=s.people.find(p=>p.role==='child');child.age=21;
 let rival=s.world.characters.athletes[0];rival.wins=11;rival.rivalry=85;const name=rival.name;s.alive=false;
 let heir=E.legacy(s,child.id);
 assert.ok(heir.world.characters.legacyRivals.some(r=>r.name===name&&r.wins===11));assert.equal(heir.world.characters.agency,null);
 assert.ok(heir.world.characters.athletes.every(r=>r.age<=heir.age+5));assert.ok(E.validate(heir));
});

test('recurring cast uses ten distinct names for each life',()=>{
 for(let seed=1;seed<=90;seed++){const s=E.createLife({seed});const actors=[...s.world.characters.athletes,...s.world.characters.politicians,...s.world.characters.agents];assert.equal(new Set(actors.map(a=>a.name)).size,10);}
});
test('entertainment agents affect ordinary film releases and earn real commissions',()=>{
 let found=false;for(let seed=1;seed<=80;seed++){let base=E.createLife({seed});base.age=30;base.cash=100000;base.stats.creativity=95;base.stats.social=95;base.skills.art=80;base=E.act(base,'world:ent:start:0');
 let hired=E.act(base,'character:agent:sign:agent-0');let after=E.act(hired,'world:ent:release');
 if(after.world.entertainment.releases!==1)continue;
 found=true;const commission=after.world.characters.agency;assert.equal(commission.deals,1);
 const gross=Math.round(2800*(1+after.world.entertainment.releases*.2));
 const fee=Math.round(gross*.14);
 assert.equal(commission.fees,fee);assert.equal(commission.earned,gross-fee);assert.ok(E.validate(after));break;}
 assert.ok(found);
});
test('stronger civic opposition makes player elections harder',()=>{
 let weakWins=0,strongWins=0;
 for(let seed=1;seed<=100;seed++){
   let s=E.createLife({seed});s.age=32;s.cash=100000;s.stats.reputation=85;s.stats.social=90;s.world.politics.party='Civic Renewal';s.world.politics.approval=70;s.world.politics.campaignFunds=2500;
   let weak=JSON.parse(JSON.stringify(s)),strong=JSON.parse(JSON.stringify(s));
   weak.world.characters.politicians.forEach(p=>{p.approval=50;});
   strong.world.characters.politicians.forEach(p=>{p.approval=100;});
   weak=E.act(weak,'world:pol:election');strong=E.act(strong,'world:pol:election');
   weakWins+=weak.world.politics.wins;strongWins+=strong.world.politics.wins;
 }
 assert.ok(weakWins>strongWins);
});

test('dialogue branches have three rounds, state changes and remembered responses',()=>{
 let s=E.createLife({seed:301});s.age=27;s.cash=85000;
 let cmd=E.commands(s).find(c=>c.id==='dialogue:open:person-1'&&c.enabled);assert.ok(cmd);
 const before=s.people.find(p=>p.id===1).bond;
 s=E.act(s,cmd.id);assert.equal(E.dialogueView(s).round,1);assert.equal(s.actions,2);
 assert.throws(()=>E.ageUp(s));assert.equal(E.commands(s).length,0);assert.throws(()=>E.dialogueReply(s,3));
 let serialized=JSON.parse(JSON.stringify(s));assert.deepEqual(E.dialogueView(serialized),E.dialogueView(s));
 s=E.dialogueReply(serialized,0);assert.equal(E.dialogueView(s).round,2);assert.equal(E.dialogueView(s).transcript.length,1);
 s=E.dialogueReply(s,1);assert.equal(E.dialogueView(s).round,3);
 assert.equal(E.networkProfile(s,'person-1').memoryRevealed,true);
 s=E.dialogueReply(s,0);assert.equal(E.dialogueView(s),null);
 assert.equal(s.world.network.dialogues.length,1);assert.equal(s.world.network.dialogues[0].complete,true);
 assert.ok(s.people.find(p=>p.id===1).bond>before);assert.ok(E.validate(s));
 assert.ok(!E.commands(s).some(c=>c.id==='dialogue:open:person-1'&&c.enabled));
});
test('empathetic and confrontational conversations create different outcomes',()=>{
 let s=E.createLife({seed:302});s.age=31;
 let good=E.act(s,'dialogue:open:person-1'),hard=E.act(s,'dialogue:open:person-1');
 for(let i=0;i<3;i++){good=E.dialogueReply(good,0);hard=E.dialogueReply(hard,2);}
 assert.equal(good.world.network.dialogues[0].outcome,'trusted');
 assert.equal(hard.world.network.dialogues[0].outcome,'strained');
 assert.ok(good.people[0].bond>hard.people[0].bond);
 assert.ok(good.stats.happiness>hard.stats.happiness);
 assert.ok(E.validate(good)&&E.validate(hard));
});
test('conversations may be left, do not repeat in one year, and reopen next year',()=>{
 let s=E.createLife({seed:303});s.age=23;
 s=E.act(s,'dialogue:open:person-2');s=E.dialogueReply(s,'leave');
 assert.equal(E.dialogueView(s),null);assert.equal(s.world.network.dialogues[0].complete,false);
 assert.throws(()=>E.act(s,'dialogue:open:person-2'));
 s=E.ageUp(s);if(s.pending!==null)s=E.resolve(s,0);
 assert.ok(E.commands(s).some(c=>c.id==='dialogue:open:person-2'&&c.enabled));
 assert.ok(E.validate(s));
});
test('recurring cast and family members receive stable offline backstories',()=>{
 let s=E.createLife({seed:304});s.age=30;
 const person=E.networkProfile(s,'person-1'),agent=E.networkProfile(s,'agent-0');
 assert.ok(person.origin&&person.motivation&&agent.origin);
 assert.deepEqual(E.networkProfile(JSON.parse(JSON.stringify(s)),'person-1'),person);
 assert.equal(person.memoryRevealed,false);
 let t=E.act(s,'dialogue:open:agent-0');
 t=E.dialogueReply(t,1);t=E.dialogueReply(t,0);
 assert.equal(E.networkProfile(t,'agent-0').memoryRevealed,true);
 assert.ok(E.validate(t));
});
test('autonomous social ties grow without player dialogue and stay bounded',()=>{
 let s=E.createLife({seed:305});s.age=19;
 for(let i=0;i<40;i++){if(s.pending!==null)s=E.resolve(s,0);s=E.ageUp(s);assert.ok(E.validate(s));}
 assert.ok(s.world.network.edges.length>2);
 assert.equal(s.world.network.dialogues.length,0);
 assert.ok(s.world.network.edges.length<=64);
 assert.ok(s.world.network.news.length<=55);
 for(const e of s.world.network.edges){assert.ok(e.trust>=0&&e.trust<=100&&e.loyalty>=0&&e.loyalty<=100);}
});
test('NPC friendships can become betrayals autonomously',()=>{
 let s=E.createLife({seed:306});s.age=29;
 const nodes=conversationPeople(s),a=nodes[0].id,b=nodes[1].id;
 const n=ensureNetwork(s),key=[a,b].sort().join('|');
 n.edges.push({key,a,b,firstMetAge:20,trust:80,loyalty:89,status:'allies',betrayals:0,years:0,memories:[]});
 const sequence=[.01,.12,.1,.5,.001,.01,.12,.5,.5,.9];
 let i=0;relationshipYear(s,{rng:()=>sequence[i++]??.5,clamp:n=>Math.max(0,Math.min(100,Math.round(n))),add:(state,text,kind)=>state.history.push({age:state.age,text,kind})});
 assert.ok(n.edges[0].betrayals>=1);
 assert.equal(n.edges[0].status,'betrayed');
 assert.ok(n.news.some(news=>news.kind==='betrayed'));
 assert.ok(E.validate(s));
});
test('inherited lives keep surviving family connections but not unfinished conversations',()=>{
 let s=E.createLife({seed:307});s.age=40;s.cash=100000;
 s=E.act(s,'date');s=E.act(s,'child');
 let child=s.people.find(p=>p.role==='child');child.age=20;
 let n=ensureNetwork(s);n.edges.push({key:'person-1|person-2',a:'person-1',b:'person-2',trust:76,loyalty:80,status:'allies',betrayals:0,years:2,memories:[]});
 n.edges.push({key:'agent-0|ath-0',a:'agent-0',b:'ath-0',trust:63,loyalty:54,status:'friends',betrayals:0,years:2,memories:[]});
 s.alive=false;s.pending=null;let heir=E.legacy(s,child.id);
 assert.ok(heir.world.network.edges.every(e=>e.a.startsWith('person-')&&e.b.startsWith('person-')));
 assert.equal(heir.world.network.conversation,null);
 assert.deepEqual(heir.world.network.talked,{});
 assert.ok(E.validate(heir));
});

test('autonomous allies improve the actual wellbeing of the involved NPCs',()=>{
 let s=E.createLife({seed:201});s.age=29;
 const nodes=conversationPeople(s),a=nodes[0].id,b=nodes[1].id,n=ensureNetwork(s),key=[a,b].sort().join('|');
 n.edges.push({key,a,b,trust:73,loyalty:67,status:'friends',betrayals:0,years:0,memories:[]});
 const previous=s.people[0].world.joy;const sequence=[.01,.12,.9,.1,.9,.01,.12,.5,.5,.9];let i=0;
 relationshipYear(s,{rng:()=>sequence[i++]??.5,add:(state,text,kind)=>state.history.push({age:state.age,text,kind})});
 assert.equal(n.edges[0].status,'allies');assert.equal(s.people[0].world.joy,previous+5);
 assert.equal(n.news[0].kind,'allies');assert.ok(E.validate(s));
});
test('freshly generated family names do not collide with each other',()=>{
 for(let seed=1;seed<=160;seed++){let s=E.createLife({seed});assert.equal(new Set(s.people.map(p=>p.name)).size,s.people.length);}
});

test('authored ripples are complete, causal, and keep original scenario IDs untouched',()=>{
 assert.equal(rippleTypes.length,8);
 let s=E.createLife({seed:450});s.age=28;s.cash=10000;
 const e=E.events.find(e=>e.title==='A new coworker');assert.ok(e);
 s.pending=e.id;s=E.resolve(s,0);
 assert.equal(E.events.length,1109);assert.ok(E.validate(s));
 assert.equal(s.ripples.active.length,1);
 assert.equal(s.ripples.active[0].type,'career');
 assert.equal(s.ripples.active[0].sourceTitle,e.title);
 assert.equal(s.ripples.active[0].sourceChoice,e.choices[0].text);
 assert.ok(s.scenario.last.ripple?.id);
 const view=E.rippleView(s).active[0];assert.equal(view.ready,false);assert.equal(view.choices.length,3);
});
test('multiple-year commitments have distinct fulfilled, complicated and neglected endings',()=>{
 let starter=E.createLife({seed:451});starter.age=28;starter.cash=10000;
 const e=E.events.find(e=>e.title==='A new coworker');starter.pending=e.id;starter=E.resolve(starter,0);
 const story=starter.ripples.active[0];
 function play(path){let s=JSON.parse(JSON.stringify(starter));for(let i=0;i<3;i++){
   s.age=s.ripples.active[0].nextAge;s.actions=3;
   const id='ripple:'+story.id+':'+path[i];
   assert.ok(E.commands(s).some(x=>x.id===id&&x.enabled));
   s=E.act(s,id);assert.ok(E.validate(s));}
   assert.equal(s.ripples.active.length,0);assert.equal(s.ripples.completed.length,1);return s;}
 const good=play([0,0,0]),mixed=play([0,1,2]),bad=play([2,2,2]);
 assert.equal(good.ripples.completed[0].outcome,'fulfilled');
 assert.equal(mixed.ripples.completed[0].outcome,'complicated');
 assert.equal(bad.ripples.completed[0].outcome,'neglected');
 assert.ok(good.stats.reputation>bad.stats.reputation);
 assert.equal(E.rippleRecap(good).resolved,1);
 assert.equal(E.rippleRecap(good).outcomes.fulfilled,1);
});
test('ripples cannot be used before their due date or funded without cash',()=>{
 let s=E.createLife({seed:452});s.age=28;s.cash=10000;
 const e=E.events.find(e=>E.eventCategory(e)==='money'&&e.choices.some(c=>(c.effects.cash||0)<=-400));
 assert.ok(e);
 const choice=e.choices.findIndex(c=>(c.effects.cash||0)<=-400);
 s.pending=e.id;s=E.resolve(s,choice);
 assert.equal(s.ripples.active[0].type,'financial');
 s.cash=50;
 const id=s.ripples.active[0].id;
 assert.throws(()=>E.act(s,'ripple:'+id+':0'));
 s.age=s.ripples.active[0].nextAge;s.actions=3;
 assert.ok(!E.commands(s).find(c=>c.id==='ripple:'+id+':0').enabled);
 assert.throws(()=>E.act(s,'ripple:'+id+':0'));
 assert.ok(E.commands(s).find(c=>c.id==='ripple:'+id+':1').enabled);
 s=E.act(s,'ripple:'+id+':1');
 assert.ok(s.cash>=0);assert.ok(E.validate(s));
});
test('neglected commitments resolve automatically after four overdue years',()=>{
 let s=E.createLife({seed:453});s.age=28;s.cash=10000;
 const e=E.events.find(e=>e.title==='A new coworker');s.pending=e.id;s=E.resolve(s,0);
 const id=s.ripples.active[0].id;s.age=s.ripples.active[0].nextAge+4;
 s=E.ageUp(s);
 assert.ok(E.validate(s));assert.ok(!s.ripples.active.some(x=>x.id===id));
 assert.equal(s.ripples.completed[0].outcome,'neglected');
 assert.equal(s.ripples.completed[0].finishReason,'deadline');
});
test('old version-2 saves are accepted and acquire follow-up story defaults',()=>{
 let s=E.createLife({seed:454});delete s.ripples;
 assert.ok(E.validate(s));s=E.ageUp(s);
 assert.ok(s.ripples?.active);assert.equal(E.rippleView(s).completed.length,0);assert.ok(E.validate(s));
});
test('some family promises survive into the next generation with a usable due date',()=>{
 let s=E.createLife({seed:455});s.age=40;s.cash=70000;
 s=E.act(s,'date');s=E.act(s,'child');const child=s.people.find(x=>x.role==='child');child.age=18;
 const e=E.events.find(e=>e.category==='family'&&e.min<=40&&e.max>=40&&e.choices.some(c=>(c.effects.bond||0)!==0));
 assert.ok(e);s.pending=e.id;s=E.resolve(s,e.choices.findIndex(c=>(c.effects.bond||0)!==0));
 assert.ok(s.ripples.active.length);assert.equal(s.ripples.active[0].type,'family');
 const id=s.ripples.active[0].id;s.alive=false;s.pending=null;
 let heir=E.legacy(s,child.id);assert.ok(E.validate(heir));
 assert.equal(heir.ripples.active[0].id,id);
 assert.equal(heir.ripples.active[0].nextAge,heir.age+2);
 assert.equal(heir.ripples.active[0].transferredFrom,s.name);
 heir.age+=2;heir.actions=3;
 assert.ok(E.commands(heir).some(c=>c.id.startsWith('ripple:'+id+':')&&c.enabled));
});

test('every authored consequence theme can be triggered by a matching choice',()=>{
 const cases=[
  ['trust','relationship',{bond:8}],
  ['recovery','health',{health:-6}],
  ['financial','money',{cash:-700}],
  ['career','career',{performance:8}],
  ['public','politics',{reputation:-8}],
  ['creative','entertainment',{creativity:7}],
  ['community','personal',{kindness:7}],
  ['family','family',{bond:5}]
 ];
 for(let i=0;i<cases.length;i++){const [type,category,effects]=cases[i];
  let s=E.createLife({seed:i+800});s.age=28;
  const out=rippleFromChoice(s,{id:5000+i,title:'Original consequential decision',category},0,{text:'Choose the difficult road',effects},category);
  assert.ok(out);assert.equal(s.ripples.active[0].type,type);assert.ok(E.validate(s));}
});
test('a family-originated consequence remembers the relevant relative',()=>{
 let s=E.createLife({seed:812});s.age=33;s=E.act(s,'date');
 const partner=s.people.find(p=>p.role==='partner');assert.ok(partner);
 rippleFromChoice(s,{id:6000,title:'A promise to my partner',requires:'partner',category:'relationship'},0,{text:'Discuss the promise',effects:{bond:7}},'relationship');
 assert.equal(s.ripples.active[0].contactId,partner.id);
 assert.equal(s.ripples.active[0].contactName,partner.name);
 assert.ok(E.validate(s));
});

test('interactive careers provide five four-stage authored simulations with free choices',()=>{
 assert.equal(E.careerCampaignTypes.length,5);
 const titles=new Set();
 for(const mission of E.careerCampaignTypes){assert.equal(mission.stages.length,4);assert.ok(mission.entry>0);
  for(const stage of mission.stages){assert.equal(stage.choices.length,3);assert.ok(stage.prompt.length>75);
   assert.ok(stage.choices.some(c=>c.cost===0));titles.add(stage.title);}
 }
 assert.equal(titles.size,20);
});
test('each career project advances four scenes, updates the world and keeps valid saves',()=>{
 for(const type of ['film','sports','election','medical','business']){
  let s=E.createLife({seed:183});s.age=32;s.cash=200000;s.stats.creativity=91;s.stats.health=95;s.stats.knowledge=90;
  s.stats.reputation=87;s.stats.social=90;s.skills.technical=90;s.skills.art=90;
  if(type==='film')s.world.entertainment.path='Film director';
  if(type==='sports'){s.world.sports.sport='Football';s.world.sports.form=85;}
  if(type==='election'){s.world.politics.party='Civic Renewal';s.world.politics.approval=87;}
  if(type==='medical')s.job={id:15,level:1,experience:10};
  if(type==='business')s.business={sector:'studio',capital:18000,quality:75};
  assert.ok(E.validate(s));const command='campaign:start:'+type;
  assert.ok(E.commands(s).some(c=>c.id===command&&c.enabled));
  s=E.act(s,command);assert.ok(E.validate(s));assert.equal(s.actions,2);
  assert.throws(()=>E.ageUp(s));assert.equal(E.commands(s).length,0);
  for(let i=0;i<4;i++){const v=E.campaignView(s);assert.equal(v.round,i+1);
   assert.equal(v.choices.length,3);s=E.campaignDecision(s,1);assert.ok(E.validate(s));}
  assert.equal(E.campaignView(s),null);assert.equal(E.campaignHistory(s).completed.length,1);
  const outcome=E.campaignHistory(s).completed[0];
  assert.equal(outcome.type,type);assert.equal(outcome.choices.length,4);
  assert.ok(Number.isFinite(outcome.result.rating));assert.ok(s.cash>=0);
  assert.ok(!E.commands(s).some(c=>c.id===command&&c.enabled));
 }
});
test('career project stages never softlock players with zero remaining cash',()=>{
 for(const type of ['film','sports','election','medical','business']){
  let s=E.createLife({seed:188});s.age=35;s.cash=5000;s.stats.creativity=91;
  s.stats.health=95;s.stats.knowledge=91;s.stats.reputation=87;s.stats.social=91;
  if(type==='film')s.world.entertainment.path='Film actor';
  if(type==='sports')s.world.sports.sport='Basketball';
  if(type==='election')s.world.politics.party='Civic Renewal';
  if(type==='medical')s.job={id:13,level:0,experience:0};
  if(type==='business')s.business={sector:'studio',capital:8000,quality:65};
  const command='campaign:start:'+type;assert.ok(E.commands(s).some(c=>c.id===command&&c.enabled));
  s=E.act(s,command);s.cash=0;
  for(let i=0;i<4;i++){const view=E.campaignView(s),free=view.choices.find(c=>c.cost===0);
   assert.ok(free&&free.enabled);
   const costly=view.choices.find(c=>c.cost>0);
   if(costly){assert.equal(costly.enabled,false);assert.throws(()=>E.campaignDecision(s,costly.index));}
   s=E.campaignDecision(s,free.index);assert.ok(E.validate(s));}
  assert.equal(E.campaignHistory(s).completed.length,1);
 }
});
test('career projects can be abandoned but entry budgets are not refunded',()=>{
 let s=E.createLife({seed:190});s.age=30;s.cash=30000;s.world.entertainment.path='Film director';
 let before=s.cash;s=E.act(s,'campaign:start:film');
 assert.equal(s.cash,before-850);assert.throws(()=>E.act(s,'campaign:start:film'));
 s=E.campaignDecision(s,'abandon');
 assert.equal(s.cash,before-850);assert.equal(E.campaignHistory(s).completed[0].outcome,'abandoned');
 assert.ok(!E.commands(s).some(x=>x.id==='campaign:start:film'&&x.enabled));
 assert.ok(E.validate(s));
});
test('company projects respect inventory caps and remain financially valid',()=>{
 let s=E.createLife({seed:191});s.age=31;s.cash=300000;s.stats.knowledge=100;s.skills.technical=100;
 s.business={sector:'studio',capital:25000,quality:90,products:Array.from({length:10},(_,i)=>'Product '+i),demand:75};
 s=E.act(s,'campaign:start:business');
 for(let i=0;i<4;i++)s=E.campaignDecision(s,0);
 assert.equal(s.business.products.length,10);assert.ok(E.validate(s));
});
test('film projects charge their actual budget and record net revenue',()=>{
 let s=E.createLife({seed:192});s.age=31;s.cash=120000;s.stats.creativity=98;
 s.skills.art=90;s.world.entertainment.path='Film actor';
 s=E.act(s,'campaign:start:film');let cost=850;
 for(let i=0;i<4;i++){const choice=E.campaignView(s).choices[0];cost+=choice.cost;s=E.campaignDecision(s,0);}
 const record=E.campaignHistory(s).completed[0];
 assert.equal(s.cash,120000-cost+record.result.net);
 assert.equal(record.spend,cost);
 assert.equal(record.result.net,record.result.gross-record.result.fee);
 assert.ok(E.validate(s));
});
test('descendants inherit completed career history but cannot inherit an active project',()=>{
 let s=E.createLife({seed:193});s.age=40;s.cash=120000;s.world.sports.sport='Tennis';
 s=E.act(s,'campaign:start:sports');for(let i=0;i<4;i++)s=E.campaignDecision(s,1);
 s.actions=3;s=E.act(s,'date');s=E.act(s,'child');
 const child=s.people.find(p=>p.role==='child');child.age=20;
 s.alive=false;s.pending=null;let heir=E.legacy(s,child.id);
 assert.ok(E.validate(heir));assert.equal(E.campaignView(heir),null);
 assert.equal(E.campaignHistory(heir).completed.length,1);
 assert.equal(E.campaignHistory(heir).completed[0].rememberedFrom,s.name);
});
test('older saves without the career campaign field remain compatible',()=>{
 let s=E.createLife({seed:194});delete s.careerCampaigns;
 assert.ok(E.validate(s));s=E.ageUp(s);assert.ok(E.validate(s));
 assert.equal(E.campaignHistory(s).completed.length,0);
});

test('sports, film and business have replay-safe interactive boards with meaningful actions',()=>{
 for(const type of ['sports','film','business']){
  let s=E.createLife({seed:2201});s.age=32;s.cash=90000;s.stats.health=82;s.stats.creativity=80;s.skills.art=85;
  if(type==='sports'){s.world.sports.sport='Football';s.world.sports.form=85;}
  if(type==='film')s.world.entertainment.path='Film director';
  if(type==='business')s.business={sector:'shop',capital:16000,quality:64,demand:55};
  s=E.act(s,'campaign:start:'+type);const startingActions=s.actions;
  for(let stage=0;stage<4;stage++){
   let v=E.campaignView(s);assert.equal(v.playfield.remaining,2);
   assert.equal(v.playfield.options.length,3);assert.ok(E.validate(s));
   assert.throws(()=>E.campaignPlay(s,-1),/valid/);
   s=E.campaignPlay(s,0);assert.equal(s.actions,startingActions);
   assert.equal(E.campaignView(s).playfield.remaining,1);
   assert.ok(E.campaignView(s).playfield.last.description.length>10);
   const copied=JSON.parse(JSON.stringify(s));assert.ok(E.validate(copied));
   s=E.campaignPlay(copied,2);assert.equal(E.campaignView(s).playfield.remaining,0);
   assert.throws(()=>E.campaignPlay(s,1),/phase is complete/);
   s=E.campaignDecision(s,1);assert.ok(E.validate(s));
  }
  const completed=E.campaignHistory(s).completed[0];
  assert.equal(completed.playfield.plays.length,8);
  assert.equal(completed.result.plays,8);
  assert.equal(completed.choices.length,4);
  assert.equal(E.campaignView(s),null);
 }
});
test('career playfields remember different mechanics and remain stable through save migration',()=>{
 let sports=E.createLife({seed:2202});sports.age=30;sports.cash=60000;sports.world.sports.sport='Basketball';
 sports=E.act(sports,'campaign:start:sports');
 const weak=E.campaignView(sports).playfield.weakLane;
 sports=E.campaignPlay(sports,weak);
 const board=E.campaignView(sports).playfield;
 assert.notEqual(board.weakLane,weak); // Opponents adapt after the player's attack.
 assert.equal(board.ours,0); // Preseason drills must not score official match goals.
 assert.equal(board.theirs,0);
 assert.ok(board.fatigue>8);
 let film=E.createLife({seed:2203});film.age=30;film.cash=60000;film.world.entertainment.path='Film actor';
 film=E.act(film,'campaign:start:film');delete film.careerCampaigns.active.playfield;
 assert.ok(E.validate(film));assert.equal(E.campaignView(film).playfield.takes,0);
 film=E.campaignPlay(film,0);assert.equal(E.campaignView(film).playfield.takes,1);
 assert.equal(E.campaignView(film).playfield.coverage.length,3);
 let business=E.createLife({seed:2204});business.age=30;business.cash=20000;business.business={sector:'shop',capital:9000,quality:70,demand:64};
 business=E.act(business,'campaign:start:business');business.cash=0;
 business=E.campaignPlay(business,2);assert.ok(E.validate(business));
 assert.ok(E.campaignView(business).playfield.orders>0);
 assert.equal(E.campaignView(business).playfield.actualCash,0);
 assert.equal(E.campaignView(business).playfield.trend.length,2);
});
test('career play actions remain deterministic and do not silently spend money',()=>{
 let s=E.createLife({seed:2205});s.age=30;s.cash=10000;s.world.sports.sport='Tennis';
 s=E.act(s,'campaign:start:sports');
 const first=E.campaignPlay(s,1),replay=E.campaignPlay(s,1);
 assert.deepEqual(first,replay);
 assert.equal(first.cash,s.cash);
 assert.equal(s.careerCampaigns.active.playfield.plays.length,0);
 assert.equal(E.campaignView(first).playfield.plays,1);
});

test('fictional election debates and clinical cases offer five different playable professions',()=>{
 assert.equal(E.careerCampaignTypes.length,5);
 for(const type of ['election','medical']){
  let s=E.createLife({seed:type==='election'?3101:3102});s.age=31;s.cash=100000;s.stats.knowledge=92;s.stats.social=85;s.stats.reputation=85;
  if(type==='election')s.world.politics.party='Civic Renewal';else s.job={id:15,level:1,experience:0};
  s=E.act(s,'campaign:start:'+type);
  assert.ok(E.validate(s));assert.equal(E.campaignView(s).playfield.remaining,2);
  const contact=E.campaignView(s).contact;
  assert.ok(contact?.name);assert.ok(contact?.role);
  for(let stage=0;stage<4;stage++){
   let v=E.campaignView(s);const roundCash=s.cash;assert.equal(v.round,stage+1);assert.equal(v.playfield.options.length,3);
   assert.ok(v.playfield.question.length>50);
   assert.throws(()=>E.campaignPlay(s,3),/valid/);
   s=E.campaignPlay(s,0);
   const reply=E.campaignView(s);
   assert.ok(reply.playfield.last.reaction);assert.equal(reply.playfield.remaining,1);
   assert.equal(reply.playfield.last.reaction.person,contact.name);
   s=E.campaignPlay(s,1);
   assert.equal(E.campaignView(s).playfield.remaining,0);
   assert.equal(s.cash,roundCash); // Interactive planning turns are free; separate story choices can have valid costs.
   assert.throws(()=>E.campaignPlay(s,2),/phase is complete/);
   assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
   s=E.campaignDecision(s,1);
   assert.ok(E.validate(s));
  }
  const complete=E.campaignHistory(s);
  assert.equal(complete.completed[0].playfield.plays.length,8);
  assert.equal(complete.reactions.length,12);
  assert.equal(complete.aftermath.length,1);
  assert.equal(complete.aftermath[0].nextAge,32);
  assert.equal(E.campaignView(s),null);
  assert.ok(Number.isFinite(complete.completed[0].result.rating));
 }
});
test('tactical civic answers change trust and rival reaction across saved scenes',()=>{
 let s=E.createLife({seed:3103});s.age=34;s.cash=80000;s.world.politics.party='Civic Renewal';
 s=E.act(s,'campaign:start:election');
 const contact=E.campaignView(s).contact;
 const rival=s.world.characters.politicians.find(x=>x.id===contact.id);
 assert.ok(rival);
 const oldRespect=rival.respect;
 s=E.campaignPlay(s,0);
 const reaction=E.campaignView(s).lastReaction;
 assert.equal(reaction.person,contact.name);
 assert.ok(s.world.characters.politicians.find(x=>x.id===contact.id).respect>oldRespect);
 assert.ok(s.careerCampaigns.reactions.length>0);
 const replay=E.campaignPlay(s,1);assert.ok(E.validate(replay));
 assert.equal(s.careerCampaigns.active.playfield.plays.length,1);
 let migration=E.createLife({seed:3104});migration.age=30;migration.cash=50000;migration.job={id:15,level:1,experience:0};
 migration=E.act(migration,'campaign:start:medical');delete migration.careerCampaigns.active.playfield;
 assert.equal(E.campaignView(migration).playfield.safety,48);
 migration=E.campaignPlay(migration,0);assert.ok(E.validate(migration));
});
test('medical decisions emphasize consent and supervision without clinical diagnosis',()=>{
 let s=E.createLife({seed:3105});s.age=30;s.cash=70000;s.job={id:15,level:1,experience:0};s.stats.knowledge=90;s.skills.technical=95;
 s=E.act(s,'campaign:start:medical');
 const initial=E.campaignView(s).playfield;
 assert.equal(initial.caseId,'CASE A-17');assert.ok(initial.question.includes('records'));
 s=E.campaignPlay(s,0);
 assert.ok(E.campaignView(s).playfield.safety>initial.safety);
 s=E.campaignDecision(s,1);
 s=E.campaignPlay(s,0);
 assert.ok(E.campaignView(s).playfield.consent>initial.consent);
 assert.ok(E.validate(s));
});
test('career project aftermath returns at years one, three and five without blocking unrelated life events',()=>{
 for(const type of ['sports','film','election','medical','business']){
  let s=E.createLife({seed:3200+['sports','film','election','medical','business'].indexOf(type)});
  s.age=35;s.cash=100000;s.stats.knowledge=96;s.stats.health=96;s.stats.creativity=92;s.stats.reputation=94;
  if(type==='sports')s.world.sports.sport='Tennis';
  if(type==='film')s.world.entertainment.path='Film director';
  if(type==='election')s.world.politics.party='Civic Renewal';
  if(type==='medical')s.job={id:15,level:1,experience:0};
  if(type==='business')s.business={sector:'shop',capital:20000,quality:68,demand:50};
  s=E.act(s,'campaign:start:'+type);
  for(let stage=0;stage<4;stage++)s=E.campaignDecision(s,1);
  let life=E.campaignHistory(s).aftermath[0];
  assert.equal(life.startedAge,35);assert.equal(life.nextAge,36);
  const log=[];
  for(let i=0;i<5;i++){
   s.pending=null;s=E.ageUp(s);assert.ok(E.validate(s));
   life=E.campaignHistory(s).aftermath[0];log.push(life.step);
  }
  assert.deepEqual(log,[1,1,2,2,3]);
  assert.deepEqual(life.chapterLog.map(x=>x.age),[36,38,40]);
  assert.equal(life.status,'completed');assert.equal(life.nextAge,null);
  assert.ok(life.chapterLog.every(x=>x.message.length>65));
 }
});
test('heirs inherit a completed career record but not unfinished ancestor followups',()=>{
 let s=E.createLife({seed:3301});s.age=35;s.cash=100000;s.world.entertainment.path='Film director';
 s=E.act(s,'campaign:start:film');for(let stage=0;stage<4;stage++)s=E.campaignDecision(s,1);
 s.actions=3;s=E.act(s,'date');s=E.act(s,'child');
 const child=s.people.find(x=>x.role==='child');child.age=20;
 s.alive=false;s.pending=null;
 const heir=E.legacy(s,child.id);
 assert.ok(E.validate(heir));
 assert.equal(E.campaignHistory(heir).completed.length,1);
 assert.equal(E.campaignHistory(heir).aftermath.length,0);
 assert.ok(E.campaignHistory(heir).reactions.length>0);
});

test('career aftermath chapters offer optional choices without trapping the player',()=>{
 let s=E.createLife({seed:3501});s.age=33;s.cash=100000;s.world.sports.sport='Football';
 s=E.act(s,'campaign:start:sports');
 for(let i=0;i<4;i++)s=E.campaignDecision(s,1);
 s=E.ageUp(s);assert.equal(s.age,34);assert.ok(E.validate(s));
 const thread=E.campaignHistory(s).aftermath[0];
 assert.equal(thread.step,1);assert.equal(thread.pending.age,34);
 // Story events are resolved before optional career actions appear.
 if(s.pending!==null){assert.equal(E.commands(s).some(x=>x.id.startsWith('careerfollow:')),false);s=E.resolve(s,1);}
 const opts=E.commands(s).filter(x=>x.id.startsWith('careerfollow:'));
 assert.equal(opts.length,2);
 const before=s.actions,money=s.cash;
 s=E.act(s,opts[0].id);
 assert.equal(s.actions,before-1);assert.equal(s.cash,money);
 assert.equal(E.campaignHistory(s).aftermath[0].pending.response,0);
 assert.equal(E.commands(s).some(x=>x.id.startsWith('careerfollow:')),false);
 assert.ok(E.validate(s));
 assert.throws(()=>E.act(s,opts[1].id),/not available/);
});
test('unanswered followups never block aging and new conversations replace old pending actions',()=>{
 let s=E.createLife({seed:3502});s.age=31;s.cash=100000;s.world.entertainment.path='Film actor';
 s=E.act(s,'campaign:start:film');for(let i=0;i<4;i++)s=E.campaignDecision(s,1);
 for(let i=0;i<5;i++){s.pending=null;s=E.ageUp(s);assert.ok(E.validate(s));}
 const t=E.campaignHistory(s).aftermath[0];
 assert.equal(t.step,3);assert.equal(t.status,'completed');
 assert.equal(t.pending.age,36);assert.equal(t.pending.response,null);
 s.pending=null;
 const options=E.commands(s).filter(x=>x.id.startsWith('careerfollow:'));
 assert.equal(options.length,2); // Optional final response remains available this year.
 s=E.act(s,options[1].id);
 assert.equal(E.campaignHistory(s).aftermath[0].pending.response,1);
 assert.ok(E.validate(s));
});

test('relationship day is an interactive three-stage character story with persistent memories',()=>{
 let s=E.createLife({seed:4101});s.age=25;s.cash=3000;s.actions=3;
 const parent=s.people[0],oldBond=parent.bond;
 const cmd='scene:start:bond:'+parent.id;
 assert.ok(E.commands(s).some(x=>x.id===cmd&&x.enabled));
 s=E.act(s,cmd);
 assert.equal(E.everydayView(s).type,'bond');assert.ok(E.validate(s));
 assert.equal(E.everydayView(s).round,1);
 assert.throws(()=>E.ageUp(s),/everyday scene/);
 assert.throws(()=>E.sceneChoice(s,4),/three/);
 for(let stage=0;stage<3;stage++){
  const before=s;
  const next=E.sceneChoice(s,stage%3);
  assert.equal(before.everydayScenes.active.stage,stage);
  s=next;assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
  if(stage<2)assert.equal(E.everydayView(s).round,stage+2);
 }
 assert.equal(E.everydayView(s),null);
 const item=E.everydayHistory(s).completed[0];
 assert.equal(item.choices.length,3);
 assert.equal(item.type,'bond');
 assert.ok(item.outcome);
 assert.equal(E.everydayHistory(s).callbacks.length,1);
 assert.ok(s.people[0].memories.some(x=>/day|relationship|tension|turning/.test(x.text)));
 assert.notEqual(s.people[0].bond,oldBond);
 assert.ok(!E.commands(s).some(x=>x.id===cmd&&x.enabled));
});
test('school challenge builds a recurring student profile and affects the actual school experience',()=>{
 let s=E.createLife({seed:4102});s.age=12;s.actions=3;
 assert.ok(E.commands(s).some(x=>x.id==='scene:start:school'&&x.enabled));
 s=E.act(s,'scene:start:school');
 let view=E.everydayView(s);const track=view.track;
 assert.ok(view.prompt.length>30);assert.equal(view.options.length,3);
 const peer=view.personName;
 for(const i of [0,1,2]){s=E.sceneChoice(s,i);assert.ok(E.validate(s));}
 assert.equal(E.everydayView(s),null);
 const history=E.everydayHistory(s);
 assert.equal(history.schoolResults[0].track,track);
 assert.equal(history.classmate.name,peer);
 assert.ok(s.stats.knowledge>=0&&s.stats.knowledge<=100);
 assert.ok(history.callbacks.some(x=>x.dueAge===13));
 assert.equal(E.commands(s).find(x=>x.id==='scene:start:school').enabled,false);
});
test('fictional courtroom choices resolve through the existing justice system',()=>{
 let s=E.createLife({seed:4103});s.age=35;s.cash=9000;s.actions=3;
 s.justice.case={severity:52,counsel:false,opened:35};
 const cmd='scene:start:court';assert.ok(E.commands(s).some(x=>x.id===cmd&&x.enabled));
 s=E.act(s,cmd);const snapshot=JSON.parse(JSON.stringify(s));
 assert.equal(E.everydayView(s).type,'court');
 assert.ok(E.everydayView(s).disclaimer.includes('Fictional'));
 for(let i=0;i<3;i++){
  s=E.sceneChoice(s,i);assert.ok(E.validate(s));
 }
 assert.equal(E.everydayView(s),null);assert.equal(s.justice.case,null);
 assert.equal(s.justice.history.length,1);
 assert.equal(E.everydayHistory(s).completed[0].verdict,s.justice.history[0].verdict);
 assert.ok(E.everydayHistory(s).completed[0].courtPreparation>=0);
 assert.ok(snapshot.justice.case);
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
});
test('leaving a courtroom preserves the pending case and legacy hearing path',()=>{
 let s=E.createLife({seed:4104});s.age=32;s.cash=10000;s.justice.case={severity:25,counsel:false,opened:32};
 s=E.act(s,'scene:start:court');
 s=E.sceneChoice(s,'leave');
 assert.equal(E.everydayView(s),null);assert.ok(s.justice.case);
 assert.ok(E.commands(s).some(x=>x.id==='justice:hearing'&&x.enabled));
 s=E.act(s,'justice:hearing');
 assert.equal(s.justice.case,null);
 assert.ok(E.validate(s));
});
test('surprises and character preferences vary while deterministic replays remain identical',()=>{
 const combinations=new Set();
 for(let seed=4200;seed<4230;seed++){
  const original=E.createLife({seed});original.age=22;
  let a=E.act(original,'scene:start:bond:'+original.people[0].id);
  combinations.add(a.everydayScenes.active.twist+':'+a.everydayScenes.active.preference);
  assert.deepEqual(E.sceneChoice(a,1),E.sceneChoice(a,1));
  assert.equal(a.everydayScenes.active.choices.length,0);
 }
 assert.ok(combinations.size>=8);
});
test('an unresolved school or relationship memory returns years later and accepts one optional response',()=>{
 for(const type of ['school','bond']){
  let s=E.createLife({seed:type==='school'?4301:4302});s.age=type==='school'?12:32;
  const cmd=type==='school'?'scene:start:school':'scene:start:bond:'+s.people[0].id;
  s=E.act(s,cmd);for(const i of [0,1,2])s=E.sceneChoice(s,i);
  const due=E.everydayHistory(s).callbacks[0].dueAge;
  while(s.age<due){s.pending=null;s=E.ageUp(s);assert.ok(E.validate(s));}
  s.pending=null;
  const options=E.commands(s).filter(x=>x.id.startsWith('scene:callback:'));
  assert.equal(options.length,2);
  const oldActions=s.actions;
  s=E.act(s,options[0].id);
  assert.equal(s.actions,oldActions-1);
  assert.equal(E.everydayHistory(s).callbacks[0].status,'resolved');
  assert.equal(E.commands(s).filter(x=>x.id.startsWith('scene:callback:')).length,0);
  assert.ok(E.validate(s));
 }
});
test('old saves and heirs do not inherit active everyday obligations',()=>{
 let old=E.createLife({seed:4401});delete old.everydayScenes;assert.ok(E.validate(old));
 old.age=30;old=E.act(old,'scene:start:bond:'+old.people[0].id);
 for(const i of [0,1,2])old=E.sceneChoice(old,i);
 old.actions=3;old=E.act(old,'date');old=E.act(old,'child');
 const child=old.people.find(x=>x.role==='child');child.age=20;
 old.alive=false;old.pending=null;
 const heir=E.legacy(old,child.id);
 assert.ok(E.validate(heir));
 assert.equal(E.everydayHistory(heir).callbacks.length,0);
 assert.equal(E.everydayView(heir),null);
 assert.equal(E.everydayHistory(heir).completed.length,1);
});

function prepareGraduatingCohort(seed){
 let s=E.createLife({seed});s.age=17;s.actions=3;s.pending=null;
 s=E.act(s,'scene:start:school');
 const first=E.everydayView(s).personName;
 for(const i of [0,1,2])s=E.sceneChoice(s,i);
 assert.ok(E.validate(s));
 s.pending=null;s=E.ageUp(s);
 assert.equal(s.age,18);assert.ok(E.validate(s));
 return {s,first};
}
test('school cohort has four distinct people who can become adult alumni without losing earlier results',()=>{
 let s=E.createLife({seed:6101});s.age=12;s.actions=3;s.pending=null;
 s=E.act(s,'scene:start:school');
 const first=E.everydayView(s).personName;
 for(const i of [0,1,2])s=E.sceneChoice(s,i);
 assert.equal(E.everydayHistory(s).classmates.length,4);
 assert.equal(new Set(E.everydayHistory(s).classmates.map(x=>x.name)).size,4);
 s.age=13;s.actions=3;s.pending=null;
 s=E.act(s,'scene:start:school');
 assert.notEqual(E.everydayView(s).personName,first);
 for(const i of [0,1,2])s=E.sceneChoice(s,i);
 assert.equal(E.everydayHistory(s).schoolResults.length,2);
 assert.ok(E.validate(s));
 s.age=17;s.actions=3;s.pending=null;
 s=E.ageUp(s);
 const alumni=E.autonomyView(s).alumni;
 assert.equal(alumni.length,4);
 assert.ok(alumni.some(x=>x.name===first));
 assert.ok(alumni.every(x=>x.age===18&&x.id.startsWith('alum-')));
 assert.ok(E.conversationPeople(s).some(p=>p.id===alumni[0].id));
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
});
test('alumni form autonomous lifelong social links and influence the existing relationship graph',()=>{
 let {s}=prepareGraduatingCohort(6102);
 assert.equal(E.autonomyView(s).alumni.length,4);
 const arcs=E.autonomyView(s).opportunities;
 assert.ok(arcs.length>=1&&arcs[0].dueAge===19);
 for(let i=0;i<12;i++){s.pending=null;s=E.ageUp(s);assert.ok(E.validate(s));}
 const state=E.autonomyView(s);
 assert.ok(state.links.length>=3);
 assert.ok(state.links.every(x=>x.years>=1));
 assert.ok(s.world.network.edges.some(x=>x.a.startsWith('alum-')||x.b.startsWith('alum-')));
 assert.ok(state.news.length>0);
 assert.ok(state.alumni.some(x=>x.careerLevel>0||x.location==='another city'));
});
test('autonomous partner relationships emerge from compatible adult classmates without player interaction',()=>{
 let {s}=prepareGraduatingCohort(6103);
 for(const p of s.world.autonomy.alumni){p.trust=94;p.rivalry=4;p.preference=1;}
 for(let i=0;i<11;i++){s.pending=null;s=E.ageUp(s);assert.ok(E.validate(s));}
 const links=E.autonomyView(s).links;
 assert.ok(links.length>=3);
 assert.ok(links.some(x=>x.status==='partners'||x.history.some(h=>h.status==='partners')),'Expected a recorded friendship-to-partnership transition');
 assert.ok(links.every(x=>x.trust>=0&&x.trust<=100));
});
test('player can reconnect, compete or partner professionally with an adult classmate once a year',()=>{
 let {s}=prepareGraduatingCohort(6104);s.pending=null;
 const id=E.autonomyView(s).alumni[0].id;
 const choices=E.commands(s).filter(x=>x.id.startsWith('autonomy:alumni:'+id+':'));
 assert.equal(choices.length,3);assert.ok(choices.some(x=>x.enabled));
 const oldActions=s.actions,oldNet=E.worth(s);
 s=E.act(s,choices.find(x=>x.id.endsWith(':reconnect')).id);
 assert.equal(s.actions,oldActions-1);
 assert.equal(E.worth(s),oldNet);
 assert.equal(E.autonomyView(s).alumni[0].lastInteractionAge,18);
 assert.equal(E.commands(s).filter(x=>x.id.startsWith('autonomy:alumni:'+id+':')).length,0);
 assert.ok(E.validate(s));
 s.pending=null;s=E.ageUp(s);s.pending=null;
 const p=s.world.autonomy.alumni[0];p.trust=100;
 const collab=E.commands(s).find(x=>x.id==='autonomy:alumni:'+id+':collaborate');
 assert.ok(collab.enabled);
 s=E.act(s,collab.id);assert.ok(E.validate(s));
 assert.ok(s.world.autonomy.alumni[0].collaborations===1);
});
test('major autonomous event creates playable opportunities after one, three and five years',()=>{
 let {s}=prepareGraduatingCohort(6105);
 const original=E.autonomyView(s).opportunities.find(x=>x.startedAge===18);
 assert.ok(original);assert.equal(original.dueAge,19);
 const seen=[];
 for(const [age,option] of [[19,0],[21,1],[23,0]]){
  while(s.age<age){s.pending=null;s=E.ageUp(s);assert.ok(E.validate(s));}
  s.pending=null;
  const arc=E.autonomyView(s).opportunities.find(x=>x.id===original.id);
  assert.ok(arc?.ready);assert.equal(arc.stage,seen.length);
  const cmds=E.commands(s).filter(x=>x.id.startsWith('autonomy:arc:'+arc.id+':'));
  assert.equal(cmds.length,3);assert.ok(cmds[option].enabled);
  const cash=s.cash;
  s=E.act(s,cmds[option].id);seen.push(age);
  assert.equal(s.actions,2);assert.equal(s.cash,cash);
  assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
 }
 const completed=E.autonomyView(s).completed.find(x=>x.id===original.id);
 assert.ok(completed);assert.equal(completed.history.length,3);
 assert.deepEqual(completed.history.map(h=>h.age),[19,21,23]);
 assert.equal(E.autonomyView(s).opportunities.some(x=>x.id===original.id),false);
 assert.ok(E.autonomyView(s).news.some(x=>/concluded/.test(x.text)));
});
test('skipping future invitations never traps age progression and records the missed chapters',()=>{
 let {s}=prepareGraduatingCohort(6106);
 const original=E.autonomyView(s).opportunities.find(x=>x.startedAge===18);
 for(let i=0;i<7;i++){s.pending=null;s=E.ageUp(s);assert.ok(E.validate(s));}
 const completed=E.autonomyView(s).completed.find(x=>x.id===original.id);
 assert.ok(completed);
 assert.deepEqual(completed.history.map(h=>h.outcome),['unanswered','unanswered','unanswered']);
 assert.ok(completed.endedAge>=24);
});
test('alumni are ordinary persistent conversation partners in the original social dialogue system',()=>{
 let {s}=prepareGraduatingCohort(6107);s.pending=null;
 const alum=E.autonomyView(s).alumni[0];
 const cmd=E.commands(s).find(x=>x.id==='dialogue:open:'+alum.id);
 assert.ok(cmd.enabled);
 s=E.act(s,cmd.id);assert.equal(E.dialogueView(s).speaker,alum.name);
 for(const i of [0,1,0]){s=E.dialogueReply(s,i);assert.ok(E.validate(s));}
 assert.equal(E.dialogueView(s),null);
 assert.ok(E.networkView(s).dialogues.some(x=>x.id===alum.id));
});
test('new autonomous world is optional in old version-2 saves and heir inheritance preserves only legacy history',()=>{
 let s=E.createLife({seed:6108});delete s.world.autonomy;
 assert.ok(E.validate(s));assert.equal(E.autonomyView(s).alumni.length,0);
 s.age=17;s.pending=null;s=E.act(s,'scene:start:school');
 for(const i of [0,1,2])s=E.sceneChoice(s,i);
 s.pending=null;s=E.ageUp(s);
 for(let i=0;i<6;i++){s.pending=null;s=E.ageUp(s);}
 const oldHistory=E.autonomyView(s).completed.length;
 s.actions=3;s.pending=null;s=E.act(s,'date');s=E.act(s,'child');
 const child=s.people.find(x=>x.role==='child');child.age=20;
 s.alive=false;s.pending=null;
 const heir=E.legacy(s,child.id);
 assert.ok(E.validate(heir));
 assert.equal(E.autonomyView(heir).alumni.length,0);
 assert.equal(E.autonomyView(heir).opportunities.length,0);
 assert.ok(E.autonomyState(heir).archive.length>=oldHistory);
});

test('future story chapters cite shared school experiences and reflect earlier decisions',()=>{
 let {s}=prepareGraduatingCohort(6201);
 const arc=E.autonomyView(s).opportunities[0];
 assert.ok(arc.chapterText.includes('classrooms')||arc.chapterText.includes('worked together on'));
 assert.ok(arc.chapterText.includes(arc.npcName));
 s.pending=null;s=E.ageUp(s);s.pending=null;
 const command=E.commands(s).find(c=>c.id==='autonomy:arc:'+arc.id+':2');
 assert.ok(command?.enabled);s=E.act(s,command.id);
 assert.ok(E.validate(s));
 const followup=E.autonomyView(s).opportunities.find(x=>x.id===arc.id);
 assert.ok(followup.chapterText.includes('moved forward without your direct involvement'));
 assert.equal(followup.dueAge,21);
});
test('existing single-classmate saves migrate into adult characters without losing their historical IDs',()=>{
 let s=E.createLife({seed:6202});s.age=17;s.pending=null;
 s.everydayScenes={active:null,completed:[],callbacks:[],used:{},classmate:{id:'school-peer',name:'Old Classmate',trust:80,rivalry:12,preference:1,history:[{age:14,track:'Science fair',grade:'progress'}]},schoolResults:[]};
 assert.ok(E.validate(s));
 s=E.ageUp(s);s.pending=null;
 const alumni=E.autonomyView(s).alumni;
 assert.equal(alumni.length,1);assert.equal(alumni[0].id,'school-peer');
 assert.equal(alumni[0].name,'Old Classmate');
 assert.ok(E.conversationPeople(s).some(p=>p.id==='school-peer'));
 s=E.ageUp(s);s.pending=null;
 const arc=E.autonomyView(s).opportunities.find(x=>x.ready);
 assert.ok(arc);s=E.act(s,'autonomy:arc:'+arc.id+':0');assert.ok(E.validate(s));
 assert.ok(E.autonomyView(s).alumni[0].trust>=0);
});

function getPlayableCharacterStory(seed=15001){
 let s=E.createLife({seed});s.age=14;s.pending=null;s=E.ageUp(s);s.pending=null;
 const invitations=E.storyDirectorHistory(s).queue;
 assert.ok(invitations.length,'A named personal conflict should be created at the first eligible story year.');
 const offer=invitations[0];assert.ok(offer.firstName&&offer.secondName&&offer.firstId!==offer.secondId);
 assert.equal(offer.age,15);
 return {s,offer};
}
test('character story director selects named people from the actual living simulation',()=>{
 const {s,offer}=getPlayableCharacterStory();
 assert.ok(['person','alumni','parent','sibling','friend','partner','professional','child'].includes(offer.firstKind));
 assert.ok(offer.title.length>10);
 assert.ok(offer.firstName!==offer.secondName||offer.firstId!==offer.secondId);
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
 assert.ok(E.commands(s).some(c=>c.id==='episode:start:'+offer.id&&c.enabled));
});
test('social episodes have three interactive, free followup decisions and a playable exit',()=>{
 let {s,offer}=getPlayableCharacterStory(15002);
 const priorActions=s.actions;
 s=E.act(s,'episode:start:'+offer.id);
 assert.equal(s.actions,priorActions-1);
 assert.ok(E.validate(s));
 assert.equal(E.storyDirectorView(s).round,1);
 assert.throws(()=>E.ageUp(s),/character story/);
 assert.equal(E.commands(s).length,0);
 assert.throws(()=>E.storyDirectorChoose(s,9),/three/);
 for(const [stage,index] of [[0,0],[1,1],[2,2]]){
  const before=s;
  const next=E.storyDirectorChoose(s,index);
  assert.equal(before.world.storyDirector.active.phase,stage);
  assert.equal(next.actions,priorActions-1);
  s=next;assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
  if(stage<2){assert.equal(E.storyDirectorView(s).round,stage+2);assert.equal(E.storyDirectorView(s).options.length,3);}
 }
 assert.equal(E.storyDirectorView(s),null);
 assert.ok(E.commands(s).length>0);
 const completed=E.storyDirectorHistory(s).completed[0];
 assert.equal(completed.choices.length,3);
 assert.ok(['reconciled','clarified','fractured','complicated'].includes(completed.outcome));
 const echoes=E.storyDirectorHistory(s).echoes;
 assert.equal(echoes.length,1);
 assert.equal(echoes[0].dueAge,17);
 assert.equal(echoes[0].status,'scheduled');
});
test('character story memories have real consequences two years later without blocking life progression',()=>{
 let {s,offer}=getPlayableCharacterStory(15003);
 s=E.act(s,'episode:start:'+offer.id);
 for(const index of [0,0,0])s=E.storyDirectorChoose(s,index);
 assert.equal(E.storyDirectorHistory(s).echoes[0].status,'scheduled');
 for(const age of [16,17]){
  s.pending=null;s=E.ageUp(s);
  assert.ok(E.validate(s));assert.equal(s.age,age);
 }
 assert.equal(E.storyDirectorHistory(s).echoes[0].status,'resolved');
 assert.equal(E.storyDirectorHistory(s).echoes[0].resolvedAge,17);
 assert.ok(E.storyDirectorHistory(s).news.some(n=>n.kind==='aftereffect'));
 s.pending=null;s=E.ageUp(s);
 assert.equal(E.storyDirectorHistory(s).news.filter(n=>n.kind==='aftereffect').length,1);
});
test('social story decisions are deterministic, save-safe and bounded by previous context',()=>{
 const outcomes=[];
 for(let seed=15010;seed<15040;seed++){
  let {s,offer}=getPlayableCharacterStory(seed);
  outcomes.push(offer.theme+':'+offer.firstId+':'+offer.secondId);
  s=E.act(s,'episode:start:'+offer.id);
  const t=E.storyDirectorView(s);
  assert.ok(t.prompt.includes(t.lead)||t.prompt.includes(t.other));
  assert.ok(t.prompt.length>70);
  assert.deepEqual(E.storyDirectorChoose(s,1),E.storyDirectorChoose(s,1));
  assert.equal(E.storyDirectorView(s).round,1);
  const after=E.storyDirectorChoose(s,1);
  assert.equal(E.storyDirectorView(after).round,2);
  assert.ok(E.validate(JSON.parse(JSON.stringify(after))));
 }
 // An early teenager may only know two parents; theme variety is intentionally bounded.
 assert.ok(new Set(outcomes).size>=6);
 const adultOutcomes=[];
 for(let seed=15100;seed<15130;seed++){
  let t=E.createLife({seed});t.age=23;t.pending=null;t=E.ageUp(t);t.pending=null;
  const offer=E.storyDirectorHistory(t).queue[0];
  assert.ok(offer);
  adultOutcomes.push(offer.theme+':'+offer.firstId+':'+offer.secondId);
 }
 assert.ok(new Set(adultOutcomes).size>=12,'Adults should encounter more cast/plot combinations than teens.');
});
test('walking away ends an episode, preserves chronology and does not take another action',()=>{
 let {s,offer}=getPlayableCharacterStory(15050);
 s=E.act(s,'episode:start:'+offer.id);
 const annual=s.actions,worthBefore=E.worth(s);
 s=E.storyDirectorChoose(s,'leave');
 assert.equal(E.storyDirectorView(s),null);
 assert.equal(s.actions,annual);assert.equal(E.worth(s),worthBefore);
 assert.equal(E.storyDirectorHistory(s).completed[0].outcome,'walked away');
 assert.equal(E.storyDirectorHistory(s).echoes.length,0);
 assert.ok(E.validate(s));
});
test('unanswered story invitations expire automatically, not trapping the player',()=>{
 let {s,offer}=getPlayableCharacterStory(15060);
 s.pending=null;s=E.ageUp(s);assert.equal(s.age,16);
 assert.ok(E.storyDirectorHistory(s).queue.some(e=>e.id===offer.id));
 s.pending=null;s=E.ageUp(s);assert.equal(s.age,17);
 assert.equal(E.storyDirectorHistory(s).queue.some(e=>e.id===offer.id),false);
 assert.ok(E.storyDirectorHistory(s).completed.some(e=>e.id===offer.id&&e.outcome==='unanswered'));
 assert.ok(E.validate(s));
});
test('new character story director remains optional on old saves and heirs inherit only concluded history',()=>{
 let s=E.createLife({seed:15070});delete s.world.storyDirector;
 assert.ok(E.validate(s));assert.equal(E.storyDirectorView(s),null);
 s.age=14;s.pending=null;s=E.ageUp(s);s.pending=null;
 const offer=E.storyDirectorHistory(s).queue[0];
 s=E.act(s,'episode:start:'+offer.id);
 for(const i of [0,1,2])s=E.storyDirectorChoose(s,i);
 s.age=30;s.actions=3;s.pending=null;
 s=E.act(s,'date');s=E.act(s,'child');
 const child=s.people.find(p=>p.role==='child');child.age=20;
 s.alive=false;s.pending=null;
 const heir=E.legacy(s,child.id);
 assert.ok(E.validate(heir));
 assert.equal(E.storyDirectorHistory(heir).queue.length,0);
 assert.equal(E.storyDirectorHistory(heir).echoes.length,0);
 assert.equal(E.storyDirectorHistory(heir).completed.length,1);
 assert.ok(E.storyDirectorHistory(heir).completed[0].sourceLife);
});
test('character-story achievements are earned only after enough completed resolutions',()=>{
 const base=E.createLife({seed:15080});
 assert.ok(!E.achievementStatus(base).find(x=>x.name==='trusted mediator').eligible);
 assert.ok(!E.achievementStatus(base).find(x=>x.name==='story of a lifetime').eligible);
 base.world.storyDirector={...E.storyDirectorState(base),completed:Array.from({length:8},(_,i)=>({outcome:i<3?'reconciled':'complicated'}))};
 assert.ok(E.achievementStatus(base).find(x=>x.name==='trusted mediator').eligible);
 assert.ok(E.achievementStatus(base).find(x=>x.name==='story of a lifetime').eligible);
});
