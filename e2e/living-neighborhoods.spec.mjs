import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {internationalYear} from '../src/content/international-life.mjs';
import {neighborhoodYear} from '../src/content/living-neighborhoods.mjs';
test('neighborhood move persists at 320px',async({page})=>{
 const s=E.createLife({seed:160101,country:0});s.age=34;s.cash=2000000;s.actions=3;
 const ctx={countries:E.countries,careers:E.careers,add:()=>{},change:()=>{},bond:()=>{},roll:()=>.99};internationalYear(s,ctx);neighborhoodYear(s,ctx);
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'World'}).click();await page.getByTestId('neighborhood-district-commons').click();await page.getByTestId('neighborhood:move:commons').click();await expect(page.getByTestId('neighborhood-district-commons')).toContainText('Your home');
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).neighborhoods.district)).toBe('commons');await page.reload();await page.getByRole('tab',{name:'World'}).click();await expect(page.getByTestId('neighborhood-district-commons')).toContainText('Your home');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
