# Tasks: Outils de décision

**Input**: Design documents in `specs/004-decision-tools/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-contract.md`, `quickstart.md`

**Tests**: Record actual RED → GREEN evidence in `specs/004-decision-tools/tdd-results.md`.
The initial implementation used a broad feature RED gate before implementation; review
corrections use targeted vertical regression cycles and must not be retroactively described as
part of that initial gate.

**Organization**: Initial feature tests were prepared across stories before implementation.
Corrective work is tracked separately by behavior: run the targeted failing regression, apply
the smallest fix, and run its targeted GREEN suite.

## Phase 1: Setup

**Purpose**: Confirm the existing test toolchain and prepare the execution record without adding dependencies.

- [x] T001 [P] Confirm Node.js 24 and existing npm test/build scripts, and preserve the no-new-dependency decision in `specs/004-decision-tools/tdd-results.md`

## Phase 2: Initial Broad Test-First RED Gate

**Purpose**: Record the initial broad feature-test RED gate before the first implementation
edits. This historical gate is horizontal across feature stories, not a vertical correction
cycle.

### User Story 1 tests — minimum-cent rate balance

- [x] T002 [P] [US1] Add minimum-cent, previous-cent, benefit target, in/out-of-ceiling, missing-CFE, invalid-date/year, zero-days, negative-target-block and retirement-exclusion cases in `tests/unit/balance.test.ts`
- [x] T003 [P] [US1] Add accessible balance controls, explicit apply-only-rate and unchanged-other-input UI cases in `tests/unit/DecisionTools.test.tsx`

### User Story 2 tests — sensitivity and risk

- [x] T004 [P] [US2] Add exact-cent stress, days-lost clamp, percent/expense bounds, employee differences and no-retirement cases in `tests/unit/risk.test.ts`
- [x] T005 [P] [US2] Add stress presets, custom values, visible warnings and annual/monthly invariance UI cases in `tests/unit/DecisionTools.test.tsx`

### User Story 3 tests — named scenarios and offers

- [x] T006 [P] [US3] Add valid/invalid full-schema, unknown-key, enum/year/date/money/range, duplicate-ID, size-limit, whitelist and CSV-injection cases in `tests/unit/scenario-library.test.ts`
- [x] T007 [P] [US3] Add local-storage corruption, quota, no-mutation-on-failure and atomic import/export cases in `tests/unit/scenario-storage.test.ts`
- [x] T008 [P] [US3] Add explicit save/load/delete/compare/import/export/accessibility/error UI cases in `tests/unit/DecisionTools.test.tsx`
- [x] T009 [P] [US3] Add real JSON file import/download/reload persistence, stress behavior, annual/monthly thresholds, viewport overflow and axe cases in `tests/e2e/decision-tools.spec.ts`

### User Story 4 tests — confirmed reset

- [x] T010 [P] [US4] Add reset confirmation/cancel and saved-library preservation cases in `tests/unit/DecisionTools.test.tsx`
- [x] T011 [P] [US4] Add confirmed reset behavior without snapshot deletion in `tests/e2e/decision-tools.spec.ts`

### Initial broad RED gate

- [x] T012 Run focused new Vitest and Playwright suites before production edits; record exact commands, failing tests and observed reasons in `specs/004-decision-tools/tdd-results.md`

## Phase 3: User Story 1 — Trouver un taux journalier d’équilibre (P1)

**Goal**: Compute only the minimum eligible integer-cent daily rate for annual salary net or economic-value targets, including clear blocked and unreachable states.

**Independent Test**: The balance suite proves the returned candidate reaches the target, the previous cent does not, no recommendation crosses the prorated cap, and all blocked boundaries are explicit.

### Implementation

- [x] T013 [US1] Implement bounded binary-search result types, negative-target/catalog/year/date/CFE gates, prorated eligible ceiling, safe out-of-ceiling hypothetical and candidate/previous-cent verification using `calculateComparison` in `src/domain/balance.ts`
- [x] T014 [US1] Integrate target selection, current/120/160/200-day hypotheses, and reachable-only rate application without changing other fields in `src/components/DecisionTools.tsx`
- [x] T015 [US1] Render balance results as a compact collapsed French panel after inputs and before results, with before-income-tax/no-retirement assumptions and a non-applicable out-of-ceiling warning in `src/components/DecisionTools.tsx`

## Phase 4: User Story 2 — Mesurer une sensibilité aux aléas (P2)

