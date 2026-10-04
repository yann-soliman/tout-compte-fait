# Feature Specification: Outils de décision

**Feature Branch**: `feat/004-decision-tools`

**Created**: 2026-10-04

**Status**: Implemented — verified locally

**Input**: User description: "Implement a substantial, production-ready iteration on the existing feat/004-decision-tools branch: derive an employee-equivalent daily rate, explore explicitly hypothetical business risks, and save, compare, import, and export named local scenarios. Preserve the source-backed 2026 engine, offline static architecture, and compact neutral French experience; do not invent income-tax or company-regime rules."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Trouver un taux journalier d’équilibre (Priority: P1)

Une personne compare son revenu salarié annuel avant impôt à une activité micro et veut connaître le taux journalier minimum qui atteint ce revenu, ou la valeur économique totale qui inclut les avantages annuels du salariat. Elle peut examiner le taux au nombre actuel de jours et à plusieurs nombres de jours annuels présentés comme hypothèses, puis appliquer un résultat atteignable au simulateur.

**Why this priority**: Le taux minimum répond directement à la décision centrale sans modifier les règles fiscales ni les droits retraite.

**Independent Test**: Comparer les résultats du taux candidat et du centime précédent avec le calcul annuel existant, puis vérifier les états bloqués et les plafonds aux frontières.

**Acceptance Scenarios**:

1. **Given** un scénario 2026 valide, des jours facturés positifs et une CFE connue ou une exonération confirmée, **When** la cible est le revenu net salarié avant impôt, **Then** le taux calculé est le plus petit centime qui atteint cette cible d’après les calculs micro 2026 existants.
2. **Given** des avantages annuels salariés, **When** la cible est la valeur économique, **Then** leur montant est inclus dans la cible et aucune cotisation ni valeur retraite ne l’est.
3. **Given** une date invalide, une CFE inconnue, une année non prise en charge ou zéro jour facturé, **When** le taux d’équilibre est demandé, **Then** le résultat est bloqué ou indéterminé avec une explication visible.
4. **Given** une cible inaccessible dans le plafond micro 2026 proratisé applicable mais calculable dans la plage numérique sûre, **When** la recherche est terminée, **Then** aucun taux éligible n’est recommandé et un taux indicatif au-delà du plafond est distinctement marqué « hors plafond, non éligible ». Si la plage sûre ne permet pas ce calcul, l’impossibilité est indiquée sans taux hypothétique.
5. **Given** un résultat atteignable, **When** l’action d’application est activée, **Then** seul le taux journalier du scénario courant est modifié et les autres entrées restent inchangées.
6. **Given** plusieurs hypothèses de jours, **When** les taux sont présentés, **Then** les jours actuels et les variantes pratique basse, centrale et haute (120, 160 et 200 jours) sont identifiées comme hypothèses, les résultats se recalculent automatiquement et les taux journaliers affichent leurs centimes exacts.

### User Story 2 - Mesurer une sensibilité aux aléas (Priority: P2)

Une personne estime l’effet de jours non facturés, d’une baisse de taux et de dépenses annuelles supplémentaires sur le revenu micro, et compare le résultat au salariat dans les mêmes termes annuels avant impôt.

**Why this priority**: Une comparaison de décision utile doit montrer l’impact de risques simples sans présenter une prévision ni promettre une couverture chômage.

**Independent Test**: Vérifier manuellement des entrées petites et limites avec calculs annuels en centimes, puis comparer les scénarios courant et stressé.

**Acceptance Scenarios**:

1. **Given** un scénario courant valide, **When** des jours perdus, une baisse de taux en pourcentage et des dépenses annuelles additionnelles sont saisis, **Then** les résultats micro courant et stressé ainsi que leur écart à la valeur économique salariée sont affichés.
2. **Given** des jours perdus supérieurs aux jours facturés, **When** le stress est calculé, **Then** les jours facturés sont ramenés à zéro et le calcul demeure valide.
3. **Given** des paramètres hors bornes ou non finis, **When** le stress est calculé, **Then** ils sont rejetés avec une erreur explicite plutôt que tronqués silencieusement.
4. **Given** une retraite activée ou non, **When** les valeurs économiques de stress sont affichées, **Then** aucun droit retraite n’est ajouté et l’absence de garantie d’emploi ou de chômage reste claire.
5. **Given** les paramètres de stress prédéfinis ou personnalisés, **When** l’utilisateur choisit un preset ou modifie les champs, **Then** les hypothèses visibles correspondent aux résultats calculés.
6. **Given** les résultats courant et stressé, **When** le moteur produit un niveau de confiance ou des avertissements, **Then** ceux-ci sont conservés et affichés avec le scénario correspondant.

