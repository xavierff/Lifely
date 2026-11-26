import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';

test('turning point, visual life history and future commitments survive reload',async({page})=>{
 const event=E.events.find(e=>e.arcStart&&e.followId);
 const life=E.createLife({seed:97402,name:'Avery'});
 life.age=event.min;life.pending=event.id;
 await page.goto('/');
 await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),life);
 await page.reload();
 await expect(page.getByTestId('life-decision')).toContainText(event.title);
 await page.getByTestId('life-decision').getByRole('button').first().click();
 const scene=page.getByTestId('turning-point-scene');
 await expect(scene).toContainText(event.title);
 await expect(scene).toContainText(event.choices[0].text);
 await expect(scene).toContainText('WHAT CHANGED NOW');
 await expect(scene).toContainText('WHAT CAN RETURN LATER');
 await expect(scene).toContainText('AGE '+(event.min+event.delay));
 await expect(page.getByTestId('chronicle-preview')).toBeVisible();
 await page.getByTestId('chronicle-scene-toggle').click();
 await expect(page.getByTestId('chronicle-scene-details')).toHaveCount(0);
 await page.reload();
 await expect(page.getByTestId('turning-point-scene')).toContainText(event.title);
 await page.getByRole('tab',{name:'More'}).click();
 const timeline=page.getByTestId('chronicle-timeline');
 await expect(timeline).toBeVisible();
 await expect(timeline).toContainText(event.title);
 await page.getByTestId('chronicle-filter-turning').click();
 await expect(timeline).toContainText(event.title);
 await page.getByTestId('chronicle-filter-people').click();
 await expect(page.getByTestId('chronicle-filter-people')).toBeVisible();
 await page.getByTestId('chronicle-filter-all').click();
});

test('chronicle stays within narrow phones with usable tap targets',async({page})=>{
 const event=E.events.find(e=>e.arcStart&&e.followId);
 for(const width of [320,375,430]){
  await page.setViewportSize({width,height:760});
  const life=E.createLife({seed:97400+width,name:'Noor'});
  life.age=event.min;life.pending=event.id;
  const saved=E.resolve(life,0);
  await page.goto('/');
  await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),saved);
  await page.reload();
  const scene=page.getByTestId('turning-point-scene');
  await expect(scene).toBeVisible();
  expect((await scene.boundingBox()).width).toBeLessThanOrEqual(width+1);
  await expect(page.getByTestId('chronicle-preview')).toBeVisible();
  expect((await page.getByTestId('chronicle-preview').boundingBox()).width).toBeLessThanOrEqual(width+1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
  const toggle=await page.getByTestId('chronicle-scene-toggle').boundingBox();
  expect(toggle.height).toBeGreaterThanOrEqual(44);
 }
});
