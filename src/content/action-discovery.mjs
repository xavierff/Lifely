// One searchable index over the authoritative engine command list.
// No action is generated, enabled or executed by this presentation helper.
export const actionCategories=['All','Life','People','Work','World','Money','Justice'];
const groups={
 People:['socialinvite','date','marry','breakup','child','friend','support','askhelp','reconcile','dialogue','family','household','transition','romance','estate','npcgoal','cross','clash','influence'],
 Work:['economy','job','study','education','profession','pro','company','business','mini','campaign','careerfollow','workplace','celebrity','sportdeal','spotlight','side','retire','quit','skill'],
 World:['city','world','character','circle','intergroup','publicplay','afterlife','mandate','pulse','autonomy'],
 Money:['corporate','lifestyle','buy','sell','invest','withdraw','bank','marketbuy','marketsell','renttenant','rentrepair','rentraise','rentlower','budget','debt','luxury','empire'],
 Justice:['justice','justicejourney'],
 Life:['identity','rest','exercise','learn','create','volunteer','pet','petcare','club','hobby','scene','fate','episode','ambition','ripple','clinic']
};
export function categoryForAction(id){
 if(id.startsWith('scene:start:court'))return 'Justice';
 if(id.startsWith('scene:start:exam'))return 'Work';
 if(id.startsWith('scene:start:bond')||id.startsWith('scene:start:outing:first-date')||id.startsWith('scene:start:outing:reunion'))return 'People';
 if(id.startsWith('world:ent:')||id.startsWith('world:sport:')||id.startsWith('character:agent:')||id.startsWith('character:sport:'))return 'Work';
 const key=id.split(':')[0];
 return Object.keys(groups).find(g=>groups[g].includes(key))||'Life';
}
export function findActions(commands,{query='',category='All',includeLocked=false}={}){
 const terms=String(query).trim().toLowerCase().split(/\s+/).filter(Boolean);
 return commands.filter(c=>c&&typeof c.id==='string'&&(includeLocked||c.enabled)).map(c=>({...c,category:categoryForAction(c.id)})).filter(c=>(category==='All'||c.category===category)&&terms.every(term=>(c.label+' '+c.detail+' '+c.id+' '+c.category).toLowerCase().includes(term))).sort((a,b)=>Number(b.enabled)-Number(a.enabled)||a.label.localeCompare(b.label)||a.id.localeCompare(b.id));
}
export function actionReceipt(before,after,label){
 if(!before||!after||before.lifeId!==after.lifeId)return null;
 const changes=Object.keys(after.stats||{}).filter(k=>Number.isFinite(before.stats?.[k])&&after.stats[k]!==before.stats[k]).map(k=>({key:k,delta:after.stats[k]-before.stats[k]}));
 return {label,age:after.age,actions:after.actions,spent:Math.max(0,before.actions-after.actions),cash:after.cash-before.cash,changes:changes.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)||a.key.localeCompare(b.key)).slice(0,4)};
}
