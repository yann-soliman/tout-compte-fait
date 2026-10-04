# Tasks: Finaliser la retraite complémentaire 2026

**Input**: spec.md, plan.md, research.md, data-model.md, contracts/ui-contract.md, quickstart.md.
**Tests**: TDD obligatoire; un comportement testable rouge puis vert avant le suivant.

## Phase 1: Setup

- [x] T001 Vérifier Node24, scripts et absence de hooks dans `.specify/`, puis enregistrer les sources officielles dans `specs/003-retraite-complementaire/research.md`.

## Phase 2: Foundational

- [x] T002 Définir les valeurs de point en unités entières de0,0001 € et les règles séparées dans `src/domain/model.ts`, puis tester la précision/provenance dans `tests/unit/complementary-retirement.test.ts` avant le catalogue dans `src/domain/rules/2026.ts`.

## Phase 3: User Story 1 — Agirc-Arrco (P1)

**Goal**: Points salarié et indication annuelle estimatifs, blocage local sûr.
**Independent Test**: 75,500 € ->378.67 points; bornes1/8PASS et valeur non arrondie.

- [x] T003 [US1] Écrire et observer le test rouge de l'exemple officiel dans `tests/unit/complementary-retirement.test.ts`, puis implémenter acquisition/valorisation exactes dans `src/domain/retirement.ts`.
- [x] T004 [US1] Ajouter tests de bornes±1cent, zéro, catégories/temps partiel et paramètres inutilisables dans `tests/unit/complementary-retirement.test.ts`; compléter les gardes dans `src/domain/retirement.ts`.

## Phase 4: User Story 2 — RCI (P1)

**Goal**: Modèle annuel BNC à21%, hors Cipav.
**Independent Test**: CA40,000 €, zéro, plafond83,600 € et gardes du régime.

- [x] T005 [US2] Écrire/observer test rouge RCI dans `tests/unit/complementary-retirement.test.ts`, puis implémenter le modèle annuel dans `src/domain/retirement.ts`.
- [x] T006 [US2] Tester arrondis, prix/service manquants, allocation21%/provisoire, Cipav et plage sûre dans `tests/unit/complementary-retirement.test.ts`, puis compléter le blocage local dans `src/domain/retirement.ts`.

## Phase 5: User Story 3 — Présentation (P2)

**Goal**: Résultats compacts, estimatifs, sources et limites claires.
**Independent Test**: Parcours navigateur aux trois largeurs, changement période/activation et fonctionnement sans réseau.

- [x] T007 [US3] Écrire/observer les attentes UI et E2E rouges dans `tests/unit/App.test.tsx` et `tests/e2e/projection.spec.ts`, puis afficher régimes, chiffres estimés, sources et limites dans `src/components/Results.tsx`.
- [x] T008 [US3] Réconcilier les anciennes attentes de blocage dans `tests/unit/employee-retirement.test.ts`, `tests/unit/micro-retirement.test.ts`, `tests/unit/retirement.test.ts` et `tests/unit/rules-2026.test.ts`, en préservant les garde-fous et invariances.

## Phase 6: Validation et livraison

- [x] T009 Réconcilier les paramètres et historique de recherche dans `specs/002-comparaison-statuts/{spec,research,tasks}.md` et sa checklist; mettre à jour `README.md`.
- [x] T010 Exécuter les six portes de qualité et les scénarios de `specs/003-retraite-complementaire/quickstart.md`; consigner les résultats réels dans ce fichier.
- [x] T011 Effectuer revue de cohérence analyse/convergence de `specs/003-retraite-complementaire/{spec,plan,tasks}.md` contre les fichiers d'application et tests; enregistrer toute limite restante dans `specs/003-retraite-complementaire/quickstart.md`.

## Dependencies & Execution Order

T001 -> T002 -> T003–T004 -> T005–T006 -> T007–T008 -> T009–T011. Tests rouges avant implémentations correspondantes, lecture des sources avant valeurs. US1 et US2 indépendantes fonctionnellement, exécutées séquentiellement car même fichier de calcul.

## Parallel Opportunities

Lecture des sources et vérification environnement peuvent se faire ensemble. Après le cœur terminé, revue documentaire et testsE2E sont indépendants. Ne pas modifier simultanément `retirement.ts` pour les deux histoires.

## Implementation Strategy

Livrer un premier exemple Agirc exact avant bornes/gardes, puis un exemple RCI avant bornes/gardes; intégrer l'UI une fois ces tranches validées. Aucune étude de panel humain n’est requise: cette exigence a été retirée par Yann.
