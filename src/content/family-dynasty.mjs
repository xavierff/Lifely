// Lifely 1.9: original multiyear family decisions, autonomous NPC personalities,
// sibling relationships and inherited emotional history. All state stays offline.
const clamp=x=>Math.max(0,Math.min(100,Math.round(x)));
const stories=[
 {id:'shared-futures',name:'Two careers, one home',kind:'partner',minAge:18,married:true,story:'Your marriage is changing as each person pursues a different dream.',
 chapters:[
  {title:'The promotion abroad',cue:'Your partner has a career opportunity far from home just as your own work becomes demanding.',choices:['Ask what the opportunity means to both of you','Build a practical plan for work, savings and time together','Demand that your career always come first']},
  {title:'The missed anniversary',cue:'Two years later, an important date slips by while both careers are under pressure.',choices:['Acknowledge the hurt and listen without excuses','Agree on protected time and realistic commitments','Accuse your partner of caring only about work']},
  {title:'The decision to stay',cue:'Another opportunity arrives. Your partner asks whether the household still has a shared future.',choices:['Choose your next step together, even if it is imperfect','Compare real tradeoffs and draw up a sustainable plan','Make the decision alone and ask for loyalty afterward']}]},
 {id:'trust-and-truth',name:'A marriage worth rebuilding',kind:'partner',minAge:18,married:true,story:'A misunderstanding grows into a test of honesty and emotional safety.',
 chapters:[
  {title:'The private message',cue:'Your partner discovers that you kept a difficult conversation private, and wonders what else remains unsaid.',choices:['Explain patiently and invite their perspective','Agree on fair boundaries for privacy and honesty','Dismiss the concern and demand immediate trust']},
  {title:'The worried friend',cue:'A friend repeats a rumor that puts more pressure on the relationship.',choices:['Hear your partner before judging the rumor','Check facts with everyone involved, without accusations','Confront the friend loudly and refuse discussion']},
  {title:'A new promise',cue:'Your partner wants a concrete way to know the next misunderstanding will be handled differently.',choices:['Recommit to listening and a respectful repair process','Agree on a regular check-in and shared expectations','Insist that they prove their loyalty before you change']}]},
 {id:'independent-partners',name:'Love without losing yourself',kind:'partner',minAge:18,story:'Two people who care about each other still need room for individuality.',
 chapters:[
  {title:'Separate ambitions',cue:'Your partner wants to take up a demanding project that will leave less time together.',choices:['Support the dream and talk about your needs','Arrange a realistic schedule and shared boundaries','Demand that they abandon the project']},
  {title:'A different circle',cue:'Your partner has new friends and interests. You feel left out of part of their life.',choices:['Share your feelings and respect their independence','Plan meaningful activities you both enjoy','Try to control who they spend time with']},
  {title:'The life you share',cue:'The future is uncertain, and both of you are changing. What does commitment mean now?',choices:['Choose mutual care without demanding sameness','Make a fair plan that protects both priorities','Treat differences as a contest someone must win']}]},
 {id:'first-steps',name:'The child who wants to try',kind:'child',minAge:18,minChild:3,maxChild:10,story:'A young child is learning courage and needs guidance that fits their personality.',
 chapters:[
  {title:'The unfinished bicycle ride',cue:'Your child wants to learn a difficult new skill and becomes frustrated when it does not work immediately.',choices:['Encourage small attempts and celebrate persistence','Find a safe practice routine and show one helpful technique','Take over and demand they do it perfectly']},
  {title:'A new friendship',cue:'Your child is unsure how to join a group after a misunderstanding at school.',choices:['Listen to their worries without making assumptions','Help them practice how to start a conversation','Tell them to win the group over at any cost']},
  {title:'The first independent choice',cue:'Your child asks to choose an activity that differs from the one you expected.',choices:['Respect the choice and stay curious about it','Explore the options and set realistic responsibilities','Choose for them because you know best']}]},
 {id:'school-pressure',name:'More than a report card',kind:'child',minAge:18,minChild:6,maxChild:17,story:'Growing children need opportunities, but they also need room to make mistakes.',
 chapters:[
  {title:'A disappointing grade',cue:'Your child studies hard but receives a disappointing result and worries you will be ashamed.',choices:['Reassure them and find out what was difficult','Build a study plan and seek constructive feedback','Compare them publicly with a more successful child']},
  {title:'A talent outside class',cue:'Your child discovers a hobby they love, but it competes with the study schedule.',choices:['Listen to what makes the hobby important','Agree on a balanced routine with rest and learning','Ban the hobby until every score improves']},
  {title:'The next application',cue:'An important school opportunity arrives and your child is torn between two interests.',choices:['Support a decision reflecting their own values','Help review requirements and prepare a thoughtful application','Make the application in your own name and expect gratitude']}]},
 {id:'teenage-independence',name:'The road to independence',kind:'child',minAge:18,minChild:12,maxChild:20,story:'A teenager is becoming an individual and needs both trust and dependable limits.',
 chapters:[
  {title:'The late return',cue:'Your teenager returns later than expected and says you never listen to their plans.',choices:['Ask what happened and explain your safety concerns','Agree on a clear plan for communication and curfews','Impose an indefinite punishment without listening']},
  {title:'An unexpected career wish',cue:'Your teenager wants a future very different from the one the family imagined.',choices:['Explore what they value and what support they need','Compare realistic pathways, costs and education','Mock the choice and demand they follow your ambition']},
  {title:'The first home away',cue:'An opportunity would let them live more independently, but everyone is nervous.',choices:['Offer trust, reassurance and an open door','Create a practical transition plan and check-ins','Block the opportunity to keep the family unchanged']}]},
 {id:'siblings-and-space',name:'The siblings who want to belong',kind:'siblings',minAge:20,minChild:3,story:'Two siblings compete for attention before learning how to become a team.',
 chapters:[
  {title:'The broken project',cue:'One child blames the other for damaging a shared project. Both insist you are taking sides.',choices:['Hear each child separately and acknowledge the hurt','Help them agree on fair repair and shared responsibility','Pick the child who seems more successful']},
  {title:'The comparison',cue:'Two years later one child receives praise and the other quietly stops joining family activities.',choices:['Recognize each child’s different strengths','Make sure each has space and a practical goal','Use the successful child as an example of what the other lacks']},
  {title:'A chance to cooperate',cue:'The siblings could work on something together, but old resentment is still present.',choices:['Invite honest conversation and let each choose a role','Set up clear responsibilities and a shared result','Force them to compete for your approval']}]},
 {id:'inheritance-fairness',name:'What fairness looks like',kind:'siblings',minAge:38,minChild:18,story:'Adult siblings disagree over responsibility, family history and the meaning of inheritance.',
 chapters:[
  {title:'Who cared for the family?',cue:'One adult child says they handled more family responsibilities. Another worries their needs are invisible.',choices:['Listen to both and recognize invisible contributions','Document responsibilities and discuss transparent principles','Promise the inheritance to whoever obeys you']},
  {title:'The business of belonging',cue:'Two years later one sibling wants to preserve a family asset and the other needs flexibility.',choices:['Hold a respectful discussion about both priorities','Explore legal-independent professional advice and an equitable plan','Threaten to disinherit anyone who challenges you']},
  {title:'A legacy they can live with',cue:'You can leave the siblings a process for making choices, not just a disputed number.',choices:['Encourage a family agreement based on dignity','Record a clear, fair and voluntary decision process','Declare a winner and silence future discussion']}]},
 {id:'elder-care',name:'The parent who raised you',kind:'elder',minAge:25,minRelativeAge:55,story:'A parent is aging, and maintaining dignity matters as much as practical help.',
 chapters:[
  {title:'The first request for help',cue:'A parent is having trouble managing a regular task and is reluctant to ask for help.',choices:['Ask what support feels respectful and useful','Arrange practical help while involving them in decisions','Take over everything without asking']},
  {title:'The unplanned change',cue:'Two years later a change in routine creates uncertainty. Family members disagree over responsibilities.',choices:['Bring people together and listen to the older person','Set a sustainable care schedule and clear boundaries','Blame relatives and announce that only you can decide']},
  {title:'The stories they keep',cue:'Your parent wants to pass down stories and values, not simply be remembered for their needs.',choices:['Make time to hear and record the stories','Create a workable family tradition for keeping memories','Dismiss the past and change the subject']}]},
 {id:'family-enterprise',name:'The business in the family',kind:'child',minAge:30,minChild:14,business:true,story:'A child is interested in the family company but does not want their future decided for them.',
 chapters:[
  {title:'A first day at work',cue:'Your child asks to learn what the business does. A manager worries that favoritism will hurt the team.',choices:['Ask what interests the child and hear the manager','Offer a fair learning role with clear boundaries','Give the child authority over employees immediately']},
  {title:'The difficult customer',cue:'Two years later a customer questions a mistake the child made while helping with a project.',choices:['Help them accept responsibility and learn','Review the process and protect the customer fairly','Cover up the mistake to defend the family name']},
  {title:'An independent future',cue:'Your child may want to remain in the business—or build a different life altogether.',choices:['Respect the future they choose','Explain ownership and employment responsibilities clearly','Make family loyalty a condition of any support']}]},
 {id:'hard-conversations',name:'The conversation that stayed unfinished',kind:'strained',minAge:16,story:'An old hurt has grown into distance between two members of a family.',
 chapters:[
  {title:'The invitation',cue:'A relative you have avoided reaches out. Neither of you is sure the relationship can be repaired.',choices:['Listen to their experience without making demands','Choose a safe and realistic way to meet','Insist they apologize before being heard']},
  {title:'The disagreement returns',cue:'Two years later the same subject is raised, with stronger feelings on both sides.',choices:['Acknowledge what you misunderstood','Agree on boundaries and practical steps','Repeat old accusations and demand a winner']},
  {title:'A different kind of closeness',cue:'You may not agree about the past, but there is a chance to build mutual respect.',choices:['Accept a relationship that allows difference','Define expectations and check in gradually','Demand complete agreement or refuse contact']}]},
 {id:'family-traditions',name:'The things a family remembers',kind:'child',minAge:18,minChild:3,story:'The stories, rituals and care people share may outlive anyone who started them.',
 chapters:[
  {title:'A tradition nobody expected',cue:'Your child asks what your family used to do when you were young.',choices:['Share a memory and invite their questions','Create a small tradition everyone can join','Insist the old customs never change']},
  {title:'A celebration goes wrong',cue:'Two years later a planned gathering is interrupted and relatives disagree over what matters most.',choices:['Focus on the people and their feelings','Adjust the plan so everyone can participate','Blame the person who changed the schedule']},
  {title:'Passing it forward',cue:'Years later the child wants to adapt the tradition for a new generation.',choices:['Encourage the new version and share its meaning','Help plan a way to remember both old and new','Demand that every detail remain unchanged']}]}
];
export const familyStoryTypes=stories.map(({id,name,kind,minAge,story})=>({id,name,kind,minAge,story}));
export const emptyFamilyStories=()=>({version:1,active:null,members:{},siblingLinks:{},completed:[],unfulfilled:[],ancestry:[],news:[],started:0,lastStart:{},milestones:[]});
export const familyState=s=>s.familyStories||emptyFamilyStories();
const ensure=s=>(s.familyStories??=emptyFamilyStories());
const keyPair=(a,b)=>[a,b].sort((x,y)=>x-y).join('-');
const personalityValues={Driven:'ambition',Supportive:'care',Independent:'freedom',Cautious:'security',Competitive:'fairness',Creative:'expression'};
const valueOf=p=>personalityValues[p?.world?.personality]||'care';
function member(s,p){
 const f=ensure(s),id=String(p.id);
 if(f.members[id])return f.members[id];
 if(Object.keys(f.members).length>=30)throw Error('Family profile capacity reached.');
 const values=valueOf(p),temper=p.world?.personality||'Supportive';
 const m={personId:p.id,temperament:temper,values,trust:clamp(p.world?.trust??65),
  independence:p.role==='child'?clamp(20+p.age*2):50,resilience:50,care:50,history:[],lastContactAge:s.age};
 f.members[id]=m;return m;
}
function choiceEffect(s,p,choice,ctx,storyKind){
 const m=member(s,p),bonus=m.values==='care'&&choice===0?3:m.values==='security'&&choice===1?3:
  m.values==='freedom'&&choice===0?2:m.values==='fairness'&&choice===1?2:
  m.values==='ambition'&&choice===1?2:m.values==='expression'&&choice===0?2:0;
 const effects=[
  {bond:8+bonus,trust:9+bonus,independence:4,resilience:3,care:5,stress:-2,joy:4,conflict:-4},
  {bond:5+bonus,trust:5+bonus,independence:3,resilience:5,care:2,stress:1,joy:2,conflict:-2},
  {bond:-12,trust:-14,independence:-5,resilience:-4,care:-6,stress:5,joy:-7,conflict:9}
 ][choice];
 ctx.bond(s,p,effects.bond,'A family chapter changed our understanding');
 m.trust=clamp(m.trust+effects.trust);m.independence=clamp(m.independence+effects.independence);
 m.resilience=clamp(m.resilience+effects.resilience);m.care=clamp(m.care+effects.care);
 if(p.world){p.world.trust=clamp(p.world.trust+effects.trust/3);
  p.world.joy=clamp(p.world.joy+effects.joy);
  p.world.rivalry=clamp((p.world.rivalry||0)+(choice===2?8:-3));
  if(p.role==='child'&&choice!==2)p.world.talent=clamp(p.world.talent+(choice===1?3:1));
 }
 ctx.change(s,'stress',effects.stress);
 if(choice===0)ctx.change(s,'kindness',2);if(choice===1)ctx.change(s,'knowledge',2);
 if(choice===2)ctx.change(s,'happiness',-3);
 return effects;
}
function sibling(s,a,b){
 const f=ensure(s),key=keyPair(a.id,b.id);
 if(f.siblingLinks[key])return f.siblingLinks[key];
 if(Object.keys(f.siblingLinks).length>=12)throw Error('Sibling relationship capacity reached.');
 return f.siblingLinks[key]={ids:[a.id,b.id],trust:54,rivalry:27,cooperation:38,history:[]};
}
function candidates(s,t){
 const alive=(s.people||[]).filter(p=>p.alive),child=alive.filter(p=>p.role==='child'),partners=alive.filter(p=>p.role==='partner');
 if(t.kind==='partner')return partners.filter(p=>p.age>=18&&(!t.married||p.married)).map(p=>[p]);
 if(t.kind==='child')return child.filter(p=>p.age>=t.minChild&&(t.maxChild===undefined||p.age<=t.maxChild)).map(p=>[p]);
 if(t.kind==='elder')return alive.filter(p=>['parent','grandparent'].includes(p.role)&&p.age>=t.minRelativeAge).map(p=>[p]);
 if(t.kind==='strained')return alive.filter(p=>['parent','grandparent','child','sibling','partner','ex'].includes(p.role)&&p.bond<=45).map(p=>[p]);
 if(t.kind==='siblings'){const aged=child.filter(p=>p.age>=t.minChild);const pairs=[];for(let i=0;i<aged.length;i++)for(let j=i+1;j<aged.length;j++)pairs.push([aged[i],aged[j]]);return pairs.slice(0,6);}
 return [];
}
function available(s){return stories.filter(t=>s.age>=t.minAge&&(!t.business||!!s.business)).flatMap(t=>candidates(s,t).map(p=>({type:t,people:p})));}
function blocker(s){return !s.alive||s.pending!==null||!!s.mini||!!s.world?.network?.conversation||!!s.careerCampaigns?.active||!!s.everydayScenes?.active||!!s.world?.storyDirector?.active||!!s.hobbyCircuit?.active||s.workplace?.active?.status==='ready'||(s.justice?.years||0)>0;}
export function familyCommands(s){
 if(blocker(s))return [];
 const f=familyState(s),a=f.active,can=s.actions>0;
 if(a){
  if(a.status==='waiting'&&s.age>=a.nextAge&&a.stage<3)return [
   {id:'family:continue',label:'Continue '+a.name,detail:'Chapter '+(a.stage+1)+' / 3 · '+a.names.join(' and '),enabled:can},
   {id:'family:leave',label:'Let this family story go',detail:'Keep the history · the relationship will remember',enabled:can}];
  if(a.status==='waiting')return [{id:'family:leave',label:'Step away from '+a.name,detail:'Close the unfinished family story',enabled:can}];
  return [];
 }
 const options=available(s);
 return options.filter(({type,people})=>f.lastStart[type.id+':'+people.map(p=>p.id).join('-')]!==s.age)
  .slice(0,20).map(({type,people})=>({id:'family:begin:'+type.id+':'+people.map(p=>p.id).join('-'),
  label:type.name+' · '+people.map(p=>p.name).join(' & '),detail:'Three original choices across five years · '+type.story,enabled:can}));
}
export function familyStart(s,id,ctx){
 if(!familyCommands({...s,actions:s.actions+1}).some(x=>x.id===id&&x.enabled))throw Error('Family story is unavailable.');
 const f=ensure(s);
 if(id==='family:continue'){
  if(f.active?.status!=='waiting'||s.age<f.active.nextAge)throw Error('This family chapter has not returned yet.');
  f.active.status='ready';ctx.add(s,'A family conversation with '+f.active.names.join(' and ')+' is ready.','family');return;
 }
 if(id==='family:leave'){finishFamily(s,'abandoned',ctx);return;}
 const [,operation,typeId,targetIds]=id.split(':');
 if(operation!=='begin')throw Error('Invalid family action.');
 const type=stories.find(t=>t.id===typeId),people=candidates(s,type).find(group=>group.map(p=>p.id).join('-')===targetIds);
 if(!type||!people)throw Error('Family participants are unavailable.');
 const names=people.map(p=>p.name);
 for(const p of people)member(s,p);
 if(people.length===2)sibling(s,people[0],people[1]);
 const key=type.id+':'+targetIds;
 f.lastStart[key]=s.age;
 if(Object.keys(f.lastStart).length>40){for(const k of Object.keys(f.lastStart).slice(0,10))delete f.lastStart[k];}
 f.started++;
 f.active={id:'family-'+f.started,kind:type.id,name:type.name,personIds:people.map(p=>p.id),names,stage:0,status:'ready',nextAge:s.age,
  startedAge:s.age,trust:50,conflict:15,choices:[],impact:0};
 ctx.add(s,'Family story: '+type.name+' with '+names.join(' and ')+'. '+type.story,'family');
}
export function familyView(s){
 const a=s.familyStories?.active;if(!a||a.status!=='ready')return null;
 const t=stories.find(x=>x.id===a.kind),beat=t?.chapters[a.stage];if(!beat)return null;
 const people=a.personIds.map(id=>s.people.find(p=>p.id===id&&p.alive));
 if(people.some(p=>!p))return null;
 const profiles=people.map(p=>s.familyStories?.members?.[String(p.id)]||{values:valueOf(p),trust:p.world?.trust??65,independence:clamp(20+p.age*2)});
 return {id:a.id,title:a.name,story:t.story,round:a.stage+1,total:3,chapter:beat.title,prompt:beat.cue,
  people:people.map((p,i)=>({id:p.id,name:p.name,role:p.role,age:p.age,personality:p.world?.personality||'Supportive',
   values:profiles[i].values,trust:profiles[i].trust,bond:p.bond,independence:profiles[i].independence})),
  trust:a.trust,conflict:a.conflict,impact:a.impact,history:a.choices.slice(),
  options:beat.choices.map((label,index)=>({index,label,detail:[
   'Listen and build mutual trust','Make a practical, fair plan','Assert control; high risk of resentment'][index]}))};
}
function finishFamily(s,status,ctx){
 const f=ensure(s),a=f.active;if(!a)return null;
 const story=stories.find(t=>t.id===a.kind);
 const outcome=status==='completed'?(a.impact>=70?'reconciled':a.impact>=45?'growing':'complicated'):status;
 const entry={id:a.id,kind:a.kind,title:a.name,startedAge:a.startedAge,endedAge:s.age,status,outcome,
  personIds:a.personIds.slice(),names:a.names.slice(),impact:a.impact,choices:a.choices.slice(),sourceLife:s.name};
 if(status==='completed'){
  f.completed.push(entry);f.completed=f.completed.slice(-30);
  ctx.change(s,'happiness',outcome==='reconciled'?5:outcome==='growing'?2:-3);
  ctx.change(s,'reputation',outcome==='reconciled'?2:0);
  if(story.kind==='child'&&outcome!=='complicated'){
   for(const id of a.personIds){const p=s.people.find(p=>p.id===id&&p.alive);if(p&&p.world)p.world.talent=clamp(p.world.talent+3);}
  }
 }else f.unfulfilled.push(entry),f.unfulfilled=f.unfulfilled.slice(-20);
 const note=a.name+' with '+a.names.join(' and ')+' — '+outcome+'.';
 f.news.push({age:s.age,text:note});f.news=f.news.slice(-40);
 ctx.add(s,note,'family');f.active=null;return entry;
}
export function familyChoice(s,index,ctx){
 const f=ensure(s),a=f.active;
 if(!a||a.status!=='ready'||!s.alive)throw Error('There is no family decision to resolve.');
 if(!Number.isInteger(index)||index<0||index>2)throw Error('Invalid family choice.');
 const type=stories.find(t=>t.id===a.kind),beat=type.chapters[a.stage],people=a.personIds.map(id=>s.people.find(p=>p.id===id&&p.alive));
 if(people.some(p=>!p)){finishFamily(s,'interrupted',ctx);return null;}
 for(const p of people)choiceEffect(s,p,index,ctx,type.kind);
 const delta=index===0?25:index===1?19:-20;
 a.impact+=delta+(people.some(p=>p.world?.personality==='Independent')&&index===0?2:0);
 a.trust=clamp(a.trust+(index===0?12:index===1?8:-15));
 a.conflict=clamp(a.conflict+(index===2?20:-8));
 if(people.length===2){
  const link=sibling(s,people[0],people[1]);
  link.trust=clamp(link.trust+(index===0?14:index===1?9:-15));
  link.rivalry=clamp(link.rivalry+(index===2?17:-7));
  link.cooperation=clamp(link.cooperation+(index===0?13:index===1?10:-12));
  link.history.push({age:s.age,choice:beat.choices[index],impact:delta});link.history=link.history.slice(-8);
  for(const p of people)if(p.world)p.world.rivalry=clamp((p.world.rivalry||0)+(index===2?6:-2));
 }
 const response=index===0?'Your family felt heard, even if the issue is not fully settled.':
  index===1?'A workable plan made the next step clearer, though feelings still need attention.':
  'The decision was forceful. Your relatives remember being left out of it.';
 const record={chapter:a.stage+1,age:s.age,title:beat.title,choice:beat.choices[index],response,index,impact:delta};
 a.choices.push(record);
 for(const p of people){const m=member(s,p);m.lastContactAge=s.age;m.history.push({age:s.age,event:beat.title,response});m.history=m.history.slice(-8);}
 ctx.add(s,a.name+' · '+beat.title+': '+response,'family');
 a.stage++;
 if(a.stage===3)return finishFamily(s,'completed',ctx);
 a.status='waiting';a.nextAge=s.age+2;return record;
}
export function familyYear(s,ctx){
 const f=s.familyStories;if(!f||!s.alive)return;
 const known=(s.people||[]).filter(p=>p.alive&&['parent','grandparent','partner','child','sibling'].includes(p.role));
 for(const p of known){
  const m=f.members?.[String(p.id)];if(!m)continue;
  if(p.role==='child')m.independence=clamp(m.independence+(p.age>=12?3:p.age>=5?1:0));
  if(p.role==='partner'&&p.married){
   const neglected=s.age-m.lastContactAge>=3;
   if(neglected&&s.stats.stress>65){m.trust=clamp(m.trust-2);p.world.trust=clamp(p.world.trust-1);}
  }
  if(m.trust>=70&&p.bond>=75)m.care=clamp(m.care+1);
 }
 const children=known.filter(p=>p.role==='child');
 for(const link of Object.values(f.siblingLinks||{})){
  const [a,b]=link.ids.map(id=>children.find(p=>p.id===id));
  if(!a||!b)continue;
  const old=link.rivalry;
  const contrast=a.world?.personality!==b.world?.personality;
  link.rivalry=clamp(link.rivalry+(contrast&&s.age%3===0?2:-1));
  link.trust=clamp(link.trust+(link.cooperation>=65?1:0));
  if(old<55&&link.rivalry>=55){
   const text=a.name+' and '+b.name+' have become increasingly competitive.';
   f.news.push({age:s.age,text});ctx.add(s,text,'family');
  }
 }
 const a=f.active;
 if(a){
  const current=a.personIds.map(id=>s.people.find(p=>p.id===id&&p.alive));
  if(current.some(p=>!p)||(stories.find(t=>t.id===a.kind)?.kind==='partner'&&current.some(p=>p.role!=='partner'))){
   finishFamily(s,'interrupted',ctx);
  }else if(a.status==='waiting'&&s.age>a.nextAge+2)finishFamily(s,'neglected',ctx);
  else if(a.status==='waiting'&&s.age===a.nextAge){
   const text='A family conversation with '+a.names.join(' and ')+' is ready to continue.';
   f.news.push({age:s.age,text});ctx.add(s,text,'family');
  }
 }
 f.news=f.news.slice(-40);
}
export function familySummary(s){
 const f=familyState(s),a=f.active;
 return {active:a?{...a,yearsUntil:Math.max(0,a.nextAge-s.age),due:a.status==='waiting'&&s.age>=a.nextAge,
   nextChapter:stories.find(t=>t.id===a.kind)?.chapters[a.stage]?.title||null}:null,
  people:(s.people||[]).filter(p=>p.alive&&['partner','parent','grandparent','child','sibling'].includes(p.role)).map(p=>{
   const m=f.members?.[String(p.id)];return {id:p.id,name:p.name,role:p.role,age:p.age,bond:p.bond,
    personality:p.world?.personality||'Supportive',values:m?.values||valueOf(p),trust:m?.trust??p.world?.trust??65,
    independence:m?.independence??(p.role==='child'?clamp(20+p.age*2):50),care:m?.care??50,
    history:(m?.history||[]).slice(-2).reverse()};
  }),
  siblings:Object.values(f.siblingLinks||{}).map(x=>({...x,history:(x.history||[]).slice(-2).reverse(),
   names:x.ids.map(id=>s.people.find(p=>p.id===id)?.name||'Family member')})).slice(0,12),
  completed:f.completed.slice(-7).reverse(),unfulfilled:f.unfulfilled.slice(-4).reverse(),
  ancestry:f.ancestry.slice(-8).reverse(),news:f.news.slice(-5).reverse(),total:f.started||0,
  options:available(s).slice(0,10).map(({type,people})=>({id:type.id,title:type.name,names:people.map(p=>p.name)}))};
}
export function familyInheritance(next,old,child){
 const f=old.familyStories;if(!f)return;
 const out=ensure(next);
 out.ancestry=[...(f.ancestry||[]),...(f.completed||[]).map(x=>({...x,sourceLife:old.name}))].slice(-18);
 const childProfile=f.members?.[String(child.id)];
 if(childProfile){
  next.stats.confidence=clamp(next.stats.confidence+Math.round((childProfile.independence-45)*.20));
  next.stats.kindness=clamp(next.stats.kindness+Math.round((childProfile.care-50)*.18));
  next.stats.social=clamp(next.stats.social+Math.round((childProfile.trust-50)*.14));
  out.milestones.push({type:'upbringing',sourceLife:old.name,independence:childProfile.independence,
   care:childProfile.care,trust:childProfile.trust});
 }
 const liveIds=new Set(next.people.map(p=>p.id));
 out.members=Object.fromEntries(Object.entries(f.members||{}).filter(([id])=>liveIds.has(Number(id)))
  .map(([id,p])=>[id,{...p,history:p.history.slice(-5)}]));
 out.siblingLinks=Object.fromEntries(Object.entries(f.siblingLinks||{}).filter(([,l])=>l.ids.every(id=>liveIds.has(id)))
  .map(([key,l])=>[key,{...l,history:l.history.slice(-5)}]));
 out.active=null;out.completed=[];out.unfulfilled=[];out.news=[];out.started=0;out.lastStart={};
 out.milestones=out.milestones.slice(-12);
}
