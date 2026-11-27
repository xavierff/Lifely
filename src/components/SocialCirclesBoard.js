import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';

const C={bg:'#14272D',card:'#20383F',deep:'#13252B',ink:'#F7F8F1',
 muted:'#BDD1CB',line:'#57756E',gold:'#FFDEAA',mint:'#C8EFA8',red:'#FFC2B3'};
const kinds={'professional':'PROFESSIONAL NETWORK','family':'FAMILY ALLIANCE',
 'community':'COMMUNITY ORGANIZATION','rival-family':'RIVAL HOUSEHOLD'};
const cap=n=>Math.max(0,Math.min(100,Number(n)||0));
const initials=s=>String(s||'?').split(' ').slice(0,2).map(x=>x[0]||'').join('').toUpperCase();
const sign=n=>(n>=0?'+':'')+n;
function Meter({title,value,danger=false}){
 return <View style={S.metric}>
  <View style={S.split}><Text style={S.small}>{title}</Text>
   <Text style={S.boldMini}>{cap(value)}</Text></View>
  <View style={S.track}><View style={[S.fill,{width:cap(value)+'%',
   backgroundColor:danger?C.red:C.mint}]}/></View>
 </View>;
}
function SuccessionCard({item,commands,onAction}){
 const e=item.succession;
 const choices=commands.filter(c=>c.id.startsWith('circle:succession:'+e.id+':'));
 return <View testID={'succession-'+item.id} style={S.invite}>
  <Text style={S.overline}>INTERNAL LEADERSHIP CONTEST</Text>
  <Text style={S.groupTitle}>{item.name}</Text>
  <Text style={S.description}>{e.incumbentName||'Unavailable'} vs {e.challengerName||'Unavailable'}</Text>
  <Text style={S.small}>Real members cast their ballots at age {e.dueAge}. Endorsements influence preferences, not the final result.</Text>
  {e.response?<Text style={S.waiting}>Response recorded: {e.response}</Text>:choices.map(c=><Pressable key={c.id} testID={'succession-choice-'+c.id.split(':').at(-1)} accessibilityRole="button" accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled} onPress={()=>onAction(c.id)} style={[S.option,!c.enabled&&S.disabled]}><Text style={S.optionTitle}>{c.label}</Text><Text style={S.small}>{c.detail}</Text></Pressable>)}
 </View>;
}
function FractureCard({item,commands,onAction}){
 const c=item.institution.crisis,choices=commands.filter(x=>x.id.startsWith('circle:fracture:'+c.id+':'));
 return <View testID={'fracture-'+item.id} style={S.invite}>
  <Text style={S.overline}>INSTITUTIONAL FACTION CHALLENGE</Text>
  <Text style={S.groupTitle}>{item.name}</Text>
  <Text style={S.description}>Members may establish a separate organization at age {c.dueAge}. The original group and its history survive.</Text>
  <Meter title="Fracture pressure" value={item.institution.strain} danger/>
  {c.response?<Text style={S.waiting}>Response recorded: {c.response}</Text>:choices.map(x=><Pressable key={x.id} testID={'fracture-choice-'+x.id.split(':').at(-1)} accessibilityRole="button" accessibilityState={{disabled:!x.enabled}} disabled={!x.enabled} onPress={()=>onAction(x.id)} style={[S.option,!x.enabled&&S.disabled]}><Text style={S.optionTitle}>{x.label}</Text><Text style={S.small}>{x.detail}</Text></Pressable>)}
 </View>;
}
function GroupCard({item,compact=false}){
 return <View testID={'circle-group-'+item.id} style={S.card}>
  <View style={S.split}><Text style={S.overline}>{kinds[item.kind]}</Text>
   <Text style={[S.overline,{color:item.status==='active'?C.mint:C.gold}]}>
    {item.status==='active'?'ACTIVE':'DORMANT'}</Text></View>
  <Text style={S.groupTitle}>{item.name}</Text>
  <View style={S.split}>
   <View style={{flex:1,gap:5}}>
    <Text style={S.description}>{item.memberNames.length?
     item.memberNames.join(' · '):
     'No current-generation member is known; the institution remains in local memory.'}</Text>
    <Text style={S.small}>{item.representative?
     'Current representative: '+item.representative:'Historical organization'}</Text>
   </View>
   <View style={S.monogram}><Text style={S.monogramText}>
    {initials(item.representative||item.name)}</Text></View>
  </View>
  <View style={S.meters}>
   <Meter title="Standing" value={item.standing}/>
   <Meter title="Cohesion" value={item.cohesion}/>
   <Meter title="Tension" value={item.tension} danger/>
  </View>
  <View testID="circle-group-project" style={S.project}>
   <View style={S.split}><Text style={S.overline}>THE GROUP'S OWN PROJECT</Text>
    <Text style={S.small}>{item.project?.progress??0}%</Text></View>
   <Text style={S.projectText}>{item.project?.mission||'Maintaining the group'}</Text>
   <View style={S.track}><View style={[S.fill,{width:cap(item.project?.progress)+'%'}]}/></View>
   <Text style={S.small}>{item.status==='dormant'?'Paused until real members return':
    'Group members work on this even when you do nothing'} · {item.completedProjects} past projects</Text>
  </View>
  {item.institution?<View style={S.project}><Text style={S.overline}>INSTITUTIONAL HEALTH</Text><Text style={S.description}>{item.institution.mergedInto?'Reunited with parent institution':item.institution.parentId?'Independent reform circle':item.institution.condition.toUpperCase()}</Text><Meter title="Internal strain" value={item.institution.strain} danger/>{!compact&&item.institution.history.slice(-3).reverse().map((h,i)=><Text key={i} style={S.small}>Age {h.age}: {h.text}</Text>)}</View>:null}
  {!compact&&item.governance?.results?.length?<View style={S.history}><Text style={S.overline}>LEADERSHIP HISTORY</Text>{item.governance.results.slice(-3).reverse().map(r=><Text key={r.id} style={S.description}>Age {r.age}: {r.winnerName||'No winner'} · {r.outcome.replaceAll('-',' ')} · Challenger {r.votesForChallenger}/{r.totalVotes}</Text>)}</View>:null}
  {!compact&&item.history?.length?<View style={S.history}>
   <Text style={S.overline}>HISTORY THAT DOESN'T DISAPPEAR</Text>
   {item.history.slice(0,3).map((h,i)=><Text key={h.age+'-'+h.kind+'-'+i}
    style={S.description}>Age {h.age}: {h.title} — {h.outcome}</Text>)}
  </View>:null}
 </View>;
}
function InviteCard({item,commands,onAction}){
 const actions=commands.filter(c=>c.id.startsWith('circle:'+item.id+':'));
 return <View testID="circle-invite" style={S.invite}>
  <View style={S.split}><Text style={S.overline}>{item.status==='ready'?
   'TWO YEARS LATER':'A NEW GROUP DECISION'}</Text><Text style={S.overline}>{kinds[item.kind]}</Text></View>
  <Text style={S.groupTitle}>{item.groupName}</Text>
  <View style={S.person}><View style={S.avatar}><Text style={S.avatarText}>
   {initials(item.personName)}</Text></View>
   <View style={{flex:1,gap:4}}><Text style={S.name}>{item.personName}</Text>
    <Text style={S.small}>Existing group contact · Trust {item.trust??'—'} · Rivalry {item.rivalry??'—'}</Text>
   </View>
  </View>
  <Text style={S.description}>Your choice may change the real person's relationship with you and the group's future, but members will continue pursuing their own priorities.</Text>
  {item.status==='waiting'?<Text style={S.waiting}>Their independent group work continues.
   A new decision can appear at age {item.dueAge}.</Text>:null}
  {item.lastDecision?<View testID="circle-impact" style={S.impact}>
   <Text style={S.overline}>LAST CHOICE: WHAT ACTUALLY CHANGED</Text>
   <View style={S.pills}>
    <Text style={S.pill}>Trust {sign(item.lastDecision.trustDelta)}</Text>
    <Text style={S.pill}>Rivalry {sign(item.lastDecision.rivalryDelta)}</Text>
    <Text style={S.pill}>Standing {sign(item.lastDecision.standingDelta)}</Text>
    <Text style={S.pill}>Progress {sign(item.lastDecision.progressDelta)}</Text>
   </View>
  </View>:null}
  {['open','ready'].includes(item.status)?<View style={S.options}>
   <Text style={S.overline}>YOUR RESPONSE</Text>
   {actions.map(c=><Pressable key={c.id} testID={'circle-choice-'+c.id.split(':').at(-1)}
    accessibilityRole="button" accessibilityLabel={c.label+', '+c.detail}
    accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled}
    style={({pressed})=>[S.option,!c.enabled&&S.disabled,pressed&&{opacity:.75}]}
    onPress={()=>onAction(c.id)}>
    <Text style={S.optionTitle}>{c.label}</Text><Text style={S.small}>{c.detail}</Text>
   </Pressable>)}
  </View>:null}
  <Text style={S.small}>Responding costs one normal activity. The story never blocks aging or requires an answer.</Text>
 </View>;
}
export default function SocialCirclesBoard({view,commands=[],onAction,compact=false,filterKinds=[]}){
 const groups=filterKinds.length?view.groups.filter(g=>filterKinds.includes(g.kind)):view.groups;
 const invites=view.invites.filter(o=>!filterKinds.length||filterKinds.includes(o.kind));
 const recent=view.completed.find(x=>x.endedAge===view.age&&
  (!filterKinds.length||filterKinds.includes(x.kind)));
 const succession=groups.filter(g=>g.succession&&(!compact||g.succession.response===null));
 const fractures=groups.filter(g=>g.status==='active'&&g.institution?.crisis&&(!compact||g.institution.crisis.response===null));
 if(compact&&!invites.length&&!recent&&!succession.length&&!fractures.length)return null;
 return <View testID={compact?'social-circles-preview':'social-circles-board'} style={S.root}>
  <View style={S.split}><View style={{flex:1,gap:4}}>
   <Text style={S.overline}>A WORLD THAT ORGANIZES ITSELF</Text>
   <Text style={S.title}>{compact?'A circle wants your attention':'Organizations & rival households'}</Text>
  </View><Text style={S.counter}>{groups.length} GROUPS</Text></View>
  <Text style={S.description}>Living organizations depend on real NPC members. They pursue multi-year projects, disagree, reconcile and sometimes outlive the generation that formed them.</Text>
  {fractures.map(g=><FractureCard key={g.id} item={g} commands={commands} onAction={onAction}/>)}
  {succession.map(g=><SuccessionCard key={g.id} item={g} commands={commands} onAction={onAction}/>)}
  {invites.map(x=><InviteCard key={x.id} item={x} commands={commands} onAction={onAction}/>)}
  {compact&&recent&&!invites.length?<View testID="circle-recent-result" style={S.card}>
   <Text style={S.overline}>THIS YEAR'S GROUP OUTCOME</Text>
   <Text style={S.groupTitle}>{recent.ending.toUpperCase()} · {recent.personName}</Text>
   <Text style={S.description}>{recent.finalLine}</Text>
  </View>:null}
  {!compact&&groups.map(g=><GroupCard key={g.id} item={g}/>)}
  {!compact&&!groups.length?<Text style={S.small}>No organizations are connected to your current life yet. Family councils, professional networks and community circles emerge when living NPCs have genuine shared interests.</Text>:null}
  {!compact&&view.completed.length?<View testID="circle-history" style={S.card}>
   <Text style={S.overline}>REPUTATIONS BUILT BETWEEN GROUPS</Text>
   {view.completed.slice(0,6).map(x=><View key={x.id} style={S.historyItem}>
    <View style={S.split}><Text style={S.name}>{x.personName}</Text>
     <Text style={[S.overline,{color:x.ending==='alliance'?C.mint:C.gold}]}>{x.ending.toUpperCase()}</Text></View>
    <Text style={S.description}>{x.finalLine}</Text>
    <Text style={S.small}>Age {x.endedAge} · {x.decisions} player decisions</Text>
   </View>)}
  </View>:null}
  {!compact&&view.ancestors.length?<View testID="circle-ancestor-memory" style={S.card}>
   <Text style={S.overline}>INSTITUTIONS ACROSS GENERATIONS</Text>
   <Text style={S.description}>Old institutions remain part of the world. A descendant can encounter them again, but only if living people actually renew their membership.</Text>
   {view.ancestors.slice(0,4).map((x,i)=><View key={x.generation+'-'+i} style={S.historyItem}>
    <Text style={S.overline}>GENERATION {x.generation} · {x.name}</Text>
    <Text style={S.description}>{x.note}</Text>
   </View>)}
  </View>:null}
  <Text style={S.small}>Group growth is autonomous and uses no additional random rolls, invisible members, invented finances or compulsory annual actions.</Text>
 </View>;
}
const S=StyleSheet.create({
 root:{backgroundColor:C.bg,padding:13,borderRadius:16,borderWidth:1,borderColor:C.line,gap:12},
 split:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:.5,color:C.gold,flexShrink:1},
 title:{fontSize:18,fontWeight:'900',lineHeight:25,color:C.ink},
 counter:{fontSize:10,color:C.mint,fontWeight:'900'},
 description:{fontSize:12,color:C.muted,lineHeight:18,flexShrink:1},
 card:{backgroundColor:C.card,padding:12,borderWidth:1,borderColor:C.line,borderRadius:11,gap:10},
 groupTitle:{fontSize:15,color:C.ink,lineHeight:22,fontWeight:'900'},
 monogram:{width:41,height:41,borderRadius:22,backgroundColor:'#42665F',
  justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:C.mint},
 monogramText:{fontSize:14,fontWeight:'900',color:C.ink},
 small:{color:C.muted,fontSize:10,lineHeight:16,flexShrink:1},
 boldMini:{fontSize:12,color:C.ink,fontWeight:'900'},
 meters:{flexDirection:'row',flexWrap:'wrap',gap:8},metric:{flex:1,flexBasis:80,gap:6},
 track:{height:8,backgroundColor:'#4A6664',borderRadius:6,overflow:'hidden'},
 fill:{height:8,borderRadius:6,backgroundColor:C.mint},
 project:{backgroundColor:C.deep,borderRadius:9,padding:10,gap:8},
 projectText:{fontSize:12,color:C.ink,fontWeight:'800'},
 history:{gap:6},historyItem:{gap:5,paddingTop:8,borderTopWidth:1,borderTopColor:C.line},
 invite:{padding:12,borderRadius:12,borderWidth:1,borderColor:C.mint,backgroundColor:C.card,gap:10},
 person:{flexDirection:'row',alignItems:'center',gap:10},
 avatar:{height:46,width:46,borderRadius:24,backgroundColor:'#47716D',
  borderWidth:1,borderColor:C.gold,alignItems:'center',justifyContent:'center'},
 avatarText:{fontWeight:'900',color:C.ink,fontSize:16},
 name:{fontSize:12,fontWeight:'900',color:C.ink,flexShrink:1},
 waiting:{fontSize:12,color:C.gold,lineHeight:19},
 impact:{backgroundColor:'#2B4B42',borderRadius:10,padding:10,gap:8},
 pills:{flexDirection:'row',flexWrap:'wrap',gap:6},
 pill:{color:C.mint,fontSize:10,fontWeight:'800',padding:8,backgroundColor:'#1C3530',borderRadius:7},
 options:{gap:7},option:{minHeight:48,borderWidth:1,borderColor:'#72958A',borderRadius:9,
 padding:11,gap:5,backgroundColor:'#2B4846'},
 optionTitle:{color:C.ink,fontSize:12,fontWeight:'900',lineHeight:18},
 disabled:{opacity:.4}
});
