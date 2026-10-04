# Feature Specification: Visuels de résultats

**Feature Branch**: `feat/005-result-visuals`
**Created**: 2026-10-04
**Status**: Implemented — verification recorded in verification.md
**Input**: « Ouais gogogo pour les beaux visuels » — décomposition de l’argent et carte TJM × jours.

## User Scenarios & Testing

### User Story 1 — Comprendre où va l’argent (Priority: P1)

Comparer le passage du brut à la valeur économique sur une échelle monétaire commune, après les entrées et avant les détails numériques.
**Why this priority**: Expliquer la différence, pas seulement afficher un total.
**Independent Test**: Réconcilier départ, prélèvements, frais/avantages et arrivée avec les résultats existants.
**Acceptance Scenarios**:

1. **Given** deux scénarios valides, **When** les résultats sont affichés, **Then** les cascades montrent les montants bruts, cotisations, frais micro ou avantages salariés et valeur économique sur une même échelle.
2. **Given** une valeur économique négative ou nulle, **When** elle est représentée, **Then** le zéro et le déficit sont visibles, sans troncature ni pourcentage trompeur.
3. **Given** la période mensuelle, **When** elle est sélectionnée, **Then** seuls les libellés monétaires sont mensualisés; la décomposition reste proportionnellement cohérente.

### User Story 2 — Explorer les combinaisons de travail (Priority: P2)

Lire une carte annuelle du TJM et des jours facturés, montrant l’écart de valeur économique au salariat, le scénario courant, l’équilibre et le plafond micro.
**Why this priority**: Rendre les alternatives et leurs limites immédiatement compréhensibles.
**Independent Test**: Chaque cellule sélectionnée correspond au calcul exact du même scénario; toute application est explicite et vérifiée.
**Acceptance Scenarios**:

1. **Given** des valeurs valides, **When** la carte est affichée, **Then** ses axes sont nommés, une légende explique les couleurs et les zones hors plafond sont hachurées.
2. **Given** une sélection par toucher ou commandes clavier, **When** elle change, **Then** le montant annuel exact et le statut sous/hors plafond sont lisibles.
3. **Given** une hypothèse sous plafond avec jours positifs et CFE connue, **When** son application est demandée, **Then** le TJM et les jours sont mis à jour ensemble, sans modifier les autres champs.
4. **Given** zéro jour, CFE inconnue ou une cellule hors plafond, **When** elle est sélectionnée, **Then** aucune application n’est proposée comme éligible; l’absence d’historique reste explicitement signalée.

### Edge Cases

Montants nuls/négatifs, déficit supérieur au brut, avantages supérieurs au salaire, activité en fin d’année, TJM élevé, zéro jour, CFE inconnue, scénario invalide, doublons d’identifiants graphiques, navigateur sans animations et couleurs non discernables.

## Requirements

### Functional Requirements

- **FR-001**: Réutiliser les résultats annuels existants; ne pas modifier les règles statutaires et exclure toute retraite des valeurs économiques.
- **FR-002**: Montrer deux décompositions monétaires à échelle commune, libellés exacts accessibles, origine zéro et déficits visibles.
- **FR-003**: Distinguer frais micro, avantages salariés et prélèvements, sans présenter le brut salarié comme coût employeur.
- **FR-004**: La carte présente TJM, jours et écarts annuels de valeur économique, un repère courant et une ligne d’équilibre annoncée comme indicative entre points calculés.
- **FR-005**: Les zones hors plafond proratisé sont hachurées et qualifiées; sous plafond ne signifie jamais éligibilité confirmée sans historique.
- **FR-006**: Chaque hypothèse choisie est recalculée exactement; elle n’est appliquée qu’après action explicite, pour jours positifs, CFE connue et plafond respecté.
- **FR-007**: Offrir des commandes clavier/tactiles avec texte équivalent aux couleurs et au survol; conserver les montants et détails numériques existants.
- **FR-008**: Fonctionner hors réseau, sans nouvelles dépendances, à 360/768/1280 px, avec mouvement réduit respecté et sans débordement horizontal.
- **FR-009**: Un résultat indisponible produit un message explicite, pas une fausse valeur zéro ni un graphique incohérent.

### Key Entities

Décomposition monétaire; domaine commun signé; cellule d’hypothèse; points d’équilibre/plafond; hypothèse sélectionnée.

## Success Criteria

- **SC-001**: Les décompositions testées se réconcilient exactement au centime, y compris les déficits.
- **SC-002**: Les cellules et hypothèses testées égalent le moteur existant et aucun cas hors plafond n’est appliqué.
- **SC-003**: Les parcours clavier, tactile et hors réseau passent; aucun défaut axe ou débordement aux trois largeurs cibles.
- **SC-004**: Toutes les portes de qualité et les tests existants restent verts; captures desktop et mobile inspectées.

## Assumptions / Clarifications

Aucune ambiguïté critique: périmètre approuvé aux deux visuels prioritaires; couleur violette micro et verte salariat; carte annuelle, indépendante du sélecteur mensuel; échelle adaptative bornée en nombre de points, pas en nombre d’euros. Ligne d’équilibre interpolée visuellement, détails recalculés exactement. Choix d’une hypothèse n’altère pas le formulaire avant application. Impôt, retraite comparée et nouveau graphique de risque hors scope. Aucun test de panel humain requis.
