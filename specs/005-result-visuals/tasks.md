# Tasks: Visuels de résultats

## Setup

- [x] T001 Resolve Spec Kit templates, clarify safe assumptions and create design artifacts in specs/005-result-visuals/.

## US1 — Money flows

- [x] T002 [US1] Verify reconciliation and signed scale in tests/unit/result-visuals.test.ts and src/domain/result-visuals.ts.
- [x] T003 [US1] Verify negative/zero/benefit and unsafe guard tests in tests/unit/result-visuals.test.ts and src/domain/result-visuals.ts.
- [x] T004 [US1] Verify accessible waterfalls and period labels in tests/unit/ResultVisuals.test.tsx and src/components/MoneyFlowChart.tsx.

## US2 — Opportunity map

- [x] T005 [US2] Verify exact hypothesis, ceiling and CFE gates in tests/unit/result-visuals.test.ts and src/domain/result-visuals.ts.
- [x] T006 [US2] Verify adaptive bounded grid and independently solved equilibrium in tests/unit/result-visuals.test.ts and src/domain/result-visuals.ts.
- [x] T007 [US2] Verify selected controls, warnings and paired apply in tests/unit/ResultVisuals.test.tsx and src/components/OpportunityMap.tsx.

## Integration and polish

- [x] T008 Integrate result visuals before numeric details in src/components/ResultVisuals.tsx, src/components/Results.tsx and src/App.tsx; verify tests/unit/ResultVisuals.test.tsx.
- [x] T009 Style clear numeric-first responsive visuals and reduced motion in src/styles.css.
- [x] T010 Add real offline, keyboard, monthly-invariance, pointer and axe journeys in tests/e2e/result-visuals.spec.ts; inspect mobile/desktop captures.
- [x] T011 Run sequential full gates and review; record real evidence in specs/005-result-visuals/verification.md, reconcile README.md and assess convergence.

## Dependencies / Implementation strategy

T001 → T002 → T003 → T004; T005 → T006 → T007; T004/T007 → T008 → T009 → T010 → T011. Add/run one behavior before its smallest implementation, then next vertical slice. UI styling may proceed independently after native markup; no shared-file parallel writes. Requirement coverage FR001–003=T002–004; FR004–006=T005–007; FR007–009=T007–011; SC001–004=unit/UI/browser/full gates. No critical analysis inconsistency or uncovered requirement.

## Verification evidence

T002–T010: existing implementation and tests inspected and exercised; initial test-first history is not available, so no retrospective RED/GREEN claim. T011: see verification.md for sequential gates, screenshot inspection and separate oracle.

- [x] T012 [US2] RED/GREEN explicit out-of-frame hypothesis warning and hidden clipped marker in tests/unit/ResultVisuals.test.tsx and src/components/OpportunityMap.tsx.
