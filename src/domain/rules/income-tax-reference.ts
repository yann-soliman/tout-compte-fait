import type { SourceReference } from '../model'

const source = (documentTitle: string, canonicalUrl: string): SourceReference => ({
  authority: 'DGFiP / Service Public',
  documentTitle,
  canonicalUrl,
  effectiveDate: '2026-01-01',
  verificationDate: '2026-10-05',
  status: 'estimated',
})
const brochure = 'https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/'
export const incomeTaxReference = {
  assessmentYear: 2026,
  incomeYear: 2025,
  projectionIncomeYear: 2026,
  thresholdsEuros: [11600n, 29579n, 84577n, 181917n],
  ratesPercent: [0n, 11n, 30n, 41n, 45n],
  halfPartCapEuros: 1807n,
  discountSingleEuros: 897n,
  discountCoupleEuros: 1483n,
  sources: [
    source(
      'Barème 2026 — revenus 2025',
      'https://www.service-public.gouv.fr/particuliers/vosdroits/F1419',
    ),
    source(
      'Calcul, quotient familial, décote et arrondis',
      brochure + '21-calcul_impot_369a382.pdf',
    ),
    source('Salaires — déduction forfaitaire', brochure + '06-traitements_salaires_85a114.pdf'),
    source(
      'BNC — abattement micro et bénéfice réel',
      brochure + '11-revenus_non_salaries_161a182.pdf',
    ),
    source(
      'Seuil de recouvrement',
      'https://bofip.impots.gouv.fr/bofip/2496-PGP.html/identifiant=BOI-IR-LIQ-20-20-40-20180704',
    ),
    source(
      'BNC — CSG et CRDS non déductibles',
      'https://bofip.impots.gouv.fr/bofip/4635-PGP.html/identifiant=BOI-BNC-BASE-40-60-20-20150401',
    ),
    source(
      'Hauts revenus — limites du périmètre',
      'https://www.service-public.gouv.fr/particuliers/vosdroits/F31130',
    ),
    source(
      'Salaire — fraction CSG non déductible',
      'https://www.service-public.gouv.fr/particuliers/vosdroits/F2971',
    ),
  ],
} as const
