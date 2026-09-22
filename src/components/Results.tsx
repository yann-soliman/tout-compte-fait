import { ArrowRight, BadgeEuro, Scale } from 'lucide-react'
import { formatCents, forPeriod } from '../domain/calculate'
import type { ComparisonResult, DisplayPeriod, StatusResult } from '../domain/model'
import { ResultNotice } from './ui/ResultNotice'
import { RuleDisclosure } from './ui/RuleDisclosure'

interface ResultsProps {
  result: ComparisonResult
  period: DisplayPeriod
}

function ResultCard({ result, period }: { result: StatusResult; period: DisplayPeriod }) {
  const employee = result.kind === 'employee'
  return (
    <article className={`result-card result-card--${result.kind}`}>
      <div className="result-card__topline">
        <span className="result-dot" />
        <span>{employee ? 'Salariat' : 'Micro-entreprise'}</span>
        <small>{result.confidence === 'established' ? 'Établi' : 'Estimatif'}</small>
      </div>
      <div className="result-main">
        <span>Revenu net avant impôt</span>
        <strong>{formatCents(forPeriod(result.netIncome, period))}</strong>
        <small>/{period === 'annual' ? 'an' : 'mois'}</small>
      </div>
      <dl className="result-metrics">
        <div>
          <dt>{employee ? 'Salaire brut' : 'Chiffre d’affaires'}</dt>
          <dd>{formatCents(forPeriod(result.grossIncome ?? 0, period))}</dd>
        </div>
        <div>
          <dt>Prélèvements</dt>
          <dd>
            {formatCents(
              forPeriod(
                result.statutoryDeductions?.reduce((sum, line) => sum + line.amount, 0) ?? 0,
                period,
              ),
            )}
          </dd>
        </div>
        <div>
          <dt>Valeur économique</dt>
          <dd>{formatCents(forPeriod(result.totalValue, period))}</dd>
        </div>
        {result.kind === 'micro' && (
          <div>
            <dt>Frais économiques</dt>
            <dd>{formatCents(forPeriod(result.economicCosts ?? 0, period))}</dd>
          </div>
        )}
        {result.kind === 'employee' && (
          <div>
            <dt>Avantages</dt>
            <dd>{formatCents(forPeriod(result.annualBenefits ?? 0, period))}</dd>
          </div>
        )}
        <div>
          <dt>Jours travaillés</dt>
          <dd>{result.workedDays} j</dd>
        </div>
        <div>
          <dt>Valeur / jour</dt>
          <dd>
            {result.valuePerDay === 'indeterminate'
              ? 'Indéterminée'
              : formatCents(result.valuePerDay)}
          </dd>
        </div>
      </dl>
      <details className="deduction-details">
        <summary>Détail des prélèvements</summary>
        <dl>
          {result.statutoryDeductions?.map((line) => (
            <div key={line.id}>
              <dt>{line.label}</dt>
              <dd>{formatCents(forPeriod(line.amount, period))}</dd>
            </div>
          ))}
        </dl>
      </details>
      {result.warnings?.map((warning) => (
        <ResultNotice key={warning.code} warning={warning} />
      ))}
      <RuleDisclosure sources={result.ruleReferences ?? []} />
    </article>
  )
}

export function Results({ result, period }: ResultsProps) {
  const difference = result.economicValueDifference ?? result.difference
  const netDifference = result.netIncomeDifference ?? result.difference
  const leading = difference >= 0 ? 'Micro-entreprise' : 'Salariat'
  return (
    <section className="results-section" aria-labelledby="results-title" aria-live="polite">
      <header className="results-heading">
        <span className="section-number section-number--dark">4</span>
        <Scale aria-hidden="true" size={21} />
        <div>
          <h2 id="results-title">Résultat</h2>
          <p>Règles générales 2026 · avant impôt sur le revenu</p>
        </div>
      </header>
      <div className="result-grid">
        <ResultCard result={result.micro} period={period} />
        <span className="versus" aria-hidden="true">
          <ArrowRight size={18} />
        </span>
        <ResultCard result={result.employee} period={period} />
      </div>
      <div className="result-summary">
        <div>
          <BadgeEuro aria-hidden="true" size={17} />
          <span>Écart de revenu net</span>
          <strong>{formatCents(Math.abs(forPeriod(netDifference, period)))}</strong>
          <small>{netDifference >= 0 ? 'Micro-entreprise' : 'Salariat'}</small>
        </div>
        <div>
          <BadgeEuro aria-hidden="true" size={17} />
          <span>Écart de valeur économique</span>
          <strong>{formatCents(Math.abs(forPeriod(difference, period)))}</strong>
          <small>{leading}</small>
        </div>
      </div>
    </section>
  )
}
