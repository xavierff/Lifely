import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';

const C={background:'#172B30',tile:'#21383D',border:'#496461',ink:'#F7F6EE',muted:'#B7CAC4',
 bright:'#D6F5A6',gold:'#FFE1A0',rose:'#F5C0B3',sea:'#A4D9E9'};
const chapterIcon={roots:'✿',discovery:'✧',becoming:'◆',building:'◇',legacy:'✦'};
const categoryIcon={family:'♡',relationship:'♡',relationships:'♡',health:'✚',career:'▤',
 money:'◇',justice:'⚖',saga:'✦',story:'✧',achievement:'★',milestone:'✦'};
const tones={
 warm:{backgroundColor:'#493940',borderColor:'#96747B'},
 hope:{backgroundColor:'#334A37',borderColor:'#799C72'},
 storm:{backgroundColor:'#383A53',borderColor:'#797FAD'},
 cool:{backgroundColor:'#264550',borderColor:'#558F9F'}
};
const fmt=n=>'$'+Math.abs(n).toLocaleString('en-US');
const delta=n=>(n>0?'+':'')+n;
const label=s=>s?s.charAt(0).toUpperCase()+s.slice(1):'Personal';
const stageFor=age=>age<13?'Roots':age<18?'Discovery':age<35?'Becoming':age<60?'Building':'Legacy';
const toneFor=scene=>{
 if(['family','relationship','relationships','childhood'].includes(scene.category))return tones.warm;
 if(['justice','saga'].includes(scene.category))return tones.storm;
 if(['career','health','story'].includes(scene.category))return tones.hope;
 return tones.cool;
};
const marker=scene=>categoryIcon[scene.category]||'✦';
function FutureEchoes({future}){
 if(!future?.length)return <Text style={S.muted}>No follow-up is currently scheduled for this specific decision. Later circumstances may still change.</Text>;
 return <View style={S.futures}>{future.map((f,i)=><View key={f.id+'-'+i} style={S.future}>
  <Text style={S.futureAge}>AGE {f.age}</Text>
  <View style={{flex:1,gap:2}}><Text style={S.futureTitle}>{f.label}</Text><Text style={S.muted}>{f.detail}</Text></View>
 </View>)}</View>;
}
function ActualChanges({scene}){
 const any=scene.changes?.length||scene.bonds?.length||scene.netWorth;
 if(!any)return <Text style={S.muted}>This choice made no immediately recorded change to the tracked stats, bonds or net worth.</Text>;
 return <View style={S.pills}>
  {(scene.changes||[]).map(x=><Text key={x.key} style={[S.pill,x.change<0?S.pillWarm:S.pillCool]}>{x.label} {delta(x.change)}</Text>)}
  {(scene.bonds||[]).map((x,i)=><Text key={x.name+i} style={[S.pill,x.change<0?S.pillWarm:S.pillCool]}>{x.name} bond {delta(x.change)}</Text>)}
  {scene.netWorth!==0?<Text style={[S.pill,scene.netWorth<0?S.pillWarm:S.pillCool]}>Net worth {scene.netWorth>0?'+':'−'}{fmt(scene.netWorth)}</Text>:null}
 </View>;
}
// This is an illustrated recap of a resolved decision; it never blocks gameplay.
export function TurningPointScene({scene}){
 const [details,setDetails]=useState(true);
 if(!scene)return null;
 return <View testID="turning-point-scene" style={[S.scene,toneFor(scene)]}>
  <View style={S.between}><Text style={S.overline}>A TURNING POINT · AGE {scene.age}</Text><Text style={S.stageBadge}>{stageFor(scene.age).toUpperCase()}</Text></View>
  <View style={S.stageArt}>
   <View style={S.artRing}><View style={S.artCenter}><Text style={S.artIcon}>{marker(scene)}</Text></View></View>
   <View style={S.artNarrative}><Text style={S.stageKicker}>{label(scene.category)} chapter</Text>
    <Text style={S.stageTitle}>{scene.title}</Text></View>
  </View>
  <Text style={S.quote}>“{scene.choice}”</Text>
  <Text style={S.impactText}>{scene.impact}</Text>
  <Text style={S.reflection}>{scene.reflection}</Text>
  <Pressable accessibilityRole="button" accessibilityLabel={details?'Hide decision consequences':'Show decision consequences'}
   testID="chronicle-scene-toggle" onPress={()=>setDetails(!details)} style={S.toggle}>
   <Text style={S.toggleText}>{details?'Hide':'Explore'} consequences</Text><Text style={S.toggleText}>{details?'−':'+'}</Text>
  </Pressable>
  {details?<View testID="chronicle-scene-details" style={S.sceneDetails}>
   <Text style={S.overline}>WHAT CHANGED NOW</Text><ActualChanges scene={scene}/>
   <Text style={S.overline}>WHAT CAN RETURN LATER</Text><FutureEchoes future={scene.future}/>
   <Text style={S.disclaimer}>Later scenes are only shown when the game actually schedules a follow-up. They do not promise a particular ending.</Text>
  </View>:null}
 </View>;
}
function Memory({item,isLast}){
 const [open,setOpen]=useState(false);
 const isChoice=item.source==='choice';
 return <View testID={'chronicle-memory-'+item.id} style={S.memoryRow}>
  <View style={S.timelineRail}><View style={[S.dot,item.turning&&S.dotStar]}><Text style={S.dotIcon}>{marker(item)}</Text></View>{!isLast?<View style={S.line}/>:null}</View>
  <View style={S.memoryContent}><View style={S.between}>
   <Text style={S.memoryAge}>AGE {item.age} · {stageFor(item.age).toUpperCase()}</Text>
   <Text style={S.memoryKind}>{isChoice?'DECISION':label(item.category).toUpperCase()}</Text>
  </View>
  <Text style={S.memoryTitle}>{item.title}</Text>
  {isChoice?<Text style={S.muted}>You chose: {item.choice}</Text>:null}
  {isChoice&&item.turning?<Pressable accessibilityRole="button" accessibilityLabel={(open?'Hide':'Show')+' impact of '+item.title}
    testID={'chronicle-expand-'+item.id} onPress={()=>setOpen(!open)} style={S.memoryButton}>
    <Text style={S.link}>{open?'Close the memory':'See what changed'} {open?'−':'+'}</Text>
   </Pressable>:null}
  {open?<View style={S.memoryDetail}><Text style={S.muted}>{item.impact}</Text>
   <ActualChanges scene={item}/><FutureEchoes future={item.future}/>
  </View>:null}
  </View>
 </View>;
}
export default function LifeChronicleBoard({view,compact=false}){
 const [filter,setFilter]=useState('all');
 const [all,setAll]=useState(false);
 const filtered=view.timeline.filter(e=>filter==='all'||filter==='turning'&&e.turning||
  filter==='people'&&['relationship','relationships','family','childhood'].includes(e.category));
 const visible=compact?filtered.slice(-4):all?filtered:filtered.slice(-14);
 return <View testID={compact?'chronicle-preview':'chronicle-timeline'} style={S.panel}>
  <View style={S.between}><View style={{flex:1,gap:4}}>
   <Text style={S.overline}>THE LIFE YOU HAVE LIVED</Text>
   <Text style={S.boardTitle}>{compact?'Moments that shaped you':'Your visual life timeline'}</Text>
  </View><Text style={S.count}>{view.totalChoices} choices</Text></View>
  <View style={S.stageRow}>{view.chapters.map(stage=><View key={stage.id} style={[S.chapter,stage.active&&S.activeChapter]}>
    <Text style={[S.chapterSymbol,stage.active&&{color:C.bright}]}>{chapterIcon[stage.id]}</Text>
    <Text style={[S.chapterName,stage.active&&{color:C.bright}]}>{stage.label}</Text>
   </View>)}</View>
  {!compact?<View style={S.filters}>{[['all','All memories'],['turning','Turning points'],['people','People']].map(([id,name])=>
   <Pressable key={id} accessibilityRole="button" accessibilityState={{selected:filter===id}} testID={'chronicle-filter-'+id}
    onPress={()=>{setFilter(id);setAll(false)}} style={[S.filter,filter===id&&S.filterActive]}><Text style={[S.filterText,filter===id&&S.filterTextActive]}>{name}</Text></Pressable>)}</View>:null}
  {visible.length?<View style={S.memories}>{visible.map((item,i)=><Memory key={item.id} item={item} isLast={i===visible.length-1}/>)}</View>:
   <Text style={S.muted}>Your story is just beginning. Live through a year, make a choice, and the timeline will grow.</Text>}
  {!compact&&filtered.length>14?<Pressable accessibilityRole="button" testID="chronicle-show-more" onPress={()=>setAll(!all)} style={S.toggle}>
   <Text style={S.toggleText}>{all?'Show recent memories':'See all '+filtered.length+' memories'}</Text><Text style={S.toggleText}>{all?'−':'+'}</Text>
  </Pressable>:null}
  {view.ancestors?.length&&!compact?<View testID="chronicle-ancestry" style={S.ancestry}>
   <Text style={S.overline}>THE LIVES BEFORE YOURS</Text>
   {view.ancestors.map((p,i)=><View key={p.generation+'-'+i} style={S.ancestor}>
    <Text style={S.futureAge}>GEN {p.generation}</Text><View style={{flex:1,gap:3}}>
     <Text style={S.futureTitle}>{p.name} · {p.age} years</Text><Text style={S.muted}>{p.note}</Text>
    </View>
   </View>)}
  </View>:null}
  <Text style={S.disclaimer}>Memories are drawn from actual saved decisions and milestones. Older saves keep their existing journal. Lifely does not fabricate past results or guarantee future outcomes.</Text>
 </View>;
}
const S=StyleSheet.create({
 panel:{backgroundColor:C.background,borderColor:C.border,borderWidth:1,borderRadius:18,padding:14,gap:12},
 between:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8,flexWrap:'wrap'},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:.8,color:C.bright},
 boardTitle:{fontSize:20,fontWeight:'900',color:C.ink,lineHeight:26},
 count:{fontSize:11,color:C.gold,fontWeight:'800'},
 stageRow:{flexDirection:'row',flexWrap:'wrap',gap:5},
 chapter:{minWidth:53,flexGrow:1,alignItems:'center',paddingVertical:9,paddingHorizontal:4,gap:3,
  borderRadius:9,backgroundColor:'#253D41',borderWidth:1,borderColor:'transparent'},
 activeChapter:{borderColor:C.bright,backgroundColor:'#354938'},
 chapterSymbol:{fontSize:16,color:C.muted},chapterName:{color:C.muted,fontSize:9,fontWeight:'800',textAlign:'center'},
 filters:{flexDirection:'row',flexWrap:'wrap',gap:7},
 filter:{minHeight:44,justifyContent:'center',paddingHorizontal:12,backgroundColor:C.tile,borderRadius:12,borderWidth:1,borderColor:C.border},
 filterActive:{borderColor:C.bright},filterText:{fontSize:11,color:C.muted,fontWeight:'700'},
 filterTextActive:{color:C.bright},
 memories:{gap:0},memoryRow:{flexDirection:'row',gap:10,minWidth:0},
 timelineRail:{width:34,alignItems:'center'},
 dot:{height:32,width:32,borderRadius:16,borderWidth:1,borderColor:C.border,alignItems:'center',justifyContent:'center',backgroundColor:C.tile},
 dotStar:{borderColor:C.gold,backgroundColor:'#474338'},
 dotIcon:{fontSize:17,color:C.gold},line:{backgroundColor:C.border,width:2,flex:1,minHeight:12},
 memoryContent:{flex:1,minWidth:0,gap:5,paddingVertical:8,paddingBottom:19},
 memoryAge:{fontSize:10,color:C.bright,fontWeight:'900'},
 memoryKind:{fontSize:9,color:C.muted,fontWeight:'800'},
 memoryTitle:{color:C.ink,fontWeight:'800',fontSize:14,lineHeight:21},
 muted:{color:C.muted,fontSize:11,lineHeight:17,flexShrink:1},
 memoryButton:{minHeight:44,justifyContent:'center',alignSelf:'flex-start',paddingHorizontal:7},
 link:{fontSize:12,fontWeight:'800',color:C.bright},
 memoryDetail:{backgroundColor:C.tile,borderRadius:10,padding:10,gap:7},
 toggle:{borderColor:C.border,borderWidth:1,borderRadius:11,minHeight:44,padding:11,
  flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
 toggleText:{color:C.bright,fontSize:12,fontWeight:'800'},
 scene:{padding:15,borderWidth:1,borderRadius:19,gap:11},
 stageBadge:{fontSize:10,fontWeight:'900',color:C.gold},
 stageArt:{minHeight:116,flexDirection:'row',alignItems:'center',gap:14,overflow:'hidden'},
 artRing:{height:108,width:108,borderRadius:55,borderWidth:2,borderColor:'#FFFFFF55',alignItems:'center',justifyContent:'center'},
 artCenter:{height:83,width:83,borderRadius:50,backgroundColor:'#FFFFFF22',justifyContent:'center',alignItems:'center'},
 artIcon:{fontSize:47,color:C.ink},
 artNarrative:{flex:1,gap:5},
 stageKicker:{fontSize:11,color:C.gold,fontWeight:'800',textTransform:'uppercase'},
 stageTitle:{fontSize:22,color:C.ink,fontWeight:'900',lineHeight:29},
 quote:{fontSize:16,lineHeight:23,fontWeight:'800',fontStyle:'italic',color:C.ink},
 impactText:{fontSize:14,lineHeight:21,fontWeight:'800',color:C.bright},
 reflection:{fontSize:12,lineHeight:18,color:C.ink},
 sceneDetails:{gap:9,borderTopColor:'#FFFFFF33',borderTopWidth:1,paddingTop:12},
 pills:{flexDirection:'row',flexWrap:'wrap',gap:6},
 pill:{fontSize:11,overflow:'hidden',borderRadius:8,paddingHorizontal:9,paddingVertical:7,fontWeight:'800'},
 pillWarm:{backgroundColor:'#5C3C3D',color:'#FFD4CB'},
 pillCool:{backgroundColor:'#34564B',color:'#D6F5A6'},
 futures:{gap:8},future:{flexDirection:'row',gap:9,backgroundColor:'#13293065',padding:9,borderRadius:8},
 futureAge:{fontSize:10,color:C.gold,fontWeight:'900',minWidth:54},
 futureTitle:{fontSize:12,color:C.ink,fontWeight:'800'},
 disclaimer:{color:C.muted,fontSize:10,lineHeight:16},
 ancestry:{gap:7,borderTopWidth:1,borderTopColor:C.border,paddingTop:11},
 ancestor:{flexDirection:'row',gap:8,padding:9,backgroundColor:C.tile,borderRadius:9}
});
