import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('sandbox mode survives reload and sandbox action stays isolated from player collection',async({page})=>{
 const s=E.createLife({seed:168101,name:'Sandbox Life',mode:'sandbox'});s.age=30;s.cash=100000;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByTestId('replay-board')).toContainText('Sandbox life');await page.getByTestId('replay:grant').click();
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).cash)).toBe(125000);
 await page.reload();await page.getByRole('tab',{name:'More'}).click();await expect(page.getByTestId('replay-board')).toContainText('Sandbox life');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
test('random draft can be previewed before creating a life',async({page})=>{await page.goto('/');await page.getByTestId('mode-hardcore').click();await page.getByTestId('random-life').click();await expect(page.getByTestId('mode-hardcore')).toContainText('Selected');await expect(page.getByText(/Starting draft:/)).toBeVisible();});
