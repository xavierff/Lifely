// Fictional local venues, grounded in the existing home/travel simulation.
import {destinations} from './living-world.mjs';
const homes=['newyork','jakarta','tokyo','toronto','london','sydney'];
const styles=[
 ['Riverside walk','Neighborhood café','Independent gallery','Community club','Private reception','Street fair'],
 ['City park','Kedai corner','Creative workshop','Community hall','Private reception','Night market'],
 ['Pocket garden','Neighborhood café','Design studio','Community center','Private reception','Lantern fair'],
 ['Waterfront walk','Neighborhood café','Arts workshop','Community hall','Private reception','Community festival'],
 ['Garden square','Tea room','Independent theater','Community hall','Private reception','Book fair'],
 ['Harbor walk','Neighborhood café','Design workshop','Community club','Private reception','Outdoor festival']
];
const venues=[
 {id:'park',icon:'♧',cost:0,min:6,rep:0,stat:'health',gain:4,detail:'Walk, recharge and discover a familiar neighborhood.'},
 {id:'cafe',icon:'☕',cost:24,min:12,rep:0,stat:'social',gain:4,detail:'Meet a recurring local resident over refreshments.'},
 {id:'arts',icon:'✦',cost:45,min:12,rep:0,stat:'creativity',gain:5,detail:'Discover creative work and local culture.'},
 {id:'community',icon:'♡',cost:0,min:8,rep:0,stat:'kindness',gain:4,detail:'Help the community and reconnect with a local friend.'},
 {id:'exclusive',icon:'♛',cost:420,min:18,rep:70,stat:'reputation',gain:3,detail:'Invitation-only reception for established residents or visitors.'},
 {id:'festival',icon:'☀',cost:35,min:10,rep:0,stat:'happiness',gain:6,detail:'Attend the city’s rotating annual festival.'}
];
const festivals=['Spring arts gathering','Summer street celebration','Autumn culture gathering','Year-end lights']; // fictional annual themes, not real local season calendars
const blank=()=>({version:1,year:null,used:[],cities:{},journal:[]});
const state=s=>s.cityLife||blank();
const cityFor=id=>destinations.find(x=>x.id===id);
const cap=(s,v)=>s.age<18?0:Math.round(v.cost*[1,.42,.85,.95,.91,1.03][s.country]);
function places(s){const home=homes[s.country],trip=s.world?.travel?.trips?.at(-1);return [...new Set([home,...(trip?.age===s.age&&cityFor(trip.id)?[trip.id]:[])])].map(cityFor).filter(Boolean);}
function nameFor(city,v){return styles[city.country][venues.indexOf(v)];}
const liveContact=(s,p)=>p?.contactId==null?null:s.people.find(x=>x.id===p.contactId&&x.alive);
function items(s){const q=state(s),used=q.year===s.age?q.used:[];return places(s).map(city=>{const p=q.cities[city.id],contact=liveContact(s,p),theme=festivals[(s.age+destinations.indexOf(city))%4];return {id:city.id,name:city.name,theme:city.theme,festival:theme,visits:p?.visits||0,contact:contact?{id:contact.id,name:contact.name,bond:contact.bond}:null,venues:venues.map(v=>{const cost=cap(s,v),id='city:visit:'+city.id+':'+v.id,rep=Math.max(s.stats.reputation,s.world?.entertainment?.fame||0),reason=s.age<v.min?'Requires age '+v.min:rep<v.rep?'Requires reputation or fame '+v.rep:v.id==='festival'&&(s.age+destinations.indexOf(city))%2!==0?'Festival returns next year':used.includes(id)?'Already visited this year':used.length>=2?'Two city outings used this year':s.cash<cost?'Insufficient cash':s.actions<1?'No activities left':null;return {id,name:nameFor(city,v),icon:v.icon,cost,detail:v.detail,enabled:!reason,reason,kind:v.id};})};});}
export function cityView(s){const q=state(s);return {places:items(s),used:q.year===s.age?q.used.length:0,total:Object.values(q.cities).reduce((n,p)=>n+p.visits,0),discovered:Object.keys(q.cities).length,journal:q.journal.slice(-8).reverse()};}
export function cityCommands(s){if(!s.alive||s.age<6||s.pending!==null||s.justice?.years>0||s.justice?.case)return [];return items(s).flatMap(c=>c.venues.map(v=>({id:v.id,label:'Visit '+c.name+' · '+v.name,detail:(v.cost?'$'+v.cost:'Free')+' · '+(v.reason||v.detail),enabled:v.enabled})));}
export function cityAct(s,id,ctx){const available=cityCommands({...s,actions:s.actions+1}).find(c=>c.id===id&&c.enabled);if(!available)throw Error('City outing unavailable.');const [,verb,cityId,kind]=id.split(':'),city=cityFor(cityId),v=venues.find(x=>x.id===kind);if(verb!=='visit'||!city||!v)throw Error('Unknown city venue.');
 const q=s.cityLife??=blank();if(q.year!==s.age){q.year=s.age;q.used=[];}q.used.push(id);const p=q.cities[cityId]??={visits:0,contactId:null,discovered:[]};const first=!p.discovered.includes(kind);if(first)p.discovered.push(kind);p.visits++;const cost=cap(s,v);if(cost)ctx.spend(s,cost);ctx.change(s,v.stat,first?v.gain:Math.max(1,v.gain-2));ctx.change(s,'stress',-2);
 let contact=liveContact(s,p);if(['cafe','community','festival','exclusive'].includes(kind)&&!contact&&s.people.filter(x=>x.alive&&x.role==='friend').length<12){contact=ctx.person(s,'friend',Math.max(6,s.age));contact.bond=40;s.people.push(contact);p.contactId=contact.id;ctx.add(s,'Met '+contact.name+' in '+city.name+'.','relationship');}
 if(contact&&['cafe','community','festival','exclusive'].includes(kind))ctx.bond(s,contact,first?6:4,'Shared a local outing in '+city.name);
 const title=nameFor(city,v);const memory={age:s.age,city:cityId,venue:kind,title,cost,first,contact:contact?.name||null};q.journal.push(memory);q.journal=q.journal.slice(-40);ctx.add(s,'Visited '+title+' in '+city.name+(first?' for the first time':'')+'.','activity');return memory;
}
export function validateCityLife(q){if(q===undefined)return true;if(!q||q.version!==1||!(q.year===null||Number.isInteger(q.year)&&q.year>=0&&q.year<=110)||!Array.isArray(q.used)||q.used.length>2||new Set(q.used).size!==q.used.length||!q.cities||typeof q.cities!=='object'||Array.isArray(q.cities)||!Array.isArray(q.journal)||q.journal.length>40)return false;const validId=id=>typeof id==='string'&&!!cityFor(id);return Object.entries(q.cities).every(([id,p])=>validId(id)&&p&&Number.isInteger(p.visits)&&p.visits>=1&&p.visits<=220&&(p.contactId===null||Number.isInteger(p.contactId)&&p.contactId>=0)&&Array.isArray(p.discovered)&&p.discovered.length<=6&&new Set(p.discovered).size===p.discovered.length&&p.discovered.every(k=>venues.some(v=>v.id===k)))&&q.used.every(id=>typeof id==='string'&&/^city:visit:[a-z]+:[a-z]+$/.test(id)&&validId(id.split(':')[2])&&venues.some(v=>v.id===id.split(':')[3]))&&q.journal.every(x=>x&&Number.isInteger(x.age)&&x.age>=6&&x.age<=110&&validId(x.city)&&venues.some(v=>v.id===x.venue)&&typeof x.title==='string'&&Number.isInteger(x.cost)&&x.cost>=0&&typeof x.first==='boolean'&&(x.contact===null||typeof x.contact==='string'));}
