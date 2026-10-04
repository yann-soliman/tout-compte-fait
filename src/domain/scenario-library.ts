import { calculateComparison } from './calculate'
import type { ComparisonScenario } from './model'
import { rules2026 } from './rules/2026'
import { validateScenario } from './validate'

export const SCENARIO_SCHEMA_VERSION = 1
export const MAX_SAVED_SCENARIOS = 20
export const MAX_SCENARIO_NAME_LENGTH = 80
export const MAX_SCENARIO_IMPORT_BYTES = 100 * 1024

export interface NamedScenario {
  id: string
  name: string
  savedAt: string
  scenario: ComparisonScenario
}

export interface OfferComparisonRow {
  name: string
  referenceYear: number
  microWorkedDays: number
  employeeWorkedDays: number
  microAnnualNetIncomeCents: number
  employeeAnnualNetIncomeCents: number
  microAnnualEconomicValueCents: number
  employeeAnnualEconomicValueCents: number
}

function objectRecord(value: unknown, label: string): Record<string, unknown> {
  if (
    value === null ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new TypeError(`${label} doit être un objet JSON.`)
  }
  return value as Record<string, unknown>
}

function exactKeys(
  object: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[],
  label: string,
): void {
  for (const key of required) {
    if (!Object.hasOwn(object, key)) throw new TypeError(`Champ ${label}.${key} manquant.`)
  }
  const allowed = new Set([...required, ...optional])
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) throw new TypeError(`Champ ${label}.${key} non autorisé.`)
  }
}

function validateScenarioObject(value: unknown): ComparisonScenario {
  const root = objectRecord(value, 'scenario')
  exactKeys(
    root,
    ['referenceYear', 'displayPeriod', 'micro', 'employee', 'retirement', 'projection'],
    ['activityStartDate'],
    'scenario',
  )
  const micro = objectRecord(root.micro, 'scenario.micro')
  exactKeys(
    micro,
    [
      'activity',
      'dailyRate',
      'billedDays',
      'professionalExpenses',
      'healthInsuranceMonthly',
      'cfeExemptionConfirmed',
    ],
    ['cfeAnnual'],
    'scenario.micro',
  )
  const employee = objectRecord(root.employee, 'scenario.employee')
  exactKeys(
    employee,
    [
      'grossAnnualSalary',
      'category',
      'workRatioPercent',
      'paidLeaveWeeks',
      'rttDays',
      'annualBenefits',
    ],
    [],
    'scenario.employee',
  )
  const retirement = objectRecord(root.retirement, 'scenario.retirement')
  exactKeys(retirement, ['includeRights', 'valuationMode'], [], 'scenario.retirement')
  const projection = objectRecord(root.projection, 'scenario.projection')
  exactKeys(projection, ['years', 'annualGrowthRate'], [], 'scenario.projection')

  const scenario: ComparisonScenario = {
    referenceYear: root.referenceYear as ComparisonScenario['referenceYear'],
    displayPeriod: root.displayPeriod as ComparisonScenario['displayPeriod'],
    ...(root.activityStartDate === undefined
      ? {}
      : { activityStartDate: root.activityStartDate as string }),
    micro: {
      activity: micro.activity as ComparisonScenario['micro']['activity'],
      dailyRate: micro.dailyRate as ComparisonScenario['micro']['dailyRate'],
      billedDays: micro.billedDays as number,
      professionalExpenses:
        micro.professionalExpenses as ComparisonScenario['micro']['professionalExpenses'],
      healthInsuranceMonthly:
        micro.healthInsuranceMonthly as ComparisonScenario['micro']['healthInsuranceMonthly'],
      ...(micro.cfeAnnual === undefined
        ? {}
        : { cfeAnnual: micro.cfeAnnual as ComparisonScenario['micro']['cfeAnnual'] }),
      cfeExemptionConfirmed: micro.cfeExemptionConfirmed as boolean,
    },
    employee: {
      grossAnnualSalary:
        employee.grossAnnualSalary as ComparisonScenario['employee']['grossAnnualSalary'],
      category: employee.category as ComparisonScenario['employee']['category'],
      workRatioPercent: employee.workRatioPercent as number,
      paidLeaveWeeks: employee.paidLeaveWeeks as number,
      rttDays: employee.rttDays as number,
      annualBenefits: employee.annualBenefits as ComparisonScenario['employee']['annualBenefits'],
    },
    retirement: {
      includeRights: retirement.includeRights as boolean,
      valuationMode: retirement.valuationMode as ComparisonScenario['retirement']['valuationMode'],
    },
    projection: {
      years: projection.years as number,
      annualGrowthRate: projection.annualGrowthRate as number,
    },
  }
  if (root.displayPeriod !== 'annual' && root.displayPeriod !== 'monthly') {
    throw new TypeError('Période d’affichage invalide.')
  }
  if (root.referenceYear !== 2026) throw new TypeError('Année de référence non prise en charge.')
  if (
    root.activityStartDate !== undefined &&
    (typeof root.activityStartDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(root.activityStartDate))
  ) {
    throw new TypeError('Date de début d’activité invalide.')
  }
  if (micro.activity !== 'non-regulated-liberal-bnc')
    throw new TypeError('Activité micro invalide.')
  if (typeof micro.cfeExemptionConfirmed !== 'boolean') {
    throw new TypeError('Confirmation de l’exonération CFE invalide.')
  }
  if (employee.category !== 'cadre' && employee.category !== 'non-cadre') {
    throw new TypeError('Catégorie salariée invalide.')
  }
  if (typeof retirement.includeRights !== 'boolean') {
    throw new TypeError('Option retraite invalide.')
  }
  if (retirement.valuationMode !== 'rights-2026-indicative') {
    throw new TypeError('Mode de valorisation retraite invalide.')
  }
  for (const [label, item] of [
    ['taux journalier', micro.dailyRate],
    ['frais professionnels', micro.professionalExpenses],
    ['mutuelle', micro.healthInsuranceMonthly],
    ['CFE', micro.cfeAnnual],
    ['salaire', employee.grossAnnualSalary],
    ['avantages', employee.annualBenefits],
  ] as const) {
    if (item !== undefined && (!Number.isSafeInteger(item) || (item as number) < 0)) {
      throw new RangeError(`Montant ${label} invalide; saisir des centimes entiers sûrs.`)
    }
  }
  for (const [label, item] of [
    ['jours facturés', micro.billedDays],
    ['quotité', employee.workRatioPercent],
    ['RTT', employee.rttDays],
    ['durée de projection', projection.years],
  ] as const) {
    if (typeof item !== 'number' || !Number.isFinite(item)) {
      throw new RangeError(`Valeur ${label} non finie.`)
    }
  }
  if (typeof employee.paidLeaveWeeks !== 'number' || !Number.isFinite(employee.paidLeaveWeeks)) {
    throw new RangeError('Congés payés non finis.')
  }
  if (
    typeof projection.annualGrowthRate !== 'number' ||
    !Number.isFinite(projection.annualGrowthRate)
  ) {
    throw new RangeError('Croissance annuelle non finie.')
  }
  return validateScenario(scenario)
}

