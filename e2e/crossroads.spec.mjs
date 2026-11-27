import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {ensureNetwork} from '../src/content/relationships.mjs';
import {crossroadsYear} from '../src/content/social-crossroads.mjs';

function socialLife(seed,status='rivals'){
 const s=E.createLife({seed,name:'Morgan'});s.age=24;s.actions=3;
 const network=ensureNetwork(s);
 network.edges.push({key:'person-1|person-2',a:'person-1',b:'person-2',
  trust:status==='allies'?78:41,loyalty:status==='allies'?76:50,
  status,firstMetAge:18,years:4,betrayals:0,memories:[]});
 network.news.push({age:24,kind:status,between:['person-1','person-2'],
  text:'Two people in your circle changed their relationship.'});
 crossroadsYear(s,{add:()=>{}});
 if(!E.validate(s))throw Error('Fixture not valid');
 return s;
}
test('autonomous NPC rivalry creates an optional playable situation with real saved consequences',async({page})=>{
 const s=socialLife(117501);
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
 await expect(page.getByTestId('crossroads-preview')).toBeVisible();
 await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('crossroads-board');
 await expect(board).toContainText('Two people, one rivalry');
 await expect(board).toContainText(s.people[0].name);
 await expect(board).toContainText(s.people[1].name);
 await board.getByRole('button',{name:/Hear both sides before taking a stand/}).click();
 await expect(page.getByTestId('crossroads-decision-impact')).toContainText('Trust +10');
 await expect(board).toContainText('THE YEARS BETWEEN');
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('crossroads-board')).toContainText('THE YEARS BETWEEN');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.crossroads.open[0].steps.length).toBe(1);
 expect(saved.world.network.edges[0].trust).toBe(51);
 expect(saved.actions).toBe(2);
 expect(E.validate(saved)).toBe(true);
});
test('the years-later social decision changes relationships and enters the chronicle',async({page})=>{
 let s=socialLife(117502,'allies');
 const respond=E.commands(s).find(c=>c.id.startsWith('cross:respond:')&&c.id.endsWith(':0'));
 s=E.act(s,respond.id);
 s.age=s.crossroads.open[0].dueAge;s.actions=3;
 crossroadsYear(s,{add:()=>{}});
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
 await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('crossroads-board');
 await expect(board).toContainText('THE STORY RETURNS');
 await board.getByRole('button',{name:/Help them rebuild a realistic agreement/}).click();
 await expect(page.getByTestId('crossroads-archive')).toContainText('ALLIANCE');
 await expect(page.getByTestId('crossroads-archive')).toContainText('cooperation survived');
 await page.reload();
 await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByTestId('chronicle-timeline')).toContainText('An alliance changes the circle');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.crossroads.open).toHaveLength(0);
 expect(saved.crossroads.completed[0].ending).toBe('alliance');
 expect(E.validate(saved)).toBe(true);
});
test('small screens do not overflow or allow actions without yearly activities',async({page})=>{
 for(const width of [320,375,430]){
  const s=socialLife(117600+width);s.actions=0;
  await page.setViewportSize({width,height:740});
  await page.goto('/');
  await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
  await page.reload();
  await expect(page.getByTestId('crossroads-preview')).toBeVisible();
  await page.getByRole('tab',{name:'People'}).click();
  const board=page.getByTestId('crossroads-board');
  await expect(board).toBeVisible();
  const area=await board.boundingBox();expect(area.width).toBeLessThanOrEqual(width+2);
  await expect(board.getByRole('button',{name:/Hear both sides/})).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
