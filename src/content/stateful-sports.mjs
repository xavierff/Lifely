// Fictional four-team leagues. Each match is a twelve-turn possession simulation.
const cap=(n,a=0,b=100)=>Math.max(a,Math.min(b,Math.round(n))),int=n=>Number.isSafeInteger(n)&&n>=0;
export const leagueTeams={Football:[{id:'harbor',name:'Harbor City FC',strength:58},{id:'atlas',name:'Atlas Athletic',strength:72},{id:'forest',name:'Forest Vale',strength:63},{id:'river',name:'Rivergate United',strength:66}],Basketball:[{id:'comets',name:'Northbridge Comets',strength:58},{id:'titans',name:'Meridian Titans',strength:72},{id:'waves',name:'Eastport Waves',strength:63},{id:'owls',name:'Hillcrest Owls',strength:66}]};
const lanes=['Left','Center','Right'],stances=['balanced','attack','defense'],fresh=()=>({version:1,serial:0,season:null,active:null,records:[],history:[],legacy:[]});
const state=s=>s.matchLeague||fresh(),sport=s=>s.world?.sports,team=(kind,id)=>leagueTeams[kind]?.find(t=>t.id===id);
const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
const roll=(a,key)=>hash(a.seed+':'+a.turn+':'+key);
const teamId=s=>s.sportContracts?.active?.sport===sport(s)?.sport?s.sportContracts.active.team:leagueTeams[sport(s)?.sport]?.[0].id;
const available=s=>s.alive&&s.age>=12&&s.age<=47&&!!leagueTeams[sport(s)?.sport]&&!sport(s).injury&&!s.justice?.case&&!(s.justice?.years>0);
const same=(s,q)=>q.season?.age===s.age&&q.season.sport===sport(s)?.sport;
const fixtures=season=>{const [a,b,c,d]=[season.team,...leagueTeams[season.sport].filter(t=>t.id!==season.team).map(t=>t.id)];return [[[a,b],[c,d]],[[a,c],[b,d]],[[a,d],[b,c]]];};
const standings=season=>{
 const rows=leagueTeams[season.sport].map(t=>({...t,played:0,wins:0,draws:0,losses:0,for:0,against:0,points:0}));
 for(const m of season.results){const a=rows.find(t=>t.id===m.home),b=rows.find(t=>t.id===m.away);a.played++;b.played++;a.for+=m.homeScore;a.against+=m.awayScore;b.for+=m.awayScore;b.against+=m.homeScore;if(m.homeScore===m.awayScore){a.draws++;b.draws++;a.points++;b.points++;}else{const w=m.homeScore>m.awayScore?a:b,l=w===a?b:a;w.wins++;l.losses++;w.points+=3;}}
 return rows.sort((a,b)=>b.points-a.points||(b.for-b.against)-(a.for-a.against)||b.for-a.for||a.id.localeCompare(b.id));
};
function archive(q){const a=q.season;if(!a)return;if(a.results.length){const rows=standings(a);q.history.push({sport:a.sport,age:a.age,team:a.team,played:a.results.length/2,position:rows.findIndex(t=>t.id===a.team)+1,champion:a.results.length===6&&rows[0].id===a.team});q.history=q.history.slice(-20);}q.season=null;}
export function matchCommands(s){const q=state(s);if(!available(s)||q.active)return [];const current=same(s,q),played=current?q.season.results.length/2:0;return [{id:'matchleague:start',label:'Play league match',detail:'12 tactical turns · one activity · '+played+'/3 fixtures played',enabled:s.actions>0&&played<3&&(!current||q.season.team===teamId(s))}];}
export function matchStart(s,ctx){const q=s.matchLeague??=fresh();if(!available(s)||q.active||same(s,q)&&(q.season.results.length>=6||q.season.team!==teamId(s)))throw Error('League match unavailable.');
 if(!same(s,q)){archive(q);q.season={age:s.age,sport:sport(s).sport,team:teamId(s),results:[]};}
 const a=q.season,round=a.results.length/2,pair=fixtures(a)[round][0],opponent=pair[1];
 q.active={id:++q.serial,seed:Math.floor(ctx.rng(s)*4294967295)>>>0,age:s.age,sport:a.sport,home:a.team,away:opponent,turn:0,homeScore:0,awayScore:0,possession:'home',lane:1,build:0,fatigue:0,stance:'balanced',changed:false,substituted:false,shots:0,saves:0,passes:0,turnovers:0,log:[]};
}
function situation(a){const open=Math.floor(roll(a,'open')*3),attack=Math.floor(roll(a,'attack')*3),shape=['High press','Compact block','Wide defense'][Math.floor(roll(a,'shape')*3)];return {open,attack,shape};}
const attackOptions=(a)=>{const v=situation(a);return [...lanes.map((l,i)=>({id:'pass:'+i,label:'Pass '+l.toLowerCase(),detail:i===v.open?'Open channel':'Defended channel'})),{id:'shoot',label:a.sport==='Football'?'Shoot':'Two-point shot',detail:a.build?'Use your buildup':'Shoot without buildup'},{id:'long',label:a.sport==='Football'?'Long-range effort':'Three-point shot',detail:'Lower accuracy, higher risk'}];};
const defenseOptions=a=>[...lanes.map((l,i)=>({id:'mark:'+i,label:'Mark '+l.toLowerCase(),detail:i===situation(a).attack?'Opponent threat':'Cover space'})),{id:'press',label:'Press aggressively',detail:'Higher interception chance and fatigue'},{id:'contain',label:'Hold shape',detail:'Conserve energy and protect the goal'}];
const matchOptions=a=>[...(a.possession==='home'?attackOptions(a):defenseOptions(a)),...(!a.changed?stances.filter(x=>x!==a.stance).map(x=>({id:'stance:'+x,label:'Switch to '+x,detail:'One tactical adjustment · no turn cost'})):[]),...(!a.substituted&&a.fatigue>=18?[{id:'substitute',label:'Bring on fresh teammate',detail:'Reduce fatigue once per match'}]:[]),{id:'leave',label:'Forfeit match',detail:'Record a loss, no activity refund'}];
function log(a,msg){a.log.push({turn:a.turn+1,text:msg});a.log=a.log.slice(-14);}
function npcFixture(season,round,seed){const [home,away]=fixtures(season)[round][1],basket=season.sport==='Basketball',h=team(season.sport,home).strength,t=team(season.sport,away).strength;let homeScore=Math.floor(hash(seed+':other-h')*(basket?12:4)+h/(basket?18:65)),awayScore=Math.floor(hash(seed+':other-a')*(basket?12:4)+t/(basket?18:65));return {home,away,homeScore,awayScore};}
function finish(s,q,a,ctx,forfeit=false){
 if(forfeit){a.awayScore=Math.max(a.awayScore,a.homeScore+(a.sport==='Football'?1:2));}
 const season=q.season,round=season.results.length/2,won=a.homeScore>a.awayScore,draw=a.homeScore===a.awayScore;
 season.results.push({home:a.home,away:a.away,homeScore:a.homeScore,awayScore:a.awayScore},npcFixture(season,round,a.seed));
 q.records.push({id:a.id,age:a.age,sport:a.sport,home:a.home,away:a.away,homeScore:a.homeScore,awayScore:a.awayScore,shots:a.shots,passes:a.passes,saves:a.saves,turnovers:a.turnovers,forfeit,log:a.log});q.records=q.records.slice(-24);q.active=null;
 const t=sport(s);if(won){t.wins++;t.form=cap(t.form+5);ctx.change(s,'reputation',4);if(t.wins>=3*(t.rank+1)&&t.rank<4&&s.age>=18){t.rank++;t.trophies++;}}else if(!draw){t.losses++;t.form=cap(t.form-(forfeit?6:3));}else t.form=cap(t.form+1);
 ctx.change(s,'stress',forfeit?3:1);ctx.change(s,'happiness',won?4:draw?1:-1);
 ctx.add(s,team(a.sport,a.home).name+' '+a.homeScore+'–'+a.awayScore+' '+team(a.sport,a.away).name+(forfeit?' (forfeit)':''),'career');
 if(season.results.length===6){const table=standings(season);if(table[0].id===season.team){ctx.change(s,'reputation',5);ctx.add(s,'Won the '+a.sport+' league title with '+team(a.sport,season.team).name+'.','milestone');}}
}
export function matchChoose(s,id,ctx){const q=s.matchLeague,a=q?.active;if(!s.alive||!a||!matchOptions(a).some(x=>x.id===id))throw Error('Match action unavailable.');
 if(id==='leave'){finish(s,q,a,ctx,true);return;}if(id==='substitute'){a.substituted=true;a.fatigue=cap(a.fatigue-28);log(a,'A fresh teammate joins the play.');return;}if(id.startsWith('stance:')){a.changed=true;a.stance=id.split(':')[1];log(a,'Changed tactical shape to '+a.stance+'.');return;}
 const v=situation(a),basket=a.sport==='Basketball',r=roll(a,'outcome'),form=sport(s).form,opp=team(a.sport,a.away).strength,quality=(form-opp)*.003-a.fatigue*.003,attack=a.stance==='attack'?.09:a.stance==='defense'?-.08:0,defend=a.stance==='defense'?.09:a.stance==='attack'?-.08:0;
 if(a.possession==='home'){
  if(id.startsWith('pass:')){const i=Number(id.split(':')[1]),chance=(i===v.open?.87:.46)+quality+attack;if(r<Math.max(.12,Math.min(.96,chance))){a.passes++;a.lane=i;a.build=Math.min(2,a.build+1);log(a,'Completed a pass into '+lanes[i].toLowerCase()+' space.');}else{a.turnovers++;a.possession='away';a.build=0;log(a,'Opponent intercepts the pass.');}}
  else{const long=id==='long',chance=(basket?(long?.39:.57):(long?.17:.34))+a.build*.13+quality+attack+(a.lane===v.open?.07:0);a.shots++;if(r<Math.max(.07,Math.min(.94,chance))){const points=basket?(long?3:2):1;a.homeScore+=points;log(a,'Scored '+points+(basket?' points!':' goal!'));}else log(a,'The shot misses or is saved.');a.possession='away';a.build=0;}
  a.fatigue=cap(a.fatigue+(id.startsWith('pass:')?6:9));
 }else{
  const mark=id.startsWith('mark:'),correct=mark&&Number(id.split(':')[1])===v.attack,stop=(correct?.78:mark?.38:id==='press'?.64:.57)+quality+defend;
  if(r<Math.max(.1,Math.min(.94,stop))){a.saves++;log(a,'Stopped the attack and recovered possession.');}
  else{const scoreChance=(basket?.72:.43)+(opp-55)*.003+(a.stance==='attack'?.08:0);if(roll(a,'opponent-shot')<scoreChance){const points=basket?(roll(a,'opponent-range')<.25?3:2):1;a.awayScore+=points;log(a,'Opponent scores '+points+(basket?' points.':' goal.'));}else log(a,'Opponent misses.');}
  a.possession='home';a.build=0;a.fatigue=cap(a.fatigue+(id==='press'?12:id==='contain'?3:6));
 }
 a.turn++;if(a.turn===12)finish(s,q,a,ctx);
}
export function matchView(s){const q=state(s),season=q.season,a=q.active;return {sport:sport(s)?.sport,eligible:available(s),active:a?{...a,homeName:team(a.sport,a.home).name,awayName:team(a.sport,a.away).name,situation:situation(a),options:matchOptions(a)}:null,season:season?{...season,table:standings(season),fixtureCount:season.results.length/2,teamName:team(season.sport,season.team).name}:null,records:q.records.slice(-3).reverse().map(r=>({...r,homeName:team(r.sport,r.home).name,awayName:team(r.sport,r.away).name})),history:q.history.slice(-5).reverse(),legacy:q.legacy};}
export function inheritMatches(next,old){if(!old.matchLeague)return;const q=state(old),history=[...q.history];if(q.season?.results.length===6){const t=standings(q.season);history.push({sport:q.season.sport,age:q.season.age,team:q.season.team,played:3,position:t.findIndex(r=>r.id===q.season.team)+1,champion:t[0].id===q.season.team});}next.matchLeague=fresh();next.matchLeague.legacy=[...q.legacy,...history.filter(x=>x.champion).slice(-5).map(x=>({...x,name:old.name}))].slice(-20);}
export function validateMatches(s){const q=s.matchLeague;if(q===undefined)return true;const score=n=>int(n)&&n<=36,fixture=(m,kind)=>m&&team(kind,m.home)&&team(kind,m.away)&&m.home!==m.away&&score(m.homeScore)&&score(m.awayScore),hist=h=>h&&team(h.sport,h.team)&&int(h.age)&&h.age<=110&&int(h.played)&&h.played>=1&&h.played<=3&&int(h.position)&&h.position>=1&&h.position<=4&&typeof h.champion==='boolean';
 const logs=a=>Array.isArray(a.log)&&a.log.length<=14&&a.log.every(l=>l&&int(l.turn)&&l.turn>=1&&l.turn<=12&&typeof l.text==='string');
 if(!q||q.version!==1||!int(q.serial)||!Array.isArray(q.records)||q.records.length>24||!Array.isArray(q.history)||q.history.length>20||!q.history.every(hist)||!Array.isArray(q.legacy)||q.legacy.length>20||!q.legacy.every(h=>hist(h)&&typeof h.name==='string'))return false;
 const season=q.season,a=q.active;
 if(season&&(!team(season.sport,season.team)||!int(season.age)||season.age>s.age||!Array.isArray(season.results)||season.results.length>6||season.results.length%2||!season.results.every((m,i)=>fixture(m,season.sport)&&m.home===fixtures(season)[Math.floor(i/2)][i%2][0]&&m.away===fixtures(season)[Math.floor(i/2)][i%2][1])))return false;
 if(a&&(!season||season.results.length>=6||!fixture(a,a.sport)||a.sport!==season.sport||a.home!==season.team||a.away!==fixtures(season)[season.results.length/2][0][1]||a.age!==s.age||a.age!==season.age||!int(a.id)||a.id>q.serial||!int(a.seed)||a.seed>4294967295||!int(a.turn)||a.turn>=12||!['home','away'].includes(a.possession)||!int(a.lane)||a.lane>2||!int(a.build)||a.build>2||!int(a.fatigue)||a.fatigue>100||!stances.includes(a.stance)||typeof a.changed!=='boolean'||typeof a.substituted!=='boolean'||!logs(a)||!['shots','passes','saves','turnovers'].every(k=>int(a[k])&&a[k]<=12)))return false;
 return q.records.every(r=>fixture(r,r.sport)&&int(r.id)&&r.id<=q.serial&&int(r.age)&&r.age<=110&&typeof r.forfeit==='boolean'&&logs(r)&&['shots','passes','saves','turnovers'].every(k=>int(r[k])&&r[k]<=12));
}
