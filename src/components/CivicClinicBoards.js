import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const C={ink:'#F8F9F0',muted:'#AAC8C1',lime:'#D1FA9A',gold:'#F8D999',line:'#426659',purple:'#D0B6FF'};
function Meter({label,value,color=C.lime}){
 const v=Math.max(0,Math.min(100,value));
 return <View style={S.meter}><View style={S.between}><Text style={S.meterName}>{label}</Text><Text style={S.meterNumber}>{v}/100</Text></View><View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{min:0,max:100,now:v}} style={S.track}><View style={[S.fill,{width:v+'%',backgroundColor:color}]}/></View></View>;
}
function Option({option,i,remaining,onPlay,prefix}){
 return <Pressable testID={prefix+'-action-'+i} accessibilityRole="button" accessibilityLabel={option.label+', '+option.note} accessibilityState={{disabled:remaining===0}} disabled={remaining===0} onPress={()=>onPlay(i)} style={({pressed})=>[S.option,remaining===0&&S.disabled,pressed&&S.pressed]}><Text style={S.optionIcon}>{option.icon}</Text><View style={{flex:1,gap:3}}><Text style={S.optionTitle}>{option.label}</Text><Text style={S.optionNote}>{option.note}</Text></View></Pressable>;
}
export function ElectionBoard({v,onPlay}){
 return <View testID="interactive-election-debate" style={[S.board,{borderColor:'#73617B'}]}>
  <View style={S.between}><Text style={S.kicker}>FICTIONAL CIVIC DEBATE</Text><Text style={S.kicker}>ROUND {v.stage+1}/4</Text></View>
  <View style={S.debateStage}>
   <View style={S.stageLights}><Text style={S.stageLight}>●</Text><Text style={S.stageLight}>●</Text><Text style={S.stageLight}>●</Text><Text style={S.stageLight}>●</Text></View>
   <View style={S.podiumRow}>
    <View style={S.podiumWrap}><View style={[S.person,{backgroundColor:'#376F67'}]}><Text style={S.personText}>◉</Text></View><View style={[S.podium,{backgroundColor:'#315F60'}]}><Text style={S.podiumTitle}>YOU</Text><Text style={S.podiumSubtitle}>● ON AIR</Text></View></View>
    <View style={S.micArea}><Text style={S.micSymbol}>♢</Text><Text style={S.micNote}>LIVE</Text></View>
    <View style={S.podiumWrap}><View style={[S.person,{backgroundColor:'#70506D'}]}><Text style={S.personText}>◉</Text></View><View style={[S.podium,{backgroundColor:'#6A455C'}]}><Text numberOfLines={1} style={S.podiumTitle}>{v.rival}</Text><Text style={S.podiumSubtitle}>CHALLENGER</Text></View></View>
   </View>
  </View>
  <View style={S.poll}><View style={S.between}><Text style={S.kicker}>SUPPORT SNAPSHOT · FICTIONAL</Text><Text style={S.meterNumber}>{v.poll}/100</Text></View><View style={S.pollTrack}><View style={[S.pollPart,{width:v.poll+'%',backgroundColor:C.lime}]}/><View style={[S.pollPart,{flex:1,backgroundColor:'#967C9B'}]}/></View><View style={S.between}><Text style={S.meterName}>Your momentum</Text><Text style={S.meterName}>Rival approval {v.rivalApproval}/100</Text></View></View>
  <View style={S.meterGrid}><Meter label="Credibility" value={v.credibility}/><Meter label="Community trust" value={v.community} color={C.purple}/></View>
  <View style={S.prompt}><Text style={S.kicker}>MODERATOR · {v.topic.toUpperCase()}</Text><Text style={S.question}>{v.question}</Text></View>
  <Text style={S.hint}>{v.hint}</Text>
  <Text style={S.available}>{v.remaining?('Choose your response · '+v.remaining+' left this round'):'Broadcast complete · continue the story below'}</Text>
  {v.options.map((o,i)=><Option key={i} option={o} i={i} remaining={v.remaining} onPlay={onPlay} prefix="election"/>)}
 </View>;
}
const allSteps=['Assessment','Consent','Escalation','Follow-up'];
export function MedicalBoard({v,onPlay}){
 return <View testID="interactive-medical-case" style={[S.board,{borderColor:'#4A7892'}]}>
  <View style={S.between}><Text style={S.kicker}>FICTIONAL CLINICAL CASE BOARD</Text><Text style={S.kicker}>{v.caseId}</Text></View>
  <View style={S.patient}><View style={S.patientBadge}><Text style={S.patientSymbol}>♡</Text></View><View style={{flex:1,gap:4}}><Text style={S.patientLabel}>CARE EPISODE · SIMULATION ONLY</Text><Text style={S.patientHeading}>{v.topic}</Text><Text style={S.patientLabel}>Safety, consent and communication—not diagnosis</Text></View></View>
  <View style={S.steps}>{allSteps.map((st,i)=><View key={st} style={[S.step,i===v.stage&&S.stepActive,i<v.stage&&S.stepDone]}><Text style={[S.stepIndex,i===v.stage&&{color:C.lime}]}>{i<v.stage?'✓':i+1}</Text><Text numberOfLines={2} style={S.stepTitle}>{st}</Text></View>)}</View>
  <View style={S.meterGrid}><Meter label="Safety & records" value={v.safety}/><Meter label="Informed consent" value={v.consent} color={C.gold}/><Meter label="Team coordination" value={v.coordination} color={C.purple}/></View>
  <View style={S.caseNote}><Text style={S.kicker}>PATIENT-CARE HANDOFF</Text><Text style={S.question}>{v.question}</Text></View>
  <View style={S.between}><Text style={S.meterName}>Documented reviews: {v.reviews}</Text><Text style={S.meterName}>Follow-ups: {v.followup}</Text></View>
  <Text style={S.available}>{v.remaining?('Coordinate the next action · '+v.remaining+' left this phase'):'Review complete · continue the story below'}</Text>
  {v.options.map((o,i)=><Option key={i} option={o} i={i} remaining={v.remaining} onPlay={onPlay} prefix="medical"/>)}
  <Text style={S.disclaimer}>{v.hint}</Text>
 </View>;
}
const S=StyleSheet.create({
 board:{borderWidth:1,borderRadius:17,backgroundColor:'#11282A',padding:12,gap:12},
 between:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:7},
 kicker:{fontSize:10,color:C.gold,fontWeight:'900',letterSpacing:.75,flexShrink:1},
 debateStage:{borderRadius:12,borderWidth:1,borderColor:'#795F89',backgroundColor:'#242036',paddingHorizontal:12,paddingVertical:9,gap:6},
 stageLights:{flexDirection:'row',justifyContent:'space-around'},stageLight:{fontSize:11,color:C.gold},
 podiumRow:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-evenly',minHeight:127},
 podiumWrap:{flex:1,alignItems:'center',gap:0,minWidth:0},
 person:{width:47,height:47,borderRadius:23,justifyContent:'center',alignItems:'center'},personText:{fontSize:29,color:C.ink},
 podium:{minHeight:58,alignSelf:'stretch',marginHorizontal:2,borderTopWidth:3,borderColor:'#CCE7D6',borderTopLeftRadius:8,borderTopRightRadius:8,paddingVertical:8,paddingHorizontal:5,gap:4,justifyContent:'center'},
 podiumTitle:{fontSize:12,color:C.ink,textAlign:'center',fontWeight:'900'},podiumSubtitle:{fontSize:9,color:'#D0E4E0',textAlign:'center',fontWeight:'700'},
 micArea:{alignSelf:'center',alignItems:'center',gap:1,width:42},micSymbol:{fontSize:31,color:C.gold},micNote:{fontSize:10,fontWeight:'900',color:C.gold},
 poll:{backgroundColor:'#1A3535',padding:10,borderRadius:10,gap:7},
 pollTrack:{height:14,borderRadius:6,overflow:'hidden',flexDirection:'row'},pollPart:{height:'100%'},
 meterGrid:{flexDirection:'row',flexWrap:'wrap',gap:7},
 meter:{flexGrow:1,flexBasis:112,minWidth:0,backgroundColor:'#1A3535',borderRadius:9,padding:9,gap:6},
 meterName:{color:C.muted,fontSize:11},meterNumber:{fontSize:11,fontWeight:'900',color:C.ink},
 track:{height:7,backgroundColor:'#405655',borderRadius:7,overflow:'hidden'},fill:{height:7,borderRadius:7},
 prompt:{backgroundColor:'#262638',padding:13,borderRadius:11,gap:8,borderLeftWidth:3,borderColor:'#C4B4F2'},
 question:{color:C.ink,fontSize:15,lineHeight:22,fontWeight:'600'},
 hint:{fontSize:12,color:C.muted,lineHeight:18},
 available:{fontSize:11,color:C.gold,fontWeight:'900'},
 option:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'#213C39',borderWidth:1,borderColor:'#4F796E',padding:11,borderRadius:10,minHeight:58},
 optionIcon:{fontSize:21,color:C.lime,width:24,textAlign:'center'},optionTitle:{color:C.ink,fontSize:13,fontWeight:'800'},optionNote:{fontSize:11,color:C.muted,lineHeight:16},
 pressed:{opacity:.7},disabled:{opacity:.4},
 patient:{flexDirection:'row',gap:12,alignItems:'center',backgroundColor:'#203C49',borderRadius:11,padding:12},
 patientBadge:{width:45,height:45,backgroundColor:'#2F6472',borderRadius:23,alignItems:'center',justifyContent:'center'},patientSymbol:{fontSize:28,color:C.ink},
 patientLabel:{fontSize:10,color:C.muted,fontWeight:'700'},patientHeading:{fontSize:17,fontWeight:'900',color:C.ink},
 steps:{flexDirection:'row',gap:4},step:{flex:1,minWidth:0,paddingVertical:8,paddingHorizontal:2,alignItems:'center',borderRadius:7,backgroundColor:'#213A40',gap:4},
 stepDone:{backgroundColor:'#245E4E'},stepActive:{backgroundColor:'#355F69',borderWidth:1,borderColor:C.lime},
 stepIndex:{fontWeight:'900',fontSize:13,color:C.muted},stepTitle:{fontSize:9,fontWeight:'800',color:C.ink,textAlign:'center'},
 caseNote:{padding:13,backgroundColor:'#1B3440',borderRadius:10,borderLeftWidth:3,borderColor:'#82C7DF',gap:7},
 disclaimer:{fontSize:11,color:C.muted,lineHeight:16,fontStyle:'italic'}
});
