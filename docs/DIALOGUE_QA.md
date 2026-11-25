# Lifely 0.8.0 — dialogue & social network QA

## Gameplay added
- Six original dialogue topics, each with three conversational rounds and three distinct responses per round. NPCs react to previous responses. Outcomes affect bond, trust, confidence, kindness, joy and memories. Conversations can be abandoned but remain limited to one per person per year.
- Individual deterministic NPC histories, motivations and privately shared memories. Personal history reveal occurs after a two-round conversation and survives local reload.
- Independent NPC-to-NPC social network with named edges, trust, loyalty, affinities, alliances, friendships, estrangement and betrayal. Relationships evolve on year advancement even when no conversations occur. Network news and ties are displayed in People.
- Save migration: existing version-2 saves load without a network; profiles and edges are initialized safely. Surviving family ties and select event archives can carry across generations without inheriting a deceased character's active conversation.
- Responsive mobile layout: three-by-two tab arrangement below 390 CSS pixels, wider readable buttons and single-column cast cards on narrow phones. Conversations use a prominent accessible top panel.
- Version 0.8.0, iOS build 7 / Android versionCode 7; no EAS build or signing performed.

## Verification
- Automated engine tests cover conversation branching, serialization, yearly cooldown, empathy vs confrontation, autonomous relationships and inheritance.
- Browser tests check conversation UI, persistence on reload, phone-sized viewport layouts and accessibility roles.
- No physical iPhone or Android device was available in the connected GitHub test environment; Playwright mobile viewport tests do not prove native touch performance.

## Future opportunities
- Relationship networks should influence more complex career decisions and family alliances beyond the baseline annual-world events.
- More authorship for culturally varied dialogue, professional contract negotiations and child/teenage characters.
- Real-device usability, accessibility audits, memory/performance profiling and original portraits/animation before store submission.
