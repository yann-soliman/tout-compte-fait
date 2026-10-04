# Data Model

## ComplementaryRegimeRules

Affiliation label; required purchase/service values and optional generation bands/allocation depending on regime. Point values carry integer units of0.0001 € and source metadata (authority, title, URL, effective and verification dates, status). Prices strictly positive; rates ppm integers. Separate `employee` and `micro` entries prevent mixing regimes. Any required invalid/unverified metadata blocks that regime locally.

## RetirementRegimeResult

Preserve existing shape: `points` number or `unavailable`, `indicativeAnnualPension` integer cents or `unavailable`, confidence `estimated` or `blocked`, sources and limitation. Base remains quarters/qualifyingIncome; its points and standalone pension stay unavailable. Numeric points are rounded display values, not statutory integer entitlements. Pension derives from exact pre-display fraction.

## Transitions

Known usable rules + supported scenario -> estimated. Missing/provisional/invalid required complementary rule -> blocked with no false zero. Zero income + usable rules -> estimated numeric zero. Unsupported affiliation -> existing out-of-scope rejection. Retirement disabled -> no retirement result and no financial change.
