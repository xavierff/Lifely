import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {economyYear} from '../src/content/living-economy.mjs';
test('real employer persists in Work at 320px',async({page})=>{
 let s=E.createLife({seed:155101});s.age=32;s.cash=1000000;s.actions=3;s.market=1;s.education=3;s.stats.knowledge=100;
 const p=s.people[0];p.age=45;p.world.cash=300000;p.world.job=0;
 economyYear(s,{country:v=>E.countries[v.country],careers:E.careers,add:()=>{},roll:(i,t)=>t==='found'&&i===p.id?0:.99});
 const c=s.livingEconomy.companies[0],job=E.commands(s).find(x=>x.id.startsWith('economy:apply:')&&x.enabled);
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();await expect(page.getByTestId('living-economy-work')).toContainText(c.name);
 await page.getByTestId(job.id).click();await expect(page.getByTestId('npc-employer')).toContainText(c.name);
 await page.reload();await page.getByRole('tab',{name:'Work'}).click();await expect(page.getByTestId('npc-employer')).toContainText(c.name);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
