# Lifely 0.9.0 — Ripple Engine, long-term consequences and life chronicle

## Original mechanics
- Eight distinct thematic multi-year follow-up stories: trust, recovery, financial responsibility, career integrity, public reputation, creative ownership, community responsibility and family inheritance.
- Each story has three authored chapters and three authored decisions per chapter: 24 chapters and 72 response options. They are separate from the 1,109 existing scenario records and do not duplicate or renumber any existing story ID.
- Scenario decisions spawn a causal thread when player age, scenario category and concrete choice effects match. The game records the source event and selected option; next chapters open after a one- or two-year gap. No server access or random draws are required.
- Three concurrently active thread limit and minimum three-year spawn gap. Follow-ups can alter stats, cash, debt, interpersonal trust, and final personal reputation. After four overdue years, unresolved obligations are concluded with explicit consequences.
- Family/community/trust threads may pass to children when a life ends. Completed stories and unresolved memories contribute to the next generation's chronicle.
- The Life screen displays causal cards, original decision provenance, countdowns, chapter text, choice costs and outcomes. The More screen has a story recap with counts of fulfilled, complicated and neglected obligations.
- Version 0.9.0 with native build number 8. Existing version-2 saves load without migration requirements.

## Testing
- New engine tests for causal eligibility, three distinct endings, costs and action gating, missed deadlines, old saves, and multi-generation inheritance.
- Playwright browser tests for responsive follow-up story cards at widths 320, 375 and 430, persistence on reload, and life recap.
- GitHub workflow is the source of final automated export and browser status. No signed native builds or actual-device validation performed.

## Limitations and next pass
- Story types are thematic and deterministic rather than bespoke for all 1,109 original events. A scenario can trigger only one active follow-up at a time.
- Add richer skill-based minigames, meaningful AI/NPC consequences, and larger original narrative libraries.
- Conduct physical-device accessibility and play sessions to validate touch size, readable navigation, animations, power usage and perceived fun.
- Being objectively 'better than BitLife' requires user testing and extensive quality/commercial comparisons; this release does not claim that benchmark has been met.
