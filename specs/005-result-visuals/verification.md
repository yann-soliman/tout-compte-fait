# Verification — Result visuals

## Executed quality gates

Node 24.20.0. Sequential execution, all exit 0:

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm test -- --maxWorkers=2`: 232 tests, 22 files.
- `npm run test:e2e -- --workers=2`: 48 browser tests across desktop, tablet and mobile.
- `npm run build`
- `git diff --check`

Browser coverage includes keyboard exploration, actual touch events on a 360px context,
mouse selection, explicit paired application, offline recalculation, annual/monthly
invariance, negative flows, missing CFE, axe and horizontal overflow. Existing browser
update-within-100ms test passes. Desktop/mobile screenshots and native-scale mobile map
crop inspected: readable labels, common monetary scales, no clipped layout. The sampled
map is explicitly indicative; exact selected figures remain textual. Reduced motion
removes the flow-bar transition. No new dependency, network resource or statutory rate.

## Separate empirical oracle

Scratch script (not committed) exercised 360 combinations of expenses, missing/zero/known
CFE, full-year/end-year dates, rates including 350.29 and 600.58, and 0/1/100/160/366 days.
Compared exact map values with the existing engine; checked ceiling/application predicates
separately and waterfall reconciliation/domain containment. All assertions passed. Nine
plotted equilibrium points were checked against the immediately preceding cent: each is
the minimum nonnegative economic difference. This is a separate oracle, not an independent
human/agent review.

## Demonstrated regression TDD

Out-of-frame hypothesis at 1500 EUR/day and one day originally silently clipped its marker.
The targeted UI regression failed (exit 1, missing warning), then passed (exit 0) after an
explicit out-of-frame warning and suppression of the clipped marker. Exact selection and
otherwise valid application remain available. Initial slice test-first history is not
available in the recovered state; no retrospective RED/GREEN evidence is claimed.

## Review and convergence

Parent inspected all new adapters/components/tests and the integration diff. Checked
signed cents, reconciliation, consistent common scale, monthly rounding disclosure,
engine reuse, retirement exclusion, bounded grid, exact selection, minimum-cent equilibrium,
ceiling hatching, unknown-CFE guard, current-point identity, explicit paired application,
invalid inputs, selected marker outside chart bounds and keyboard alternatives.
Independent-agent review attempted but unavailable: delegation provider not authenticated
and no Codex executable installed; Copilot was not used. No independent verdict is claimed.

FR-001–009, SC-001–004 and both stories' seven acceptance scenarios are covered by code,
unit/browser checks and inspected screenshots. Plan's static/minimal-dependency/pure-domain
constraints and constitution principles were assessed; French second-person labels replaced
with neutral wording. All twelve implementation tasks complete. No buildable gap found;
convergence adds no task and leaves tasks.md unchanged. Human-panel study remains withdrawn.

## Limits retained

Annual, before income tax, retirement excluded. Under-ceiling status is not confirmed
eligibility without prior-year history. Map colors and connecting lines interpolate visual
samples, not exact monetary calculations. Monthly steps round independently. Gross salary
is not employer cost; valued benefits need not be cash. Out-of-ceiling flows remain explicitly
theoretical, not a recommendation to operate under that regime.
