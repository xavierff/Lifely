import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('chapter timeline stays readable at 320px and reflects age from saved game',async({page})=>{
 const s=E.createLife({seed:165001,name:'Chapter Life'});s.age=17;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await expect(page.getByTestId('chapter-progress')).toContainText('CHAPTER 3 OF 6');
 await expect(page.getByTestId('chapter-progress')).toContainText('Next chapter: Early adulthood');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
 s.age=18;await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await expect(page.getByTestId('chapter-progress')).toContainText('CHAPTER 4 OF 6');
 await expect(page.getByTestId('character-portrait')).toBeVisible();
});
