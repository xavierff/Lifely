# Lifely Competitive Quality Scorecard
Updated: 2026-11-26 · benchmark framework, NOT evidence of superiority.

## Goal
Build an original life simulator that earns preference over BitLife through *fun*, meaningful control, depth, replayability and reliability. The user wants continued improvements until a defensible comparison is possible. Do not declare success on the basis of word/scenario counts, synthetic automated simulations alone, or self-selected demonstrations.

## Current verified engineering baseline
- Source: xavierff/Lifely main; 1.5.0 passed GitHub unit, Expo export and Playwright checks. 1.6.0 is an implementation candidate until CI passes.
- Lifely has 1,109 scenario prompts, 150 careers and dozens of ongoing systems, but content counts are not substitutes for content quality.
- 1.6.0 introduces 8 playable hobby circuits with 24 original authored situations, 72 response choices, mastery, rival progression, independent rival training, leagues and trophies. Reward model caps simulated contest prizes; keeps games offline and optional.
- **No independent side-by-side, physical device or sustained retention test has yet been completed**; subjective quality remains unverified.

## Objective benchmark before "better than BitLife" claim
| Dimension | Measurement | Success criterion |
|---|---|---|
| Playtime enjoyment | 20+ independent participants, randomized/counterbalanced 90-minute sessions in both games, standardized device conditions | At least 60% prefer Lifely overall; report confidence interval and demographic caveats |
| Early engagement | Median time to first freely chosen fun interaction, measured from clean install | Under 10 minutes; measure versus benchmark |
| Agency | Blind scoring of choices where different strategies lead to different meaningful outcomes | Average at least 4/5; no dominant always-correct option |
| Narrative coherence | Blind scoring of 100 randomly sampled, real-session stories, with names/timeline | 90%+ internally coherent and non-repetitive |
| Replayability | 20 first lives, 20 second lives; distinct experienced decisions, events and outcomes | 70%+ of second lives meaningfully different, not just names |
| Usability | Native 320pt phone and tablet test, VoiceOver/TalkBack, large dynamic text, tap ergonomics | All release-blocking issues resolved |
| Stability | Automated save fuzzing, long-lived careers, import of earlier v2 saves; physical session crash logs | Zero critical data loss; >99.5% crash-free test sessions |
| Monetization and trust | Data/privacy, offline saves, clear purchase messaging if any | No deceptive monetization; no hidden loss of purchased content |
| Day-7 return | With explicit consent, compare voluntary play sessions and reasons for return | Meaningfully competitive with benchmark; avoid simulated proxy |

## Development acceptance gate
Each feature must include:
1. Real implemented interactivity, not just extra static text or unrelated story cards.
2. Persistent consequences and bounded numbers; action cost and money flows must be fair.
3. Save compatibility and deterministic regression tests.
4. Reproducible browser gameplay coverage; native-device checks before store release.
5. A written record of unresolved gaps and why the next change improves player enjoyment.

## Next gaps after the 1.6.0 hobby milestone
- Quality and variability of everyday scenarios (not only quantity).
- Multi-year school to adulthood relationships, skills and activities interweaving.
- Conflict resolution and social consequences need more individually authored outcomes.
- Feedback from real players, balancing difficulty and reward pacing.
- Native music/haptics/accessibility and small device usability.
- Compare what players *do* and *choose* during a session against available BitLife features, avoiding copyrighted content and designs.

## Caveat
BitLife is third-party software with evolving mechanics. Feature parity and "better" are a research hypothesis, not something engineering CI can certify. Obtain current official documentation and actual comparative gameplay evidence before making superiority claims. Stop the ongoing development automation only after the user has reviewed a credible evidence-backed conclusion or explicitly requests it.
