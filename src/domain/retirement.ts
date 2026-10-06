import type {
  ComplementaryRegimeRules,
  EmployeeScenario,
  MicroScenario,
  RegulatoryCatalog,
  RegulatoryRule,
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

const ANNUAL_ESTIMATE_LIMITATION =
  'Estimatif — modèle annuel, cotisations supposées réglées; déclarations périodiques, plafonds personnels proratisés et arrondis de caisse non reproduits. Points affichés au centième et montant au centime (convention de présentation, pas arrondi statutaire). Valeur de service de référence, non garantie à la liquidation.'

function roundFraction(numerator: bigint, denominator: bigint): bigint {
  // For nonnegative n/d: floor(n/d +1/2), so exact halves round upward.
  // BigInt division truncates toward zero, equivalent to floor in this domain.
  return (numerator * 2n + denominator) / (denominator * 2n)
}

function valuedComplementary(
  rules: ComplementaryRegimeRules,
  numerator: bigint,
  denominator: bigint,
  sources: SourceReference[],
): RetirementRegimeResult {
  // Prices/service are integer 0.0001 € units. Keep the points fraction exact
  // until each independent display rounding (never value already rounded points).
  const pointDenominator = denominator * BigInt(rules.pointPurchaseValue.value)
  const pointNumerator = numerator * 100n // 0.01 €/cent ÷0.0001 €/unit =100 units/cent
  const hundredths = roundFraction(pointNumerator * 100n, pointDenominator)
  if (hundredths > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError('Les points dépassent la plage sûre.')
  }
  const pensionCents = roundFraction(
    pointNumerator * BigInt(rules.pointServiceValue.value),
    pointDenominator * 100n,
  )
  return {
    regime: rules.affiliation,
    qualifyingIncome: assertMoneyCents(0),
    quarters: 0,
    quarterCap: 0,
    points: Number(hundredths) / 100,
    indicativeAnnualPension: assertMoneyCents(Number(pensionCents)),
    basePension: 'not-calculable-from-2026-alone',
    confidence: 'estimated',
    sources: uniqueSources(sources),
    limitation: `${ANNUAL_ESTIMATE_LIMITATION} Référence de service applicable depuis le ${rules.pointServiceValue.source.effectiveDate}.`,
  }
}

function knownSource(source: SourceReference | undefined): boolean {
  return (
    source?.status === 'known' &&
    [
      source.authority,
      source.documentTitle,
      source.canonicalUrl,
      source.effectiveDate,
      source.verificationDate,
    ].every((field) => typeof field === 'string' && field.trim() !== '')
  )
}

function usablePositiveRule(rule: RegulatoryRule<number> | undefined): boolean {
  return !!rule && Number.isSafeInteger(rule.value) && rule.value > 0 && knownSource(rule.source)
}

function usablePositivePpmRule(rule: RegulatoryRule<number> | undefined): boolean {
  return !!rule && usablePositiveRule(rule) && rule.value <= 1_000_000
}

function usablePointValues(
  rules: ComplementaryRegimeRules | undefined,
): rules is ComplementaryRegimeRules {
  return (
    !!rules &&
    usablePositiveRule(rules.pointPurchaseValue) &&
    usablePositiveRule(rules.pointServiceValue)
  )
}

function employeeComplementary(
  employee: EmployeeScenario,
  catalog: RegulatoryCatalog,
): RetirementRegimeResult {
  const rules = catalog.complementaryRetirement?.employee
  const bands = rules?.pointBands
  if (
    !usablePointValues(rules) ||
    bands?.length !== 2 ||
    bands[0]?.lowerExclusive !== 0 ||
    bands[0]?.upperInclusive !== catalog.socialSecurityCeilingAnnual.value ||
    bands[0]?.upperInclusive !== bands[1]?.lowerExclusive ||
    bands[1]?.lowerExclusive !== catalog.socialSecurityCeilingAnnual.value ||
    bands[1]?.upperInclusive !== 8 * catalog.socialSecurityCeilingAnnual.value ||
    !bands.every(
      (band) =>
        knownSource(band.source) &&
        Number.isSafeInteger(band.rate) &&
        band.rate > 0 &&
        band.rate <= 1_000_000 &&
        Number.isSafeInteger(band.lowerExclusive) &&
        band.lowerExclusive >= 0 &&
        Number.isSafeInteger(band.upperInclusive) &&
        band.upperInclusive! > band.lowerExclusive,
    )
  ) {
    return blockedComplementary('Agirc-Arrco')
  }
  const salary = assertMoneyCents(employee.grossAnnualSalary)
  const numerator = bands.reduce((sum, band) => {
    const base = Math.max(0, Math.min(salary, band.upperInclusive ?? salary) - band.lowerExclusive)
    return sum + BigInt(base) * BigInt(band.rate)
  }, 0n)
  return valuedComplementary(rules, numerator, 1_000_000n, [
    rules.pointPurchaseValue.source,
    rules.pointServiceValue.source,
    ...bands.map((band) => band.source),
  ])
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
    complementary: employeeComplementary(employee, catalog),
    warning: CAREER_WARNING,
  }
}

function microComplementary(
  micro: MicroScenario,
  catalog: RegulatoryCatalog,
  turnoverOverride?: number,
): RetirementRegimeResult {
  const rules = catalog.complementaryRetirement?.micro
  if (
    !usablePointValues(rules) ||
    !usablePositivePpmRule(rules.allocationRate) ||
    !usablePositivePpmRule(catalog.microSocial)
  ) {
    return blockedComplementary('RCI — libéral BNC non réglementé hors Cipav')
  }
  const turnover =
    turnoverOverride !== undefined
      ? BigInt(assertMoneyCents(turnoverOverride))
      : BigInt(micro.dailyRate) * BigInt(micro.billedDays)
  const numerator =
    turnover * BigInt(catalog.microSocial.value) * BigInt(rules.allocationRate!.value)
  return valuedComplementary(rules, numerator, 1_000_000n * 1_000_000n, [
    catalog.microSocial.source,
    rules.allocationRate!.source,
    rules.pointPurchaseValue.source,
    rules.pointServiceValue.source,
  ])
}

export function calculateMicroRetirement(
  micro: MicroScenario,
  catalog: RegulatoryCatalog,
  turnoverOverride?: number,
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
  const turnover =
    turnoverOverride !== undefined
      ? BigInt(assertMoneyCents(turnoverOverride))
      : BigInt(micro.dailyRate) * BigInt(micro.billedDays)
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
    complementary: microComplementary(micro, catalog, turnoverOverride),
    warning: CAREER_WARNING,
  }
}
