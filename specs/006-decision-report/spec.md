# Feature Specification: Robustesse, offres et rapport

**Feature Branch**: `feat/006-decision-report`
**Created**: 2026-10-04
**Status**: Implemented and verified
**Input**: « Ouais ok go faire ça »; exemples TJM 500 €, 200 jours, salaire brut annuel 50 000 €.

## User Scenarios & Testing

### User Story 1 — Lire la robustesse (Priority: P1)

Afficher le seuil de valeur économique annuelle micro égale ou supérieure au salariat pour chacun des trois facteurs séparément.
**Why this priority**: Distinguer marge disponible, effort nécessaire et impossibilité.
**Independent Test**: Recalculer chaque seuil avec le moteur et vérifier le jour/centime précédent.
**Acceptance Scenarios**:

1. **Given** une micro devant le salariat, **When** les résultats sont affichés, **Then** indiquer jours perdables, baisse de TJM possible et frais professionnels supplémentaires absorbables.
2. **Given** une micro derrière, **When** les résultats sont affichés, **Then** indiquer jours/TJM supplémentaires ou réduction de frais nécessaire, sans fausse marge.
3. **Given** zéro jour, CFE inconnue ou seuil impossible, **When** la robustesse est affichée, **Then** annoncer indisponibilité/impossibilité, jamais une fausse valeur zéro.
4. **Given** scénario/seuil hors plafond, **When** les seuils sont affichés, **Then** qualifier les résultats de théoriques et ne pas recommander de les appliquer.

### User Story 2 — Comparer les offres (Priority: P2)

Comparer le scénario courant et les instantanés cochés avec barres monétaires signées et montants annuels accessibles.
**Why this priority**: Comparer plusieurs missions/emplois d'un coup.
**Independent Test**: Vérifier que les barres représentent exactement chaque scénario sélectionné, sans charger celui-ci.
**Acceptance Scenarios**:

1. **Given** des offres cochées, **When** la bibliothèque est ouverte, **Then** montrer revenu net, valeur économique et jours pour micro et salariat sur une même échelle.
2. **Given** déficit, même nom ou avertissement, **When** les offres sont comparées, **Then** conserver identités distinctes, valeurs négatives et alertes propres à chaque offre.

### User Story 3 — Conserver un rapport (Priority: P3)

Prévisualiser puis imprimer un rapport autonome du scénario courant et des offres cochées, compatible avec Enregistrer en PDF du navigateur.
**Why this priority**: Conserver les hypothèses avec la décision, pas une capture isolée.
**Independent Test**: Générer un PDF réel et vérifier hypothèses, résultats, seuils, limites et sources datées.
**Acceptance Scenarios**:

1. **Given** le scénario courant valide, **When** ouvrir le rapport, **Then** montrer résultats annuels exacts, hypothèses, robustesse, avertissements et références.
2. **Given** des offres cochées, **When** imprimer, **Then** inclure uniquement celles-ci avec leurs hypothèses et alertes, sans les commandes de l'application.
3. **Given** changement des entrées ou sélection, **When** consulter le rapport, **Then** utiliser les données courantes, sans snapshot obsolète ni écriture de bibliothèque.

### Edge Cases

Égalité, zéro salaire/TJM/jour, frais nuls, CFE absente ou exonération confirmée, plafond proratisé, valeurs sûres extrêmes, 20 offres, noms identiques et texte ressemblant à HTML, PDF multi-pages, mouvement réduit, navigation clavier et hors réseau.

## Requirements

### Functional Requirements

- **FR-001**: Réutiliser le moteur réglementaire 2026; calculs annuels avant impôt et hors retraite, centimes entiers, facteurs modifiés séparément et autres hypothèses constantes.
- **FR-002**: Seuils jours entiers 0..366 et TJM au centime, vérifier minimalité; frais supplémentaires/réduction bornés sans frais négatifs.
- **FR-003**: Propager CFE inconnue, plafonds et absence d'historique; distinguer marge, effort, impossible et indisponible.
- **FR-004**: Comparer courant + instantanés sélectionnés avec échelle commune signée, texte équivalent aux couleurs, jours et avertissements par offre; pas de modification des instantanés.
- **FR-005**: Rapport imprimable local avec données annuelles, toutes hypothèses financières/de temps, règles et sources datées, robustesse, sélection et limites; prévisualisation et fermeture accessibles.
- **FR-006**: Impression dédiée sans formulaires/commandes, lisible multi-pages, PDF par dialogue natif; pas d'envoi ni dépendance nouvelle.
- **FR-007**: Exemple initial et reset: TJM 500 €, 200 jours, salaire brut 50 000 €; préserver les instantanés antérieurs/imports. Signaler normalement tout dépassement du plafond, y compris dans l'exemple.
- **FR-008**: Offline, clavier, axe, 360/768/1280px, sans overflow ni résultats obsolètes; préserver contrôles existants.

### Key Entities

Seuil par facteur; résultat de robustesse; offre calculée avec identité stable; rapport annuel dérivé du scénario courant et de la sélection.

## Success Criteria

- **SC-001**: Seuils testés égaux au moteur avec preuve de minimalité et gardes négatives.
- **SC-002**: Comparaison et PDF contiennent uniquement les offres sélectionnées avec hypothèses/alertes exactes.
- **SC-003**: Toutes portes qualité, parcours réels clavier/tactile/offline et PDF réel passent.
- **SC-004**: Exemples/reset vérifiés; sauvegardes anciennes inchangées; captures mobile/desktop inspectées.

## Assumptions / Clarification review

Périmètre: les trois suites proposées sont acceptées. Salaire = brut annuel du champ existant. Robustesse = valeur économique et non revenu net. Frais = frais professionnels annuels seuls, mutuelle/CFE constantes. Égale ou supérieure signifie équilibre atteint; jour/centime précédent doit être inférieur. Hors plafond: afficher comme théorique, pas bloquer toute lecture. Rapport = impression navigateur avec option Enregistrer en PDF, pas téléchargement PDF embarqué. Données dérivées en direct et aucune nouvelle persistance. Aucune ambiguïté critique à clarifier; aucun panel humain requis.
