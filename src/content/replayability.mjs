// Replay settings are immutable within a lineage. Standard saves stay unchanged.
export const lifeModes=[
 {id:'balanced',name:'Balanced',detail:'The original Lifely experience.',expense:1,interest:.06},
 {id:'hardcore',name:'Hardcore',detail:'Higher living costs, debt interest and yearly pressure.',expense:1.22,interest:.09},
 {id:'sandbox',name:'Sandbox',detail:'More starting resources, lower costs and optional free experiments. Excluded from shared collections.',expense:.55,interest:.025}
];
const mode=id=>lifeModes.find(m=>m.id===id)||lifeModes[0],int=n=>Number.isSafeInteger(n)&&n>=0;
export const replayMode=s=>mode(s.replay?.mode);
const fresh=id=>({version:1,mode:mode(id).id,origin:'standard',ancestors:[],secrets:[],completed:[]});
const secretDefs=[
 {id:'perfect-game',name:'A Perfect Afternoon',detail:'Finish an arcade session with a perfect score.',test:s=>s.arcade?.records.some(r=>r.score===15)},
 {id:'reconnection',name:'What Remained',detail:'Complete a dramatic story with reconnection.',test:s=>s.dramaticStories?.completed.some(r=>r.outcome==='reconnected')},
 {id:'crossroads',name:'Beyond the Familiar',detail:'Complete three international trips.',test:s=>(s.internationalLife?.trips?.length||0)>=3},
 {id:'collector',name:'Keeper of Records',detail:'Discover two inherited dramatic records.',test:s=>(s.dramaticStories?.discovered?.length||0)>=2},
 {id:'quiet-years',name:'A Quiet Strength',detail:'Reach age 60 with high wellbeing and no debt.',test:s=>s.age>=60&&s.stats.happiness>=85&&s.stats.stress<=25&&s.debt===0}
];
export const dynastyGoals=[
 {id:'three-lives',name:'Three Chapters',detail:'Complete three generations.',target:3,value:(s,q)=>q.ancestors.length+Number(!s.alive)},
 {id:'learning',name:'Family of Scholars',detail:'Three completed lives with a university qualification.',target:3,value:(s,q)=>q.ancestors.filter(a=>a.education>=2).length+Number(!s.alive&&s.education>=2)},
 {id:'memory',name:'Keep the Stories',detail:'Reconnect in dramatic stories across two completed generations.',target:2,value:(s,q)=>q.ancestors.filter(a=>a.reconnected).length+Number(!s.alive&&reconnected(s))},
 {id:'wealth',name:'Generational Security',detail:'Finish two lives with at least $100,000 net worth.',target:2,value:(s,q,w)=>q.ancestors.filter(a=>a.worth>=100000).length+Number(!s.alive&&w>=100000)},
 {id:'longevity',name:'A Long Family Story',detail:'Complete two lives reaching age 75.',target:2,value:(s,q)=>q.ancestors.filter(a=>a.age>=75).length+Number(!s.alive&&s.age>=75)}
];
const reconnected=s=>!!s.dramaticStories?.completed.some(r=>r.outcome==='reconnected');
export function randomLifeOptions(seed,countryCount=6){let x=(Number(seed)>>>0)||12345;const next=n=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x%n;};return {country:next(countryCount),background:['modest','ordinary','comfortable','royal'][next(4)],goal:['balance','wealth','family'][next(3)],seed,origin:'random'};}
export function initReplay(s,options){
 if(options.mode===undefined&&options.origin===undefined)return;
 const q=s.replay=fresh(options.mode);q.origin=options.origin==='random'?'random':'standard';
 if(q.mode==='hardcore'){s.cash=Math.round(s.cash*.5);s.stats.stress=Math.min(100,s.stats.stress+8);}
 if(q.mode==='sandbox'){s.cash+=50000;s.stats.health=Math.max(90,s.stats.health);}
}
export function replayAnnual(s,{change}){
 const id=replayMode(s).id;if(id==='hardcore'&&s.age>=18){change(s,'stress',3);if(s.age>=45)change(s,'health',-1);}
 if(id==='sandbox'){change(s,'stress',-3);if(s.age>=18&&s.stats.health<55)change(s,'health',4);}
}
export function replayRefresh(s,worth){
 const q=s.replay??=fresh('balanced');if(q.mode==='sandbox')return;
 for(const x of secretDefs)if(!q.secrets.includes(x.id)&&x.test(s))q.secrets.push(x.id);
 for(const x of dynastyGoals)if(!q.completed.includes(x.id)&&x.value(s,q,worth(s))>=x.target)q.completed.push(x.id);
}
export function inheritReplay(next,old,worth){
 if(!old.replay)return;
 const prev=old.replay,q=fresh(prev.mode);q.origin=prev.origin;q.ancestors=[...prev.ancestors,{name:old.name,age:old.age,education:old.education,worth:worth(old),reconnected:reconnected(old)}].slice(-32);
 q.secrets=[...prev.secrets];q.completed=[...prev.completed];next.replay=q;
}
export function replayCommands(s){if(replayMode(s).id!=='sandbox'||!s.alive||s.age<18||s.justice?.case||s.justice?.years>0)return [];return [
 {id:'replay:grant',label:'Sandbox: add $25,000',detail:'Experimental funds · does not count toward shared collections',enabled:s.actions>0&&s.cash<=1e12},
 {id:'replay:restore',label:'Sandbox: restore wellbeing',detail:'Restore health and reduce stress · one activity',enabled:s.actions>0}
 ];}
export function replayAct(s,id){if(replayMode(s).id!=='sandbox')throw Error('Sandbox action unavailable.');if(id==='replay:grant')s.cash+=25000;else if(id==='replay:restore'){s.stats.health=100;s.stats.stress=0;}else throw Error('Unknown sandbox action.');}
export function replayView(s,worth){const q=s.replay||fresh('balanced'),w=worth(s),mode=replayMode(s);return {mode,origin:q.origin,goals:dynastyGoals.map(x=>({id:x.id,name:x.name,detail:x.detail,target:x.target,value:Math.min(x.target,x.value(s,q,w)),complete:q.completed.includes(x.id),eligible:mode.id!=='sandbox'})),secrets:secretDefs.map(x=>q.secrets.includes(x.id)?{id:x.id,name:x.name,detail:x.detail,unlocked:true}:{id:x.id,name:'Hidden discovery',detail:'Keep exploring different life paths.',unlocked:false}),ancestors:q.ancestors.slice(-5).reverse(),ending:!s.alive?{name:s.name,age:s.age,worth:w,relationships:s.people.filter(p=>p.alive&&p.bond>=80).length,arcadeWins:Object.values(s.arcade?.profiles||{}).reduce((n,p)=>n+p.wins,0),stories:s.dramaticStories?.completed.length||0}:null};}
export function validateReplay(s){const q=s.replay;if(q===undefined)return true;return !!q&&q.version===1&&lifeModes.some(m=>m.id===q.mode)&&['standard','random'].includes(q.origin)&&Array.isArray(q.ancestors)&&q.ancestors.length<=32&&q.ancestors.every(a=>a&&typeof a.name==='string'&&int(a.age)&&a.age<=110&&int(a.education)&&a.education<=3&&Number.isFinite(a.worth)&&typeof a.reconnected==='boolean')&&Array.isArray(q.secrets)&&new Set(q.secrets).size===q.secrets.length&&q.secrets.every(id=>secretDefs.some(x=>x.id===id))&&Array.isArray(q.completed)&&new Set(q.completed).size===q.completed.length&&q.completed.every(id=>dynastyGoals.some(x=>x.id===id));}
