import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {socialCirclesYear,socialCirclesInheritance} from '../src/content/social-circles.mjs';
import {organizationNetworkYear,organizationNetworkInheritance} from '../src/content/organization-relations.mjs';
const noop=()=>{};
function life(seed=122101,kind='community'){
 let s=E.createLife({seed,name:'Avery'});s.age=30;s.actions=3;
 for(const p of s.people){
  p.world.trust=72;p.world.rivalry=8;p.world.cash=9000;p.world.debt=0;
  p.world.ambition='Family life';
 }
 socialCirclesYear(s,{add:noop});
 const first=s.socialCircles.invites[0];
 s=E.act(s,'circle:'+first.id+':2');
 s.age=31;s.actions=3;
 if(kind==='community')s.people[1].world.ambition='Community service';
 else if(kind==='professional'){
  s.people[1].world.job=0;s.job={id:0,level:0,experience:0};
 }else{
  s.world.autonomy={version:1,alumni:[{
   id:'alumni-household',name:'Morgan',age:31,trust:34,rivalry:82,
   preference:3,connection:'former classmate',status:'rivals',
   profession:'Founder',collaborations:0,contests:0,lastInteractionAge:-1,
   partnerId:null,children:2,careerLevel:1,location:'hometown',
   history:[],schoolAge:12
  }],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 }
 socialCirclesYear(s,{add:noop});
 organizationNetworkYear(s,{add:noop});
 if(!E.validate(s)||!s.organizationNetwork.active)throw Error('Invalid public gathering fixture');
 return s;
}
const save=async(page,s)=>{
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
};
const years=(s,n)=>{for(let i=0;i<n;i++){
 s.age++;s.actions=3;
 socialCirclesYear(s,{add:noop});
 organizationNetworkYear(s,{add:noop});
}return s;};
test('two organizations host a public gathering, and player support affects real NPCs after a save reload',async({page})=>{
 const s=life(122102),l=s.organizationNetwork.links[0];
 await save(page,s);
 await expect(page.getByTestId('intergroup-world-preview')).toContainText('Two groups, one shared future');
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('intergroup-world-board');
 await expect(board).toContainText('Alliances, rivals & public life');
 await expect(board.getByTestId('intergroup-link-'+l.id)).toContainText('Open skills');
 await expect(board.getByTestId('intergroup-link-'+l.id).getByTestId('intergroup-public-event')).toBeVisible();
 await board.getByTestId('intergroup-decision').getByRole('button',{name:/Broker a public pact between both groups/}).click();
 await expect(board.getByTestId('intergroup-impact')).toContainText('Trust +12');
 await expect(board.getByTestId('intergroup-impact')).toContainText('Group B standing +3');
 await page.reload();await page.getByRole('tab',{name:'World'}).click();
 await expect(page.getByTestId('intergroup-impact')).toContainText('Leader B trust +5');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(stored.people[0].world.trust).toBe(s.people[0].world.trust+5);
 expect(stored.people[1].world.trust).toBe(s.people[1].world.trust+5);
 expect(stored.organizationNetwork.active.status).toBe('waiting');
 expect(stored.organizationNetwork.links[0].trust).toBe(s.organizationNetwork.links[0].trust+12);
 expect(stored.cash).toBe(s.cash);
 expect(stored.actions).toBe(2);
 expect(E.validate(stored)).toBe(true);
});
test('professional guild and a family council can negotiate across Work and World',async({page})=>{
 const s=life(122103,'professional');
 await save(page,s);
 await page.getByRole('tab',{name:'Work'}).click();
 const preview=page.getByTestId('intergroup-world-preview');
 await expect(preview).toContainText('Career Network');
 await preview.getByTestId('intergroup-decision')
  .getByRole('button',{name:/Broker a public pact/}).click();
 await expect(preview.getByTestId('intergroup-impact')).toContainText('Competition -8');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(stored.job.id).toBe(0);
 expect(stored.stats.social).toBe(s.stats.social+3);
 expect(stored.organizationNetwork.active.decisions[0].tag).toBe('broker');
 expect(E.validate(stored)).toBe(true);
});
test('rival family conflict changes real group and alumnus rivalry, without inventing wealth',async({page})=>{
 const s=life(122104,'rival-family');
 await save(page,s);
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('intergroup-world-board');
 await expect(board).toContainText('Public dialogue between competing households');
 await board.getByTestId('intergroup-decision')
  .getByRole('button',{name:/Back .* over /}).click();
 await expect(board.getByTestId('intergroup-impact')).toContainText('Competition +12');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(stored.world.autonomy.alumni[0].rivalry).toBe(s.world.autonomy.alumni[0].rivalry+8);
 expect(stored.socialCircles.groups[1].standing).toBe(s.socialCircles.groups[1].standing-3);
 expect(stored.cash).toBe(s.cash);
 expect(E.validate(stored)).toBe(true);
});
test('a two-year public coalition enters the Life Chronicle and has its own completed archive',async({page})=>{
 let s=life(122105),id=s.organizationNetwork.active.id;
 s=E.act(s,'intergroup:'+id+':0');
 s=years(s,2);
 expect(s.organizationNetwork.active.status).toBe('ready');
 await save(page,s);
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('intergroup-world-board');
 await expect(board).toContainText('LEADERS RECONVENE');
 await board.getByTestId('intergroup-decision')
  .getByRole('button',{name:/Renew the intergroup agreement/}).click();
 await expect(board.getByTestId('intergroup-history')).toContainText('COALITION');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(stored.organizationNetwork.completed[0].ending).toBe('coalition');
 expect(stored.organizationNetwork.active).toBeNull();
 await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByTestId('chronicle-timeline')).toContainText('coalition');
 expect(E.validate(stored)).toBe(true);
});
test('a descendant inherits public institutions but not leaders or automatic personal memberships',async({page})=>{
 let old=life(122106),id=old.organizationNetwork.active.id;
 old=E.act(old,'intergroup:'+id+':0');old=years(old,2);old=E.act(old,'intergroup:'+id+':0');
 const next=E.createLife({seed:122107,name:'Noah'});
 next.generation=2;next.age=18;
 socialCirclesInheritance(next,old);organizationNetworkInheritance(next,old);
 await save(page,next);
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('intergroup-world-board');
 await expect(board.getByTestId('intergroup-ancestors')).toContainText('GENERATION 1');
 await expect(board.getByTestId('intergroup-link-'+old.organizationNetwork.links[0].id)).toContainText('DORMANT');
 await expect(board.getByTestId('intergroup-link-'+old.organizationNetwork.links[0].id)).toContainText('Paused until living representatives return');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.organizationNetwork.links[0].leaderA).toBeNull();
 expect(saved.organizationNetwork.active).toBeNull();
 expect(saved.organizationNetwork.completed).toHaveLength(0);
 expect(E.validate(saved)).toBe(true);
});
test('320–430px widths keep public events and choices readable without horizontal overflow',async({page})=>{
 for(const width of [320,375,430]){
  const s=life(122200+width);
  s.actions=0;
  await page.setViewportSize({width,height:740});
  await save(page,s);
  await expect(page.getByTestId('intergroup-world-preview')).toBeVisible();
  await page.getByRole('tab',{name:'World'}).click();
  const board=page.getByTestId('intergroup-world-board');
  await expect(board).toBeVisible();
  const box=await board.boundingBox();
  expect(box.width).toBeLessThanOrEqual(width+2);
  await expect(board.getByRole('button',{name:/Broker a public pact between both groups/})).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
