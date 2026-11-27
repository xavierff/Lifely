import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {npcFamilyYear} from '../src/content/dynamic-npc-families.mjs';
import {socialLifeYear} from '../src/content/autonomous-social-life.mjs';
test('independent family board and wedding invitation survive reload at 320px',async({page})=>{
 let s=E.createLife({seed:153101});s.age=30;s.cash=10000;s.actions=3;s=E.act(s,'friend');s=E.act(s,'friend');s.actions=3;
 const friends=s.people.filter(p=>p.role==='friend');for(const p of friends){p.age=30;p.bond=80;}
 npcFamilyYear(s,{country:v=>E.countries[v.country],careers:E.careers,roll:(id,tag)=>tag==='marriage'?0:.99,add:()=>{},npcNews:()=>{},person:()=>{throw Error('Expected existing friend pair');}});
 socialLifeYear(s,{add:()=>{},bond:()=>{}});
 const invite=s.socialLife.inbox.find(i=>i.kind==='npcwedding');
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('npc-family-board');await expect(board).toContainText(friends[0].name);await expect(board).toContainText(friends[1].name);await expect(board).toContainText('combined net worth');
 await page.getByTestId('social-decline-'+invite.id).click();await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')).socialLife.declined)).toBe(1);
 await page.reload();await page.getByRole('tab',{name:'People'}).click();await expect(board).toContainText(friends[0].name);await expect(page.getByTestId('social-invitation-history')).toContainText('declined');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
