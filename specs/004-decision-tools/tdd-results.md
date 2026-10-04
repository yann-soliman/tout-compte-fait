# RED → GREEN Execution Record

This file records actual test commands and observed outcomes. A result is entered only after
the command has run; expected failures are not represented as observed failures.

## RED: tests before production edits

Environment confirmed: `node --version` → `v24.20.0`; existing npm scripts inspected; no
dependency installation or manifest edit.

- Existing baseline before feature tests: `npm test -- --maxWorkers=2` → 15 files / 132 tests
  passed.
- Unit RED command:
  `npm test -- --maxWorkers=2 tests/unit/balance.test.ts tests/unit/risk.test.ts tests/unit/scenario-library.test.ts tests/unit/scenario-storage.test.ts tests/unit/DecisionTools.test.tsx`
  → exit 1; four domain suites failed to resolve the not-yet-implemented modules
  `balance`, `risk`, `scenario-library`, `scenario-storage`; six UI tests failed because the
  decision-tool disclosures/actions were absent. This confirms the tests were run before
  production edits.
- Browser RED command:
  `npx playwright test tests/e2e/decision-tools.spec.ts --workers=2`
  → interrupted after 120 seconds; six tests reported locator failures/timeouts because the
  panels and controls were absent, with remaining projects stopped. It is a genuine RED
  observation, not a passing browser run.
- Convergence follow-up RED command:
  `npm test -- --maxWorkers=2 tests/unit/DecisionTools.test.tsx`
  → 1 test failed / 8 passed. The new regression test injected a comparison calculation error
  and confirmed that the scenario panel exposed no accessible alert, demonstrating the silent
  empty-comparison path before the production fix.

## GREEN: implementation

- Focused implementation verification:
  `npm test -- --maxWorkers=2 tests/unit/balance.test.ts tests/unit/risk.test.ts tests/unit/scenario-library.test.ts tests/unit/scenario-storage.test.ts tests/unit/DecisionTools.test.tsx`
  → 5 test files / 52 tests passed.
- Feature browser verification:
  `npx playwright test tests/e2e/decision-tools.spec.ts --workers=2`
  → 9 tests passed across desktop 1280 px, tablet 768 px and mobile 360 px, including an actual
  JSON download/read/re-import, reload persistence, confirmed reset preserving the saved offer,
  annual/monthly invariance, stress clamp, axe and overflow checks.
- Convergence fix verification:
  `npm test -- --maxWorkers=2 tests/unit/DecisionTools.test.tsx`
  → 9 tests passed, including the new case proving calculation errors are announced and CSV
  download is blocked. The focused decision-tools command covering all five feature suites then
  passed 5 files / 53 tests.

## Final quality gates

- `npm run format:check` initially identified formatting in the convergence fix. Ran
  `npx prettier --write src/components/DecisionTools.tsx`; the subsequent
  `npm run format:check` passed.
- `npm run lint` → passed with `--max-warnings 0`.
- `npm run typecheck` → passed.
- `npm test -- --maxWorkers=2` → 20 files / 185 tests passed.
- `npx playwright test --workers=2` → 36 tests passed across desktop, tablet and mobile.
- `npm run build` → passed; Vite built the static production bundle.

## Review-correction regressions (2026-10-04)

The initial implementation RED above was a broad, cross-story gate. It is not reclassified as
vertical TDD. For review corrections, new assertions were run against the existing code before
the minimal implementation changes below; the exact combined focused run is recorded so the
historical test order remains truthful.

- Corrective RED command:
  `npm test -- --maxWorkers=2 --reporter=dot tests/unit/risk.test.ts tests/unit/micro-income.test.ts tests/unit/scenario-library.test.ts tests/unit/DecisionTools.test.tsx`
  → exit 1; 4 files, 9 failed / 52 passed. The failures reproduced three valid percentage
  rejections (`0.29`, `2.51`, `1.15`), missing stressed confidence/warnings, confirmed-exemption
  CFE confidence mismatch in both engine and imported snapshot paths, and three UI gaps: no
  neutral automatic status and an inert Calculate control, silent €0.001 rounding, and missing
  stress confidence/warning display. The impossible savedAt calendar date tests (with and without
  milliseconds) and valid timestamp variants already passed before production edits, so no
  savedAt code change was warranted.
