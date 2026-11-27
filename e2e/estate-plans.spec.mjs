import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('estate planning works on People tab and persists across reload',async({page})=>{
 let s=E.createLife({seed:134101,name:'Alex'});s.age=45;s.actions=3;s=E.act(s,'date');s.people.find(p=>p.role==='partner').bond=90;s=E.act(s,'child');s=E.act(s,'child');s.actions=3;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'People'}).click();const board=page.getByTestId('estate-plan-board');
 await board.getByTestId('estate-expand').click();await board.getByTestId('estate-plan-equal').click();
 await expect(board).toContainText('Equal shares recorded');
 await page.reload();await page.getByRole('tab',{name:'People'}).click();await expect(board).toContainText('Equal shares recorded');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));expect(saved.actions).toBe(2);expect(E.validate(saved)).toBe(true);
});
