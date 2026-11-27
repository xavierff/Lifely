// Optional phase plans: one commitment per phase, no extra interaction or payout.
const plans={
 sports:[
 {id:'compact',name:'Compact defense',detail:'Lower counterattack risk and fatigue; less attacking power.',cost:0,chance:[-4,3,-4],fatigue:-3,counter:-10},
 {id:'possession',name:'Control possession',detail:'Stronger central buildup; modest wing penalty.',cost:0,chance:[-3,9,-3],fatigue:-1,counter:-3},
 {id:'press',name:'High press',detail:'Strong wing attacks; faster fatigue and greater counter risk.',cost:0,chance:[9,-2,9],fatigue:5,counter:8}],
 film:[
 {id:'lean',name:'Lean crew',detail:'No extra spending; reliable wide shots, harder complex shots.',cost:0,chance:[6,-3,-7],quality:0},
 {id:'ensemble',name:'Cast rehearsal',detail:'Rehearsal improves close-ups and ensemble performance.',cost:180,chance:[2,11,-2],quality:2},
 {id:'technical',name:'Specialist camera crew',detail:'Equipment and crew improve tracking shots; higher budget.',cost:320,chance:[0,2,13],quality:2}],
 business:[
 {id:'operations',name:'Operations team',detail:'Prioritize product reliability and delivery; less marketing capacity.',cost:0,chance:[9,4,-7],orders:0,loyalty:2},
 {id:'people',name:'Staff development',detail:'Allocate staff to service and training; slower audience growth.',cost:150,chance:[1,12,-4],orders:0,loyalty:3},
 {id:'growth',name:'Growth team',detail:'Marketing specialists improve outreach; fewer resources for retention.',cost:250,chance:[-5,-3,12],orders:2,loyalty:-2}]
};
export function phasePlan(a){const id=a.phasePlans?.find(p=>p.stage===a.stage)?.id;return plans[a.type]?.find(p=>p.id===id)||null;}
export function phasePlanView(s,a){const list=plans[a.type];if(!list)return null;const chosen=phasePlan(a),locked=!!chosen||!!a.playfield?.plays?.some(p=>p.stage===a.stage);
return {chosen:chosen?.id||null,locked,options:list.map(p=>({id:p.id,name:p.name,detail:p.detail,cost:p.cost,enabled:!locked&&s.cash>=p.cost}))};}
export function choosePhasePlan(s,a,id,ctx){const v=phasePlanView(s,a),p=plans[a.type]?.find(x=>x.id===id);if(!p||!v?.options.some(o=>o.id===id&&o.enabled))throw Error('Select an affordable plan before the first play.');if(p.cost)ctx.spend(s,p.cost);a.spend+=p.cost;a.phasePlans??=[];a.phasePlans.push({stage:a.stage,id,cost:p.cost});return p;}
export function validPhasePlans(a){if(!a||a.phasePlans===undefined)return true;const rows=a.phasePlans;if(!Array.isArray(rows)||rows.length>4)return false;return new Set(rows.map(r=>r?.stage)).size===rows.length&&rows.every(r=>r&&Number.isInteger(r.stage)&&r.stage>=0&&r.stage<=Math.min(3,a.stage)&&plans[a.type]?.some(p=>p.id===r.id&&p.cost===r.cost));}
