# Data Model: Outils de décision

## Existing ComparisonScenario

The current input model remains authoritative (`src/domain/model.ts`). A saved snapshot
contains every scenario field and does not contain a calculation result or statutory
parameters.

| Field                          | Type and accepted values                 | Validation                                      |
| ------------------------------ | ---------------------------------------- | ----------------------------------------------- |
| `referenceYear`                | integer, exactly `2026`                  | Any other year is unsupported                   |
| `displayPeriod`                | `annual` or `monthly`                    | Exact enum                                      |
| `activityStartDate`            | optional ISO calendar date               | If present, valid day in 2026                   |
| `micro.activity`               | `non-regulated-liberal-bnc`              | Exact supported enum                            |
| `micro.dailyRate`              | non-negative safe integer cents          | Existing monetary validation                    |
| `micro.billedDays`             | integer 0–366                            | Existing scenario validation                    |
| `micro.professionalExpenses`   | non-negative safe integer cents          | Existing monetary validation                    |
| `micro.healthInsuranceMonthly` | non-negative safe integer cents          | Existing monetary validation                    |
| `micro.cfeAnnual`              | optional non-negative safe integer cents | Existing monetary validation                    |
| `micro.cfeExemptionConfirmed`  | boolean                                  | Exact boolean                                   |
| `employee.grossAnnualSalary`   | non-negative safe integer cents          | Existing monetary validation                    |
| `employee.category`            | `cadre` or `non-cadre`                   | Exact enum                                      |
| `employee.workRatioPercent`    | integer 1–100                            | Existing scenario validation                    |
| `employee.paidLeaveWeeks`      | finite 0–52, half-week increments        | Existing scenario validation                    |
| `employee.rttDays`             | integer 0–366                            | Existing scenario validation                    |
| `employee.annualBenefits`      | non-negative safe integer cents          | Existing monetary validation                    |
| `retirement.includeRights`     | boolean                                  | Exact boolean; never valued into balance/stress |
| `retirement.valuationMode`     | `rights-2026-indicative`                 | Exact enum                                      |
| `projection.years`             | integer 1–30                             | Existing scenario validation                    |
| `projection.annualGrowthRate`  | finite number -100–100                   | Existing scenario validation                    |

Unknown properties are rejected at every nesting level on import, even though snapshots are
rebuilt as fresh plain whitelist objects.

## NamedScenario

| Field      | Type                     | Invariant                                                                                                             |
| ---------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `id`       | string                   | Non-empty bounded ID; unique in one collection                                                                        |
| `name`     | string                   | Trimmed; 1–80 characters                                                                                              |
| `savedAt`  | ISO UTC timestamp string | Valid date and time with exact component round-trip; accepts seconds with or without exactly three millisecond digits |
| `scenario` | `ComparisonScenario`     | All fields validated above                                                                                            |

## ScenarioCollectionEnvelope

| Field           | Type              | Invariant                 |
| --------------- | ----------------- | ------------------------- |
| `schemaVersion` | integer           | Exactly `1`               |
| `scenarios`     | `NamedScenario[]` | 0–20 elements; unique IDs |

Serialized imports are at most 102,400 UTF-8 bytes. Any malformed, unsupported, oversized,
duplicate-ID, non-finite, unsafe-integer, invalid-date, invalid-enum, out-of-range or extra-key
input rejects the entire collection before storage. The implementation creates new objects
from allowed keys; source object prototypes and `__proto__` are never copied.

## BalanceResult

| Field                        | Meaning                                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`                      | `reachable`, `target-above-eligible-ceiling`, `indeterminate`, `blocked`, or `outside-safe-calculation-range`                                       |
| `targetKind`                 | Employee `netIncome` or `totalValue`                                                                                                                |
| `targetAnnualCents`          | Annual pre-income-tax target                                                                                                                        |
| `billedDays`                 | The explicit tested annual work-days assumption                                                                                                     |
| `dailyRateCents`             | Minimum eligible integer-cent rate when reachable; absent otherwise                                                                                 |
| `precedingRateCents`         | Candidate one cent below an eligible returned rate, retained for proof/tests                                                                        |
| `maximumEligibleRateCents`   | Largest daily rate under the applicable prorated ceiling                                                                                            |
| `projectedTurnoverCents`     | Candidate rate multiplied by tested billed days                                                                                                     |
| `hypotheticalDailyRateCents` | Optional minimum rate outside the ceiling when no eligible rate reaches the target and calculation remains in safe integer bounds; never applicable |
| `message`                    | Localized explanatory state; never a silent fallback                                                                                                |

No retirement result is a field of `BalanceResult`.

## StressInput and StressResult

`StressInput` contains integer days lost from 0–366, a finite rate-decrease percentage from
0–100 in hundredth-percent increments, and extra annual expense cents from 0–10,000,000. The
percentage boundary tolerates only bounded binary floating-point representation error before
converting the validated value to integer basis points. The UI rejects euro amounts that do not
represent whole cents. `StressResult` contains the validated inputs, remaining days
(`max(0, billedDays - lostDays)`), adjusted rate (rounded to whole cents), current and stressed
micro annual net/economic values, each engine confidence and warning list, and stressed/current
differences from employee annual net and economic value. All annual money results are integer
cents, including signed deltas.

## ComparisonRow

An ephemeral row consists of a safe display label/source, `referenceYear`, micro and employee
worked days, annual net before income tax and annual economic value for both statuses. It
excludes retirement, tax and unvalidated annualization.
