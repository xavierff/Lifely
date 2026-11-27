// Negotiated professional team or training-squad agreements. Fictional teams.
const cap=n=>Math.max(0,Math.min(100,Math.round(n))),money=n=>Math.round(n);
const age=n=>Number.isInteger(n)&&n>=0&&n<=110,amount=n=>Number.isSafeInteger(n)&&n>=0;
const fmt=n=>'$'+n.toLocaleString('en-US');
const clubs=[
 {id:'harbor',sport:'Football',name:'Harbor City FC',level:1,salary:18000,form:65,rank:1,term:3},
 {id:'atlas',sport:'Football',name:'Atlas Athletic',level:2,salary:48000,form:80,rank:2,term:3},
 {id:'comets',sport:'Basketball',name:'Northbridge Comets',level:1,salary:20000,form:65,rank:1,term:3},
 {id:'titans',sport:'Basketball',name:'Meridian Titans',level:2,salary:52000,form:80,rank:2,term:3},
 {id:'baseline',sport:'Tennis',name:'Baseline Performance Squad',level:1,salary:16000,form:65,rank:1,term:2},
 {id:'summit',sport:'Tennis',name:'Summit Tennis Academy',level:2,salary:42000,form:80,rank:2,term:3},
 {id:'stride',sport:'Track and field',name:'Coastal Stride Team',level:1,salary:14000,form:65,rank:1,term:2},
 {id:'velocity',sport:'Track and field',name:'Velocity Athletics',level:2,salary:38000,form:80,rank:2,term:3}
];
export const professionalTeams=clubs.map(x=>({...x}));
const find=id=>clubs.find(x=>x.id===id);
const empty=()=>({version:1,offer:null,active:null,history:[],legacy:[],serial:0,lastOffer:null,lastAction:null,contracts:0,transfers:0,completed:0,released:0,earned:0,seasons:0});
const state=s=>s.sportContracts||empty(),ensure=s=>s.sportContracts??=empty();
const sport=s=>s.world?.sports;
const ready=s=>s.alive&&s.age>=18&&s.age<=47&&s.pending===null&&!s.mini&&!s.world?.network?.conversation&&!s.everydayScenes?.active&&!s.careerCampaigns?.active&&!s.hobbyCircuit?.active&&!s.world?.storyDirector?.active&&s.fate?.active?.status!=='playing'&&s.familyStories?.active?.status!=='ready'&&s.workplace?.active?.status!=='ready'&&s.worldPulse?.active?.status!=='ready'&&!(s.justice?.years>0)&&!s.justice?.case;
function log(s,kind,message,ctx){const m=ensure(s);m.history.push({id:++m.serial,age:s.age,kind,message:message.slice(0,200)});m.history=m.history.slice(-30);ctx.add(s,message,'career');}
function canJoin(s,d){const t=sport(s);return t?.sport===d.sport&&t.form>=d.form&&t.rank>=d.rank&&t.wins>=3&&!t.injury&&s.age+d.term<=47;}
function exitCost(a){return money(a.salary*.2);}
export function sportContractCommands(s,c){
 const t=sport(s);if(!ready(s)||!t?.sport)return [];
 const m=state(s),out=[],put=(id,label,detail,ok=true)=>out.push({id:'sportdeal:'+id,label,detail,enabled:!!(s.actions>0&&ok)});
 if(!m.offer){
  for(const d of clubs.filter(x=>x.sport===t.sport&&x.id!==m.active?.team)){
   const allowed=!t.contractYears||!!m.active;
   put('request:'+d.id,(m.active?'Seek transfer to ':'Request offer from ')+d.name,fmt(money(d.salary*c.salary))+'/year · form '+d.form+' · rank '+d.rank+' · '+d.term+' years',allowed&&canJoin(s,d)&&m.lastOffer!==s.age&&(!m.active||s.cash>=exitCost(m.active)));
  }
 }else{
  const o=m.offer,d=find(o.team),current=m.active;
  put('accept','Accept '+d.name+' contract',fmt(o.salary)+'/year · '+o.term+' years'+(current?' · release fee '+fmt(exitCost(current)):''),s.age<=o.dueAge&&canJoin(s,d)&&(!t.contractYears||!!current)&&(!current||s.cash>=exitCost(current)));
  put('counter','Negotiate higher annual salary','Ask for 20% more with a stronger performance requirement',!o.countered&&s.age<=o.dueAge);
  put('decline','Decline professional offer','Keep your current career arrangements');
 }
 if(m.active){
  const a=m.active;
  put('train','Complete team performance session','Build form and reduce selection pressure',m.lastAction!==s.age&&!t.injury);
  put('release','Request an early contract release',fmt(exitCost(a))+' paid from cash · future salaries end',s.cash>=exitCost(a));
 }
 return out;
}
export function sportContractAct(s,id,ctx,c){
 if(!sportContractCommands({...s,actions:s.actions+1},c).some(x=>x.id===id&&x.enabled))throw Error('Professional contract action unavailable.');
 const m=ensure(s),t=sport(s),[,action,key]=id.split(':');
 if(action==='request'){const d=find(key);m.offer={team:key,salary:money(d.salary*c.salary),term:d.term,target:d.form-10,dueAge:Math.min(47,s.age+1),countered:false};m.lastOffer=s.age;log(s,'offer',d.name+' offered a professional agreement.',ctx);}
 if(action==='counter'){const o=m.offer,d=find(o.team);o.countered=true;if(t.form>=d.form+8&&t.rank>=d.rank){o.salary=money(o.salary*1.2);o.target=cap(o.target+8);log(s,'counter',d.name+' agreed to higher pay and a stronger form target.',ctx);}else log(s,'counter',d.name+' retained its original terms.',ctx);}
 if(action==='decline'){m.offer=null;log(s,'declined','Declined the professional agreement.',ctx);}
 if(action==='accept'){
  const o=m.offer,d=find(o.team);
  if(m.active){ctx.spend(s,exitCost(m.active));m.transfers++;log(s,'transfer','Transferred from '+find(m.active.team).name+' to '+d.name+'.',ctx);}
  m.active={team:o.team,sport:d.sport,salary:o.salary,target:o.target,startAge:s.age,endAge:s.age+o.term,poorYears:0,paidYears:0};
  t.contractYears=o.term;m.offer=null;m.contracts++;log(s,'contract','Signed a negotiated agreement with '+d.name+'.',ctx);
 }
 if(action==='train'){m.lastAction=s.age;t.form=cap(t.form+9);ctx.change(s,'health',2);ctx.change(s,'stress',4);m.active.poorYears=Math.max(0,m.active.poorYears-1);log(s,'training','Completed the professional team training session.',ctx);}
 if(action==='release'){ctx.spend(s,exitCost(m.active));sportContractLeave(s,{add:ctx.add});}
}
export function sportContractLeave(s,ctx){
 const m=s.sportContracts;if(!m)return;
 if(m.active){m.released++;log(s,'release','Ended the negotiated professional agreement.',ctx);}
 if(m.active&&sport(s))sport(s).contractYears=0;
 m.active=null;m.offer=null;
}
// Called in place of the generic salary mechanism when a negotiated agreement is active.
export function sportContractYear(s,ctx){
 const m=s.sportContracts,t=sport(s);if(!m)return 0;
 if(m.offer&&(!t?.sport||find(m.offer.team).sport!==t.sport||s.age>m.offer.dueAge))m.offer=null;
 const a=m.active;if(!a)return 0;
 if(!t?.sport||t.sport!==a.sport||s.age>47){sportContractLeave(s,ctx);return 0;}
 const adequate=t.form>=a.target;
 a.poorYears=adequate?0:a.poorYears+1;
 const pay=ctx.inCustody?0:a.salary; // guaranteed contracted pay unless custody interrupts play
 if(pay){a.paidYears++;m.earned+=pay;m.seasons++;}
 if(a.poorYears>=2){m.active=null;t.contractYears=0;m.released++;log(s,'release',find(a.team).name+' released you after two weak seasons.',ctx);}
 else if(s.age>=a.endAge){m.active=null;t.contractYears=0;m.completed++;log(s,'completed','Completed the professional contract with '+find(a.team).name+'.',ctx);}
 else t.contractYears=a.endAge-s.age;
 return pay;
}
export function sportContractView(s){const m=state(s);return {...m,sport:sport(s)?.sport||null,form:sport(s)?.form||0,rank:sport(s)?.rank||0,offer:m.offer?{...m.offer,name:find(m.offer.team).name}:null,active:m.active?{...m.active,name:find(m.active.team).name,releaseCost:exitCost(m.active)}:null,history:m.history.slice(-5).reverse(),legacy:m.legacy.slice(-4).reverse()};}
export function sportContractInheritance(next,old){if(!old.sportContracts)return;next.sportContracts={...empty(),legacy:[...old.sportContracts.legacy,...old.sportContracts.history.filter(x=>['contract','transfer','completed'].includes(x.kind)).slice(-6).map(x=>({...x,ancestor:old.name,generation:old.generation}))].slice(-18)};}
export function validateSportContracts(m){
 if(m===undefined)return true;
 const hist=h=>h&&Number.isInteger(h.id)&&h.id>0&&age(h.age)&&typeof h.kind==='string'&&typeof h.message==='string'&&h.message.length<=200;
 const o=m?.offer,a=m?.active,valid=x=>!!x&&!!find(x.team)&&amount(x.salary)&&Number.isInteger(x.target)&&x.target>=0&&x.target<=100;
 return !!m&&m.version===1&&['serial','contracts','transfers','completed','released','earned','seasons'].every(k=>amount(m[k]))&&['lastOffer','lastAction'].every(k=>m[k]===null||age(m[k]))&&(!o||valid(o)&&age(o.dueAge)&&o.term===find(o.team).term&&typeof o.countered==='boolean')&&(!a||valid(a)&&a.sport===find(a.team).sport&&age(a.startAge)&&age(a.endAge)&&a.endAge===a.startAge+find(a.team).term&&amount(a.poorYears)&&amount(a.paidYears)&&a.paidYears<=find(a.team).term)&&Array.isArray(m.history)&&m.history.length<=30&&m.history.every(hist)&&Array.isArray(m.legacy)&&m.legacy.length<=18&&m.legacy.every(h=>hist(h)&&typeof h.ancestor==='string'&&Number.isInteger(h.generation)&&h.generation>=1);
}
