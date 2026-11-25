// Lifely fictional living-world systems. Compatible with version-2 save records.
// All game values are deliberately fictional; no real politics, royals or financial offers.
export const domains=[
  {id:'entertainment',icon:'✦',name:'Entertainment',description:'Releases, contracts, fame and awards'},
  {id:'sports',icon:'⚑',name:'Sports',description:'Training, competitive seasons and injuries'},
  {id:'politics',icon:'◈',name:'Politics',description:'Campaigns, elected terms and public approval'},
  {id:'royalty',icon:'♛',name:'Royalty',description:'Court life, public duty and succession'},
  {id:'travel',icon:'✈',name:'Travel',description:'18 destinations, memories and culture'},
  {id:'dynasty',icon:'❖',name:'Family dynasty',description:'Heirs, mentorship and inherited legacy'}
];
export const destinations=[
  {id:'newyork',name:'New York',country:0,theme:'Arts and commerce',cost:1.5},
  {id:'sanfrancisco',name:'San Francisco',country:0,theme:'Innovation and culture',cost:1.7},
  {id:'seattle',name:'Seattle',country:0,theme:'Nature and technology',cost:1.2},
  {id:'jakarta',name:'Jakarta',country:1,theme:'City life and food',cost:.7},
  {id:'yogyakarta',name:'Yogyakarta',country:1,theme:'Heritage and arts',cost:.6},
  {id:'bali',name:'Bali',country:1,theme:'Coast and local culture',cost:1.1},
  {id:'tokyo',name:'Tokyo',country:2,theme:'Modern art and design',cost:1.4},
  {id:'kyoto',name:'Kyoto',country:2,theme:'Traditional crafts',cost:1.2},
  {id:'osaka',name:'Osaka',country:2,theme:'Food and nightlife',cost:1.1},
  {id:'toronto',name:'Toronto',country:3,theme:'Multicultural city',cost:1.2},
  {id:'vancouver',name:'Vancouver',country:3,theme:'Coastal environment',cost:1.4},
  {id:'montreal',name:'Montreal',country:3,theme:'Languages and art',cost:1.1},
  {id:'london',name:'London',country:4,theme:'Museums and theater',cost:1.4},
  {id:'edinburgh',name:'Edinburgh',country:4,theme:'History and literature',cost:1.1},
  {id:'bath',name:'Bath',country:4,theme:'Architecture and heritage',cost:1},
  {id:'sydney',name:'Sydney',country:5,theme:'Harbor and performing arts',cost:1.4},
  {id:'melbourne',name:'Melbourne',country:5,theme:'Design and community',cost:1.2},
  {id:'brisbane',name:'Brisbane',country:5,theme:'Outdoor culture',cost:1.1}
];
export const sports=['Football','Basketball','Tennis','Track and field'];
export const entertainmentPaths=['Film actor','Recording musician','Film director'];
export const policies=[
  {id:'schools',name:'Fund public schools',stat:'knowledge',cost:2400},
  {id:'parks',name:'Improve community parks',stat:'health',cost:1400},
  {id:'housing',name:'Support affordable housing',stat:'kindness',cost:2200},
  {id:'arts',name:'Fund local arts',stat:'creativity',cost:1600}
];
export function initialWorld(country=0,noble=false){
 return {
  entertainment:{path:null,fame:0,releases:0,awards:0,contracts:0,catalog:0,lastResult:'',deals:0},
  sports:{sport:null,form:40,wins:0,losses:0,rank:0,injury:0,seasons:0,contractYears:0,trophies:0},
  politics:{party:null,office:null,approval:45,term:0,elections:0,wins:0,campaignFunds:0,lastElectionAge:-1,policies:[],scandals:0},
  royalty:{house:noble?'House of Alder':null,title:noble?'Royal heir':null,support:noble?65:40,duties:0,years:0,courtVisits:0,successions:0},
  travel:{visitedCountries:[country],stamps:[],trips:[],culture:0,passport:0,lastTripAge:-1},
  dynasty:{trustFund:0,reputation:50,mentored:[],heirId:null,archives:0,ancestors:[],familyNews:[]},
  news:[]
 };
}
export function viewWorld(s){return s.world||initialWorld(s.country);}
export function ensureWorld(s){if(!s.world)s.world=initialWorld(s.country);return s.world;}
export function worldAssets(s){return Math.max(0,s.world?.dynasty?.trustFund||0);}
export function worldStatus(s){
 const w=viewWorld(s);
 return [
  {id:'entertainment',value:w.entertainment.path||'Not started',score:w.entertainment.fame,metric:'Fame'},
  {id:'sports',value:w.sports.sport||'Not started',score:w.sports.form,metric:'Form'},
  {id:'politics',value:w.politics.office||w.politics.party||'Not started',score:w.politics.approval,metric:'Approval'},
  {id:'royalty',value:w.royalty.title||'No title',score:w.royalty.support,metric:'Public support'},
  {id:'travel',value:w.travel.stamps.length+' destinations',score:Math.min(100,w.travel.culture),metric:'Cultural knowledge'},
  {id:'dynasty',value:w.dynasty.ancestors.length+' ancestors',score:w.dynasty.reputation,metric:'Family standing'}
 ];
}
export function domainReady(s,domain){
 const w=viewWorld(s);
 return domain==='entertainment'?!!w.entertainment.path:domain==='sports'?!!w.sports.sport:domain==='politics'?!!w.politics.party:domain==='royalty'?!!w.royalty.title:domain==='travel'?w.travel.trips.length>0:domain==='dynasty'?s.people.some(p=>p.alive&&p.role==='child'):false;
}
export function applyWorldEffect(s,k,v,ctx){
 const w=ensureWorld(s);
 const routes={fame:['entertainment','fame'],sportForm:['sports','form'],publicApproval:['politics','approval'],royalSupport:['royalty','support'],culture:['travel','culture'],familyStanding:['dynasty','reputation']};
 const route=routes[k];if(!route)return false;
 const [group,prop]=route;w[group][prop]=ctx.clamp(w[group][prop]+v);return true;
}
function news(s,text,ctx,domain='world'){
 const w=ensureWorld(s);
 w.news.push({age:s.age,text,domain});if(w.news.length>32)w.news.shift();
 ctx.add(s,text,'world');
}
function affordable(s,cost){return s.cash>=cost;}
export function worldCommands(s,ctx){
 if(!s.alive||s.pending!==null||s.mini||(s.justice?.years||0)>0)return [];
 const w=viewWorld(s),out=[],a=s.actions>0,c=ctx.country(s),adult=s.age>=18,free=!(s.justice?.case);
 const put=(id,label,detail,enabled=true)=>out.push({id,label,detail,enabled:!!enabled&&a});
 const e=w.entertainment,t=w.sports,p=w.politics,r=w.royalty,v=w.travel,d=w.dynasty;
 if(adult&&free){
   if(!e.path&&s.stats.creativity>=50)for(const path of entertainmentPaths)put('world:ent:start:'+entertainmentPaths.indexOf(path),'Enter '+path+' career','Create a project path · $1,000',affordable(s,1000));
   if(e.path){
     put('world:ent:rehearse','Rehearse and build a portfolio','Creativity, reputation and confidence');
     put('world:ent:release',e.path==='Recording musician'?'Release an album':e.path==='Film director'?'Premiere an original film':'Audition for a leading role','$1,200 · skill-based chance of success',affordable(s,1200));
     put('world:ent:deal','Negotiate a media contract','Requires 2 successful releases · once per year',e.releases>=2&&e.lastDealAge!==s.age);
     put('world:ent:promote','Launch a publicity campaign','$500 · more fame, some public risk',affordable(s,500));
     put('world:ent:leave','Leave entertainment career','Your records and royalties remain');
   }
   if(!t.sport&&s.age<=42&&s.stats.health>=55)for(let i=0;i<sports.length;i++)put('world:sport:start:'+i,'Join '+sports[i],'Begin amateur competition · $300',affordable(s,300));
   if(t.sport){
     put('world:sport:train','Train for competition','Improve form · increase health and fatigue',t.injury===0);
     put('world:sport:compete','Enter a tournament','Prize money, promotion and injury risk',t.injury===0);
     put('world:sport:contract','Negotiate a team contract','Requires 3 wins, form 65 and no active contract',t.wins>=3&&t.form>=65&&t.contractYears===0);
     put('world:sport:recover','Rest and recover','Manage injury and stress');
     put('world:sport:retire','Retire from sport','Preserve your trophies and win record');
   }
   if(!p.party&&s.age>=25&&s.stats.reputation>=48)put('world:pol:join','Join a fictional civic party','Begin a public-service career');
   if(p.party){
     put('world:pol:townhall','Hold a community town hall','Build approval and trust');
     put('world:pol:fundraise','Fundraise for a campaign','Requires $500 in outreach expenses',affordable(s,500));
     put('world:pol:election','Run for public office','Requires $1,500 raised · 4-year term · once per year',s.age>=25&&p.term===0&&p.campaignFunds>=1500&&p.lastElectionAge!==s.age);
     if(p.office&&p.term>0){
       put('world:pol:policy','Present next public policy','Uses campaign resources · affects community and approval',p.campaignFunds>=500);
       put('world:pol:report','Publish an accountability report','Increase trust; disclose results');
     }
     put('world:pol:exit','Leave political work','Retain your political record');
   }
   if(!r.title&&!s.people.some(x=>x.alive&&x.role==='partner')&&s.stats.reputation>=65&&s.age>=20)put('world:royal:court','Attend a royal court event','Chance to meet a fictional royal partner · $1,800',affordable(s,1800));
   const partner=s.people.find(x=>x.alive&&x.role==='partner');
   if(!r.title&&partner?.world?.royal&&partner.bond>=78)put('world:royal:marry','Marry into the royal house','Become a royal consort · public duties follow');
   if(r.title){
     put('world:royal:duty','Perform royal public duties','Improve public support and family standing');
     put('world:royal:charity','Host a charity event','Contribute $1,000 toward a fictional local cause',affordable(s,1000));
     if(r.title==='Royal heir'&&s.age>=30&&r.support>=78&&r.duties>=5)put('world:royal:succession','Accept succession to the crown','Become reigning monarch · ongoing duties');
     put('world:royal:renounce','Renounce royal title','Step down, keeping your memories');
   }
   for(const destination of destinations)if(v.lastTripAge!==s.age){
     const cost=Math.round((destination.country===s.country?550:1550)*destination.cost*c.cost);
     put('world:travel:visit:'+destination.id,'Visit '+destination.name,'$'+cost.toLocaleString('en-US')+' · '+destination.theme,affordable(s,cost));
   }
   if(v.stamps.length>=3&&v.passport<3)put('world:travel:passport','Complete a travel journal','Improve passport experience · once per year',v.lastJournalAge!==s.age);
   put('world:dynasty:archive','Record your family history','Preserve family standing and intergenerational memories',s.people.some(x=>x.alive&&x.role==='parent'||x.role==='child'));
   if(s.cash>=2000)put('world:dynasty:fund','Contribute $2,000 to family trust','Transfers cash into inherited family assets',true);
   if(d.trustFund>=2000)for(const child of s.people.filter(x=>x.alive&&x.role==='child'&&x.age>=6))put('world:dynasty:grant:'+child.id,'Give scholarship to '+child.name,'Transfer $2,000 from family trust to child',true);
   for(const child of s.people.filter(x=>x.alive&&x.role==='child')){
     put('world:dynasty:mentor:'+child.id,'Mentor '+child.name,'Develop their actual skills, education and trust');
     if(d.heirId!==child.id)put('world:dynasty:heir:'+child.id,'Name '+child.name+' preferred heir','Record a family succession preference');
   }
 }
 return out;
}
export function worldAct(s,id,ctx){
 const [prefix,domain,verb,arg]=id.split(':');if(prefix!=='world')throw Error('Unknown world action.');
 const w=ensureWorld(s),c=ctx.country(s),cash=ctx.spend,cl=ctx.clamp,change=ctx.change,rng=ctx.rng;
 const e=w.entertainment,t=w.sports,p=w.politics,r=w.royalty,v=w.travel,d=w.dynasty;const announce=message=>news(s,message,ctx);
 if(domain==='ent'){
  if(verb==='start'){cash(s,1000);e.path=entertainmentPaths[Number(arg)];e.fame=15;change(s,'confidence',5);announce('You entered '+e.path+' entertainment.');}
  else if(verb==='rehearse'){change(s,'creativity',6);change(s,'confidence',4);change(s,'stress',4);e.fame=cl(e.fame+3);}
  else if(verb==='release'){cash(s,1200);const chance=Math.min(.9,.18+s.stats.creativity*.004+(s.skills.art||0)*.002+e.fame*.002);const won=rng(s)<chance;
   if(won){e.releases++;e.catalog++;e.fame=cl(e.fame+13);e.awards+=rng(s)<.22?1:0;s.audience=(s.audience||0)+Math.round(450*(1+e.fame/30));change(s,'reputation',6);s.cash+=Math.round(1600*c.salary*(1+e.releases*.2));}
   else{e.fame=cl(e.fame-4);change(s,'stress',7);}
   e.lastResult=won?'Critical acclaim':'A disappointing opening';announce(e.path+' project: '+e.lastResult+'.');}
  else if(verb==='deal'){e.contracts++;e.deals++;e.lastDealAge=s.age;s.cash+=Math.round(4000*c.salary*(1+e.fame/80));change(s,'reputation',4);announce('Signed an entertainment contract.');}
  else if(verb==='promote'){cash(s,500);e.fame=cl(e.fame+8);change(s,'stress',3);if(rng(s)<.15)change(s,'reputation',-5);}
  else if(verb==='leave'){e.path=null;announce('Stepped away from active entertainment work.');}
  else throw Error('Unknown entertainment activity.');
 }else if(domain==='sport'){
  if(verb==='start'){cash(s,300);t.sport=sports[Number(arg)];t.form=45;announce('Joined '+t.sport+' competitive sport.');}
  else if(verb==='train'){t.form=cl(t.form+11);change(s,'health',3);change(s,'stress',5);}
  else if(verb==='compete'){t.seasons++;const chance=Math.max(.1,Math.min(.9,.12+t.form*.006+s.stats.health*.002+(s.stats.confidence||0)*.001-(t.injury||0)*.12));const won=rng(s)<chance;
    if(won){t.wins++;t.form=cl(t.form+5);change(s,'reputation',5);s.cash+=Math.round((600+t.rank*450)*c.salary);if(t.wins>=3*(t.rank+1)&&t.rank<4){t.rank++;t.trophies++;announce('Won a '+t.sport+' championship and advanced a competition tier.');}}
    else{t.losses++;t.form=cl(t.form-7);change(s,'stress',4);}
    if(rng(s)<.08+(t.form>80?.04:0)){t.injury=2;change(s,'health',-6);announce('Sustained a minor sporting injury.');}
    if(w.entertainment.path&&won)w.entertainment.fame=cl(w.entertainment.fame+3);}
  else if(verb==='contract'){t.contractYears=3;change(s,'confidence',8);announce('Agreed a three-year '+t.sport+' contract.');}
  else if(verb==='recover'){t.injury=Math.max(0,t.injury-1);t.form=cl(t.form+3);change(s,'stress',-9);change(s,'health',4);}
  else if(verb==='retire'){t.sport=null;t.contractYears=0;announce('Retired from active competitive sport.');}
  else throw Error('Unknown sports activity.');
 }else if(domain==='pol'){
  if(verb==='join'){p.party='Civic Renewal';p.approval=cl(Math.max(p.approval,s.stats.reputation-10));announce('Joined a fictional civic political party.');}
  else if(verb==='townhall'){p.approval=cl(p.approval+7);change(s,'social',4);change(s,'reputation',3);if(w.travel.culture>=40)p.approval=cl(p.approval+2);}
  else if(verb==='fundraise'){cash(s,500);p.campaignFunds+=1000+Math.round(rng(s)*950);change(s,'stress',4);}
  else if(verb==='election'){p.elections++;p.lastElectionAge=s.age;p.campaignFunds-=1500;const chance=Math.max(.12,Math.min(.88,.08+p.approval*.005+s.stats.reputation*.002+s.stats.social*.001+(w.entertainment.fame||0)*.0005-(s.record||0)*.06));if(rng(s)<chance){p.wins++;p.office=p.wins>=3?'Regional executive':p.wins===2?'Representative':'Councillor';p.term=4;p.approval=cl(p.approval+8);announce('Won a fictional election: '+p.office+'.');}else{p.approval=cl(p.approval-7);announce('Lost a fictional election.');}}
  else if(verb==='policy'){const item=policies[p.policies.length%policies.length];p.campaignFunds-=500;p.policies.push({id:item.id,age:s.age});p.approval=cl(p.approval+5);change(s,item.stat,6);change(s,'reputation',3);announce('Announced civic policy: '+item.name+'.');}
  else if(verb==='report'){p.approval=cl(p.approval+6);change(s,'reputation',4);}
  else if(verb==='exit'){p.party=null;p.office=null;p.term=0;announce('Left active political work.');}
  else throw Error('Unknown political activity.');
 }else if(domain==='royal'){
  if(verb==='court'){cash(s,1800);r.courtVisits++;if(rng(s)<Math.min(.75,.16+s.stats.social*.005)){const partner=ctx.person(s,'partner',Math.max(18,s.age+Math.floor(rng(s)*5)-2));partner.world.royal=true;partner.bond=78;s.people.push(partner);announce('Met '+partner.name+', a member of a fictional royal house.');}else announce('Attended the court, but made no royal connection.');}
  else if(verb==='marry'){const partner=s.people.find(x=>x.alive&&x.role==='partner'&&x.world?.royal);partner.married=true;ctx.bond(s,partner,8,'Royal marriage');r.house='House of Alder';r.title='Royal consort';r.support=cl(r.support+14);announce('Married into a fictional royal house.');}
  else if(verb==='duty'){r.duties++;r.support=cl(r.support+8);d.reputation=cl(d.reputation+4);change(s,'reputation',4);change(s,'stress',3);}
  else if(verb==='charity'){cash(s,1000);r.support=cl(r.support+12);change(s,'kindness',8);d.reputation=cl(d.reputation+5);}
  else if(verb==='succession'){r.title='Monarch';r.successions++;r.support=cl(r.support+6);announce('Accepted the fictional royal succession.');}
  else if(verb==='renounce'){r.title=null;announce('Renounced royal status and official duties.');}
  else throw Error('Unknown royal activity.');
 }else if(domain==='travel'){
  if(verb==='visit'){const dest=destinations.find(x=>x.id===arg);if(!dest)throw Error('Invalid destination.');
    const cost=Math.round((dest.country===s.country?550:1550)*dest.cost*c.cost);cash(s,cost);v.lastTripAge=s.age;v.trips.push({age:s.age,id:dest.id,country:dest.country,theme:dest.theme});if(v.trips.length>90)v.trips.shift();if(!v.stamps.includes(dest.id))v.stamps.push(dest.id);if(!v.visitedCountries.includes(dest.country))v.visitedCountries.push(dest.country);
    v.culture=cl(v.culture+7);change(s,'knowledge',3);change(s,'happiness',5);change(s,'stress',-4);if(w.entertainment.path){w.entertainment.fame=cl(w.entertainment.fame+2);change(s,'creativity',3);}
    announce('Visited '+dest.name+' for '+dest.theme.toLowerCase()+'.');}
  else if(verb==='passport'){v.passport++;v.lastJournalAge=s.age;v.culture=cl(v.culture+7);change(s,'knowledge',4);announce('Completed a personal travel journal.');}
  else throw Error('Unknown travel activity.');
 }else if(domain==='dynasty'){
  if(verb==='archive'){d.archives++;d.reputation=cl(d.reputation+4);change(s,'knowledge',3);if(d.familyNews.length<25)d.familyNews.push({age:s.age,text:'Recorded a family memory'});}
  else if(verb==='fund'){cash(s,2000);d.trustFund+=2000;d.reputation=cl(d.reputation+2);}
  else if(verb==='mentor'){const child=s.people.find(x=>x.id===Number(arg)&&x.alive&&x.role==='child');if(!child)throw Error('Child unavailable.');child.world.talent=cl(child.world.talent+6);child.world.trust=cl(child.world.trust+6);ctx.bond(s,child,8,'Family mentoring');d.reputation=cl(d.reputation+2);if(!d.mentored.includes(child.id))d.mentored.push(child.id);}
  else if(verb==='heir'){d.heirId=Number(arg);d.reputation=cl(d.reputation+3);announce('Recorded a preferred heir in the family archive.');}
  else if(verb==='grant'){const child=s.people.find(x=>x.id===Number(arg)&&x.alive&&x.role==='child');if(!child)throw Error('Child unavailable.');d.trustFund-=2000;child.world.cash+=2000;ctx.bond(s,child,7,'Education grant');d.reputation=cl(d.reputation+3);}
  else throw Error('Unknown dynasty action.');
 }else throw Error('Unknown world domain.');
}
export function worldYear(s,ctx){
 const w=ensureWorld(s),e=w.entertainment,t=w.sports,p=w.politics,r=w.royalty,d=w.dynasty,c=ctx.country(s),rng=ctx.rng,cl=ctx.clamp;
 let income=0,trustInterest=0;
 if(e.path||e.releases){e.fame=cl(e.fame-(e.path?2:5));const royalty=Math.round(e.catalog*340*c.salary*(.5+e.fame/75));income+=royalty;if(e.path&&e.fame>=65&&rng(s)<.08){e.awards++;news(s,'Your latest creative work received industry recognition.',ctx,'entertainment');}}
 if(t.sport){t.form=cl(t.form-3);if(t.injury)t.injury--;if(t.contractYears){income+=Math.round((8000+t.rank*4000)*c.salary);t.contractYears--;}if(s.age>47){t.sport=null;t.contractYears=0;news(s,'Ended active sporting career after years of competition.',ctx,'sports');}}
 if(p.party){p.approval=cl(p.approval-1+(s.stats.reputation>75?2:0)-(s.record?1:0));if(p.term){income+=Math.round(34000*c.salary);p.term--;if(!p.term){p.office=null;news(s,'Your fictional term in office ended.',ctx,'politics');}}if(p.office&&w.entertainment.fame>=65)p.approval=cl(p.approval+1);}
 if(r.title){r.years++;r.support=cl(r.support-2+(d.reputation>=75?1:0));income+=Math.round((r.title==='Monarch'?15000:4500)*c.salary);if(s.record)r.support=cl(r.support-3);}
 if(d.trustFund){trustInterest=Math.round(d.trustFund*.015);d.trustFund+=trustInterest;}
 if(d.mentored.length>=2&&s.age%5===0)d.reputation=cl(d.reputation+2);
 // Yearly world chronicle: connected developments, not independent randomized rewards.
 if(s.age>=18&&rng(s)<.08){
  const options=[];
  if(e.path)options.push(['A local festival highlighted independent creative work.',()=>{e.fame=cl(e.fame+2);ctx.change(s,'creativity',2);}]);
  if(t.sport)options.push(['Your club faced a tougher competitive season.',()=>{t.form=cl(t.form-3);ctx.change(s,'stress',2);}]);
  if(p.party)options.push(['Public debate sharpened ahead of the next civic meeting.',()=>{p.approval=cl(p.approval-2);ctx.change(s,'knowledge',2);}]);
  if(r.title)options.push(['A royal community initiative drew local attention.',()=>{r.support=cl(r.support+2);d.reputation=cl(d.reputation+2);}]);
  if(w.travel.trips.length)options.push(['A friend from your travels sent news from abroad.',()=>{ctx.change(s,'happiness',2);w.travel.culture=cl(w.travel.culture+1);}]);
  if(options.length){const item=options[Math.floor(rng(s)*options.length)];item[1]();news(s,item[0],ctx,'chronicle');}
 }
 return {income,trustInterest};
}
export function inheritWorld(next,previous,child){
 const old=viewWorld(previous),nw=initialWorld(previous.country);nw.dynasty.ancestors=[...(old.dynasty.ancestors||[]),{name:previous.name,age:previous.age,year:previous.generation}].slice(-40);
 nw.dynasty.reputation=Math.min(100,Math.round(old.dynasty.reputation*.88)+5);nw.dynasty.archives=old.dynasty.archives; nw.dynasty.familyNews=(old.dynasty.familyNews||[]).slice(-20);
 nw.dynasty.mentored=[];nw.dynasty.heirId=null;nw.dynasty.trustFund=0; // trust assets are already included in estate cash
 nw.travel.visitedCountries=[next.country];nw.travel.culture=Math.round(old.travel.culture*.45);
 if(old.royalty.title&&child?.role==='child'){nw.royalty.house=old.royalty.house;nw.royalty.title='Royal heir';nw.royalty.support=Math.max(45,old.royalty.support-15);}
 next.world=nw;
 return next;
}
