import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('film production continues after reload on narrow Work screen',async({page})=>{
 let s=E.createLife({seed:137101,name:'Alex'});s.age=30;s.actions=3;s.cash=100000;s.stats.creativity=90;s=E.act(s,'world:ent:start:2');s.actions=3;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();const b=page.getByTestId('celebrity-board');
 await b.getByTestId('celebrity-expand').click();await b.getByTestId('celebrity-project-start-film').click();await b.getByTestId('celebrity-project-choice-0').click();
 await expect(b.getByTestId('celebrity-project')).toContainText('CHAPTER 2/3');
 await page.reload();await page.getByRole('tab',{name:'Work'}).click();await expect(b.getByTestId('celebrity-project')).toContainText('CHAPTER 2/3');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));expect(saved.actions).toBe(1);expect(E.validate(saved)).toBe(true);
});
