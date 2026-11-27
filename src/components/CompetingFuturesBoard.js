import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';

const C={bg:'#14292C',panel:'#223B3F',raised:'#2C4A46',ink:'#F6F7F1',
 muted:'#B5CBC3',gold:'#FFDCA2',mint:'#C8F0B1',blue:'#AAD8ED',red:'#FFC4B9',line:'#53736C'};
const tag={career:'CAREER',business:'BUSINESS',family:'FAMILY'};
const nameInitials=s=>String(s||'?').split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase();
const statusText={open:'THE FIRST DECISION',waiting:'TWO LIVES MOVING FORWARD',
 ready:'YEARS LATER — WHAT CHANGED?'};
const cap=n=>Math.max(0,Math.min(100,Number(n)||0));
function Meter({label,value,negative=false}){
 return <View style={S.meter}>
  <View style={S.split}><Text style={S.mini}>{label}</Text><Text style={S.meterNumber}>{value===null?'—':cap(value)}</Text></View>
  <View style={S.track}><View style={[S.bar,{width:cap(value)+'%',backgroundColor:negative?C.red:C.mint}]}/></View>
 </View>;
}
function Delta({label,amount}){
 return <Text style={S.delta}>{label} {amount>=0?'+':''}{amount}</Text>;
}
function Character({name,role}){
 return <View style={S.character}>
  <View style={S.avatar}><Text style={S.avatarText}>{nameInitials(name)}</Text></View>
  <Text style={S.characterName} numberOfLines={2}>{name}</Text>
  <Text style={S.mini}>{role}</Text>
 </View>;
}
function Event({item,playerName,commands,onAction}){
 const active=item.status==='open'||item.status==='ready',options=commands.filter(c=>c.id.startsWith('clash:'+item.id+':'));
 return <View testID={'future-collision-'+item.id} style={[S.event,active&&S.eventActive]}>
  <View style={S.split}><Text style={S.overline}>{tag[item.kind]} · {statusText[item.status]}</Text>
   <Text style={[S.overline,{color:item.contextAlive?C.mint:C.red}]}>
    {item.contextAlive?'CONNECTED':'CIRCUMSTANCES CHANGED'}</Text></View>
  <Text style={S.title}>{item.title}</Text>
  <Text style={S.description}>{item.context}</Text>
  <View style={S.stage}>
   <Character name={playerName} role="YOU"/>
   <View style={S.centerColumn}>
    <Text style={S.connection}>↔</Text><Text style={S.mini}>SHARED FUTURE</Text>
   </View>
   <Character name={item.personName} role={item.role.toUpperCase()}/>
  </View>
  <View style={S.metrics}>
   <Meter label="NPC trust" value={item.nowTrust}/>
   <Meter label="Rivalry" value={item.nowRivalry} negative/>
   <Meter label="NPC goal" value={item.nowGoal}/>
  </View>
  {item.kind==='career'?<Text style={S.detail}>Your professional performance: {item.nowPlayerPerformance}/100 · Their ambition: {item.nowGoalTitle}</Text>:null}
  {item.kind==='business'?<Text style={S.detail}>Your actual business demand: {item.nowBusinessDemand===null?'No longer owned':item.nowBusinessDemand+'/100'} · Their ambition: {item.nowGoalTitle}</Text>:null}
  {item.kind==='family'?<Text style={S.detail}>Current family bond: {item.nowBond??'Unavailable'} · Their ambition: {item.nowGoalTitle}</Text>:null}
  {!item.contextAlive?<Text style={S.warning}>The circumstances that brought you together have changed. You can still address the personal relationship, but obsolete career or business effects will not be applied.</Text>:null}
  {item.status==='waiting'?<Text style={S.waiting}>Their career, business or family life keeps evolving. A second decision can return at age {item.dueAge}.</Text>:null}
  {item.changes?<View testID="future-collision-impact" style={S.impact}>
   <Text style={S.overline}>WHAT YOUR CHOICE ACTUALLY DID</Text>
   <View style={S.pills}>
    <Delta label="Trust" amount={item.changes.trustDelta}/>
    <Delta label="Rivalry" amount={item.changes.rivalryDelta}/>
    {item.changes.goalDelta!==0?<Delta label="Their goal" amount={item.changes.goalDelta}/>:null}
    {item.changes.stat?<Delta label={item.changes.stat} amount={item.changes.statDelta}/>:null}
    {item.changes.businessDelta!==0?<Delta label="Demand" amount={item.changes.businessDelta}/>:null}
    {item.changes.cashDelta!==0?<Delta label="Your cash" amount={item.changes.cashDelta}/>:null}
   </View>
   {item.changes.cashDelta!==0?<Text style={S.mini}>The same {Math.abs(item.changes.cashDelta)} was transferred to the NPC from your existing cash, with no new money created.</Text>:null}
  </View>:null}
  {active?<View style={S.options}>
   <Text style={S.overline}>{item.status==='open'?'WHICH DIRECTION WILL YOU TAKE?':'THE CONSEQUENCES RETURN'}</Text>
   {options.map(c=><Pressable key={c.id} testID={'future-choice-'+item.id+'-'+c.id.split(':').at(-1)}
    accessibilityRole="button" accessibilityLabel={c.label+', '+c.detail}
    accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled}
    onPress={()=>onAction(c.id)}
    style={({pressed})=>[S.option,!c.enabled&&S.disabled,pressed&&{opacity:.72}]}>
    <Text style={S.optionTitle}>{c.label}</Text>
    <Text style={S.optionDescription}>{c.detail}</Text>
   </Pressable>)}
  </View>:null}
  <Text style={S.mini}>Started age {item.startedAge} · {item.decisions.length} decisions · Actions are optional and cost one regular yearly activity.</Text>
 </View>;
}
export default function CompetingFuturesBoard({view,playerName='You',commands=[],onAction,compact=false,filterKinds=[]}){
 const relevant=filterKinds.length?view.active.filter(a=>filterKinds.includes(a.kind)):view.active;
 const rows=compact?relevant.filter(a=>a.ready||(a.status==='waiting'&&a.decisions.at(-1)?.age===view.age)).slice(0,1):relevant;
 if(compact&&!rows.length)return null;
 return <View testID={compact?'competing-futures-preview':'competing-futures-board'} style={S.root}>
  <View style={S.split}><View style={{flex:1,gap:3}}>
   <Text style={S.overline}>WHEN AMBITIONS COLLIDE</Text>
   <Text style={S.heading}>{compact?'A decision with consequences':'Competing futures'}</Text>
  </View><Text style={S.count}>{view.count} REMEMBERED</Text></View>
  <Text style={S.description}>Your real career, business and family decisions intersect with ambitions other people already have. Friends may become rivals, competitors may become partners, and the same relationship can change years later.</Text>
  {rows.map(a=><Event key={a.id} item={a} playerName={playerName} commands={commands} onAction={onAction}/>)}
  {!rows.length&&!compact?<Text style={S.waiting}>There is no overlapping NPC ambition right now. As your careers, businesses and family evolve, new situations can emerge.</Text>:null}
  {!compact&&view.completed.length?<View testID="competing-futures-archive" style={S.archive}>
   <Text style={S.overline}>LIVES THAT CROSSED YOURS</Text>
   {view.completed.slice(0,6).map(a=><View key={a.id} style={S.record}>
    <View style={S.split}><Text style={S.overline}>{tag[a.kind]} · AGE {a.startedAge}–{a.endedAge}</Text>
     <Text style={[S.overline,{color:a.ending==='alliance'||a.ending==='partnership'?C.mint:C.gold}]}>{a.ending.toUpperCase()}</Text></View>
    <Text style={S.recordTitle}>{a.personName} · {a.title}</Text>
    <Text style={S.description}>{a.finalLine}</Text>
    <Text style={S.mini}>{a.decisions} meaningful decisions</Text>
   </View>)}
  </View>:null}
  {!compact&&view.ancestors.length?<View style={S.archive}>
   <Text style={S.overline}>CROSS-GENERATIONAL CONSEQUENCES</Text>
   {view.ancestors.slice(0,4).map((x,i)=><View key={x.generation+'-'+i} style={S.record}>
    <Text style={S.overline}>GEN {x.generation} · {x.name}</Text>
    <Text style={S.description}>{x.note}</Text></View>)}
  </View>:null}
  <Text style={S.mini}>No forced choices, fake jobs, invented customers or guaranteed story outcomes. Existing relationships and money remain authoritative.</Text>
 </View>;
}
const S=StyleSheet.create({
 root:{borderWidth:1,borderColor:C.line,borderRadius:16,backgroundColor:C.bg,padding:13,gap:12},
 split:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:.6,color:C.gold,flexShrink:1},
 heading:{fontSize:20,lineHeight:27,color:C.ink,fontWeight:'900'},
 count:{fontSize:10,fontWeight:'900',color:C.mint},
 description:{fontSize:12,lineHeight:18,color:C.muted,flexShrink:1},
 event:{backgroundColor:C.panel,padding:12,borderRadius:12,borderWidth:1,borderColor:C.line,gap:10},
 eventActive:{borderColor:C.mint},
 title:{fontSize:17,lineHeight:23,color:C.ink,fontWeight:'900'},
 stage:{flexDirection:'row',gap:7,backgroundColor:'#1A3235',borderRadius:11,padding:11,alignItems:'center'},
 character:{alignItems:'center',gap:6,flex:1,minWidth:0},
 avatar:{height:54,width:54,borderRadius:27,backgroundColor:'#4B7770',borderWidth:1,borderColor:C.mint,justifyContent:'center',alignItems:'center'},
 avatarText:{fontSize:16,fontWeight:'900',color:C.ink},
 characterName:{fontSize:12,fontWeight:'900',color:C.ink,textAlign:'center'},
 centerColumn:{alignItems:'center',minWidth:45,maxWidth:95,gap:4},
 connection:{fontSize:30,fontWeight:'700',color:C.gold},
 mini:{fontSize:10,color:C.muted,lineHeight:15,textAlign:'left',flexShrink:1},
 metrics:{flexDirection:'row',gap:8,flexWrap:'wrap'},
 meter:{flex:1,flexBasis:80,minWidth:0,gap:5},
 meterNumber:{fontSize:11,fontWeight:'900',color:C.ink},
 track:{height:7,borderRadius:5,backgroundColor:'#4B6260',overflow:'hidden'},
 bar:{height:7,borderRadius:5},
 detail:{fontSize:12,lineHeight:18,color:C.ink},
 warning:{color:C.red,fontSize:11,lineHeight:17},
 waiting:{color:C.gold,fontSize:12,lineHeight:18},
 impact:{backgroundColor:C.raised,padding:10,borderRadius:10,gap:9},
 pills:{flexDirection:'row',flexWrap:'wrap',gap:6},
 delta:{fontSize:10,fontWeight:'800',color:C.mint,padding:8,backgroundColor:'#20382E',borderRadius:8},
 options:{gap:7},
 option:{minHeight:48,padding:11,borderRadius:10,backgroundColor:C.raised,borderWidth:1,borderColor:'#769489',gap:5},
 disabled:{opacity:.4},
 optionTitle:{color:C.ink,fontSize:12,lineHeight:18,fontWeight:'900'},
 optionDescription:{fontSize:11,color:C.muted,lineHeight:17},
 archive:{gap:9},record:{backgroundColor:C.panel,borderRadius:10,padding:12,gap:7},
 recordTitle:{fontSize:13,fontWeight:'800',color:C.ink}
});
