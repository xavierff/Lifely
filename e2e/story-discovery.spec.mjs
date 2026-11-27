import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {socialCirclesYear} from '../src/content/social-circles.mjs';
test('Life screen reveals all optional responses and a choice persists across reload',async({page})=>{
 const s=E.createLife({seed:130101,name:'Alex'});s.age=28;s.actions=3;
 for(const p of s.people){p.world.trust=72;p.world.rivalry=7;p.world.ambition='Family life';}
 socialCirclesYear(s,{add:()=>{}});
 const o=s.socialCircles.invites[0],key='circle-'+o.id;
 await page.setViewportSize({width:320,height:740});
 await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();
 const board=page.getByTestId('story-focus-board');
 await board.getByTestId('life-opportunities-toggle').click();
 await board.getByTestId('life-story-'+key).click();
 await expect(board.getByTestId('life-story-choice-'+key+'-0')).toBeVisible();
 await expect(board.getByTestId('life-story-choice-'+key+'-1')).toBeVisible();
 await expect(board.getByTestId('life-story-choice-'+key+'-2')).toBeVisible();
 await board.getByTestId('life-story-choice-'+key+'-0').click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.actions).toBe(2);expect(saved.socialCircles.invites[0].status).toBe('waiting');expect(E.validate(saved)).toBe(true);
 await page.reload();await expect(page.getByTestId('life-story-choice-'+key+'-0')).toHaveCount(0);
});
