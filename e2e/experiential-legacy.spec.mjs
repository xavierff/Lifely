import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
test('lifetime adventure progress persists after recent scene history is removed',async({page})=>{
 let s=E.createLife({seed:132101,name:'Alex'});s.age=30;s.actions=3;
 s=E.act(s,'scene:start:outing:street-festival');
 for(const i of [0,1,0])s=E.sceneChoice(s,i);
 s.everydayScenes.completed=[];
 await page.setViewportSize({width:320,height:740});await page.goto('/');
 await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 const progress=page.getByTestId('outing-life-progress');
 await expect(progress).toContainText('1 completed');await expect(progress).toContainText('1/19 distinct');
 await page.reload();await expect(progress).toContainText('Adult 1');
});
