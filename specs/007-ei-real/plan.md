# Implementation Plan: EI au réel BNC 2026

**Branch**: `feat/007-ei-real` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

## Summary

Ajouter un calcul EI pur dédié et une troisième alternative après les entrées. Ne pas modifier calculateComparison, les solveurs ou le schéma de stockage. Choisir une transcription restreinte et exacte des règles officielles, sans moteur Publicodes au runtime (cycle reproduit). Comparer à des oracles externes et au simulateur officiel avant livraison.

## Technical Context

- TypeScript, React, Vite existants ; Node 24.20.0 requis.
- Aucune dépendance ajoutée ; BigInt pour assiette, interpolation progressive et arrondis.
- Stockage existant schema 1 intact. Confirmation CFE EI locale à l’UI, non persistée dans les offres.
- Vitest, Testing Library, Playwright/axe existants ; deux workers maximum.
- Application web statique, utilisable hors ligne après chargement ; aucun secret ou service.
- Objectif : coût constant de neuf postes par calcul, aucune initialisation moteur dans cartes/solveurs.
- Seuls BNC non réglementé, France métropolitaine, année pleine, IR avant impôt, sans exonérations sociales ou options particulières.

## Constitution Check

Avant recherche : sources officielles nécessaires ; domaine indépendant de React ; centimes exacts ; UI numérique après entrées ; aucun serveur. Recherche et design : calcul social en euros arrondis selon règles publiées, puis conversion exacte en centimes ; résultat toujours estimatif. Sources datées, frontières et oracles requis. Aucune violation architecturale. Validation finale conditionnée aux portes et aux preuves, pas au statut des documents.

## Project Structure

Documentation unique `specs/007-ei-real/` : spec, plan, research, data-model, contracts/ui.md, quickstart, tasks, verification.

- `src/domain/ei.ts` : calcul pur, entrées dédiées, union résultat calculé/bloqué.
- `src/domain/rules/ei-2026.ts` : constantes sourcées et hypothèses.
- `src/components/EiComparison.tsx` : carte, détail et comparaison cash des trois statuts, confirmation CFE EI.
- `src/App.tsx` : intégration après résultats et limite explicite des outils micro/salariat.
- `src/styles.css` : carte compacte réutilisant les classes existantes.
- `tests/unit/ei.test.ts`, `tests/unit/EiComparison.test.tsx` : TDD vertical.
- `tests/e2e/ei.spec.ts` : annuel/mensuel, CFE, négatif, offline et axe aux trois largeurs.

## Phases

1. Rechercher les postes/bornes/arrondis et comparer une formule indépendante au modèle publié ; vérifier le simulateur officiel BNC.
2. TDD vertical calcul normal, puis déficit/minima, bornes, centimes, CFE et isolation.
3. TDD UI comparaison cash puis contrôle CFE ; intégrer dans App sans altérer les anciens résultats.
4. Tests navigateur, portes séquentielles et analyse/convergence. Rapport/offres EI différés, périmètre à deux statuts explicite.

## Decisions

La dépendance moteur rejetée évite poids, initialisation et référence circulaire. La transcription est volontairement étroite et ne promet pas de généraliser aux exonérations, activités réglementées ou proratas. Les neuf postes se réconcilient au centime ; la précision réglementaire demeure à l’euro pour chaque poste. Ne pas refactorer l’ancien domaine monétaire non négatif : utiliser un résultat signé sûr propre à EI.
