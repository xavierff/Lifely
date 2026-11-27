import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {examQuestion} from '../src/content/academic-challenges.mjs';
import {drillRound} from '../src/content/hobby-drills.mjs';
async function load(page,s){await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();}
test('academic exam saves answers and displays graded record on narrow screen',async({page})=>{
 let s=E.createLife({seed:146101});s.age=14;s.actions=3;s=E.act(s,'scene:start:exam:olympiad');await load(page,s);
 for(let i=0;i<3;i++){const q=examQuestion(s.everydayScenes.active);await page.getByTestId('exam-answer-'+q.correct).click();s=E.sceneChoice(s,q.correct);if(i===0){await expect(page.getByTestId('academic-exam')).toContainText('QUESTION 2/3');await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).everydayScenes.active.stage)).toBe(1);await page.reload();}}
 await expect(page.getByTestId('academic-exam')).toHaveCount(0);await page.getByRole('tab',{name:'Work'}).click();await expect(page.getByTestId('academic-record')).toContainText('Gold medal');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
test('chess drill board accepts legal destination and preserves progress',async({page})=>{
 let s=E.createLife({seed:146102});s.age=19;s.actions=3;s=E.act(s,'hobby:start:chess:drill');await load(page,s);const q=drillRound(s.hobbyCircuit.active);const b=page.getByTestId('hobby-skill-drill');await b.getByRole('button',{name:q.options[q.ideal][0]+', choose destination'}).click();
 await expect(page.getByTestId('hobby-circuit-board')).toContainText('ROUND 2 OF 3');await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).hobbyCircuit.active.stage)).toBe(1);await page.reload();await expect(page.getByTestId('hobby-skill-drill')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
