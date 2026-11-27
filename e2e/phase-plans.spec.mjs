import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('production crew selection locks, charges once, persists and leaves the direct camera controls usable',async({page})=>{
 let s=E.createLife({seed:145101});s.age=32;s.cash=50000;s.stats.creativity=95;s.skills.art=95;s.world.entertainment.path='Film director';s=E.act(s,'campaign:start:film');
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 const p=page.getByTestId('phase-plans');await p.getByTestId('phase-plan-technical').click();
 await expect(p).toContainText('Plan locked');await expect(p.getByTestId('phase-plan-ensemble')).toBeDisabled();
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).cash)).toBe(s.cash-320);
 await page.reload();await expect(p.getByTestId('phase-plan-technical')).toContainText('✓');
 await page.getByTestId('film-camera-2').click();await expect(page.getByTestId('playfield-history')).toContainText(/✓|×/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
