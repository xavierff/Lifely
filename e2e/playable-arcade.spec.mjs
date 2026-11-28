import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('arcade active session resumes after reload and finishes on narrow display',async({page})=>{
 const s=E.createLife({seed:166101,name:'Arcade Life'});s.age=28;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByTestId('arcade-select-football').click();await page.getByTestId('arcade-start-football').click();await page.getByTestId('arcade-cell-0').click();
 await expect(page.getByTestId('arcade-active')).toContainText('Round 2 of 5');
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).arcade.active.round)).toBe(1);
 await page.reload();await expect(page.getByTestId('arcade-active')).toContainText('Round 2 of 5');
 for(let i=0;i<4;i++)await page.getByTestId('arcade-cell-0').click();
 await expect(page.getByTestId('arcade-overview')).toBeVisible();await expect(page.getByTestId('arcade-overview')).toContainText('1/2 sessions this year');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
