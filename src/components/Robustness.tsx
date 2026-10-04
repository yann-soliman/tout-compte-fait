import type { ComparisonScenario } from '../domain/model'
import type { calculateRobustness, Threshold } from '../domain/robustness'
import { preciseEuro } from '../domain/result-visuals'

const money = (cents: number) => preciseEuro.format(cents / 100)
export function Robustness({
  scenario,
  data,
  ariaLabel = 'Robustesse du scénario',
}: {
  scenario: ComparisonScenario
  ariaLabel?: string
  data: ReturnType<typeof calculateRobustness>
}) {
  const factors: Array<{
    key: string
    result: Threshold
    margin: string
    effort: string
    unit: string
    baseline: number
  }> = [
    {
      key: 'days',
      result: data.days,
      margin: 'Jours perdables',
      effort: 'Jours supplémentaires nécessaires',
      unit: 'days',
      baseline: scenario.micro.billedDays,
    },
    {
      key: 'rate',
      result: data.rate,
      margin: 'Baisse de TJM possible',
      effort: 'Hausse de TJM nécessaire',
      unit: 'rate',
      baseline: scenario.micro.dailyRate,
    },
    {
      key: 'expenses',
      result: data.expenses,
      margin: 'Frais supplémentaires absorbables',
      effort: 'Frais à réduire',
      unit: 'expenses',
      baseline: scenario.micro.professionalExpenses,
    },
  ]
  const format = (n: number, unit: string) =>
    unit === 'days' ? `${n} j/an` : `${money(n)}${unit === 'rate' ? '/j' : '/an'}`
  return (
    <section className="visual-card robustness-visual" aria-label={ariaLabel}>
      <header className="visual-heading">
        <div>
          <span className="visual-kicker">03 · Éprouver</span>
          <h3>Marge avant bascule</h3>
          <p>Égaler la valeur économique du salariat, un facteur à la fois.</p>
        </div>
        <span className="visual-badge">Seuils annuels</span>
      </header>
      {data.theoretical && (
        <p className="visual-warning">
          Scénario courant hors plafond ou données incomplètes : seuils théoriques, pas une
          recommandation.
        </p>
      )}
      <div className="robustness-grid">
        {factors.map(({ key, result, margin, effort, unit, baseline }) => (
          <article key={key} className={`robustness-factor robustness-factor--${result.state}`}>
            <span className="robustness-state">
              {result.state === 'margin'
                ? 'Marge théorique'
                : result.state === 'effort'
                  ? 'Effort nécessaire'
                  : result.state === 'unreachable'
                    ? 'Impossible par ce facteur seul'
                    : 'Indisponible'}
            </span>
            <h4>{result.state === 'effort' ? effort : margin}</h4>
            <strong>{result.amount === undefined ? '—' : format(result.amount, unit)}</strong>
            {result.amount !== undefined && (
              <div className="robustness-track" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.min(100, (result.amount / Math.max(1, baseline + result.amount)) * 100)}%`,
                  }}
                />
              </div>
            )}
            {result.threshold !== undefined && (
              <p>
                Seuil : {format(result.threshold, unit)}
                {unit === 'expenses' ? ' de frais professionnels' : ''}
              </p>
            )}
            {result.withinCeiling === false && (
              <p className="visual-warning">Seuil hors plafond · théorique uniquement.</p>
            )}
            {result.message && <p className="visual-warning">{result.message}</p>}
          </article>
        ))}
      </div>
      <p className="visual-footnote">
        Un seul facteur à la fois, les autres hypothèses restent constantes. Seuil = valeur micro
        égale ou supérieure au salariat. Indicateurs indépendants, non additionnables. Avant impôt,
        hors retraite; éligibilité à confirmer avec l’historique.
      </p>
    </section>
  )
}
