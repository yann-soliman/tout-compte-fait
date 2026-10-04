import type { ComparisonResult, DisplayPeriod } from '../domain/model'
import { moneyFlows, preciseEuro } from '../domain/result-visuals'
import { forPeriod } from '../domain/calculate'

export function MoneyFlowChart({
  result,
  period,
}: {
  result: ComparisonResult
  period: DisplayPeriod
}) {
  let flows: ReturnType<typeof moneyFlows>
  try {
    flows = moneyFlows(result)
  } catch (error) {
    return (
      <p className="visual-warning">
        Graphique indisponible : {error instanceof Error ? error.message : 'montants invalides.'}
      </p>
    )
  }
  const position = (value: number) => ((value - flows.min) / (flows.max - flows.min)) * 100
  const format = (value: number) => preciseEuro.format(forPeriod(value, period) / 100)
  return (
    <section className="visual-card money-visual" aria-label="Décomposition de l’argent">
      <header className="visual-heading">
        <div>
          <span className="visual-kicker">01 · Comprendre</span>
          <h3>Du brut à la valeur économique</h3>
          <p>Ce qui est prélevé, ce qui est dépensé, ce qui reste.</p>
        </div>
        <span className="visual-badge">
          Montants {period === 'annual' ? 'annuels' : 'mensuels'}
        </span>
      </header>
      <div className="flow-grid">
        {flows.items.map((flow) => (
          <article
            className={`flow-panel flow-panel--${flow.kind}`}
            key={flow.kind}
            aria-label={`Décomposition ${flow.kind === 'micro' ? 'micro-entreprise' : 'salariat'}`}
          >
            <h4>
              <span className="status-dot" aria-hidden="true" />
              {flow.kind === 'micro' ? 'Micro-entreprise' : 'Salariat'}
            </h4>
            <dl className="flow-steps">
              {flow.steps.map((step, index) => (
                <div className={`flow-step flow-step--${step.kind}`} key={step.label}>
                  <dt>{step.label}</dt>
                  <dd>
                    {step.kind === 'addition' && step.amount > 0 ? '+' : ''}
                    {format(step.amount)}
                  </dd>
                  <div className="flow-track" aria-hidden="true">
                    <span className="flow-zero" style={{ left: `${position(0)}%` }} />
                    <span
                      className={`flow-bar flow-bar--${step.kind}${step.end < 0 ? ' flow-bar--negative' : ''}`}
                      style={{
                        left: `${position(Math.min(step.start, step.end))}%`,
                        width: `${Math.abs(position(step.end) - position(step.start))}%`,
                      }}
                    />
                    {index > 0 && index < 4 && (
                      <span className="flow-end" style={{ left: `${position(step.end)}%` }} />
                    )}
                  </div>
                </div>
              ))}
            </dl>
            <div className="flow-axis" aria-hidden="true">
              <span>{format(flows.min)}</span>
              <span>{format(flows.max)}</span>
            </div>
            {flow.steps[4].end < 0 && (
              <p className="visual-warning">
                Déficit économique : les frais dépassent le revenu net.
              </p>
            )}
          </article>
        ))}
      </div>
      <p className="visual-footnote">
        Même échelle pour les deux statuts · avant impôt et hors retraite. Les avantages sont
        valorisés, pas nécessairement versés en espèces. Le salaire brut n’est pas le coût
        employeur.
        {period === 'monthly'
          ? ' Mensualisation indicative : chaque montant est arrondi séparément.'
          : ''}
      </p>
    </section>
  )
}
