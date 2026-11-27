import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {economyYear} from '../src/content/living-economy.mjs';
test('CEO management persists across reload at 320px',async({page})=>{
 let s=E.createLife({seed:156101});s.age=34;s.cash=1000000;s.actions=3;s.market=1;s.education=3;s.stats.knowledge=100;
 const p=s.people[0];p.age=45;p.world.cash=500000;p.world.job=0;
 economyYear(s,{country:v=>E.countries[v.country],careers:E.careers,add:()=>{},roll:(i,t)=>t==='found'&&i===p.id?0:.99});
 const id=s.livingEconomy.companies[0].id;s=E.act(s,'economy:buy:'+id);s.actions=3;s.livingEconomy.companies[0].cash=100000;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();await page.getByRole('tab',{name:'Money'}).click();
 await page.getByTestId('corporate-toggle-'+id).click();await page.getByTestId('corporate:product:'+id).click();await expect(page.getByTestId('npc-company-'+id)).toContainText('1 products');
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).livingEconomy.companies[0].corporate.products)).toBe(1);await page.reload();await page.getByRole('tab',{name:'Money'}).click();await expect(page.getByTestId('npc-company-'+id)).toContainText('1 products');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
