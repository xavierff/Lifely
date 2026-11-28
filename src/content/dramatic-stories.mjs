import {branchingDramas,branchingScene} from './branching-dramas.mjs';
// Authored, optional multi-year dramas. Existing people, not a parallel NPC cast.
const cap=(n,a=0,b=100)=>Math.max(a,Math.min(b,Math.round(n))),int=n=>Number.isSafeInteger(n)&&n>=0;
const age=n=>int(n)&&n<=110,person=(s,id)=>s.people.find(p=>p.id===id&&p.alive);
const choice=(label,path,bond,stat,delta)=>({label,path,bond,stat,delta});
const chapter=(prompt,choices)=>({prompt,choices});
export const dramas=[
 {id:'notebook',title:'The Notebook in the Attic',min:8,max:17,roles:['parent','grandparent','sibling'],chapters:[
 chapter('You find a notebook full of unfinished plans. {name} admits it once belonged to them.',[choice('Ask to hear the story','connect',7,'knowledge',3),choice('Return it without reading further','boundary',3,'kindness',3),choice('Ask why they gave up','challenge',-2,'confidence',3)]),
 chapter('{name} has saved a new page for you. They wonder what dreams you have kept private.',[choice('Write a shared page','connect',7,'creativity',4),choice('Keep your own plans separate','boundary',2,'confidence',4),choice('Encourage them to try again','challenge',3,'social',3)]),
 chapter('Years later, the notebook returns. {name} wants to know whether the dreams inside still matter.',[choice('Make a new promise together','connect',9,'happiness',4),choice('Keep it as a private memory','boundary',3,'stress',-4),choice('Celebrate the paths you actually took','challenge',5,'confidence',4)])]},
 {id:'friend',title:'The Empty Seat',min:10,max:50,roles:['friend','sibling'],chapters:[
 chapter('{name} stops appearing at your usual meeting place. They finally admit feeling left behind.',[choice('Make time to listen','connect',8,'kindness',3),choice('Suggest a smaller commitment','boundary',3,'stress',-2),choice('Explain your own frustration','challenge',-3,'confidence',3)]),
 chapter('An invitation arrives from {name}, but their priorities have changed.',[choice('Show up without expectations','connect',7,'social',3),choice('Agree to meet another day','boundary',2,'stress',-3),choice('Ask for an equal effort','challenge',3,'confidence',3)]),
 chapter('{name} recalls the empty seat and asks whether your friendship still has a future.',[choice('Build a different friendship','connect',9,'happiness',4),choice('Accept that lives change','boundary',1,'stress',-5),choice('Set a clear mutual promise','challenge',5,'confidence',3)])]},
 {id:'credit',title:'Whose Name Is on the Door?',min:18,max:65,roles:['friend','sibling','partner'],chapters:[
 chapter('A project you helped imagine is praised, but {name} receives the credit.',[choice('Ask for recognition privately','connect',4,'social',3),choice('Document your own work and move on','boundary',-1,'knowledge',4),choice('Challenge the omission directly','challenge',-6,'confidence',5)]),
 chapter('{name} offers a new collaboration. The old question of recognition remains.',[choice('Agree on credit before starting','connect',6,'knowledge',3),choice('Keep the work independent','boundary',1,'stress',-3),choice('Insist on an apology first','challenge',-3,'confidence',4)]),
 chapter('A new opportunity brings your past work into the spotlight. {name} asks how to describe it.',[choice('Share credit accurately','connect',8,'reputation',4),choice('Tell only your own story','boundary',2,'confidence',4),choice('Publicly correct the record respectfully','challenge',3,'reputation',3)])]},
 {id:'home',title:'The House Everyone Remembers',min:20,max:85,roles:['parent','grandparent','sibling','child'],chapters:[
 chapter('{name} wants the family to preserve a cherished gathering place. Others have different priorities.',[choice('Invite everyone to share memories','connect',7,'kindness',4),choice('Respect separate wishes','boundary',3,'stress',-3),choice('Argue for a practical compromise','challenge',1,'knowledge',4)]),
 chapter('{name} admits the place means something different to them now.',[choice('Ask what changed','connect',7,'social',3),choice('Preserve photos instead','boundary',4,'creativity',3),choice('Suggest a new gathering tradition','challenge',4,'confidence',3)]),
 chapter('The family decides what to remember rather than what to own.',[choice('Make a shared memory collection','connect',9,'happiness',5),choice('Keep one personal memento','boundary',3,'stress',-4),choice('Start a new tradition together','challenge',5,'social',4)])]},
 {id:'distance',title:'Two Different Futures',min:16,max:75,roles:['partner','friend','sibling'],chapters:[
 chapter('{name} announces a new ambition that could take your lives in different directions.',[choice('Help them explore it','connect',7,'kindness',3),choice('Name your own needs','boundary',2,'confidence',4),choice('Question whether the plan is realistic','challenge',-4,'knowledge',3)]),
 chapter('The original plan has changed. {name} worries you will resent the choice they made.',[choice('Ask what they learned','connect',8,'social',3),choice('Protect time for yourself','boundary',3,'stress',-4),choice('Discuss the costs honestly','challenge',2,'knowledge',4)]),
 chapter('{name} asks whether your separate dreams can still fit into the same life.',[choice('Make room for both futures','connect',9,'happiness',4),choice('Accept a respectful distance','boundary',2,'stress',-5),choice('Agree on realistic commitments','challenge',5,'confidence',4)])]},
 {id:'letter',title:'A Letter Never Sent',min:45,max:105,roles:['child','sibling','friend','partner'],chapters:[
 chapter('{name} finds a letter you once began but never finished. They ask why you stopped.',[choice('Share what you were afraid to say','connect',8,'confidence',3),choice('Explain that some things stay private','boundary',2,'stress',-4),choice('Ask what they wanted to hear','challenge',3,'social',4)]),
 chapter('{name} writes a response of their own. It includes a detail you had forgotten.',[choice('Read it together','connect',8,'happiness',4),choice('Read it in your own time','boundary',3,'knowledge',3),choice('Ask to clarify the old memory','challenge',4,'confidence',3)]),
 chapter('There is space for one final page. What do you want the next generation to know?',[choice('Record what helped you reconnect','connect',9,'kindness',4),choice('Record the boundaries that mattered','boundary',4,'stress',-4),choice('Record what you learned from disagreement','challenge',5,'knowledge',4)])]}
];
const allDramas=[...dramas,...branchingDramas],type=id=>allDramas.find(d=>d.id===id),scene=a=>{const d=type(a.type);return d.nodes?branchingScene(d,a.choices):d.chapters[a.stage];},fresh=()=>({version:1,serial:0,lastYear:null,lastOpened:null,active:null,completed:[],archive:[],discovered:[]});
const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
const state=s=>s.dramaticStories||fresh();
function complete(s,q,a,outcome,ctx){q.completed.push({...a,outcome,ended:s.age});q.completed=q.completed.slice(-16);q.active=null;ctx.add(s,type(a.type).title+' · '+outcome+'.','story');}
export function dramaYear(s,ctx){
 if(!s.alive||s.age<8)return;
 const q=s.dramaticStories??=fresh();if(q.lastYear===s.age)return;q.lastYear=s.age;
 const roll=ctx.roll||((key)=>hash((s.lifeId||s.name)+':drama:'+s.age+':'+key));
 if(q.active){const a=q.active;if(!person(s,a.personId)){complete(s,q,a,'unfinished',ctx);return;}if(s.age>a.due+4){complete(s,q,a,'faded',ctx);return;}return;}
 if(q.lastOpened!==null&&s.age-q.lastOpened<5||s.age>105||roll('offer')>=.32)return;
 const options=allDramas.filter(d=>s.age>=d.min&&s.age<=d.max&&!q.completed.some(a=>a.type===d.id)&&s.people.some(p=>p.alive&&p.age>=8&&d.roles.includes(p.role)));
 if(!options.length)return;
 const d=options[Math.floor(roll('type')*options.length)%options.length],people=s.people.filter(p=>p.alive&&p.age>=8&&d.roles.includes(p.role)).sort((a,b)=>a.id-b.id),p=people[Math.floor(roll('person')*people.length)%people.length];
 q.active={id:++q.serial,type:d.id,personId:p.id,personName:p.name,started:s.age,due:s.age,stage:0,choices:[],score:0};q.lastOpened=s.age;ctx.add(s,d.title+' begins with '+p.name+'.','story');
}
function reaction(p,path){const personality=p.world?.personality;
 if(path==='connect')return personality==='Independent'?{bond:0,text:'They appreciate being heard, but want room to decide.'}:{bond:2,text:'They feel that you made time for them.'};
 if(path==='boundary')return personality==='Independent'||personality==='Cautious'?{bond:3,text:'They respect the clarity of your boundary.'}:{bond:-1,text:'They need time to understand your distance.'};
 return personality==='Competitive'||personality==='Driven'?{bond:3,text:'They respect your willingness to be direct.'}:{bond:-2,text:'They find your directness difficult to accept.'};
}
export function dramaCommands(s){const q=state(s),a=q.active,out=[];if(!s.alive||s.justice?.years>0||s.justice?.case)return out;
 if(a&&s.age>=a.due&&person(s,a.personId))for(const [i,c] of scene(a).choices.entries())out.push({id:'drama:choose:'+i,label:c.label,detail:type(a.type).title+' · chapter '+(a.stage+1),enabled:s.actions>0});
 if(a)out.push({id:'drama:leave',label:'Close this story',detail:'Keep an unfinished record; one activity',enabled:s.actions>0});
 for(const x of q.archive.slice(-5).filter(x=>!q.discovered.includes(x.key)))out.push({id:'drama:discover:'+x.key,label:'Read '+x.ancestor+'’s family record',detail:x.title+' · a memory, not a living person',enabled:s.age>=12&&s.actions>0});
 return out;
}
export function dramaAct(s,id,ctx){if(!dramaCommands({...s,actions:s.actions+1}).some(c=>c.id===id&&c.enabled))throw Error('Story decision unavailable.');const q=s.dramaticStories??=fresh(),[,tag,arg]=id.split(':'),a=q.active;
 if(tag==='discover'){const x=q.archive.find(x=>x.key===arg);q.discovered.push(x.key);ctx.change(s,'knowledge',3);ctx.change(s,'happiness',1);ctx.add(s,'Discovered '+x.ancestor+'’s memory of '+x.title+': '+x.outcome+'.','story');return;}
 if(tag==='leave'){complete(s,q,a,'unfinished',ctx);return;}
 const p=person(s,a.personId),d=type(a.type),c=scene(a).choices[Number(arg)],r=reaction(p,c.path);ctx.bond(s,p,c.bond+r.bond,d.title+': '+c.label);ctx.change(s,c.stat,c.delta);a.score+=c.bond+r.bond;a.choices.push({age:s.age,index:Number(arg),path:c.path,label:c.label,reaction:r.text,...(d.nodes?{scene:scene(a).title}:{})});a.stage++;
 if(a.stage===3){const outcome=a.score>=20?'reconnected':a.score>=8?'changed understanding':'unresolved distance';complete(s,q,a,outcome,ctx);}
 else a.due=s.age+1+Math.floor(hash(s.lifeId+':'+a.id+':'+a.stage)*2);
}
export function dramaView(s){const q=state(s),a=q.active,p=a&&person(s,a.personId),d=a&&type(a.type),previous=a?.choices.at(-1);return {active:a?{...a,title:d.title,ready:!!p&&s.age>=a.due,sceneTitle:scene(a).title||null,branching:!!d.nodes,prompt:(previous?(previous.path==='connect'?'Your earlier kindness is remembered. ':previous.path==='boundary'?'Your earlier boundary still shapes the conversation. ':'Your earlier directness still shapes the conversation. '):'')+scene(a).prompt.replaceAll('{name}',a.personName)}:null,completed:q.completed.slice(-5).reverse().map(a=>({...a,title:type(a.type).title})),archive:q.archive.slice(-5).reverse().map(x=>({...x,read:q.discovered.includes(x.key)}))};}
export function inheritDrama(next,old){if(!old.dramaticStories)return;const prev=state(old),q=fresh();const entries=[...prev.completed,...(prev.active?[{...prev.active,outcome:'unfinished'}]:[])].slice(-4).map(a=>({key:'g'+old.generation+'-'+a.id,ancestor:old.name,title:type(a.type).title,outcome:a.outcome,lastChoice:a.choices.at(-1)?.label||'No decision recorded',...(type(a.type).nodes?{branchEnding:a.choices.at(-1)?.scene||'Unfinished chapter'}:{})}));q.archive=[...prev.archive,...entries].slice(-12);next.dramaticStories=q;}
export function validateDrama(s){const q=s.dramaticStories;if(q===undefined)return true;const outcomes=['unfinished','faded','reconnected','changed understanding','unresolved distance'];const record=a=>a&&int(a.id)&&a.id>0&&a.id<=q.serial&&type(a.type)&&int(a.personId)&&typeof a.personName==='string'&&age(a.started)&&int(a.due)&&a.due>=a.started&&int(a.stage)&&a.stage<=3&&Number.isInteger(a.score)&&Math.abs(a.score)<=40&&Array.isArray(a.choices)&&a.choices.length===a.stage&&a.choices.every(c=>c&&age(c.age)&&int(c.index)&&c.index<3&&['connect','boundary','challenge'].includes(c.path)&&typeof c.label==='string'&&typeof c.reaction==='string');
 return !!q&&q.version===1&&int(q.serial)&&[q.lastYear,q.lastOpened].every(n=>n===null||age(n))&&(!q.active||record(q.active)&&q.active.stage<3&&s.people.some(p=>p.id===q.active.personId))&&Array.isArray(q.completed)&&q.completed.length<=16&&q.completed.every(a=>record(a)&&outcomes.includes(a.outcome)&&age(a.ended))&&Array.isArray(q.archive)&&q.archive.length<=12&&q.archive.every(a=>a&&typeof a.key==='string'&&typeof a.ancestor==='string'&&typeof a.title==='string'&&outcomes.includes(a.outcome)&&typeof a.lastChoice==='string')&&Array.isArray(q.discovered)&&new Set(q.discovered).size===q.discovered.length&&q.discovered.every(k=>q.archive.some(a=>a.key===k));}
