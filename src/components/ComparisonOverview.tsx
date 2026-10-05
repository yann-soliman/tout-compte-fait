import type { ComparisonResult, ComparisonScenario } from '../domain/model'
import { formatCents, forPeriod } from '../domain/calculate'
import { calculateEiIncome, type EiResult } from '../domain/ei'
import { calculateAfterTaxComparison, type AfterTaxAlternative } from '../domain/income-tax'
import { parseTaxSettings, type TaxSettings } from '../domain/tax-settings'

interface Props {
  scenario: ComparisonScenario
  comparison: ComparisonResult
  settings: TaxSettings
  eiCfeExemptionConfirmed: boolean
}
export function ComparisonOverview({
  scenario,
  comparison,
  settings,
  eiCfeExemptionConfirmed,
}: Props) {
  let ei: EiResult
  try {
    ei = calculateEiIncome({
      turnover: scenario.micro.dailyRate * scenario.micro.billedDays,
      professionalExpenses: scenario.micro.professionalExpenses,
      cfeAnnual: scenario.micro.cfeAnnual,
      cfeExemptionConfirmed: eiCfeExemptionConfirmed,
      healthInsuranceAnnual: scenario.micro.healthInsuranceMonthly * 12,
    })
  } catch (e) {
    if (!(e instanceof RangeError)) throw e
    ei = { status: 'blocked', reason: e.message, sources: [] }
  }
  let after: Record<'employee' | 'micro' | 'ei', AfterTaxAlternative> | undefined
  let taxError: string | undefined
  if (settings.enabled) {
    try {
      const { household, salaryOverride } = parseTaxSettings(settings)
      after = calculateAfterTaxComparison(scenario, comparison, ei, household, salaryOverride)
    } catch (e) {
      if (!(e instanceof RangeError)) throw e
      taxError = e.message
    }
  }
  const knownMicro =
    scenario.micro.cfeExemptionConfirmed ||
    (scenario.micro.cfeAnnual !== undefined && scenario.micro.cfeAnnual > 0)
  const money = (v: number) => formatCents(forPeriod(v, scenario.displayPeriod))
  const cards = [
    {
      kind: 'employee' as const,
      name: 'Salariat',
      cash: comparison.employee.netIncome,
      blocked: undefined,
      warnings: comparison.employee.warnings ?? [],
    },
    {
      kind: 'micro' as const,
      name: 'Micro-entreprise',
      cash: knownMicro ? comparison.micro.totalValue : undefined,
      blocked: knownMicro ? undefined : 'CFE micro inconnue : disponible indisponible.',
      warnings: comparison.micro.warnings ?? [],
    },
    {
      kind: 'ei' as const,
      name: 'EI au réel',
      cash: ei.status === 'estimated' ? ei.availableBeforeIncomeTax : undefined,
      blocked: ei.status === 'blocked' ? ei.reason : undefined,
      warnings: [],
    },
  ]
  return (
    <section className="comparison-overview" aria-labelledby="overview-title" aria-live="polite">
      <h2 id="overview-title">Synthèse des trois statuts</h2>
      <p className="overview-intro">
        Disponible après frais, CFE et mutuelle ; avantages salariés séparés du cash. Estimations
        2026, hors situations particulières.
      </p>
      <div className="overview-grid">
        {cards.map((card) => {
          const tax = after?.[card.kind]
          return (
            <article
              key={card.kind}
              className={`overview-card overview-card--${card.kind}`}
              aria-labelledby={`overview-title-${card.kind}`}
            >
              <h3 id={`overview-title-${card.kind}`}>{card.name}</h3>
              <dl>
                <div>
                  <dt>Disponible avant IR</dt>
                  <dd className="overview-cash" data-testid={`overview-${card.kind}-before`}>
                    {card.cash === undefined ? 'Indisponible' : money(card.cash)}
                    {card.cash !== undefined && (
                      <small> /{scenario.displayPeriod === 'annual' ? 'an' : 'mois'}</small>
                    )}
                  </dd>
                </div>
                {settings.enabled && (
                  <div>
                    <dt>Disponible après IR — projection</dt>
                    <dd
                      className="overview-cash overview-cash--after"
                      data-testid={`overview-${card.kind}-after`}
                    >
                      {tax?.status === 'estimated' ? money(tax.cashAfter) : 'Indisponible'}
                      {tax?.status === 'estimated' && (
                        <small> /{scenario.displayPeriod === 'annual' ? 'an' : 'mois'}</small>
                      )}
                    </dd>
                  </div>
                )}
                {card.kind === 'employee' && (
                  <div>
                    <dt>Avantages hors cash et hors IR</dt>
                    <dd data-testid="overview-employee-benefits">
                      {money(comparison.employee.annualBenefits ?? 0)}
                    </dd>
                  </div>
                )}
              </dl>
              {card.blocked && <p className="overview-warning">{card.blocked}</p>}
              {tax?.status === 'blocked' && <p className="overview-warning">{tax.reason}</p>}
              {card.warnings.map((w) => (
                <p key={w.code} className="overview-warning">
                  {w.message}
                </p>
              ))}
              {card.kind === 'ei' && (
                <p className="overview-limit">
                  BNC hors Cipav, année pleine ; hors ACRE et Madelin. Cotisations arrondies à
                  l’euro.
                </p>
              )}
            </article>
          )
        })}
      </div>
      {taxError && (
        <p role="alert" className="overview-warning">
          Projection fiscale indisponible : {taxError}
        </p>
      )}
      {settings.enabled && (
        <p className="overview-intro">
          Revenus 2026 au barème 2026 sur revenus 2025, à référence constante — pas un impôt
          définitif. Seul l’IR supplémentaire de l’activité est soustrait ; ni cash du conjoint, ni
          prélèvement à la source soustrait en plus.
        </p>
      )}
      {scenario.displayPeriod === 'monthly' && (
        <p className="overview-intro">
          Moyenne annuelle divisée par 12 ; pas un échéancier de trésorerie.
        </p>
      )}
    </section>
  )
}
