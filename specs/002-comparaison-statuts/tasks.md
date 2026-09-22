---
description: 'Task list for the 2026 status comparison feature'
---

# Tasks: Comparaison des statuts

**Input**: Design documents from `/specs/002-comparaison-statuts/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-contract.md`, `quickstart.md`

**Tests**: The specification requires unit tests at every statutory boundary and end-to-end checks at mobile and desktop widths. Write each listed test first and confirm it fails for the intended reason before implementing the corresponding behavior.

**Organization**: Tasks are grouped by user story so each increment remains independently testable. No task may encode a provisional regulatory lead as an established rule.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes a different file and has no dependency on another incomplete task in the same group.
- **[Story]**: Maps a task to User Story 1, 2 or 3 from `spec.md`.
- Every task includes the exact file path to change.

## Phase 1: Setup and Regulatory Gate

**Purpose**: Make the existing project and source evidence ready for implementation.

- [x] T001 Record and use the repository-required Node.js 24 runtime for all validation commands in `.nvmrc` and `README.md`
- [x] T002 Verify the 2026 micro-social rate, professional-training contribution, turnover ceiling, two-year exit rule, partial-year proration and CFE principles against direct institutional publications, recording one evidence row per rule in `specs/002-comparaison-statuts/research.md`
- [x] T003 Verify the 2026 PASS, general employee old-age deductions, exact CSG/CRDS base, Agirc-Arrco T1/T2, CEG, CET, Apec and payroll rounding against direct institutional publications, recording one evidence row per rule in `specs/002-comparaison-statuts/research.md`
- [x] T004 Verify the 2026 base-retirement quarter threshold, annual cap, micro qualifying base and supported SSI affiliation against direct institutional publications, recording one evidence row per rule in `specs/002-comparaison-statuts/research.md`
- [x] T005 Verify the 2026 Agirc-Arrco and SSI complementary point formulas, purchase values, service values and rounding against direct institutional publications, recording one evidence row per rule in `specs/002-comparaison-statuts/research.md`
- [x] T006 Reconcile T002–T005 with the parameter table, correct every outdated value, retain unresolved entries as provisional or estimative, and update the institutional-verification checkbox and notes without overstating completeness in `specs/002-comparaison-statuts/spec.md` and `specs/002-comparaison-statuts/checklists/requirements.md`

**Checkpoint**: Do not proceed to statutory implementation unless T002–T005 directly verify every value needed by the chosen MVP and T006 records the checklist's true status.

---

## Phase 2: Foundational Domain Infrastructure

**Purpose**: Create the exact, sourced calculation foundation that blocks every user story.

**⚠️ CRITICAL**: No user-story implementation begins until this phase is complete.

- [x] T007 [P] Add failing unit tests for integer-cent arithmetic, parts-per-million rates and explicit rounding modes in `tests/unit/money.test.ts`
- [x] T008 Implement `MoneyCents` and `RatePpm` helpers with safe-integer validation and rule-selected rounding in `src/domain/money.ts`
- [x] T009 [P] Define `ComparisonScenario`, `MicroScenario`, `EmployeeScenario`, `RegulatoryCatalog`, source metadata, confidence, warning and result types from `data-model.md` in `src/domain/model.ts`
- [x] T010 [P] Add failing catalogue tests for year mismatch, absent rules, source metadata and rejection of non-`known` rules as established results in `tests/unit/rules-2026.test.ts`
- [x] T011 Create the 2026 regulatory catalogue in `src/domain/rules/2026.ts`, including only values verified by T002–T005 and attaching authority, title, URL, effective date, verification date, status, base, bounds and rounding metadata to every rule
- [x] T012 Add shared scenario validation for `referenceYear` literal `2026`, safe integer money, billed days `0–366`, work ratio `1–100`, leave `0–52` in half-week increments, RTT `0–366`, projection years `1–30` and growth `−100%–100%` in `src/domain/validate.ts`
- [x] T013 Update default values to satisfy the new validated scenario shape without using any provisional statutory value in `src/domain/defaults.ts`
- [x] T014 Refactor the calculation entry point to accept a validated scenario and matching regulatory catalogue, aggregate confidence and source references, and block missing required rules in `src/domain/calculate.ts`

**Checkpoint**: Exact arithmetic, typed scenarios, validated inputs, regulatory provenance and confidence propagation work without React.

---

## Phase 3: User Story 1 — Comparer le revenu disponible 2026 (Priority: P1) 🎯 MVP

**Goal**: Compare micro-enterprise and employee net income before income tax using verified 2026 rules, with an explicit micro-eligibility warning and a traceable contribution breakdown.

