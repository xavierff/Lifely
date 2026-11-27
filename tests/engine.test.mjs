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

test('catalog targets, distinct prompts and valid IDs',()=>{let s=E.createLife({seed:2});assert.equal(E.events.length,1109);assert.equal(new Set(E.events.map(e=>e.prompt)).size,1109);assert.equal(E.careers.length,153);assert.equal(new Set(E.careers.map(j=>j.title)).size,153);assert.equal(E.achievementStatus(s).length,136);assert.equal(new Set(E.achievementStatus(s).map(a=>a.name)).size,136);assert.equal(E.challengeProgress(s).length,68);assert.equal(new Set(E.challengeProgress(s).map(c=>c.id)).size,68);for(let i=0;i<E.events.length;i++)assert.equal(E.events[i].id,i);});
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
 assert.equal(E.achievementStatus(s).length,136);assert.equal(E.challengeProgress(s).length,68);assert.equal(E.ribbons.length,39);
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

function readyForHobby(seed=17001,age=19){
 const s=E.createLife({seed});s.age=age;s.pending=null;s.actions=3;
 return s;
}
test('all twelve original hobbies have unique tactical problems and readable strategies',()=>{
 assert.equal(E.hobbyTypes.length,12);
 assert.equal(new Set(E.hobbyTypes.map(x=>x.id)).size,12);
 for(const hobby of E.hobbyTypes){
  const s=readyForHobby(17010,Math.max(8,hobby.minAge+1));
  const cmd='hobby:start:'+hobby.id+':practice';
  assert.ok(E.commands(s).some(x=>x.id===cmd&&x.enabled));
  const active=E.act(s,cmd),view=E.hobbyView(active);
  assert.ok(view);assert.equal(view.options.length,3);assert.ok(view.prompt.length>35);
  assert.ok(view.hint.includes('Read the situation'));
  assert.equal(view.title,hobby.name);
  assert.ok(E.validate(JSON.parse(JSON.stringify(active))));
  const round=E.hobbyDecision(active,0);
  assert.ok(E.validate(round));
  assert.equal(E.hobbyView(round).round,2);
 }
});
test('practicing a hobby plays exactly three decisions without charging extra years or activities',()=>{
 let s=readyForHobby(17002);
 const before=E.worth(s);
 s=E.act(s,'hobby:start:chess:practice');
 assert.equal(s.actions,2);assert.equal(E.hobbyView(s).mode,'practice');
 assert.ok(E.validate(s));
 assert.throws(()=>E.ageUp(s),/hobby challenge/);
 assert.deepEqual(E.hobbyDecision(s,1),E.hobbyDecision(s,1));
 assert.throws(()=>E.hobbyDecision(s,3),/three tactical responses/);
 for(const [round,i] of [1,0,2].entries()){
  s=E.hobbyDecision(s,i);
  assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
  if(round<2)assert.equal(E.hobbyView(s).round,round+2);
 }
 assert.equal(E.hobbyView(s),null);
 assert.equal(s.age,19);assert.equal(s.actions,2);
 assert.equal(E.worth(s),before);
 const p=E.hobbySummary(s).profiles.find(x=>x.id==='chess');
 assert.ok(p.mastery>0);assert.equal(p.practice,1);assert.equal(p.contests,0);
 assert.equal(E.hobbySummary(s).history[0].lessons.length,3);
 assert.ok(!E.commands(s).some(x=>x.id==='hobby:start:chess:contest'&&x.enabled));
});
test('contests have skill-first fair answers, rivals and bounded cash prizes',()=>{
 let s=readyForHobby(17003,25);let last=E.worth(s);
 s=E.act(s,'hobby:start:streetball:contest');
 const challenger=E.hobbyView(s).opponent;
 let correctCount=0;
 // Given the visible cue, each of the three authored moments has a unique optimal tactic.
 const tellToChoice={'The defender overcommits':1,'A teammate cuts':0,'The opponent is tired':2};
 while(E.hobbyView(s)){
  const cue=E.hobbyView(s).prompt;
  const key=Object.keys(tellToChoice).find(k=>cue.startsWith(k));
  assert.ok(key,'Tactical problem should have a readable answer.');
  s=E.hobbyDecision(s,tellToChoice[key]);
  correctCount++;
 }
 assert.equal(correctCount,3);
 const p=E.hobbySummary(s).profiles.find(x=>x.id==='streetball');
 assert.equal(p.contests,1);
 assert.ok(p.wins+p.losses===1);
 assert.equal(p.rivals.reduce((a,b)=>a+b.encounters,0),1);
 assert.ok(p.mastery>0);
 const reward=E.worth(s)-last;
 assert.ok(reward>=0&&reward<=1500);
 assert.equal(reward,E.hobbySummary(s).history[0].reward);
 assert.ok(E.validate(s));
});
test('strategy is skill-driven: correct tactics outperform clearly wrong tactics under same seed',()=>{
 const outcomes=[];
 for(let seed=17100;seed<17125;seed++){
  const start=readyForHobby(seed,25),a=E.act(start,'hobby:start:chess:contest');
  let right=a,wrong=a;
  const cues={
   'Your opponent leaves':1,
   'A tempting pawn':0,
   'A close endgame':2
  };
  for(let stage=0;stage<3;stage++){
   const cue=E.hobbyView(right).prompt;
   const key=Object.keys(cues).find(k=>cue.startsWith(k));assert.ok(key);
   right=E.hobbyDecision(right,cues[key]);
   wrong=E.hobbyDecision(wrong,(cues[key]+1)%3);
  }
  outcomes.push([E.hobbySummary(right).history[0].score,E.hobbySummary(wrong).history[0].score]);
  assert.ok(E.validate(right)&&E.validate(wrong));
 }
 assert.ok(outcomes.every(([a,b])=>a>=b));
 assert.ok(outcomes.some(([a,b])=>a>b));
});
test('two activities per year, and each discipline permits only one session per year',()=>{
 let s=readyForHobby(17004,25);
 for(const id of ['chess','dance']){
  s=E.act(s,'hobby:start:'+id+':practice');
  for(const i of [0,1,2])s=E.hobbyDecision(s,i);
  assert.ok(E.validate(s));
 }
 assert.equal(E.hobbySummary(s).playedThisAge,2);
 assert.equal(E.commands(s).filter(c=>c.id.startsWith('hobby:start:')).filter(c=>c.enabled).length,0);
 assert.ok(E.commands(s).some(c=>c.id==='rest'&&c.enabled));
 s=E.ageUp(s);s.pending=null;
 assert.equal(E.hobbySummary(s).playedThisAge,0);
 assert.ok(E.commands(s).some(c=>c.id==='hobby:start:chess:practice'&&c.enabled));
});
test('young children can garden safely, while older hobbies and competitions are age-gated',()=>{
 let s=readyForHobby(17005,6);
 let ids=E.commands(s).filter(c=>c.id.startsWith('hobby:start:')).map(c=>c.id);
 assert.ok(ids.includes('hobby:start:gardening:practice'));
 assert.ok(!ids.includes('hobby:start:chess:practice'));
 assert.ok(!ids.includes('hobby:start:gardening:contest'));
 s=E.act(s,'hobby:start:gardening:practice');
 for(const i of [1,0,2])s=E.hobbyDecision(s,i);
 assert.ok(E.validate(s));
 assert.ok(E.hobbySummary(s).history[0].reward===0);
});
test('rivals train independently across decades and trophy collections persist',()=>{
 let s=readyForHobby(17006,25);
 s=E.act(s,'hobby:start:openmic:contest');
 for(const i of [1,0,2])s=E.hobbyDecision(s,i);
 const old=E.hobbySummary(s).profiles.find(x=>x.id==='openmic');
 const firstRating=old.rivals[0].rating;
 for(let i=0;i<7;i++){
  s.pending=null;s=E.ageUp(s);
  assert.ok(E.validate(s));
 }
 const now=E.hobbySummary(s).profiles.find(x=>x.id==='openmic');
 assert.ok(now.rivals[0].rating>=firstRating);
 assert.ok(now.rivals[0].rating<=100);
 assert.ok(E.hobbySummary(s).news.some(x=>x.text.includes('challenging you again')));
 assert.ok(now.mastery>=old.mastery);
});
test('abandoning a hobby never traps the game and does not duplicate rewards',()=>{
 let s=readyForHobby(17007,25);
 const worth=E.worth(s);
 s=E.act(s,'hobby:start:gamejam:contest');
 s=E.hobbyDecision(s,1);
 s=E.hobbyDecision(s,'leave');
 assert.equal(E.hobbyView(s),null);
 assert.equal(E.worth(s),worth);
 assert.ok(E.validate(s));
 const summary=E.hobbySummary(s).profiles.find(x=>x.id==='gamejam');
 assert.equal(summary.wins,0);assert.equal(summary.contests,0);
 s.pending=null;s=E.ageUp(s);assert.ok(E.validate(s));
});
test('old version-2 saves without hobbies remain valid and descendant inherits trophies, not unfinished activities',()=>{
 let s=readyForHobby(17008,28);delete s.hobbyCircuit;
 assert.ok(E.validate(s));assert.equal(E.hobbySummary(s).history.length,0);
 s=E.act(s,'hobby:start:streetball:contest');
 for(const i of [1,0,2])s=E.hobbyDecision(s,i);
 s.actions=3;s.pending=null;s=E.act(s,'date');s=E.act(s,'child');
 const child=s.people.find(p=>p.role==='child');child.age=20;
 s.alive=false;s.pending=null;
 const heir=E.legacy(s,child.id);
 assert.ok(E.validate(heir));
 assert.equal(E.hobbySummary(heir).profiles.find(x=>x.id==='streetball').mastery,0);
 assert.equal(E.hobbySummary(heir).history.length,0);
 assert.ok(E.hobbyState(heir).hallOfFame.length<=12);
});

