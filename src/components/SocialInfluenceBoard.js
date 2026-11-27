import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';

const C={bg:'#14292C',panel:'#213B3F',raised:'#2B4A42',ink:'#F7F8F1',muted:'#B8CFC6',
 gold:'#F6D99D',mint:'#CDF1B2',red:'#F8B7AF',line:'#54786C'};
const titles={family:'PERSONAL TRUST',professional:'PROFESSIONAL STANDING',community:'COMMUNITY INFLUENCE'};
const cap=n=>Math.max(0,Math.min(100,Number(n)||0));
const signed=n=>(n>=0?'+':'')+n;
function Meter({group,value}){
 return <View style={S.meter} testID={'influence-standing-'+group}>
  <View style={S.split}>
   <Text style={S.overline}>{titles[group]}</Text>
   <Text style={S.value}>{value.effective}/100</Text>
  </View>
  <View style={S.track}><View style={[S.fill,{width:cap(value.effective)+'%',
   backgroundColor:value.effective<40?C.red:C.mint}]}/></View>
  <Text style={S.mini}>Earned {value.earned} · Family-name echo {signed(value.inherited)}</Text>
 </View>;
}
function Avatar({name}){
 return <View style={S.avatar}><Text style={S.avatarText}>{name.split(' ').slice(0,2).map(x=>x[0]||'').join('').toUpperCase()}</Text></View>;
}
function Offer({item,commands,onAction}){
 const choices=commands.filter(c=>c.id.startsWith('influence:'+item.id+':'));
 return <View style={S.offer} testID="social-influence-offer">
  <View style={S.split}>
   <Text style={S.overline}>{item.tone==='repair'?'ACCOUNTABILITY':'TRUST OPPORTUNITY'} · {item.group.toUpperCase()}</Text>
   <Text style={S.overline}>AGE {item.startedAge}</Text>
  </View>
  <Text style={S.offerTitle}>{item.title}</Text>
  <View style={S.person}><Avatar name={item.name}/><View style={{flex:1,gap:4}}>
   <Text style={S.personName}>{item.name}</Text>
   <Text style={S.mini}>{item.role} · Existing relationship</Text>
  </View></View>
  <Text style={S.description}>{item.context}</Text>
  <View style={S.metrics}>
   <Text style={S.pill}>Trust {item.currentTrust??'—'}</Text>
   <Text style={S.pill}>Rivalry {item.currentRivalry??'—'}</Text>
   <Text style={S.pill}>At invitation {item.scoreAtOffer}</Text>
  </View>
  <Text style={S.overline}>YOUR RESPONSE</Text>
  {choices.map(c=><Pressable key={c.id} testID={'influence-option-'+c.id.split(':').at(-1)}
   accessibilityRole="button" accessibilityLabel={c.label+', '+c.detail}
   accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled}
   onPress={()=>onAction(c.id)}
   style={({pressed})=>[S.button,!c.enabled&&S.disabled,pressed&&{opacity:.72}]}>
   <Text style={S.buttonLabel}>{c.label}</Text>
   <Text style={S.mini}>{c.detail}</Text>
  </Pressable>)}
  <Text style={S.mini}>Respond before age {item.dueAge+1}. The invitation is optional; you can keep living your life.</Text>
 </View>;
}
export default function SocialInfluenceBoard({view,commands=[],onAction,compact=false}){
 const last=view.completed[0],showLast=last?.endedAge===view.age;
 if(compact&&!view.active&&!showLast)return null;
 return <View testID={compact?'social-influence-preview':'social-influence-board'} style={S.root}>
  <View style={S.split}><View style={{flex:1,gap:3}}>
   <Text style={S.overline}>THE PEOPLE WHO REMEMBER</Text>
   <Text style={S.title}>{compact?'Your reputation has consequences':'Reputation & social influence'}</Text>
  </View><Text style={S.count}>3 LIVING CIRCLES</Text></View>
  <Text style={S.description}>Your standing is earned through real decisions, not random annual bonuses. Professional success, community trust and personal relationships remain separate.</Text>
  <View style={S.meters}>
   {['family','professional','community'].map(group=><Meter key={group} group={group} value={view.standing[group]}/>)}
  </View>
  {view.active?<Offer item={view.active} commands={commands} onAction={onAction}/>:null}
  {!view.active&&showLast?<View testID="social-influence-impact" style={S.offer}>
   <Text style={S.overline}>A DECISION FROM THIS YEAR</Text>
   <Text style={S.offerTitle}>{last.name} · {last.ending}</Text>
   <Text style={S.description}>{last.finalLine}</Text>
   {last.choice?<View style={S.metrics}>
    <Text style={S.pill}>Trust {signed(last.choice.trustDelta)}</Text>
    <Text style={S.pill}>Rivalry {signed(last.choice.rivalryDelta)}</Text>
    <Text style={S.pill}>Standing {signed(last.choice.scoreDelta)}</Text>
   </View>:null}
  </View>:null}
  {!compact&&view.recent.length?<View testID="social-influence-evidence" style={S.records}>
   <Text style={S.overline}>EVIDENCE BEHIND YOUR REPUTATION</Text>
   {view.recent.slice(0,8).map(x=><View key={x.id} style={S.record}>
    <View style={S.split}><Text style={S.mini}>AGE {x.age} · {x.group.toUpperCase()}</Text>
     <Text style={[S.change,{color:x.delta>=0?C.mint:C.red}]}>{signed(x.delta)}</Text></View>
    <Text style={S.description}>{x.label}</Text>
   </View>)}
  </View>:null}
  {!compact&&view.completed.length?<View testID="social-influence-history" style={S.records}>
   <Text style={S.overline}>RELATIONSHIPS AFFECTED BY YOUR NAME</Text>
   {view.completed.slice(0,5).map(x=><View key={x.id} style={S.record}>
    <View style={S.split}><Text style={S.personName}>{x.name}</Text>
     <Text style={S.overline}>{x.ending.toUpperCase()}</Text></View>
    <Text style={S.mini}>{x.group.toUpperCase()} · AGE {x.endedAge}</Text>
    <Text style={S.description}>{x.finalLine}</Text>
   </View>)}
  </View>:null}
  {!compact&&view.ancestors.length?<View testID="social-influence-legacy" style={S.records}>
   <Text style={S.overline}>AN INHERITED NAME, NOT AN INHERITED DESTINY</Text>
   <Text style={S.description}>A past generation leaves a small expectation, not free money, jobs or personal trust. You still need living connections and your own choices.</Text>
   {view.ancestors.slice(0,4).map((x,i)=><View key={x.generation+'-'+i} style={S.record}>
    <Text style={S.overline}>GEN {x.generation} · {x.name}</Text><Text style={S.description}>{x.note}</Text>
   </View>)}
  </View>:null}
  {!compact&&!view.active&&!view.recent.length?<Text style={S.mini}>Earned reputation will appear when your relationships and career stories develop. You can continue playing normally.</Text>:null}
 </View>;
}
const S=StyleSheet.create({
 root:{backgroundColor:C.bg,padding:13,borderRadius:16,borderWidth:1,borderColor:C.line,gap:12},
 split:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:.6,color:C.gold,flexShrink:1},
 title:{fontSize:18,lineHeight:25,fontWeight:'900',color:C.ink},
 count:{fontSize:10,color:C.mint,fontWeight:'900'},
 description:{fontSize:12,lineHeight:18,color:C.muted,flexShrink:1},
 meters:{gap:8},meter:{padding:9,backgroundColor:C.panel,borderRadius:10,gap:6},
 value:{fontSize:13,fontWeight:'900',color:C.ink},
 track:{height:8,borderRadius:6,overflow:'hidden',backgroundColor:'#506A66'},
 fill:{height:8,borderRadius:6},mini:{fontSize:10,lineHeight:16,color:C.muted,flexShrink:1},
 offer:{padding:12,borderWidth:1,borderColor:C.mint,borderRadius:11,backgroundColor:C.panel,gap:10},
 offerTitle:{fontSize:15,fontWeight:'900',lineHeight:21,color:C.ink},
 person:{flexDirection:'row',alignItems:'center',gap:10},
 avatar:{width:46,height:46,borderRadius:25,borderWidth:1,borderColor:C.gold,backgroundColor:'#486F68',alignItems:'center',justifyContent:'center'},
 avatarText:{fontSize:16,fontWeight:'900',color:C.ink},
 personName:{fontSize:12,fontWeight:'900',color:C.ink,flexShrink:1},
 metrics:{flexDirection:'row',flexWrap:'wrap',gap:6},
 pill:{backgroundColor:C.raised,borderRadius:7,padding:8,color:C.mint,fontWeight:'800',fontSize:10},
 button:{borderWidth:1,borderColor:'#74978A',borderRadius:9,backgroundColor:C.raised,padding:11,gap:4,minHeight:49},
 buttonLabel:{fontSize:12,fontWeight:'900',color:C.ink},
 disabled:{opacity:.4},records:{gap:8},record:{borderRadius:10,padding:11,backgroundColor:C.panel,gap:5},
 change:{fontSize:13,fontWeight:'900'}
});
