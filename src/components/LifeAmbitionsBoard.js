import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const C={ink:'#FAF8EC',muted:'#BCCFC8',green:'#CAF19E',gold:'#F7D7A2',line:'#4B7263',panel:'#1B3430',surface:'#233D35',deep:'#11251F'};
function Action({name,detail,disabled,onPress,emphasis=false,id}){
 return <Pressable testID={id} accessibilityRole="button" accessibilityLabel={name+(detail?', '+detail:'')}
 accessibilityState={{disabled:!!disabled}} disabled={disabled} onPress={onPress}
 style={({pressed})=>[S.action,emphasis&&S.emphasis,disabled&&S.disabled,pressed&&{opacity:.8}]}>
  <Text style={[S.actionName,emphasis&&{color:C.deep}]}>{name}</Text>
  {detail?<Text style={[S.actionDetail,emphasis&&{color:C.deep}]}>{detail}</Text>:null}
 </Pressable>;
}
function Milestone({step,index}){
 return <View testID={'ambition-milestone-'+index} style={[S.milestone,step.achieved&&S.done]}>
  <View style={[S.number,step.achieved&&S.numberDone]}><Text style={S.numberText}>{step.achieved?'✓':index+1}</Text></View>
  <View style={{flex:1,minWidth:0,gap:4}}>
   <View style={S.between}><Text style={S.goal}>{step.label}</Text><Text style={[S.detail,step.achieved&&{color:C.green}]}>{step.achieved?'DONE':'IN PROGRESS'}</Text></View>
   <View style={S.track} accessibilityRole="progressbar" accessibilityLabel={step.label} accessibilityValue={{min:0,max:100,now:step.achieved?100:step.progress}}>
    <View style={[S.fill,{width:(step.achieved?100:step.progress)+'%',backgroundColor:step.achieved?C.green:C.gold}]}/>
   </View>
   <Text style={S.description}>{step.detail}</Text>
  </View>
 </View>;
}
export default function LifeAmbitionsBoard({summary,commands,onAction,blocked}){
 const [expanded,setExpanded]=useState(false);
 const active=summary.active;
 const select=id=>commands.find(c=>c.id===id);
 const press=id=>onAction(id);
 return <View testID="life-ambitions-board" style={S.root}>
  <View style={S.between}><View style={{flex:1,gap:3}}><Text style={S.overline}>SIX-YEAR LIFE CHAPTERS</Text><Text style={S.title}>Personal ambitions</Text></View><Text style={S.orbit}>✧</Text></View>
  <Text style={S.intro}>Choose what this life means to you. Progress comes from real decisions in your relationships, hobbies, career and daily activities.</Text>
  {active?<View testID="active-life-ambition" style={S.active}>
   <View style={S.between}><Text style={S.overline}>YOUR CURRENT PROMISE</Text><Text style={S.count}>{active.yearsLeft} years left</Text></View>
   <Text style={S.activeTitle}>{active.icon} {active.name}</Text>
   <Text style={S.description}>{active.story}</Text>
   {active.mentor?<Text style={S.mentor}>♡ {active.mentor} is part of this chapter</Text>:null}
   <View style={S.between}><Text style={S.detail}>Milestones completed</Text><Text style={S.count}>{active.steps.filter(x=>x.achieved).length} of 3</Text></View>
   <View style={S.track}><View style={[S.fill,{width:active.progress+'%',backgroundColor:C.green}]}/></View>
   <View style={{gap:8}}>{active.steps.map((step,i)=><Milestone key={i} step={step} index={i}/>)}</View>
   <Text style={S.foot}>Committed at age {active.startedAge} · Deadline age {active.dueAge}{active.path?' · '+active.path+' path':''}</Text>
   {active.history.slice(-2).map((e,i)=><Text key={i} style={S.description}>Age {e.age}: {e.text}</Text>)}
   {!blocked&&commands.filter(c=>c.id.startsWith('ambition:turn:')).map(c=><Action key={c.id} name={c.label} detail={c.detail} disabled={!c.enabled} onPress={()=>press(c.id)} id={'ambition-turn-'+c.id.split(':').at(-1)}/>)}
   {!blocked&&select('ambition:retire')?<Action name="Let go of this goal" detail="Keep its history but pursue a different future" disabled={!select('ambition:retire').enabled} onPress={()=>press('ambition:retire')} id="ambition-abandon"/>:null}
  </View>:<View style={S.discovery}>
   <Text style={S.caption}>PICK THE LIFE YOU WANT TO BUILD</Text>
   {summary.available.length?<>{summary.available.slice(0,expanded?summary.available.length:3).map(goal=>{
    const id='ambition:begin:'+goal.id,command=select(id);
    return <View key={goal.id} style={S.goalCard} testID={'ambition-offer-'+goal.id}>
     <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
      <View style={S.goalIcon}><Text style={S.goalGlyph}>{goal.icon}</Text></View>
      <View style={{flex:1,gap:3}}><Text style={S.goalTitle}>{goal.name}</Text><Text style={S.description}>{goal.story}</Text></View>
     </View>
     <Action name="Commit to this ambition" detail="Three milestones · six simulated years" emphasis={!blocked&&!!command?.enabled}
       disabled={blocked||!command?.enabled} onPress={()=>press(id)} id={'ambition-begin-'+goal.id}/>
    </View>;
   })}
   {summary.available.length>3?<Action name={expanded?'Show recommended ambitions':'Explore all '+summary.available.length+' ambitions'}
     detail={expanded?'Return to the best matches for this stage of life':'See work, relationships, hobbies, travel and more'}
     onPress={()=>setExpanded(!expanded)} id="ambitions-browse"/>:null}</>:
    <Text style={S.description}>New personal ambitions become available as your character grows.</Text>}
  </View>}
  {(summary.completed.length>0||summary.unfulfilled.length>0||summary.ancestral.length>0)&&<View testID="ambition-chronicle" style={S.journal}>
   <Text style={S.caption}>YOUR LIFE CHRONICLE</Text>
   {summary.completed.slice(0,3).map((e,i)=><Text key={e.id+'-'+i} style={S.description}>✦ Age {e.endedAge}: {e.name} · completed{e.chapter?' · '+e.chapter+' path':''}</Text>)}
   {summary.unfulfilled.slice(0,2).map((e,i)=><Text key={e.id+'-'+i} style={S.description}>○ Age {e.endedAge}: {e.name} · {e.status}</Text>)}
   {summary.ancestral.slice(0,2).map((e,i)=><Text key={e.id+'-'+i} style={S.description}>◇ {e.sourceLife} fulfilled {e.name}</Text>)}
  </View>}
 </View>;
}
export function AmbitionRecap({summary}){
 return <View style={{gap:7}} testID="ambition-recap"><Text style={S.caption}>AN AMBITIOUS LIFE</Text>
  <Text style={S.description}>{summary.totals.started} personal ambitions started · {summary.totals.completed} completed · {summary.totals.unfulfilled} unfinished</Text>
  {summary.completed.slice(0,4).map((g,i)=><Text key={g.id+i} style={S.description}>✦ {g.name} · ages {g.startedAge}–{g.endedAge} · +${g.reward||0} simulated reward</Text>)}
  {summary.ancestral.slice(0,3).map((g,i)=><Text key={g.id+i} style={S.description}>◇ {g.sourceLife}'s legacy: {g.name}</Text>)}
 </View>;
}
const S=StyleSheet.create({
 root:{gap:11,backgroundColor:C.panel,borderRadius:19,borderColor:C.line,borderWidth:1,padding:15},
 between:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:1,color:C.green},
 title:{fontSize:23,fontWeight:'800',color:C.ink},orbit:{fontSize:35,color:C.gold},
 intro:{fontSize:12,lineHeight:18,color:C.muted},active:{gap:11},
 activeTitle:{fontSize:18,fontWeight:'900',color:C.ink},
 count:{fontSize:12,fontWeight:'800',color:C.gold},
 mentor:{fontSize:12,color:C.green,fontWeight:'700'},
 discovery:{gap:10},caption:{fontSize:11,color:C.gold,fontWeight:'900',letterSpacing:.7},
 goalCard:{backgroundColor:C.surface,borderColor:C.line,borderWidth:1,borderRadius:14,padding:12,gap:10},
 goalIcon:{width:42,height:42,borderRadius:12,backgroundColor:'#40604D',alignItems:'center',justifyContent:'center'},
 goalGlyph:{fontSize:23,color:C.gold},goalTitle:{fontSize:14,fontWeight:'800',color:C.ink},
 detail:{fontSize:10,fontWeight:'700',color:C.muted},description:{fontSize:11,lineHeight:17,color:C.muted},
 milestone:{flexDirection:'row',gap:10,backgroundColor:C.surface,borderColor:C.line,borderWidth:1,borderRadius:10,padding:10,alignItems:'center'},
 done:{borderColor:'#7EAE79'},number:{width:28,height:28,borderRadius:14,backgroundColor:'#536351',alignItems:'center',justifyContent:'center'},
 numberDone:{backgroundColor:'#40734C'},numberText:{fontSize:12,fontWeight:'900',color:C.ink},
 goal:{fontSize:12,fontWeight:'800',color:C.ink,flexShrink:1},
 track:{height:7,backgroundColor:'#52635B',borderRadius:6,overflow:'hidden'},fill:{height:7,borderRadius:6},
 action:{backgroundColor:'#31483C',borderColor:C.line,borderWidth:1,borderRadius:10,padding:12,minHeight:48,gap:3,justifyContent:'center'},
 emphasis:{backgroundColor:C.green,borderColor:C.green},disabled:{opacity:.42},
 actionName:{color:C.ink,fontSize:12,fontWeight:'900'},actionDetail:{color:C.muted,fontSize:10,lineHeight:15},
 foot:{fontSize:10,color:C.gold,fontWeight:'700'},journal:{borderTopWidth:1,borderColor:C.line,paddingTop:10,gap:7}
});
