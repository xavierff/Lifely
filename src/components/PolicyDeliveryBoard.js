import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
const C={bg:'#14272B',panel:'#263F3D',dark:'#172D30',ink:'#F7F8EF',
 muted:'#BDD0CA',gold:'#FFE0AF',mint:'#CDF1AB',line:'#627B6F',red:'#FFC3B7'};
const limit=v=>Math.max(0,Math.min(100,Number(v)||0));
const sign=v=>(v>=0?'+':'')+v;
const initials=v=>String(v||'?').split(' ').slice(0,2).map(x=>x.charAt(0)).join('').toUpperCase();
function Meter({title,n,warning=false}){
 return <View style={S.meter}>
  <View style={S.split}><Text style={S.small}>{title}</Text>
   <Text style={S.value}>{limit(n)}</Text></View>
  <View style={S.track}><View style={[S.fill,{width:limit(n)+'%',
   backgroundColor:warning?C.red:C.mint}]}/></View>
 </View>;
}
function Person({name,group}){
 return <View style={S.person}>
  <View style={S.avatar}><Text style={S.initials}>{initials(name)}</Text></View>
  <Text style={S.personName} numberOfLines={2}>{name}</Text>
  <Text style={S.small} numberOfLines={2}>{group}</Text>
 </View>;
}
function Live({s,commands,onAction,compact}){
 const choices=commands.filter(x=>x.id.startsWith('delivery:'+s.id+':'));
 return <View testID="policy-delivery-active" style={S.card}>
  <View style={S.split}>
   <Text style={S.overline}>POLICIES MEAN IMPLEMENTATION</Text>
   <Text style={S.overline}>YEAR {s.lastAge-s.startedAge} / 6</Text>
  </View>
  <Text style={S.title}>{s.issueName}</Text>
  <Text style={S.body}>The public debate ended {s.sourceOutcome}. Two real organizations must now deliver results—not just make promises.</Text>
  <View style={S.faces}>
   <Person name={s.nowA||s.representativeA} group={s.groupAName}/>
   <Text style={S.arrows}>↔</Text>
   <Person name={s.nowB||s.representativeB} group={s.groupBName}/>
  </View>
  <View style={S.meters}>
   <Meter title="Implementation progress" n={s.progress}/>
   <Meter title="Delivery quality" n={s.deliveryQuality}/>
   <Meter title="Public trust" n={s.publicTrust}/>
   <Meter title="Opposition" n={s.opposition} warning/>
  </View>
  <View style={S.section}>
   <Text style={S.overline}>INDEPENDENT GROUP WORK · STAGE {s.stage} / 3</Text>
   <Text style={S.body}>Existing members continue the project every two years. Their real group relationships determine success, revision or failure.</Text>
   <Text style={S.small}>Next development age {s.nextAge} · Project deadline age {s.dueAge}</Text>
   {s.interruptedAge!==null?<Text style={[S.body,{color:C.red}]}>Paused until two living representatives can work together again.</Text>:null}
  </View>
  {s.pending?<View testID="policy-delivery-invitation" style={S.call}>
   <Text style={S.overline}>REAL DELIVERY DECISION · AGE {s.offerAge}</Text>
   {choices.map(c=><Pressable key={c.id} testID={'policy-delivery-choice-'+c.id.split(':').at(-1)}
    accessibilityRole="button" accessibilityLabel={c.label+', '+c.detail}
    accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled}
    onPress={()=>onAction(c.id)}
    style={({pressed})=>[S.choice,!c.enabled&&S.disabled,pressed&&{opacity:.75}]}>
    <Text style={S.choiceTitle}>{c.label}</Text>
    <Text style={S.small}>{c.detail}</Text>
   </Pressable>)}
   <Text style={S.small}>One ordinary annual action. Responses are optional and will expire without player penalties.</Text>
  </View>:null}
  {s.choices.length?<View testID="policy-delivery-history" style={S.section}>
   <Text style={S.overline}>YOUR MEASURABLE CONTRIBUTIONS</Text>
   {s.choices.map((d,i)=><View key={d.age+'-'+i} style={S.history}>
    <Text style={S.personName}>Age {d.age}: {d.label}</Text>
    <Text style={S.small}>Progress {sign(d.progress)} · Quality {sign(d.quality)} · Opposition {sign(d.opposition)}</Text>
    <Text style={S.small}>Leader trust {sign(d.npcTrustA)} / {sign(d.npcTrustB)} · Organization standing {sign(d.standingA)} / {sign(d.standingB)}</Text>
   </View>)}
  </View>:null}
  {s.partnerships?.length?<View testID="policy-delivery-partnership" style={S.section}>
   <Text style={S.overline}>REAL PROJECT CONNECTIONS</Text>
   {s.partnerships.map((p,i)=><View key={p.age+'-'+i} style={S.history}>
    <Text style={S.body}>{p.name}</Text>
    <Text style={S.small}>{p.kind==='real-business-contact'?
     'Recorded existing business contact · no guaranteed income':
     'Professional volunteer contribution · no automatic salary'}</Text>
   </View>)}
  </View>:null}
  {!compact&&s.history.length?<View style={S.section}>
   <Text style={S.overline}>THE YEARS BETWEEN YOUR CHOICES</Text>
   {s.history.slice(0,4).map((x,i)=><View key={x.age+'-'+x.kind+'-'+i} style={S.history}>
    <Text style={S.small}>AGE {x.age} · {x.kind.toUpperCase()}</Text>
    <Text style={S.body}>{x.text}</Text>
   </View>)}
  </View>:null}
 </View>;
}
function Result({item}){
 return <View style={S.history}>
  <View style={S.split}><Text style={S.personName}>{item.issueName}</Text>
   <Text style={[S.overline,{color:item.result==='delivered'?C.mint:C.gold}]}>
    {item.result.toUpperCase()}</Text></View>
  <Text style={S.body}>{item.finalLine}</Text>
  <Text style={S.small}>{item.groupAName} & {item.groupBName} · age {item.endedAge} · {item.choices} decisions</Text>
 </View>;
}
export default function PolicyDeliveryBoard({view,commands=[],onAction,compact=false,onlyProfessional=false}){
 const active=view.active&&(!onlyProfessional||view.active.issue==='skills-access')?view.active:null;
 const recent=view.completed.find(x=>x.endedAge===view.age&&
  (!onlyProfessional||x.issueName.includes('skills access')));
 if(compact&&!active?.pending&&!active?.choices.some(x=>x.age===view.age)&&!recent)return null;
 return <View testID={compact?'policy-delivery-preview':'policy-delivery-board'} style={S.root}>
  <View style={S.split}><View style={{flex:1,gap:3}}>
   <Text style={S.overline}>FROM PUBLIC PROMISES TO REAL CONSEQUENCES</Text>
   <Text style={S.heading}>{compact?'An old policy needs you':'Deliver what the organizations promised'}</Text>
  </View><Text style={S.overline}>{active?'LIVE':'HISTORY'}</Text></View>
  <Text style={S.body}>Following a civic decision, real members build projects, face opposition and must prove whether they followed through. The world never invents a municipal treasury or a contract payout.</Text>
  {active&&(!compact||active.pending||active.choices.some(x=>x.age===view.age))?
   <Live s={active} commands={commands} onAction={onAction} compact={compact}/>:null}
  {compact&&!active&&recent?<View testID="policy-delivery-recent" style={S.card}>
   <Text style={S.overline}>THIS YEAR'S FINAL DELIVERY</Text><Result item={recent}/>
  </View>:null}
  {!compact&&!active?<Text style={S.small}>No implementation project is currently underway. When genuine civic campaigns resolve, their original organizations can begin delivering on the outcome.</Text>:null}
  {!compact&&view.completed.length?<View testID="policy-delivery-archive" style={S.card}>
   <Text style={S.overline}>DELIVERED, REVISED AND UNFULFILLED PROMISES</Text>
   {view.completed.slice(0,7).map(x=><Result key={x.id} item={x}/>)}
  </View>:null}
  {!compact&&view.ancestors.length?<View testID="policy-delivery-ancestors" style={S.card}>
   <Text style={S.overline}>POLICY RESULTS PEOPLE REMEMBER</Text>
   {view.ancestors.slice(0,4).map((x,i)=><View key={x.generation+'-'+i} style={S.history}>
    <Text style={S.overline}>GEN {x.generation} · {x.name}</Text>
    <Text style={S.body}>{x.note}</Text>
   </View>)}
  </View>:null}
  {!compact?<Text style={S.small}>Independent progress affects original organizations, never player wages, existing savings, business revenue or guaranteed job offers.</Text>:null}
 </View>;
}
const S=StyleSheet.create({
 root:{padding:13,borderWidth:1,borderColor:C.line,borderRadius:16,
  gap:11,backgroundColor:C.bg},
 split:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8},
 overline:{fontSize:10,fontWeight:'900',color:C.gold,letterSpacing:.45,flexShrink:1},
 heading:{fontSize:18,fontWeight:'900',color:C.ink,lineHeight:25},
 title:{fontSize:15,fontWeight:'900',color:C.ink,lineHeight:22},
 body:{fontSize:12,color:C.muted,lineHeight:18,flexShrink:1},
 small:{fontSize:10,color:C.muted,lineHeight:16,flexShrink:1},
 personName:{fontSize:12,fontWeight:'900',color:C.ink,lineHeight:18,flexShrink:1},
 card:{backgroundColor:C.panel,padding:12,borderRadius:11,borderColor:C.line,
  borderWidth:1,gap:10},
 faces:{flexDirection:'row',gap:7,padding:10,borderRadius:10,backgroundColor:C.dark,alignItems:'center'},
 person:{flex:1,alignItems:'center',minWidth:0,gap:5},
 avatar:{width:47,height:47,borderRadius:25,backgroundColor:'#4B7470',
  borderColor:C.mint,borderWidth:1,justifyContent:'center',alignItems:'center'},
 initials:{fontSize:15,color:C.ink,fontWeight:'900'},
 arrows:{fontSize:22,color:C.gold,fontWeight:'900'},
 meters:{flexDirection:'row',flexWrap:'wrap',gap:8},
 meter:{flex:1,flexBasis:120,gap:6},
 value:{color:C.ink,fontSize:11,fontWeight:'900'},
 track:{height:8,borderRadius:5,backgroundColor:'#58716D',overflow:'hidden'},
 fill:{height:8,borderRadius:5},
 section:{padding:10,backgroundColor:C.dark,borderRadius:10,gap:8},
 call:{padding:11,borderColor:C.mint,borderWidth:1,borderRadius:11,
  gap:8,backgroundColor:'#2D4E47'},
 choice:{padding:11,borderRadius:9,borderColor:'#82A79B',borderWidth:1,
  backgroundColor:'#365A54',minHeight:50,gap:5},
 choiceTitle:{fontSize:12,color:C.ink,fontWeight:'900',lineHeight:18},
 history:{paddingTop:9,borderTopWidth:1,borderTopColor:C.line,gap:6},
 disabled:{opacity:.4}
});
