import E from '../src/engine.mjs';
import {test,expect} from '@playwright/test';
test('create a life, resolve a year, restore and switch slots',async({page})=>{
 await page.goto('/');
 await page.getByRole('textbox',{name:'Character name'}).fill('Ada');
 await page.getByRole('button',{name:'Begin my life'}).click();
 await expect(page.getByText('Ada',{exact:true})).toBeVisible();
 await page.getByTestId('advance-year').click();
 const decision=page.getByTestId('life-decision');
 await expect(decision).toBeVisible();
 await decision.getByRole('button').first().click();
 await expect(decision).toHaveCount(0);
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.reload();
 await expect(page.getByText('Ada',{exact:true})).toBeVisible();
 await expect(page.getByTestId('advance-year')).toContainText('Age 2');
 await page.getByText('More',{exact:true}).click();
 await page.getByRole('button',{name:/Slot 2/}).click();
 await page.getByRole('textbox',{name:'Character name'}).fill('Ben');
 await page.getByRole('button',{name:'Begin my life'}).click();
 await expect(page.getByText('Ben',{exact:true})).toBeVisible();
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.getByText('More',{exact:true}).click();
 await page.getByRole('button',{name:/Slot 1/}).click();
 await expect(page.getByText('Ada',{exact:true})).toBeVisible();
 await expect(page.getByTestId('advance-year')).toContainText('Age 2');
});

test('special career and NPC world are accessible and persist',async({page})=>{
 let s=E.createLife({name:'Ari',seed:99});s.age=25;s.cash=100000;s.education=2;s.stats.health=90;
 await page.goto('/');
 await page.evaluate(save=>{localStorage.setItem('lifely.save.v2',JSON.stringify(save));localStorage.setItem('lifely.active.slot','1');},s);
 await page.reload();await expect(page.getByText('Ari',{exact:true})).toBeVisible();
 await page.getByText('Work',{exact:true}).click();
 await page.getByRole('button',{name:/Pursue Professional athlete/}).click();
 await expect(page.getByText('Rookie',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:/Train with coach/}).click();
 await expect(page.getByText('Preparation',{exact:true})).toBeVisible();
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.getByText('People',{exact:true}).click();
 await expect(page.getByText('Trust',{exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:/Offer financial help/}).first().click();
 await expect(page.getByText(/Received financial support/).first()).toBeVisible();
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.reload();await expect(page.getByText('Ari',{exact:true})).toBeVisible();
 await page.getByText('Work',{exact:true}).click();await expect(page.getByText('Rookie',{exact:true})).toBeVisible();
});
test('named saga shows its participant and survives a reload',async({page})=>{
 let s=E.createLife({name:'Mika',seed:44});s.age=25;s.cash=100000;s=E.act(s,'date');const p=s.people.find(x=>x.role==='partner');const e=E.events.find(x=>x.saga?.id==='partnership'&&x.saga.stage==='start');s.pending=e.id;s.pendingSagaPerson=p.id;
 await page.goto('/');await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),s);await page.reload();
 const decision=page.getByTestId('life-decision');await expect(decision).toContainText(p.name);
 await decision.getByRole('button').first().click();
 await expect(decision).toHaveCount(0);await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();
 await page.getByText('More',{exact:true}).click();
 await expect(page.getByText('A life built together',{exact:true})).toBeVisible();
 await page.reload();await page.getByText('More',{exact:true}).click();
 await expect(page.getByText('A life built together',{exact:true})).toBeVisible();
});

test('career challenge survives reload and player collection is available',async({page})=>{
 let s=E.createLife({name:'Lina',seed:121});s.age=30;s.cash=100000;s=E.act(s,'job:0');s=E.act(s,'mini:memory');
 await page.goto('/');await page.evaluate(save=>localStorage.setItem('lifely.save.v2',JSON.stringify(save)),s);await page.reload();
 const panel=page.getByTestId('career-challenge');await expect(panel).toBeVisible();
 await panel.getByRole('button',{name:'Ready — hide sequence'}).click();await expect(panel.getByText('Which sequence did you study?')).toBeVisible();
 await expect(page.getByText(/LOCAL LIFE/)).toBeVisible();await page.reload();await expect(panel.getByText('Which sequence did you study?')).toBeVisible();
 await panel.getByRole('button').first().click();await expect(panel).toContainText('ROUND 2/5');
 await panel.getByRole('button',{name:'Abandon challenge'}).click();await expect(panel).toHaveCount(0);
 await page.getByText('More',{exact:true}).click();await expect(page.getByText('Player collection',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Show all ribbons'}).click();await expect(page.getByText(/Everyday Legacy/)).toBeVisible();
});
