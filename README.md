# Lifely

An original, offline, choice-driven life simulator. The repository contains a **1.6.0 playable-hobby development candidate (build 16)**. This is not an App Store-ready or externally verified BitLife-parity release.

## 1.1.0 interactive career playfields (build 10 candidate)

Sports, film and business career projects now include playable visual boards integrated into the existing four-stage career campaigns. A tactical sports pitch reveals opponent gaps and tracks match goals and fatigue; film production uses a director's monitor, shot coverage and retakes; the business liveboard tracks demand signals, customer loyalty, projected orders and a trend chart. Each phase allows up to two optional actions, with deterministic results, progress feedback, and an impact on the existing outcome score. Project choices, cash spending, rival results, completed records and dynasty inheritance remain intact. The visual planning turns are free to prevent softlocks and cannot be farmed indefinitely. Career history records the interactive turns. Old saves with no playfield state remain loadable.

The new screens need human usability/playability testing and physical iOS/Android testing before release; synthetic tests alone cannot establish that the game is more entertaining than BitLife. The release build number is reserved but **no signed build or store release has been created**.

## 1.2.0 — visual debates, team-care simulations and living career consequences

- **Fictional civic debate:** a podium stage, on-screen rival, audience momentum, credible answers and community trust. Choose two responses per round; your choices affect the campaign's real rating and outcome.
- **Fictional medical case:** a four-stage team-coordination dashboard for record verification, informed consent, responsible escalation and documented follow-up. The simulation does not diagnose or instruct treatment.
- **Named NPC reactions:** rivals, agents and collaborators comment on decisions and remember positive and negative encounters. Existing rivalry, respect and trust statistics change with outcomes.
- **Five-year consequences:** completing any of the five career projects starts a three-chapter career story at ages +1, +3 and +5. Choices affect world stats, and later-year responses can improve or preserve relationships. Follow-up responses are optional and cost one yearly activity; unanswered invitations never block life progression.
- **Visual and sound polish:** compact animated feedback, reduced-motion support, three original offline WAV sound effects and a persisted sound on/off preference. Expo Audio uses the SDK 58-supported package; recording/background audio permissions are explicitly disabled.
- **Compatibility:** version-2 life saves remain loadable, including saves created before career campaigns and playfields existed; heir transitions preserve completed accomplishments but do not inherit an ancestor's active professional obligations.

All values and scenarios are fictionalized. No live election data, medical diagnoses or real-world clinical decisions are represented. New tests run through GitHub Actions, but signed device builds, accessibility audits, and independent human entertainment comparisons remain pending. See `docs/1.2.0_INTERACTIVE_CAREERS.md`.

## 1.3.0 — playable relationships, school life and courtrooms (build 12)

- **Relationship days:** Choose a parent, sibling, partner or friend and play three decisions with expressive avatar boards, trust/tension meters and a character-specific unexpected complication. Hidden priorities, player traits and seeded uncertainty can lead to different outcomes; meaningful choices alter actual bonds and NPC trust/rivalry.
- **School life:** Ages 6–18 may enter an original classroom experience once per year. Science fair, debate finals, arts showcase, sports day or community work are selected from the player's seeded life; the same named classmate returns with a memory of previous teamwork and conflict. School choices affect knowledge, confidence, personal skills, and sometimes the existing club experience.
- **Fictional courtroom:** A pending legal case can be played as a three-stage hearing with a case-file review, witness questions and a closing statement. Choice-based fictional preparation adjusts the existing court outcome simulation. Traditional consult-counsel and one-action hearing routes still work, and leaving the interactive hearing keeps the case pending. No real-world legal guidance is provided.
- **Unexpected follow-ups:** Relationship moments and school challenges can be remembered one or two years later; responding to a returned message changes the existing relationship, consumes one annual activity and never prevents aging. Character preferences and surprise events are varied deterministically per life.
- **Save integrity:** Old version-2 saves are unchanged; new optional fields are validated, serializable and inherited only as a family chronicle. A new generation does not inherit unfinished ancestor stories. Existing careers, medical/civic boards, and original all-local sound settings remain in place.
- **Offline UI polish:** 44+ point tap targets, three distinct graphical playfields, responsive panels, narrated *text* feedback, screen-reader descriptions, and original bundled UI sound effects with the existing sound toggle and reduced-motion support.

This is an **original playable development candidate**, not a verified BitLife competitor winner or signed App Store/Play Store build. See `docs/1.3.0_EVERYDAY_SCENES.md` for test and release gates.

## 1.4.0 — The world doesn't wait for you

