import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {dramas,dramaYear} from '../src/content/dramatic-stories.mjs';
import {branchingDramas} from '../src/content/branching-dramas.mjs';
test('branching story changes chapter and persists its specific remembered choice on a narrow display',async({page})=>{
 const s=E.createLife({seed:172101,name:'Branching Life'});s.age=30;s.actions=3;
 const available=[...dramas,...branchingDramas].filter(x=>s.age>=x.min&&s.age<=x.max&&s.people.some(p=>p.alive&&p.age>=8&&x.roles.includes(p.role)));
 const i=available.findIndex(x=>x.id==='unopened-box');dramaYear(s,{add:()=>{},roll:key=>key==='type'?(i+.5)/available.length:0});
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 const board=page.getByTestId('dramatic-story-board');await expect(board).toContainText('The hidden collection');await page.getByTestId('drama:choose:1').click();
 await expect(board).toContainText('A different chapter awaits');await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).dramaticStories.active.stage)).toBe(1);
 await page.reload();await expect(board).toContainText('Leave the box closed and respect their privacy');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));saved.age=saved.dramaticStories.active.due;saved.actions=3;await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),saved);await page.reload();
 await expect(board).toContainText('The sealed box');await expect(page.getByTestId('drama:choose:0')).toContainText('Ask about the dream');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