- Corrective GREEN command:
  `npm test -- --maxWorkers=2 --reporter=dot tests/unit/risk.test.ts tests/unit/micro-income.test.ts tests/unit/scenario-library.test.ts tests/unit/DecisionTools.test.tsx`
  → 4 files / 62 tests passed. Assertions include integer-cent outcomes for accepted
  hundredth-percent inputs, rejection of true excess precision, sub-cent expense errors,
  cent-precise displayed/applied balance and stressed rates, low/central/high labels,
  automatic live balance updates, N-1/N-2 caveats, imported exemption behavior, and engine
  warning/confidence propagation.

The change set does not alter `rules2026`, statutory formulas, current-day calculations, scenario
storage architecture, or dependencies.

### Per-finding RED → GREEN evidence

The original broad RED remained broad; it is not called a vertical cycle. Each correction was
then isolated by temporarily restoring or substituting its prior faulty behavior, running only
the matching regression, restoring the smallest fix, and rerunning that same test:

| Behavior                             | Targeted regression                                                   | Isolated RED observation                                                                                                      | Restored-fix GREEN observation                                                      |
| ------------------------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Hundredth-percent float boundary     | `risk.test.ts -t 'applies valid hundredth-percent'`                   | Exact `Math.round(value * 100) !== value * 100` check: 3 tests failed for `0.29`, `2.51`, `1.15`                              | `isHundredthPrecision` epsilon-boundary helper: same 3 tests passed                 |
| Confirmed exemption with omitted CFE | `micro-income.test.ts scenario-library.test.ts -t 'omitted CFE'`      | Original `cfeAnnual !== undefined && (...)` predicate: 2 engine/import tests failed with `estimated` instead of `established` | Confirmed exemption implies known zero: same 2 tests passed                         |
| Sub-cent euro expenses               | `DecisionTools.test.tsx -t 'rejects sub-cent additional expenses'`    | Original `Math.round(Number(value) * 100)` conversion: UI test failed because no alert appeared for €0.001                    | Exact-cent conversion and actionable validation: same UI test passed                |
| Balance minimum-rate display         | `DecisionTools.test.tsx -t 'recalculates both targets automatically'` | Original whole-euro `formatCents`: UI expected €386.93/j, received €387/j                                                     | Two-decimal rate formatter: same UI test passed and the applied field matched cents |
| Inert Calculate control              | `DecisionTools.test.tsx -t 'recalculates both targets automatically'` | Reintroduced no-op button: automatic-balance test failed on its absence assertion                                             | Removed button and kept automatic status/results: same test passed                  |
| Balance live announcements           | `DecisionTools.test.tsx -t 'recalculates both targets automatically'` | Removed `aria-live="polite"`: live-region assertion failed                                                                    | Polite live region restored: same test passed                                       |
| Low/central/high labels              | `DecisionTools.test.tsx -t 'recalculates both targets automatically'` | Replaced all day-case descriptions with a generic hypothesis: label assertion failed                                          | Explicit 120/160/200 labels restored: same test passed                              |
| Eligibility history caveat           | `DecisionTools.test.tsx -t 'recalculates both targets automatically'` | Removed N-1/N-2 wording: caveat assertion failed                                                                              | Explicit history caveat restored: same test passed                                  |
| Stress confidence/warnings           | `risk.test.ts -t 'preserves stressed engine confidence'`              | Returned empty warning arrays: stress-domain warning assertion failed                                                         | Current/stressed engine metadata preserved: same test passed                        |
| Stress warning presentation          | `DecisionTools.test.tsx -t 'exposes stress confidence'`               | Removed warning rendering: UI could not find CFE warning                                                                      | Warning rendering restored: same UI test passed                                     |
| Stressed-rate display                | `DecisionTools.test.tsx -t 'cent-precise stressed daily rate'`        | Restored whole-euro formatting: UI expected €598.26/j, received €598/j                                                        | Two-decimal rate formatting restored: same UI test passed                           |

