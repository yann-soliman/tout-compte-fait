# Vérification 007 — validée localement, non publiée

Branche conservée `feat/007-ei-real`. Aucun commit/push/tag/merge, aucune dépendance ajoutée, aucun ancien snapshot modifié. La reprise finale ci-dessous remplace le verdict incomplet de la première passe ; les sections historiques conservent les échecs réellement observés.

## Résultat fonctionnel exercé

EI au réel BNC non réglementé, année pleine 2026, IR avant impôt personnel, frais communs, mutuelle personnelle non Madelin, neuf postes sociaux et minima. CFE inconnue bloque EI ; confirmation distincte de celle micro. Comparaison cash après frais, avantages séparés. UI annuelle/mensuelle et sources. CalculateComparison et stockage schema 1 inchangés ; outils/offres/rapports/projection/retraite restent explicitement micro/salariat.

Défauts publiés conservés. CA 100 000 €, charges professionnelles 3 000 € : cotisations 30 141 €, net avant mutuelle 66 859 €, disponible après mutuelle 66 559 €. CA 0, mêmes frais : cotisations 1 255 €, net avant mutuelle −4 255 €, disponible −4 555 €.

Cash micro par calcul réel : 70 900 € ; salaire net : 39 520,95 € ; avantages : 3 000 € séparés. Écarts EI : −4 341 € face au cash micro (plafond dépassé, non recommandation d’éligibilité) et +27 038,05 € face au salaire net.

## Fichiers exacts du travail

Code nouveau :

- `src/domain/ei.ts`
- `src/domain/rules/ei-2026.ts`
- `src/components/EiComparison.tsx`

Code modifié :

- `src/App.tsx` : carte EI séparée, état CFE local réinitialisé aux chargements/reset, limites des autres outils.
- `src/styles.css` : styles EI ; dernière correction de contraste non revérifiée.

Tests nouveaux :

- `tests/unit/ei.test.ts`
- `tests/unit/EiComparison.test.tsx`
- `tests/e2e/ei.spec.ts`

Documentation : `.specify/feature.json` (sélecteur déjà présent à l’arrivée, formaté sans changer sa cible), et uniquement `specs/007-ei-real/` : `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/ui.md`, `quickstart.md`, `tasks.md`, `checklists/requirements.md`, `verification.md`.

## Preuves TDD et oracles

Cycles observés : fonction manquante RED → cas officiel GREEN ; CFE inconnue estimated au lieu de blocked RED → GREEN ; arrondi CA social manquant RED → GREEN ; région EI absente RED → GREEN ; contrôle CFE EI absent RED → GREEN. Une assertion UI d’espace insécable a été corrigée pour correspondre à la normalisation Testing Library, sans changer la valeur attendue.

Les tests supplémentaires de frontières/minima sont des tests de régression sur la formule générique, non des cycles RED distincts. Ne pas prétendre que chaque fixture avait échoué avant le calcul normal.

Sources : règles officielles `modele-ti` 0.1.0 et références raw ; formule indépendante externe `oracle.mjs` : 68 scénarios, aucun écart de total. Comparaison du domaine réel à Publicodes par `domain-oracle.mjs` : 221 scénarios, dont frontières/voisins en centimes et cas déterministes variés, zéro écart d’assiette et de total après correction d’arrondi du CA social. Le moteur externe produit 1 547 avertissements cycliques ; aucune suppression de warning dans la production car aucun moteur utilisé.

Attention centimes : la règle officielle CA arrondit à l’euro avant le calcul social. La production reproduit cet arrondi pour les cotisations mais conserve les recettes/frais réellement saisis en centimes dans le cash. Le cash peut donc différer du net moteur de quelques centimes ; ce n’est pas une exactitude normative au centime.

Navigateur officiel : profil activité Libérale, réglementée Non, création 01/01/2020, micro-fiscal Non, conjoint Non, taux RCI spécifique Non : cotisations 30 141 €, champ net 66 859 €. Les réponses aux autres exclusions n’ont pas toutes été confirmées manuellement. Accès direct barème Urssaf refusé par reset, Legifrance HTTP 403 ; limites normatives détaillées dans research.md.

