import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('film production resumes a saved stage and finishes on a narrow phone',async({page})=>{
 const s=E.createLife({seed:171101,name:'Film Life'});s.age=30;s.cash=100000;s.world.entertainment.path='Film director';s.world.entertainment.fame=70;s.stats.creativity=100;s.skills.art=100;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'World'}).click();await page.getByTestId('production:start:standard').click();
 await page.getByTestId('production-choice-ensemble').click();await expect(page.getByTestId('creative-production-active')).toContainText('Stage 2/4');
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).creativeProductions.active.stage)).toBe(1);
 await page.reload();await expect(page.getByTestId('creative-production-active')).toContainText('Stage 2/4');
 await page.getByTestId('production-choice-rehearse').click();await page.getByTestId('production-choice-polish').click();await page.getByTestId('production-choice-festival').click();
 await expect(page.getByTestId('creative-production-active')).toHaveCount(0);
 await page.getByRole('tab',{name:'World'}).click();await expect(page.getByTestId('creative-production-board')).toContainText('1 successful releases');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
