# Quickstart: Outils de décision

## Prerequisites

Node.js 24 and the repository's existing `node_modules`; no dependency installation is needed.

## Focused automated validation

```bash
npm test -- --run tests/unit/balance.test.ts tests/unit/risk.test.ts tests/unit/scenario-library.test.ts tests/unit/scenario-storage.test.ts tests/unit/DecisionTools.test.tsx
npx playwright test tests/e2e/decision-tools.spec.ts --workers=2
```

The balance tests assert minimum-cent and previous-cent behavior, first-year prorated
eligibility, unreachable targets, CFE/date/year blocks, zero days, benefits, retirement
exclusion and annual/monthly invariance. Stress tests assert exact cent outputs, input bounds,
floating-point hundredth-percent boundaries, confidence/warnings and day clamping. UI tests
verify rejection of sub-cent euro expense inputs, automatic balance updates, exact-cent rate
display/application, and N-1/N-2 eligibility caveats. Library/storage tests exercise whitelist
validation, timestamp round-trips, malformed nested values, duplicate IDs, corruption, quota
and all-or-nothing replacement.

## End-to-end manual path

1. Run `npm run dev` and open the local URL.
2. Set a valid 2026 activity start date and confirm a CFE value or exemption.
3. Expand the balance tool; compare salary-net and salary-economic targets at current days and
   the 120, 160 and 200-day hypotheses; apply an attainable rate and confirm other fields stay
   unchanged.
4. Expand the stress tool; select a preset and test more lost days than the current total.
   Confirm zero remaining days and annual stress values.
5. Save a named scenario, change an input, compare the current and saved annual rows, and load
   the saved snapshot explicitly.
6. Export the JSON collection, import the downloaded file, then try an invalid JSON file and
   confirm the prior collection is retained. Export the CSV and inspect special-character
   names for formula neutralization.
7. Reload; verify saved snapshots return while current form inputs start at their defaults.
8. Run the 360/768/1280 viewport and axe checks via the E2E suite.

## Full quality gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test -- --maxWorkers=2
npx playwright test --workers=2
npm run build
```

See [data-model.md](data-model.md) for input ranges and
[contracts/ui-contract.md](contracts/ui-contract.md) for user-visible behavior. Actual TDD
RED/GREEN commands and outcomes are recorded in [tdd-results.md](tdd-results.md).
