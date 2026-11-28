// Season and project circuit, separate from existing career campaigns.
// Fictional clinical, legal and civic decisions are abstract game scenarios.
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,Math.round(n))),cash=n=>Math.max(0,Math.round(n)),int=n=>Number.isSafeInteger(n)&&n>=0;
const option=(label,detail,quality,morale,reach,risk,cost=0)=>({label,detail,quality,morale,reach,risk,cost});
const round=(title,prompt,options)=>({title,prompt,options});
export const specialistTracks=[
 {id:'sports',name:'Competitive league season',stat:'health',skill:'technical',profession:'athlete',entry:250,reward:2400,stages:[
 round('Opening fixture','Your opponent is pressing aggressively. Balance scoring chances against fatigue.',[option('Control possession','Conserve energy and create chances',6,5,3,-4),option('Attack open space','High scoring potential, greater fatigue',13,1,8,12),option('Rotate and defend','Protect team condition',2,9,0,-8)]),
 round('Midseason rival','A rival is adapting to your previous tactics. Select a response.',[option('Scout and counter','Use observation to exploit weaknesses',12,4,3,-3,120),option('Press the advantage','Riskier offensive performance',15,-2,9,11),option('Trust team rotation','Improve morale and reduce pressure',4,12,1,-5)]),
 round('Championship fixture','Your final match determines the season standing.',[option('Balanced final','Maintain consistency',10,7,4,-3),option('All-out finish','Maximum potential, high fatigue',18,-5,12,15),option('Adapt to the opponent','Invest in tactical analysis',13,4,6,-4,150)])]},
 {id:'film',name:'Screen production circuit',stat:'creativity',skill:'art',profession:'actor',entry:450,reward:3200,stages:[
 round('Casting room','The producer wants a strong performance and a reliable ensemble.',[option('Rehearse with ensemble','Build team chemistry',9,12,2,-5,150),option('Take a bold interpretation','Originality with casting risk',16,-2,9,11),option('Prepare a controlled reading','Reliable craft',8,5,3,-3)]),
 round('Production schedule','The director has limited time to complete your scenes.',[option('Prioritize key scenes','Protect quality and production time',12,6,2,-3),option('Request extra takes','Improve craft at a cost',16,-2,4,5,250),option('Help the crew adapt','Build trust and reduce delays',5,15,2,-7)]),
 round('Premiere and reviews','Choose a release and publicity strategy.',[option('Meet critics and audience','Build long-term credibility',9,7,7,-3),option('Major publicity push','Large exposure, higher cost and risk',5,0,20,10,350),option('Independent festival','Prioritize artistic reputation',13,8,4,-2,150)])]},
 {id:'music',name:'Album and tour circuit',stat:'creativity',skill:'art',profession:'musician',entry:350,reward:2800,stages:[
 round('Recording studio','Choose how to shape the next record.',[option('Refine the arrangements','Strong craft and reliability',12,5,2,-4,120),option('Experiment with a new sound','Creative upside and risk',17,-1,7,12),option('Collaborate with musicians','Build ensemble trust',7,13,4,-2,150)]),
 round('Release week','The label is weighing a broad launch against loyal fans.',[option('Release to loyal listeners','Consistent engagement',8,8,8,-4),option('Fund a major campaign','Higher reach and pressure',4,0,21,12,300),option('Share studio sessions','Grow authentic connections',10,10,6,-3)]),
 round('Live show','A demanding audience awaits the final performance.',[option('Perform a rehearsed set','Reliable quality',12,5,5,-4),option('Experiment live','High upside and fatigue',17,-4,12,13),option('Connect with the audience','Strong loyalty and team morale',7,13,9,-5)])]},
 {id:'creator',name:'Creator publishing season',stat:'creativity',skill:'communication',profession:'influencer',entry:150,reward:1800,stages:[
 round('Content slate','Choose a sustainable theme and production plan.',[option('Create original series','Quality and consistency',13,5,4,-3),option('Follow a short-lived trend','High reach with uncertainty',5,-1,17,10),option('Collaborate with peers','Community and cross-promotion',8,12,7,-2,100)]),
 round('Sponsor offer','A brand wants to partner with your channel.',[option('Choose a compatible sponsor','Protect trust',10,8,5,-5),option('Negotiate a larger campaign','Higher reach and workload',5,1,17,11),option('Decline and focus on audience','Preserve credibility',11,8,3,-6)]),
 round('Audience response','Your community gives feedback on the season.',[option('Review analytics and improve','Sustainable growth',13,6,6,-3),option('Increase output aggressively','Reach at a fatigue cost',5,-4,18,12),option('Host a community discussion','Build loyalty',7,13,8,-5)])]},
 {id:'civic',name:'Civic leadership term',stat:'reputation',skill:'communication',profession:'politics',entry:200,reward:0,stages:[
 round('Public consultation','Residents raise conflicting concerns about a fictional public project.',[option('Invite representative feedback','Improve trust and evidence',10,11,4,-5),option('Publish a costed proposal','Emphasize transparency',14,5,5,-3,100),option('Rush the announcement','Immediate attention with delivery risk',3,-6,15,13)]),
 round('Council negotiations','A coalition disagreement threatens implementation.',[option('Seek a transparent compromise','Support and accountability',10,13,3,-5),option('Commission independent review','Improve project quality',15,5,3,-4,120),option('Push a unilateral deadline','Reach at a trust cost',5,-9,14,16)]),
 round('Public review','The community asks for results and an honest assessment.',[option('Publish results and limitations','Build credibility',13,9,5,-6),option('Expand the pilot carefully','Test improvements',11,6,8,-3,150),option('Prioritize a showcase event','Attention with risk',5,0,17,12)])]},
 {id:'medical',name:'Hospital case-management rotation',stat:'knowledge',skill:'technical',profession:'doctor',entry:180,reward:1400,stages:[
 round('Case conference','A fictional patient record is incomplete. Decide how your team organizes its review.',[option('Clarify missing information','Prioritize careful review',13,7,2,-6),option('Ask a senior colleague to review','Strengthen team coordination',10,12,1,-5),option('Rush administrative closure','Schedule speed with quality risk',1,-7,8,15)]),
 round('Department workload','Several fictional cases need attention and staff report fatigue.',[option('Coordinate equitable workload','Protect team wellbeing',9,14,2,-6),option('Review resources and escalate','Strengthen process reliability',14,5,2,-4),option('Increase throughput targets','Short-term volume, quality pressure',3,-7,13,15)]),
 round('Quality review','The department evaluates documentation and communication, not real clinical treatment.',[option('Review the case records','Improve reliability',15,5,3,-5),option('Invite multidisciplinary feedback','Improve shared learning',10,13,4,-4),option('Skip feedback to meet targets','Speed with accountability risk',2,-8,12,14)])]},
 {id:'legal',name:'Case preparation and advocacy circuit',stat:'knowledge',skill:'communication',profession:'lawyer',entry:220,reward:1900,stages:[
 round('Evidence review','A fictional civil dispute contains conflicting statements.',[option('Organize the evidence','Strengthen preparation',14,5,2,-5),option('Interview the client carefully','Build understanding and trust',9,12,3,-4),option('Rush to a conclusion','Higher uncertainty',3,-4,10,13)]),
 round('Settlement conference','Both fictional parties have competing priorities.',[option('Explore a fair settlement','Improve cooperation',10,13,4,-5),option('Prepare a clear argument','Strengthen the case',15,4,4,-3),option('Escalate without discussion','Pressure and reputational risk',5,-7,12,14)]),
 round('Hearing and review','Present a clear, ethical position in the fictional proceeding.',[option('Present documented evidence','Reliable advocacy',15,6,4,-5),option('Acknowledge uncertainty','Build credibility',10,12,5,-5),option('Make unsupported assertions','Attention at high credibility risk',0,-9,14,18)])]},
 {id:'business',name:'Product and growth season',stat:'knowledge',skill:'technical',profession:'entrepreneur',entry:300,reward:2500,stages:[
 round('Product discovery','Customers want competing features and the team has limited resources.',[option('Test a small prototype','Improve product fit',13,7,4,-5,100),option('Launch a broad concept','Reach with execution risk',7,-2,17,12),option('Interview existing customers','Build loyalty and trust',10,12,3,-4)]),
 round('Competitive launch','A rival releases a competing product.',[option('Improve product quality','Protect long-term value',15,6,3,-4,150),option('Run a large promotion','Higher reach and cost',4,0,20,11,250),option('Support the delivery team','Improve reliability',9,14,5,-5)]),
 round('Operating review','Sales and customer feedback determine the next investment.',[option('Reinvest in reliability','Build sustained performance',13,9,3,-4),option('Expand quickly','Upside and operating pressure',8,-4,16,13),option('Consolidate the customer base','Stable demand and loyalty',10,12,6,-5)])]}
];
const track=id=>specialistTracks.find(t=>t.id===id),state=s=>s.specialistCircuit;
const clock=s=>s.age+(s.livingEconomy?.offset??0);
const empty=()=>({version:1,serial:0,lastYear:null,active:null,records:[],rivals:{},history:[],legacy:[],wins:0,completed:0,totalReward:0});
const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
const eligible=(s,t)=>s.profession?.id===t.profession||(t.id==='sports'&&!!s.world?.sports?.sport)||(t.id==='film'&&s.world?.entertainment?.path==='Film actor')||(t.id==='music'&&s.world?.entertainment?.path==='Recording musician')||(t.id==='business'&&!!s.business);
const cost=(s,ctx,n)=>cash(n*ctx.country(s).cost);
const score=(a)=>clamp(a.quality*.45+a.morale*.25+a.reach*.20+(100-a.risk)*.10);
const rival=(q,t)=>q.rivals[t.id]||{name:t.name+' rival',rating:58,record:0,respect:50};
function note(s,q,text,ctx){q.history.push({year:clock(s),text});q.history=q.history.slice(-35);ctx.add(s,text,'career');}
function initial(s,q,t){const r=rival(q,t);return {id:q.serial+1,track:t.id,started:clock(s),stage:0,quality:clamp(s.stats[t.stat]*.65+(s.skills?.[t.skill]||0)*.25+10),morale:60,reach:35,risk:20,opponent:r.rating,results:[],cost:0};}
function chance(s,a,o){return clamp(42+(a.quality-50)*.24+(a.morale-50)*.15+(s.stats[track(a.track).stat]-50)*.18-a.risk*.19+(o.risk<0?8:-4),12,92);}
export function specialistCommands(s,ctx){
 if(!s.alive||s.age<18||s.justice?.years>0||s.justice?.case)return [];
 const q=state(s)||empty(),out=[],enabled=s.actions>0;
 if(q.active){const a=q.active,t=track(a.track),r=t.stages[a.stage];if(eligible(s,t))for(const [i,o] of r.options.entries())out.push({id:'specialist:play:'+i,label:o.label,detail:o.detail+' · '+chance(s,a,o)+'% execution chance · $'+cost(s,ctx,o.cost),enabled:enabled&&s.cash>=cost(s,ctx,o.cost)});out.push({id:'specialist:abandon',label:'Abandon career circuit',detail:'Spent fees and earlier actions are not refunded',enabled});}
 else for(const t of specialistTracks.filter(t=>eligible(s,t)&&!q.records.some(r=>r.track===t.id&&r.ended===clock(s))))for(const [i,o] of t.stages[0].options.entries())out.push({id:'specialist:start:'+t.id+':'+i,label:t.name+' · '+o.label,detail:o.detail+' · $'+cost(s,ctx,t.entry+o.cost)+' · '+chance(s,initial(s,q,t),o)+'% execution chance',enabled:enabled&&s.cash>=cost(s,ctx,t.entry+o.cost)});
 return out;
}
function finish(s,q,a,ctx,status){
 const t=track(a.track),r=q.rivals[t.id]??=rival(q,t),result=score(a),won=status==='completed'&&result>=a.opponent;
 const gross=status==='completed'?cash(t.reward*ctx.country(s).salary*(won?1.2:.25)):0;s.cash+=gross;q.totalReward+=gross;
 if(status==='completed'){q.completed++;if(won)q.wins++;r.record+=won?0:1;r.respect=clamp(r.respect+(won?5:1));r.rating=clamp(r.rating+(won?2:-1),40,88);if(s.profession?.id===t.profession){s.profession.metric=clamp(s.profession.metric+(won?8:2));}if(t.id==='sports'&&s.world?.sports?.sport)s.world.sports.form=clamp(s.world.sports.form+(won?6:1));if(['film','music'].includes(t.id)&&s.world?.entertainment?.path)s.world.entertainment.fame=clamp(s.world.entertainment.fame+(won?4:1));if(t.id==='business'&&s.business)s.business.demand=clamp(s.business.demand+(won?7:1));if(t.id==='creator')s.audience=(s.audience||0)+cash(a.reach*(won?3:1));ctx.change(s,'reputation',won?5:1);ctx.change(s,'performance',won?6:2);}
 q.records.push({id:a.id,track:a.track,started:a.started,ended:clock(s),status,score:result,opponent:a.opponent,won,gross,cost:a.cost,results:a.results.slice(),followed:false});q.records=q.records.slice(-30);q.active=null;note(s,q,t.name+' '+status+' · '+result+' vs '+a.opponent+(won?' · strong finish':'')+'.',ctx);
}
export function specialistAct(s,id,ctx){
 if(!specialistCommands({...s,actions:s.actions+1},ctx).some(c=>c.id===id&&c.enabled))throw Error('Specialist decision unavailable.');
 const [,tag,arg,extra]=id.split(':'),q=s.specialistCircuit??=empty();
 if(tag==='abandon'){finish(s,q,q.active,ctx,'abandoned');return;}
 if(tag==='start'){const t=track(arg);q.active=initial(s,q,t);q.serial++;const amount=cost(s,ctx,t.entry);ctx.spend(s,amount);q.active.cost+=amount;}
 const a=q.active,t=track(a.track),index=Number(tag==='start'?extra:arg),o=t.stages[a.stage].options[index],amount=cost(s,ctx,o.cost),odds=chance(s,a,o);
 ctx.spend(s,amount);a.cost+=amount;const success=ctx.rng(s)*100<odds;
 a.quality=clamp(a.quality+o.quality*(success?1:.25)-(success?0:4));a.morale=clamp(a.morale+o.morale-(success?0:3));a.reach=clamp(a.reach+o.reach*(success?1:.35));a.risk=clamp(a.risk+o.risk+(success?0:5));a.results.push({stage:a.stage,index,success,odds,score:score(a),label:o.label});a.stage++;ctx.change(s,'stress',o.risk>0?4:1);
 if(a.stage===3)finish(s,q,a,ctx,'completed');
}
export function specialistYear(s,ctx){
 const q=state(s);if(!q)return;const y=clock(s);if(q.lastYear===y)return;q.lastYear=y;
 for(const [id,r] of Object.entries(q.rivals))r.rating=clamp(r.rating+(hash(id+':'+y)>.5?2:-1),40,88);
 if(q.active&&(!eligible(s,track(q.active.track))||y>q.active.started+1))finish(s,q,q.active,ctx,'expired');
 for(const r of q.records.filter(r=>!r.followed&&r.ended<y)){r.followed=true;if(r.won&&r.status==='completed'&&eligible(s,track(r.track))){ctx.change(s,'reputation',2);note(s,q,'Your strong '+track(r.track).name.toLowerCase()+' result continued to attract professional recognition.',ctx);}}
}
export function inheritSpecialist(next,old){if(!state(old))return;next.specialistCircuit=empty();next.specialistCircuit.legacy=[...state(old).legacy,...state(old).records.filter(r=>r.status==='completed').slice(-10).map(r=>({name:old.name,track:r.track,score:r.score,won:r.won}))].slice(-20);}
export function specialistView(s,ctx){const q=state(s)||empty(),a=q.active;return {active:a?{...a,title:track(a.track).name,round:track(a.track).stages[a.stage],score:score(a)}:null,tracks:specialistTracks.filter(t=>eligible(s,t)).map(t=>({id:t.id,name:t.name,round:t.stages[0],opponent:rival(q,t).rating})),records:q.records.slice(-6).reverse(),rivals:q.rivals,completed:q.completed,wins:q.wins,totalReward:q.totalReward,legacy:q.legacy,history:q.history.slice(-4).reverse()};}
export function validateSpecialist(s){const q=state(s);if(q===undefined)return true;const rating=n=>int(n)&&n<=100,validResult=r=>r&&int(r.stage)&&r.stage<3&&int(r.index)&&r.index<3&&typeof r.success==='boolean'&&rating(r.odds)&&rating(r.score)&&typeof r.label==='string';
 if(!q||q.version!==1||!int(q.serial)||!(q.lastYear===null||int(q.lastYear))||!Array.isArray(q.records)||q.records.length>30||!q.rivals||!Object.entries(q.rivals).every(([id,r])=>track(id)&&r&&typeof r.name==='string'&&rating(r.rating)&&int(r.record)&&rating(r.respect))||!Array.isArray(q.history)||q.history.length>35||!Array.isArray(q.legacy)||q.legacy.length>20||![q.completed,q.wins,q.totalReward].every(int)||q.wins>q.completed)return false;
 const a=q.active;if(a&&(!track(a.track)||!int(a.id)||a.id>q.serial||!int(a.started)||!int(a.stage)||a.stage>2||![a.quality,a.morale,a.reach,a.risk,a.opponent].every(rating)||!int(a.cost)||!Array.isArray(a.results)||a.results.length!==a.stage||!a.results.every(validResult)))return false;
 return q.records.every(r=>r&&track(r.track)&&int(r.id)&&r.id<=q.serial&&int(r.started)&&int(r.ended)&&['completed','abandoned','expired'].includes(r.status)&&rating(r.score)&&rating(r.opponent)&&typeof r.won==='boolean'&&int(r.gross)&&int(r.cost)&&Array.isArray(r.results)&&r.results.length<=3&&r.results.every(validResult)&&typeof r.followed==='boolean')&&q.history.every(h=>h&&int(h.year)&&typeof h.text==='string');}
