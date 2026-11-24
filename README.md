# Lifely

An original, offline, choice-driven life simulator. This repository is the **0.2.0 playable foundation**, not an App Store-ready or feature-parity release.

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
- 70 original branching event cards (140 choices); age-gated and context-gated selection, deterministic random state and recent-event suppression.
- 30 careers, four education levels, promotion and job loss; business ownership, retirement and pension.
- Household costs, tax, debt and interest, investments, property, rent, asset sales and annual statements.
- Individual family and friend bonds, memory logs, partner, marriage, separation, children, aging and death.
- Continue as a living child at their current age with a simplified estate inheritance; achievement and ancestor summaries.
- Mobile safe-area aware UI, five tabs, decision gates, local save/restore and explicit new-life flow.

## Verification
The core engine was exercised in the authoring runtime on 1,000 seeded complete lives, 92,587 choices, plus deterministic replay, accounting, inheritance and invalid-action checks. The committed Node test suite reproduces those checks. Native dependency installation, bundling, UI/device tests, app signing and store submission have not been performed. The prior Life Chapters save format is not imported; this is a fresh Lifely schema.

## Release gates
- Expand original event catalog and long-lived narrative chains; add more job-specific mechanics, school clubs, health conditions, location differences, business depth and diverse household scenarios.
- Balance salary/cost progression, education accessibility and estate mechanics; current country data is fictional, displayed in USD equivalents.
- Add multi-slot saves, backup/export, accessibility testing, app icon/splash, sound and optional haptics.
- Run npm install and lock dependencies, run expo-doctor and native exports, play-test small/large phones and tablets, fix failures and verify signed releases.
- Complete content review, privacy policy, app age rating, app name/trademark clearance, store metadata and screenshots. Monetization is intentionally not implemented.
- Do not market as superior to BitLife until user testing supports that claim.

All game events are original. No BitLife code, branding or assets are included.
