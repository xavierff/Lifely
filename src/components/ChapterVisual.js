import React,{useEffect,useRef,useState} from 'react';
import {View,Text,StyleSheet,Animated,AccessibilityInfo} from 'react-native';
import {useAudioPlayer,setAudioModeAsync} from 'expo-audio';
import {chapterPresentation,palette as C} from '../content/visual-system.mjs';
export function ChapterFrame({age,alive,children}){
 const [reduce,setReduce]=useState(true),alpha=useRef(new Animated.Value(1)).current,previous=useRef(age);
 useEffect(()=>{let live=true;AccessibilityInfo.isReduceMotionEnabled().then(v=>{if(live)setReduce(v);}).catch(()=>{});const sub=AccessibilityInfo.addEventListener?.('reduceMotionChanged',setReduce);return()=>{live=false;sub?.remove?.();alpha.stopAnimation();};},[alpha]);
 useEffect(()=>{if(previous.current!==age){previous.current=age;alpha.stopAnimation();if(reduce)alpha.setValue(1);else{alpha.setValue(.72);Animated.timing(alpha,{toValue:1,duration:260,useNativeDriver:true}).start();}}else if(reduce){alpha.stopAnimation();alpha.setValue(1);}},[age,reduce,alpha]);
 return <Animated.View style={{opacity:alpha}}>{children}</Animated.View>;
}
export function ChapterProgress({age,alive}){
 const b=chapterPresentation(age,alive);
 return <View testID="chapter-progress" style={S.root}>
  <View style={S.row}><View style={{flex:1,minWidth:0}}><Text style={[S.caption,{color:b.tone}]}>{b.complete?'LIFE COMPLETE':'CHAPTER '+(b.index+1)+' OF 6'}</Text><Text style={S.detail}>{b.detail}</Text></View><Text style={[S.symbol,{color:b.tone}]} accessibilityElementsHidden importantForAccessibility="no">{b.symbol}</Text></View>
  <View style={S.track} accessibilityRole="progressbar" accessibilityLabel={b.label+' chapter progress'} accessibilityValue={{min:0,max:100,now:b.progress}}>{Array.from({length:6},(_,i)=><View key={i} style={[S.segment,{backgroundColor:i<b.index?C.accent:i===b.index?b.tone:C.border,opacity:i>b.index?.45:1}]}>{i===b.index?<View style={[S.current,{width:b.progress+'%'}]}/>:null}</View>)}</View>
  <Text style={S.caption}>{b.complete?'Your story is remembered':b.next?'Next chapter: '+b.next:'A lifetime of experiences'}</Text>
 </View>;
}
// Only year advancement and resolved ordinary choices; existing career/milestone audio is untouched.
export function useLifeFeedback(enabled){
 const tap=useAudioPlayer(require('../../assets/sfx/tap.wav')),next=useAudioPlayer(require('../../assets/sfx/success.wav'));
 const allow=useRef(enabled),serial=useRef(0);
 useEffect(()=>{allow.current=enabled;if(!enabled){serial.current++;try{tap.pause();next.pause();}catch{}}},[enabled,tap,next]);
 useEffect(()=>()=>{allow.current=false;serial.current++;},[]);
 return kind=>{if(!kind||!allow.current)return;const token=++serial.current,player=kind==='year'?tap:next;setAudioModeAsync({playsInSilentMode:true,shouldPlayInBackground:false}).then(()=>{if(allow.current&&serial.current===token)return player.seekTo(0);}).then(()=>{if(allow.current&&serial.current===token)player.play();}).catch(()=>{});};
}
const S=StyleSheet.create({root:{backgroundColor:C.background,borderRadius:12,padding:10,gap:6},row:{flexDirection:'row',alignItems:'center',gap:8},caption:{fontSize:11,lineHeight:16,color:C.muted,fontWeight:'700'},detail:{fontSize:14,lineHeight:20,color:C.text,fontWeight:'700'},symbol:{fontSize:26},track:{flexDirection:'row',gap:4},segment:{height:6,flex:1,borderRadius:4,overflow:'hidden'},current:{height:6,backgroundColor:C.accentInk,opacity:.5}});
