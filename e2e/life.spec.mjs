import E from '../src/engine.mjs';
import {test,expect} from '@playwright/test';
test('create a life, resolve a year, restore and switch slots',async({page})=>{
 await page.goto('/');
 await page.getByRole('textbox',{name:'Character name'}).fill('Ada');
 await page.getByRole('button',{name:'Begin my life'}).click();
 await expect(page.getByText('Ada',{exact:true})).toBeVisible();
 await page.getByTestId('advance-year').click();
 const decision=page.getByTestId('life-decision');
 await expect(decision).toBeVisible();
 await decision.getByRole('button').first().click();
 await expect(decision).toHaveCount(0);
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.reload();
 await expect(page.getByText('Ada',{exact:true})).toBeVisible();
 await expect(page.getByTestId('advance-year')).toContainText('Age 2');
 await page.getByText('More',{exact:true}).click();
 await page.getByRole('button',{name:/Slot 2/}).click();
 await page.getByRole('textbox',{name:'Character name'}).fill('Ben');
 await page.getByRole('button',{name:'Begin my life'}).click();
 await expect(page.getByText('Ben',{exact:true})).toBeVisible();
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.getByText('More',{exact:true}).click();
 await page.getByRole('button',{name:/Slot 1/}).click();
 await expect(page.getByText('Ada',{exact:true})).toBeVisible();
 await expect(page.getByTestId('advance-year')).toContainText('Age 2');
});

test('special career and NPC world are accessible and persist',async({page})=>{
 let s=E.createLife({name:'Ari',seed:99});s.age=25;s.cash=100000;s.education=2;s.stats.health=90;
 await page.goto('/');
 await page.evaluate(save=>{localStorage.setItem('lifely.save.v2',JSON.stringify(save));localStorage.setItem('lifely.active.slot','1');},s);
 await page.reload();await expect(page.getByText('Ari',{exact:true})).toBeVisible();
 await page.getByText('Work',{exact:true}).click();
 await page.getByRole('button',{name:/Pursue Professional athlete/}).click();
 await expect(page.getByText('Rookie',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:/Train with coach/}).click();
 await expect(page.getByText('Preparation',{exact:true})).toBeVisible();
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.getByText('People',{exact:true}).click();
 await expect(page.getByText('Trust',{exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:/Offer financial help/}).first().click();
 await expect(page.getByText(/Received financial support/).first()).toBeVisible();
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.reload();await expect(page.getByText('Ari',{exact:true})).toBeVisible();
 await page.getByText('Work',{exact:true}).click();await expect(page.getByText('Rookie',{exact:true})).toBeVisible();
});
test('named saga shows its participant and survives a reload',async({page})=>{
 let s=E.createLife({name:'Mika',seed:44});s.age=25;s.cash=100000;s=E.act(s,'date');const p=s.people.find(x=>x.role==='partner');const e=E.events.find(x=>x.saga?.id==='partnership'&&x.saga.stage==='start');s.pending=e.id;s.pendingSagaPerson=p.id;
 await page.goto('/');await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),s);await page.reload();
 const decision=page.getByTestId('life-decision');await expect(decision).toContainText(p.name);
 await decision.getByRole('button').first().click();
 await expect(decision).toHaveCount(0);await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.getByText('More',{exact:true}).click();
 await expect(page.getByText('A life built together',{exact:true})).toBeVisible();
 await page.reload();await page.getByText('More',{exact:true}).click();
 await expect(page.getByText('A life built together',{exact:true})).toBeVisible();
});

test('career challenge survives reload and player collection is available',async({page})=>{
 let s=E.createLife({name:'Lina',seed:121});s.age=30;s.cash=100000;s=E.act(s,'job:0');s=E.act(s,'mini:memory');
 await page.goto('/');await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),s);await page.reload();
 const panel=page.getByTestId('career-challenge');await expect(panel).toBeVisible();
 await panel.getByRole('button',{name:'Ready — hide sequence'}).click();await expect(panel.getByText('Which sequence did you study?')).toBeVisible();
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();await page.reload();await expect(panel.getByText('Which sequence did you study?')).toBeVisible();
 await panel.getByRole('button').first().click();await expect(panel).toContainText('ROUND 2/5');
 await panel.getByRole('button',{name:'Abandon challenge'}).click();await expect(panel).toHaveCount(0);
 await page.getByText('More',{exact:true}).click();await expect(page.getByText('Player collection',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Show all ribbons'}).click();await expect(page.getByText(/Everyday Legacy/)).toBeVisible();
});

