# Tasks: Compact Simulator Interface

**Input**: Design documents from `/specs/001-compact-simulator-interface/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

## Phase 1: Setup

- [ ] T001 Replace the Lovable package manifest with the static application toolchain in package.json
- [ ] T002 [P] Configure TypeScript and Vite with the GitHub Pages base in tsconfig.json and vite.config.ts
- [ ] T003 [P] Configure formatting and linting in prettier.config.mjs and eslint.config.js
- [ ] T004 Create the browser entry points in index.html and src/main.tsx

## Phase 2: Foundational

- [ ] T005 [P] Define scenario and result entities with documented validation ranges in src/domain/model.ts
- [ ] T006 [P] Add the default local comparison scenario in src/domain/defaults.ts
- [ ] T007 Implement isolated provisional result calculations in src/domain/calculate.ts
- [ ] T008 [P] Add reusable field, segmented-control, tooltip and section primitives in src/components/ui/
- [ ] T009 Establish responsive tokens, focus states and compact layouts in src/styles.css

## Phase 3: User Story 1 - Complete a compact comparison (P1)

**Goal**: Fill the ordered scenario and reach the comparison result at the bottom.

**Independent Test**: Fill every section at desktop and mobile widths and confirm every result updates
without horizontal scrolling.

- [ ] T010 [P] [US1] Write domain calculation and boundary tests in tests/unit/calculate.test.ts
- [ ] T011 [P] [US1] Write simulator interaction tests in tests/unit/App.test.tsx
- [ ] T012 [US1] Implement the ordered simulator sections and local scenario updates in src/App.tsx
- [ ] T013 [US1] Implement side-by-side status result cards and retirement metrics in src/components/Results.tsx
- [ ] T014 [US1] Add the mobile simulator smoke path in tests/e2e/simulator.spec.ts

## Phase 4: User Story 2 - Inspect only useful detail (P2)

**Goal**: Keep labels and figures terse while making definitions available on demand.

**Independent Test**: Open and dismiss every information control by keyboard, then switch the display
period and confirm all eligible values change period consistently.

- [ ] T015 [P] [US2] Add accessible tooltip and period-control tests in tests/unit/App.test.tsx
- [ ] T016 [US2] Integrate contextual information controls and annual/monthly display in src/App.tsx
- [ ] T017 [US2] Verify neutral numeric-only result wording in src/components/Results.tsx

## Phase 5: User Story 3 - Explore projections (P3)

**Goal**: Compare cumulative and composition values over a selected duration.

**Independent Test**: Change the duration and confirm the chart, totals, donuts and exact legends all
use the retained simulator scenario.

- [ ] T018 [P] [US3] Write projection series tests in tests/unit/projection.test.ts
- [ ] T019 [US3] Implement cumulative projection generation in src/domain/projection.ts
- [ ] T020 [P] [US3] Implement the cumulative comparison chart in src/components/charts/CumulativeChart.tsx
- [ ] T021 [P] [US3] Implement accessible composition donuts in src/components/charts/CompositionChart.tsx
- [ ] T022 [US3] Integrate duration controls and projection charts in src/components/ProjectionView.tsx
- [ ] T023 [US3] Add the projection smoke path in tests/e2e/projection.spec.ts

## Phase 6: Polish and delivery

- [ ] T024 [P] Replace Lovable documentation with project setup and provisional-calculation notes in README.md
- [ ] T025 [P] Configure quality checks and GitHub Pages deployment in .github/workflows/
- [ ] T026 Add Playwright configuration and accessibility checks in playwright.config.ts and tests/e2e/
- [ ] T027 Run all quality gates and production build from specs/001-compact-simulator-interface/quickstart.md
- [ ] T028 Perform visual checks at 360, 768 and 1280 pixels and record evidence in the pull request

## Dependencies and execution order

- Setup tasks T001-T004 precede all application work.
- Foundational tasks T005-T009 precede all user stories.
- US1 provides the scenario and result shell used by US2 and US3.
- US2 and US3 can proceed independently once US1 is complete.
- Delivery tasks follow the selected user stories.

## Parallel opportunities

- T002 and T003 can proceed after T001 without overlapping files.
- T005, T006, T008 and T009 use separate files.
- T010 and T011 can be written in parallel before US1 implementation.
- T020 and T021 are independent chart components.
- T024 and T025 use independent documentation and workflow files.

## Implementation strategy

Deliver US1 as the first usable compact simulator, add optional detail through US2, then add the
projection panel through US3. Keep provisional formulas isolated so the business specification can
replace them as a separate increment.
