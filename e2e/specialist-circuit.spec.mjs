import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('specialist session and scoreboard persist at 320px',async({page})=>{
 let s=E.createLife({seed:162101,country:0});s.age=30;s.cash=100000;s.stats.health=95;s.actions=3;s=E.act(s,'profession:athlete');s.actions=3;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();await page.getByTestId('specialist:start:sports:0').click();
 await expect(page.getByTestId('specialist-circuit-board')).toContainText('Phase 2/3');
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).specialistCircuit.active.stage)).toBe(1);
 await page.reload();await page.getByRole('tab',{name:'Work'}).click();await page.getByTestId('specialist:play:0').click();await page.getByTestId('specialist:play:0').click();await expect(page.getByTestId('specialist-result-1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