function normalizedSnapshot(value: unknown): NamedScenario {
  const item = objectRecord(value, 'instantané')
  exactKeys(item, ['id', 'name', 'savedAt', 'scenario'], [], 'instantané')
  if (
    typeof item.id !== 'string' ||
    item.id.length > 128 ||
    !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(item.id)
  ) {
    throw new TypeError('Identifiant d’instantané invalide.')
  }
  if (typeof item.name !== 'string' || item.name !== item.name.trim()) {
    throw new TypeError('Le nom de chaque instantané doit être nettoyé.')
  }
  const name = normalizeScenarioName(item.name)
  if (
    typeof item.savedAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(item.savedAt)
  ) {
    throw new TypeError('Date de sauvegarde invalide.')
  }
  const parsedSavedAt = new Date(item.savedAt)
  if (!Number.isFinite(parsedSavedAt.getTime())) {
    throw new TypeError('Date de sauvegarde invalide.')
  }
  const canonicalSavedAt = parsedSavedAt.toISOString()
  if (
    canonicalSavedAt !== item.savedAt &&
    canonicalSavedAt.replace('.000Z', 'Z') !== item.savedAt
  ) {
    throw new TypeError('Date de sauvegarde invalide.')
  }
  return {
    id: item.id,
    name,
    savedAt: item.savedAt,
    scenario: validateScenarioObject(item.scenario),
  }
}

export function normalizeScenarioName(value: string): string {
  if (typeof value !== 'string') throw new TypeError('Le nom du scénario doit être du texte.')
  const name = value.trim()
  if (name.length < 1 || name.length > MAX_SCENARIO_NAME_LENGTH) {
    throw new RangeError('Le nom doit contenir de 1 à 80 caractères après nettoyage.')
  }
  if (
    [...name].some((character) => {
      const code = character.charCodeAt(0)
      return code < 32 || code === 127
    })
  ) {
    throw new TypeError('Le nom contient un caractère interdit.')
  }
  return name
}

function validatedCollection(value: unknown): NamedScenario[] {
  const envelope = objectRecord(value, 'collection')
  exactKeys(envelope, ['schemaVersion', 'scenarios'], [], 'collection')
  if (envelope.schemaVersion !== SCENARIO_SCHEMA_VERSION) {
    throw new RangeError(
      `Version de collection non prise en charge: ${String(envelope.schemaVersion)}.`,
    )
  }
  if (!Array.isArray(envelope.scenarios) || envelope.scenarios.length > MAX_SAVED_SCENARIOS) {
    throw new RangeError('La collection doit contenir au maximum 20 scénarios.')
  }
  const scenarios = envelope.scenarios.map(normalizedSnapshot)
  const ids = new Set<string>()
  for (const snapshot of scenarios) {
    if (ids.has(snapshot.id)) throw new TypeError(`Identifiant dupliqué: ${snapshot.id}.`)
    ids.add(snapshot.id)
  }
  return scenarios
}

