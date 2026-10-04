# Implementation Plan: Finaliser la retraite complémentaire 2026

**Branch**: `feat/003-retraite-complementaire` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

## Summary

Finaliser Agirc-Arrco et RCI dans le cœur existant; calcul rationnel exact, paramètres sous-centime conservés, résultat annuel estimatif et sources consultables. Aucun nouveau service ni saisie de carrière.

## Technical Context

- Language/Version: TypeScript, Node.js 24 (`.nvmrc`).
- Primary Dependencies: React, Vite, Vitest, Playwright; aucune nouvelle dépendance de production.
- Storage: aucune; paramètres 2026 statiques, calculs navigateur.
- Target Platform: GitHub Pages, navigateur desktop/tablette/mobile.
- Testing: frontières à ±1 centime, arrondis indépendants, erreurs, composants et parcours E2E.
- Constraints: revenus et droits de base inchangés, sources datées, fonctionnement hors réseau après chargement.
- Performance: préserver l'assertion existante de mise à jour en 100 ms.
- Scope: deux régimes complémentaires annuels; ni Cipav ni pension de carrière.

## Constitution Check

I: sources officielles et résultats estimatifs séparés; PASS.
II: modèles purs, BigInt rationnel et tests écrits avant comportements; PASS.
III: chiffres dans les résultats existants, détails facultatifs; PASS.
IV: catalogue statique sans secret ou serveur; PASS.
V: format/lint/typecheck/tests/E2E/build exécutés avant livraison; porte à vérifier.
Workflow: specify et revue clarify terminés; plan et design avant tasks/implement.
Post-design: aucun écart constitutionnel requis.

## Project Structure

- `src/domain/model.ts`: règles complémentaires distinctes par régime; valeur d'un point en unités de 0,0001 € (pas MoneyCents).
- `src/domain/rules/2026.ts`: catalogue et organismes exacts, dates/sources Agirc-Arrco et CNAV.
- `src/domain/retirement.ts`: calcul exact des tranches/allocations, blocage local et valorisation indépendante de l'arrondi des points.
- `src/components/Results.tsx`: régime, estimation, convention et sources complémentaires.
- `tests/unit/complementary-retirement.test.ts`: références indépendantes et cas négatifs.
- `tests/unit/{employee-retirement,micro-retirement,retirement,rules-2026,App}.test.*`: préserver les anciennes garanties, remplacer les attentes de blocage devenu résolu.
- `tests/e2e/projection.spec.ts`: chiffres, sources, labels estimatifs et invariance des revenus.
- `specs/003-retraite-complementaire/`: spec, recherche, modèle, contrat, guide et tâches.
- `specs/002-comparaison-statuts/`: ajouter résolution historique traçable; T050 reste ouvert.

## Design

Valeurs de point: unités entières de 1/10 000 €. Prix Agirc201877, service14386; prixRCI217260, service13470. Rejeter valeur nulle/invalide. Règles complémentaires indépendantes: absence/provisoire/métadonnée vide bloque le régime seul. Prix absent bloque points et pension; service absent bloque le résultat complémentaire complet, conforme FR-006.

Calcul des points avec numérateur/dénominateur BigInt. Arrondir l'affichage à 1/100 point et la pension à 1 centime depuis la fraction non arrondie (pas depuis les points affichés). Résultats complémentaires `estimated`, même avec sources `known`. Aucun arrondi de caisse déduit du seul exemple CNAV.

## Complexity Tracking

Aucune violation, aucun ajout de bibliothèque de calcul ou de moteur réglementaire.
