import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const C={bg:'#1A2C33',panel:'#233841',ink:'#F7F7ED',muted:'#B7CBC5',accent:'#C9F28A',gold:'#FFDBA2',line:'#486960',warn:'#FFBBA9'};
function Metric({label,value,warn=false}){
 const now=Math.max(0,Math.min(100,Math.round(value||0)));
 return <View style={S.metric}><View style={S.between}><Text style={S.small}>{label}</Text><Text style={[S.small,{color:warn?C.warn:C.accent,fontWeight:'900'}]}>{now}</Text></View>
  <View style={S.track} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{min:0,max:100,now}}><View style={[S.fill,{width:now+'%',backgroundColor:warn?C.warn:C.accent}]}/></View>
 </View>;
}
function Action({item,onAction,id}){
 return <Pressable testID={id} accessibilityRole="button" accessibilityLabel={item.label+', '+item.detail}
  accessibilityState={{disabled:!item.enabled}} disabled={!item.enabled} onPress={()=>onAction(item.id)}
  style={({pressed})=>[S.action,!item.enabled&&{opacity:.42},pressed&&{opacity:.72}]}>
  <Text style={S.actionText}>{item.label}</Text><Text style={S.small}>{item.detail}</Text>
 </Pressable>;
}
export default function FamilyChapterBoard({view,onChoose}){
 if(!view)return null;
 return <View testID="family-active-chapter" style={S.scene}>
  <View style={S.between}><Text style={S.overline}>LIVING FAMILY STORY · {view.round}/3</Text><Text style={S.count}>{view.people.length>1?'SIBLING STORY':'FAMILY MOMENT'}</Text></View>
  <Text style={S.title}>{view.title}</Text><Text style={S.small}>{view.story}</Text>
  <View style={S.cast}>
   {view.people.map(p=><View key={p.id} style={S.person}>
    <Text style={S.subtitle}>{p.name} · {p.role}</Text>
    <Text style={S.small}>{p.personality} · values {p.values}</Text>
    <Metric label={'Trust · '+p.name} value={p.trust}/>
   </View>)}
  </View>
  <View style={S.between}><Metric label="Shared understanding" value={view.trust}/><Metric label="Unresolved tension" value={view.conflict} warn/></View>
  <Text style={S.chapter}>{view.chapter}</Text><Text style={S.prompt}>{view.prompt}</Text>
  {view.history.slice(-1).map((x,i)=><Text key={i} style={S.recap}>Previously: {x.response}</Text>)}
  <Text style={S.overline}>HOW DO YOU RESPOND?</Text>
  {view.options.map(option=><Pressable key={option.index} testID={'family-decision-'+option.index}
   accessibilityRole="button" accessibilityLabel={option.label+', '+option.detail}
   onPress={()=>onChoose(option.index)} style={({pressed})=>[S.choice,pressed&&{opacity:.7}]}>
   <Text style={S.actionText}>{option.label}</Text><Text style={S.small}>{option.detail}</Text>
  </Pressable>)}
  <Text style={S.note}>Choices change actual bonds, trust, independence, family tension and long-term outcomes. Family members have different personalities and priorities.</Text>
 </View>;
}
export function FamilyLifeBoard({summary,commands,onAction,blocked}){
 const [expanded,setExpanded]=useState(false),actions=commands.filter(c=>c.id.startsWith('family:'));
 return <View testID="family-living-board" style={S.card}>
  <View style={S.between}><Text style={S.overline}>GENERATIONAL RELATIONSHIPS</Text><Text style={S.count}>ORIGINAL 12 THEMES</Text></View>
  <Text style={S.title}>The people who shape your life</Text>
  <Text style={S.small}>Your partner, children and parents have values of their own. Listen, make plans, or force a decision—and see how they remember it years later.</Text>
  {summary.active?<View testID="family-story-progress" style={S.upcoming}>
   <Text style={S.overline}>{summary.active.status==='ready'?'A FAMILY DECISION':'SOMETHING UNFINISHED'}</Text>
   <Text style={S.subtitle}>{summary.active.name}</Text>
   <Text style={S.small}>{summary.active.names.join(' & ')} · Chapter {summary.active.stage+1}/3</Text>
   <Text style={S.note}>{summary.active.status==='waiting'?(summary.active.due?'Ready to continue':summary.active.yearsUntil+' years until next chapter'):'Resolve the current chapter before aging'}</Text>
  </View>:null}
  <View style={S.people}>
   {summary.people.map(p=><View key={p.id} testID={'family-member-'+p.id} style={S.person}>
    <View style={S.between}><Text style={S.subtitle}>{p.name}</Text><Text style={S.count}>{p.role.toUpperCase()}</Text></View>
    <Text style={S.small}>{p.personality} · values {p.values} · age {p.age}</Text>
    <View style={S.metrics}><Metric label="Bond" value={p.bond}/><Metric label="Trust" value={p.trust}/>{p.role==='child'?<Metric label="Growing independence" value={p.independence}/>:null}</View>
    {p.history.slice(0,1).map((x,i)=><Text key={i} style={S.note}>Age {x.age}: {x.event}</Text>)}
   </View>)}
  </View>
  {summary.siblings.length?<View testID="sibling-relationships" style={S.dynasty}>
   <Text style={S.overline}>SIBLINGS REMEMBER</Text>
   {summary.siblings.map(x=><View key={x.ids.join('-')} style={S.sibling}>
    <Text style={S.subtitle}>{x.names.join(' & ')}</Text>
    <View style={S.metrics}><Metric label="Cooperation" value={x.cooperation}/><Metric label="Sibling rivalry" value={x.rivalry} warn/></View>
   </View>)}
  </View>:null}
  {!blocked&&actions.length?<View style={S.actions}>
   <Text style={S.overline}>{summary.active?'YOUR FAMILY COMMITMENT':'CHOOSE A MULTI-YEAR FAMILY STORY'}</Text>
   {actions.slice(0,expanded?actions.length:4).map(c=><Action key={c.id} item={c} onAction={onAction} id={'family-action-'+c.id.replace(/:/g,'-')}/>)}
   {actions.length>4?<Pressable testID="family-show-stories" accessibilityRole="button" onPress={()=>setExpanded(!expanded)} style={S.choice}>
    <Text style={S.actionText}>{expanded?'Show fewer family stories':'Explore all '+actions.length+' family stories'}</Text>
   </Pressable>:null}
  </View>:null}
  {summary.completed.length?<View testID="family-story-history" style={S.dynasty}>
   <Text style={S.overline}>DECISIONS YOUR FAMILY REMEMBERS</Text>
   {summary.completed.slice(0,5).map((e,i)=><View key={e.id+'-'+i} style={S.history}>
    <Text style={S.subtitle}>{e.title}</Text><Text style={S.small}>{e.names.join(' & ')} · ages {e.startedAge}–{e.endedAge} · {e.outcome}</Text>
   </View>)}
  </View>:null}
  {summary.ancestry.length?<View style={S.dynasty}>
   <Text style={S.overline}>FAMILY HISTORY ACROSS LIVES</Text>
   {summary.ancestry.slice(0,4).map((e,i)=><Text key={i} style={S.small}>◇ {e.sourceLife}: {e.title} · {e.outcome}</Text>)}
  </View>:null}
 </View>;
}
export function FamilyLegacyBoard({summary}){
 return <View testID="family-legacy-board" style={{gap:8}}>
  <Text style={S.overline}>WHAT OUR FAMILY REMEMBERS</Text>
  <Text style={S.small}>{summary.total} long-term family stories begun · {summary.completed.length} recent conclusions · {summary.ancestry.length} inherited memories</Text>
  {summary.unfulfilled.slice(0,3).map((e,i)=><Text key={i} style={S.small}>○ {e.title} · {e.status} at age {e.endedAge}</Text>)}
  {summary.ancestry.slice(0,3).map((e,i)=><Text key={i} style={S.small}>◇ {e.sourceLife} · {e.title} · {e.outcome}</Text>)}
 </View>;
}
const S=StyleSheet.create({
 scene:{backgroundColor:'#1C3532',borderRadius:19,borderWidth:1.5,borderColor:C.accent,padding:15,gap:11},
 card:{backgroundColor:C.bg,borderWidth:1,borderColor:C.line,borderRadius:19,padding:15,gap:11},
 between:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:9,flexWrap:'wrap'},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:.75,color:C.accent},
 count:{fontSize:10,fontWeight:'800',color:C.gold,flexShrink:1},
 title:{fontSize:22,lineHeight:28,fontWeight:'900',color:C.ink,flexShrink:1},
 subtitle:{fontSize:14,lineHeight:19,fontWeight:'800',color:C.ink},
 chapter:{fontSize:17,fontWeight:'900',color:C.gold},
 prompt:{backgroundColor:C.panel,padding:14,borderRadius:12,fontSize:15,lineHeight:23,color:C.ink},
 small:{fontSize:12,lineHeight:18,color:C.muted,flexShrink:1},
 note:{fontSize:11,lineHeight:17,color:C.gold},
 recap:{fontSize:12,lineHeight:19,color:C.muted,borderLeftWidth:3,borderColor:C.gold,paddingLeft:10},
 metric:{minWidth:105,flex:1,gap:5},
 statLabel:{fontSize:11,color:C.muted},
 track:{height:7,borderRadius:6,backgroundColor:'#45625B',overflow:'hidden'},
 fill:{height:7,borderRadius:6},
 cast:{gap:8},people:{gap:9},person:{backgroundColor:C.panel,borderRadius:12,padding:11,gap:6},
 metrics:{flexDirection:'row',flexWrap:'wrap',gap:10},
 actions:{gap:7},action:{borderWidth:1,borderColor:C.line,backgroundColor:C.panel,borderRadius:12,padding:12,gap:5,minHeight:52,justifyContent:'center'},
 actionText:{fontSize:13,lineHeight:18,fontWeight:'800',color:C.ink},
 choice:{borderWidth:1,borderColor:C.line,backgroundColor:C.panel,borderRadius:12,padding:12,gap:5,minHeight:54,justifyContent:'center'},
 upcoming:{backgroundColor:C.panel,borderLeftWidth:3,borderColor:C.gold,padding:12,borderRadius:12,gap:4},
 dynasty:{borderTopWidth:1,borderColor:C.line,paddingTop:12,gap:8},
 sibling:{backgroundColor:C.panel,borderRadius:11,gap:8,padding:11},
 history:{gap:3,borderBottomWidth:1,borderColor:C.line,paddingBottom:8}
});
