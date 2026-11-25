# Lifely 0.7.0 — Recurring Characters & Generational Sagas

## Implementation
- Four named competitive athlete NPCs, one for each sport, with persistent form, head-to-head results, respect, rivalry, trophies and annual competition.
- Three fictional civic rivals with affiliations, independent fundraising, debates, coalitions, voting outcomes, offices and annual approval changes.
- Three named entertainment agents with career specialties, networks and commissions. Representation agreements last three years; negotiated deals produce actual net earnings and tracked fees.
- Per-relative disagreements persist across years, track tension, bond and interaction history, and have reconciliation or estrangement outcomes. Inherited lives retain memories but do not retain the deceased character's active interpersonal conflict unchanged.
- Four original multi-generation family promise premises, each with four decision chapters separated by two years. Active arcs pass into playable descendants, retaining choices, outcomes, ancestors and generation count.
- 25 new individually authored, recurring-NPC scenarios (75 distinct decisions), appended after earlier IDs. Total 1,109 events and 3,089 options. Prompts are dynamically personalized with character names.
- World and People sections show character cards, visible opponent stats, agency contract economics, family conflicts, and a four-stage saga panel.
- Version 0.7.0 (native build numbers 6). Preexisting version-2 saves remain accepted; absent character records are regenerated deterministically without advancing the gameplay RNG.

## Tests
- Added direct tests for NPC identity, annual outcomes, head-to-head sport, fictional political rivals, agent compensation and expiry, family mediation, multi-generation saga completion, and scenario effects.
- Browser tests cover named NPC dashboards and cross-reload state, active family tension and inherited arc UI.
- Verify complete release status using GitHub Actions. No signed TestFlight or Google Play build has been produced.

## Known gaps
- No dynamic NPC dialogue generation or high-fidelity animated character portraits.
- Fictional simplified sports/politics/agency mechanics are not real-world simulations. Family conflict outcomes are simplified.
- Human balancing, accessibility and actual-device testing are still outstanding.