Preuves externes sous `/home/hermes/.hermes/cache/scratch/tcf-007-research/` : `oracle.mjs`, `domain-oracle.mjs`, `domain-fixtures.json`, `domain-oracle-output.json`, `rounding.mjs`, `comparable.mjs`, `ui-red.txt`, `ui-green.txt`, `ui-cfe-red.txt`, `e2e-first.txt`. Les archives téléchargées restent hors dépôt.

## Portes réellement exécutées

Première tentative arrêtée par format:check sur le sélecteur feature.json préexistant ; format corrigé.

Deuxième tentative complète, strictement séquentielle :

- format:check : PASS.
- lint : PASS, zéro warning.
- typecheck : PASS.
- unitaires : PASS, 28 fichiers, 284 tests.
- navigateurs : FAIL, 42 PASS / 21 FAIL sur 63 tests. Toutes les erreurs rapportées concernent le même contraste du libellé « Confirmer une exonération CFE pour l’EI », couleur claire héritée sur fond clair (ratio 1,1). Le contraste est corrigé dans la dernière modification CSS, mais pas retesté.
- build : NON EXÉCUTÉ, chaîne arrêtée sur e2e.
- git diff --check : NON EXÉCUTÉ dans la chaîne arrêtée.

Avant les styles sombres EI, la suite ciblée EI avait réellement PASS : six tests, annuel/mensuel, sources, date micro indépendante, valeurs négatives/minima, offline, clavier et axe aux largeurs 360/768/1280. Cela ne valide pas le CSS final. Les captures `test-results/.../ei.png` sont produites ; elles n’ont pas été inspectées visuellement.

Les tests complets de chargement/reset d’anciens snapshots, vingt offres, JSON/stockage et seuils ont passé ; les tests de rapport comportant axe ont échoué sur le contraste EI général avant d’achever leur parcours. Ne pas affirmer une validation complète du rapport/CSV final.

## Analyze et converge

Analyse documentaire initiale : les exigences FR-001 à FR-008 et critères SC-001 à SC-004 sont reliés aux tâches ; aucune contradiction de périmètre identifiée. Hooks/extensions absents, templates résolus et setup-plan/setup-tasks/check-prerequisites exécutés ; un seul dossier de feature. La checklist de spécification est documentaire uniquement.

Convergence finale non acquise :

- SC-003/Constitution V : contraste corrigé non vérifié, captures non inspectées.
- SC-004 : e2e final rouge, build/diff non exécutés.
- T009 : contrôles CFE unitaires et date/sources navigateur existent, mais pas tous les cas dans le fichier unitaire prévu ; tâche conservée ouverte.
- T010/T011 : UI/compatibilité partiellement vérifiées, pas validation finale.
- T012/T013 : portes/analyse-convergence finales non achevées.

## Suite requise pour le parent

Relancer les portes exactes, séquentiellement, Node 24, deux workers ; inspecter les captures à 360/768/1280 ; terminer T009 et vérifier les écarts cash et l’isolation du contrôle EI au chargement d’offres. Examiner les plages extrêmes : la fonction domaine rejette correctement les sommes hors plage sûre, mais le composant EI ne dispose pas d’un catch local spécifique si un scénario valide pour les deux anciens statuts provoque une erreur EI. Ne pas considérer ce risque comme couvert.

Rapport/offres EI non implémentés (optionnels explicitement différés). Aucun IR personnel, IS, SASU, trésorerie ou retraite EI. Aucun panel humain réintroduit. Revue parent obligatoire avant toute publication.

## Reprise finale — résultat faisant foi

Portes exécutées strictement séquentiellement sur le code final, Node 24.20.0, deux workers : format:check PASS, lint PASS (zéro warning), typecheck PASS, **289 tests unitaires / 28 fichiers PASS**, **63 tests navigateur PASS**, build PASS, git diff --check PASS. Chaîne complète : exit_code 0. Le contraste corrigé ne déclenche plus de violation axe, y compris les parcours de rapport existants.