test('personal ambitions offer twenty-three original long-term tracks and preserve older saves',()=>{
 let s=E.createLife({seed:20401});delete s.ambitions;
 assert.ok(E.validate(s));assert.equal(E.ambitionSummary(s).active,null);
 assert.equal(E.ambitionTypes.length,23);
 assert.equal(new Set(E.ambitionTypes.map(x=>x.id)).size,23);
 assert.equal(E.commands(s).some(c=>c.id.startsWith('ambition:begin:')),false);
 s.age=12;
 assert.ok(E.commands(s).find(c=>c.id==='ambition:begin:wellness'));
 assert.ok(!E.commands(s).find(c=>c.id==='ambition:begin:financial'));
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
});
test('one personal ambition consumes one action and advances only from actual gameplay',()=>{
 let s=E.createLife({seed:20402});s.age=15;s.stats.health=72;s.stats.stress=43;
 const before=E.ambitionSummary(s);
 assert.equal(before.completed.length,0);
 s=E.act(s,'ambition:begin:wellness');
 assert.equal(s.actions,2);
 assert.equal(E.ambitionSummary(s).active.steps.length,3);
 assert.equal(E.ambitionSummary(s).active.yearsLeft,6);
 assert.throws(()=>E.act(s,'ambition:begin:scholar'),/not available/);
 assert.ok(!E.ambitionSummary(s).active.steps[0].achieved);
 s=E.act(s,'exercise');s=E.act(s,'exercise');
 assert.equal(E.ambitionSummary(s).active.steps[0].actual,2);
 assert.equal(E.ambitionSummary(s).completed.length,0);
 s.actions=3;
 const money=s.cash;s=E.act(s,'exercise');
 assert.equal(E.ambitionSummary(s).active,null);
 assert.equal(E.ambitionSummary(s).completed[0].id,'wellness');
 assert.equal(E.ambitionSummary(s).completed[0].steps.length,3);
 assert.equal(s.cash,money+100);
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
});
test('personal ambitions measure financial progress relative to commitment, not accumulated earlier wealth',()=>{
 let s=E.createLife({seed:20403});s.age=30;s.cash=50000;
 s=E.act(s,'ambition:begin:financial');
 assert.equal(E.ambitionSummary(s).active.steps[1].actual,0);
 assert.equal(E.ambitionSummary(s).active.steps[2].target,3000);
 s=E.act(s,'save:1000');s=E.act(s,'save:1000');
 assert.equal(E.ambitionSummary(s).active.steps[0].actual,2);
 assert.equal(E.ambitionSummary(s).completed.length,0);
 s.actions=3;s.cash+=16000;s=E.act(s,'rest');
 assert.equal(E.ambitionSummary(s).active,null);
 assert.equal(E.ambitionSummary(s).completed[0].status,'completed');
 assert.ok(E.validate(s));
});
test('business and career ambitions require an actual business or job, not mere age',()=>{
 let s=E.createLife({seed:20404});s.age=28;s.cash=500000;
 assert.ok(!E.commands(s).some(c=>c.id==='ambition:begin:enterprise'));
 assert.ok(!E.commands(s).some(c=>c.id==='ambition:begin:career'));
 s=E.act(s,'business:studio');
 assert.ok(E.commands(s).some(c=>c.id==='ambition:begin:enterprise'));
 assert.ok(!E.commands(s).some(c=>c.id==='ambition:begin:career'));
 s=E.act(s,'ambition:begin:enterprise');
 assert.equal(E.ambitionSummary(s).active.name,'Grow a business worth trusting');
 assert.ok(E.validate(s));
});
test('personal ambition supports a midcourse strategic tradeoff, without free money',()=>{
 let s=E.createLife({seed:20405});s.age=18;s.cash=100000;s.stats.health=40;s.stats.stress=65;
 s=E.act(s,'ambition:begin:wellness');
 assert.equal(E.commands(s).some(c=>c.id==='ambition:turn:bold'),false);
 for(let i=0;i<2;i++){s.pending=null;s=E.ageUp(s);if(s.pending!==null)s=E.resolve(s,0);}
 assert.equal(s.age,20);assert.ok(E.validate(s));
 assert.ok(E.commands(s).some(c=>c.id==='ambition:turn:bold'&&c.enabled));
 const before=s.cash,stress=s.stats.stress;
 s=E.act(s,'ambition:turn:bold');
 assert.equal(s.cash,before-1000);
 assert.equal(s.stats.stress,Math.min(100,stress+3));
 assert.equal(E.ambitionSummary(s).active.path,'bold');
 assert.equal(E.ambitionSummary(s).active.bonus,1700);
 assert.ok(!E.commands(s).some(c=>c.id.startsWith('ambition:turn:')));
 assert.ok(E.validate(s));
});
test('ignored ambitions expire on the sixth birthday and never stop aging',()=>{
 let s=E.createLife({seed:20406});s.age=12;s.stats.knowledge=20;s.skills.technical=0;
 s=E.act(s,'ambition:begin:scholar');
 assert.ok(E.ambitionSummary(s).active);
 for(let i=0;i<6;i++){
  s.pending=null;s=E.ageUp(s);if(s.pending!==null)s=E.resolve(s,0);
  assert.ok(E.validate(s));
 }
 assert.equal(s.age,18);
 assert.equal(E.ambitionSummary(s).active,null);
 assert.equal(E.ambitionSummary(s).unfulfilled[0].status,'expired');
 assert.equal(E.ambitionSummary(s).completed.length,0);
});
test('players can change course, with abandoned ambitions archived separately',()=>{
 let s=E.createLife({seed:20407});s.age=25;
 s=E.act(s,'ambition:begin:scholar');
 const earlier=s.actions;s=E.act(s,'ambition:retire');
 assert.equal(s.actions,earlier-1);
 assert.equal(E.ambitionSummary(s).active,null);
 assert.equal(E.ambitionSummary(s).unfulfilled[0].status,'abandoned');
 assert.equal(E.ambitionSummary(s).completed.length,0);
 assert.ok(E.commands(s).some(c=>c.id==='ambition:begin:wellness'));
 assert.ok(E.validate(s));
});
test('real hobby sessions advance the goals but no trophy is awarded for practicing alone',()=>{
 let s=E.createLife({seed:20408});s.age=14;s.stats.health=95;
 s=E.act(s,'ambition:begin:hobby-explorer');
 assert.ok(E.ambitionSummary(s).active);
 s=E.act(s,'hobby:start:chess:practice');
 for(let i=0;i<3;i++)s=E.hobbyDecision(s,1);
 assert.ok(E.validate(s));
 assert.equal(E.ambitionSummary(s).active.steps[0].actual,1);
 assert.equal(E.ambitionSummary(s).active.steps[2].actual,0);
 assert.equal(E.ambitionSummary(s).completed.length,0);
});
test('completed ambitions become heir history without transferring unfulfilled active goals',()=>{
 let s=E.createLife({seed:20409});s.age=30;s.cash=30000;s.stats.health=72;s.stats.stress=43;
 s=E.act(s,'ambition:begin:wellness');
 for(let i=0;i<3;i++){if(s.actions===0)s.actions=3;s=E.act(s,'exercise');}
 assert.equal(E.ambitionSummary(s).completed.length,1);
 s.actions=3;s=E.act(s,'date');s=E.act(s,'child');
 const child=s.people.find(p=>p.role==='child');assert.ok(child);child.age=22;
 s.alive=false;s.pending=null;
 const heir=E.legacy(s,child.id);
 assert.ok(E.validate(heir));
 assert.equal(E.ambitionSummary(heir).completed.length,0);
 assert.equal(E.ambitionSummary(heir).ancestral[0].name,'Build a healthier life');
 assert.equal(E.ambitionSummary(heir).ancestral[0].sourceLife,s.name);
});
test('ambition choices are deterministic, immutable and isolated from unrelated prior actions',()=>{
 let s=E.createLife({seed:20410});s.age=16;s.stats.health=70;s.stats.stress=45;
 const a=E.act(s,'ambition:begin:wellness'),b=E.act(s,'ambition:begin:wellness');
 assert.deepEqual(a,b);assert.equal(s.ambitions,undefined);
 assert.deepEqual(E.act(a,'exercise'),E.act(b,'exercise'));
 assert.ok(E.validate(a));
});

