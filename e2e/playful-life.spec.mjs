import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
function life(age,seed){const s=E.createLife({seed,name:'Alex'});s.age=age;s.pending=null;s.actions=3;return s;}
async function restore(page,s){await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();}
test('childhood adventure is playable, resumes from save and presents final result on 320px',async({page})=>{
 await page.setViewportSize({width:320,height:740});await restore(page,life(9,131101));
 const board=page.getByTestId('playful-life-board');await board.getByTestId('outing-expand').click();await board.getByTestId('outing-start-treasure').click();
 await expect(page.getByTestId('playful-outing')).toContainText('Schoolyard treasure hunt');
 await page.getByTestId('scene-choice-0').click();await page.reload();
 await expect(page.getByTestId('everyday-project')).toContainText('ROUND 2 OF 3');
 await page.getByTestId('scene-choice-1').click();await page.getByTestId('scene-choice-0').click();
 await expect(board.getByTestId('outing-latest-result')).toContainText('Schoolyard treasure hunt');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.actions).toBe(2);expect(saved.everydayScenes.classmates).toHaveLength(4);expect(E.validate(saved)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
test('adult life exposes career adventures and new tactical hobbies',async({page})=>{
 await restore(page,life(30,131102));
 const board=page.getByTestId('playful-life-board');await board.getByTestId('outing-expand').click();
 await expect(board.getByTestId('outing-start-career-mixer')).toBeVisible();
 await expect(board.getByTestId('outing-start-teen-crush')).toHaveCount(0);
 const hobbies=page.getByTestId('hobby-league-overview');await hobbies.getByTestId('hobby-tile-tabletennis').click();
 await hobbies.getByTestId('hobby-action-hobby-start-tabletennis-practice').click();
 await expect(page.getByTestId('active-hobby')).toContainText('Table tennis');
 await page.getByTestId('hobby-choice-0').click();await page.getByTestId('hobby-choice-1').click();await page.getByTestId('hobby-choice-2').click();
 await expect(hobbies.getByTestId('hobby-last-result')).toBeVisible();
});
