// Lifely original, fictional civic and team-care interactive career modes.
// Never medical advice or a representation of a real election.
const cap=(x)=>Math.max(0,Math.min(100,Math.round(x)));
export const debateTopics=[
 {name:'Community priorities',question:'A resident asks how you will choose between competing local projects without ignoring smaller neighborhoods.',brief:'Open the public meeting with a transparent plan for listening and budgeting.',options:[
  {label:'Present a costed public plan',note:'Evidence-first response · credibility',icon:'▤',credibility:8,trust:3,poll:2,risk:-3,difficulty:4},
  {label:'Invite residents to propose priorities',note:'Listen and build community trust',icon:'♡',credibility:3,trust:9,poll:1,risk:-2,difficulty:1},
  {label:'Promise immediate changes everywhere',note:'A headline gamble with scrutiny later',icon:'✦',credibility:-8,trust:-6,poll:10,risk:14,difficulty:12}]},
 {name:'Building a coalition',question:'A rival proposes supporting one shared community service, but demands public credit for the partnership.',brief:'The coalition desk tracks cooperation, public trust and your party’s credibility.',options:[
  {label:'Negotiate shared measurable goals',note:'Realistic compromise',icon:'◎',credibility:7,trust:7,poll:2,risk:-4,difficulty:3},
  {label:'Publish the agreement for feedback',note:'Open accountability and slower momentum',icon:'▣',credibility:9,trust:5,poll:0,risk:-4,difficulty:5},
  {label:'Reject talks and court headlines',note:'Visibility rises but relationships fray',icon:'↗',credibility:-7,trust:-8,poll:12,risk:13,difficulty:12}]},
 {name:'Live debate night',question:'The moderator challenges an old decision. The opposing candidate is ready to interrupt your answer.',brief:'Choose your on-stage response. A better answer builds credibility, not just applause.',options:[
  {label:'Acknowledge mistakes and explain progress',note:'Trust and detailed accountability',icon:'✓',credibility:11,trust:8,poll:4,risk:-5,difficulty:3},
  {label:'Support your argument with evidence',note:'A strong, verifiable comparison',icon:'▤',credibility:12,trust:3,poll:5,risk:-3,difficulty:5},
  {label:'Turn the moment into a personal attack',note:'Short-lived attention, backlash risk',icon:'⚑',credibility:-12,trust:-10,poll:12,risk:16,difficulty:15}]},
 {name:'Election-week scrutiny',question:'Conflicting messages are circulating. Local volunteers want a responsible final statement.',brief:'What remains after the broadcast matters as much as the election-night headline.',options:[
  {label:'Correct the record publicly',note:'Accuracy, transparency and stability',icon:'✓',credibility:10,trust:9,poll:3,risk:-6,difficulty:2},
  {label:'Hold a moderated community forum',note:'Hear more views before the vote',icon:'♧',credibility:7,trust:11,poll:3,risk:-3,difficulty:3},
  {label:'Escalate the media spectacle',note:'More impressions, uncertain goodwill',icon:'✦',credibility:-8,trust:-8,poll:14,risk:15,difficulty:14}]}];
export const clinicalPhases=[
 {name:'Initial review',question:'The fictional care team receives incomplete records and needs a coordinated assessment.',patient:'CASE A-17',options:[
  {label:'Check records and documented concerns',note:'Structured verification, no diagnostic guess',icon:'▤',safety:11,consent:2,team:4,quality:6,reach:0,risk:-6,difficulty:2},
  {label:'Convene qualified specialists',note:'Shared assessment and oversight',icon:'⊕',safety:10,consent:2,team:11,quality:5,reach:0,risk:-4,difficulty:3},
  {label:'Ask for the patient’s priorities',note:'Listening and clear communication',icon:'♡',safety:6,consent:11,team:4,quality:4,reach:0,risk:-3,difficulty:3}]},
 {name:'Consent and communication',question:'The fictional patient asks for time and clear explanations before the care team proceeds.',patient:'CASE A-17',options:[
  {label:'Explain options and verify consent',note:'Patient autonomy and understanding',icon:'♡',safety:8,consent:15,team:4,quality:5,reach:0,risk:-6,difficulty:2},
  {label:'Arrange a qualified interpreter',note:'Accessible communication and teamwork',icon:'⌁',safety:7,consent:13,team:8,quality:5,reach:0,risk:-5,difficulty:3},
  {label:'Coordinate a family discussion',note:'Respect preferences and boundaries',icon:'◎',safety:7,consent:10,team:9,quality:5,reach:0,risk:-4,difficulty:4}]},
 {name:'Unexpected concern',question:'New information appears. A responsible team must review the plan and escalate concerns when needed.',patient:'CASE A-17',options:[
  {label:'Escalate to a qualified senior team',note:'Supervised team coordination',icon:'⊕',safety:14,consent:3,team:11,quality:6,reach:0,risk:-8,difficulty:2},
  {label:'Hold a structured safety huddle',note:'Confirm responsibilities and records',icon:'▤',safety:12,consent:4,team:10,quality:5,reach:0,risk:-6,difficulty:3},
  {label:'Listen and revise the support plan',note:'A patient-centered review',icon:'♡',safety:10,consent:12,team:6,quality:5,reach:0,risk:-6,difficulty:3}]},
 {name:'Safe discharge and learning',question:'The care episode ends with a follow-up plan, documentation and learning opportunities.',patient:'CASE A-17',options:[
  {label:'Document follow-up and responsible owners',note:'Continuity with no skipped handoffs',icon:'✓',safety:12,consent:7,team:8,quality:7,reach:0,risk:-7,difficulty:2},
  {label:'Organize an independent peer review',note:'Learn from the case with oversight',icon:'▣',safety:13,consent:3,team:10,quality:7,reach:0,risk:-6,difficulty:3},
  {label:'Provide a clear patient support summary',note:'Accessible next steps and feedback',icon:'♡',safety:10,consent:13,team:7,quality:6,reach:0,risk:-6,difficulty:2}]}];