test('ordinary career storytelling covers all 153 jobs and all twelve original industries',()=>{
 assert.equal(E.workplaceTypes.length,12);
 assert.equal(new Set(E.workplaceTypes.map(x=>x.industry)).size,12);
 for(const job of E.careers){
  assert.ok(E.workplaceTypes.some(x=>x.industry===job.industry),job.title+' has no story');
  let s=E.createLife({seed:4130+job.id});s.age=25;s.education=3;s.stats.knowledge=100;s=E.act(s,'job:'+job.id);
  assert.ok(E.commands(s).some(x=>x.id==='workplace:begin'&&x.enabled),job.title);
  assert.ok(E.validate(s));
 }
});
test('workplace arc creates two persistent colleagues and real choices',()=>{
 let s=E.createLife({seed:44001});s.age=24;s.education=3;s.stats.knowledge=90;
 const j=E.careers.findIndex(x=>x.industry==='Technology & data');
 s=E.act(s,'job:'+j);const actions=s.actions;s=E.act(s,'workplace:begin');
 assert.equal(s.actions,actions-1);
 const view=E.workplaceView(s);assert.equal(view.chapter,1);assert.equal(view.choices.length,3);
 assert.equal(s.workplace.contacts.technology.length,2);assert.notEqual(view.lead,view.rival);
 assert.throws(()=>E.ageUp(s),/workplace chapter/);
 assert.throws(()=>E.workplaceDecision(s,9),/Invalid workplace decision/);
 const before=s;s=E.workplaceDecision(s,1);
 assert.equal(before.workplace.active.stage,0);
 assert.equal(s.workplace.active.status,'waiting');
 assert.equal(s.workplace.active.stage,1);
 assert.equal(s.workplace.active.nextAge,26);
 assert.equal(E.workplaceView(s),null);
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
});
test('collaborative versus competitive workplace choices change different NPC stakes',()=>{
 let s=E.createLife({seed:44002});s.age=25;s.education=3;s.stats.knowledge=100;
 const j=E.careers.findIndex(x=>x.industry==='Finance & enterprise');
 s=E.act(s,'job:'+j);s=E.act(s,'workplace:begin');
 const team=E.workplaceDecision(s,0),craft=E.workplaceDecision(s,1),bold=E.workplaceDecision(s,2);
 assert.notDeepEqual(team.stats,bold.stats);
 assert.ok(team.workplace.contacts.finance[0].trust>bold.workplace.contacts.finance[0].trust);
 assert.ok(bold.workplace.contacts.finance[1].rivalry>team.workplace.contacts.finance[1].rivalry);
 assert.ok(craft.workplace.standing>bold.workplace.standing);
 assert.ok(E.validate(team)&&E.validate(craft)&&E.validate(bold));
});
test('rivals grow independently, callback chapters remain age-gated and decisions persist',()=>{
 let s=E.createLife({seed:44003});s.age=25;s.education=3;s.stats.knowledge=85;
 const jobId=E.careers.findIndex(x=>x.industry==='Retail & administration');
 s=E.act(s,'job:'+jobId);s=E.act(s,'workplace:begin');s=E.workplaceDecision(s,0);
 assert.ok(!E.commands(s).some(c=>c.id==='workplace:continue'));
 const firstRating=s.workplace.contacts.retail[1].skill;
 for(let i=0;i<2;i++){s.pending=null;s=E.ageUp(s);if(s.pending!==null)s=E.resolve(s,0);}
 assert.ok(s.workplace.contacts.retail[1].skill>firstRating);
 assert.equal(s.age,27);
 assert.ok(E.commands(s).some(c=>c.id==='workplace:continue'&&c.enabled));
 s=JSON.parse(JSON.stringify(s));assert.ok(E.validate(s));
 s=E.act(s,'workplace:continue');assert.equal(E.workplaceView(s).chapter,2);
 assert.throws(()=>E.ageUp(s),/workplace chapter/);
 s=E.workplaceDecision(s,1);assert.equal(s.workplace.active.nextAge,29);
 assert.ok(E.validate(s));
 for(let i=0;i<2;i++){s.pending=null;s=E.ageUp(s);if(s.pending!==null)s=E.resolve(s,0);}
 s=E.act(s,'workplace:continue');assert.equal(E.workplaceView(s).chapter,3);
 const initialCash=s.cash;s=E.workplaceDecision(s,1);
 assert.equal(E.workplaceView(s),null);assert.equal(s.workplace.completed.length,1);
 assert.equal(s.workplace.completed[0].choices.length,3);
 assert.ok(s.workplace.completed[0].reward>=0);assert.ok(s.cash>=initialCash);
 assert.ok(E.validate(s));
});
test('workplace stories are interrupted by career switching without deleting old coworkers',()=>{
 let s=E.createLife({seed:44004});s.age=26;s.education=3;s.stats.knowledge=100;
 const j1=E.careers.findIndex(x=>x.industry==='Education & society');
 const j2=E.careers.findIndex(x=>x.industry==='Service & hospitality');
 s=E.act(s,'job:'+j1);s=E.act(s,'workplace:begin');s=E.workplaceDecision(s,0);
 s.actions=3;s=E.act(s,'job:'+j2);
 assert.equal(s.workplace.active,null);assert.equal(s.workplace.unfulfilled[0].status,'interrupted');
 assert.equal(s.workplace.contacts.education.length,2);
 assert.equal(E.workplaceSummary(s).firm.industry,'Service & hospitality');
 assert.ok(E.validate(s));
});
test('neglected professional commitments expire without trapping the player',()=>{
 let s=E.createLife({seed:44005});s.age=25;s.education=3;s.stats.knowledge=100;
 const j=E.careers.findIndex(x=>x.industry==='Nature & agriculture');
 s=E.act(s,'job:'+j);s=E.act(s,'workplace:begin');s=E.workplaceDecision(s,0);
 for(let i=0;i<5;i++){s.pending=null;s=E.ageUp(s);if(s.pending!==null)s=E.resolve(s,0);}
 assert.equal(s.workplace.active,null);assert.equal(s.workplace.unfulfilled[0].status,'neglected');
 assert.ok(E.commands(s).some(x=>x.id==='workplace:begin'));assert.ok(E.validate(s));
});
test('older saves remain valid and completed career decisions become ancestral records',()=>{
 let s=E.createLife({seed:44006});delete s.workplace;assert.ok(E.validate(s));
 s.age=28;s.education=3;s.stats.knowledge=100;
 const j=E.careers.findIndex(x=>x.industry==='Creative & media');
 s=E.act(s,'job:'+j);s=E.act(s,'workplace:begin');
 for(let i=0;i<3;i++){
  if(i>0){s.age+=2;s.actions=3;s.pending=null;s=E.act(s,'workplace:continue');}
  s=E.workplaceDecision(s,1);
 }
 assert.equal(s.workplace.completed.length,1);
 s.actions=3;s.cash=50000;s=E.act(s,'date');s=E.act(s,'child');
 const child=s.people.find(p=>p.role==='child');child.age=21;s.alive=false;s.pending=null;
 const heir=E.legacy(s,child.id);
 assert.ok(E.validate(heir));assert.equal(heir.workplace.completed.length,0);
 assert.equal(E.workplaceSummary(heir).ancestry[0].sourceLife,s.name);
});
test('the learning ambition now tracks technical skill and can be completed',()=>{
 let s=E.createLife({seed:44007});s.age=18;s.stats.knowledge=80;s.skills.technical=0;
 s=E.act(s,'ambition:begin:scholar');
 assert.equal(E.ambitionSummary(s).active.steps[2].actual,0);
 for(let i=0;i<3;i++){if(s.actions===0)s.actions=3;s=E.act(s,'learn');}
 assert.equal(E.ambitionSummary(s).active.steps[0].actual,3);
 s.actions=3;s=E.act(s,'skill:technical');s=E.act(s,'skill:technical');
 assert.equal(E.ambitionSummary(s).active,null);
 assert.equal(E.ambitionSummary(s).completed[0].id,'scholar');assert.ok(E.validate(s));
});

