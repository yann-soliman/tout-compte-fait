# Data model

TaxHousehold : status single/couple, children integer0..6 en charge exclusive, otherTaxableIncome cents non négatifs. Parts : 1 ou2 + demi-part pour deux premiers puis part/enfant. Pas de parts libres.
TaxOptions : enabled false initialement ; salaryNetTaxableOverride facultatif cents. Pas dans ComparisonScenario schema1.
TaxResult : base annuelle euros arrondis, impôt brut plafonné, décote, impôt dû euros, demi-parts, sources.
AfterTaxAlternative : estimated ou blocked(reason), taxableIncome, cashBefore, householdTax, baselineTax, additionalTax et cashAfter. Toutes valeurs cash sûres signées, pas de soustraction flottante.
États : activation explicite ; modifications foyer immédiates ; charger/reset désactive et remet célibataire0enfant0autres/overrideabsent. Ne pas modifier les snapshots.
