// Offline, version-2-save-compatible dialogue and autonomous social graph.
// Branches are authored rather than generated remotely. The engine owns validation and saving.
const hash=text=>{let h=2166136261;for(let i=0;i<String(text).length;i++)h=Math.imul(h^String(text).charCodeAt(i),16777619)>>>0;return h>>>0;};
const bound=(v)=>Math.max(0,Math.min(100,Math.round(v)));
const origin=[
 "grew up watching a parent rebuild a failing shop",
 "used to keep notebooks of imaginary journeys",
 "was mentored by someone who expected nothing in return",
 "spent their early years moving between neighborhoods",
 "learned to work with people who disagreed strongly",
 "once missed a chance because of an unfinished promise",
 "learned patience while caring for an older relative",
 "was the quietest member of an ambitious household"
];
const motivation=[
 "to earn trust without giving up independence",
 "to create something worth handing down",
 "to find people who stay when things become difficult",
 "to succeed without taking credit from others",
 "to keep an important promise to family",
 "to become more than a single professional title",
 "to repair a relationship they once neglected",
 "to choose a future rather than repeat the past"
];
const privateMemory=[
 "An old friend once defended them when nobody else would.",
 "They worry that a major achievement came at the cost of a friendship.",
 "A family promise still affects how they make decisions.",
 "They want to reconnect with someone they pushed away.",
 "They once changed direction after making a serious mistake.",
 "They hope to become a more dependable person than they used to be."
];
const dialogueThemes=[
 {id:"trust",title:"What trust costs",
  open:"I trusted someone with something important, and it changed how I see people. Do you think trust can be rebuilt?",
  middle:[
   "I appreciate that you took my feelings seriously. I am not sure what to do with that hope.",
   "You noticed the part I have been avoiding. I can explain more if you want.",
   "That is difficult to hear. I was hoping for understanding, but I can still listen."
  ],close:[
   "I might be ready to tell the other person what happened. How would you approach them?",
   "I have been carrying both anger and loyalty. What would a fair next step look like?",
   "We see this differently. How do we leave the conversation without hurting each other?"
  ]},
 {id:"ambition",title:"A difficult ambition",
  open:"I have a chance to pursue my dream, but someone close to me thinks I am being selfish. What would you do?",
  middle:[
   "It helps to hear that wanting something for myself does not have to mean abandoning people.",
   "The question is whether the opportunity still fits the life I want.",
   "I feel challenged. Maybe I have been rushing other people to accept my plan."
  ],close:[
   "If I take this opportunity, I will have to make a promise I can actually keep.",
   "I want to make a decision that I can explain honestly five years from now.",
   "This conversation has made the stakes clearer, even though we do not agree."
  ]},
 {id:"belonging",title:"Where I belong",
  open:"Everyone seems to have an idea of who I should become. Sometimes I don't know which part is really me.",
  middle:[
   "You made room for me to be uncertain, and that matters.",
   "You are asking questions that nobody else has asked me.",
   "Your answer stung a little. I still want to tell you what I have been feeling."
  ],close:[
   "Maybe I need to tell someone what I really want instead of pretending everything is settled.",
   "I wonder if I can build a home around people rather than expectations.",
   "Even a disagreement can teach me where my boundaries are."
  ]},
 {id:"setback",title:"A setback nobody saw",
  open:"Something I worked on for years didn't turn out as planned. I have been telling everyone it was fine.",
  middle:[
   "Thank you for not treating this as a failure of character.",
   "You are right to ask what I can learn from it. I keep avoiding that part.",
   "It is hard not to feel judged, even when someone is trying to help."
  ],close:[
   "I think I can start again, but I need to decide what to do differently.",
   "I may need to apologize to someone who carried the consequences with me.",
   "I am still hurting. I would rather end this conversation carefully."
  ]},
 {id:"loyalty",title:"Caught between friends",
  open:"Two people I care about have fallen out. Each says supporting the other would be a betrayal.",
  middle:[
   "That would let me keep my own judgment without abandoning them.",
   "Maybe I should stop passing messages between them and ask what each really needs.",
   "I know you disagree with my approach. I am trying not to make the situation worse."
  ],close:[
   "I think I know who needs an honest conversation from me now.",
   "I need to stop promising both sides exactly what they want to hear.",
   "I do not want this disagreement to become another broken friendship."
  ]},
 {id:"legacy",title:"A promise to the future",
  open:"A relative left me something meaningful, but they also left expectations I never agreed to. Is legacy a gift or a burden?",
  middle:[
   "Maybe keeping the spirit of a promise is different from copying every detail.",
   "You are helping me separate what happened from what I assumed it meant.",
   "I am not convinced, but I want to understand what you mean."
  ],close:[
   "I could document the story and allow the next generation to make its own decision.",
   "I wonder whether a new interpretation would still honor the person who came before me.",
   "We may never settle this today. Perhaps honesty is the most important part."
  ]}
];
const opening=[
 {text:"Listen first and take their concern seriously.",tone:"support",bond:7,trust:7,kindness:3},
 {text:"Ask what happened before offering advice.",tone:"curious",bond:3,trust:5,social:4},
 {text:"Challenge the assumption behind their worry.",tone:"direct",bond:-4,trust:-3,confidence:5}
];
const middle=[
 {text:"Offer to help them plan a practical next step.",tone:"support",bond:7,trust:7,kindness:3},
 {text:"Ask how other people were affected.",tone:"curious",bond:3,trust:4,social:4},
 {text:"Say what you disagree with, without pretending.",tone:"direct",bond:-3,trust:-2,confidence:5}
];
const endings=[
 {text:"Make a specific, realistic promise to stay in touch.",tone:"support",bond:9,trust:8,kindness:4},
 {text:"Respect their freedom to decide and check back later.",tone:"curious",bond:5,trust:6,social:4},
 {text:"Be clear about your boundaries and end the discussion.",tone:"direct",bond:-3,trust:-3,confidence:5}
];
const turns=[opening,middle,endings];
const idKey=s=>String(s.lifeId||s.name||"unknown");
const hashPick=(s,key,len)=>hash(idKey(s)+":"+key)%len;
export function conversationPeople(s){
 const c=s.world?.characters||{},p=(s.people||[]).filter(a=>a.alive).map(a=>({id:"person-"+a.id,name:a.name,kind:"person",role:a.role,age:a.age,source:a}));
 const actors=[...(c.athletes||[]).map(a=>({...a,kind:"athlete"})),...(c.politicians||[]).map(a=>({...a,kind:"politician"})),...(c.agents||[]).map(a=>({...a,kind:"agent"}))];
 return [...p,...actors];
}
const findPerson=(s,id)=>conversationPeople(s).find(p=>p.id===id);
export function originalHistory(s,id){
 const p=findPerson(s,id);if(!p)return null;
 const profile=p.source?.world||p;
 const i=hashPick(s,id+":origin",origin.length),j=hashPick(s,id+":motivation",motivation.length),k=hashPick(s,id+":memory",privateMemory.length);
 return {id,name:p.name,role:p.role||p.kind,personality:profile.personality||"Thoughtful",
   ambition:profile.ambition||p.specialty||p.party||p.sport||"Building a future",
   origin:origin[i],motivation:motivation[j],privateMemory:privateMemory[k],memoryRevealed:false};
}
export function networkView(s){return s.world?.network||{version:1,edges:[],news:[],dialogues:[],histories:{},talked:{},lastEvent:null,archives:[],conversation:null};}
export function ensureNetwork(s){
 s.world??={};
 let n=s.world.network??={version:1,edges:[],news:[],dialogues:[],histories:{},talked:{},lastEvent:null,archives:[],conversation:null};
 n.edges??=[];n.news??=[];n.dialogues??=[];n.histories??={};n.talked??={};n.archives??=[];n.conversation??=null;return n;
}
export function networkProfile(s,id){
 const source=findPerson(s,id);if(!source)return null;
 const stored=networkView(s).histories?.[id];
 return {...originalHistory(s,id),...(stored||{})};
}
export function connectionsFor(s,id){return (networkView(s).edges||[]).filter(e=>e.a===id||e.b===id);}
export function conversationCommands(s){
 if(!s.alive||s.pending!==null||s.mini||s.world?.network?.conversation||(s.justice?.years||0)>0)return [];
 const n=networkView(s),canAct=(s.actions||0)>0,underCase=!!s.justice?.case;
 return conversationPeople(s).filter(p=>p.kind==="person"||s.age>=18).slice(0,48).map(p=>({
  id:"dialogue:open:"+p.id,
  label:"Talk with "+p.name,
  detail:(networkProfile(s,p.id)?.ambition||"Share a meaningful conversation")+" · 3 choices",
  enabled:canAct&&!underCase&&n.talked?.[p.id]!==s.age
 }));
}
export function beginDialogue(s,id){
 const target=findPerson(s,id);
 if(!target||!conversationCommands({...s,actions:s.actions+1}).some(a=>a.id==="dialogue:open:"+id&&a.enabled))throw Error("Conversation unavailable.");
 const n=ensureNetwork(s),themeIndex=hashPick(s,id+":talk:"+s.age,dialogueThemes.length);
 n.histories[id]??=originalHistory(s,id);
 n.talked[id]=s.age;
 n.conversation={id,theme:themeIndex,stage:0,tone:"neutral",choices:[],startedAge:s.age,speaker:target.name,transcript:[]};
 return s;
}
export function dialogueView(s){
 const d=networkView(s).conversation;if(!d)return null;
 const target=findPerson(s,d.id),theme=dialogueThemes[d.theme];
 if(!target||!theme)return null;
 const line=d.stage===0?theme.open:d.stage===1?theme.middle[["support","curious","direct"].indexOf(d.tone)]||theme.middle[1]:theme.close[["support","curious","direct"].indexOf(d.tone)]||theme.close[1];
 const choices=(turns[d.stage]||[]).map(c=>({text:c.text,tone:c.tone}));
 return {id:d.id,speaker:target.name,theme:theme.title,stage:d.stage,round:d.stage+1,total:3,subtext:"A conversation about "+theme.id,backstory:networkProfile(s,d.id),line,choices,transcript:d.transcript.slice(-4)};
}
function changeBond(s,id,amount,ctx){
 const p=findPerson(s,id);if(!p)return;
 if(p.kind==="person"){const original=s.people.find(a=>a.id===Number(id.slice(7)));if(original)ctx.bond(s,original,amount,"A meaningful conversation");}
 else{const obj=s.world.characters?.athletes?.find(a=>a.id===id)||s.world.characters?.politicians?.find(a=>a.id===id)||s.world.characters?.agents?.find(a=>a.id===id);
  if(obj){if(obj.trust!==undefined)obj.trust=bound(obj.trust+amount);if(obj.respect!==undefined)obj.respect=bound(obj.respect+amount);if(obj.rivalry!==undefined)obj.rivalry=bound(obj.rivalry-Math.round(amount*.7));}}
}
export function replyDialogue(s,index,ctx){
 const n=ensureNetwork(s),d=n.conversation;
 if(!s.alive||!d)throw Error("No active conversation.");
 if(index==="leave"){n.dialogues.push({age:s.age,id:d.id,speaker:d.speaker,theme:dialogueThemes[d.theme].title,choices:d.choices,complete:false});
  n.dialogues=n.dialogues.slice(-80);n.conversation=null;return s;}
 if(!Number.isInteger(index)||index<0||index>2)throw Error("Choose one of the three responses.");
 const choice=turns[d.stage]?.[index];if(!choice)throw Error("Invalid conversation stage.");
 changeBond(s,d.id,choice.bond,ctx);ctx.change(s,choice.kindness?"kindness":choice.social?"social":"confidence",choice.kindness||choice.social||choice.confidence);
 d.choices.push(index);d.transcript.push({turn:d.stage,text:choice.text,tone:choice.tone});
 d.tone=choice.tone;d.stage++;
 if(d.stage===2){n.histories[d.id]??=originalHistory(s,d.id);n.histories[d.id].memoryRevealed=true;}
 if(d.stage===3){const positive=d.choices.filter(i=>i===0).length,negative=d.choices.filter(i=>i===2).length;
  const outcome=positive>=2?"trusted":negative>=2?"strained":"understood";
  const record={age:s.age,id:d.id,speaker:d.speaker,theme:dialogueThemes[d.theme].title,choices:d.choices.slice(),outcome,complete:true};
  n.dialogues.push(record);n.dialogues=n.dialogues.slice(-80);
  if(outcome==="trusted"){ctx.change(s,"happiness",4);ctx.change(s,"social",3);}
  if(outcome==="strained")ctx.change(s,"stress",3);
  n.lastEvent={age:s.age,text:d.speaker+" left your conversation feeling "+outcome+".",kind:"dialogue"};
  ctx.add(s,n.lastEvent.text,"people");
  n.conversation=null;
 }
 return s;
}
function status(trust,loyalty,betrayal){if(betrayal)return "betrayed";if(trust>=75&&loyalty>=65)return "allies";if(trust>=57)return "friends";if(trust<=24)return "estranged";if(trust<=40)return "rivals";return "acquaintances";}
const pairKey=(a,b)=>[a,b].sort().join("|");
function pushNews(s,record,ctx){
 const n=ensureNetwork(s);n.news.push(record);n.news=n.news.slice(-55);n.lastEvent=record;
 s.world.news??=[];s.world.news.push({age:s.age,text:record.text,domain:"relationships"});s.world.news=s.world.news.slice(-32);
 ctx.add(s,record.text,"world");
}
export function relationshipYear(s,ctx){
 if(s.age<13)return s;
 const n=ensureNetwork(s),nodes=conversationPeople(s).filter(p=>p.age===undefined||p.age>=12).slice(0,30);
 if(nodes.length<2)return s;
 // Autonomous meetings are evaluated every year, independent of player dialogue.
 for(let j=0;j<2;j++){
  const a=nodes[Math.floor(ctx.rng(s)*nodes.length)],b=nodes[Math.floor(ctx.rng(s)*nodes.length)];
  if(!a||!b||a.id===b.id)continue;
  const key=pairKey(a.id,b.id);let e=n.edges.find(e=>e.key===key);
  if(!e){if(n.edges.length>=64)continue;
   const affinity=hashPick(s,key+":affinity",51)-25;
   const initial=bound(51+affinity),loyalty=bound(48+Math.floor(affinity*.5));
   e={key,a:a.id,b:b.id,firstMetAge:s.age,trust:initial,loyalty,status:status(initial,loyalty,false),betrayals:0,years:0,memories:[]};n.edges.push(e);
  }
  const previous=e.status,change=Math.round((ctx.rng(s)-.46)*18);
  e.trust=bound(e.trust+change);
  e.loyalty=bound(e.loyalty+(change>=0?2:-3)+(ctx.rng(s)<.25?3:0));
  e.years++;
  if((previous==="allies"||previous==="friends")&&e.trust>=48&&ctx.rng(s)<.035){
   e.trust=bound(e.trust-40);e.loyalty=bound(e.loyalty-45);e.betrayals++;
   e.memories.push({age:s.age,event:"A serious breach of trust"});
  }
  e.status=status(e.trust,e.loyalty,e.betrayals>0&&e.trust<42);
  if(e.status!==previous&&["allies","friends","estranged","betrayed"].includes(e.status)){
   // Relationships have consequences for both NPCs, not only narrative notifications.
   const upbeat=e.status==="allies"||e.status==="friends",delta=upbeat?5:e.status==="betrayed"?-11:-6;
   for(const id of [e.a,e.b]){
    const node=findPerson(s,id);if(!node)continue;
    if(node.kind==="person"){const relative=s.people.find(p=>p.id===Number(id.slice(7)));if(relative?.world){relative.world.joy=bound(relative.world.joy+delta);relative.world.trust=bound(relative.world.trust+(upbeat?3:-5));}}
    else if(node.kind==="athlete"){const athlete=s.world.characters?.athletes?.find(p=>p.id===id);if(athlete)athlete.form=bound(athlete.form+(upbeat?2:-4));}
    else if(node.kind==="politician"){const politician=s.world.characters?.politicians?.find(p=>p.id===id);if(politician)politician.approval=bound(politician.approval+(upbeat?3:-5));}
    else if(node.kind==="agent"){const agent=s.world.characters?.agents?.find(p=>p.id===id);if(agent)agent.network=bound(agent.network+(upbeat?3:-5));}
   }
   const name1=findPerson(s,e.a)?.name||"A former friend",name2=findPerson(s,e.b)?.name||"someone";
   let label=e.status==="allies"?"formed a lasting alliance":e.status==="friends"?"became close friends":e.status==="betrayed"?"suffered a betrayal":"grew apart";
   const record={age:s.age,text:(name1===name2?"Two people named "+name1:name1+" and "+name2)+" "+label+".",kind:e.status,between:[e.a,e.b]};
   e.memories.push({age:s.age,event:label});if(e.memories.length>8)e.memories.shift();
   if(n.news.filter(x=>x.age===s.age).length<2)pushNews(s,record,ctx);
  }
 }
 return s;
}
export function inheritNetwork(next,old){
 const former=old.world?.network;if(!former)return next;
 const n=ensureNetwork(next);
 n.archives=[...(former.archives||[]),...(former.news||[]).filter(e=>["allies","estranged","betrayed"].includes(e.kind))].slice(-50);
 // Only surviving family relationships map to this generation; everyone else is historical.
 const valid=new Set(conversationPeople(next).filter(p=>p.kind==="person").map(p=>p.id));
 n.edges=(former.edges||[]).filter(e=>valid.has(e.a)&&valid.has(e.b)).slice(-28).map(e=>({...e,memories:(e.memories||[]).slice(-5)}));
 n.talked={};n.conversation=null;n.histories={};
 n.lastEvent=null;return next;
}
