# Data model — EI 2026

## EiInput

- turnover, professionalExpenses, healthInsuranceAnnual, cfeAnnual : centimes entiers non négatifs sûrs ; cfeAnnual optionnel.
- cfeExemptionConfirmed : booléen propre à EI, jamais déduit du booléen micro.
- Un montant CFE strictement positif est connu. Une exonération confirmée établit zéro, même si un montant ancien est présent. Zéro seul ne confirme pas une exonération.

Pas de date de création : contrat fixe année pleine, hors ACRE. Les frais sont communs, mais déductibilité sociale exclut la mutuelle personnelle.

## EiResult

Union discriminée : status = estimated ou blocked. Bloqué : reason, sources, aucun montant disponible. Calculé : turnover, deductibleExpenses, grossIncome (signé), socialBase, abatement, deductions (id/label/base/amount/source), contributions, netBeforePersonalInsurance (signé), availableBeforeIncomeTax (signé), healthInsuranceAnnual, sources. Toutes sommes signées restent Number.isSafeInteger ; intermédiaires BigInt, aucun calcul monétaire en flottants.

## Comparaison UI

Résultat micro/salarié existant conservé. Cash micro = totalValue (net après frais, sans avantage) sous réserve CFE connue. Cash salarié = netIncome ; avantages = annualBenefits séparés. Différences EI/micro et EI/salariat sur disponibles seulement. Un écart micro indisponible si CFE micro inconnue ; éligibilité micro reste avertie.

## État

Confirmation CFE EI locale à la carte, false initialement ; non stockée/exportée dans schema 1. Tous calculs sont sans état ni cache mutable. Aucun nouveau type StatusKind pour ne pas étendre implicitement cartes, projections, retraite et rapports.
