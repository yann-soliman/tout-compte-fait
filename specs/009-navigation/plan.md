# Implementation Plan: Navigation

**Branch**: feat/009-navigation | **Date**: 2026-10-05 | **Spec**: spec.md

## Summary

Réorganisation React locale, calculs purs existants inchangés. App conserve scénario/tax/EI et panneaux montés mais hidden ; Projection incluse dans le code initial (première ouverture hors ligne), montée au premier accès Exploration puis conservée. Onglets aria tab/tabpanel roving tabindex. Synthèse ComparaisonOverview dérivée réutilise calculateEiIncome et calculateAfterTaxComparison, affiche cash micro totalValue (après frais), cash salarié netIncome hors avantages, EI availableBeforeIncomeTax. Détails existants réutilisés et retraite rendue section indépendante repliée.

## Technical Context

Node24, React/TypeScript/Vite, aucun nouveau paquet, deux workers et portes séquentielles. Bibliothèque/rapport DecisionTools mode=exploration|scenarios (default all pour usages directs existants), instances montées stables dans leurs vues pour préserver états. Outils pas étendus à EI ou IR. Contrôles projection dans Exploration ; option retraite en hypothèses avancées.

## Constitution Check

I : sources/limites maintenues. II : aucune formule modifiée. III : entrées au départ, résultats ensuite, priorité montants et détails repliés. IV : statique/offline/schema1 inchangé. V : TDD et portes complètes, captures/clavier/tactile/axe. Aucune exception.

## Structure

src/App.tsx, src/components/ComparisonOverview.tsx, src/components/DecisionTools.tsx, src/components/Results.tsx, src/styles.css ; AppView dans src/domain/model.ts limité à enum UI. tests/unit/navigation.test.tsx, tests/e2e/navigation.spec.ts, adaptations des tests de parcours existants. Pas de modification métier.

## Strategy

Tracer vertical onglets/aller-retour → regroupement d’outils → synthèse/détails/retraite → accessibilité/erreurs → migration assertions de parcours → revue/analyse/convergence et portes finales. Publication autorisée par « Continue (et pousse sur main quand fini) » : commit focalisé, PR vers main, CI verte, fusion puis vérification Pages/production.
