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
