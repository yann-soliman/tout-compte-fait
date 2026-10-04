import { useId, useMemo, useState, type MouseEvent } from 'react'
import type { ComparisonScenario, MicroScenario, RegulatoryCatalog } from '../domain/model'
import { evaluateOpportunity, opportunityGrid, preciseEuro } from '../domain/result-visuals'
import { eurosToMoneyCents, assertMoneyCents } from '../domain/money'
import { NumberField } from './ui/NumberField'

interface Props {
  scenario: ComparisonScenario
  catalog: RegulatoryCatalog
  onApply: (patch: Pick<MicroScenario, 'dailyRate' | 'billedDays'>) => void
}
const plot = { x: 62, y: 24, w: 666, h: 280 }
const money = (cents: number) => preciseEuro.format(cents / 100)

export function OpportunityMap(props: Props) {
  return (
    <MapContent
      key={`${props.scenario.micro.dailyRate}:${props.scenario.micro.billedDays}`}
      {...props}
    />
  )
}

function MapContent({ scenario, catalog, onApply }: Props) {
  const id = useId()
  const [hypothesis, setHypothesis] = useState({
    dailyRate: scenario.micro.dailyRate,
    billedDays: scenario.micro.billedDays,
  })
  const [inputError, setInputError] = useState<string>()
  const calculation = useMemo(() => {
    try {
      return { grid: opportunityGrid(scenario, catalog), error: undefined }
    } catch (error) {
      return {
        grid: undefined,
        error: error instanceof Error ? error.message : 'calcul impossible.',
      }
    }
  }, [scenario, catalog])
  const selected = useMemo(() => {
    try {
      return {
        value: evaluateOpportunity(scenario, catalog, hypothesis.dailyRate, hypothesis.billedDays),
        error: undefined,
      }
    } catch (error) {
      return {
        value: undefined,
        error: error instanceof Error ? error.message : 'hypothèse invalide.',
      }
    }
  }, [scenario, catalog, hypothesis])
  if (!calculation.grid)
    return <p className="visual-warning">Carte indisponible : {calculation.error}</p>
  const grid = calculation.grid
  const x = (days: number) => plot.x + (days / grid.maxDays) * plot.w
  const y = (rate: number) => plot.y + (1 - rate / grid.maxRate) * plot.h
  const path = (points: Array<{ billedDays: number; dailyRate: number }>) =>
    points
      .map((point, i) => `${i ? 'L' : 'M'}${x(point.billedDays)},${y(point.dailyRate)}`)
      .join(' ')
  const outside = `${path(grid.ceiling)} L${plot.x + plot.w},${plot.y} L${plot.x},${plot.y} Z`
  const bounds = (values: number[], index: number, max: number): [number, number] => [
    index === 0 ? 0 : (values[index - 1]! + values[index]!) / 2,
    index === values.length - 1 ? max : (values[index]! + values[index + 1]!) / 2,
  ]
  const choose = (event: MouseEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const px = ((event.clientX - box.left) / box.width) * 760
    const py = ((event.clientY - box.top) / box.height) * 360
    if (px < plot.x || px > plot.x + plot.w || py < plot.y || py > plot.y + plot.h) return
    setHypothesis({
      dailyRate: assertMoneyCents(
        grid.rates.reduce((nearest, rate) =>
          Math.abs(rate - (1 - (py - plot.y) / plot.h) * grid.maxRate) <
          Math.abs(nearest - (1 - (py - plot.y) / plot.h) * grid.maxRate)
            ? rate
            : nearest,
        ),
      ),
      billedDays: grid.days.reduce((nearest, days) =>
        Math.abs(days - ((px - plot.x) / plot.w) * grid.maxDays) <
        Math.abs(nearest - ((px - plot.x) / plot.w) * grid.maxDays)
          ? days
          : nearest,
      ),
    })
    setInputError(undefined)
  }
  const selection = selected.value
  const selectionInFrame =
    !!selection && selection.dailyRate <= grid.maxRate && selection.billedDays <= grid.maxDays
  const unknownCfe = selection?.warnings.some((warning) => warning.code === 'cfe-unknown')
  return (
    <section className="visual-card opportunity-visual" aria-label="Carte TJM et jours facturés">
      <header className="visual-heading">
        <div>
          <span className="visual-kicker">02 · Explorer</span>
          <h3>Trouver une zone d’équilibre</h3>
          <p>Quel couple TJM / jours fait basculer la comparaison ?</p>
        </div>
        <span className="visual-badge">Écarts annuels</span>
      </header>
      <div className="map-layout">
        <div className="map-figure">
          <div className="map-axis-title">TJM · €/jour</div>
          <svg
            className="opportunity-svg"
            viewBox="0 0 760 360"
            width="760"
            height="360"
            role="img"
            aria-label="Carte des écarts annuels de valeur économique : violet micro, vert salariat, hachures hors plafond"
            onClick={choose}
          >
            <defs>
              <pattern id={`${id}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse">
                <rect width="7" height="7" fill="#f0f0f4" fillOpacity="0.92" />
                <path d="M0 7L7 0" stroke="#b9bbc8" strokeWidth="1" />
              </pattern>
              <clipPath id={`${id}-clip`}>
                <rect x={plot.x} y={plot.y} width={plot.w} height={plot.h} rx="8" />
              </clipPath>
            </defs>
            <g clipPath={`url(#${id}-clip)`}>
              <rect x={plot.x} y={plot.y} width={plot.w} height={plot.h} fill="#faf9fd" />
              {grid.cells.map((cell, index) => {
                const [left, right] = bounds(grid.days, index % grid.days.length, grid.maxDays)
                const [bottom, top] = bounds(
                  grid.rates,
                  Math.floor(index / grid.days.length),
                  grid.maxRate,
                )
                return (
                  <rect
                    key={`${cell.dailyRate}:${cell.billedDays}`}
                    x={x(left)}
                    y={y(top)}
                    width={x(right) - x(left)}
                    height={y(bottom) - y(top)}
                    fill={cell.difference >= 0 ? '#7868e8' : '#16a77e'}
                    fillOpacity={0.08 + Math.min(1, Math.abs(cell.difference) / grid.scale) * 0.82}
                  />
                )
              })}
              <path className="map-outside" d={outside} fill={`url(#${id}-hatch)`} />
              {grid.days
                .filter((_, i) => i % 3 === 0)
                .map((day) => (
                  <line
                    key={day}
                    x1={x(day)}
                    x2={x(day)}
                    y1={plot.y}
                    y2={plot.y + plot.h}
                    stroke="#ffffff"
                    strokeOpacity="0.35"
                  />
                ))}
              <path
                d={path(grid.ceiling)}
                fill="none"
                stroke="#6b6d80"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {grid.balance.length > 1 && (
                <>
                  <path d={path(grid.balance)} fill="none" stroke="#fff" strokeWidth="5" />
                  <path
                    className="map-balance-line"
                    d={path(grid.balance)}
                    fill="none"
                    stroke="#23283d"
                    strokeWidth="2"
                  />
                </>
              )}
              <circle
                className="map-current-point"
                cx={x(scenario.micro.billedDays)}
                cy={y(scenario.micro.dailyRate)}
                r="7"
                fill="#23283d"
                stroke="#fff"
                strokeWidth="3"
              />
              <text
                x={Math.min(plot.x + plot.w - 86, x(scenario.micro.billedDays) + 12)}
                y={Math.max(plot.y + 18, y(scenario.micro.dailyRate) - 14)}
                className="map-current-label"
              >
                Actuel
              </text>
              {selection && selectionInFrame && (
                <>
                  <line
                    x1={x(selection.billedDays)}
                    x2={x(selection.billedDays)}
                    y1={plot.y}
                    y2={plot.y + plot.h}
                    stroke="#23283d"
                    strokeDasharray="2 4"
                    strokeOpacity="0.6"
                  />
                  <circle
                    className="map-selected-point"
                    cx={x(selection.billedDays)}
                    cy={y(selection.dailyRate)}
                    r="10"
                    fill="none"
                    stroke="#23283d"
                    strokeWidth="2"
                  />
                  <circle
                    cx={x(selection.billedDays)}
                    cy={y(selection.dailyRate)}
                    r="3"
                    fill="#fff"
                  />
                </>
              )}
            </g>
            {grid.days
              .filter((_, i) => i % 3 === 0)
              .map((day) => (
                <text
                  key={day}
                  x={x(day)}
                  y={plot.y + plot.h + 24}
                  textAnchor="middle"
                  className="map-tick"
                >
                  {day}
                </text>
              ))}
            {grid.rates
              .filter((_, i) => i % 3 === 0)
              .map((rate) => (
                <text
                  key={rate}
                  x={plot.x - 12}
                  y={y(rate) + 4}
                  textAnchor="end"
                  className="map-tick"
                >
                  {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(rate / 100)}
                </text>
              ))}
            <text x={plot.x + plot.w / 2} y="354" textAnchor="middle" className="map-tick">
              Jours facturés / an
            </text>
          </svg>
          <div className="map-legend">
            <span>
              <i className="legend-swatch legend-swatch--employee" />
              Salariat favorisé
            </span>
            <span>
              <i className="legend-swatch legend-swatch--micro" />
              Micro favorisée
            </span>
            <span>
              <i className="legend-line" />
              Équilibre théorique
            </span>
            <span>
              <i className="legend-hatch" />
              Hors plafond
            </span>
            <span>
              <i className="legend-current" />
              Scénario actuel
            </span>
          </div>
          <p className="visual-footnote">
            Carte échantillonnée : couleurs et ligne d’équilibre indicatives entre points. Toucher
            la carte ou utiliser les commandes pour recalculer une hypothèse exacte. Teinte plus
            soutenue = écart plus important.
          </p>
        </div>
        <div className="map-explorer">
          <span className="visual-kicker">Hypothèse sélectionnée</span>
          <label className="map-days">
            <span>
              Jours à explorer <strong>{hypothesis.billedDays} j/an</strong>
            </span>
            <input
              type="range"
              aria-label="Jours à explorer"
              min="0"
              max={grid.maxDays}
              step="1"
              value={hypothesis.billedDays}
              onChange={(event) => {
                setHypothesis((current) => ({ ...current, billedDays: Number(event.target.value) }))
              }}
            />
          </label>
          <NumberField
            label="TJM à explorer"
            value={hypothesis.dailyRate / 100}
            suffix="€/j"
            step={0.01}
            error={inputError}
            onChange={(value) => {
              try {
                const dailyRate = eurosToMoneyCents(value)
                setHypothesis((current) => ({ ...current, dailyRate }))
                setInputError(undefined)
              } catch (error) {
                setInputError(error instanceof Error ? error.message : 'TJM invalide.')
              }
            }}
          />
          <div className="map-selection" aria-live="polite">
            {selection ? (
              <>
                <span>Écart annuel de valeur économique</span>
                <strong
                  className={
                    selection.difference >= 0 ? 'map-difference--micro' : 'map-difference--employee'
                  }
                  data-testid="map-annual-difference"
                >
                  {money(Math.abs(selection.difference))}
                </strong>
                <span>
                  {selection.difference === 0
                    ? 'Équilibre'
                    : `en faveur ${selection.difference > 0 ? 'de la micro' : 'du salariat'}`}
                </span>
                <dl>
                  <div>
                    <dt>Chiffre d’affaires</dt>
                    <dd>{money(selection.turnover)}</dd>
                  </div>
                  <div>
                    <dt>Plafond applicable</dt>
                    <dd>{money(selection.applicableCeiling)}</dd>
                  </div>
                </dl>
                <span
                  className={`map-ceiling-badge${selection.underCeiling ? '' : ' map-ceiling-badge--outside'}`}
                >
                  {selection.underCeiling
                    ? 'Sous plafond · à confirmer'
                    : 'Hors plafond · non applicable'}
                </span>
                {!selectionInFrame && (
                  <p className="visual-warning">
                    Hypothèse hors cadre : montant exact affiché, repère non représenté sur la
                    carte.
                  </p>
                )}
                {hypothesis.billedDays === 0 && (
                  <p className="visual-warning">Aucun jour facturé : hypothèse non applicable.</p>
                )}
                {unknownCfe && (
                  <p className="visual-warning">
                    CFE inconnue : écart estimatif, application désactivée.
                  </p>
                )}
              </>
            ) : (
              <p className="visual-warning">Hypothèse indisponible : {selected.error}</p>
            )}
          </div>
          <button
            type="button"
            className="map-apply"
            disabled={!selection?.canApply || !!inputError}
            onClick={() => {
              if (selection?.canApply && !inputError)
                onApply({
                  dailyRate: assertMoneyCents(selection.dailyRate),
                  billedDays: selection.billedDays,
                })
            }}
          >
            Appliquer cette hypothèse
          </button>
          <p className="visual-footnote">
            Mettre à jour le TJM et les jours après application explicite.
          </p>
        </div>
      </div>
      <p className="visual-footnote map-disclaimer">
        Éligibilité non confirmée sans historique des deux années précédentes, même sous plafond.
        Comparaison annuelle avant impôt, hors retraite, à frais et avantages inchangés.
        {unknownCfe ? ' Ligne d’équilibre masquée tant que la CFE est inconnue.' : ''}
      </p>
    </section>
  )
}
