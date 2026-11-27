// Fictional celebrity projects and negotiated sponsorships; no external services.
const cap=n=>Math.max(0,Math.min(100,Math.round(n)));
const money=n=>Math.round(n),age=n=>Number.isInteger(n)&&n>=0&&n<=110,amount=n=>Number.isSafeInteger(n)&&n>=0;
const bounded=n=>Number.isInteger(n)&&n>=0&&n<=100;
const fmt=n=>'$'+n.toLocaleString('en-US');
const projectTypes=[
 {id:'film',path:'Film director',name:'Independent feature film',budget:6000,stat:'creativity',gross:15000,rounds:[
  ['Development','The screenplay is ambitious, but your ensemble has limited rehearsal time.',['Refine the story and rehearse','Invite cast input','Attempt the ambitious original version']],
  ['Production','The first cut reveals a pacing problem near the climax.',['Reshoot the essential sequence','Work with editors and actors','Try a daring stylistic change']],
  ['Premiere','The festival audience is waiting for your finished film.',['Polish the final cut','Credit the whole crew','Aim for a spectacular premiere']]]},
 {id:'acting',path:'Film actor',name:'Breakthrough screen role',budget:1500,stat:'confidence',gross:6500,rounds:[
  ['Audition','The director wants an interpretation different from the one you prepared.',['Study the character carefully','Discuss the director’s vision','Deliver an unexpected performance']],
  ['Filming','A scene partner is struggling with a complicated emotional exchange.',['Rehearse the difficult scene','Help your scene partner find their rhythm','Improvise a dramatic moment']],
  ['Premiere','The press asks what makes your role special.',['Explain your preparation','Recognize the ensemble','Make a bold personal statement']]]},
 {id:'album',path:'Recording musician',name:'Original studio album',budget:3500,stat:'creativity',gross:9000,rounds:[
  ['Writing','You must decide how to develop a promising but unfinished song.',['Refine the composition','Write with collaborators','Experiment with a new sound']],
  ['Recording','A recording session exposes a weakness in the arrangement.',['Perfect the difficult section','Invite the band’s ideas','Record an unconventional take']],
  ['Release','Your first listeners are divided about the album’s direction.',['Polish a cohesive release','Share the collaborators’ stories','Launch with an ambitious performance']]]}
];
export const celebrityProjects=projectTypes.map(({id,path,name,budget})=>({id,path,name,budget}));
const spec=id=>projectTypes.find(x=>x.id===id);
const empty=()=>({version:1,project:null,offer:null,sponsor:null,publicity:null,history:[],legacy:[],serial:0,lastProject:null,lastOffer:null,lastPublicity:null,projects:0,hits:0,contracts:0,fulfilled:0,failed:0,earned:0,fees:0,comebacks:0,trust:60,peakFame:0});
const state=s=>s.celebrity||empty(),ensure=s=>s.celebrity??=empty();
const ent=s=>s.world?.entertainment;
const active=s=>!!ent(s)?.path;
const agent=s=>{const ch=s.world?.characters;return ch?.agents?.find(a=>a.id===ch.agency?.agentId&&a.specialty===ent(s)?.path)||null;};
const sponsors=[
 {id:'creative',name:'Northlight Media',base:4200,fame:45,trust:55},
 {id:'premium',name:'Meridian Lifestyle',base:7500,fame:65,trust:65},
 {id:'global',name:'Atlas Creative Partners',base:12500,fame:80,trust:75}
];
const brand=id=>sponsors.find(x=>x.id===id);
const ready=s=>s.alive&&s.age>=18&&s.pending===null&&!s.mini&&!s.world?.network?.conversation&&!s.everydayScenes?.active&&!s.careerCampaigns?.active&&!s.hobbyCircuit?.active&&!s.world?.storyDirector?.active&&s.fate?.active?.status!=='playing'&&s.familyStories?.active?.status!=='ready'&&s.workplace?.active?.status!=='ready'&&s.worldPulse?.active?.status!=='ready'&&!(s.justice?.years>0)&&!s.justice?.case;
function log(s,kind,message,ctx){const m=ensure(s);m.history.push({id:++m.serial,age:s.age,kind,message:message.slice(0,200)});m.history=m.history.slice(-35);ctx.add(s,message,'career');}
function netPay(s,gross,ctx,immediate){
 const m=ensure(s),a=agent(s),fee=a?money(gross*a.commission/100):0,net=gross-fee;
 m.earned+=net;m.fees+=fee;
 if(a){const ch=s.world.characters.agency;ch.earned+=net;ch.fees+=fee;ch.deals++;a.projects++;}
 if(immediate)s.cash+=net;return net;
}
export function celebrityCommands(s,c){
 if(!ready(s)||!active(s))return [];
 const m=state(s),e=ent(s),out=[],put=(id,label,detail,ok=true)=>out.push({id:'celebrity:'+id,label,detail,enabled:!!(s.actions>0&&ok)});
 if(!m.project){
  for(const d of projectTypes.filter(x=>x.path===e.path))put('project:start:'+d.id,'Develop '+d.name,fmt(money(d.budget*c.cost))+' · three decisions over up to three years',s.cash>=money(d.budget*c.cost)&&m.lastProject!==s.age);
 }else if(spec(m.project.kind)?.path===e.path){
  const p=m.project,d=spec(p.kind),r=d.rounds[p.stage];
  for(let i=0;i<3;i++)put('project:choice:'+i,r[2][i],r[0]+' · '+['Preparation and craft','Collaboration and trust','High-risk creative approach'][i],s.age<=p.dueAge);
  put('project:abandon','Abandon production','The original production cost is not refunded');
 }
 if(!m.offer&&!m.sponsor){
  for(const b of sponsors)put('offer:request:'+b.id,'Request '+b.name+' sponsorship','Fame '+b.fame+' · public trust '+b.trust+' · two-year agreement',e.fame>=b.fame&&m.trust>=b.trust&&m.lastOffer!==s.age);
 }else if(m.offer){
  put('offer:accept','Accept '+brand(m.offer.brand).name+' agreement',fmt(m.offer.fee)+' per fulfilled year · two years',m.offer.path===e.path&&s.age<=m.offer.dueAge&&s.age<=108);
  put('offer:counter','Counter with higher compensation','Higher fee, stricter fame target; the brand may refuse',!m.offer.countered&&s.age<=m.offer.dueAge);
  put('offer:decline','Decline the sponsorship','No payment or penalty');
 }else if(m.sponsor){
  put('sponsor:deliver','Complete annual sponsor appearance','Fulfill this year’s contract obligation',m.sponsor.deliveredAge!==s.age&&s.age<m.sponsor.endAge);
  put('sponsor:exit','End sponsorship early','No future payment; existing earnings are retained');
 }
 if(m.publicity){
  for(const [id,label,detail] of [['account','Give a transparent interview','Restore public trust; acknowledge the issue'],['work','Let the next project speak','Build credibility through craft'],['silence','Step away from publicity','Reduce stress, but lose some visibility']])put('publicity:'+id,label,detail,m.lastPublicity!==s.age);
 }else put('publicity:interview','Give a media interview','Improve trust and public recognition',m.lastPublicity!==s.age&&e.fame>=35);
 return out;
}
export function celebrityAct(s,id,ctx,c){
 if(!celebrityCommands({...s,actions:s.actions+1},c).some(x=>x.id===id&&x.enabled))throw Error('Celebrity action unavailable.');
 const m=ensure(s),e=ent(s),[,section,verb,key]=id.split(':');
 if(section==='project'){
  if(verb==='start'){const d=spec(key);ctx.spend(s,money(d.budget*c.cost));m.project={kind:key,path:e.path,startedAge:s.age,dueAge:Math.min(110,s.age+3),stage:0,craft:35,collaboration:35,risk:0,choices:[]};m.lastProject=s.age;log(s,'project','Started '+d.name+'.',ctx);}
  else if(verb==='abandon'){m.project=null;log(s,'abandoned','Abandoned the unfinished creative project.',ctx);}
  else{
   const p=m.project,d=spec(p.kind),i=Number(key),skill=s.stats[d.stat],gain=money([19,12,25][i]+(skill-50)*.15+(ctx.rng(s)-.5)*(i===2?25:8));
   p.craft=cap(p.craft+gain);p.collaboration=cap(p.collaboration+[4,18,-3][i]);p.risk=cap(p.risk+[1,0,15][i]);p.choices.push(i);p.stage++;
   ctx.change(s,'stress',i===2?4:1);
   if(p.stage===3){
    const score=money(p.craft*.62+p.collaboration*.38-p.risk*.25),hit=score>=74,success=score>=58,gross=money(d.gross*c.salary*(hit?1.8:success?1:.25));
    const net=netPay(s,gross,ctx,true);m.projects++;if(hit)m.hits++;
    if(success){e.releases++;e.catalog+=d.id==='acting'?0:d.id==='film'?2:1;if(d.id==='acting')e.contracts++;e.fame=cap(e.fame+(hit?16:8));s.audience=(s.audience||0)+(hit?1800:700);m.trust=cap(m.trust+5);}
    else{e.fame=cap(e.fame-6);m.trust=cap(m.trust-3);}
    if(hit&&score>=85){e.awards++;log(s,'award',d.name+' earned an industry award.',ctx);}
    m.project=null;log(s,hit?'hit':success?'release':'flop',d.name+' — '+(hit?'breakthrough':success?'successful release':'mixed reception')+'; net earnings '+fmt(net)+'.',ctx);
   }
  }
 }
 if(section==='offer'){
  if(verb==='request'){const b=brand(key),a=agent(s);m.offer={brand:key,path:e.path,fee:money(b.base*c.salary*(1+(a?.network||0)*.002)),minFame:b.fame,minTrust:b.trust,dueAge:Math.min(110,s.age+2),countered:false};m.lastOffer=s.age;log(s,'offer',b.name+' offered a sponsorship.',ctx);}
  else if(verb==='decline'){m.offer=null;log(s,'declined','Declined the sponsorship offer.',ctx);}
  else if(verb==='counter'){const o=m.offer;o.countered=true;if(e.fame>=o.minFame+10&&m.trust>=o.minTrust+5){o.fee=money(o.fee*1.25);o.minFame=cap(o.minFame+10);log(s,'counter','The sponsor accepted higher compensation with a stricter fame requirement.',ctx);}else log(s,'counter','The sponsor declined the counteroffer; the original offer remains.',ctx);}
  else{const o=m.offer;m.sponsor={brand:o.brand,path:o.path,fee:o.fee,minFame:o.minFame,minTrust:o.minTrust,startAge:s.age,endAge:s.age+2,deliveredAge:null,paid:0,missed:0};m.offer=null;m.contracts++;e.deals++;log(s,'contract','Signed a two-year sponsorship with '+brand(o.brand).name+'.',ctx);}
 }
 if(section==='sponsor'){
  if(verb==='deliver'){m.sponsor.deliveredAge=s.age;ctx.change(s,'stress',3);m.trust=cap(m.trust+3);log(s,'appearance','Completed the sponsor appearance for this year.',ctx);}
  else{m.sponsor=null;m.failed++;log(s,'terminated','Ended sponsorship early; future compensation was forfeited.',ctx);}
 }
 if(section==='publicity'){
  m.lastPublicity=s.age;
  if(verb==='interview'){m.trust=cap(m.trust+6);e.fame=cap(e.fame+3);ctx.change(s,'reputation',3);log(s,'interview','Gave a media interview about your work.',ctx);}
  else{m.publicity=null;m.trust=cap(m.trust+({account:15,work:9,silence:5}[verb]));e.fame=cap(e.fame+({account:2,work:5,silence:-3}[verb]));ctx.change(s,'stress',verb==='silence'?-8:-2);log(s,'response','Responded to the public controversy through '+verb+'.',ctx);}
 }
 m.peakFame=Math.max(m.peakFame,e.fame);
}
export function celebrityLeave(s,ctx){
 const m=s.celebrity;if(!m)return;
 if(m.project){m.project=null;log(s,'abandoned','Left the unfinished production.',ctx);}
 if(m.sponsor){m.sponsor=null;m.failed++;log(s,'terminated','Sponsorship ended upon leaving the career.',ctx);}
 m.offer=null;m.publicity=null;
}
export function celebrityYear(s,ctx,c){
 const m=s.celebrity;if(!m)return 0;
 const e=ent(s);let income=0;
 if(m.project&&(!e?.path||m.project.path!==e.path||s.age>m.project.dueAge)){m.project=null;log(s,'abandoned','The unfinished production expired.',ctx);}
 if(m.offer&&(!e?.path||m.offer.path!==e.path||s.age>m.offer.dueAge))m.offer=null;
 if(m.sponsor){
  const o=m.sponsor;
  if(!e?.path||e.path!==o.path){m.sponsor=null;m.failed++;log(s,'terminated','Sponsorship ended because the career changed.',ctx);}
  else{
   const ok=!ctx.inCustody&&o.deliveredAge===s.age-1&&e.fame>=o.minFame&&m.trust>=o.minTrust;
   if(ok){income=netPay(s,o.fee,ctx,false);o.paid++;log(s,'payment','Sponsor obligation fulfilled; net compensation '+fmt(income)+'.',ctx);}
   else{o.missed++;m.trust=cap(m.trust-6);log(s,'missed','Sponsor obligation was missed; no compensation earned.',ctx);}
   if(s.age>=o.endAge){if(o.missed===0){m.fulfilled++;log(s,'fulfilled','Completed every year of the sponsorship agreement.',ctx);}else m.failed++;m.sponsor=null;}
  }
 }
 if(!e?.path){m.publicity=null;return income;}
 m.peakFame=Math.max(m.peakFame,e.fame);
 if(m.publicity&&s.age>=m.publicity.dueAge){m.publicity=null;m.trust=cap(m.trust-5);log(s,'unresolved','An unanswered public controversy damaged trust.',ctx);}
 if(!m.publicity&&e.fame>=50&&s.age<=108&&s.stats.stress>=70&&m.trust<=65&&!m.history.some(x=>x.kind==='controversy'&&s.age-x.age<4)){
  m.publicity={kind:'pressure',startedAge:s.age,dueAge:s.age+2};m.trust=cap(m.trust-8);e.fame=cap(e.fame-5);log(s,'controversy','Public scrutiny intensified after a demanding period of your career.',ctx);
 }
 if(m.peakFame>=65&&e.fame<=m.peakFame-25)m.inDecline=true;
 if(m.inDecline&&e.fame>=m.peakFame-10&&m.trust>=70){m.inDecline=false;m.comebacks++;log(s,'comeback','Rebuilt public confidence after a career decline.',ctx);}
 return income;
}
export function celebrityView(s){
 const m=state(s),p=m.project,d=p?spec(p.kind):null;
 return {...m,project:p?{...p,name:d.name,title:d.rounds[p.stage][0],prompt:d.rounds[p.stage][1]}:null,offer:m.offer?{...m.offer,name:brand(m.offer.brand).name}:null,sponsor:m.sponsor?{...m.sponsor,name:brand(m.sponsor.brand).name}:null,agent:agent(s)?.name||null,fame:ent(s)?.fame||0,path:ent(s)?.path||null,history:m.history.slice(-5).reverse(),legacy:m.legacy.slice(-4).reverse()};
}
export function celebrityInheritance(next,old){if(!old.celebrity)return;next.celebrity={...empty(),legacy:[...old.celebrity.legacy,...old.celebrity.history.filter(x=>['hit','award','fulfilled','comeback'].includes(x.kind)).slice(-6).map(x=>({...x,ancestor:old.name,generation:old.generation}))].slice(-18)};}
export function validateCelebrity(m){
 if(m===undefined)return true;
 const hist=h=>h&&Number.isInteger(h.id)&&h.id>0&&age(h.age)&&typeof h.kind==='string'&&typeof h.message==='string'&&h.message.length<=200;
 const o=m?.offer,t=m?.sponsor,p=m?.project,u=m?.publicity,validOffer=x=>!!x&&!!brand(x.brand)&&projectTypes.some(d=>d.path===x.path)&&amount(x.fee)&&bounded(x.minFame)&&bounded(x.minTrust);
 return !!m&&m.version===1&&['serial','projects','hits','contracts','fulfilled','failed','earned','fees','comebacks'].every(k=>amount(m[k]))&&m.hits<=m.projects&&bounded(m.trust)&&bounded(m.peakFame)&&(m.inDecline===undefined||typeof m.inDecline==='boolean')&&['lastProject','lastOffer','lastPublicity'].every(k=>m[k]===null||age(m[k]))&&(!p||!!spec(p.kind)&&p.path===spec(p.kind).path&&age(p.startedAge)&&age(p.dueAge)&&p.dueAge>=p.startedAge&&[0,1,2].includes(p.stage)&&[p.craft,p.collaboration,p.risk].every(bounded)&&Array.isArray(p.choices)&&p.choices.length===p.stage&&p.choices.every(i=>[0,1,2].includes(i)))&&(!o||validOffer(o)&&age(o.dueAge)&&typeof o.countered==='boolean')&&(!t||validOffer(t)&&age(t.startAge)&&Number.isInteger(t.endAge)&&t.endAge===t.startAge+2&&(t.deliveredAge===null||age(t.deliveredAge))&&amount(t.paid)&&amount(t.missed)&&t.paid+t.missed<=2)&&!(o&&t)&&(!u||u.kind==='pressure'&&age(u.startedAge)&&age(u.dueAge)&&u.dueAge===u.startedAge+2)&&Array.isArray(m.history)&&m.history.length<=35&&m.history.every(hist)&&Array.isArray(m.legacy)&&m.legacy.length<=18&&m.legacy.every(h=>hist(h)&&typeof h.ancestor==='string'&&Number.isInteger(h.generation)&&h.generation>=1);
}
