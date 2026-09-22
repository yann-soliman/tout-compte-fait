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

- **Decision**: Retain `25.6%`, not the earlier research lead of `26.1%`, for non-Cipav liberal
  activities from 1 January 2026. The directly consulted 2026 institutional publications state
  `25.6%`; no earlier schedule or remembered value overrides the current publication.
- **Rationale**: Service Public Entreprendre's “Régime micro-social”, verified on 21 February 2026,
  and its retirement worked example, verified on 1 April 2026, independently publish the same rate
  and scope. The professional-training contribution is separate at `0.2%` of annual turnover.
- **Official evidence**: Service Public Entreprendre,
  [“Régime micro-social”](https://entreprendre.service-public.gouv.fr/vosdroits/F37353),
  [“Contribution à la formation professionnelle”](https://entreprendre.service-public.gouv.fr/vosdroits/F23459)
  and [“Régime de retraite du micro-entrepreneur”](https://entreprendre.service-public.gouv.fr/vosdroits/F23369).
- **Alternatives considered**: Use `26.1%` from the superseded research lead (rejected because it
  conflicts with the directly readable publications current in 2026); combine CFP with the
  micro-social rate (rejected because the official pages identify separate contributions).

## 2026 micro ceiling and CFE

- **Decision**: Model the two-consecutive-year exit rule, partial-year ceiling proration and missing
  history warning independently from the known 2026 BNC/services ceiling of `€83,600`. Require a
  user-supplied CFE amount or explicit exemption confirmation.
- **Rationale**: The prior `€77,700` ceiling covered 2023–2025 and must not leak into 2026. CFE has no
  universal national amount: it depends on local base/rate and exemptions. The feature deliberately
  lacks the two prior turnover years and therefore cannot establish eligibility.
- **Official evidence**: Service Public Entreprendre,
  [micro regime F23267](https://entreprendre.service-public.fr/vosdroits/F23267) and
  [CFE F23547](https://entreprendre.service-public.fr/vosdroits/F23547).
- **Alternatives considered**: Retain the expired `€77,700` ceiling (rejected because the current
  publication explicitly gives `€83,600` for 2026); use a national CFE estimate (rejected because
  none exists).

## T002 evidence register — directly consulted on 2026-09-22

| Rule                               | Official body and document                                                                                                  | Canonical URL                                                | Exact value or formula; base and scope                                                                                                                                                                                                                | Effective date                                     | Threshold and rounding rule                                                                                                                                                                                               | Status                                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Micro-social rate                  | Direction de l'information légale et administrative (DILA) / Ministry of Finance, “Régime micro-social”                     | https://entreprendre.service-public.gouv.fr/vosdroits/F37353 | `25.6% × turnover` for a non-Cipav liberal profession; turnover collected in the monthly or quarterly declaration                                                                                                                                     | 1 January 2026; page verified 21 February 2026     | Applied to declared turnover. The page does not publish a sub-cent rounding rule; calculation code must therefore retain exact rate arithmetic and expose any final rounding separately.                                  | **Known** for the rate, base, scope and date; regulatory sub-cent rounding not stated on this page |
| Professional-training contribution | DILA, “Contribution à la formation professionnelle (CFP) des entrepreneurs individuels (y compris des micro-entrepreneurs)” | https://entreprendre.service-public.gouv.fr/vosdroits/F23459 | `0.2% × annual turnover` for a liberal activity                                                                                                                                                                                                       | Page verified 1 January 2026                       | No minimum threshold stated for the formula and no sub-cent rounding instruction published on the page.                                                                                                                   | **Known** for the rate, annual base and scope                                                      |
| Micro ceiling                      | DILA / Ministry of Finance, “Régime fiscal de la micro-entreprise”                                                          | https://entreprendre.service-public.gouv.fr/vosdroits/F23267 | `€83,600` turnover excluding tax for services (BIC) and liberal activity (BNC)                                                                                                                                                                        | Income received in 2026; page verified 13 May 2026 | Eligibility when turnover in N-1 **or** N-2 has not exceeded the ceiling; one isolated year above it does not prevent the regime. Comparison is against the euro ceiling as published; no separate rounding is specified. | **Known**                                                                                          |
| New-activity proration             | DILA / Ministry of Finance, “Régime fiscal de la micro-entreprise”                                                          | https://entreprendre.service-public.gouv.fr/vosdroits/F23267 | `(ceiling in N × days of existence in N) / 365`, except seasonal businesses; full ceiling from N+1                                                                                                                                                    | First activity year beginning in 2026              | Calendar-day proration over 365. The page's worked example reports whole euros but does not state a normative cent-rounding mode, so implementation must not invent one.                                                  | **Known** for the formula; exact regulatory rounding remains unspecified                           |
| Two-year rule                      | DILA / Ministry of Finance, “Régime fiscal de la micro-entreprise”                                                          | https://entreprendre.service-public.gouv.fr/vosdroits/F23267 | N uses turnover in N-1 or N-2; exceeding in only one of those years does not remove the regime                                                                                                                                                        | 2026 regime                                        | Loss of eligibility requires the relevant ceiling to be exceeded for two consecutive reference years; no monetary rounding is involved. The application cannot confirm this without 2024–2025 turnover.                   | **Known**, scenario eligibility remains **not confirmed**                                          |
| CFE and exemptions                 | DILA / Ministry of Finance, “Cotisation foncière des entreprises (CFE)”                                                     | https://entreprendre.service-public.gouv.fr/vosdroits/F23547 | Local tax based on rental value or a municipal minimum base; no national flat amount. Exemption in the creation year; `50%` base reduction the next year; exemption when N-2 turnover does not exceed `€5,000`, subject to the page's proration rule. | CFE due in 2026; page verified 2 April 2026        | Local amount must be entered or an applicable exemption confirmed. The page states local calculation and euro ranges but no universal rounding rule.                                                                      | Principle and listed exemptions **known**; individual amount **estimative** until entered          |

All five publications cited above were downloaded successfully from the institutional `service-public.gouv.fr`
domain and their substantive text was readable. This register replaces the earlier failed-access
statement for T002 only; it does not imply that blocked Légifrance, Urssaf, BOSS or Agirc-Arrco
publications were consulted.

## T003 evidence register — directly consulted on 2026-09-22

The DILA publication [“Cotisations salariales — Salarié du secteur
privé”](https://entreprendre.service-public.gouv.fr/vosdroits/F2302), verified on 1 January 2026,
was directly readable. It confirms a monthly PASS of `€4,005` (hence `€48,060` annually), employee
old-age rates of `6.90%` up to one PASS and `0.40%` on total pay, and a CSG/CRDS base of `98.25%` up
to `€192,240` then `100%` above it. It gives CSG `9.2%` (including `2.4%` non-deductible) and CRDS
`0.5%`. For Agirc-Arrco employee deductions it publishes T1 `3.15%`, T2 `8.64%`, CEG T1 `0.86%`,
CEG T2 `1.08%`, and CET `0.14%` when pay exceeds one PASS, through eight PASS (`€32,040` monthly).
It also publishes the cadre Apec employee rate `0.024%` through four PASS (`€16,020` monthly).

| Rule                            | Official body and document                                | Canonical URL                                               | Exact value or formula; base and scope                                                                     | Effective date                   | Threshold and rounding rule                                                                                                                                                                                                                                          | Status                                                                     |
| ------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| PASS                            | DILA, “Cotisations salariales — Salarié du secteur privé” | https://entreprendre.service-public.gouv.fr/vosdroits/F2302 | `€4,005` monthly and `€48,060` annually                                                                    | Page verified 1 January 2026     | T1 through 1 PASS, T2 through 8 PASS and Apec through 4 PASS                                                                                                                                                                                                         | **Known**                                                                  |
| General old age                 | DILA, same document                                       | https://entreprendre.service-public.gouv.fr/vosdroits/F2302 | Employee share `6.90%` of gross up to 1 PASS plus `0.40%` of total gross                                   | 2026 payroll                     | Each rate has its own base; no aggregate employee rate is used                                                                                                                                                                                                       | **Known**                                                                  |
| CSG/CRDS                        | DILA, same document                                       | https://entreprendre.service-public.gouv.fr/vosdroits/F2302 | `98.25%` of gross through `€192,240`, then `100%`; CSG `9.2%` including `2.4%` non-deductible, CRDS `0.5%` | 2026 payroll                     | Four-PASS base boundary is inclusive on the reduced base                                                                                                                                                                                                             | **Known**                                                                  |
| Agirc-Arrco employee deductions | DILA, same document                                       | https://entreprendre.service-public.gouv.fr/vosdroits/F2302 | T1 `3.15%`, T2 `8.64%`; CEG T1 `0.86%`, T2 `1.08%`; CET `0.14%` on T1+T2 once gross exceeds 1 PASS         | 2026 payroll                     | T1 ends at 1 PASS; T2 ends at 8 PASS; CET trigger is strictly above 1 PASS                                                                                                                                                                                           | **Known** for payroll deductions, not for point acquisition                |
| Apec                            | DILA, same document                                       | https://entreprendre.service-public.gouv.fr/vosdroits/F2302 | Employee share `0.024%` of gross through 4 PASS, cadres only                                               | 2026 payroll                     | No contribution above 4 PASS                                                                                                                                                                                                                                         | **Known**                                                                  |
| Payroll amounts and rounding    | DILA, “Fiche de paie”                                     | https://entreprendre.service-public.gouv.fr/vosdroits/F559  | The payslip must display each base, employee rate and contribution amount                                  | Page consulted 22 September 2026 | Neither F559 nor F2302 prescribes a universal statutory sub-cent rounding mode. The application must retain exact rational intermediates and round only monetary output to the nearest cent, explicitly as an application presentation rule rather than legislation. | Statutory inputs **known**; absence of a published universal mode recorded |

T003 is complete because the directly consulted institutional publications establish every requested
2026 input and delimit the rounding evidence honestly: no legal rounding mode is asserted where the
publication supplies none. BOSS and Agirc-Arrco remain useful corroborating sources but were not
treated as consulted while their sites were unreadable.

## T004 evidence register — directly consulted on 2026-09-22

| Rule                                | Official body and document                       | Canonical URL                                                | Exact value or formula; base and scope                                                                                                                                                  | Effective date             | Threshold and rounding rule                                                                                                       | Status                                          |
| ----------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Affiliation                         | DILA, “Régime de retraite du micro-entrepreneur” | https://entreprendre.service-public.gouv.fr/vosdroits/F23369 | A non-Cipav micro-entrepreneur is attached to L'Assurance retraite for base retirement; regulated professions listed by the page may instead be Cipav and are outside the feature scope | Page verified 1 April 2026 | Classification is qualitative; unsupported Cipav cases must return out-of-scope                                                   | **Known** for the supported non-Cipav scope     |
| Micro global contribution           | DILA, same document                              | https://entreprendre.service-public.gouv.fr/vosdroits/F23369 | `25.6% × declared turnover` for a non-Cipav liberal activity                                                                                                                            | From 1 January 2026        | Calculated for each monthly or quarterly declaration                                                                              | **Known**                                       |
| Base-retirement allocation          | DILA, same document                              | https://entreprendre.service-public.gouv.fr/vosdroits/F23369 | `46.40%` of the micro global contribution is allocated to base retirement                                                                                                               | 2026                       | The page's examples display allocated contribution amounts at whole euros but do not state a normative intermediate rounding mode | **Known** for allocation; example rounding only |
| Qualifying base                     | DILA, same document                              | https://entreprendre.service-public.gouv.fr/vosdroits/F23369 | Sum of base-retirement allocations divided by `17.87%`                                                                                                                                  | 2026                       | Exact formula; retain rational precision until the entitlement comparison                                                         | **Known**                                       |
| Quarter threshold                   | DILA, same document                              | https://entreprendre.service-public.gouv.fr/vosdroits/F23369 | One quarter per `€1,803.00` of qualifying base, equal to 150 times the hourly minimum wage on 1 January                                                                                 | 2026                       | Integer number of complete thresholds; fractions do not create a quarter                                                          | **Known**                                       |
| Annual maximum and pension base cap | DILA, same document                              | https://entreprendre.service-public.gouv.fr/vosdroits/F23369 | Maximum 4 quarters per year; income used for the base pension cannot exceed `€48,060`                                                                                                   | 2026                       | Cap after counting complete thresholds; base-pension amount remains not calculable from 2026 alone                                | **Known**                                       |

## 2026 employee net scope

- **Decision**: Calculate a “statutory employee net before income tax” from general mainland private
  employee deductions only. Exclude local Alsace-Moselle, apprentices, corporate officers,
  exemptions, collective-agreement deviations, employee health insurance, provident cover, meals
  and transport unless a later specification adds their inputs. Expose these exclusions beside the
  result.
- **Rationale**: Gross salary alone cannot yield a universal payslip net. A bounded statutory result
  is reproducible; an unexplained approximate aggregate rate is not.
- **Verified payroll parameters**: The T003 register above establishes the 2026 PASS, old-age,
  CSG/CRDS, employee Agirc-Arrco, CEG, CET and Apec deductions. These payroll deductions are distinct
  from the contribution rates that generate Agirc-Arrco points, which remain blocked under T005.
- **Additional corroborating sources not consulted directly**: Urssaf,
  [list of contributions](https://www.urssaf.fr/accueil/employeur/cotisations/liste-cotisations.html);
  BOSS, “Plafond de la sécurité sociale” and “CSG-CRDS”; Agirc-Arrco,
  [Paramètres utiles](https://www.agirc-arrco.fr/entreprises/declarer-et-payer/parametres-utiles/).
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

## T005 blocking finding — consulted on 2026-09-22

The directly readable 2026 version of DILA's “Régime de retraite du micro-entrepreneur” does publish
a `21.726 €` purchase value, a `19.75%` allocation and whole-point rounding down for some commercial
and service examples. It does **not** establish those parameters for the feature's non-regulated BNC
liberal scope. In that branch, the same page instead directs liberal professionals to CNAVPL and says
that the complementary scheme varies by professional group. Reusing the commercial/service SSI
example for the selected liberal activity would therefore be an unsupported cross-scope inference.

The Agirc-Arrco website was reached but returned only its antibot rejection page, so its 2026 purchase
and service values and point-rounding rule were not directly consulted. T005 therefore completes with
those values explicitly unresolved and blocked. This permits the income MVP to use its independently
verified rules, but no complementary-retirement result may be implemented until authoritative
publications resolve the employee parameters and applicable liberal regime.

### T005 evidence register

| Rule                                   | Official body and document                                    | Canonical URL                                                                             | Exact value or formula; base and scope                                                                                                               | Effective date             | Threshold and rounding rule                                                                                       | Status                                            |
| -------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Agirc-Arrco points                     | Agirc-Arrco, “Les points de retraite” and “Paramètres utiles” | https://www.agirc-arrco.fr/particuliers/mes-services-particuliers/les-points-de-retraite/ | General formula: contribution base × point-calculation rate ÷ purchase value                                                                         | 2026 values required       | Site reached only through an antibot rejection; 2026 purchase value, service value and rounding could not be read | **Provisional — blocked from calculation**        |
| Micro SSI points shown by DILA         | DILA, “Régime de retraite du micro-entrepreneur”              | https://entreprendre.service-public.gouv.fr/vosdroits/F23369                              | For the page's commercial/service branches only: complementary allocation `19.75%`, purchase value `€21.726`, points rounded down to the whole point | Page verified 1 April 2026 | Not applicable to the selected non-regulated liberal BNC branch                                                   | **Known but out of scope**                        |
| Supported liberal complementary regime | DILA, same document                                           | https://entreprendre.service-public.gouv.fr/vosdroits/F23369                              | The liberal branch directs the reader to CNAVPL and states that the complementary regime varies with the professional group                          | 2026                       | No single SSI purchase/service value can be assigned to the feature's fixed liberal classification                | **Unresolved — block complementary micro result** |

T005 is complete as a verification task: it establishes which formulas are directly supported and,
critically, which requested parameters are unavailable or outside the selected scope. Completion does
not promote those parameters to `known`; the catalogue must omit them and block the corresponding
retirement results until a future specification resolves the affiliation.

## Research gate and unresolved statutory evidence

- **Decision**: Treat institutional verification as a blocking implementation gate. The plan and
  design may proceed, but tasks that encode statutory values must first replace every provisional
  lead with a directly consulted official publication, record its date, and update the specification
  parameter status and checklist.
- **Rationale**: The web research service still returns HTTP 401, and several primary sites remain
  protected by Envoy, Cloudflare or an antibot page. Service Public Entreprendre is directly readable,
  so only rules supported there were promoted. Claiming verification for the remaining complementary
  retirement parameters would be false and would violate the constitution.
- **Alternatives considered**: Stop all design work (rejected because entity, interface and test
  design do not depend on the final numbers); treat secondary memory as verification (rejected).

## Implementation verification attempt — 2026-09-22

The implementation phase retried the primary institutional entry points. The web research service
returned HTTP 401 before opening any URL. Direct `curl` diagnostics reached a Cloudflare challenge
at Légifrance, received short Envoy 503 responses for Urssaf and BOSS, and reached an Agirc-Arrco
antibot rejection page. Service Public Entreprendre and L'Assurance retraite home content were
readable; the specific Assurance retraite URLs cited by the planning research now return a genuine
institutional 404. Consequently:

- T002 is verified and checked from directly readable DILA publications;
- T003 records the directly published employee parameters and explicitly treats cent rounding as an
  application presentation rule, not as an invented statutory rule;
- T004 is verified from the directly readable 2026 micro-retirement publication;
- T005 records Agirc-Arrco's 2026 point parameters and the SSI complementary rule for the supported
  liberal scope as unresolved and blocked because neither was directly readable and applicable;
- no T005 provisional lead was promoted to `known`;
- the regulatory checklist remains incomplete;
- statutory catalogue and user-story implementation remain blocked by the Phase 1 checkpoint.

Only T002 values supported by the directly consulted current pages are marked known. The remaining
network failure is an execution-environment limitation, not evidence that any blocked publication is
absent or that a provisional value is correct.