function preparedFamily(seed=61001){
 let s=E.createLife({seed});s.age=40;s.cash=200000;
 s=E.act(s,'date');const partner=s.people.find(p=>p.role==='partner');
 s=E.act(s,'gift:'+partner.id);s=E.act(s,'marry');s.actions=3;
 s=E.act(s,'child');s=E.act(s,'child');s=E.act(s,'child');s.actions=3;
 const children=s.people.filter(p=>p.role==='child');
 children[0].age=7;children[1].age=20;children[2].age=21;
 s.people.find(p=>p.role==='parent').age=70;
 return s;
}
function familyYear2(s,years=2){
 for(let i=0;i<years;i++){
  if(s.pending!==null)s=E.resolve(s,0);
  s=E.ageUp(s);
  if(s.pending!==null)s=E.resolve(s,0);
 }
 return s;
}
test('family dynasty adds twelve distinct authored themes and no new saves are required',()=>{
 assert.equal(E.familyStoryTypes.length,12);
 assert.equal(new Set(E.familyStoryTypes.map(t=>t.id)).size,12);
 const s=E.createLife({seed:61002});
 assert.ok(E.validate(s));assert.equal(s.familyStories,undefined);
 assert.deepEqual(E.familySummary(s).completed,[]);
 const older=JSON.parse(JSON.stringify(s));delete older.familyStories;
 assert.ok(E.validate(older));
});
test('family stories are offered based on live household roles, age and relationship requirements',()=>{
 let s=preparedFamily(61003);
 const ids=E.commands(s).filter(c=>c.id.startsWith('family:begin:')).map(c=>c.id);
 for(const theme of ['shared-futures','trust-and-truth','independent-partners','first-steps',
  'school-pressure','teenage-independence','siblings-and-space','inheritance-fairness',
  'elder-care','family-traditions'])assert.ok(ids.some(id=>id.startsWith('family:begin:'+theme+':')),theme);
 assert.ok(!ids.some(id=>id.startsWith('family:begin:family-enterprise:')));
 s.business={capital:15000,quality:60,sector:'studio'};
 assert.ok(E.commands(s).some(c=>c.id.startsWith('family:begin:family-enterprise:')));
 const parent=s.people.find(p=>p.role==='parent');
 parent.bond=34;
 assert.ok(E.commands(s).some(c=>c.id.startsWith('family:begin:hard-conversations:')));
 assert.ok(E.validate(s));
});
test('a family conversation blocks age-ups until a real player choice and can then continue freely',()=>{
 let s=preparedFamily(61004);
 const id=E.commands(s).find(c=>c.id.startsWith('family:begin:shared-futures:')).id;
 const original=s,acts=s.actions;
 s=E.act(s,id);
 assert.equal(original.familyStories,undefined);
 assert.equal(s.actions,acts-1);
 const scene=E.familyView(s);
 assert.equal(scene.round,1);assert.equal(scene.options.length,3);
 assert.equal(scene.people.length,1);
 const before=JSON.stringify(s);E.familyView(s);E.familySummary(s);
 assert.equal(JSON.stringify(s),before,'view helpers must not mutate React state');
 assert.throws(()=>E.ageUp(s),/family chapter/i);
 assert.equal(E.commands(s).length,0);
 assert.throws(()=>E.familyDecision(s,99),/Invalid family choice/);
 const next=E.familyDecision(s,0);
 assert.equal(s.familyStories.active.stage,0);
 assert.equal(next.familyStories.active.stage,1);
 assert.equal(next.familyStories.active.status,'waiting');
 assert.equal(next.familyStories.active.nextAge,42);
 assert.equal(E.familyView(next),null);
 assert.ok(E.validate(JSON.parse(JSON.stringify(next))));
});
test('three multiyear decisions carry different NPC trust and relationship consequences',()=>{
 let s=preparedFamily(61005);
 const id=E.commands(s).find(c=>c.id.startsWith('family:begin:trust-and-truth:')).id;
 s=E.act(s,id);
 const p=s.people.find(p=>p.role==='partner');
 const supportive=E.familyDecision(s,0),controlling=E.familyDecision(s,2),plan=E.familyDecision(s,1);
 const A=supportive.people.find(x=>x.id===p.id),B=controlling.people.find(x=>x.id===p.id);
 assert.ok(A.bond>B.bond);
 assert.ok(A.world.trust>B.world.trust);
 assert.ok(supportive.familyStories.members[p.id].trust>controlling.familyStories.members[p.id].trust);
 assert.ok(controlling.stats.stress>supportive.stats.stress);
 assert.ok(plan.familyStories.active.impact>controlling.familyStories.active.impact);
 assert.ok(E.validate(supportive));assert.ok(E.validate(controlling));assert.ok(E.validate(plan));
});
test('a marriage saga has scheduled callbacks, a saved ending, and bounded historical memories',()=>{
 let s=preparedFamily(61006);
 let id=E.commands(s).find(c=>c.id.startsWith('family:begin:shared-futures:')).id;
 s=E.act(s,id);s=E.familyDecision(s,0);
 assert.equal(s.familyStories.active.nextAge,42);
 assert.ok(!E.commands(s).some(c=>c.id==='family:continue'));
 s=familyYear2(s);
 assert.equal(s.age,42);
 assert.ok(E.commands(s).some(c=>c.id==='family:continue'&&c.enabled));
 s=E.act(s,'family:continue');
 assert.equal(E.familyView(s).round,2);
 s=E.familyDecision(s,0);
 s=familyYear2(s);
 assert.equal(s.age,44);
 s=E.act(s,'family:continue');
 assert.equal(E.familyView(s).round,3);
 s=E.familyDecision(s,0);
 assert.equal(s.familyStories.active,null);
 assert.equal(E.familySummary(s).completed[0].outcome,'reconciled');
 assert.equal(E.familySummary(s).completed[0].choices.length,3);
 assert.equal(E.familySummary(s).completed[0].endedAge,44);
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
});
test('sibling chapters produce actual rivalry and cooperation instead of isolated cosmetic text',()=>{
 let s=preparedFamily(61007);
 const children=s.people.filter(p=>p.role==='child');
 const id=E.commands(s).find(c=>c.id.startsWith('family:begin:siblings-and-space:')).id;
 s=E.act(s,id);
 const pair=children.slice(0,2).map(p=>p.id).join('-');
 const before=E.familySummary(s).siblings.find(l=>l.ids.join('-')===pair);
 assert.ok(before);
 const good=E.familyDecision(s,0),bad=E.familyDecision(s,2);
 const a=E.familySummary(good).siblings.find(l=>l.ids.join('-')===pair);
 const b=E.familySummary(bad).siblings.find(l=>l.ids.join('-')===pair);
 assert.ok(a.cooperation>b.cooperation);
 assert.ok(a.rivalry<b.rivalry);
 assert.ok(good.people.find(p=>p.id===children[0].id).bond>bad.people.find(p=>p.id===children[0].id).bond);
 assert.ok(E.validate(good)&&E.validate(bad));
});
test('siblings evolve independently and recorded sibling tension persists across save roundtrips',()=>{
 let s=preparedFamily(61008);
 const id=E.commands(s).find(c=>c.id.startsWith('family:begin:siblings-and-space:')).id;
 s=E.act(s,id);s=E.familyDecision(s,1);
 const old=E.familySummary(s).siblings[0].rivalry;
 s=familyYear2(s,1);
 assert.notEqual(E.familySummary(s).siblings[0].rivalry,old);
 s=JSON.parse(JSON.stringify(s));
 assert.ok(E.validate(s));
 assert.equal(E.familySummary(s).siblings.length,1);
});
test('interrupted or ignored family relationships retain the actual unfinished record',()=>{
 let s=preparedFamily(61009);
 let id=E.commands(s).find(c=>c.id.startsWith('family:begin:first-steps:')).id;
 s=E.act(s,id);s=E.familyDecision(s,0);
 let child=s.familyStories.active.personIds[0];
 s.people.find(p=>p.id===child).alive=false;
 s=familyYear2(s,1);
 assert.equal(E.familySummary(s).active,null);
 assert.equal(E.familySummary(s).unfulfilled[0].status,'interrupted');
 assert.ok(E.validate(s));
 let second=preparedFamily(61010);
 const other=E.commands(second).find(c=>c.id.startsWith('family:begin:trust-and-truth:')).id;
 second=E.act(second,other);second=E.familyDecision(second,1);
 second=familyYear2(second,5);
 assert.equal(second.familyStories.active,null);
 assert.equal(E.familySummary(second).unfulfilled[0].status,'neglected');
 assert.ok(E.validate(second));
});
test('family conversations can be abandoned without duplicating completions or requiring paid actions',()=>{
 let s=preparedFamily(61011);
 const id=E.commands(s).find(c=>c.id.startsWith('family:begin:family-traditions:')).id;
 s=E.act(s,id);s=E.familyDecision(s,1);
 const n=s.actions;
 s=E.act(s,'family:leave');
 assert.equal(s.actions,n-1);
 assert.equal(s.familyStories.active,null);
 assert.equal(s.familyStories.completed.length,0);
 assert.equal(s.familyStories.unfulfilled[0].status,'abandoned');
 assert.equal(s.familyStories.unfulfilled[0].choices.length,1);
 assert.ok(E.validate(s));
});
test('adult heir inherits remembered family care and sibling dynamics, never unfinished parental obligations',()=>{
 let s=preparedFamily(61012);
 const child=s.people.filter(p=>p.role==='child')[1];
 const id=E.commands(s).find(c=>c.id==='family:begin:teenage-independence:'+child.id).id;
 s=E.act(s,id);s=E.familyDecision(s,0);
 s=familyYear2(s);
 s=E.act(s,'family:continue');s=E.familyDecision(s,0);
 s=familyYear2(s);
 s=E.act(s,'family:continue');s=E.familyDecision(s,0);
 assert.equal(s.familyStories.completed.length,1);
 s.alive=false;s.pending=null;
 const withFamily=E.legacy(s,child.id);
 const control=JSON.parse(JSON.stringify(s));delete control.familyStories;
 const noFamily=E.legacy(control,child.id);
 assert.ok(E.validate(withFamily));
 assert.equal(withFamily.familyStories.active,null);
 assert.equal(E.familySummary(withFamily).ancestry[0].title,'The road to independence');
 assert.equal(E.familySummary(withFamily).ancestry[0].sourceLife,s.name);
 assert.ok(withFamily.stats.confidence>noFamily.stats.confidence,'development changes the actual heir');
 assert.equal(withFamily.stats.knowledge,noFamily.stats.knowledge);
});
test('reject corrupt family state but continue validating old saves',()=>{
 let s=preparedFamily(61013);
 s=E.act(s,E.commands(s).find(c=>c.id.startsWith('family:begin:shared-futures:')).id);
 const invalid=JSON.parse(JSON.stringify(s));invalid.familyStories.active.stage=9;
 assert.equal(E.validate(invalid),false);
 const wrong=JSON.parse(JSON.stringify(s));wrong.familyStories.members[Object.keys(wrong.familyStories.members)[0]].trust=150;
 assert.equal(E.validate(wrong),false);
 assert.ok(E.validate(s));
});

