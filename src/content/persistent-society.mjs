// Durable family identity, absolute world clock, inheritance and independent enterprises.
const copy=v=>JSON.parse(JSON.stringify(v));
const id=n=>Number.isSafeInteger(n)&&n>0;
const year=n=>Number.isSafeInteger(n)&&n>=0;
const money=n=>Math.max(0,Math.round(n));
const fresh=()=>({version:1,offset:0,playerId:null,identities:[],kinship:[],estates:[],enterprises:[],news:[]});
export const familyClock=s=>s.age+(s.npcFamilies?.society?.offset||0);
export const ensureSociety=s=>(s.npcFamilies.society??=fresh());
export function familyPerson(s,pid){
 const p=s.people.find(p=>p.id===pid);if(p)return p;
 const q=s.npcFamilies?.society,old=Array.isArray(q?.identities)?q.identities.find(p=>p?.id===pid):null;
 if(old&&q.playerId===pid)return {...old,name:s.name,age:s.age,alive:s.alive,role:'player',world:{...old.world,job:s.job?.id??null,cash:s.cash,debt:s.debt}};
 return old||null;
}
const edgeKey=(a,b)=>a+':'+b;
function edges(s){const q=s.npcFamilies;if(!q)return [];const result=[...(q.society?.kinship||[])];for(const u of q.unions)for(const c of u.children)for(const p of u.adults)result.push({parent:p,child:c});return [...new Map(result.map(x=>[edgeKey(x.parent,x.child),x])).values()];}
export function kinAncestors(s,pid){const e=edges(s),seen=new Set(),stack=[pid];while(stack.length){const c=stack.pop();for(const x of e)if(x.child===c&&!seen.has(x.parent)){seen.add(x.parent);stack.push(x.parent);}}return seen;}
export function familyRelated(s,a,b){const x=kinAncestors(s,a),y=kinAncestors(s,b);return a===b||x.has(b)||y.has(a)||[...x].some(i=>y.has(i));}
function relation(s,a,b){
 if(a===b)return 'You';
 const e=edges(s),parents=i=>e.filter(x=>x.child===i).map(x=>x.parent),children=i=>e.filter(x=>x.parent===i).map(x=>x.child);
 const ap=parents(a),bp=parents(b),ac=children(a);
 const sibling=ap.some(x=>bp.includes(x));
 if(ap.includes(b))return 'Parent';if(ac.includes(b))return 'Child';if(sibling)return 'Sibling';
 if(ap.flatMap(parents).includes(b))return 'Grandparent';if(ac.flatMap(children).includes(b))return 'Grandchild';
 const siblingsOf=i=>{const ps=parents(i);return [...new Set(ps.flatMap(children))].filter(x=>x!==i);};
 if(ap.flatMap(siblingsOf).includes(b))return 'Aunt / uncle';
 if(siblingsOf(a).flatMap(children).includes(b))return 'Niece / nephew';
 if(ap.flatMap(siblingsOf).flatMap(children).includes(b))return 'Cousin';
 const partner=s.npcFamilies?.unions.find(u=>['married','player'].includes(u.status)&&u.adults.includes(a))?.adults.find(i=>i!==a);
 if(partner===b)return 'Spouse';
 if(partner&&(parents(partner).includes(b)||siblingsOf(partner).includes(b)))return 'In-law';
 if(ac.some(c=>s.npcFamilies?.unions.some(u=>['married','player'].includes(u.status)&&u.adults.includes(c)&&u.adults.includes(b))))return 'In-law';
 return kinAncestors(s,a).has(b)?'Ancestor':kinAncestors(s,b).has(a)?'Descendant':familyRelated(s,a,b)?'Extended relative':null;
}
function pushEdge(q,parent,child){if(parent!==child&&!q.kinship.some(x=>x.parent===parent&&x.child===child))q.kinship.push({parent,child});}
export function syncPlayerKinship(s){
 if(!s.npcFamilies?.unions.length&&!s.npcFamilies?.society?.playerId)return;
 const so=ensureSociety(s);
 if(so.playerId===null){const pid=s.nextId++;so.playerId=pid;so.identities.push({id:pid,name:s.name,age:s.age,alive:true,role:'player',bond:65,world:{job:s.job?.id??null,cash:0,debt:0}});}
 for(const p of s.people){if(p.role==='child')pushEdge(so,so.playerId,p.id);if(p.role==='parent')pushEdge(so,p.id,so.playerId);}
}
export function inheritSociety(next,old,heir){
 if(!old.npcFamilies||(!old.npcFamilies.unions.length&&!old.npcFamilies.society?.playerId))return;
 next.npcFamilies=copy(old.npcFamilies);const q=next.npcFamilies,so=ensureSociety(next),at=familyClock(old);
 // Store the previous player as an immutable identity, not a second active NPC.
 const previousId=so.playerId??old.nextId;
 const previous={id:previousId,name:old.name,age:old.age,alive:false,role:'ancestor',bond:65,world:{job:old.job?.id??null,cash:0,debt:0}};
 so.identities=so.identities.filter(p=>p.id!==previousId&&p.id!==heir.id);
 so.identities.push(previous,{id:heir.id,name:heir.name,age:heir.age,alive:true,role:'player',bond:65,world:copy(heir.world||{job:null,cash:0,debt:0})});
 so.playerId=heir.id;so.offset=at-next.age;q.lastYear=at;
 for(const p of old.people){if(p.role==='child')pushEdge(so,previousId,p.id);if(p.role==='parent')pushEdge(so,p.id,previousId);}
 // Keep family graph references and the living cast, with original IDs, ages, careers and cash.
 const refs=new Set([...q.generated,...q.unions.flatMap(u=>[...u.adults,...u.children]),...so.kinship.flatMap(e=>[e.parent,e.child]),...so.enterprises.map(b=>b.ownerId),...so.estates.flatMap(e=>[e.personId,...e.heirs.map(h=>h.id)])]);
 const kept=new Map(next.people.map(p=>[p.id,p]));
 for(const p of old.people){if(p.id===heir.id||so.identities.some(i=>i.id===p.id))continue;if(!refs.has(p.id)&&!p.alive)continue;if(!refs.has(p.id)&&!kept.has(p.id)&&kept.size>=64)continue;
 if(!kept.has(p.id))kept.set(p.id,{...copy(p),role:p.role==='friend'?'friend':'community',married:false});
 }
 next.people=[...kept.values()];
 next.nextId=Math.max(old.nextId,next.nextId,previousId+1,heir.id+1,...next.people.map(p=>p.id+1),...so.identities.map(p=>p.id+1));
 // An heir's established household becomes the player's family, not a second simulation.
 for(const u of q.unions){if(u.status==='player'){u.status='widowed';u.endedAge=at;}if(u.status==='married'&&u.adults.includes(heir.id)){const spouse=next.people.find(p=>p.id===u.adults.find(id=>id!==heir.id)&&p.alive);if(spouse){u.status='player';spouse.role='partner';spouse.married=true;}else{u.status='widowed';u.endedAge=at;}}
 if(u.adults.includes(heir.id))for(const cid of u.children){const c=next.people.find(p=>p.id===cid);if(c&&c.alive)c.role='child';}}
 for(const p of next.people){const r=relation(next,heir.id,p.id);if(p.role==='partner'||p.role==='child')continue;if(r==='Parent')p.role='parent';else if(r==='Sibling')p.role='sibling';else if(r==='Grandparent')p.role='grandparent';}
 // A former NPC business is retained as a historical family asset; player economy never pays twice.
 for(const b of so.enterprises)if(b.ownerId===heir.id&&b.status==='active'){next.cash+=b.value;b.status='player';}
 so.news.push({year:at,text:old.name+' → '+heir.name+': the same society continues.'});so.news=so.news.slice(-40);
}
function heirsFor(s,pid){const q=s.npcFamilies;const children=edges(s).filter(x=>x.parent===pid).map(x=>x.child);const spouse=q.unions.find(u=>['married','player'].includes(u.status)&&u.adults.includes(pid))?.adults.find(i=>i!==pid);return [...new Set([...(spouse?[spouse]:[]),...children])].map(i=>familyPerson(s,i)).filter(p=>p&&p.alive&&p.world);}
function log(so,at,text){so.news.push({year:at,text});so.news=so.news.slice(-40);}
export function societyYear(s,ctx,roll){
 const q=s.npcFamilies;if(!q||!q.unions.length)return;const so=ensureSociety(s),at=familyClock(s),cost=ctx.country(s).cost;
 const people=new Set([...q.unions.flatMap(u=>[...u.adults,...u.children])]);
 for(const p of s.people.filter(p=>people.has(p.id)&&!p.alive&&p.world&&!p.world.familyEstateSettled)){
  const heirs=heirsFor(s,p.id),net=money(p.world.cash-p.world.debt);p.world.familyEstateSettled=true;p.world.cash=0;p.world.debt=0;
  const shares=heirs.map((h,i)=>({id:h.id,amount:Math.floor(net/heirs.length)+(i===0?net%heirs.length:0)}));for(const h of shares){if(h.id===so.playerId)s.cash+=h.amount;else s.people.find(p=>p.id===h.id).world.cash+=h.amount;}
  so.estates.push({year:at,personId:p.id,name:p.name,amount:shares.reduce((n,h)=>n+h.amount,0),heirs:shares});so.estates=so.estates.slice(-40);
  if(shares.length)log(so,at,p.name+' left '+shares.length+' family beneficiaries an independent estate.');
 }
 for(const b of so.enterprises){if(b.status!=='active')continue;let p=s.people.find(p=>p.id===b.ownerId&&p.alive);if(!p){const heirs=heirsFor(s,b.ownerId).filter(p=>p.age>=18);if(!heirs.length){b.status='closed';continue;}p=heirs.sort((a,b)=>b.age-a.age||a.id-b.id)[0];b.ownerId=p.id;b.transfers++;log(so,at,p.name+' inherited '+b.name+'.');if(p.id===so.playerId){s.cash+=b.value;b.status='player';continue;}}
 const rate=(roll(b.id,'enterprise-return')-.42)*.16;const profit=Math.round(b.value*rate);b.lastProfit=profit;if(profit>0)p.world.cash+=profit;else b.value=Math.max(0,b.value+profit);if(b.value<100)b.status='closed';
 }
 if(so.enterprises.length>=24)return;
 for(const u of q.unions.filter(u=>u.status==='married')){if(so.enterprises.some(b=>b.unionId===u.id))continue;const p=u.adults.map(id=>s.people.find(p=>p.id===id&&p.alive)).find(p=>p?.world&&p.age>=25&&p.age<=65&&p.world.cash>=money(20000*cost));if(!p||roll(u.id,'enterprise-start')>=.07)continue;const capital=money(8000*cost);p.world.cash-=capital;so.enterprises.push({id:so.enterprises.length+1,unionId:u.id,ownerId:p.id,name:p.name+' family business',value:capital,lastProfit:0,transfers:0,status:'active'});log(so,at,p.name+' founded a family business.');break;}
}
export function societyView(s){const q=s.npcFamilies,so=q?.society;if(!so)return {year:familyClock(s),persistent:false,relatives:[],estates:[],enterprises:[],news:[]};
 const relatives=so.playerId===null?[]:[...s.people,...so.identities.filter(p=>p.id!==so.playerId)].map(p=>({...p,relationship:relation(s,so.playerId,p.id)})).filter(p=>p.relationship).map(p=>({id:p.id,name:p.name,age:p.age,alive:p.alive,relationship:p.relationship}));
 return {year:familyClock(s),persistent:s.generation>1,relatives,estates:so.estates.slice().reverse().map(e=>({...e,heirs:e.heirs.map(h=>({...h,name:familyPerson(s,h.id)?.name||'Relative'}))})),enterprises:so.enterprises.map(b=>({...b,owner:familyPerson(s,b.ownerId)?.name||'Unknown'})),news:so.news.slice().reverse()};
}
export function validateSociety(s){const so=s.npcFamilies?.society;if(so===undefined)return true;
 if(!so||so.version!==1||!Number.isSafeInteger(so.offset)||familyClock(s)<0||!(so.playerId===null||id(so.playerId))||!Array.isArray(so.identities)||!Array.isArray(so.kinship)||!Array.isArray(so.estates)||so.estates.length>40||!Array.isArray(so.enterprises)||so.enterprises.length>24||!Array.isArray(so.news)||so.news.length>40)return false;
 const all=new Set(s.people.map(p=>p.id));for(const p of so.identities){if(!p||!id(p.id)||all.has(p.id)||p.id>=s.nextId||typeof p.name!=='string'||!year(p.age)||typeof p.alive!=='boolean'||p.alive!==(p.id===so.playerId))return false;all.add(p.id);}
 if(so.playerId!==null&&!so.identities.some(p=>p.id===so.playerId))return false;
 const keys=new Set();for(const e of so.kinship){if(!e||!all.has(e.parent)||!all.has(e.child)||e.parent===e.child||keys.has(edgeKey(e.parent,e.child)))return false;keys.add(edgeKey(e.parent,e.child));}
 for(const e of edges(s))if(kinAncestors(s,e.parent).has(e.child))return false;
 const finite=n=>Number.isFinite(n)&&n>=0;
 return so.estates.every(e=>e&&year(e.year)&&all.has(e.personId)&&typeof e.name==='string'&&finite(e.amount)&&Array.isArray(e.heirs)&&e.heirs.every(h=>all.has(h.id)&&finite(h.amount))&&e.heirs.reduce((n,h)=>n+h.amount,0)===e.amount)&&so.enterprises.every((b,i)=>b&&b.id===i+1&&s.npcFamilies.unions.some(u=>u.id===b.unionId)&&all.has(b.ownerId)&&typeof b.name==='string'&&finite(b.value)&&Number.isFinite(b.lastProfit)&&year(b.transfers)&&['active','closed','player'].includes(b.status))&&so.news.every(n=>n&&year(n.year)&&typeof n.text==='string');
}
