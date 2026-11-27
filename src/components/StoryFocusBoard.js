import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const C={panel:'#1D3436',tile:'#2A4442',ink:'#F4F6EC',muted:'#AFC6BE',green:'#CEF49A',gold:'#FFDEA7',line:'#546E64',warning:'#FFB9A6'};
const focusOptions=[
 ['balanced','Surprise me','Keep a varied life'],
 ['relationships','People & family','Build lasting connections'],
 ['career','Ambition & work','Grow skills and opportunity'],
 ['security','Money & stability','Protect your future'],
 ['discovery','Adventure & discovery','See what the world offers'],
 ['wellbeing','Health & balance','Make room to recover']
];
const capitalize=s=>(s||'').charAt(0).toUpperCase()+(s||'').slice(1);
function TinyMeter({label,value}){
 const pct=Math.max(0,Math.min(100,Math.round(value||0)));
 return <View style={S.meter}>
  <View style={S.between}><Text style={S.muted}>{label}</Text><Text style={S.meterNumber}>{pct}/100</Text></View>
  <View style={S.track} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{min:0,max:100,now:pct}}>
   <View style={[S.bar,{width:pct+'%'}]}/>
  </View>
 </View>;
}
function Recommendation({item,onAction}){
 return <Pressable testID={'flow-suggestion-'+item.id.replace(/:/g,'-')} accessibilityRole="button"
  accessibilityLabel={item.label+'. '+item.reason} onPress={()=>onAction(item.id)}
  style={({pressed})=>[S.action,pressed&&{opacity:.7}]}>
  <Text style={S.actionText}>{item.label}</Text>
  <Text style={S.muted}>{item.reason}</Text>
 </Pressable>;
}
export default function StoryFocusBoard({view,onFocus,onAction,blocked}){
 const [expanded,setExpanded]=useState(false),[showHistory,setShowHistory]=useState(false),[showOpportunities,setShowOpportunities]=useState(false),[selectedStory,setSelectedStory]=useState(null);
 return <View testID="story-focus-board" style={S.board}>
  <View style={S.between}>
   <Text style={S.overline}>YOUR LIFE, NOT A MENU OF TASKS</Text>
   <Text style={S.tag}>{view.stage}</Text>
  </View>
  <Text style={S.title}>{view.headline}</Text>
  <Text style={S.body}>{view.note}</Text>
  <View style={S.statusRow}>
   <View style={S.stat}><Text style={S.statValue}>{view.focusLabel}</Text><Text style={S.overline}>YOUR STORY FOCUS</Text></View>
   <View style={S.stat}><Text style={S.statValue}>{view.pressure}</Text><Text style={S.overline}>LIFE PRESSURE</Text></View>
   <View style={S.stat}><Text style={S.statValue}>{view.summary.choices}</Text><Text style={S.overline}>EVENT CHOICES</Text></View>
  </View>
  <Pressable testID="flow-change-focus" accessibilityRole="button" onPress={()=>setExpanded(!expanded)} style={S.toggle}>
   <Text style={S.toggleText}>{expanded?'Hide story preferences':'Personalize your next stories'}</Text>
   <Text style={S.toggleText}>{expanded?'−':'+'}</Text>
  </Pressable>
  {expanded?<View testID="flow-focus-options" style={S.focusOptions}>
    <Text style={S.muted}>Your preferred direction affects future random event selection. It does not remove other choices or use an in-game action.</Text>
    {focusOptions.map(([id,label,hint])=><Pressable key={id} testID={'flow-focus-'+id}
     accessibilityRole="button" accessibilityState={{selected:view.focus===id}}
     onPress={()=>{onFocus(id);setExpanded(false)}} style={[S.focusOption,view.focus===id&&S.focusSelected]}>
     <Text style={S.focusLabel}>{label}</Text><Text style={S.muted}>{hint}</Text>
    </Pressable>)}
   </View>:null}
  {view.suggested.length&&!blocked?<View testID="flow-next-actions" style={S.suggestions}>
   <Text style={S.overline}>GOOD NEXT MOVES</Text>
   {view.suggested.map(item=><Recommendation key={item.id} item={item} onAction={onAction}/>)}
  </View>:null}
  {!blocked&&view.opportunities?.length?<View style={S.history} testID="life-opportunities">
   <Pressable testID="life-opportunities-toggle" accessibilityRole="button" accessibilityState={{expanded:showOpportunities}} onPress={()=>setShowOpportunities(!showOpportunities)} style={S.toggle}><Text style={S.toggleText}>{view.opportunities.length} optional living-world {view.opportunities.length===1?'story':'stories'} available</Text><Text style={S.toggleText}>{showOpportunities?'−':'+'}</Text></Pressable>
   {showOpportunities&&view.opportunities.map(x=><View key={x.id} style={S.chapter}>
    <Pressable accessibilityRole="button" accessibilityState={{expanded:selectedStory===x.id}} testID={'life-story-'+x.id.replace(/:/g,'-')} onPress={()=>setSelectedStory(selectedStory===x.id?null:x.id)} style={{gap:5}}>
     <Text style={S.overline}>{x.category}</Text><Text style={S.subtitle}>{x.title}</Text>
     {x.context?<Text style={S.muted}>{x.context}</Text>:null}
     {x.resolutionAge!==null?<Text style={S.tag}>Planned resolution: age {x.resolutionAge}</Text>:null}
     <Text style={S.toggleText}>{selectedStory===x.id?'Hide choices':'View '+x.choices.length+' choices'}</Text>
    </Pressable>
    {selectedStory===x.id?x.choices.map(c=><Pressable key={c.id} testID={'life-story-choice-'+c.id.replace(/:/g,'-')} accessibilityRole="button" onPress={()=>onAction(c.id)} style={S.action}><Text style={S.actionText}>{c.label}</Text><Text style={S.muted}>{c.detail}</Text></Pressable>):null}
   </View>)}
   <Text style={S.muted}>Optional stories use ordinary activities. Ignoring a story lets its characters continue independently.</Text>
  </View>:null}
  {view.latest?<View testID="flow-last-choice" style={S.last}>
   <Text style={S.overline}>WHAT YOU CHOSE LAST</Text>
   <Text style={S.subtitle}>{view.latest.title}</Text>
   <Text style={S.muted}>{view.latest.choice} · {capitalize(view.latest.category)} · Age {view.latest.age}</Text>
  </View>:null}
  {view.chapters.length?<View style={S.history}>
   <Pressable testID="flow-show-history" accessibilityRole="button" onPress={()=>setShowHistory(!showHistory)} style={S.toggle}>
    <Text style={S.toggleText}>{showHistory?'Hide':'Show'} your continuing story threads ({view.chapters.length})</Text>
    <Text style={S.toggleText}>{showHistory?'−':'+'}</Text>
   </Pressable>
   {showHistory?<View testID="flow-story-history" style={S.historyList}>
    {view.chapters.map(x=><View key={x.id} style={S.chapter}>
     <View style={S.between}><Text style={S.subtitle}>{capitalize(x.theme)}</Text><Text style={S.tag}>Ages {x.firstAge}–{x.endAge}</Text></View>
     <Text style={S.muted}>{x.lastTitle} · {x.count} remembered event{x.count===1?'':'s'}</Text>
    </View>)}
   </View>:null}
  </View>:null}
 </View>;
}
export function LifeBalanceCard({view,stats}){
 return <View testID="flow-life-balance" style={S.balance}>
  <Text style={S.overline}>YOUR CURRENT BALANCE</Text>
  <Text style={S.muted}>The game favors variety and reduces unavoidable harsh event combinations when your character is under pressure. Your choices still determine the outcome.</Text>
  <View style={S.balanceMeters}>
   <TinyMeter label="Health" value={stats.health}/>
   <TinyMeter label="Calm" value={100-stats.stress}/>
   <TinyMeter label="Happiness" value={stats.happiness}/>
  </View>
  {view.moneyRisk?<Text style={S.warning}>Recent finances are tight. A lower-cost budget or steady income may help.</Text>:
   <Text style={S.muted}>Current financial conditions are not flagged as urgent.</Text>}
 </View>;
}
export function LifeThreadLegacy({view}){
 return <View testID="flow-legacy-board" style={{gap:8}}>
  <Text style={S.overline}>YOUR LIFE THREADS</Text>
  <Text style={S.muted}>{view.summary.choices} decisions across {view.summary.years} tracked years, with {view.summary.quietYears} balanced years.</Text>
  {view.chapters.slice(0,4).map(x=><Text key={x.id} style={S.muted}>
   · {capitalize(x.theme)} · {x.lastTitle} · {x.count} choices
  </Text>)}
 </View>;
}
const S=StyleSheet.create({
 board:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:18,padding:14,gap:11},
 between:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8},
 overline:{fontSize:10,fontWeight:'900',color:C.green,letterSpacing:.5},
 tag:{fontSize:10,color:C.gold,fontWeight:'800',flexShrink:1},
 title:{fontSize:22,lineHeight:28,color:C.ink,fontWeight:'900'},
 subtitle:{fontSize:13,lineHeight:18,color:C.ink,fontWeight:'800',flexShrink:1},
 body:{fontSize:12,lineHeight:19,color:C.muted},
 muted:{fontSize:11,lineHeight:17,color:C.muted,flexShrink:1},
 statValue:{color:C.ink,fontSize:13,fontWeight:'800',lineHeight:19,flexShrink:1},
 statusRow:{flexDirection:'row',flexWrap:'wrap',gap:8},
 stat:{backgroundColor:C.tile,flex:1,minWidth:90,borderRadius:10,padding:9,gap:4},
 toggle:{borderWidth:1,borderColor:C.line,borderRadius:10,padding:11,minHeight:46,
  flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10},
 toggleText:{color:C.green,fontSize:12,fontWeight:'800',flexShrink:1},
 focusOptions:{gap:7},focusOption:{backgroundColor:C.tile,borderRadius:11,padding:11,gap:4,minHeight:50},
 focusSelected:{borderWidth:1,borderColor:C.green},
 focusLabel:{color:C.ink,fontSize:13,fontWeight:'800'},
 suggestions:{gap:8},
 action:{padding:11,minHeight:52,backgroundColor:C.tile,borderRadius:11,gap:4,justifyContent:'center'},
 actionText:{fontSize:13,fontWeight:'800',lineHeight:18,color:C.ink},
 last:{padding:10,backgroundColor:'#294137',borderRadius:10,gap:5},
 history:{gap:7},historyList:{gap:7},
 chapter:{backgroundColor:C.tile,padding:9,borderRadius:9,gap:4},
 balance:{gap:8,padding:13,backgroundColor:C.panel,borderRadius:12},
 balanceMeters:{flexDirection:'row',flexWrap:'wrap',gap:9},
 meter:{flex:1,minWidth:80,gap:4},
 meterNumber:{fontSize:11,color:C.green,fontWeight:'800'},
 track:{height:6,borderRadius:5,overflow:'hidden',backgroundColor:C.line},
 bar:{height:6,backgroundColor:C.green},
 warning:{fontSize:11,color:C.warning,lineHeight:17}
});