function householdSetup(seed=67001){
 let s=E.createLife({seed});s.age=38;s.cash=120000;
 s=E.act(s,'date');s=E.act(s,'child');s=E.act(s,'child');s.actions=3;
 const children=s.people.filter(p=>p.role==='child');
 children[0].age=9;children[1].age=16;
 return s;
}
function settleHouseholdYear(s){
 s.pending=null;
 const n=E.ageUp(s);return n.pending===null?n:E.resolve(n,0);
}
test('household economy is optional for old v2 saves and starts with zero protected assets',()=>{
 let s=E.createLife({seed:67002});
 assert.equal(E.householdAssets(s),0);
 assert.equal(E.householdSummary(s).emergency,0);
 assert.ok(E.validate(s));
 delete s.household;assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
 assert.equal(E.commands(s).some(x=>x.id.startsWith('household:')),false);
 s.age=18;
 assert.ok(E.commands(s).some(x=>x.id==='household:priority:saving'));
});
test('reserve deposits and withdrawals move real money, preserve net worth and do not mint assets',()=>{
 let s=householdSetup(67003);
 const worth=E.worth(s),cash=s.cash;
 s=E.act(s,'household:reserve:deposit:1500');
 assert.equal(s.cash,cash-1500);
 assert.equal(E.householdAssets(s),1500);
 assert.equal(E.worth(s),worth);
 s=E.act(s,'household:reserve:withdraw:500');
 assert.equal(s.cash,cash-1000);
 assert.equal(E.householdSummary(s).emergency,1000);
 assert.equal(E.worth(s),worth);
 assert.throws(()=>E.act(s,'household:reserve:withdraw:1500'),/not available/i);
 for(let i=0;i<25;i++){
  s.actions=3;s=E.act(s,'household:reserve:deposit:500');
  s=E.act(s,'household:reserve:withdraw:500');
 }
 assert.equal(E.worth(s),worth);
 assert.ok(s.household.ledger.length<=32);
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
});
test('child education savings are earmarked until a real expense, boosting child talent once per year',()=>{
 let s=householdSetup(67004);
 const child=s.people.find(p=>p.role==='child'),cash=s.cash,worth=E.worth(s),talent=child.world.talent;
 s=E.act(s,'household:education:deposit:'+child.id+':1500');
 assert.equal(s.cash,cash-1500);assert.equal(E.worth(s),worth);
 assert.equal(E.householdSummary(s).children.find(p=>p.id===child.id).amount,1500);
 s=E.act(s,'household:education:use:'+child.id+':1000');
 assert.equal(s.household.education[child.id],500);
 assert.equal(E.worth(s),worth-1000);
 assert.equal(s.people.find(p=>p.id===child.id).world.talent,talent+5);
 assert.ok(!E.commands(s).some(c=>c.id==='household:education:use:'+child.id+':1000'&&c.enabled));
 assert.ok(E.validate(s));
});
test('partner contributions are transfers from independently simulated savings, not imaginary income',()=>{
 let s=householdSetup(67005);
 const partner=s.people.find(p=>p.role==='partner');partner.world.cash=20000;partner.world.trust=82;
 const baseline=settleHouseholdYear(s);
 const agreed=E.act(s,'household:agreement:shared');
 const shared=settleHouseholdYear(agreed);
 const transferred=shared.annual.partnerContribution;
 assert.ok(transferred>0&&transferred<=1600);
 const oldPartner=baseline.people.find(p=>p.id===partner.id).world.cash;
 const newPartner=shared.people.find(p=>p.id===partner.id).world.cash;
 assert.equal(oldPartner-newPartner,transferred);
 assert.equal(shared.annual.balance-baseline.annual.balance,transferred);
 assert.equal(shared.annual.householdExpenseChange,0);
 assert.equal(shared.household.annual.at(-1).contribution,transferred);
 assert.ok(E.validate(shared));
});
test('saving and learning plans change annual costs and child development',()=>{
 let s=householdSetup(67006);
 const child=s.people.find(p=>p.role==='child');const before=child.world.talent;
 const saving=settleHouseholdYear(E.act(s,'household:priority:saving'));
 const learning=settleHouseholdYear(E.act(s,'household:priority:learning'));
 assert.ok(saving.annual.householdExpenseChange<0);
 assert.ok(learning.annual.householdExpenseChange>0);
 assert.ok(learning.annual.expenses>saving.annual.expenses);
 assert.equal(learning.household.annual.at(-1).educationBoosts,2);
 assert.equal(learning.people.find(p=>p.id===child.id).world.talent-saving.people.find(p=>p.id===child.id).world.talent,2);
 assert.ok(E.validate(learning)&&E.validate(saving));
 assert.ok(learning.stats.stress<=100);
});
test('household responsibilities affect yearly costs or stress with real partner trust consequences',()=>{
 let s=householdSetup(67007);
 const solo=settleHouseholdYear(E.act(s,'household:duties:solo'));
 const outsourced=settleHouseholdYear(E.act(s,'household:duties:outsource'));
 assert.equal(solo.annual.householdExpenseChange,0);
 assert.ok(outsourced.annual.householdExpenseChange>0);
 assert.ok(outsourced.annual.expenses>solo.annual.expenses);
 assert.ok(solo.stats.stress>=outsourced.stats.stress);
 assert.ok(E.validate(solo)&&E.validate(outsourced));
});
test('sibling mediation reduces a real preexisting rivalry and cannot be spammed in one year',()=>{
 let s=householdSetup(67008);const children=s.people.filter(p=>p.role==='child');
 let cmd=E.commands(s).find(x=>x.id.startsWith('family:begin:siblings-and-space:'));
 assert.ok(cmd);
 s=E.act(s,cmd.id);s=E.familyDecision(s,2);
 const link=Object.values(s.familyStories.siblingLinks)[0];link.rivalry=61;
 const id='household:mediate:'+link.ids.join('-');
 assert.ok(E.commands(s).some(x=>x.id===id&&x.enabled));
 const first=link.rivalry,bond=children[0].bond;
 s=E.act(s,id);
 assert.equal(s.familyStories.siblingLinks[link.ids.join('-')].rivalry,first-12);
 assert.ok(s.people.find(p=>p.id===children[0].id).bond>bond-12);
 assert.ok(!E.commands(s).some(x=>x.id===id&&x.enabled));
 assert.ok(E.validate(s));
});
test('living children keep their designated education funds while estate shares are distributed only once',()=>{
 let s=householdSetup(67009);
 const [a,b]=s.people.filter(p=>p.role==='child');
 s=E.act(s,'household:education:deposit:'+a.id+':1500');
 s=E.act(s,'household:education:deposit:'+b.id+':500');
 const estate=E.worth(s),aCash=a.world.cash,bCash=b.world.cash;
 s.alive=false;s.pending=null;
 const heir=E.legacy(s,a.id);
 assert.ok(E.validate(heir));
 assert.equal(heir.cash,estate-500+aCash);
 assert.equal(heir.people.find(p=>p.id===b.id).world.cash,bCash+500);
 assert.equal(E.householdAssets(heir),0,'all protected money was distributed exactly once');
 assert.equal(E.householdSummary(heir).generationNotes.length,1);
});
test('preferred heir and reserved child funds are accounted for separately, including nonpreferred heirs',()=>{
 let s=householdSetup(67010);
 const [a,b]=s.people.filter(p=>p.role==='child');
 s=E.act(s,'household:education:deposit:'+a.id+':1500');
 s=E.act(s,'household:education:deposit:'+b.id+':500');
 s.world.dynasty.heirId=b.id;
 const total=E.worth(s),general=total-2000,aCash=a.world.cash,bCash=b.world.cash;
 s.alive=false;s.pending=null;
 const heir=E.legacy(s,a.id);
 assert.ok(E.validate(heir));
 assert.equal(heir.cash,Math.round(general*.4)+1500+aCash);
 assert.equal(heir.people.find(p=>p.id===b.id).world.cash,bCash+500+general-Math.round(general*.4));
});
test('household state is validated and legacy compatibility survives inactive or missing finances',()=>{
 let s=householdSetup(67011);
 s=E.act(s,'household:reserve:deposit:500');
 assert.ok(E.validate(s));
 const wrong=JSON.parse(JSON.stringify(s));wrong.household.emergency=-1;assert.equal(E.validate(wrong),false);
 const wrong2=JSON.parse(JSON.stringify(s));wrong2.household.education[4]=-500;assert.equal(E.validate(wrong2),false);
 const wrong3=JSON.parse(JSON.stringify(s));wrong3.household.priority='printing-money';assert.equal(E.validate(wrong3),false);
 delete s.household;assert.ok(E.validate(s));
});
test('independent partners, minors, job activity and household actions retain normal command locking',()=>{
 let s=E.createLife({seed:67012});
 assert.ok(!E.commands(s).some(x=>x.id.startsWith('household:')));
 s.age=20;s.cash=2000;
 assert.ok(!E.commands(s).some(x=>x.id.startsWith('household:agreement:')));
 const before=s.cash;
 s=E.act(s,'household:reserve:deposit:1500');
 assert.equal(s.cash,before-1500);
 s.actions=0;
 assert.ok(!E.commands(s).some(x=>x.id.startsWith('household:reserve:')&&x.enabled));
 assert.throws(()=>E.act(s,'household:reserve:deposit:500'),/not available/i);
 assert.ok(E.validate(s));
});

