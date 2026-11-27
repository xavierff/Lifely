import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {socialCirclesYear,socialCirclesInheritance} from '../src/content/social-circles.mjs';
const noop=()=>{};
function life(seed=121101,type='family'){
 const s=E.createLife({seed,name:'Alex'});s.age=28;s.actions=3;
 for(const p of s.people){p.world.trust=72;p.world.rivalry=7;p.world.cash=13000;p.world.ambition='Family life';}
 if(type==='professional'){
  s.job={id:0,level:0,experience:0};s.people[0].world.job=0;
 }else if(type==='community')s.people[0].world.ambition='Community service';
 else if(type==='rival-family')s.world.autonomy={version:1,alumni:[{
   id:'alumni-rival',name:'Ren',age:28,trust:34,rivalry:78,preference:3,
   connection:'former classmate',status:'rivals',profession:'Founder',
   collaborations:0,contests:0,lastInteractionAge:-1,partnerId:null,
   children:2,careerLevel:1,location:'hometown',history:[],schoolAge:12
  }],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 socialCirclesYear(s,{add:noop,careerTitle:'Technical specialist'});
 if(!E.validate(s)||s.socialCircles.groups[0]?.kind!==type)throw Error('Invalid social circle fixture');
 return s;
}
async function restore(page,s){
 await page.goto('/');
 await page.evaluate(value=>localStorage.setItem('lifely.save.v2',JSON.stringify(value)),s);
 await page.reload();
}
const advance=(s,years)=>{for(let i=0;i<years;i++){
 s.age++;s.actions=3;socialCirclesYear(s,{add:noop});
}return s;};

test('family council organizes a real project and a decision changes saved NPC trust',async({page})=>{
 const s=life(121102),offer=s.socialCircles.invites[0],leader=s.people[0];
 await restore(page,s);
 await expect(page.getByTestId('social-circles-preview')).toContainText('Family Council');
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('social-circles-board');
 await expect(board).toContainText('Organizations & rival households');
 await expect(board).toContainText('THE GROUP');
 await expect(board.getByTestId('circle-group-'+s.socialCircles.groups[0].id)).toContainText('THE GROUP');
 const choice=board.getByTestId('circle-invite').getByRole('button',{name:/Help the family council find common ground/});
 await choice.click();
 await expect(board.getByTestId('circle-impact')).toContainText('Standing +5');
 await expect(board.getByTestId('circle-invite')).toContainText('independent group work continues');
 await page.reload();
 await page.getByRole('tab',{name:'World'}).click();
 await expect(page.getByTestId('circle-impact')).toContainText('Progress +14');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 const id=Number(offer.personId.slice('person-'.length));
 const previous=s.people.find(x=>x.id===id);
 const actual=saved.people.find(x=>x.id===id);
 expect(actual.world.trust).toBe(previous.world.trust+7);
 expect(saved.socialCircles.groups[0].standing).toBe(s.socialCircles.groups[0].standing+5);
 expect(saved.actions).toBe(2);
 expect(saved.cash).toBe(s.cash);
 expect(E.validate(saved)).toBe(true);
});
test('professional guild invitation is visible in Work and affects an existing job',async({page})=>{
 const s=life(121103,'professional'),offer=s.socialCircles.invites[0];
 await restore(page,s);
 await page.getByRole('tab',{name:'Work'}).click();
 const preview=page.getByTestId('social-circles-preview');
 await expect(preview).toContainText('Career Network');
 await preview.getByTestId('circle-invite')
  .getByRole('button',{name:/Share expertise with the professional network/}).click();
 await expect(page.getByTestId('circle-impact')).toContainText('Standing +5');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.job.id).toBe(s.job.id);
 expect(saved.stats.performance).toBe(s.stats.performance+3);
 expect(saved.socialCircles.invites[0].id).toBe(offer.id);
 expect(saved.socialCircles.groups[0].project.progress).toBe(s.socialCircles.groups[0].project.progress+14);
 expect(E.validate(saved)).toBe(true);
});
test('rival households require a real alumni parent and have competing outcomes',async({page})=>{
 const s=life(121104,'rival-family');
 await restore(page,s);
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('social-circles-board');
 await expect(board).toContainText('The Rival Household of Ren');
 await expect(board).toContainText('RIVAL HOUSEHOLD');
 await board.getByRole('button',{name:/Escalate the family competition/}).click();
 await expect(board.getByTestId('circle-impact')).toContainText('Rivalry +9');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.world.autonomy.alumni[0].rivalry).toBe(s.world.autonomy.alumni[0].rivalry+9);
 expect(saved.cash).toBe(s.cash);
 expect(E.validate(saved)).toBe(true);
});
test('group alliances have consequences years later and enter the Life Chronicle',async({page})=>{
 let s=life(121105),o=s.socialCircles.invites[0];
 s=E.act(s,'circle:'+o.id+':0');
 s=advance(s,2);
 expect(s.socialCircles.invites[0].status).toBe('ready');
 await restore(page,s);
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('social-circles-board');
 await expect(board).toContainText('TWO YEARS LATER');
 await board.getByRole('button',{name:/Build on the relationship after several years/}).click();
 await expect(board.getByTestId('circle-history')).toContainText('ALLIANCE');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.socialCircles.completed[0].ending).toBe('alliance');
 expect(saved.socialCircles.groups[0].history.some(x=>x.outcome==='alliance')).toBe(true);
 await page.getByRole('tab',{name:'More'}).click();
 await expect(page.getByTestId('chronicle-timeline')).toContainText('Family Council of Alex');
 expect(E.validate(saved)).toBe(true);
});
test('group institutions survive a new generation but no personal membership is transferred',async({page})=>{
 let s=life(121106),g=s.socialCircles.groups[0];
 s=E.act(s,'circle:'+s.socialCircles.invites[0].id+':0');
 s=advance(s,2);s=E.act(s,'circle:'+s.socialCircles.invites[0].id+':0');
 const heir=E.createLife({seed:121107,name:'Rowan'});heir.age=18;heir.generation=2;
 socialCirclesInheritance(heir,s);
 await restore(page,heir);
 await page.getByRole('tab',{name:'World'}).click();
 const board=page.getByTestId('social-circles-board');
 await expect(board.getByTestId('circle-ancestor-memory')).toContainText('GENERATION 1');
 await expect(board.getByTestId('circle-group-'+g.id)).toContainText('DORMANT');
 await expect(board.getByTestId('circle-group-'+g.id)).toContainText('No current-generation member');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.socialCircles.groups[0].id).toBe(g.id);
 expect(saved.socialCircles.groups[0].members).toHaveLength(0);
 expect(saved.socialCircles.invites).toHaveLength(0);
 expect(E.validate(saved)).toBe(true);
});
test('group board scales to 320, 375 and 430px and choices disable when activities are exhausted',async({page})=>{
 for(const width of [320,375,430]){
  const s=life(121200+width);s.actions=0;
  await page.setViewportSize({width,height:740});
  await restore(page,s);
  await expect(page.getByTestId('social-circles-preview')).toBeVisible();
  await page.getByRole('tab',{name:'World'}).click();
  const board=page.getByTestId('social-circles-board');
  await expect(board).toBeVisible();
  const box=await board.boundingBox();expect(box.width).toBeLessThanOrEqual(width+2);
  await expect(board.getByRole('button',{name:/Help the family council find common ground/})).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});

test('leadership challenge is playable on a narrow screen and persists the endorsement',async({page})=>{
 const s=life(128101),g=s.socialCircles.groups[0];
 const incumbent=s.people.find(p=>'person-'+p.id===g.leaderId);
 const challenger=s.people.find(p=>p.id!==incumbent.id);
 incumbent.world.trust=40;incumbent.world.rivalry=50;
 challenger.world.trust=90;challenger.world.rivalry=5;
 advance(s,6);
 expect(g.governance.election).toBeTruthy();
 await page.setViewportSize({width:320,height:740});
 await restore(page,s);await page.getByRole('tab',{name:'World'}).click();
 const card=page.getByTestId('succession-'+g.id);
 await expect(card).toContainText('INTERNAL LEADERSHIP CONTEST');
 await card.getByTestId('succession-choice-1').click();
 await expect(card).toContainText('Response recorded: challenger');
 await page.reload();await page.getByRole('tab',{name:'World'}).click();
 await expect(page.getByTestId('succession-'+g.id)).toContainText('Response recorded: challenger');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lifely.save.v2')));
 expect(saved.socialCircles.groups[0].governance.election.response).toBe('challenger');
 expect(saved.cash).toBe(s.cash);expect(saved.actions).toBe(2);expect(E.validate(saved)).toBe(true);
});
