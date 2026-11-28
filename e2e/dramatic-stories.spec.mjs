import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {dramaYear} from '../src/content/dramatic-stories.mjs';
test('childhood drama choices and waiting chapter survive reload at 320px',async({page})=>{
 const s=E.createLife({seed:167101,name:'Story Life'});s.age=12;s.actions=3;dramaYear(s,{add:()=>{},roll:()=>0});
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await expect(page.getByTestId('dramatic-story-board')).toContainText('The Notebook in the Attic');
 await page.getByTestId('drama:choose:0').click();await expect(page.getByTestId('dramatic-story-board')).toContainText('CHAPTER 2 OF 3');
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).dramaticStories.active.stage)).toBe(1);
 await page.reload();await expect(page.getByTestId('dramatic-story-board')).toContainText('WAITING');await expect(page.getByTestId('dramatic-story-board')).toContainText('Ask to hear the story');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
