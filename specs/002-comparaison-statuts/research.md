# Research: Comparaison des statuts 2026

**Research date**: 2026-09-22

This document records implementation decisions and the official evidence required by the
source-backed-calculation gate. A value is usable as an established 2026 result only when an official
publication explicitly supports its effective period and scope.

## Exact arithmetic and rounding

- **Decision**: Represent money as integer cents and rates as fixed-point integers. Each regulatory
  rule owns its base, band boundaries and rounding instruction; intermediate values remain exact
  until that instruction or final display rounding applies.
- **Rationale**: Floating-point percentages can cross a one-cent statutory boundary or make displayed
  components fail to reconcile. Rule-local rounding allows boundary tests to mirror official rules.
- **Alternatives considered**: Binary floating point is simpler but not exact for decimal money;
  adding a decimal runtime dependency is unnecessary for the bounded operations in this feature.

## Regulatory catalogue and provenance

- **Decision**: Store a static, year-keyed catalogue whose individual rules include authority,
  document title, canonical URL, effective date, verification date and confidence status. Reject a
  year mismatch and prevent an absent/unverified required rule from producing an established result.
- **Rationale**: Rules change independently, and the constitution requires every output to expose its
  reference year and source. Static data preserves offline calculation and reproducibility.
- **Alternatives considered**: Runtime retrieval would make results depend on availability and mutate
  without review; embedding anonymous constants in formulas would remove traceability.

## Calculation boundaries

- **Decision**: Split scenario validation, micro eligibility, micro contributions, employee
  contributions, retirement rights, economic comparison and projection into pure domain functions.
  React receives a typed aggregate result with warnings and source references.
- **Rationale**: Each function can be tested one cent below, at and above every boundary without UI
  involvement, while the interface remains a compact presentation layer.
- **Alternatives considered**: A single calculation function resembles the prototype but obscures
  independent rules and makes statutory regression diagnosis difficult.

## Micro eligibility without prior-year turnover

- **Decision**: Calculate against the applicable 2026 ceiling but always return eligibility
  `not-confirmed` when within it; return `ceiling-exceeded` when above it. Apply official partial-year
  proration when the activity began during 2026.
- **Rationale**: The clarified scope deliberately excludes 2024–2025 turnover, although final regime
  eligibility depends on history. A warning is more accurate than inferring eligibility.
- **Alternatives considered**: Collecting history was rejected during clarification; assuming
  eligibility would make a legally significant unsupported claim.

## Salary and work ratio

- **Decision**: Treat the entered annual gross salary as already corresponding to the selected work
  ratio. Use category (`cadre` or `non-cadre`) to select applicable contribution rules, while work
  ratio only affects time-derived indicators.
- **Rationale**: This matches the clarified input contract and prevents double proration.
- **Alternatives considered**: Accepting full-time-equivalent salary was rejected; supporting two
  input modes would add ambiguity and tests without requested value.

## Retirement valuation

- **Decision**: Calculate 2026 quarters and points first. Show a separate indicative annual pension
  only for additive point-based rights using verified 2026 service parameters; for the base regime,
  show quarters and qualifying income with `not calculable from 2026 alone`. Exclude every retirement
  indicator from net income and economic value.
- **Rationale**: This honors the clarified request for a monetary indicator where one year's rights
  are additive, without fabricating a standalone base pension or presenting one year as the complete
  future pension.
- **Alternatives considered**: Monetising base rights without career and liquidation assumptions was
  rejected as misleading; treating paid contributions as income would misrepresent both cash and
  pension rights.

## Projection semantics

- **Decision**: Project calculated economic totals with the user-selected growth rate and label every
  projected value as scenario output, not a future statutory result. Do not silently index 2026 rule
  values.
- **Rationale**: Future regulation and investment outcomes are unknown, while the requested projection
  is useful as a transparent sensitivity view.
- **Alternatives considered**: Forecasting future statutes is unsupported; removing projection would
  discard an existing accepted journey.

## 2026 micro-social parameters

- **Decision**: Do not implement the `25.6%` estimate currently recorded in the specification. The
  scheduled rate for non-regulated liberal activities under the general regime is `26.1%` from
  1 January 2026, with a separate `0.2%` professional-training contribution, but both remain blocked
  from established output until the cited texts are opened and their scope rechecked.
- **Rationale**: The staged rates established by decree are 23.1% from July 2024, 24.6% in 2025 and
  26.1% from 2026. Retaining 25.6% would knowingly encode the wrong scheduled value. The execution
  environment returned HTTP 401/403 for all direct institutional access, so this research cannot
  claim a consultation dated 2026-09-22.
