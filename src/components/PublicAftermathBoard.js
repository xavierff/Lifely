import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';

const C={bg:'#142729',card:'#243B3C',ink:'#F7F7EC',muted:'#BBCFC5',
 line:'#587C6C',mint:'#C9F28A',gold:'#FFDC9A',red:'#FFC3B1'};
const TYPES={
 'election-rivalry':'LEADERSHIP RIVALRY','professional-network':'PROFESSIONAL PARTNERSHIP',
 'professional-feud':'PROFESSIONAL FEUD','community-legacy':'COMMUNITY LEGACY',
 'community-divide':'COMMUNITY DIVIDE','agreement-network':'PUBLIC AGREEMENT',
 'agreement-feud':'PUBLIC FEUD'};
const sign=n=>(n>=0?'+':'')+n;
const percent=n=>Math.max(0,Math.min(100,Number(n)||0));
const initial=name=>String(name||'?').split(' ').slice(0,2).map(x=>x.charAt(0)).join('').toUpperCase();
function Face({name,trust,rivalry}){
 return <View style={S.face}>
  <View style={S.avatar}><Text style={S.initial}>{initial(name)}</Text></View>
  <Text numberOfLines={2} style={S.person}>{name}</Text>
  <Text style={S.mini}>Trust {trust??'—'} · Rivalry {rivalry??'—'}</Text>
 </View>;
}
function Meter({title,value,warning=false}){
 return <View style={S.meter}><View style={S.split}>
  <Text style={S.mini}>{title}</Text><Text style={S.boldMini}>{percent(value)}</Text>
 </View><View style={S.track}><View style={[S.fill,{width:percent(value)+'%',
  backgroundColor:warning?C.red:C.mint}]}/></View></View>;
}
function Saga({saga,commands,onAction,compact}){
 const active=commands.filter(c=>c.id.startsWith('afterlife:'+saga.id+':'));
 return <View testID={'aftermath-thread-'+saga.id} style={S.saga}>
  <View style={S.split}><Text style={S.overline}>{TYPES[saga.kind]}</Text>
   <Text style={[S.overline,{color:saga.pending?C.gold:C.mint}]}>
    {saga.pending?'CHOOSE YOUR NEXT MOVE':'EVOLVING'}</Text></View>
  <Text style={S.headline}>{saga.title}</Text>
  <Text style={S.desc}>From a {saga.mode} at age {saga.sourceAge}. Its real participants are still living with the consequences.</Text>
  <View style={S.people}>
   <Face name={saga.aName} trust={saga.aTrust} rivalry={saga.aRivalry}/>
   <Text style={S.connection}>↔</Text>
   <Face name={saga.bName} trust={saga.bTrust} rivalry={saga.bRivalry}/>
  </View>
  <View style={S.bars}><Meter title="Affinity" value={saga.affinity}/>
   <Meter title="Friction" value={saga.friction} warning/></View>
  <View style={S.context}>
   <Text style={S.overline}>ORGANIZATIONS INVOLVED</Text>
   <Text style={S.desc}>{saga.groupA}{saga.groupAId!==saga.groupBId?' & '+saga.groupB:''}</Text>
   <Text style={S.mini}>Chapter {saga.chapter} · Age {saga.startedAge}–{saga.expiryAge} · Next organic change age {saga.nextAge}</Text>
   {['joint-project','joint-venture'].includes(saga.partnership)?<Text testID="aftermath-partnership" style={S.good}>
    {saga.partnership==='joint-venture'?'Named venture recorded with a real business contact':
     'Professional collaboration established with an existing contact'}; no automatic income or promotion
   </Text>:null}
  </View>
  {saga.pending?<View testID="aftermath-invitation" style={S.invite}>
   <Text style={S.overline}>A RETURNING STORY · AGE {saga.offerAge}</Text>
   <Text style={S.desc}>People you met years earlier are ready to revisit this public conflict. Choose how your relationships evolve; ignoring the invitation is also allowed.</Text>
   {active.map(c=><Pressable key={c.id}
    testID={'aftermath-choice-'+c.id.split(':').at(-1)}
    accessibilityRole="button" accessibilityLabel={c.label+', '+c.detail}
    accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled}
    onPress={()=>onAction(c.id)}
    style={({pressed})=>[S.choice,!c.enabled&&S.disabled,pressed&&{opacity:.7}]}>
    <Text style={S.choiceTitle}>{c.label}</Text><Text style={S.mini}>{c.detail}</Text>
   </Pressable>)}
   <Text style={S.mini}>Each response costs one ordinary yearly activity. Ignoring it changes no player resources.</Text>
  </View>:null}
  {!compact&&saga.decisions.length?<View testID="aftermath-choices-history" style={S.context}>
   <Text style={S.overline}>WHAT YOU DID IN PAST YEARS</Text>
   {saga.decisions.slice(-3).reverse().map((d,i)=><View key={d.age+'-'+i} style={S.historyRow}>
    <Text style={S.person}>Age {d.age}: {d.label}</Text>
    <Text style={S.mini}>NPC trust {sign(d.trustA)} / {sign(d.trustB)} · Intergroup competition {sign(d.competition)} · Group standing {sign(d.groupA)} / {sign(d.groupB)}</Text>
    {d.spillGroup?<Text style={S.good}>Consequence spread through a real shared member · standing {sign(d.spillDelta)}</Text>:null}
   </View>)}
  </View>:null}
  {!compact&&saga.history.length?<View style={S.context}>
   <Text style={S.overline}>THE YEARS BETWEEN CHOICES</Text>
   {saga.history.slice(0,4).map((x,i)=><View key={x.age+'-'+x.kind+'-'+i} style={S.historyRow}>
    <Text style={S.mini}>AGE {x.age} · {x.kind.toUpperCase()}</Text>
    <Text style={S.desc}>{x.text}</Text>
   </View>)}
  </View>:null}
 </View>;
}
export default function PublicAftermathBoard({view,commands=[],onAction,compact=false,onlyProfessional=false}){
 const threads=(view.threads||[]).filter(x=>!onlyProfessional||x.kind.includes('professional'));
 const recent=(view.completed||[]).find(x=>x.endedAge===view.age&&
  (!onlyProfessional||x.kind.includes('professional')));
 if(compact&&!threads.some(x=>x.pending||x.decisions.at(-1)?.age===view.age)&&!recent)return null;
 return <View testID={compact?'public-aftermath-preview':'public-aftermath-board'} style={S.root}>
  <View style={S.split}><View style={{flex:1,gap:3}}>
   <Text style={S.overline}>LIVING CONSEQUENCES · THE LONG GAME</Text>
   <Text style={S.title}>{compact?'The past has returned':'Choices that echo for decades'}</Text>
  </View><Text style={S.mini}>{threads.length} ONGOING</Text></View>
  <Text style={S.desc}>Elections create rivals. Competitions build partnerships or grudges. Festivals reshape communities. Agreements gain new supporters or opponents years later.</Text>
  {threads.filter(t=>!compact||t.pending||t.decisions.at(-1)?.age===view.age).map(t=>
   <Saga key={t.id} saga={t} commands={commands} onAction={onAction} compact={compact}/>)}
  {compact&&recent&&!threads.some(x=>x.pending)?<View testID="aftermath-recent" style={S.card}>
   <Text style={S.overline}>THIS YEAR'S LONG-TERM RESULT</Text>
   <Text style={S.person}>{recent.ending.toUpperCase()}</Text>
   <Text style={S.desc}>{recent.finalLine}</Text>
  </View>:null}
  {!compact&&!threads.length?<Text style={S.mini}>No long-running public relationships yet. Completing a consequential event with real NPCs can start a story that develops every few years.</Text>:null}
  {!compact&&view.completed?.length?<View testID="aftermath-archive" style={S.card}>
   <Text style={S.overline}>STORIES WITH LASTING ENDINGS</Text>
   {view.completed.slice(0,7).map(t=><View key={t.id} style={S.historyRow}>
    <View style={S.split}><Text style={S.person}>{t.title}</Text>
     <Text style={S.overline}>{t.ending.toUpperCase()}</Text></View>
    <Text style={S.desc}>{t.finalLine}</Text>
    <Text style={S.mini}>Age {t.endedAge} · {t.followups} optional follow-ups</Text>
   </View>)}
  </View>:null}
  {!compact&&view.ancestors?.length?<View testID="aftermath-ancestors" style={S.card}>
   <Text style={S.overline}>STORIES PASSED TO LATER GENERATIONS</Text>
   <Text style={S.mini}>An heir receives historical memories, never automatically living contacts, money or inherited personal loyalties.</Text>
   {view.ancestors.slice(0,4).map((x,i)=><View key={x.generation+'-'+i} style={S.historyRow}>
    <Text style={S.overline}>GENERATION {x.generation} · {x.name}</Text>
    <Text style={S.desc}>{x.note}</Text>
   </View>)}
  </View>:null}
  {!compact?<Text style={S.mini}>All remembered people are actual existing adults. Autonomous changes affect real relationships and groups, not player money, jobs or earned reputation.</Text>:null}
 </View>;
}
const S=StyleSheet.create({
 root:{backgroundColor:C.bg,borderRadius:16,borderColor:C.line,borderWidth:1,
  padding:13,gap:12},
 split:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8},
 overline:{fontSize:10,fontWeight:'900',letterSpacing:.4,color:C.gold,flexShrink:1},
 title:{fontSize:19,fontWeight:'900',lineHeight:26,color:C.ink},
 headline:{fontSize:15,fontWeight:'900',lineHeight:22,color:C.ink},
 desc:{fontSize:12,color:C.muted,lineHeight:18,flexShrink:1},
 mini:{fontSize:10,lineHeight:16,color:C.muted,flexShrink:1},
 person:{fontSize:12,fontWeight:'900',color:C.ink,flexShrink:1,lineHeight:18},
 boldMini:{fontSize:12,fontWeight:'900',color:C.ink},
 good:{color:C.mint,fontSize:11,lineHeight:16},
 saga:{backgroundColor:C.card,borderRadius:11,padding:12,
  borderWidth:1,borderColor:C.line,gap:11},
 card:{backgroundColor:C.card,borderRadius:11,padding:12,gap:9},
 people:{flexDirection:'row',alignItems:'center',gap:5,backgroundColor:'#162D2E',
  borderRadius:10,padding:10},
 face:{flex:1,alignItems:'center',minWidth:0,gap:5},
 avatar:{height:47,width:47,borderRadius:25,backgroundColor:'#47716D',
  borderWidth:1,borderColor:C.mint,justifyContent:'center',alignItems:'center'},
 initial:{color:C.ink,fontSize:15,fontWeight:'900'},
 connection:{fontSize:23,fontWeight:'900',color:C.gold},
 bars:{flexDirection:'row',flexWrap:'wrap',gap:9},
 meter:{flex:1,flexBasis:110,gap:5},
 track:{height:8,backgroundColor:'#4A6562',borderRadius:5,overflow:'hidden'},
 fill:{height:8,borderRadius:5},
 context:{backgroundColor:'#162E30',padding:10,borderRadius:9,gap:7},
 invite:{padding:10,backgroundColor:'#294541',borderColor:C.mint,borderWidth:1,
  borderRadius:10,gap:8},
 choice:{padding:11,borderColor:'#75958D',borderWidth:1,
  backgroundColor:'#345450',borderRadius:9,minHeight:48,gap:4},
 choiceTitle:{fontSize:12,fontWeight:'900',color:C.ink,lineHeight:18},
 disabled:{opacity:.4},
 historyRow:{paddingTop:9,borderTopWidth:1,borderTopColor:C.line,gap:5}
});
