import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';

const C={bg:'#13262C',panel:'#213B41',raised:'#305048',ink:'#F6F7F1',
 muted:'#BED0CA',gold:'#FFDEAA',mint:'#CBF1B0',red:'#FFC1B3',line:'#58746F'};
const STATUS={allied:'ALLIED',cooperating:'COOPERATING',competing:'COMPETING',
 strained:'STRAINED',neutral:'IN DIALOGUE',dormant:'DORMANT'};
const badgeColor=x=>x==='allied'||x==='cooperating'?C.mint:
 x==='competing'||x==='strained'?C.red:C.gold;
const sign=n=>(n>=0?'+':'')+n;
const bounded=n=>Math.max(0,Math.min(100,Number(n)||0));
const initials=x=>String(x||'?').split(' ').slice(0,2).map(a=>a.charAt(0)).join('').toUpperCase();
function Progress({label,value,danger=false}){
 return <View style={S.progress}>
  <View style={S.split}><Text style={S.small}>{label}</Text>
   <Text style={S.value}>{bounded(value)}</Text></View>
  <View style={S.track}>
   <View style={[S.fill,{width:bounded(value)+'%',backgroundColor:danger?C.red:C.mint}]}/>
  </View>
 </View>;
}
function GroupHead({title,representative,members}){
 return <View style={S.groupHead}>
  <View style={S.avatar}><Text style={S.avatarText}>{initials(representative||title)}</Text></View>
  <Text style={S.groupName} numberOfLines={3}>{title}</Text>
  <Text style={S.small}>{representative||'Historic organization'}</Text>
  <Text style={S.tiny}>{members} known members</Text>
 </View>;
}
function LinkCard({link,compact=false}){
 return <View testID={'intergroup-link-'+link.id} style={S.link}>
  <View style={S.split}><Text style={S.overline}>BETWEEN ORGANIZATIONS</Text>
   <Text style={[S.overline,{color:badgeColor(link.status)}]}>{STATUS[link.status]}</Text></View>
  <View style={S.confront}>
   <GroupHead title={link.aName} representative={link.representativeA} members={link.membersA}/>
   <View style={S.between}><Text style={S.connection}>↔</Text>
    <Text style={S.tiny}>SHARED{'\n'}FUTURE</Text></View>
   <GroupHead title={link.bName} representative={link.representativeB} members={link.membersB}/>
  </View>
  <View style={S.metrics}>
   <Progress label="Mutual trust" value={link.trust}/>
   <Progress label="Competition" value={link.competition} danger/>
  </View>
  {link.memberOverlap>0?<Text style={S.small}>{link.memberOverlap} existing NPC member{link.memberOverlap!==1?'s':''} participate{link.memberOverlap===1?'s':''} in both groups.</Text>:null}
  <View testID="intergroup-public-event" style={S.project}>
   <View style={S.split}><Text style={S.overline}>PUBLIC EVENTS THAT RUN WITHOUT YOU</Text>
    <Text style={S.overline}>#{link.publicEventsHeld+1}</Text></View>
   <Text style={S.projectName}>{link.event?.label||'An organizational gathering'}</Text>
   <View style={S.track}>
    <View style={[S.fill,{width:bounded(link.event?.progress)+'%'}]}/>
   </View>
   <Text style={S.small}>{link.event?.status==='paused'?
    'Paused until living representatives return':
    'Scheduled for age '+link.event?.dueAge+' · '+bounded(link.event?.progress)+'% prepared'}
   </Text>
   <Text style={S.tiny}>{link.publicEventsHeld} prior public gatherings · {link.years} years in contact</Text>
  </View>
  {!compact&&link.history.length?<View style={S.history}>
   <Text style={S.overline}>PUBLIC MEMORY & LEADERSHIP CHANGES</Text>
   {link.history.slice(0,4).map((h,i)=>
    <View key={h.age+'-'+h.kind+'-'+i} style={S.timelineRow}>
     <Text style={S.tiny}>AGE {h.age} · {h.outcome.toUpperCase()}</Text>
     <Text style={S.small}>{h.label}</Text>
    </View>)}
  </View>:null}
 </View>;
}
function Decision({item,commands,onAction}){
 const cs=commands.filter(c=>c.id.startsWith('intergroup:'+item.id+':'));
 const ready=item.status==='open'||item.status==='ready';
 const changed=item.lastDecision;
 return <View testID="intergroup-decision" style={S.scene}>
  <View style={S.split}><Text style={S.overline}>{item.status==='open'?'AN INTERGROUP INVITATION':
   item.status==='waiting'?'TWO YEARS OF INDEPENDENT LIFE':'LEADERS RECONVENE'}</Text>
   <Text style={[S.overline,{color:C.mint}]}>AGE {item.startedAge}</Text></View>
  <Text style={S.heading}>{item.aName} & {item.bName}</Text>
  <Text style={S.description}>Two real organizations want to shape their future. Their leaders, public gatherings and goals will continue changing whether you participate or not.</Text>
  <View style={S.faces}>
   <View style={{flex:1,gap:3}}><Text style={S.small}>FIRST GROUP</Text>
    <Text style={S.name}>{item.representativeA||'No current leader'}</Text></View>
   <Text style={[S.connection,{fontSize:24}]}>↔</Text>
   <View style={{flex:1,gap:3,alignItems:'flex-end'}}><Text style={S.small}>SECOND GROUP</Text>
    <Text style={S.name}>{item.representativeB||'No current leader'}</Text></View>
  </View>
  {item.leaderChanged?<Text style={S.warning}>Leadership changed since the original invitation. Decisions now involve the real current representatives.</Text>:null}
  <View style={S.metrics}><Progress label="Trust now" value={item.nowTrust}/>
   <Progress label="Competition now" value={item.nowCompetition} danger/></View>
  {item.publicEvent?<Text style={S.small}>Their next public event: {item.publicEvent}</Text>:null}
  {changed?<View testID="intergroup-impact" style={S.impact}>
   <Text style={S.overline}>WHAT YOUR LAST DECISION ACTUALLY CHANGED</Text>
   <View style={S.pills}>
    <Text style={S.pill}>Trust {sign(changed.trustDelta)}</Text>
    <Text style={S.pill}>Competition {sign(changed.competitionDelta)}</Text>
    <Text style={S.pill}>Group A standing {sign(changed.aStandingDelta)}</Text>
    <Text style={S.pill}>Group B standing {sign(changed.bStandingDelta)}</Text>
    <Text style={S.pill}>Leader A trust {sign(changed.npcTrustA)}</Text>
    <Text style={S.pill}>Leader B trust {sign(changed.npcTrustB)}</Text>
   </View>
  </View>:null}
  {item.status==='waiting'?<Text style={S.waiting}>The two organizations are evolving independently. Their leaders will return to the conversation at age {item.dueAge}.</Text>:null}
  {ready?<View style={S.choices}>
   <Text style={S.overline}>{item.status==='open'?'HOW WILL YOU RESPOND?':'WHAT WILL YOU DO YEARS LATER?'}</Text>
   {cs.map(c=><Pressable key={c.id} testID={'intergroup-choice-'+c.id.split(':').at(-1)}
    accessibilityRole="button" accessibilityLabel={c.label+', '+c.detail}
    accessibilityState={{disabled:!c.enabled}} disabled={!c.enabled}
    onPress={()=>onAction(c.id)}
    style={({pressed})=>[S.choice,!c.enabled&&S.disabled,pressed&&{opacity:.75}]}>
    <Text style={S.choiceName}>{c.label}</Text><Text style={S.small}>{c.detail}</Text>
   </Pressable>)}
  </View>:null}
  <Text style={S.tiny}>All responses are optional. Choosing a response spends one normal yearly activity, not cash or premium currency.</Text>
 </View>;
}
export default function IntergroupWorldBoard({view,commands=[],onAction,compact=false,onlyProfessional=false}){
 const links=onlyProfessional?view.links.filter(l=>l.aKind==='professional'||l.bKind==='professional'):view.links;
 const current=view.active&&(!onlyProfessional||view.active.aKind==='professional'||view.active.bKind==='professional')?view.active:null;
 const recent=view.completed.find(c=>c.endedAge===view.age&&(!onlyProfessional||
  c.aKind==='professional'||c.bKind==='professional'));
 if(compact&&!current&&!recent)return null;
 return <View testID={compact?'intergroup-world-preview':'intergroup-world-board'} style={S.root}>
  <View style={S.split}><View style={{flex:1,gap:3}}>
   <Text style={S.overline}>A WORLD OF CONNECTED ORGANIZATIONS</Text>
   <Text style={S.title}>{compact?'Two groups, one shared future':'Alliances, rivals & public life'}</Text>
  </View><Text style={S.count}>{links.length} TIES</Text></View>
  <Text style={S.description}>Independent groups form partnerships and feuds, host public events, and change leaders over the years. Your decisions can affect more than one group.</Text>
  {current?<Decision item={current} commands={commands} onAction={onAction}/>:null}
  {compact&&recent&&!current?<View testID="intergroup-recent-outcome" style={S.scene}>
   <Text style={S.overline}>THIS YEAR'S PUBLIC CONSEQUENCE</Text>
   <Text style={S.heading}>{recent.ending.toUpperCase()}</Text>
   <Text style={S.description}>{recent.finalLine}</Text>
  </View>:null}
  {!compact&&links.map(l=><LinkCard key={l.id} link={l}/>)}
  {!compact&&!links.length?<Text style={S.small}>No intergroup relationships exist yet. Once at least two real organizations have living members, they can begin building their own shared history.</Text>:null}
  {!compact&&view.completed.length?<View testID="intergroup-history" style={S.panel}>
   <Text style={S.overline}>PAST PUBLIC DECISIONS</Text>
   {view.completed.slice(0,7).map(x=><View key={x.id} style={S.archiveRow}>
    <View style={S.split}><Text style={S.name}>{x.aName} & {x.bName}</Text>
     <Text style={S.overline}>{x.ending.toUpperCase()}</Text></View>
    <Text style={S.description}>{x.finalLine}</Text>
    <Text style={S.tiny}>Age {x.endedAge} · {x.decisions} decisions</Text>
   </View>)}
  </View>:null}
  {!compact&&view.ancestors.length?<View testID="intergroup-ancestors" style={S.panel}>
   <Text style={S.overline}>THE RELATIONSHIPS A NEW GENERATION INHERITS</Text>
   <Text style={S.description}>Institutional memories can survive their founders, but new heirs must build relationships with living representatives. No past leader is automatically restored.</Text>
   {view.ancestors.slice(0,4).map((a,i)=><View key={a.generation+'-'+i} style={S.archiveRow}>
    <Text style={S.overline}>GENERATION {a.generation} · {a.name}</Text>
    <Text style={S.small}>{a.note}</Text>
   </View>)}
  </View>:null}
  <Text style={S.tiny}>Public events are simulation-only. They never create player money, guaranteed opportunities, or invisible NPCs.</Text>
 </View>;
}
const S=StyleSheet.create({
 root:{backgroundColor:C.bg,borderRadius:16,padding:13,borderWidth:1,borderColor:C.line,gap:12},
 split:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
 overline:{fontSize:10,fontWeight:'900',color:C.gold,letterSpacing:.4,flexShrink:1},
 title:{fontSize:19,fontWeight:'900',lineHeight:25,color:C.ink},
 count:{fontSize:10,fontWeight:'900',color:C.mint},
 description:{fontSize:12,lineHeight:19,color:C.muted,flexShrink:1},
 panel:{padding:12,borderRadius:11,backgroundColor:C.panel,gap:10},
 link:{padding:12,borderRadius:11,borderWidth:1,borderColor:C.line,backgroundColor:C.panel,gap:11},
 confront:{flexDirection:'row',alignItems:'center',gap:5,padding:8,borderRadius:11,backgroundColor:C.bg},
 groupHead:{flex:1,alignItems:'center',minWidth:0,gap:6},
 avatar:{width:46,height:46,borderRadius:24,backgroundColor:'#4B7772',borderWidth:1,borderColor:C.mint,justifyContent:'center',alignItems:'center'},
 avatarText:{fontSize:15,fontWeight:'900',color:C.ink},
 groupName:{fontSize:12,fontWeight:'900',lineHeight:18,color:C.ink,textAlign:'center'},
 small:{fontSize:10,lineHeight:16,color:C.muted,flexShrink:1},
 tiny:{fontSize:9,lineHeight:14,color:C.muted,flexShrink:1},
 between:{width:43,alignItems:'center',justifyContent:'center',gap:2},
 connection:{fontSize:30,color:C.gold,fontWeight:'900'},
 metrics:{flexDirection:'row',flexWrap:'wrap',gap:9},
 progress:{flex:1,flexBasis:90,minWidth:0,gap:6},
 value:{fontSize:11,fontWeight:'900',color:C.ink},
 track:{height:8,backgroundColor:'#4E6864',borderRadius:5,overflow:'hidden'},
 fill:{height:8,borderRadius:5,backgroundColor:C.mint},
 project:{padding:10,borderRadius:10,backgroundColor:C.bg,gap:8},
 projectName:{fontSize:12,color:C.ink,fontWeight:'800',lineHeight:18},
 history:{gap:8},timelineRow:{gap:3,paddingTop:8,borderTopWidth:1,borderTopColor:C.line},
 scene:{borderRadius:11,borderWidth:1,borderColor:C.mint,padding:12,backgroundColor:C.panel,gap:10},
 heading:{fontSize:15,lineHeight:22,color:C.ink,fontWeight:'900'},
 faces:{flexDirection:'row',alignItems:'center',gap:8,borderRadius:9,backgroundColor:C.bg,padding:10},
 name:{fontSize:12,lineHeight:18,fontWeight:'900',color:C.ink,flexShrink:1},
 waiting:{fontSize:11,lineHeight:18,color:C.gold},
 warning:{fontSize:11,lineHeight:18,color:C.red},
 impact:{backgroundColor:C.raised,borderRadius:10,padding:10,gap:9},
 pills:{flexDirection:'row',flexWrap:'wrap',gap:6},
 pill:{fontSize:10,fontWeight:'800',color:C.mint,padding:7,borderRadius:7,backgroundColor:C.bg},
 choices:{gap:8},
 choice:{padding:11,minHeight:49,borderRadius:9,borderWidth:1,borderColor:'#779B90',backgroundColor:C.raised,gap:5},
 choiceName:{fontSize:12,fontWeight:'900',lineHeight:18,color:C.ink},
 disabled:{opacity:.4},archiveRow:{gap:6,paddingTop:9,borderTopWidth:1,borderTopColor:C.line}
});
