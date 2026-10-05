# Recherche — EI au réel BNC 2026

Date de vérification : 2026-10-04 ; effet du barème de simulation : 2026-01-01. Recherche réalisée par l’agent unique, sans Copilot ni sous-agent.

## Décision

Transcription étroite des règles publiques officielles dans un calcul pur BigInt, sans dépendance npm supplémentaire. `modele-ti` 0.1.0 (MIT, publié 2026-07-16, peer publicodes ^1.0.4) sert de source et d’oracle externe, pas de runtime. `modele-social` 11.1.0 n’a pas le même contrat EI. Publicodes 1.10.3 (2026-09-16) et 1.10.1 donnent les mêmes probes ; 1.10.2 n’existe pas. Aucun de ces paquets n’est ajouté au projet.

Raison : neuf postes et un contrat volontairement restreint permettent un calcul exact, léger, offline, sans initialisation répétée dans calculateComparison/cartes/solveurs. Le modèle complet généraliste ajouterait poids, hypothèses implicites et avertissements.

## Cycle reproduit, non masqué dans la production

Le moteur (dist/index.js lignes 2040–2196) évalue l’applicabilité du parent nullable avant la valeur enfant. La règle parent maladie-maternité renvoie après exonérations ; après exonérations utilise avant exonérations ; des enfants d’avant exonérations retrouvent le parent nullable. C’est une récursion d’applicabilité, non une équation économique demandant un point fixe. Le moteur retourne undefined sur le cycle puis poursuit l’évaluation. Cela ne constitue PAS une garantie générale d’innocuité. Mayotte non et changement d’ordre ne suppriment pas l’avertissement. Aucune règle officielle modifiée, aucun ajout résoudre-référence-circulaire.

Le script externe `oracle.mjs` a reproduit 476 avertissements pour 68 évaluations ; la formule indépendante donne zéro écart de total sur les 68 scénarios (CA de 0 à 1 000 000 €, charges 0/3 000/9 999,99/100 000 €). Ce sont des preuves numériques contre le modèle, non une preuve légale indépendante. En production le moteur n’est pas utilisé : il n’y a donc ni suppression de son warning ni dépendance à ses résultats cycliques.

## Sources et formules retenues

Source primaire des valeurs et arrondis : raw rules de `modele-ti` 0.1.0, maintenu par Mon-entreprise/Urssaf, notamment `indépendant . cotisations et contributions`, ses règles enfants et leurs `.références`. Les archives et scripts sont hors dépôt sous `/home/hermes/.hermes/cache/scratch/tcf-007-research`.

- Réforme : https://www.urssaf.fr/accueil/independant/comprendre-payer-cotisations/reforme-cotisations-independants.html
- Barèmes/minima : https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-ac-plnr.html
- Simulateur : https://mon-entreprise.urssaf.fr/simulateurs/entreprise-individuelle (édition affichée 07/2026 ; revenu 2026).
- PASS 48 060 € : https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/plafonds-securite-sociale.html

Revenu brut = CA − charges professionnelles hors sociales. Abattement = 26 % du brut, borné par 1,76 % et 130 % du PASS, arrondi à l’euro ; assiette = max(0, brut − abattement), arrondie à l’euro (le mécanisme abattement ne crée pas d’assiette négative).

Vérification ultérieure sur centimes : la règle `entreprise . chiffre d’affaires` arrondit elle-même le CA à l’euro avant ce calcul social. Cet arrondi est reproduit pour l’assiette et les cotisations, tandis que la réconciliation cash garde les recettes/frais exacts. `domain-oracle.mjs` compare le domaine réel sur 221 cas : zéro écart d’assiette et de cotisations après cette correction. Le net moteur peut différer du cash exact de quelques centimes ; ne pas les assimiler sans préciser cette convention.

Les postes sont arrondis à l’euro ; les taux progressifs sont arrondis au centième de pourcentage :

1. Maladie : taux progressif selon assiette/PASS, nœuds (20 %,0 %), (40 %,1,5 %), (60 %,4 %), (110 %,6,5 %), (200 %,7,7 %), (300 %,8,5 %) ; taux sur les trois premiers PASS, puis 6,5 % au-delà. D621-1/D621-2 : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049904610 et https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049904592
2. IJ : 0,5 %, assiette min 40 % PASS, max 5 PASS ; D621-3 : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049904537
3. Retraite de base : 17,87 % jusqu’au PASS, 0,72 % au-delà ; minimum d’assiette 450 × SMIC horaire au début de 2026 (12,02 €), soit 5 409 € ; D633-2/D633-3 : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048838330 et https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049904636
4. RCI : 8,1 % jusqu’au PASS puis 9,1 % jusqu’à 4 PASS, pas de minimum ; D635-7 référencé dans le modèle : www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041966498 (lien brut conservé ici, URL navigable https dans l’UI).
5. Invalidité/décès : 1,3 %, minimum d’assiette 11,5 % PASS arrondi, maximum PASS ; D632-1 : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041966755
6. Famille : taux progressif de zéro à 3,1 % entre 110 % et 140 % PASS, puis 3,1 %, sur toute l’assiette ; D613-1 : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041966324
7. CSG déductible : 6,8 %, arrondi séparément.
8. CSG/CRDS non déductible : 2,9 %, arrondi séparément. « Déductible » décrit ici le poste social, pas un calcul IR personnel ; https://www.urssaf.fr/accueil/independant/comprendre-payer-cotisations/vos-cotisations.html#ancre-csg-crds
9. Formation : 0,25 % PASS, fixe même CA nul ; L6331-48 : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044056633

## Fixtures et limites des vérifications officielles

Probes moteur à charges 3 000 € : CA 0/10 000/50 000/100 000/200 000 € => cotisations 1 255/2 177/14 759/30 141/54 570 € et net −4 255/4 823/32 241/66 859/142 430 €. Le script indépendant `oracle.mjs` retrouve chaque total et détaille neuf postes.

Navigateur officiel le 2026-10-04 : CA 100 000 €, charges 3 000 €, annuel, IR, activité Libérale sélectionnée ; activité réglementée Non ; création 01/01/2020 ; micro-fiscal Non ; conjoint Non ; taux RCI spécifique Non. Le champ net vaut 66 859 €, cotisations affichées 30 141 €. Ce contrôle remplace le contrôle commercial par défaut initial. Les autres exclusions sont les hypothèses du modèle et devront rester visibles ; ne pas prétendre que toutes les réponses ont déjà été confirmées manuellement.

Accès direct barème Urssaf : navigateur ERR_CONNECTION_RESET, curl HTTP 000. Legifrance D621-2 : HTTP 403. L’extracteur web est indisponible (provider brave-free non enregistré). La preuve normative directe indépendante de ces textes est donc limitée : les valeurs sont sourcées dans les règles officielles publiées, corroborées numériquement, mais ne constituent pas une certification juridique. Le résultat reste une estimation non opposable, conformément au simulateur officiel.

## Alternatives rejetées

- Pourcentage global : ne respecte ni réforme, ni progressivité, ni minima.
- Copier toutes les règles : poids/maintenance inutiles et contrat hors périmètre.
- Publicodes runtime : cycle d’applicabilité non souhaitable dans un simulateur restreint, coût non nécessaire.
- Calcul normatif sans arrondis intermédiaires : ne reproduit pas les sorties de la source officielle.
- Extension aux outils de décision/offres/rapport : risque de modifier schema 1 et métriques anciennes ; différée, limites à deux statuts explicitement annoncées.
