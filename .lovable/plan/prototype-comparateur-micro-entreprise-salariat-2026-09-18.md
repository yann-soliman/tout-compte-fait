# Prototype comparateur micro-entreprise / salariat

## Objectif
Créer une expérience haute fidélité, entièrement locale et responsive, permettant de tester une première simulation guidée puis d’explorer les résultats et modifier les hypothèses sans recommencer.

## Parcours
1. **Accueil directement dans le simulateur**
   - En-tête discret sans nom de marque définitif.
   - Données fictives clairement signalées.
   - Progression visible en quatre étapes.

2. **Assistant guidé**
   - Étape 1 : année, situation fiscale, parts ou taux personnalisé, affichage mensuel/annuel.
   - Étape 2 : activité libérale BNC, choix CA direct ou calcul TJM × jours, rythme, semaines sans activité, jours non facturés, dépenses et options.
   - Étape 3 : brut annuel équivalent temps plein, temps de travail à 80 %, rémunération réellement versée explicitée, primes, participation, tickets-restaurant, congés et RTT.
   - Étape 4 : synthèse avant affichage des résultats.
   - Aides courtes, unités toujours visibles, sections secondaires repliables, validation et navigation avant/arrière.

3. **Tableau de comparaison modifiable**
   - Quatre indicateurs prioritaires par statut : net disponible, valeur économique, jours travaillés, valeur par jour.
   - Écarts en euros et pourcentage, avec libellés textuels en plus des couleurs.
   - Graphique comparatif utile et accessible.
   - Décomposition du brut au résultat final.
   - Trois salaires équivalents distincts selon le critère retenu.
   - Protection sociale présentée séparément, sans valorisation monétaire arbitraire.
   - Hypothèses, sources et avertissements d’estimation visibles.
   - Modification locale des hypothèses avec recalcul simulé instantané.

## Direction visuelle
- Interface éditoriale et rassurante, claire, spacieuse, sans effet tableur.
- Vert profond pour la micro-entreprise, bleu franc pour le salariat, orange réservé aux estimations.
- Typographie expressive mais très lisible, contrastes accessibles et repères par icônes/libellés.
- Peu de bordures et de cartes : sections ouvertes, séparateurs fins et panneaux seulement lorsqu’ils structurent une action.
- Animations discrètes entre étapes et lors des mises à jour, avec respect de la réduction de mouvement.

## Responsive
- Ordinateur : hypothèses micro et salariat côte à côte dans le tableau de bord.
- Mobile : scénarios successifs avec sélecteur simple, indicateurs empilés et commandes confortables.
- Vérification aux formats mobile actuel et grand écran pour éviter débordements et chevauchements.

## Technique
- React/TanStack Start et Tailwind existants, état local uniquement.
- Calculs volontairement simplifiés et explicitement présentés comme estimations UX.
- Composants réutilisables pour champs, aides, accordéons, indicateurs, barres comparatives et navigation.
- Métadonnées françaises propres à la page ; aucun service externe, compte, stockage distant ou backend.
