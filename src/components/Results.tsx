import { ArrowRight, BadgeEuro, CalendarDays, PiggyBank, Scale } from 'lucide-react'
import { euro, forPeriod } from '../domain/calculate'
import type { ComparisonResult, DisplayPeriod, StatusResult } from '../domain/model'

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
      </div>
      <div className="result-main">
        <span>Valeur totale</span>
        <strong>{euro.format(forPeriod(result.totalValue, period))}</strong>
        <small>/{period === 'annual' ? 'an' : 'mois'}</small>
      </div>
      <dl className="result-metrics">
        <div>
          <dt>Revenu net</dt>
          <dd>{euro.format(forPeriod(result.netIncome, period))}</dd>
        </div>
        <div>
          <dt>Jours travaillés</dt>
          <dd>{result.workedDays} j</dd>
        </div>
        <div>
          <dt>Valeur / jour</dt>
          <dd>{euro.format(result.valuePerDay)}</dd>
        </div>
        <div>
          <dt>Cotisations retraite</dt>
          <dd>{euro.format(forPeriod(result.retirementContribution, period))}</dd>
        </div>
      </dl>
    </article>
  )
}

export function Results({ result, period }: ResultsProps) {
  const leading = result.difference >= 0 ? 'Micro-entreprise' : 'Salariat'
  return (
    <section className="results-section" aria-labelledby="results-title">
      <header className="results-heading">
        <span className="section-number section-number--dark">4</span>
        <Scale aria-hidden="true" size={21} />
        <div>
          <h2 id="results-title">Résultat</h2>
          <p>Estimation de démonstration · règles métier à spécifier</p>
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
          <span>Écart de valeur</span>
          <strong>{euro.format(Math.abs(forPeriod(result.difference, period)))}</strong>
          <small>{leading}</small>
        </div>
        <div>
          <CalendarDays aria-hidden="true" size={17} />
          <span>Écart de jours</span>
          <strong>{Math.abs(result.micro.workedDays - result.employee.workedDays)} j</strong>
          <small>/ an</small>
        </div>
        <div>
          <PiggyBank aria-hidden="true" size={17} />
          <span>Écart retraite</span>
          <strong>
            {euro.format(
              Math.abs(
                forPeriod(
                  result.micro.retirementContribution - result.employee.retirementContribution,
                  period,
                ),
              ),
            )}
          </strong>
          <small>estimé</small>
        </div>
      </div>
    </section>
  )
}