### User Story 3 - Gérer et comparer des offres enregistrées (Priority: P3)

Une personne nomme et enregistre des scénarios complets, les retrouve uniquement par une action explicite, compare leurs valeurs annuelles avec le scénario courant, et importe ou exporte sa collection locale.

**Why this priority**: Les instantanés rendent les alternatives réutilisables sans transmettre des données financières ni modifier silencieusement les entrées courantes.

**Independent Test**: Enregistrer, recharger et supprimer des instantanés, puis tester import/export JSON sur des données valides et adverses avec remplacement atomique.

**Acceptance Scenarios**:

1. **Given** un scénario courant, **When** il est enregistré sous un nom valide, **Then** un instantané complet versionné est conservé localement; le nom est nettoyé, limité à 80 caractères et la collection à 20 éléments.
2. **Given** des instantanés sauvegardés, **When** la page est rechargée, **Then** la collection est récupérée sans remplacer le formulaire courant; charger un instantané requiert une action explicite.
3. **Given** une collection sauvegardée, **When** plusieurs entrées sont sélectionnées pour comparaison, **Then** le tableau montre pour les deux statuts le revenu net annuel, la valeur économique annuelle, les jours travaillés et l’année de règles; les droits retraite sont exclus.
4. **Given** un fichier JSON valide dans la limite de taille, **When** il est importé, **Then** toute la collection validée remplace l’ancienne en une opération; les erreurs de validation ou de stockage conservent l’état antérieur.
5. **Given** un JSON malformé, trop grand, d’une version inconnue, avec champ imbriqué invalide ou identifiant dupliqué, **When** il est importé, **Then** il est rejeté sans modification partielle ni pollution de prototype.
6. **Given** un export demandé explicitement, **When** l’action correspondante est déclenchée, **Then** le navigateur télécharge la collection JSON ou un résumé CSV sans inclure les droits retraite et sans interprétation des noms comme formules de tableur.
7. **Given** une erreur de quota ou des données locales corrompues, **When** l’application démarre ou sauvegarde, **Then** elle reste utilisable, conserve les données en mémoire disponibles et affiche une erreur compréhensible.
8. **Given** une collection à effacer, **When** l’effacement est demandé, **Then** une confirmation précède l’action et un échec conserve l’état; aucun scénario financier n’est ajouté à une URL ni envoyé en télémétrie.

### User Story 4 - Réinitialiser les entrées (Priority: P4)

Une personne peut rétablir le scénario initial, sans effacer les instantanés enregistrés, après confirmation explicite.

**Why this priority**: Une action de remise à zéro explicite facilite le retour à une comparaison propre sans effacer involontairement le travail sauvegardé.

**Independent Test**: Modifier plusieurs entrées, annuler la confirmation puis accepter et constater respectivement leur conservation puis le retour aux valeurs initiales.

**Acceptance Scenarios**:

1. **Given** un formulaire modifié, **When** la réinitialisation est annulée, **Then** toutes les entrées restent inchangées.
2. **Given** un formulaire modifié, **When** la réinitialisation est confirmée, **Then** les entrées reprennent leurs valeurs initiales sans supprimer les instantanés nommés.

### Edge Cases

