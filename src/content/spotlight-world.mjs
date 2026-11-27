// Persistent fictional entertainment peers and playable concert tours.
const cap=n=>Math.max(0,Math.min(100,Math.round(n))),money=Math.round;
const age=n=>Number.isInteger(n)&&n>=0&&n<=110,amount=n=>Number.isSafeInteger(n)&&n>=0,bounded=n=>Number.isInteger(n)&&n>=0&&n<=100;
const fmt=n=>'$'+n.toLocaleString('en-US');
const roster=[
 ['actor-a','Mira Vale','Film actor'],['actor-b','Rowan Bell','Film actor'],
 ['music-a','Avery Lane','Recording musician'],['music-b','Jules Rivera','Recording musician'],
 ['director-a','Noah Arden','Film director'],['director-b','Sage Monroe','Film director']
];
const routes=[
 {id:'regional',name:'Regional concert tour',cost:2400,fame:40,stops:['Harbor theater','Capital concert hall','Lakeside festival'],capacity:[350,600,850]},
 {id:'international',name:'International concert tour',cost:12500,fame:70,stops:['Tokyo showcase','London arena','New York finale'],capacity:[1800,3000,4500]}
];
const spec=id=>routes.find(x=>x.id===id),peer=id=>roster.find(x=>x[0]===id);
const empty=()=>({version:1,peers:[],tour:null,lastTour:null,awardSeen:0,tours:0,successfulStops:0,gross:0,fees:0,net:0,history:[],legacy:[],serial:0});
const state=s=>s.spotlight||empty(),ent=s=>s.world?.entertainment;
const initialPeers=()=>roster.map(([id,name,path],i)=>({id,name,path,fame:40+i*5,craft:52+i*5,respect:50,rivalry:20,projects:0,lastAction:null}));
function ensure(s){const m=s.spotlight??=empty();if(!m.peers.length)m.peers=initialPeers();return m;}
const ready=s=>s.alive&&s.age>=18&&s.pending===null&&!s.mini&&!s.world?.network?.conversation&&!s.everydayScenes?.active&&!s.careerCampaigns?.active&&!s.hobbyCircuit?.active&&!s.world?.storyDirector?.active&&s.fate?.active?.status!=='playing'&&s.familyStories?.active?.status!=='ready'&&s.workplace?.active?.status!=='ready'&&s.worldPulse?.active?.status!=='ready'&&!(s.justice?.years>0)&&!s.justice?.case;
function log(s,kind,message,ctx){const m=ensure(s);m.history.push({id:++m.serial,age:s.age,kind,message:message.slice(0,200)});m.history=m.history.slice(-30);ctx.add(s,message,'career');}
export function spotlightCommands(s,c){
 const e=ent(s);if(!ready(s)||!e?.path)return [];
 const m=state(s),out=[],put=(id,label,detail,ok=true)=>out.push({id:'spotlight:'+id,label,detail,enabled:!!(s.actions>0&&ok)});
 const peers=m.peers.length?m.peers:roster.map(([id,name,path])=>({id,name,path,lastAction:null,respect:50,rivalry:20}));
 for(const p of peers.filter(x=>x.path===e.path)){
  put('peer:collaborate:'+p.id,'Collaborate with '+p.name,'$800 · creative exchange and mutual respect',s.cash>=800&&p.lastAction!==s.age);
  put('peer:compete:'+p.id,'Compete with '+p.name,'$500 · competing releases and public attention',s.cash>=500&&p.lastAction!==s.age);
 }
 if(e.path==='Recording musician'){
  if(!m.tour)for(const d of routes)put('tour:start:'+d.id,'Plan '+d.name,fmt(money(d.cost*c.cost))+' · three playable stops',e.releases>=1&&e.fame>=d.fame&&s.cash>=money(d.cost*c.cost)&&m.lastTour!==s.age&&s.age<=108);
  else{
   const t=m.tour,d=spec(t.route);
   for(const [id,label,detail] of [['polish','Deliver a rehearsed set','Reliable performance and ticket sales'],['connect','Engage the audience','Build fan loyalty and reduce fatigue'],['bold','Attempt a spectacular finale','Higher potential revenue, higher fatigue and risk']])put('tour:play:'+id,d.stops[t.stage]+' — '+label,detail,s.age<=t.dueAge);
   put('tour:cancel','Cancel remaining tour stops','Past earnings are retained; no budget refund');
  }
 }
 if(e.awards>m.awardSeen)put('award:attend','Attend the award ceremony','Celebrate existing awards without awarding a duplicate');
 return out;
}
function payout(s,gross){
 const m=ensure(s),ch=s.world?.characters,a=ch?.agents?.find(x=>x.id===ch.agency?.agentId&&x.specialty===ent(s)?.path),fee=a?money(gross*a.commission/100):0;
 if(a){ch.agency.fees+=fee;ch.agency.earned+=gross-fee;ch.agency.deals++;a.projects++;}
 m.gross+=gross;m.fees+=fee;m.net+=gross-fee;s.cash+=gross-fee;return gross-fee;
}
export function spotlightAct(s,id,ctx,c){
 if(!spotlightCommands({...s,actions:s.actions+1},c).some(x=>x.id===id&&x.enabled))throw Error('Spotlight action unavailable.');
 const m=ensure(s),e=ent(s),[,section,verb,key]=id.split(':');
 if(section==='peer'){
  const p=m.peers.find(x=>x.id===key);p.lastAction=s.age;
  if(verb==='collaborate'){ctx.spend(s,800);p.respect=cap(p.respect+14);p.rivalry=cap(p.rivalry-8);p.craft=cap(p.craft+3);ctx.change(s,'creativity',3);e.fame=cap(e.fame+3);log(s,'collaboration','Worked with '+p.name+' on a creative exchange.',ctx);}
  else{ctx.spend(s,500);const won=s.stats.creativity*.55+e.fame*.45+ctx.rng(s)*20>=p.craft*.55+p.fame*.45+ctx.rng(s)*20;p.rivalry=cap(p.rivalry+10);p.respect=cap(p.respect+(won?4:1));e.fame=cap(e.fame+(won?6:-3));p.fame=cap(p.fame+(won?1:6));log(s,'competition',(won?'Your release gained more attention than ':'Your peer gained more attention: ')+p.name+'.',ctx);}
 }
 if(section==='tour'){
  if(verb==='start'){const d=spec(key);ctx.spend(s,money(d.cost*c.cost));m.tour={route:key,stage:0,startedAge:s.age,dueAge:s.age+2,fatigue:15,receipts:0,stops:[]};m.lastTour=s.age;log(s,'tour','Started '+d.name+'.',ctx);}
  else if(verb==='cancel'){m.tour=null;log(s,'cancelled','Cancelled the remaining tour dates.',ctx);}
  else{
   const t=m.tour,d=spec(t.route),index=t.stage,quality=cap(s.stats.creativity*.40+e.fame*.40+(s.skills.art||0)*.20+({polish:13,connect:6,bold:18}[key])-t.fatigue*.18+(ctx.rng(s)-.5)*(key==='bold'?30:12));
   const attendance=money(d.capacity[index]*(.25+quality*.0075)),gross=money(attendance*(d.id==='international'?18:12)*c.salary),net=payout(s,gross);
   t.receipts+=net;t.fatigue=cap(t.fatigue+({polish:15,connect:5,bold:23}[key]));t.stops.push({venue:d.stops[index],attendance,quality,net});t.stage++;
   if(quality>=65){m.successfulStops++;e.fame=cap(e.fame+4);s.audience=(s.audience||0)+money(attendance*.20);}else e.fame=cap(e.fame-2);
   ctx.change(s,'stress',key==='bold'?7:key==='connect'?2:4);log(s,'performance',d.stops[index]+' — '+attendance+' attendees; net '+fmt(net)+'.',ctx);
   if(t.stage===3){m.tours++;m.tour=null;log(s,'completed','Completed '+d.name+' with net ticket receipts of '+fmt(t.receipts)+'.',ctx);}
  }
 }
 if(section==='award'){m.awardSeen=e.awards;ctx.change(s,'reputation',4);ctx.change(s,'happiness',5);log(s,'ceremony','Celebrated existing industry recognition at an award ceremony.',ctx);}
}
export function spotlightLeave(s,ctx){if(s.spotlight?.tour){s.spotlight.tour=null;log(s,'cancelled','The tour ended when you left the career.',ctx);}}
export function spotlightYear(s,ctx){
 if(!s.spotlight&&!ent(s)?.path)return;
 const m=ensure(s);
 for(const p of m.peers){
  p.craft=cap(p.craft+money((ctx.rng(s)-.4)*6));
  if(ctx.rng(s)<.18+p.craft*.005){p.projects++;p.fame=cap(p.fame+3);}else p.fame=cap(p.fame-2);
  p.rivalry=cap(p.rivalry-1);
 }
 if(m.tour&&(ent(s)?.path!=='Recording musician'||s.age>m.tour.dueAge)){m.tour=null;log(s,'cancelled','The remaining concert dates expired.',ctx);}
}
export function spotlightView(s){const m=state(s),t=m.tour,d=t?spec(t.route):null;return {...m,path:ent(s)?.path||null,peers:(m.peers.length?m.peers:initialPeers()).filter(x=>x.path===ent(s)?.path),tour:t?{...t,name:d.name,next:d.stops[t.stage],capacity:d.capacity[t.stage]}:null,history:m.history.slice(-5).reverse(),legacy:m.legacy.slice(-4).reverse()};}
export function spotlightInheritance(next,old){if(!old.spotlight)return;next.spotlight={...empty(),legacy:[...old.spotlight.legacy,...old.spotlight.history.filter(x=>['completed','collaboration','ceremony'].includes(x.kind)).slice(-6).map(x=>({...x,ancestor:old.name,generation:old.generation}))].slice(-18)};}
export function validateSpotlight(m){
 if(m===undefined)return true;
 const hist=h=>h&&Number.isInteger(h.id)&&h.id>0&&age(h.age)&&typeof h.kind==='string'&&typeof h.message==='string'&&h.message.length<=200;
 const t=m?.tour,d=t?spec(t.route):null;
 return !!m&&m.version===1&&['serial','awardSeen','tours','successfulStops','gross','fees','net'].every(k=>amount(m[k]))&&m.gross===m.fees+m.net&&(m.lastTour===null||age(m.lastTour))&&Array.isArray(m.peers)&&[0,roster.length].includes(m.peers.length)&&new Set(m.peers.map(p=>p.id)).size===m.peers.length&&m.peers.every(p=>p&&peer(p.id)&&p.name===peer(p.id)[1]&&p.path===peer(p.id)[2]&&[p.fame,p.craft,p.respect,p.rivalry].every(bounded)&&amount(p.projects)&&(p.lastAction===null||age(p.lastAction)))&&(!t||!!d&&[0,1,2].includes(t.stage)&&age(t.startedAge)&&age(t.dueAge)&&t.dueAge===t.startedAge+2&&bounded(t.fatigue)&&amount(t.receipts)&&Array.isArray(t.stops)&&t.stops.length===t.stage&&t.stops.every((x,i)=>x&&x.venue===d.stops[i]&&amount(x.attendance)&&x.attendance<=d.capacity[i]&&bounded(x.quality)&&amount(x.net))&&t.stops.reduce((n,x)=>n+x.net,0)===t.receipts)&&Array.isArray(m.history)&&m.history.length<=30&&m.history.every(hist)&&Array.isArray(m.legacy)&&m.legacy.length<=18&&m.legacy.every(h=>hist(h)&&typeof h.ancestor==='string'&&Number.isInteger(h.generation)&&h.generation>=1);
}
