import type {
  ComparisonResult,
  ComparisonScenario,
  RegulatoryCatalog,
  SourceReference,
} from './model'
import type { NamedScenario } from './scenario-library'
import { calculateRobustness } from './robustness'
import { calculateComparison } from './calculate'
import { validateScenario } from './validate'
export interface ReportOffer {
  id: string
  name: string
  scenario: ComparisonScenario
  result: ComparisonResult
  robustness: ReturnType<typeof calculateRobustness>
  sources: SourceReference[]
}
export function createReportOffers(
  scenario: ComparisonScenario,
  saved: readonly NamedScenario[],
  selectedIds: readonly string[],
  catalog: RegulatoryCatalog,
): ReportOffer[] {
  return [
    { id: 'current', name: 'Scénario courant', scenario },
    ...saved.filter((s) => selectedIds.includes(s.id)).map((s) => ({ ...s, id: `saved:${s.id}` })),
  ].map((offer) => {
    const validated = validateScenario(offer.scenario)
    const result = calculateComparison(
      { ...validated, retirement: { ...validated.retirement, includeRights: false } },
      catalog,
    )
    const references = [
      ...(result.micro.ruleReferences ?? []),
      ...(result.employee.ruleReferences ?? []),
    ]
    const sources = [
      ...new Map(references.map((source) => [JSON.stringify(source), source])).values(),
    ]
    return {
      id: offer.id,
      name: offer.name,
      scenario: validated,
      result,
      robustness: calculateRobustness(validated, catalog),
      sources,
    }
  })
}
