import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const P={bg:'#1C3036',tile:'#263E43',green:'#C9F28A',ink:'#F7F7ED',muted:'#B9CCC8',gold:'#FFDDA0',line:'#55736A',track:'#435F5A'};
function Stat({label,value}){
 const v=Math.max(0,Math.min(100,Math.round(value||0)));
 return <View style={S.stat}><View style={S.between}><Text style={S.statLabel}>{label}</Text><Text style={S.statValue}>{v}</Text></View><View style={S.track} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{min:0,max:100,now:v}}><View style={[S.fill,{width:v+'%'}]}/></View></View>;
}
function Choice({choice,press}){
 return <Pressable testID={'workplace-choice-'+choice.index} accessibilityRole="button" accessibilityLabel={choice.label+', '+choice.detail} onPress={()=>press(choice.index)}
  style={({pressed})=>[S.choice,pressed&&{opacity:.75}]}>
  <Text style={S.choiceLabel}>{choice.label}</Text>
  <Text style={S.desc}>{choice.detail}</Text>
 </Pressable>;
}
export default function WorkplaceChapterBoard({view,onChoose}){
 if(!view)return null;
 return <View testID="active-workplace-chapter" style={S.scene}>
  <View style={S.between}><Text style={S.eyebrow}>WORKPLACE STORY · CHAPTER {view.chapter}/3</Text><Text style={S.count}>{view.industry}</Text></View>
  <Text style={S.heading}>{view.title}</Text>
  <Text style={S.subtitle}>{view.jobTitle} · With {view.lead} and {view.rival}</Text>
  <Text style={S.chapter}>{view.chapterTitle}</Text>
  <Text style={S.prompt}>{view.prompt}</Text>
  <View style={S.stats}><Stat label="Professional standing" value={view.standing}/><Stat label={'Trust · '+view.lead} value={view.trust}/><Stat label={'Rivalry · '+view.rival} value={view.rivalry}/></View>
  {view.previous?<View style={S.previous}><Text style={S.eyebrow}>PREVIOUSLY</Text><Text style={S.desc}>{view.previous.reaction}</Text></View>:null}
  <Text style={S.eyebrow}>WHAT WILL YOU DO?</Text>
  {view.choices.map(choice=><Choice key={choice.index} choice={choice} press={onChoose}/>)}
  <Text style={S.note}>Every response changes real professional standing, colleagues' trust, stress and future outcomes. This is fictional gameplay.</Text>
 </View>;
}
export function WorkplaceCareerBoard({summary,commands,onAction,blocked}){
 const firm=summary.firm,active=summary.active;
 const options=commands.filter(c=>c.id.startsWith('workplace:'));
 return <View style={S.hub} testID="workplace-career-board">
  <View style={S.between}><Text style={S.eyebrow}>ORIGINAL PROFESSIONAL STORIES</Text><Text style={S.count}>12 industries</Text></View>
  <Text style={S.heading}>The people you work with</Text>
  <Text style={S.desc}>Your coworkers improve independently. Collaborate, demonstrate your craft, or compete. What you choose changes later chapters, compensation and reputation.</Text>
  {firm?<><Text style={S.chapter}>{firm.title}</Text><Text style={S.desc}>{firm.story}</Text><Stat label="Professional standing" value={summary.standing}/></>:
   <Text style={S.desc}>Take a regular career to discover its industry's original three-chapter story.</Text>}
  {active?<View style={S.active} testID="workplace-story-progress">
   <Text style={S.eyebrow}>{active.status==='ready'?'DECIDE YOUR NEXT MOVE':'THE STORY CONTINUES'}</Text>
   <Text style={S.chapter}>{active.jobTitle} · Chapter {active.stage+1}/3</Text>
   <Text style={S.desc}>{active.status==='waiting'?'Next chapter: '+(active.chapterTitle||'A new challenge'): 'A decision with lasting consequences is ready.'}</Text>
   <Text style={S.count}>{active.status==='waiting'?(active.due?'Your coworkers are ready this year':active.yearsUntil+' years until next chapter'):'Make your current decision to continue'}</Text>
  </View>:null}
  {summary.contacts.length?<View style={S.people}>{summary.contacts.map(person=><View key={person.id} style={S.person}>
   <View style={S.between}><Text style={S.personName}>{person.name}</Text><Text style={S.count}>{person.role}</Text></View>
   <View style={S.between}><Text style={S.desc}>Trust {person.trust}</Text><Text style={S.desc}>Rivalry {person.rivalry}</Text><Text style={S.desc}>Skill {person.skill}</Text></View>
   {person.history.length?<Text style={S.desc}>{person.history[0].event}</Text>:null}
  </View>)}</View>:null}
  {!blocked&&options.map(x=><Pressable key={x.id} testID={'workplace-'+x.id.split(':')[1]} accessibilityRole="button" accessibilityLabel={x.label+', '+x.detail}
   accessibilityState={{disabled:!x.enabled}} disabled={!x.enabled} onPress={()=>onAction(x.id)} style={({pressed})=>[S.choice,!x.enabled&&{opacity:.35},pressed&&{opacity:.75}]}>
   <Text style={S.choiceLabel}>{x.label}</Text><Text style={S.desc}>{x.detail}</Text>
  </Pressable>)}
  {summary.completed.length?<View testID="workplace-achievements" style={S.chronicle}><Text style={S.eyebrow}>RECENT WORKPLACE OUTCOMES</Text>
   {summary.completed.slice(0,4).map(e=><View key={e.id} style={S.record}><Text style={S.personName}>{e.firmTitle}</Text><Text style={S.desc}>Age {e.age}–{e.endedAge} · {e.result} · {e.choices.length} decisions · {'+$'+(e.reward||0).toLocaleString('en-US')}</Text></View>)}
  </View>:null}
  {summary.unfulfilled.length?<View style={S.chronicle}><Text style={S.eyebrow}>PATHS NOT TAKEN</Text>{summary.unfulfilled.slice(0,2).map(e=><Text key={e.id} style={S.desc}>{e.firmTitle} · {e.status}</Text>)}</View>:null}
 </View>;
}
export function WorkplaceLegacy({summary}){
 return <View testID="workplace-legacy" style={{gap:7}}><Text style={S.eyebrow}>YOUR WORKPLACE LEGACY</Text>
  <Text style={S.desc}>{summary.total} professional chapters started · {summary.completed.length} recent sagas completed</Text>
  {summary.ancestry.slice(0,3).map((e,i)=><Text key={e.id+i} style={S.desc}>◇ {e.sourceLife}: {e.firmTitle} · {e.result}</Text>)}
 </View>;
}
const S=StyleSheet.create({
 scene:{backgroundColor:'#1B3534',borderWidth:1.5,borderColor:P.green,borderRadius:20,gap:11,padding:16},
 hub:{backgroundColor:P.bg,borderWidth:1,borderColor:P.line,borderRadius:20,gap:10,padding:16},
 between:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:9,flexWrap:'wrap'},
 eyebrow:{fontSize:11,fontWeight:'900',color:P.green,letterSpacing:.75},
 count:{fontSize:11,fontWeight:'800',color:P.gold,flexShrink:1},
 heading:{fontSize:22,color:P.ink,fontWeight:'800',lineHeight:27,flexShrink:1},
 subtitle:{fontSize:12,color:P.muted,lineHeight:18},
 chapter:{fontSize:17,color:P.ink,fontWeight:'800',lineHeight:23},
 prompt:{fontSize:15,lineHeight:23,color:P.ink,backgroundColor:P.tile,padding:14,borderRadius:12},
 stats:{gap:9},
 stat:{gap:5,flexGrow:1,minWidth:115},
 statLabel:{fontSize:11,color:P.muted,flexShrink:1},
 statValue:{fontSize:11,color:P.ink,fontWeight:'900'},
 track:{height:7,backgroundColor:P.track,borderRadius:5,overflow:'hidden'},
 fill:{height:7,backgroundColor:P.green,borderRadius:5},
 previous:{backgroundColor:P.tile,padding:11,borderLeftWidth:3,borderColor:P.gold,borderRadius:9,gap:4},
 choice:{minHeight:54,padding:14,backgroundColor:P.tile,borderColor:P.line,borderWidth:1,borderRadius:12,gap:5,justifyContent:'center'},
 choiceLabel:{color:P.ink,fontSize:14,fontWeight:'800',lineHeight:19},
 desc:{fontSize:12,color:P.muted,lineHeight:18},
 note:{fontSize:11,color:P.gold,lineHeight:16},
 active:{backgroundColor:P.tile,borderLeftWidth:3,borderColor:P.green,padding:12,borderRadius:12,gap:5},
 people:{gap:9},person:{backgroundColor:P.tile,padding:11,borderRadius:12,gap:7},
 personName:{fontSize:13,color:P.ink,fontWeight:'800'},
 chronicle:{gap:9,borderTopWidth:1,borderColor:P.line,paddingTop:10},
 record:{gap:4}
});
