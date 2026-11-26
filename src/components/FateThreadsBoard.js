import React,{useEffect,useRef,useState} from 'react';
import {View,Text,Pressable,Animated,StyleSheet,AccessibilityInfo} from 'react-native';
import {useAudioPlayer,setAudioModeAsync} from 'expo-audio';

const C={panel:'#192B33',tile:'#253E42',ink:'#F7F6F0',muted:'#BED0CC',
 gold:'#FFE0A7',mint:'#D4F2B1',blue:'#B0D9E5',rose:'#FFC0B8',line:'#54716B'};
const initials=s=>String(s||'?').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
function Meter({label,value,color}){
 const safe=Math.max(0,Math.min(100,Number(value)||0));
 return <View style={S.meter}><View style={S.between}><Text style={S.meterLabel}>{label}</Text>
  <Text style={S.meterValue}>{safe}</Text></View>
  <View style={S.meterTrack} accessibilityRole="progressbar" accessibilityLabel={label}
   accessibilityValue={{min:0,max:100,now:safe}}>
   <View style={[S.meterFill,{width:safe+'%',backgroundColor:color}]}/>
  </View></View>;
}
export function FateSceneBoard({view,onChoice,soundEnabled=true}){
 const [reduced,setReduced]=useState(false);
 const glow=useRef(new Animated.Value(1)).current;
 const tap=useAudioPlayer(require('../../assets/sfx/tap.wav'));
 const success=useAudioPlayer(require('../../assets/sfx/success.wav'));
 const setback=useAudioPlayer(require('../../assets/sfx/setback.wav'));
 const key=view?.last?.age+':'+view?.last?.label+':'+view?.round;
 const previous=useRef(key);
 useEffect(()=>{
  setAudioModeAsync({playsInSilentMode:true,shouldPlayInBackground:false}).catch(()=>{});
  AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(()=>{});
  const sub=AccessibilityInfo.addEventListener?.('reduceMotionChanged',setReduced);
  return()=>sub?.remove?.();
 },[]);
 useEffect(()=>{
  if(view?.last&&key!==previous.current){
   if(!reduced){
    glow.setValue(.95);
    Animated.spring(glow,{toValue:1,useNativeDriver:true,tension:95,friction:7}).start();
   }
   if(soundEnabled){
    const sound=(view.last.trustChange||0)>=0?success:setback;
    sound.seekTo(0).then(()=>sound.play()).catch(()=>{});
   }
  }
  previous.current=key;
 },[key,reduced,soundEnabled]);
 if(!view)return null;
 const mood=view.meters.rivalry>60?'CONFLICT':view.meters.connection>70?'TRUST':'UNCERTAIN';
 const choose=i=>{if(soundEnabled)tap.seekTo(0).then(()=>tap.play()).catch(()=>{});onChoice(i);};
 return <View testID="fate-story-scene" style={S.root}>
  <View style={S.between}><Text style={S.overline}>LIVING CHARACTER STORY</Text>
   <Text style={S.overline}>CHAPTER {view.round}/{view.total}</Text></View>
  <View style={S.stage}>
   <View style={S.stageTop}>
    <View style={S.orbBorder}><View style={S.orb}><Text style={S.orbLetter}>{initials(view.person)}</Text></View></View>
    <View style={S.storyHeader}>
     <Text style={S.age}>AGE {view.age} · {mood}</Text>
     <Text style={S.title}>{view.title}</Text>
     <Text style={S.subtitle}>Your story with {view.person}</Text>
    </View>
   </View>
   <View style={S.beats}>{[0,1,2].map(i=><View key={i}
    style={[S.beat,i<=view.stage&&S.beatActive]}/>)}</View>
   <View style={S.metrics}>
    <Meter label="Connection" value={view.meters.connection} color={C.mint}/>
    <Meter label="Rivalry" value={view.meters.rivalry} color={C.rose}/>
    <Meter label="Hope" value={view.meters.hope} color={C.gold}/>
   </View>
  </View>
  <View style={S.scene}><Text style={S.sceneHeader}>{view.headline}</Text>
   <Text style={S.sceneText}>{view.scene}</Text>
   {view.surprise?<View testID="fate-unexpected-turn" style={S.twist}>
    <Text style={S.twistLabel}>AN UNEXPECTED TURN</Text>
    <Text style={S.sceneText}>{view.surprise}</Text>
   </View>:null}
   {view.independent?<Text style={S.subtext}>{view.independent}</Text>:null}
  </View>
  {view.last?<Animated.View testID="fate-scene-reaction" accessibilityLiveRegion="polite"
   style={[S.feedback,{transform:[{scale:glow}]}]}>
   <Text style={S.overline}>THE LAST CHOICE LEFT A MARK</Text>
   <Text style={S.sceneText}>{view.last.feedback}</Text>
  </Animated.View>:null}
  <Text style={S.overline}>WHAT WILL YOU DO?</Text>
  {view.choices.map(choice=><Pressable key={choice.index}
   testID={'fate-choice-'+choice.index} accessibilityRole="button"
   accessibilityLabel={choice.label+'. '+choice.detail}
   style={({pressed})=>[S.choice,pressed&&{opacity:.72}]}
   onPress={()=>choose(choice.index)}>
   <View style={S.choiceNumber}><Text style={S.choiceNumberText}>{choice.index+1}</Text></View>
   <View style={{flex:1,gap:4}}><Text style={S.choiceLabel}>{choice.label}</Text>
    <Text style={S.choiceDetail}>{choice.detail}</Text></View>
  </Pressable>)}
  <Text style={S.foot}>This decision changes the real relationship. The next chapter may return years later, after this person's life has continued independently.</Text>
 </View>;
}
const statusName=s=>({playing:'Your decision awaits',waiting:'Years are passing',ready:'The next chapter is ready'}[s]||'Unresolved');
export default function FateThreadsBoard({view,commands=[],onAction,blocked=false,compact=false}){
 const offers=commands.filter(x=>x.id.startsWith('fate:start:')).slice(0,compact?1:4);
 const active=view.active,recent=view.recent.slice(0,compact?1:4);
 if(compact&&!active&&!recent.length)return null;
 return <View testID={compact?'fate-story-preview':'fate-story-library'} style={S.library}>
  <View style={S.between}><View style={{flex:1,gap:4}}>
   <Text style={S.overline}>FRIENDSHIPS, RIVALS & CONSEQUENCES</Text>
   <Text style={S.title}>{compact?'The story still unfolding':'Your character-driven life stories'}</Text></View>
   <Text style={S.overline}>{view.total} FINISHED</Text>
  </View>
  {active?<View testID="fate-current-chapter" style={S.active}>
   <Text style={S.age}>{statusName(active.status).toUpperCase()} · CHAPTER {active.stage+1}/3</Text>
   <Text style={S.storyTitle}>{active.title}</Text>
   <Text style={S.subtext}>{active.person} · Began age {active.startedAge}</Text>
   {active.status==='waiting'?<Text style={S.subtext}>The next chapter is scheduled around age {active.dueAge}. Other people keep living while you're apart.</Text>:null}
   {active.last?<View testID="fate-impact-recap" style={S.impact}>
    <Text style={S.overline}>WHAT YOUR DECISION CHANGED</Text>
    <Text style={S.sceneText}>{active.last.feedback}</Text>
    <View style={S.impactPills}>
     <Text style={S.pill}>Trust {active.last.trustChange>=0?'+':''}{active.last.trustChange}</Text>
     <Text style={S.pill}>Rivalry {active.last.rivalryChange>=0?'+':''}{active.last.rivalryChange}</Text>
     <Text style={S.pill}>{active.last.stat} {active.last.statChange>=0?'+':''}{active.last.statChange}</Text>
    </View>
   </View>:null}
   {active.status==='ready'?<Pressable accessibilityRole="button" testID="fate-continue"
    disabled={blocked||!commands.some(x=>x.id==='fate:continue'&&x.enabled)}
    accessibilityState={{disabled:blocked||!commands.some(x=>x.id==='fate:continue'&&x.enabled)}}
    onPress={()=>onAction('fate:continue')}
    style={[S.action,(blocked||!commands.some(x=>x.id==='fate:continue'&&x.enabled))&&S.disabled]}>
    <Text style={S.actionText}>Continue the story with {active.person}</Text>
   </Pressable>:null}
  </View>:null}
  {!compact&&!active&&offers.length?<View style={S.offers}>
   <Text style={S.overline}>NEW POSSIBILITIES</Text>
   {offers.map(x=><Pressable key={x.id} testID={'fate-offer-'+x.id.slice(11)}
    accessibilityRole="button" accessibilityLabel={x.label+', '+x.detail}
    accessibilityState={{disabled:blocked||!x.enabled}}
    disabled={blocked||!x.enabled} onPress={()=>onAction(x.id)}
    style={({pressed})=>[S.offer,(blocked||!x.enabled)&&S.disabled,pressed&&{opacity:.75}]}>
    <Text style={S.choiceLabel}>{x.label}</Text><Text style={S.subtext}>{x.detail}</Text>
   </Pressable>)}
  </View>:null}
  {recent.length?<View testID="fate-story-endings" style={S.offers}>
   <Text style={S.overline}>LIVES THAT CHANGED</Text>
   {recent.map(x=><View key={x.id} style={S.ending}>
    <Text style={S.age}>{x.person} · AGE {x.startedAge}–{x.endedAge}</Text>
    <Text style={S.storyTitle}>{x.title}</Text>
    <Text style={S.choiceDetail}>{x.finalLine}</Text>
    <Text style={S.age}>{x.endingTitle} · {x.decisions} decisions</Text>
   </View>)}
  </View>:null}
  {!active&&!offers.length&&!recent.length?<Text style={S.subtext}>Your relationships are still forming. Spend time with people and new multi-year stories will become available.</Text>:null}
  {!compact&&view.ancestry.length?<View style={S.offers}>
   <Text style={S.overline}>STORIES ACROSS GENERATIONS</Text>
   {view.ancestry.map((x,i)=><View key={x.generation+'-'+i} style={S.ending}>
    <Text style={S.age}>GENERATION {x.generation} · {x.name}</Text>
    <Text style={S.choiceDetail}>{x.note}</Text>
   </View>)}
  </View>:null}
  <Text style={S.foot}>These are optional stories: you can advance years without finishing a waiting chapter. Results depend on your decisions and the NPC's changing circumstances.</Text>
 </View>;
}
const S=StyleSheet.create({
 root:{gap:12},library:{gap:12,backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:18,padding:14},
 between:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:7},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:.7,color:C.gold,flexShrink:1},
 stage:{backgroundColor:C.panel,borderRadius:16,borderWidth:1,borderColor:C.line,padding:14,gap:14},
 stageTop:{flexDirection:'row',alignItems:'center',gap:12},
 orbBorder:{borderWidth:2,borderColor:C.gold,width:92,height:92,borderRadius:46,
  justifyContent:'center',alignItems:'center'},
 orb:{width:74,height:74,borderRadius:37,backgroundColor:'#3C6974',alignItems:'center',justifyContent:'center'},
 orbLetter:{fontSize:28,color:C.ink,fontWeight:'900'},
 storyHeader:{flex:1,minWidth:0,gap:5},
 age:{fontSize:10,fontWeight:'900',letterSpacing:.4,color:C.gold,flexShrink:1},
 title:{fontSize:20,fontWeight:'900',lineHeight:26,color:C.ink,flexShrink:1},
 storyTitle:{fontSize:15,fontWeight:'900',lineHeight:21,color:C.ink},
 subtitle:{fontSize:12,color:C.muted},
 beats:{flexDirection:'row',gap:6},beat:{height:7,backgroundColor:'#415C5D',borderRadius:5,flex:1},
 beatActive:{backgroundColor:C.gold},
 metrics:{flexDirection:'row',flexWrap:'wrap',gap:7},
 meter:{flexGrow:1,flexBasis:85,minWidth:0,gap:6,backgroundColor:C.tile,borderRadius:9,padding:8},
 meterLabel:{fontSize:10,color:C.muted},meterValue:{fontSize:11,fontWeight:'900',color:C.ink},
 meterTrack:{height:6,borderRadius:5,backgroundColor:'#42575A',overflow:'hidden'},
 meterFill:{height:6,borderRadius:5},
 scene:{gap:10,backgroundColor:C.tile,borderRadius:14,padding:14,borderLeftWidth:3,borderLeftColor:C.gold},
 sceneHeader:{color:C.gold,fontSize:14,fontWeight:'900',lineHeight:20},
 sceneText:{color:C.ink,fontSize:13,lineHeight:21,flexShrink:1},
 subtext:{color:C.muted,fontSize:11,lineHeight:18,flexShrink:1},
 twist:{backgroundColor:'#414351',borderRadius:10,padding:11,gap:6},
 twistLabel:{fontSize:10,color:C.rose,fontWeight:'900'},
 feedback:{backgroundColor:'#30473D',borderRadius:12,borderWidth:1,borderColor:C.mint,padding:12,gap:8},
 choice:{minHeight:57,borderWidth:1,borderColor:C.line,borderRadius:12,
  flexDirection:'row',alignItems:'center',gap:10,padding:12,backgroundColor:C.tile},
 choiceNumber:{backgroundColor:'#536D69',height:34,width:34,borderRadius:10,alignItems:'center',justifyContent:'center'},
 choiceNumberText:{fontSize:14,fontWeight:'900',color:C.ink},
 choiceLabel:{fontSize:13,fontWeight:'800',lineHeight:19,color:C.ink,flexShrink:1},
 choiceDetail:{fontSize:11,lineHeight:17,color:C.muted,flexShrink:1},
 foot:{fontSize:10,lineHeight:16,color:C.muted},
 active:{gap:9,padding:12,borderWidth:1,borderColor:C.gold,borderRadius:12,backgroundColor:'#2C4140'},
 impact:{gap:7,backgroundColor:'#345047',borderRadius:11,padding:10},
 impactPills:{flexDirection:'row',flexWrap:'wrap',gap:6},
 pill:{fontSize:10,color:C.mint,fontWeight:'800',backgroundColor:'#263D38',padding:8,borderRadius:7},
 action:{minHeight:48,borderRadius:10,backgroundColor:C.mint,padding:12,justifyContent:'center'},
 actionText:{color:'#162723',fontSize:13,fontWeight:'900'},
 offers:{gap:8},offer:{minHeight:52,backgroundColor:C.tile,borderRadius:11,padding:12,gap:5},
 disabled:{opacity:.4},ending:{backgroundColor:C.tile,padding:12,borderRadius:11,gap:6}
});
