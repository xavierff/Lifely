import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
export default function PlayfulLifeBoard({age,history=[],commands=[],blocked,onAction}){
 const [expanded,setExpanded]=useState(false);
 const choices=commands.filter(c=>c.id.startsWith('scene:start:outing:')),past=history.filter(x=>x.type==='outing'&&x.outcome!=='interrupted');
 if(age<6||(!choices.length&&!past.length))return null;
 const rare=past.filter(x=>x.collectible),latest=past[0];
 return <View testID="playful-life-board" style={S.card}>
  <Text style={S.eyebrow}>MAKE THIS YEAR MEMORABLE</Text><Text style={S.title}>{age<13?'Childhood adventures':age<19?'Teenage adventures':'Experiences worth living'}</Text>
  <Text style={S.desc}>Three decisions, meaningful tradeoffs and different endings. One outing per year.</Text>
  {latest?<View style={S.result} testID="outing-latest-result"><Text style={S.eyebrow}>{latest.collectible?'RARE MEMORY':'LAST EXPERIENCE'}</Text><Text style={S.name}>{latest.collectible||latest.track}</Text><Text style={S.desc}>{latest.track} · Age {latest.endedAge} · {latest.outcome.replaceAll('-',' ')}</Text></View>:null}
  {rare.length?<Text style={S.desc}>{new Set(rare.map(x=>x.activityId)).size} distinct rare memories in recent history</Text>:null}
  {!blocked&&choices.length?<><Pressable testID="outing-expand" accessibilityRole="button" accessibilityState={{expanded}} onPress={()=>setExpanded(!expanded)} style={S.button}><Text style={S.name}>{expanded?'Hide experiences':'Explore '+choices.length+' experiences'}</Text></Pressable>
  {expanded&&choices.map(c=><Pressable key={c.id} testID={'outing-start-'+c.id.split(':').at(-1)} accessibilityRole="button" accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled} onPress={()=>onAction(c.id)} style={[S.button,!c.enabled&&{opacity:.45}]}><Text style={S.name}>{c.label}</Text><Text style={S.desc}>{c.detail}</Text></Pressable>)}</>:null}
 </View>;
}
const S=StyleSheet.create({card:{backgroundColor:'#203A3E',padding:14,borderRadius:16,borderWidth:1,borderColor:'#668D83',gap:10},eyebrow:{fontSize:10,fontWeight:'900',color:'#FFDEA7'},title:{fontSize:20,fontWeight:'900',color:'#F6F8F0'},desc:{fontSize:12,lineHeight:18,color:'#D0E1DA'},name:{fontSize:14,fontWeight:'800',color:'#F6F8F0'},button:{padding:12,minHeight:48,borderRadius:10,backgroundColor:'#355750',gap:5,borderWidth:1,borderColor:'#789C8F'},result:{padding:11,borderRadius:10,backgroundColor:'#374D3A',gap:5}});
