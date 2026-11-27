import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('appearance persists and NPC portraits appear on a narrow screen',async({page})=>{
 const s=E.createLife({seed:143101,name:'Alex'});s.age=17;s.actions=3;
 await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'More'}).click();const b=page.getByTestId('appearance-studio');await b.getByTestId('appearance-toggle').click();await b.getByTestId('appearance-skin-2').click();
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).appearance?.skin)).toBe(2);
 await page.reload();await page.getByRole('tab',{name:'More'}).click();await b.getByTestId('appearance-toggle').click();await expect(b.getByTestId('appearance-skin-2')).toHaveAttribute('aria-checked','true');
 await page.getByRole('tab',{name:'People'}).click();await expect(page.getByTestId('npc-portrait-'+s.people[0].id)).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
 await page.getByTestId('advance-year').click();await expect(page.getByTestId('milestone-celebration')).toContainText('Reached age 18');await page.getByTestId('milestone-dismiss').click();await expect(page.getByTestId('milestone-celebration')).toHaveCount(0);
 await page.reload();await expect(page.getByTestId('milestone-celebration')).toHaveCount(0);
});

test('onboarding preview and selected appearance carry into the new life',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto('/');
 await page.getByLabel('Character name').fill('Lina');
 const b=page.getByTestId('appearance-studio');await b.getByTestId('appearance-toggle').click();await b.getByTestId('appearance-clothes-3').click();
 await page.getByRole('button',{name:'Begin my life'}).click();
 await expect(page.getByTestId('character-portrait')).toBeVisible();
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2'))?.appearance?.clothes)).toBe(3);
});