test('six-domain World hub and travel journal persist on reload',async({page})=>{
 let s=E.createLife({name:'Nora',seed:91,background:'royal'});s.age=30;s.cash=120000;s.stats.creativity=90;s.stats.reputation=85;s.stats.health=85;
 await page.goto('/');await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),s);await page.reload();
 await page.getByText('World',{exact:true}).click();
 await expect(page.getByText('Every path changes your story.')).toBeVisible();
 await expect(page.getByRole('button',{name:'Explore Entertainment'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Explore Sports'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Explore Politics'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Explore Royalty'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Explore Travel'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Explore Family dynasty'})).toBeVisible();
 await page.getByRole('button',{name:/Enter Film actor career/}).click();
 await expect(page.getByText('Film actor',{exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'Explore Travel'}).click();
 await page.getByRole('textbox',{name:'Search destinations'}).fill('Kyoto');
 await page.getByRole('button',{name:/Visit Kyoto/}).click();
 await expect(page.getByText(/Age 30 · Kyoto/)).toBeVisible();
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.reload();await page.getByText('World',{exact:true}).click();
 await page.getByRole('button',{name:'Explore Travel'}).click();
 await expect(page.getByText(/Age 30 · Kyoto/)).toBeVisible();
 await page.getByRole('button',{name:'Explore Royalty'}).click();
 await expect(page.getByText('Royal heir',{exact:true}).first()).toBeVisible();
});
test('family tree shows persisted ancestors from inherited lives',async({page})=>{
 let s=E.createLife({name:'Elena',seed:31});s.age=40;s.cash=100000;s=E.act(s,'date');s=E.act(s,'child');const child=s.people.find(p=>p.role==='child');child.age=18;s.alive=false;s.pending=null;
 let heir=E.legacy(s,child.id);await page.goto('/');await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),heir);await page.reload();
 await page.getByText('People',{exact:true}).click();await expect(page.getByText('Family tree',{exact:true})).toBeVisible();
 await expect(page.getByText(/Elena · lived 40 years/)).toBeVisible();
});

test('named competitors, agents and political rivals appear and persist after a match',async({page})=>{
 let s=E.createLife({name:'Juno',seed:41});s.age=30;s.cash=100000;s.stats.creativity=95;s.stats.reputation=85;
 s=E.act(s,'world:sport:start:0');s=E.act(s,'world:pol:join');s=E.act(s,'world:ent:start:0');s.actions=3;
 const name=s.world.characters.athletes[0].name;
 await page.goto('/');await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),s);await page.reload();
 await page.getByText('World',{exact:true}).click();
 await page.getByRole('button',{name:'Explore Sports'}).click();
 await expect(page.getByText('Your sporting rivals',{exact:true})).toBeVisible();
 await expect(page.getByText(name,{exact:true})).toBeVisible();
 await page.getByRole('button',{name:new RegExp('Challenge '+name)}).click();
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.reload();await page.getByText('World',{exact:true}).click();
 await page.getByRole('button',{name:'Explore Sports'}).click();
 await expect(page.getByText(name,{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Explore Politics'}).click();
 await expect(page.getByText('Political rivals',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Explore Entertainment'}).click();
 await expect(page.getByText('Representation & agents',{exact:true})).toBeVisible();
});
test('family disagreements and inherited saga chapters are visible in people and world',async({page})=>{
 let s=E.createLife({name:'Cora',seed:88});s.age=42;s.cash=100000;
 const parent=s.people.find(p=>p.role==='parent');
 s=E.act(s,'character:family:start:'+parent.id);s=E.act(s,'character:legacy:start');
 const title=s.world.characters.arc.title;const childAge=25;s=E.act(s,'date');s.actions=3;s=E.act(s,'child');const child=s.people.find(p=>p.role==='child');child.age=childAge;
 await page.goto('/');await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),s);await page.reload();
 await page.getByText('People',{exact:true}).click();
 await expect(page.getByText('Family tensions',{exact:true})).toBeVisible();
 await expect(page.getByText('Unresolved tension').first()).toBeVisible();
 await page.getByText('World',{exact:true}).click();await page.getByRole('button',{name:'Explore Family dynasty'}).click();
 await expect(page.getByText('ACTIVE MULTI-YEAR SAGA',{exact:true})).toBeVisible();
 await expect(page.getByText(title,{exact:true})).toBeVisible();
 let heir=E.legacy({...s,alive:false,pending:null},child.id);
 await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),heir);await page.reload();
 await page.getByText('World',{exact:true}).click();await page.getByRole('button',{name:'Explore Family dynasty'}).click();
 await expect(page.getByText(title,{exact:true})).toBeVisible();
 await expect(page.getByText('2',{exact:true}).first()).toBeVisible();
});

