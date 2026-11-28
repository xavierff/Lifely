import React,{useState,useMemo,useEffect,useRef} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet,Animated,AccessibilityInfo} from 'react-native';
import {palette as C} from '../content/visual-system.mjs';
import {actionCategories,findActions} from '../content/action-discovery.mjs';
const fmt=n=>(n<0?'−':'+')+'$'+Math.abs(n).toLocaleString('en-US');
export default function ActionDiscoveryBoard({commands,blocked,actions,receipt,onAction,onNavigate}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[category,setCategory]=useState('All'),[locked,setLocked]=useState(false),[limit,setLimit]=useState(10),[reduce,setReduce]=useState(false);
 const opacity=useRef(new Animated.Value(1)).current;
 useEffect(()=>{AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(()=>{});const sub=AccessibilityInfo.addEventListener?.('reduceMotionChanged',setReduce);return()=>sub?.remove?.();},[]);
 useEffect(()=>{if(receipt&&!reduce){opacity.setValue(.6);Animated.timing(opacity,{toValue:1,duration:180,useNativeDriver:true}).start();}else opacity.setValue(1);},[receipt,reduce]);
 const matches=useMemo(()=>open&&!blocked?findActions(commands,{query,category,includeLocked:locked}):[],[commands,open,blocked,query,category,locked]);
 const available=commands.reduce((n,c)=>n+Number(c.enabled),0);
 const select=(c)=>{onAction(c);};
 return <View testID="action-discovery" style={S.root}>
  <Pressable testID="action-finder-toggle" accessibilityRole="button" accessibilityState={{expanded:open,disabled:blocked}} disabled={blocked} onPress={()=>setOpen(!open)} style={S.header}>
   <View style={{flex:1,gap:3}}><Text style={S.eyebrow}>YOUR NEXT MOVE</Text><Text style={S.title}>{open?'Hide activity finder':'Find something to do'}</Text><Text style={S.small}>{blocked?'Finish the current decision first':available+' available activities · '+actions+' actions left'}</Text></View><Text style={S.glyph}>{open?'−':'+'}</Text>
  </Pressable>
  {receipt?<Animated.View testID="action-receipt" accessibilityLiveRegion="polite" style={[S.receipt,{opacity}]}><Text style={S.eyebrow}>DECISION RECORDED</Text><Text style={S.name}>{receipt.label}</Text><Text style={S.small}>{receipt.actions} actions left{receipt.cash?' · '+fmt(receipt.cash):''}{receipt.changes.map(x=>' · '+x.key+' '+(x.delta>0?'+':'')+x.delta).join('')}</Text></Animated.View>:null}
  {open&&!blocked?<><TextInput testID="action-finder-input" accessibilityLabel="Search activities" placeholder="Search activities, jobs, people…" placeholderTextColor="#B0C5C3" value={query} onChangeText={v=>{setQuery(v);setLimit(10);}} style={S.input} returnKeyType="search"/>
   <View style={S.wrap}>{actionCategories.map(k=><Pressable key={k} accessibilityRole="button" accessibilityState={{selected:category===k}} onPress={()=>{setCategory(k);setLimit(10);}} style={[S.chip,category===k&&S.selected]}><Text style={S.name}>{k}</Text></Pressable>)}</View>
   <Pressable accessibilityRole="checkbox" accessibilityState={{checked:locked}} onPress={()=>{setLocked(!locked);setLimit(10);}} style={S.panel}><Text style={S.small}>{locked?'✓':'○'} Include unavailable activities</Text></Pressable>
   <Text style={S.small}>{matches.length} matching activities</Text>
   {matches.slice(0,limit).map(c=><Pressable key={c.id} testID={'finder-'+c.id.replace(/:/g,'-')} accessibilityRole="button" accessibilityLabel={'Finder: '+c.label} accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled} onPress={()=>select(c)} style={({pressed})=>[S.panel,!c.enabled&&{opacity:.5},pressed&&{opacity:.7}]}><Text style={S.eyebrow}>{c.category}</Text><Text style={S.name}>{c.label}</Text><Text style={S.small}>{c.detail}</Text></Pressable>)}
   {!matches.length?<Text style={S.small}>No matching activities. Try a different search or include unavailable choices.</Text>:null}
   {matches.length>limit?<Pressable testID="action-finder-more" accessibilityRole="button" onPress={()=>setLimit(limit+10)} style={S.panel}><Text style={S.name}>Show more results</Text></Pressable>:null}
   {category!=='All'?<Pressable accessibilityRole="button" onPress={()=>{setOpen(false);onNavigate(category);}} style={S.panel}><Text style={S.name}>Open {category==='Justice'?'Justice in More':category} tab</Text></Pressable>:null}
  </>:null}
 </View>;
}
const S=StyleSheet.create({root:{padding:12,gap:9,borderRadius:15,backgroundColor:C.raised,borderWidth:1,borderColor:C.border},header:{flexDirection:'row',alignItems:'center',gap:8,minHeight:48},eyebrow:{fontSize:10,fontWeight:'900',color:'#E4D7A7'},title:{fontSize:19,fontWeight:'900',color:'#F2F8EF'},name:{fontSize:14,fontWeight:'800',color:'#F2F8EF',flexShrink:1},small:{fontSize:12,lineHeight:18,color:'#D3E5DD',flexShrink:1},glyph:{fontSize:23,fontWeight:'900',color:'#C9F28A'},panel:{padding:11,minHeight:44,gap:4,borderRadius:9,backgroundColor:'#405A55'},receipt:{padding:10,gap:4,borderRadius:9,backgroundColor:'#466445'},input:{fontSize:16,color:'#F2F8EF',padding:12,borderRadius:9,borderWidth:1,borderColor:'#79998F',backgroundColor:'#334D48',minHeight:48},wrap:{flexDirection:'row',flexWrap:'wrap',gap:5},chip:{paddingHorizontal:10,paddingVertical:8,minHeight:44,justifyContent:'center',borderRadius:8,backgroundColor:'#405A55'},selected:{backgroundColor:'#617A4F',borderWidth:1,borderColor:'#C9F28A'}});
