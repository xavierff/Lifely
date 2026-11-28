// Fictional migration rules and location economics, not real-world legal advice.
const cap=(n,a,b)=>Math.max(a,Math.min(b,n)),money=n=>Math.max(0,Math.round(n)),int=n=>Number.isSafeInteger(n)&&n>=0;
export const internationalCities=[
 ['newyork',0,'New York',1.28,1.35,'Finance & enterprise'],['chicago',0,'Chicago',1.02,1.02,'Trades & construction'],['austin',0,'Austin',1.09,1.08,'Technology & data'],
 ['jakarta',1,'Jakarta',1.12,1.18,'Finance & enterprise'],['bandung',1,'Bandung',.88,.83,'Creative & media'],['surabaya',1,'Surabaya',.98,.96,'Transport & logistics'],
 ['tokyo',2,'Tokyo',1.18,1.25,'Technology & data'],['osaka',2,'Osaka',.98,.94,'Service & hospitality'],['fukuoka',2,'Fukuoka',.9,.83,'Creative & media'],
 ['toronto',3,'Toronto',1.12,1.24,'Finance & enterprise'],['vancouver',3,'Vancouver',1.05,1.28,'Creative & media'],['calgary',3,'Calgary',1.01,.92,'Science & engineering'],
 ['london',4,'London',1.25,1.38,'Finance & enterprise'],['manchester',4,'Manchester',.99,.91,'Technology & data'],['edinburgh',4,'Edinburgh',.94,.93,'Education & society'],
 ['sydney',5,'Sydney',1.18,1.3,'Finance & enterprise'],['melbourne',5,'Melbourne',1.04,1.09,'Creative & media'],['perth',5,'Perth',1.02,.95,'Science & engineering']
].map(([id,country,name,salary,cost,industry])=>({id,country,name,salary,cost,industry}));
const city=id=>internationalCities.find(c=>c.id===id);
const home=c=>internationalCities.find(x=>x.country===c);
const state=s=>s.internationalLife;
const clock=s=>s.age+(state(s)?.offset??s.livingEconomy?.offset??0);
const blank=s=>({version:1,offset:clock(s)-s.age,lastYear:null,city:home(s.country).id,birthCountry:s.country,citizenships:[s.country],residency:{type:'citizen',since:clock(s),expires:null},permits:[],languages:[0,1,2,3,4,5].map(i=>i===s.country?100:0),contacts:{},trip:null,trips:[],moves:[],news:[],network:0,studyCredit:0,careerCredit:0,lastAction:{}});
const person=(s,id)=>s.people.find(p=>p.id===id);
const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
const actual=(s)=>city(state(s)?.city)||home(s.country);
export const internationalCost=s=>state(s)?actual(s).cost:1;
export const internationalSalary=(s,job)=>state(s)?actual(s).salary*(job?.industry===actual(s).industry?1.08:1):1;
const location=(q,p)=>q.contacts[p.id]||null;
const permit=(q,c,at)=>q.permits.find(p=>p.country===c&&p.expires>=at);
const add=(s,q,text,ctx)=>{q.news.push({year:clock(s),text});q.news=q.news.slice(-25);ctx.add(s,text,'milestone');};
const available=(s,q,key)=>q.lastAction[key]!==clock(s);
const mark=(s,q,key)=>q.lastAction[key]=clock(s);
const cost=(s,ctx,n,c=s.country)=>money(n*ctx.countries[c].cost);
function move(s,q,target,ctx,type){
 const from=actual(s),year=clock(s),cross=from.country!==target.country;
 if(cross){s.country=target.country;s.job=null;s.relocations=(s.relocations||0)+1;q.residency={type,since:year,expires:type==='citizen'||type==='permanent'?null:year+3};q.permits=q.permits.filter(p=>p.country!==target.country);q.network=0;q.studyCredit=0;q.careerCredit=0;}
 else q.network=Math.floor(q.network*.5);
 q.city=target.id;q.moves.push({year,from:from.id,to:target.id,type});q.moves=q.moves.slice(-30);q.trip=null;
 for(const p of s.people.filter(p=>p.alive)){if(!q.contacts[p.id])q.contacts[p.id]={city:from.id,years:0};if(['partner','child'].includes(p.role)){q.contacts[p.id]={city:target.id,years:0};}else if(cross&&p.role==='friend')ctx.bond(s,p,-3,'Moved abroad');}
 ctx.change(s,'stress',cross?8:4);add(s,q,'Relocated to '+target.name+'.',ctx);
}
export function internationalLegacyMove(s,oldCountry,ctx){const q=state(s);if(!q)return;const old=city(q.city)||home(oldCountry),target=home(s.country),year=clock(s);q.city=target.id;q.residency={type:q.citizenships.includes(s.country)?'citizen':'permanent',since:year,expires:null};q.network=0;q.trip=null;q.moves.push({year,from:old.id,to:target.id,type:'legacy'});q.moves=q.moves.slice(-30);for(const p of s.people.filter(p=>p.alive)){if(!q.contacts[p.id])q.contacts[p.id]={city:old.id,years:0};if(['partner','child'].includes(p.role))q.contacts[p.id]={city:target.id,years:0};}}
export function internationalYear(s,ctx){
 if(!s.alive||s.age<18&&!state(s))return;
 const q=s.internationalLife??=blank(s),at=clock(s);if(q.lastYear===at)return;q.lastYear=at;
 const roll=ctx.roll||((i,t)=>hash((s.lifeId||s.name)+':international:'+at+':'+i+':'+t));
 q.permits=q.permits.filter(p=>p.expires>=at);
 if(q.residency.expires!==null&&q.residency.expires<at){q.residency.type='expired';q.residency.expires=null;add(s,q,'Temporary residency expired. Renew your simulated status to unlock local international opportunities.',ctx);}
 if(q.trip&&q.trip.year!==at)q.trip=null;
 for(const p of s.people.filter(p=>p.alive)){const loc=q.contacts[p.id]??={city:q.city,years:0};loc.years++;
  if(['partner','child'].includes(p.role))loc.city=q.city;
  else if(p.age>=22&&p.age<=55&&loc.years>=3&&roll(p.id,'migrate')<.035){const dest=internationalCities[Math.floor(roll(p.id,'city')*internationalCities.length)%internationalCities.length];if(dest.id!==loc.city){loc.city=dest.id;loc.years=0;if(p.bond>=65)add(s,q,p.name+' relocated to '+dest.name+'.',ctx);}}
 }
 for(const id of Object.keys(q.contacts))if(!person(s,Number(id)))delete q.contacts[id];
 if(q.residency.type!=='expired'&&q.languages[s.country]<100)q.languages[s.country]=cap(q.languages[s.country]+3,0,100);
 if(q.residency.type!=='expired'&&q.network<100)q.network=cap(q.network+2,0,100);
}
export function internationalCommands(s,ctx){
 const q=state(s);if(!q||!s.alive||s.age<18||s.justice?.years>0||s.justice?.case)return [];
 const at=clock(s),a=s.actions>0,out=[],valid=q.residency.type!=='expired',canMove=!s.business&&!s.profession&&!s.study&&!s.justice?.probation&&s.properties.length===0;
 const put=(tag,label,detail,ok)=>out.push({id:'international:'+tag,label,detail,enabled:!!(a&&ok)});
 for(const c of internationalCities.filter(c=>c.id!==q.city)){
  const cross=c.country!==s.country,p=permit(q,c.country,at),citizen=q.citizenships.includes(c.country),amount=cost(s,ctx,cross?5000:1200,c.country);
  put('move:'+c.id,'Relocate to '+c.name,'$'+amount+' · '+(cross?'work, study, family or retirement permit required unless citizen':'domestic relocation'),canMove&&s.cash>=amount&&(!cross||citizen||!!p));
  if(cross&&c===home(c.country)&&!citizen&&!p){
   const fee=cost(s,ctx,500,c.country),eligible={work:s.education>=1||s.stats.knowledge>=65,study:s.education<3&&s.stats.knowledge>=50,family:s.people.some(n=>n.alive&&['partner','child','parent'].includes(n.role)&&city(location(q,n)?.city)?.country===c.country),retire:s.age>=60&&s.cash>=cost(s,ctx,40000,c.country)};
   for(const [type,ok] of Object.entries(eligible))put('permit:'+c.country+':'+type,'Apply for '+type+' permit · '+ctx.countries[c.country].name,'$'+fee+' · fictional eligibility rules · valid 3 years',ok&&s.cash>=fee&&!s.justice?.probation);
  }
  const trip=cost(s,ctx,cross?1200:250,c.country);put('trip:'+c.id,'Travel to '+c.name,'$'+trip+' · unlock cultural, social and career itinerary',!q.trip&&available(s,q,'trip')&&s.cash>=trip);
 }
 if(q.residency.type==='expired'||q.residency.expires!==null)put('renew','Renew residency','Restore temporary status for 3 years · $'+cost(s,ctx,400),s.cash>=cost(s,ctx,400)&&available(s,q,'renew'));
 if(['work','study','family','retire'].includes(q.residency.type))put('permanent','Apply for permanent residency','3 years residence · language 40 · $'+cost(s,ctx,1000),at-q.residency.since>=3&&q.languages[s.country]>=40&&s.cash>=cost(s,ctx,1000));
 if(q.residency.type==='permanent')put('citizen','Naturalize as citizen','5 years residence · language 65 · $'+cost(s,ctx,1500),at-q.residency.since>=5&&q.languages[s.country]>=65&&s.cash>=cost(s,ctx,1500));
 put('language','Study local language','+12 proficiency · $'+cost(s,ctx,100),q.languages[s.country]<100&&s.cash>=cost(s,ctx,100)&&available(s,q,'language'));
 put('community','Join neighborhood community','+10 local network and social confidence',valid&&available(s,q,'community')&&q.network<100);
 put('education','Attend international academic workshop','Build knowledge and transferable study credit · $'+cost(s,ctx,400),valid&&s.cash>=cost(s,ctx,400)&&available(s,q,'education')&&q.studyCredit<5);
 put('career','Attend international career fair','Build performance and employer network · $'+cost(s,ctx,200),valid&&s.cash>=cost(s,ctx,200)&&available(s,q,'career')&&q.careerCredit<5);
 for(const j of ctx.careers.filter(j=>j.industry===actual(s).industry&&j.education<=s.education&&j.knowledge<=s.stats.knowledge).slice(0,3))put('job:'+j.id,'Apply locally · '+j.title,'City specialty · existing career qualifications',valid&&q.network>=10&&!s.retired&&!s.business&&!s.profession&&s.job?.id!==j.id);
 if(q.trip)for(const [type,label,n] of [['culture','Explore culture',100],['network','Meet local professionals',80],['family','Visit friends and relatives',50]])put('itinerary:'+type,label,'$'+cost(s,ctx,n,city(q.trip.city).country)+' · one trip activity',!q.trip.done.includes(type)&&s.cash>=cost(s,ctx,n,city(q.trip.city).country));
 for(const n of s.people.filter(n=>n.alive&&location(q,n)?.city!==q.city&&n.bond>=45).slice(0,5))put('call:'+n.id,'Video call '+n.name,'Maintain long-distance relationships',available(s,q,'call-'+n.id));
 return out;
}
export function internationalAct(s,command,ctx){
 if(!internationalCommands({...s,actions:s.actions+1},ctx).some(x=>x.id===command&&x.enabled))throw Error('International action unavailable.');
 const [,tag,arg,extra]=command.split(':'),q=state(s),at=clock(s);
 if(tag==='permit'){const c=Number(arg);ctx.spend(s,cost(s,ctx,500,c));q.permits.push({country:c,type:extra,expires:at+3});add(s,q,'Received a fictional '+extra+' permit for '+ctx.countries[c].name+'.',ctx);}
 if(tag==='move'){const c=city(arg),cross=c.country!==s.country,type=q.citizenships.includes(c.country)?'citizen':permit(q,c.country,at)?.type||q.residency.type;ctx.spend(s,cost(s,ctx,cross?5000:1200,c.country));move(s,q,c,ctx,type);}
 if(tag==='renew'){ctx.spend(s,cost(s,ctx,400));q.residency.type=q.residency.type==='expired'?'work':q.residency.type;q.residency.expires=at+3;mark(s,q,'renew');}
 if(tag==='permanent'){ctx.spend(s,cost(s,ctx,1000));q.residency.type='permanent';q.residency.expires=null;add(s,q,'Obtained permanent residency.',ctx);}
 if(tag==='citizen'){ctx.spend(s,cost(s,ctx,1500));q.citizenships=[...new Set([...q.citizenships,s.country])];q.residency.type='citizen';add(s,q,'Completed simulated naturalization.',ctx);}
 if(tag==='language'){ctx.spend(s,cost(s,ctx,100));q.languages[s.country]=cap(q.languages[s.country]+12,0,100);mark(s,q,tag);}
 if(tag==='community'){q.network=cap(q.network+10,0,100);ctx.change(s,'social',4);mark(s,q,tag);}
 if(tag==='education'){ctx.spend(s,cost(s,ctx,400));q.studyCredit++;ctx.change(s,'knowledge',5);mark(s,q,tag);}
 if(tag==='career'){ctx.spend(s,cost(s,ctx,200));q.careerCredit++;q.network=cap(q.network+5,0,100);ctx.change(s,'performance',5);mark(s,q,tag);}
 if(tag==='job'){s.job={id:Number(arg),level:0,experience:0};s.stats.performance=55;add(s,q,'Joined a local employer as '+ctx.careers[s.job.id].title+'.',ctx);}
 if(tag==='trip'){const c=city(arg);ctx.spend(s,cost(s,ctx,c.country===s.country?250:1200,c.country));q.trip={city:c.id,year:at,done:[]};q.trips.push({city:c.id,year:at});q.trips=q.trips.slice(-40);mark(s,q,tag);ctx.change(s,'happiness',5);}
 if(tag==='itinerary'){const c=city(q.trip.city),n={culture:100,network:80,family:50}[arg];ctx.spend(s,cost(s,ctx,n,c.country));q.trip.done.push(arg);ctx.change(s,arg==='culture'?'knowledge':arg==='network'?'social':'happiness',5);if(arg==='network')q.network=cap(q.network+3,0,100);if(arg==='family')for(const p of s.people.filter(p=>p.alive&&location(q,p)?.city===c.id&&p.bond>=40).slice(0,3))ctx.bond(s,p,5,'Visited abroad');}
 if(tag==='call'){const p=person(s,Number(arg));ctx.bond(s,p,5,'Long-distance video call');mark(s,q,'call-'+p.id);}
}
export function inheritInternational(next,old,heir){
 if(!state(old))return;const prev=state(old),q=blank(next);q.offset=clock(old)-next.age;q.lastYear=clock(old);q.city=prev.city;q.birthCountry=next.country;q.citizenships=[next.country];q.residency={type:'citizen',since:clock(old),expires:null};q.languages[next.country]=100;q.moves=prev.moves.slice(-15);q.trips=[];q.contacts=Object.fromEntries(next.people.filter(p=>prev.contacts[p.id]).map(p=>[p.id,{...prev.contacts[p.id]}]));next.internationalLife=q;
}
export function internationalView(s,ctx){const q=state(s)||blank(s),at=clock(s);return {year:at,city:actual(s),country:ctx.countries[s.country].name,citizenships:q.citizenships.map(i=>ctx.countries[i].name),residency:q.residency,years:at-q.residency.since,language:q.languages[s.country],network:q.network,studyCredit:q.studyCredit,careerCredit:q.careerCredit,permits:q.permits.map(p=>({...p,name:ctx.countries[p.country].name})),cities:internationalCities.map(c=>({...c,countryName:ctx.countries[c.country].name})),trip:q.trip?{...q.trip,name:city(q.trip.city).name}:null,contacts:s.people.filter(p=>p.alive&&q.contacts[p.id]&&q.contacts[p.id].city!==q.city).map(p=>({id:p.id,name:p.name,city:city(q.contacts[p.id].city).name,bond:p.bond})),moves:q.moves.slice(-6).reverse(),news:q.news.slice(-5).reverse()};}
export function validateInternational(s){
 const q=state(s);if(q===undefined)return true;
 const types=['citizen','permanent','work','study','family','retire','expired'],countries=c=>int(c)&&c<6;
 if(!q||q.version!==1||!Number.isSafeInteger(q.offset)||clock(s)<0||!(q.lastYear===null||int(q.lastYear))||city(q.city)?.country!==s.country||!countries(q.birthCountry)||!Array.isArray(q.citizenships)||!q.citizenships.length||q.citizenships.length>6||new Set(q.citizenships).size!==q.citizenships.length||!q.citizenships.every(countries)||!q.residency||!types.includes(q.residency.type)||!int(q.residency.since)||!(q.residency.expires===null||int(q.residency.expires))||!Array.isArray(q.permits)||q.permits.length>6||!q.permits.every(p=>p&&countries(p.country)&&['work','study','family','retire'].includes(p.type)&&int(p.expires))||!Array.isArray(q.languages)||q.languages.length!==6||!q.languages.every(n=>int(n)&&n<=100)||!q.contacts||!Object.entries(q.contacts).every(([id,p])=>int(Number(id))&&p&&city(p.city)&&int(p.years))||!int(q.network)||q.network>100||!int(q.studyCredit)||q.studyCredit>5||!int(q.careerCredit)||q.careerCredit>5||!(q.trip===null||q.trip&&city(q.trip.city)&&int(q.trip.year)&&Array.isArray(q.trip.done)&&q.trip.done.length<=3&&q.trip.done.every(t=>['culture','network','family'].includes(t)))||!Array.isArray(q.trips)||q.trips.length>40||!Array.isArray(q.moves)||q.moves.length>30||!Array.isArray(q.news)||q.news.length>25||!q.lastAction||!Object.values(q.lastAction).every(int))return false;
 return q.trips.every(t=>t&&city(t.city)&&int(t.year))&&q.moves.every(m=>m&&city(m.from)&&city(m.to)&&int(m.year))&&q.news.every(n=>n&&int(n.year)&&typeof n.text==='string');
}
