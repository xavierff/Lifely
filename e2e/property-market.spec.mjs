import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {propertyMarketYear} from '../src/content/property-market.mjs';
test('mortgage acquisition and portfolio persist at 320px',async({page})=>{
 let s=E.createLife({seed:157101});s.age=34;s.cash=2000000;s.actions=3;s.market=1;
 propertyMarketYear(s,{country:v=>E.countries[v.country],add:()=>{},roll:(i,t)=>t==='kind'?0:.99});
 const p=s.propertyMarket.properties[0],id=p.id;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Money'}).click();await page.getByTestId('property-open-'+id).click();await page.getByTestId('propertymarket:mortgage:'+id).click();
 await page.getByTestId('property-filter-owned').click();await expect(page.getByTestId('market-property-'+id)).toContainText('Mortgage');
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).propertyMarket.properties[0].playerOwned)).toBe(true);
 await page.reload();await page.getByRole('tab',{name:'Money'}).click();await page.getByTestId('property-filter-owned').click();await expect(page.getByTestId('market-property-'+id)).toContainText(p.name);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
