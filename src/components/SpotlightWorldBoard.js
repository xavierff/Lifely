import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const fmt=n=>'$'+n.toLocaleString('en-US');
export default function SpotlightWorldBoard({view,commands,blocked,onAction}){
 const [open,setOpen]=useState(false),options=commands.filter(c=>c.id.startsWith('spotlight:')),t=view.tour;
 if(!view.path&&!view.history.length&&!view.legacy.length)return null;
 return <View testID="spotlight-world" style={S.root}><Text style={S.eyebrow}>STAGES, RIVALS & RECOGNITION</Text><Text style={S.title}>The celebrity world</Text>
 <Text style={S.small}>{view.tours} completed tours · {view.successfulStops} successful stops · Net ticket receipts {fmt(view.net)}</Text>
 {t?<View style={S.panel} testID="spotlight-tour"><Text style={S.eyebrow}>TOUR STOP {t.stage+1}/3</Text><Text style={S.name}>{t.name} — {t.next}</Text><Text style={S.small}>Capacity {t.capacity} · Fatigue {t.fatigue}/100 · Receipts {fmt(t.receipts)}</Text><Text style={S.small}>Complete by age {t.dueAge}</Text>{t.stops.map(x=><Text key={x.venue} style={S.small}>{x.venue} · {x.attendance} fans · {fmt(x.net)} net</Text>)}</View>:null}
 {view.peers.map(p=><View key={p.id} style={S.panel}><Text style={S.name}>{p.name}</Text><Text style={S.small}>Fame {p.fame} · Craft {p.craft} · Projects {p.projects}</Text><Text style={S.small}>Respect {p.respect} · Rivalry {p.rivalry}</Text></View>)}
 {!blocked&&options.length?<><Pressable testID="spotlight-expand" accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(!open)} style={S.panel}><Text style={S.name}>{open?'Hide decisions':'Explore tours and industry relationships'}</Text></Pressable>{open&&options.map(c=><Pressable key={c.id} testID={c.id.replace(/:/g,'-')} accessibilityRole="button" disabled={!c.enabled} accessibilityState={{disabled:!c.enabled}} onPress={()=>onAction(c.id)} style={[S.panel,!c.enabled&&{opacity:.45}]}><Text style={S.name}>{c.label}</Text><Text style={S.small}>{c.detail}</Text></Pressable>)}</>:null}
 {view.history.slice(0,3).map(h=><Text key={h.id} style={S.small}>Age {h.age} · {h.message}</Text>)}{view.legacy.map((h,i)=><Text key={i} style={S.small}>{h.ancestor}: {h.message}</Text>)}</View>;
}
const S=StyleSheet.create({root:{padding:13,gap:9,borderRadius:15,backgroundColor:'#433444',borderWidth:1,borderColor:'#9D819F'},title:{fontSize:21,fontWeight:'900',color:'#FFF4EB'},eyebrow:{fontSize:10,fontWeight:'900',color:'#ECCD9C'},name:{fontSize:14,fontWeight:'800',color:'#FFF4EB',flexShrink:1},small:{fontSize:12,lineHeight:18,color:'#E4D9E8',flexShrink:1},panel:{padding:11,minHeight:44,gap:5,borderRadius:9,backgroundColor:'#604C62'}});
