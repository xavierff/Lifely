import React,{useMemo,useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet} from 'react-native';
import {palette as C} from '../content/visual-system.mjs';
import {journalModel,journalKinds} from '../content/premium-ux.mjs';
export function NextMoveBoard({model,blocked,onAction,onNavigate}){
 const [open,setOpen]=useState(false);
 if(blocked)return null;
 return <View testID="next-move-board" style={S.root}><View style={S.row}><View style={{flex:1,gap:4}}><Text style={S.kicker}>YOUR YEAR AT A GLANCE</Text><Text style={S.title}>Make this year yours</Text></View><View style={S.token}><Text style={S.number}>{model.actions}/3</Text><Text style={S.small}>Activities</Text></View></View>
 <Text style={S.small}>{model.available} available activities · Age {model.age}</Text>
 <Pressable testID="dashboard-expand" accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(v=>!v)} style={S.button}><Text style={S.label}>{open?'Hide suggestions':'Explore your suggested activities'}</Text></Pressable>
 {open&&model.suggestions.map(c=><Pressable key={c.id} testID={'recommended-'+c.id.replaceAll(':','-')} accessibilityRole="button" accessibilityLabel={'Recommended: '+c.label} onPress={()=>onAction(c.id)} style={({pressed})=>[S.button,pressed&&S.pressed]}><Text style={S.kicker}>{c.reason.toUpperCase()}</Text><Text style={S.label}>{c.label}</Text><Text style={S.small}>{c.detail}</Text></Pressable>)}
 {!model.suggestions.length?<Text style={S.small}>No activities remain this year. Advance when you are ready.</Text>:null}
 {open&&model.categories.length?<View style={S.wrap}>{model.categories.map(c=><Pressable key={c.id} testID={'dashboard-tab-'+c.id} accessibilityRole="button" accessibilityLabel={'Explore '+c.id+' activities'} onPress={()=>onNavigate(c.id==='Justice'?'More':c.id)} style={S.chip}><Text style={S.label}>{c.id} · {c.count}</Text></Pressable>)}</View>:null}
 </View>;
}
export function LifeJournal({history}){
 const [category,setCategory]=useState('All'),[query,setQuery]=useState(''),[limit,setLimit]=useState(12);
 const view=useMemo(()=>journalModel(history,{category,query,limit}),[history,category,query,limit]);
 return <View testID="life-journal-board" style={S.root}><TextInput testID="journal-search" accessibilityLabel="Search life journal" placeholder="Search memories or age…" placeholderTextColor={C.muted} value={query} onChangeText={v=>{setQuery(v);setLimit(12);}} style={S.input}/><View style={S.wrap}>{journalKinds.map(k=><Pressable key={k} testID={'journal-filter-'+k} accessibilityRole="button" accessibilityState={{selected:category===k}} accessibilityLabel={'Journal: '+k} onPress={()=>{setCategory(k);setLimit(12);}} style={[S.chip,category===k&&S.selected]}><Text style={S.label}>{k==='People'?'People memories':k}</Text></Pressable>)}</View><Text style={S.small}>{view.total} matching memories · newest first</Text>
 {view.entries.map((h,i)=><View key={h.index} style={S.entry}>{i===0||view.entries[i-1].age!==h.age?<Text style={S.kicker}>AGE {h.age}</Text>:null}<Text style={[S.body,h.kind==='achievement'&&{color:C.gold}]}>{h.text}</Text></View>)}
 {!view.total?<Text style={S.small}>No memories match. Try another filter or search.</Text>:null}
 {view.total>limit?<Pressable testID="journal-more" accessibilityRole="button" onPress={()=>setLimit(n=>n+24)} style={S.button}><Text style={S.label}>Show older memories</Text></Pressable>:null}
 {limit>12?<Pressable accessibilityRole="button" onPress={()=>setLimit(12)} style={S.button}><Text style={S.label}>Show recent</Text></Pressable>:null}
 </View>;
}
const S=StyleSheet.create({root:{padding:12,gap:9,borderRadius:15,borderWidth:1,borderColor:C.border,backgroundColor:C.surface},row:{flexDirection:'row',alignItems:'center',gap:8},wrap:{flexDirection:'row',flexWrap:'wrap',gap:6},token:{backgroundColor:C.raised,padding:8,borderRadius:9,alignItems:'center'},number:{fontSize:20,fontWeight:'900',color:C.accent},title:{fontSize:21,fontWeight:'800',color:C.text},kicker:{fontSize:11,fontWeight:'800',letterSpacing:.3,color:C.gold},small:{fontSize:13,lineHeight:19,color:C.muted},label:{fontSize:14,fontWeight:'700',color:C.text},body:{fontSize:15,lineHeight:22,color:C.text},button:{padding:10,minHeight:44,borderRadius:9,borderWidth:1,borderColor:C.border,backgroundColor:C.raised,gap:4},chip:{minHeight:44,paddingHorizontal:10,paddingVertical:8,justifyContent:'center',borderRadius:9,borderWidth:1,borderColor:C.border,backgroundColor:C.raised},selected:{borderColor:C.accent,borderWidth:2},input:{minHeight:46,borderRadius:9,borderWidth:1,borderColor:C.border,color:C.text,padding:10,fontSize:15},entry:{paddingVertical:9,borderBottomWidth:1,borderColor:C.border,gap:4},pressed:{opacity:.7}});
