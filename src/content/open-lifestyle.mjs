// Personal spaces use actual owned assets. Decoration and clothing are consumption, not added wealth.
import {appearanceDefaults} from './immersive-life.mjs';
const residences={apartment:'Apartment',house:'Family house',mansion:'Private mansion',villa:'Coastal villa',penthouse:'City penthouse'};
const cars={car:'Used car',supercar:'Collector supercar',classic:'Classic car collection'};
export const roomTypes=[{id:'living',name:'Living room',cost:650},{id:'bedroom',name:'Bedroom',cost:480},{id:'kitchen',name:'Kitchen',cost:850}];
export const decorThemes=[{id:'minimal',name:'Minimal',color:'#C7D0C6'},{id:'warm',name:'Warm wood',color:'#C98D5D'},{id:'modern',name:'Modern',color:'#7998B5'}];
const paintThemes=[{id:'midnight',name:'Midnight blue',color:'#384C69'},{id:'silver',name:'Silver',color:'#B7C3CE'},{id:'forest',name:'Forest green',color:'#4D7965'}];
const outfits=[{id:'everyday',name:'Everyday essentials',color:0,cost:60},{id:'tailored',name:'Tailored collection',color:1,cost:240},{id:'creative',name:'Creative collection',color:2,cost:150},{id:'heritage',name:'Heritage collection',color:3,cost:180},{id:'outdoor',name:'Outdoor collection',color:4,cost:110},{id:'evening',name:'Evening collection',color:5,cost:320}];
const districts=[{id:'central',name:'Central district',cost:500},{id:'garden',name:'Garden neighborhood',cost:350},{id:'arts',name:'Creative quarter',cost:450}];
const blank=()=>({version:1,wardrobe:[],outfit:null,district:null,lastMove:null,lastHost:null,history:[]});
const state=s=>s.lifestyle||blank(),ensure=s=>s.lifestyle??=blank();
const cost=(x,c)=>Math.round(x*c.cost);
const holdings=s=>[...(s.properties||[]),...(s.luxury?.holdings||[])];
const homes=s=>holdings(s).filter(x=>Object.hasOwn(residences,x.id)&&s.familyTransitions?.propertyCase?.propertyId!==x.id);
const garage=s=>holdings(s).filter(x=>Object.hasOwn(cars,x.id));
const districtFor=s=>{const d=state(s).district;return d?.country===s.country?d:{country:s.country,id:'central',standing:0};};
const guests=s=>s.people.filter(p=>p.alive&&p.age>=18&&['friend','partner','sibling','parent','child'].includes(p.role)&&p.bond>=40).sort((a,b)=>b.bond-a.bond||a.id-b.id);
function partyGuests(s,id){const people=guests(s),anchor=people.find(p=>p.id===id);return anchor?[anchor,...people.filter(p=>p.id!==id&&p.bond>=55).slice(0,3)]:[];}
function record(s,kind,text,ctx){const q=ensure(s);q.history.push({age:s.age,kind,text});q.history=q.history.slice(-30);ctx.add(s,text,'activity');}
export function lifestyleView(s,c){const q=state(s),d=districtFor(s),owned=homes(s),eligible=guests(s);
 return {homes:owned.map(p=>({id:p.id,name:residences[p.id],value:p.value,rooms:roomTypes.map(room=>({...room,price:cost(room.cost,c),theme:p.interior?.[room.id]?.theme||null,lastAge:p.interior?.[room.id]?.lastAge??null}))})),garage:garage(s).map(p=>({id:p.id,name:cars[p.id],value:p.value,paint:p.paint?.theme||null})),decorThemes,paintThemes,outfits:outfits.map(o=>({...o,price:cost(o.cost,c),owned:q.wardrobe.includes(o.id),selected:q.outfit===o.id})),district:{...d,name:districts.find(x=>x.id===d.id).name},districts:districts.map(x=>({...x,price:cost(x.cost,c)})),guests:eligible.slice(0,12).map(p=>({id:p.id,name:p.name,bond:p.bond,group:partyGuests(s,p.id).map(x=>x.name),price:cost(40+35*partyGuests(s,p.id).length,c)})),lastHost:q.lastHost,history:q.history.slice(-8).reverse()};
}
export function lifestyleCommands(s,c){if(!s.alive||s.age<18||s.pending!==null||s.justice?.years>0||s.justice?.case)return [];const q=state(s),v=lifestyleView(s,c),out=[],put=(id,label,detail,enabled)=>out.push({id:'lifestyle:'+id,label,detail,enabled:!!enabled&&s.actions>0});
 for(const p of v.homes)for(const room of p.rooms)for(const theme of decorThemes)put('decorate:'+p.id+':'+room.id+':'+theme.id,'Decorate '+p.name+' · '+room.name+' · '+theme.name,'$'+room.price+' · one redesign per room per year',s.cash>=room.price&&room.theme!==theme.id&&room.lastAge!==s.age);
 for(const p of garage(s))for(const theme of paintThemes){const price=cost(p.id==='car'?400:1800,c);put('paint:'+p.id+':'+theme.id,'Refinish '+cars[p.id]+' · '+theme.name,'$'+price+' · cosmetic, no resale premium',s.cash>=price&&p.paint?.theme!==theme.id&&p.paint?.lastAge!==s.age);}
 for(const o of v.outfits)if(!o.owned)put('outfit:'+o.id,'Collect '+o.name,'$'+o.price+' · wearable collection',s.cash>=o.price);
 for(const d of v.districts)if(d.id!==v.district.id)put('move:'+d.id,'Move to '+d.name,'$'+d.price+' · local relocation, not a property purchase',s.cash>=d.price&&q.lastMove!==s.age);
 for(const p of v.homes)for(const g of v.guests)put('host:'+p.id+':'+g.id,'Host gathering with '+g.name+' at '+p.name,'$'+g.price+' · '+g.group.join(', ')+' · once per year',s.cash>=g.price&&q.lastHost!==s.age);
 return out;
}
export function lifestyleAct(s,id,ctx,c){if(!lifestyleCommands({...s,actions:s.actions+1},c).some(x=>x.id===id&&x.enabled))throw Error('Lifestyle activity unavailable.');const q=ensure(s),[,verb,a,b,d]=id.split(':');
 if(verb==='decorate'){const p=homes(s).find(x=>x.id===a),room=roomTypes.find(x=>x.id===b),theme=decorThemes.find(x=>x.id===d);ctx.spend(s,cost(room.cost,c));p.interior??={};const first=!p.interior[b];p.interior[b]={theme:d,lastAge:s.age};if(first)ctx.change(s,'happiness',2);record(s,'decor','Redesigned '+residences[a]+' '+room.name.toLowerCase()+' in '+theme.name.toLowerCase()+' style.',ctx);}
 else if(verb==='paint'){const p=garage(s).find(x=>x.id===a),theme=paintThemes.find(x=>x.id===b);ctx.spend(s,cost(a==='car'?400:1800,c));p.paint={theme:b,lastAge:s.age};record(s,'paint','Refinished '+cars[a]+' in '+theme.name.toLowerCase()+'.',ctx);}
 else if(verb==='outfit'){const o=outfits.find(x=>x.id===a);ctx.spend(s,cost(o.cost,c));q.wardrobe.push(a);equipOutfit(s,a);record(s,'outfit','Collected '+o.name.toLowerCase()+'.',ctx);}
 else if(verb==='move'){const d=districts.find(x=>x.id===a);ctx.spend(s,cost(d.cost,c));q.district={country:s.country,id:a,standing:0};q.lastMove=s.age;ctx.change(s,'stress',2);record(s,'move','Moved to the '+d.name.toLowerCase()+'.',ctx);}
 else if(verb==='host'){const invitees=partyGuests(s,Number(b));ctx.spend(s,cost(40+35*invitees.length,c));q.lastHost=s.age;for(const p of invitees)ctx.bond(s,p,5,'Attended a home gathering');ctx.change(s,'happiness',4);ctx.change(s,'social',3);record(s,'host','Hosted '+invitees.map(p=>p.name).join(', ')+' at '+residences[a].toLowerCase()+'.',ctx);}
}
export function equipOutfit(s,id){const q=state(s),o=outfits.find(x=>x.id===id);if(!s.alive||!o||!q.wardrobe.includes(id))throw Error('This outfit is not in your collection.');q.outfit=id;s.appearance={...(s.appearance||appearanceDefaults(s)),clothes:o.color};return s;}
export function communityVisit(s,id){if(!id.endsWith(':community'))return;const home=['newyork','jakarta','tokyo','toronto','london','sydney'][s.country];if(id!=='city:visit:'+home+':community')return;const q=ensure(s),d=districtFor(s);q.district={...d,standing:Math.min(100,d.standing+12)};}
const age=n=>Number.isInteger(n)&&n>=0&&n<=110;
export function validateLifestyle(s){if(!Array.isArray(s.properties)||s.properties.some(p=>!p||typeof p!=='object'))return false;const q=s.lifestyle;if(q!==undefined&&(!q||q.version!==1||!Array.isArray(q.wardrobe)||q.wardrobe.length>outfits.length||new Set(q.wardrobe).size!==q.wardrobe.length||q.wardrobe.some(id=>!outfits.some(o=>o.id===id))||!(q.outfit===null||q.wardrobe.includes(q.outfit))||!(q.lastMove===null||age(q.lastMove))||!(q.lastHost===null||age(q.lastHost))||!(q.district===null||q.district&&Number.isInteger(q.district.country)&&q.district.country>=0&&q.district.country<6&&districts.some(d=>d.id===q.district.id)&&Number.isInteger(q.district.standing)&&q.district.standing>=0&&q.district.standing<=100)||!Array.isArray(q.history)||q.history.length>30||!q.history.every(x=>x&&age(x.age)&&['decor','paint','outfit','move','host'].includes(x.kind)&&typeof x.text==='string')))return false;
 return holdings(s).every(p=>(p.interior===undefined||Object.hasOwn(residences,p.id)&&p.interior&&typeof p.interior==='object'&&!Array.isArray(p.interior)&&Object.entries(p.interior).every(([key,x])=>roomTypes.some(r=>r.id===key)&&x&&decorThemes.some(t=>t.id===x.theme)&&age(x.lastAge)))&&(p.paint===undefined||Object.hasOwn(cars,p.id)&&p.paint&&paintThemes.some(t=>t.id===p.paint.theme)&&age(p.paint.lastAge)));}