test('three-round personal dialogue is responsive, saved, and reveals backstory',async({page})=>{
 let s=E.createLife({name:'Mara',seed:808});s.age=29;
 await page.goto('/');await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),s);await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 await page.getByRole('button',{name:/Talk with /}).first().click();
 const panel=page.getByTestId('conversation-panel');await expect(panel).toBeVisible();
 await expect(panel).toContainText('ROUND 1 OF 3');
 await expect(page.getByTestId('advance-year')).toBeDisabled();
 await panel.getByRole('button').first().click();await expect(panel).toContainText('ROUND 2 OF 3');
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();await page.reload();
 await expect(panel).toContainText('ROUND 2 OF 3');
 await panel.getByRole('button').first().click();await expect(panel).toContainText('ROUND 3 OF 3');
 await panel.getByRole('button').first().click();await expect(panel).toHaveCount(0);
 await expect(page.getByTestId('advance-year')).toBeEnabled();
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByText(/Shared memory:/).first()).toBeVisible();
});
test('small phones keep readable tabs and conversation choices without horizontal overflow',async({page})=>{
 for(const width of [320,375,430]){
  await page.setViewportSize({width,height:740});
  let s=E.createLife({name:'June',seed:809+width});s.age=27;
  await page.goto('/');await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),s);await page.reload();
  await expect(page.getByRole('tab',{name:'People'})).toBeVisible();
  await expect(page.getByRole('tab',{name:'World'})).toBeVisible();
  await page.getByRole('tab',{name:'People'}).click();
  await page.getByRole('button',{name:/Talk with /}).first().click();
  const panel=page.getByTestId('conversation-panel');await expect(panel).toBeVisible();
  const box=await panel.boundingBox();expect(box).not.toBeNull();expect(box.width).toBeLessThanOrEqual(width);
  for(const button of await panel.getByRole('button').all()){
   const bounds=await button.boundingBox();if(bounds)expect(bounds.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole('tab',{name:'World'}).click();
  await page.getByRole('button',{name:'Explore Sports'}).click();
  await expect(page.getByText('Your sporting rivals',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});

test('decision echoes appear as playable future chapters and survive reload',async({page})=>{
 let s=E.createLife({name:'Emery',seed:456});s.age=28;s.cash=10000;
 const e=E.events.find(x=>x.title==='A new coworker');s.pending=e.id;s=E.resolve(s,0);
 const due=s.ripples.active[0].nextAge;s.age=due;s.actions=3;
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 const card=page.getByTestId('ongoing-ripple');await expect(card).toBeVisible();
 await expect(card).toContainText('A new coworker');
 await expect(card).toContainText('CHAPTER 1 / 3');
 await card.getByRole('button').first().click();
 await expect(card).toContainText('CHAPTER 2 / 3');
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.reload();await expect(page.getByTestId('ongoing-ripple')).toContainText('CHAPTER 2 / 3');
});
test('life chronicle reports the results of multiple-year choices',async({page})=>{
 let s=E.createLife({name:'Rowan',seed:457});s.age=28;s.cash=25000;
 const e=E.events.find(x=>x.title==='A new coworker');s.pending=e.id;s=E.resolve(s,0);
 const id=s.ripples.active[0].id;
 for(let i=0;i<3;i++){s.age=s.ripples.active[0].nextAge;s.actions=3;s=E.act(s,'ripple:'+id+':0');}
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'More'}).click();
 const card=page.getByTestId('life-chronicle');await expect(card).toBeVisible();
 await expect(card).toContainText('Promises fulfilled');await expect(card).toContainText('The reputation you build');
});
test('ripple choices fit mobile widths without horizontal overflow',async({page})=>{
 for(const width of [320,375,430]){
   await page.setViewportSize({width,height:750});
   let s=E.createLife({name:'Mina',seed:458+width});s.age=28;s.cash=15000;
   const e=E.events.find(x=>x.title==='A new coworker');s.pending=e.id;s=E.resolve(s,0);
   s.age=s.ripples.active[0].nextAge;s.actions=3;
   await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
   const card=page.getByTestId('ongoing-ripple');await expect(card).toBeVisible();
   let box=await card.boundingBox();expect(box.width).toBeLessThanOrEqual(width);
   for(const button of await card.getByRole('button').all()){const bounds=await button.boundingBox();if(bounds)expect(bounds.height).toBeGreaterThanOrEqual(44);}
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});

test('film project decisions continue after save reload and update career portfolio',async({page})=>{
 let s=E.createLife({name:'Elliot',seed:194});s.age=30;s.cash=80000;s.stats.creativity=91;s.world.entertainment.path='Film director';
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();
 await page.getByRole('button',{name:/Produce a film/}).click();
 const panel=page.getByTestId('career-project');await expect(panel).toBeVisible();
 await expect(panel).toContainText('ROUND 1 OF 4');await expect(page.getByTestId('advance-year')).toBeDisabled();
 await panel.getByRole('button',{name:/Build a small, original independent story/}).click();
 await expect(panel).toContainText('ROUND 2 OF 4');
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.reload();await expect(panel).toContainText('ROUND 2 OF 4');
 await panel.getByRole('button',{name:/Develop your existing ensemble/}).click();
 await panel.getByRole('button',{name:/Reduce scope and complete essential scenes/}).click();
 await panel.getByRole('button',{name:/Release slowly to a loyal audience/}).click();
 await expect(panel).toHaveCount(0);
 await page.getByRole('tab',{name:'Work'}).click();
 await expect(page.getByText('CAREER PROJECT PORTFOLIO',{exact:true})).toBeVisible();
 await expect(page.getByTestId('advance-year')).toBeEnabled();
});
test('sport, civic election, medical and business missions have distinct playable entry points',async({page})=>{
 for(const type of ['sports','election','medical','business']){
   let s=E.createLife({name:'Alex',seed:300+['sports','election','medical','business'].indexOf(type)});
   s.age=32;s.cash=90000;s.stats.health=90;s.stats.reputation=92;s.stats.knowledge=95;
   if(type==='sports')s.world.sports.sport='Football';
   if(type==='election')s.world.politics.party='Civic Renewal';
   if(type==='medical')s.job={id:15,level:1,experience:0};
   if(type==='business')s.business={sector:'shop',capital:15000,quality:65};
   await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
   await page.getByRole('tab',{name:'Work'}).click();
   const label={sports:/Play a competitive season/,election:/Run an election campaign/,medical:/Coordinate a clinical case/,business:/Launch a company initiative/}[type];
   await page.getByRole('button',{name:label}).click();
   await expect(page.getByTestId('career-project')).toContainText('ROUND 1 OF 4');
 }
});
test('career choices remain readable at compact phone widths',async({page})=>{
 for(const width of [320,375,430]){
   await page.setViewportSize({width,height:740});
   let s=E.createLife({name:'Parker',seed:612+width});s.age=30;s.cash=20000;s.world.sports.sport='Basketball';
   await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
   await page.getByRole('tab',{name:'Work'}).click();
   await page.getByRole('button',{name:/Play a competitive season/}).click();
   const panel=page.getByTestId('career-project');await expect(panel).toBeVisible();
   const box=await panel.boundingBox();expect(box.width).toBeLessThanOrEqual(width);
   for(const button of await panel.getByRole('button').all()){const bounds=await button.boundingBox();if(bounds)expect(bounds.height).toBeGreaterThanOrEqual(44);}
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});

test('tactical sports match persists score, fatigue and turn limits after reload',async({page})=>{
 let s=E.createLife({seed:2410});s.age=32;s.cash=50000;s.world.sports.sport='Football';s.world.sports.form=80;
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();
 await page.getByRole('button',{name:/Play a competitive season/}).click();
 const board=page.getByTestId('tactical-sports-match');await expect(board).toBeVisible();
 await expect(board).toContainText('PRESEASON TACTICS BOARD');
 await page.getByTestId('sports-action-0').click();
 await expect(page.getByTestId('playfield-feedback')).toBeVisible();
 await page.reload();await expect(page.getByTestId('tactical-sports-match')).toContainText('Plays left');
 await page.getByTestId('sports-action-2').click();
 await expect(page.getByTestId('sports-action-1')).toBeDisabled();
 await expect(page.getByTestId('career-project')).toContainText('Now make the story decision');
});
test('film set records takes and renders visual coverage and feedback',async({page})=>{
 let s=E.createLife({seed:2411});s.age=32;s.cash=50000;s.world.entertainment.path='Film director';s.stats.creativity=95;s.skills.art=95;
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();await page.getByRole('button',{name:/Produce a film/}).click();
 const set=page.getByTestId('interactive-film-set');await expect(set).toContainText('DIRECTOR');
 await page.getByTestId('film-action-0').click();
 await expect(set).toContainText('Total takes');await expect(set).toContainText('STORYBOARD COVERAGE');
 await expect(page.getByTestId('playfield-feedback')).toBeVisible();
});
test('business dashboard makes planning controls playable without charging cash twice',async({page})=>{
 let s=E.createLife({seed:2412});s.age=32;s.cash=50000;s.business={sector:'shop',capital:12000,quality:62,demand:51};
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();await page.getByRole('button',{name:/Launch a company initiative/}).click();
 const board=page.getByTestId('business-management-dashboard');await expect(board).toContainText('OPERATIONS LIVEBOARD');
 await expect(board).toContainText('CUSTOMER INTEREST TREND');
 await page.getByTestId('business-action-1').click();
 await expect(board).toContainText('Projected orders');
 await expect(page.getByTestId('playfield-feedback')).toBeVisible();
});

test('fictional civic debate is playable, shows rival reaction and saves across reload',async({page})=>{
 let s=E.createLife({seed:3410});s.age=32;s.cash=90000;s.world.politics.party='Civic Renewal';s.stats.reputation=90;s.stats.social=90;
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();await page.getByRole('button',{name:/Run an election campaign/}).click();
 const panel=page.getByTestId('career-project'),board=page.getByTestId('interactive-election-debate');
 await expect(board).toContainText('FICTIONAL CIVIC DEBATE');
 await expect(board).toContainText('Credibility');await expect(board).toContainText('Community trust');
 await expect(page.getByTestId('career-npc')).toBeVisible();
 await page.getByTestId('election-action-0').click();
 await expect(page.getByTestId('playfield-feedback')).toBeVisible();
 await page.reload();
 await expect(board).toBeVisible();
 await expect(page.getByTestId('career-npc')).toContainText('Civic opponent');
 await page.getByTestId('election-action-1').click();
 await expect(page.getByTestId('election-action-2')).toBeDisabled();
 await expect(panel).toContainText('Now make the story decision');
});
test('fictional clinical case makes consent and safety visible with preserved action outcomes',async({page})=>{
 let s=E.createLife({seed:3411});s.age=32;s.cash=90000;s.job={id:15,level:1,experience:0};s.stats.knowledge=92;
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();await page.getByRole('button',{name:/Coordinate a clinical case/}).click();
 const board=page.getByTestId('interactive-medical-case');
 await expect(board).toContainText('CLINICAL CASE BOARD');await expect(board).toContainText('Informed consent');
 await expect(board).toContainText('Safety & records');await expect(board).toContainText('PATIENT-CARE HANDOFF');
 await page.getByTestId('medical-action-0').click();
 await expect(page.getByTestId('career-npc')).toBeVisible();
 await expect(page.getByTestId('playfield-feedback')).toBeVisible();
 await page.reload();await expect(board).toContainText('Documented reviews: 1');
});
test('career sounds can be muted persistently without affecting saved progress',async({page})=>{
 let s=E.createLife({seed:3412});s.age=32;s.cash=90000;s.world.entertainment.path='Film director';
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();await page.getByRole('button',{name:/Produce a film/}).click();
 const sound=page.getByRole('button',{name:/Sound effects: On/});await expect(sound).toBeVisible();
 await sound.click();await expect(page.getByRole('button',{name:/Sound effects: Off/})).toBeVisible();
 await page.reload();await expect(page.getByRole('button',{name:/Sound effects: Off/})).toBeVisible();
 await page.getByTestId('film-action-1').click();await expect(page.getByTestId('playfield-feedback')).toBeVisible();
});
test('medical and civic boards remain touch friendly on narrow screens',async({page})=>{
 for(const width of [320,375,430]){
  await page.setViewportSize({width,height:760});
  for(const type of ['election','medical']){
   let s=E.createLife({seed:3430+width+(type==='election'?1:2)});s.age=31;s.cash=90000;
   if(type==='election')s.world.politics.party='Civic Renewal';else s.job={id:15,level:1,experience:0};
   await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
   await page.getByRole('tab',{name:'Work'}).click();
   await page.getByRole('button',{name:type==='election'?/Run an election campaign/:/Coordinate a clinical case/}).click();
   const board=page.getByTestId(type==='election'?'interactive-election-debate':'interactive-medical-case');
   const bounds=await board.boundingBox();expect(bounds.width).toBeLessThanOrEqual(width);
   for(const button of await board.getByRole('button').all()){const rect=await button.boundingBox();if(rect)expect(rect.height).toBeGreaterThanOrEqual(44);}
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
  }
 }
});
test('multi-year career consequences appear in Work and Life after a completed project',async({page})=>{
 let s=E.createLife({seed:3431});s.age=35;s.cash=90000;s.world.entertainment.path='Film director';
 s=E.act(s,'campaign:start:film');for(let i=0;i<4;i++)s=E.campaignDecision(s,1);
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await expect(page.getByTestId('career-life-update')).toBeVisible();
 await page.getByRole('tab',{name:'Work'}).click();
 const panel=page.getByTestId('career-aftermath');await expect(panel).toContainText('CAREER CONSEQUENCES');
 await expect(panel).toContainText('Next chapter at age 36');
 await expect(page.getByTestId('career-reactions')).toBeVisible();
});

test('a returning career story offers a visible playable response years later',async({page})=>{
 let s=E.createLife({seed:3601});s.age=35;s.cash=85000;s.world.sports.sport='Football';
 s=E.act(s,'campaign:start:sports');for(let i=0;i<4;i++)s=E.campaignDecision(s,1);
 s=E.ageUp(s);s.pending=null;
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();
 await expect(page.getByText('Career follow-up decisions')).toBeVisible();
 await page.getByRole('button',{name:/Prepare for the rematch/}).click();
 await expect(page.getByText('Career follow-up decisions')).toHaveCount(0);
 await expect(page.getByTestId('career-reactions')).toContainText('Career follow-up');
});

test('relationship scene reacts to choices and survives a save reload',async({page})=>{
 let s=E.createLife({seed:4501});s.age=23;s.actions=3;
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 await page.getByRole('button',{name:/Share an interactive day with/}).first().click();
 const panel=page.getByTestId('everyday-project');
 await expect(page.getByTestId('relationship-moment')).toContainText('RELATIONSHIP STORY');
 await expect(page.getByTestId('advance-year')).toBeDisabled();
 await page.getByTestId('scene-choice-0').click();
 await expect(page.getByTestId('everyday-feedback')).toBeVisible();
 await page.reload();
 await expect(panel).toContainText('ROUND 2 OF 3');
 await page.getByTestId('scene-choice-1').click();
 await page.getByTestId('scene-choice-2').click();
 await expect(panel).toHaveCount(0);
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByText('Interactive relationships')).toBeVisible();
 await expect(page.getByTestId('advance-year')).toBeEnabled();
});
test('school life offers a touch-friendly project, recurring peer and scoreboard',async({page})=>{
 let s=E.createLife({seed:4502});s.age=12;s.actions=3;
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();
 await expect(page.getByTestId('school-progress')).toContainText('STUDENT CHAPTERS');
 await page.getByRole('button',{name:/Play a school-life challenge/}).click();
 const board=page.getByTestId('interactive-school-life');
 await expect(board).toContainText('SCHOOL LIFE');
 await expect(board).toContainText('Project momentum');
 await page.getByTestId('scene-choice-0').click();
 await expect(page.getByTestId('everyday-feedback')).toBeVisible();
 await page.getByTestId('scene-choice-1').click();
 await page.getByTestId('scene-choice-2').click();
 await expect(board).toHaveCount(0);
 await page.getByRole('tab',{name:'Work'}).click();
 await expect(page.getByTestId('school-progress')).toContainText('Projects completed');
});
test('courtroom choices give a verdict through the existing justice case',async({page})=>{
 let s=E.createLife({seed:4503});s.age=34;s.actions=3;s.cash=9000;s.justice.case={opened:34,severity:48,counsel:false};
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'More'}).click();
 await page.getByRole('button',{name:/Enter the fictional courtroom/}).click();
 const board=page.getByTestId('interactive-courtroom');
 await expect(board).toContainText('FICTIONAL COURTROOM');
 await expect(board).toContainText('Documented facts');
 await page.getByTestId('scene-choice-0').click();
 await page.reload();await expect(page.getByTestId('everyday-project')).toContainText('ROUND 2 OF 3');
 await page.getByTestId('scene-choice-1').click();
 await page.getByTestId('scene-choice-2').click();
 await expect(board).toHaveCount(0);
 await expect(page.getByTestId('advance-year')).toBeEnabled();
 await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByText(/Age 34 · (Dismissed|Fine and probation|Custodial sentence)/)).toBeVisible();
});
test('returning everyday relationships provide two consequences to choose from',async({page})=>{
 let s=E.createLife({seed:4504});s.age=30;s=E.act(s,'scene:start:bond:'+s.people[0].id);
 for(const i of [0,1,2])s=E.sceneChoice(s,i);
 s.pending=null;s=E.ageUp(s);s.pending=null;s=E.ageUp(s);s.pending=null;
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 const card=page.getByTestId('returning-everyday-story');
 await expect(card).toContainText('SOMEONE REMEMBERS');
 await expect(card.getByRole('button')).toHaveCount(2);
 await card.getByRole('button').first().click();
 await expect(page.getByTestId('returning-everyday-story')).toHaveCount(0);
});
test('everyday boards remain legible and tappable on small phones',async({page})=>{
 for(const width of [320,375,430]){
  await page.setViewportSize({width,height:750});
  for(const type of ['bond','school','court']){
   let s=E.createLife({seed:4600+width+['bond','school','court'].indexOf(type)});s.age=type==='school'?12:31;s.cash=10000;
   if(type==='court')s.justice.case={opened:31,severity:30,counsel:false};
   await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
   await page.getByRole('tab',{name:type==='bond'?'People':type==='school'?'Work':'More'}).click();
   await page.getByRole('button',{name:type==='bond'?/Share an interactive day with/:type==='school'?/Play a school-life challenge/:/Enter the fictional courtroom/}).first().click();
   const card=page.getByTestId('everyday-project');await expect(card).toBeVisible();
   const box=await card.boundingBox();expect(box.width).toBeLessThanOrEqual(width+1);
   for(const button of await card.getByRole('button').all()){const b=await button.boundingBox();if(b)expect(b.height).toBeGreaterThanOrEqual(44);}
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
  }
 }
});

