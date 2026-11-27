import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('luxury showroom purchases persist on a narrow Money screen',async({page})=>{
 const s=E.createLife({seed:135101,name:'Alex'});s.age=35;s.actions=3;s.cash=10000000;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Money'}).click();const b=page.getByTestId('luxury-board');
 await b.getByTestId('luxury-tab-buy').click();await b.getByTestId('luxury-buy-yacht').click();await expect(b.getByTestId('luxury-owned-yacht')).toBeVisible();
 await page.reload();await page.getByRole('tab',{name:'Money'}).click();await expect(b.getByTestId('luxury-owned-yacht')).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.actions).toBe(2);expect(E.worth(saved)).toBe(E.worth(s));expect(E.validate(saved)).toBe(true);
});
