import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
export default function NeighborhoodBoard({view,commands,blocked,onAction}){
 const [selected,setSelected]=useState('commons');
 const choices=commands.filter(c=>c.id.startsWith('neighborhood:'));
 const buttons=cs=>cs.map(c=><Pressable key={c.id} testID={c.id} accessibilityRole="button" accessibilityState={{disabled:blocked||!c.enabled}} disabled={blocked||!c.enabled} onPress={()=>onAction(c.id)} style={[S.button,(blocked||!c.enabled)&&S.disabled]}><Text style={S.label}>{c.label}</Text><Text style={S.sub}>{c.detail}</Text></Pressable>);
 const p=view.places.find(p=>p.id===selected);
 return <View testID="neighborhood-board" style={S.board}>
 <Text style={S.kicker}>NEIGHBORHOOD LIFE</Text><Text style={S.title}>{view.city}</Text><Text style={S.sub}>Cultural familiarity {view.culture}/100 · certificates {view.education} · {view.retirement?'Retirement community':'Everyday life'}</Text>
 <View style={S.map}>{view.places.map((d,i)=><Pressable key={d.id} testID={'neighborhood-district-'+d.id} accessibilityRole="button" accessibilityState={{selected:d.id===selected}} onPress={()=>setSelected(d.id)} style={[S.tile,selected===d.id&&S.selected]}><Text style={S.symbol}>{['▥','✦','♧'][i]}</Text><Text style={S.label}>{d.name}</Text><Text style={S.sub}>{view.district===d.id?'Your home':d.venue}</Text></Pressable>)}</View>
 <View style={S.card}><Text style={S.label}>{p.name}</Text><Text style={S.sub}>Living cost ×{p.cost} · {p.visits} visits · trust {p.trust}/100</Text><Text style={S.sub}>{p.contact?'Recurring resident: '+p.contact:'Meet someone local on your next visit'}</Text>{buttons(choices.filter(c=>c.id==='neighborhood:move:'+p.id||c.id==='neighborhood:visit:'+p.id))}</View>
 {view.story?<View testID="neighborhood-story" style={S.card}><Text style={S.label}>{view.story.title}</Text><Text style={S.sub}>{view.story.status==='open'?view.story.prompt:'Your decision will have an outcome next year.'}</Text>{buttons(choices.filter(c=>c.id.startsWith('neighborhood:story:')))}</View>:null}
 {choices.some(c=>c.id.startsWith('neighborhood:trip:')||c.id.startsWith('neighborhood:experience:'))||view.trip?<View style={S.card}><Text style={S.label}>Vacation experiences</Text><Text style={S.sub}>{view.trip?view.trip.theme+(view.trip.choice?' · completed':' · choose your experience'):'Choose your travel theme.'}</Text>{buttons(choices.filter(c=>c.id.startsWith('neighborhood:trip:')||c.id.startsWith('neighborhood:experience:')))}</View>:null}
 {buttons(choices.filter(c=>['neighborhood:course','neighborhood:exchange','neighborhood:retirement'].includes(c.id)))}
 {view.memories.map((m,i)=><Text key={i} style={S.sub}>Year {m.year} · {m.text}</Text>)}
 </View>;
}
const S=StyleSheet.create({board:{padding:14,borderRadius:16,borderWidth:1,borderColor:'#436b5e',backgroundColor:'#19352e',gap:9},kicker:{fontSize:11,letterSpacing:1,fontWeight:'700',color:'#b2dbbd'},title:{fontSize:22,fontWeight:'800',color:'#eff8ef'},label:{fontSize:14,fontWeight:'700',color:'#eff8ef'},sub:{fontSize:12,lineHeight:18,color:'#b7d3c1'},map:{flexDirection:'row',flexWrap:'wrap',gap:5},tile:{flexGrow:1,flexBasis:'30%',minWidth:78,padding:8,borderRadius:9,borderWidth:1,borderColor:'#689a85',gap:3},symbol:{fontSize:24,color:'#c9e9ce'},selected:{backgroundColor:'#426b57'},button:{padding:9,borderRadius:9,borderWidth:1,borderColor:'#689a85',gap:3},disabled:{opacity:.45},card:{padding:10,borderRadius:9,backgroundColor:'#294b3e',gap:6}});
