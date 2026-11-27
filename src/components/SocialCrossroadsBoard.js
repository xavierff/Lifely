import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const C={background:'#192D30',tile:'#243C41',ink:'#F7F7EF',muted:'#BBCCC7',accent:'#CFF0AE',
 gold:'#FFE0A4',rose:'#F8BEB8',line:'#51706A',blue:'#A9DCE8'};
const title=x=>x?x.charAt(0).toUpperCase()+x.slice(1):'Unknown';
const initials=x=>String(x||'?').split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase();
const tone=x=>['rivals','betrayed','estranged'].includes(x)?C.rose:
 ['friends','allies','partners'].includes(x)?C.accent:C.blue;
function Meter({label,value,bad=false}){
 const x=Math.max(0,Math.min(100,Number(value)||0));
 return <View style={S.meter}><View style={S.split}>
   <Text style={S.muted}>{label}</Text><Text style={S.meterValue}>{x}</Text>
  </View><View style={S.track}><View style={[S.trackFill,{width:x+'%',backgroundColor:bad?C.rose:C.accent}]}/></View></View>;
}
function Person({name,isSecond=false}){
 return <View style={S.person}>
  <View style={[S.avatar,isSecond&&S.secondAvatar]}><Text style={S.avatarLetter}>{initials(name)}</Text></View>
  <Text style={S.personName} numberOfLines={2}>{name}</Text>
 </View>;
}
function Outcome({item}){
 return <View testID={'crossroads-record-'+item.id} style={S.record}>
  <View style={S.split}><Text style={S.overline}>AGE {item.startAge}–{item.endedAge}</Text>
   <Text style={[S.status,{color:tone(item.ending)}]}>{title(item.ending).toUpperCase()}</Text></View>
  <Text style={S.cardTitle}>{item.title}</Text>
  <Text style={S.muted}>{item.aName} & {item.bName}</Text>
  <Text style={S.story}>{item.finalLine}</Text>
  <Text style={S.muted}>{item.steps} decisions made</Text>
 </View>;
}
function Opportunity({item,choices,onAction}){
 const stage=item.status==='ready'?'THE STORY RETURNS':item.status==='waiting'?'THE YEARS BETWEEN':'A NEW CROSSROADS';
 const playable=item.status==='open'||item.status==='ready';
 return <View testID={'crossroads-event-'+item.id} style={[S.event,playable&&S.eventReady]}>
  <View style={S.split}><Text style={S.overline}>{stage}</Text>
   <Text style={[S.status,{color:tone(item.nowStatus)}]}>{title(item.nowStatus).toUpperCase()}</Text></View>
  <Text style={S.cardTitle}>{item.title}</Text>
  <View style={S.peopleStage}>
   <Person name={item.aName}/>
   <View style={S.middle}><Text style={S.symbol}>⌁</Text><Text style={S.muted}>THEIR BOND</Text></View>
   <Person name={item.bName} isSecond/>
  </View>
  <View style={S.meters}>
   <Meter label="Mutual trust" value={item.nowTrust}/>
   {item.nowRivalry!==null?<Meter label="Rivalry" value={item.nowRivalry} bad/>:null}
  </View>
  <Text style={S.story}>{item.introduction}</Text>
  {item.status==='waiting'?<Text style={S.notice}>Your response was recorded. Their next chapter may become available at age {item.dueAge}. Their own lives continue in the meantime.</Text>:null}
  {item.status==='ready'?<Text style={S.notice}>Years have passed since your first decision. Their relationship is currently {item.nowStatus}, with {item.nowTrust} trust.</Text>:null}
  {item.changes?<View testID="crossroads-decision-impact" style={S.impact}>
   <Text style={S.overline}>WHAT ACTUALLY CHANGED</Text>
   <View style={S.chipRow}><Text style={S.chip}>Trust {item.changes.trust>=0?'+':''}{item.changes.trust}</Text>
    <Text style={S.chip}>Rivalry {item.changes.rivalry>=0?'+':''}{item.changes.rivalry}</Text>
    {item.changes.stat?<Text style={S.chip}>{title(item.changes.stat)} {item.changes.statDelta>=0?'+':''}{item.changes.statDelta}</Text>:null}
   </View>
   <Text style={S.muted}>Resulting relationship: {title(item.changes.statusAfter)}</Text>
  </View>:null}
  {playable?choices.map(c=><Pressable key={c.id}
    testID={'crossroads-option-'+item.id+'-'+c.id.split(':').at(-1)}
    accessibilityRole="button" accessibilityLabel={c.label+', '+c.detail}
    accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled}
    style={({pressed})=>[S.choice,!c.enabled&&S.disabled,pressed&&{opacity:.74}]}
    onPress={()=>onAction(c.id)}>
    <Text style={S.choiceTitle}>{c.label}</Text><Text style={S.choiceDetail}>{c.detail}</Text>
   </Pressable>):null}
  {playable?<Text style={S.disclaimer}>Your response uses one regular activity. The NPCs may decide differently later; no outcome is guaranteed.</Text>:null}
 </View>;
}
export default function SocialCrossroadsBoard({view,commands=[],onAction,compact=false}){
 const rows=compact?view.open.filter(x=>x.status==='open'||x.status==='ready').slice(0,1):view.open.slice(0,3);
 if(compact&&!rows.length)return null;
 return <View testID={compact?'crossroads-preview':'crossroads-board'} style={S.root}>
  <View style={S.split}><View style={{flex:1,gap:3}}>
    <Text style={S.overline}>A WORLD THAT MOVES WITHOUT YOU</Text>
    <Text style={S.heading}>{compact?'People are calling on you':'The social crossroads'}</Text></View>
   <Text style={S.counter}>{view.total} STORIES</Text>
  </View>
  <Text style={S.description}>Friends form alliances, partners drift apart, and rivals reconsider their differences without waiting for your turn. You can influence a real relationship, but you cannot control the people involved.</Text>
  {rows.map(x=><Opportunity key={x.id} item={x} onAction={onAction}
   choices={commands.filter(c=>c.id.startsWith('cross:')&&c.id.includes(':'+x.id+':'))}/>)}
  {!compact&&view.completed.length?<View testID="crossroads-archive" style={S.archive}>
   <Text style={S.overline}>STORIES THAT LEFT A MARK</Text>
   {view.completed.slice(0,5).map(x=><Outcome key={x.id} item={x}/>)}
  </View>:null}
  {!compact&&view.ancestors.length?<View style={S.archive}>
   <Text style={S.overline}>THE WORLD REMEMBERS</Text>
   {view.ancestors.slice(0,5).map((x,i)=><View key={x.generation+'-'+i} style={S.record}>
    <Text style={S.overline}>GENERATION {x.generation} · {x.name}</Text>
    <Text style={S.story}>{x.note}</Text></View>)}
  </View>:null}
  {!rows.length&&!view.completed.length&&!compact?<Text style={S.notice}>As more people build relationships, their own decisions will create new situations. No social choices are required to advance your life.</Text>:null}
  <Text style={S.disclaimer}>Unanswered invitations eventually expire. They do not block aging or invent financial rewards.</Text>
 </View>;
}
const S=StyleSheet.create({
 root:{borderRadius:17,borderColor:C.line,borderWidth:1,backgroundColor:C.background,padding:13,gap:11},
 split:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:9},
 overline:{color:C.gold,fontSize:10,fontWeight:'900',letterSpacing:.6,flexShrink:1},
 heading:{color:C.ink,fontSize:20,lineHeight:26,fontWeight:'900'},
 counter:{fontSize:10,color:C.accent,fontWeight:'900'},
 description:{fontSize:12,lineHeight:19,color:C.muted},
 event:{backgroundColor:C.tile,borderRadius:13,borderWidth:1,borderColor:C.line,padding:13,gap:10},
 eventReady:{borderColor:C.accent},cardTitle:{fontSize:17,fontWeight:'900',color:C.ink,lineHeight:24},
 status:{fontSize:10,fontWeight:'900',maxWidth:115,textAlign:'right',flexShrink:1},
 peopleStage:{flexDirection:'row',gap:6,alignItems:'center',backgroundColor:'#192F35',borderRadius:11,padding:11},
 person:{flex:1,alignItems:'center',minWidth:0,gap:7},
 avatar:{width:57,height:57,borderRadius:29,borderWidth:2,borderColor:C.accent,backgroundColor:'#416759',alignItems:'center',justifyContent:'center'},
 secondAvatar:{borderColor:C.blue,backgroundColor:'#46647D'},
 avatarLetter:{fontSize:17,color:C.ink,fontWeight:'900'},
 personName:{color:C.ink,fontSize:12,textAlign:'center',fontWeight:'800'},
 middle:{maxWidth:100,minWidth:45,alignItems:'center',gap:3},
 symbol:{fontSize:32,color:C.gold},muted:{fontSize:11,color:C.muted,lineHeight:17,flexShrink:1},
 meters:{flexDirection:'row',gap:8,flexWrap:'wrap'},
 meter:{flex:1,flexBasis:104,minWidth:0,gap:6},
 meterValue:{fontSize:11,color:C.ink,fontWeight:'900'},
 track:{height:7,borderRadius:5,backgroundColor:'#465D60',overflow:'hidden'},
 trackFill:{height:7,borderRadius:5},
 story:{color:C.ink,fontSize:13,lineHeight:20},
 notice:{color:C.gold,fontSize:12,lineHeight:18},
 impact:{padding:11,backgroundColor:'#304D44',borderRadius:10,gap:8},
 chipRow:{flexDirection:'row',gap:6,flexWrap:'wrap'},
 chip:{paddingHorizontal:8,paddingVertical:6,fontSize:10,fontWeight:'800',color:C.accent,backgroundColor:'#233A35',borderRadius:7},
 choice:{minHeight:48,padding:12,borderRadius:10,borderColor:'#638576',borderWidth:1,backgroundColor:'#305145',gap:5},
 choiceTitle:{color:C.ink,fontSize:13,fontWeight:'900',lineHeight:19},
 choiceDetail:{color:C.muted,fontSize:11,lineHeight:17},
 disabled:{opacity:.4},disclaimer:{color:C.muted,fontSize:10,lineHeight:16},
 archive:{gap:9},record:{borderRadius:11,backgroundColor:C.tile,padding:11,gap:6}
});
