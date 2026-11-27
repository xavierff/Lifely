import React,{useState,useEffect,useRef} from 'react';
import {View,Text,Pressable,StyleSheet,Animated,AccessibilityInfo} from 'react-native';
import {useAudioPlayer} from 'expo-audio';
export default function PlayfulLifeBoard({age,history=[],classmates=[],collection=[],legacy=[],commands=[],blocked,onAction,soundEnabled=true}){
 const [expanded,setExpanded]=useState(false),[reduceMotion,setReduceMotion]=useState(false);
 const win=useAudioPlayer(require('../../assets/sfx/success.wav')),scale=useRef(new Animated.Value(1)).current,previous=useRef(undefined);
 useEffect(()=>{AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(()=>{});const sub=AccessibilityInfo.addEventListener?.('reduceMotionChanged',setReduceMotion);return()=>sub?.remove?.();},[]);
 const choices=commands.filter(c=>c.id.startsWith('scene:start:outing:')),past=history.filter(x=>x.type==='outing'&&x.outcome!=='interrupted');
 const latest=past[0],key=latest?.id||null;
 useEffect(()=>{if(previous.current!==undefined&&key&&previous.current!==key){if(!reduceMotion){scale.setValue(.94);Animated.spring(scale,{toValue:1,useNativeDriver:true,tension:90,friction:6}).start();}if(soundEnabled&&latest?.outcome!=='mixed')win.seekTo(0).then(()=>win.play()).catch(()=>{});}previous.current=key;},[key,soundEnabled,reduceMotion]);
 if(age<6||(!choices.length&&!past.length&&!collection.length&&!legacy.length))return null;
 return <View testID="playful-life-board" style={S.card}>
  <Text style={S.eyebrow}>MAKE THIS YEAR MEMORABLE</Text><Text style={S.title}>{age<13?'Childhood adventures':age<19?'Teenage adventures':'Experiences worth living'}</Text>
  <Text style={S.desc}>Three decisions, meaningful tradeoffs and different endings. One outing per year.</Text>
  {latest?<Animated.View style={[S.result,{transform:[{scale}]}]} testID="outing-latest-result" accessibilityLiveRegion="polite"><Text style={S.eyebrow}>{latest.collectible?'RARE MEMORY':'LAST EXPERIENCE'}</Text><Text style={S.name}>{latest.collectible||latest.track}</Text><Text style={S.desc}>{latest.track} · Age {latest.endedAge} · {latest.outcome.replaceAll('-',' ')}</Text></Animated.View>:null}
  {age<=18&&classmates.length?<View style={S.result}><Text style={S.eyebrow}>YOUR SCHOOL CIRCLE</Text><Text style={S.desc}>Connection {Math.round(classmates.reduce((n,p)=>n+p.trust,0)/classmates.length)}/100 · Rivalry {Math.round(classmates.reduce((n,p)=>n+p.rivalry,0)/classmates.length)}/100</Text>{classmates.map(p=><Text key={p.id} style={S.desc}>{p.name} · Trust {p.trust} · Rivalry {p.rivalry}</Text>)}</View>:null}
  {collection.length?<View testID="outing-collection" style={S.result}><Text style={S.eyebrow}>RARE MEMORIES · {collection.length}/13</Text>{collection.slice(0,5).map(x=><Text key={x.activityId} style={S.desc}>{x.title} · Age {x.age}</Text>)}</View>:null}
  {legacy.length?<View style={S.result}><Text style={S.eyebrow}>MEMORIES FROM EARLIER LIVES</Text>{legacy.slice(0,3).map((x,i)=><Text key={i} style={S.desc}>{x.ancestor} · {x.title}</Text>)}</View>:null}
  {!blocked&&choices.length?<><Pressable testID="outing-expand" accessibilityRole="button" accessibilityState={{expanded}} onPress={()=>setExpanded(!expanded)} style={S.button}><Text style={S.name}>{expanded?'Hide experiences':'Explore '+choices.length+' experiences'}</Text></Pressable>
  {expanded&&choices.map(c=><Pressable key={c.id} testID={'outing-start-'+c.id.split(':').at(-1)} accessibilityRole="button" accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled} onPress={()=>onAction(c.id)} style={[S.button,!c.enabled&&{opacity:.45}]}><Text style={S.name}>{c.label}</Text><Text style={S.desc}>{c.detail}</Text></Pressable>)}</>:null}
 </View>;
}
const S=StyleSheet.create({card:{backgroundColor:'#203A3E',padding:14,borderRadius:16,borderWidth:1,borderColor:'#668D83',gap:10},eyebrow:{fontSize:10,fontWeight:'900',color:'#FFDEA7'},title:{fontSize:20,fontWeight:'900',color:'#F6F8F0'},desc:{fontSize:12,lineHeight:18,color:'#D0E1DA'},name:{fontSize:14,fontWeight:'800',color:'#F6F8F0'},button:{padding:12,minHeight:48,borderRadius:10,backgroundColor:'#355750',gap:5,borderWidth:1,borderColor:'#789C8F'},result:{padding:11,borderRadius:10,backgroundColor:'#374D3A',gap:5}});