Captures EI `ei.png` inspectées visuellement aux projets mobile 360, tablette 768 et desktop 1280 : chiffres lisibles, colonne mobile et grilles adaptatives, aucune troncature de montant visible. Les assertions navigateur contrôlent également l’absence de débordement horizontal, le fonctionnement hors ligne et le clavier natif.

Oracle `node domain-oracle.mjs` relancé sur le domaine final : exit_code 0 ; fichier `domain-oracle-output.json` : **221 scénarios, zéro mismatch**, 1 547 avertissements cycliques du moteur de référence conservés. Ce résultat n’est pas une certification normative indépendante.

Revue parent du code final : calcul BigInt, validation centimes, garde CFE, sources et réconciliation ; blocage RangeError local sans masquer les anciens statuts ; différence cash calculée par BigInt puis vérifiée sûre avant affichage. Tests dédiés PASS : déficit hors plage sûre, écart salarié hors plage sûre, date micro et mutuelle sans effet social, liens/dates sources, chargement d’ancienne offre et reset réinitialisant la confirmation EI. Contrôle placé avant les résultats. Aucun eval, fetch, innerHTML ou console.log nouveau relevé dans les fichiers fonctionnels examinés. Pas de revue indépendante ni sous-agent : la revue est celle du parent, conformément au périmètre agent unique.

### Couverture et analyse Spec Kit finale

Prérequis `--require-spec --require-tasks --include-tasks` validés ; feature unique 007 ; aucun fichier extensions.yml, donc aucun hook enregistré. Analyse read-only des trois artefacts : aucun conflit bloquant, aucun placeholder requis, toutes les exigences et critères couverts. Les références compactes FR-001/002/003 et SC-001/002/003/004 des tâches sont développées explicitement ci-dessous.

- FR-001 : T005/T006, cas officiels et frontières du domaine.
- FR-002 : T005/T006, neuf postes et bornes sourcés, oracle 221 cas.
- FR-003 : T005/T006/T015, réconciliation centimes, déficit et garde plages sûres.
- FR-004 : T007/T009, cash sans avantages, mutuelle hors assiette.
- FR-005 : T008/T009, CFE inconnue et confirmations indépendantes.
- FR-006 : T007/T009/T010/T011, période, sources, limites explicites.
- FR-007 : T010/T011/T016, offline, schema 1 inchangé et reset/chargement.
- FR-008 : T006/T009/T010/T015/T016, cas limites, UI et accès clavier.
- SC-001 : T003/T006/T012, fixtures officielles et oracle sans mismatch.
- SC-002 : T008/T009/T012, absence de résultat CFE inconnue et mutuelle.
- SC-003 : T010/T014/T012, trois largeurs, axe, captures et offline.
- SC-004 : T011/T012, suite complète existante et build verts.

Convergence sur comportement final : US1/AC1–3, US2/AC1–3, US3/AC1–3, exigences et critères ci-dessus, décisions du plan et cinq principes constitutionnels vérifiés. Aucun travail fonctionnel restant dans le périmètre défini ; aucune nouvelle phase de convergence ajoutée. **16 tâches réellement vérifiées**, pas de panel ni de publication. Les preuves TDD initiales restent limitées aux cycles observés et ne sont pas réécrites rétrospectivement.

### Limites maintenues

Sources directes Urssaf/Legifrance partiellement inaccessibles pendant la recherche ; règles publiques officielles et simulateur utilisés, résultat affiché estimatif non opposable. France métropolitaine, BNC non réglementé, année pleine, sans ACRE/Madelin/options. IR du foyer, IS, SASU, trésorerie et droits retraite EI non calculés. Rapports/offres/seuils restent micro/salariat : intégration EI optionnelle différée, pas prétendue achevée. Branche locale uniquement ; publication non effectuée.
