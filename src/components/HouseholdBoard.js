import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const C={panel:'#1B3035',card:'#233D3E',ink:'#F7F7ED',muted:'#B5CCC3',green:'#C9F28A',gold:'#FFDBA2',line:'#43665D'};
const dollars=n=>'$'+Math.round(n||0).toLocaleString('en-US');
const title=s=>(s||'').charAt(0).toUpperCase()+(s||'').slice(1);
function CashLine({label,value,accent=false}){
 return <View style={S.between}><Text style={S.description}>{label}</Text><Text style={[S.number,accent&&{color:C.green}]}>{dollars(value)}</Text></View>;
}
function Command({action,onAction}){
 return <Pressable accessibilityRole="button" accessibilityLabel={action.label+', '+action.detail}
  accessibilityState={{disabled:!action.enabled}} testID={'household-'+action.id.replace(/:/g,'-')}
  disabled={!action.enabled} onPress={()=>onAction(action.id)}
  style={({pressed})=>[S.button,action.enabled?null:{opacity:.38},pressed&&{opacity:.7}]}>
  <Text style={S.buttonText}>{action.label}</Text>
  <Text style={S.description}>{action.detail}</Text>
 </Pressable>;
}
export default function HouseholdBoard({summary,actions,onAction,blocked}){
 const [expanded,setExpanded]=useState(false);
 const available=actions.filter(c=>c.id.startsWith('household:'));
 const priorities=available.filter(c=>c.id.startsWith('household:priority:'));
 const partnerActions=available.filter(c=>c.id.startsWith('household:duties:')||c.id.startsWith('household:agreement:'));
 const emergency=available.filter(c=>c.id.startsWith('household:reserve:'));
 const education=available.filter(c=>c.id.startsWith('household:education:'));
 const mediation=available.filter(c=>c.id.startsWith('household:mediate:'));
 return <View testID="household-board" style={S.board}>
  <View style={S.between}><Text style={S.overline}>LIVING HOUSEHOLD ECONOMY</Text><Text style={S.gold}>NO NEW CURRENCY</Text></View>
  <Text style={S.title}>Your family's shared decisions</Text>
  <Text style={S.description}>Reserve money you already have, negotiate real partner contributions, and balance daily costs with your children's opportunities.</Text>
  <View style={S.panel} testID="household-financial-snapshot">
   <CashLine label="Protected emergency money" value={summary.emergency} accent/>
   <CashLine label="Education funds for children" value={summary.educationTotal} accent/>
   <CashLine label="Total earmarked money" value={summary.protectedAssets}/>
   <Text style={S.hint}>These funds are already part of your net worth, not extra rewards. Money spent on education leaves the family estate.</Text>
  </View>
  <View style={S.panel} testID="household-current-plan">
   <View style={S.between}><Text style={S.subtitle}>Household priority</Text><Text style={S.tag}>{title(summary.priority)}</Text></View>
   <View style={S.between}><Text style={S.subtitle}>Care responsibilities</Text><Text style={S.tag}>{title(summary.responsibility)}</Text></View>
   <View style={S.between}><Text style={S.subtitle}>Partner finances</Text><Text style={S.tag}>{summary.agreement==='shared'?'Shared by agreement':'Independent'}</Text></View>
   {summary.last?<><Text style={S.overline}>LAST YEAR'S ACCOUNT</Text>
     <CashLine label="Partner's real contribution" value={summary.last.contribution}/>
     <CashLine label="Change in annual living costs" value={summary.last.expenseChange}/>
     <Text style={S.hint}>{summary.last.educationBoosts} child education boosts · age {summary.last.age}</Text></>:null}
  </View>
  {summary.partner?<View style={S.panel} testID="household-partner">
   <Text style={S.subtitle}>Working with {summary.partner.name}</Text>
   <Text style={S.description}>{summary.partner.personality} · trust {summary.partner.trust}/100</Text>
   <CashLine label="Partner's own savings" value={summary.partner.cash}/>
   <Text style={S.hint}>Contributions deduct money from your partner's existing savings. Their financial independence is preserved unless both agree to share.</Text>
  </View>:null}
  {summary.children.length?<View style={S.panel} testID="household-education-funds">
   <Text style={S.overline}>FUTURE OPPORTUNITIES</Text>
   {summary.children.slice(0,12).map(p=><View key={p.id} style={S.child}>
    <View style={S.between}><Text style={S.subtitle}>{p.name}</Text><Text style={S.tag}>Age {p.age}</Text></View>
    <CashLine label="Education savings" value={p.amount}/>
    <Text style={S.description}>Learning potential {p.talent}/100</Text>
   </View>)}
   <Text style={S.hint}>Funds designated for living children remain assigned to them when an estate passes to the next generation.</Text>
  </View>:null}
  {!blocked&&<View style={S.group}>
   <Text style={S.overline}>CHOOSE YOUR HOUSEHOLD PRIORITIES</Text>
   {priorities.map(a=><Command key={a.id} action={a} onAction={onAction}/>)}
   {partnerActions.length?<><Text style={S.overline}>WORK TOGETHER</Text>
    {partnerActions.map(a=><Command key={a.id} action={a} onAction={onAction}/>)}</>:null}
   <Text style={S.overline}>BUILD AN EMERGENCY RESERVE</Text>
   {emergency.map(a=><Command key={a.id} action={a} onAction={onAction}/>)}
   {education.length?<><Text style={S.overline}>SUPPORT CHILDREN'S EDUCATION</Text>
    {education.slice(0,expanded?education.length:4).map(a=><Command key={a.id} action={a} onAction={onAction}/>)}
    {education.length>4?<Pressable accessibilityRole="button" testID="household-more-education" onPress={()=>setExpanded(!expanded)} style={S.button}>
     <Text style={S.buttonText}>{expanded?'Show fewer choices':'Show all '+education.length+' education choices'}</Text>
    </Pressable>:null}</>:null}
   {mediation.length?<><Text style={S.overline}>REPAIR SIBLING RELATIONSHIPS</Text>
    {mediation.map(a=><Command key={a.id} action={a} onAction={onAction}/>)}</>:null}
  </View>}
  {summary.annual.length?<View style={S.panel} testID="household-annual-history">
   <Text style={S.overline}>REAL ANNUAL CONSEQUENCES</Text>
   {summary.annual.slice(0,3).map(x=><Text key={x.age} style={S.description}>Age {x.age} · {x.priority} · partner {dollars(x.contribution)} · cost change {dollars(x.expenseChange)}</Text>)}
  </View>:null}
  {summary.ledger.length?<View style={S.panel}>
   <Text style={S.overline}>HOUSEHOLD DECISION HISTORY</Text>
   {summary.ledger.slice(0,5).map((e,i)=><Text key={i} style={S.description}>Age {e.age}: {e.text}</Text>)}
  </View>:null}
 </View>;
}
export function HouseholdLifeRecap({summary}){
 return <View testID="household-family-recap" style={{gap:6}}>
  <Text style={S.overline}>CARE, MONEY AND EDUCATION</Text>
  <Text style={S.description}>Priority: {title(summary.priority)} · Responsibilities: {title(summary.responsibility)}</Text>
  <Text style={S.description}>Protected reserves: {dollars(summary.emergency)} · Education earmarks: {dollars(summary.educationTotal)}</Text>
  {summary.generationNotes.slice(0,3).map((x,i)=><Text key={i} style={S.description}>◇ {x.from} planned for family care and passed on their household history.</Text>)}
 </View>;
}
const S=StyleSheet.create({
 board:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:18,padding:14,gap:12},
 between:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8,flexWrap:'wrap'},
 overline:{fontSize:10,fontWeight:'900',color:C.green,letterSpacing:.8},
 gold:{fontSize:10,color:C.gold,fontWeight:'900'},
 title:{color:C.ink,fontSize:22,fontWeight:'900',lineHeight:28},
 subtitle:{fontSize:13,fontWeight:'800',color:C.ink,flexShrink:1},
 number:{fontSize:13,fontWeight:'800',color:C.ink},
 description:{fontSize:12,color:C.muted,lineHeight:18,flexShrink:1},
 hint:{fontSize:11,color:C.gold,lineHeight:17},
 panel:{backgroundColor:C.card,borderRadius:12,padding:12,gap:9},
 tag:{fontSize:11,fontWeight:'900',color:C.gold,flexShrink:1},
 group:{gap:8},
 button:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:12,padding:12,minHeight:50,gap:4,justifyContent:'center'},
 buttonText:{fontSize:13,color:C.ink,fontWeight:'800',lineHeight:18},
 child:{borderBottomColor:C.line,borderBottomWidth:1,paddingVertical:7,gap:5}
});
