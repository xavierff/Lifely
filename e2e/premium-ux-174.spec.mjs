import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('dashboard and journal remain usable on a narrow phone',async({page})=>{
 const s=E.createLife({seed:174101,name:'Dashboard Life'});s.age=30;s.actions=3;s.cash=50000;s.history.push({age:29,text:'A special family memory',kind:'people'},{age:30,text:'A creative achievement',kind:'achievement'});
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await expect(page.getByTestId('next-move-board')).toContainText('3/3');
 await page.getByTestId('journal-search').fill('special family');await expect(page.getByTestId('life-journal-board')).toContainText('1 matching memories');await expect(page.getByTestId('life-journal-board')).toContainText('A special family memory');
 await page.getByTestId('journal-filter-Milestones').click();await expect(page.getByTestId('life-journal-board')).toContainText('0 matching memories');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
