// Independent fictional acquired companies; profits enter the annual statement once.
const cap=n=>Math.max(0,Math.min(100,Math.round(n)));
const money=n=>Math.round(n);
const age=n=>Number.isInteger(n)&&n>=0&&n<=110;
const amount=n=>Number.isSafeInteger(n)&&n>=0;
const bounded=n=>Number.isInteger(n)&&n>=0&&n<=100;
export const acquisitionTypes=[
 {id:'cafe',name:'Harbor Cafe Group',sector:'Hospitality',price:80000,margin:.075,vol:.09,rival:'Maple Dining'},
 {id:'design',name:'Northlight Design',sector:'Creative services',price:125000,margin:.085,vol:.10,rival:'Canvas Works'},
 {id:'logistics',name:'Meridian Logistics',sector:'Transport',price:350000,margin:.065,vol:.08,rival:'Westbridge Freight'},
 {id:'software',name:'Cloudline Software',sector:'Technology',price:700000,margin:.10,vol:.17,rival:'Pioneer Systems'},
 {id:'hotel',name:'Seabrook Hotels',sector:'Hospitality',price:1250000,margin:.065,vol:.12,rival:'Silver Coast Hotels'},
 {id:'manufacturing',name:'Ironwood Manufacturing',sector:'Industry',price:2200000,margin:.07,vol:.11,rival:'Summit Industrial'}
];
const spec=id=>acquisitionTypes.find(x=>x.id===id);
const empty=()=>({version:1,companies:[],history:[],legacy:[],serial:0,acquired:[],closed:0,yearsProfit:0,lastProfit:0,crisis:null,lastCrisisAction:null,comebacks:0});
const state=s=>s.empire||empty(),ensure=s=>s.empire??=empty();
export const empireWorth=s=>(s.empire?.companies||[]).reduce((n,c)=>n+c.value,0);
const price=(d,c)=>money(d.price*c.cost);
const fmt=n=>'$'+n.toLocaleString('en-US');
const eligible=s=>s.alive&&s.age>=18&&s.pending===null&&!s.mini&&!s.world?.network?.conversation&&!s.everydayScenes?.active&&!s.careerCampaigns?.active&&!s.hobbyCircuit?.active&&!s.world?.storyDirector?.active&&s.fate?.active?.status!=='playing'&&s.familyStories?.active?.status!=='ready'&&s.workplace?.active?.status!=='ready'&&s.worldPulse?.active?.status!=='ready'&&!(s.justice?.years>0);
function log(s,kind,message,ctx){const m=ensure(s);m.history.push({id:++m.serial,age:s.age,kind,message:message.slice(0,200)});m.history=m.history.slice(-35);ctx.add(s,message,'finance');}
export function empireCommands(s,c){
 if(!eligible(s))return [];
 const m=state(s),out=[],put=(id,label,detail,ok=true)=>out.push({id:'empire:'+id,label,detail,enabled:!!(s.actions>0&&ok)});
 for(const d of acquisitionTypes){
  const h=m.companies.find(x=>x.id===d.id),cost=price(d,c);
  if(!h){if(s.business||m.companies.length)put('buy:'+d.id,'Acquire '+d.name,fmt(cost)+' · independent operations and market risk',s.cash>=cost&&m.companies.length<4&&!m.crisis);continue;}
  const invest=Math.max(1000,money(cost*.025));
  put('invest:'+d.id,'Improve '+d.name,fmt(invest)+' · improve quality and demand',s.cash>=invest&&h.lastAction!==s.age);
  put('strategy:'+d.id,'Reposition '+d.name,'One action · reduce competition, improve demand',h.lastAction!==s.age);
  put('sell:'+d.id,'Sell '+d.name,'Receive 85% of market value, or 60% if distressed');
 }
 if(m.crisis){
  const payment=Math.min(s.cash,s.debt,Math.max(1000,money(s.debt*.25)));
  put('crisis:repay','Make a debt repayment',fmt(payment)+' from actual cash',payment>0&&m.lastCrisisAction!==s.age);
  put('crisis:budget','Adopt a recovery budget','Switch to frugal household spending; no debt is erased',s.budget!=='frugal'&&m.lastCrisisAction!==s.age);
 }
 return out;
}
export function empireAct(s,id,ctx,c){
 if(!empireCommands({...s,actions:s.actions+1},c).some(x=>x.id===id&&x.enabled))throw Error('Company action unavailable.');
 const m=ensure(s),[,action,key]=id.split(':'),d=spec(key),h=m.companies.find(x=>x.id===key);
 if(action==='buy'){
  const cost=price(d,c);ctx.spend(s,cost);m.companies.push({id:key,value:cost,quality:65,demand:55,competition:45,lastProfit:0,lossYears:0,distressed:false,lastAction:s.age,boughtAge:s.age});
  if(!m.acquired.includes(key))m.acquired.push(key);log(s,'acquisition','Acquired '+d.name+'.',ctx);
 }
 if(action==='invest'){
  const cost=Math.max(1000,money(price(d,c)*.025));ctx.spend(s,cost);h.value+=money(cost*.55);h.quality=cap(h.quality+15);h.demand=cap(h.demand+9);h.lastAction=s.age;log(s,'investment','Invested in '+d.name+' operations.',ctx);
 }
 if(action==='strategy'){h.competition=cap(h.competition-12);h.demand=cap(h.demand+8);h.lastAction=s.age;log(s,'strategy','Repositioned '+d.name+' against '+d.rival+'.',ctx);}
 if(action==='sell'){
  const proceeds=money(h.value*(h.distressed?.6:.85));s.cash+=proceeds;m.companies=m.companies.filter(x=>x.id!==key);log(s,'sale','Sold '+d.name+' for '+fmt(proceeds)+'.',ctx);
 }
 if(action==='crisis'){
  m.lastCrisisAction=s.age;
  if(key==='repay'){const n=Math.min(s.cash,s.debt,Math.max(1000,money(s.debt*.25)));ctx.spend(s,n);s.debt-=n;log(s,'repayment','Repaid '+fmt(n)+' of debt.',ctx);}
  else{s.budget='frugal';log(s,'recovery','Adopted a recovery budget.',ctx);}
 }
}
export function empireYear(s,ctx,c){
 const m=s.empire;if(!m)return 0;
 let total=0;
 for(const h of [...m.companies]){
  const d=spec(h.id),market=Math.max(.65,Math.min(1.35,s.market||1));
  // Limited independent competition shocks. No randomness consumed in old lives.
  h.competition=cap(h.competition+money((ctx.rng(s)-.45)*16));
  h.demand=cap(h.demand+money((h.quality-60)/9+(market-1)*20-(h.competition-45)/12)-2);
  const rate=d.margin+(h.demand-50)*.002+(h.quality-60)*.0015-(h.competition-45)*.0015+(market-1)*.24+(ctx.rng(s)-.5)*d.vol;
  const profit=money(price(d,c)*Math.max(-.25,Math.min(.25,rate)));
  h.lastProfit=profit;total+=profit;h.lossYears=profit<0?h.lossYears+1:0;
  const was=h.distressed;h.distressed=h.lossYears>=2||h.value<price(d,c)*.35;
  h.value=Math.max(0,money(h.value*(1+Math.max(-.30,Math.min(.15,rate*.45+(market-1)*.1-(h.distressed?.07:0))))));
  h.quality=cap(h.quality-3);
  if(!was&&h.distressed)log(s,'distress',d.name+' entered financial distress after sustained losses.',ctx);
  if(was&&!h.distressed)log(s,'recovered',d.name+' returned to stable operations.',ctx);
  if(h.lossYears>=4&&h.value<price(d,c)*.20){
   // Write off the remaining equity. No further liability is invented.
   m.companies=m.companies.filter(x=>x.id!==h.id);m.closed++;log(s,'closure',d.name+' closed after prolonged losses; remaining equity was written off.',ctx);
  }
 }
 m.lastProfit=total;if(m.companies.length&&total>0)m.yearsProfit++;
 return total;
}
export function empireReview(s,ctx){
 const m=s.empire;if(!m)return;
 const liquid=s.cash+(s.bankSavings||0),danger=s.debt>=50000&&s.debt>liquid*2;
 if(!m.crisis&&danger){m.crisis={startedAge:s.age,peakDebt:s.debt};log(s,'crisis','A liquidity crisis began. Debt remains payable and acquisitions are suspended.',ctx);}
 else if(m.crisis){
  m.crisis.peakDebt=Math.max(m.crisis.peakDebt,s.debt);
  if(s.debt<10000||liquid>=s.debt*1.5){m.crisis=null;m.comebacks++;log(s,'comeback','The liquidity crisis ended after a financial recovery.',ctx);}
 }
}
export function empireView(s){const m=state(s);return {value:empireWorth(s),companies:m.companies.map(x=>({...x,name:spec(x.id).name,sector:spec(x.id).sector,rival:spec(x.id).rival})),lastProfit:m.lastProfit,yearsProfit:m.yearsProfit,acquired:m.acquired.length,closed:m.closed,crisis:m.crisis,comebacks:m.comebacks,history:m.history.slice(-5).reverse(),legacy:m.legacy.slice(-4).reverse()};}
export function empireInheritance(next,old){if(!old.empire)return;next.empire={...empty(),legacy:[...old.empire.legacy,...old.empire.history.filter(x=>['acquisition','closure','comeback'].includes(x.kind)).slice(-6).map(x=>({...x,ancestor:old.name,generation:old.generation}))].slice(-18)};}
export function validateEmpire(m){
 if(m===undefined)return true;
 const hist=h=>h&&Number.isInteger(h.id)&&h.id>0&&age(h.age)&&['acquisition','investment','strategy','sale','repayment','recovery','distress','recovered','closure','crisis','comeback'].includes(h.kind)&&typeof h.message==='string'&&h.message.length<=200;
 return !!m&&m.version===1&&amount(m.serial)&&amount(m.closed)&&amount(m.yearsProfit)&&amount(m.comebacks)&&Number.isSafeInteger(m.lastProfit)&&(m.lastCrisisAction===null||age(m.lastCrisisAction))&&(m.crisis===null||m.crisis&&age(m.crisis.startedAge)&&amount(m.crisis.peakDebt))&&Array.isArray(m.companies)&&m.companies.length<=4&&m.companies.every(h=>h&&!!spec(h.id)&&amount(h.value)&&[h.quality,h.demand,h.competition].every(bounded)&&Number.isSafeInteger(h.lastProfit)&&amount(h.lossYears)&&typeof h.distressed==='boolean'&&age(h.lastAction)&&age(h.boughtAge))&&new Set(m.companies.map(h=>h.id)).size===m.companies.length&&Array.isArray(m.acquired)&&m.acquired.every(id=>!!spec(id))&&new Set(m.acquired).size===m.acquired.length&&Array.isArray(m.history)&&m.history.length<=35&&m.history.every(hist)&&Array.isArray(m.legacy)&&m.legacy.length<=18&&m.legacy.every(h=>hist(h)&&typeof h.ancestor==='string'&&Number.isInteger(h.generation)&&h.generation>=1);
}
