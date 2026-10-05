# Feature Specification: Navigation guidée puis libre

**Feature Branch**: `feat/009-navigation`
**Created**: 2026-10-05
**Status**: Implémentée et validée localement, non publiée
**Input**: « Ok go ta reco alors » : onglets Hypothèses · Résultats · Exploration · Scénarios, parcours initial guidé puis libre.

## Clarifications

Quatre vues dans l’application statique, pas de serveur ni pages réseau. Hypothèses initiale ; action Voir la comparaison ouvre Résultats. Onglets librement accessibles ensuite et avant : exemples déjà renseignés, aucune étape bloquante artificielle. Navigation ne réinitialise jamais saisies, fiscalité, exonération EI, hypothèses d’exploration, sélection d’offres ou bibliothèque. Réinitialisation/chargement explicites conservent leurs règles existantes, chargement mène aux hypothèses. Calculs, exports et schéma inchangés ; publication sur main autorisée par « Continue (et pousse sur main quand fini) ». Résultats invalides bloqués honnêtement sans afficher l’exemple à leur place. Pas de panneau latéral ni partage financier par URL.

## User Scenarios & Testing

### User Story 1 — Saisir puis comparer (Priority: P1)

1. Arriver sur Hypothèses, avec entrées et aucun résultat/outillage visible.
2. Voir la comparaison ouvre Résultats ; Modifier les hypothèses revient aux saisies sans perte.
3. Les trois statuts sont rapprochés en synthèse, distinguant cash avant IR, après IR si activé et avantages hors cash. Limites/inconnues visibles près des montants, sans recommandation arbitraire.
   **Independent Test**: changer TJM et foyer, ouvrir résultats puis revenir : valeurs et paramètres inchangés.

### User Story 2 — Approfondir sans tout mélanger (Priority: P1)

1. Exploration rassemble TJM d’équilibre, aléas, robustesse, décomposition, carte et projection, avec leurs périmètres avant IR/micro-salariat.
2. Scénarios regroupe bibliothèque, comparaison d’offres, import/export et rapport.
3. Détails sociaux/fiscaux et sources repliables dans Résultats ; retraite distincte du cash et repliable.
   **Independent Test**: changer une hypothèse d’aléas, sélectionner une offre et changer d’onglet : retrouver les états.

### User Story 3 — Navigation accessible et locale (Priority: P2)

1. Onglets utilisables clavier/flèches/Home/End et tactile, focus visible, panneau actif correctement nommé ; panneaux inactifs non atteignables.
2. Mobile : quatre destinations lisibles, sans débordement horizontal, calcul hors ligne après chargement.
   **Independent Test**: naviguer au clavier et tactile aux trois largeurs, axe sans violation.

### Edge Cases

Entrées invalides/sous-centime, CFE inconnue, zéro CA/déficit, hauts revenus, erreur stockage, anciennes offres, bibliothèque pleine, période mensuelle, onglet Exploration avant toute comparaison, sauvegarde fiscale hors schema1, fermeture rapport/restauration focus.

## Requirements

- **FR-001**: quatre onglets et seule vue Hypothèses visible au départ ; navigation guidée puis libre.
- **FR-002**: conserver tous les états lors des changements de vue ; chargement/reset explicites seulement modifient leurs états prévus.
- **FR-003**: synthèse trois statuts cash après frais/mutuelle avant IR, cash après IR optionnel, avantages distincts ; montants issus des moteurs existants, limitations visibles.
- **FR-004**: résumé des hypothèses et action de retour dans Résultats ; détails calculs/sources et retraite repliables.
- **FR-005**: Exploration rassemble les outils existants et projection, Scénarios bibliothèque/offres/rapport ; pas de double emploi visible ni extension implicite de périmètre.
- **FR-006**: préserver valeurs/snapshots/imports/exports et blocages, pas de valeurs d’exemple substituées à une erreur courante.
- **FR-007**: clavier, focus, tactile, panneaux inactifs cachés et aucune perte hors ligne ; 360/768/1280 sans débordement.
- **FR-008**: aucune nouvelle dépendance, moteur réglementaire ou backend ; tests existants adaptés aux parcours sans affaiblir les assertions métier.

## Key Entities

Vue active ; scénario courant ; hypothèses fiscales éphémères ; états d’exploration ; bibliothèque/sélection ; synthèse dérivée en lecture seule.

## Success Criteria

- **SC-001**: même scénario donne les mêmes chiffres avant/après réorganisation.
- **SC-002**: aller-retour entre toutes les vues conserve les états ; aucune donnée fiscale ajoutée aux offres.
- **SC-003**: chaque fonction existante reste atteignable dans sa destination ; tous tests/browser/build verts.
- **SC-004**: seules entrées au départ ; synthèse trois alternatives lisible puis détails facultatifs, clavier/offline/axe et trois largeurs vérifiés.

## Assumptions

Une session locale en mémoire, pas de restauration automatique du scénario après rechargement. Référence IR 2026 sur revenus2025 conservée, projection revenus2026 ; outils avancés et rapports restent avant IR et micro/salariat. Pas d’ajout trésorerie ou nouvel impôt dans cette refonte.
