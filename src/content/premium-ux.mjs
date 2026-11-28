import {categoryForAction} from './action-discovery.mjs';
// Presentation only: all candidates come from the engine's authoritative command list.
const special=id=>/^(drama:choose:|scene:callback:|family:|workplace:|ripple:|fate:|episode:)/.test(id);
export function dashboardModel(s,commands){
 const available=commands.filter(c=>c.enabled),categories=['Life','People','Work','World','Money','Justice'].map(id=>({id,count:available.filter(c=>categoryForAction(c.id)===id).length})).filter(x=>x.count);
 const rank=c=>{const id=c.id;if(id==='rest'&&(s.stats.stress>=65||s.stats.health<=40))return 120;if(id.startsWith('clinic')&&s.stats.health<=40)return 115;if(special(id))return 90;if(id.startsWith('scene:start:outing:')||id.startsWith('arcade:')||id.startsWith('matchleague:')||id.startsWith('production:'))return 75;if(s.age>=18&&s.debt>0&&id.startsWith('repay:')&&s.cash>=Number(id.split(':')[1])+1000)return 85;if(s.age>=18&&s.debt>0&&s.budget!=='frugal'&&id==='budget:frugal')return 82;if(s.age>=18&&!s.job&&!s.profession&&id.startsWith('job:'))return 88;if(id.startsWith('visit:')||id.startsWith('scene:start:bond:'))return 50;return 20;};
 const repayment=c=>c.id.startsWith('repay:')?Math.min(s.debt||0,Number(c.id.split(':')[1]),s.cash||0):0;
 const sorted=available.slice().sort((a,b)=>rank(b)-rank(a)||repayment(b)-repayment(a)||a.id.localeCompare(b.id)),suggestions=[],groups=new Set();
 for(const c of sorted){const category=categoryForAction(c.id);if(groups.has(category))continue;groups.add(category);suggestions.push({...c,category,reason:rank(c)>=115?'Look after your wellbeing':special(c.id)?'A remembered opportunity':c.id.startsWith('job:')?'Find a source of income':c.id.startsWith('repay:')||c.id==='budget:frugal'?'Improve financial resilience':rank(c)>=75?'Make time for an experience':rank(c)>=60?'Build your next chapter':'An available activity'});if(suggestions.length===3)break;}
 return {available:available.length,categories,suggestions,actions:s.actions,age:s.age};
}
export const journalKinds=['All','Milestones','People','Career','Activities','Story'];
const kinds={Milestones:['achievement','milestone'],People:['people','relationship','family'],Career:['career','work'],Activities:['activity'],Story:['story','world']};
export function journalModel(history,{category='All',query='',limit=12}={}){
 const terms=String(query).trim().toLowerCase().split(/\s+/).filter(Boolean);
 const matches=history.map((h,index)=>({...h,index})).reverse().filter(h=>(category==='All'||kinds[category]?.includes(h.kind))&&terms.every(t=>(h.text+' age '+h.age).toLowerCase().includes(t)));
 return {total:matches.length,entries:matches.slice(0,Math.max(0,limit))};
}
