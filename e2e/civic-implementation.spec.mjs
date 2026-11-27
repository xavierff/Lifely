import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {socialCirclesYear,socialCirclesInheritance} from '../src/content/social-circles.mjs';
import {organizationNetworkYear,organizationNetworkInheritance} from '../src/content/organization-relations.mjs';
import {publicAftermathYear,publicAftermathInheritance} from '../src/content/public-aftermath.mjs';
import {playableEventsInheritance} from '../src/content/playable-public-events.mjs';
import {civicMandatesYear,civicMandatesInheritance} from '../src/content/civic-mandates.mjs';
import {civicImplementationYear,civicImplementationInheritance} from '../src/content/civic-implementation.mjs';
const silent=()=>{};
function life(seed=126101,kind='community'){
 let s=E.createLife({seed,name:'Alex'});s.age=30;s.actions=3;
 for(const p of s.people){
  p.world.trust=72;p.world.rivalry=8;p.world.cash=9000;p.world.debt=0;
  p.world.ambition='Family life';
 }
 socialCirclesYear(s,{add:silent});
 s=E.act(s,'circle:'+s.socialCircles.invites[0].id+':2');
 s.age=31;s.actions=3;
 if(kind==='community')s.people[1].world.ambition='Community service';
 else if(kind==='professional'){
  s.people[1].world.job=0;s.job={id:0,level:0,experience:0};
 }
 socialCirclesYear(s,{add:silent});organizationNetworkYear(s,{add:silent});
 const mode=kind==='professional'?'competition':'festival';
 const c=E.playableEventCommands(s).find(c=>c.id.endsWith(':'+mode));
 s=E.act(s,c.id);
 for(let i=0;i<3;i++)s=E.playableEventDecision(s,0);
 publicAftermathYear(s,{add:silent});civicMandatesYear(s,{add:silent});
 for(let i=0;i<8;i++){
  s.age++;s.actions=3;
  socialCirclesYear(s,{add:silent});organizationNetworkYear(s,{add:silent});
  publicAftermathYear(s,{add:silent});civicMandatesYear(s,{add:silent});
  civicImplementationYear(s,{add:silent});
 }
 if(!s.civicImplementation.active||!E.validate(s))throw Error('Invalid policy delivery fixture');
 return s;
}
function advance(s,n){
 for(let i=0;i<n;i++){
  s.age++;s.actions=3;socialCirclesYear(s,{add:silent});
  organizationNetworkYear(s,{add:silent});publicAftermathYear(s,{add:silent});
  civicMandatesYear(s,{add:silent});civicImplementationYear(s,{add:silent});
 }
 return s;
}
async function restore(page,s){
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
}
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));

