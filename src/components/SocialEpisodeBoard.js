import React,{useEffect,useRef,useState} from 'react';
import {View,Text,Pressable,Animated,StyleSheet,AccessibilityInfo} from 'react-native';
import {useAudioPlayer,setAudioModeAsync} from 'expo-audio';
const P={bg:'#17262D',panel:'#23343F',ink:'#F8F5E9',muted:'#BAC7CB',gold:'#F2D4A5',blue:'#B4D9EA',green:'#C9E6B4',red:'#F4B6B4',line:'#58717B'};
function Meter({title,value,color}){
 const safe=Math.max(0,Math.min(100,Number(value)||0));
 return <View style={S.meter}><View style={S.split}><Text style={S.meterName}>{title}</Text><Text style={S.meterValue}>{safe}</Text></View>
 <View style={S.track}><View style={[S.fill,{width:safe+'%',backgroundColor:color}]}/></View></View>;
}
function Participant({name,label,isSecond}){
 const initials=String(name).split(' ').slice(0,2).map(x=>x[0]).join('');
 return <View style={S.person}><View style={[S.avatar,isSecond&&S.secondAvatar]}><Text style={S.initials}>{initials}</Text></View><Text style={S.personName} numberOfLines={2}>{name}</Text><Text style={S.personLabel}>{label}</Text></View>;
}
export default function SocialEpisodeBoard({view,onChoice,soundEnabled=true}){
 const tap=useAudioPlayer(require('../../assets/sfx/tap.wav'));
 const success=useAudioPlayer(require('../../assets/sfx/success.wav'));
 const setback=useAudioPlayer(require('../../assets/sfx/setback.wav'));
 const [reduced,setReduced]=useState(false),anim=useRef(new Animated.Value(1)).current;
 const feedbackKey=view?.last?view.id+':'+view.last.phase:null,previous=useRef(feedbackKey);
 useEffect(()=>{
  setAudioModeAsync({playsInSilentMode:true,shouldPlayInBackground:false}).catch(()=>{});
  AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(()=>{});
  const sub=AccessibilityInfo.addEventListener?.('reduceMotionChanged',setReduced);
  return()=>sub?.remove?.();
 },[]);
 useEffect(()=>{
  if(feedbackKey&&feedbackKey!==previous.current){
   if(!reduced){anim.setValue(.96);Animated.spring(anim,{toValue:1,useNativeDriver:true,tension:100,friction:6}).start();}
   if(soundEnabled){const player=view.last.success?success:setback;player.seekTo(0).then(()=>player.play()).catch(()=>{});}
  }
  previous.current=feedbackKey;
 },[feedbackKey,reduced,soundEnabled]);
 if(!view)return null;
 function choose(index){if(soundEnabled)tap.seekTo(0).then(()=>tap.play()).catch(()=>{});onChoice(index);}
 return <View testID="character-story-board" style={S.root}>
  <View style={S.split}><Text style={S.overline}>AN ORIGINAL LIFE EPISODE</Text><Text style={S.overline}>SCENE {view.round}/{view.total}</Text></View>
  <View style={S.stage}>
   <Participant name={view.lead} label="The first perspective"/>
   <View style={S.centre}><Text style={S.connection}>⌁</Text><Text style={S.connectionLabel}>{view.pressure}</Text></View>
   <Participant name={view.other} label="The other side" isSecond/>
  </View>
  <View style={S.meterRow}><Meter title="Trust" value={view.meters.trust} color={P.green}/><Meter title="Tension" value={view.meters.tension} color={P.red}/><Meter title="Clarity" value={view.meters.clarity} color={P.blue}/></View>
  <View style={S.chapterTrack}>{Array.from({length:3},(_,i)=><View key={i} style={[S.segment,i<=view.phase&&S.segmentActive]}/>)}</View>
  <View style={S.scene}><Text style={S.sceneLabel}>{view.headline.toUpperCase()}</Text><Text style={S.storyText}>{view.prompt}</Text><Text style={S.context}>{view.backstory}</Text></View>
  <View style={S.split}><Text style={S.overline}>HOW WILL YOU HANDLE THIS?</Text><Text style={S.overline}>CHOICES MATTER</Text></View>
  {view.options.map(o=><Pressable testID={'episode-choice-'+o.index} key={o.index} accessibilityRole="button" accessibilityLabel={o.label+', '+o.note}
    style={({pressed})=>[S.choice,pressed&&{opacity:.8}]} onPress={()=>choose(o.index)}>
    <View style={S.choiceIndex}><Text style={S.choiceNum}>{o.index+1}</Text></View>
    <View style={{flex:1,gap:3}}><Text style={S.choiceTitle}>{o.label}</Text><Text style={S.choiceNote}>{o.note}</Text></View>
   </Pressable>)}
  {view.last?<Animated.View testID="episode-reaction" accessibilityLiveRegion="polite" style={[S.feedback,{transform:[{scale:anim}]}]}>
   <Text style={S.overline}>{view.last.success?'THEY ARE LISTENING':'THE TENSION HAS CHANGED'}</Text>
   <Text style={S.storyText}>{view.last.feedback}</Text>
   <Text style={S.context}>Every character has their own priorities. Earlier choices influence what happens next.</Text>
   </Animated.View>:null}
 </View>;
}
const S=StyleSheet.create({
 root:{gap:11},split:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:7},overline:{fontSize:10,fontWeight:'900',color:P.gold,letterSpacing:.7,flexShrink:1},
 stage:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:P.bg,borderRadius:13,padding:12,borderWidth:1,borderColor:P.line,gap:5},
 person:{flex:1,minWidth:0,alignItems:'center',gap:6},avatar:{width:62,height:62,borderRadius:31,backgroundColor:'#4B8277',alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'#9AC9B1'},
 secondAvatar:{backgroundColor:'#526D92',borderColor:'#B5CEED'},
 initials:{fontSize:20,color:P.ink,fontWeight:'900'},personName:{fontSize:13,fontWeight:'900',textAlign:'center',color:P.ink},personLabel:{fontSize:10,color:P.muted,textAlign:'center'},
 centre:{flex:1,alignItems:'center',minWidth:45,maxWidth:115,gap:4},connection:{fontSize:35,color:P.gold},connectionLabel:{fontSize:10,textAlign:'center',color:P.gold},
 meterRow:{flexDirection:'row',flexWrap:'wrap',gap:7},meter:{flex:1,flexBasis:84,backgroundColor:P.panel,padding:8,borderRadius:9,gap:5,minWidth:0},
 meterName:{fontSize:10,color:P.muted},meterValue:{fontSize:11,color:P.ink,fontWeight:'900'},
 track:{height:7,borderRadius:6,backgroundColor:'#4A575D',overflow:'hidden'},fill:{height:7,borderRadius:6},
 chapterTrack:{flexDirection:'row',gap:6},segment:{height:7,flex:1,backgroundColor:'#465E65',borderRadius:4},segmentActive:{backgroundColor:P.gold},
 scene:{backgroundColor:'#2C3D42',borderRadius:12,padding:13,borderLeftColor:P.gold,borderLeftWidth:3,gap:9},
 sceneLabel:{fontSize:11,color:P.gold,fontWeight:'900'},storyText:{fontSize:14,lineHeight:21,color:P.ink,fontWeight:'500'},context:{fontSize:11,lineHeight:16,color:P.muted},
 choice:{flexDirection:'row',alignItems:'center',gap:10,borderWidth:1,borderColor:P.line,backgroundColor:'#273F42',borderRadius:11,padding:12,minHeight:54},
 choiceIndex:{height:32,width:32,borderRadius:9,backgroundColor:'#516F68',alignItems:'center',justifyContent:'center'},
 choiceNum:{fontSize:13,fontWeight:'900',color:P.ink},choiceTitle:{fontSize:13,fontWeight:'800',color:P.ink},
 choiceNote:{fontSize:11,lineHeight:17,color:P.muted},feedback:{backgroundColor:'#314A40',borderWidth:1,borderColor:'#8DAB9A',borderRadius:11,padding:12,gap:7}
});
