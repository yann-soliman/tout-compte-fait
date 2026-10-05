# Feature Specification: Disponible après impôt

**Feature Branch**: `feat/008-income-tax`
**Created**: 2026-10-05
**Status**: Implémentée et vérifiée localement, non publiée
**Input**: « Gogo la suite » — revenu disponible après impôt des trois statuts.

## Clarifications

Décisions raisonnables explicites : simulation des revenus 2026 au barème de référence 2026 sur revenus 2025, sans présenter le futur barème 2027 comme adopté. Option locale désactivée par défaut ; foyer simple célibataire ou couple marié/pacsé, enfants à charge exclusive, hors parent isolé et situations particulières. Autres revenus déjà nets imposables au barème, sans nouveau calcul de leur cash. Attribuer à l'activité seulement l'impôt supplémentaire par rapport au même foyer sans cette activité. Pas de double soustraction du PAS. Saisies fiscales locales non sauvegardées dans schema 1 ; réinitialiser à chaque chargement/reset. Publication distincte de l'accord initial d'implémentation ; Yann a ensuite autorisé explicitement commit, PR, CI, fusion et contrôle de production par « Go publier ».

## User Scenarios & Testing

### User Story 1 — Comparer le cash après IR (Priority: P1)

Consulter pour chaque statut base fiscale, IR total du foyer, IR supplémentaire lié à l'activité et disponible après IR. Distinguer revenu fiscal, cash et avantages.
**Independent Test**: revenu imposable de 30 000 €, célibataire sans enfant ni autre revenu : impôt 2 104 € au barème de référence.
**Acceptance Scenarios**:

1. Activer l'option, afficher les trois alternatives sans modifier les résultats avant IR.
2. Pour le salaire, réintégrer la CSG/CRDS non déductible puis appliquer la déduction forfaitaire ; permettre de saisir le net imposable annuel de paie avant cette déduction.
3. Pour micro, appliquer l'abattement BNC, pas les frais réels ; pour EI, réintégrer le poste CSG/CRDS non déductible, mutuelle personnelle exclue de la déduction fiscale.

### User Story 2 — Tenir compte du foyer (Priority: P1)

Choisir célibataire ou couple, enfants à charge exclusive et autres revenus déjà nets imposables ; observer progressivité, plafond des parts et décote.
**Independent Test**: couple, net imposable 50 000 €, aucun enfant : IR 2 799 € ; célibataire 50 000 €, un enfant hors parent isolé : IR 6 297 €.
**Acceptance Scenarios**:

1. Recalculer l'impôt total et la référence sans activité, sans attribuer tout l'impôt du conjoint à l'activité.
2. Éviter un faux disponible quand CFE inconnue, EI déficitaire, plage sûre dépassée ou hauts revenus nécessitent d'autres contributions.
3. Afficher clairement les exclusions et la projection à barème constant.

### User Story 3 — Utiliser sans réseau et préserver les offres (Priority: P2)

Entrées fiscales avant résultats, affichage annuel/mensuel, clavier et mobile, aucune donnée transmise.
**Independent Test**: changer foyer hors ligne après chargement et charger une offre ancienne ; option et saisies fiscales réinitialisées.
**Acceptance Scenarios**:

1. Aucun calcul distant, aucune migration ou nouvelle donnée dans les offres.
2. Offres, rapports, seuils, carte et projection restent explicitement avant IR.

### Edge Cases

Zéro revenu, abattement minimum limité aux recettes/salaire, maxima, frontières de tranches et décote, plafond quotient, centimes et arrondis euros, impôt sous seuil de recouvrement, déficits EI, CFE inconnue, micro hors plafond, autres revenus élevés, incohérence saisie/arrondis.

## Requirements

- **FR-001**: garder option désactivée par défaut, présenter projection de revenus 2026 au barème 2026/revenus 2025, sources datées et exclusions visibles.
- **FR-002**: calculer bases fiscales distinctes : salaire avant déduction 10 %, micro BNC 34 % minimum, EI sans déduction de mutuelle et avec réintégration CSG non déductible.
- **FR-003**: calculer IR progressif, parts standard, plafonnement, décote, arrondis et seuil de recouvrement pour foyer simple.
- **FR-004**: afficher cash après seul IR supplémentaire, impôt total et référence sans activité ; jamais PAS ni avantages inclus dans cash.
- **FR-005**: bloquer les résultats hors périmètre ou inconnus localement sans affecter le comparateur avant IR ; conserver les warnings micro.
- **FR-006**: fonctionnement offline, accessible annuel/mensuel à 360/768/1280 ; inputs avant résultats.
- **FR-007**: garder schema 1 intact, réinitialiser option/saisies au chargement/reset ; expliciter outils et exports non étendus.
- **FR-008**: tester frontières, cas DGFiP, réconciliation, interactions et suites complètes, sans prétendre une exactitude normative future.

### Key Entities

Foyer simple : statut, enfants, autres revenus nets imposables. Hypothèses fiscales : activation et net salarial imposable optionnel. Alternative après IR : base, cash avant, impôt foyer/référence/incrément, cash après ou blocage.

## Success Criteria

- **SC-001**: reproduire les exemples et fixtures DGFiP dans le périmètre et réconcilier cash avant = cash après + IR supplémentaire.
- **SC-002**: jamais afficher un IR définitif 2026/2027 ni un cash certain pour CFE inconnue ou déficit EI non traité.
- **SC-003**: parcours clavier/offline sans débordement ni violations axe aux trois largeurs.
- **SC-004**: suites unitaires/navigateur existantes et build verts, anciennes offres inchangées.

## Assumptions

Résident métropolitain, pas de parent isolé/veuvage/invalidité/garde alternée, enfant majeur rattaché marié, revenus exceptionnels/étrangers, PFU, déficits reportés, réductions/crédits, PER, versement libératoire, CEHR/CDHR ni avantages imposables non saisis. Couple signifie imposition commune ; célibataire avec enfant n'inclut pas case T. Autres revenus saisis après déductions catégorielles. Bases fiscales dérivées indicatives, net salarial réel saisissable. EI comptabilité annuelle simplifiée, pas de décalage paiement des cotisations.
