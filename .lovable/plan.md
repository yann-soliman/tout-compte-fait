# Refonte UX — « Tout compte fait »

## Diagnostic confirmé
L’écran actuel sépare encore deux modes (« Assistant » et « Tableau »), affiche l’avertissement avant le contenu utile, puis organise le parcours en quatre étapes distinctes. Les résultats reposent sur quatre blocs de même poids et les trois salaires équivalents arrivent après plusieurs sections. Les nombreuses surfaces blanches/beiges avec ombre produisent une succession de conteneurs plutôt qu’un espace de décision continu.

Le moteur local et ses données fictives sont déjà isolés de la présentation : ils seront conservés sans changement de logique, sans stockage, compte ou service externe.

## 1. Nouvelle architecture de l’écran

Construire une seule page progressive, sans bascule de mode :

```text
En-tête compact : Tout compte fait + accroche + mention « prototype fictif »
↓
Synthèse humaine dynamique
« La micro laisse environ X € de plus, pour Y jours travaillés de plus par an. »
+ nuance immédiate sur la valeur annuelle ou journalière
↓
Cockpit principal
┌ Hypothèses Micro ┐  ┌ Résultat comparé ┐  ┌ Hypothèses Salariat ┐
│ 3–4 réglages clés │  │ indicateur majeur │  │ 3–4 réglages clés   │
│ modifier en place │  │ indicateurs appui │  │ modifier en place   │
└ secondaires       ┘  └ écarts expliqués │  └ secondaires         ┘
↓
Trois salaires équivalents — section centrale et dominante
↓
Décomposition contextuelle des résultats
↓
Protection sociale, hypothèses et limites — divulgation progressive
```

- Remplacer le grand avertissement orange par une mention discrète dans l’en-tête, puis des marqueurs « estimé » placés uniquement auprès des résultats concernés.
- Conserver une seule page et un seul état local ; les valeurs se recalculent pendant la modification.
- Employer des bandes éditoriales ouvertes, des séparateurs et de l’espace blanc plutôt qu’une carte autour de chaque section.

## 2. Hiérarchie exacte des informations

1. **Nom temporaire et promesse** : « Tout compte fait » puis l’accroche fournie, sans navigation Assistant/Tableau.
2. **Phrase de synthèse humaine** : exprimer séparément argent disponible et temps travaillé ; si les critères divergent, le dire explicitement sans désigner de gagnant universel.
3. **Résultat principal** : net disponible après impôt, affiché en comparaison directe Micro/Salariat avec écart en euros et pourcentage.
4. **Contexte immédiat** : hypothèses essentielles éditables de part et d’autre — TJM, rythme, semaines sans activité, dépenses ; brut ETP, temps de travail, participation, congés/RTT.
5. **Indicateurs d’appui hiérarchisés** :
   - valeur économique annuelle en second niveau ;
   - jours réellement travaillés et valeur par jour en paire compacte ;
   - explication courte accolée à chaque écart, pas dans une aide générique.
6. **Trois salaires équivalents** : grand bloc comparatif visible sans traverser le détail des calculs, avec critère, montant brut ETP/an et définition de chaque équivalence.
7. **Décomposition** : du revenu brut au net disponible, puis avantages vers la valeur économique ; comparaison alignée ligne à ligne.
8. **Protection sociale** : section autonome et qualitative, jamais additionnée au revenu.
9. **Hypothèses, méthode et limites** : fin de page repliable, avec année, situation fiscale et préférences d’affichage.

## 3. Comportement desktop et mobile

### Desktop
- Grille cockpit asymétrique en trois zones : paramètres Micro, comparaison centrale plus large, paramètres Salariat.
- Colonnes latérales visuellement différenciées aussi par leur structure : pictogramme/statut, libellé explicite, motif de séparation et ordre des champs — pas seulement vert contre bleu.
- Résumé et salaires équivalents occupent toute la largeur utile.
- Paramètres secondaires ouverts dans la colonne concernée, sans déplacer les résultats loin des réglages.

### Mobile
- En-tête très compact, suivi d’une **synthèse persistante** qui reste visible en haut lors du réglage : écart de net et écart de jours en deux lignes maximum.
- Sélecteur segmenté « Micro / Salariat » pour afficher un seul jeu d’hypothèses à la fois ; le scénario non sélectionné reste résumé dans le résultat comparé.
- Ordre mobile : synthèse → résultat majeur → sélecteur et hypothèses → trois équivalences → indicateurs d’appui → décomposition/protection/hypothèses.
- Montants longs autorisés sur deux lignes ; unités conservées ; aucune comparaison forcée en deux colonnes étroites.
- Les accordéons secondaires s’ouvrent dans le flux et la synthèse compacte reflète immédiatement le recalcul.

