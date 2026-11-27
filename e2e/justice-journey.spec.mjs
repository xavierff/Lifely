import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('investigation desk persists a case file on 320px Work screen',async({page})=>{
 let s=E.createLife({seed:140101,name:'Alex'});s.age=30;s.actions=3;s.cash=100000;s.education=3;s.stats.knowledge=90;
 s=E.act(s,'job:'+E.careers.find(j=>j.title==='Detective').id);
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 await page.getByRole('tab',{name:'Work'}).click();const b=page.getByTestId('justice-journey');
 await b.getByTestId('justice-expand').click();await b.getByTestId('justicejourney-investigate-gallery').click();await expect(b.getByTestId('investigation-file')).toContainText('missing gallery exhibit');
 await page.reload();await page.getByRole('tab',{name:'Work'}).click();await expect(b.getByTestId('investigation-file')).toContainText('missing gallery exhibit');
 await b.getByTestId('justice-expand').click();await b.getByTestId('justicejourney-answer-1').click();await expect(b).toContainText('1/1 reviews');
});
