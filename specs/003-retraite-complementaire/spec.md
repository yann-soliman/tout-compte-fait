# Feature Specification: Finaliser la retraite complémentaire 2026

**Feature Branch**: `feat/003-retraite-complementaire`
**Created**: 2026-10-04
**Status**: Ready for planning
**Input**: « Gogogo finir » les retraites complémentaires manquantes avec les données officielles récupérées, en utilisant Spec Kit.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Comparer les points salarié (Priority: P1)

Comparer les points Agirc-Arrco estimés pour le salaire annuel et leur équivalent annuel brut aux valeurs de référence.

**Why this priority**: Remplacer un résultat bloqué sans inventer une pension complète.
**Independent Test**: Reproduire l'exemple officiel de 75 500 € : 378,67 points affichés.
**Acceptance Scenarios**:

1. **Given** 75 500 € bruts, **When** les droits sont activés, **Then** afficher 378,67 points et une pension annuelle indicative calculée avant arrondi des points.
2. **Given** des salaires autour de 1 et 8 PASS, **When** le salaire varie d'un centime, **Then** appliquer les bonnes tranches sans chevauchement ni points au-delà de 8 PASS.
3. **Given** un paramètre absent ou provisoire, **When** les droits sont calculés, **Then** bloquer seulement le résultat complémentaire concerné, jamais afficher un faux zéro.

### User Story 2 - Comparer les points micro hors Cipav (Priority: P1)

Comparer les points RCI estimés du libéral BNC non réglementé relevant de l'Assurance retraite.

**Why this priority**: Compléter l'autre côté de la comparaison avec l'affiliation réellement documentée.
**Independent Test**: Reproduire la formule annuelle CA × 25,6 % × 21 % / 21,726 €.
**Acceptance Scenarios**:

1. **Given** 40 000 € de CA, **When** les droits sont activés, **Then** afficher les points RCI estimés avec la part BNC de 21 %, jamais la part BIC de 19,75 %.
2. **Given** zéro CA, **When** les paramètres sont vérifiés, **Then** afficher zéro point et zéro pension indicative.
3. **Given** une affiliation Cipav, **When** le calcul est demandé, **Then** refuser ce régime hors périmètre.

### User Story 3 - Lire une comparaison transparente (Priority: P2)

Lire côte à côte les deux régimes, leurs estimations et les références datées, sur mobile et ordinateur.

**Why this priority**: Éviter de confondre revenu disponible, droits annuels et pension future.
**Independent Test**: Activer puis désactiver les droits et vérifier l'invariance des revenus et projections économiques.
**Acceptance Scenarios**:

1. **Given** les droits activés, **When** les résultats sont affichés, **Then** identifier Agirc-Arrco et RCI, le caractère estimatif, la convention annuelle, les sources et les valeurs de service datées.
2. **Given** un changement annuel/mensuel, **When** l'affichage bascule, **Then** les droits annuels restent annuels et ne changent pas les revenus.
3. **Given** une page sans réseau après chargement, **When** les entrées changent, **Then** les calculs restent utilisables sans requête réglementaire.

### Edge Cases

Zéro revenu; un centime avant/à/après les seuils; valeur d'achat nulle, absente ou provisoire; service inconnu; cadres/non-cadres; temps partiel avec salaire déjà adapté; CA au plafond micro; droits désactivés; très grand CA dépassant la plage sûre; source complémentaire manquante.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Calculer les points Agirc-Arrco annuels à 6,20 % jusqu'à 48 060 € et 17 % de 48 060 à 384 480 €, divisés par 20,1877 €; exclure CEG, CET et Apec de l'acquisition.
- **FR-002**: Calculer les points RCI annuels du BNC hors Cipav à CA × 25,6 % × 21 % / 21,726 €; rejeter les autres affiliations.
- **FR-003**: Valoriser les points non arrondis à 1,4386 € pour Agirc-Arrco (référence depuis le 1er novembre 2025) et 1,347 € pour RCI (1er janvier 2026); ces valeurs ne préjugent pas de la liquidation future.
- **FR-004**: Afficher les points à deux décimales et l'indication annuelle en centimes, au plus proche avec demi supérieur; cette convention d'affichage ne doit pas être qualifiée d'arrondi statutaire.
- **FR-005**: Présenter les deux résultats complémentaires comme estimatifs : modèle annuel, cotisations supposées réglées, sans reproduction des déclarations périodiques, régularisations, arrondis de caisse ou plafond proratisé personnel. Ne pas fabriquer un entier RCI statutaire à partir de publications contradictoires.
- **FR-006**: Bloquer le régime complémentaire concerné si une règle requise est absente, provisoire, non positive pour le prix, ou dépourvue de provenance. Préserver les revenus et les droits de base indépendants.
- **FR-007**: Rendre accessibles les sources officielles avec organisme, titre, date d'application et date de vérification; garder les détails facultatifs et les chiffres après les entrées.
- **FR-008**: Garder les points de retraite de base et sa pension monétaire indisponibles : trimestres et revenu cotisé seulement. Ne jamais ajouter une retraite aux revenus, avantages ou projections économiques.
- **FR-009**: Conserver l'année 2026, les entrées et le périmètre existants. Réconcilier les anciens statuts de recherche et tâches de retraite avec cette livraison; laisser le test réel à dix utilisateurs T050 non réalisé.
- **FR-010**: Vérifier les règles, bornes, arrondis et cas négatifs avec des tests avant implémentation, puis vérifier l'expérience aux largeurs 360, 768 et 1280 px sans débordement horizontal.

### Key Entities

- **Paramètre complémentaire** : régime, taux et tranches, prix d'achat et service avec précision sous-centime, source et statut.
- **Droits complémentaires annuels** : points estimés, équivalent de pension annuelle brut, confiance, limitations et références.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: L'exemple Agirc-Arrco officiel affiche 378,67 points; toutes les bornes et arrondis documentés concordent avec les références exactes, à 0,01 point et 0,01 € d'affichage près.
- **SC-002**: Chaque résultat complémentaire numérique indique son régime et son caractère estimatif, et donne accès à ses sources datées.
- **SC-003**: Dans tous les scénarios de paramètres non vérifiés, le résultat concerné est indisponible plutôt qu'un faux zéro; les calculs indépendants sont inchangés.
- **SC-004**: Les droits sont lisibles et utilisables au clavier aux trois largeurs cibles, sans modifier les revenus ou les projections.

## Assumptions

- Finalisation du simulateur annuel existant, pas extension à la saisie des déclarations ou à la carrière complète.
- Cotisations micro supposées intégralement réglées, hors réduction Acre déjà exclue du périmètre.
- Paramètres officiels connus, droits annuels estimatifs. La contradiction d'arrondi RCI empêche une garantie de droits attribués par la caisse, pas une simulation annuelle explicitement qualifiée.
- Les tests avec dix personnes ne peuvent pas être remplacés par des tests automatisés.

## Clarification review — 2026-10-04

Aucune question utilisateur nécessaire : les hypothèses annuelles et l'affichage estimatif prolongent le simulateur existant. Les ambiguïtés réglementaires ont une réponse sûre explicite (FR-004–006), pas une règle inventée. Périmètre, données, états d'erreur, accessibilité, fonctionnement sans réseau et critères d'acceptation sont définis.