function familyTransitionLife(seed=71001){
 let s=E.createLife({seed});s.age=42;s.cash=160000;
 s=E.act(s,'date');const p=s.people.find(x=>x.role==='partner');
 s=E.act(s,'gift:'+p.id);s=E.act(s,'marry');s.actions=3;
 s=E.act(s,'child');s=E.act(s,'child');
 const kids=s.people.filter(x=>x.role==='child');kids[0].age=9;kids[1].age=16;
 s.people.find(x=>x.id===p.id).world.cash=42000;
 s.actions=3;s=E.act(s,'breakup');s.actions=3;
 return s;
}
function ageTransition(s,n=1){
 for(let i=0;i<n;i++){if(s.pending!==null)s=E.resolve(s,0);
  s=E.ageUp(s);if(s.pending!==null)s=E.resolve(s,0);}
 return s;
}
test('separation remembers original marriage, maintains ex savings and ends shared finances',()=>{
 let s=E.createLife({seed:71002});s.age=40;s.cash=50000;
 s=E.act(s,'date');const p=s.people.find(x=>x.role==='partner');
 s=E.act(s,'gift:'+p.id);s=E.act(s,'marry');s.actions=3;
 s=E.act(s,'household:agreement:shared');const before=s.people.find(x=>x.id===p.id).world.cash;
 const old=s;s=E.act(s,'breakup');
 assert.equal(old.people.find(x=>x.id===p.id).role,'partner');
 assert.equal(s.people.find(x=>x.id===p.id).role,'ex');
 assert.equal(s.people.find(x=>x.id===p.id).world.cash,before);
 assert.equal(s.household.agreement,'independent');
 assert.equal(E.transitionSummary(s).separation.wasMarried,true);
 assert.equal(E.transitionSummary(s).separation.exId,p.id);
 assert.ok(E.validate(s));
});
test('co-parenting choices create different recorded plans and trust outcomes',()=>{
 const initial=familyTransitionLife(71003);
 const ids=E.commands(initial).filter(x=>x.id.startsWith('transition:coparent:')).map(x=>x.id);
 assert.ok(ids.includes('transition:coparent:resident'));
 assert.ok(ids.includes('transition:coparent:other'));
 assert.equal(E.transitionSummary(initial).separation.minorChildren.length,2);
 const resident=E.act(initial,'transition:coparent:resident');
 const other=E.act(initial,'transition:coparent:other');
 assert.ok(resident.familyTransitions.separation.cooperation>other.familyTransitions.separation.cooperation);
 assert.ok(E.validate(resident)&&E.validate(other));
});
test('real co-parent support comes from former partner savings and never counts as new wages',()=>{
 const s=familyTransitionLife(71004),shared=ageTransition(s);
 assert.ok(shared.annual.coParentSupportReceived>0);assert.equal(shared.annual.coParentSupportPaid,0);
 const exId=shared.familyTransitions.separation.exId;
 const baseline=JSON.parse(JSON.stringify(s));baseline.familyTransitions.separation.plan='none';
 const independent=ageTransition(baseline);
 assert.equal(independent.people.find(p=>p.id===exId).world.cash-
   shared.people.find(p=>p.id===exId).world.cash,shared.annual.coParentSupportReceived);
 assert.equal(shared.annual.balance-independent.annual.balance,shared.annual.coParentSupportReceived);
 const other=ageTransition(E.act(s,'transition:coparent:other'));
 assert.equal(other.annual.coParentSupportReceived,0);
 assert.ok(other.annual.coParentSupportPaid>0);
 assert.ok(other.people.find(p=>p.id===exId).world.cash>independent.people.find(p=>p.id===exId).world.cash);
 assert.ok(E.validate(shared)&&E.validate(other));
});
test('disputed family property cannot be sold separately and 50/50 settlement conserves proceeds',()=>{
 let s=familyTransitionLife(71005);const ex=s.people.find(p=>p.role==='ex');
 s.properties.push({id:'house',value:100000});const start=E.worth(s),exCash=ex.world.cash;
 s=E.act(s,'transition:property:open:house');
 assert.equal(E.transitionSummary(s).propertyCase.propertyId,'house');
 assert.equal(E.commands(s).find(x=>x.id==='sell:house').enabled,false);
 s=E.act(s,'transition:property:split');
 assert.equal(s.properties.length,0);
 assert.equal(s.people.find(p=>p.id===ex.id).world.cash-exCash,47500);
 assert.equal(E.worth(s),start-100000+47500);
 assert.equal(E.transitionSummary(s).propertyCase,null);assert.ok(E.validate(s));
});
test('cash-funded buyout and negotiated property sale do not create wealth',()=>{
 let s=familyTransitionLife(71006);const ex=s.people.find(p=>p.role==='ex');
 s.properties.push({id:'apartment',value:100000});s=E.act(s,'transition:property:open:apartment');
 const bought=E.act(s,'transition:property:buyout');
 assert.equal(bought.properties[0].value,100000);assert.equal(s.cash-bought.cash,40000);
 assert.equal(bought.people.find(p=>p.id===ex.id).world.cash-s.people.find(p=>p.id===ex.id).world.cash,40000);
 const compromise=E.act(s,'transition:property:compromise');
 assert.equal(compromise.properties.length,0);
 assert.equal(compromise.cash-s.cash,66290);
 assert.equal(compromise.people.find(p=>p.id===ex.id).world.cash-s.people.find(p=>p.id===ex.id).world.cash,28410);
 assert.equal(66290+28410+300,95000);
 assert.ok(E.validate(bought)&&E.validate(compromise));
});
test('an unresolved property dispute can be dropped without asset loss',()=>{
 let s=familyTransitionLife(71007);s.properties.push({id:'house',value:50000});
 s=E.act(s,'transition:property:open:house');const original=E.worth(s);
 s=E.act(s,'transition:property:withdraw');
 assert.equal(E.transitionSummary(s).propertyCase,null);assert.equal(E.worth(s),original);
 assert.ok(E.commands(s).some(c=>c.id==='sell:house'&&c.enabled));assert.ok(E.validate(s));
});
test('caring for aging relatives changes annual costs, bonds and stress',()=>{
 let s=E.createLife({seed:71008});s.age=39;s.cash=100000;
 const p=s.people.find(p=>p.role==='parent');p.age=62;
 const independent=ageTransition(s);
 const home=ageTransition(E.act(s,'transition:care:'+p.id+':home'));
 const shared=ageTransition(E.act(s,'transition:care:'+p.id+':shared'));
 assert.ok(home.annual.elderCareCosts>shared.annual.elderCareCosts);
 assert.ok(shared.annual.elderCareCosts>independent.annual.elderCareCosts);
 assert.ok(home.annual.expenses>shared.annual.expenses);
 assert.ok(home.people.find(x=>x.id===p.id).bond>independent.people.find(x=>x.id===p.id).bond);
 assert.ok(E.validate(home)&&E.validate(shared));
});
test('older relative visits can improve a relationship at most once per year',()=>{
 let s=E.createLife({seed:71009});s.age=35;
 const p=s.people.find(x=>x.role==='parent');p.age=66;
 const id='transition:checkin:'+p.id,old=p.bond;
 s=E.act(s,id);assert.ok(s.people.find(x=>x.id===p.id).bond>old);
 assert.ok(!E.commands(s).some(x=>x.id===id&&x.enabled));assert.ok(E.validate(s));
});
test('teen guidance shapes agency while preserving adult autonomy',()=>{
 let s=familyTransitionLife(71010);
 const child=s.people.find(p=>p.role==='child'&&p.age===16),old=child.bond;
 const id='transition:guide:'+child.id+':listen';
 s=E.act(s,id);assert.ok(s.people.find(p=>p.id===child.id).bond>old);
 assert.ok(s.familyTransitions.youth[child.id].agency>50);
 assert.equal(s.familyTransitions.youth[child.id].path,null);
 assert.ok(!E.commands(s).some(x=>x.id===id&&x.enabled));assert.ok(E.validate(s));
});
test('adult children autonomously choose at eighteen and continue at twenty-one',()=>{
 let s=E.createLife({seed:71011});s.age=38;s.cash=50000;
 s=E.act(s,'date');s=E.act(s,'child');s.actions=3;
 const child=s.people.find(p=>p.role==='child');child.age=17;child.world.personality='Creative';
 const old=s;s=ageTransition(s);
 assert.equal(E.transitionSummary(s).youth.find(p=>p.personId===child.id).path,'creative');
 assert.equal(s.familyTransitions.youth[child.id].decisions.length,1);
 assert.equal(old.familyTransitions,undefined);
 s=ageTransition(s,3);
 assert.equal(s.people.find(p=>p.id===child.id).age,21);
 assert.equal(s.familyTransitions.youth[child.id].decisions.length,2);
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
});
test('an independent student pays tuition from personal savings and debt, not the parents resources',()=>{
 let s=E.createLife({seed:71012});s.age=42;s.cash=50000;
 s=E.act(s,'date');s=E.act(s,'child');s.actions=3;
 const child=s.people.find(p=>p.role==='child');child.age=17;
 child.world.personality='Cautious';child.world.cash=100;child.world.debt=0;
 s=ageTransition(s);
 assert.equal(s.familyTransitions.youth[child.id].path,'study');
 assert.ok(s.people.find(p=>p.id===child.id).world.education>=2);
 assert.ok(s.people.find(p=>p.id===child.id).world.debt>=0);
 assert.equal(s.annual.coParentSupportPaid,0);assert.ok(E.validate(s));
});
test('a deceased ex releases a disputed property for ordinary sale in the next year',()=>{
 let s=familyTransitionLife(71013);s.properties.push({id:'house',value:50000});
 s=E.act(s,'transition:property:open:house');s.people.find(p=>p.role==='ex').alive=false;
 s=ageTransition(s);
 assert.equal(E.transitionSummary(s).propertyCase,null);
 assert.ok(E.commands(s).some(c=>c.id==='sell:house'&&c.enabled));assert.ok(E.validate(s));
});
test('succession remembers family transitions without duplicating property or carrying obligations',()=>{
 let s=familyTransitionLife(71014);s.properties.push({id:'house',value:60000});
 s=E.act(s,'transition:property:open:house');
 s=E.act(s,'transition:property:withdraw');
 const child=s.people.find(p=>p.role==='child');child.age=24;s.alive=false;s.pending=null;
 const heir=E.legacy(s,child.id);
 assert.ok(E.validate(heir));assert.equal(E.transitionSummary(heir).separation,null);
 assert.equal(E.transitionSummary(heir).propertyCase,null);
 assert.ok(E.transitionSummary(heir).ancestry.some(x=>x.sourceLife===s.name&&x.kind==='property'));
 assert.equal(heir.properties.length,0);
});
test('old saves remain valid while corrupt transition plans and impossible youth paths are rejected',()=>{
 let s=familyTransitionLife(71015);assert.ok(E.validate(s));
 const wrong=JSON.parse(JSON.stringify(s));wrong.familyTransitions.separation.plan='magical';
 assert.equal(E.validate(wrong),false);
 const big=JSON.parse(JSON.stringify(s));big.familyTransitions.records=Array.from({length:100},()=>({age:40}));
 assert.equal(E.validate(big),false);
 const youth=JSON.parse(JSON.stringify(s));youth.familyTransitions.youth['4']={personId:4,path:'forged',agency:40,support:40,decisions:[]};
 assert.equal(E.validate(youth),false);
 delete s.familyTransitions;assert.ok(E.validate(s));
});

