import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('professional football contract survives reload on narrow Work screen',async({page})=>{
 let s=E.createLife({seed:138101,name:'Alex'});s.age=25;s.actions=3;s.cash=100000;s.stats.health=90;s=E.act(s,'world:sport:start:0');s.actions=3;
 Object.assign(s.world.sports,{form:95,rank:2,wins:6,injury:0});
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();const b=page.getByTestId('professional-sports-board');
 await b.getByTestId('sportdeal-expand').click();await b.getByTestId('sportdeal-request-harbor').click();await b.getByTestId('sportdeal-accept').click();
 await expect(b.getByTestId('sportdeal-active')).toContainText('Harbor City FC');
 await page.reload();await page.getByRole('tab',{name:'Work'}).click();await expect(b.getByTestId('sportdeal-active')).toContainText('Harbor City FC');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));expect(saved.actions).toBe(1);expect(E.validate(saved)).toBe(true);
});
