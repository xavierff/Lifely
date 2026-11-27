import React,{useEffect,useRef,useState} from 'react';
import {View,Text,Pressable,Animated,AccessibilityInfo,StyleSheet} from 'react-native';
import {useAudioPlayer,setAudioModeAsync} from 'expo-audio';
const P={bg:'#162B32',panel:'#244148',cream:'#FFF4DD',muted:'#BDD5D2',green:'#BAEFA6',gold:'#FFE1A2',red:'#F4B4AD',track:'#55757A',blue:'#BDE3FC'};
const clamp=x=>Math.max(0,Math.min(100,Number(x)||0));
const choiceIcons=['◈','◇','◆'];
function Meter({label,value,color=P.green}){
 return <View style={S.meter}><View style={S.split}><Text style={S.small}>{label}</Text><Text style={S.meterNumber}>{Math.round(value||0)}</Text></View>
  <View style={S.track}><View style={[S.fill,{width:clamp(value)+'%',backgroundColor:color}]}/></View></View>;
}
function Option({item,onPress}){
 return <Pressable testID={'hobby-choice-'+item.index} accessibilityRole="button" accessibilityLabel={item.label+', '+item.note}
  onPress={()=>onPress(item.index)} style={({pressed})=>[S.option,pressed&&{opacity:.7}]}>
  <View style={S.optionIcon}><Text style={S.optionGlyph}>{choiceIcons[item.index]}</Text></View>
  <View style={{flex:1,gap:3}}><Text style={S.optionTitle}>{item.label}</Text><Text style={S.small}>{item.note}</Text></View>
 </Pressable>;
}
export default function HobbyCircuitBoard({view,onChoose,soundEnabled=true}){
 const tap=useAudioPlayer(require('../../assets/sfx/tap.wav'));
 const good=useAudioPlayer(require('../../assets/sfx/success.wav'));
 const bad=useAudioPlayer(require('../../assets/sfx/setback.wav'));
 const [reduced,setReduced]=useState(false),anim=useRef(new Animated.Value(1)).current;
 const event=view?.last?.stage,prior=useRef(event);
 useEffect(()=>{setAudioModeAsync({playsInSilentMode:true,shouldPlayInBackground:false}).catch(()=>{});
  AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(()=>{});
  const sub=AccessibilityInfo.addEventListener?.('reduceMotionChanged',setReduced);return()=>sub?.remove?.();
 },[]);
 useEffect(()=>{
  if(event!==undefined&&event!==prior.current){
   if(!reduced){anim.setValue(.97);Animated.spring(anim,{toValue:1,useNativeDriver:true,tension:110,friction:7}).start();}
   if(soundEnabled){const p=view.last.success?good:bad;p.seekTo(0).then(()=>p.play()).catch(()=>{});}
  }
  prior.current=event;
 },[event,reduced,soundEnabled]);
 if(!view)return null;
 const decide=i=>{if(soundEnabled)tap.seekTo(0).then(()=>tap.play()).catch(()=>{});onChoose(i);};
 return <View testID="hobby-circuit-board" style={S.board}>
  <View style={S.split}><Text style={S.topline}>{view.mode==='contest'?'LIVE CONTEST':'TRAINING SESSION'}</Text><Text style={S.topline}>{view.league.toUpperCase()} CIRCUIT</Text></View>
  <View style={S.arena}>
   <View style={S.competitor}><Text style={S.heroGlyph}>{view.glyph}</Text><Text style={S.competitorLabel}>YOUR SCORE</Text><Text style={S.bigScore}>{view.score}<Text style={S.scoreSmall}> / {view.round-1}</Text></Text></View>
   <View style={S.versus}><Text style={S.versusText}>VS</Text><Text style={S.tiny}>{view.mode==='practice'?'LEARN':'COMPETE'}</Text></View>
   <View style={S.competitor}><View style={S.rivalAvatar}><Text style={S.rivalInitials}>{view.opponent.split(' ').slice(0,2).map(n=>n[0]).join('')}</Text></View><Text numberOfLines={2} style={S.opponentName}>{view.opponent}</Text><Text style={S.tiny}>RATING {view.opponentRating}</Text></View>
  </View>
  <View style={S.split}><Text style={S.topline}>ROUND {view.round} OF {view.total}: {view.phase.toUpperCase()}</Text><Text style={S.topline}>MASTERY {view.mastery}/100</Text></View>
  <View accessibilityRole="progressbar" accessibilityLabel="Hobby rounds completed" accessibilityValue={{min:0,max:view.total,now:view.round-1}} style={S.progress}>{Array.from({length:view.total},(_,i)=><View key={i} style={[S.progressSegment,i<view.round-1&&S.progressDone,i===view.round-1&&{backgroundColor:P.gold}]}/>)}</View>
  <View testID="hobby-round-history" style={{flexDirection:'row',gap:5}}>{Array.from({length:view.total},(_,i)=>{const h=view.choices[i];return <View key={i} style={{flex:1,minWidth:0,padding:7,gap:3,borderRadius:8,backgroundColor:h?h.success?'#355A42':'#6A4645':'#244148',borderWidth:1,borderColor:i===view.round-1?P.gold:P.track}}><Text style={S.tiny}>ROUND {i+1}</Text><Text style={S.small}>{h?h.success?'✓ Success':'× Setback':i===view.round-1?'Current':'Upcoming'}</Text></View>})}</View><View style={S.meters}><Meter label="Focus" value={view.meters.focus}/><Meter label="Momentum" value={view.meters.momentum} color={P.gold}/></View>
  <Animated.View style={[S.cue,{transform:[{scale:anim}]}]}>
   <Text style={S.cueLabel}>READ THE SITUATION</Text>
   <Text style={S.cueText}>{view.prompt}</Text>
   <Text style={S.small}>{view.hint}</Text>
  </Animated.View>
  {view.options.map(item=><Option item={item} onPress={decide} key={item.index}/>)}
  {view.last?<View testID="hobby-round-feedback" accessibilityLiveRegion="polite" style={S.feedback}>
    <Text style={S.cueLabel}>{view.last.success?'YOU GAINED GROUND':'AN OPPORTUNITY TO LEARN'}</Text>
    <Text style={S.small}>{view.last.reaction}</Text>
    <Text style={S.small}>Lesson: {view.last.lesson}</Text>
   </View>:null}
  {view.observer?<Text style={S.spectator}>Watching today: {view.observer}. Your choices may affect this connection.</Text>:null}
 </View>;
}
export function HobbyLeagueOverview({summary,commands,onAction}){
 const [selected,setSelected]=useState(null),[fullHistory,setFullHistory]=useState(false);
 const items=summary.profiles||[],active=items.find(x=>x.id===selected)||items[0];
 const actions=(commands||[]).filter(c=>c.id.startsWith('hobby:start:'+active?.id+':'));
 return <View testID="hobby-league-overview" style={S.overview}>
  <View style={S.split}><Text style={S.topline}>YOUR PLAYABLE HOBBIES</Text><Text style={S.topline}>{summary.playedThisAge}/2 THIS YEAR</Text></View>
  <Text style={S.headline}>Make ordinary years unforgettable.</Text>
  <Text style={S.small}>Pick a hobby to practice or challenge recurring rivals. Read each situation and make tactical decisions. Mastery, titles and opponents persist for life.</Text>
  <View style={S.hobbyGrid}>{items.map(item=><Pressable key={item.id} testID={'hobby-tile-'+item.id} accessibilityRole="button" accessibilityLabel={'Select '+item.name+', '+item.league+' rank'} accessibilityState={{selected:active?.id===item.id}} onPress={()=>setSelected(item.id)}
   style={[S.hobbyTile,active?.id===item.id&&S.tileActive]}>
   <Text style={S.tileGlyph}>{item.glyph}</Text><Text numberOfLines={2} style={S.tileTitle}>{item.name}</Text>
   <Text style={S.tileNote}>{item.league}</Text><View style={S.tileTrack}><View style={[S.tileFill,{width:item.mastery+'%'}]}/></View>
  </Pressable>)}</View>
  {active?<View testID="hobby-profile" style={S.details}>
   <View style={S.split}><Text style={S.topline}>{active.glyph} {active.name.toUpperCase()}</Text><Text style={S.topline}>{active.league.toUpperCase()}</Text></View>
   <Meter label="Mastery" value={active.mastery}/>
   <View style={S.stats}>
    <View style={S.statBox}><Text style={S.statValue}>{active.wins}</Text><Text style={S.tiny}>WINS</Text></View>
    <View style={S.statBox}><Text style={S.statValue}>{active.trophies}</Text><Text style={S.tiny}>TROPHIES</Text></View>
    <View style={S.statBox}><Text style={S.statValue}>{active.streak}</Text><Text style={S.tiny}>STREAK</Text></View>
    <View style={S.statBox}><Text style={S.statValue}>{active.points}</Text><Text style={S.tiny}>POINTS</Text></View>
   </View>
   {active.rivals.length?<><Text style={S.topline}>OPPONENTS WHO KEEP IMPROVING</Text>{active.rivals.map(r=><View key={r.id} style={S.rivalLine}><View style={{flex:1,gap:3}}><Text style={S.rivalName}>{r.name}</Text><Text style={S.small}>{r.encounters} encounters · {r.wins} wins against you · Respect {r.respect}</Text></View><Text style={S.rating}>{r.rating}</Text></View>)}</>:null}
   {actions.length?actions.map(c=><Pressable key={c.id} testID={'hobby-action-'+c.id.replaceAll(':','-')} accessibilityRole="button" accessibilityLabel={c.label+', '+c.detail} accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled} onPress={()=>onAction(c.id)}
    style={({pressed})=>[S.action,!c.enabled&&{opacity:.35},pressed&&{opacity:.75}]}>
    <Text style={S.actionTitle}>{c.label}</Text><Text style={S.small}>{c.detail}</Text>
   </Pressable>):<Text style={S.small}>You can begin a hobby after resolving the current decision.</Text>}
   {active.lastResult?<View testID="hobby-last-result" style={S.result}><Text style={S.topline}>YOUR MOST RECENT SESSION</Text><Text style={S.resultTitle}>{active.lastResult.status.toUpperCase()} · {active.lastResult.score}/3</Text><Text style={S.small}>Age {active.lastResult.age} · {active.lastResult.opponent} · {active.lastResult.league}{active.lastResult.reward?' · $'+active.lastResult.reward+' prize':''}</Text>
    {active.lastResult.lessons?.slice(-2).map((l,i)=><Text key={i} style={S.small}>{l.correct?'✓':'•'} {l.lesson}</Text>)}
   </View>:null}
  </View>:null}
  {summary.hallOfFame?.length?<View style={S.records}><Text style={S.topline}>YOUR TROPHY COLLECTION</Text>{summary.hallOfFame.slice(0,4).map((t,i)=><Text style={S.small} key={i}>★ Age {t.age} · {t.title}</Text>)}</View>:null}
  {summary.history?.length?<View style={S.records}><Text style={S.topline}>YOUR HOBBY CHRONICLE</Text>{summary.history.slice(0,fullHistory?15:3).map((t,i)=><Text style={S.small} key={i}>Age {t.age} · {t.hobbyName} · {t.mode} · {t.status} · {t.score}/3</Text>)}
    {summary.history.length>3?<Pressable accessibilityRole="button" onPress={()=>setFullHistory(!fullHistory)}><Text style={S.linkText}>{fullHistory?'Show recent':'See more recorded sessions'}</Text></Pressable>:null}
   </View>:null}
 </View>;
}
const S=StyleSheet.create({
 board:{gap:10},topline:{fontSize:10,fontWeight:'900',color:P.gold,letterSpacing:.5,flexShrink:1},split:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8},
 arena:{flexDirection:'row',gap:7,alignItems:'center',borderWidth:1,borderColor:'#54837B',borderRadius:14,padding:12,backgroundColor:P.bg},
 competitor:{flex:1,alignItems:'center',gap:5,minWidth:0},heroGlyph:{fontSize:39,color:P.cream},competitorLabel:{fontSize:10,color:P.muted,fontWeight:'800'},
 bigScore:{fontSize:31,color:P.cream,fontWeight:'900'},scoreSmall:{fontSize:13,color:P.muted},
 versus:{alignItems:'center',justifyContent:'center',gap:3},versusText:{fontSize:19,fontWeight:'900',color:P.gold},tiny:{fontSize:9,color:P.muted,fontWeight:'800'},
 rivalAvatar:{height:46,width:46,borderRadius:23,backgroundColor:'#4D7C91',justifyContent:'center',alignItems:'center'},
 rivalInitials:{fontSize:17,fontWeight:'900',color:P.cream},opponentName:{textAlign:'center',fontSize:12,color:P.cream,fontWeight:'800'},
 progress:{flexDirection:'row',gap:5},progressSegment:{height:8,backgroundColor:'#47676A',borderRadius:8,flex:1},progressDone:{backgroundColor:P.gold},
 meters:{flexDirection:'row',gap:8,flexWrap:'wrap'},meter:{flex:1,flexBasis:100,backgroundColor:P.panel,padding:9,borderRadius:10,gap:5},
 small:{fontSize:11,lineHeight:17,color:P.muted},meterNumber:{fontSize:12,fontWeight:'900',color:P.cream},
 track:{height:7,borderRadius:6,backgroundColor:P.track,overflow:'hidden'},fill:{height:7,borderRadius:6},
 cue:{borderRadius:11,padding:12,gap:9,backgroundColor:'#314851',borderLeftColor:P.gold,borderLeftWidth:3},
 cueLabel:{fontSize:10,color:P.gold,fontWeight:'900'},cueText:{fontSize:15,lineHeight:23,color:P.cream,fontWeight:'700'},
 option:{borderWidth:1,borderColor:'#648A84',borderRadius:10,backgroundColor:'#29454A',padding:11,minHeight:52,flexDirection:'row',gap:9,alignItems:'center'},
 optionIcon:{height:31,width:31,borderRadius:8,alignItems:'center',justifyContent:'center',backgroundColor:'#517D72'},
 optionGlyph:{fontSize:17,color:P.cream},optionTitle:{fontSize:12,fontWeight:'900',color:P.cream},
 feedback:{padding:11,backgroundColor:'#324C44',borderWidth:1,borderColor:'#7CAC83',borderRadius:9,gap:6},
 spectator:{fontSize:11,color:P.blue,textAlign:'center'},
 overview:{gap:12,backgroundColor:P.bg,padding:12,borderRadius:14,borderWidth:1,borderColor:'#55726C'},
 headline:{fontSize:18,fontWeight:'900',color:P.cream},hobbyGrid:{flexDirection:'row',flexWrap:'wrap',gap:7},
 hobbyTile:{width:'23%',minWidth:65,flexGrow:1,minHeight:110,backgroundColor:'#2D4950',borderColor:'#54716E',borderWidth:1,borderRadius:10,alignItems:'center',justifyContent:'center',gap:5,padding:6},
 tileActive:{borderColor:P.gold,backgroundColor:'#40594F'},tileGlyph:{fontSize:26,color:P.gold},
 tileTitle:{fontSize:10,fontWeight:'900',color:P.cream,textAlign:'center'},tileNote:{fontSize:9,color:P.muted,textAlign:'center'},
 tileTrack:{width:'90%',height:5,borderRadius:5,backgroundColor:'#4C6465',overflow:'hidden'},tileFill:{height:5,backgroundColor:P.green},
 details:{padding:12,borderRadius:12,backgroundColor:'#243D44',borderColor:'#66877F',borderWidth:1,gap:11},
 stats:{flexDirection:'row',gap:6,flexWrap:'wrap'},statBox:{flex:1,flexBasis:58,backgroundColor:'#32535B',padding:8,alignItems:'center',borderRadius:9},
 statValue:{fontSize:20,fontWeight:'900',color:P.cream},rivalLine:{flexDirection:'row',alignItems:'center',paddingVertical:5,borderBottomWidth:1,borderColor:'#52716E',gap:7},
 rivalName:{fontSize:12,fontWeight:'800',color:P.cream},rating:{fontSize:17,fontWeight:'900',color:P.gold},
 action:{padding:11,borderWidth:1,borderColor:'#89AF9A',borderRadius:9,backgroundColor:'#395E50',minHeight:53,gap:4,justifyContent:'center'},
 actionTitle:{fontSize:13,fontWeight:'900',color:P.cream},
 result:{gap:6,padding:10,backgroundColor:'#2F4A45',borderRadius:10},
 resultTitle:{fontSize:14,fontWeight:'900',color:P.cream},records:{gap:7,padding:11,backgroundColor:'#1F383E',borderRadius:10},
 linkText:{fontSize:12,color:P.gold,fontWeight:'800'}
});
