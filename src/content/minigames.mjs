// Three deterministic, interactive games; questions are original fictional work exercises.
// No clock dependency: saves can resume a round without losing progress.
export const gameTypes=[
{id:'logic',name:'Pattern Lab',description:'Find the next number in a sequence. Five rounds.',skill:'technical'},
{id:'memory',name:'Signal Recall',description:'Study a short symbol sequence, then reconstruct it. Five rounds.',skill:'communication'},
{id:'judgment',name:'Career Decisions',description:'Choose the best response in five workplace situations.',skill:'communication'}];
const questions=[
['A report has a conflicting total. What is the best first step?',['Submit it unchanged','Check the source figures','Hide the discrepancy'],1],
['Two tasks are urgent, but one affects customer safety. What comes first?',['Customer safety','The easier task','The newest email'],0],
['A colleague raises a concern about a project. What is the best response?',['Dismiss it','Assign blame','Listen and verify the concern'],2],
['A client requests work beyond the agreement. What should you do?',['Clarify scope and cost','Promise everything for free','Ignore the request'],0],
['A project is late. What makes a useful update?',['An unrelated success','The delay, impact and recovery plan','A vague apology'],1],
['Your team receives a limited budget. What should guide allocation?',['A random draw','Personal preference','Expected impact and essential needs'],2],
['A new worker needs help. What supports learning?',['Clear guidance and feedback','Give no instructions','Complete every task for them'],0],
['A supplier misses a deadline. What is the best response?',['Publish accusations','Review impact and alternatives','Order more blindly'],1],
['A customer reports a defect. What is the next step?',['Ignore the report','Delete the feedback','Investigate and document the issue'],2],
['You notice an unfamiliar technical issue. What is best?',['Consult reliable guidance or a qualified colleague','Guess and conceal uncertainty','Proceed without checking'],0]
];
export function miniRound(type,seed,round){let z=(seed+Math.imul(round+1,2654435761))>>>0;const next=()=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return z;};
 if(type==='logic'){const start=2+next()%12,step=2+next()%7,mode=next()%2;const seq=Array.from({length:4},(_,i)=>mode?start+step*i*(i+1)/2:start+step*i);const correct=mode?start+step*10:start+step*4;const choices=[correct,correct+step,correct-step];const shift=next()%3;const options=choices.slice(shift).concat(choices.slice(0,shift));return {prompt:'What comes next? '+seq.join(' · ')+' · ?',options:options.map(String),correct:options.indexOf(correct)};}
 if(type==='memory'){const symbols=['A','B','C','D'];const sequence=Array.from({length:3+Math.floor(round/2)},()=>symbols[(next()>>>16)%4]);let altered=[...sequence];altered[0]=symbols[(symbols.indexOf(altered[0])+1)%4];let other=[...sequence];other[other.length-1]=symbols[(symbols.indexOf(other[other.length-1])+2)%4];const choices=[sequence.join(' '),altered.join(' '),other.join(' ')];const shift=next()%3;const options=choices.slice(shift).concat(choices.slice(0,shift));return {prompt:'Which sequence did you study?',preview:sequence.join(' · '),options,correct:options.indexOf(choices[0])};}
 const q=questions[(seed+round*3)%questions.length];return {prompt:q[0],options:q[1],correct:q[2]};
}
