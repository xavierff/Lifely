// Annual, bounded family simulation. All members are real people in the existing cast.
const MAX_NEW=24,MAX_UNIONS=24,MAX_LINKS=32;
const fresh=()=>({version:1,lastYear:null,serial:0,generated:[],unions:[],links:[],news:[]});
const live=(s,id)=>s.people.find(p=>p.id===id&&p.alive);
const find=(s,id)=>s.people.find(p=>p.id===id);
const active=(q,id)=>q.unions.find(u=>u.status==='married'&&u.adults.includes(id));
const ancestors=(q,id)=>{const seen=new Set(),queue=[id];while(queue.length){const child=queue.pop();for(const u of q.unions.filter(x=>x.children.includes(child)))for(const p of u.adults)if(!seen.has(p)){seen.add(p);queue.push(p);}}return seen;};
const related=(q,a,b)=>{const x=ancestors(q,a),y=ancestors(q,b);return x.has(b)||y.has(a)||[...x].some(id=>y.has(id));};
const eligible=p=>p.alive&&p.age>=22&&p.age<=65&&['friend','child','sibling','ex','community'].includes(p.role);
const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
const bounded=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const amount=n=>Math.max(0,Math.round(n));
function record(s,q,kind,u,text,ctx,guests=[]){q.news.push({age:s.age,kind,unionId:u.id,text,guests});q.news=q.news.slice(-40);if(u.adults.some(id=>(live(s,id)?.bond||0)>=55))ctx.add(s,text,'people');}
function charge(p,n){const w=p.world;if(!w)return;const paid=Math.min(w.cash,n);w.cash-=paid;w.debt+=n-paid;}
function newMember(s,q,ctx,age){if(q.generated.length>=MAX_NEW)return null;const p=ctx.person(s,'community',age);p.bond=35;s.people.push(p);q.generated.push(p.id);return p;}
function pairKey(a,b){return [a,b].sort((x,y)=>x-y).join(':');}
export function npcFamilyYear(s,ctx){
 if(!s.alive||s.age<18)return;
 const q=s.npcFamilies??=fresh();if(q.lastYear===s.age)return;q.lastYear=s.age;
 const roll=(id,tag)=>ctx.roll?ctx.roll(id,tag):hash((s.lifeId||s.name)+':families:'+s.age+':'+id+':'+tag);
 const existing=s.people.filter(eligible).sort((a,b)=>a.id-b.id);
 const scale=ctx.country(s).cost;
 for(const u of q.unions){
   const adults=u.adults.map(id=>live(s,id)).filter(Boolean);
   if(u.status==='married'&&(adults.length<2||adults.some(p=>p.role==='partner'))){u.status=adults.length<2?'widowed':'separated';u.endedAge=s.age;record(s,q,u.status,u,u.names.join(' & ')+ (u.status==='widowed'?' experienced a family bereavement.':' ended their independent marriage.'),ctx); }
   const children=u.children.map(id=>live(s,id)).filter(p=>p&&p.age<18);
   const carers=adults.filter(p=>p.world);
   if(carers.length&&children.length){const total=amount(children.length*3200*scale),share=Math.floor(total/carers.length);carers.forEach((p,i)=>charge(p,share+(i===0?total-share*carers.length:0)));u.lastChildCost=total;}else u.lastChildCost=0;
   if(u.status!=='married')continue;
   const [a,b]=adults;
   const stress=adults.some(p=>(p.world?.debt||0)>30000*scale);
   u.bond=bounded(u.bond+(roll(u.id,'bond')<.55?3:-4)-(stress?3:0),0,100);
   if(s.age-u.startedAge>=2&&roll(u.id,'divorce')<(u.bond<35?.23:stress?.045:.014)){u.status='divorced';u.endedAge=s.age;record(s,q,'divorce',u,u.names.join(' & ')+' divorced and will continue raising their children separately.',ctx);continue;}
   if(s.age>u.startedAge&&s.age-u.lastChildAge>=3&&u.children.length<3&&a.age<=48&&b.age<=48&&u.bond>=50&&roll(u.id,'child')<.20){
     const child=newMember(s,q,ctx,0);if(child){u.children.push(child.id);u.lastChildAge=s.age;record(s,q,'child',u,u.names.join(' & ')+' welcomed '+child.name+' into their family.',ctx,[child.id]);}
   }
   if(s.age>u.startedAge&&(s.age-u.startedAge)%5===0)record(s,q,'anniversary',u,u.names.join(' & ')+' celebrated another five years of marriage.',ctx);
   for(const p of adults){const w=p.world;if(!w||w.job===null||p.age>=60||roll(p.id,'career')>=.035)continue;const options=ctx.careers.filter(j=>j.id!==w.job&&j.education<=w.education&&j.knowledge<=w.talent);if(options.length){const job=options[Math.floor(roll(p.id,'career-choice')*options.length)%options.length];w.job=job.id;w.level=0;ctx.npcNews(s,p,'Changed careers to '+job.title+' while managing family responsibilities.');}}
 }
 // At most one new marriage a year. Known friends can marry each other; relatives never pair with known relatives.
 if(q.unions.length<MAX_UNIONS){const candidates=existing.filter(p=>!active(q,p.id)&&roll(p.id,'marriage')<.13);
   for(const a of candidates){
     let b=a.role==='friend'?candidates.find(p=>p.id!==a.id&&p.role==='friend'&&!active(q,p.id)&&!related(q,a.id,p.id)&&Math.abs(a.age-p.age)<=12):null;
     if(!b)b=newMember(s,q,ctx,bounded(a.age+Math.floor(roll(a.id,'partner-age')*9)-4,22,65));
     if(!b)continue;
     const u={id:++q.serial,adults:[a.id,b.id],names:[a.name,b.name],children:[],status:'married',startedAge:s.age,endedAge:null,lastChildAge:s.age,bond:72,lastChildCost:0};
     q.unions.push(u);record(s,q,'wedding',u,a.name+' and '+b.name+' got married.',ctx,[b.id]);break;
   }
 }
 const couples=q.unions.filter(u=>u.status==='married'&&u.adults.every(id=>live(s,id)));
 // Households maintain affinity and periodically meet without the player initiating anything.
 for(const l of q.links){const a=couples.find(u=>u.id===l.ids[0]),b=couples.find(u=>u.id===l.ids[1]);if(!a||!b)continue;l.affinity=bounded(l.affinity+(roll(l.ids.join(':'),'affinity')<.65?3:-3),0,100);if(s.age-l.lastAge>=3&&roll(l.ids.join(':'),'gathering')<.35){l.lastAge=s.age;l.meetings++;l.affinity=bounded(l.affinity+6,0,100);record(s,q,'gathering',a,a.names.join(' & ')+' hosted '+b.names.join(' & ')+' for a family gathering.',ctx,b.adults);}}
 if(q.links.length<MAX_LINKS){outer:for(let i=0;i<couples.length;i++)for(let j=i+1;j<couples.length;j++){const a=couples[i],b=couples[j];if(q.links.some(l=>pairKey(...l.ids)===pairKey(a.id,b.id)))continue;if(roll(pairKey(a.id,b.id),'link')<.18){q.links.push({ids:[a.id,b.id],affinity:55,lastAge:s.age,meetings:1});record(s,q,'gathering',a,a.names.join(' & ')+' met up with '+b.names.join(' & ')+'.',ctx,b.adults);break outer;}}}
}
export function npcFamilyInvites(s){
 const q=s.npcFamilies;if(!q)return [];
 return q.news.filter(n=>n.age===s.age&&['wedding','child','anniversary','gathering'].includes(n.kind)).map(n=>{const u=q.unions.find(u=>u.id===n.unionId),host=u?.adults.map(id=>live(s,id)).filter(p=>p&&p.bond>=45).sort((a,b)=>b.bond-a.bond)[0];return host&&u.status==='married'?{host,kind:{wedding:'npcwedding',child:'npcbaby',anniversary:'npcanniversary',gathering:'npcgathering'}[n.kind],guests:[...new Set([...u.adults,...n.guests])].filter(id=>id!==host.id&&live(s,id)).slice(0,3)}:null;}).filter(Boolean);
}
export function npcFamilyView(s,occupation){
 const q=s.npcFamilies||fresh();const profile=id=>{const p=find(s,id);return p?{id,name:p.name,age:p.age,alive:p.alive,bond:p.bond,occupation:occupation(p),cash:p.world?.cash||0,debt:p.world?.debt||0}:null;};
 return {households:q.unions.slice().reverse().map(u=>{const adults=u.adults.map(profile).filter(Boolean),children=u.children.map(profile).filter(Boolean);return {...u,adults,children,netWorth:adults.filter(p=>p.alive).reduce((n,p)=>n+p.cash-p.debt,0)};}),links:q.links.map(l=>({...l,names:l.ids.map(id=>q.unions.find(u=>u.id===id)?.names.join(' & ')).filter(Boolean)})),news:q.news.slice(-12).reverse(),generated:q.generated.length};
}
export function validateNpcFamilies(s){
 const q=s.npcFamilies;if(q===undefined)return true;
 const id=n=>Number.isInteger(n)&&n>0,age=n=>Number.isInteger(n)&&n>=0&&n<=110,score=n=>Number.isInteger(n)&&n>=0&&n<=100,ids=(a,max)=>Array.isArray(a)&&a.length<=max&&a.every(id)&&new Set(a).size===a.length;
 if(!q||q.version!==1||!(q.lastYear===null||age(q.lastYear))||!Number.isInteger(q.serial)||q.serial<0||!ids(q.generated,MAX_NEW)||!q.generated.every(id=>find(s,id))||!Array.isArray(q.unions)||q.unions.length>MAX_UNIONS||!Array.isArray(q.links)||q.links.length>MAX_LINKS||!Array.isArray(q.news)||q.news.length>40)return false;
 const married=new Set(),children=new Set(),unions=new Set();
 for(const u of q.unions){if(!u||!id(u.id)||u.id>q.serial||unions.has(u.id)||!ids(u.adults,2)||u.adults.length!==2||!u.adults.every(id=>find(s,id))||!Array.isArray(u.names)||u.names.length!==2||!u.names.every(n=>typeof n==='string')||!ids(u.children,3)||!u.children.every(id=>find(s,id)&&!u.adults.includes(id))||!['married','divorced','widowed','separated'].includes(u.status)||!age(u.startedAge)||!age(u.lastChildAge)||u.lastChildAge<u.startedAge||!score(u.bond)||!Number.isFinite(u.lastChildCost)||u.lastChildCost<0||(u.status==='married'?u.endedAge!==null:!age(u.endedAge)||u.endedAge<u.startedAge))return false;unions.add(u.id);for(const c of u.children){if(children.has(c))return false;children.add(c);}if(u.status==='married')for(const a of u.adults){if(married.has(a))return false;married.add(a);}}
 const links=new Set();for(const l of q.links){if(!l||!ids(l.ids,2)||l.ids.length!==2||!l.ids.every(id=>unions.has(id))||links.has(pairKey(...l.ids))||!score(l.affinity)||!age(l.lastAge)||!id(l.meetings))return false;links.add(pairKey(...l.ids));}
 return q.news.every(n=>n&&age(n.age)&&unions.has(n.unionId)&&['wedding','child','anniversary','gathering','divorce','widowed','separated'].includes(n.kind)&&typeof n.text==='string'&&ids(n.guests,3)&&n.guests.every(id=>find(s,id)));
}
