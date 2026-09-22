import { assertMoneyCents, assertRatePpm } from '../money'
import type {
  ContributionBand,
  RegulatoryCatalog,
  RegulatoryRule,
  RuleStatus,
  SourceReference,
} from '../model'

const VERIFIED_ON = '2026-09-22'

function source(
  documentTitle: string,
  canonicalUrl: string,
  effectiveDate: string,
  status: RuleStatus = 'known',
): SourceReference {
  return {
    authority: "Direction de l'information légale et administrative (Premier ministre)",
    documentTitle,
    canonicalUrl,
    effectiveDate,
    verificationDate: VERIFIED_ON,
    status,
  }
}

const microSocialSource = source(
  'Régime micro-social',
  'https://entreprendre.service-public.gouv.fr/vosdroits/F37353',
  '2026-01-01',
)
const trainingSource = source(
  'Contribution à la formation professionnelle (CFP) des entrepreneurs individuels',
  'https://entreprendre.service-public.gouv.fr/vosdroits/F23459',
  '2026-01-01',
)
const microTaxSource = source(
  'Régime fiscal de la micro-entreprise',
  'https://entreprendre.service-public.gouv.fr/vosdroits/F23267',
  '2026-01-01',
)
const payrollSource = source(
  'Cotisations salariales - Salarié du secteur privé',
  'https://entreprendre.service-public.gouv.fr/vosdroits/F2302',
  '2026-01-01',
)
const retirementSource = source(
  'Régime de retraite du micro-entrepreneur',
  'https://entreprendre.service-public.gouv.fr/vosdroits/F23369',
  '2026-01-01',
)
const cfeSource = source(
  'Cotisation foncière des entreprises (CFE)',
  'https://entreprendre.service-public.gouv.fr/vosdroits/F23547',
  '2026-01-01',
)

const moneyRule = (
  id: string,
  cents: number,
  base: string,
  bounds: string,
  ruleSource: SourceReference,
): RegulatoryRule<ReturnType<typeof assertMoneyCents>> => ({
  id,
  value: assertMoneyCents(cents),
  base,
  bounds,
  rounding: 'exact',
  source: ruleSource,
})

const contribution = (
  id: string,
  label: string,
  lowerExclusive: number,
  upperInclusive: number | undefined,
  ratePpm: number,
  options: Pick<ContributionBand, 'category'> &
    Partial<Pick<ContributionBand, 'baseFactor' | 'triggerAbove'>>,
): ContributionBand => ({
  id,
  label,
  lowerExclusive: assertMoneyCents(lowerExclusive),
  ...(upperInclusive === undefined ? {} : { upperInclusive: assertMoneyCents(upperInclusive) }),
  rate: assertRatePpm(ratePpm),
  rounding: 'half-up',
  source: payrollSource,
  ...options,
})

const monthlyPass = 400_500
const annualPass = 4_806_000
const fourPass = annualPass * 4
const eightPass = annualPass * 8