## 4. Composants à supprimer, conserver ou transformer

### Supprimer
- État et commandes de bascule `wizard/dashboard`.
- `WizardView`, navigation d’étapes, boutons Retour/Continuer et `StepFrame` en tant que cadre d’assistant.
- Grand bandeau d’avertissement global.
- `UsefulChart` actuel : il répète les chiffres avec des barres sans apporter de lecture supplémentaire.
- Répétition des grands conteneurs `bg-panel + shadow-soft` autour de chaque section.
- Aide systématique sous chaque champ lorsque le libellé et l’unité suffisent.

### Conserver
- État fictif `ScenarioState`, données de démonstration, formatage français et fonctions de calcul existantes.
- Champs numériques avec unités visibles, sélecteurs, accordéons et boutons du système existant.
- Distinction sémantique Micro/Salariat et orange réservé aux estimations.
- Contenu de protection sociale et panneau de méthode, après condensation.

### Transformer
- `ComparisonHighlights` devient un **ResultatPrincipal** dominant accompagné de trois indicateurs secondaires, et non quatre cartes identiques.
- `MicroDashboardFields` et `SalaryDashboardFields` deviennent deux **PanneauxScenario** compacts, éditables, avec champs essentiels visibles et secondaires repliés.
- `EquivalentsPanel` devient le second point focal de la page, avec trois critères côte à côte sur desktop et une liste comparative sur mobile.
- `BreakdownPanel` devient une décomposition alignée et contextuelle, rattachée au résultat qu’elle explique.
- `Field`/`NumberField` adoptent des aides à la demande : unité permanente, texte seulement pour les notions ambiguës comme ETP, part employeur ou jour facturé.
- Les tokens de surface et d’ombre sont resserrés pour privilégier fond éditorial, filets, typographie et contrastes de statut.
- L’en-tête adopte « Tout compte fait », l’accroche fournie et une mention de prototype discrète.

## 5. Micro-interactions utiles

- Recalcul immédiat après modification, avec transition courte uniquement sur le nombre qui change ; aucune animation globale de page.
- Mise en évidence temporaire de l’indicateur affecté et actualisation simultanée de la phrase de synthèse.
- Libellé « Estimation mise à jour » annoncé aux technologies d’assistance via une zone `aria-live` discrète.
- Ouverture des paramètres secondaires en conservant le focus sur le déclencheur, avec fermeture simple et état explicite.
- Survol/focus d’un salaire équivalent : son critère et sa définition sont renforcés ensemble.
- Bouton de réinitialisation des données fictives, discret et accompagné d’une confirmation locale non bloquante.
- Respect de `prefers-reduced-motion` ; transitions désactivées lorsque demandé.

## 6. Critères concrets de réussite

- La phrase de synthèse, le net disponible comparé et au moins deux hypothèses essentielles par scénario sont visibles dans le premier écran desktop.
- Sur mobile 390 × 844, la synthèse compacte, le résultat majeur et le sélecteur Micro/Salariat apparaissent sans défilement horizontal ni texte tronqué.
- Une modification de TJM, brut ETP ou temps de travail actualise visiblement synthèse, indicateurs et équivalences sans changement de vue ni action de validation.
- Les trois salaires équivalents sont repérables immédiatement après le cockpit et chacun nomme explicitement son critère ; aucun montant isolé n’est présenté comme « le » salaire équivalent.
- Le net disponible possède un poids visuel clairement supérieur ; valeur annuelle, jours et valeur/jour ne ressemblent pas à quatre cartes équivalentes.
- Micro et Salariat restent identifiables en niveaux de gris grâce aux titres, pictogrammes, structures et libellés.
- L’avertissement fiscal n’occupe plus une bande dominante ; chaque estimation importante garde un indicateur local compréhensible.
- Les paramètres secondaires sont accessibles en un geste, mais ne dépassent pas les paramètres essentiels dans l’état initial.
- Protection sociale et revenu restent strictement séparés.
- Navigation clavier complète, focus visible, libellés associés, contrastes accessibles et annonces de recalcul vérifiés.
- Le nombre de grands panneaux ombrés est réduit à zéro ou un ; la structure repose principalement sur l’alignement, l’espace et les séparateurs.
- Le moteur existant produit les mêmes résultats pour les données fictives avant et après refonte.

## Validation prévue

- Vérifier le parcours complet au clavier et la modification des trois variables principales.
- Comparer les sorties numériques avant/après pour garantir l’absence de changement du moteur.
- Capturer et contrôler les vues desktop 1280 px et mobile 390 × 844 px, notamment la synthèse persistante, le sélecteur et les montants longs.
- Contrôler l’absence d’erreurs navigateur, de débordements et de dépendance exclusive à la couleur.
