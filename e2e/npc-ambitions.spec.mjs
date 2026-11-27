import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {npcAmbitionYear} from '../src/content/npc-ambitions.mjs';

function life(seed,goal='Career success'){
 const s=E.createLife({seed,name:'Jamie'});s.age=28;s.actions=3;
 const parent=s.people[0];
 parent.world.ambition=goal;parent.world.debt=0;parent.world.cash=20000;
 npcAmbitionYear(s,{add:()=>{}});
 if(!E.validate(s))throw Error('Invalid NPC ambition browser fixture');
 return {s,parent};
}
const advance=(s,to)=>{
 while(s.age<to){s.age++;s.actions=3;npcAmbitionYear(s,{add:()=>{}});}
 return s;
};
test('NPC goals are visible and choices persist with measured real effects',async({page})=>{
 const {s,parent}=life(118101);
 const record=s.npcAmbitions.active[0];
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
 await expect(page.getByTestId('npc-ambitions-preview')).toContainText(parent.name);
 await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('npc-ambitions-board');
 await expect(board).toContainText('Build a lasting career');
 await board.getByTestId('npc-ambition-'+record.id).getByRole('button',{name:/Offer practical encouragement/}).click();
 const impact=page.getByTestId('npc-ambition-'+record.id).getByTestId('npc-ambition-impact');
 await expect(impact).toContainText('Trust +7');
 await expect(impact).toContainText('Plan +14');
 await expect(page.getByTestId('npc-ambition-'+record.id)).toContainText('PURSUING THEIR OWN LIFE');
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('npc-ambition-'+record.id)).toContainText('PURSUING THEIR OWN LIFE');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.npcAmbitions.active[0].decisions).toHaveLength(1);
 expect(saved.people[0].world.trust).toBe(parent.world.trust+7);
 expect(saved.actions).toBe(2);
 expect(E.validate(saved)).toBe(true);
});
test('real setbacks redirect NPC plans and are visible in the story cards',async({page})=>{
 let {s,parent}=life(118102);
 parent.world.debt=78000;parent.world.cash=50;
 s=advance(s,30);
 const arc=s.npcAmbitions.active[0];
 expect(arc.track).toBe('security');
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 const card=page.getByTestId('npc-ambition-'+arc.id);
 await expect(card).toContainText('Find financial breathing room');
 await expect(card.getByTestId('npc-ambition-pivot')).toContainText('financial pressure');
 await expect(card).toContainText('Their priorities changed');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.people[0].world.ambition).toBe('Financial security');
 expect(E.validate(saved)).toBe(true);
});
test('NPC achievements appear in life history and survive reload',async({page})=>{
 let {s,parent}=life(118103);
 const goal=s.npcAmbitions.active[0];goal.progress=98;
 parent.world.job=0;parent.world.level=1;
 s=advance(s,goal.startedAge+4);
 expect(s.npcAmbitions.completed.some(x=>x.id===goal.id)).toBe(true);
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('npc-ambitions-history')).toContainText('Build a lasting career');
 await expect(page.getByTestId('npc-ambitions-history')).toContainText('ACHIEVED');
 await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByTestId('chronicle-timeline')).toContainText('Build a lasting career');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.npcAmbitions.completed[0].ending).toBe('achieved');
 expect(saved.people[0].world.level).toBe(2);
 expect(E.validate(saved)).toBe(true);
});
test('NPC decision cards fit 320–430px devices and disable actions with no activities',async({page})=>{
 for(const width of [320,375,430]){
  const {s}=life(118200+width);s.actions=0;
  await page.setViewportSize({width,height:740});
  await page.goto('/');
  await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
  await page.reload();
  await expect(page.getByTestId('npc-ambitions-preview')).toBeVisible();
  await page.getByRole('tab',{name:'People'}).click();
  const board=page.getByTestId('npc-ambitions-board');
  await expect(board).toBeVisible();
  const bounds=await board.boundingBox();expect(bounds.width).toBeLessThanOrEqual(width+2);
  const first=page.getByTestId('npc-ambition-'+s.npcAmbitions.active[0].id);
  await expect(first.getByRole('button',{name:/Offer practical encouragement/})).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
