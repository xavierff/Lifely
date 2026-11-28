import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {internationalYear} from '../src/content/international-life.mjs';
test('domestic relocation persists at 320px',async({page})=>{
 const s=E.createLife({seed:159101,country:0});s.age=34;s.cash=2000000;s.actions=3;
 internationalYear(s,{countries:E.countries,careers:E.careers,add:()=>{},change:()=>{},bond:()=>{},roll:()=>.99});
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'World'}).click();await page.getByTestId('international-tab-move').click();await page.getByTestId('international-city-chicago').click();await page.getByTestId('international:move:chicago').click();
 await expect(page.getByTestId('international-life-board')).toContainText('Chicago, United States');
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).internationalLife.city)).toBe('chicago');
 await page.reload();await page.getByRole('tab',{name:'World'}).click();await expect(page.getByTestId('international-life-board')).toContainText('Chicago, United States');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
