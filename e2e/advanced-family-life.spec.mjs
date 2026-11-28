import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {familyLifeYear} from '../src/content/advanced-family-life.mjs';
test('family tradition persists on a 320px screen',async({page})=>{
 const s=E.createLife({seed:161101,country:0});s.age=38;s.cash=2000000;s.actions=3;
 familyLifeYear(s,{country:v=>E.countries[v.country],careers:E.careers,add:()=>{},change:()=>{},bond:()=>{},roll:()=>.99});
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'People'}).click();await page.getByTestId('familylife-tab-traditions').click();await page.getByTestId('familylife:tradition:stories').click();
 await expect(page.getByTestId('advanced-family-board')).toContainText('Family storytelling');
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).familyLife.tradition)).toBe('stories');await page.reload();await page.getByRole('tab',{name:'People'}).click();await page.getByTestId('familylife-tab-traditions').click();await expect(page.getByTestId('advanced-family-board')).toContainText('Family storytelling');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
