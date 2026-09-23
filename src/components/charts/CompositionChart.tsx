import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { formatCents } from '../../domain/calculate'
import type { StatusResult } from '../../domain/model'

export function CompositionChart({ result }: { result: StatusResult }) {
  const title = result.kind === 'micro' ? 'Micro-entreprise' : 'Salariat'
  return (
    <article
      className={`composition composition--${result.kind}`}
      aria-labelledby={`composition-${result.kind}`}
    >
      <div className="composition__chart" aria-hidden="true">
        <ResponsiveContainer width="100%" height={170}>
          <PieChart accessibilityLayer={false}>
            <Pie
              data={result.composition}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={72}
              paddingAngle={2}
              isAnimationActive={false}
              stroke="none"
              rootTabIndex={-1}
            >
              {result.composition.map((part) => (
                <Cell key={part.name} fill={part.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <span className="composition__center">
          <strong>{formatCents(result.totalValue)}</strong>
          <small>valeur / an</small>
        </span>
      </div>
      <div className="composition__details">
        <h3 id={`composition-${result.kind}`}>{title}</h3>
        <ul>
          {result.composition.map((part) => (
            <li key={part.name}>
              <span className="legend-dot" style={{ backgroundColor: part.color }} />
              <span>{part.name}</span>
              <strong>{formatCents(part.value)}</strong>
            </li>
          ))}
        </ul>
        <p className="chart-summary">
          Valeur annuelle totale {formatCents(result.totalValue)}.{' '}
          {result.composition
            .map((part) => `${part.name} : ${formatCents(part.value)}`)
            .join(' ; ')}
          .
        </p>
      </div>
    </article>
  )
}
