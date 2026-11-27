import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('partner connection and saved compatibility display on narrow People screen',async({page})=>{
 let s=E.createLife({seed:133101,name:'Alex'});s.age=28;s.actions=3;s=E.act(s,'date');const p=s.people.find(x=>x.role==='partner');
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'People'}).click();const board=page.getByTestId('romance-family-board');
 await expect(board).toContainText(p.name);await expect(board).toContainText('Compatibility');
 await board.getByTestId('romance-action-romance-connect-'+p.id+'-listen').click();await expect(board.getByTestId('romance-latest')).toContainText(p.name);
 await page.reload();await page.getByRole('tab',{name:'People'}).click();await expect(board.getByTestId('romance-latest')).toContainText(p.name);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.actions).toBe(1);expect(saved.people.find(x=>x.id===p.id).bond).toBeGreaterThan(p.bond);expect(E.validate(saved)).toBe(true);
});
