// Interactive career playfields. Offline, seeded through the engine RNG and compatible with older saves.
const clamp=(n,lo=0,hi=100)=>Math.max(lo,Math.min(hi,Math.round(n)));
const OPTIONS={
 sports:[{label:'Attack left wing',note:'Exploit space at the edge',icon:'↖'},{label:'Build through center',note:'Patient passing and control',icon:'↑'},{label:'Break down right wing',note:'Fast overlap and finish',icon:'↗'}],
 film:[{label:'Shoot a wide master',note:'Reliable coverage and blocking',icon:'▣'},{label:'Capture an intimate close-up',note:'Performance and character',icon:'◉'},{label:'Try a tracking shot',note:'Spectacle with technical risk',icon:'➜'}],
 business:[{label:'Improve the product',note:'Quality and customer loyalty',icon:'◆'},{label:'Support the team',note:'Delivery and morale',icon:'♧'},{label:'Grow the audience',note:'More leads and higher exposure',icon:'✦'}]
};
export function initialCareerPlayfield(type){
 if(type==='sports')return {ours:0,theirs:0,fatigue:8,trainingHits:0,adjustments:0,plays:[],last:null};
 if(type==='film')return {takes:0,usable:0,retakes:0,coverage:[0,0,0],plays:[],last:null};
 if(type==='business')return {customers:20,orders:0,loyalty:50,trend:[20],plays:[],last:null};
 return null;
}
export function careerPlayfieldView(s,a){
 if(!OPTIONS[a.type])return null;
 const p=a.playfield||initialCareerPlayfield(a.type);
 const roundPlays=p.plays.filter(x=>x.stage===a.stage);
 const remaining=Math.max(0,2-roundPlays.length);
 const common={type:a.type,stage:a.stage,remaining,played:roundPlays.length,maxPerStage:2,options:OPTIONS[a.type],last:p.last,plays:p.plays.length};
 if(a.type==='sports'){
  const weakLane=(a.stage+(a.stakeholder||'Rival').length+(p.adjustments||0))%3;
  return {...common,ours:p.ours,theirs:p.theirs,fatigue:p.fatigue,trainingHits:p.trainingHits||0,matchday:a.stage>=2,weakLane,opponent:a.stakeholder||'League rival',sport:a.theme,
   hint:(a.stage<2?'Training drill: practice the route your future opponent struggles to defend.':'Scout report: the rival is leaving space on the '+['left wing','central channel','right wing'][weakLane]+'.')+' The opponent shifts after every play; adapt your next attack.'};
 }
 if(a.type==='film')return {...common,takes:p.takes,usable:p.usable,retakes:p.retakes,coverage:p.coverage.slice(),scenes:['Wide master','Close-up','Tracking'],hint:'Direct two camera setups per production phase. Every take can improve the final film—or cost momentum.'};
 const baseDemand=clamp(s.business?.demand??50);
 const forecast=Math.max(0,Math.round((s.business?.capital||0)*(.03+(baseDemand+p.customers/2)/1200)));
 return {...common,customers:p.customers,orders:p.orders,loyalty:p.loyalty,trend:p.trend.slice(-8),baseDemand,forecast,actualCash:s.cash,
  hint:'Choose two operating priorities per phase. Sales are projections until the project ends; no extra cash is charged for planning.'};
}
export function careerPlayfieldAct(s,a,index,ctx){
 if(!OPTIONS[a.type])throw Error('This career has no interactive playfield.');
 if(!Number.isInteger(index)||index<0||index>2)throw Error('Choose a valid playfield action.');
 a.playfield??=initialCareerPlayfield(a.type);
 const p=a.playfield;
 if(p.plays.filter(x=>x.stage===a.stage).length>=2)throw Error('This phase is complete. Choose a story decision to continue.');
 let success=false,description='';
 if(a.type==='sports'){
  const lane=(a.stage+(a.stakeholder||'Rival').length)%3;
  const form=s.world?.sports?.form??s.profession?.metric??50;
  const chance=clamp(44+(form-50)*.22+(s.stats.health-50)*.15+(index===lane?19:0)-p.fatigue*.23-a.risk*.10,12,88);
  success=ctx.rng(s)*100<chance;
  const counter=!success&&ctx.rng(s)<clamp(16+a.risk*.22+(p.fatigue/4),8,48)/100;
  if(success){if(a.stage>=2)p.ours++;else p.trainingHits=(p.trainingHits||0)+1;a.quality=clamp(a.quality+7);a.reach=clamp(a.reach+4);a.team=clamp(a.team+2);}
  else{a.risk=clamp(a.risk+3);a.team=clamp(a.team-1);}
  if(counter&&a.stage>=2){p.theirs++;a.risk=clamp(a.risk+4);}
  p.fatigue=clamp(p.fatigue+[14,10,17][index],0,100);
  p.adjustments=(p.adjustments||0)+1;
  description=success?(a.stage>=2?'GOAL! ':'DRILL COMPLETE! ')+OPTIONS.sports[index].label+' beats the defense.':counter&&a.stage>=2?'The rival counters and scores. Adjust your approach.':a.stage<2?'The practice defense holds. Refine the run before matchday.':'The defense holds. Look for a better attacking channel.';
 }else if(a.type==='film'){
  const skill=(s.stats.creativity+(s.skills?.art??0))/2;
  const chance=clamp(48+skill*.28+a.team*.12-a.risk*.12+[12,4,-6][index],15,94);
  success=ctx.rng(s)*100<chance;
  p.takes++;
  if(success){p.usable++;p.coverage[index]++;a.quality=clamp(a.quality+[5,8,10][index]);a.team=clamp(a.team+[2,4,-1][index]);a.reach=clamp(a.reach+[1,2,6][index]);}
  else{p.retakes++;a.risk=clamp(a.risk+[2,3,7][index]);a.team=clamp(a.team-2);}
  description=success?['Wide shot secured—continuity and blocking are strong.','Close-up captured a genuine performance.','Tracking shot delivers a memorable visual.'][index]:'The take needs another pass. Schedule pressure increases.';
 }else{
  const qualityBonus=[8,2,0][index],teamBonus=[1,9,-2][index],reachBonus=[2,1,10][index];
  const base=s.business?.demand??50;
  const chance=clamp(52+base*.20+(a.quality-40)*.12-a.risk*.15+[7,8,-4][index],20,94);
  success=ctx.rng(s)*100<chance;
  a.quality=clamp(a.quality+qualityBonus+(success?2:-2));
  a.team=clamp(a.team+teamBonus);
  a.reach=clamp(a.reach+reachBonus);
  if(!success)a.risk=clamp(a.risk+[2,1,7][index]);
  p.customers=clamp(p.customers+([7,4,13][index])*(success?1:.5),0,100);
  p.loyalty=clamp(p.loyalty+([6,8,-4][index])+(success?2:-4),0,100);
  const orders=Math.max(0,Math.round((p.customers+p.loyalty+base)/18)*(success?2:1));
  p.orders+=orders;p.trend.push(p.customers);p.trend=p.trend.slice(-8);
  description=(success?'Sprint delivered. ':'Sprint missed its full target. ')+orders+' simulated orders added to the launch forecast.';
 }
 p.last={stage:a.stage,index,success,description};
 p.plays.push({stage:a.stage,index,success});
 return p.last;
}
