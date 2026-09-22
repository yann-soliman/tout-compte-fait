import { ChartNoAxesCombined, Clock3, TrendingUp } from 'lucide-react'
import { euro } from '../domain/calculate'
import { buildProjection } from '../domain/projection'
import type { ComparisonResult, LegacyRetirementScenario } from '../domain/model'
import { CompositionChart } from './charts/CompositionChart'
import { CumulativeChart } from './charts/CumulativeChart'
import { SegmentedControl } from './ui/SegmentedControl'

interface ProjectionViewProps {
  result: ComparisonResult
  retirement: LegacyRetirementScenario
  onChange: (next: LegacyRetirementScenario) => void
}

export function ProjectionView({ result, retirement, onChange }: ProjectionViewProps) {
  const points = buildProjection(result, retirement.comparisonYears, retirement.annualGrowth)
  const last = points.at(-1)

  return (
    <div className="projection-view">
      <section className="projection-toolbar">
        <div>
          <span className="eyebrow">Projection cumulée</span>
          <h1>Projeter la valeur dans le temps</h1>
        </div>
        <SegmentedControl
          label="Durée"
          value={retirement.comparisonYears}
          options={[
            { label: '5 ans', value: 5 },
            { label: '10 ans', value: 10 },
            { label: '20 ans', value: 20 },
            { label: '30 ans', value: 30 },
          ]}
          onChange={(comparisonYears) => onChange({ ...retirement, comparisonYears })}
          compact
        />
      </section>

      <div className="projection-kpis">
        <article>
          <span className="kpi-icon kpi-icon--micro">
            <TrendingUp size={17} />
          </span>
          <span>Micro-entreprise</span>
          <strong>{euro.format(last?.microCumulative ?? 0)}</strong>
        </article>
        <article>
          <span className="kpi-icon kpi-icon--employee">
            <ChartNoAxesCombined size={17} />
          </span>
          <span>Salariat</span>
          <strong>{euro.format(last?.employeeCumulative ?? 0)}</strong>
        </article>
        <article>
          <span className="kpi-icon">
            <Clock3 size={17} />
          </span>
          <span>Durée</span>
          <strong>{retirement.comparisonYears} ans</strong>
        </article>
      </div>

      <section className="projection-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">Valeur cumulée</span>
            <h2>Comparer année par année</h2>
          </div>
          <span className="demo-badge">Démonstration</span>
        </div>
        <CumulativeChart points={points} />
      </section>

      <section className="projection-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">Composition annuelle</span>
            <h2>Décomposer chaque valeur</h2>
          </div>
        </div>
        <div className="composition-grid">
          <CompositionChart result={result.micro} />
          <CompositionChart result={result.employee} />
        </div>
      </section>
    </div>
  )
}