**Goal**: Show exact annual current and stressed micro values plus employee deltas under bounded, explicitly hypothetical inputs.

**Independent Test**: The stress suite proves cent rounding, all input boundaries, zero-day clamping and retirement exclusion.

### Implementation

- [x] T016 [US2] Implement pure bounded stress validation, rate-decrease cent rounding, zero-day clamp and annual comparison deltas in `src/domain/risk.ts`
- [x] T017 [US2] Add practical stress presets, custom labeled controls and current/stressed numeric comparison with unemployment/employment caveats in `src/components/DecisionTools.tsx`

## Phase 5: User Story 3 — Gérer et comparer des offres enregistrées (P3)

**Goal**: Save/load/delete/compare complete named snapshots locally, with strict all-or-nothing JSON and explicit safe exports.

**Independent Test**: Library and storage suites verify schema/version/range/size/ID validation, storage errors and atomicity; UI/E2E verify file actions and explicit load behavior.

### Implementation

- [x] T018 [US3] Implement version-1 snapshot collection, trimmed 1–80-character names, 20-item cap, full nested whitelist validation, duplicate-ID rejection and safe CSV text serialization in `src/domain/scenario-library.ts`
- [x] T019 [US3] Implement localStorage read/write/replace/clear boundary that reports malformed persisted data and storage exceptions without changing valid in-memory state in `src/domain/scenario-storage.ts`
- [x] T020 [US3] Add explicit snapshot save/load/delete/select/compare, 100-KiB file import, JSON/CSV downloads, confirmed clear and local-privacy/status messaging in `src/components/DecisionTools.tsx`
- [x] T021 [US3] Wire storage lifecycle and error state into `src/App.tsx` without auto-restoring or mutating the current form on startup/import

## Phase 6: User Story 4 — Réinitialiser les entrées (P4)

**Goal**: Restore defaults only after confirmation, without deleting named snapshots.

**Independent Test**: Cancel leaves every form field unchanged; confirmation restores defaults and leaves the named-scenario collection intact.

### Implementation

- [x] T022 [US4] Add native confirmation before resetting only current inputs to `defaultScenario` in `src/App.tsx`
- [x] T023 [US4] Add the labeled reset action and status feedback in `src/components/DecisionTools.tsx`

## Phase 7: Polish and Cross-Cutting Validation

**Purpose**: Complete feature wiring, preserve compact accessible layout and verify the complete repository.

- [x] T024 [P] Add responsive decision-tool styling with visible keyboard focus and no overflow at 360/768/1280 widths in `src/styles.css`
- [x] T025 [P] Complete the real-file persistence/import/export, axe, annual/monthly and viewport browser journeys in `tests/e2e/decision-tools.spec.ts`
- [x] T026 Run focused suites GREEN and record actual commands/counts in `specs/004-decision-tools/tdd-results.md`
- [x] T027 Update documented feature behavior, official-source boundary and deferred tax/SASU/EURL limits in `README.md`
- [x] T028 Run format check, lint, typecheck, all unit tests with at most two workers, all Playwright projects with at most two workers and production build; record actual outcomes in `specs/004-decision-tools/tdd-results.md`

## Dependencies & Execution Order

### Phase Dependencies

- Setup is independent and adds no package or runtime dependency.
- The initial broad RED gate (T002–T012) preceded the feature implementation. Corrective
  regressions in Phase 9 are separate targeted RED → smallest-fix → GREEN cycles.
- Balance (Phase 3) precedes stress (Phase 4) because both present computed comparisons in the
  same decision-tools panel.
- Library validation/storage (T018–T019) precedes UI integration (T020–T021).
- Confirmed reset (Phase 6) follows application state wiring.
- Polish and full validation follow all user stories.

### User Story Dependencies

- **US1 (P1)**: Existing comparison engine only; independent after RED gate.
- **US2 (P2)**: Reuses existing comparison engine and panel, follows US1 panel foundation.
- **US3 (P3)**: Independent domain/storage behavior after RED gate; UI integration follows domain
  modules.
- **US4 (P4)**: Uses current-form state from app; follows US3 wiring but never changes snapshot
  state.

### Parallel Opportunities

- Tests T002–T011 can be written in parallel only where they touch distinct test files; tests
  sharing `DecisionTools.test.tsx` or `decision-tools.spec.ts` must be combined or edited
  sequentially.
- After the RED gate, `balance.ts`, `risk.ts` and `scenario-library.ts` are separate pure-domain
  modules and can be implemented independently.
