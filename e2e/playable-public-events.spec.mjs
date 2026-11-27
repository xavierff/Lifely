import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {socialCirclesYear,socialCirclesInheritance} from '../src/content/social-circles.mjs';
import {organizationNetworkYear,organizationNetworkInheritance} from '../src/content/organization-relations.mjs';
import {playableEventsInheritance} from '../src/content/playable-public-events.mjs';
const add=()=>{};
function life(seed=123101,kind='community'){
 let s=E.createLife({seed,name:'Avery'});s.age=30;s.actions=3;
 for(const p of s.people){
  p.world.trust=72;p.world.rivalry=8;p.world.cash=9000;
  p.world.debt=0;p.world.ambition='Family life';
 }
 socialCirclesYear(s,{add});
 s=E.act(s,'circle:'+s.socialCircles.invites[0].id+':2');
 s.age=31;s.actions=3;
 if(kind==='community')s.people[1].world.ambition='Community service';
 else if(kind==='professional'){
  s.people[1].world.job=0;s.job={id:0,level:0,experience:0};
 }else if(kind==='rival-family'){
  s.world.autonomy={version:1,alumni:[{
   id:'alumni-household',name:'Morgan',age:31,trust:34,rivalry:82,
   preference:3,connection:'former classmate',status:'rivals',
   profession:'Founder',collaborations:0,contests:0,lastInteractionAge:-1,
   partnerId:null,children:2,careerLevel:1,location:'hometown',
   history:[],schoolAge:12
  }],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 }
 socialCirclesYear(s,{add});organizationNetworkYear(s,{add});
 if(!E.validate(s)||!E.playableEventView(s).offers.length)
  throw Error('Invalid interactive public event fixture');
 return s;
}
async function save(page,s){
 await page.goto('/');
 await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);
 await page.reload();
}
const getSaved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
test('play a complete community festival with animated progress and persistent NPC consequences',async({page})=>{
 const s=life(123102),first=s.people[0].world.trust,second=s.people[1].world.trust;
 await save(page,s);
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('playable-events-board');
 await expect(board).toContainText('Play the living world');
 await expect(board.getByTestId('playable-mode-festival')).toContainText('Community festival');
 await board.getByTestId('playable-mode-festival').click();
 let active=board.getByTestId('playable-public-event-active');
 await expect(active).toContainText('ROUND 1 / 3');
 await expect(active).toContainText('Choose the festival program');
 await expect(active).toContainText('Fairness');
 await active.getByTestId('playable-event-choice-0').click();
 active=board.getByTestId('playable-public-event-active');
 await expect(active).toContainText('ROUND 2 / 3');
 await expect(active).toContainText('Work through a public setback');
 await active.getByTestId('playable-event-choice-0').click();
 await expect(active).toContainText('ROUND 3 / 3');
 await expect(active).toContainText('Close the community celebration');
 await active.getByTestId('playable-event-choice-0').click();
 await expect(board.getByTestId('playable-events-history')).toContainText('CELEBRATED');
 await page.reload();await page.getByRole('tab',{name:'World'}).click();
 await expect(page.getByTestId('playable-events-history')).toContainText('CELEBRATED');
 const n=await getSaved(page);
 expect(n.playableEvents.completed[0].mode).toBe('festival');
 expect(n.playableEvents.completed[0].ending).toBe('celebrated');
 expect(n.playableEvents.active).toBeNull();
 expect(n.people[0].world.trust).toBe(first+9);
 expect(n.people[1].world.trust).toBe(second+9);
 expect(n.actions).toBe(2);
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('professional skill competition remains interactive in Work after one annual hosting activity',async({page})=>{
 const s=life(123103,'professional');
 await save(page,s);
 await page.getByRole('tab',{name:'World'}).click();
 await page.getByTestId('playable-events-board').getByTestId('playable-mode-competition').click();
 await page.getByRole('tab',{name:'Work'}).click();
 const preview=page.getByTestId('playable-events-preview');
 await expect(preview).toContainText('Professional competition');
 await preview.getByTestId('playable-event-choice-0').click();
 await expect(preview).toContainText('The live skills challenge');
 await preview.getByTestId('playable-event-choice-0').click();
 await preview.getByTestId('playable-event-choice-0').click();
 await expect(preview.getByTestId('playable-events-current-result')).toContainText('MERIT');
 const n=await getSaved(page);
 expect(n.playableEvents.completed[0].ending).toBe('merit');
 expect(n.stats.performance).toBe(s.stats.performance+6);
 expect(n.job.id).toBe(0);
 expect(n.actions).toBe(2);
 expect(E.validate(n)).toBe(true);
});
test('leadership election displays two actual NPC candidates and changes a real council leader',async({page})=>{
 const s=life(123104),family=s.socialCircles.groups[0];
 await save(page,s);
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('playable-events-board');
 await board.getByTestId('playable-mode-election').click();
 const active=board.getByTestId('playable-public-event-active');
 await expect(active.getByTestId('playable-election-candidates')).toContainText('Incumbent');
 await expect(active.getByTestId('playable-election-candidates')).toContainText('Challenger');
 await active.getByTestId('playable-event-choice-1').click();
 await expect(active).toContainText('The leadership debate');
 await active.getByTestId('playable-event-choice-1').click();
 await expect(active).toContainText('The final member ballot');
 await active.getByTestId('playable-event-choice-1').click();
 await expect(board.getByTestId('playable-events-history')).toContainText('NEW-LEADER');
 const n=await getSaved(page);
 const result=n.playableEvents.completed[0];
 expect(result.newLeaderId).not.toBe(family.leaderId);
 expect(n.socialCircles.groups[0].leaderId).toBe(result.newLeaderId);
 expect(n.socialCircles.groups[0].members).toContain(result.newLeaderId);
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('an independent election and a withdrawn public event cannot grant free wealth or standing',async({page})=>{
 const s=life(123105),leader=s.socialCircles.groups[0].leaderId;
 await save(page,s);
 await page.getByRole('tab',{name:'World'}).click();
 let board=page.getByTestId('playable-events-board');
 await board.getByTestId('playable-mode-election').click();
 let scene=board.getByTestId('playable-public-event-active');
 await scene.getByTestId('playable-event-choice-2').click();
 await scene.getByTestId('playable-event-choice-2').click();
 await scene.getByTestId('playable-event-choice-2').click();
 const n=await getSaved(page);
 expect(n.playableEvents.completed[0].ending).toBe('independent');
 expect(n.socialCircles.groups[0].leaderId).toBe(leader);
 expect(n.cash).toBe(s.cash);
 expect(n.stats).toEqual(s.stats);
 expect(E.validate(n)).toBe(true);
 await save(page,life(123106));
 await page.getByRole('tab',{name:'World'}).click();
 board=page.getByTestId('playable-events-board');
 await board.getByTestId('playable-mode-negotiation').click();
 await board.getByTestId('playable-event-leave').click();
 await expect(board.getByTestId('playable-events-history')).toContainText('ABANDONED');
 const saved=await getSaved(page);
 expect(saved.playableEvents.active).toBeNull();
 expect(saved.playableEvents.completed[0].ending).toBe('abandoned');
 expect(E.validate(saved)).toBe(true);
});
test('a completed public event enters the Life Chronicle and surviving ancestral memory',async({page})=>{
 let s=life(123107);
 let cmd=E.playableEventCommands(s).find(c=>c.id.endsWith(':negotiation'));
 s=E.act(s,cmd.id);
 s=E.playableEventDecision(s,0);
 s=E.playableEventDecision(s,0);
 s=E.playableEventDecision(s,0);
 await save(page,s);
 await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByTestId('chronicle-timeline')).toContainText('Hosted negotiation');
 const heir=E.createLife({seed:123108,name:'Rowan'});heir.age=18;heir.generation=2;
 socialCirclesInheritance(heir,s);
 organizationNetworkInheritance(heir,s);
 playableEventsInheritance(heir,s);
 await save(page,heir);
 await page.getByRole('tab',{name:'World'}).click();
 await expect(page.getByTestId('playable-events-ancestors')).toContainText('GEN 1');
 const stored=await getSaved(page);
 expect(stored.playableEvents.active).toBeNull();
 expect(stored.playableEvents.completed).toHaveLength(0);
 expect(stored.organizationNetwork.links[0].leaderA).toBeNull();
 expect(E.validate(stored)).toBe(true);
});
test('playable event tiles fit 320px, 375px, 430px and cannot start without annual actions',async({page})=>{
 for(const width of [320,375,430]){
  const s=life(123200+width);s.actions=0;
  await page.setViewportSize({width,height:740});
  await save(page,s);
  await page.getByRole('tab',{name:'World'}).click();
  const board=page.getByTestId('playable-events-board');
  await expect(board).toBeVisible();
  await expect(board.getByTestId('playable-mode-festival')).toBeDisabled();
  const b=await board.boundingBox();
  expect(b.width).toBeLessThanOrEqual(width+2);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
