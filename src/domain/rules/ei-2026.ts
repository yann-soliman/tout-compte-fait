import type { SourceReference } from '../model'

const source = (documentTitle: string, canonicalUrl: string): SourceReference => ({
  authority: 'Urssaf / Mon-entreprise — règles publiées modele-ti 0.1.0',
  documentTitle,
  canonicalUrl,
  effectiveDate: '2026-01-01',
  verificationDate: '2026-10-04',
  status: 'estimated',
})

/** Scope: full-year metropolitan non-regulated BNC, IR, no social exemptions/options. */
export const eiRules2026 = {
  pass: 4_806_000n,
  minimumRetirementBase: 540_900n, // 450 hours × January 2026 SMIC €12.02
  abatementBps: 2600n,
  abatementMinimumBps: 176n,
  abatementMaximumBps: 13000n,
  // [ceiling as hundredths of PASS, rate as hundredths of a percent]
  sicknessBands: [
    [20n, 0n],
    [40n, 150n],
    [60n, 400n],
    [110n, 650n],
    [200n, 770n],
    [300n, 850n],
  ],
  familyBands: [
    [110n, 0n],
    [140n, 310n],
  ],
  sources: {
    reform: source(
      'Réforme de l’assiette sociale — règles et bornes',
      'https://www.urssaf.fr/accueil/independant/comprendre-payer-cotisations/reforme-cotisations-independants.html',
    ),
    simulator: source(
      'Simulateur officiel EI 2026 — calcul indicatif',
      'https://mon-entreprise.urssaf.fr/simulateurs/entreprise-individuelle',
    ),
    pass: source(
      'Plafonds de la Sécurité sociale 2026',
      'https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/plafonds-securite-sociale.html',
    ),
    minima: source(
      'Barèmes et cotisations minimales — indépendants non réglementés',
      'https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-ac-plnr.html',
    ),
    sickness: source(
      'Maladie-maternité — D621-2',
      'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049904592',
    ),
    ij: source(
      'Indemnités journalières — D621-3',
      'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049904537',
    ),
    retirement: source(
      'Retraite de base — D633-3',
      'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049904636',
    ),
    rci: source(
      'Retraite complémentaire — barème publié 2026',
      'https://www.urssaf.fr/accueil/independant/comprendre-payer-cotisations/vos-cotisations.html#ancre-retraite-complementaire',
    ),
    disability: source(
      'Invalidité-décès — D632-1',
      'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041966755',
    ),
    family: source(
      'Allocations familiales — D613-1',
      'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041966324',
    ),
    csg: source(
      'CSG-CRDS — deux postes arrondis séparément',
      'https://www.urssaf.fr/accueil/independant/comprendre-payer-cotisations/vos-cotisations.html#ancre-csg-crds',
    ),
    training: source(
      'Formation professionnelle — L6331-48',
      'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044056633',
    ),
  },
} as const