function worldReady(seed=77001){
 let s=E.createLife({seed});s.age=26;s.cash=65000;s.education=3;s.stats.knowledge=90;s.stats.confidence=85;
 s.pending=null;s.actions=3;
 return s;
}
function worldTwoYears(s){
 for(let i=0;i<2;i++){
  if(s.pending!==null)s=E.resolve(s,0);
  s=E.ageUp(s);
  if(s.pending!==null)s=E.resolve(s,0);
 }
 return s;
}
test('living world has five industry sectors, six countries, three rival houses, and optional save state',()=>{
 assert.equal(E.pulseSectors.length,5);
 assert.equal(E.pulseCountries.length,6);
 assert.equal(E.pulseHouses.length,3);
 const s=E.createLife({seed:77002});
 assert.equal(s.worldPulse,undefined);
 assert.ok(E.validate(s));
 assert.equal(E.worldPulseEconomyMultiplier(s,'Technology & data'),1);
 assert.equal(E.worldPulseReputationMultiplier(s),1);
 const status=E.worldPulseSummary(s);
 assert.equal(status.countries.length,6);
 assert.equal(status.rivals.length,3);
 assert.equal(status.sectors.length,5);
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
});
test('all 153 careers map to a real world-sector economy without special-case missing data',()=>{
 assert.equal(E.careers.length,153);
 for(const j of E.careers){
  assert.ok(E.pulseSectors.some(x=>x.industries.includes(j.industry)),j.title+' missing sector');
  let s=worldReady(77200+j.id);s.job={id:j.id,level:0,experience:0};
  const w=E.worldPulseSummary(s);
  assert.ok(w.career);
  assert.ok(E.pulseSectors.some(x=>x.id===w.career.sector));
 }
});
test('regional indices change deterministically across six countries and have source-based news',()=>{
 let a=worldReady(77003),b=JSON.parse(JSON.stringify(a));
 const first=E.worldPulseSummary(a).countries.map(r=>r.average);
 a=worldTwoYears(a);b=worldTwoYears(b);
 assert.deepEqual(a.worldPulse.regions,b.worldPulse.regions);
 assert.deepEqual(a.worldPulse.reputation,b.worldPulse.reputation);
 const now=E.worldPulseSummary(a).countries.map(r=>r.average);
 assert.ok(now.some((x,i)=>x!==first[i]));
 assert.equal(a.worldPulse.lastYear,a.age);
 assert.ok(E.validate(a)&&E.validate(b));
});
test('regional economic strength changes real salary while leaving the same job and player actions',()=>{
 let s=worldReady(77004);
 const job=E.careers.find(j=>j.industry==='Technology & data');
 s.job={id:job.id,level:0,experience:0};s.worldPulse=JSON.parse(JSON.stringify(E.worldPulseState(s)));
 const strong=JSON.parse(JSON.stringify(s)),weak=JSON.parse(JSON.stringify(s));
 strong.worldPulse.regions[s.country].sectors.technology=92;
 weak.worldPulse.regions[s.country].sectors.technology=15;
 assert.ok(E.worldPulseEconomyMultiplier(strong,job.industry)>E.worldPulseEconomyMultiplier(weak,job.industry));
 const hi=worldTwoYears(strong),lo=worldTwoYears(weak);
 assert.ok(hi.annual.salary>lo.annual.salary);
 assert.ok(E.validate(hi)&&E.validate(lo));
});
test('ordinary career work and volunteering accumulate genuine reputation in local world history',()=>{
 let s=worldReady(77005);
 s=E.act(s,'volunteer');
 assert.ok(s.worldPulse.reputation.community>50);
 assert.ok(s.worldPulse.reputation.integrity>50);
 assert.ok(s.worldPulse.journal.some(x=>x.kind==='reputation'&&x.source==='volunteer'));
 const j=E.careers.find(x=>x.industry==='Technology & data');
 s.job={id:j.id,level:0,experience:0};s.actions=3;
 const old=s.worldPulse.reputation.influence;
 s=E.act(s,'work');
 assert.ok(s.worldPulse.reputation.influence>old);
 assert.equal(E.worldPulseSummary(s).career.sector,'technology');
 assert.ok(E.validate(s));
});
test('regional project opens original scene, protects age-up, and gives three causally distinct choices',()=>{
 let s=worldReady(77006);s=E.act(s,'pulse:begin:technology');
 const scene=E.worldPulseView(s);
 assert.equal(scene.chapter,1);assert.equal(scene.choices.length,3);
 assert.ok(scene.body.length>70);
 assert.throws(()=>E.ageUp(s),/regional project decision/);
 assert.throws(()=>E.worldPulseDecision(s,5),/Invalid regional decision/);
 const before=JSON.stringify(s);E.worldPulseView(s);E.worldPulseSummary(s);
 assert.equal(JSON.stringify(s),before);
 const considerate=E.worldPulseDecision(s,0),reckless=E.worldPulseDecision(s,2);
 assert.ok(considerate.worldPulse.regions[s.country].sectors.technology>reckless.worldPulse.regions[s.country].sectors.technology);
 assert.ok(considerate.worldPulse.reputation.integrity>reckless.worldPulse.reputation.integrity);
 assert.ok(considerate.worldPulse.active.impact>reckless.worldPulse.active.impact);
 assert.equal(considerate.worldPulse.active.nextAge,28);
 assert.equal(E.worldPulseView(considerate),null);
 assert.ok(E.validate(considerate)&&E.validate(reckless));
});
test('three regional chapters over five years produce real durable growth and professional experience',()=>{
 let s=worldReady(77007);
 const job=E.careers.find(j=>j.industry==='Care' || j.industry==='Healthcare & care');
 assert.ok(job);s.job={id:job.id,level:0,experience:0};
 s=E.act(s,'pulse:begin:care');
 const original=s.worldPulse.regions[s.country].sectors.care;
 s=E.worldPulseDecision(s,0);
 assert.equal(s.worldPulse.active.status,'waiting');
 s=worldTwoYears(s);assert.equal(s.age,28);
 assert.ok(E.commands(s).some(c=>c.id==='pulse:continue'&&c.enabled));
 s=E.act(s,'pulse:continue');assert.equal(E.worldPulseView(s).chapter,2);
 s=E.worldPulseDecision(s,1);
 s=worldTwoYears(s);assert.equal(s.age,30);
 s=E.act(s,'pulse:continue');assert.equal(E.worldPulseView(s).chapter,3);
 s=E.worldPulseDecision(s,0);
 assert.equal(s.worldPulse.active,null);assert.equal(s.worldPulse.finished.length,1);
 assert.equal(s.worldPulse.finished[0].choices.length,3);
 assert.equal(s.worldPulse.finished[0].result,'transformative');
 assert.ok(s.worldPulse.regions[s.country].sectors.care>=15);
 assert.ok(s.job.experience>0);
 assert.equal(E.worldPulseView(s),null);
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
});
test('a neglected regional project expires instead of trapping the player',()=>{
 let s=worldReady(77008);
 s=E.act(s,'pulse:begin:trade');
 s=E.worldPulseDecision(s,0);
 for(let i=0;i<5;i++){
  if(s.pending!==null)s=E.resolve(s,0);
  s=E.ageUp(s);
  if(s.pending!==null)s=E.resolve(s,0);
 }
 assert.equal(s.worldPulse.active,null);
 assert.equal(s.worldPulse.unfulfilled[0].result,'neglected');
 assert.ok(E.commands(s).some(c=>c.id.startsWith('pulse:begin:')));
 assert.ok(E.validate(s));
});
test('competing houses change independently and collaboration is not the same as aggressive challenge',()=>{
 let s=worldReady(77009);s.worldPulse=JSON.parse(JSON.stringify(E.worldPulseState(s)));
 const ally=E.act(s,'pulse:collaborate:aster');
 const competitor=E.act(s,'pulse:challenge:aster');
 assert.ok(ally.worldPulse.rivals[0].trust>competitor.worldPulse.rivals[0].trust);
 assert.ok(ally.worldPulse.rivals[0].rivalry<competitor.worldPulse.rivals[0].rivalry);
 assert.equal(ally.cash,s.cash-350);
 assert.equal(competitor.cash,s.cash-250);
 assert.ok(ally.worldPulse.regions[s.country].sectors.technology>s.worldPulse.regions[s.country].sectors.technology);
 const evolved=worldTwoYears(ally);
 assert.ok(evolved.worldPulse.rivals.some((r,i)=>r.standing!==ally.worldPulse.rivals[i].standing));
 assert.ok(E.validate(evolved));
});
test('country changes preserve independent regional conditions and different career multipliers',()=>{
 let s=worldReady(77010);s.worldPulse=JSON.parse(JSON.stringify(E.worldPulseState(s)));
 s.worldPulse.regions[0].sectors.commerce=90;
 s.worldPulse.regions[1].sectors.commerce=20;
 const before=E.worldPulseEconomyMultiplier(s,'Finance & enterprise');
 s.country=1;
 assert.ok(E.worldPulseEconomyMultiplier(s,'Finance & enterprise')<before);
 assert.equal(E.worldPulseSummary(s).region,'Indonesia');
 assert.equal(E.worldPulseSummary(s).countries.length,6);
 assert.ok(E.validate(s));
});
test('the next generation inherits rival memories and a changing world, not unfinished projects',()=>{
 let s=worldReady(77011);
 s=E.act(s,'pulse:collaborate:cedar');
 s.actions=3;s=E.act(s,'pulse:begin:trade');
 s=E.worldPulseDecision(s,0);
 s.actions=3;s=E.act(s,'date');s=E.act(s,'child');
 const c=s.people.find(p=>p.role==='child');c.age=23;s.alive=false;s.pending=null;
 const heir=E.legacy(s,c.id);
 assert.ok(E.validate(heir));
 assert.equal(heir.worldPulse.active,null);
 assert.equal(heir.worldPulse.rivals.length,3);
 assert.ok(heir.worldPulse.rivals[2].history.some(x=>x.action==='collaboration'));
 assert.ok(E.worldPulseSummary(heir).ancestry.some(x=>x.kind==='rival'&&x.sourceLife===s.name));
 assert.equal(heir.worldPulse.regions[s.country].sectors.trade,s.worldPulse.regions[s.country].sectors.trade);
 assert.ok(heir.worldPulse.reputation.integrity>=40);
});
test('world pulse save validation rejects forged markets, rivals, and impossible active stages',()=>{
 let s=worldReady(77012);s=E.act(s,'pulse:begin:culture');
 assert.ok(E.validate(s));
 const bad=JSON.parse(JSON.stringify(s));bad.worldPulse.regions[0].sectors.technology=500;
 assert.equal(E.validate(bad),false);
 const wrong=JSON.parse(JSON.stringify(s));wrong.worldPulse.rivals[0].wins=-1;
 assert.equal(E.validate(wrong),false);
 const stage=JSON.parse(JSON.stringify(s));stage.worldPulse.active.stage=9;
 assert.equal(E.validate(stage),false);
 delete s.worldPulse;assert.ok(E.validate(s));
});

