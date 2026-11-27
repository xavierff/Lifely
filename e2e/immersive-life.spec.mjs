import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('age portrait and annual recap persist and allow timeline navigation on 320px',async({page})=>{
 let s=E.createLife({seed:142101,name:'Alex'});s=E.ageUp(s);if(s.pending!==null)s=E.resolve(s,0);s=E.ageUp(s);if(s.pending!==null)s=E.resolve(s,0);
 await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await expect(page.getByTestId('character-portrait')).toBeVisible();const b=page.getByTestId('year-recap-board');
 await expect(b).toContainText('Age 1 → 2');await b.getByTestId('year-recap-expand').click();await b.getByTestId('year-recap-1').click();await expect(b).toContainText('Age 0 → 1');
 await page.reload();await expect(page.getByTestId('year-recap-board')).toContainText('Age 1 → 2');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
