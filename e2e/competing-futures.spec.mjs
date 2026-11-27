import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {npcAmbitionYear} from '../src/content/npc-ambitions.mjs';
import {competingFuturesYear} from '../src/content/competing-futures.mjs';

const noop=()=>{};
function sharedLife(seed,kind='career'){
 const s=E.createLife({seed,name:'Avery'});s.age=29;s.actions=3;
 const parent=s.people[0];parent.world.trust=65;parent.world.rivalry=0;
 parent.world.cash=10000;parent.world.debt=0;
 if(kind==='career'){parent.world.ambition='Career success';parent.world.job=0;
  s.job={id:0,level:0,experience:0};
 }else if(kind==='family'){parent.world.ambition='Financial security';parent.world.debt=17000;s.cash=400;
 }else{
  s.people=[];s.business={sector:'shop',capital:15000,quality:60,demand:52};
  s.world.autonomy={version:1,alumni:[{id:'alumni-founder',name:'Morgan',age:29,trust:67,rivalry:12,preference:2,
   connection:'former classmate',status:'friends',profession:'Founder',ambition:'Career success',
   collaborations:0,contests:0,lastInteractionAge:-1,partnerId:null,children:0,careerLevel:1,
   location:'hometown',history:[],schoolAge:12
  }],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 }
 npcAmbitionYear(s,{add:noop});competingFuturesYear(s,{add:noop});
 if(!E.validate(s))throw Error('Browser fixture must validate');
 return s;
}
const nextYears=(s,count)=>{for(let i=0;i<count;i++){
 s.age++;s.actions=3;
 competingFuturesYear(s,{add:noop});
}return s;};

test('career rivals offer a real decision with consequences that survive saved-game reload',async({page})=>{
 const s=sharedLife(119101,'career'),clash=s.competingFutures.active[0];
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
 await expect(page.getByTestId('competing-futures-preview')).toContainText('Rivals for the same career path');
 await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('competing-futures-board');
 await expect(board).toContainText('Rivals for the same career path');
 await board.getByTestId('future-collision-'+clash.id).getByRole('button',{name:/Share expertise fairly/}).click();
 await expect(page.getByTestId('future-collision-impact')).toContainText('Trust +8');
 await expect(board).toContainText('TWO LIVES MOVING FORWARD');
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('future-collision-'+clash.id)).toContainText('TWO LIVES MOVING FORWARD');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.competingFutures.active[0].decisions).toHaveLength(1);
 expect(saved.people[0].world.trust).toBe(s.people[0].world.trust+8);
 expect(saved.stats.performance).toBe(s.stats.performance+2);
 expect(saved.actions).toBe(2);expect(saved.rng).toBe(s.rng);
 expect(E.validate(saved)).toBe(true);
});

test('a business alliance changes actual demand and appears in the Work tab',async({page})=>{
 const s=sharedLife(119102,'business'),clash=s.competingFutures.active[0];
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();
 const preview=page.getByTestId('competing-futures-preview');
 await expect(preview).toContainText('A business relationship at a crossroads');
 await preview.getByTestId('future-collision-'+clash.id).getByRole('button',{name:/Propose a fair collaboration/}).click();
 await expect(page.getByTestId('future-collision-impact')).toContainText('Demand +5');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.business.demand).toBe(57);
 expect(saved.world.autonomy.alumni[0].trust).toBe(74);
 expect(saved.cash).toBe(s.cash);
 expect(E.validate(saved)).toBe(true);
});

test('family financial commitment transfers existing money and blocks unaffordable payments',async({page})=>{
 const s=sharedLife(119103,'family'),clash=s.competingFutures.active[0];
 s.cash=190;
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 const card=page.getByTestId('future-collision-'+clash.id);
 await expect(card.getByRole('button',{name:/Transfer \$200 from your own cash/})).toBeDisabled();
 await expect(card.getByRole('button',{name:/Respect their decision/})).toBeEnabled();
 s.cash=400;
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 await page.getByTestId('future-collision-'+clash.id)
  .getByRole('button',{name:/Transfer \$200 from your own cash/}).click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.cash).toBe(200);
 expect(saved.people[0].world.cash).toBe(10200);
 expect(saved.cash+saved.people[0].world.cash).toBe(10400);
 expect(saved.competingFutures.active[0].decisions[0].cashDelta).toBe(-200);
 expect(E.validate(saved)).toBe(true);
});

test('two years later a career alliance concludes and enters the Life Chronicle',async({page})=>{
 let s=sharedLife(119104,'career'),clash=s.competingFutures.active[0];
 const action=E.commands(s).find(c=>c.id==='clash:'+clash.id+':0');
 s=E.act(s,action.id);
 s=nextYears(s,2);
 expect(s.competingFutures.active[0].status).toBe('ready');
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('competing-futures-board');
 await expect(board).toContainText('YEARS LATER');
 await board.getByRole('button',{name:/Rebuild the professional alliance/}).click();
 await expect(page.getByTestId('competing-futures-archive')).toContainText('ALLIANCE');
 await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByTestId('chronicle-timeline')).toContainText('Rivals for the same career path');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.competingFutures.active).toHaveLength(0);
 expect(saved.competingFutures.completed[0].ending).toBe('alliance');
 expect(E.validate(saved)).toBe(true);
});

test('320–430px layouts remain within the viewport and disabling activities disables choices',async({page})=>{
 for(const width of [320,375,430]){
  const s=sharedLife(119200+width,'career');s.actions=0;
  await page.setViewportSize({width,height:740});
  await page.goto('/');
  await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
  await page.reload();
  await expect(page.getByTestId('competing-futures-preview')).toBeVisible();
  await page.getByRole('tab',{name:'People'}).click();
  const board=page.getByTestId('competing-futures-board');
  await expect(board).toBeVisible();
  const bounds=await board.boundingBox();expect(bounds.width).toBeLessThanOrEqual(width+2);
  await expect(board.getByRole('button',{name:/Share expertise fairly/})).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
