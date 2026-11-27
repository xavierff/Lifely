import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {socialCirclesYear,socialCirclesInheritance} from '../src/content/social-circles.mjs';
import {organizationNetworkYear,organizationNetworkInheritance} from '../src/content/organization-relations.mjs';
import {playableEventsInheritance} from '../src/content/playable-public-events.mjs';
import {publicAftermathYear,publicAftermathInheritance} from '../src/content/public-aftermath.mjs';
const silent=()=>{};
function life(seed=124101,mode='festival',choices=[0,0,0],kind='community'){
 let s=E.createLife({seed,name:'Alex'});s.age=30;s.actions=3;
 for(const p of s.people){
  p.world.trust=72;p.world.rivalry=8;p.world.cash=9000;
  p.world.debt=0;p.world.ambition='Family life';
 }
 socialCirclesYear(s,{add:silent});
 s=E.act(s,'circle:'+s.socialCircles.invites[0].id+':2');
 s.age=31;s.actions=3;
 if(kind==='community')s.people[1].world.ambition='Community service';
 else if(kind==='professional'){s.people[1].world.job=0;s.job={id:0,level:0,experience:0};}
 socialCirclesYear(s,{add:silent});organizationNetworkYear(s,{add:silent});
 const c=E.playableEventCommands(s).find(c=>c.id.endsWith(':'+mode));
 if(!c?.enabled)throw Error('Missing public event for fixture');
 s=E.act(s,c.id);
 for(const index of choices)s=E.playableEventDecision(s,index);
 publicAftermathYear(s,{add:silent});
 if(!E.validate(s))throw Error('Invalid complete public-event fixture');
 return s;
}
const advance=(s,years)=>{for(let i=0;i<years;i++){
 s.age++;s.actions=3;
 socialCirclesYear(s,{add:silent});organizationNetworkYear(s,{add:silent});
 publicAftermathYear(s,{add:silent});
}return s;};
async function save(page,s){
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
}
const getSaved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));

test('festival consequences are visible over decades, with a real NPC returning for an optional choice',async({page})=>{
 const s=advance(life(124102),3),t=s.publicAftermath.threads[0];
 expect(t.pending).toBe(true);
 await save(page,s);
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('public-aftermath-board');
 await expect(board).toContainText('Choices that echo for decades');
 const story=board.getByTestId('aftermath-thread-'+t.id);
 await expect(story).toContainText('The festival that brought the community together');
 await expect(story).toContainText(t.aName);
 await expect(story).toContainText(t.bName);
 await expect(story.getByTestId('aftermath-invitation')).toBeVisible();
 await story.getByTestId('aftermath-choice-0').click();
 await expect(story.getByTestId('aftermath-choices-history')).toContainText('Group standing');
 await page.reload();await page.getByRole('tab',{name:'World'}).click();
 await expect(page.getByTestId('public-aftermath-board')).toContainText('THE YEARS BETWEEN CHOICES');
 const next=await getSaved(page);
 expect(next.publicAftermath.threads[0].pending).toBe(false);
 expect(next.publicAftermath.threads[0].decisions[0].tag).toBe('repair');
 expect(next.people[0].world.trust).toBe(s.people[0].world.trust+7);
 expect(next.people[1].world.trust).toBe(s.people[1].world.trust+7);
 expect(next.actions).toBe(2);
 expect(next.cash).toBe(s.cash);
 expect(E.validate(next)).toBe(true);
});
test('an election loser can grow into a long-term rival, not vanish when voting ends',async({page})=>{
 const s=advance(life(124103,'election',[1,1,1]),3),t=s.publicAftermath.threads[0];
 expect(t.kind).toBe('election-rivalry');
 await save(page,s);
 await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('public-aftermath-preview');
 await expect(board).toContainText('LEADERSHIP RIVALRY');
 await expect(board).toContainText(t.aName);
 await expect(board).toContainText(t.bName);
 await board.getByTestId('aftermath-choice-1').click();
 const n=await getSaved(page);
 expect(n.publicAftermath.threads[0].decisions[0].tag).toBe('polarize');
 expect(n.publicAftermath.threads[0].friction).toBeGreaterThan(s.publicAftermath.threads[0].friction);
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('professional competitors can form a real long-term partnership without invented income',async({page})=>{
 const s=advance(life(124104,'competition',[0,0,0],'professional'),3);
 await save(page,s);
 await page.getByRole('tab',{name:'Work'}).click();
 const board=page.getByTestId('public-aftermath-preview');
 await expect(board).toContainText('PROFESSIONAL PARTNERSHIP');
 await board.getByTestId('aftermath-choice-0').click();
 await expect(board.getByTestId('aftermath-partnership')).toContainText('Professional collaboration');
 const n=await getSaved(page);
 expect(n.publicAftermath.threads[0].partnership).toBe('joint-project');
 expect(n.job.id).toBe(s.job.id);
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('neutral follow-up does not create player wealth or alter people and organizations',async({page})=>{
 const s=advance(life(124105),3);
 await save(page,s);
 await page.getByRole('tab',{name:'World'}).click();
 await page.getByTestId('public-aftermath-board').getByTestId('aftermath-choice-2').click();
 const n=await getSaved(page);
 expect(n.publicAftermath.threads[0].decisions[0].tag).toBe('independent');
 expect(n.people).toEqual(s.people);
 expect(n.stats).toEqual(s.stats);
 expect(n.socialCircles.groups).toEqual(s.socialCircles.groups);
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('ancestral public memories survive while personal NPC relationships do not transfer',async({page})=>{
 let old=life(124106);old=advance(old,3);old=E.act(old,
  E.publicAftermathCommands(old).find(c=>c.id.endsWith(':0')).id);
 const heir=E.createLife({seed:124107,name:'Rowan'});heir.age=18;heir.generation=2;
 socialCirclesInheritance(heir,old);organizationNetworkInheritance(heir,old);
 playableEventsInheritance(heir,old);publicAftermathInheritance(heir,old);
 await save(page,heir);
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('public-aftermath-board');
 await expect(board.getByTestId('aftermath-ancestors')).toContainText('GENERATION 1');
 await expect(board).toContainText('No long-running public relationships yet');
 const stored=await getSaved(page);
 expect(stored.publicAftermath.threads).toHaveLength(0);
 expect(stored.publicAftermath.archive).toHaveLength(0);
 expect(stored.publicAftermath.seen).toHaveLength(0);
 expect(E.validate(stored)).toBe(true);
});
test('the long-term outcome board fits 320, 375, and 430px without horizontal overflow',async({page})=>{
 for(const width of [320,375,430]){
  const s=advance(life(124200+width),3);s.actions=0;
  await page.setViewportSize({width,height:750});
  await save(page,s);
  await expect(page.getByTestId('public-aftermath-preview')).toBeVisible();
  await page.getByRole('tab',{name:'World'}).click();
  const board=page.getByTestId('public-aftermath-board');
  await expect(board).toBeVisible();
  const bounds=await board.boundingBox();
  expect(bounds.width).toBeLessThanOrEqual(width+2);
  await expect(board.getByTestId('aftermath-choice-0')).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
