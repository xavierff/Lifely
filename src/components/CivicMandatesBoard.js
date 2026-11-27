import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';

const C={bg:'#14272B',panel:'#253D40',deep:'#152B2E',ink:'#F7F7F1',
 muted:'#BDD1CA',line:'#668277',mint:'#CFF1A8',gold:'#FFDCAA',red:'#FFBFAF'};
const cap=n=>Math.max(0,Math.min(100,Number(n)||0));
const signed=n=>(n>=0?'+':'')+n;
const initial=s=>String(s||'?').split(' ').slice(0,2).map(x=>x.charAt(0)).join('').toUpperCase();
function Gauge({name,n,warning=false}){
 return <View style={S.gauge}>
  <View style={S.split}><Text style={S.small}>{name}</Text><Text style={S.boldMini}>{cap(n)}</Text></View>
  <View style={S.track}><View style={[S.fill,{width:cap(n)+'%',
   backgroundColor:warning?C.red:C.mint}]}/></View>
 </View>;
}
function Representative({name,group}){
 return <View style={S.person}>
  <View style={S.avatar}><Text style={S.initial}>{initial(name)}</Text></View>
  <Text numberOfLines={2} style={S.personName}>{name}</Text>
  <Text numberOfLines={3} style={S.small}>{group}</Text>
 </View>;
}
function Active({m,commands,onAction,compact}){
 const options=commands.filter(c=>c.id.startsWith('mandate:'+m.id+':'));
 return <View testID="civic-campaign-active" style={S.card}>
  <View style={S.split}><Text style={S.overline}>MULTI-YEAR PUBLIC CAMPAIGN</Text>
   <Text style={S.overline}>YEAR {m.lastAge-m.startedAge} / 8</Text></View>
  <Text style={S.heading}>{m.issueName}</Text>
  <Text style={S.desc}>{m.question}</Text>
  <View style={S.teams}>
   <Representative name={m.aRepresentative||m.leaderAName} group={m.groupAName}/>
   <Text style={S.vs}>↔</Text>
   <Representative name={m.bRepresentative||m.leaderBName} group={m.groupBName}/>
  </View>
  <View style={S.meters}>
   <Gauge name="First group support" n={m.supportA}/>
   <Gauge name="Second group support" n={m.supportB}/>
   <Gauge name="Common ground" n={m.commonGround}/>
   <Gauge name="Evidence prepared" n={m.evidence}/>
   <Gauge name="Resistance" n={m.resistance} warning/>
  </View>
  <View style={S.campaign}>
   <View style={S.split}><Text style={S.overline}>AUTONOMOUS ORGANIZATION PROGRESS</Text>
    <Text style={S.overline}>CHAPTER {m.stage} / 4</Text></View>
   <Text style={S.desc}>The actual organizations continue the campaign every two years.
    Your intervention is optional and the final result depends on both groups.</Text>
   <Text style={S.small}>Next development at age {m.nextAge} · Planned final year age {m.expiryAge}</Text>
   {m.unavailableSince!==null?<Text style={S.caution}>The campaign is paused until real representatives return.</Text>:null}
  </View>
  {m.pending?<View testID="civic-campaign-invitation" style={S.invite}>
   <Text style={S.overline}>AN IMPORTANT RETURNING DECISION · AGE {m.offerAge}</Text>
   {options.map(o=><Pressable key={o.id}
    testID={'civic-choice-'+o.id.split(':').at(-1)}
    accessibilityRole="button" accessibilityLabel={o.label+', '+o.detail}
    accessibilityState={{disabled:!o.enabled}} disabled={!o.enabled}
    onPress={()=>onAction(o.id)} style={({pressed})=>[
     S.choice,!o.enabled&&S.disabled,pressed&&{opacity:.78}]}>
    <Text style={S.choiceText}>{o.label}</Text>
    <Text style={S.small}>{o.detail}</Text>
   </Pressable>)}
   <Text style={S.small}>Each choice uses one normal yearly activity. Unanswered invitations expire without changing player stats or money.</Text>
  </View>:null}
  {m.decisions.length?<View testID="civic-campaign-history" style={S.campaign}>
   <Text style={S.overline}>YOUR RECORDED POSITIONS</Text>
   {m.decisions.slice(-3).reverse().map((d,i)=><View key={d.age+'-'+i} style={S.history}>
    <Text style={S.personName}>Age {d.age}: {d.label}</Text>
    <Text style={S.small}>Shared ground {signed(d.commonGround)} · Resistance {signed(d.resistance)} · Evidence {signed(d.evidence)}</Text>
    <Text style={S.small}>Group support {signed(d.supportA)} / {signed(d.supportB)} · Leaders’ trust {signed(d.npcTrustA)} / {signed(d.npcTrustB)}</Text>
   </View>)}
  </View>:null}
  {!compact&&m.history.length?<View style={S.campaign}>
   <Text style={S.overline}>THE YEARS BETWEEN YOUR CHOICES</Text>
   {m.history.slice(0,5).map((x,i)=><View key={x.age+'-'+x.kind+'-'+i} style={S.history}>
    <Text style={S.small}>AGE {x.age} · {x.kind.toUpperCase()}</Text>
    <Text style={S.desc}>{x.text}</Text>
   </View>)}
  </View>:null}
 </View>;
}
function Result({r}){
 return <View style={S.history}>
  <View style={S.split}><Text style={S.personName}>{r.issueName}</Text>
   <Text style={S.overline}>{r.ending.toUpperCase()}</Text></View>
  <Text style={S.desc}>{r.finalLine}</Text>
  <Text style={S.small}>{r.groupAName} & {r.groupBName} · age {r.endedAge} · {r.decisions} direct interventions</Text>
 </View>;
}
export default function CivicMandatesBoard({view,commands=[],onAction,compact=false,onlyProfessional=false}){
 const active=view.active&&(!onlyProfessional||view.active.issue==='skills-access')?view.active:null;
 const recent=view.completed?.find(x=>x.endedAge===view.age&&
  (!onlyProfessional||x.issue==='skills-access'));
 if(compact&&!(active?.pending||active?.decisions.at(-1)?.age===view.age||recent))return null;
 return <View testID={compact?'civic-campaign-preview':'civic-campaign-board'} style={S.root}>
  <View style={S.split}><View style={{flex:1,gap:3}}>
   <Text style={S.overline}>ORGANIZATIONS WITH THEIR OWN PRIORITIES</Text>
   <Text style={S.title}>{compact?'A public issue needs a decision':'Campaigns that change the living world'}</Text>
  </View><Text style={S.overline}>{active?'LIVE':'ARCHIVE'}</Text></View>
  <Text style={S.desc}>Real family councils, professional networks, community groups and rivals pursue public policies over several years. No fictitious voters or invisible public spending.</Text>
  {active&&(!compact||active.pending||active.decisions.at(-1)?.age===view.age)?
   <Active m={active} commands={commands} onAction={onAction} compact={compact}/>:null}
  {compact&&!active&&recent?<View testID="civic-recent-result" style={S.card}>
   <Text style={S.overline}>LATEST CIVIC OUTCOME</Text>
   <Result r={recent}/>
  </View>:null}
  {!compact&&!active?<Text style={S.small}>No active civic proposal. One can emerge when two existing organizations begin discussing their shared future.</Text>:null}
  {!compact&&view.completed?.length?<View testID="civic-campaign-archive" style={S.card}>
   <Text style={S.overline}>PREVIOUS PUBLIC DECISIONS</Text>
   {view.completed.slice(0,7).map(x=><Result key={x.id} r={x}/>)}
  </View>:null}
  {!compact&&view.ancestors?.length?<View testID="civic-campaign-ancestors" style={S.card}>
   <Text style={S.overline}>PUBLIC POLICIES IN FAMILY MEMORY</Text>
   {view.ancestors.slice(0,4).map((x,i)=><View key={x.generation+'-'+i} style={S.history}>
    <Text style={S.overline}>GENERATION {x.generation} · {x.name}</Text>
    <Text style={S.desc}>{x.note}</Text>
   </View>)}
  </View>:null}
  {!compact?<Text style={S.small}>Autonomous policy outcomes change organizations, never automatic personal earnings or powers. Old leaders are not revived in a descendant’s world.</Text>:null}
 </View>;
}
const S=StyleSheet.create({
 root:{padding:13,gap:11,backgroundColor:C.bg,borderRadius:16,borderWidth:1,borderColor:C.line},
 split:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:.4,color:C.gold,flexShrink:1},
 title:{fontSize:18,fontWeight:'900',color:C.ink,lineHeight:25},
 heading:{fontSize:15,fontWeight:'900',lineHeight:22,color:C.ink},
 desc:{fontSize:12,lineHeight:18,color:C.muted,flexShrink:1},
 small:{fontSize:10,lineHeight:16,color:C.muted,flexShrink:1},
 caution:{fontSize:11,lineHeight:17,color:C.red},
 personName:{fontSize:12,fontWeight:'900',lineHeight:18,color:C.ink,flexShrink:1},
 card:{padding:12,backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:12,gap:10},
 teams:{flexDirection:'row',alignItems:'center',padding:9,backgroundColor:C.deep,borderRadius:10,gap:8},
 person:{flex:1,alignItems:'center',gap:5,minWidth:0},
 avatar:{width:47,height:47,borderRadius:25,backgroundColor:'#456E6A',
  borderWidth:1,borderColor:C.mint,alignItems:'center',justifyContent:'center'},
 initial:{fontSize:15,fontWeight:'900',color:C.ink},
 vs:{fontSize:21,fontWeight:'900',color:C.gold},
 meters:{flexDirection:'row',flexWrap:'wrap',gap:8},
 gauge:{flex:1,flexBasis:100,gap:5},
 boldMini:{fontSize:11,fontWeight:'900',color:C.ink},
 track:{height:8,borderRadius:5,backgroundColor:'#526D68',overflow:'hidden'},
 fill:{height:8,borderRadius:5},
 campaign:{padding:10,backgroundColor:C.deep,borderRadius:10,gap:8},
 invite:{padding:11,borderRadius:10,borderWidth:1,borderColor:C.mint,
  backgroundColor:'#2C4A46',gap:8},
 choice:{minHeight:51,padding:11,borderWidth:1,borderColor:'#84A49B',
  backgroundColor:'#345752',borderRadius:9,gap:5},
 choiceText:{fontSize:12,color:C.ink,fontWeight:'900',lineHeight:18},
 history:{paddingTop:9,borderTopWidth:1,borderTopColor:C.line,gap:6},
 disabled:{opacity:.4}
});