The valid/invalid savedAt cases were already green in the original corrective RED run: both
`2026-02-30T00:00:00Z` and `2026-02-30T00:00:00.000Z` reject, while valid variants both pass.
No timestamp production code was changed because the existing validator already performs the
required exact round-trip check.

## Post-correction quality gates

- Focused: `npm test -- --maxWorkers=2 --reporter=dot tests/unit/risk.test.ts tests/unit/micro-income.test.ts tests/unit/scenario-library.test.ts tests/unit/DecisionTools.test.tsx`
  → 4 files / 62 tests passed.
- `npm run format:check` initially identified formatting in six changed files; ran Prettier on
  those files. Subsequent `npm run format:check` → passed.
- `npm run lint` → passed with zero warnings.
- `npm run typecheck` → passed.
- `npm test -- --maxWorkers=2` → the first run was concurrent with Playwright/build and timed
  out one lazy-projection UI test (1 failed / 198 passed). Re-running the same full command after
  the parallel work completed → 20 files / 199 tests passed. No code change was made for the
  transient failure.
- `npx playwright test --workers=2` → 36 tests passed across desktop, tablet and mobile.
- `npm run build` → passed; Vite generated the production bundle.

## Final review correction: daily-rate euro-to-cent boundary (2026-10-04)

The final review found the `step={0.01}` daily-rate input could produce values such as
`600.58`, while the event handler multiplied by 100 and asserted the floating-point result as
integer cents. This is a separate targeted vertical regression, not part of the earlier broad
feature RED gate.

- UI RED:
  `npm test -- --maxWorkers=2 --reporter=dot tests/unit/App.test.tsx`
  → exit 1; both new inputs (`600.58` and `600.29`) failed to remain in the field and produced
  uncaught `RangeError: Le montant doit utiliser des centimes entiers dans la plage sûre.`
  from the daily-rate handler.
- Converter RED:
  `npm test -- --maxWorkers=2 --reporter=dot tests/unit/money.test.ts`
  → exit 1; 9 new boundary cases failed because `eurosToMoneyCents` did not yet exist, while
  the 6 existing money tests passed.
- Focused GREEN:
  `npm test -- --maxWorkers=2 --reporter=dot tests/unit/App.test.tsx tests/unit/money.test.ts`
  → 2 files / 22 tests passed. This covers `600.58`, `600.29`, one-cent conversion, sub-cent,
  negative, non-finite and unsafe inputs, plus a visible local error that leaves the result
  panel available.
- Final gates after the implementation:
  `npm run format:check` and `npm run lint` → passed;
  `npm run typecheck` → passed (the initial check caught and prompted a TypeScript-safe
  destructuring adjustment);
  `npm test -- --maxWorkers=2` → 20 files / 211 tests passed;
  `npx playwright test --workers=2` → 36 tests passed;
  `npm run build` → passed.

The correction is limited to exact euro-to-cent conversion and daily-rate input feedback. It
does not alter implemented solvers or statutory rules.

## Parent delivery verification

- Final independent review: PASS, with empty security and logic-error lists after the precision and stale-validation corrections. No review finding remains open.

- Stale-validation regression: `npm test -- tests/unit/App.test.tsx --maxWorkers=2 -t 'clears a stale daily-rate'` failed two assertions because the daily-rate alert survived confirmed reset or applying a valid balance. Clear the input error on explicit valid scenario replacement and confirmed reset; the same command passed both tests.
- Sequential final parent execution: format, lint, typecheck, **213 unit tests in 20 files**, **36 browser tests**, production build and `git diff --check` all passed.
- Independent monetary oracle: 707 cases passed, including brute-force minimum-cent comparisons and valid decimal percentages. A separate 11,100-case pass covered every hundredth-percent decrease from 0 to 100, prorated ceiling invariants across the 365 activity-start dates and rejected impossible saved calendar timestamps. No disagreements. These are supplemental probes, not additional Vitest test counts.
- Native browser inspection: balance/stress panels at 360 px and saved-offer comparison at 1280 px were inspected; minimum daily rates retain cents and comparison exposes both employee and micro values.
- Production dependency audit: `npm audit --omit=dev --json` returned zero reported vulnerabilities.
