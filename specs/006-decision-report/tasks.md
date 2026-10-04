# Tasks: Robustesse, offres et rapport

## Phase 1 — Setup

- [x] T001 Spec/clarify review, templates and design in specs/006-decision-report/; hooks absent.
- [x] T002 RED/GREEN defaults and regression checks for reset/snapshot preservation in tests/unit/defaults.test.tsx and src/domain/defaults.ts; reconcile affected fixtures.

## Phase 2 — US1 Robustesse

- [x] T003 [US1] RED/GREEN minimum integer day threshold in tests/unit/robustness.test.ts and src/domain/robustness.ts, including predecessor proof.
- [x] T004 [US1] RED/GREEN exact rate/expense thresholds and effort/unreachable/unknown-CFE/zero/ceiling guards in same files.
- [x] T005 [US1] RED/GREEN accessible robustness UI in src/components/Robustness.tsx and tests/unit/DecisionReport.test.tsx; integrate src/components/ResultVisuals.tsx.

## Phase 3 — US2 Offres

- [x] T006 [US2] RED/GREEN selected stable-ID live offer derivation and source aggregation in tests/unit/decision-report.test.ts and src/domain/decision-report.ts.
- [x] T007 [US2] RED/GREEN signed common-scale annual metric chart, days/warnings in src/components/OfferComparison.tsx and tests/unit/DecisionReport.test.tsx; integrate existing src/components/DecisionTools.tsx without changing storage schema.

## Phase 4 — US3 Rapport

- [x] T008 [US3] RED/GREEN annual report preview, assumptions/results/robustness/sources, explicit print/close in src/components/DecisionReport.tsx and tests/unit/DecisionReport.test.tsx; integrate src/components/DecisionTools.tsx.
- [x] T009 [US3] Responsive/print CSS in src/styles.css, real PDF/text/print-only validation and screenshots in tests/e2e/decision-report.spec.ts.

## Phase 5 — Validation

- [x] T010 Offline/keyboard/axe/negative values and defaults/reset/unchanged library journeys in tests/e2e/decision-report.spec.ts; inspect360/768/1280 and PDF.
- [x] T011 Sequential full gates, separate oracle, bounded review, README.md, verification.md and analyze/converge.

## Dependencies / strategy

T001→T002→T003→T004→T005; T006→T007; T006/T005→T008→T009; all→T010→T011. One RED/GREEN behavior slice at a time, not all tests before all code. T006 may proceed independently of T005, but shared DecisionTools edits serialized. FR001–003:T003–005; FR004:T006–007; FR005–006:T008–009; FR007:T002; FR008:T009–011. SC001–004 covered by domain/UI/E2E/oracle/PDF/full gates. No uncovered requirements or critical ambiguity.
