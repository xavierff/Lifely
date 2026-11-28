import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {globalMarketYear} from '../src/content/global-markets.mjs';
test('investment purchase persists on a 320px screen',async({page})=>{
 let s=E.createLife({seed:158101});s.age=34;s.cash=2000000;s.actions=3;s.market=1;
 globalMarketYear(s,{country:v=>E.countries[v.country],add:()=>{},roll:()=>.5});
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Money'}).click();await page.getByTestId('globalmarket:buy:equity').click();
 await expect(page.getByTestId('investment-fund-equity')).toContainText('10 units');
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).globalMarkets.holdings.equity.units)).toBe(10);
 await page.reload();await page.getByRole('tab',{name:'Money'}).click();await expect(page.getByTestId('investment-fund-equity')).toContainText('10 units');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
