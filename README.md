# Lifely

An original, offline, choice-driven life simulator. This repository is the **0.4.0 playable development version**, not an App Store-ready or feature-parity release.

## Play and build
Use Node 22.13+ and npm. Install dependencies, align the Expo versions and run the tests:
```sh
npm install
npx expo install --fix
npm test
npx expo-doctor
npm run android
```
On macOS with Xcode, use `npm run ios`. To run in a browser, `npm run web`. Local native builds do not consume EAS cloud build credits. Android needs Android Studio, SDK and JDK; iOS needs signing before TestFlight. No cloud services or secrets are required for the game.

## Implemented
- Character name, six fictionalized country economies, three starting backgrounds and personal goals.
- 308 original event cards (686 choices), including 20 optional two-stage story threads and 12 branching skill-dependent journeys; age-gated and context-gated selection, deterministic random state and recent-event suppression.
- School clubs, animal companions, a creator audience with royalties, four business sectors, country relocation and a changing economic climate.
- Three trainable skill categories, health conditions and medical support.
- 30 careers, four education levels, promotion and job loss; business ownership, retirement and pension.
- Household costs, tax, debt and interest, investments, property, rent, asset sales and annual statements.
- Individual family and friend bonds, memory logs, partner, marriage, separation, children, aging and death.
- Continue as a living child at their current age with a simplified estate inheritance; achievement and ancestor summaries.
- Original app icon and Android adaptive icon, mobile safe-area aware UI, five tabs, decision gates, three independent local save slots, ordered writes, previous-save recovery and explicit new-life flow.

- Context-weighted scenario selection, persistent scenario statistics, three-way decisions, visible actual stat changes, personality traits, eight lifetime challenges, fictional civil/legal consequences, household budgets and education funding.

## Verification
The expanded engine was also exercised on 1,000 complete lives with 93,291 choices, 17,156 delayed story follow-ups, 2,217 medical actions and 13,000 skill actions. The core engine was exercised in the authoring runtime on 1,000 seeded complete lives, 92,587 choices, plus deterministic replay, accounting, inheritance and invalid-action checks. The committed Node test suite reproduces those checks. Earlier GitHub Actions commits passed dependency installation, Expo dependency alignment and Android/iOS/web bundle export. A browser end-to-end test for age progression, saving and switching slots is now included in CI; check its actual status under Actions. Device tests, signing and store submission have not been performed. The prior Life Chapters save format is not imported; this is a fresh Lifely schema.

## Release gates
- Expand original event catalog and long-lived narrative chains; add more job-specific mechanics, school clubs, health conditions, location differences, business depth and diverse household scenarios.
- Balance salary/cost progression, education accessibility and estate mechanics; current country data is fictional, displayed in USD equivalents.
- Add portable save export/import, accessibility testing, native launch screen, sound and optional haptics.
- Run npm install and lock dependencies, run expo-doctor and native exports, play-test small/large phones and tablets, fix failures and verify signed releases.
- Complete content review, privacy policy, app age rating, app name/trademark clearance, store metadata and screenshots. Monetization is intentionally not implemented.
- Do not market as superior to BitLife until user testing supports that claim.

All game events are original. No BitLife code, branding or assets are included.

Latest scenario QA: 1,000 seeded policy-assisted lifetimes, 89607 decisions, 230/230 distinct cards observed, 2.63% repeated decisions, 10632 third-option choices. These figures describe automated simulation, not human enjoyment or comparative market quality. Browser CI is pinned to Ubuntu 24.04 to address the previous Playwright installation error.

Branching journeys now have preparation, a skill-dependent trial and distinct success/setback cards. Trial odds are displayed and match the pre-choice state. Four 250-life automated strategies observed 278/278 event cards; see docs/SCENARIO_QA.md. These are simulation metrics, not ratings of entertainment value.

## 0.3.0: Living World, Special Careers and Life Sagas

Ten special careers with profession-specific outcomes, five ranks each, preparation, estimated success odds, salaries, contracts and other career-specific records. Independently evolving NPCs have education, ambitions, personalities, jobs, savings, debts, promotion, unemployment, trust and rivalry; financial support transfers actual funds. Six character-linked sagas have four chapters and alternate endings, with six to eight years of scheduled progression (delays possible when other events are pending). Existing version-2 saves and event IDs are retained; missing profile fields initialize on interaction or aging. The game remains fictional, offline and single-player. Special careers use a shared action/odds framework with specialized outcomes, not ten separate fully developed mini-games. No native signed build or comparative human playtest has been completed.