- **Official evidence to verify**: Urssaf, “Taux de cotisations”; [Decree no. 2024-484 of 30 May
  2024](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049629378); Service Public Entreprendre,
  [F23267](https://entreprendre.service-public.fr/vosdroits/F23267).
- **Alternatives considered**: Keep 25.6% (rejected as inconsistent with the scheduled decree rate);
  silently accept remembered values (rejected by the constitution).

## 2026 micro ceiling and CFE

- **Decision**: Model the two-consecutive-year exit rule, partial-year ceiling proration and missing
  history warning independently from the numeric ceiling. Keep the likely 2026 BNC/services ceiling
  of `€83,600` provisional and unusable for an established result until the effective 2026 version of
  article 50-0 CGI or equivalent official publication is checked. Require a user-supplied CFE amount
  or explicit exemption confirmation.
- **Rationale**: The prior `€77,700` ceiling covered 2023–2025 and must not leak into 2026. CFE has no
  universal national amount: it depends on local base/rate and exemptions. The feature deliberately
  lacks the two prior turnover years and therefore cannot establish eligibility.
- **Official evidence to verify**: Légifrance, CGI article 50-0; Service Public Entreprendre,
  [micro regime F23267](https://entreprendre.service-public.fr/vosdroits/F23267) and
  [CFE F23547](https://entreprendre.service-public.fr/vosdroits/F23547).
- **Alternatives considered**: Treat the likely ceiling as known (rejected without direct
  verification); use a national CFE estimate (rejected because none exists).

## 2026 employee net scope

- **Decision**: Calculate a “statutory employee net before income tax” from general mainland private
  employee deductions only. Exclude local Alsace-Moselle, apprentices, corporate officers,
  exemptions, collective-agreement deviations, employee health insurance, provident cover, meals
  and transport unless a later specification adds their inputs. Expose these exclusions beside the
  result.
- **Rationale**: Gross salary alone cannot yield a universal payslip net. A bounded statutory result
  is reproducible; an unexplained approximate aggregate rate is not.
- **Parameters to verify before implementation**: 2026 PASS; capped and uncapped old-age employee
  rates; exact CSG/CRDS base and rates; Agirc-Arrco T1/T2 bands, employee shares, CEG and CET; Apec
  employee contribution for cadres; payroll rounding and progressive ceiling regularisation.
- **Official evidence to verify**: Urssaf,
  [list of contributions](https://www.urssaf.fr/accueil/employeur/cotisations/liste-cotisations.html);
  BOSS, “Plafond de la sécurité sociale” and “CSG-CRDS”; Agirc-Arrco,
  [Paramètres utiles](https://www.agirc-arrco.fr/entreprises/declarer-et-payer/parametres-utiles/).
- **Provisional research leads, not implementation constants**: annual/monthly PASS `€48,060 /
€4,005`; old-age employee rates `6.90%` capped and `0.40%` uncapped; CSG `6.80%` deductible plus
  `2.40%` non-deductible and CRDS `0.50%`; Agirc-Arrco point rates `6.20% / 17%`, call factor `127%`,
  and bands at 1 and 8 PASS. Every value remains provisional because direct official access failed.
- **Alternatives considered**: Apply one aggregate deduction rate (rejected as neither exact nor
  sourceable); reproduce every collective payslip variation (outside scope).

## Retirement rights and monetary indication

- **Decision**: Implement base-regime quarter acquisition and point-regime acquisition as separate
  results. Monetise only additive point-based rights using a verified current service value. For the
  base regime, show quarters and the qualifying base but mark a standalone annual-pension amount
  `not calculable from 2026 alone`; do not fabricate an additive value.
- **Rationale**: A base pension depends on average income over the best years, liquidation rate,
  total insurance duration and generation-specific required duration. The clarified scope excludes
  the career and liquidation data needed for a meaningful base-pension amount. Complementary points
  can be multiplied by a service value, with a clear warning that the future liquidation value is
  unknown.
- **Rules to verify before implementation**: one base quarter for earnings equal to 150 times the
  hourly minimum wage on 1 January, capped at four annually; 2026 minimum wage and resulting
  threshold; official micro-social allocation to base/complementary retirement; 2026 point purchase
  and service values for Agirc-Arrco and SSI; supported micro affiliation.
- **Official evidence to verify**: Légifrance, [Social Security Code article
  R351-9](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048703165); Agirc-Arrco,
  [point calculation](https://www.agirc-arrco.fr/particuliers/mes-services-particuliers/les-points-de-retraite/)
  and “Paramètres utiles”; Service Public Entreprendre,
  [F23369](https://entreprendre.service-public.fr/vosdroits/F23369); Assurance retraite,
  “Retraite du micro-entrepreneur”.
- **Alternatives considered**: Fabricate an additive base-pension amount (rejected as misleading);
  add birth year and career history during planning (rejected as an unapproved scope expansion);
  value paid contributions as pension (rejected because contributions are not rights).

## Research gate and unresolved statutory evidence

- **Decision**: Treat institutional verification as a blocking implementation gate. The plan and
  design may proceed, but tasks that encode statutory values must first replace every provisional
  lead with a directly consulted official publication, record its date, and update the specification
  parameter status and checklist.
- **Rationale**: Both the primary agent and all three research workstreams received HTTP 401 from the
  web research service and HTTP 403 from direct institutional requests. Claiming independent
  verification would be false and would violate the constitution.
- **Alternatives considered**: Stop all design work (rejected because entity, interface and test
  design do not depend on the final numbers); treat secondary memory as verification (rejected).

## Implementation verification attempt — 2026-09-22

The implementation phase retried the five primary institutional entry points for the micro-social
schedule, micro regime, social-security ceiling and complementary-retirement parameters. The web
research service returned HTTP 401 and each direct HTTPS request failed at the network tunnel with
HTTP 403 before reaching the institution. Consequently:

- T002–T005 remain unchecked and no claimed consultation date was added to a rule;
- no provisional lead was promoted to `known`;
- the regulatory checklist remains incomplete;
- statutory catalogue and user-story implementation remain blocked by the Phase 1 checkpoint.

This is an execution-environment limitation, not evidence that any cited publication is absent or
that a provisional value is correct.
