import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('acquired company persists in Money portfolio at narrow width',async({page})=>{
 let s=E.createLife({seed:136101,name:'Alex'});s.age=35;s.actions=3;s.cash=5000000;s=E.act(s,'business:studio');
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Money'}).click();const b=page.getByTestId('empire-board');
 await b.getByTestId('empire-expand').click();await b.getByTestId('empire-buy-cafe').click();await expect(b.getByTestId('empire-owned-cafe')).toBeVisible();
 await page.reload();await page.getByRole('tab',{name:'Money'}).click();await expect(b.getByTestId('empire-owned-cafe')).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));expect(E.worth(saved)).toBe(E.worth(s));expect(saved.actions).toBe(1);expect(E.validate(saved)).toBe(true);
});
