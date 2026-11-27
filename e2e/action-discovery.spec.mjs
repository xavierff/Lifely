import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('global finder searches, acts, and shows real feedback on a 320px screen',async({page})=>{
 const s=E.createLife({seed:141101,name:'Alex'});s.age=30;s.actions=3;s.stats.stress=50;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 const b=page.getByTestId('action-discovery');await b.getByTestId('action-finder-toggle').click();await b.getByTestId('action-finder-input').fill('rest');
 await b.getByTestId('finder-rest').click();await expect(b.getByTestId('action-receipt')).toContainText('2 actions left');await expect(b.getByTestId('action-receipt')).toContainText('stress -8');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));expect(saved.actions).toBe(2);expect(saved.stats.stress).toBe(42);expect(E.validate(saved)).toBe(true);
 await page.reload();await expect(page.getByTestId('action-discovery')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
