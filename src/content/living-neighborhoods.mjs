import {internationalCities} from './international-life.mjs';
// Fictional districts inspired by city character, not literal geographic boundaries.
const labels={
 newyork:['Riverside blocks','Midtown studios','Parkside residences'],chicago:['Lakefront commons','Workshop quarter','Tree-lined avenues'],austin:['Creekside commons','Music quarter','Hilltop homes'],
 jakarta:['Canal-side commons','Creative market quarter','Garden residences'],bandung:['Hill gardens','Design workshops','Tea garden homes'],surabaya:['Harbor commons','Trade workshops','Courtyard residences'],
 tokyo:['Station-side streets','Design lanes','Garden residences'],osaka:['Canal walks','Food market lanes','Quiet courtyard homes'],fukuoka:['Bayfront commons','Craft streets','Parkside homes'],
 toronto:['Waterfront commons','Studio streets','Maple residences'],vancouver:['Harbor gardens','Arts quarter','Cedar residences'],calgary:['River commons','Innovation workshops','Prairie homes'],
 london:['Canal gardens','Theater quarter','Garden squares'],manchester:['Mill district','Music studios','Suburban gardens'],edinburgh:['Old town walks','Festival lanes','Hilltop residences'],
 sydney:['Harbor commons','Creative lanes','Garden homes'],melbourne:['Laneway commons','Arts workshops','Leafy residences'],perth:['River gardens','Trade quarter','Coastal homes']
};
const districts=[{id:'commons',cost:.85,venue:'Market & café',stat:'social'},{id:'creative',cost:1,venue:'Local workshop',stat:'creativity'},{id:'residential',cost:1.2,venue:'Community garden',stat:'health'}];
const city=id=>internationalCities.find(c=>c.id===id);
const current=s=>s.internationalLife?.city||internationalCities.find(c=>c.country===s.country).id;
const year=s=>s.age+(s.internationalLife?.offset??s.livingEconomy?.offset??0);
const state=s=>s.neighborhoods;
const cap=(n,a,b)=>Math.min(b,Math.max(a,n)),money=n=>Math.max(0,Math.round(n)),int=n=>Number.isSafeInteger(n)&&n>=0;
const blank=s=>({version:1,home:current(s),district:'creative',lastYear:null,places:{},used:{},memories:[],story:null,trip:null,culture:{},education:[],retirement:false});
const person=(s,id)=>s.people.find(p=>p.id===id);
const place=(q,c,d)=>q.places[c+':'+d];
const ensurePlace=(q,c,d)=>q.places[c+':'+d]??={visits:0,contactId:null,trust:0};
const district=id=>districts.find(d=>d.id===id);
const name=(c,d)=>labels[c][districts.findIndex(x=>x.id===d)];
const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
const narratives=[
 {id:'festival',title:'The neighborhood festival',prompt:'Your local contact needs help after the event budget falls short.',choices:[{id:'volunteer',label:'Volunteer to organize',cost:0,stat:'kindness',gain:6,trust:12},{id:'sponsor',label:'Sponsor a small event',cost:300,stat:'reputation',gain:6,trust:15},{id:'decline',label:'Respectfully decline',cost:0,stat:'stress',gain:-2,trust:-4}],outcomes:['The festival became an annual tradition.','The festival found an alternative organizer.']},
 {id:'shop',title:'A familiar shop in trouble',prompt:'A resident is worried their favorite neighborhood shop may close.',choices:[{id:'volunteer',label:'Organize a community campaign',cost:0,stat:'social',gain:6,trust:12},{id:'sponsor',label:'Help fund a community market',cost:250,stat:'kindness',gain:6,trust:15},{id:'decline',label:'Stay out of the dispute',cost:0,stat:'stress',gain:-2,trust:-4}],outcomes:['Your neighborhood remembered the support.','The neighborhood adapted to a new shop.']},
 {id:'welcome',title:'A newcomer needs a friend',prompt:'Your local contact asks you to help a new resident feel at home.',choices:[{id:'volunteer',label:'Show them around',cost:0,stat:'social',gain:7,trust:12},{id:'sponsor',label:'Host a welcome meal',cost:120,stat:'happiness',gain:6,trust:15},{id:'decline',label:'Offer a kind apology',cost:0,stat:'stress',gain:-2,trust:-4}],outcomes:['The newcomer became part of the local community.','Other residents welcomed the newcomer.']}
];
const storySpec=id=>narratives.find(n=>n.id===id);
const fee=(ctx,c,n)=>money(n*ctx.countries[city(c).country].cost*city(c).cost);
const log=(s,q,text,ctx)=>{q.memories.push({year:year(s),city:current(s),text});q.memories=q.memories.slice(-40);ctx.add(s,text,'activity');};
export function neighborhoodSync(s){const q=state(s);if(!q)return;if(q.home!==current(s)){q.home=current(s);q.district='creative';q.story=null;q.retirement=false;}const t=s.internationalLife?.trip;if(q.trip&&(!t||q.trip.city!==t.city||q.trip.year!==t.year))q.trip=null;for(const p of Object.values(q.places))if(p.contactId!==null&&!person(s,p.contactId))p.contactId=null;}
export function neighborhoodCost(s){return state(s)?district(state(s).district)?.cost||1:1;}
export function neighborhoodYear(s,ctx){
 if(!s.alive||s.age<18&&!state(s))return;const q=s.neighborhoods??=blank(s),at=year(s);neighborhoodSync(s);if(q.lastYear===at)return;q.lastYear=at;q.used={};
 const roll=ctx.roll||((i,t)=>hash((s.lifeId||s.name)+':neighborhood:'+at+':'+i+':'+t));
 if(q.story?.status==='resolved'&&q.story.due<=at){const st=q.story,n=storySpec(st.type),p=person(s,st.contactId);log(s,q,n.outcomes[st.choice==='decline'?1:0],ctx);if(p?.alive&&st.choice!=='decline')ctx.bond(s,p,4,'Your local efforts were remembered');q.story=null;}
 if(q.story?.status==='open'&&q.story.year<at)q.story=null;
 const candidates=Object.entries(q.places).filter(([key,v])=>key.startsWith(q.home+':')&&v.trust>=12&&person(s,v.contactId)?.alive);
 if(!q.story&&candidates.length&&roll(0,'story')<.55){const [key,p]=candidates[Math.floor(roll(1,'place')*candidates.length)%candidates.length];q.story={type:narratives[Math.floor(roll(2,'type')*narratives.length)%narratives.length].id,year:at,due:null,status:'open',district:key.split(':')[1],contactId:p.contactId,choice:null};}
 if(q.retirement&&s.retired)ctx.change(s,'stress',-3);
}
function used(q,key,s){return q.used[key]===year(s);}
function mark(q,key,s){q.used[key]=year(s);}
function localContact(s,q,c,d,ctx){const p=ensurePlace(q,c,d);let resident=person(s,p.contactId);
 if(resident?.alive&&s.internationalLife?.contacts[resident.id]?.city===c)return resident;
 resident=s.people.find(n=>n.alive&&n.age>=18&&n.role==='community'&&s.internationalLife?.contacts[n.id]?.city===c&&!Object.values(q.places).some(v=>v.contactId===n.id));
 if(!resident&&s.people.filter(n=>n.role==='community'&&n.alive).length<64){resident=ctx.person(s,'community',Math.max(18,Math.min(75,s.age+2)));resident.bond=40;s.people.push(resident);if(s.internationalLife)s.internationalLife.contacts[resident.id]={city:c,years:0};}
 if(resident)p.contactId=resident.id;return resident;
}
export function neighborhoodCommands(s,ctx){
 const q=state(s);if(!q||!s.alive||s.age<18||s.justice?.years>0||s.justice?.case)return [];
 const out=[],a=s.actions>0,c=current(s),at=year(s),trip=s.internationalLife?.trip;
 const put=(tag,label,detail,ok)=>out.push({id:'neighborhood:'+tag,label,detail,enabled:!!(a&&ok)});
 for(const d of districts){const move=fee(ctx,c,600),visit=fee(ctx,c,d.id==='commons'?35:d.id==='creative'?60:0);
  put('move:'+d.id,'Move to '+name(c,d.id),'$'+move+' moving cost · living cost ×'+d.cost,q.district!==d.id&&s.cash>=move&&!s.properties.some(p=>['house','apartment'].includes(p.id)));
  put('visit:'+d.id,'Visit '+name(c,d.id)+' · '+d.venue,'$'+visit+' · recurring resident and local trust',s.cash>=visit&&!used(q,'visit:'+d.id,s));
 }
 const st=q.story;if(st?.status==='open'){for(const x of storySpec(st.type).choices)put('story:'+x.id,x.label,'$'+fee(ctx,c,x.cost)+' · consequences next year',s.cash>=fee(ctx,c,x.cost));}
 if(trip){const t=q.trip?.city===trip.city&&q.trip.year===trip.year?q.trip:null;
  if(!t)for(const theme of ['culture','food','nature'])put('trip:'+theme,'Plan '+theme+' experience','Choose a branching local itinerary',true);
  else if(!t.choice){const options=t.theme==='culture'?[['guided','Join a guided workshop'],['independent','Explore independently']]:t.theme==='food'?[['guided','Cook with a local host'],['independent','Explore the market']]:[['guided','Join a nature group'],['independent','Take a self-guided walk']];for(const [id,label] of options)put('experience:'+id,label,'$'+fee(ctx,trip.city,id==='guided'?120:40)+' · different skills and memories',s.cash>=fee(ctx,trip.city,id==='guided'?120:40));}
 }
 put('course','Complete local cultural course','Knowledge +4 · cultural familiarity +10 · $'+fee(ctx,c,250),!used(q,'course',s)&&s.cash>=fee(ctx,c,250)&&(q.culture[c]||0)<100);
 put('exchange','Earn an international learning certificate','Requires active study, local culture 20 · $'+fee(ctx,c,500),!!s.study&&(q.culture[c]||0)>=20&&q.education.length<12&&!q.education.includes(c)&&s.cash>=fee(ctx,c,500));
 put('retirement','Settle into retirement community','Retired and age 60+ · annual stress relief',s.retired&&s.age>=60&&!q.retirement&&s.internationalLife?.residency.type!=='expired');
 return out;
}
export function neighborhoodAct(s,id,ctx){
 if(!neighborhoodCommands({...s,actions:s.actions+1},ctx).some(x=>x.id===id&&x.enabled))throw Error('Neighborhood activity unavailable.');
 const [,tag,arg]=id.split(':'),q=state(s),c=current(s),at=year(s);
 if(tag==='move'){ctx.spend(s,fee(ctx,c,600));q.district=arg;ctx.change(s,'stress',3);log(s,q,'Moved to '+name(c,arg)+'.',ctx);}
 if(tag==='visit'){const d=district(arg),p=ensurePlace(q,c,arg);ctx.spend(s,fee(ctx,c,arg==='commons'?35:arg==='creative'?60:0));const n=localContact(s,q,c,arg,ctx);p.visits++;p.trust=cap(p.trust+6,0,100);q.culture[c]=cap((q.culture[c]||0)+4,0,100);if(n)ctx.bond(s,n,5,'Met in '+name(c,arg));ctx.change(s,d.stat,4);mark(q,'visit:'+arg,s);log(s,q,'Visited '+name(c,arg)+'.',ctx);}
 if(tag==='story'){const st=q.story,x=storySpec(st.type).choices.find(x=>x.id===arg),p=person(s,st.contactId);ctx.spend(s,fee(ctx,c,x.cost));ctx.change(s,x.stat,x.gain);if(p?.alive)ctx.bond(s,p,x.trust,'Neighborhood story decision');st.choice=arg;st.status='resolved';st.due=at+1;log(s,q,x.label+'.',ctx);}
 if(tag==='trip'){const t=s.internationalLife.trip;q.trip={city:t.city,year:t.year,theme:arg,choice:null};}
 if(tag==='experience'){const t=q.trip;ctx.spend(s,fee(ctx,t.city,arg==='guided'?120:40));t.choice=arg;q.culture[t.city]=cap((q.culture[t.city]||0)+(arg==='guided'?12:7),0,100);ctx.change(s,t.theme==='culture'?'knowledge':t.theme==='food'?'happiness':'health',6);if(arg==='guided'){const n=localContact(s,q,t.city,'commons',ctx);if(n)ctx.bond(s,n,5,'Shared a vacation experience');ctx.change(s,'social',3);}else ctx.change(s,'confidence',4);log(s,q,'Completed a '+t.theme+' '+arg+' experience in '+city(t.city).name+'.',ctx);}
 if(tag==='course'){ctx.spend(s,fee(ctx,c,250));q.culture[c]=cap((q.culture[c]||0)+10,0,100);ctx.change(s,'knowledge',4);mark(q,'course',s);}
 if(tag==='exchange'){ctx.spend(s,fee(ctx,c,500));q.education.push(c);ctx.change(s,'knowledge',7);log(s,q,'Earned an international learning certificate in '+city(c).name+'.',ctx);}
 if(tag==='retirement'){q.retirement=true;log(s,q,'Joined a retirement community.',ctx);}
}
export function inheritNeighborhood(next,old){if(!state(old))return;const q=blank(next),prev=state(old);q.memories=prev.memories.slice(-15);q.culture={};for(const [key,p] of Object.entries(prev.places)){if(p.contactId!==null&&person(next,p.contactId))q.places[key]={visits:0,trust:0,contactId:p.contactId};}next.neighborhoods=q;}
export function neighborhoodView(s){const q=state(s)||blank(s),c=current(s);return {city:city(c).name,district:q.district,culture:q.culture[c]||0,education:q.education.length,retirement:q.retirement,places:districts.map(d=>({...d,name:name(c,d.id),visits:place(q,c,d.id)?.visits||0,trust:place(q,c,d.id)?.trust||0,contact:person(s,place(q,c,d.id)?.contactId)?.name||null})),story:q.story?{...q.story,...storySpec(q.story.type)}:null,trip:q.trip,memories:q.memories.slice(-5).reverse()};}
export function validateNeighborhood(s){const q=state(s);if(q===undefined)return true;if(!q||q.version!==1||q.home!==current(s)||!district(q.district)||!(q.lastYear===null||int(q.lastYear))||!q.places||!q.used||!Object.values(q.used).every(int)||!Array.isArray(q.memories)||q.memories.length>40||!q.culture||!Object.entries(q.culture).every(([c,v])=>city(c)&&int(v)&&v<=100)||!Array.isArray(q.education)||q.education.length>12||new Set(q.education).size!==q.education.length||!q.education.every(city)||typeof q.retirement!=='boolean')return false;
 if(!Object.entries(q.places).every(([key,p])=>{const [c,d]=key.split(':');return city(c)&&district(d)&&p&&int(p.visits)&&int(p.trust)&&p.trust<=100&&(p.contactId===null||person(s,p.contactId));}))return false;
 const st=q.story;if(st&&(!storySpec(st.type)||!int(st.year)||!district(st.district)||!person(s,st.contactId)||!['open','resolved'].includes(st.status)||!(st.status==='open'?st.choice===null&&st.due===null:storySpec(st.type).choices.some(x=>x.id===st.choice)&&int(st.due))))return false;
 const t=q.trip;if(t&&(!city(t.city)||!int(t.year)||!['culture','food','nature'].includes(t.theme)||![null,'guided','independent'].includes(t.choice)))return false;
 return q.memories.every(m=>m&&int(m.year)&&city(m.city)&&typeof m.text==='string');}
