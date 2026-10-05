import { assertMoneyCents, applyRate } from './money'
import type { ComparisonScenario, ComparisonResult } from './model'
import type { EiResult } from './ei'
import { incomeTaxReference as rules } from './rules/income-tax-reference'

export interface TaxHousehold {
  status: 'single' | 'couple'
  children: number
  otherTaxableIncome: number
}
export const defaultTaxHousehold: TaxHousehold = {
  status: 'single',
  children: 0,
  otherTaxableIncome: 0,
}
const round = (n: bigint, d: bigint) => (n + d / 2n) / d
const euros = (c: bigint) => round(c, 100n) * 100n
function safe(c: bigint): number {
  const value = Number(c)
  if (!Number.isSafeInteger(value))
    throw new RangeError('Le résultat fiscal dépasse la plage sûre.')
  return value
}
function taxBeforeDiscount(income: bigint, halfParts: bigint): bigint {
  let numerator = 0n
  let lower = 0n
  for (let i = 0; i < rules.ratesPercent.length; i++) {
    const threshold = rules.thresholdsEuros[i]
    const upper = threshold === undefined ? income : threshold * 50n * halfParts
    const band = (income < upper ? income : upper) - lower
    if (band > 0n) numerator += band * (rules.ratesPercent[i] ?? 0n)
    lower = upper
  }
  return round(numerator, 10000n) * 100n
}
function categoryBase(
  amount: number,
  deductionPercent: bigint,
  minimumEuros: bigint,
  maximumEuros?: bigint,
) {
  const declared = euros(BigInt(assertMoneyCents(amount)))
  let deduction = round(declared * deductionPercent, 10000n) * 100n
  if (deduction < minimumEuros * 100n) deduction = minimumEuros * 100n
  if (maximumEuros !== undefined && deduction > maximumEuros * 100n) deduction = maximumEuros * 100n
  return safe(declared - (deduction < declared ? deduction : declared))
}
export function calculateTaxBases(
  scenario: ComparisonScenario,
  comparison: ComparisonResult,
  ei: EiResult,
  salaryOverride?: number,
) {
  const employeeLines = comparison.employee.statutoryDeductions ?? []
  const nonDeductible = employeeLines.reduce((total, line) => {
    if (line.id.startsWith('csg-')) return total + BigInt(applyRate(line.base, 24000, 'half-up'))
    if (line.id.startsWith('crds-')) return total + BigInt(line.amount)
    return total
  }, 0n)
  const salaryDeclared =
    salaryOverride ?? safe(BigInt(comparison.employee.netIncome) + nonDeductible)
  const eiTaxable =
    ei.status === 'estimated'
      ? safe(
          BigInt(ei.netBeforePersonalInsurance) +
            BigInt(ei.deductions.find((line) => line.id === 'ei-csg-crds')?.amount ?? 0),
        )
      : undefined
  return {
    employee: categoryBase(salaryDeclared, 10n, 509n, 14555n),
    employeeDeclared: salaryDeclared,
    micro: categoryBase(
      safe(BigInt(scenario.micro.dailyRate) * BigInt(scenario.micro.billedDays)),
      34n,
      305n,
    ),
    ei: eiTaxable,
  }
}
export type AfterTaxAlternative =
  | { status: 'blocked'; reason: string }
  | {
      status: 'estimated'
      taxableIncome: number
      cashBefore: number
      householdTax: number
      baselineTax: number
      additionalTax: number
      cashAfter: number
      parts: number
    }
export function calculateAfterTaxComparison(
  scenario: ComparisonScenario,
  comparison: ComparisonResult,
  ei: EiResult,
  household: TaxHousehold,
  salaryOverride?: number,
): Record<'employee' | 'micro' | 'ei', AfterTaxAlternative> {
  let bases: ReturnType<typeof calculateTaxBases>
  let baselineTax: number
  try {
    bases = calculateTaxBases(scenario, comparison, ei, salaryOverride)
    baselineTax = calculateHouseholdTax(household.otherTaxableIncome, household).due
  } catch (error) {
    if (!(error instanceof RangeError)) throw error
    const blocked: AfterTaxAlternative = { status: 'blocked', reason: error.message }
    return { employee: blocked, micro: blocked, ei: blocked }
  }
  const alternative = (base: number | undefined, cash: number | undefined): AfterTaxAlternative => {
    try {
      if (base === undefined || cash === undefined)
        return {
          status: 'blocked',
          reason: ei.status === 'blocked' ? ei.reason : 'Résultat EI indisponible.',
        }
      if (base < 0)
        return {
          status: 'blocked',
          reason:
            'Déficit EI : imputation fiscale hors périmètre, disponible après IR non calculé.',
        }
      const totalBase = safe(BigInt(base) + BigInt(household.otherTaxableIncome))
      const highIncome = household.status === 'couple' ? 50000000 : 25000000
      if (totalBase >= highIncome)
        return {
          status: 'blocked',
          reason: 'Hauts revenus : CEHR/CDHR et revenu fiscal de référence hors périmètre.',
        }
      const total = calculateHouseholdTax(totalBase, household)
      const additionalTax = safe(BigInt(total.due) - BigInt(baselineTax))
      return {
        status: 'estimated',
        taxableIncome: base,
        cashBefore: cash,
        householdTax: total.due,
        baselineTax,
        additionalTax,
        cashAfter: safe(BigInt(cash) - BigInt(additionalTax)),
        parts: total.parts,
      }
    } catch (error) {
      if (!(error instanceof RangeError)) throw error
      return { status: 'blocked', reason: error.message }
    }
  }
  return {
    employee: alternative(bases.employee, comparison.employee.netIncome),
    micro:
      scenario.micro.cfeExemptionConfirmed ||
      (scenario.micro.cfeAnnual !== undefined && scenario.micro.cfeAnnual > 0)
        ? alternative(bases.micro, comparison.micro.totalValue)
        : { status: 'blocked', reason: 'CFE micro inconnue : disponible après IR indisponible.' },
    ei: alternative(bases.ei, ei.status === 'estimated' ? ei.availableBeforeIncomeTax : undefined),
  }
}
export function calculateHouseholdTax(taxableIncome: number, household: TaxHousehold) {
  if (
    !['single', 'couple'].includes(household.status) ||
    !Number.isInteger(household.children) ||
    household.children < 0 ||
    household.children > 6
  )
    throw new RangeError('Foyer hors périmètre.')
  assertMoneyCents(household.otherTaxableIncome)
  const income = euros(BigInt(assertMoneyCents(taxableIncome)))
  const standard = household.status === 'couple' ? 4n : 2n
  const extra = BigInt(Math.min(household.children, 2) + Math.max(0, household.children - 2) * 2)
  const halfParts = standard + extra
  const uncapped = taxBeforeDiscount(income, halfParts)
  const floor = taxBeforeDiscount(income, standard) - extra * rules.halfPartCapEuros * 100n
  const gross = uncapped > floor ? uncapped : floor
  const discountLimit =
    (household.status === 'couple' ? rules.discountCoupleEuros : rules.discountSingleEuros) * 100n
  const rawDiscountNumerator = discountLimit * 10000n - gross * 4525n
  const roundedDiscount =
    rawDiscountNumerator > 0n ? round(rawDiscountNumerator, 1000000n) * 100n : 0n
  const discount = roundedDiscount < gross ? roundedDiscount : gross
  const afterDiscount = gross - discount
  const due = afterDiscount < 6100n ? 0n : afterDiscount
  return {
    taxableIncome: safe(income),
    parts: Number(halfParts) / 2,
    gross: safe(gross),
    discount: safe(discount),
    due: safe(due),
  }
}
