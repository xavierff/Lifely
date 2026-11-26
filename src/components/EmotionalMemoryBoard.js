import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const C={surface:'#192E33',tile:'#294044',border:'#56736B',ink:'#F8F5EB',muted:'#B4C8C5',gold:'#FFE1A2',green:'#D5F2AF',rose:'#F5C2B5'};
const mark=name=>String(name||'?').split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();
const nameCase=s=>s?s.charAt(0).toUpperCase()+s.slice(1):'Unresolved';
function MemoryTile({thread,onReunite,canReunite}){
 const ready=thread.status==='ready';
 const elapsed=(thread.resolvedAge??thread.dueAge)-thread.sourceAge;
 return <View testID={'emotional-memory-'+thread.id} style={[S.memory,ready&&S.ready]}>
  <View style={S.row}>
   <View style={[S.avatar,ready&&S.avatarReady]}><Text style={S.initial}>{mark(thread.personName)}</Text></View>
   <View style={{flex:1,gap:3}}><Text style={S.name}>{thread.personName}</Text>
    <Text style={S.sub}>Age {thread.sourceAge} · {thread.theme}</Text>
    <Text style={S.sub}>{nameCase(thread.originalOutcome)} last time · {thread.personality}</Text>
   </View>
   <Text style={[S.badge,ready&&S.badgeReady]}>{ready?'REUNITED?':thread.status==='waiting'?'DUE AGE '+thread.dueAge:nameCase(thread.status).toUpperCase()}</Text>
  </View>
  <Text style={S.quote}>“{thread.quote}”</Text>
  {thread.finalLine?<Text style={S.outcome}>{thread.finalLine}</Text>:null}
  {ready?<View style={{gap:7}}><Text style={S.notice}>A memory from {elapsed} years ago is ready to return. The conversation can change this relationship.</Text>
   <Pressable testID={'emotional-reunite-'+thread.id} accessibilityRole="button" accessibilityLabel={'Reunite with '+thread.personName}
    accessibilityState={{disabled:!canReunite}} disabled={!canReunite}
    style={({pressed})=>[S.button,!canReunite&&S.disabled,pressed&&{opacity:.7}]} onPress={()=>onReunite(thread.personId)}>
    <Text style={S.buttonText}>Reunite with {thread.personName}</Text>
    <Text style={S.buttonArrow}>→</Text>
   </Pressable></View>:null}
  {thread.status==='waiting'?<Text style={S.notice}>May resurface in {Math.max(0,thread.dueAge-thread.sourceAge)} years after that conversation, if this person is still present.</Text>:null}
 </View>;
}
export default function EmotionalMemoryBoard({view,onReunite,blocked=false,available=[],compact=false}){
 const can=id=>!blocked&&available.some(c=>c.id==='dialogue:open:'+id&&c.enabled);
 const ready=compact?view.ready.slice(0,2):view.ready.slice(0,4);
 const waiting=compact?view.waiting.slice(0,1):view.waiting.slice(0,5);
 const remembered=compact?[]:view.remembered.slice(0,6);
 return <View testID={compact?'emotional-reunion-preview':'emotional-memory-board'} style={S.panel}>
  <View style={S.between}><View style={{flex:1,gap:3}}><Text style={S.overline}>PEOPLE REMEMBER</Text>
    <Text style={S.title}>{compact?'Someone from your past':'The people in your story'}</Text></View>
   <Text style={S.counter}>{view.count} memories</Text>
  </View>
  <Text style={S.description}>Past conversations can return after several years. Their outcomes depend on what actually happened and what you choose when you meet again.</Text>
  {ready.length?<View style={S.group}><Text style={S.heading}>READY FOR A REUNION</Text>
   {ready.map(thread=><MemoryTile key={thread.id} thread={thread} onReunite={onReunite} canReunite={can(thread.personId)}/>)}
  </View>:null}
  {waiting.length?<View style={S.group}><Text style={S.heading}>CONVERSATIONS YOU CARRY</Text>
   {waiting.map(thread=><MemoryTile key={thread.id} thread={thread}/>)}
  </View>:null}
  {remembered.length?<View style={S.group}><Text style={S.heading}>REUNIONS & WHAT REMAINS</Text>
   {remembered.map(thread=><MemoryTile key={thread.id} thread={thread}/>)}
  </View>:null}
  {!view.count?<Text style={S.empty}>Your first completed conversation will plant a personal memory. Years later, the other person may be ready to revisit it.</Text>:null}
  {!compact&&view.ancestors.length?<View testID="emotional-ancestral-threads" style={S.group}>
   <Text style={S.heading}>STORIES HANDED DOWN</Text>
   {view.ancestors.map((x,i)=><View key={x.generation+'-'+i} style={S.ancestor}>
    <Text style={S.gen}>GEN {x.generation} · {x.name}</Text>
    <Text style={S.sub}>{x.note}</Text>
   </View>)}
  </View>:null}
  <Text style={S.foot}>Reunions use a normal yearly conversation activity. Waiting memories never block aging, and the game does not promise they will return if someone leaves your life.</Text>
 </View>;
}
const S=StyleSheet.create({
 panel:{borderWidth:1,borderColor:C.border,backgroundColor:C.surface,borderRadius:18,padding:14,gap:12},
 row:{flexDirection:'row',alignItems:'center',gap:10},between:{flexDirection:'row',alignItems:'center',gap:10},
 overline:{fontSize:10,color:C.green,fontWeight:'900',letterSpacing:.8},
 title:{fontSize:20,lineHeight:26,fontWeight:'900',color:C.ink},
 counter:{fontSize:10,fontWeight:'900',color:C.gold},
 description:{fontSize:12,lineHeight:18,color:C.muted},
 group:{gap:8},
 heading:{fontSize:11,fontWeight:'900',letterSpacing:.7,color:C.gold},
 memory:{backgroundColor:C.tile,borderWidth:1,borderColor:C.border,borderRadius:13,padding:11,gap:10},
 ready:{borderColor:C.green},
 avatar:{height:50,width:50,borderRadius:25,alignItems:'center',justifyContent:'center',backgroundColor:'#425D69',borderWidth:1,borderColor:'#9AB7CB'},
 avatarReady:{backgroundColor:'#3C6356',borderColor:C.green},
 initial:{color:C.ink,fontSize:18,fontWeight:'900'},
 name:{fontSize:14,color:C.ink,fontWeight:'900'},
 sub:{fontSize:11,lineHeight:17,color:C.muted,flexShrink:1},
 badge:{color:C.gold,fontSize:9,fontWeight:'900',maxWidth:78,textAlign:'right',flexShrink:1},
 badgeReady:{color:C.green},
 quote:{fontSize:12,lineHeight:19,color:C.ink,fontStyle:'italic'},
 outcome:{fontSize:12,lineHeight:18,color:C.gold},
 notice:{fontSize:11,lineHeight:17,color:C.muted},
 button:{minHeight:52,borderRadius:11,backgroundColor:C.green,padding:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:7},
 disabled:{opacity:.45},buttonText:{fontSize:13,color:'#172622',fontWeight:'900',flex:1},
 buttonArrow:{fontSize:17,fontWeight:'900',color:'#172622'},
 ancestor:{borderLeftColor:C.gold,borderLeftWidth:2,backgroundColor:C.tile,padding:10,gap:4},
 gen:{fontSize:11,color:C.ink,fontWeight:'900'},
 empty:{padding:10,color:C.muted,fontSize:12,lineHeight:19},
 foot:{fontSize:10,lineHeight:16,color:C.muted}
});
