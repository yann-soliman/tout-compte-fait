import { memo, useDeferredValue } from 'react'
import type {
  ComparisonResult,
  ComparisonScenario,
  MicroScenario,
  RegulatoryCatalog,
} from '../domain/model'
import { MoneyFlowChart } from './MoneyFlowChart'
import { OpportunityMap } from './OpportunityMap'

const DeferredMap = memo(OpportunityMap)

export function ResultVisuals({
  scenario,
  result,
  catalog,
  onApply,
}: {
  scenario: ComparisonScenario
  result: ComparisonResult
  catalog: RegulatoryCatalog
  onApply: (patch: Pick<MicroScenario, 'dailyRate' | 'billedDays'>) => void
}) {
  const deferredScenario = useDeferredValue(scenario)
  const pending = deferredScenario !== scenario
  return (
    <div className="result-visuals">
      {result.micro.warnings
        ?.filter((warning) =>
          ['cfe-unknown', 'ceiling-exceeded', 'out-of-scope'].includes(warning.code),
        )
        .map((warning) => (
          <p className="visual-context-warning" key={warning.code}>
            {warning.message}
            {warning.code !== 'cfe-unknown'
              ? ' Les visuels représentent un calcul théorique, pas une recommandation d’exercer sous ce régime.'
              : ' Les visuels économiques sont estimatifs.'}
          </p>
        ))}
      <MoneyFlowChart result={result} period={scenario.displayPeriod} />
      <div inert={pending} aria-busy={pending}>
        <DeferredMap scenario={deferredScenario} catalog={catalog} onApply={onApply} />
      </div>
    </div>
  )
}
