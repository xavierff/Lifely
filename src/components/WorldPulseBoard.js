import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
const C={bg:'#172A31',panel:'#23373D',panel2:'#294447',ink:'#F7F8EA',muted:'#B6CFC6',green:'#D2F596',gold:'#FFDDA6',line:'#557169',warning:'#FFB9A6'};
const pct=n=>Math.max(0,Math.min(100,Math.round(n||0)));
function Meter({label,value,warn=false}){
 const n=pct(value);
 return <View style={S.meter}>
  <View style={S.space}><Text style={S.micro}>{label}</Text><Text style={[S.micro,{color:warn?C.warning:C.green,fontWeight:'800'}]}>{n}</Text></View>
  <View style={S.track} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{min:0,max:100,now:n}}>
   <View style={[S.fill,{width:n+'%',backgroundColor:warn?C.warning:C.green}]}/>
  </View>
 </View>;
}
const money=n=>'$'+Math.round(n||0).toLocaleString('en-US');
const currencyRate=n=>(Math.round((Number(n)||1)*100)/100).toFixed(2)+'×';
function Action({item,onAction}){
 return <Pressable testID={'pulse-'+item.id.replace(/:/g,'-')}
  accessibilityRole="button" accessibilityLabel={item.label+', '+item.detail}
  accessibilityState={{disabled:!item.enabled}} disabled={!item.enabled}
  onPress={()=>onAction(item.id)}
  style={({pressed})=>[S.action,!item.enabled&&{opacity:.38},pressed&&{opacity:.72}]}>
  <Text style={S.actionLabel}>{item.label}</Text><Text style={S.small}>{item.detail}</Text>
 </Pressable>;
}
export function WorldPulseChapterBoard({view,onChoose}){
 if(!view)return null;
 return <View testID="active-world-project" style={S.scene}>
  <View style={S.space}>
   <Text style={S.overline}>THE WORLD REMEMBERS · CHAPTER {view.chapter}/3</Text>
   <Text style={S.tag}>{view.region}</Text>
  </View>
  <Text style={S.title}>{view.title}</Text>
  <Text style={S.small}>{view.story}</Text>
  <View style={S.panel}>
   <Text style={S.overline}>LOCAL COMPETITION</Text>
   <Text style={S.subtitle}>Your rival: {view.rival}</Text>
   <Meter label="Rival standing" value={view.standing}/>
   <Text style={S.hint}>Decisions change local economic conditions and how competing houses regard your family.</Text>
  </View>
  <Text style={S.subtitle}>{view.chapterTitle}</Text>
  <Text style={S.story}>{view.body}</Text>
  {view.previous?<Text style={S.previous}>Previously: {view.previous.reaction}</Text>:null}
  <Text style={S.overline}>HOW DO YOU RESPOND?</Text>
  {view.choices.map(option=><Pressable key={option.index} testID={'pulse-decision-'+option.index}
   accessibilityRole="button" accessibilityLabel={option.label+', '+option.detail}
   onPress={()=>onChoose(option.index)} style={({pressed})=>[S.action,pressed&&{opacity:.7}]}>
   <Text style={S.actionLabel}>{option.label}</Text><Text style={S.small}>{option.detail}</Text>
  </Pressable>)}
  <Text style={S.hint}>You cannot advance the year with an unresolved regional project decision. This fictional story takes place across five years.</Text>
 </View>;
}
export default function WorldPulseBoard({summary,commands,onAction,blocked}){
 const [showProjects,setShowProjects]=useState(false),[showRivals,setShowRivals]=useState(false),[showRegions,setShowRegions]=useState(false);
 const opts=commands.filter(c=>c.id.startsWith('pulse:'));
 const projects=opts.filter(x=>x.id.startsWith('pulse:begin:'));
 const rivals=opts.filter(x=>['pulse:collaborate:','pulse:challenge:','pulse:repair:'].some(k=>x.id.startsWith(k)));
 const others=opts.filter(x=>!projects.includes(x)&&!rivals.includes(x));
 return <View testID="world-pulse-board" style={S.board}>
  <View style={S.space}><Text style={S.overline}>A LIVING, CHANGING WORLD</Text><Text style={S.tag}>6 COUNTRIES · 5 INDUSTRIES</Text></View>
  <Text style={S.title}>Your choices change the region</Text>
  <Text style={S.small}>Economic conditions shift every year. Your career, local projects and relationships with rival houses influence the opportunities people inherit.</Text>
  <View style={S.panel} testID="world-pulse-economy">
   <View style={S.space}><Text style={S.subtitle}>{summary.region} outlook</Text><Text style={S.tag}>FICTIONAL ECONOMY</Text></View>
   {summary.sectors.map(sector=><View key={sector.id} style={S.sectorRow}>
    <View style={S.space}><Text style={S.sectorLabel}>{sector.name}</Text><Text style={S.rate}>{currencyRate(sector.multiplier)}</Text></View>
    <Meter label={sector.name+' index'} value={sector.index}/>
   </View>)}
   {summary.career?<Text style={S.hint}>Your {summary.career.title} career is linked to {summary.career.sector}. Current industry income factor: {currencyRate(summary.career.multiplier)} before reputation.</Text>:null}
   <Pressable accessibilityRole="button" testID="pulse-show-countries" style={S.showMore} onPress={()=>setShowRegions(!showRegions)}>
    <Text style={S.showText}>{showRegions?'Hide country comparisons':'Compare all six countries'}</Text>
   </Pressable>
   {showRegions?<View testID="pulse-country-comparison" style={S.countryList}>
    {summary.countries.map(x=><View key={x.id} style={S.space}><Text style={S.small}>{x.name}</Text>
     <Text style={S.rate}>{x.average}/100 average</Text></View>)}
   </View>:null}
  </View>
  {summary.countries[summary.country]?.lastHeadline?<View testID="world-pulse-headline" style={S.headline}>
   <Text style={S.overline}>REGIONAL HEADLINE · AGE {summary.countries[summary.country].lastHeadline.age}</Text>
   <Text style={S.subtitle}>{summary.countries[summary.country].lastHeadline.title}</Text>
   <Text style={S.small}>{summary.countries[summary.country].lastHeadline.description}</Text>
  </View>:null}
  <View style={S.panel} testID="world-pulse-reputation">
   <Text style={S.overline}>YOUR PUBLIC REPUTATION</Text>
   <View style={S.metrics}><Meter label="Community" value={summary.reputation.community}/><Meter label="Integrity" value={summary.reputation.integrity}/><Meter label="Influence" value={summary.reputation.influence}/></View>
   <Text style={S.hint}>Normal gameplay—volunteering, work, training and helping people—changes these scores. Professional pay factor from reputation: {currencyRate(summary.reputationMultiplier)}.</Text>
  </View>
  {summary.active?<View testID="pulse-project-progress" style={S.panel}>
   <Text style={S.overline}>{summary.active.status==='ready'?'DECISION READY':'STORY STILL UNFOLDING'}</Text>
   <Text style={S.subtitle}>{summary.active.sector} · Chapter {summary.active.stage+1}/3</Text>
   <Text style={S.small}>{summary.active.status==='waiting'?
    summary.active.due?'The follow-up is ready to play':'Next chapter in '+summary.active.yearsUntil+' years':
    'Make your active decision before continuing the year.'}</Text>
  </View>:null}
  <View style={S.panel} testID="world-pulse-rivals">
   <Text style={S.overline}>COMPETING FAMILY HOUSES</Text>
   {summary.rivals.map(rival=><View key={rival.id} style={S.rival}>
    <View style={S.space}><Text style={S.subtitle}>{rival.name}</Text><Text style={S.tag}>{rival.field.toUpperCase()}</Text></View>
    <Text style={S.small}>{rival.motto} · {rival.wins} independent regional wins</Text>
    <View style={S.metrics}>
     <Meter label={rival.name+' standing'} value={rival.standing}/>
     <Meter label={rival.name+' rivalry'} value={rival.rivalry} warn/>
    </View>
    <Text style={S.hint}>Trust {rival.trust}/100 · these relationships can continue into your descendant's life.</Text>
   </View>)}
  </View>
  {!blocked&&opts.length?<View style={S.actions} testID="world-pulse-actions">
   <Text style={S.overline}>{summary.active?'YOUR REGIONAL COMMITMENT':'JOIN A REGIONAL INITIATIVE'}</Text>
   {summary.active?others.map(x=><Action key={x.id} item={x} onAction={onAction}/>:
    <>
     {(showProjects?projects:projects.slice(0,2)).map(x=><Action key={x.id} item={x} onAction={onAction}/>)}
     {projects.length>2?<Pressable testID="pulse-show-projects" accessibilityRole="button" onPress={()=>setShowProjects(!showProjects)} style={S.showMore}>
      <Text style={S.showText}>{showProjects?'Show fewer regional projects':'Explore all '+projects.length+' regional projects'}</Text>
     </Pressable>:null}
     {others.map(x=><Action key={x.id} item={x} onAction={onAction}/>)}
     {rivals.length?<><Text style={S.overline}>DECIDE YOUR RIVAL RELATIONSHIPS</Text>
      {(showRivals?rivals:rivals.slice(0,2)).map(x=><Action key={x.id} item={x} onAction={onAction}/>)}
      {rivals.length>2?<Pressable testID="pulse-show-rival-actions" accessibilityRole="button" onPress={()=>setShowRivals(!showRivals)} style={S.showMore}>
       <Text style={S.showText}>{showRivals?'Show fewer rival actions':'Explore all rival challenges and alliances'}</Text>
      </Pressable>:null}</>:null}
    </>}
  </View>:null}
  {summary.finished.length?<View testID="world-pulse-completed" style={S.panel}>
   <Text style={S.overline}>WHAT YOUR WORK CHANGED</Text>
   {summary.finished.slice(0,3).map(x=><View key={x.id} style={S.record}>
    <Text style={S.subtitle}>{x.title}</Text>
    <Text style={S.small}>Age {x.age}–{x.completedAge} · {x.result} · {x.choices.length} decisions</Text>
   </View>)}
  </View>:null}
  {summary.news.length?<View style={S.panel}>
   <Text style={S.overline}>LATEST REGIONAL CONSEQUENCES</Text>
   {summary.news.slice(0,4).map((x,i)=><Text key={x.age+'-'+i} style={S.small}>Age {x.age} · {x.text}</Text>)}
  </View>:null}
 </View>;
}
export function WorldPulseCareer({summary}){
 return <View testID="world-pulse-career" style={S.compact}>
  <Text style={S.overline}>THE ECONOMY IS NOT STATIC</Text>
  <Text style={S.small}>{summary.region}'s industries change with events, community choices and regional investment.</Text>
  {summary.career?<Text style={S.hint}>Your {summary.career.title} career: regional market {currencyRate(summary.career.multiplier)} · reputation {currencyRate(summary.reputationMultiplier)}.</Text>:
   <Text style={S.hint}>Start a regular career to see its regional market effect on annual income.</Text>}
 </View>;
}
export function WorldPulseLegacy({summary}){
 return <View testID="world-pulse-legacy" style={{gap:8}}>
  <Text style={S.overline}>THE WORLD YOUR FAMILY INHERITED</Text>
  <Text style={S.small}>{summary.started} regional projects started · {summary.completed} completed · {summary.ancestry.length} inherited world memories</Text>
  {summary.ancestry.slice(0,5).map((x,i)=><Text key={i} style={S.small}>
   ◇ {x.sourceLife||'Family history'}: {x.title||x.text||'A remembered decision'}{x.result?' · '+x.result:''}
  </Text>)}
 </View>;
}
const S=StyleSheet.create({
 board:{backgroundColor:C.bg,borderWidth:1,borderColor:C.line,borderRadius:18,padding:15,gap:12},
 scene:{backgroundColor:'#1A3637',borderColor:C.green,borderWidth:1.5,borderRadius:18,padding:15,gap:11},
 panel:{backgroundColor:C.panel,borderRadius:13,padding:12,gap:10},
 headline:{backgroundColor:'#253A35',borderColor:C.gold,borderLeftWidth:3,borderRadius:10,padding:12,gap:7},
 compact:{backgroundColor:C.panel,borderRadius:13,padding:13,gap:7},
 space:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:9,flexWrap:'wrap'},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:.6,color:C.green},
 tag:{fontSize:10,fontWeight:'800',color:C.gold,flexShrink:1},
 title:{fontSize:22,lineHeight:29,fontWeight:'900',color:C.ink,flexShrink:1},
 subtitle:{fontSize:14,lineHeight:19,fontWeight:'800',color:C.ink,flexShrink:1},
 story:{backgroundColor:C.panel2,padding:13,borderRadius:10,fontSize:15,lineHeight:23,color:C.ink},
 previous:{fontSize:12,color:C.gold,paddingLeft:8,borderLeftWidth:2,borderColor:C.gold,lineHeight:18},
 small:{fontSize:12,lineHeight:19,color:C.muted,flexShrink:1},
 hint:{fontSize:11,lineHeight:17,color:C.gold,flexShrink:1},
 sectorLabel:{fontSize:12,color:C.ink,fontWeight:'700',flexShrink:1},
 rate:{fontSize:12,fontWeight:'900',color:C.green},
 sectorRow:{gap:4},
 meter:{flex:1,minWidth:100,gap:5},
 micro:{fontSize:10,color:C.muted,flexShrink:1},
 metrics:{flexDirection:'row',flexWrap:'wrap',gap:10},
 track:{backgroundColor:'#45635A',height:7,borderRadius:4,overflow:'hidden'},
 fill:{height:7,borderRadius:4},
 countryList:{borderTopWidth:1,borderColor:C.line,paddingTop:10,gap:7},
 rival:{gap:7,paddingBottom:10,borderBottomWidth:1,borderColor:C.line},
 actions:{gap:8},action:{backgroundColor:C.panel,borderRadius:11,padding:12,minHeight:56,
  borderWidth:1,borderColor:C.line,justifyContent:'center',gap:5},
 actionLabel:{fontSize:13,lineHeight:19,fontWeight:'800',color:C.ink},
 showMore:{padding:11,backgroundColor:C.panel2,borderRadius:10,minHeight:46,justifyContent:'center'},
 showText:{fontSize:13,color:C.green,fontWeight:'800',textAlign:'center'},
 record:{gap:5,paddingBottom:7,borderBottomWidth:1,borderColor:C.line}
});
