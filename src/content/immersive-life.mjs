// Visual identity and yearly recap are derived from the authoritative simulation.
const keys=['health','happiness','knowledge','confidence','stress','kindness','social','creativity','reputation','performance'];
const age=n=>Number.isInteger(n)&&n>=0&&n<=110,integer=Number.isSafeInteger;
const hash=s=>{let h=2166136261;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619);}return h>>>0;};
const skins=['#EAC4A7','#CF9E79','#B67D58','#8C573F','#F2D0B7','#754B38'],hairs=['#312923','#56392D','#282832','#8A593D','#5B4434','#A97542'],clothes=['#37685D','#4A597B','#7D4D63','#A47646','#426C76','#6A5978'];
export function portraitView(s){
 const h=hash(s.lifeId||s.name||'life'),a=s.age,t=s.stats||{};
 return {stage:a<3?'baby':a<13?'child':a<20?'teen':a<45?'adult':a<65?'mature':'elder',mood:!s.alive?'remembered':t.health<35?'tired':t.stress>=70?'worried':t.happiness>=75?'happy':'calm',skin:skins[h%skins.length],hair:a>=75?'#D9D7D1':a>=55?'#A5A3A2':hairs[(h>>>4)%hairs.length],clothes:clothes[(h>>>9)%clothes.length],style:(h>>>14)%3,age:a};
}
export function yearBefore(s,worth){return {age:s.age,worth:worth(s),cash:s.cash,stats:{...s.stats},people:s.people.filter(p=>p.alive).map(p=>({id:p.id,name:p.name,bond:p.bond}))};}
export function recordYear(s,before,worth,career){
 const now=new Map(s.people.map(p=>[p.id,p])),ids=new Set(before.people.map(p=>p.id));
 const changes=keys.map(key=>({key,delta:s.stats[key]-before.stats[key]})).filter(x=>x.delta).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)||a.key.localeCompare(b.key)).slice(0,4);
 const relationships=before.people.map(p=>({name:p.name.slice(0,100),delta:(now.get(p.id)?.bond??p.bond)-p.bond,ended:now.get(p.id)?.alive===false})).filter(x=>x.delta||x.ended).sort((a,b)=>Number(b.ended)-Number(a.ended)||Math.abs(b.delta)-Math.abs(a.delta)).slice(0,2);
 const events=s.history.filter(x=>x.age===s.age&&x.kind!=='finance'&&x.kind!=='achievement').slice(-4).map(x=>({kind:String(x.kind||'story').slice(0,30),text:String(x.text).slice(0,200)}));
 const row={age:s.age,from:before.age,worth:worth(s),worthDelta:worth(s)-before.worth,cashDelta:s.cash-before.cash,annualBalance:integer(s.annual?.balance)?s.annual.balance:null,changes,relationships,newPeople:s.people.filter(p=>p.alive&&!ids.has(p.id)).length,events,career:career||null,alive:s.alive};
 s.yearRecap={version:1,years:[...(s.yearRecap?.years||[]).filter(x=>x.age<row.age),row].slice(-12)};return s;
}
export function yearRecapView(s){return {years:(s.yearRecap?.years||[]).slice().reverse(),portrait:portraitView(s)};}
export function validateYearRecap(m){
 if(m===undefined)return true;
 const str=(x,n)=>typeof x==='string'&&x.length<=n;
 const row=x=>x&&age(x.age)&&age(x.from)&&x.age===x.from+1&&[x.worth,x.worthDelta,x.cashDelta].every(integer)&&(x.annualBalance===null||integer(x.annualBalance))&&typeof x.alive==='boolean'&&integer(x.newPeople)&&x.newPeople>=0&&(x.career===null||str(x.career,100))&&Array.isArray(x.changes)&&x.changes.length<=4&&x.changes.every(c=>c&&keys.includes(c.key)&&integer(c.delta)&&Math.abs(c.delta)<=100)&&Array.isArray(x.relationships)&&x.relationships.length<=2&&x.relationships.every(r=>r&&str(r.name,100)&&integer(r.delta)&&Math.abs(r.delta)<=100&&typeof r.ended==='boolean')&&Array.isArray(x.events)&&x.events.length<=4&&x.events.every(e=>e&&str(e.kind,30)&&str(e.text,200));
 return !!m&&m.version===1&&Array.isArray(m.years)&&m.years.length<=12&&m.years.every((x,i)=>row(x)&&(i===0||x.age>m.years[i-1].age));
}
