import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';

const C={bg:'#17292B',card:'#213C3D',focus:'#2A4A42',ink:'#F5F7F0',
 light:'#BED1C7',gold:'#FFE0A8',green:'#CEF1B0',red:'#F9B9AE',line:'#54716A'};
const titles={open:'NEW PLAN',waiting:'PURSUING THEIR OWN LIFE',ready:'THE NEXT DECISION',growing:'INDEPENDENT PROGRESS'};
const cap=n=>Math.max(0,Math.min(100,Number(n)||0));
const initial=s=>String(s||'?').split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase();
function Progress({value}){
 return <View accessible accessibilityLabel={'Goal progress '+cap(value)+' out of 100'}
  style={S.track}><View style={[S.fill,{width:cap(value)+'%'}]}/></View>;
}
function Metric({name,value}){
 return <View style={S.stat}><Text style={S.mini}>{name}</Text><Text style={S.metric}>{value===null?'—':value}</Text></View>;
}
function Ambition({item,commands,onAction}){
 const choices=commands.filter(c=>c.id.startsWith('npcgoal:'+item.id+':'));
 const ready=item.status==='open'||item.status==='ready';
 return <View testID={'npc-ambition-'+item.id} style={[S.personCard,ready&&S.ready]}>
  <View style={S.split}>
   <View style={S.personHead}>
    <View style={S.avatar}><Text style={S.avatarText}>{initial(item.name)}</Text></View>
    <View style={S.headText}><Text style={S.personName}>{item.name}</Text>
     <Text style={S.sub}>{item.kind==='alumni'?'Former classmate':item.role} · {item.profession}</Text>
    </View>
   </View>
   <Text style={S.overline}>{titles[item.status]}</Text>
  </View>
  <Text style={S.goal}>{item.goal}</Text>
  <Text style={S.description}>{item.pivots.length?
   'Their priorities changed after '+item.pivots.at(-1).reason+'. What they want now differs from what they wanted earlier.':
   'This is their personal goal. It continues even when you make no decisions.'}</Text>
  <View style={S.split}><Text style={S.mini}>PROGRESS OVER YEARS</Text><Text style={S.metric}>{item.progress}%</Text></View>
  <Progress value={item.progress}/>
  <View style={S.metrics}>
   <Metric name="Trust" value={item.currentTrust}/>
   <Metric name="Rivalry" value={item.currentRivalry}/>
   <Metric name="Pressure" value={item.obstacles}/>
  </View>
  <View style={S.divider}/>
  {item.pivots.length?<View testID="npc-ambition-pivot" style={S.pivot}>
   <Text style={S.overline}>AN UNEXPECTED CHANGE OF PRIORITIES</Text>
   {item.pivots.slice(-2).map((x,i)=><Text key={x.age+'-'+i} style={S.note}>Age {x.age}: {x.reason} redirected their ambitions.</Text>)}
  </View>:null}
  {item.decisions.length?<View testID="npc-ambition-impact" style={S.impact}>
   <Text style={S.overline}>YOUR LAST DECISION CHANGED</Text>
   <View style={S.pills}>
    <Text style={S.pill}>Trust {item.decisions.at(-1).trustChange>=0?'+':''}{item.decisions.at(-1).trustChange}</Text>
    <Text style={S.pill}>Rivalry {item.decisions.at(-1).rivalryChange>=0?'+':''}{item.decisions.at(-1).rivalryChange}</Text>
    <Text style={S.pill}>Plan {item.decisions.at(-1).progressChange>=0?'+':''}{item.decisions.at(-1).progressChange}</Text>
   </View>
  </View>:null}
  {item.status==='waiting'?<Text style={S.timeline}>Next opportunity around age {item.dueAge}. Their independent progress continues.</Text>:null}
  {item.status==='growing'?<Text style={S.timeline}>Their plan will develop over the coming years; your decisions have already been recorded.</Text>:null}
  {ready?<View style={S.options}>
   <Text style={S.overline}>{item.status==='open'?'HOW WILL YOU RESPOND?':'THE GOAL RETURNS'}</Text>
   {choices.map(c=><Pressable key={c.id} testID={'npc-ambition-choice-'+c.id.split(':').at(-1)}
    accessibilityRole="button" accessibilityLabel={c.label+', '+c.detail}
    accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled}
    style={({pressed})=>[S.option,!c.enabled&&S.disabled,pressed&&{opacity:.72}]}
    onPress={()=>onAction(c.id)}>
    <Text style={S.optionTitle}>{c.label}</Text><Text style={S.sub}>{c.detail}</Text>
   </Pressable>)}
  </View>:null}
  <Text style={S.note}>Started age {item.startedAge} · Your response is optional. Their life does not stop if you decline.</Text>
 </View>;
}
export default function NpcAmbitionsBoard({view,commands=[],onAction,compact=false}){
 const rows=compact?view.active.filter(x=>x.canRespond).slice(0,1):view.active.slice(0,10);
 if(compact&&!rows.length)return null;
 return <View style={S.root} testID={compact?'npc-ambitions-preview':'npc-ambitions-board'}>
  <View style={S.split}>
   <View style={{flex:1,gap:4}}><Text style={S.overline}>OTHER PEOPLE HAVE DREAMS, TOO</Text>
    <Text style={S.title}>{compact?'Someone has a plan':'Lives unfolding around you'}</Text></View>
   <Text style={S.counter}>{view.total} COMPLETED</Text>
  </View>
  <Text style={S.description}>Every person can pursue a career, connection, creative work, security or a different way of living. Real setbacks may change their priorities. You can influence them—but not choose their destiny for them.</Text>
  {rows.map(item=><Ambition key={item.id} item={item} commands={commands} onAction={onAction}/>)}
  {!compact&&!rows.length?<Text style={S.note}>Independent personal ambitions will appear as your social circle develops. Keep living your life.</Text>:null}
  {!compact&&view.completed.length?<View testID="npc-ambitions-history" style={S.history}>
   <Text style={S.overline}>THE DREAMS PEOPLE PURSUED</Text>
   {view.completed.slice(0,6).map(item=><View key={item.id} style={S.historyItem}>
    <View style={S.split}><Text style={S.personName}>{item.name}</Text><Text style={[S.overline,{color:item.ending==='achieved'?C.green:C.gold}]}>{item.ending.toUpperCase()}</Text></View>
    <Text style={S.goal}>{item.goal}</Text>
    <Text style={S.description}>{item.finalLine}</Text>
    <Text style={S.note}>Age {item.startedAge}–{item.endedAge} · {item.decisions} player decisions · {item.pivots.length} changes in direction</Text>
   </View>)}
  </View>:null}
  {!compact&&view.ancestors.length?<View style={S.history}>
   <Text style={S.overline}>PEOPLE REMEMBERED ACROSS GENERATIONS</Text>
   {view.ancestors.slice(0,4).map((x,i)=><View key={x.generation+'-'+i} style={S.historyItem}>
    <Text style={S.overline}>GENERATION {x.generation} · {x.name}</Text>
    <Text style={S.description}>{x.note}</Text></View>)}
  </View>:null}
  <Text style={S.note}>Goals develop automatically each year without additional money, hidden paid content, or mandatory decisions.</Text>
 </View>;
}
const S=StyleSheet.create({
 root:{backgroundColor:C.bg,padding:13,borderWidth:1,borderColor:C.line,borderRadius:16,gap:11},
 split:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:9},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:.6,color:C.gold,flexShrink:1},
 title:{fontSize:19,lineHeight:25,fontWeight:'900',color:C.ink},
 counter:{fontSize:10,fontWeight:'900',color:C.green},
 description:{fontSize:12,color:C.light,lineHeight:19,flexShrink:1},
 personCard:{backgroundColor:C.card,borderRadius:12,padding:12,borderWidth:1,borderColor:C.line,gap:9},
 ready:{borderColor:C.green},personHead:{flex:1,flexDirection:'row',gap:9,alignItems:'center',minWidth:0},
 avatar:{width:46,height:46,borderRadius:24,backgroundColor:'#47756E',borderColor:C.green,borderWidth:1,alignItems:'center',justifyContent:'center'},
 avatarText:{fontSize:17,fontWeight:'900',color:C.ink},
 headText:{flex:1,gap:4,minWidth:0},personName:{fontSize:13,fontWeight:'800',color:C.ink},
 sub:{fontSize:11,lineHeight:16,color:C.light,flexShrink:1},
 goal:{fontSize:15,fontWeight:'900',lineHeight:21,color:C.ink},
 mini:{fontSize:10,color:C.light,fontWeight:'700'},
 metric:{fontSize:12,color:C.ink,fontWeight:'900'},
 track:{height:9,backgroundColor:'#425A59',borderRadius:6,overflow:'hidden'},
 fill:{height:9,borderRadius:6,backgroundColor:C.green},
 metrics:{flexDirection:'row',gap:8},
 stat:{flex:1,backgroundColor:'#2C4544',borderRadius:9,padding:8,gap:5},
 divider:{height:1,backgroundColor:C.line},
 pivot:{backgroundColor:'#4C4344',padding:10,borderRadius:9,gap:6},
 note:{fontSize:10,lineHeight:16,color:C.light},
 impact:{backgroundColor:'#2F4F41',padding:10,borderRadius:9,gap:7},
 pills:{flexDirection:'row',flexWrap:'wrap',gap:6},
 pill:{color:C.green,fontSize:10,fontWeight:'800',backgroundColor:'#243E36',padding:8,borderRadius:7},
 timeline:{color:C.gold,fontSize:12,lineHeight:18},
 options:{gap:7},option:{minHeight:48,padding:11,borderRadius:9,borderWidth:1,borderColor:'#688779',backgroundColor:C.focus,gap:4},
 optionTitle:{color:C.ink,fontSize:12,fontWeight:'900',lineHeight:18},
 disabled:{opacity:.4},
 history:{gap:9},historyItem:{backgroundColor:C.card,padding:11,borderRadius:10,gap:6}
});