## 0.4.0 content expansion

1,000 scenario records (308 existing and 692 activity variants from 173 original premises in 14 categories), 2,762 decision options, 150 regular careers, ten special careers, 100 achievement definitions and 50 challenge definitions. This is not a claim of 1,000 individually hand-written stories. Variant prompts are distinct, but shared structures remain visible. The new modules are in `src/content/`; append order is a save compatibility contract. The job board has search and progressive loading. Bank savings, financial literacy, job experience, industry-specific training, company hiring, product launches, marketing, payroll and competition affect the actual simulation. The initial 200-life simulation covered 912/1,000 cards across 17,507 decisions, not all cards in natural gameplay. No signed build or comparative human playtest is claimed.

## 0.5.0 — collection and interactive systems

1,036 scenarios (36 additional independently authored dramatic cards) and 2,870 decision options. Fictional legal hearings, custody, probation and rehabilitation; five additional investment holdings with distinct simulated volatility and distributions; three rental asset types with tenants, rent levels and maintenance. Three five-round career mini-games (pattern, memory, judgment) with persistent round state and skill rewards. A local cross-slot player collection retains global achievements, challenges, best records and twenty collectible life endings. This is a simplified fictional justice and finance model, not professional guidance. Device testing and comparative playtesting remain outstanding.

## 0.6.0 — interconnected world and replayability

Six connected systems are playable in the World hub: entertainment (three paths, releases, contracts and fame), sports (four disciplines, youth clubs, competitions and contracts), fictional civic politics (elections, terms and policy), fictional royalty (selectable royal origin, courtship, duties and succession), travel (18 city destinations across the existing six countries), and family dynasty (preferred heirs, mentoring, trust assets and inheritance). Their annual finances and world chronicle interact with the existing life simulation. 48 additional individually authored world scenarios are appended after existing IDs for 1,084 distinct prompts and 3,014 options. There are now 124 achievements, 62 challenges and 32 ribbons. Old version-2 saves acquire missing systems lazily. These are fictional simplified mechanics, not a representation of real political processes, salaries or royal laws. No signed builds or human competitor comparison are claimed.

### 0.6.0 refinements

Creative tracks now have genuinely different preparation and financial rewards: actor coaching and auditions, musician albums and live tours, and director casting and film premieres. Sporting competition depends partly on discipline-specific skills. Destinations yield thematic learning rather than identical bonuses. Winning public office ends a regular full-time job. Naming a preferred heir now affects crown succession and estate distribution, while the unselected preferred sibling retains their allocated share. Existing lives with no nominated heir retain their previous inheritance behavior.

## 0.7.0 — Recurring characters, agents and cross-generation drama

Adds ten persistent named NPCs (four sport competitors, three fictional political rivals and three entertainment agents), agency commissions and deal economics, meaningful family tension and reconciliation, and four multi-generational storylines with four decisions each. Includes 25 individually authored character scenes with named participants. Current catalog: 1,109 scenario prompts, 3,089 options, 150 regular and ten special careers, 124 achievements, 62 challenges and 32 ribbons. The World and People screens display the people and storylines. Existing saves stay local and compatible. Not yet a signed/tested physical-device build.

Additional polish: four story archetypes now have 16 bespoke chapter descriptions, and heirs see the inherited hand-off. Competitor generations rotate without losing the family's historical rival archives.

Quality refinements: names are unique within each NPC cast; agent networks affect standard releases and take recorded commissions; political rivals influence ordinary election outcomes as well as debates.

## 0.8.0 — branching dialogue, independent social networks and small-screen UX

Six original themes, three authored choice rounds per NPC conversation, deterministic backstories and memories, and autonomous relationships between people that can grow into friendships, alliances, estrangement or betrayal. People shows each contact's history and a living social network; World exposes conversations with professional rivals and agents. Phone widths below 390px use a readable two-row tab bar and single-column NPC cards. Existing version-2 saves remain compatible. Tests cover dialogue state, annual network evolution, save reload and browser phone viewports. Physical device testing is still pending.

Social-network consequences now feed into NPC wellbeing and professional records. New family contacts avoid same-name collisions, while existing saves retain their original names.
