# Implementation Plan: Disponible après IR

**Branch**: `feat/008-income-tax` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

## Summary

Domaine fiscal pur dédié, catalogue de référence séparé des cotisations 2026. Calcul rationnel BigInt, arrondi à l'euro pour fiscalité, cash en centimes. Aucune modification des moteurs avant IR ou du stockage. Composant autonome avec contrôles dans App avant Results ; résultats après EI. État local partagé, réinitialisé lors de chargement/reset.

## Technical Context

React/TypeScript/Vite existants, Node24 ; aucune dépendance nouvelle. Deux workers Vitest/Playwright. Cible statique offline ; calcul constant cinq tranches, maximum six enfants. Sources PDF DGFiP récupérées hors dépôt. Barème référence 2026 sur revenus2025 utilisé uniquement comme projection constante sur revenus2026. Pas de moteur fiscal général ni d'extrapolation silencieuse.

## Constitution Check

I : sources et années distinctes, toutes limites affichées. II : entiers/rationnels, domaine pur et TDD. III : entrées avant résultats, montants prioritaires et détails repliables. IV : statique/local, schema1 intact. V : format/lint/types/unitaires/E2E/build et captures. Aucune exception nécessaire avant et après design.

## Project Structure

`src/domain/income-tax.ts`, `src/domain/rules/income-tax-reference.ts`, `src/components/IncomeTaxComparison.tsx`, intégration `src/App.tsx`, styles dédiés `src/styles.css`. Tests `tests/unit/income-tax.test.ts`, `tests/unit/IncomeTaxComparison.test.tsx`, `tests/e2e/income-tax.spec.ts`. Documents uniquement specs/008-income-tax.

## Phases

TDD calcul barème normal → plafond/décote → bases → incrément/guards → UI → reset → E2E/compatibilité → portes → analyse/convergence. Publication exclue du cadrage initial, puis autorisée explicitement par Yann (« Go publier ») avec CI et vérification de production.

## Decisions

Barème constant explicite plutôt que faux barème2027 ; IR incrémental plutôt qu'allocation proportionnelle arbitraire de l'impôt du foyer. Champs fiscaux non persistés ; risque de migration évité. Hauts revenus >=250k célibataire/500k couple bloqués ; RFR spécial hors périmètre même sous ces seuils. Déficit EI bloque son résultat fiscal plutôt qu'imputer arbitrairement. Sources directes et oracle DGFiP requis.
