import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {socialCirclesYear,socialCirclesInheritance} from '../src/content/social-circles.mjs';
import {organizationNetworkYear,organizationNetworkInheritance} from '../src/content/organization-relations.mjs';
import {playableEventsInheritance} from '../src/content/playable-public-events.mjs';
import {publicAftermathYear,publicAftermathInheritance} from '../src/content/public-aftermath.mjs';
import {civicMandatesYear,civicMandatesInheritance} from '../src/content/civic-mandates.mjs';
const silent=()=>{};
function life(seed=125101,kind='community'){
 let s=E.createLife({seed,name:'Alex'});s.age=30;s.actions=3;
 for(const p of s.people){
  p.world.trust=72;p.world.rivalry=8;p.world.cash=9000;p.world.debt=0;
  p.world.ambition='Family life';
 }
 socialCirclesYear(s,{add:silent});
 s=E.act(s,'circle:'+s.socialCircles.invites[0].id+':2');
 s.age=31;s.actions=3;
 if(kind==='community')s.people[1].world.ambition='Community service';
 else if(kind==='professional'){s.people[1].world.job=0;s.job={id:0,level:0,experience:0};}
 else if(kind==='rival-family'){
  s.world.autonomy={version:1,alumni:[{
   id:'alumni-household',name:'Morgan',age:31,trust:34,rivalry:82,
   preference:3,connection:'former classmate',status:'rivals',profession:'Founder',
   collaborations:0,contests:0,lastInteractionAge:-1,partnerId:null,children:2,
   careerLevel:1,location:'hometown',history:[],schoolAge:12
  }],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 }
 socialCirclesYear(s,{add:silent});organizationNetworkYear(s,{add:silent});
 const mode=kind==='professional'?'competition':kind==='rival-family'?'negotiation':'festival',
  cmd=E.playableEventCommands(s).find(c=>c.id.endsWith(':'+mode));
 s=E.act(s,cmd.id);
 for(let i=0;i<3;i++)s=E.playableEventDecision(s,0);
 publicAftermathYear(s,{add:silent});civicMandatesYear(s,{add:silent});
 if(!E.validate(s)||!s.civicMandates.active)throw Error('Invalid civic fixture');
 return s;
}
const advance=(s,count)=>{for(let i=0;i<count;i++){
 s.age++;s.actions=3;
 socialCirclesYear(s,{add:silent});organizationNetworkYear(s,{add:silent});
 publicAftermathYear(s,{add:silent});civicMandatesYear(s,{add:silent});
}return s;};
const restore=async(page,s)=>{await page.goto('/');
 await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);
 await page.reload();};
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));

