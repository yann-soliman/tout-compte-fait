# Data Model: Compact Simulator Interface

## ComparisonScenario

One locally held comparison edited by the simulator.

| Field              | Type                  | Validation                        |
| ------------------ | --------------------- | --------------------------------- |
| referenceYear      | integer               | Four-digit supported display year |
| period             | `annual` or `monthly` | Required                          |
| householdParts     | decimal               | Greater than zero                 |
| otherTaxableIncome | money                 | Zero or positive                  |
| micro              | MicroScenario         | Required                          |
| employee           | EmployeeScenario      | Required                          |
| retirement         | RetirementScenario    | Required                          |

## MicroScenario

| Field                  | Type    | Validation       |
| ---------------------- | ------- | ---------------- |
| dailyRate              | money   | Zero or positive |
| workedDays             | integer | 0 to 366         |
| annualExpenses         | money   | Zero or positive |
| healthInsuranceMonthly | money   | Zero or positive |
| cfeAnnual              | money   | Zero or positive |

## EmployeeScenario

| Field             | Type       | Validation       |
| ----------------- | ---------- | ---------------- |
| grossAnnualSalary | money      | Zero or positive |
| workRatio         | percentage | 0 to 100         |
| paidLeaveWeeks    | decimal    | 0 to 52          |
| rttDays           | integer    | 0 to 366         |
| annualBenefits    | money      | Zero or positive |

## RetirementScenario

| Field                | Type       | Validation  |
| -------------------- | ---------- | ----------- |
| includeContributions | boolean    | Required    |
| comparisonYears      | integer    | 1 to 30     |
| annualGrowth         | percentage | -100 to 100 |

## StatusResult

Comparable output for either micro-enterprise or salaried employment.

| Field                  | Type                    | Meaning                                                  |
| ---------------------- | ----------------------- | -------------------------------------------------------- |
| netIncome              | money                   | Demonstration disposable amount                          |
| totalValue             | money                   | Net income plus valued benefits and retirement component |
| workedDays             | integer                 | Demonstration annual worked days                         |
| valuePerDay            | money                   | Total value divided by worked days                       |
| retirementContribution | money                   | Demonstration retirement contribution indicator          |
| composition            | list of CompositionPart | Categories used by the donut and legend                  |

## Projection

| Field              | Type    | Meaning                                 |
| ------------------ | ------- | --------------------------------------- |
| year               | integer | Elapsed projection year, starting at 1  |
| microCumulative    | money   | Cumulative micro-enterprise total value |
| employeeCumulative | money   | Cumulative salaried total value         |

## State behaviour

- Changing any input replaces the affected value and recalculates both status results.
- Changing display period transforms visible eligible outputs only.
- Changing view preserves the complete scenario.
- Changing projection duration regenerates the projection series from year 1.
- Invalid draft text remains local to the field and does not enter the domain scenario.