test('audit an actual six-year family-care policy, preserve measurable changes and reload safely',async({page})=>{
 const s=advance(life(126102),2);
 await restore(page,s);
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('policy-delivery-board');
 await expect(board).toContainText('Deliver what the organizations promised');
 await expect(board.getByTestId('policy-delivery-active')).toContainText('Family care & neighborhood support');
 await expect(board).toContainText('Implementation progress');
 await expect(board).toContainText('Delivery quality');
 await expect(board).toContainText('Opposition');
 await board.getByTestId('policy-delivery-choice-0').click();
 await expect(board.getByTestId('policy-delivery-history')).toContainText('Progress +7');
 await page.reload();await page.getByRole('tab',{name:'World'}).click();
 await expect(page.getByTestId('policy-delivery-history')).toContainText('YOUR MEASURABLE CONTRIBUTIONS');
 const n=await saved(page);
 expect(n.civicImplementation.active.pending).toBe(false);
 expect(n.civicImplementation.active.choices[0].tag).toBe('audit');
 expect(n.people[0].world.trust).toBe(s.people[0].world.trust+3);
 expect(n.people[1].world.trust).toBe(s.people[1].world.trust+3);
 expect(n.actions).toBe(2);
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('professional contribution is accessible from Work and adds only real volunteer records',async({page})=>{
 const s=advance(life(126103,'professional'),2);
 await restore(page,s);await page.getByRole('tab',{name:'Work'}).click();
 const preview=page.getByTestId('policy-delivery-preview');
 await expect(preview).toContainText('Apprenticeship & skills access');
 await preview.getByTestId('policy-delivery-choice-2').click();
 await expect(preview.getByTestId('policy-delivery-partnership')).toContainText('Professional volunteer contribution');
 const n=await saved(page);
 expect(n.civicImplementation.active.partnerships[0].kind).toBe('volunteer-project');
 expect(n.job.id).toBe(s.job.id);
 expect(n.stats.performance).toBe(s.stats.performance+2);
 expect(n.business).toBeNull();
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('a favoritism decision raises opposition and changes actual opposing leader rivalry',async({page})=>{
 const s=advance(life(126104),2);
 await restore(page,s);await page.getByRole('tab',{name:'World'}).click();
 await page.getByTestId('policy-delivery-board').getByTestId('policy-delivery-choice-1').click();
 const n=await saved(page);
 expect(n.civicImplementation.active.choices[0].tag).toBe('prioritize');
 expect(n.civicImplementation.active.opposition).toBe(s.civicImplementation.active.opposition+11);
 expect(n.people[1].world.rivalry).toBe(s.people[1].world.rivalry+6);
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('choosing to stay independent does not change any player, NPC, group or business value',async({page})=>{
 const s=advance(life(126105),2);
 await restore(page,s);await page.getByRole('tab',{name:'World'}).click();
 await page.getByTestId('policy-delivery-board').getByTestId('policy-delivery-choice-3').click();
 const n=await saved(page);
 expect(n.civicImplementation.active.choices[0].tag).toBe('independent');
 expect(n.stats).toEqual(s.stats);
 expect(n.people).toEqual(s.people);
 expect(n.socialCircles.groups).toEqual(s.socialCircles.groups);
 expect(n.organizationNetwork.links).toEqual(s.organizationNetwork.links);
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('delivered policy enters the Life Chronicle and descendants inherit memories rather than contracts',async({page})=>{
 let old=life(126106);
 old.civicImplementation.active.progress=78;
 old.civicImplementation.active.deliveryQuality=80;
 old.civicImplementation.active.opposition=20;
 old=advance(old,6);
 expect(old.civicImplementation.completed[0].result).toBe('delivered');
 await restore(page,old);await page.getByRole('tab',{name:'World'}).click();
 await expect(page.getByTestId('policy-delivery-archive')).toContainText('DELIVERED');
 await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByTestId('chronicle-timeline')).toContainText('Policy delivery: Family care');
 const heir=E.createLife({seed:126107,name:'Rowan'});heir.age=18;heir.generation=2;
 socialCirclesInheritance(heir,old);organizationNetworkInheritance(heir,old);
 playableEventsInheritance(heir,old);publicAftermathInheritance(heir,old);
 civicMandatesInheritance(heir,old);civicImplementationInheritance(heir,old);
 await restore(page,heir);await page.getByRole('tab',{name:'World'}).click();
 await expect(page.getByTestId('policy-delivery-ancestors')).toContainText('GEN 1');
 const savedHeir=await saved(page);
 expect(savedHeir.civicImplementation.active).toBeNull();
 expect(savedHeir.civicImplementation.completed).toHaveLength(0);
 expect(savedHeir.civicImplementation.seen).toHaveLength(0);
 expect(E.validate(savedHeir)).toBe(true);
});
test('policies render in 320, 375 and 430px widths with disabled choices when activities are spent',async({page})=>{
 for(const width of [320,375,430]){
  const s=advance(life(126200+width),2);s.actions=0;
  await page.setViewportSize({width,height:745});
  await restore(page,s);
  await expect(page.getByTestId('policy-delivery-preview')).toBeVisible();
  await page.getByRole('tab',{name:'World'}).click();
  const board=page.getByTestId('policy-delivery-board');
  await expect(board).toBeVisible();
  const bounds=await board.boundingBox();
  expect(bounds.width).toBeLessThanOrEqual(width+2);
  await expect(board.getByTestId('policy-delivery-choice-0')).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
