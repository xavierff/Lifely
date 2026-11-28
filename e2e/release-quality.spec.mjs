import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('missing primary is recovered from backup and repaired explicitly',async({page})=>{
 const s=E.createLife({seed:164501,name:'Recovered Life'});s.age=34;
 await page.goto('/');await page.evaluate(v=>{localStorage.removeItem('lifely.save.v2');localStorage.setItem('lifely.save.v2.backup',JSON.stringify(v));},s);await page.reload();
 await expect(page.getByText('Recovered Life',{exact:true})).toBeVisible();await expect(page.getByRole('alert')).toContainText('Primary save missing');
 await page.getByRole('button',{name:'Retry save',exact:true}).click();
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')||'null')?.name)).toBe('Recovered Life');
});
test('money and settings section jumps work on narrow screen',async({page})=>{
 const s=E.createLife({seed:164502,name:'Navigation Life'});s.age=34;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Money'}).click();await page.getByTestId('jump-money-overview').click();
 await expect(page.getByText('Financial overview',{exact:true})).toBeInViewport();
 await page.getByRole('tab',{name:'More'}).click();await page.getByTestId('jump-more-settings').click();
 await expect(page.getByText('Save slots',{exact:true})).toBeInViewport();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
