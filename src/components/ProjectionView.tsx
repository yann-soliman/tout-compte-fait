import { ChartNoAxesCombined, Clock3, TrendingUp } from 'lucide-react'
import { formatCents } from '../domain/calculate'
import { buildProjection } from '../domain/projection'
import type {
  ComparisonResult,
  ComparisonScenario,
  ProjectionOptions,
  RegulatoryCatalog,
} from '../domain/model'
import { CompositionChart } from './charts/CompositionChart'
import { CumulativeChart } from './charts/CumulativeChart'
import { SegmentedControl } from './ui/SegmentedControl'

interface ProjectionViewProps {
  result: ComparisonResult
  scenario: ComparisonScenario
  catalog: RegulatoryCatalog
  projection: ProjectionOptions
  onChange: (next: ProjectionOptions) => void
}

export function ProjectionView({
  result,
  scenario,
  catalog,
  projection,
  onChange,
}: ProjectionViewProps) {
  let points
  let projectionError: string | undefined
  try {
    points = buildProjection(scenario, catalog, projection.years, projection.annualGrowthRate)
  } catch (error) {
    if (!(error instanceof RangeError)) throw error
    projectionError = error.message
  }
  const last = points?.at(-1)

  return (
    <div className="projection-view">
      <section className="projection-toolbar">
        <div>
          <span className="eyebrow">Projection cumulée</span>
          <h1>Projeter la valeur dans le temps</h1>
        </div>
        <SegmentedControl
          label="Durée"
          value={projection.years}
          options={[
            { label: '5 ans', value: 5 },
            { label: '10 ans', value: 10 },
            { label: '20 ans', value: 20 },
            { label: '30 ans', value: 30 },
          ]}
          onChange={(years) => onChange({ ...projection, years })}
          compact
        />
      </section>

      {projectionError ? (
        <p className="decision-error" role="alert">
          Projection indisponible : {projectionError}
        </p>
      ) : (
        <>
          <div className="projection-kpis">
            <article>
              <span className="kpi-icon kpi-icon--micro">
                <TrendingUp size={17} />
              </span>
              <span>Micro-entreprise</span>
              <strong>{formatCents(last?.microCumulative ?? 0)}</strong>
            </article>
            <article>
              <span className="kpi-icon kpi-icon--employee">
                <ChartNoAxesCombined size={17} />
              </span>
              <span>Salariat</span>
              <strong>{formatCents(last?.employeeCumulative ?? 0)}</strong>
            </article>
            <article>
              <span className="kpi-icon">
                <Clock3 size={17} />
              </span>
              <span>Durée</span>
              <strong>{projection.years} ans</strong>
            </article>
          </div>

          <section className="projection-panel">
            <div className="panel-title">
              <div>
                <span className="eyebrow">Valeur cumulée</span>
                <h2>Comparer année par année</h2>
              </div>
              <span className="demo-badge">Estimation à règles constantes</span>
            </div>
            <CumulativeChart points={points!} />
            <p className="projection-caveat">
              Hypothèse économique choisie : {projection.annualGrowthRate} % par an sur le CA
              potentiel et le salaire brut/avantages. Charges recalculées chaque année ; frais, CFE
              et mutuelle constants. Limiter le CA micro au plafond chaque second dépassement
              consécutif ; ne jamais augmenter un CA inférieur. Avant IR, salariat avec avantages
              hors cash. Plafond micro et paramètres 2026 figés : estimation, pas prévision
              législative. Les règles 2026 ne sont pas projetées comme des paramètres réglementaires
              futurs et les droits retraite ne sont pas ajoutés à cette valeur cumulée.
            </p>
          </section>

          <section className="projection-panel">
            <div className="panel-title">
              <div>
                <span className="eyebrow">Composition — moyenne du cycle de référence</span>
                <h2>Décomposer chaque valeur</h2>
              </div>
            </div>
            {result.microCycle && (
              <p className="projection-caveat">
                Moyennes micro arrondies indépendamment au centime : écarts d’arrondi possibles
                entre totaux et composantes, notamment d’un centime. Ce sont des moyennes du cycle
                de référence, pas des assiettes ni des cotisations d’une déclaration annuelle.
              </p>
            )}
            <div className="composition-grid">
              <CompositionChart result={result.micro} />
              <CompositionChart result={result.employee} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
