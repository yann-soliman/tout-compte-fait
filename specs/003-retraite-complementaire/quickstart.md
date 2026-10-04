# Validation guide

Use Node24 from `.nvmrc`, then `npm ci`.

Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`.

1. Activate retirement; salary75,500 € ->378.67 displayed Agirc-Arrco points, annual indicative pension; sources and estimate caveat visible.
2. CA40,000 € -> BNC21% allocation, RCI purchase21.726 €, service1.347 €; see unit fixture for rounded values.
3. Salary0; CA0 -> zero with estimated label, no fabricated base pension.
4. Test1 and8PASS at minus/exact/plus1cent, alternative periods/categories/work ratios, unusable optional catalogue rules.
5. Switch annual/monthly and disable retirement; income/economic differences and projections must remain unchanged.
6. Test360/768/1280 px, keyboard and sources; no horizontal overflow. Block network after loading and change input.

Human usability: previous feature002 T050 remains open. Automated tests do not fulfill it.

## Executed validation — 2026-10-04

- Runtime: Node24.20.0, existing local runtime; dependencies from the repository lockfile. Playwright Chromium1243 downloaded for the matching installed test runner.
- Baseline:83 tests passed before implementation after reverting the rejected unverified draft.
- RED observed: missing catalogue, employee acquisition, missing/invalid parameters, RCI acquisition, retirement regime/source UI, service reference date, malformed/incomplete point bands and incorrect intermediate-rounding metadata. GREEN verified after each corresponding change.
- `npm run format:check`: PASS.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test -- --maxWorkers=2`: PASS —132 tests,15 files.
- `npm run test:e2e -- --workers=2`: PASS —27 tests, desktop1280px/tablet768px/mobile360px. Includes source visibility, zero rights, period invariance, no-runtime-network calculation, keyboard/source disclosures, Axe accessibility, no overflow and existing100ms performance assertion.
- `npm run build`: PASS — static production bundle generated.
- Visual inspection: desktop screenshot and mobile retirement crop show no clipped values or overlapping labels; numeric values and estimate labels readable.
- Analyse:14 requirements/criteria (10FR,4SC) mapped to11 tasks; no constitution conflicts. Convergence reviews actual annual estimate behavior, not superseded blocked-MVP checkmarks. Independent final diff review: PASS (fresh Copilot context after two narrowly scoped fixes). Incorrect contiguous1/8PASS band boundaries and rates above100% now block the affected regime; both regression tests were observed RED then GREEN by the fix contexts and rerun by the parent. Rounding/unit concerns were checked against180,300 independent Decimal half-up reference pairs (zero disagreement) and real calculator half-boundary tests. No remaining security or logic findings.

### Reference outputs

Salary75,500 € ->378.67 displayed points and544.76 € annual indication. BNC CA40,000 € ->98.98 displayed points and133.32 € annual indication. These figures are display-rounded annual estimates, not caisse-certified entitlements.
