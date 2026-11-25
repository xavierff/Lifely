# Lifely 0.6.0 — World expansion QA

## Scope
- Six independently stateful world systems (entertainment, sports, politics, royalty, travel and dynasty); 18 destinations and four sports; playable youth sports and selectable royal origin.
- 48 individually authored world scenarios with three distinct options each, appended at IDs 1036–1083. Total 1,084 events and 3,014 choices.
- 24 more achievement definitions, 12 more challenges, 12 more ribbons. Totals: 124 achievements, 62 challenges, 32 collectible ending ribbons.
- Family trust assets included in net worth once; trust grant transfers assets to child, and inherited trust is liquidated into estate to avoid double counting.
- The World screen provides six visual dashboards, responsive cards, a travel search, an annual chronicle, and family tree.

## Validation
- Targeted evaluation verified initial six domains, event and unique-prompt counts, all new path actions and accounting.
- Regression tests cover each domain, old-save migration, revenue, youth sport and inherited trust.
- Browser tests cover the World tab, travel-state reload and inherited ancestor UI. Verify final GitHub Actions for Expo export/browser outcomes.

## Open work
- Expand countries beyond six; diversify sports with live mini-games and opponent careers; extend parliamentary/court dynamics, royal family succession events, travel visa system and dynastic conflicts.
- Test visual touch targets and color contrast on actual phones and tablets; signed builds not made in this task.

## Post-integration refinement
- Actors: audition coaching and role contracts; musicians: albums, record catalog income and concert tours; directors: casting quality and film premieres. Added eligibility and outcome tests.
- Competitive sport now uses different aptitude factors by discipline and has differentiated prize payouts.
- Travel adds city-theme stat outcomes. Civic election success replaces regular employment, avoiding simultaneous full-time salaries.
- A preferred heir receives title succession and the standard estate if selected. Continuing as a different child yields 40% of the deceased parent's estate; the remaining 60% goes to the designated living sibling's finances. With no valid preference, existing inheritance behavior remains unchanged.
