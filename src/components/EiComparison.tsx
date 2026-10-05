import { useMemo } from 'react'
import { calculateEiIncome, type EiResult } from '../domain/ei'
import { eiRules2026 } from '../domain/rules/ei-2026'
import { formatCents, forPeriod } from '../domain/calculate'
import type { ComparisonResult, ComparisonScenario } from '../domain/model'
import { RuleDisclosure } from './ui/RuleDisclosure'

interface EiComparisonProps {
  scenario: ComparisonScenario
  comparison: ComparisonResult
  cfeExemptionConfirmed: boolean
}

export function EiComparison({ scenario, comparison, cfeExemptionConfirmed }: EiComparisonProps) {
  const micro = scenario.micro
  const result = useMemo<EiResult>(() => {
    try {
      return calculateEiIncome({
        turnover: micro.dailyRate * micro.billedDays,
        professionalExpenses: micro.professionalExpenses,
        cfeAnnual: micro.cfeAnnual,
        cfeExemptionConfirmed,
        healthInsuranceAnnual: micro.healthInsuranceMonthly * 12,
      })
    } catch (error) {
      if (!(error instanceof RangeError)) throw error
      return {
        status: 'blocked',
        reason: error.message,
        sources: Object.values(eiRules2026.sources),
      }
    }
  }, [micro, cfeExemptionConfirmed])
  const money = (value: number) => formatCents(forPeriod(value, scenario.displayPeriod))
  const moneyDifference = (left: number, right: number) => {
    const difference = Number(BigInt(left) - BigInt(right))
    return Number.isSafeInteger(difference)
      ? money(difference)
      : 'Indisponible — écart hors plage sûre'
  }
  const microCashKnown =
    micro.cfeExemptionConfirmed || (micro.cfeAnnual !== undefined && micro.cfeAnnual > 0)
  return (
    <section className="ei-comparison result-card" aria-labelledby="ei-title" aria-live="polite">
      <header className="result-card__topline">
        <h2 id="ei-title">EI au réel — BNC 2026</h2>
        <small>{result.status === 'blocked' ? 'Bloqué' : 'Estimatif'}</small>
      </header>
      <p>Année pleine 2026 · IR avant impôt personnel · hors Cipav, ACRE et Madelin.</p>
      <p>
        CA et frais professionnels communs à la micro et à l’EI. La date de début micro ne prorate
        pas l’EI.
      </p>
      <p>
        Confirmation propre au calcul courant, non sauvegardée dans les offres. Le montant CFE saisi
        est commun sauf exonération EI confirmée.
      </p>
      {result.status === 'blocked' ? (
        <p className="retirement-warning">{result.reason}</p>
      ) : (
        <>
          <div className="result-main">
            <span>Disponible EI avant IR après tous frais</span>
            <strong data-testid="ei-available">{money(result.availableBeforeIncomeTax)}</strong>
            <small>/{scenario.displayPeriod === 'annual' ? 'an' : 'mois'}</small>
          </div>
          <dl className="result-metrics">
            <div>
              <dt>Chiffre d’affaires commun</dt>
              <dd>{money(result.turnover)}</dd>
            </div>
            <div>
              <dt>Frais déductibles, CFE incluse</dt>
              <dd>{money(result.deductibleExpenses)}</dd>
            </div>
            <div>
              <dt>Cotisations et contributions EI</dt>
              <dd>{money(result.contributions)}</dd>
            </div>
            <div>
              <dt>Net EI avant mutuelle personnelle</dt>
              <dd>{money(result.netBeforePersonalInsurance)}</dd>
            </div>
            <div>
              <dt>Mutuelle personnelle non Madelin</dt>
              <dd>{money(result.healthInsuranceAnnual)}</dd>
            </div>
            <div>
              <dt>Assiette sociale après abattement</dt>
              <dd>{money(result.socialBase)}</dd>
            </div>
            <div>
              <dt>Abattement social encadré</dt>
              <dd>{money(result.abatement)}</dd>
            </div>
            <div>
              <dt>Jours facturés communs</dt>
              <dd>{micro.billedDays} j/an</dd>
            </div>
          </dl>
          <h3>Comparer le cash avant impôt</h3>
          <dl className="result-metrics">
            <div>
              <dt>Disponible micro après frais</dt>
              <dd>
                {microCashKnown
                  ? money(comparison.micro.totalValue)
                  : 'Indisponible — CFE micro inconnue'}
              </dd>
            </div>
            <div>
              <dt>Salaire net hors avantages</dt>
              <dd>{money(comparison.employee.netIncome)}</dd>
            </div>
            <div>
              <dt>Écart EI − micro après frais</dt>
              <dd>
                {microCashKnown
                  ? moneyDifference(result.availableBeforeIncomeTax, comparison.micro.totalValue)
                  : 'Indisponible'}
              </dd>
            </div>
            <div>
              <dt>Écart EI − salariat hors avantages</dt>
              <dd>
                {moneyDifference(result.availableBeforeIncomeTax, comparison.employee.netIncome)}
              </dd>
            </div>
            <div>
              <dt>Avantages salariés hors cash</dt>
              <dd>{money(comparison.employee.annualBenefits ?? 0)}</dd>
            </div>
          </dl>
          <p>
            Micro :{' '}
            {comparison.micro.eligibility?.state === 'ceiling-exceeded'
              ? 'plafond dépassé ; vérifier le régime applicable.'
              : 'éligibilité non confirmée sans historique des deux années précédentes.'}
          </p>
          <details className="deduction-details">
            <summary>Détail des cotisations EI</summary>
            <dl>
              {result.deductions.map((line) => (
                <div key={line.id}>
                  <dt>{line.label}</dt>
                  <dd>{money(line.amount)}</dd>
                </div>
              ))}
            </dl>
          </details>
        </>
      )}
      <p>
        Estimation non opposable : CA social, assiette et postes arrondis à l’euro selon le modèle
        officiel ; cash conservé en centimes. Mutuelle personnelle hors assiette sociale.
      </p>
      {scenario.displayPeriod === 'monthly' && (
        <p>
          Moyenne annuelle divisée par 12, arrondis d’affichage indépendants : aucun échéancier de
          trésorerie.
        </p>
      )}
      <details className="deduction-details">
        <summary>Hypothèses et limites EI</summary>
        <p>
          France métropolitaine, BNC libéral non réglementé, année complète hors création et
          exonérations sociales ; sans conjoint collaborateur, invalidité, RSA, activité
          saisonnière, revenus étrangers ou de remplacement, cotisations facultatives ni option RCI
          spécifique. Dépenses professionnelles déductibles supposées justifiées. Retraite EI, impôt
          du foyer, IS et trésorerie non calculés.
        </p>
      </details>
      <RuleDisclosure sources={result.sources} />
    </section>
  )
}
