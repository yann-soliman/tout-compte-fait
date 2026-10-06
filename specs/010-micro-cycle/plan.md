# Implementation Plan: Cycle micro

**Branch**: `010-micro-cycle` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

## Technical Context

TypeScript/React/Vite statique ; Vitest et Playwright ; centimes entiers/BigInt ; localStorage schema 1 inchangé, aucune nouvelle dépendance. Calcul pur indépendant des vues.

## Constitution Check

Sources officielles et frontières ; valeurs monétaires exactes ; synthèse concise/détails optionnels ; aucune API runtime ; validation réelle avant livraison. Pas de dérogation.

## Design

Conserver calculateAnnualComparison pour les calculs statutaires annuels, encapsuler calculateComparison avec moyenne de deux années seulement en cas de dépassement. Le résultat garde les valeurs annuelles first/second dans microCycle dérivé. Retraite/éligibilité restent celles de l’année saisie, pas une moyenne de droits. Les frais et jours d’effort restent constants (pas de facturation déplacée ou de revenu EI ajouté).
Projection part du scénario brut, recalcul annuel à règles 2026 et plafond constants, un suivi du dépassement antérieur permet l’alternance sans gonfler les années inférieures. Croissance des recettes/salaire bruts, pas de multiplication du net ; cap appliqué aux recettes réalisées, frais fixes inchangés.
IR : utiliser recettes annuelles first/second pour l’abattement, barème annuel et foyer constant puis moyenner les résultats. EI conserve le CA saisi chaque année, aucune baisse artificielle appliquée aux alternatives.

## Verification

Couvrir exactitude, seuils, prorata, invariance frais/salariat/EI, non-linéarité fiscale, horizon impair, croissance/franchissement/décroissance, erreurs. Rejouer consommateurs partagés sans affaiblir leurs assertions. Oracle séparé et revue complète avant clôture.
