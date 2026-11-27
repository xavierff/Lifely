import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('concert tour resumes on the second stop after reload',async({page})=>{
 let s=E.createLife({seed:139101,name:'Alex'});s.age=30;s.actions=3;s.cash=100000;s.stats.creativity=95;s=E.act(s,'world:ent:start:1');s.actions=3;Object.assign(s.world.entertainment,{fame:85,releases:2,awards:1});
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();await page.getByRole('tab',{name:'Work'}).click();
 const b=page.getByTestId('spotlight-world');await b.getByTestId('spotlight-expand').click();await b.getByTestId('spotlight-tour-start-international').click();await b.getByTestId('spotlight-tour-play-polish').click();
 await expect(b.getByTestId('spotlight-tour')).toContainText('London arena');await page.reload();await page.getByRole('tab',{name:'Work'}).click();await expect(b.getByTestId('spotlight-tour')).toContainText('London arena');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));expect(saved.actions).toBe(1);expect(E.validate(saved)).toBe(true);
});
