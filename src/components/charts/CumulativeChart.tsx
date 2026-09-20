import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { compactEuro, euro } from '../../domain/calculate'
import type { ProjectionPoint } from '../../domain/model'

export function CumulativeChart({ points }: { points: ProjectionPoint[] }) {
  return (
    <div className="chart-shell" role="img" aria-label="Valeur cumulée par statut et par année">
      <ResponsiveContainer width="100%" height={310}>
        <LineChart data={points} margin={{ top: 12, right: 12, bottom: 0, left: 4 }}>
          <CartesianGrid stroke="#e7e6ee" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="year" tickFormatter={(value) => `${value} an`} tickLine={false} />
          <YAxis
            tickFormatter={(value) => compactEuro.format(value)}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value, name) => [
              euro.format(Number(value)),
              name === 'microCumulative' ? 'Micro-entreprise' : 'Salariat',
            ]}
            labelFormatter={(label) => `Année ${label}`}
          />
          <Legend
            formatter={(value) => (value === 'microCumulative' ? 'Micro-entreprise' : 'Salariat')}
          />
          <Line
            type="monotone"
            dataKey="microCumulative"
            stroke="#7868e8"
            strokeWidth={3}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="employeeCumulative"
            stroke="#16a77e"
            strokeWidth={3}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