**Independent Test**: Use a hand-calculated 2026 fixture and verify each base, contribution, cost, net result and status difference; repeat one cent below, exactly at and one cent above every ceiling or contribution-band boundary.

### Tests for User Story 1

- [x] T015 [P] [US1] Add failing micro tests for turnover, social contribution, professional-training contribution, economic expenses, unknown CFE, zero CFE exemption and exact rounding in `tests/unit/micro-income.test.ts`
- [x] T016 [P] [US1] Add failing eligibility tests one cent below, at and above the full-year and prorated 2026 ceiling, asserting `not-confirmed`, `ceiling-exceeded` and no `confirmed-eligible` state without history in `tests/unit/eligibility.test.ts`
- [x] T017 [P] [US1] Add failing employee tests for every verified general employee contribution, CSG/CRDS base, 1/4/8-PASS boundaries, cadre Apec applicability and excluded payslip variations in `tests/unit/employee-income.test.ts`
- [x] T018 [P] [US1] Add failing aggregate tests for annual/monthly display reconciliation, confidence propagation, missing-rule blocking and micro-minus-employee differences in `tests/unit/calculate.test.ts`
- [x] T019 [P] [US1] Add a failing end-to-end test that enters a complete 2026 scenario and verifies net income, detailed deductions, eligibility warning, difference and regulatory source disclosure after the inputs in `tests/e2e/simulator.spec.ts`

### Implementation for User Story 1

- [x] T020 [P] [US1] Implement turnover-ceiling comparison, activity-start proration and `not-confirmed | ceiling-exceeded | out-of-scope` transitions without a `confirmed-eligible` transition in `src/domain/eligibility.ts`
- [x] T021 [P] [US1] Implement micro turnover, verified micro-social/formation deductions, entered economic costs and CFE confidence handling without deducting real expenses from the statutory base in `src/domain/micro.ts`
- [x] T022 [P] [US1] Implement the verified mainland private-employee deduction bands for `cadre | non-cadre`, excluding collective and local variations and never applying work ratio to gross salary a second time, in `src/domain/employee.ts`
- [x] T023 [US1] Replace demonstration percentages with the micro and employee calculators, preserve annual reference values, derive monthly display values by division by 12 and produce separate net/economic differences in `src/domain/calculate.ts`
- [x] T024 [US1] Update common, micro and employee input controls for fixed year 2026, activity start date, actual gross salary, required cadre/non-cadre choice, CFE amount/exemption and inline validation in `src/App.tsx`
- [x] T025 [US1] Render net income first, the traceable contribution/cost breakdown, confidence, eligibility warnings and annual/monthly differences without presenting a provisional rule as established in `src/components/Results.tsx`
- [x] T026 [US1] Add reusable source/status disclosure and announced validation/eligibility notice presentation in `src/components/ui/RuleDisclosure.tsx` and `src/components/ui/ResultNotice.tsx`

**Checkpoint**: User Story 1 independently delivers the MVP comparison and every displayed statutory number is a verified, dated 2026 rule or visibly blocked/estimated.

---

## Phase 4: User Story 2 — Comparer le temps et les avantages (Priority: P2)

**Goal**: Compare worked time, entered expenses and benefits, economic totals and per-day value without changing statutory bases or double counting.

**Independent Test**: Hold statutory net income constant while changing billed days, work ratio, leave, RTT, expenses and benefits; verify only the appropriate worked-time, economic-total and per-day outputs change.

### Tests for User Story 2

- [x] T027 [P] [US2] Add failing tests for leap-year weekdays, work ratio, half-week leave, RTT, billed days, zero-day indeterminate value and calendar maxima in `tests/unit/worked-time.test.ts`
- [x] T028 [P] [US2] Add failing tests proving micro expenses are deducted once, employee benefits are added once, neither changes a statutory base, and per-day value uses the correct status-specific days in `tests/unit/economic-value.test.ts`
- [x] T029 [P] [US2] Add a failing end-to-end journey for expenses, benefits, time-at-work and zero-day behavior at desktop, tablet and mobile widths in `tests/e2e/simulator.spec.ts`

### Implementation for User Story 2

- [x] T030 [P] [US2] Implement 2026 weekday counting and employee worked days from work ratio, leave and RTT without double subtraction in `src/domain/worked-time.ts`
- [x] T031 [US2] Extend status results with economic costs, benefits, worked days and `MoneyCents | indeterminate` value per day in `src/domain/calculate.ts`
- [x] T032 [US2] Update time, expenses and benefits inputs with the exact constraints `billedDays 0–366`, `workRatioPercent 1–100`, `paidLeaveWeeks 0–52` in half-week increments and `rttDays 0–366` in `src/App.tsx`
- [x] T033 [US2] Present economic value, worked days and per-day value after net income, using `Indéterminée` for zero days and preventing benefits from appearing as salary net, in `src/components/Results.tsx`

