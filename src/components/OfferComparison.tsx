import { useState } from 'react'
import type { ReportOffer } from '../domain/decision-report'
import { preciseEuro } from '../domain/result-visuals'

export function OfferComparison({ offers }: { offers: ReportOffer[] }) {
  const [metric, setMetric] = useState<'netIncome' | 'totalValue'>('totalValue')
  const values = offers.flatMap((o) => [o.result.micro[metric], o.result.employee[metric]])
  const min = Math.min(0, ...values)
  const max = Math.max(0, ...values)
  const span = max - min || 100
  const position = (n: number) => ((n - min) / span) * 100
  const money = (n: number) => preciseEuro.format(n / 100)
  return (
    <section className="visual-card offers-visual" aria-label="Comparaison visuelle des offres">
      <header className="visual-heading">
        <div>
          <span className="visual-kicker">Comparer · Offres</span>
          <h3>Comparer les offres</h3>
          <p>Scénario courant et offres cochées · même échelle annuelle.</p>
        </div>
        <label className="offer-metric">
          Indicateur des offres
          <select
            aria-label="Indicateur des offres"
            value={metric}
            onChange={(e) => setMetric(e.target.value as 'netIncome' | 'totalValue')}
          >
            <option value="totalValue">Valeur économique</option>
            <option value="netIncome">Revenu net avant impôt</option>
          </select>
        </label>
      </header>
      <div className="offer-chart-axis" aria-hidden="true">
        <span>{money(min)}</span>
        <span>{money(max)}</span>
      </div>
      {offers.map((offer) => (
        <article className="offer-chart-group" key={offer.id} data-offer-id={offer.id}>
          <h4>{offer.name}</h4>
          <dl>
            {(['micro', 'employee'] as const).map((kind) => {
              const r = offer.result[kind]
              const value = r[metric]
              return (
                <div className={`offer-chart-row offer-chart-row--${kind}`} key={kind}>
                  <dt>
                    {kind === 'micro' ? 'Micro' : 'Salariat'} <small>{r.workedDays} j/an</small>
                  </dt>
                  <dd>{money(value)}</dd>
                  <div className="offer-chart-track" aria-hidden="true">
                    <span className="offer-zero" style={{ left: `${position(0)}%` }} />
                    <span
                      className="offer-bar"
                      style={{
                        left: `${position(Math.min(0, value))}%`,
                        width: `${(Math.abs(value) / span) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </dl>
          {[...(offer.result.micro.warnings ?? []), ...(offer.result.employee.warnings ?? [])].map(
            (warning, i) => (
              <p className="visual-warning" key={`${warning.code}:${i}`}>
                {warning.message}
              </p>
            ),
          )}
        </article>
      ))}
      <p className="visual-footnote">
        Comparaison annuelle avant impôt, hors retraite. Frais et avantages inclus uniquement dans
        la valeur économique. Les jours sont ceux modélisés, hors temps de prospection non saisi.
        Sous plafond ne confirme pas l’éligibilité.
      </p>
    </section>
  )
}
