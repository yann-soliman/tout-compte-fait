# Feature Specification: Cycle micro et projection recalculée

**Feature Branch**: `010-micro-cycle`
**Created**: 2026-10-05
**Status**: Implemented and locally verified — user « Fais le »

## User Scenarios & Testing

### US1 — Comparer un revenu micro soutenable (P1)

Pour un CA saisi supérieur au plafond, comparer une moyenne sur deux années : CA saisi puis min(CA saisi, plafond annuel plein). Cotisations, frais et IR éventuel sont calculés indépendamment pour chaque année avant la moyenne. Ne pas présenter cette moyenne comme une assiette fiscale annuelle.
Given 500 €/j × 200 j, When Résultats, Then CA 100 000 / 83 600 et disponible 70 900 / 58 731,20, moyenne 64 815,60 €/an avant IR ; salarié et EI inchangés.

### US2 — Projeter une suite d’années réelle (P1)

Croissance appliquée au CA potentiel et au salaire brut/avantages, cotisations recalculées chaque année, frais/mutuelle/CFE constants. Plafonner chaque second dépassement consécutif ; une année sous le plafond réinitialise la séquence. Sommer les années réalisées, pas multiplier une moyenne (durées impaires).

### US3 — Comprendre le statut de la projection (P2)

Remplacer Démonstration par Estimation à règles constantes, fournir CA/disponible annuel et cumulé accessibles hors graphique. Expliquer règles 2026 figées, plafond micro ≠ TVA et historique non connu.

## Clarifications

Aucune question bloquante : l’alternance est expressément demandée. Hypothèses opérationnelles explicites : période 1 au CA saisi, coût/effort constants ; ne pas augmenter un CA inférieur au plafond pour atteindre artificiellement le maximum. Année de création : plafond applicable proratisé en année 1, annuel plein ensuite. Ni confirmation rétroactive d’éligibilité, ni nouveaux seuils TVA, ni calendrier d’encaissements, ni nouveau mode persistant. Projection reste avant IR et limitée micro/salariat ; IR optionnel du comparatif de base lissé après calcul annuel séparé.

## Requirements

- FR-001 : moteur annuel exact conservé, cycle et moyenne dérivés sans changer les entrées/schéma 1.
- FR-002 : moyenne centrale cohérente dans synthèse, détails, graphiques décisionnels, équilibre, stress, offres et rapport ; champs annuels/retraite explicitement distincts.
- FR-003 : IR annuel sur chacune des deux recettes, moyenne ensuite, ne pas imposer le CA moyen.
- FR-004 : projection recalculée, franchissement à +1 centime, égalité ne constitue pas dépassement, croissance négative/−100 %, durée impaire, somme sûre.
- FR-005 : origine de l’hypothèse et limite TVA/historique lisibles ; détail des deux années accessible et chiffres au centime.
- FR-006 : clavier, mobile/tablette/desktop, offline, validation des saisies et sauvegardes conservés.

## Success Criteria

Tests RED→GREEN ciblés, oracle arithmétique indépendant du cycle et impôt annuel, suite entière unit/E2E deux workers, format/lint/types/build, revue indépendante et vérification visuelle. Aucune dépendance ajoutée. Publication seulement si instruction explicite applicable.
