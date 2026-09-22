# Data Model: Comparaison des statuts

## Representation conventions

- Represent every monetary amount as integer euro cents (`MoneyCents`).
- Represent rates as integer parts per million (`RatePpm`) so multiplication and rounding are explicit.
- Carry the reference year on both the scenario and regulatory catalogue; only matching years may be combined.
- Attach source metadata to every regulatory rule used in a displayed result.
- Keep user-entered assumptions separate from statutory parameters and calculated outputs.

## Entity: ComparisonScenario

| Field               | Type                    | Validation                                                      |
| ------------------- | ----------------------- | --------------------------------------------------------------- |
| `referenceYear`     | literal `2026`          | Required; other years are outside this increment                |
| `displayPeriod`     | `annual \| monthly`     | Required; monthly is an annual amount divided by 12 for display |
| `activityStartDate` | calendar date or absent | When present, must fall in 2026 and enables ceiling proration   |
| `micro`             | `MicroScenario`         | Exactly one                                                     |
| `employee`          | `EmployeeScenario`      | Exactly one                                                     |
| `retirement`        | `RetirementOptions`     | Exactly one                                                     |
| `projection`        | `ProjectionOptions`     | Exactly one                                                     |

The scenario does not retain turnover for 2024 or 2025. Consequently, its eligibility result cannot
become `confirmed-eligible` solely from 2026 turnover.

## Entity: MicroScenario

| Field                    | Type                    | Validation                                                          |
| ------------------------ | ----------------------- | ------------------------------------------------------------------- |
| `dailyRate`              | `MoneyCents`            | Integer, ≥ 0                                                        |
| `billedDays`             | integer                 | 0–366                                                               |
| `turnover`               | derived `MoneyCents`    | `dailyRate × billedDays`, checked for safe range                    |
| `professionalExpenses`   | `MoneyCents`            | Integer, ≥ 0; economic deduction only                               |
| `healthInsuranceMonthly` | `MoneyCents`            | Integer, ≥ 0; multiplied by 12                                      |
| `cfeAnnual`              | `MoneyCents` or unknown | Integer, ≥ 0 when supplied; unknown makes economic result estimated |
| `cfeExemptionConfirmed`  | boolean                 | Required when CFE is zero                                           |

The supported activity classification is fixed to non-regulated liberal BNC under the 2026
micro-social regime. Other classifications produce `out-of-scope`.

## Entity: EmployeeScenario

| Field               | Type                 | Validation                                                  |
| ------------------- | -------------------- | ----------------------------------------------------------- |
| `grossAnnualSalary` | `MoneyCents`         | Integer, ≥ 0; already reflects the selected work ratio      |
| `category`          | `cadre \| non-cadre` | Required                                                    |
| `workRatioPercent`  | integer              | 1–100; affects worked time only, never salary a second time |
| `paidLeaveWeeks`    | half-week increment  | 0–52                                                        |
| `rttDays`           | integer              | 0–366                                                       |
| `annualBenefits`    | `MoneyCents`         | Integer, ≥ 0; separate from net salary                      |

## Entity: RetirementOptions

| Field           | Type                             | Validation                            |
| --------------- | -------------------------------- | ------------------------------------- |
| `includeRights` | boolean                          | Controls retirement result visibility |
| `valuationMode` | literal `rights-2026-indicative` | Fixed for this increment              |

The valuation covers only annual pension attributable to rights acquired in 2026. It never models
the complete career, retirement age, discount, premium, survivor benefits or guaranteed return.

## Entity: ProjectionOptions

| Field              | Type                    | Validation          |
| ------------------ | ----------------------- | ------------------- |
| `years`            | integer                 | 1–30                |
| `annualGrowthRate` | signed fixed-point rate | −100% through +100% |

Projection growth is an explicit user assumption. It does not change or predict statutory rules.

## Entity: RegulatoryCatalog

| Field                     | Type                         | Validation                                                         |
| ------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `year`                    | literal `2026`               | Must match scenario year                                           |
| `microSocial`             | `ProportionalRule`           | Officially sourced                                                 |
| `professionalTraining`    | `ProportionalRule`           | Officially sourced                                                 |
| `microTurnoverCeiling`    | `ThresholdRule`              | Includes proration and historical caveat                           |
| `employeeContributions`   | ordered `ContributionRule[]` | Separate employee/employer shares; only employee share affects net |
| `socialSecurityCeiling`   | `ThresholdRule`              | Monthly and annual values                                          |
| `baseRetirement`          | `RetirementRuleSet`          | Quarter and pension-credit rules                                   |
| `complementaryRetirement` | `RetirementRuleSet`          | Point acquisition and service values                               |
| `cfe`                     | `QualitativeRule`            | No invented national amount                                        |

### Regulatory rule value objects

- **SourceReference**: authority, document title, canonical URL, publication/effective dates,
  verification date, and `known | provisional | estimated` status.
- **ThresholdRule**: exact amount, inclusive/exclusive comparison, period, proration rule, rounding
  rule, and source reference.
- **ProportionalRule**: exact rate, base, effective interval, rounding rule, and source reference.
- **ContributionRule**: name, applicable employee category, band lower/upper bounds, employee rate,
  deductible status where relevant to displayed breakdown, rounding rule, and source reference.
- **RetirementRuleSet**: regime, qualifying base, thresholds or point formula, annual caps, monetary
  valuation method, rounding rule, and source reference.

## Entity: ComparisonResult

| Field                     | Type                                  | Meaning                                                      |
| ------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| `micro`                   | `StatusResult`                        | Calculated micro outcome                                     |
| `employee`                | `StatusResult`                        | Calculated employee outcome                                  |
| `netIncomeDifference`     | `MoneyCents`                          | Micro less employee                                          |
| `economicValueDifference` | `MoneyCents`                          | Micro less employee                                          |
| `confidence`              | `established \| estimated \| blocked` | Worst status among required inputs/rules                     |
| `warnings`                | `ResultWarning[]`                     | Eligibility, missing CFE, provisional rule and scope notices |

## Entity: StatusResult

- Gross inflow, each statutory deduction, each user-supplied economic cost or benefit.
- Net income before income tax and economic value total.
- Worked days and value per worked day, or `indeterminate` when worked days are zero.
- Retirement result kept outside both net income and economic value.
- Rule references actually used to calculate the result.

## Entity: RetirementResult

- Base-regime qualifying income and validated quarters, capped at four.
- Complementary-regime qualifying base and points acquired when the regime uses points.
- Indicative annual pension attributable solely to 2026 point-based rights, split by regime.
- Base-regime monetary value is `not-calculable-from-2026-alone`; qualifying base and quarters remain visible.
- Assumptions, source references, and `established | estimated | blocked` confidence.

## Entity: EligibilityAssessment

| State              | Trigger                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `not-confirmed`    | 2026 turnover is within the prorated ceiling but prior-year history is absent |
| `ceiling-exceeded` | 2026 turnover is above the applicable prorated ceiling                        |
| `out-of-scope`     | Activity, location, year or regime does not match supported scope             |

There is deliberately no `confirmed-eligible` transition without historical turnover data.

## Calculation and validation order

1. Validate scenario values and supported scope.
2. Derive turnover and worked-day figures without applying regulatory rules.
3. Match the scenario to the 2026 regulatory catalogue; block a result if a required rule is absent.
4. Calculate status-specific contributions using exact band boundaries and legal rounding.
5. Deduct economic costs or add benefits once, without changing statutory bases.
6. Calculate retirement rights and their separate indicative 2026-rights valuation.
7. Derive differences, monthly display values, confidence and warnings.
8. Project annual economic totals using only the declared growth assumption.
