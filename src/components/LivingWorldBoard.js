import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const C={bg:'#152A2A',panel:'#203D3A',muted:'#B9CFC7',ink:'#F3F9ED',gold:'#FFDFA5',green:'#C9F09E',line:'#47675E',red:'#FAB8B4',blue:'#A7CCFF'};
const cap=x=>Math.max(0,Math.min(100,Number(x)||0));
function Meter({label,value,bad=false}){
 return <View style={S.meter}><View style={S.split}><Text style={S.muted}>{label}</Text><Text style={S.metric}>{value}</Text></View><View style={S.track}><View style={[S.fill,{width:cap(value)+'%',backgroundColor:bad?C.red:C.green}]}/></View></View>;
}
function Avatar({name}){
 return <View style={S.avatar}><Text style={S.avatarText}>{name.split(' ').slice(0,2).map(x=>x[0]||'').join('')}</Text></View>;
}
function Choice({item,onAction}){
 return <Pressable key={item.id} testID={'autonomy-action-'+item.id.replaceAll(':','-')} accessibilityRole="button" accessibilityLabel={item.label+', '+item.detail} disabled={!item.enabled} accessibilityState={{disabled:!item.enabled}} onPress={()=>onAction(item.id)} style={({pressed})=>[S.action,!item.enabled&&{opacity:.4},pressed&&{opacity:.72}]}><Text style={S.actionTitle}>{item.label}</Text><Text style={S.actionNote}>{item.detail}</Text></Pressable>;
}
export default function LivingWorldBoard({view,onAction,choices=[],showAll=true}){
 const [selected,setSelected]=useState(null);
 const alumni=view.alumni||[],links=view.links||[],opportunities=view.opportunities||[];
 const active=alumni.find(p=>p.id===selected)||alumni[0];
 return <View testID="living-world-board" style={S.container}>
  <View style={S.split}><Text style={S.eyebrow}>YOUR LIVING SOCIAL WORLD</Text><Text style={S.eyebrow}>{alumni.length} ALUMNI</Text></View>
  <Text style={S.heading}>People keep living their own stories.</Text>
  <Text style={S.description}>Friendships, partnerships and rivalries change while you work, travel and grow older. You can reconnect or follow a future opportunity.</Text>
  {alumni.length?<><View style={S.roster}>{alumni.map(p=><Pressable key={p.id} testID={'alumni-'+p.id} accessibilityRole="button" accessibilityLabel={'Inspect '+p.name+' · '+p.status} accessibilityState={{selected:active?.id===p.id}} onPress={()=>setSelected(p.id)} style={[S.rosterMember,active?.id===p.id&&S.rosterActive]}><Avatar name={p.name}/><Text numberOfLines={2} style={S.name}>{p.name}</Text><Text style={S.role}>{p.status}</Text></Pressable>)}</View>
   {active?<View testID="alumni-profile" style={S.profile}><View style={S.split}><Text style={S.eyebrow}>LIFELONG CONNECTION</Text><Text style={S.eyebrow}>{active.profession}</Text></View><Text style={S.h3}>{active.name}</Text><Text style={S.description}>Former classmate · {active.status} · {active.collaborations} collaborations · {active.contests} competitions</Text><View style={S.meters}><Meter label="Trust" value={active.trust}/><Meter label="Rivalry" value={active.rivalry} bad/></View>{active.history?.slice(-2).map((h,i)=><Text key={i} style={S.muted}>Age {h.age}: {h.event||h.track||h.kind}</Text>)}{choices.filter(c=>c.id.startsWith('autonomy:alumni:'+active.id+':')).map(c=><Choice key={c.id} item={c} onAction={onAction}/>)}</View>:null}
   {links.length?<View testID="autonomous-relationships" style={S.links}><Text style={S.eyebrow}>RELATIONSHIPS DEVELOPING ON THEIR OWN</Text>{links.slice(-6).reverse().map(link=><View key={link.id} style={S.linkRow}><View style={S.nodes}><View style={S.dot}/><View style={S.connector}/><View style={[S.dot,{backgroundColor:link.status==='rivals'?C.red:C.blue}]}/></View><View style={{flex:1,gap:3}}><Text style={S.linkTitle}>{link.nameA} & {link.nameB}</Text><Text style={S.muted}>{link.status==='partners'?link.kind+' partners':link.status} · {link.years} years connected · Trust {link.trust}/100</Text></View></View>)}</View>:null}
  </>:<Text style={S.description}>Play school-life projects to meet classmates. Their relationships will continue into adulthood.</Text>}
  {opportunities.length?<View testID="autonomous-opportunities" style={S.events}><Text style={S.eyebrow}>THE YEARS-AHEAD STORY MAP</Text>{opportunities.map(arc=><View key={arc.id} style={[S.event,arc.ready&&S.eventReady]}><View style={S.split}><Text style={S.eyebrow}>{arc.ready?'YOUR RESPONSE IS READY':'RETURNING AT AGE '+arc.dueAge}</Text><Text style={S.muted}>CHAPTER {arc.stage+1}/3</Text></View><Text style={S.h3}>{arc.title}</Text><Text style={S.description}>{arc.chapterTitle} · {arc.chapterText}</Text><View style={S.chapters}>{[0,1,2].map(i=><View key={i} style={[S.chapter,i<=arc.stage&&S.chapterFilled]}/>)}</View><Text style={S.muted}>Began at age {arc.startedAge} · {arc.npcName} · Quality {arc.quality}/100</Text>{arc.ready&&showAll?choices.filter(c=>c.id.startsWith('autonomy:arc:'+arc.id+':')).map(c=><Choice key={c.id} item={c} onAction={onAction}/>):null}</View>)}</View>:null}
  {showAll&&view.completed?.length?<View style={S.links}><Text style={S.eyebrow}>COLLECTED LIFE CHAPTERS</Text>{view.completed.slice(0,4).map(x=><View key={x.id} style={S.record}><Text style={S.linkTitle}>{x.title}</Text><Text style={S.muted}>Age {x.startedAge}–{x.endedAge} · {x.outcome} · {x.history.length} decisions</Text></View>)}</View>:null}
 </View>;
}
const S=StyleSheet.create({
 container:{backgroundColor:C.bg,borderWidth:1,borderColor:C.line,borderRadius:17,padding:13,gap:12},
 split:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:7},
 eyebrow:{fontSize:10,color:C.gold,fontWeight:'900',letterSpacing:.7,flexShrink:1},
 heading:{fontSize:19,fontWeight:'900',color:C.ink,lineHeight:25},h3:{fontSize:15,color:C.ink,fontWeight:'800'},
 description:{fontSize:12,color:C.muted,lineHeight:19},
 roster:{flexDirection:'row',flexWrap:'wrap',gap:7},
 rosterMember:{width:'23%',minWidth:62,flexGrow:1,alignItems:'center',backgroundColor:'#25443E',padding:8,borderRadius:12,borderWidth:1,borderColor:'#42645B',gap:5,minHeight:112},
 rosterActive:{borderColor:C.green,backgroundColor:'#33554B'},
 avatar:{width:42,height:42,borderRadius:21,backgroundColor:'#487B6B',alignItems:'center',justifyContent:'center'},
 avatarText:{fontSize:16,fontWeight:'900',color:C.ink},name:{color:C.ink,fontSize:11,fontWeight:'800',textAlign:'center'},
 role:{color:C.gold,fontSize:10,textAlign:'center',textTransform:'capitalize'},
 profile:{backgroundColor:'#1E3B36',borderRadius:12,padding:12,gap:10,borderColor:'#557E69',borderWidth:1},
 meters:{flexDirection:'row',flexWrap:'wrap',gap:8},meter:{flex:1,flexBasis:108,gap:5},
 muted:{fontSize:11,color:C.muted,lineHeight:16},metric:{fontSize:11,color:C.ink,fontWeight:'800'},
 track:{height:7,borderRadius:5,backgroundColor:'#4B5956',overflow:'hidden'},fill:{height:7,borderRadius:5},
 action:{borderRadius:9,borderWidth:1,borderColor:'#69947B',backgroundColor:'#2B5044',padding:11,minHeight:48,justifyContent:'center',gap:3},
 actionTitle:{fontSize:12,fontWeight:'800',color:C.ink},actionNote:{fontSize:11,color:C.muted,lineHeight:16},
 links:{padding:12,backgroundColor:'#1B3431',borderRadius:11,gap:9},
 linkRow:{flexDirection:'row',gap:10,alignItems:'center',paddingVertical:6,borderBottomWidth:1,borderColor:'#416259'},
 nodes:{width:39,flexDirection:'row',alignItems:'center'},dot:{height:10,width:10,borderRadius:5,backgroundColor:C.green},
 connector:{height:2,flex:1,backgroundColor:'#B1CAA9'},linkTitle:{fontSize:12,color:C.ink,fontWeight:'700'},
 events:{gap:10},event:{backgroundColor:'#1F3937',borderRadius:11,padding:12,gap:9,borderWidth:1,borderColor:C.line},
 eventReady:{borderColor:C.green},chapters:{flexDirection:'row',gap:5},
 chapter:{height:7,flex:1,borderRadius:4,backgroundColor:'#496359'},chapterFilled:{backgroundColor:C.green},
 record:{paddingBottom:8,borderBottomWidth:1,borderColor:'#44665D',gap:4}
});