- `scenario-storage.ts` depends on `scenario-library.ts`; UI and E2E work follows their APIs.
- T024 styling and T027 README updates are separate from final test execution and may proceed
  concurrently.

### Parallel Example: Pure domain work after RED

```text
Implement src/domain/balance.ts from tests/unit/balance.test.ts
Implement src/domain/risk.ts from tests/unit/risk.test.ts
Implement src/domain/scenario-library.ts from tests/unit/scenario-library.test.ts
```

## Implementation Strategy

1. Confirm the existing toolchain without installing packages.
2. Add every unit/UI/E2E assertion and run the focused tests; record actual RED failures.
3. Implement the balance solver and verify minimum-cent and ceiling behavior.
4. Implement exact-cent stress and confirm clamping/bounds.
5. Implement strict snapshot validation, storage errors and safe exports, then wire the UI.
6. Add confirmed reset, responsive styling and focused E2E coverage.
7. Run every existing quality gate with worker limits of two and document exact outcomes.

## Notes

- Every actual task line uses checkbox, sequential ID, optional parallel marker, story label
  for story phases, imperative description and an exact repository file path.
- Retirement remains separate from annual net/economic values; no unverified tax computation
  or company-formula change is in this scope.
- Do not commit, push, merge or alter GitHub as part of this implementation.

## Phase 8: Convergence

- [x] T029 Surface comparison calculation errors in the scenario panel and block CSV export instead of silently omitting rows in `src/components/DecisionTools.tsx` and cover the error path in `tests/unit/DecisionTools.test.tsx` per FR-016 (partial)

## Phase 9: Review Corrections

**Purpose**: Close independently reviewed precision, consistency and UI gaps with traceable
targeted regression evidence. The timestamp boundary already rejects normalized invalid dates;
add tests and retain its implementation without claiming a production fix.

- [x] T030 [US2] Add RED tests for valid decimal percentage inputs and preserve integer-basis-point stress rounding; use a bounded floating-point tolerance in `src/domain/risk.ts` and `tests/unit/risk.test.ts`
- [x] T031 [US2] Add a RED UI case for €0.001 additional expenses and reject excess precision with a visible error while accepting cent-precise euros in `src/components/DecisionTools.tsx` and `tests/unit/DecisionTools.test.tsx`
- [x] T032 [US2] Add RED engine and imported-snapshot cases for confirmed exemption with omitted CFE; treat it as known zero while keeping non-exempt omitted/zero CFE unknown in `src/domain/micro.ts`, `tests/unit/micro-income.test.ts` and `tests/unit/scenario-library.test.ts`
- [x] T033 [US1] Replace the no-op Calculate control with automatic recalculation status and polite live results; label 120/160/200-day cases low/central/high, preserve displayed and applied cents, and state the N-1/N-2 history limitation in `src/components/DecisionTools.tsx` and `tests/unit/DecisionTools.test.tsx`
- [x] T034 [US3] Add accepted ISO timestamp variant and impossible-calendar-date regression cases; verify existing exact round-trip validation rejects both millisecond and no-millisecond normalized dates in `src/domain/scenario-library.ts` and `tests/unit/scenario-library.test.ts`
- [x] T035 [US2] Preserve current and stressed engine confidence/warnings in stress results and expose them in the UI; cover unknown CFE and prorated-ceiling warnings in `src/domain/risk.ts`, `src/components/DecisionTools.tsx`, `tests/unit/risk.test.ts` and `tests/unit/DecisionTools.test.tsx`
- [x] T036 Update the spec, UI contract, data model, research and this task plan with reviewed behavior and exact corrective RED/GREEN observations in `specs/004-decision-tools/`
- [x] T037 Run post-correction format, lint, typecheck, focused and full unit/browser suites (two workers), and build; append observed outcomes to `specs/004-decision-tools/tdd-results.md`
- [x] T038 [Review] Preserve valid decimal daily rates as exact integer cents and show a local validation error for sub-cent values in `src/domain/money.ts`, `src/App.tsx`, `src/components/ui/NumberField.tsx`, `tests/unit/money.test.ts` and `tests/unit/App.test.tsx` per T037 final-review gap (partial)

- [x] T039 [US1] Clear stale daily-rate validation after confirmed reset or explicit valid snapshot/balance application in `src/App.tsx`; observe RED then GREEN regressions in `tests/unit/App.test.tsx`.
