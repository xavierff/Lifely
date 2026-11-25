// Lifely Ripple Engine — original, authored follow-up stories with measurable consequences.
// Saved on the character (version 2). Never depends on remote services or extra RNG.
// Each story is born from a real scenario choice, then requires further choices over years.

const rippleStories={
 trust:{title:"The promise that stayed",description:"A relationship remembers how you responded when someone needed you.",tags:["relationship","family","personal"],
 chapters:[
 {title:"An unanswered message",body:"Someone affected by your earlier decision reaches out. They remember what you said, but they need to see whether your actions match it.",choices:[
 ["Make time and follow through",{kindness:4,social:3,bond:9},2],
 ["Explain your limits and set a real date",{confidence:4,bond:5},1],
 ["Ignore the message and hope it passes",{stress:4,bond:-9},-2]]},
 {title:"Trust is tested",body:"The person needs help again. This time, the timing is inconvenient and their expectations are more specific.",choices:[
 ["Show up even though it costs you",{cash:-350,bond:12,kindness:4},2],
 ["Share responsibility with someone else",{social:5,bond:6},1],
 ["Accuse them of asking too much",{stress:5,bond:-12},-2]]},
 {title:"What remains",body:"Years after the first choice, the person asks how you want to move forward. This conversation will shape the relationship's lasting memory.",choices:[
 ["Make a lasting, realistic commitment",{bond:14,kindness:5},2],
 ["Stay close without promising too much",{bond:7,confidence:3},1],
 ["End the commitment without discussion",{bond:-16,stress:6},-2]]}]},
 recovery:{title:"The road back",description:"Your wellbeing cannot be settled by a single short-term decision.",tags:["health","personal"],
 chapters:[
 {title:"Listening to the warning",body:"A difficult period has left you run down. Recovery requires changes you can actually maintain.",choices:[
 ["Make a measured recovery plan",{health:5,stress:-5,cash:-250},2],
 ["Speak with someone you trust",{health:3,social:3},1],
 ["Push through without rest",{health:-6,stress:8},-2]]},
 {title:"A setback in the plan",body:"You feel better, but old obligations return. The next few years could make this a turning point.",choices:[
 ["Protect the time needed for recovery",{health:8,stress:-4,cash:-450},2],
 ["Reduce your commitments temporarily",{health:5,confidence:3},1],
 ["Pretend the problem has vanished",{health:-8,stress:8},-2]]},
 {title:"A sustainable future",body:"Your routines have changed. The final decision is whether to keep the habits that helped you regain stability.",choices:[
 ["Keep the manageable habits",{health:9,stress:-5},2],
 ["Build more flexibility into your routine",{health:4,happiness:5},1],
 ["Return immediately to your old pace",{health:-5,stress:9},-2]]}]},
 financial:{title:"The cost of a decision",description:"A financial choice echoes through your savings, debt and relationships.",tags:["money","business","career"],
 chapters:[
 {title:"The overlooked bill",body:"A previous choice has left a future cost that was easy to underestimate. You have a chance to plan before it grows.",choices:[
 ["Reserve money and face the numbers",{cash:-450,knowledge:4,stress:-3},2],
 ["Ask for a fairer payment schedule",{financialSkill:6,stress:3},1],
 ["Put the notice aside",{debt:500,stress:5},-2]]},
 {title:"An offer with strings",body:"Someone offers a shortcut out of the financial problem, but the terms favor them unless you ask questions.",choices:[
 ["Negotiate transparent, modest terms",{financialSkill:6,cash:-500,confidence:4},2],
 ["Accept limited help with a deadline",{cash:400,stress:3},1],
 ["Take the full risky offer",{cash:1800,debt:3000,stress:9},-2]]},
 {title:"The long-term balance",body:"The original decision still shapes your financial freedom. A final choice can build stability or pass the burden forward.",choices:[
 ["Settle the outstanding responsibility",{cash:-1000,financialSkill:8,reputation:4},2],
 ["Put an affordable plan in writing",{cash:-250,financialSkill:5},1],
 ["Avoid the final settlement",{debt:1200,reputation:-6},-2]]}]},
 career:{title:"The reputation you build",description:"A professional choice changes how colleagues see you years later.",tags:["career","business","personal"],
 chapters:[
 {title:"The old colleague",body:"A colleague from your earlier decision asks whether you meant what you said about professional fairness.",choices:[
 ["Acknowledge their work openly",{reputation:5,kindness:4},2],
 ["Discuss a practical compromise",{reputation:3,knowledge:3},1],
 ["Take sole credit and move on",{reputation:-7,confidence:4},-2]]},
 {title:"A promotion with a catch",body:"Your opportunity to advance could come at the expense of someone who helped you.",choices:[
 ["Advocate for a fair process",{reputation:8,social:3},2],
 ["Negotiate recognition for everyone",{reputation:5,stress:2},1],
 ["Undermine your competitor privately",{reputation:-10,stress:6},-2]]},
 {title:"Professional legacy",body:"A younger worker asks what you learned about handling influence and responsibility.",choices:[
 ["Mentor them with real examples",{knowledge:5,reputation:7,kindness:5},2],
 ["Share a concise piece of advice",{knowledge:4,reputation:3},1],
 ["Dismiss their concerns",{reputation:-6,social:-4},-2]]}]},
 public:{title:"A story the world remembers",description:"Your public conduct has consequences long after the original attention fades.",tags:["politics","entertainment","fame","personal"],
 chapters:[
 {title:"The missing context",body:"A journalist asks about the decision that attracted attention. You can provide context without exposing other people's private lives.",choices:[
 ["Give a careful, factual account",{reputation:7,confidence:4},2],
 ["Ask for time to verify details",{knowledge:4,reputation:3},1],
 ["Make an accusation you cannot support",{reputation:-10,stress:7},-2]]},
 {title:"The second headline",body:"Old rumors are repeated just as a new opportunity arrives. How you respond could affect your reputation for years.",choices:[
 ["Publish a transparent update",{reputation:9,stress:-3},2],
 ["Have a measured, direct conversation",{social:6,reputation:4},1],
 ["Escalate the dispute publicly",{reputation:-12,stress:9},-2]]},
 {title:"What people recall",body:"You are offered a chance to explain what the episode taught you. The final response will define this part of your story.",choices:[
 ["Accept responsibility where appropriate",{reputation:10,kindness:4},2],
 ["Explain your changed perspective",{reputation:6,confidence:4},1],
 ["Blame everyone else again",{reputation:-12,social:-5},-2]]}]},
 creative:{title:"Who owns the creation?",description:"A creative opportunity becomes a years-long collaboration.",tags:["entertainment","personal","career"],
 chapters:[
 {title:"A collaborator returns",body:"Someone who contributed to your earlier creative idea asks how they will be credited in the next version.",choices:[
 ["Write a fair credit agreement",{creativity:5,reputation:5,cash:-250},2],
 ["Arrange a conversation about ownership",{creativity:4,social:4},1],
 ["Dismiss their contribution",{creativity:-5,reputation:-8},-2]]},
 {title:"The difficult release",body:"Your joint project is almost ready, but the other creator believes a key detail has been changed without consent.",choices:[
 ["Review the work together",{creativity:8,reputation:4,cash:-350},2],
 ["Offer a limited compromise",{creativity:5,confidence:3},1],
 ["Publish without telling them",{creativity:3,reputation:-11,stress:5},-2]]},
 {title:"A shared achievement",body:"The creation is finally being discussed publicly. Your final decision determines whether the collaboration stays healthy.",choices:[
 ["Share recognition and future earnings",{creativity:8,reputation:8,cash:-500},2],
 ["Credit everyone and conclude the project",{creativity:5,reputation:4},1],
 ["Claim it as your work alone",{cash:750,reputation:-13},-2]]}]},
 community:{title:"A promise to the neighborhood",description:"Help offered to others needs ongoing care, resources and consent.",tags:["family","personal","legacy","world-drama"],
 chapters:[
 {title:"A request for continuity",body:"People who benefited from your earlier choice ask whether the help can continue after the first excitement fades.",choices:[
 ["Design a realistic volunteer rota",{kindness:6,social:5,cash:-350},2],
 ["Ask what help is genuinely needed",{kindness:4,knowledge:4},1],
 ["Leave everyone without notice",{kindness:-7,reputation:-5},-2]]},
 {title:"A disagreement about priorities",body:"The people involved want different outcomes, and your original solution no longer fits everyone.",choices:[
 ["Listen to the people affected",{kindness:7,reputation:5},2],
 ["Offer a small, transparent trial",{cash:-500,knowledge:5},1],
 ["Impose your own preferred plan",{social:-6,reputation:-7},-2]]},
 {title:"Passing on responsibility",body:"A community effort can either continue sustainably or depend forever on your direct attention.",choices:[
 ["Support a new local leader",{kindness:9,reputation:7,cash:-450},2],
 ["Document the work and step aside",{knowledge:6,reputation:3},1],
 ["Walk away without sharing records",{reputation:-8,kindness:-5},-2]]}]},
 family:{title:"An inherited disagreement",description:"A difficult family choice resurfaces when the next generation asks what happened.",tags:["family","legacy","relationship"],
 chapters:[
 {title:"A relative asks why",body:"A younger relative has heard two different versions of a family decision you were involved in.",choices:[
 ["Tell the whole story without blaming",{bond:9,kindness:4},2],
 ["Help them consult several relatives",{bond:6,knowledge:4},1],
 ["Order them not to discuss it",{bond:-10,stress:4},-2]]},
 {title:"A family responsibility",body:"A practical request reveals that a past disagreement was never fully settled.",choices:[
 ["Discuss fair expectations together",{bond:12,cash:-400},2],
 ["Set boundaries with mutual respect",{bond:5,confidence:4},1],
 ["Make an ultimatum",{bond:-13,stress:5},-2]]},
 {title:"What the children remember",body:"Family members want to write down what they learned so that future generations can make their own decisions.",choices:[
 ["Preserve a balanced family record",{bond:13,knowledge:5,kindness:3},2],
 ["Keep the memories private but accessible",{bond:7,confidence:3},1],
 ["Erase the dispute from the story",{bond:-11,reputation:-4},-2]]}]}
};
const rippleClamp=(n)=>Math.max(0,Math.min(100,Math.round(n)));
export const rippleTypes=Object.keys(rippleStories);
export function ensureRipples(s){
 return s.ripples??={version:1,active:[],completed:[],journal:[],started:0,lastStartedAge:-999,typeLast:{}};
}
export function rippleView(s){
 const r=s.ripples||{active:[],completed:[],journal:[],started:0};
 return {active:(r.active||[]).map(t=>{const def=rippleStories[t.type];const chapter=def.chapters[Math.min(2,t.stage)];
  return {...t,chapterTitle:chapter.title,chapterText:chapter.body,ready:s.age>=t.nextAge,yearsUntil:Math.max(0,t.nextAge-s.age),choices:chapter.choices.map(([text,effects,points],i)=>({index:i,text,cost:Math.max(0,-(effects.cash||0))}))};
 }),completed:r.completed||[],journal:r.journal||[],started:r.started||0};
}
const sourceType=(e,choice,s,category)=>{
 const x=choice.effects||{},cat=category||e.category||"";
 const types=[];
 if((x.bond||0)!==0&&s.people.some(p=>p.alive))types.push("trust");
 if((x.health||0)<=-4||(x.stress||0)>=7)types.push("recovery");
 if(s.age>=18&&((x.cash||0)<=-400||(x.debt||0)>=300))types.push("financial");
 if(s.age>=18&&(cat==="career"||cat==="business"||(x.jobLoss||0)>0))types.push("career");
 if((x.reputation||0)<=-5||(x.legalRisk||0)>0||cat==="politics")types.push("public");
 if(s.age>=18&&((x.creativity||0)>=5||cat==="entertainment"))types.push("creative");
 if((x.kindness||0)>=5&&s.age>=16)types.push("community");
 if(s.people.some(p=>p.alive)&&["family","legacy","relationship"].includes(cat))types.push("family");
 const preferred={career:"career",business:"financial",money:"financial",health:"recovery",relationship:"trust",family:"family",legacy:"family",entertainment:"creative",fame:"public",politics:"public",social:"trust",community:"community"}[cat];
 return preferred&&types.includes(preferred)?[preferred,...types.filter(t=>t!==preferred)]:types;
};
export function rippleFromChoice(s,event,index,choice,category){
 if(s.age<16)return null;
 const r=ensureRipples(s),types=sourceType(event,choice,s,category);
 if(r.active.length>=3||s.age-r.lastStartedAge<3||!types.length)return null;
 const eligible=types.filter(type=>!(r.active.some(t=>t.type===type))&&s.age-(r.typeLast[type]??-999)>=7);
 if(!eligible.length)return null;
 // Deliberately no RNG consumption: replay and save/load stay deterministic.
 const type=eligible[0],def=rippleStories[type];
 const conflict=event.cast==="family"?s.world?.characters?.conflicts?.find(c=>c.status==="open"):null;
 const personId=conflict?.personId;
 const matched=s.people.find(p=>p.id===personId&&p.alive);
 const requested=["partner","child","parent","friend","sibling"].includes(event.requires)?s.people.find(p=>p.role===event.requires&&p.alive):null;
 const relative=matched||requested||["partner","child","friend","sibling","parent"].map(role=>s.people.find(p=>p.role===role&&p.alive)).find(Boolean)||null;
 const id="r"+r.started+"-"+event.id+"-"+s.age;
 const story={id,type,title:def.title,sourceTitle:event.title,sourceChoice:choice.text,startedAge:s.age,nextAge:s.age+1,stage:0,score:0,choices:[],contactId:relative?.id??null,contactName:relative?.name??null,originGeneration:s.generation,ownerName:s.name,status:"active"};
 r.active.push(story);r.started++;r.lastStartedAge=s.age;r.typeLast[type]=s.age;
 const line={age:s.age,id,text:"A longer story began after '"+event.title+"': "+def.title+"."};
 r.journal.push(line);if(r.journal.length>70)r.journal.shift();
 return {id,title:def.title,dueAge:story.nextAge};
}
export function rippleCommands(s){
 if(!s.alive||s.pending!==null||s.mini||s.world?.network?.conversation)return [];
 const r=rippleView(s),out=[];
 for(const story of r.active){
  if(!story.ready)continue;
  for(const c of story.choices){
   out.push({id:"ripple:"+story.id+":"+c.index,label:c.text,detail:story.chapterTitle+(c.cost?" · $"+c.cost.toLocaleString("en-US"):" · no fee"),enabled:s.actions>0&&(s.justice?.years||0)===0&&!s.justice?.case&&s.cash>=c.cost});
  }
 }
 return out;
}
const rippleFinish=(s,t,outcome,ctx,why)=>{
 const r=ensureRipples(s),def=rippleStories[t.type];
 const record={...t,title:def.title,status:"completed",outcome,endedAge:s.age,finishReason:why};
 r.completed.push(record);r.completed=r.completed.slice(-65);
 r.active=r.active.filter(x=>x.id!==t.id);
 r.journal.push({id:t.id,age:s.age,text:def.title+" ended: "+outcome+"."});
 r.journal=r.journal.slice(-70);
 if(outcome==="fulfilled"){ctx.change(s,"reputation",4);ctx.change(s,"happiness",3);}
 if(outcome==="neglected"){ctx.change(s,"stress",4);ctx.change(s,"reputation",-4);}
 s.world??={};s.world.news??=[];
 s.world.news.push({age:s.age,text:record.title+" — "+outcome,domain:"ripples"});s.world.news=s.world.news.slice(-32);
 ctx.add(s,def.title+": "+outcome+".","ripple");
};
export function rippleAct(s,id,ctx){
 const r=ensureRipples(s),parts=id.split(":"),thread=parts[1],n=Number(parts[2]);
 if(parts.length!==3||parts[0]!=="ripple"||!Number.isInteger(n)||n<0||n>2)throw Error("Invalid story decision.");
 const t=r.active.find(x=>x.id===thread);if(!t||s.age<t.nextAge||s.age>110)throw Error("This story chapter is not ready.");
 const stage=rippleStories[t.type].chapters[t.stage],choice=stage?.choices[n];
 if(!choice||!rippleCommands({...s,actions:s.actions+1}).some(c=>c.id===id&&c.enabled))throw Error("This story choice is not available.");
 const [label,effects,points]=choice;
 for(const [k,v] of Object.entries(effects)){
  if(k==="cash"){if(v<0)ctx.spend(s,-v);else s.cash+=v;}
  else if(k==="debt")s.debt+=v;
  else if(k==="financialSkill")s.financialSkill=rippleClamp((s.financialSkill||0)+v);
  else if(k==="bond"){const person=s.people.find(x=>x.id===t.contactId&&x.alive);if(person)ctx.bond(s,person,v,label);}
  else ctx.change(s,k,v);
 }
 t.choices.push({age:s.age,stage:t.stage,index:n,label,points});t.score+=points;t.stage++;
 ctx.add(s,t.title+" — "+label+".","ripple");
 if(t.stage>=3){rippleFinish(s,t,t.score>=4?"fulfilled":t.score>=0?"complicated":"neglected",ctx,"player");}
 else{t.nextAge=s.age+2;r.journal.push({id:t.id,age:s.age,text:t.title+": chapter "+t.stage+" completed. Next due at age "+t.nextAge+"."});r.journal=r.journal.slice(-70);}
 return s;
}
export function rippleYear(s,ctx){
 const r=ensureRipples(s);
 for(const t of [...r.active]){
  if(s.age>t.nextAge+4){
   const person=s.people.find(x=>x.id===t.contactId&&x.alive);
   if(person)ctx.bond(s,person,-5,"An unfinished promise was neglected.");
   rippleFinish(s,t,"neglected",ctx,"deadline");
  }
 }
 return s;
}
export function rippleInheritance(next,prior){
 const source=prior.ripples;if(!source)return next;
 const r=ensureRipples(next);
 r.started=source.started||0;
 r.completed=(source.completed||[]).slice(-45).map(t=>({...t}));
 r.journal=(source.journal||[]).slice(-40);
 const inherited=(source.active||[]).filter(t=>["family","community","trust"].includes(t.type)).slice(0,2);
 r.active=inherited.map(t=>({...t,ownerName:next.name,originGeneration:t.originGeneration||prior.generation,stage:Math.min(t.stage,2),nextAge:next.age+2,contactId:next.people.find(p=>p.alive&&p.name===t.contactName)?.id??null,transferredFrom:prior.name}));
 for(const t of (source.active||[]).filter(t=>!inherited.includes(t))){
  r.completed.push({...t,status:"completed",outcome:"inherited memory",endedAge:prior.age,finishReason:"generation"});
 }
 r.completed=r.completed.slice(-65);
 r.lastStartedAge=next.age-2;r.typeLast={};
 return next;
}
export function rippleRecap(s){
 const r=rippleView(s),outcomes={fulfilled:0,complicated:0,neglected:0,other:0};
 for(const t of r.completed)outcomes[t.outcome]!==undefined?outcomes[t.outcome]++:outcomes.other++;
 return {begun:r.started,resolved:r.completed.length,ongoing:r.active.length,outcomes,latest:r.completed.slice(-5).reverse()};
}
