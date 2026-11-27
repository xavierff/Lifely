import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
async function load(page,s){await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();}
test('camera and business controls use the same phase limit and survive reload',async({page})=>{
 for(const type of ['film','business']){
  let s=E.createLife({seed:144101});s.age=32;s.cash=50000;s.stats.creativity=95;s.skills.art=95;
  if(type==='film')s.world.entertainment.path='Film director';else s.business={sector:'shop',capital:12000,quality:62,demand:51};
  s=E.act(s,'campaign:start:'+type);await load(page,s);
  const direct=type==='film'?'film-camera-':'business-control-';await page.getByTestId(direct+'0').click();
  await expect(page.getByTestId('playfield-history')).toContainText(/✓|×/);
  await page.reload();await expect(page.getByTestId('playfield-history')).toContainText(/✓|×/);
  await page.getByTestId(type+'-action-1').click();await expect(page.getByTestId(direct+'2')).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
 }
});
test('direct courtroom controls advance one round and preserve its history',async({page})=>{
 let s=E.createLife({seed:144102});s.age=34;s.actions=3;s.cash=9000;s.justice.case={opened:34,severity:48,counsel:false};s=E.act(s,'scene:start:court');await load(page,s);
 await page.getByTestId('court-control-0').click();await expect(page.getByTestId('scene-round-history')).toContainText(/Progress|Setback/);
 await page.reload();await expect(page.getByTestId('everyday-project')).toContainText('ROUND 2 OF 3');
 await page.getByTestId('court-control-1').click();await page.getByTestId('court-control-2').click();await expect(page.getByTestId('interactive-courtroom')).toHaveCount(0);
});
