import {test,expect} from '@playwright/test';
import E from '../src/engine.mjs';
import {npcFamilyYear} from '../src/content/dynamic-npc-families.mjs';
test('continuing society and interactive genealogy remain visible at 320px after reload',async({page})=>{
 let s=E.createLife({seed:154101});s.age=55;s.cash=10000;s.actions=3;
 const person=(s,role,age)=>({id:s.nextId++,name:'Relative '+s.nextId,role,age,bond:65,alive:true,memories:[],world:{...structuredClone(s.people[0].world),job:null,cash:0,debt:0,news:[]}});
 const heir=person(s,'child',28);s.people.push(heir);
 const ctx={country:v=>E.countries[v.country],careers:E.careers,add:()=>{},npcNews:()=>{},person,roll:(id,tag)=>tag==='marriage'||tag==='child'?0:.99};
 npcFamilyYear(s,ctx);s.age+=3;npcFamilyYear(s,ctx);const child=s.people.find(p=>p.id===s.npcFamilies.unions[0].children[0]);s.alive=false;s=E.legacy(s,heir.id);
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.evaluate(v=>localStorage.setItem('lifely.save.v2',JSON.stringify(v)),s);await page.reload();await page.getByRole('tab',{name:'People'}).click();
 await expect(page.getByTestId('society-world-year')).toContainText('WORLD YEAR 58');await expect(page.getByTestId('society-world-year')).toContainText('CONTINUING SOCIETY');
 await page.getByTestId('extended-family-toggle').click();const tree=page.getByTestId('extended-family-tree');await tree.getByRole('button',{name:new RegExp('Child · '+child.name)}).click();await expect(page.getByTestId('extended-family-selection')).toContainText(child.name);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
 await page.reload();await page.getByRole('tab',{name:'People'}).click();await expect(page.getByTestId('society-world-year')).toContainText('WORLD YEAR 58');
});
