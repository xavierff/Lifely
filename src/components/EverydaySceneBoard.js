import React,{useEffect,useRef,useState} from 'react';
import {View,Text,Pressable,StyleSheet,Animated,AccessibilityInfo} from 'react-native';
import {useAudioPlayer,setAudioModeAsync} from 'expo-audio';
const C={white:'#F4FAF5',muted:'#BAD0C9',lime:'#D9F4A5',gold:'#F7DAA0',border:'#507869',dark:'#132925',rose:'#F3B7C7',blue:'#A0CFFF'};
const capped=x=>Math.max(0,Math.min(100,Number(x)||0));
function Meter({label,value,tint=C.lime}){
 return <View style={S.meter}><View style={S.split}><Text style={S.small}>{label}</Text><Text style={S.value}>{value}%</Text></View><View style={S.bar}><View style={[S.barFill,{backgroundColor:tint,width:capped(value)+'%'}]}/></View></View>;
}
function PersonAvatar({name,tag,muted=false}){
 const initials=String(name||'?').split(' ').slice(0,2).map(t=>t[0]).join('');
 return <View style={S.person}><View style={[S.avatar,muted&&{backgroundColor:'#665B6C'}]}><Text style={S.avatarText}>{initials}</Text></View><Text numberOfLines={1} style={S.personName}>{name}</Text><Text style={S.personTag}>{tag}</Text></View>;
}
function Bonds({v}){
 return <View testID="relationship-moment" style={S.scene}>
   <View style={S.split}><Text style={S.caption}>RELATIONSHIP STORY</Text><Text style={S.caption}>CHAPTER {v.round}/3</Text></View>
   <View style={S.socialStage}>
    <PersonAvatar name="YOU" tag="Present"/>
    <View style={S.heart}><Text style={S.heartIcon}>♡</Text><Text style={S.heartNote}>{v.meters.trust>=64?'BUILDING TRUST':v.meters.tension>40?'TENSION':'GETTING CLOSER'}</Text></View>
    <PersonAvatar name={v.personName} tag={v.personRole}/>
   </View>
   <View style={S.meterRow}><Meter label="Trust" value={v.meters.trust}/><Meter label="Tension" value={v.meters.tension} tint={C.rose}/></View>
   <View style={S.speech}><Text style={S.caption}>WHAT HAPPENED</Text><Text style={S.story}>{v.prompt}</Text></View>
   <Text style={S.hint}>A person’s preferences may differ from yours. Listen to the response and adapt.</Text>
 </View>;
}
function Classroom({v}){
 return <View testID="interactive-school-life" style={S.scene}>
   <View style={S.split}><Text style={S.caption}>SCHOOL LIFE · {v.track?.toUpperCase()}</Text><Text style={S.caption}>ROUND {v.round}/3</Text></View>
   <View style={S.boardSchool}>
    <Text style={S.chalkTitle}>{v.track}</Text><View style={S.chalkLine}/>
    <View style={S.seats}>{['YOU','CLASSMATE','PROJECT'].map((x,i)=><View key={x} style={S.seat}><Text style={S.seatIcon}>{i===2?'✦':'◉'}</Text><Text style={S.seatLabel}>{x}</Text></View>)}</View>
    <Text style={S.chalkFoot}>{v.phase.toUpperCase()}</Text>
   </View>
   <View style={S.meterRow}><Meter label="Project momentum" value={v.meters.momentum}/><Meter label="Team trust" value={v.meters.trust} tint={C.blue}/></View>
   <View style={S.speech}><Text style={S.caption}>CLASSROOM UPDATE · {v.personName}</Text><Text style={S.story}>{v.prompt}</Text></View>
   <Text style={S.hint}>Classmates remember cooperation, setbacks and how you handle pressure.</Text>
 </View>;
}
function Outing({v}){
 return <View testID="playful-outing" style={S.scene}>
  <View style={S.split}><Text style={S.caption}>{v.track?.toUpperCase()}</Text><Text style={S.caption}>ROUND {v.round}/3</Text></View>
  <View style={S.boardSchool}><Text style={S.chalkTitle}>{v.glyph} {v.title}</Text><View style={S.chalkLine}/><Text style={S.chalkFoot}>{v.phase.toUpperCase()} · {v.personName}</Text>
   <View style={S.seats}>{[1,2,3].map(n=><View key={n} style={[S.seat,{opacity:n<=v.round?1:.45}]}><Text style={S.seatIcon}>{n<v.round?'✓':n===v.round?v.glyph:'○'}</Text><Text style={S.seatLabel}>CHAPTER {n}</Text></View>)}</View></View>
  <View style={S.meterRow}><Meter label="Momentum" value={v.meters.momentum}/><Meter label="Connection" value={v.meters.connection} tint={C.blue}/><Meter label="Tension" value={v.meters.tension} tint={C.rose}/></View>
  <View style={S.speech}><Text style={S.caption}>YOUR MOMENT</Text><Text style={S.story}>{v.prompt}</Text></View>
  <Text style={S.hint}>Preparation, connection and daring approaches create different endings. Balanced choices can uncover rare memories.</Text>
 </View>;
}
function Court({v}){
 return <View testID="interactive-courtroom" style={S.scene}>
   <View style={S.split}><Text style={S.caption}>FICTIONAL COURTROOM</Text><Text style={S.caption}>HEARING {v.round}/3</Text></View>
   <View style={S.courtStage}>
    <View style={S.courtBench}><Text style={S.courtJudge}>⚖</Text><Text style={S.benchName}>SIMULATED JUDGE</Text></View>
    <View style={S.rail}/>
    <View style={S.courtDesks}><View style={S.desk}><Text style={S.deskTop}>▣</Text><Text style={S.deskText}>COURT RECORD</Text></View><View style={S.desk}><Text style={S.deskTop}>◉</Text><Text style={S.deskText}>YOUR STATEMENT</Text></View></View>
   </View>
   <View style={S.meterRow}><Meter label="Documented facts" value={v.meters.evidence} tint={C.blue}/><Meter label="Composure" value={v.meters.composure} tint={C.gold}/></View>
   <View style={S.speech}><Text style={S.caption}>PROCEEDING · {v.phase.toUpperCase()}</Text><Text style={S.story}>{v.prompt}</Text></View>
   <Text style={[S.hint,{color:C.gold}]}>{v.disclaimer}</Text>
 </View>;
}
export default function EverydaySceneBoard({view,onChoice,soundEnabled=true}){
 const tap=useAudioPlayer(require('../../assets/sfx/tap.wav'));
 const win=useAudioPlayer(require('../../assets/sfx/success.wav'));
 const setback=useAudioPlayer(require('../../assets/sfx/setback.wav'));
 const scale=useRef(new Animated.Value(1)).current;
 const [reduceMotion,setReduceMotion]=useState(false);
 const lastKey=view?.last?view.id+':'+view.last.stage+':'+view.history.length:null;
 const previous=useRef(lastKey);
 useEffect(()=>{
  setAudioModeAsync({playsInSilentMode:true,shouldPlayInBackground:false}).catch(()=>{});
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(()=>{});
  const subscription=AccessibilityInfo.addEventListener?.('reduceMotionChanged',setReduceMotion);
  return()=>subscription?.remove?.();
 },[]);
 useEffect(()=>{
  if(lastKey&&lastKey!==previous.current){
   if(!reduceMotion){scale.setValue(.95);Animated.spring(scale,{toValue:1,useNativeDriver:true,tension:110,friction:5}).start();}
   if(soundEnabled){const sound=view.last?.success?win:setback;sound.seekTo(0).then(()=>sound.play()).catch(()=>{});}
  }
  previous.current=lastKey;
 },[lastKey,soundEnabled,reduceMotion]);
 function choose(i){if(soundEnabled)tap.seekTo(0).then(()=>tap.play()).catch(()=>{});onChoice(i);}
 if(!view)return null;
 return <View style={S.root} testID="everyday-scene">
  {view.type==='bond'?<Bonds v={view}/>:view.type==='school'?<Classroom v={view}/>:view.type==='outing'?<Outing v={view}/>:<Court v={view}/>}
  <View style={S.split}><Text style={S.caption}>MAKE A DECISION</Text><Text style={S.caption}>{view.round} OF {view.total}</Text></View>
  {view.options.map(o=><Pressable key={o.index} testID={'scene-choice-'+o.index} accessibilityRole="button" accessibilityLabel={o.label+', '+o.note} onPress={()=>choose(o.index)} style={({pressed})=>[S.choice,pressed&&{opacity:.78}]}>
   <View style={S.number}><Text style={S.numberText}>{o.index+1}</Text></View><View style={{flex:1,gap:4}}><Text style={S.choiceTitle}>{o.label}</Text><Text style={S.choiceText}>{o.note}</Text></View>
  </Pressable>)}
  {view.last?<Animated.View testID="everyday-feedback" accessibilityLiveRegion="polite" style={[S.response,{transform:[{scale}]}]}>
    <Text style={S.caption}>{view.last.success?'✓ A MEANINGFUL STEP':'↻ THE OUTCOME WAS UNEXPECTED'}</Text>
    <Text style={S.story}>{view.last.reaction}</Text>
    <Text style={S.hint}>{view.last.signal}</Text>
   </Animated.View>:null}
 </View>;
}
const S=StyleSheet.create({
 root:{gap:10},scene:{padding:12,borderRadius:16,backgroundColor:C.dark,borderWidth:1,borderColor:C.border,gap:11},
 split:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:6},
 caption:{fontSize:10,fontWeight:'900',color:C.gold,letterSpacing:.7,flexShrink:1},
 socialStage:{backgroundColor:'#243B39',borderRadius:12,flexDirection:'row',alignItems:'center',justifyContent:'space-around',paddingHorizontal:7,paddingVertical:15},
 person:{alignItems:'center',gap:4,flex:1,minWidth:0},
 avatar:{width:52,height:52,borderRadius:26,backgroundColor:'#4F8173',alignItems:'center',justifyContent:'center'},
 avatarText:{fontSize:19,fontWeight:'900',color:C.white},
 personName:{color:C.white,fontSize:12,fontWeight:'800',textAlign:'center'},
 personTag:{fontSize:10,color:C.muted,textTransform:'capitalize',textAlign:'center'},
 heart:{width:90,alignItems:'center',gap:2},heartIcon:{color:C.rose,fontSize:38},
 heartNote:{fontSize:9,color:C.gold,fontWeight:'800',textAlign:'center'},
 meterRow:{flexDirection:'row',flexWrap:'wrap',gap:8},
 meter:{flex:1,flexBasis:112,minWidth:0,backgroundColor:'#1C3C35',padding:9,borderRadius:9,gap:6},
 small:{color:C.muted,fontSize:11},value:{color:C.white,fontSize:12,fontWeight:'900'},
 bar:{height:8,borderRadius:6,backgroundColor:'#40554E',overflow:'hidden'},
 barFill:{height:8,borderRadius:6},
 speech:{padding:13,borderRadius:11,backgroundColor:'#253E39',borderLeftWidth:3,borderColor:C.lime,gap:7},
 story:{color:C.white,fontSize:14,lineHeight:21,fontWeight:'500'},
 hint:{color:C.muted,fontSize:11,lineHeight:17},
 boardSchool:{backgroundColor:'#245C4A',borderRadius:11,padding:12,borderWidth:2,borderColor:'#78A58E',gap:11},
 chalkTitle:{color:'#E3FFE3',fontSize:20,fontWeight:'900',textAlign:'center'},
 chalkLine:{height:1,backgroundColor:'#8EB9A5'},
 seats:{flexDirection:'row',justifyContent:'space-around',gap:7},
 seat:{backgroundColor:'#316E56',borderWidth:1,borderColor:'#B3CFBA',borderRadius:8,padding:8,alignItems:'center',justifyContent:'center',flex:1,minWidth:0,gap:5},
 seatIcon:{fontSize:23,color:C.white},seatLabel:{fontSize:9,fontWeight:'900',textAlign:'center',color:C.white},
 chalkFoot:{fontSize:10,color:'#E2FFD9',fontWeight:'800',textAlign:'center',letterSpacing:1},
 courtStage:{backgroundColor:'#3B3232',borderRadius:12,padding:12,borderWidth:1,borderColor:'#8E7763',gap:10},
 courtBench:{alignItems:'center',gap:3,backgroundColor:'#584235',borderRadius:8,padding:9,borderWidth:1,borderColor:'#BA9E78'},
 courtJudge:{fontSize:29,color:C.gold},benchName:{fontSize:10,fontWeight:'900',letterSpacing:1,color:C.white},
 rail:{height:6,borderRadius:3,backgroundColor:'#9D7657'},
 courtDesks:{flexDirection:'row',justifyContent:'space-around',gap:9},
 desk:{flex:1,alignItems:'center',padding:9,backgroundColor:'#564339',borderRadius:8,gap:5},
 deskTop:{color:C.gold,fontSize:26},deskText:{fontSize:10,fontWeight:'900',color:C.white,textAlign:'center'},
 choice:{minHeight:58,padding:12,backgroundColor:'#1D3933',borderWidth:1,borderColor:C.border,borderRadius:11,flexDirection:'row',gap:11,alignItems:'center'},
 number:{width:31,height:31,borderRadius:9,backgroundColor:'#41695C',alignItems:'center',justifyContent:'center'},
 numberText:{fontSize:14,color:C.white,fontWeight:'900'},
 choiceTitle:{fontSize:13,color:C.white,fontWeight:'800'},choiceText:{fontSize:11,color:C.muted,lineHeight:17},
 response:{borderWidth:1,borderColor:'#779E80',borderRadius:11,backgroundColor:'#284537',padding:12,gap:7}
});