export const initialSpecialPlayfield=(type)=>type==='election'?{poll:45,credibility:50,community:48,applause:0,answers:0,plays:[],last:null}:type==='medical'?{safety:48,consent:42,coordination:52,followup:0,reviews:0,plays:[],last:null}:null;
export function specialCareerView(s,a){
 const p=a.playfield||initialSpecialPlayfield(a.type);
 if(!p)return null;
 const roundPlays=p.plays.filter(x=>x.stage===a.stage);
 const common={type:a.type,stage:a.stage,remaining:Math.max(0,2-roundPlays.length),played:roundPlays.length,maxPerStage:2,plays:p.plays.length,last:p.last};
 if(a.type==='election'){
  const d=debateTopics[a.stage];return {...common,topic:d.name,question:d.question,hint:d.brief,options:d.options.map(({label,note,icon})=>({label,note,icon})),poll:p.poll,credibility:p.credibility,community:p.community,applause:p.applause,answers:p.answers,
   rival:a.stakeholder||'Civic challenger',rivalApproval:s.world?.characters?.politicians?.find(x=>x.id===a.stakeholderId)?.approval??50};
 }
 const d=clinicalPhases[a.stage];return {...common,topic:d.name,question:d.question,hint:'Fictional, high-level coordination exercise. These controls are not treatment instructions.',options:d.options.map(({label,note,icon})=>({label,note,icon})),caseId:d.patient,safety:p.safety,consent:p.consent,coordination:p.coordination,followup:p.followup,reviews:p.reviews};
}
export function specialCareerAct(s,a,index,ctx){
 if(!['election','medical'].includes(a.type))throw Error('Unknown interactive career.');
 if(!Number.isInteger(index)||index<0||index>2)throw Error('Choose a valid playfield action.');
 a.playfield??=initialSpecialPlayfield(a.type);
 const p=a.playfield;
 if(p.plays.filter(x=>x.stage===a.stage).length>=2)throw Error('This phase is complete. Choose a story decision to continue.');
 const d=a.type==='election'?debateTopics[a.stage]:clinicalPhases[a.stage];
 const o=d?.options[index];if(!o)throw Error('Invalid career phase.');
 const skill=a.type==='election'?((s.stats.reputation??50)+(s.stats.social??50))/2:((s.stats.knowledge??50)+(s.skills?.technical??0))/2;
 const chance=cap(63+skill*.18+(a.team-40)*.10-a.risk*.12-o.difficulty,15,94);
 const success=ctx.rng(s)*100<chance;
 const factor=success?1:0.45;
 let description='';
 if(a.type==='election'){
  p.poll=cap(p.poll+o.poll*factor+(success?2:-1));
  p.credibility=cap(p.credibility+o.credibility*factor);
  p.community=cap(p.community+o.trust*factor);
  p.applause+=Math.max(0,Math.round(o.poll*factor));
  p.answers++;
  a.quality=cap(a.quality+o.credibility*.55*factor);
  a.team=cap(a.team+o.trust*.45*factor);
  a.reach=cap(a.reach+o.poll*.55*factor);
  a.risk=cap(a.risk+o.risk*(success?1:1.5));
  description=(success?'The response lands. ':'The audience is divided. ')+(o.credibility>0?'Your public credibility reflects the evidence and outreach.':'The headline gains attention but concerns grow about trust.');
 }else{
  p.safety=cap(p.safety+o.safety*factor);
  p.consent=cap(p.consent+o.consent*factor);
  p.coordination=cap(p.coordination+o.team*factor);
  if(a.stage===3)p.followup+=success?2:1;
  p.reviews++;
  a.quality=cap(a.quality+o.quality*factor);
  a.team=cap(a.team+o.team*.45*factor);
  a.risk=cap(a.risk+o.risk*(success?1:.45));
  description=(success?'The fictional team coordinates its next step. ':'The team requests more oversight. ')+(o.consent>=10?'The patient’s preferences stay visible.':o.safety>=12?'The documented safety pathway is strengthened.':'The handoff and team coordination are clearer.');
 }
 p.last={stage:a.stage,index,success,description};
 p.plays.push({stage:a.stage,index,success});
 return p.last;
}
