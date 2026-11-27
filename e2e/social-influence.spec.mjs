import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {npcAmbitionYear} from '../src/content/npc-ambitions.mjs';
import {competingFuturesYear} from '../src/content/competing-futures.mjs';
import {socialInfluenceYear,socialInfluenceInheritance} from '../src/content/social-influence.mjs';

const note=()=>{};
function sample(seed=120101,kind='professional',rival=false){
 let s=E.createLife({seed,name:'Noah'});s.age=29;s.actions=3;
 const p=s.people[0];p.world.trust=65;p.world.rivalry=rival?65:0;
 p.world.cash=9000;p.world.debt=0;
 if(kind==='professional'){
  p.world.ambition='Career success';p.world.job=0;s.job={id:0,level:0,experience:0};
 }else{p.world.ambition='Family life';}
 npcAmbitionYear(s,{add:note});competingFuturesYear(s,{add:note});
 const clash=s.competingFutures.active[0];
 if(!clash)throw Error('Fixture has no existing NPC collision');
 const index=rival?1:0;
 s=E.act(s,'clash:'+clash.id+':'+index);
 s.age+=2;s.actions=3;competingFuturesYear(s,{add:note});
 s=E.act(s,'clash:'+clash.id+':'+index);
 socialInfluenceYear(s,{add:note});
 if(!E.validate(s)||!s.socialInfluence.active)throw Error('Invalid influence fixture');
 return s;
}
const save=async(page,s)=>{
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
};
test('three earned reputation circles and a real professional opportunity survive a saved-life reload',async({page})=>{
 const s=sample(120102,'professional');
 await save(page,s);
 await expect(page.getByTestId('social-influence-preview')).toContainText('A professional connection opens a door');
 await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('social-influence-board');
 await expect(board).toContainText('Reputation & social influence');
 await expect(board.getByTestId('influence-standing-professional')).toContainText('Earned 60');
 await expect(board.getByTestId('influence-standing-family')).toContainText('Earned 50');
 await board.getByRole('button',{name:/Build a trusted professional introduction/}).click();
 await expect(page.getByTestId('social-influence-impact')).toContainText('Standing +5');
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('social-influence-history')).toContainText('EARNED');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(stored.socialInfluence.scores.professional).toBe(65);
 expect(stored.people[0].world.trust).toBe(s.people[0].world.trust+8);
 expect(stored.socialInfluence.active).toBeNull();
 expect(stored.socialInfluence.completed[0].ending).toBe('earned');
 expect(stored.actions).toBe(2);
 expect(E.validate(stored)).toBe(true);
});
test('accountability offers repair actual rivalry, without fabricated cash or employment',async({page})=>{
 const s=sample(120103,'professional',true);
 expect(s.socialInfluence.active.tone).toBe('repair');
 await save(page,s);
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('social-influence-board');
 await expect(board).toContainText('Your reputation needs repairing');
 await board.getByRole('button',{name:/Acknowledge your past choices/}).click();
 await expect(page.getByTestId('social-influence-impact')).toContainText('Standing +7');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(stored.socialInfluence.completed[0].ending).toBe('repaired');
 expect(stored.people[0].world.rivalry).toBe(s.people[0].world.rivalry-7);
 expect(stored.cash).toBe(s.cash);
 expect(stored.job.id).toBe(s.job.id);
 expect(E.validate(stored)).toBe(true);
});
test('declining a family reputation invitation preserves player and NPC stats',async({page})=>{
 const s=sample(120104,'family');
 await save(page,s);
 await page.getByRole('tab',{name:'People'}).click();
 await page.getByTestId('social-influence-offer').getByRole('button',{name:/Respect their independent plans/}).click();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(stored.socialInfluence.completed[0].ending).toBe('independent');
 expect(stored.socialInfluence.scores.family).toBe(s.socialInfluence.scores.family);
 expect(stored.people[0].world.trust).toBe(s.people[0].world.trust);
 expect(stored.people[0].bond).toBe(s.people[0].bond);
 expect(stored.cash).toBe(s.cash);
 expect(stored.stats).toEqual(s.stats);
 expect(E.validate(stored)).toBe(true);
});
test('significant social standing appears in the Life Chronicle and ancestral memories',async({page})=>{
 let s=sample(120105,'professional');const id=s.socialInfluence.active.id;
 s=E.act(s,'influence:'+id+':0');
 await save(page,s);
 await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByTestId('chronicle-timeline')).toContainText('A professional connection opens a door');
 const next=E.createLife({seed:120106,name:'Maya'});
 next.generation=2;socialInfluenceInheritance(next,s);
 expect(E.validate(next)).toBe(true);
 await save(page,next);
 await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('social-influence-board');
 await expect(board.getByTestId('social-influence-legacy')).toContainText('GEN 1');
 await expect(board.getByTestId('influence-standing-professional')).toContainText('Family-name echo +');
 const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(restored.socialInfluence.legacy.name).toBe('Noah');
 expect(restored.socialInfluence.active).toBeNull();
 expect(restored.socialInfluence.scores.professional).toBe(50);
 expect(E.validate(restored)).toBe(true);
});
test('reputation UI remains within 320px, 375px and 430px viewports; actions disable with zero activities',async({page})=>{
 for(const width of [320,375,430]){
  const s=sample(120200+width,'professional');s.actions=0;
  await page.setViewportSize({width,height:740});
  await save(page,s);
  await expect(page.getByTestId('social-influence-preview')).toBeVisible();
  await page.getByRole('tab',{name:'People'}).click();
  const board=page.getByTestId('social-influence-board');
  await expect(board).toBeVisible();
  const bounds=await board.boundingBox();expect(bounds.width).toBeLessThanOrEqual(width+2);
  await expect(board.getByRole('button',{name:/Build a trusted professional introduction/})).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