test('family/community civic campaign develops into a playable follow-up with persistent measurable outcomes',async({page})=>{
 const s=advance(life(125102),2),m=s.civicMandates.active;
 await restore(page,s);await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('civic-campaign-board');
 await expect(board).toContainText('Campaigns that change the living world');
 await expect(board.getByTestId('civic-campaign-active')).toContainText('Family care & neighborhood support');
 await expect(board).toContainText(m.groupAName);
 await expect(board).toContainText(m.groupBName);
 await expect(board.getByTestId('civic-campaign-invitation')).toBeVisible();
 await board.getByTestId('civic-choice-0').click();
 await expect(board.getByTestId('civic-campaign-history')).toContainText('Evidence +12');
 await page.reload();await page.getByRole('tab',{name:'World'}).click();
 await expect(page.getByTestId('civic-campaign-history')).toContainText('YOUR RECORDED POSITIONS');
 const n=await saved(page);
 expect(n.civicMandates.active.pending).toBe(false);
 expect(n.civicMandates.active.decisions[0].tag).toBe('build-evidence');
 expect(n.people[0].world.trust).toBe(s.people[0].world.trust+4);
 expect(n.people[1].world.trust).toBe(s.people[1].world.trust+4);
 expect(n.actions).toBe(2);
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('a professional access campaign is playable from Work without inventing employment',async({page})=>{
 const s=advance(life(125103,'professional'),2);
 await restore(page,s);await page.getByRole('tab',{name:'Work'}).click();
 const card=page.getByTestId('civic-campaign-preview');
 await expect(card).toContainText('Apprenticeship & skills access');
 await card.getByTestId('civic-choice-0').click();
 await expect(card.getByTestId('civic-campaign-history')).toContainText('Shared ground');
 const n=await saved(page);
 expect(n.civicMandates.active.issue).toBe('skills-access');
 expect(n.job.id).toBe(s.job.id);
 expect(n.stats.knowledge).toBe(s.stats.knowledge+2);
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('players can back the weaker organization, producing a real and costly social disagreement',async({page})=>{
 const s=advance(life(125104),2);
 s.civicMandates.active.supportB=24;s.civicMandates.active.supportA=78;
 await restore(page,s);await page.getByRole('tab',{name:'World'}).click();
 const card=page.getByTestId('civic-campaign-board');
 await expect(card).toContainText('Champion Neighborhood Service Assembly');
 await card.getByTestId('civic-choice-1').click();
 const n=await saved(page);
 expect(n.civicMandates.active.supportB).toBe(37);
 expect(n.civicMandates.active.supportA).toBe(72);
 expect(n.civicMandates.active.resistance).toBe(s.civicMandates.active.resistance+10);
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('choosing no involvement cannot change any real character or institutional standing',async({page})=>{
 const s=advance(life(125105),2);
 await restore(page,s);await page.getByRole('tab',{name:'World'}).click();
 await page.getByTestId('civic-campaign-board').getByTestId('civic-choice-2').click();
 const n=await saved(page);
 expect(n.civicMandates.active.decisions[0].tag).toBe('independent');
 expect(n.stats).toEqual(s.stats);
 expect(n.people).toEqual(s.people);
 expect(n.socialCircles.groups).toEqual(s.socialCircles.groups);
 expect(n.organizationNetwork.links).toEqual(s.organizationNetwork.links);
 expect(n.cash).toBe(s.cash);
 expect(E.validate(n)).toBe(true);
});
test('completed public campaigns enter the life chronicle and do not transfer personal power to an heir',async({page})=>{
 let s=life(125106);s=advance(s,8);
 expect(s.civicMandates.completed.length).toBe(1);
 await restore(page,s);await page.getByRole('tab',{name:'World'}).click();
 await expect(page.getByTestId('civic-campaign-archive')).toContainText('Family care & neighborhood support');
 await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByTestId('chronicle-timeline')).toContainText('Family care');
 const heir=E.createLife({seed:125107,name:'Rowan'});heir.age=18;heir.generation=2;
 socialCirclesInheritance(heir,s);organizationNetworkInheritance(heir,s);
 playableEventsInheritance(heir,s);publicAftermathInheritance(heir,s);
 civicMandatesInheritance(heir,s);
 await restore(page,heir);await page.getByRole('tab',{name:'World'}).click();
 await expect(page.getByTestId('civic-campaign-ancestors')).toContainText('GENERATION 1');
 const n=await saved(page);
 expect(n.civicMandates.active).toBeNull();
 expect(n.civicMandates.completed).toHaveLength(0);
 expect(n.civicMandates.used).toHaveLength(0);
 expect(E.validate(n)).toBe(true);
});
test('policy campaign widgets fit small iPhone-class viewports, and no activity means disabled choices',async({page})=>{
 for(const width of [320,375,430]){
  const s=advance(life(125200+width),2);s.actions=0;
  await page.setViewportSize({width,height:750});
  await restore(page,s);
  await expect(page.getByTestId('civic-campaign-preview')).toBeVisible();
  await page.getByRole('tab',{name:'World'}).click();
  const board=page.getByTestId('civic-campaign-board');
  await expect(board).toBeVisible();
  const rect=await board.boundingBox();
  expect(rect.width).toBeLessThanOrEqual(width+2);
  await expect(board.getByTestId('civic-choice-0')).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