- Zéro jours facturés rend un taux d’équilibre indéterminé; zéro jour stressé reste une valeur calculable selon le moteur micro.
- Une cible négative fournie directement au solveur est invalide et bloquée; aucun taux négatif ou revenu prétendument atteint ne doit être produit.
- Date absente signifie année complète si le modèle courant le permet; date présente invalide ou hors 2026 bloque le calcul.
- Une CFE absente et sans exonération confirmée bloque l’analyse d’équilibre économique et signale la valeur économique incomplète.
- Une exonération CFE confirmée avec montant annuel omis représente une CFE connue de zéro; un montant absent ou nul sans confirmation reste inconnu.
- Un horodatage ISO importé dont une date calendaire impossible est normalisée par l’analyseur de dates est rejeté, qu’il comporte ou non les millisecondes.
- Le plafond micro est calculé avec le même prorata de première année que le moteur 2026; une cible hors plafond reste un échec éligible explicite, pas une recommandation.
- Les entrées d’import comportent des clés inconnues, des valeurs `NaN`/infinies, des tableaux ou objets inattendus, des dates impossibles et des valeurs monétaires hors plage : toute la transaction est rejetée.
- La collection atteint sa capacité, un nom est vide après nettoyage, deux identifiants sont identiques, ou le stockage local est indisponible : ne pas écraser silencieusement des données valides.
- Un catalogue ou une année inconnue est montré comme non pris en charge; les règles 2026 ne sont jamais réutilisées silencieusement pour une autre année.
- Les vues à 360, 768 et 1280 pixels restent lisibles et sans débordement horizontal; toutes les actions restent utilisables au clavier.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Le moteur 2026 existant, ses sources datées et ses résultats sont préservés; les nouveaux calculs réutilisent ses méthodes micro et salarié sans modifier les règles statutaires.
- **FR-002**: Le calcul d’équilibre cible explicitement soit le revenu net annuel salarié avant impôt, soit sa valeur économique annuelle incluant les avantages saisis; les deux montants sont exprimés en centimes et affichés sans impôt calculé.
- **FR-003**: Pour un nombre positif de jours, une CFE connue ou exonération confirmée et une date valide, le taux d’équilibre est le plus petit taux entier en centimes qui atteint la cible avec les calculs micro 2026; le taux renvoyé et son centime précédent sont vérifiés.
- **FR-004**: La recherche du taux éligible est bornée par le plafond de chiffre d’affaires annuel proratisé applicable. Si la cible le dépasse, un taux indicatif peut être calculé dans la plage numérique sûre, mais il porte obligatoirement l’état et l’avertissement « hors plafond, non éligible » et ne peut pas être présenté comme taux recommandé ni appliqué; si aucun taux sûr n’existe, afficher l’impossibilité sans montant.
- **FR-005**: Zéro jour, une CFE requise inconnue, une date invalide, une année/catalogue non pris en charge ou une cible négative produit un résultat explicitement indéterminé ou bloqué, jamais une recommandation.
- **FR-006**: La comparaison d’équilibre affiche le nombre courant de jours et des cas pratiques bas, central et élevé (120, 160 et 200 jours annuels) comme hypothèses, sans les décrire comme prévisions; les taux sont recalculés automatiquement, annoncés dans une région dynamique polie et affichés au centime d’euro exact.
- **FR-007**: Un taux atteignable peut être appliqué aux entrées courantes sans modifier les autres champs.
- **FR-008**: L’analyse de sensibilité accepte un nombre entier borné de jours perdus, une baisse de taux en pourcentage bornée au centième et des dépenses annuelles additionnelles positives et bornées en centimes; elle refuse les valeurs non finies, hors limites et les euros de dépenses ayant une précision sous le centime, avec une erreur visible.
- **FR-009**: Le stress ramène les jours restants à zéro au minimum, applique le taux abaissé en centimes, et présente les valeurs annuelles micro courantes et stressées et leurs écarts au revenu net salarié et à sa valeur économique; le niveau de confiance et les avertissements du moteur sont conservés pour chaque scénario.
- **FR-010**: Les presets de stress sont décrits comme hypothèses; l’affichage précise que le salariat/chômage n’est pas garanti et que les retraites ne sont ni simulées à nouveau ni ajoutées à la valeur économique.
- **FR-011**: L’application permet d’enregistrer, lister, charger explicitement et supprimer des instantanés complets `ComparisonScenario` nommés; noms nettoyés de 1 à 80 caractères et collection limitée à 20.
- **FR-012**: Les instantanés sont stockés localement dans un schéma versionné; au démarrage, données corrompues ou stockage indisponible ne font pas planter l’application et sont signalés sans remplacement du formulaire courant.
- **FR-013**: Import/export JSON est une action explicite, limité à 100 Kio, versionné et validé entièrement avant remplacement; les champs imbriqués, enums, année, dates calendaires, nombres finis, entiers sûrs et montants doivent satisfaire les mêmes bornes que le scénario courant.
- **FR-014**: L’import rejette atomiquement les données malformées, versions inconnues, propriétés non permises ou identifiants dupliqués; les objets admis sont reconstruits depuis une liste blanche et aucune donnée n’est injectée comme HTML.
- **FR-015**: L’échec d’écriture, quota ou import préserve la collection persistée et en mémoire antérieure; une action de suppression générale est confirmée avant effet.
- **FR-016**: Une comparaison des instantanés sélectionnés et du scénario courant montre, pour micro et salariat, l’année, le revenu net annuel avant impôt, la valeur économique annuelle et les jours travaillés; elle n’inclut pas les droits retraite et signale les années/catalogues non pris en charge.
- **FR-017**: Un export CSV est déclenché par l’utilisateur, fournit un résumé annuel comparable et protège les cellules texte des préfixes de formule `=`, `+`, `-` et `@`.
- **FR-018**: La remise à zéro des entrées courantes nécessite confirmation et ne supprime pas les scénarios nommés.
- **FR-019**: Toutes les données financières restent en calcul local; les exports se produisent uniquement sur action explicite et aucune donnée n’est mise dans une URL ou télémétrie.
- **FR-020**: Les outils additionnels sont repliables, les champs ont des libellés et boutons sémantiques accessibles, l’ordre visuel conserve les entrées avant les résultats et l’interface française compacte fonctionne sans débordement aux largeurs 360, 768 et 1280 px.
- **FR-021**: Aucun impôt sur le revenu simulé, aucune règle SASU/EURL et aucune formule statutaire non sourcée n’est ajoutée; ces sujets sont explicitement différés.
- **FR-022**: Une exonération CFE confirmée sans montant annuel explicite est traitée comme une valeur connue de zéro dans le moteur; sans exonération confirmée, une CFE absente ou nulle demeure inconnue.
- **FR-023**: L’import valide l’horodatage de sauvegarde par aller-retour exact des composantes calendaires et temporelles tout en acceptant les variantes UTC admises avec ou sans millisecondes; une date impossible normalisée est rejetée.

