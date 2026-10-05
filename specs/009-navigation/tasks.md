# Tasks: Navigation guidée puis libre

## Phase 1 — Cadrage

- [x] T001 Lire constitution/workflows, sélectionner specs/009-navigation et créer spec clarifiée/plan/research/model/contracts/quickstart (FR-008).

## Phase 2 — US1 saisir/comparer

- [x] T002 RED/GREEN quatre vues, bouton guidé et aller-retour état dans src/App.tsx, src/domain/model.ts, tests/unit/navigation.test.tsx (FR-001/002).
- [x] T003 RED/GREEN synthèse trois statuts, résumé, limites, détails/retraite repliés dans src/components/ComparisonOverview.tsx, Results.tsx et App.tsx (FR-003/004, SC-001).

## Phase 3 — US2 outils/scénarios

- [x] T004 RED/GREEN séparation exploration/bibliothèque, conservation sélection/aléas et projection montée stable dans DecisionTools.tsx/App.tsx et tests/unit/navigation.test.tsx (FR-002/005, SC-002).
- [x] T005 Adapter tests existants aux nouveaux parcours, conserver toutes assertions métier dans tests/unit et tests/e2e (FR-006/008, SC-003).

## Phase 4 — US3 accessibilité

- [x] T006 RED/GREEN roving focus/flèches/Home/End, focus destination et blocages sans faux scénario dans App.tsx et tests/unit/navigation.test.tsx (FR-006/007).
- [x] T007 Vérifier tactile/clavier/offline/axe/360/768/1280 et captures via tests/e2e/navigation.spec.ts ; CSS src/styles.css (FR-007, SC-004).

## Phase 5 — Qualité

- [x] T008 Portes séquentielles format/lint/types/unit/E2E/build/diff ; README et specs/009-navigation/verification.md (FR-008, SC-001/003).
- [x] T009 Analyse/convergence Spec Kit et revue indépendante, aucun moteur changé ou publier sans nouvel accord (FR-008).

## Dependencies

T001→T002→T004→T003→T006→T005→T007→T008→T009. Un RED constaté par nouveau comportement, tests supplémentaires de couverture non revendiqués comme test-first.

## Parallel Opportunities

Sources/lecture et revue isolées ; migration de tests séparée des fichiers d’implémentation après contrat stable. Portes exécutées séquentiellement avec deux workers.

## Implementation Strategy

Conserver le moteur et les snapshots, réorganiser leur accès et leur rendu ; pas de nouveau comparateur fiscal ou projection EI. Publication séparée.