- **Four-character student circles:** classroom projects now rotate through a roster of distinct classmates. Each carries their own trust, rivalry, preferences, career path and school memories, instead of repeatedly replacing one anonymous peer.
- **Lifelong alumni:** former classmates graduate with you at age 18 and remain available as named adult social contacts. They can be challenged, supported or recruited as collaborators. Adult friends also work with the existing three-stage dialogue network.
- **Autonomous friendships and breakups:** classmates develop friendships, professional or romantic partnerships, rivalries, estrangements and sometimes families independently. Their relationships evolve each year, including unexpected changes; they gain career milestones and sometimes relocate.
- **Three-chapter world opportunities:** former classmates and friends start original fictional story arcs about reunions, creative work, community projects, enterprises, competitions and mentorship. The story returns at simulated ages +1, +3 and +5. Each chapter gives three different actions. The outcomes affect existing stats, NPC trust, careers, business demand or social reputation. Ignoring the invitation never blocks ageing.
- **Living-world UI:** the People screen now includes a visually navigable alumni roster, connection statuses and an interactive, multiyear opportunity timeline. The Life screen surfaces ready story chapters, and the Work screen shows the full school cohort.
- **Continuity:** no new account or server; the game stays offline. Earlier version-2 saves continue to load. Future generations inherit a chronicle of important family and world history, not unfinished obligations or unrelated personal NPCs.

This is an **original development build**, not verified BitLife parity. Avoid representing generated relationship outcomes as real people or actual life predictions. A native signed release and physical-device accessibility/audio tests remain outstanding. See `docs/1.4.0_AUTONOMOUS_WORLD.md` for QA.

## 1.5.0 — Character stories that respond to you

The new **Life Director** is an original, offline social drama system designed to improve the ordinary years between career and financial milestones.

- **Eight individually written conflicts** about remembered promises, rumors, family expectations, workplace credit, loyalty, financial favors, mentoring and rivalries. Each has three distinct situations and nine authored response choices.
- **Actual cast and context:** Drama draws named parents, friends, former classmates and professional contacts from the active save; work, business, personality stats, existing NPC trust, rivalry and recent themes influence selection and outcomes.
- **Two-person social stages:** A new compact board displays the people involved, trust, clarity, tension, difficult decisions and individual reactions. The three rounds happen within one yearly activity, without artificial additional time or action costs.
- **Tradeoffs and evolving motivations:** Listening, investigating and taking bold action all have benefits and risks. Character responses adapt to earlier phases, current relationship pressure and a seeded world.
- **Consequences are real:** Depending on the conflict, decisions can change family bonds, character trust and rivalry, emotional wellbeing, job performance, professional success, business demand and reputation. A concluded story can generate a second, non-blocking effect two simulated years later.
- **Readable continuity:** The Life tab surfaces new invitations and approaching reminders; People keeps an outcome journal and progress summary. Stories are optional and expire gracefully rather than preventing the player from aging.
- **More reasons to replay:** New "Trusted mediator" and "Story of a lifetime" achievements reward long-term investment in people. Older version-2 saves remain valid; descendants inherit only concluded story history.

This is a **development candidate**. Success requires real-world playtesting, signed builds, accessibility/sound checks and release review; it is **not** a verified claim that Lifely is superior to BitLife. Full test and signoff details: `docs/1.5.0_CHARACTER_STORIES.md`.

## 1.6.0 — A fun ordinary year

- **Eight playable hobby circuits:** Chess, street basketball, open-mic music, cooking, dance, indie games, photography and community gardening. Each activity has three distinct, original tactical situations with three choices each. Visual cues make the decisions understandable; player skill and the right strategy outweigh random luck.
- **Competitions and skills:** Practice to develop mastery or compete against two recurring opponents per discipline. There are five amateur-to-legend league levels, independent opponent growth, remembered matches, streaks, championship points, trophies and bounded adult prize money.
- **Real life connections:** Supportive friends or family can attend sessions and grow closer through shared accomplishments. Music and sports affect relevant world systems; indie game development can help an existing business.
- **No treadmill:** One game costs one yearly action, the remaining three turns are free. Each discipline has a yearly cooldown and at most two sessions overall per year, so hobbies supplement other lives rather than dominate them.
- **Persistent design:** Old version-2 save games still work. You can leave a session without locking the game. Descendants keep family trophy history but develop their own skills and friendships.
- **World-quality benchmarks:** See `docs/COMPETITIVE_QUALITY_SCORECARD.md` for an honest measurement plan. Feature count does not certify that Lifely is more enjoyable than BitLife. Full QA: `docs/1.6.0_HOBBY_LEAGUES.md`.

## Lifely 1.9.0 — Family Dynasty Stories (build 19)

**Original family storylines with real, intergenerational consequences.** Twelve authored themes and 36 chapters make marriage, parenting, sibling bonds, elder care, reconciliation and family identity develop over years instead of resetting each age.

- Family chapters are driven by real named family members, distinct personality values and live bonds. Listening, collaborative planning and controlling responses cause different outcomes, trust, confidence, stress and sibling cooperation.
- Every story has three chapters across five simulated years. Player choices are optional; missed commitments, bereavements and relationship changes preserve a truthful interrupted or neglected record.
- The People screen displays family members’ personalities, child independence, trust, sibling rivalry and cooperation; the active three-choice story is surfaced prominently with accessible decision controls.
- Children’s autonomy, care and trust development become actual differences when continuing a subsequent lifetime as a child. Completed family memories, but never unfinished obligations, survive as records of earlier generations.
- The 12 distinct story types include two marital topics, independent partners, early parenting, school pressure, teenage independence, two sibling narratives, elder care, family business, rebuilding strained bonds and traditions.
- All state remains local and version-2-save compatible; no additional online services, ads or purchasing. Unit/browser checks cover story choices, age-gating, persistence, interruption, autonomy, legacy and 320px layouts.

