import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { formatCents } from '../../domain/calculate'
import type { StatusResult } from '../../domain/model'

export function CompositionChart({ result }: { result: StatusResult }) {
  const title = result.kind === 'micro' ? 'Micro-entreprise' : 'Salariat'
  return (
    <article className={`composition composition--${result.kind}`}>
      <div className="composition__chart" role="img" aria-label={`Composition ${title}`}>
        <ResponsiveContainer width="100%" height={170}>
          <PieChart>
            <Pie
              data={result.composition}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={72}
              paddingAngle={2}
              isAnimationActive={false}
              stroke="none"
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
        <h3>{title}</h3>
        <ul>
          {result.composition.map((part) => (
            <li key={part.name}>
              <span className="legend-dot" style={{ backgroundColor: part.color }} />
              <span>{part.name}</span>
              <strong>{formatCents(part.value)}</strong>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