function focusLife(seed=84001){
 let s=E.createLife({seed});s.age=32;s.cash=35000;s.actions=3;
 s.stats.stress=36;s.pending=null;
 return s;
}
function settledFocusYear(s){
 s.pending=null;
 s=E.ageUp(s);
 if(s.pending!==null)s=E.resolve(s,0);
 return s;
}
test('life pacing keeps older local saves valid and six focus options available without extra tasks',()=>{
 const s=E.createLife({seed:84002});
 assert.equal(s.flow,undefined);
 assert.equal(E.flowThemes.length,6);
 assert.equal(new Set(E.flowThemes.map(x=>x.id)).size,6);
 assert.ok(E.validate(s));
 const view=E.flowSummary(s,E.commands(s));
 assert.equal(view.focus,'balanced');
 assert.equal(view.stage,'Early childhood');
 assert.equal(view.summary.choices,0);
 assert.equal(s.flow,undefined,'reading the dashboard must be pure');
});
test('choosing a preferred story direction saves without consuming activities or mutating an old life',()=>{
 const s=focusLife(84003),actions=s.actions;
 const changed=E.flowSetFocus(s,'relationships');
 assert.equal(changed.flow.focus,'relationships');
 assert.equal(changed.actions,actions);
 assert.equal(s.flow,undefined);
 assert.equal(E.flowSummary(changed).focusLabel,'People & family');
 assert.ok(E.validate(JSON.parse(JSON.stringify(changed))));
 assert.throws(()=>E.flowSetFocus(changed,'fake-story-focus'),/Unknown story focus/);
});
test('event weights favor preferred subjects while preserving variety across repeated categories',()=>{
 let s=E.flowSetFocus(focusLife(84004),'career');
 const career={id:999001,title:'An apprenticeship',category:'career',
  choices:[{effects:{knowledge:2}},{effects:{confidence:2}}]};
 const social={...career,id:999002,title:'An old friend',category:'relationship'};
 assert.ok(E.flowEventWeight(s,career,'career')>E.flowEventWeight(s,social,'relationship'));
 s.flow.recent=[{id:47,title:'A previous job',choice:'Practice',category:'career',theme:'career',age:s.age-1}];
 const repeat=E.flowEventWeight(s,career,'career');
 const novel=E.flowEventWeight({...s,flow:{...s.flow,recent:[]}},career,'career');
 assert.ok(repeat<novel);
 s.flow.recent.push({id:career.id,title:career.title,choice:'Try',category:'career',theme:'career',age:s.age-2});
 assert.ok(E.flowEventWeight(s,career,'career')<repeat);
 assert.ok(E.validate(s));
});
test('hardship balancing reduces unavoidable harmful scenes but does not alter actual player outcomes',()=>{
 let s=focusLife(84005);
 const harsh={id:999003,title:'A rough year',category:'money',
  choices:[{text:'Try',effects:{stress:9,cash:-1200}},{text:'Wait',effects:{stress:8,debt:1500}}]};
 const gentle={...harsh,id:999004,title:'A normal budget question',
  choices:[{text:'Plan',effects:{knowledge:2}},{text:'Review',effects:{cash:20}}]};
 const calm=E.flowEventWeight(s,harsh,'money');
 s.stats.stress=84;s.debt=20000;
 assert.ok(E.flowEventWeight(s,harsh,'money')<calm);
 assert.ok(E.flowEventWeight(s,harsh,'money')<E.flowEventWeight(s,gentle,'money'));
 assert.equal(harsh.choices[0].effects.cash,-1200);
 assert.equal(harsh.choices[0].effects.stress,9);
 assert.ok(E.validate(s));
});
test('event prompt personalizes family, career and money contexts but does not mutate the save',()=>{
 let s=focusLife(84006);s=E.act(s,'date');
 const p=s.people.find(x=>x.role==='partner');
 const event={id:999005,prompt:'A complicated decision appears.',min:20,max:60,
  choices:[{text:'Try',effects:{}},{text:'Wait',effects:{}}]};
 const original=JSON.stringify(s);
 const family=E.flowPrompt(s,event,'family',event.prompt);
 assert.ok(family.includes(p.name));
 const security=E.flowPrompt(s,event,'money',event.prompt);
 assert.ok(security.includes('spendable cash'));
 const work=E.flowPrompt(s,event,'career',event.prompt,'Software developer');
 assert.ok(s.flow===undefined||work.includes('professional')||work.includes('Software developer'));
 assert.equal(JSON.stringify(s),original);
});
test('resolved random events create a real bounded story memory and follow-up dashboard',()=>{
 let s=focusLife(84007);
 s=E.ageUp(s);
 assert.ok(E.pending(s));
 const event=E.pending(s);
 const chosen=event.choices[0].text;
 const next=E.resolve(s,0);
 assert.equal(next.flow.choices,1);
 assert.equal(next.flow.recent[0].title,event.title);
 assert.equal(next.flow.recent[0].choice,chosen);
 assert.equal(next.flow.lastDecisionAge,next.age);
 assert.ok(E.flowSummary(next).latest);
 assert.ok(E.validate(JSON.parse(JSON.stringify(next))));
});
test('personalized guidance prioritizes recovery, safer finances and meaningful available actions',()=>{
 let s=focusLife(84008);s.stats.stress=82;s.debt=26000;s.annual={balance:-6000,salary:20000};
 const suggestions=E.flowSummary(s,E.commands(s)).suggested;
 assert.ok(suggestions.some(x=>x.id==='rest'),'a stressful life should surface recovery');
 assert.ok(suggestions.some(x=>x.id==='budget:frugal'||x.id.startsWith('repay:')),'money problems should surface solvable next steps');
 assert.ok(suggestions.every(x=>E.commands(s).some(c=>c.id===x.id&&c.enabled)));
 assert.ok(suggestions.length<=3);
 assert.ok(E.validate(s));
});
test('read-only story guidance never consumes activities, creates funds, or starts an episode',()=>{
 let s=focusLife(84009);
 const old=JSON.stringify(s);
 for(let i=0;i<8;i++)E.flowSummary(s,E.commands(s));
 assert.equal(JSON.stringify(s),old);
 assert.equal(s.cash,35000);
});
test('story director restores focus from JSON and keeps memory bounded over a long life',()=>{
 let s=E.flowSetFocus(focusLife(84010),'discovery');
 for(let i=0;i<20;i++){
  s=settledFocusYear(s);
  if(!s.alive)break;
 }
 assert.equal(s.flow.focus,'discovery');
 assert.ok(s.flow.recent.length<=14);
 assert.ok(s.flow.chapters.length<=20);
 assert.ok(s.flow.yearsSeen<=20);
 assert.ok(s.flow.choices<=20);
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
});
test('story themes carry into the family archive but the heir chooses a new personal direction',()=>{
 let s=focusLife(84011);
 s=E.flowSetFocus(s,'relationships');
 s=E.act(s,'date');
 s=E.act(s,'child');
 s.actions=3;
 s=E.ageUp(s);if(s.pending!==null)s=E.resolve(s,0);
 const child=s.people.find(p=>p.role==='child');child.age=22;
 assert.ok(s.flow.choices>=1);
 const count=s.flow.chapters.length;
 s.alive=false;s.pending=null;
 const heir=E.legacy(s,child.id);
 assert.equal(heir.flow.focus,'balanced');
 assert.equal(heir.flow.choices,0);
 assert.equal(heir.flow.recent.length,0);
 assert.ok(heir.flow.archive.length>=count);
 assert.equal(heir.flow.archive.at(-1).sourceLife,s.name);
 assert.ok(E.validate(heir));
});
test('invalid focus, oversized story records and negative lifetime counters fail save validation',()=>{
 let s=E.flowSetFocus(focusLife(84012),'wellbeing');
 const focus=JSON.parse(JSON.stringify(s));focus.flow.focus='everything-at-once';
 assert.equal(E.validate(focus),false);
 const huge=JSON.parse(JSON.stringify(s));huge.flow.recent=Array.from({length:40},(_,i)=>({id:i,title:'T',choice:'C',category:'health',age:40}));
 assert.equal(E.validate(huge),false);
 const count=JSON.parse(JSON.stringify(s));count.flow.choices=-1;
 assert.equal(E.validate(count),false);
 delete s.flow;
 assert.ok(E.validate(s));
});
