// Stable jump destinations for long tabs, independent of the current activity list.
const sections={
 Life:[['life-journal','Journal']],
 People:[['people-family','Family'],['people-transitions','Co-parenting'],['people-stories','Family stories']],
 Work:[['work-specialist','Career projects'],['work-education','Education & career'],['work-jobs','Job board']],
 World:[['world-neighborhood','Neighborhoods'],['world-cities','Cities'],['world-events','Public events'],['world-chronicle','World history']],
 Money:[['money-regions','Regional markets'],['money-investments','Investments'],['money-property','Properties'],['money-companies','Companies'],['money-overview','Overview'],['money-bank','Savings']],
 More:[['more-collection','Collection'],['more-challenges','Challenges'],['more-achievements','Achievements'],['more-settings','Save & settings']]
};
export function sectionLinks(tab,{adult=true,blocked=false}={}){
 return (sections[tab]||[]).filter(([id])=>!(!adult&&['people-family','work-specialist','world-neighborhood','money-regions','money-investments','money-property','money-companies'].includes(id))&&!(blocked&&['work-jobs','money-bank'].includes(id))).map(([id,label])=>({id,label}));
}
