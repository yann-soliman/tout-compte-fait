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
import { compactEuro, formatCents } from '../../domain/calculate'
import type { ProjectionPoint } from '../../domain/model'

export function CumulativeChart({ points }: { points: ProjectionPoint[] }) {
  return (
    <div className="chart-shell">
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={310}>
          <LineChart
            accessibilityLayer={false}
            data={points}
            margin={{ top: 12, right: 12, bottom: 0, left: 4 }}
          >
            <CartesianGrid stroke="#e7e6ee" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="year" tickFormatter={(value) => `${value} an`} tickLine={false} />
            <YAxis
              tickFormatter={(value) => compactEuro.format(Number(value) / 100)}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCents(Number(value)),
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
      <details className="chart-data">
        <summary>Afficher les valeurs annuelles du graphique</summary>
        <div className="chart-table-scroll">
          <table>
            <caption>Valeur cumulée par statut et par année</caption>
            <thead>
              <tr>
                <th scope="col">Année</th>
                <th scope="col">Micro-entreprise</th>
                <th scope="col">Salariat</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.year}>
                  <th scope="row">{point.year}</th>
                  <td>{formatCents(point.microCumulative)}</td>
                  <td>{formatCents(point.employeeCumulative)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
