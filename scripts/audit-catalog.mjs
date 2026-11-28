import E from '../src/engine.mjs';
import {scenarioGroups} from '../src/content/scenarios.mjs';
import {arcadeGames} from '../src/content/playable-arcade.mjs';
import {dramas} from '../src/content/dramatic-stories.mjs';
import {branchingDramas} from '../src/content/branching-dramas.mjs';
import {specialistTracks} from '../src/content/specialist-circuit.mjs';
import {dynastyGoals} from '../src/content/replayability.mjs';
export function catalogAudit(){
 const s=E.createLife({seed:16901});
 const scenarios=E.events,achievements=E.achievementStatus(s),challenges=E.challengeProgress(s),premises=scenarioGroups.reduce((n,g)=>n+g.items.length,0);
 const duplicate=(xs,key)=>{const seen=new Set(),repeated=new Set();for(const x of xs){const k=key(x);if(seen.has(k))repeated.add(k);seen.add(k);}return [...repeated];};
 return {counts:{scenarioCards:scenarios.length,scenarioChoices:scenarios.reduce((n,e)=>n+e.choices.length,0),generatedPremises:premises,generatedVariants:premises*4,otherScenarioCards:scenarios.length-premises*4,regularCareers:E.careers.length,specialCareers:E.professions.length,achievements:achievements.length,challenges:challenges.length,ribbons:E.ribbons.length,arcadeGames:arcadeGames.length,dramaticStoryTemplates:dramas.length+branchingDramas.length,dramaticChapters:dramas.reduce((n,d)=>n+d.chapters.length,0),branchingStoryScenes:branchingDramas.reduce((n,d)=>n+Object.keys(d.nodes).length,0),specialistCircuits:specialistTracks.length,dynastyChallenges:dynastyGoals.length,hiddenDiscoveries:E.replayView(s).secrets.length},duplicateIds:{scenarios:duplicate(scenarios,e=>e.id),careers:duplicate(E.careers,c=>c.id),professions:duplicate(E.professions,p=>p.id),achievements:duplicate(achievements,a=>a.name),challenges:duplicate(challenges,c=>c.id),ribbons:duplicate(E.ribbons,r=>r.id)},invalidScenarios:scenarios.filter(e=>!Number.isInteger(e.id)||!e.title||typeof e.prompt!=='string'||!e.choices?.length||e.choices.some(c=>typeof c.text!=='string')).map(e=>e.id)};
}
if(process.argv[1]&&process.argv[1].endsWith('audit-catalog.mjs'))console.log(JSON.stringify(catalogAudit(),null,2));
