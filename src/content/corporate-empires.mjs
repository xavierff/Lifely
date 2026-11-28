// Corporate decisions operate on existing firms, rather than duplicating their balance sheets.
const cap=(n,a,b)=>Math.min(b,Math.max(a,n));
const cash=n=>Math.max(0,Math.round(n));
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const person=(s,id)=>s.people.find(p=>p.id===id);
const qOf=s=>s.livingEconomy;
const year=s=>s.age+(qOf(s)?.offset||0);
const active=c=>c.status==='active';
const industryMap={shop:['Retail & administration','Service & hospitality'],studio:['Creative & media'],service:['Trades & construction','Transport & logistics','Science & engineering'],technology:['Technology & data'],finance:['Finance & enterprise']};
const hireRole=(p,c,careers)=>careers.find(j=>industryMap[c.sector]?.includes(j.industry)&&j.education<=p.world.education&&j.knowledge<=p.world.talent);
const fresh=()=>({debt:0,listed:false,publicFloat:0,stake:0,products:0,regions:1,executiveId:null,parentId:null,offer:null,history:[],last:{},dividends:0,interest:0});
export const corporateProfile=c=>(c.corporate??=fresh());
const profile=c=>c.corporate||fresh();
export const corporateEquity=c=>cash(c.cash+c.capital-profile(c).debt);
export const corporatePlayerValue=c=>cash(corporateEquity(c)*(c.playerOwned?100-profile(c).publicFloat:profile(c).stake)/100);
export const corporateRevenueFactor=c=>1+profile(c).products*.07+(profile(c).regions-1)*.12+(profile(c).executiveId!==null?.06:0);
export const corporateOverhead=c=>cash((profile(c).regions-1)*c.capital*.035);
export function corporateInterest(c){const p=profile(c);return cash(p.debt*.07);}
function record(s,c,text,ctx){const p=corporateProfile(c);p.history.push({year:year(s),text});p.history=p.history.slice(-20);ctx.add(s,text,'finance');}
function available(s,c,tag){return profile(c).last[tag]!==year(s);}
function mark(s,c,tag){corporateProfile(c).last[tag]=year(s);}
function transfer(s,c,price,ctx){
 const p=corporateProfile(c),owner=person(s,c.ownerId);ctx.spend(s,price);owner.world.cash+=price;
 c.playerOwned=true;c.ownerId=null;c.transfers++;p.publicFloat=p.listed?p.publicFloat-p.stake:0;p.stake=0;p.offer=null;record(s,c,'Acquired control of '+c.name+'.',ctx);
}
const controllingPrice=c=>cash(corporateEquity(c)*(100-profile(c).publicFloat)/100);
const stockPrice=(c,percent)=>Math.max(1,cash(corporateEquity(c)*percent/100));
const offerPrice=(c,kind)=>cash(controllingPrice(c)*({opening:.9,counter:1.12,takeover:1.35}[kind]||1));
export function corporateCommands(s,ctx){
 if(!s.alive||s.age<18||s.justice?.years>0||s.justice?.case||!qOf(s))return [];
 const out=[],a=s.actions>0,cost=ctx.country(s).cost;
 for(const c of qOf(s).companies.filter(active)){
  const p=profile(c),owner=person(s,c.ownerId),offer=p.offer&&p.offer.year===year(s)?p.offer:null,canBuy=!!owner?.alive&&qOf(s).job?.companyId!==c.id;
  const put=(tag,label,detail,ok,extra)=>out.push({id:'corporate:'+tag+':'+c.id+(extra===undefined?'':':'+extra),label,detail,enabled:!!(a&&ok)});
  if(!c.playerOwned){
   put('offer','Open acquisition talks','Opening offer $'+offerPrice(c,'opening')+' · one activity',canBuy&&!offer&&available(s,c,'offer')&&controllingPrice(c)>0&&s.cash>=offerPrice(c,'opening'));
   if(offer)put('counter','Accept seller counteroffer','$'+offer.price+' for controlling stake',canBuy&&s.cash>=offer.price&&offer.price>0);
   put('takeover','Make premium control bid','35% premium · requires a listed firm and a 10% holding',canBuy&&p.listed&&p.stake>=10&&s.cash>=offerPrice(c,'takeover')&&controllingPrice(c)>0);
   if(p.listed){put('stockbuy','Buy 10% of shares','$'+stockPrice(c,10)+' · public float',p.stake+10<=p.publicFloat&&s.cash>=stockPrice(c,10));put('stocksell','Sell 10% of shares','$'+stockPrice(c,10),p.stake>=10);}
  }else{
   put('product','Develop a product','$'+cash(2500*cost)+' company funds · permanent revenue boost',p.products<5&&c.cash>=cash(2500*cost)&&available(s,c,'product'));
   put('marketing','Run marketing campaign','$'+cash(1200*cost)+' company funds · +10 demand',c.cash>=cash(1200*cost)&&available(s,c,'marketing')&&c.demand<100);
   put('expand','Enter another market','$'+cash(6000*cost)+' company funds · regional reach',p.regions<5&&c.cash>=cash(6000*cost)&&available(s,c,'expand'));
   put('loan','Raise corporate loan','$'+cash(10000*cost)+' company cash and debt · 7% yearly interest',p.debt+cash(10000*cost)<=Math.max(cash(10000*cost),c.capital*2)&&available(s,c,'loan'));
   put('repay','Repay corporate debt','Use up to $'+cash(10000*cost)+' from company cash',p.debt>0&&c.cash>0);
   put('restructure','Restructure company debt','Pay 60% of debt, reduce capital and reputation',p.debt>0&&c.cash>=cash(p.debt*.6)&&available(s,c,'restructure')&&c.lastProfit<0);
   put('list','List 20% of company','Public market buys 20% at book value; proceeds go to you',!p.listed&&corporateEquity(c)>0);
   put('fund','Inject personal capital','$'+cash(5000*cost)+' transferred to company',s.cash>=cash(5000*cost));
   put('capacity','Expand staffing capacity','$'+cash(4000*cost)+' company cash converted to capital',c.capacity<6&&c.cash>=cash(4000*cost)&&available(s,c,'capacity'));
   const applicants=s.people.filter(p=>p.alive&&p.age>=18&&p.age<65&&p.world?.job===null&&!qOf(s).companies.some(o=>active(o)&&o.staff.some(e=>e.personId===p.id))&&hireRole(p,c,ctx.careers)).slice(0,4);
   for(const p of applicants)put('hire','Recruit '+p.name,'Hire as '+hireRole(p,c,ctx.careers).title+' · $'+cash(500*cost)+' signing bonus',c.staff.length<c.capacity&&c.cash>=cash(500*cost),p.id);
   for(const e of c.staff){const emp=person(s,e.personId);if(!emp?.alive)continue;put('promote','Promote '+emp.name,'Pay $'+cash(1000*cost)+' company bonus',emp.world.level<5&&c.cash>=cash(1000*cost)&&available(s,c,'promote-'+e.personId),e.personId);put('executive','Appoint '+emp.name+' executive','Permanent management benefit while employed',p.executiveId!==e.personId&&emp.world.level>=1,e.personId);put('dismiss','Dismiss '+emp.name,'Pay $'+cash(1500*cost)+' severance',c.cash>=cash(1500*cost),e.personId);}
   for(const other of qOf(s).companies.filter(o=>active(o)&&o.playerOwned&&o.id!==c.id&&!profile(o).parentId&&!profile(c).parentId&&!qOf(s).companies.some(x=>profile(x).parentId===other.id)))put('subsidiary','Group '+other.name+' under '+c.name,'Link ownership without duplicating company value',true,other.id);
  }
 }
 return out;
}
export function corporateAct(s,command,ctx){
 if(!corporateCommands({...s,actions:s.actions+1},ctx).some(x=>x.id===command&&x.enabled))throw Error('Corporate decision unavailable.');
 const [,tag,cid,arg]=command.split(':'),c=qOf(s).companies.find(x=>x.id===Number(cid)),p=corporateProfile(c),cost=ctx.country(s).cost;
 const fee=n=>cash(n*cost),charge=n=>{c.cash-=n;};
 if(tag==='offer'){mark(s,c,'offer');const price=offerPrice(c,'opening'),owner=person(s,c.ownerId);if(c.lastProfit<0||owner.bond>=85){transfer(s,c,price,ctx);}else{p.offer={year:year(s),price:offerPrice(c,'counter')};record(s,c,owner.name+' countered your acquisition offer for '+c.name+'.',ctx);}}
 if(tag==='counter')transfer(s,c,p.offer.price,ctx);
 if(tag==='takeover'){transfer(s,c,offerPrice(c,'takeover'),ctx);record(s,c,'Completed a premium control bid for '+c.name+'.',ctx);}
 if(tag==='stockbuy'){ctx.spend(s,stockPrice(c,10));p.stake+=10;record(s,c,'Bought a 10% holding in '+c.name+'.',ctx);}
 if(tag==='stocksell'){s.cash+=stockPrice(c,10);p.stake-=10;record(s,c,'Sold a 10% holding in '+c.name+'.',ctx);}
 if(tag==='product'){charge(fee(2500));p.products++;mark(s,c,tag);record(s,c,'Launched product '+p.products+' at '+c.name+'.',ctx);}
 if(tag==='marketing'){charge(fee(1200));c.demand=cap(c.demand+10,15,100);mark(s,c,tag);record(s,c,'Ran a marketing campaign for '+c.name+'.',ctx);}
 if(tag==='expand'){charge(fee(6000));p.regions++;mark(s,c,tag);record(s,c,c.name+' entered another regional market.',ctx);}
 if(tag==='loan'){c.cash+=fee(10000);p.debt+=fee(10000);mark(s,c,tag);record(s,c,c.name+' raised a corporate loan.',ctx);}
 if(tag==='repay'){const n=Math.min(p.debt,c.cash,fee(10000));charge(n);p.debt-=n;record(s,c,'Repaid corporate debt at '+c.name+'.',ctx);}
 if(tag==='restructure'){charge(cash(p.debt*.6));p.debt=0;c.capital=cash(c.capital*.8);c.reputation=cap(c.reputation-15,0,100);mark(s,c,tag);record(s,c,'Restructured '+c.name+' with a creditor haircut and asset write-down.',ctx);}
 if(tag==='list'){s.cash+=stockPrice(c,20);p.listed=true;p.publicFloat=20;record(s,c,'Listed 20% of '+c.name+' on the public market.',ctx);}
 if(tag==='capacity'){charge(fee(4000));c.capital+=fee(4000);c.capacity++;mark(s,c,tag);record(s,c,'Expanded staffing capacity at '+c.name+'.',ctx);}
 if(tag==='hire'){const emp=person(s,Number(arg)),j=hireRole(emp,c,ctx.careers);charge(fee(500));emp.world.cash+=fee(500);emp.world.job=j.id;emp.world.level=0;c.staff.push({personId:emp.id,jobId:j.id});record(s,c,'Recruited '+emp.name+' at '+c.name+'.',ctx);}
 if(tag==='fund'){ctx.spend(s,fee(5000));c.cash+=fee(5000);record(s,c,'Injected personal capital into '+c.name+'.',ctx);}
 if(['promote','executive','dismiss'].includes(tag)){const emp=person(s,Number(arg));if(tag==='promote'){charge(fee(1000));emp.world.cash+=fee(1000);emp.world.level++;mark(s,c,'promote-'+emp.id);}if(tag==='executive')p.executiveId=emp.id;if(tag==='dismiss'){charge(fee(1500));emp.world.cash+=fee(1500);emp.world.job=null;emp.world.level=0;c.staff=c.staff.filter(e=>e.personId!==emp.id);if(p.executiveId===emp.id)p.executiveId=null;}record(s,c,tag+' · '+emp.name+' at '+c.name+'.',ctx);}
 if(tag==='subsidiary'){const other=qOf(s).companies.find(o=>o.id===Number(arg));corporateProfile(other).parentId=c.id;record(s,c,'Grouped '+other.name+' under '+c.name+'.',ctx);}
}
export function corporatePrepare(s,c,roll){const p=corporateProfile(c);if(p.offer&&p.offer.year!==year(s))p.offer=null;if(p.executiveId!==null&&!c.staff.some(e=>e.personId===p.executiveId))p.executiveId=null;if(p.parentId!==null&&!qOf(s).companies.some(o=>o.id===p.parentId&&active(o)&&o.playerOwned&&c.playerOwned))p.parentId=null;
 if(!c.playerOwned&&!p.listed&&corporateEquity(c)>50000&&roll(c.id,'listing')<.06){p.listed=true;p.publicFloat=20;const owner=person(s,c.ownerId);if(owner?.world)owner.world.cash+=stockPrice(c,20);}
 p.interest=corporateInterest(c);p.dividends=0;
}
export function corporatePayout(s,c,owner,amount){const p=corporateProfile(c),player=c.playerOwned?100-p.publicFloat:p.stake,ownerPct=c.playerOwned?0:100-p.publicFloat;
 const playerCash=cash(amount*player/100),ownerCash=Math.min(amount-playerCash,cash(amount*ownerPct/100));
 if(playerCash)s.cash+=playerCash;if(owner?.world)owner.world.cash+=ownerCash;p.dividends=playerCash;
}
export function corporateClose(c){if(!c.corporate)return;const p=c.corporate;p.debt=0;p.stake=0;p.publicFloat=0;p.listed=false;p.executiveId=null;p.parentId=null;p.offer=null;}
export function corporateSale(c){const p=corporateProfile(c);p.parentId=null;p.offer=null;}
export function corporateCleanup(s){for(const c of qOf(s)?.companies||[]){const p=c.corporate;if(!p)continue;if(p.executiveId!==null&&!c.staff.some(e=>e.personId===p.executiveId))p.executiveId=null;if(p.parentId!==null&&(!active(c)||!c.playerOwned||!qOf(s).companies.some(o=>o.id===p.parentId&&active(o)&&o.playerOwned)))p.parentId=null;}}
export function corporateView(c){const p=profile(c);return {...p,equity:corporateEquity(c),playerValue:corporatePlayerValue(c),controlPrice:controllingPrice(c)};}
export function validateCorporate(s,c){const p=c.corporate;if(p===undefined)return true;
 if(!p||!integer(p.debt)||typeof p.listed!=='boolean'||![0,10,20].includes(p.publicFloat)||!integer(p.stake)||p.stake>p.publicFloat||p.stake%10!==0||(!p.listed&&(p.publicFloat||p.stake))||(c.playerOwned&&p.stake!==0)||!integer(p.products)||p.products>5||!integer(p.regions)||p.regions<1||p.regions>5||!(p.executiveId===null||c.staff.some(e=>e.personId===p.executiveId))||!(p.parentId===null||p.parentId!==c.id&&qOf(s).companies.some(o=>o.id===p.parentId&&active(o)&&o.playerOwned&&c.playerOwned&&!profile(o).parentId))||!(p.offer===null||p.offer&&integer(p.offer.year)&&integer(p.offer.price))||!Array.isArray(p.history)||p.history.length>20||!p.last||!Object.values(p.last).every(integer)||!integer(p.dividends)||!integer(p.interest))return false;
 return p.history.every(h=>h&&integer(h.year)&&typeof h.text==='string');
}