export const rules2026: RegulatoryCatalog = {
  year: 2026,
  microSocial: {
    id: 'micro-social-liberal-non-cipav',
    value: assertRatePpm(256_000),
    base: 'Chiffre d’affaires encaissé hors taxes',
    bounds: 'Activité libérale BNC non réglementée hors Cipav',
    rounding: 'half-up',
    source: microSocialSource,
  },
  professionalTraining: {
    id: 'professional-training-liberal',
    value: assertRatePpm(2_000),
    base: 'Chiffre d’affaires annuel encaissé hors taxes',
    bounds: 'Activité libérale',
    rounding: 'half-up',
    source: trainingSource,
  },
  microTurnoverCeiling: moneyRule(
    'micro-turnover-ceiling-services-bnc',
    8_360_000,
    'Chiffre d’affaires annuel hors taxes',
    '83 600 €; première année proratisée par jours d’existence / 365',
    microTaxSource,
  ),
  socialSecurityCeilingMonthly: moneyRule(
    'pass-monthly',
    monthlyPass,
    'Rémunération mensuelle',
    '1 PASS mensuel',
    payrollSource,
  ),
  socialSecurityCeilingAnnual: moneyRule(
    'pass-annual',
    annualPass,
    'Rémunération annuelle',
    '1 PASS annuel',
    payrollSource,
  ),
  employeeContributions: [
    contribution('old-age-uncapped', 'Vieillesse déplafonnée', 0, undefined, 4_000, {
      category: 'all',
    }),
    contribution('old-age-capped', 'Vieillesse plafonnée', 0, annualPass, 69_000, {
      category: 'all',
    }),
    contribution('csg-through-four-pass', 'CSG', 0, fourPass, 92_000, {
      category: 'all',
      baseFactor: assertRatePpm(982_500),
    }),
    contribution('csg-above-four-pass', 'CSG', fourPass, undefined, 92_000, {
      category: 'all',
    }),
    contribution('crds-through-four-pass', 'CRDS', 0, fourPass, 5_000, {
      category: 'all',
      baseFactor: assertRatePpm(982_500),
    }),
    contribution('crds-above-four-pass', 'CRDS', fourPass, undefined, 5_000, {
      category: 'all',
    }),
    contribution('agirc-arrco-t1', 'Agirc-Arrco T1', 0, annualPass, 31_500, {
      category: 'all',
    }),
    contribution('agirc-arrco-t2', 'Agirc-Arrco T2', annualPass, eightPass, 86_400, {
      category: 'all',
    }),
    contribution('ceg-t1', 'CEG T1', 0, annualPass, 8_600, { category: 'all' }),
    contribution('ceg-t2', 'CEG T2', annualPass, eightPass, 10_800, { category: 'all' }),
    contribution('cet', 'CET', 0, eightPass, 1_400, {
      category: 'all',
      triggerAbove: assertMoneyCents(annualPass),
    }),
    contribution('apec', 'Apec', 0, fourPass, 240, { category: 'cadre' }),
  ],
  baseRetirement: {
    affiliation: 'Assurance retraite — micro-entrepreneur libéral hors Cipav',
    qualifyingBaseFormula:
      'chiffre d’affaires × 25,6 % × 46,40 % ÷ 17,87 %, avec précision exacte avant comparaison',
    baseAllocationRate: {
      id: 'micro-base-retirement-allocation',
      value: assertRatePpm(464_000),
      base: 'Cotisation micro-sociale globale',
      bounds: 'Activité libérale BNC hors Cipav',
      rounding: 'exact',
      source: retirementSource,
    },
    qualifyingBaseRate: {
      id: 'base-retirement-qualifying-rate',
      value: assertRatePpm(178_700),
      base: 'Cotisations affectées à la retraite de base',
      bounds: 'Diviseur de reconstitution du revenu cotisé 2026',
      rounding: 'exact',
      source: retirementSource,
    },
    quarterThreshold: moneyRule(
      'base-retirement-quarter-threshold',
      180_300,
      'Revenu cotisé de retraite de base',
      'Un trimestre complet; maximum annuel séparé',
      retirementSource,
    ),
    annualQuarterCap: {
      id: 'base-retirement-quarter-cap',
      value: 4,
      base: 'Année civile',
      bounds: 'Maximum tous régimes de base confondus',
      rounding: 'down',
      source: retirementSource,
    },
  },
  // Deliberately omitted: applicable 2026 complementary-retirement values are not verified.
  cfe: {
    id: 'cfe-user-entered-or-exempt',
    value: 'user-entered-or-exempt',
    base: 'Montant local saisi ou exonération confirmée',
    bounds: 'Aucun montant national forfaitaire',
    rounding: 'not-applicable',
    source: cfeSource,
  },
}

const defaultRequiredRules: Array<keyof RegulatoryCatalog> = [
  'microSocial',
  'professionalTraining',
  'microTurnoverCeiling',
  'socialSecurityCeilingMonthly',
  'socialSecurityCeilingAnnual',
  'employeeContributions',
  'baseRetirement',
  'cfe',
]

export function assertUsableCatalog(
  catalog: Partial<RegulatoryCatalog>,
  scenarioYear: number,
  requiredRules: Array<keyof RegulatoryCatalog> = defaultRequiredRules,
): asserts catalog is RegulatoryCatalog {
  if (catalog.year !== scenarioYear) {
    throw new RangeError(
      `L’année du catalogue (${String(catalog.year)}) ne correspond pas à ${scenarioYear}.`,
    )
  }
  for (const key of requiredRules) {
    const entry = catalog[key]
    if (entry === undefined) throw new Error(`Règle requise absente: ${key}.`)
    assertKnownNestedRules(entry, String(key))
  }
}

function assertKnownNestedRules(value: unknown, path: string): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertKnownNestedRules(item, `${path}[${index}]`))
    return
  }
  if (typeof value !== 'object' || value === null) return
  if ('source' in value) {
    const ruleSource = (value as { source: SourceReference }).source
    if (ruleSource.status !== 'known') {
      throw new Error(`La règle ${path} est provisoire ou estimative.`)
    }
    for (const field of [
      ruleSource.authority,
      ruleSource.documentTitle,
      ruleSource.canonicalUrl,
      ruleSource.effectiveDate,
      ruleSource.verificationDate,
    ]) {
      if (field.trim() === '') throw new Error(`Métadonnée de source absente pour ${path}.`)
    }
    return
  }
  for (const [key, child] of Object.entries(value)) {
    assertKnownNestedRules(child, `${path}.${key}`)
  }
}
