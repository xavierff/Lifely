import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('select a friend for a group outing and resume a saved round on narrow phone',async({page})=>{
 const s=E.createLife({seed:173101,name:'Social Life'});s.age=30;s.actions=3;s.people[0].role='friend';s.people[1].role='friend';
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByTestId('outing-expand').click();await page.getByTestId('social-select-game-night').click();await page.getByTestId('social-start-game-night-'+s.people[1].id).click();
 await expect(page.getByTestId('everyday-project')).toContainText('Friends’ game night');
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).everydayScenes.active.personId)).toBe(s.people[1].id);
 await page.reload();await expect(page.getByTestId('everyday-project')).toContainText(s.people[1].name);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