**Release boundary:** This is a development candidate only. Human comparative playtesting, signed native builds, real-device QA and independent review are still required before any better-than-BitLife claim or public release.

See `docs/1.9.0_FAMILY_DYNASTIES.md` for acceptance tests and the next review targets.

## Lifely 1.8.0 — Workplace Sagas (build 18)

Fifteen decades of professional choices deserve a supporting cast. All 150 regular careers now share **12 individually authored industry storylines**, each with **3 chapters, 3 contrasting decisions per chapter, and 2 persistent colleagues**. The new Work tab shows evolving relationships, independently improving rivals, commitments, progress and outcomes.

- Decisions change actual professional standing, named coworkers' trust/rivalry, stress, reputation and future promotion chances. Standing also modifies annual salary by a capped modest amount.
- Optional sequel chapters return after two simulated years; an ignored story ages out. Changing career or leaving work interrupts an incompatible active commitment.
- Finishing earns small simulated rewards and job experience; completed professional memories appear in a child's inherited chronicle.
- The prior Personal Ambition scholar milestone now correctly reads technical skill instead of remaining stuck at zero.
- Local offline deterministic save state; older version-2 saves still validate. Unit tests cover every one of the 150 careers, varied outcomes, expiry, job switching, legacy, old saves; browser regression covers 320px and other phone widths.

**Pending:** real-world device QA and comparative human playtests. This release is a tested development candidate, not a claim of superiority or a signed public release. See docs/1.8.0_WORKPLACE_SAGAS.md.

## Lifely 1.7.0 — Personal Ambitions (build 17)

**Six-year personal ambitions** replace passive life-goal checklists with sixteen optional, individually authored campaigns. Choose a mission in the **Life** screen, see three objective milestones, and fulfill them using real simulated activities. This system connects the existing work, social, finance, hobby, travel, business, and entertainment features without forcing the player down any one path.

- The 16 ambitions are grouped around healthy habits, scholarship, friendships, community, hobbies, creativity, career progression, financial security, entrepreneurship, exploration, family, mediation, resilience, mentorship, championships, and a creative audience. Goals appear at appropriate ages and with real prerequisites (e.g., owning a business).
- Every campaign has three independently measurable milestones and a six-year deadline. Counts start **when the player commits**; achievements, money and hobby victories from earlier years do not count as new progress.
- After two years, an optional strategic turning point provides three different trade-offs: adopt a sustainable pace, invest a real $1,000 and accept stress for greater reward, or work with a trusted companion. Completing or missing a campaign has an actual, saved outcome.
- The responsive ambition board displays progress with accessible labels, recommended campaigns, and a concise personal chronicle. Ancestral achievements survive succession as family history without inheriting unfulfilled obligations.
- Data is local and deterministic. Older version-2 saves do not require conversion. Ambition histories and active milestones have bounded storage and validation.
- No in-app purchasing, server, external dependency, or release submission was added.

**Release boundary:** CI is not device QA. Before store submission, verify long-term engagement and reward balance through human playtests, old-save migrations on physical devices, sound/accessibility, and signed builds. Never claim Lifely exceeds BitLife from features alone.

See `docs/1.7.0_PERSONAL_AMBITIONS.md` for QA and a comparative quality rubric.

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

## 0.9.0 — The choices you made return later

Introduces an original **Ripple Engine**: eight different themes of consequences, with 24 authored chapters and 72 authored choices. A decision in an existing event may begin a multiyear consequence thread with three playable stages, direct stat/financial/relationship effects, and fulfilled/complicated/neglected outcomes. Family commitments can be handed to descendants. A new Life-section dashboard makes it easy to follow delayed consequences; More includes a retrospective chronicle. The legacy scenario catalog remains 1,109 unique cards / 3,089 choices. This release changes playable story depth rather than inflating scenario counts. Existing saves remain version-2 compatible; tests include state, inheritance, replay, browser persistence, and phone viewport checks. No signing or EAS build was performed.

## 1.0.0 — Interactive professional lives

Five fully playable, four-stage career stories: **film productions, competitive sporting seasons, fictional civic elections, fictional medical teamwork, and customer-facing business launches**. Twenty original scenes with sixty decisions make skill, team loyalty, budgeting, risk and outreach matter. Outcomes integrate with the existing sports rivals, political approval, film agents/royalties, clinical career experience and company finances. The **Work** section includes an interactive stage-by-stage project screen and a persistent career portfolio. Original 1,109 scenario cards and 3,089 earlier scenario choices remain unchanged. Existing local saves stay compatible. No cloud EAS build or physical-device validation was performed.
