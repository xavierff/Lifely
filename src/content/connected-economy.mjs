// Shared fictional regional economies. Existing property and company assets keep their IDs.
import {internationalCities} from './international-life.mjs';
import {corporateEquity,corporatePlayerValue,corporateProfile} from './corporate-empires.mjs';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),cash=n=>Math.max(0,Math.round(n)),int=n=>Number.isSafeInteger(n)&&n>=0;
const clock=s=>s.age+(s.livingEconomy?.offset??s.internationalLife?.offset??0);
const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
const city=id=>internationalCities.find(c=>c.id===id),home=c=>internationalCities.find(x=>x.country===c);
const countryId=n=>int(n)&&n<6;
const current=s=>s.internationalLife?.city||home(s.country).id;
const person=(s,id)=>s.people.find(p=>p.id===id);
const active=c=>c?.status==='active';
const firms=s=>s.livingEconomy?.companies||[];
const properties=s=>s.propertyMarket?.properties||[];
const state=s=>s.connectedEconomy;
const fresh=()=>({version:1,lastYear:null,regions:Array.from({length:6},(_,id)=>({id,activity:100,inflation:3,rate:4,housing:100,demand:55,shock:'stable'})),portfolios:{},offers:[],news:[],ledger:[],lastActions:{}});
const region=(s,id)=>state(s)?.regions[id];
const local=(s,id)=>city(id)?.country??s.country;
export const companyCity=(s,c)=>c.cityId||s.internationalLife?.contacts[c.ownerId]?.city||current(s);
export const assetCity=(s,p)=>p.cityId||s.internationalLife?.contacts[p.ownerId]?.city||current(s);
export const npcCity=(s,p)=>s.internationalLife?.contacts[p.id]?.city||current(s);
export function regionalCountry(s,c,base){return base(c.cityId?city(c.cityId).country:s.country);}
export function regionalActivity(s,id){return (region(s,id)?.activity??100)/100;}
export function companyRegionalFactor(s,c){if(!state(s))return 1;const homeRegion=local(s,companyCity(s,c)),ids=[...new Set([homeRegion,...(c.marketRegions||[])])];return ids.reduce((n,id)=>n+regionalActivity(s,id),0)/ids.length;}
export function propertyRegionalGrowth(s,p){if(!state(s))return 1;const r=region(s,local(s,assetCity(s,p)));return clamp(r.housing/(r.previousHousing??r.housing),.8,1.2);}
export function propertyInitialFactor(s,id){return state(s)?(region(s,local(s,id)).housing/100)*(city(id)?.cost||1):1;}
export function localPropertyCity(s,serial){return state(s)?internationalCities[(serial+Math.floor(hash(s.name+':property-region')*18))%18].id:undefined;}
export function regionalCost(s,p,base){return base(city(npcCity(s,p)).country);}
function log(s,q,text,ctx){q.news.push({year:clock(s),text});q.news=q.news.slice(-35);ctx.add(s,text,'finance');}
export function connectedPrepare(s,ctx){
 if(!s.alive||s.age<18&&!state(s))return;
 const q=s.connectedEconomy??=fresh(),y=clock(s);if(q.lastYear===y)return;q.lastYear=y;
 const roll=ctx.roll||((i,t)=>hash((s.lifeId||s.name)+':regions:'+y+':'+i+':'+t));
 for(const r of q.regions){const old=r.shock,draw=roll(r.id,'shock');r.shock=draw<.055?'disruption':draw>.93?'investment boom':'stable';r.previousHousing=r.housing;
  r.activity=clamp(Math.round(r.activity*.7+30+(s.market-1)*20+(roll(r.id,'activity')-.5)*19+(r.shock==='disruption'?-18:r.shock==='investment boom'?15:0)),60,145);
  r.inflation=clamp(Math.round(r.inflation*.6+1.2+(r.activity-100)*.055+(r.shock==='disruption'?3:0)),0,15);
  r.rate=clamp(Math.round(2+r.inflation*.7),1,14);r.demand=clamp(Math.round(r.demand*.75+14+(r.activity-100)*.23),15,100);
  r.housing=clamp(Math.round(r.housing*(1+(r.activity-100)*.003+(r.demand-55)*.0015)),45,260);
  if(old!==r.shock&&r.shock!=='stable'&&r.id===s.country)log(s,q,ctx.countries[r.id].name+' entered a regional '+r.shock+'.',ctx);
 }
 for(const c of firms(s))if(!c.cityId)c.cityId=companyCity(s,c);
 for(const p of properties(s))if(!p.cityId)p.cityId=assetCity(s,p);
 q.offers=q.offers.filter(o=>o.year===y&&active(firms(s).find(c=>c.id===o.companyId)));
}
const price=s=>s.globalMarkets?.prices?.equity||100;
export const npcPortfolioWorth=(s,id)=>(state(s)?.portfolios[id]?.units||0)*price(s);
export function connectedYear(s,ctx){
 const q=state(s);if(!q||q.investmentYear===clock(s))return;q.investmentYear=clock(s);const y=clock(s);
 const roll=ctx.roll||((id,t)=>hash((s.lifeId||s.name)+':npc-invest:'+y+':'+id+':'+t));
 // External pooled equity units are exchanged for actual NPC cash, not invented wealth.
 for(const [id,h] of Object.entries(q.portfolios)){const p=person(s,Number(id));if(!p?.alive){const value=h.units*price(s),relatives=(s.npcFamilies?.unions||[]).filter(u=>u.adults.includes(Number(id))).flatMap(u=>[...u.children,...(['married','player'].includes(u.status)?u.adults:[])]).map(id=>person(s,id)).filter(n=>n?.alive&&n.world&&n.id!==Number(id));const heir=relatives.sort((a,b)=>a.id-b.id)[0];if(heir)heir.world.cash+=value;delete q.portfolios[id];}}
 if(!s.globalMarkets)return;
 for(const p of s.people.filter(p=>p.alive&&p.age>=25&&p.world).slice(0,96)){
  let h=q.portfolios[p.id];if(h){const dividend=cash(h.units*price(s)*.018);p.world.cash+=dividend;h.dividends+=dividend;}
  const reserve=cash(15000*ctx.countries[city(npcCity(s,p)).country].cost);
  if(h?.units&&(p.age>=65||p.world.cash<reserve/2)&&roll(p.id,'sell')<.7){const units=Math.min(10,h.units),basis=units===h.units?h.cost:Math.round(h.cost*units/h.units);p.world.cash+=units*price(s);h.units-=units;h.cost-=basis;if(!h.units)delete q.portfolios[p.id];}
  else if(p.age<65&&p.world.cash>=reserve+10*price(s)&&p.world.debt<reserve&&roll(p.id,'buy')<.35&&(!h||h.units<10000)&& (h||Object.keys(q.portfolios).length<96)){h=q.portfolios[p.id]??={units:0,cost:0,dividends:0};p.world.cash-=10*price(s);h.units+=10;h.cost+=10*price(s);}
 }
}
export function connectedBefore(s,worth){return {cash:s.cash,debt:s.debt,worth:worth(s)};}
export function connectedLedger(s,before,worth,baseBalance,companyReceipts){
 const q=state(s);if(!q)return;const p=s.propertyMarket?.annual||{},m=s.globalMarkets?.annual||{},property=(p.rent||0)-(p.maintenance||0)-(p.interest||0)-(p.principal||0),investment=(m.distributions||0)+(m.coupons||0)+(m.redemptions||0)+(m.management||0),actual=s.cash-before.cash;
 const entry={year:clock(s),openingCash:before.cash,closingCash:s.cash,legacyBalance:baseBalance,companyReceipts,property,investment,other:actual-baseBalance-companyReceipts-property-investment,cashChange:actual,debtChange:s.debt-before.debt,worthChange:worth(s)-before.worth};
 q.ledger.push(entry);q.ledger=q.ledger.slice(-25);
}
const bidder=(s,c,price)=>s.people.filter(p=>p.alive&&p.age>=25&&p.world?.cash>=price&&p.id!==c.ownerId&&!firms(s).some(o=>active(o)&&o.ownerId===p.id)).sort((a,b)=>b.world.cash-a.world.cash||a.id-b.id)[0];
const quote=c=>corporateEquity(c);
export function connectedCommands(s,ctx){
 const q=state(s);if(!q||!s.alive||s.age<18||s.justice?.years>0||s.justice?.case)return [];
 const out=[],a=s.actions>0,y=clock(s),put=(id,label,detail,ok)=>out.push({id:'connected:'+id,label,detail,enabled:!!(a&&ok)});
 for(const c of firms(s).filter(active)){
  if(c.playerOwned){const profile=corporateProfile(c),fee=cash(4000*ctx.countries[local(s,companyCity(s,c))].cost);
   for(const r of q.regions.filter(r=>r.id!==local(s,companyCity(s,c))&&!(c.marketRegions||[]).includes(r.id)))put('region:'+c.id+':'+r.id,'Open '+ctx.countries[r.id].name+' branch · '+c.name,'$'+fee+' company cash converted to operating capital · diversified demand',(c.marketRegions||[]).length<5&&c.cash>=fee&&q.lastActions['region:'+c.id]!==y);
   for(const [id,label] of [['quality','Prioritize product reliability'],['staff','Protect employee stability'],['reserve','Strengthen reserves']])put('board:'+c.id+':'+id,label+' · '+c.name,'Company board decision · one per year',q.lastActions['board:'+c.id]!==y&&c.cash>=cash(1000*ctx.countries[local(s,companyCity(s,c))].cost));
  }else if(!c.corporate?.listed&&person(s,c.ownerId)?.alive&&quote(c)>0&&s.livingEconomy?.job?.companyId!==c.id){
   const o=q.offers.find(o=>o.companyId===c.id&&o.year===y),price=cash(quote(c)*1.1),b=bidder(s,c,price);
   if(!o&&b)put('auction:'+c.id,'Open competitive acquisition · '+c.name,'Rival '+b.name+' can offer $'+price,s.cash>=quote(c)&&q.offers.length<20);
   if(o){const bid=cash(o.price*1.05);put('bid:'+c.id,'Outbid '+o.bidderName+' for '+c.name,'$'+bid+' · acquire private firm',s.cash>=bid);put('pass:'+c.id,'Let rival acquire '+c.name,'NPC buyer pays seller from actual savings',!!person(s,o.bidderId)?.alive&&person(s,o.bidderId).world.cash>=o.price);}
  }
 }
 return out;
}
export function connectedAct(s,id,ctx){
 if(!connectedCommands({...s,actions:s.actions+1},ctx).some(c=>c.id===id&&c.enabled))throw Error('Regional economy action unavailable.');
 const [,tag,key,arg]=id.split(':'),q=state(s),c=firms(s).find(c=>c.id===Number(key)),y=clock(s),country=ctx.countries[local(s,companyCity(s,c))];
 if(tag==='region'){const fee=cash(4000*country.cost);c.cash-=fee;c.capital+=fee;(c.marketRegions??=[]).push(Number(arg));q.lastActions['region:'+c.id]=y;log(s,q,c.name+' opened a branch in '+ctx.countries[Number(arg)].name+'.',ctx);}
 if(tag==='board'){const fee=cash(1000*country.cost);c.cash-=fee;q.lastActions['board:'+c.id]=y;if(arg==='quality'){c.reputation=clamp(c.reputation+8,0,100);c.demand=clamp(c.demand+3,15,100);}else if(arg==='staff'){c.reputation=clamp(c.reputation+5,0,100);for(const e of c.staff){const p=person(s,e.personId);if(p?.world)p.world.joy=clamp(p.world.joy+6,0,100);}}else{c.capital+=fee;c.reputation=clamp(c.reputation+2,0,100);}log(s,q,c.name+' approved a '+arg+' board priority.',ctx);}
 if(tag==='auction'){const price=cash(quote(c)*1.1),b=bidder(s,c,price);q.offers.push({companyId:c.id,bidderId:b.id,bidderName:b.name,price,year:y});log(s,q,b.name+' made a competing offer for '+c.name+'.',ctx);}
 if(tag==='bid'||tag==='pass'){const o=q.offers.find(o=>o.companyId===c.id),seller=person(s,c.ownerId),price=tag==='bid'?cash(o.price*1.05):o.price;if(tag==='bid'){ctx.spend(s,price);c.playerOwned=true;c.ownerId=null;}else{const buyer=person(s,o.bidderId);buyer.world.cash-=price;c.ownerId=buyer.id;}seller.world.cash+=price;c.transfers++;q.offers=q.offers.filter(o=>o.companyId!==c.id);log(s,q,c.name+' acquisition completed at $'+price+'.',ctx);}
}
export function inheritConnected(next,old,heir){const prev=state(old);if(!prev)return;const q=JSON.parse(JSON.stringify(prev));q.offers=[];q.lastActions={};q.portfolios=Object.fromEntries(Object.entries(q.portfolios).filter(([id])=>Number(id)!==heir.id&&person(next,Number(id))?.alive));next.cash+=npcPortfolioWorth(old,heir.id);next.connectedEconomy=q;}
export function connectedView(s,ctx){const q=state(s)||fresh();return {regions:q.regions.map(r=>({...r,name:ctx.countries[r.id].name,companies:firms(s).filter(c=>active(c)&&local(s,companyCity(s,c))===r.id).length,properties:properties(s).filter(p=>local(s,assetCity(s,p))===r.id).length})),companies:firms(s).filter(active).map(c=>({id:c.id,name:c.name,city:city(companyCity(s,c)).name,branches:(c.marketRegions||[]).map(id=>ctx.countries[id].name),equity:quote(c),playerOwned:c.playerOwned})),properties:properties(s).map(p=>({id:p.id,name:p.name,city:city(assetCity(s,p)).name,value:p.value,playerOwned:p.playerOwned})),investors:Object.entries(q.portfolios).map(([id,h])=>({id:Number(id),name:person(s,Number(id))?.name||'Former investor',value:h.units*price(s),cost:h.cost})).sort((a,b)=>b.value-a.value).slice(0,8),ledger:q.ledger.slice(-5).reverse(),news:q.news.slice(-5).reverse()};}
export function validateConnected(s){const q=state(s);if(q===undefined)return true;
 if(!q||q.version!==1||!(q.lastYear===null||int(q.lastYear))||!Array.isArray(q.regions)||q.regions.length!==6||!q.regions.every((r,i)=>r&&r.id===i&&int(r.activity)&&r.activity>=60&&r.activity<=145&&int(r.inflation)&&r.inflation<=15&&int(r.rate)&&r.rate>=1&&r.rate<=14&&int(r.housing)&&r.housing>=45&&r.housing<=260&&int(r.demand)&&r.demand>=15&&r.demand<=100&&['stable','disruption','investment boom'].includes(r.shock))||!q.portfolios||Object.keys(q.portfolios).length>96||!Object.entries(q.portfolios).every(([id,h])=>person(s,Number(id))&&h&&int(h.units)&&h.units>0&&h.units<=10000&&h.units%10===0&&int(h.cost)&&int(h.dividends))||!Array.isArray(q.offers)||q.offers.length>20||!Array.isArray(q.news)||q.news.length>35||!Array.isArray(q.ledger)||q.ledger.length>25||!q.lastActions||!Object.values(q.lastActions).every(int))return false;
 return firms(s).every(c=>(!c.cityId||city(c.cityId))&&(!c.marketRegions||Array.isArray(c.marketRegions)&&c.marketRegions.length<=5&&new Set(c.marketRegions).size===c.marketRegions.length&&c.marketRegions.every(countryId)))&&properties(s).every(p=>!p.cityId||city(p.cityId))&&q.offers.every(o=>o&&int(o.companyId)&&firms(s).some(c=>c.id===o.companyId)&&person(s,o.bidderId)&&int(o.price)&&o.price>0&&int(o.year))&&q.ledger.every(l=>l&&int(l.year)&&Object.values(l).every(Number.isFinite)&&l.closingCash-l.openingCash===l.cashChange&&l.legacyBalance+l.companyReceipts+l.property+l.investment+l.other===l.cashChange)&&q.news.every(n=>n&&int(n.year)&&typeof n.text==='string');
}
