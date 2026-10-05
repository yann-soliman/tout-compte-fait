# Feature Specification: EI au réel BNC 2026

**Feature Branch**: `feat/007-ei-real`

**Created**: 2026-10-04

**Status**: Implémentée et vérifiée localement, non publiée

**Input**: « Gogogogo » — comparer salariat, micro et EI au réel, priorité EI puis après impôt puis trésorerie. Cet incrément traite uniquement EI à IR avant impôt personnel.

## Clarifications

### Session 2026-10-04

Aucune question supplémentaire : la mission fixe les décisions importantes. Périmètre fonctionnel, données, interactions, qualité, confidentialité, cas limites et exclusions sont clairs ; le choix du calcul relève de la recherche.

- Année EI pleine 2026, activité BNC libérale non réglementée hors Cipav, hors ACRE et situations particulières ; ne pas réutiliser la date de création micro.
- Frais professionnels et chiffre d’affaires communs à micro et EI. Mutuelle personnelle non Madelin retirée du disponible mais jamais de l’assiette sociale.
- CFE EI distinctement confirmée : un montant commun positif est utilisable ; l’exonération micro ne confirme pas celle de l’EI.
- Rapports/offres : intégration souhaitable mais optionnelle. Leur périmètre à deux statuts reste explicite si non intégré.
- Pas de panel humain, Copilot, sous-agent ou nouvel impôt. La publication était exclue de l’implémentation initiale ; Yann autorise ensuite explicitement commit, PR, CI, merge et vérification en production via le choix « Publier l’EI ».

## User Scenarios & Testing

### User Story 1 - Comparer le disponible annuel (Priority: P1)

Comparer les trois activités avec les mêmes revenus et frais professionnels, y compris au-delà du plafond micro.

**Why this priority**: proposer une alternative soutenable au micro sans inventer un taux global.

**Independent Test**: CA 100 000 €, frais professionnels 2 400 € et CFE 600 € donnent 30 141 € de cotisations, 66 859 € avant mutuelle, 66 559 € disponibles avec mutuelle de 300 €/an.

**Acceptance Scenarios**:

1. Avec les défauts publiés (500 €/j, 200 j, salaire 50 000 €), afficher EI, micro et salariat ; comparer le disponible après frais au cash salarié, non aux avantages.
2. Avec CA nul et frais 3 000 €, montrer 1 255 € de cotisations minimales et un résultat négatif ; ne pas ramener le revenu à zéro.
3. Au-delà du plafond micro, garder EI calculable et maintenir l’avertissement d’éligibilité micro.

### User Story 2 - Comprendre les hypothèses et incertitudes (Priority: P1)

Consulter l’assiette sociale, les postes distincts, les sources et la différence entre argent disponible et avantages.

**Independent Test**: retirer la CFE bloque uniquement EI ; confirmer une exonération EI permet le calcul sans transformer une exonération micro en exonération EI.

**Acceptance Scenarios**:

1. CFE inconnue : afficher une explication, pas un zéro ni un écart chiffré trompeur.
2. Modifier la date micro ne prorate pas EI ; expliciter l’année pleine, hors ACRE, sans Madelin.
3. Consulter les références : année 2026, date d’effet 2026-01-01, vérification 2026-10-04 et arrondis estimatifs à l’euro visibles.

### User Story 3 - Utiliser hors ligne et conserver les offres (Priority: P2)

Changer la période annuelle/mensuelle, utiliser au clavier et conserver les anciennes offres sans migration.

**Independent Test**: utiliser les résultats à 360, 768 et 1280 px hors ligne après chargement ; recharger les anciens scénarios schema 1.

**Acceptance Scenarios**:

1. La période mensuelle est une division d’un résultat annuel, non un échéancier.
2. Carte TJM, seuils, retraite, projection, offres et rapport non étendus indiquent leur périmètre micro/salariat.
3. Stockage atomique, exports CSV sûrs, anciens snapshots et valeurs initiales inchangés.

### Edge Cases

CA zéro, déficit, frais supérieurs au CA, minima, abattement 26 % encadré (minimum/maximum), frontières de progressivité et plafonds sociaux, centimes et grands montants sûrs, CFE inconnue/zéro/exonérée, calculs successifs sans contamination.

## Requirements

### Functional Requirements

- **FR-001**: calculer EI au réel BNC non réglementé 2026 à IR sur une année pleine, hors situations particulières, indépendamment du plafond micro.
- **FR-002**: déduire les frais réels professionnels et CFE connue ; appliquer l’assiette réformée, ses bornes, progressivité et minima ; détailler chaque poste social sourcé.
- **FR-003**: conserver des réconciliations exactes en centimes et les résultats négatifs ; signaler les arrondis sociaux à l’euro comme estimations, pas une précision normative au centime.
- **FR-004**: retirer la mutuelle personnelle après calcul social, sans la traiter comme Madelin ; comparer EI aux mêmes métriques cash après frais micro et salaire net sans avantages.
- **FR-005**: bloquer EI si CFE inconnue, avec confirmation d’exonération EI indépendante de celle micro.
- **FR-006**: afficher EI après les entrées, annuel/mensuel, hypothèses, sources datées et limites des outils à deux statuts.
- **FR-007**: fonctionner localement sans réseau de calcul et préserver les offres schema 1, le stockage atomique, les CSV sûrs et les snapshots anciens.
- **FR-008**: couvrir les cas normaux/frontières/déficit/minima/centimes/CFE/états indépendants par tests avant implémentation, puis les parcours accessibles hors ligne aux trois largeurs.

### Key Entities

- Hypothèse EI : CA et frais communs, mutuelle personnelle, montant CFE commun, confirmation d’exonération EI propre au calcul courant.
- Résultat EI : calculé estimatif ou bloqué ; assiette, dépenses déductibles, postes sociaux, net avant mutuelle et disponible avant IR, sources.
- Comparaison cash : disponible EI, disponible micro après frais et salaire net ; avantages séparés.

## Success Criteria

### Measurable Outcomes

- **SC-001**: reproduire les cas officiels vérifiés et toutes les fixtures documentées, avec réconciliation exacte des postes.
- **SC-002**: zéro résultat EI présenté comme fiable lorsque la CFE est inconnue ; aucune déduction sociale implicite de mutuelle.
- **SC-003**: parcourir les trois alternatives sans débordement ni violation d’accessibilité détectée à 360/768/1280 px, hors ligne après chargement.
- **SC-004**: réussir les portes complètes de qualité et les tests de compatibilité existants sans modifier leurs snapshots.

## Assumptions

France métropolitaine, année pleine, pas de conjoint collaborateur, invalidité, RSA, activité saisonnière, revenus étrangers/remplacement, Madelin ou taux RCI spécifique. La confirmation CFE EI du calcul courant n’est pas enregistrée dans les anciennes offres. Pas d’IR du foyer, IS, SASU, trésorerie ni nouveaux droits retraite EI. Le calcul constitue une estimation générale, non un décompte opposable.
