import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('league match resumes after reload and finishes on a narrow phone',async({page})=>{
 const s=E.createLife({seed:170101,name:'Match Life'});s.age=25;s.world.sports.sport='Football';s.world.sports.form=85;
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'World'}).click();await page.getByTestId('league-match-start').click();await page.getByTestId('match-shoot').click();
 await expect(page.getByTestId('league-match-active')).toContainText('Turn 2/12');
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).matchLeague.active.turn)).toBe(1);
 await page.reload();await expect(page.getByTestId('league-match-active')).toContainText('Turn 2/12');
 for(let i=0;i<11;i++)await page.getByTestId('match-lane-1').click();
 await expect(page.getByTestId('league-match-active')).toHaveCount(0);
 await page.getByRole('tab',{name:'World'}).click();await expect(page.getByTestId('league-match-board')).toContainText('1/3 fixtures');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