**Checkpoint**: User Stories 1 and 2 both remain independently testable; economic comparison explains every included cost and benefit.

---

## Phase 5: User Story 3 — Comparer les droits à la retraite (Priority: P3)

**Goal**: Show verified 2026 base and complementary rights separately, monetise only additive point-based rights, and keep all retirement values outside current income and economic totals.

**Independent Test**: Exercise one cent below, exactly at and one cent above every verified quarter, ceiling, tranche and point boundary for both statuses; verify at most four quarters, correct points and no effect on current-income differences.

### Tests for User Story 3

- [ ] T034 [P] [US3] Add failing employee-retirement tests for 0–4 base quarters, annual cap, complementary point bands, purchase value, service value and point rounding in `tests/unit/employee-retirement.test.ts`
- [ ] T035 [P] [US3] Add failing micro-retirement tests for verified SSI affiliation, official micro-social allocation, qualifying base, 0–4 quarters, complementary points and unsupported Cipav cases in `tests/unit/micro-retirement.test.ts`
- [ ] T036 [P] [US3] Add failing tests that monetise only point-based 2026 rights, return `not-calculable-from-2026-alone` for base pension and never add retirement to current net/economic totals in `tests/unit/retirement.test.ts`
- [ ] T037 [P] [US3] Add a failing end-to-end journey that exposes base/complementary rights, sources, confidence and the limited monetary indication without claiming a complete future pension in `tests/e2e/projection.spec.ts`

### Implementation for User Story 3

- [ ] T038 [P] [US3] Implement employee base-quarter and Agirc-Arrco point acquisition from verified 2026 rules in `src/domain/retirement.ts`
- [ ] T039 [US3] Extend retirement calculation with verified micro SSI qualifying-base, quarter and point rules while returning out-of-scope for unsupported affiliations in `src/domain/retirement.ts`
- [ ] T040 [US3] Add point-service-value monetisation, base-pension `not-calculable-from-2026-alone`, confidence and source references while keeping retirement outside status totals in `src/domain/retirement.ts`
- [ ] T041 [US3] Render base and complementary retirement rights, the point-based indicative annual amount and the base-pension limitation in `src/components/Results.tsx`
- [ ] T042 [US3] Update cumulative projection to use only declared economic-growth assumptions, never infer future statutory parameters, and retain retirement/source caveats in `src/domain/projection.ts` and `src/components/ProjectionView.tsx`

**Checkpoint**: All three user stories are functional, separately testable and explicit about the limits of a single-year retirement estimate.

---

## Phase 6: Polish and Cross-Cutting Validation

**Purpose**: Reconcile the complete experience, provenance and quality gates.