export function decodeScenarioCollectionJson(json: string): NamedScenario[] {
  if (typeof json !== 'string') throw new TypeError('Le fichier importé doit être du texte JSON.')
  if (new TextEncoder().encode(json).byteLength > MAX_SCENARIO_IMPORT_BYTES) {
    throw new RangeError('Le fichier JSON dépasse la limite de 100 Kio.')
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(json) as unknown
  } catch {
    throw new SyntaxError('Le fichier ne contient pas un JSON valide.')
  }
  return validatedCollection(parsed)
}

export function encodeScenarioCollectionJson(scenarios: readonly NamedScenario[]): string {
  const validated = validatedCollection({
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    scenarios,
  })
  const json = JSON.stringify(
    { schemaVersion: SCENARIO_SCHEMA_VERSION, scenarios: validated },
    null,
    2,
  )
  if (new TextEncoder().encode(json).byteLength > MAX_SCENARIO_IMPORT_BYTES) {
    throw new RangeError('La collection JSON dépasse la limite de 100 Kio.')
  }
  return json
}

function csvCell(value: string | number): string {
  let text = String(value)
  if (typeof value === 'string' && /^[\s]*[=+\-@]/.test(value)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

function euroCsv(cents: number): string {
  if (!Number.isSafeInteger(cents)) throw new RangeError('Montant CSV hors de la plage sûre.')
  const amount = BigInt(cents)
  const sign = amount < 0 ? '-' : ''
  const positive = amount < 0 ? -amount : amount
  return `${sign}${positive / 100n},${(positive % 100n).toString().padStart(2, '0')}`
}

export function toOffersCsv(scenarios: readonly NamedScenario[]): string {
  const validated = validatedCollection({ schemaVersion: SCENARIO_SCHEMA_VERSION, scenarios })
  const rows: OfferComparisonRow[] = validated.map((offer) => {
    const result = calculateComparison(
      { ...offer.scenario, retirement: { ...offer.scenario.retirement, includeRights: false } },
      rules2026,
    )
    return {
      name: offer.name,
      referenceYear: offer.scenario.referenceYear,
      microWorkedDays: result.micro.workedDays,
      employeeWorkedDays: result.employee.workedDays,
      microAnnualNetIncomeCents: result.micro.netIncome,
      employeeAnnualNetIncomeCents: result.employee.netIncome,
      microAnnualEconomicValueCents: result.micro.totalValue,
      employeeAnnualEconomicValueCents: result.employee.totalValue,
    }
  })
  return [
    [
      'Scénario',
      'Année',
      'Jours micro',
      'Jours salariat',
      'Micro net annuel (€)',
      'Salariat net annuel (€)',
      'Micro valeur économique annuelle (€)',
      'Salariat valeur économique annuelle (€)',
    ]
      .map(csvCell)
      .join(';'),
    ...rows.map((row) =>
      [
        row.name,
        row.referenceYear,
        row.microWorkedDays,
        row.employeeWorkedDays,
        euroCsv(row.microAnnualNetIncomeCents),
        euroCsv(row.employeeAnnualNetIncomeCents),
        euroCsv(row.microAnnualEconomicValueCents),
        euroCsv(row.employeeAnnualEconomicValueCents),
      ]
        .map(csvCell)
        .join(';'),
    ),
  ].join('\r\n')
}

export function comparisonRow(name: string, scenario: ComparisonScenario): OfferComparisonRow {
  const validated = validateScenario(scenario)
  const result = calculateComparison(
    { ...validated, retirement: { ...validated.retirement, includeRights: false } },
    rules2026,
  )
  return {
    name: normalizeScenarioName(name),
    referenceYear: validated.referenceYear,
    microWorkedDays: result.micro.workedDays,
    employeeWorkedDays: result.employee.workedDays,
    microAnnualNetIncomeCents: result.micro.netIncome,
    employeeAnnualNetIncomeCents: result.employee.netIncome,
    microAnnualEconomicValueCents: result.micro.totalValue,
    employeeAnnualEconomicValueCents: result.employee.totalValue,
  }
}

export function compareRowsToCsv(rows: readonly OfferComparisonRow[]): string {
  const header = [
    'Scénario',
    'Année',
    'Jours micro',
    'Jours salariat',
    'Micro net annuel (€)',
    'Salariat net annuel (€)',
    'Micro valeur économique annuelle (€)',
    'Salariat valeur économique annuelle (€)',
  ]
  return [
    header.map(csvCell).join(';'),
    ...rows.map((row) =>
      [
        normalizeScenarioName(row.name),
        row.referenceYear,
        row.microWorkedDays,
        row.employeeWorkedDays,
        euroCsv(row.microAnnualNetIncomeCents),
        euroCsv(row.employeeAnnualNetIncomeCents),
        euroCsv(row.microAnnualEconomicValueCents),
        euroCsv(row.employeeAnnualEconomicValueCents),
      ]
        .map(csvCell)
        .join(';'),
    ),
  ].join('\r\n')
}
