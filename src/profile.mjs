// Offline profile. A life is counted once using its immutable ID.
export const ribbons=[
{id:'redemption',name:'Second Chance',description:'Finish with a conviction, rehabilitation and high reputation.',test:s=>(s.record||0)>0&&(s.justice?.rehab||0)>=2&&s.stats.reputation>=65},
{id:'dynasty',name:'Roots of a Dynasty',description:'Reach the third generation.',test:s=>s.generation>=3},
{id:'tycoon',name:'Empire Builder',description:'Finish with a profitable company and at least $1M net worth.',test:(s,w)=>!!s.business&&s.business.lastProfit>0&&w>=1e6},
{id:'fortune',name:'Fortune Keeper',description:'Finish with $1M or more.',test:(s,w)=>w>=1e6},
{id:'scholar',name:'Mind of a Scholar',description:'Graduate and reach 95 knowledge.',test:s=>s.education>=3&&s.stats.knowledge>=95},
{id:'artist',name:'Creative Footprint',description:'Build a large audience and creative portfolio.',test:s=>(s.audience||0)>=10000&&s.stats.creativity>=85},
{id:'champion',name:'Champion at Heart',description:'Win at least 10 special career trials.',test:s=>(s.progression?.careerWins||0)>=10},
{id:'landlord',name:'Keys to the City',description:'Finish with two rental properties.',test:s=>s.properties.filter(p=>p.rental?.occupied).length>=2},
{id:'family',name:'Family First',description:'Maintain four close living relationships.',test:s=>s.people.filter(p=>p.alive&&p.bond>=85).length>=4},
{id:'generous',name:'Open Hands',description:'Give at least $10,000 in support.',test:s=>(s.progression?.supportGiven||0)>=10000},
{id:'explorer',name:'World Wanderer',description:'Relocate at least three times.',test:s=>(s.relocations||0)>=3},
{id:'resilient',name:'Against the Odds',description:'Reach 65 after starting modestly.',test:s=>s.background==='modest'&&s.age>=65},
{id:'century',name:'A Century of Memories',description:'Reach 100 years.',test:s=>s.age>=100},
{id:'peaceful',name:'Quiet Contentment',description:'Finish with high joy, low stress and no convictions.',test:s=>s.stats.happiness>=80&&s.stats.stress<=25&&!s.record},
{id:'comeback',name:'New Horizons',description:'Complete three long-running sagas.',test:s=>(s.sagas?.completed||[]).filter(a=>a.outcome!=='interrupted').length>=3},
{id:'craft',name:'Master of Many Crafts',description:'Master all three skills.',test:s=>['technical','communication','art'].every(k=>(s.skills?.[k]||0)>=90)},
{id:'pioneer',name:'A Life of Discovery',description:'Experience 80 distinct scenarios.',test:s=>Object.keys(s.scenario?.seen||{}).length>=80},
{id:'early',name:'An Unfinished Chapter',description:'Life ends before age 30.',test:s=>s.age<30},
{id:'debt',name:'Weathered Storms',description:'Finish with substantial net debt.',test:(s,w)=>w< -25000},
{id:'ordinary',name:'Everyday Legacy',description:'Complete a lifetime.',test:()=>true}];
const worldRibbons=[
{id:"worldstar",name:"Star of the Screen",description:"Finish with at least five creative releases and 80 fame.",test:s=>(s.world?.entertainment?.releases||0)>=5&&(s.world?.entertainment?.fame||0)>=80},
{id:"grandchampion",name:"Grand Champion",description:"Win two sports trophies and eight matches.",test:s=>(s.world?.sports?.trophies||0)>=2&&(s.world?.sports?.wins||0)>=8},
{id:"publicvoice",name:"The People's Voice",description:"Win two elections and maintain 75 approval.",test:s=>(s.world?.politics?.wins||0)>=2&&(s.world?.politics?.approval||0)>=75},
{id:"crown",name:"The Crown and the People",description:"Accept the crown and perform 8 duties.",test:s=>(s.world?.royalty?.successions||0)>=1&&(s.world?.royalty?.duties||0)>=8},
{id:"passport",name:"Passport of Stories",description:"Visit 12 different cities across four countries.",test:s=>(s.world?.travel?.stamps?.length||0)>=12&&(s.world?.travel?.visitedCountries?.length||0)>=4},
{id:"familyfund",name:"Family Steward",description:"Preserve $20,000 in the family trust and mentor two children.",test:s=>(s.world?.dynasty?.trustFund||0)>=20000&&(s.world?.dynasty?.mentored?.length||0)>=2},
{id:"spotlight",name:"A Public Life",description:"Succeed in entertainment and politics.",test:s=>(s.world?.entertainment?.fame||0)>=65&&(s.world?.politics?.wins||0)>=1},
{id:"scholarathlete",name:"Scholar Athlete",description:"Graduate and win a sporting trophy.",test:s=>s.education>=2&&(s.world?.sports?.trophies||0)>=1},
{id:"travelking",name:"Ambassador of Stories",description:"Hold a royal title and visit at least eight destinations.",test:s=>!!s.world?.royalty?.title&&(s.world?.travel?.stamps?.length||0)>=8},
{id:"heritage",name:"Guardian of Family History",description:"Record ten family archives and know two ancestors.",test:s=>(s.world?.dynasty?.archives||0)>=10&&(s.world?.dynasty?.ancestors?.length||0)>=2},
{id:"benevolent",name:"Civic Benefactor",description:"Improve civic approval and make generous family contributions.",test:s=>(s.world?.politics?.approval||0)>=85&&(s.world?.dynasty?.trustFund||0)>=12000},
{id:"sixpaths",name:"A Life Without Limits",description:"Try every one of the six connected paths.",test:s=>!!s.world?.entertainment?.releases&&!!s.world?.sports?.sport&&!!s.world?.politics?.party&&!!s.world?.royalty?.title&&(s.world?.travel?.stamps?.length||0)>0&&(s.world?.dynasty?.archives||0)>0}
];
ribbons.unshift(...worldRibbons);
export function lifeEnding(s,w){return ribbons.find(r=>r.test(s,w))||ribbons[ribbons.length-1];}
export function emptyProfile(){return {version:1,completed:{},achievements:[],challenges:[],ribbons:[],bestAge:0,bestWorth:0,bestGeneration:0};}
export function validProfile(p){return !!p&&p.version===1&&p.completed&&typeof p.completed==='object'&&['achievements','challenges','ribbons'].every(k=>Array.isArray(p[k])&&p[k].every(x=>typeof x==='string'))&&['bestAge','bestWorth','bestGeneration'].every(k=>Number.isFinite(p[k])&&p[k]>=0)&&Object.values(p.completed).every(x=>x&&Number.isInteger(x.age)&&typeof x.ribbon==='string');}
export function mergeLife(profile,s,w){const p=validProfile(profile)?JSON.parse(JSON.stringify(profile)):emptyProfile();if(!s)return p;
 const union=(a,b)=>[...new Set([...a,...b])];p.achievements=union(p.achievements,s.achievements||[]);p.challenges=union(p.challenges,s.completedChallenges||[]);
 p.bestAge=Math.max(p.bestAge,s.age);p.bestWorth=Math.max(p.bestWorth,w,s.peakWorth||0);p.bestGeneration=Math.max(p.bestGeneration,s.generation);
 if(!s.alive){const id=s.lifeId||['legacy',s.name,s.country,s.generation,s.rng,s.age].join(':');const r=lifeEnding(s,w);if(!Object.prototype.hasOwnProperty.call(p.completed,id))p.completed[id]={name:s.name,age:s.age,ribbon:r.id,worth:w};p.ribbons=union(p.ribbons,[r.id]);}
 return p;
}
