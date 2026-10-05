# Tasks: EI au réel BNC 2026

Input : spec.md, plan.md, research.md, data-model.md, contracts/ui.md, quickstart.md. TDD vertical obligatoire ; une case cochée exige la preuve documentée dans verification.md. Aucune publication.

## Phase 1: Setup

- [x] T001 Lire les instructions et contrôler hooks/templates/feature unique dans `.specify/feature.json`.
- [x] T002 Compléter et clarifier `specs/007-ei-real/spec.md` et sa checklist.

## Phase 2: Foundational

- [x] T003 Reproduire le cycle et comparer les formules/oracles externes dans `specs/007-ei-real/research.md`.
- [x] T004 Compléter `specs/007-ei-real/plan.md`, `data-model.md`, `contracts/ui.md` et `quickstart.md`.

## Phase 3: US1 — disponible annuel (P1)

- [x] T005 [US1] Observer RED puis GREEN du cas normal dans `tests/unit/ei.test.ts` et `src/domain/ei.ts`, règles sourcées dans `src/domain/rules/ei-2026.ts` (FR-001/002/003).
- [x] T006 [US1] Tester minima, déficit, plafonds, bornes 26 %, progressivité et centimes par oracles dans `tests/unit/ei.test.ts` (FR-001/002/003/008).
- [x] T007 [US1] Observer RED puis GREEN de la comparaison cash dans `tests/unit/EiComparison.test.tsx` et `src/components/EiComparison.tsx`, intégration `src/App.tsx` (FR-004/006).

Independent test : 100 000/3 000 => cotisations 30 141, net 66 859, disponible après mutuelle 66 559 ; CA 0 => minima 1 255 et déficit.

## Phase 4: US2 — hypothèses et incertitudes (P1)

- [x] T008 [US2] Observer RED puis GREEN de CFE inconnue/exonérations distinctes dans `tests/unit/ei.test.ts` et `src/domain/ei.ts` (FR-005).
- [x] T009 [US2] Tester contrôles CFE, mutuelle non Madelin, date micro sans effet EI et sources dans `tests/unit/EiComparison.test.tsx` ; compléter `src/components/EiComparison.tsx` (FR-004/005/006).

Independent test : exonération micro seule ne débloque jamais EI ; CFE EI confirmée établit zéro.

## Phase 5: US3 — offline et compatibilité (P2)

- [x] T010 [US3] Vérifier UI annuelle/mensuelle, clavier, axe, offline et largeurs 360/768/1280 dans `tests/e2e/ei.spec.ts` et `src/styles.css` (FR-006/007/008, SC-003).
- [x] T011 [US3] Rendre explicites les outils/offres/rapport/projection/retraite à deux statuts dans `src/App.tsx`, préserver stockage schema 1 et snapshots anciens (FR-006/007).

Independent test : modifier TJM hors ligne ; anciennes offres/CSV toujours validées par suites existantes.

## Phase 6: Polish et vérification

- [x] T012 Exécuter les portes complètes séquentiellement et documenter les preuves dans `specs/007-ei-real/verification.md` (SC-001/002/003/004).
- [x] T013 Exécuter analyze et converge, couvrir FR-001 à FR-008 et SC-001 à SC-004 dans `specs/007-ei-real/verification.md` ; ne cocher que les tâches réellement vérifiées.

## Dependencies & Execution Order

T001 → T002 → T003 → T004 → T005/T006 → T007 → T008/T009 → T010/T011 → T012 → T013. Les tests de chaque comportement sont écrits/observés rouges avant leur code, pas une pile de tests horizontale. US2 utilise le calcul US1 mais son blocage est testable indépendamment ; US3 valide l’ensemble.

## Parallel Opportunities

Lectures indépendantes et rédaction des contrats/data-model peuvent être groupées. US1 : preuves externes et lecture UI ; US2 : sources et lecture contrôles ; US3 : inspection CSS et configuration navigateur. Implémentation par un seul agent, portes séquentielles, aucun sous-agent.

## Implementation Strategy

MVP calcul normal puis minima/frontières ; comparaison cash ; garde CFE ; UI et portes. Rapports/offres EI optionnels différés : aucune migration schema 1, ne pas prétendre les implémenter. Si les oracles ne concordent pas, bloquer la livraison et conserver les tâches ouvertes.

## Phase 7: Convergence

- [x] T014 Revérifier le contraste du contrôle CFE EI corrigé dans `src/styles.css` et inspecter les captures `tests/e2e/ei.spec.ts` selon SC-003 et Constitution V (partial).
- [x] T015 Couvrir le blocage local d’erreur EI hors plage sûre dans `src/components/EiComparison.tsx` et `tests/unit/EiComparison.test.tsx` selon FR-003/008 (partial).
- [x] T016 Achever les tests unitaires date/sources et isolation au chargement d’offres dans `tests/unit/EiComparison.test.tsx` selon US2/AC2 et FR-007/008 (partial).
