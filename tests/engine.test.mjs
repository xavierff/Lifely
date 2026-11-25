import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {emptyProfile,mergeLife,validProfile} from '../src/profile.mjs';
import {miniRound} from '../src/content/minigames.mjs';
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

test('catalog targets, distinct prompts and valid IDs',()=>{let s=E.createLife({seed:2});assert.equal(E.events.length,1109);assert.equal(new Set(E.events.map(e=>e.prompt)).size,1109);assert.equal(E.careers.length,150);assert.equal(new Set(E.careers.map(j=>j.title)).size,150);assert.equal(E.achievementStatus(s).length,124);assert.equal(new Set(E.achievementStatus(s).map(a=>a.name)).size,124);assert.equal(E.challengeProgress(s).length,62);assert.equal(new Set(E.challengeProgress(s).map(c=>c.id)).size,62);for(let i=0;i<E.events.length;i++)assert.equal(E.events[i].id,i);});
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
 assert.equal(E.achievementStatus(s).length,124);assert.equal(E.challengeProgress(s).length,62);assert.equal(E.ribbons.length,32);
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
