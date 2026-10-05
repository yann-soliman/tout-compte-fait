# Vérification — disponible après IR

## Résultat final

Implémentation locale validée sur `feat/008-income-tax`, non publiée. Publication initialement exclue ; autorisation explicite ultérieure de Yann : « Go publier », commit/PR/CI/fusion et contrôle de production. Sources de référence 2026 sur revenus 2025, projection des revenus 2026 à référence constante ; pas impôt définitif ni faux barème 2027.

## Portes réellement exécutées

- `npm run format:check` : sortie 0.
- `npm run lint` : sortie 0, zéro warning.
- `npm run typecheck` : sortie 0.
- `npm test -- --maxWorkers=2` : sortie 0, **318 tests / 30 fichiers**.
- `npm run test:e2e -- --workers=2` : sortie 0, **69 tests navigateur**.
- `npm run build` : sortie 0.
- `git diff --check` : sortie 0.

Portes exécutées séquentiellement avec Node 24, sans nouvelle dépendance. Logs bruts hors dépôt : `../tcf-008-research/full-gates-final.{txt,json}`.

## Oracle fiscal indépendant des fixtures unitaires

PDF officiel DGFiP `21-calcul_impot_369a382.pdf`, tables célibataire/couple et parts prises en charge : **1293 cas**, **aucun écart** d'impôt dû après seuil de recouvrement. Fichiers hors dépôt : `../tcf-008-research/official-fixtures.json`, `oracle.mjs`, `oracle-result.json` ; exécution réelle `node ../tcf-008-research/oracle.mjs`.

La fixture 28 500 € / 1,5 part a révélé un double arrondi de décote ; test observé RED puis calcul rationnel direct corrigé GREEN, impôt dû 877 €. Les phases barème, bases, IR incrémental, CFE, déficit/hauts revenus/plage, UI et reset ont eu des RED/GREEN observés pendant l'implémentation. Les tests de régression supplémentaires ne sont pas présentés rétrospectivement comme test-first. Cet oracle vérifie les tables de référence, pas les futurs textes 2027 ni un RFR complet.

## Revue et audit

Audit parent : domaine pur BigInt, cash/base séparés, fraction CSG/CRDS salariale multi-bases et EI réintégrée, minima/maxima d'abattement bornés, parts/plafond/décote/recouvrement, IR incrémental, absence de double PAS, déficit EI et inconnues bloqués, seuil hauts revenus conservateur et RFR spécial exclu. Aucun appel réseau, secret, HTML non fiable ou changement des snapshots schema 1 dans les nouveaux modules.

Revue indépendante de lecture fournie à un processus Hermes séparé `openai-codex` (session `20261005_103651_fcf7d9`) : JSON fail-closed validé, `passed=true`, tableaux `security_concerns` et `logic_errors` vides. La revue n'a pas exécuté les tests et n'est pas une certification juridique. Deux suggestions couvertes par les tests supplémentaires : reconstruction salariale multi-bases sans override ; entrée fiscale négative et récupération après correction. Troisième suggestion conservée comme limitation honnête : un RangeError de conversion commune des bases peut bloquer les trois projections fiscales, jamais le comparateur avant IR. Les derniers ajustements CSS ont été vérifiés par le parent et les portes finales, pas par cette revue de lecture.

## Navigateur et compatibilité

Six nouveaux tests couvrent 360/768/1280 px : activation clavier et tactile réel mobile, revenu annuel/moyenne mensuelle, couple/autres revenus, sources datées, fonctionnement hors ligne après chargement, CFE distinctes, déficit, hauts revenus, rejet sous-centime et acceptation 0,29 €. Axe zéro violation. Captures finales entrées et résultats inspectées, montants/titres complets et contrastés.

Le contrôle mobile initial `scrollWidth <= innerWidth` était insuffisant : en émulation mobile `innerWidth` s'élargissait avec le débordement. La régression stricte `scrollWidth <= viewportSize.width` a échoué réellement (410 px pour 360 px), révélé des pistes de grille à minimum implicite dans le simulateur et ses règles responsive ; correction ciblée `minmax(0, 1fr)`, puis GREEN et suite complète verte. Pas de masquage horizontal des contenus pour cacher le défaut.

Hypothèses fiscales avant résultats, opt-in initial désactivé ; chargement/reset effacent activation/foyer/revenus/override. Sauvegardes et exports schema 1 inchangés. Offres, rapport, carte, seuils et projection économique restent explicitement avant IR ; aucun panel humain réintroduit.

## Analyse et convergence Spec Kit

Pré-requis exécutés et `.specify/feature.json` sélectionne `specs/008-income-tax`. Constitution et workflows analyze/converge relus, pas de configuration d'extension. Analyse documentaire : **12 exigences/critères**, **11 tâches**, couverture **100 %**, aucune exigence/tâche non reliée ni violation critique. Convergence code/preuves : FR-001 à FR-008, SC-001 à SC-004, huit scénarios d'acceptation, décisions du plan et cinq principes constitutionnels satisfaits. Aucun travail supplémentaire à ajouter ; pas de section vide.

- FR-001 : T001, T002, T007.
- FR-002 : T002, T004.
- FR-003 : T003, T006.
- FR-004 : T005, T007.
- FR-005 : T005, T007.
- FR-006 : T007, T009.
- FR-007 : T008.
- FR-008 : T006, T009, T010, T011.
- SC-001 : T006.
- SC-002 : T007.
- SC-003 : T009.
- SC-004 : T010.

## Limites conservées

Foyer simple uniquement : pas parent isolé/veuvage/invalidité/garde alternée, fiscalité internationale, PFU, versement libératoire, PER, réductions/crédits ou déficits reportés. Net imposable salarial dérivé indicatif hors mutuelle employeur/avantages imposables ; override de paie disponible. EI annualisée simplifiée sans décalage fiscal/social. RFR complet/CEHR/CDHR hors périmètre, même si revenus RFR-only ne déclenchent pas le garde sur base totale. Mensuel moyenne, pas échéancier de trésorerie. Micro hors plafond reste une hypothèse fiscale avec warning, pas une recommandation de régime.
