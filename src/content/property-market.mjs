import {localPropertyCity,propertyInitialFactor,propertyRegionalGrowth,assetCityCountry} from './connected-economy.mjs';
// Independent property assets. Legacy property menu remains a separate inventory.
const MAX=30,cap=(n,a,b)=>Math.min(b,Math.max(a,n)),money=n=>Math.max(0,Math.round(n)),integer=n=>Number.isSafeInteger(n)&&n>=0;
const kinds=[
 {id:'apartment',name:'Apartment',base:75000,yield:.065,maintenance:.014},
 {id:'house',name:'Family home',base:150000,yield:.055,maintenance:.017},
 {id:'duplex',name:'Rental duplex',base:210000,yield:.075,maintenance:.019},
 {id:'office',name:'Office building',base:340000,yield:.08,maintenance:.023},
 {id:'hotel',name:'Hotel',base:580000,yield:.095,maintenance:.035},
 {id:'retail',name:'Shopping center',base:720000,yield:.085,maintenance:.028}
];
const spec=p=>kinds.find(k=>k.id===p.kind);
const person=(s,id)=>s.people.find(p=>p.id===id);
const state=s=>s.propertyMarket;
const clock=s=>s.age+(state(s)?.offset||s.livingEconomy?.offset||0);
const fresh=()=>({version:1,offset:0,lastYear:null,serial:0,priceIndex:100,demand:55,phase:'balanced',properties:[],news:[],annual:{rent:0,maintenance:0,interest:0,principal:0}});
const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
const get=(s,id)=>state(s)?.properties.find(p=>p.id===id);
const owner=(s,p)=>p.playerOwned?s:person(s,p.ownerId)?.world;
const debt=p=>p.mortgage?.balance||0;
const equity=p=>money(p.value-debt(p));
const asking=p=>p.offer?.price??p.value;
const rentDue=p=>money(p.value*spec(p).yield*p.rentLevel/100*(.65+p.condition/285));
const rate=q=>q.phase==='crash'?8:q.phase==='boom'?7:5;
const fee=(s,ctx,n)=>money(n*ctx.country(s).cost);
function notify(s,q,p,text,ctx,force=false){q.news.push({year:clock(s),propertyId:p.id,text});q.news=q.news.slice(-40);if(force||p.playerOwned||(person(s,p.ownerId)?.bond||0)>=65)ctx.add(s,text,'finance');}
function listing(q,k,value){const id=++q.serial;return {id,kind:k.id,name:k.name+' #'+id,value,condition:75,ownerId:null,playerOwned:false,mortgage:null,tenantId:null,rentLevel:100,lastRent:0,offer:null,offeredYear:null,project:null,upgrades:0,foreclosed:false};}
function createListing(s,q,ctx,roll){if(q.properties.length>=MAX)return;const k=kinds[Math.floor(roll(q.serial+1,'kind')*kinds.length)%kinds.length];const id=localPropertyCity(s,q.serial+1),target=id?assetCityCountry(s,id):s.country;const p=listing(q,k,money(k.base*(ctx.countries?.[target]?.cost??ctx.country(s).cost)*(id?propertyInitialFactor(s,id):q.priceIndex/100)));if(id)p.cityId=id;q.properties.push(p);}
function availableTenant(s,p){const q=state(s),rent=rentDue(p);return s.people.filter(n=>n.alive&&n.age>=18&&n.age<80&&n.id!==p.ownerId&&n.world&&n.world.cash>=rent&&!q.properties.some(h=>h.tenantId===n.id)&&!q.properties.some(h=>h.ownerId===n.id)).sort((a,b)=>b.bond-a.bond||a.id-b.id);}
function closeLoan(p){p.mortgage=null;}
function lenderSale(s,q,p,ctx){const o=owner(s,p),surplus=money(p.value*.85-debt(p));if(o)o.cash+=surplus;p.ownerId=null;p.playerOwned=false;p.tenantId=null;p.project=null;p.offer=null;p.foreclosed=true;closeLoan(p);notify(s,q,p,p.name+' was foreclosed; remaining equity returned after the lender sale.',ctx,true);}
function sale(s,p,buyer,price,loan,ctx){
 const old=owner(s,p);if(old)old.cash+=money(price-debt(p));
 const oldPlayer=p.playerOwned;
 if(buyer===s){ctx.spend(s,price-loan);p.playerOwned=true;p.ownerId=null;}else{buyer.world.cash-=price-loan;p.playerOwned=false;p.ownerId=buyer.id;}
 p.mortgage=loan?{balance:loan,rate:rate(state(s)),years:20,missed:0}:null;p.offer=null;p.foreclosed=false;
 if(p.tenantId===p.ownerId)p.tenantId=null;
 if(oldPlayer)p.project=null;
}
export function propertyMarketYear(s,ctx){
 if(!s.alive||(s.age<18&&!state(s)))return;
 const q=s.propertyMarket??=fresh(),at=clock(s);if(q.lastYear===at)return;q.lastYear=at;
 const roll=ctx.roll||((i,t)=>hash((s.lifeId||s.name)+':properties:'+at+':'+i+':'+t));
 q.annual={rent:0,maintenance:0,interest:0,principal:0};
 const prev=q.priceIndex;
 q.demand=cap(q.demand+Math.round((s.market-1)*20+(roll(0,'demand')-.5)*12),15,100);
 q.phase=s.market<=.78?'crash':q.demand>=75&&s.market>=1.1?'boom':s.market<.92?'cooling':'balanced';
 q.priceIndex=cap(Math.round(q.priceIndex*(1+(q.phase==='crash'?-.14:q.phase==='boom'?.12:(s.market-1)*.12+.015))),45,260);
 const existing=new Set(q.properties.map(p=>p.id));if(s.connectedEconomy)q.priceIndex=Math.round(s.connectedEconomy.regions.reduce((n,r)=>n+r.housing,0)/6);if(!q.properties.length){for(let i=0;i<3;i++)createListing(s,q,ctx,roll);}
 else if(q.properties.filter(p=>!p.playerOwned&&p.ownerId===null).length<3&&roll(0,'new')<.7)createListing(s,q,ctx,roll);
 for(const p of q.properties){
  p.lastRent=0;p.value=Math.max(1000,money(p.value*(s.connectedEconomy?(existing.has(p.id)?propertyRegionalGrowth(s,p):1):q.priceIndex/prev)));if(p.offer?.year!==at)p.offer=null;
  if(p.ownerId!==null&&!person(s,p.ownerId)?.alive){
   const heirs=[...new Set((s.npcFamilies?.unions||[]).filter(u=>u.adults.includes(p.ownerId)).flatMap(u=>[...u.children,...(['married','player'].includes(u.status)?u.adults:[])]))].map(id=>person(s,id)).filter(n=>n?.alive&&n.age>=18&&n.id!==p.ownerId);
   if(heirs.length){p.ownerId=heirs.sort((a,b)=>b.age-a.age||a.id-b.id)[0].id;if(p.tenantId===p.ownerId)p.tenantId=null;notify(s,q,p,p.name+' passed to a family heir.',ctx);}
   else{p.ownerId=null;p.tenantId=null;p.project=null;closeLoan(p);}
  }
  const o=owner(s,p);
  if(!o){if(roll(p.id,'npc-buy')<.18){const n=s.people.filter(n=>n.alive&&n.age>=25&&n.age<70&&n.world?.cash>=p.value&&!q.properties.some(h=>h.ownerId===n.id)&&!q.properties.some(h=>h.tenantId===n.id)).sort((a,b)=>b.world.cash-a.world.cash)[0];if(n){sale(s,p,n,p.value,0,ctx);notify(s,q,p,n.name+' bought '+p.name+'.',ctx);}}continue;}
  if(p.project&&p.project.due<=at){p.value+=money(p.project.cost*1.25);p.upgrades++;p.condition=cap(p.condition+15,0,100);p.project=null;notify(s,q,p,p.name+' completed its development project.',ctx);}
  p.condition=cap(p.condition-4,0,100);
  const tenant=person(s,p.tenantId);
  if(tenant?.alive&&tenant.age>=18&&tenant.world.cash>=rentDue(p)&&p.condition>=35&&roll(p.id,'leave')>=.05+(p.rentLevel>110?.18:0)){
    const rent=rentDue(p);tenant.world.cash-=rent;o.cash+=rent;p.lastRent=rent;if(p.playerOwned)q.annual.rent+=rent;
  }else if(p.tenantId!==null){p.tenantId=null;notify(s,q,p,p.name+' became vacant.',ctx);}
  if(p.tenantId===null&&!p.playerOwned&&roll(p.id,'lease')<.5){const n=availableTenant(s,p)[0];if(n)p.tenantId=n.id;}
  const maint=money(p.value*spec(p).maintenance);
  if(o.cash>=maint){o.cash-=maint;if(p.playerOwned)q.annual.maintenance+=maint;}else p.condition=cap(p.condition-8,0,100);
  if(p.mortgage){const m=p.mortgage,interest=money(m.balance*m.rate/100),principal=Math.min(m.balance,Math.ceil(m.balance/Math.max(1,m.years)));
   if(o.cash>=interest+principal){o.cash-=interest+principal;m.balance-=principal;m.years--;m.missed=0;if(p.playerOwned){q.annual.interest+=interest;q.annual.principal+=principal;}if(!m.balance)closeLoan(p);}
   else{m.balance+=interest;m.missed++;notify(s,q,p,p.name+' missed a mortgage payment.',ctx);if(m.missed>=2)lenderSale(s,q,p,ctx);}
  }
 }
}
export function propertyMarketWorth(s){return (state(s)?.properties||[]).filter(p=>p.playerOwned).reduce((n,p)=>n+p.value-debt(p),0);}
export function propertyMarketCommands(s,ctx){
 if(!s.alive||s.age<18||s.justice?.years>0||s.justice?.case||!state(s))return [];
 const q=state(s),a=s.actions>0,out=[];
 for(const p of q.properties){
 const put=(tag,label,detail,ok,arg)=>out.push({id:'propertymarket:'+tag+':'+p.id+(arg===undefined?'':':'+arg),label,detail,enabled:!!(a&&ok)});
 const price=asking(p),loan=money(price*.7),seller=person(s,p.ownerId);
 if(!p.playerOwned){
  const canBuy=(p.ownerId===null||seller?.alive)&&price>=debt(p)&&price>0;
  put('buy','Purchase '+p.name,'Cash price $'+price.toLocaleString('en-US'),canBuy&&s.cash>=price);
  put('mortgage','Buy with mortgage','30% down · '+rate(q)+'% annual interest · 20 years',canBuy&&s.cash>=price-loan&&loan>0);
  put('offer','Negotiate purchase','Offer 90% of market price; seller may counter',p.offeredYear!==clock(s)&&!p.offer&&p.value*.9>=debt(p)&&s.cash>=money(p.value*.3));
 }else{
  put('sell','Sell property','Receive net equity $'+equity(p).toLocaleString('en-US'),p.value>=debt(p)&&!p.project);
  put('repair','Renovate property','$'+fee(s,ctx,2000)+' · +20 condition',p.condition<100&&s.cash>=fee(s,ctx,2000));
  put('raise','Raise rent 10%','Higher potential income; vacancy risk',p.rentLevel<130);
  put('lower','Lower rent 10%','Improve affordability',p.rentLevel>70);
  if(p.tenantId!==null)put('release','End tenancy','Vacate property at end of agreement',true);
  else for(const n of availableTenant(s,p).slice(0,3))put('lease','Lease to '+n.name,'Annual rent $'+rentDue(p).toLocaleString('en-US'),true,n.id);
  if(p.mortgage){put('repay','Make extra principal payment','Up to $'+fee(s,ctx,10000),s.cash>0);put('refinance','Refinance mortgage','2% fee · reset to 20 years at '+rate(q)+'%',p.mortgage.rate>rate(q)&&s.cash>=money(debt(p)*.02));}
  const build=money(p.value*.12);put('develop','Start property development','2 years · $'+build.toLocaleString('en-US')+' investment',!p.project&&p.upgrades<3&&s.cash>=build);
 }
 }
 return out;
}
export function propertyMarketAct(s,command,ctx){
 if(!propertyMarketCommands({...s,actions:s.actions+1},ctx).some(x=>x.id===command&&x.enabled))throw Error('Property action unavailable.');
 const [,tag,id,arg]=command.split(':'),p=get(s,Number(id)),q=state(s);
 if(tag==='offer'){const seller=person(s,p.ownerId);p.offeredYear=clock(s);const price=money(p.value*(p.foreclosed||q.phase==='crash'||seller?.bond>=80?.9:.97));p.offer={year:clock(s),price:Math.max(debt(p),price)};notify(s,q,p,'Seller quoted $'+p.offer.price+' for '+p.name+'.',ctx,true);}
 if(tag==='buy'||tag==='mortgage'){const price=asking(p);sale(s,p,s,price,tag==='mortgage'?money(price*.7):0,ctx);notify(s,q,p,'You purchased '+p.name+'.',ctx);}
 if(tag==='sell'){s.cash+=equity(p);p.playerOwned=false;p.ownerId=null;p.tenantId=null;closeLoan(p);p.offer=null;notify(s,q,p,'You sold '+p.name+' and settled its mortgage.',ctx,true);}
 if(tag==='repair'){ctx.spend(s,fee(s,ctx,2000));p.condition=cap(p.condition+20,0,100);}
 if(tag==='raise')p.rentLevel+=10;if(tag==='lower')p.rentLevel-=10;
 if(tag==='lease'){p.tenantId=Number(arg);notify(s,q,p,person(s,p.tenantId).name+' signed a lease for '+p.name+'.',ctx);}
 if(tag==='release')p.tenantId=null;
 if(tag==='repay'){const n=Math.min(s.cash,debt(p),fee(s,ctx,10000));ctx.spend(s,n);p.mortgage.balance-=n;if(!debt(p))closeLoan(p);}
 if(tag==='refinance'){ctx.spend(s,money(debt(p)*.02));p.mortgage.rate=rate(q);p.mortgage.years=20;p.mortgage.missed=0;}
 if(tag==='develop'){const cost=money(p.value*.12);ctx.spend(s,cost);p.project={cost,due:clock(s)+2};notify(s,q,p,'Started development of '+p.name+'.',ctx);}
}
export function inheritPropertyMarket(next,old,heir){
 if(!state(old))return;next.propertyMarket=JSON.parse(JSON.stringify(state(old)));const q=state(next);q.offset=clock(old)-next.age;q.lastYear=clock(old);
 // Old property equity is already in the estate. Retain assets only against available estate cash, avoiding double counting.
 for(const p of q.properties){p.offer=null;if(p.playerOwned){const value=p.value-debt(p);if(value>=0&&next.cash>=value){next.cash-=value;}else{p.playerOwned=false;p.ownerId=null;p.tenantId=null;p.project=null;closeLoan(p);}}else if(p.ownerId===heir.id){p.playerOwned=true;p.ownerId=null;}if(p.tenantId===heir.id)p.tenantId=null;}
 const refs=new Set(q.properties.flatMap(p=>[p.ownerId,p.tenantId]).filter(id=>id!==null)),kept=new Map(next.people.map(p=>[p.id,p]));
 for(const p of old.people)if(refs.has(p.id)&&p.id!==heir.id&&!kept.has(p.id)&&!next.npcFamilies?.society?.identities.some(i=>i.id===p.id))kept.set(p.id,{...JSON.parse(JSON.stringify(p)),role:'community',married:false});
 next.people=[...kept.values()];next.nextId=Math.max(old.nextId,next.nextId,...next.people.map(p=>p.id+1));
 for(const p of q.properties){if(p.ownerId!==null&&!kept.has(p.ownerId)){p.ownerId=null;p.project=null;closeLoan(p);}if(p.tenantId!==null&&!kept.has(p.tenantId))p.tenantId=null;}
}
export function propertyMarketView(s){const q=state(s)||fresh();return {year:clock(s),phase:q.phase,index:q.priceIndex,demand:q.demand,worth:propertyMarketWorth(s),annual:q.annual,properties:q.properties.map(p=>({...p,owner:p.playerOwned?'You':person(s,p.ownerId)?.name||'Market listing',tenant:person(s,p.tenantId)?.name||null,equity:p.value-debt(p),annualRent:rentDue(p),asking:asking(p)})),news:q.news.slice(-6).reverse()};}
export function validatePropertyMarket(s){
 const q=state(s);if(q===undefined)return true;
 if(!q||q.version!==1||!Number.isSafeInteger(q.offset)||clock(s)<0||!(q.lastYear===null||integer(q.lastYear))||!integer(q.serial)||!integer(q.priceIndex)||q.priceIndex<45||q.priceIndex>260||!integer(q.demand)||q.demand<15||q.demand>100||!['balanced','boom','cooling','crash'].includes(q.phase)||!Array.isArray(q.properties)||q.properties.length>MAX||!Array.isArray(q.news)||q.news.length>40||!q.annual||!['rent','maintenance','interest','principal'].every(k=>integer(q.annual[k])))return false;
 const ids=new Set(),tenants=new Set();
 for(const p of q.properties){if(!p||!integer(p.id)||p.id===0||p.id>q.serial||ids.has(p.id)||!spec(p)||typeof p.name!=='string'||!integer(p.value)||p.value<1000||!integer(p.condition)||p.condition>100||typeof p.playerOwned!=='boolean'||(p.playerOwned&&p.ownerId!==null)||!(p.ownerId===null||person(s,p.ownerId))||!(p.tenantId===null||person(s,p.tenantId)&&p.tenantId!==p.ownerId&&!tenants.has(p.tenantId))||!integer(p.rentLevel)||p.rentLevel<70||p.rentLevel>130||!integer(p.lastRent)||!integer(p.upgrades)||p.upgrades>3||typeof p.foreclosed!=='boolean'||!(p.offeredYear===null||integer(p.offeredYear))||!(p.offer===null||p.offer&&integer(p.offer.year)&&integer(p.offer.price))||!(p.project===null||p.project&&integer(p.project.cost)&&integer(p.project.due))||!(p.mortgage===null||p.mortgage&&integer(p.mortgage.balance)&&p.mortgage.balance>0&&[5,7,8].includes(p.mortgage.rate)&&integer(p.mortgage.years)&&p.mortgage.years>0&&p.mortgage.years<=20&&[0,1].includes(p.mortgage.missed)))return false;ids.add(p.id);if(p.tenantId!==null)tenants.add(p.tenantId);}
 return q.news.every(n=>n&&integer(n.year)&&ids.has(n.propertyId)&&typeof n.text==='string');
}
