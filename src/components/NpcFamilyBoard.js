import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const dollars=n=>(n<0?'−$':'$')+Math.abs(Math.round(n)).toLocaleString('en-US');
export default function NpcFamilyBoard({view}){
 const [expanded,setExpanded]=useState(false);
 const rows=expanded?view.households:view.households.slice(0,4);
 return <View testID="npc-family-board" style={S.board}>
  <Text style={S.kicker}>THE WORLD BEYOND YOU</Text><Text style={S.title}>Independent families</Text>
  <Text style={S.muted}>People you know build households, raise children, change jobs and keep in touch with other families—even without your involvement.</Text>
  <View style={S.stats}>{[['Marriages',view.households.filter(h=>h.status==='married').length],['Children',view.households.reduce((n,h)=>n+h.children.length,0)],['Family links',view.links.length]].map(([label,n])=><View key={label} style={S.stat}><Text style={S.number}>{n}</Text><Text style={S.muted}>{label}</Text></View>)}</View>
  {!rows.length?<Text style={S.muted}>Independent households will emerge as adult friends and relatives grow older.</Text>:null}
  {rows.map(h=><View key={h.id} testID={'npc-family-'+h.id} style={S.card}>
   <Text style={S.kicker}>{h.status.toUpperCase()} · SINCE AGE {h.startedAge}</Text>
   <Text style={S.label}>{h.names.join(' & ')}</Text>
   {h.adults.map(p=><Text key={p.id} style={S.muted}>{p.name} · {p.alive?'Age '+p.age+' · '+p.occupation:'In memory'}</Text>)}
   {h.status==='married'?<Text style={S.muted}>Relationship strength {h.bond}/100 · combined net worth {dollars(h.netWorth)}</Text>:null}
   <Text style={S.muted}>Last annual child costs {dollars(h.lastChildCost)}</Text>
   {h.children.length?<Text style={S.label}>Children</Text>:null}
   {h.children.map(p=><Text key={p.id} style={S.muted}>{p.name} · {p.alive?'Age '+p.age+' · '+p.occupation:'In memory'}</Text>)}
  </View>)}
  {view.households.length>4?<Pressable accessibilityRole="button" accessibilityState={{expanded}} onPress={()=>setExpanded(x=>!x)} style={S.button}><Text style={S.label}>{expanded?'Show recent families':'Show all '+view.households.length+' families'}</Text></Pressable>:null}
  {view.links.length?<><Text style={S.label}>Connections between households</Text>{view.links.slice(-5).reverse().map(l=><View key={l.ids.join(':')} style={S.card}><Text style={S.muted}>{l.names.join(' / ')}</Text><Text style={S.label}>{l.affinity}/100 affinity · {l.meetings} gatherings</Text></View>)}</>:null}
  {view.news.length?<><Text style={S.label}>Family news</Text>{view.news.slice(0,6).map((n,i)=><Text key={n.age+':'+n.unionId+':'+i} style={S.muted}>Age {n.age} · {n.text}</Text>)}</>:null}
 </View>;
}
const S=StyleSheet.create({board:{padding:14,borderRadius:16,borderWidth:1,borderColor:'#36544d',backgroundColor:'#192e2a',gap:10},kicker:{color:'#a2ddbf',fontSize:11,fontWeight:'700',letterSpacing:1},title:{color:'#f4f6ec',fontSize:22,fontWeight:'800'},label:{color:'#eef5ec',fontSize:14,fontWeight:'700'},muted:{color:'#b2c8be',fontSize:12,lineHeight:18},stats:{flexDirection:'row',gap:5},stat:{flex:1,minWidth:0,padding:6,borderRadius:8,backgroundColor:'#233e36'},number:{color:'#f0f8ee',fontSize:21,fontWeight:'800'},card:{padding:10,borderRadius:10,backgroundColor:'#213b34',gap:4},button:{padding:11,borderRadius:10,borderWidth:1,borderColor:'#668d77'}});
