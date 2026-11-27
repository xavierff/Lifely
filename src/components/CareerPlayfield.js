import React,{useEffect,useRef,useState} from 'react';
import {View,Text,Pressable,StyleSheet,Animated,AccessibilityInfo} from 'react-native';
import {useAudioPlayer,setAudioModeAsync} from 'expo-audio';
import {ElectionBoard,MedicalBoard} from './CivicClinicBoards';

const C={ink:'#F6F8EE',muted:'#C0D6CD',lime:'#D0FB93',gold:'#FFE0A2',border:'#4C7065',panel:'#102926'};
const cash=n=>'$'+Math.round(n||0).toLocaleString('en-US');
function Metric({name,value,accent}){return <View style={S.metric}><Text style={S.metricLabel}>{name}</Text><Text style={[S.metricValue,accent&&{color:C.lime}]}>{value}</Text></View>}
function PhasePlans({v,onPlan}){
 if(!v.plan)return null;
 return <View testID="phase-plans" style={S.phaseHeader}><Text style={S.kicker}>{v.type==='sports'?'TACTICAL FORMATION':v.type==='film'?'CREW & PRODUCTION BUDGET':'STAFF ALLOCATION'}</Text><Text style={S.small}>{v.plan.locked?'Plan locked for this phase.':'Optional: select one plan before your first interaction.'}</Text>{v.plan.options.map(p=><Pressable key={p.id} testID={'phase-plan-'+p.id} accessibilityRole="button" accessibilityLabel={p.name+(p.id===v.plan.chosen?', selected':'')} disabled={!p.enabled} accessibilityState={{disabled:!p.enabled}} onPress={()=>onPlan(p.id)} style={[S.planTile,p.id===v.plan.chosen&&{borderColor:C.lime},!p.enabled&&p.id!==v.plan.chosen&&S.disabled]}><Text style={S.directLabel}>{p.id===v.plan.chosen?'✓ ':''}{p.name} · {p.cost?cash(p.cost):'Free'}</Text><Text style={S.small}>{p.detail}</Text></Pressable>)}</View>;
}
function PlayHistory({v}){
 const history=v.playHistory||[];
 return <View testID="playfield-history" style={S.phaseHeader}><Text style={S.kicker}>PROJECT ACTION LOG</Text><View style={S.historyRow}>{Array.from({length:4},(_,stage)=><View key={stage} style={S.historyPhase}><Text style={S.small}>P{stage+1}</Text><View style={S.historyRow}>{[0,1].map(i=>{const x=history.filter(h=>h.stage===stage)[i];return <View key={i} accessibilityLabel={'Phase '+(stage+1)+' action '+(i+1)+': '+(x?x.success?'success':'setback':'not played')} style={[S.historyDot,x&&{backgroundColor:x.success?'#487952':'#875B55'}]}><Text style={S.historyText}>{x?x.success?'✓':'×':'·'}</Text></View>})}</View></View>)}</View></View>;
}
function DirectTiles({v,onPlay,labels,prefix}){
 return <View style={S.directRow}>{v.options.map((o,i)=><Pressable key={i} testID={prefix+'-'+i} accessibilityRole="button" accessibilityLabel={'Direct control: '+o.label} accessibilityState={{disabled:v.remaining===0}} disabled={v.remaining===0} onPress={()=>onPlay(i)} style={({pressed})=>[S.directTile,v.remaining===0&&S.disabled,pressed&&S.pressed]}><Text style={S.directGlyph}>{o.icon}</Text><Text style={S.directLabel}>{labels[i]}</Text>{Number.isInteger(o.chance)?<Text style={S.small}>{o.chance}% chance</Text>:null}</Pressable>)}</View>;
}
function Choice({item,i,disabled,onPlay,testPrefix}){
 return <Pressable testID={testPrefix+'-action-'+i} accessibilityRole="button" accessibilityLabel={item.label+', '+item.note} accessibilityState={{disabled}} disabled={disabled}
  onPress={()=>onPlay(i)} style={({pressed})=>[S.choice,disabled&&S.disabled,pressed&&S.pressed]}>
  <Text style={S.choiceIcon}>{item.icon}</Text><View style={{flex:1,gap:2}}><Text style={S.choiceTitle}>{item.label}</Text><Text style={S.choiceNote}>{item.note}{Number.isInteger(item.chance)?' · '+item.chance+'% success chance':''}</Text></View>
 </Pressable>;
}
function Pitch({v,onPlay}){
 const lanes=['LEFT','CENTER','RIGHT'];
 return <View testID="tactical-sports-match" style={S.board}>
  <View style={S.rowBetween}><Text style={S.kicker}>{v.matchday?'LIVE TACTICAL BOARD':'PRESEASON TACTICS BOARD'}</Text><Text style={S.kicker}>PHASE {v.stage+1} / 4</Text></View>
  <Text style={S.small}>{v.matchday?'TOURNAMENT GOALS':'TRAINING: '+v.trainingHits+' successful drills · goals begin in round 3'}</Text>
  <View style={S.scoreboard}><View style={S.scoreSide}><Text style={S.scoreLabel}>YOUR TEAM</Text><Text style={S.scoreNumber}>{v.ours}</Text></View><Text style={S.scoreDash}>:</Text><View style={S.scoreSide}><Text style={S.scoreLabel} numberOfLines={1}>{v.opponent}</Text><Text style={S.scoreNumber}>{v.theirs}</Text></View></View>
  <View style={S.pitch}>
   <Text style={S.pitchTitle}>OPPONENT'S HALF</Text>
   <View style={S.pitchCenterLine}/>
   <View style={S.lanes}>{lanes.map((lane,i)=><Pressable key={lane} accessibilityRole="button" accessibilityLabel={v.options[i].label+', '+(v.weakLane===i?'scouted weakness':'guarded lane')} accessibilityState={{disabled:v.remaining===0}} disabled={v.remaining===0} onPress={()=>onPlay(i)} style={({pressed})=>[S.lane,i===v.weakLane&&S.laneWeak,pressed&&S.lanePressed]}>
    <Text style={S.laneTop}>{lane}</Text><Text style={S.laneMarker}>{v.weakLane===i?'◎':'●'}</Text><Text style={S.laneArrow}>{v.options[i].icon}</Text><Text style={S.laneBottom}>{v.weakLane===i?'SPACE':'MARKED'}</Text><Text style={S.laneBottom}>{v.options[i].chance}%</Text>
   </Pressable>)}</View>
   <Text style={S.pitchTitle}>YOUR ATTACK</Text>
  </View>
  <View style={S.metricRow}><Metric name="Fatigue" value={v.fatigue+'%'} /><Metric name="Plays left" value={String(v.remaining)} accent/></View>
  <Text style={S.hint}>{v.hint}</Text>
  <Text style={S.instruction}>Tap a lane on the pitch or choose a play below.</Text>
  {v.options.map((o,i)=><Choice key={i} item={o} i={i} disabled={v.remaining===0} onPlay={onPlay} testPrefix="sports"/>)}
 </View>;
}
function FilmSet({v,onPlay}){
 return <View testID="interactive-film-set" style={S.board}>
  <View style={S.rowBetween}><Text style={S.kicker}>DIRECTOR'S MONITOR</Text><Text style={S.kicker}>{['LOOK TEST','CAST SCREEN TEST','PRINCIPAL SHOOT','TRAILER CUT'][v.stage]}</Text></View>
  <View style={S.filmScreen}>
   <View style={S.filmHeader}><Text style={S.filmSlate}>▣  LIFELY STUDIOS</Text><Text style={S.filmSlate}>TAKE {v.takes+1}</Text></View>
   <View style={S.filmAction}><Text style={S.filmLight}>✧</Text><View style={S.filmActor}><Text style={S.filmActorText}>◉</Text><Text style={S.small}>TALENT</Text></View><View style={S.filmCamera}><Text style={S.filmCameraText}>▣</Text><Text style={S.small}>CAM A</Text></View></View>
   <Text style={S.filmCaption}>LIGHTS  ·  CAMERA  ·  ACTION</Text>
  </View>
  <View style={S.metricRow}><Metric name="Usable takes" value={String(v.usable)} accent/><Metric name="Retakes" value={String(v.retakes)}/><Metric name="Total takes" value={String(v.takes)}/></View>
  <Text style={S.kicker}>STORYBOARD COVERAGE</Text>
  <View style={S.storyboard}>{v.scenes.map((name,i)=><Pressable key={name} testID={'film-camera-'+i} accessibilityRole="button" accessibilityLabel={'Film camera: '+name} accessibilityState={{disabled:v.remaining===0}} disabled={v.remaining===0} onPress={()=>onPlay(i)} style={({pressed})=>[S.storyTile,v.coverage[i]>0&&S.storyTileDone,v.remaining===0&&S.disabled,pressed&&S.pressed]}><Text style={S.storySymbol}>{v.options[i].icon}</Text><Text style={S.storyTitle}>{name}</Text><Text style={S.storyCount}>{v.coverage[i]} usable · {v.options[i].chance}%</Text></Pressable>)}</View><Text style={S.small}>Tap a camera setup to shoot a take.</Text>
  <Text style={S.hint}>{v.hint}</Text>
  {v.options.map((o,i)=><Choice key={i} item={o} i={i} disabled={v.remaining===0} onPlay={onPlay} testPrefix="film"/>)}
 </View>;
}
function BusinessDesk({v,onPlay}){
 const highest=Math.max(100,...v.trend);
 return <View testID="business-management-dashboard" style={S.board}>
  <View style={S.rowBetween}><Text style={S.kicker}>OPERATIONS LIVEBOARD</Text><Text style={S.kicker}>SPRINT {v.stage+1} / 4</Text></View>
  <View style={S.metricRow}><Metric name="Customer interest" value={v.customers+'/100'} accent/><Metric name="Loyalty" value={v.loyalty+'/100'}/><Metric name="Projected orders" value={String(v.orders)}/></View>
  <View style={S.chart}>
   <View style={S.rowBetween}><Text style={S.chartHeading}>CUSTOMER INTEREST TREND</Text><Text style={S.small}>planning simulation</Text></View>
   <View style={S.bars}>{v.trend.map((value,i)=><View key={i} style={S.barSlot}><View accessibilityLabel={'Period '+(i+1)+': '+value} style={[S.bar,{height:Math.max(8,Math.round(value/highest*94)),backgroundColor:i===v.trend.length-1?C.lime:'#548875'}]}/></View>)}</View>
   <View style={S.rowBetween}><Text style={S.small}>Demand baseline: {v.baseDemand}/100</Text><Text style={S.small}>{v.trend.length} snapshots</Text></View>
  </View>
  <View style={S.metricRow}><Metric name="Estimated launch sales" value={cash(v.forecast)}/><Metric name="Available personal cash" value={cash(v.actualCash)}/></View>
  <Text style={S.kicker}>OPERATING PRIORITIES · TAP TO ACT</Text><DirectTiles v={v} onPlay={onPlay} labels={['Product','Team','Audience']} prefix="business-control"/><Text style={S.hint}>{v.hint}</Text>
  {v.options.map((o,i)=><Choice key={i} item={o} i={i} disabled={v.remaining===0} onPlay={onPlay} testPrefix="business"/>)}
 </View>;
}
export default function CareerPlayfield({view,onPlay,onPlan,soundEnabled=true}){
 const tap=useAudioPlayer(require('../../assets/sfx/tap.wav'));
 const win=useAudioPlayer(require('../../assets/sfx/success.wav'));
 const miss=useAudioPlayer(require('../../assets/sfx/setback.wav'));
 const pulse=useRef(new Animated.Value(1)).current;
 const lastKey=view?.last?view.type+':'+view.stage+':'+view.plays:null;
 const previous=useRef(lastKey);
 const [reducedMotion,setReducedMotion]=useState(false);
 useEffect(()=>{setAudioModeAsync({playsInSilentMode:true,shouldPlayInBackground:false}).catch(()=>{});
  AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion).catch(()=>{});
  const sub=AccessibilityInfo.addEventListener?.('reduceMotionChanged',setReducedMotion);
  return()=>sub?.remove?.();
 },[]);
 useEffect(()=>{
  if(lastKey&&lastKey!==previous.current){
   if(!reducedMotion){pulse.setValue(.92);Animated.spring(pulse,{toValue:1,friction:5,tension:110,useNativeDriver:true}).start();}
   if(soundEnabled){const player=view.last?.success?win:miss;player.seekTo(0).then(()=>player.play()).catch(()=>{});}
  }
  previous.current=lastKey;
 },[lastKey,soundEnabled,reducedMotion]);
 function interact(index){
  if(soundEnabled){tap.seekTo(0).then(()=>tap.play()).catch(()=>{});}
  onPlay(index);
 }
 if(!view)return null;
 return <View style={S.container}>
  <View style={S.phaseHeader}><Text style={S.kicker}>PROJECT PROGRESS · PHASE {view.stage+1}/4</Text><View accessibilityRole="progressbar" accessibilityLabel="Project phases completed" accessibilityValue={{min:0,max:4,now:view.stage}} style={S.phaseTrack}>{[0,1,2,3].map(i=><View key={i} style={[S.phaseSegment,i<view.stage&&S.phaseDone,i===view.stage&&S.phaseCurrent]}/>)}</View><Text style={S.small}>{view.remaining===0?'Ready for the next story decision':view.remaining+' interactions remaining in this phase'}</Text></View>
  <PhasePlans v={view} onPlan={onPlan}/>{view.type==='sports'?<Pitch v={view} onPlay={interact}/>:view.type==='film'?<FilmSet v={view} onPlay={interact}/>:view.type==='business'?<BusinessDesk v={view} onPlay={interact}/>:view.type==='election'?<ElectionBoard v={view} onPlay={interact}/>:view.type==='medical'?<MedicalBoard v={view} onPlay={interact}/>:null}
  <PlayHistory v={view}/><View style={S.status}><Text style={S.statusText}>{view.played} / {view.maxPerStage} interactions this phase</Text><Text style={S.statusText}>{view.remaining===0?'PHASE READY':'PLAY TO IMPROVE YOUR RESULT'}</Text></View>
  {view.last?<Animated.View testID="playfield-feedback" accessibilityLiveRegion="polite" style={[S.feedback,{transform:[{scale:pulse}]}]}><Text style={S.feedbackTitle}>{view.last.success?'✓ SUCCESSFUL ACTION':'↻ ANOTHER APPROACH NEEDED'}</Text><Text style={S.feedbackBody}>{view.last.description}</Text>{view.last.reaction?<Text style={S.reactionText}>{view.last.reaction.person}: {view.last.reaction.text.replace(view.last.reaction.person+' ','')}</Text>:null}</Animated.View>:null}
  {view.remaining===0?<Text style={S.done}>Now make the story decision below to move to the next phase.</Text>:null}
 </View>;
}
const S=StyleSheet.create({
 planTile:{padding:9,minHeight:48,borderWidth:1,borderColor:C.border,borderRadius:8,gap:4,backgroundColor:'#31544A'},
 historyRow:{flexDirection:'row',gap:4,flexWrap:'wrap'},historyPhase:{flex:1,minWidth:54,gap:4},historyDot:{width:22,height:24,borderRadius:5,backgroundColor:'#3D5750',alignItems:'center',justifyContent:'center'},historyText:{fontSize:14,fontWeight:'900',color:C.ink},directRow:{flexDirection:'row',gap:5},directTile:{flex:1,minWidth:0,minHeight:76,padding:6,gap:4,alignItems:'center',justifyContent:'center',borderRadius:9,backgroundColor:'#31544A',borderWidth:1,borderColor:C.border},directGlyph:{fontSize:22,color:C.gold},directLabel:{fontSize:11,fontWeight:'800',color:C.ink,textAlign:'center'},
 phaseHeader:{padding:10,gap:6,borderRadius:11,backgroundColor:'#213E34'},phaseTrack:{flexDirection:'row',gap:5},phaseSegment:{flex:1,height:8,borderRadius:4,backgroundColor:'#49675F'},phaseDone:{backgroundColor:C.lime},phaseCurrent:{backgroundColor:C.gold},container:{gap:9,marginVertical:3},board:{padding:12,borderRadius:17,backgroundColor:C.panel,borderWidth:1,borderColor:C.border,gap:11},
 rowBetween:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:5},
 kicker:{color:C.gold,fontSize:10,letterSpacing:1,fontWeight:'800',flexShrink:1},
 scoreboard:{backgroundColor:'#0B1B1C',borderRadius:12,padding:12,flexDirection:'row',alignItems:'center',justifyContent:'space-evenly'},
 scoreSide:{alignItems:'center',minWidth:0,flex:1,gap:2},
 scoreLabel:{fontSize:10,color:C.muted,fontWeight:'800',textAlign:'center'},
 scoreNumber:{fontSize:30,fontWeight:'900',color:C.ink},
 scoreDash:{fontSize:23,color:C.gold,fontWeight:'900',paddingHorizontal:10},
 pitch:{borderRadius:12,backgroundColor:'#206342',borderColor:'#68B08A',borderWidth:2,paddingVertical:11,paddingHorizontal:7,gap:10},
 pitchTitle:{fontSize:10,letterSpacing:1,color:'#E6FFF1',textAlign:'center',fontWeight:'900'},
 pitchCenterLine:{height:1,backgroundColor:'#89C3A2'},
 lanes:{flexDirection:'row',gap:5,minHeight:148},
 lane:{flex:1,backgroundColor:'#2B7951',borderColor:'#8DB59E',borderWidth:1,borderRadius:9,alignItems:'center',justifyContent:'space-evenly',paddingHorizontal:2,paddingVertical:8,minWidth:0},
 laneWeak:{backgroundColor:'#3F8B56',borderColor:C.lime,borderWidth:2},
 lanePressed:{opacity:.65},
 laneTop:{color:'#F0FFF2',fontWeight:'800',fontSize:10},
 laneMarker:{color:C.gold,fontSize:21},
 laneArrow:{color:'#FFF',fontSize:27,fontWeight:'900'},
 laneBottom:{color:'#E9F7DF',fontWeight:'800',fontSize:9},
 metricRow:{flexDirection:'row',flexWrap:'wrap',gap:7},
 metric:{flexGrow:1,flexBasis:95,backgroundColor:'#1C3832',borderRadius:10,padding:9,alignItems:'center',gap:3,minWidth:0},
 metricLabel:{fontSize:10,color:C.muted,textAlign:'center'},
 metricValue:{fontWeight:'900',fontSize:17,color:C.ink,textAlign:'center'},
 hint:{fontSize:12,color:C.muted,lineHeight:19},
 instruction:{color:C.gold,fontSize:11,fontWeight:'700'},
 choice:{minHeight:56,flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10,paddingHorizontal:12,borderWidth:1,borderColor:C.border,borderRadius:11,backgroundColor:'#1A3831'},
 choiceIcon:{fontSize:19,color:C.lime,width:24,textAlign:'center'},choiceTitle:{color:C.ink,fontSize:13,fontWeight:'800'},choiceNote:{color:C.muted,fontSize:11,lineHeight:16},
 disabled:{opacity:.40},pressed:{opacity:.75},
 filmScreen:{backgroundColor:'#171C22',borderRadius:11,overflow:'hidden',borderWidth:1,borderColor:'#55606A',padding:11,gap:8},
 filmHeader:{flexDirection:'row',justifyContent:'space-between',backgroundColor:'#333944',padding:7,borderRadius:5},
 filmSlate:{color:C.gold,fontWeight:'900',fontSize:10,letterSpacing:.6},
 filmAction:{height:105,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',paddingHorizontal:14},
 filmLight:{fontSize:32,color:C.gold,alignSelf:'flex-start'},
 filmActor:{alignItems:'center',gap:1},filmActorText:{fontSize:48,color:C.ink},
 filmCamera:{alignItems:'center',gap:1},filmCameraText:{fontSize:39,color:C.lime},
 filmCaption:{color:'#D0E9DA',fontSize:10,fontWeight:'800',textAlign:'center',letterSpacing:1.1},
 storyboard:{flexDirection:'row',gap:6},
 storyTile:{flex:1,minWidth:0,backgroundColor:'#202D31',padding:7,borderRadius:9,alignItems:'center',gap:5,borderWidth:1,borderColor:'#54645E'},
 storyTileDone:{borderColor:C.lime,backgroundColor:'#2B4937'},
 storySymbol:{fontSize:20,color:C.lime},storyTitle:{fontSize:10,textAlign:'center',color:C.ink,fontWeight:'800'},storyCount:{fontSize:10,color:C.muted},
 chart:{borderRadius:10,backgroundColor:'#0D2225',padding:11,gap:8},
 chartHeading:{fontSize:10,color:C.gold,fontWeight:'800'},
 bars:{height:103,borderBottomColor:'#537267',borderBottomWidth:1,flexDirection:'row',alignItems:'flex-end',justifyContent:'space-around',gap:6},
 barSlot:{flex:1,alignItems:'center',justifyContent:'flex-end',height:'100%'},
 bar:{width:'70%',minWidth:8,maxWidth:38,borderTopLeftRadius:5,borderTopRightRadius:5},
 small:{fontSize:10,color:C.muted},
 status:{flexDirection:'row',justifyContent:'space-between',flexWrap:'wrap',gap:5},
 statusText:{fontSize:10,color:C.muted,fontWeight:'700'},
 feedback:{backgroundColor:'#2A4639',padding:11,borderRadius:11,borderColor:'#80AD85',borderWidth:1,gap:4},
 feedbackTitle:{color:C.lime,fontSize:11,fontWeight:'900'},feedbackBody:{color:C.ink,fontSize:13,lineHeight:19},reactionText:{fontSize:12,color:C.gold,lineHeight:18,borderTopWidth:1,borderColor:'#537965',paddingTop:7},
 done:{color:C.gold,fontSize:12,fontWeight:'800',textAlign:'center'}
});
