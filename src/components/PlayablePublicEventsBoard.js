import React,{useEffect,useRef} from 'react';
import {Animated,Pressable,StyleSheet,Text,View} from 'react-native';

const C={bg:'#13272D',panel:'#21383D',raised:'#315049',ink:'#F8F8F1',
 muted:'#B8CCC5',line:'#5B796F',mint:'#CFF4AB',gold:'#FFDEB1',red:'#FFBFB6'};
const sign=n=>(n>=0?'+':'')+n;
const limit=n=>Math.max(0,Math.min(100,Number(n)||0));
const initials=x=>String(x||'?').split(' ').slice(0,2).map(p=>p.charAt(0)).join('').toUpperCase();
function Meter({label,value,caution=false}){
 const progress=useRef(new Animated.Value(limit(value))).current;
 useEffect(()=>{Animated.timing(progress,{toValue:limit(value),
  duration:240,useNativeDriver:false}).start()},[progress,value]);
 const width=progress.interpolate({inputRange:[0,100],outputRange:['0%','100%']});
 return <View style={S.meter}>
  <View style={S.split}><Text style={S.mini}>{label}</Text>
   <Text style={S.meterValue}>{limit(value)}</Text></View>
  <View style={S.track}><Animated.View style={[S.fill,{width,
   backgroundColor:caution?C.red:C.mint}]}/></View>
 </View>;
}
function Portrait({name,subtitle}){
 return <View style={S.person}>
  <View style={S.avatar}><Text style={S.avatarLetters}>{initials(name)}</Text></View>
  <Text numberOfLines={2} style={S.personName}>{name}</Text>
  <Text numberOfLines={2} style={S.mini}>{subtitle}</Text>
 </View>;
}
function Challenge({event,onChoose,onLeave}){
 const next=event.phase,stage=event.stage+1;
 return <View testID="playable-public-event-active" style={S.challenge}>
  <View style={S.split}>
   <Text style={S.overline}>{event.colorName} · INTERACTIVE EVENT</Text>
   <Text style={S.overline}>ROUND {stage} / 3</Text>
  </View>
  <Text style={S.headline}>{event.title}</Text>
  <Text style={S.description}>{event.groupA} and {event.groupB} are working toward a real public outcome. Your choices affect their existing leaders and long-term relationship.</Text>
  <View style={S.stepTrack}>{[0,1,2].map(n=><View key={n}
   style={[S.step,{backgroundColor:n<=event.stage?C.mint:'#526964'}]}/>)}</View>
  <View style={S.faces}>
   <Portrait name={event.representativeA||'Group A'} subtitle={event.groupA}/>
   <Text style={S.vs}>VS</Text>
   <Portrait name={event.representativeB||'Group B'} subtitle={event.groupB}/>
  </View>
  {event.mode==='election'&&event.ballot?<View testID="playable-election-candidates" style={S.ballot}>
   <Text style={S.overline}>REAL MEMBERS RUNNING FOR LEADERSHIP</Text>
   <Text style={S.description}>{event.ballot.groupName}</Text>
   <View style={S.split}><View style={{flex:1,gap:3}}>
    <Text style={S.personName}>{event.ballot.incumbentName}</Text>
    <Text style={S.mini}>Incumbent · Trust {event.ballot.incumbentTrust??'—'}</Text>
   </View><Text style={S.vs}>↔</Text><View style={{flex:1,gap:3,alignItems:'flex-end'}}>
    <Text style={S.personName}>{event.ballot.challengerName}</Text>
    <Text style={S.mini}>Challenger · Trust {event.ballot.challengerTrust??'—'}</Text>
   </View></View>
   <Text style={S.mini}>Player endorsements are not votes. Real NPC trust and the group's cohesion also determine the result.</Text>
  </View>:null}
  <View style={S.meters}>
   <Meter label="Preparation" value={event.performance}/>
   <Meter label="Fairness" value={event.fairness}/>
   <Meter label="Engagement" value={event.engagement}/>
   <Meter label="Pressure" value={event.pressure} caution/>
  </View>
  <View style={S.sceneText}>
   <Text style={S.overline}>CHAPTER {stage} · LIVE DECISION</Text>
   <Text style={S.sceneTitle}>{next.title}</Text>
   <Text style={S.description}>{next.prompt}</Text>
  </View>
  {next.choices.map((label,index)=><Pressable key={index}
   testID={'playable-event-choice-'+index}
   accessibilityRole="button" accessibilityLabel={label}
   onPress={()=>onChoose(index)}
   style={({pressed})=>[S.choice,pressed&&{opacity:.76}]}>
   <View style={S.choiceBullet}><Text style={S.choiceIndex}>{index+1}</Text></View>
   <View style={{flex:1,gap:4}}>
    <Text style={S.choiceTitle}>{label}</Text>
    <Text style={S.mini}>{index===0?
     (event.mode==='election'?'Support the existing leader through a real member ballot':
      'Build cooperation and fairness at the actual event'):
     index===1?(event.mode==='election'?'Promote the existing challenger and risk a contested election':
      'Prioritize one side with a measurable social cost'):
     'No direct change to group resources, money, NPC traits or reputation'}</Text>
   </View>
  </Pressable>)}
  {event.decisions.length?<View testID="playable-event-decisions" style={S.evidence}>
   <Text style={S.overline}>YOUR CHOICES SO FAR</Text>
   {event.decisions.map(d=><View key={d.stage} style={S.decision}>
    <Text style={S.mini}>ROUND {d.stage+1}: {d.label}</Text>
    <Text style={S.mini}>Group trust {sign(d.trustDelta)} · Competition {sign(d.competitionDelta)} · Both leaders {sign(d.npcTrustA)}, {sign(d.npcTrustB)}</Text>
   </View>)}
  </View>:null}
  <Pressable accessibilityRole="button" testID="playable-event-leave"
   onPress={onLeave} style={S.leave}>
   <Text style={S.leaveText}>Leave this event without finishing</Text>
  </Pressable>
  <Text style={S.mini}>Hosting costs one normal annual activity. All three rounds are free, and you can leave or continue your life at any point.</Text>
 </View>;
}
function Offer({offer,commands,onStart}){
 return <View testID={'playable-event-offer-'+offer.linkId} style={S.offer}>
  <View style={S.split}><Text style={S.overline}>A GATHERING YOU CAN ACTUALLY PLAY</Text>
   <Text style={S.overline}>AGE {offer.age}</Text></View>
  <Text style={S.groupName}>{offer.groupA} & {offer.groupB}</Text>
  <Text style={S.mini}>Relationship: {offer.relationship.toUpperCase()} · Existing event, real members</Text>
  <View style={S.modeGrid}>
   {offer.modes.map(m=>{
    const cmd=commands.find(c=>c.id===m.id);
    return <Pressable key={m.mode} testID={'playable-mode-'+m.mode}
     accessibilityRole="button" accessibilityLabel={'Play '+m.title+', '+m.subtitle}
     accessibilityState={{disabled:!cmd?.enabled}} disabled={!cmd?.enabled}
     onPress={()=>onStart(m.id)}
     style={({pressed})=>[S.mode,!cmd?.enabled&&S.disabled,pressed&&{opacity:.76}]}>
     <Text style={S.modeIcon}>{m.icon}</Text>
     <Text style={S.modeTitle}>{m.title}</Text>
     <Text style={S.mini}>{m.subtitle}</Text>
    </Pressable>;
   })}
  </View>
  <Text style={S.mini}>Choose one format for this real event. New formats become available when future groups and gatherings qualify.</Text>
 </View>;
}
function Archive({item}){
 return <View testID={'playable-result-'+item.mode} style={S.archiveRow}>
  <View style={S.split}>
   <Text style={S.overline}>{item.title.toUpperCase()} · AGE {item.endedAge}</Text>
   <Text style={[S.overline,{color:['agreement','celebrated','merit','new-leader'].includes(item.ending)?C.mint:C.gold}]}>
    {item.ending.toUpperCase()}</Text>
  </View>
  <Text style={S.description}>{item.finalLine}</Text>
  <View style={S.pills}>
   <Text style={S.pill}>{item.decisions.length}/3 rounds</Text>
   <Text style={S.pill}>Preparation {item.score.performance}</Text>
   <Text style={S.pill}>Fairness {item.score.fairness}</Text>
  </View>
  {item.newLeaderId?<Text style={S.mini}>A real existing NPC became the elected group leader.</Text>:null}
 </View>;
}
export default function PlayablePublicEventsBoard({
 view,commands=[],onStart,onChoose,onLeave,compact=false,onlyProfessional=false
}){
 const active=view.active,offers=(view.offers||[]).filter(o=>
  !onlyProfessional||o.modes.some(m=>m.mode==='competition'));
 const latest=view.recent?.find(x=>x.endedAge===view.age);
 if(compact&&!active&&!latest)return null;
 return <View testID={compact?'playable-events-preview':'playable-events-board'} style={S.root}>
  <View style={S.split}><View style={{flex:1,gap:3}}>
   <Text style={S.overline}>LIFELY · PLAYABLE WORLD</Text>
   <Text style={S.title}>{active?'The event is in your hands':
    compact?'A public event has consequences':'Play the living world'}</Text>
  </View><Text style={S.corner}>3 ROUNDS</Text></View>
  <Text style={S.description}>Public negotiations, festivals, skill challenges and elections are playable with real NPCs, persistent organizations and meaningful outcomes.</Text>
  {active?<Challenge event={active} onChoose={onChoose} onLeave={onLeave}/>:null}
  {!active&&compact&&latest?<View testID="playable-events-current-result" style={S.panel}>
   <Text style={S.overline}>THIS YEAR'S PUBLIC OUTCOME</Text>
   <Archive item={latest}/>
  </View>:null}
  {!compact&&!active&&offers.length?offers.map(o=><Offer key={o.linkId}
   offer={o} commands={commands} onStart={onStart}/>):null}
  {!compact&&!active&&!offers.length?<Text style={S.mini}>No playable gathering is ready yet. Real organizations must connect and schedule a current public event before you can host one.</Text>:null}
  {!compact&&view.recent.length?<View testID="playable-events-history" style={S.panel}>
   <Text style={S.overline}>THE LAST EVENTS PEOPLE REMEMBER</Text>
   {view.recent.slice(0,7).map(r=><Archive key={r.id} item={r}/>)}
  </View>:null}
  {!compact&&view.ancestors.length?<View testID="playable-events-ancestors" style={S.panel}>
   <Text style={S.overline}>PUBLIC MEMORIES THROUGH GENERATIONS</Text>
   {view.ancestors.slice(0,4).map((x,i)=><View key={x.generation+'-'+i} style={S.archiveRow}>
    <Text style={S.overline}>GEN {x.generation} · {x.name}</Text>
    <Text style={S.description}>{x.note}</Text>
   </View>)}
  </View>:null}
  {!compact?<Text style={S.mini}>The simulation is offline and deterministic. No fictional voters, created money, anonymous NPC relationships or extra randomness.</Text>:null}
 </View>;
}
const S=StyleSheet.create({
 root:{padding:13,borderWidth:1,borderColor:C.line,borderRadius:16,backgroundColor:C.bg,gap:12},
 split:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:7},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:.45,color:C.gold,flexShrink:1},
 title:{fontSize:20,fontWeight:'900',color:C.ink,lineHeight:26},
 corner:{fontSize:10,color:C.mint,fontWeight:'900'},
 description:{fontSize:12,lineHeight:18,color:C.muted,flexShrink:1},
 mini:{fontSize:10,lineHeight:16,color:C.muted,flexShrink:1},
 offer:{borderColor:C.line,borderWidth:1,borderRadius:12,backgroundColor:C.panel,padding:12,gap:10},
 groupName:{fontSize:14,fontWeight:'900',lineHeight:22,color:C.ink,flexShrink:1},
 modeGrid:{flexDirection:'row',flexWrap:'wrap',gap:8},
 mode:{flex:1,flexBasis:125,padding:11,borderColor:'#79978D',borderWidth:1,
  backgroundColor:C.raised,borderRadius:10,gap:6,minHeight:125},
 modeIcon:{fontSize:21,color:C.gold},
 modeTitle:{fontSize:12,fontWeight:'900',color:C.ink,lineHeight:18},
 disabled:{opacity:.4},panel:{padding:11,backgroundColor:C.panel,borderRadius:11,gap:10},
 challenge:{backgroundColor:C.panel,borderWidth:1,borderColor:C.mint,borderRadius:12,padding:12,gap:11},
 headline:{fontSize:17,fontWeight:'900',color:C.ink,lineHeight:25},
 stepTrack:{flexDirection:'row',gap:6},
 step:{height:5,borderRadius:4,flex:1},
 faces:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',
  gap:7,backgroundColor:'#162A2B',borderRadius:11,padding:9},
 person:{flex:1,alignItems:'center',minWidth:0,gap:5},
 avatar:{height:48,width:48,borderRadius:25,backgroundColor:'#507774',
  borderWidth:1,borderColor:C.gold,justifyContent:'center',alignItems:'center'},
 avatarLetters:{fontSize:15,color:C.ink,fontWeight:'900'},
 personName:{fontSize:12,lineHeight:18,color:C.ink,fontWeight:'900',textAlign:'center'},
 vs:{color:C.gold,fontSize:14,fontWeight:'900'},
 ballot:{backgroundColor:'#172C2E',borderRadius:10,padding:11,gap:9},
 meters:{flexDirection:'row',flexWrap:'wrap',gap:9},
 meter:{flex:1,flexBasis:90,minWidth:0,gap:5},
 meterValue:{fontSize:11,color:C.ink,fontWeight:'900'},
 track:{height:8,borderRadius:6,backgroundColor:'#526862',overflow:'hidden'},
 fill:{height:8,borderRadius:6},
 sceneText:{gap:7,padding:11,backgroundColor:'#172D2E',borderRadius:10},
 sceneTitle:{fontSize:16,fontWeight:'900',color:C.ink,lineHeight:23},
 choice:{borderRadius:10,borderColor:'#78998E',borderWidth:1,backgroundColor:C.raised,
  flexDirection:'row',alignItems:'center',padding:10,gap:9,minHeight:55},
 choiceBullet:{width:27,height:27,borderRadius:14,backgroundColor:'#507467',
  justifyContent:'center',alignItems:'center'},
 choiceIndex:{fontSize:12,fontWeight:'900',color:C.ink},
 choiceTitle:{fontSize:12,fontWeight:'900',lineHeight:18,color:C.ink},
 evidence:{backgroundColor:'#172C2E',padding:11,borderRadius:10,gap:7},
 decision:{paddingTop:6,borderTopWidth:1,borderTopColor:C.line,gap:4},
 leave:{alignItems:'center',borderWidth:1,borderColor:C.line,padding:11,borderRadius:9},
 leaveText:{fontSize:11,color:C.muted,fontWeight:'800'},
 archiveRow:{gap:8,paddingTop:9,borderTopWidth:1,borderTopColor:C.line},
 pills:{flexDirection:'row',flexWrap:'wrap',gap:6},
 pill:{backgroundColor:C.raised,color:C.mint,fontSize:10,fontWeight:'800',padding:6,borderRadius:6}
});
