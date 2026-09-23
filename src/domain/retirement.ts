import type {
  EmployeeScenario,
  MicroScenario,
  RegulatoryCatalog,
  RetirementRegimeResult,
  RetirementResult,
  SourceReference,
} from './model'
import { assertMoneyCents, type MoneyCents } from './money'

const UNAVAILABLE_COMPLEMENTARY =
  'Paramètres complémentaires 2026 non vérifiés pour ce régime : calcul bloqué.'
const CAREER_WARNING =
  'Droits acquis en 2026 uniquement — ne constitue pas une estimation de la pension totale future.'

function uniqueSources(sources: SourceReference[]): SourceReference[] {
  return [...new Map(sources.map((source) => [source.canonicalUrl, source])).values()]
}

function quartersFor(qualifyingIncome: bigint, threshold: MoneyCents, cap: number): number {
  return Math.min(cap, Number(qualifyingIncome / BigInt(threshold)))
}

function blockedComplementary(regime: string): RetirementRegimeResult {
  return {
    regime,
    qualifyingIncome: assertMoneyCents(0),
    quarters: 0,
    quarterCap: 0,
    points: 'unavailable',
    indicativeAnnualPension: 'unavailable',
    basePension: 'not-calculable-from-2026-alone',
    confidence: 'blocked',
    sources: [],
    limitation: UNAVAILABLE_COMPLEMENTARY,
  }
}

export function calculateEmployeeRetirement(
  employee: EmployeeScenario,
  catalog: RegulatoryCatalog,
): RetirementResult {
  const threshold = catalog.baseRetirement.quarterThreshold
  const cap = catalog.baseRetirement.annualQuarterCap
  if (!threshold || !cap) throw new Error('Règles de retraite de base 2026 absentes.')
  const qualifyingIncome = assertMoneyCents(
    Math.min(employee.grossAnnualSalary, catalog.socialSecurityCeilingAnnual.value),
  )
  const sources = uniqueSources([
    threshold.source,
    cap.source,
    catalog.socialSecurityCeilingAnnual.source,
  ])
  return {
    referenceYear: 2026,
    base: {
      regime: 'Assurance retraite — salarié du secteur privé',
      qualifyingIncome,
      quarters: quartersFor(BigInt(qualifyingIncome), threshold.value, cap.value),
      quarterCap: cap.value,
      points: 'unavailable',
      indicativeAnnualPension: 'unavailable',
      basePension: 'not-calculable-from-2026-alone',
      confidence: 'established',
      sources,
    },
    complementary: blockedComplementary('Agirc-Arrco'),
    warning: CAREER_WARNING,
  }
}

export function calculateMicroRetirement(
  micro: MicroScenario,
  catalog: RegulatoryCatalog,
): RetirementResult {
  if (micro.activity !== 'non-regulated-liberal-bnc') {
    throw new RangeError('Affiliation retraite hors périmètre, notamment Cipav.')
  }
  const rules = catalog.baseRetirement
  const allocation = rules.baseAllocationRate
  const qualifyingRate = rules.qualifyingBaseRate
  const threshold = rules.quarterThreshold
  const cap = rules.annualQuarterCap
  if (!allocation || !qualifyingRate || !threshold || !cap) {
    throw new Error('Règles de retraite micro 2026 absentes.')
  }
  const turnover = BigInt(micro.dailyRate) * BigInt(micro.billedDays)
  const numerator = turnover * BigInt(catalog.microSocial.value) * BigInt(allocation.value)
  const denominator = 1_000_000n * BigInt(qualifyingRate.value)
  const exactQualifyingIncome = numerator / denominator
  const qualifyingIncome = assertMoneyCents(Number(exactQualifyingIncome))
  const sources = uniqueSources([
    catalog.microSocial.source,
    allocation.source,
    qualifyingRate.source,
    threshold.source,
    cap.source,
  ])
  return {
    referenceYear: 2026,
    base: {
      regime: rules.affiliation,
      qualifyingIncome,
      quarters: quartersFor(exactQualifyingIncome, threshold.value, cap.value),
      quarterCap: cap.value,
      points: 'unavailable',
      indicativeAnnualPension: 'unavailable',
      basePension: 'not-calculable-from-2026-alone',
      confidence: 'established',
      sources,
    },
    complementary: blockedComplementary('Retraite complémentaire libérale hors Cipav'),
    warning: CAREER_WARNING,
  }
}
