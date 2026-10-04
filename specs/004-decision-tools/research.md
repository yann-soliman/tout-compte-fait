# Research: Outils de décision

**Research date**: 2026-10-04

## Decision: Reuse the dated 2026 calculation engine

- **Decision**: Derive employee net and economic targets from `calculateComparison` and
  evaluate micro candidates through its existing `rules2026` inputs. Do not edit statutory
  rules or include retirement rights in economic value.
- **Rationale**: The existing calculator already separates micro net income, micro economic
  costs, employee benefits and retirement. Reusing it prevents a second payroll or micro
  formula from drifting from the displayed simulator.
- **Sources already recorded in the code**: `src/domain/rules/2026.ts`, effective
  `2026-01-01`, verified `2026-09-22` or `2026-10-04`: DILA / Service-Public
  [micro-social F37353](https://entreprendre.service-public.gouv.fr/vosdroits/F37353),
  [formation professionnelle F23459](https://entreprendre.service-public.gouv.fr/vosdroits/F23459),
  [micro turnover limits F23267](https://entreprendre.service-public.gouv.fr/vosdroits/F23267),
  [CFE F23547](https://entreprendre.service-public.gouv.fr/vosdroits/F23547) and
  [employee contributions F2302](https://entreprendre.service-public.gouv.fr/vosdroits/F2302).
- **Alternatives rejected**: Reimplementing contribution equations, assuming unprovided
  income-tax values, annualizing after-tax figures or treating pension estimates as current
  economic income.

## Decision: Bound the minimum-rate search by the actual eligibility rule

- **Decision**: Search integer cent rates from zero through the largest rate whose turnover
  satisfies the existing ceiling after the same first-year activity-day proration. Use
  `calculateComparison` for monotonic candidate values and verify both the answer and its
  preceding cent. If that range cannot attain the target, optionally search up to the largest
  safe turnover and return only a separately labeled out-of-ceiling indicative value.
- **Rationale**: A bounded binary search avoids unbounded iteration and prevents the UI from
  recommending an ineligible micro turnover. The date and ceiling interpretation already live
  in `src/domain/eligibility.ts`; the source and ceiling are in `rules2026`.
- **Alternative rejected**: Solving an algebraic approximation that bypasses per-line
  statutory rounding, or returning an out-of-cap rate as eligible/recommended.

## Decision: Treat stress inputs as user hypotheses

- **Decision**: Model only days lost, a rate decrease and extra annual expenses with fixed
  validated bounds. Calculate both current and stressed annual values using the existing
  engine and label presets/custom values as hypotheses.
- **Rationale**: No authoritative future-business, employment or unemployment outcome follows
  from the available inputs. Retirement stays outside annual economic value.
- **Alternative rejected**: Probabilistic forecast, tax estimate, unemployment guarantee or
  duplicate retirement valuation.

## Decision: Use an explicit browser-local, versioned scenario library

- **Decision**: Persist up to 20 complete named snapshots in a version-1 JSON envelope,
  validate an entire import (up to 100 KiB) before replacement, and only load a snapshot on
  explicit action.
- **Rationale**: This fits static hosting and keeps financial data on-device while avoiding
  unexpected restoration into a live edited form. A strict key whitelist and reconstruction
  prevent untrusted objects from reaching application state.
- **Alternative rejected**: URL parameters, remote sync, blind `JSON.parse` hydration, partial
  imports and silent corrupt-data recovery.

## Decision: Keep integration small and accessible

- **Decision**: Add collapsed tool panels using native fields, buttons, table, labels and file
  input. Keep all current inputs before outputs and expose errors next to the action.
- **Rationale**: Matches the compact French simulator and the constitution's native-control
  accessibility principle.
- **Alternative rejected**: New UI dependency, extra navigation route, charts for small tables,
  or presenting narrative before numeric results.

## Unresolved decisions

None. No unsupported tax or company-formula research is required for this feature.

## Review corrections (2026-10-04)

- **Floating-point input boundary**: Accept a percentage only when its value multiplied by 100
  lies within a bounded machine-epsilon tolerance of an integer; reject real excess precision
  such as `0.001%`. Convert the rounded hundredths to integer basis points and retain the
  existing BigInt stress arithmetic. No rate or statutory formula changes.
- **Euro expense entry**: Convert user-entered euros to cents only when the scaled value is
  within the same bounded binary representation tolerance of an integer cent. Do not silently
  round values such as €0.001; keep the current expense bounds and surface a local error.
- **CFE consistency**: A confirmed exemption and omitted annual amount both mean known zero,
  matching the existing balance solver and import schema. A non-exempt omitted or zero value
  stays unknown; no CFE rule is inferred.
- **Presentation fidelity**: Balance results are automatic, accessible updates; daily rates use
  two decimal places because application uses their integer-cent value. Turnover below the
  ceiling remains explicitly unconfirmed pending N-1/N-2 history. Stress carries the engine's
  confidence and warnings for current and stressed scenarios.
- **Saved timestamp boundary**: Added exact-round-trip regression cases for valid UTC timestamp
  variants and impossible dates both with and without milliseconds. The pre-correction parser
  already rejected both normalized impossible dates, so the smallest correct action was test
  coverage and no production-code change.
