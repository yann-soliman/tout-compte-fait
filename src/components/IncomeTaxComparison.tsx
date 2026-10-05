import { useId, useMemo } from 'react'
import type { ComparisonResult, ComparisonScenario } from '../domain/model'
import { calculateEiIncome } from '../domain/ei'
import { calculateAfterTaxComparison, defaultTaxHousehold } from '../domain/income-tax'
import { incomeTaxReference } from '../domain/rules/income-tax-reference'
import { eurosToMoneyCents } from '../domain/money'
import { formatCents, forPeriod } from '../domain/calculate'
import { RuleDisclosure } from './ui/RuleDisclosure'

import { type TaxSettings } from '../domain/tax-settings'
interface InputsProps {
  settings: TaxSettings
  onChange: (value: TaxSettings) => void
}
function parse(settings: TaxSettings) {
  if (settings.otherIncomeEuros.trim() === '')
    throw new RangeError('Renseigner les autres revenus nets imposables, ou zéro.')
  return {
    household: {
      ...defaultTaxHousehold,
      status: settings.status,
      children: settings.children,
      otherTaxableIncome: eurosToMoneyCents(Number(settings.otherIncomeEuros)),
    },
    salaryOverride:
      settings.salaryNetTaxableEuros.trim() === ''
        ? undefined
        : eurosToMoneyCents(Number(settings.salaryNetTaxableEuros)),
  }
}
export function IncomeTaxInputs({ settings, onChange }: InputsProps) {
  const id = useId()
  let error: string | undefined
  try {
    parse(settings)
  } catch (e) {
    error = e instanceof Error ? e.message : 'Hypothèses invalides.'
  }
  return (
    <section className="tax-inputs" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>Hypothèses d’impôt sur le revenu</h2>
      <p className="projection-caveat">
        Projection des revenus 2026 au barème 2026 sur revenus 2025 : pas un impôt définitif ni un
        barème 2027 adopté.
      </p>
      <label className="toggle-card toggle-card--compact">
        <span>Estimer le disponible après impôt</span>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => onChange({ ...settings, enabled: e.target.checked })}
        />
        <span className="switch" aria-hidden="true" />
      </label>
      {settings.enabled && (
        <>
          <div className="tax-input-grid">
            <label className="field">
              Situation du foyer fiscal
              <select
                value={settings.status}
                onChange={(e) =>
                  onChange({ ...settings, status: e.target.value as TaxSettings['status'] })
                }
              >
                <option value="single">Célibataire — hors parent isolé</option>
                <option value="couple">Couple marié ou pacsé — imposition commune</option>
              </select>
            </label>
            <label className="field">
              Enfants à charge exclusive
              <select
                value={settings.children}
                onChange={(e) => onChange({ ...settings, children: Number(e.target.value) })}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Autres revenus nets imposables au barème (€/an)
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.otherIncomeEuros}
                aria-invalid={error ? true : undefined}
                onChange={(e) => onChange({ ...settings, otherIncomeEuros: e.target.value })}
              />
            </label>
            <label className="field">
              Net imposable salarial réel avant déduction de 10 % (€/an, facultatif)
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.salaryNetTaxableEuros}
                aria-invalid={error ? true : undefined}
                onChange={(e) => onChange({ ...settings, salaryNetTaxableEuros: e.target.value })}
              />
            </label>
          </div>
          {error && (
            <p className="field__error" role="alert">
              {error}
            </p>
          )}
          <p className="projection-caveat">
            Autres revenus déjà après déductions catégorielles ; leur cash n’est pas ajouté au
            disponible. Sans saisie de paie, net imposable salarial estimé hors mutuelle employeur
            et avantages imposables. Hypothèses fiscales non enregistrées dans les offres ;
            chargement et reset les réinitialisent.
          </p>
        </>
      )}
    </section>
  )
}
interface ResultsProps {
  settings: TaxSettings
  scenario: ComparisonScenario
  comparison: ComparisonResult
  eiCfeExemptionConfirmed: boolean
}
export function IncomeTaxComparison({
  settings,
  scenario,
  comparison,
  eiCfeExemptionConfirmed,
}: ResultsProps) {
  const calculation = useMemo(() => {
    if (!settings.enabled) return undefined
    try {
      const { household, salaryOverride } = parse(settings)
      let ei
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
        ei = { status: 'blocked' as const, reason: e.message, sources: [] }
      }
      return {
        result: calculateAfterTaxComparison(scenario, comparison, ei, household, salaryOverride),
      }
    } catch (e) {
      if (!(e instanceof RangeError)) throw e
      return { error: e.message }
    }
  }, [settings, scenario, comparison, eiCfeExemptionConfirmed])
  if (!settings.enabled || !calculation) return null
  const money = (v: number) => formatCents(forPeriod(v, scenario.displayPeriod))
  const period = scenario.displayPeriod === 'annual' ? '/an' : '/mois'
  return (
    <section
      className="income-tax-comparison"
      aria-labelledby="income-tax-title"
      aria-live="polite"
    >
      <h2 id="income-tax-title">Disponible après impôt — projection</h2>
      <p>
        Revenus 2026 au barème 2026 sur revenus 2025, à référence constante. Estimation hors
        situations particulières.
      </p>
      <p>
        IR supplémentaire = impôt du foyer avec l’activité − impôt du même foyer sans l’activité. Le
        cash des autres revenus et les avantages salariés ne sont pas inclus. Aucun prélèvement à la
        source soustrait en plus.
      </p>
      {calculation.error ? (
        <p role="alert">{calculation.error}</p>
      ) : (
        <div className="after-tax-grid">
          {(['employee', 'micro', 'ei'] as const).map((kind) => {
            const item = calculation.result?.[kind]
            if (!item) return null
            const name = { employee: 'Salariat', micro: 'Micro', ei: 'EI au réel' }[kind]
            return (
              <article key={kind} className="after-tax-card" aria-labelledby={`after-tax-${kind}`}>
                <h3 id={`after-tax-${kind}`}>{name} — après IR</h3>
                {item.status === 'blocked' ? (
                  <p>{item.reason}</p>
                ) : (
                  <>
                    <strong className="after-tax-cash" data-testid={`tax-${kind}-cash`}>
                      {money(item.cashAfter)} <small>{period}</small>
                    </strong>
                    <dl className="result-metrics">
                      <div>
                        <dt>Cash avant IR hors avantages</dt>
                        <dd>{money(item.cashBefore)}</dd>
                      </div>
                      <div>
                        <dt>Base fiscale de l’activité</dt>
                        <dd>{money(item.taxableIncome)}</dd>
                      </div>
                      <div>
                        <dt>IR total du foyer</dt>
                        <dd>{money(item.householdTax)}</dd>
                      </div>
                      <div>
                        <dt>IR du foyer sans cette activité</dt>
                        <dd>{money(item.baselineTax)}</dd>
                      </div>
                      <div>
                        <dt>IR supplémentaire de l’activité</dt>
                        <dd>{money(item.additionalTax)}</dd>
                      </div>
                      <div>
                        <dt>Parts fiscales</dt>
                        <dd>{item.parts}</dd>
                      </div>
                    </dl>
                  </>
                )}
                {kind === 'micro' && (
                  <p>
                    Simulation fiscale sous hypothèse de maintien au régime micro, sans versement
                    libératoire. Éligibilité non confirmée ;{' '}
                    {comparison.micro.eligibility?.state === 'ceiling-exceeded'
                      ? 'plafond dépassé.'
                      : 'historique requis.'}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
      {scenario.displayPeriod === 'monthly' && (
        <p>
          Moyenne annuelle divisée par 12 ; affichages arrondis indépendamment, pas un échéancier de
          paiement.
        </p>
      )}
      <details className="deduction-details">
        <summary>Bases fiscales et limites après IR</summary>
        <p>
          Salaire : net avant IR + CSG/CRDS non déductible, ou net imposable de paie saisi, puis
          forfait 10 % borné. Micro : recettes − abattement BNC de 34 %, minimum 305 € limité aux
          recettes ; pas de frais réels supplémentaires. EI : net avant mutuelle + CSG/CRDS non
          déductible ; mutuelle personnelle non Madelin non déduite fiscalement. Cotisations
          supposées payées sur l’année, sans décalage de régularisation.
        </p>
        <p>
          France métropolitaine, foyer simple hors parent isolé, veuvage, garde alternée,
          âge/invalidité donnant droit à abattements, enfants mariés rattachés, déficits/report,
          PER, revenus exceptionnels/étrangers/PFU, crédits/réductions, versement libératoire et
          CEHR/CDHR. Autres revenus nets imposables seuls ne décrivent pas un revenu fiscal de
          référence spécial. Au-delà des seuils de hauts revenus, résultat bloqué. Fiscalité et
          prélèvements propres aux autres revenus non calculés.
        </p>
        <p>
          Barème et abattements de référence 2026 sur revenus 2025. Déclaration et cotisations
          réelles peuvent modifier les bases ; barème des revenus 2026 à mettre à jour une fois
          adopté. Les montants fiscaux sont arrondis à l’euro ; cash conservé en centimes. Outils de
          décision, carte, projection, offres, exports et rapport restent avant IR.
        </p>
      </details>
      <RuleDisclosure sources={[...incomeTaxReference.sources]} />
    </section>
  )
}
