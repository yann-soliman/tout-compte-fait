import type { DeductionLine, SourceReference } from './model'
import { assertMoneyCents, type MoneyCents } from './money'
import { eiRules2026 as rules } from './rules/ei-2026'

export interface EiInput {
  turnover: number
  professionalExpenses: number
  healthInsuranceAnnual: number
  cfeAnnual?: number
  cfeExemptionConfirmed: boolean
}

export interface EiCalculatedResult {
  status: 'estimated'
  turnover: MoneyCents
  deductibleExpenses: MoneyCents
  grossIncome: number
  abatement: MoneyCents
  socialBase: MoneyCents
  deductions: DeductionLine[]
  contributions: MoneyCents
  netBeforePersonalInsurance: number
  availableBeforeIncomeTax: number
  healthInsuranceAnnual: MoneyCents
  sources: SourceReference[]
}

export type EiResult =
  | EiCalculatedResult
  | {
      status: 'blocked'
      reason: string
      sources: SourceReference[]
    }

function safeSigned(value: bigint): number {
  const result = Number(value)
  if (!Number.isSafeInteger(result)) throw new RangeError('Le résultat EI dépasse la plage sûre.')
  return result
}

const min = (a: bigint, b: bigint) => (a < b ? a : b)
const max = (a: bigint, b: bigint) => (a > b ? a : b)
const rounded = (numerator: bigint, denominator: bigint) =>
  (numerator + denominator / 2n) / denominator
// Input fraction is in cents; source model rounds social amounts to whole euros.
const euroRounded = (numerator: bigint, denominator = 1n) =>
  rounded(numerator, denominator * 100n) * 100n

/** Interpolate the overall rate (not marginal brackets), rounded to 0.01 percentage point. */
function progressiveBps(base: bigint, bands: readonly (readonly [bigint, bigint])[]): bigint {
  let lower = 0n
  let rate = 0n
  for (const [ceilingPercent, upperRate] of bands) {
    const ceiling = (rules.pass * ceilingPercent) / 100n
    if (base <= ceiling) return rate + rounded((upperRate - rate) * (base - lower), ceiling - lower)
    lower = ceiling
    rate = upperRate
  }
  return rate
}

/** No mutable engine/cache: annual regularised estimate, not a payment schedule. */
export function calculateEiIncome(input: EiInput): EiResult {
  const turnover = assertMoneyCents(input.turnover)
  const expenses = assertMoneyCents(input.professionalExpenses)
  const insurance = assertMoneyCents(input.healthInsuranceAnnual)
  if (input.cfeAnnual !== undefined) assertMoneyCents(input.cfeAnnual)
  if (!input.cfeExemptionConfirmed && !input.cfeAnnual) {
    return {
      status: 'blocked',
      reason:
        'CFE EI inconnue : renseigner un montant positif ou confirmer une exonération propre à l’EI. Une exonération micro ne suffit pas.',
      sources: Object.values(rules.sources),
    }
  }
  const cfe = assertMoneyCents(input.cfeExemptionConfirmed ? 0 : (input.cfeAnnual ?? 0))
  const deductible = BigInt(expenses) + BigInt(cfe)
  const gross = BigInt(turnover) - deductible
  // The official model rounds annual turnover before the social calculation.
  // Cash reconciliation retains the original cents, rather than changing receipts.
  const socialGross = euroRounded(BigInt(turnover)) - deductible
  const abatement = euroRounded(
    max(
      rules.pass * rules.abatementMinimumBps,
      min(rules.pass * rules.abatementMaximumBps, socialGross * rules.abatementBps),
    ),
    10000n,
  )
  const base = euroRounded(max(0n, socialGross - abatement))
  const sicknessRate = progressiveBps(base, rules.sicknessBands)
  const familyRate = progressiveBps(base, rules.familyBands)
  const ijBase = min(rules.pass * 5n, max(base, euroRounded(rules.pass * 40n, 100n)))
  const retirementBase = max(base, rules.minimumRetirementBase)
  const disabilityBase = min(rules.pass, max(base, euroRounded(rules.pass * 115n, 1000n)))
  const deductions: DeductionLine[] = []
  const add = (
    id: string,
    label: string,
    lineBase: bigint,
    numerator: bigint,
    source: SourceReference,
  ) => {
    deductions.push({
      id,
      label,
      base: assertMoneyCents(safeSigned(lineBase)),
      amount: assertMoneyCents(safeSigned(euroRounded(numerator, 10000n))),
      source,
    })
  }
  add(
    'ei-sickness',
    'Maladie-maternité',
    base,
    min(base, rules.pass * 3n) * sicknessRate + max(0n, base - rules.pass * 3n) * 650n,
    rules.sources.sickness,
  )
  add('ei-ij', 'Indemnités journalières', ijBase, ijBase * 50n, rules.sources.ij)
  add(
    'ei-base-retirement',
    'Retraite de base',
    retirementBase,
    min(retirementBase, rules.pass) * 1787n + max(0n, retirementBase - rules.pass) * 72n,
    rules.sources.retirement,
  )
  add(
    'ei-rci',
    'Retraite complémentaire RCI',
    base,
    min(base, rules.pass) * 810n + max(0n, min(base, rules.pass * 4n) - rules.pass) * 910n,
    rules.sources.rci,
  )
  add(
    'ei-disability',
    'Invalidité-décès',
    disabilityBase,
    disabilityBase * 130n,
    rules.sources.disability,
  )
  add('ei-family', 'Allocations familiales', base, base * familyRate, rules.sources.family)
  add('ei-csg-deductible', 'CSG déductible', base, base * 680n, rules.sources.csg)
  add('ei-csg-crds', 'CSG-CRDS non déductible', base, base * 290n, rules.sources.csg)
  add(
    'ei-training',
    'Formation professionnelle',
    rules.pass,
    rules.pass * 25n,
    rules.sources.training,
  )
  const contributions = deductions.reduce((sum, line) => sum + BigInt(line.amount), 0n)
  const net = gross - contributions
  return {
    status: 'estimated',
    turnover,
    deductibleExpenses: assertMoneyCents(safeSigned(deductible)),
    grossIncome: safeSigned(gross),
    abatement: assertMoneyCents(safeSigned(abatement)),
    socialBase: assertMoneyCents(safeSigned(base)),
    deductions,
    contributions: assertMoneyCents(safeSigned(contributions)),
    netBeforePersonalInsurance: safeSigned(net),
    availableBeforeIncomeTax: safeSigned(net - BigInt(insurance)),
    healthInsuranceAnnual: insurance,
    sources: Object.values(rules.sources),
  }
}
