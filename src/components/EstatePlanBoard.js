import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
export default function EstatePlanBoard({view,commands,blocked,onAction}){
 const [expanded,setExpanded]=useState(false),options=commands.filter(c=>c.id.startsWith('estate:'));
 if(view.children.length<2&&!view.plan&&!view.ancestors.length)return null;
 return <View testID="estate-plan-board" style={S.root}>
  <Text style={S.eyebrow}>FAMILY LEGACY · FICTIONAL GAME RULES</Text><Text style={S.title}>Plan the next generation</Text>
  <Text style={S.body}>{view.plan?view.plan.mode==='equal'?'Equal shares recorded':'A larger share is reserved for one child':'Original estate rules are in use.'} Education funds remain separate.</Text>
  {view.children.map(p=><View key={p.id} style={S.row}><Text style={S.name}>{p.name}</Text><Text style={S.body}>{p.share===null?'Not allocated':'$'+p.share.toLocaleString('en-US')}</Text></View>)}
  {view.plan?<Text style={S.body}>Illustrative shares based on current unearmarked net estate. Values change over time.</Text>:null}
  {view.dispute?<View style={S.event} testID="estate-dispute"><Text style={S.eyebrow}>INHERITANCE DISAGREEMENT</Text><Text style={S.name}>{view.dispute.challengerName} questions {view.dispute.preferredName}'s share</Text><Text style={S.body}>Pressure {view.dispute.pressure}/100 · Due age {view.dispute.dueAge}</Text></View>:null}
  {!blocked&&options.length?<><Pressable testID="estate-expand" accessibilityRole="button" accessibilityState={{expanded}} onPress={()=>setExpanded(!expanded)} style={S.action}><Text style={S.name}>{expanded?'Hide estate choices':'Discuss estate plans'}</Text></Pressable>{expanded&&options.map(c=><Pressable key={c.id} testID={c.id.replace(/:/g,'-')} accessibilityRole="button" disabled={!c.enabled} accessibilityState={{disabled:!c.enabled}} onPress={()=>onAction(c.id)} style={[S.action,!c.enabled&&{opacity:.45}]}><Text style={S.name}>{c.label}</Text><Text style={S.body}>{c.detail}</Text></Pressable>)}</>:null}
  {view.history.map(h=><Text key={h.id} style={S.body}>Age {h.age} · {h.message}</Text>)}
  {view.ancestors.length?<View style={S.event}><Text style={S.eyebrow}>INHERITED FAMILY HISTORY</Text>{view.ancestors.map((h,i)=><Text key={i} style={S.body}>{h.ancestor} · {h.message}</Text>)}</View>:null}
 </View>;
}
const S=StyleSheet.create({root:{padding:13,gap:9,borderRadius:14,borderWidth:1,borderColor:'#7B927D',backgroundColor:'#293D37'},title:{fontSize:19,fontWeight:'900',color:'#FCF7E7'},eyebrow:{fontSize:10,fontWeight:'900',color:'#F5D9A8'},body:{fontSize:12,lineHeight:18,color:'#D7E1D7',flexShrink:1},name:{fontSize:14,fontWeight:'800',color:'#FFF7E7',flexShrink:1},row:{flexDirection:'row',justifyContent:'space-between',gap:8},action:{padding:11,minHeight:48,gap:5,borderRadius:9,backgroundColor:'#405C50'},event:{padding:10,gap:5,borderRadius:10,backgroundColor:'#504A3E'}});
