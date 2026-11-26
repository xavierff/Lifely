import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const C={bg:'#172C31',tile:'#263E42',ink:'#F6F6EC',muted:'#B8CEC7',accent:'#D3F69A',gold:'#F9DDA6',warn:'#FFBAAA',line:'#58736B'};
const fmt=n=>'$'+Math.round(n||0).toLocaleString('en-US');
function Metric({name,value,warn=false}){
 const now=Math.max(0,Math.min(100,Math.round(value||0)));
 return <View style={S.metric}>
  <View style={S.between}><Text style={S.micro}>{name}</Text><Text style={[S.micro,{color:warn?C.warn:C.accent,fontWeight:'900'}]}>{now}</Text></View>
  <View style={S.bar} accessibilityRole="progressbar" accessibilityLabel={name} accessibilityValue={{min:0,max:100,now}}>
   <View style={[S.fill,{width:now+'%',backgroundColor:warn?C.warn:C.accent}]}/>
  </View>
 </View>;
}
function Action({item,onAction}){
 return <Pressable accessibilityRole="button" accessibilityState={{disabled:!item.enabled}} accessibilityLabel={item.label+', '+item.detail}
  testID={'transition-'+item.id.replace(/:/g,'-')}
  disabled={!item.enabled} onPress={()=>onAction(item.id)}
  style={({pressed})=>[S.action,!item.enabled&&{opacity:.38},pressed&&{opacity:.7}]}>
   <Text style={S.actionText}>{item.label}</Text><Text style={S.small}>{item.detail}</Text>
 </Pressable>;
}
export default function FamilyTransitionsBoard({summary,commands,onAction,blocked}){
 const [expanded,setExpanded]=useState(false),[historyExpanded,setHistoryExpanded]=useState(false);
 const options=commands.filter(c=>c.id.startsWith('transition:'));
 const groups=[
  ['PARENTING AFTER SEPARATION',options.filter(x=>x.id.startsWith('transition:coparent:')||x.id==='transition:reconcile')],
  ['SHARED PROPERTY SETTLEMENTS',options.filter(x=>x.id.startsWith('transition:property:'))],
  ['ELDER CARE AND SUPPORT',options.filter(x=>x.id.startsWith('transition:care:')||x.id.startsWith('transition:checkin:'))],
  ['CHILDREN FIND THEIR OWN WAY',options.filter(x=>x.id.startsWith('transition:guide:'))]
 ];
 return <View testID="family-transitions-board" style={S.board}>
  <View style={S.between}><Text style={S.overline}>FAMILY LIFE AFTER BIG DECISIONS</Text><Text style={S.label}>OFFLINE · FICTIONAL</Text></View>
  <Text style={S.title}>Families change. Choices endure.</Text>
  <Text style={S.small}>Relationships and money keep moving after separation. Children grow into independent adults, and older relatives may need more of your time.</Text>
  {summary.separation?<View style={S.panel} testID="transition-coparenting">
    <View style={S.between}><Text style={S.subtitle}>Co-parenting with {summary.separation.exName}</Text>
     <Text style={S.label}>{summary.separation.active?'CONTACT POSSIBLE':'CONTACT UNAVAILABLE'}</Text></View>
    <Text style={S.small}>{summary.separation.wasMarried?'Previously married':'Former partners'} · {summary.separation.minorChildren.length} minor children · {summary.separation.plan} arrangement</Text>
    <View style={S.metrics}><Metric name="Cooperation" value={summary.separation.cooperation}/><Metric name="Disagreement" value={summary.separation.disagreements} warn/></View>
    <Text style={S.small}>Total received {fmt(summary.separation.supportReceived)} · Total contributed {fmt(summary.separation.supportPaid)}</Text>
    {summary.separation.active?<Text style={S.hint}>Former partner's own savings: {fmt(summary.separation.exCash)}. Transfers only use existing character funds.</Text>:null}
   </View>:null}
  {summary.propertyCase?<View testID="transition-property-case" style={S.panel}>
    <Text style={S.overline}>UNRESOLVED PROPERTY DISCUSSION</Text>
    <Text style={S.subtitle}>{summary.propertyCase.propertyId} · {fmt(summary.propertyCase.currentValue)}</Text>
    <Text style={S.small}>Sale is paused while you decide whether to split proceeds, negotiate another division, buy out the other person, or leave the matter unresolved.</Text>
   </View>:null}
  {summary.care.length?<View testID="transition-care-plans" style={S.panel}>
    <Text style={S.overline}>FAMILY CARE COMMITMENTS</Text>
    {summary.care.map(p=><View key={p.personId} style={S.record}>
     <View style={S.between}><Text style={S.subtitle}>{p.personName}</Text><Text style={S.label}>{p.mode.toUpperCase()}</Text></View>
     <Text style={S.small}>{p.active?'Ongoing annual support and care consequences':'Relationship or availability changed'} · Started at age {p.sinceAge}</Text>
    </View>)}
   </View>:null}
  {summary.youth.length?<View testID="transition-independent-youth" style={S.panel}>
    <Text style={S.overline}>YOUNG ADULTS CHOOSE FOR THEMSELVES</Text>
    {summary.youth.map(p=><View key={p.personId} style={S.record}>
     <View style={S.between}><Text style={S.subtitle}>{p.name}</Text><Text style={S.label}>{(p.path||'EXPLORING').toUpperCase()}</Text></View>
     <Text style={S.small}>{p.personality} · agency {p.agency}/100 · learning potential {p.talent}/100</Text>
     <Text style={S.small}>Personal savings {fmt(p.cash)} · personal debt {fmt(p.debt)}</Text>
     <Text style={S.hint}>You can offer advice; their decision and finances belong to them.</Text>
    </View>)}
   </View>:null}
  {!blocked&&groups.some(([,items])=>items.length)?<View style={S.options}>
    {groups.map(([heading,items],i)=>items.length?<View key={heading} style={S.group}>
      <Text style={S.overline}>{heading}</Text>
      {(expanded?items:items.slice(0,i===3?2:3)).map(item=><Action key={item.id} item={item} onAction={onAction}/>)}
    </View>:null)}
    {groups.some(([,items],i)=>items.length>(i===3?2:3))?
     <Pressable testID="transition-show-all" accessibilityRole="button" onPress={()=>setExpanded(!expanded)} style={S.action}>
      <Text style={S.actionText}>{expanded?'Show essential choices':'Explore all available family choices'}</Text>
     </Pressable>:null}
   </View>:null}
  {summary.records.length?<View testID="transition-life-record" style={S.panel}>
    <Text style={S.overline}>CHOICES THAT CHANGED YOUR FAMILY</Text>
    {(historyExpanded?summary.records:summary.records.slice(0,4)).map((r,i)=><Text key={i} style={S.small}>Age {r.age}: {r.message}</Text>)}
    {summary.records.length>4?<Pressable testID="transition-history-toggle" accessibilityRole="button" onPress={()=>setHistoryExpanded(!historyExpanded)}>
     <Text style={S.hint}>{historyExpanded?'Show fewer decisions':'Show more family decisions'}</Text>
    </Pressable>:null}
   </View>:null}
  {summary.ancestry.length?<View style={S.panel}>
   <Text style={S.overline}>MEMORIES FROM PREVIOUS GENERATIONS</Text>
   {summary.ancestry.slice(0,3).map((r,i)=><Text key={i} style={S.small}>◇ {r.sourceLife}: {r.message}</Text>)}
   </View>:null}
 </View>;
}
export function TransitionMoneyRecap({summary}){
 const r=summary.annual[0];
 return <View testID="transition-money-recap" style={{gap:8}}>
  <Text style={S.overline}>FAMILY TRANSITIONS · FINANCIAL EFFECTS</Text>
  {r?<><Text style={S.small}>Age {r.age} · {r.plan} parenting arrangement</Text>
   <View style={S.between}><Text style={S.small}>Actual co-parent support received</Text><Text style={S.number}>{fmt(r.supportIn)}</Text></View>
   <View style={S.between}><Text style={S.small}>Actual co-parent support sent</Text><Text style={S.number}>{fmt(r.supportOut)}</Text></View>
   <View style={S.between}><Text style={S.small}>Elder care costs</Text><Text style={S.number}>{fmt(r.careCosts)}</Text></View>
   <Text style={S.hint}>Parenting support moves money between existing characters. Care costs change your actual annual spending.</Text>
  </>:<Text style={S.small}>Caregiving and co-parenting costs will be shown here when they arise.</Text>}
 </View>;
}
const S=StyleSheet.create({
 board:{backgroundColor:C.bg,borderWidth:1,borderColor:C.line,borderRadius:20,gap:12,padding:15},
 between:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:9,flexWrap:'wrap'},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:.8,color:C.accent},
 label:{fontSize:10,fontWeight:'800',color:C.gold,flexShrink:1},
 title:{fontSize:21,lineHeight:27,fontWeight:'900',color:C.ink},
 subtitle:{fontSize:14,lineHeight:20,fontWeight:'900',color:C.ink,flexShrink:1},
 small:{fontSize:12,lineHeight:18,color:C.muted,flexShrink:1},
 hint:{fontSize:11,lineHeight:17,color:C.gold},
 number:{fontSize:12,fontWeight:'900',color:C.ink},
 panel:{backgroundColor:C.tile,borderRadius:13,padding:12,gap:9},
 metrics:{flexDirection:'row',gap:12,flexWrap:'wrap'},
 metric:{flex:1,minWidth:110,gap:5},
 micro:{color:C.muted,fontSize:11},
 bar:{height:7,borderRadius:5,overflow:'hidden',backgroundColor:'#46615A'},
 fill:{height:7,borderRadius:5},
 options:{gap:11},group:{gap:7},
 action:{minHeight:52,backgroundColor:C.tile,borderWidth:1,borderColor:C.line,borderRadius:12,padding:12,gap:5,justifyContent:'center'},
 actionText:{fontSize:13,lineHeight:19,fontWeight:'800',color:C.ink},
 record:{gap:5,borderBottomWidth:1,borderColor:C.line,paddingBottom:9}
});
