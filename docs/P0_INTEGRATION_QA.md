# P0 integration QA — 0.3.0

- Ten special career pathways: targeted 20 seeds per pathway, eight years each (200 targeted career simulations). Verified age/qualification gates, preparation, attempts, financial outcomes and career history.
- Autonomous NPCs: 300 randomized full lives in the first integration pass; 500 full lives after saga integration (44,418 scenario choices, 301/308 cards observed, 605 sagas started, 602 resolved: 291 positive and 311 difficult endings).
- Engine test suite includes 1,000 additional lifetime simulations, exact participant continuity and both saga endings, old-save migration, cash transfers and heir continuity.
- All figures are from automated runs, not human playtesting. The seven unobserved cards in the 500-life run are not claimed as covered by that cohort.
- Remaining: device accessibility, touch ergonomics, balance by profession, more bespoke career gameplay, richer cross-character world relationships, store readiness.

Follow-up: added one signature annual action for each special career, with distinct costs, outcomes and eligibility, and NPC ambition now affects occupation choice, spending and promotion probabilities. Twenty engine tests passed in the authoring runtime, including all ten signature action gates. Two additional browser tests cover special career/People interactions and saga persistence; check actual CI results under Actions.