- [ ] T043 [P] Add accessible text equivalents for every comparison/projection chart and verify source disclosures, warnings and changed result status are keyboard reachable and announced in `src/components/charts/CompositionChart.tsx` and `src/components/charts/CumulativeChart.tsx`
- [ ] T044 Reconcile the compact input-before-result layout and prevent clipping at 360 px, 768 px and 1280 px in `src/styles.css`
- [ ] T045 [P] Add cross-story accessibility, no-horizontal-overflow and source-traceability assertions for desktop, tablet and mobile projects in `tests/e2e/visual.spec.ts`
- [ ] T046 [P] Update the project description and regulatory limitations, including reference year 2026 and excluded payslip/pension cases, in `README.md`
- [ ] T047 Run every scenario and boundary sequence from `specs/002-comparaison-statuts/quickstart.md` and record any environment-limited check in `specs/002-comparaison-statuts/quickstart.md`
- [ ] T048 Add an automated interaction-performance assertion that a valid input change updates all affected results within 100 ms in target-browser conditions in `tests/e2e/simulator.spec.ts`
- [ ] T049 Define a moderated ten-person validation protocol measuring completion within five minutes, identification of the leading status within three minutes, and distinction between income, benefits and retirement in `specs/002-comparaison-statuts/quickstart.md`
- [ ] T050 Execute the T049 protocol with ten target users, require at least nine successful participants for SC-004 and SC-005, and record anonymized durations and outcomes in `specs/002-comparaison-statuts/usability-results.md`
- [ ] T051 Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` and `npm run build`, fix all failures, and record the completed gate in `specs/002-comparaison-statuts/tasks.md`

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 — Setup and Regulatory Gate**: Starts immediately. T002–T005 may run independently; all must precede T006.
- **Phase 2 — Foundation**: Depends on T006. T007, T009 and T010 can start together; T008 follows T007; T011 follows T010; T012 and T013 follow T009; T014 follows T008–T013.
- **Phase 3 — US1**: Depends on Phase 2. Tests T015–T019 are written first and must fail for the intended reason; domain implementations T020–T023 precede UI T024–T026.
- **Phase 4 — US2**: Depends on Phase 2 and reuses the aggregate result contract established by T014. T027–T029 precede T030–T033. It can be developed alongside US1 if changes to `src/App.tsx`, `src/domain/calculate.ts`, `src/components/Results.tsx` and `tests/e2e/simulator.spec.ts` are coordinated.
- **Phase 5 — US3**: Depends on Phase 2 and verified retirement sources from Phase 1. T034–T037 precede T038–T042. It can run alongside US1/US2 except for final integration in shared result/projection files.
- **Phase 6 — Polish**: Depends on every user story selected for the release. T049 precedes T050; T051 follows T043–T050.

### User-story dependencies

- **US1 (P1)**: Independently deliverable after Foundation and is the suggested MVP.
- **US2 (P2)**: Its pure worked-time/economic functions are independent after Foundation; final result presentation composes with US1.
- **US3 (P3)**: Its retirement engine is independent after Foundation; final presentation composes with the status results but retirement never changes their totals.

### Parallel opportunities

- T007, T009 and T010 establish different foundational files in parallel.
- US1 test tasks T015–T019 can be written in parallel; T020–T022 implement separate domain files in parallel.
- US2 test tasks T027–T029 can be written in parallel; T030 can proceed separately from presentation work after tests exist.
- US3 test tasks T034–T037 can be written in parallel; T038 can proceed separately from the UI until T039/T040 extend the same retirement file.
- T043, T045, T046, T048 and T049 affect independent files and can run in parallel during polish; T050 follows T049.

---

## Parallel Examples

### User Story 1

```text
Task T015: micro income and rounding tests in tests/unit/micro-income.test.ts
Task T016: eligibility boundary tests in tests/unit/eligibility.test.ts
Task T017: employee contribution-band tests in tests/unit/employee-income.test.ts
Task T018: aggregate calculation tests in tests/unit/calculate.test.ts
Task T019: end-to-end income comparison in tests/e2e/simulator.spec.ts
```

After those tests fail as expected:

```text
Task T020: eligibility engine in src/domain/eligibility.ts
Task T021: micro income engine in src/domain/micro.ts
Task T022: employee income engine in src/domain/employee.ts
```

### User Story 2

```text
Task T027: worked-time tests in tests/unit/worked-time.test.ts
Task T028: economic-value tests in tests/unit/economic-value.test.ts
Task T029: time/value end-to-end journey in tests/e2e/simulator.spec.ts
```

### User Story 3

```text
Task T034: employee retirement tests in tests/unit/employee-retirement.test.ts
Task T035: micro retirement tests in tests/unit/micro-retirement.test.ts
Task T036: retirement valuation tests in tests/unit/retirement.test.ts
Task T037: retirement end-to-end journey in tests/e2e/projection.spec.ts
```

---

## Implementation Strategy

### MVP first — User Story 1

1. Complete Phase 1 and obtain direct institutional evidence for every MVP rule.
2. Complete Phase 2 and prove exact arithmetic, validation and provenance handling.
3. Write failing US1 tests T015–T019.
4. Implement T020–T026.
5. Stop and run the complete quality gate plus the US1 quickstart scenarios.
6. Deliver the income comparison without waiting for time-value or retirement increments.

### Incremental delivery

1. **Foundation**: verified catalogue + exact domain primitives.
2. **US1**: regulatory net-income comparison and eligibility warnings — MVP.
3. **US2**: economic value and worked-time comparison.
4. **US3**: retirement rights and limited point-based monetary indication.
5. **Polish**: responsive, accessibility, documentation and complete validation.

### Boundary-test discipline

For every rate, threshold, ceiling, band, annual cap and rounding rule:

1. Add the official source and effective year to the catalogue.
2. Write the one-cent-below, exact-boundary and one-cent-above assertions.
3. Confirm the assertions fail before implementation.
4. Implement the pure domain rule.
5. Confirm component and end-to-end output exposes the same year, source and confidence.

---

## Notes

- `[P]` means different files and no dependency on unfinished work; shared-file edits still require coordination.
- `[US1]`, `[US2]` and `[US3]` map directly to the prioritized user stories in `spec.md`.
- Never copy a provisional lead from `research.md` into `src/domain/rules/2026.ts`.
- Keep statutory formulas out of React components.
- Commit after each completed task or coherent task group.
- Stop at each checkpoint and validate the story independently.
