// Fictional market instruments linked to existing economy and property records.
// Direct listed-company ownership stays in corporate-empires; funds are external pooled instruments.
const cap=(n,a,b)=>Math.min(b,Math.max(a,n)),money=n=>Math.max(0,Math.round(n)),int=n=>Number.isSafeInteger(n)&&n>=0;
const funds=[
 {id:'equity',name:'Global equity index',risk:'Medium',yield:.018},
 {id:'property',name:'Property index fund (REIT)',risk:'Medium',yield:.035},
 {id:'venture',name:'Private equity & venture fund',risk:'High',yield:0},
 {id:'crypto',name:'Digital asset index',risk:'Very high',yield:0}
];
const fund=id=>funds.find(f=>f.id===id);
const state=s=>s.globalMarkets;
const clock=s=>s.age+(state(s)?.offset??s.livingEconomy?.offset??s.propertyMarket?.offset??0);
const fresh=s=>({version:1,offset:clock(s)-s.age,lastYear:null,serial:0,prices:Object.fromEntries(funds.map(f=>[f.id,100])),holdings:{},bonds:[],history:[],news:[],inflation:3,policyRate:4,phase:'steady',propertyIndex:null,annual:{distributions:0,coupons:0,redemptions:0,management:0},manager:null});
const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
const firms=s=>s.livingEconomy?.companies||[];
const firm=(s,id)=>firms(s).find(c=>c.id===id);
const live=c=>c?.status==='active';
const person=(s,id)=>s.people.find(p=>p.id===id);
const noteDebt=c=>c.marketNoteDebt||0;
const face=b=>b.units*1000;
const corpValue=c=>money(c.cash+c.capital-(c.corporate?.debt||0)-noteDebt(c));
const ownedValue=(s,b)=>b.owned&&b.status==='active'?(b.issuer===null?face(b):live(firm(s,b.issuer))?face(b):0):0;
function note(s,q,text,ctx){q.news.push({year:clock(s),text});q.news=q.news.slice(-30);ctx.add(s,text,'finance');}
function trade(q,year,kind,asset,amount){q.history.push({year,kind,asset,amount});q.history=q.history.slice(-60);}
export function globalMarketWorth(s){const q=state(s);if(!q)return 0;return Object.entries(q.holdings).reduce((n,[k,h])=>n+h.units*q.prices[k],0)+q.bonds.reduce((n,b)=>n+ownedValue(s,b),0);}
export function globalMarketYear(s,ctx){
 if(!s.alive||(s.age<18&&!state(s)))return;
 const q=s.globalMarkets??=fresh(s),year=clock(s);if(q.lastYear===year)return;q.lastYear=year;
 const roll=ctx.roll||((i,t)=>hash((s.lifeId||s.name)+':markets:'+year+':'+i+':'+t));
 q.annual={distributions:0,coupons:0,redemptions:0,management:0};
 const market=cap(s.market??1,.65,1.35),previous={...q.prices};
 q.phase=market<.8?'crisis':market>1.2?'boom':market<.95?'slowdown':'steady';
 q.inflation=cap(Math.round(q.inflation+(roll(0,'inflation')-.45)*3+(market>1.2?2:0)-(market<.8?1:0)),0,15);
 q.policyRate=cap(Math.round(2+q.inflation*.65+(q.phase==='crisis'?-1:0)),1,12);
 const companies=firms(s).filter(live),total=companies.reduce((n,c)=>n+c.cash+c.capital,0);
 const earnings=total?cap(companies.reduce((n,c)=>n+c.lastProfit,0)/total,-.35,.35):0;
 const property=s.propertyMarket?.priceIndex??100,propertyReturn=q.propertyIndex===null?0:property/q.propertyIndex-1;q.propertyIndex=property;
 const returns={equity:cap(.035+(market-1)*.25+earnings*.25+(roll(1,'equity')-.5)*.14,-.45,.45),property:cap(propertyReturn+(roll(2,'property')-.5)*.04,-.3,.35),venture:cap(.035+earnings*.4+(market-1)*.45+(roll(3,'venture')-.5)*.45,-.55,.65),crypto:cap((market-1)*.6+(roll(4,'crypto')-.48)*.9,-.75,.9)};
 for(const f of funds){q.prices[f.id]=cap(money(previous[f.id]*(1+returns[f.id])),1,100000);const h=q.holdings[f.id];if(h&&h.units>0){const income=money(h.units*previous[f.id]*f.yield);s.cash+=income;q.annual.distributions+=income;}}
 for(const b of q.bonds.filter(b=>b.status==='active')){
  const c=b.issuer===null?null:firm(s,b.issuer),coupon=money(face(b)*b.rate/100);
  if(b.issuer!==null&&!live(c)){b.status='defaulted';if(c)c.marketNoteDebt=Math.max(0,noteDebt(c)-face(b));if(b.owned)note(s,q,b.name+' defaulted following company closure.',ctx);continue;}
  if(c&&c.cash<coupon){b.missed++;if(b.missed>=2){b.status='defaulted';c.marketNoteDebt=Math.max(0,noteDebt(c)-face(b));if(b.owned)note(s,q,b.name+' defaulted after missed coupon payments.',ctx);}continue;}
  if(c){c.cash-=coupon;c.lastProfit-=coupon;}if(b.owned){s.cash+=coupon;q.annual.coupons+=coupon;}b.missed=0;
  if(year<b.maturity)continue;
  if(c&&c.cash<face(b)){b.maturity=year+1;b.extensions++;if(b.extensions>=2){b.status='defaulted';c.marketNoteDebt=Math.max(0,noteDebt(c)-face(b));if(b.owned)note(s,q,b.name+' defaulted at maturity.',ctx);}continue;}
  if(c){c.cash-=face(b);c.marketNoteDebt=Math.max(0,noteDebt(c)-face(b));}if(b.owned){s.cash+=face(b);q.annual.redemptions+=face(b);note(s,q,b.name+' matured and repaid principal.',ctx);}b.status='redeemed';
 }
 const m=q.manager;if(m){const performance=returns[m.strategy],fee=money(m.aum*.0075+Math.max(0,m.aum*performance)*.06);s.cash+=fee;q.annual.management=fee;m.lastReturn=Math.round(performance*100);m.aum=cap(money(m.aum*(1+performance)+(performance>0?5000:-3000)),10000,2000000);m.years++;m.totalFees+=fee;if(performance<-.25)m.reputation=cap(m.reputation-10,0,100);else m.reputation=cap(m.reputation+(performance>0?4:-2),0,100);}
 q.history.push({year,kind:'snapshot',asset:'market',amount:q.prices.equity,prices:{...q.prices}});q.history=q.history.slice(-60);
}
export function globalMarketCommands(s,ctx){
 const q=state(s);if(!q||!s.alive||s.age<18||s.justice?.years>0||s.justice?.case)return [];
 const out=[],a=s.actions>0,put=(tag,label,detail,ok)=>out.push({id:'globalmarket:'+tag,label,detail,enabled:!!(a&&ok)});
 for(const f of funds){const price=q.prices[f.id]*10,h=q.holdings[f.id];put('buy:'+f.id,'Buy '+f.name,'10 units · $'+price.toLocaleString('en-US')+' · '+f.risk,s.cash>=price&&(h?.units||0)<=99990);put('sell:'+f.id,'Sell '+f.name,'10 units · $'+price.toLocaleString('en-US'),(h?.units||0)>=10);}
 const canBond=q.bonds.length<40;
 put('government','Buy government bond','$1,000 · 3 years · '+q.policyRate+'% coupon',canBond&&s.cash>=1000);
 for(const c of firms(s).filter(c=>live(c)&&!c.playerOwned&&corpValue(c)>2000)){put('note:'+c.id,'Subscribe to '+c.name+' note','$1,000 lent to issuer · 3 years · '+(q.policyRate+3)+'% coupon',canBond&&s.cash>=1000&&noteDebt(c)+1000<=Math.max(1000,corpValue(c)*.3));}
 for(const b of q.bonds.filter(b=>b.owned&&b.status==='active'))put('exitbond:'+b.id,'Sell '+b.name,'External buyer at face value; corporate notes transfer liability to market',true);
 if(!q.manager)put('manager','Start external fund mandate','Requires university degree and knowledge 65 · $2,000 setup',s.education>=2&&s.stats.knowledge>=65&&s.cash>=2000);
 else {for(const f of funds)if(q.manager.strategy!==f.id)put('strategy:'+f.id,'Manage '+f.name+' strategy','Change external mandate allocation',q.manager.lastDecision!==clock(s));put('research','Research investment opportunities','Increase manager reputation · once yearly',q.manager.lastDecision!==clock(s)&&q.manager.reputation<100);put('leave','Close fund mandate','End management fees; no client assets enter personal wealth',true);}
 return out;
}
export function globalMarketAct(s,command,ctx){
 if(!globalMarketCommands({...s,actions:s.actions+1},ctx).some(x=>x.id===command&&x.enabled))throw Error('Investment action unavailable.');
 const [,tag,arg]=command.split(':'),q=state(s),year=clock(s);
 if(tag==='buy'||tag==='sell'){const h=q.holdings[arg]??={units:0,cost:0},price=q.prices[arg]*10;if(tag==='buy'){ctx.spend(s,price);h.units+=10;h.cost+=price;}else{const basis=h.units===10?h.cost:Math.round(h.cost*10/h.units);h.units-=10;h.cost-=basis;s.cash+=price;}trade(q,year,tag,arg,price);}
 if(tag==='government'||tag==='note'){const c=tag==='note'?firm(s,Number(arg)):null;ctx.spend(s,1000);if(c){c.cash+=1000;c.marketNoteDebt=noteDebt(c)+1000;}const b={id:++q.serial,name:c?c.name+' corporate note':'Government bond',issuer:c?.id??null,units:1,rate:q.policyRate+(c?3:0),maturity:year+3,owned:true,status:'active',missed:0,extensions:0};q.bonds.push(b);trade(q,year,'buy',b.name,1000);}
 if(tag==='exitbond'){const b=q.bonds.find(b=>b.id===Number(arg));s.cash+=face(b);b.owned=false;trade(q,year,'sell',b.name,face(b));}
 if(tag==='manager'){ctx.spend(s,2000);q.manager={aum:50000,strategy:'equity',reputation:50,years:0,lastReturn:0,totalFees:0,lastDecision:year};note(s,q,'Started an external investment fund mandate.',ctx);}
 if(tag==='strategy'){q.manager.strategy=arg;q.manager.lastDecision=year;}
 if(tag==='research'){q.manager.reputation=cap(q.manager.reputation+6,0,100);q.manager.lastDecision=year;}
 if(tag==='leave')q.manager=null;
}
export function inheritGlobalMarkets(next,old){
 if(!state(old))return;next.globalMarkets=JSON.parse(JSON.stringify(state(old)));const q=state(next);q.offset=clock(old)-next.age;q.lastYear=clock(old);q.manager=null;
 for(const [k,h] of Object.entries(q.holdings)){const keep=Math.min(h.units,Math.floor(next.cash/q.prices[k]/10)*10),cost=keep*q.prices[k];next.cash-=cost;h.cost=keep?Math.round(h.cost*keep/h.units):0;h.units=keep;}
 for(const b of q.bonds){if(b.status!=='active'||!b.owned)continue;if(b.issuer!==null&&!live(firm(next,b.issuer))){b.owned=false;b.status='defaulted';continue;}const v=face(b);if(next.cash>=v){next.cash-=v;}else b.owned=false;}
 // Reconcile note liabilities after inherited/closed company transitions.
 for(const c of firms(next))c.marketNoteDebt=q.bonds.filter(b=>b.issuer===c.id&&b.status==='active').reduce((n,b)=>n+face(b),0);
}
export function globalMarketView(s,worth){
 const q=state(s)||fresh(s);const companyRows=firms(s).filter(live).map(c=>({id:c.id,name:c.name,equity:corpValue(c),earnings:c.lastProfit,listed:!!c.corporate?.listed,owner:c.playerOwned?'You':person(s,c.ownerId)?.name||'Unknown'}));
 const ranks=s.people.filter(p=>p.alive&&p.age>=18&&p.world).map(p=>({id:p.id,name:p.name,worth:p.world.cash-p.world.debt+firms(s).filter(c=>live(c)&&c.ownerId===p.id&&!c.playerOwned).reduce((n,c)=>n+money(corpValue(c)*(100-(c.corporate?.publicFloat||0))/100),0)+(s.propertyMarket?.properties||[]).filter(h=>h.ownerId===p.id&&!h.playerOwned).reduce((n,h)=>n+h.value-(h.mortgage?.balance||0),0)}));
 ranks.push({id:0,name:s.name,worth:worth(s)});ranks.sort((a,b)=>b.worth-a.worth||a.id-b.id);
 return {year:clock(s),phase:q.phase,inflation:q.inflation,policyRate:q.policyRate,worth:globalMarketWorth(s),annual:q.annual,funds:funds.map(f=>({...f,price:q.prices[f.id],units:q.holdings[f.id]?.units||0,cost:q.holdings[f.id]?.cost||0,value:(q.holdings[f.id]?.units||0)*q.prices[f.id]})),bonds:q.bonds.filter(b=>b.owned).slice().reverse(),companies:companyRows,rankings:ranks.slice(0,10),playerRank:ranks.findIndex(r=>r.id===0)+1,manager:q.manager,history:q.history.filter(h=>h.kind==='snapshot').slice(-8),news:q.news.slice(-5).reverse()};
}
export function validateGlobalMarkets(s){
 const q=state(s);if(q===undefined)return true;
 if(!q||q.version!==1||!Number.isSafeInteger(q.offset)||clock(s)<0||!(q.lastYear===null||int(q.lastYear))||!int(q.serial)||!q.prices||!funds.every(f=>int(q.prices[f.id])&&q.prices[f.id]>=1&&q.prices[f.id]<=100000)||!q.holdings||!Object.entries(q.holdings).every(([k,h])=>fund(k)&&h&&int(h.units)&&h.units<=100000&&h.units%10===0&&int(h.cost))||!Array.isArray(q.bonds)||q.bonds.length>40||!Array.isArray(q.history)||q.history.length>60||!Array.isArray(q.news)||q.news.length>30||!int(q.inflation)||q.inflation>15||!int(q.policyRate)||q.policyRate<1||q.policyRate>12||!['steady','boom','slowdown','crisis'].includes(q.phase)||!(q.propertyIndex===null||int(q.propertyIndex)&&q.propertyIndex>=45&&q.propertyIndex<=260)||!q.annual||!['distributions','coupons','redemptions','management'].every(k=>int(q.annual[k])))return false;
 const ids=new Set();for(const b of q.bonds){if(!b||!int(b.id)||b.id===0||b.id>q.serial||ids.has(b.id)||typeof b.name!=='string'||!(b.issuer===null||firm(s,b.issuer))||b.units!==1||!int(b.rate)||b.rate<1||b.rate>15||!int(b.maturity)||typeof b.owned!=='boolean'||!['active','redeemed','defaulted'].includes(b.status)||!int(b.missed)||b.missed>2||!int(b.extensions)||b.extensions>2)return false;ids.add(b.id);}
 for(const c of firms(s))if(noteDebt(c)!==q.bonds.filter(b=>b.issuer===c.id&&b.status==='active').reduce((n,b)=>n+face(b),0))return false;
 const m=q.manager;if(m!==null&&(!m||!int(m.aum)||m.aum<10000||m.aum>2000000||!fund(m.strategy)||!int(m.reputation)||m.reputation>100||!int(m.years)||!Number.isInteger(m.lastReturn)||!int(m.totalFees)||!int(m.lastDecision)))return false;
 return q.history.every(h=>h&&int(h.year)&&['buy','sell','snapshot'].includes(h.kind)&&typeof h.asset==='string'&&int(h.amount))&&q.news.every(n=>n&&int(n.year)&&typeof n.text==='string');
}
