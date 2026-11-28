import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {connectedPrepare,connectedBefore,connectedLedger} from '../src/content/connected-economy.mjs';
test('regional dashboard and reconciled cash report persist at 320px',async({page})=>{
 const s=E.createLife({seed:163101,country:0});s.age=34;s.cash=200000;s.actions=3;
 connectedPrepare(s,{countries:E.countries,add:()=>{},roll:()=>.5});const before=connectedBefore(s,E.worth);s.cash+=1700;connectedLedger(s,before,E.worth,1000,300);
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Money'}).click();await page.getByTestId('region-0').click();await expect(page.getByTestId('region-0')).toContainText('Policy rate');
 await page.getByTestId('connected-tab-ledger').click();await expect(page.getByTestId('connected-cash-report')).toContainText('$201,700');await expect(page.getByTestId('connected-cash-report')).toContainText('$1,700');
 await page.reload();await page.getByRole('tab',{name:'Money'}).click();await page.getByTestId('connected-tab-ledger').click();await expect(page.getByTestId('connected-cash-report')).toContainText('$201,700');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
