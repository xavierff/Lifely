# Lifely 1.0.0 — Interactive Career Missions QA

## Scope
- Five original career simulations: film production, competitive sporting season, fictional civic election, fictional team-based medical case, and a customer-focused business initiative.
- Each contains four different authored scenes with three responses per scene. Total: 20 career scenes and 60 playable response options, in addition to the existing 1,109 scenario records.
- The choices affect quality, team trust, audience reach, risk, and spending; professional skills and NPC rivals influence the final score and chance.
- Film production feeds releases, fame, catalog royalties, awards and existing entertainment-agent commissions.
- Sports updates competition seasons, victories/defeats, injury exposure, prize cash, rival records and professional ranks.
- Civic elections influence party approval, votes in this fictional model, terms in office, rivals, and incompatible full-time employment.
- Clinical cases improve healthcare career experience or identify a need for supervised learning. Entirely fictional and does not give real patient diagnosis/treatment recommendations.
- Business operations update company quality, demand, competition, customer-facing products, cash and reputation. Existing product inventory limit of 10 is preserved.
- Missions persist across local save and app reload. Starting consumes one annual action and an upfront project fee. Four choices are played through before unrelated actions or annual aging resume. Abandonment is available; budgets already spent are not refunded.
- Every scene includes a no-cost response that allows responsible completion even when cash is exhausted.
- Work tab displays a dedicated career mission interface with progress, budgets, team/quality/reach/risk meters, options, and previous project results.
- App version 1.0.0, iOS build 9 and Android versionCode 9. Save schema remains version 2.

## Automated QA
- Added 8 engine tests: 5-mode progression, all stage content, affordability, initial fees, abort/cooldown rules, financial accounting, company cap, old saves, and dynasty history.
- Added 3 Playwright browser tests: 4-step film production and reload, distinct professional entry points, and 320px/375px/430px viewport usability.
- Full release verification is through GitHub Actions. No EAS build or signed iOS/Android release performed.

## Known limitations
- These are stylized, turn-based fictional professional simulations, not real sports matches, clinical procedures, actual elections or live business simulations.
- Add richer role-specific visual assets, performance animation, opponent AI, unique business industries and professions, and longitudinal player/competitor testing.
- Test native gestures, screen reader access, safe areas and low-end device performance before App Store or Google Play release.
- There has been no independent comparison establishing Lifely as better than BitLife.
