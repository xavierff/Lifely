import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const dollars=n=>(n<0?'−$':'$')+Math.abs(Math.round(n)).toLocaleString('en-US');
export default function LivingEconomyBoard({mode,view,commands,blocked,onAction}){
 const [all,setAll]=useState(false);
 const [expanded,setExpanded]=useState({});
 const rows=view.companies.filter(c=>c.status==='active');
 return <View testID={'living-economy-'+mode} style={S.board}>
 <Text style={S.kicker}>WORLD YEAR {view.year} · {view.cycle.toUpperCase()}</Text>
 <Text style={S.title}>{mode==='work'?'Real employers':'Living business market'}</Text>
 <Text style={S.muted}>{mode==='work'?'NPC-owned firms hire people you know. Your contract is tied to their actual finances.':'Companies compete, reinvest, distribute profits and may go bankrupt.'}</Text>
 {view.employer?<Text testID="npc-employer" style={S.label}>Your employer: {view.employer}</Text>:null}
 <View style={S.row}><View style={S.stat}><Text style={S.number}>{rows.length}</Text><Text style={S.muted}>Active firms</Text></View><View style={S.stat}><Text style={S.number}>{mode==='work'?rows.reduce((n,c)=>n+c.vacancies,0):dollars(view.worth)}</Text><Text style={S.muted}>{mode==='work'?'Open positions':'Your company assets'}</Text></View></View>
 {!rows.length?<Text style={S.muted}>Businesses emerge as adult NPCs build capital.</Text>:null}
 {(all?rows:rows.slice(0,4)).map(c=><View testID={'npc-company-'+c.id} key={c.id} style={S.card}>
 <Text style={S.label}>{c.name}</Text><Text style={S.muted}>Owner: {c.owner} · {c.sector} · {c.vacancies} vacancies</Text>
 <Text style={S.muted}>Value {dollars(c.value)} · last profit {dollars(c.lastProfit)} · payroll {dollars(c.lastPayroll)}</Text>
 <Text style={S.muted}>Demand {c.demand}/100 · reputation {c.reputation}/100</Text>
 {mode==='money'?<><Text style={S.muted}>Corporate debt {dollars(c.corporate.debt)} · {c.corporate.listed?'Listed':'Private'} · {c.corporate.regions} markets · {c.corporate.products} products</Text><Text style={S.muted}>Your equity {dollars(c.corporate.playerValue)} · dividends {dollars(c.corporate.dividends)} · public float {c.corporate.publicFloat}%</Text>{c.corporate.parentId?<Text style={S.muted}>Subsidiary of {view.companies.find(o=>o.id===c.corporate.parentId)?.name||'Group company'}</Text>:null}<Pressable testID={'corporate-toggle-'+c.id} accessibilityRole="button" accessibilityState={{expanded:!!expanded[c.id]}} style={S.button} onPress={()=>setExpanded(v=>({...v,[c.id]:!v[c.id]}))}><Text style={S.label}>{expanded[c.id]?'Hide corporate decisions':c.playerOwned?'Open CEO dashboard':'Invest & negotiate'}</Text></Pressable>{expanded[c.id]?<View testID={'corporate-panel-'+c.id} style={{gap:6}}>{c.corporate.offer?<Text style={S.label}>Counteroffer: {dollars(c.corporate.offer.price)}</Text>:null}{commands.filter(x=>x.id.startsWith('corporate:')&&Number(x.id.split(':')[2])===c.id).map(x=><Pressable key={x.id} testID={x.id} accessibilityRole="button" accessibilityState={{disabled:blocked||!x.enabled}} disabled={blocked||!x.enabled} onPress={()=>onAction(x.id)} style={[S.button,(blocked||!x.enabled)&&S.disabled]}><Text style={S.label}>{x.label}</Text><Text style={S.muted}>{x.detail}</Text></Pressable>)}{c.corporate.history.slice(-3).reverse().map((h,i)=><Text key={i} style={S.muted}>Year {h.year} · {h.text}</Text>)}</View>:null}</>:null}
 {c.staff.map(e=><Text key={e.personId} style={S.muted}>{e.name} · {e.title}</Text>)}
 {commands.filter(x=>{const [prefix,action,id]=x.id.split(':');return prefix==='economy'&&Number(id)===c.id&&(mode==='work'?action==='apply':action!=='apply');}).map(x=><Pressable testID={x.id} accessibilityRole="button" accessibilityState={{disabled:blocked||!x.enabled}} disabled={blocked||!x.enabled} key={x.id} onPress={()=>onAction(x.id)} style={[S.button,(blocked||!x.enabled)&&S.disabled]}><Text style={S.label}>{x.label}</Text><Text style={S.muted}>{x.detail}</Text></Pressable>)}
 </View>)}
 {rows.length>4?<Pressable accessibilityRole="button" onPress={()=>setAll(x=>!x)} style={S.button}><Text style={S.label}>{all?'Show recent companies':'Show all companies'}</Text></Pressable>:null}
 {view.news.slice(0,4).map((n,i)=><Text key={i} style={S.muted}>Year {n.year} · {n.text}</Text>)}
 </View>;
}
const S=StyleSheet.create({board:{padding:14,borderRadius:16,borderWidth:1,borderColor:'#36544d',backgroundColor:'#192e2a',gap:10},kicker:{color:'#a2ddbf',fontSize:11,fontWeight:'700',letterSpacing:1},title:{color:'#f4f6ec',fontSize:22,fontWeight:'800'},label:{color:'#eef5ec',fontSize:14,fontWeight:'700'},muted:{color:'#b2c8be',fontSize:12,lineHeight:18},row:{flexDirection:'row',gap:6},stat:{flex:1,minWidth:0,padding:8,borderRadius:8,backgroundColor:'#233e36'},number:{color:'#f0f8ee',fontSize:19,fontWeight:'800'},card:{padding:10,borderRadius:10,backgroundColor:'#213b34',gap:5},button:{padding:10,borderRadius:10,borderWidth:1,borderColor:'#668d77',gap:3},disabled:{opacity:.45}});
