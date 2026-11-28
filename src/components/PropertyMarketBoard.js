import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const dollars=n=>(n<0?'−$':'$')+Math.abs(Math.round(n)).toLocaleString('en-US');
export default function PropertyMarketBoard({view,commands,blocked,onAction}){
 const [filter,setFilter]=useState('market'),[opened,setOpened]=useState(null),[all,setAll]=useState(false);
 const rows=view.properties.filter(p=>filter==='owned'?p.playerOwned:!p.playerOwned);
 return <View testID="property-market-board" style={S.board}>
 <Text style={S.kicker}>REAL ESTATE · WORLD YEAR {view.year}</Text><Text style={S.title}>Dynamic property market</Text>
 <View style={S.row}><View style={S.stat}><Text style={S.number}>{view.index}</Text><Text style={S.muted}>Price index · {view.phase}</Text></View><View style={S.stat}><Text style={S.number}>{dollars(view.worth)}</Text><Text style={S.muted}>Your net property equity</Text></View></View>
 <Text style={S.muted}>Last year: rent {dollars(view.annual.rent)} · maintenance {dollars(view.annual.maintenance)} · mortgage interest {dollars(view.annual.interest)} · principal {dollars(view.annual.principal)}</Text>
 <View style={S.row}>{['market','owned'].map(t=><Pressable key={t} testID={'property-filter-'+t} accessibilityRole="button" accessibilityState={{selected:filter===t}} style={[S.button,{flex:1},filter===t&&S.selected]} onPress={()=>{setFilter(t);setOpened(null);setAll(false);}}><Text style={S.label}>{t==='market'?'Market listings':'My portfolio'}</Text></Pressable>)}</View>
 {!rows.length?<Text style={S.muted}>{filter==='owned'?'No independently owned real estate yet.':'New property listings emerge as your world advances.'}</Text>:null}
 {(all?rows:rows.slice(0,4)).map(p=><View key={p.id} testID={'market-property-'+p.id} style={S.card}>
 <Text style={S.label}>{p.name}</Text><Text style={S.muted}>Owner: {p.owner} · Condition {p.condition}/100{p.foreclosed?' · Lender listing':''}</Text><Text style={S.number}>{dollars(p.value)}</Text>
 <Text style={S.muted}>Tenant: {p.tenant||'Vacant'} · annual asking rent {dollars(p.annualRent)}</Text>
 {p.mortgage?<Text style={S.muted}>Mortgage {dollars(p.mortgage.balance)} · {p.mortgage.rate}% · {p.mortgage.years} years · {p.mortgage.missed} missed</Text>:null}
 {p.offer?<Text style={S.label}>Negotiated price {dollars(p.asking)}</Text>:null}
 {p.project?<Text style={S.label}>Construction due world year {p.project.due}</Text>:null}
 <Pressable testID={'property-open-'+p.id} accessibilityRole="button" accessibilityState={{expanded:opened===p.id}} style={S.button} onPress={()=>setOpened(v=>v===p.id?null:p.id)}><Text style={S.label}>{opened===p.id?'Hide decisions':p.playerOwned?'Manage property':'View purchase options'}</Text></Pressable>
 {opened===p.id?commands.filter(c=>c.id.startsWith('propertymarket:')&&Number(c.id.split(':')[2])===p.id).map(c=><Pressable key={c.id} testID={c.id} accessibilityRole="button" accessibilityState={{disabled:blocked||!c.enabled}} disabled={blocked||!c.enabled} onPress={()=>onAction(c.id)} style={[S.button,(blocked||!c.enabled)&&S.disabled]}><Text style={S.label}>{c.label}</Text><Text style={S.muted}>{c.detail}</Text></Pressable>):null}
 </View>)}
 {rows.length>4?<Pressable accessibilityRole="button" style={S.button} onPress={()=>setAll(v=>!v)}><Text style={S.label}>{all?'Show fewer':'Show all properties'}</Text></Pressable>:null}
 {view.news.slice(0,3).map((n,i)=><Text key={i} style={S.muted}>Year {n.year} · {n.text}</Text>)}
 </View>;
}
const S=StyleSheet.create({board:{padding:14,borderRadius:16,borderWidth:1,borderColor:'#66533d',backgroundColor:'#30291e',gap:10},kicker:{color:'#ecd1a1',fontSize:11,fontWeight:'700',letterSpacing:1},title:{color:'#fff6e7',fontSize:22,fontWeight:'800'},label:{color:'#fff6e7',fontSize:14,fontWeight:'700'},muted:{color:'#d8c8ae',fontSize:12,lineHeight:18},row:{flexDirection:'row',gap:6},stat:{flex:1,minWidth:0,padding:8,borderRadius:8,backgroundColor:'#453728'},number:{color:'#fff6e7',fontSize:19,fontWeight:'800'},card:{padding:10,borderRadius:10,backgroundColor:'#403326',gap:5},button:{padding:10,borderRadius:10,borderWidth:1,borderColor:'#927854',gap:3},selected:{backgroundColor:'#5c482f'},disabled:{opacity:.45}});
