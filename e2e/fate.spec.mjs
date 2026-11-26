import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {fateYear} from '../src/content/fate-threads.mjs';

function createArc(seed){
 let s=E.createLife({name:'Rina',seed});s.age=26;
 s=E.act(s,'friend');s.actions=3;
 const friend=s.people.find(x=>x.role==='friend');
 const cmd=E.commands(s).find(x=>x.id==='fate:start:person-'+friend.id);
 if(!cmd?.enabled)throw Error('Missing fate command');
 s=E.act(s,cmd.id);
 return {s,friend};
}
function stageThree(seed){
 let {s,friend}=createArc(seed);
 s=E.fateDecision(s,0);
 s.age=s.fate.active.dueAge;s.actions=3;fateYear(s,{add:()=>{}});
 s=E.act(s,'fate:continue');s=E.fateDecision(s,0);
 s.age=s.fate.active.dueAge;s.actions=3;fateYear(s,{add:()=>{}});
 return {s,friend};
}
test('character fate offer starts a real scene, saves choices and does not allow extra actions',async({page})=>{
 let base=E.createLife({name:'Noa',seed:11691});base.age=24;base=E.act(base,'friend');base.actions=3;
 const friend=base.people.find(x=>x.role==='friend');
 await page.goto('/');
 await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),base);
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 const library=page.getByTestId('fate-story-library');
 await expect(library).toBeVisible();
 await expect(library).toContainText(friend.name);
 await library.getByRole('button',{name:new RegExp('Explore a story with '+friend.name)}).click();
 const scene=page.getByTestId('fate-story-scene');
 await expect(scene).toContainText('CHAPTER 1/3');
 await expect(page.getByTestId('advance-year')).toBeDisabled();
 await expect(scene.getByTestId('fate-choice-0')).toBeVisible();
 await scene.getByTestId('fate-choice-0').click();
 await expect(scene).toHaveCount(0);
 await expect(page.getByTestId('fate-current-chapter')).toContainText('Years are passing');
 await expect(page.getByTestId('fate-impact-recap')).toContainText('Trust');
 await expect(page.getByTestId('advance-year')).toBeEnabled();
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('fate-current-chapter')).toContainText('Years are passing');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.fate.active.stage).toBe(1);
 expect(E.validate(saved)).toBe(true);
});
test('third chapter resolves into lasting relationship and visual life timeline',async({page})=>{
 const {s,friend}=stageThree(11692);
 await page.goto('/');
 await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),s);
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('fate-current-chapter')).toContainText('CHAPTER 3/3');
 await page.getByTestId('fate-continue').click();
 await expect(page.getByTestId('fate-story-scene')).toContainText('CHAPTER 3/3');
 await expect(page.getByTestId('fate-unexpected-turn')).toBeVisible();
 await page.getByTestId('fate-choice-0').click();
 await expect(page.getByTestId('fate-story-scene')).toHaveCount(0);
 await page.getByRole('tab',{name:'People'}).click();
 const ending=page.getByTestId('fate-story-endings');
 await expect(ending).toContainText(friend.name);
 await expect(ending).toContainText('Lifelong allies');
 await page.reload();
 await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByTestId('chronicle-timeline')).toContainText('The ');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(stored.fate.active).toBe(null);
 expect(stored.fate.completed.at(-1).ending).toBe('allies');
 expect(E.validate(stored)).toBe(true);
});

test('fate scene and optional story library fit 320, 375 and 430px phones',async({page})=>{
 for(const width of [320,375,430]){
  await page.setViewportSize({width,height:740});
  const {s}=createArc(11700+width);
  await page.goto('/');
  await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),s);
  await page.reload();
  const scene=page.getByTestId('fate-story-scene');
  await expect(scene).toBeVisible();
  const rect=await scene.boundingBox();
  expect(rect.width).toBeLessThanOrEqual(width+1);
  for(const choice of await scene.getByRole('button').all()){
   const bounds=await choice.boundingBox();if(bounds)expect(bounds.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
