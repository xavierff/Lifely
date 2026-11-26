import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {emotionalYear} from '../src/content/emotional-memory.mjs';

function returningLife(seed){
 let s=E.createLife({seed,name:'Avery'});s.age=22;s.actions=3;
 s=E.act(s,'dialogue:open:person-1');
 for(const i of [2,2,2])s=E.dialogueReply(s,i);
 s.age=s.emotional.threads[0].dueAge;s.actions=3;
 emotionalYear(s,{add:()=>{}});
 return s;
}
test('a remembered relationship returns as a playable reunion and survives reload',async({page})=>{
 const s=returningLife(991561);
 await page.goto('/');
 await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),s);
 await page.reload();
 await expect(page.getByTestId('emotional-reunion-preview')).toBeVisible();
 await page.getByRole('tab',{name:'People'}).click();
 const board=page.getByTestId('emotional-memory-board');
 await expect(board).toContainText(s.people[0].name);
 await board.getByRole('button',{name:'Reunite with '+s.people[0].name}).click();
 const scene=page.getByTestId('reunion-cinematic-scene');
 await expect(scene).toContainText('THE PAST RETURNS');
 await expect(scene).toContainText('YEARS LATER');
 const dialogue=page.getByTestId('conversation-panel');
 await expect(dialogue).toContainText('A long-awaited reunion');
 await dialogue.getByRole('button',{name:/Acknowledge what they carried/}).click();
 await expect(page.getByTestId('dialogue-reaction')).toBeVisible();
 await page.reload();
 await expect(page.getByTestId('reunion-cinematic-scene')).toBeVisible();
 await dialogue.getByRole('button',{name:/Ask what they need/}).click();
 await dialogue.getByRole('button',{name:/Make a specific promise/}).click();
 await expect(dialogue).toHaveCount(0);
 await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('emotional-memory-board')).toContainText('You found a way back');
 await expect(page.getByTestId('emotional-memory-board')).toContainText('CONVERSATIONS YOU CARRY');
 await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByTestId('chronicle-timeline')).toContainText('Reunion with');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(E.validate(saved)).toBe(true);
 expect(saved.emotional.threads[0].status).toBe('resolved');
});

test('reunion cards fit small phones and still honor action limits',async({page})=>{
 for(const width of [320,375,430]){
  await page.setViewportSize({width,height:750});
  const s=returningLife(991570+width);
  s.actions=0;
  await page.goto('/');
  await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
  await page.reload();
  const preview=page.getByTestId('emotional-reunion-preview');
  await expect(preview).toBeVisible();
  const bounds=await preview.boundingBox();expect(bounds.width).toBeLessThanOrEqual(width+1);
  await page.getByRole('tab',{name:'People'}).click();
  const reunite=page.getByRole('button',{name:'Reunite with '+s.people[0].name}).first();
  await expect(reunite).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