function cohortLife(seed){
 let s=E.createLife({seed});s.age=17;s.actions=3;s.pending=null;s=E.act(s,'scene:start:school');
 for(const i of [0,1,2])s=E.sceneChoice(s,i);
 s.pending=null;s=E.ageUp(s);s.pending=null;
 return s;
}
test('school friends become persistent adult contacts with detailed profiles and playable choices',async({page})=>{
 let s=cohortLife(7101);
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('living-world-board');
 await expect(board).toContainText('YOUR LIVING SOCIAL WORLD');
 await expect(board).toContainText('4 ALUMNI');
 await expect(board.getByTestId('alumni-alum-0')).toBeVisible();
 await board.getByTestId('alumni-alum-1').click();
 await expect(board.getByTestId('alumni-profile')).toContainText('Former classmate');
 await board.getByRole('button',{name:/Reconnect with/}).click();
 await expect(board.getByTestId('alumni-profile')).toBeVisible();
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('living-world-board')).toContainText('4 ALUMNI');
});
test('autonomous social graph remembers partnerships and rivalries across simulated years',async({page})=>{
 let s=cohortLife(7102);
 for(let y=0;y<12;y++){s.pending=null;s=E.ageUp(s);}
 s.pending=null;
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('living-world-board');
 await expect(board.getByTestId('autonomous-relationships')).toBeVisible();
 await expect(board).toContainText('RELATIONSHIPS DEVELOPING ON THEIR OWN');
 await expect(board).toContainText('years connected');
});
test('living world opportunities return after a year and become real playable story decisions',async({page})=>{
 let s=cohortLife(7103);s=E.ageUp(s);s.pending=null;
 const opportunity=E.autonomyView(s).opportunities.find(x=>x.ready);
 expect(opportunity).toBeTruthy();
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await expect(page.getByTestId('living-world-pulse')).toBeVisible();
 await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('living-world-board');
 await expect(board.getByTestId('autonomous-opportunities')).toContainText('YOUR RESPONSE IS READY');
 const button=board.getByRole('button',{name:/Join the next chapter/});
 await expect(button).toBeVisible();await button.click();
 await expect(board).toContainText('RETURNING AT AGE 21');
 await page.reload();await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('living-world-board')).toContainText('CHAPTER 2/3');
});
test('autonomous social world stays within narrow phone viewports',async({page})=>{
 for(const width of [320,375,430]){
  await page.setViewportSize({width,height:780});
  const s=cohortLife(7200+width);
  await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
  await page.getByRole('tab',{name:'People'}).click();
  const board=page.getByTestId('living-world-board');
  const rect=await board.boundingBox();expect(rect.width).toBeLessThanOrEqual(width);
  for(const button of await board.getByRole('button').all()){
   const b=await button.boundingBox();if(b)expect(b.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});

function episodeReadyLife(seed){
 let s=E.createLife({seed});s.age=14;s.pending=null;s=E.ageUp(s);s.pending=null;
 return s;
}
test('a named, choice-driven social story is playable with persistent round-by-round saving',async({page})=>{
 const s=episodeReadyLife(16001);
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await expect(page.getByTestId('new-character-episodes')).toContainText('A STORY ONLY YOU CAN DECIDE');
 await page.getByRole('button',{name:/Enter the story:/}).first().click();
 await expect(page.getByTestId('character-episode')).toBeVisible();
 await expect(page.getByTestId('character-story-board')).toContainText('SCENE 1/3');
 await expect(page.getByTestId('advance-year')).toBeDisabled();
 await page.getByTestId('episode-choice-0').click();
 await expect(page.getByTestId('character-story-board')).toContainText('SCENE 2/3');
 await expect(page.getByTestId('episode-reaction')).toBeVisible();
 await page.reload();
 await expect(page.getByTestId('character-story-board')).toContainText('SCENE 2/3');
 await page.getByTestId('episode-choice-1').click();
 await page.getByTestId('episode-choice-2').click();
 await expect(page.getByTestId('character-episode')).toHaveCount(0);
 await expect(page.getByTestId('story-echo-pulse')).toBeVisible();
 await expect(page.getByTestId('advance-year')).toBeEnabled();
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('story-director-history')).toContainText('LIVING STORIES');
});
test('the social story board remains accessible and does not overflow on narrow phones',async({page})=>{
 for(const width of [320,375,430]){
  await page.setViewportSize({width,height:790});
  const s=episodeReadyLife(16100+width);
  await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
  await page.getByRole('button',{name:/Enter the story:/}).first().click();
  const board=page.getByTestId('character-story-board');
  await expect(board).toBeVisible();
  const box=await board.boundingBox();
  expect(box.width).toBeLessThanOrEqual(width+1);
  for(const button of await board.getByRole('button').all()){
   const rect=await button.boundingBox();
   if(rect)expect(rect.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
test('unanswered personal invitations expire without blocking years, and resolved dramas echo later',async({page})=>{
 let s=episodeReadyLife(16005);
 s.pending=null;s=E.ageUp(s);s.pending=null;s=E.ageUp(s);s.pending=null;
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await expect(page.getByTestId('new-character-episodes')).toHaveCount(0);
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('story-director-history')).toContainText('unanswered');
 await expect(page.getByTestId('advance-year')).toBeEnabled();
});

function hobbyPreparedLife(seed,age=19){
 const s=E.createLife({seed});s.age=age;s.pending=null;s.actions=3;return s;
}
test('hobby selection, three tactical rounds and saved mastery are playable in the normal life tab',async({page})=>{
 const s=hobbyPreparedLife(18001);
 await page.goto('/');
 await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);
 await page.reload();
 const overview=page.getByTestId('hobby-league-overview');
 await expect(overview).toContainText('YOUR PLAYABLE HOBBIES');
 await expect(overview.getByTestId('hobby-tile-chess')).toBeVisible();
 await overview.getByTestId('hobby-tile-chess').click();
 await overview.getByTestId('hobby-action-hobby-start-chess-practice').click();
 const board=page.getByTestId('hobby-circuit-board');
 await expect(board).toBeVisible();
 await expect(board).toContainText('ROUND 1 OF 3');
 await expect(page.getByTestId('advance-year')).toBeDisabled();
 await board.getByTestId('hobby-choice-1').click();
 await expect(board).toContainText('ROUND 2 OF 3');
 await expect(board.getByTestId('hobby-round-feedback')).toBeVisible();
 await page.reload();
 await expect(page.getByTestId('hobby-circuit-board')).toContainText('ROUND 2 OF 3');
 await page.getByTestId('hobby-choice-0').click();
 await page.getByTestId('hobby-choice-2').click();
 await expect(page.getByTestId('active-hobby')).toHaveCount(0);
 await expect(page.getByTestId('hobby-last-result')).toBeVisible();
 await expect(page.getByTestId('advance-year')).toBeEnabled();
 await page.reload();
 await expect(page.getByTestId('hobby-last-result')).toBeVisible();
 await expect(page.getByTestId('hobby-league-overview')).toContainText('YOUR HOBBY CHRONICLE');
});
test('hobby league profile presents evolving rivals, and an eligible contest awards results',async({page})=>{
 const s=hobbyPreparedLife(18002,26);
 await page.goto('/');
 await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);
 await page.reload();
 const overview=page.getByTestId('hobby-league-overview');
 await overview.getByTestId('hobby-tile-streetball').click();
 await overview.getByTestId('hobby-action-hobby-start-streetball-contest').click();
 const board=page.getByTestId('hobby-circuit-board');
 await expect(board).toContainText('LIVE CONTEST');
 for(const expected of [1,0,2]){
  const prompt=await board.getByText(/The defender overcommits|A teammate cuts|The opponent is tired/).innerText();
  const choice=prompt.startsWith('The defender')?1:prompt.startsWith('A teammate')?0:2;
  await board.getByTestId('hobby-choice-'+choice).click();
 }
 await expect(board).toHaveCount(0);
 await expect(overview.getByTestId('hobby-profile')).toContainText('OPPONENTS WHO KEEP IMPROVING');
 await expect(overview.getByTestId('hobby-last-result')).toContainText('3/3');
 await expect(overview).toContainText('TROPHIES');
});
test('hobbies fit 320px phones and have touch-friendly tactical choices',async({page})=>{
 for(const width of [320,375,430]){
  await page.setViewportSize({width,height:780});
  const s=hobbyPreparedLife(18200+width);
  await page.goto('/');
  await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);
  await page.reload();
  const overview=page.getByTestId('hobby-league-overview');
  await expect(overview).toBeVisible();
  let rect=await overview.boundingBox();
  expect(rect.width).toBeLessThanOrEqual(width+1);
  await overview.getByTestId('hobby-tile-photography').click();
  await overview.getByTestId('hobby-action-hobby-start-photography-practice').click();
  const board=page.getByTestId('hobby-circuit-board');
  rect=await board.boundingBox();expect(rect.width).toBeLessThanOrEqual(width+1);
  for(const c of await board.getByRole('button').all()){
   const b=await c.boundingBox();if(b)expect(b.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
test('hobby age gates present gardening first and preserve age advancement after abandoning training',async({page})=>{
 const s=hobbyPreparedLife(18005,6);
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 const overview=page.getByTestId('hobby-league-overview');
 await overview.getByTestId('hobby-tile-gardening').click();
 await expect(overview.getByTestId('hobby-action-hobby-start-gardening-practice')).toBeVisible();
 await expect(overview.getByTestId('hobby-action-hobby-start-gardening-contest')).toHaveCount(0);
 await overview.getByTestId('hobby-action-hobby-start-gardening-practice').click();
 await expect(page.getByTestId('active-hobby')).toBeVisible();
 await page.getByRole('button',{name:'Leave this hobby session'}).click();
 await expect(page.getByTestId('active-hobby')).toHaveCount(0);
 await expect(page.getByTestId('advance-year')).toBeEnabled();
});

test('players can commit to an ambition, advance actual milestones and restore progress',async({page})=>{
 let s=E.createLife({name:'Mia',seed:21501});s.age=15;s.stats.health=90;s.stats.stress=20;
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await expect(page.getByTestId('life-ambitions-board')).toBeVisible();
 await page.getByTestId('ambition-begin-wellness').click();
 await expect(page.getByTestId('active-life-ambition')).toContainText('Build a healthier life');
 await expect(page.getByTestId('ambition-milestone-0')).toContainText('0 / 3');
 await page.getByRole('button',{name:/^Exercise/}).click();
 await page.reload();
 await expect(page.getByTestId('active-life-ambition')).toContainText('Build a healthier life');
 await expect(page.getByTestId('ambition-milestone-0')).toContainText('1 / 3');
 await page.getByRole('button',{name:/^Exercise/}).click();
 await expect(page.getByTestId('ambition-milestone-0')).toContainText('2 / 3');
 await page.getByTestId('advance-year').click();
 if(await page.getByTestId('life-decision').count())await page.getByTestId('life-decision').getByRole('button').first().click();
 await page.getByRole('button',{name:/^Exercise/}).click();
 await expect(page.getByTestId('active-life-ambition')).toHaveCount(0);
 await expect(page.getByTestId('ambition-chronicle')).toContainText('Build a healthier life');
 await page.getByText('More',{exact:true}).click();
 await expect(page.getByTestId('ambition-recap')).toContainText('1 personal ambitions started');
});
test('ambition decisions become available only after two years, with saved path and no blocked life clock',async({page})=>{
 let s=E.createLife({name:'Nico',seed:21502});s.age=22;s.stats.health=32;s.stats.stress=70;s.cash=110000;
 s=E.act(s,'ambition:begin:wellness');
 for(let i=0;i<2;i++){s.pending=null;s=E.ageUp(s);if(s.pending!==null)s=E.resolve(s,0);}
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await expect(page.getByTestId('ambition-turn-steady')).toBeVisible();
 await expect(page.getByTestId('ambition-turn-bold')).toBeVisible();
 await page.getByTestId('ambition-turn-steady').click();
 await expect(page.getByTestId('active-life-ambition')).toContainText('steady path');
 await expect(page.getByTestId('ambition-turn-steady')).toHaveCount(0);
 await expect(page.getByTestId('advance-year')).toBeEnabled();
 await page.reload();
 await expect(page.getByTestId('active-life-ambition')).toContainText('steady path');
});
test('the personal ambitions board is readable and does not overflow narrow iPhone viewports',async({page})=>{
 for(const width of [320,375,430]){
  await page.setViewportSize({width,height:730});
  const s=E.createLife({name:'Kai',seed:21600+width});s.age=15;
  await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
  const board=page.getByTestId('life-ambitions-board');
  await expect(board).toBeVisible();
  let bounds=await board.boundingBox();
  expect(bounds.width).toBeLessThanOrEqual(width+1);
  await page.getByTestId('ambitions-browse').click();
  await expect(page.getByTestId('ambition-offer-community')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
test('expired ambitions remain readable in the life chronicle without blocking the player',async({page})=>{
 let s=E.createLife({name:'Iris',seed:21503});s.age=12;s.stats.knowledge=20;s.skills.technical=0;
 s=E.act(s,'ambition:begin:scholar');
 for(let i=0;i<6;i++){s.pending=null;s=E.ageUp(s);if(s.pending!==null)s=E.resolve(s,0);}
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await expect(page.getByTestId('active-life-ambition')).toHaveCount(0);
 await expect(page.getByTestId('ambition-chronicle')).toContainText('expired');
 await expect(page.getByTestId('advance-year')).toBeEnabled();
});
