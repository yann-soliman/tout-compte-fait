# Tasks: Disponible après impôt

Input: spec, plan, research, data-model, contracts/ui, quickstart. Portes TDD verticales, pas de publication.

## Phase 1 — Cadrage

- [x] T001 Lire constitution/skills, scripts Spec Kit et clarifier le périmètre dans specs/008-income-tax/spec.md (FR-001).
- [x] T002 Récupérer/attribuer preuves officielles dans specs/008-income-tax/research.md et compléter design (FR-001/002/003).

## Phase 2 — US1 disponible (P1)

- [x] T003 RED/GREEN barème normal et arrondis dans tests/unit/income-tax.test.ts, src/domain/income-tax.ts et rules/income-tax-reference.ts (FR-003).
- [x] T004 RED/GREEN bases salaire/micro/EI distinctes du cash, tests frontières des abattements dans les mêmes fichiers (FR-002).
- [x] T005 RED/GREEN IR incrémental/cash et blocages CFE/déficit/plage/hauts revenus dans src/domain/income-tax.ts, tests/unit/income-tax.test.ts (FR-004/005).

## Phase 3 — US2 foyer (P1)

- [x] T006 RED/GREEN parts, plafond et décote, fixtures DGFiP et oracle dans tests/unit/income-tax.test.ts (FR-003/008, SC-001).
- [x] T007 RED/GREEN UI activée avec entrées avant résultats, bases/IR/cash et sources/exclusions, src/components/IncomeTaxComparison.tsx, src/App.tsx, src/styles.css et tests/unit/IncomeTaxComparison.test.tsx (FR-001/004/005/006, SC-002).

## Phase 4 — US3 compatibilité (P2)

- [x] T008 RED/GREEN reset/chargement des hypothèses fiscales, schema1 intact et limites outils/exports dans App et tests/unit/IncomeTaxComparison.test.tsx (FR-007).
- [x] T009 Exercer clavier/axe/offline/périodes/360/768/1280 dans tests/e2e/income-tax.spec.ts et inspecter captures (FR-006/008, SC-003).

## Phase 5 — Vérification

- [x] T010 Portes complètes séquentielles format/lint/types/unit/E2E/build/diff, README et specs/008-income-tax/verification.md ; compatibilité existante (FR-008, SC-004).
- [x] T011 Analyse/convergence et revue parent, couvrir FR-001 à008/SC-001 à004, sans revendication d'IR définitif (FR-001/008).

## Dependencies & Execution Order

T001→T002→T003→T006→T004→T005→T007→T008→T009→T010→T011. Un test observé rouge avant chaque nouveau comportement. Fixtures supplémentaires sur formule générique = régressions, ne pas les décrire rétroactivement comme RED.

## Parallel Opportunities

Sources indépendantes et lectures groupées ; un agent d'implémentation, portes séquentielles sur hôte contraint.

## Implementation Strategy

Barème puis contraintes foyer et bases, une alternative aprèsIR à la fois, UI optionnelle, isolation stockage, E2E et oracle. Publication exclue du cadrage initial, puis autorisée explicitement par Yann (« Go publier ») avec CI et vérification de production.