### Key Entities _(include if feature involves data)_

- **Scénario de comparaison**: Les paramètres complets 2026 du formulaire courant, comprenant taux, jours, dépenses, CFE, date, revenu et avantages salariés, options retraite et projection.
- **Instantané nommé**: Identifiant unique, nom normalisé, instantané complet d’un scénario et date de sauvegarde; schéma d’enveloppe versionné.
- **Hypothèse d’équilibre**: Type de cible, montant annuel cible, jours facturés et résultat déterministe de taux ou d’indisponibilité.
- **Hypothèse de stress**: Jours perdus, pourcentage de baisse du taux, dépense additionnelle, valeurs annuelles calculées et limites de saisie.
- **Ligne de comparaison**: Libellé et source (courant ou instantané), année, jours travaillés, revenu net avant impôt et valeur économique annuelle; aucun droit retraite.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Pour chaque cas atteignable testé, le taux calculé atteint la cible au centime près et son prédécesseur échoue; pour chaque plafond testé, aucun taux inéligible n’est présenté comme recommandé.
- **SC-002**: Les mêmes entrées annuelles produisent exactement les mêmes résultats annuels, quel que soit l’affichage mensuel ou annuel existant.
- **SC-003**: Des scénarios stressés aux frontières produisent un résultat déterministe en centimes, et le nombre de jours ne passe jamais sous zéro.
- **SC-004**: Les tests rejettent entièrement tous les imports malformés, hors limite, d’un schéma ou d’une version invalide et conservent la collection antérieure.
- **SC-005**: Vingt instantanés valides peuvent être conservés; les limites de nom et de taille import sont appliquées à 80 caractères et 100 Kio.
- **SC-006**: Un rechargement restaure la bibliothèque d’instantanés valides, sans charger automatiquement un instantané dans les champs du formulaire; le formulaire redémarre avec ses valeurs initiales.
- **SC-007**: Les tests UI et E2E couvrent sauvegarde, chargement, suppression, comparaison, application d’un taux affiché avec ses centimes exacts, import/export fichier réel, erreurs locales, avertissements/confiance du stress et parité annuel/mensuel.
- **SC-008**: Les parcours principaux restent accessibles au clavier et sans problème axe détecté; les vues de 360, 768 et 1280 px ne présentent pas de débordement horizontal.

## Assumptions

- L’application ne dispose que du catalogue statutaire 2026; une autre année est bloquée et affichée comme non prise en charge.
- Les cibles et valeurs économiques sont annuelles avant impôt; aucun modèle d’impôt sur le revenu n’est supposé.
- La cible économique comprend le revenu salarié net avant impôt plus les seuls avantages annuels saisis; les droits retraite restent séparés.
- Les variantes de jours 120, 160 et 200 sont des exemples de charge de travail et ne constituent ni conseil ni prévision.
- Les bornes de stress par défaut sont 0–366 jours perdus, 0–100 % de baisse et 0–10 000 000 centimes de dépenses supplémentaires annuelles; les valeurs sont modifiables dans les bornes.
- Le document JSON importe/exporte la collection complète et la remplace atomiquement après validation complète; les identifiants dupliqués rendent l’import invalide.
- Une impossibilité de stockage conserve l’état courant en mémoire et affiche une erreur; les données persistées valides ne sont jamais effacées à l’échec.
- Les navigateurs ciblés prennent en charge le stockage local et les téléchargements de fichiers; aucun compte ni service distant n’est requis.
- L’essai utilisateur de panel humain est retiré du périmètre; la validation repose sur tests automatisés et contrôles d’accessibilité.

## Deferred Scope

- Impôt sur le revenu réel, comparaison après impôt, et traitement de SASU/EURL sont différés en l’absence de règles 2026 autoritatives et validées.
- Garantie de mission, d’emploi, d’assurance chômage, de jours facturés ou de performance économique future.
- Transmission serveur, comptes utilisateur, synchronisation, partage de scénarios par URL, télémétrie financière et sauvegarde distante.
