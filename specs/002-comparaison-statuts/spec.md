# Feature Specification: Comparaison des statuts

**Feature Branch**: `work`

**Created**: 2026-09-21

**Status**: Clarifié — vérification réglementaire en attente

**Input**: Comparer, pour l'année 2026, une activité libérale exercée en micro-entreprise avec un emploi salarié privé, sur une base économique homogène, en distinguant revenu disponible, temps travaillé, avantages et droits à la retraite.

## Clarifications

### Session 2026-09-22

- Q: Pour déterminer l'éligibilité au régime micro en 2026, le comparateur doit-il demander les chiffres d'affaires des deux années précédentes ou seulement signaler qu'un historique non renseigné peut modifier le résultat ? → A: Comparer uniquement 2026 et afficher un avertissement lorsque l'historique manque.
- Q: Le comparateur doit-il couvrir les salariés cadres et non-cadres, ou limiter le scénario salarié à un seul de ces statuts ? → A: Demander si le salarié est cadre ou non-cadre et appliquer les règles correspondantes.
- Q: Comment les droits à la retraite acquis en 2026 doivent-ils apparaître dans la comparaison ? → A: Afficher les droits acquis et une estimation monétaire indicative de pension annuelle future.
- Q: Le salaire brut annuel saisi doit-il représenter le montant réellement prévu pour la quotité choisie, ou un équivalent temps plein que le comparateur réduit ensuite ? → A: Saisir le salaire brut réel correspondant déjà à la quotité choisie.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Comparer le revenu disponible 2026 (Priority: P1)

Une personne qui arbitre entre une activité libérale en micro-entreprise et un emploi salarié renseigne les données propres à chaque option et obtient, après prélèvements et frais retenus, deux revenus disponibles comparables ainsi que leur écart.

**Why this priority**: Le revenu réellement disponible constitue la première donnée de décision et la valeur minimale autonome du comparateur.

**Independent Test**: À partir d'un scénario 2026 dont les montants attendus ont été calculés à la main avec les paramètres officiels datés, vérifier séparément chaque assiette, prélèvement, revenu net et l'écart final.

**Acceptance Scenarios**:

1. **Given** une activité libérale BNC non réglementée en micro-entreprise, sans option pour le versement libératoire, et un salaire brut annuel, **When** les données 2026 valides sont renseignées, **Then** le résultat détaille pour chaque statut les revenus bruts, prélèvements obligatoires, frais ou avantages retenus, revenu disponible avant impôt sur le revenu, puis l'écart entre les deux options.
2. **Given** une comparaison valide, **When** l'affichage passe d'annuel à mensuel, **Then** chaque montant de flux annuel est divisé par douze sans modifier les bases annuelles ni les totaux de référence.
3. **Given** un chiffre d'affaires 2026 situé exactement au plafond réglementaire applicable, **When** la comparaison est calculée sans historique de chiffre d'affaires, **Then** le résultat reste calculable mais signale que l'éligibilité au régime micro ne peut pas être confirmée; un euro au-dessus déclenche en plus un avertissement de dépassement du plafond 2026.
4. **Given** un montant nul pour une activité, **When** la comparaison est calculée, **Then** aucun prélèvement proportionnel ni revenu négatif artificiel n'est produit, tandis que les frais fixes saisis restent visibles.

---

### User Story 2 - Comparer la valeur économique du temps et des avantages (Priority: P2)

La personne complète la comparaison avec les jours effectivement travaillés ou facturés, les congés, les RTT, les frais professionnels et les avantages salariés afin d'obtenir une valeur économique annuelle et par jour homogène.

**Why this priority**: Deux revenus annuels proches ne sont pas équivalents si le temps mobilisé, les frais supportés et les avantages reçus diffèrent.

**Independent Test**: Avec des revenus nets constants et des volumes de jours distincts, vérifier que seuls les indicateurs de temps, la valeur par jour et la valeur totale enrichie changent selon les éléments saisis.

**Acceptance Scenarios**:

1. **Given** des jours facturés côté micro-entreprise et des congés, RTT et une quotité de travail côté salariat, **When** le calcul est effectué, **Then** le nombre de jours travaillés et la valeur par jour sont affichés avec la méthode de décompte explicitée.
2. **Given** des frais professionnels, une complémentaire santé et une CFE saisis côté micro-entreprise, **When** le résultat est affiché, **Then** ces charges sont déduites une seule fois et restent distinguées des prélèvements réglementaires.
3. **Given** des avantages salariés valorisés, **When** le résultat est affiché, **Then** ils augmentent la valeur économique totale mais jamais le salaire net ni le revenu imposable, sauf qualification réglementaire explicite de l'avantage concerné.

---

### User Story 3 - Comparer les droits à la retraite (Priority: P3)

La personne peut inclure une estimation séparée des droits à la retraite acquis dans chaque statut et comprendre leur effet sur la comparaison sans les confondre avec un revenu immédiatement disponible.

**Why this priority**: La retraite influe sur un arbitrage de long terme, mais son estimation est plus conditionnelle que celle du revenu courant.

**Independent Test**: Pour des assiettes placées juste en dessous, au niveau et juste au-dessus de chaque seuil de trimestre ou de point 2026, vérifier le nombre de trimestres et de points acquis, puis vérifier que leur valorisation reste séparée du revenu disponible.

**Acceptance Scenarios**:

1. **Given** un scénario 2026 valide, **When** la retraite est incluse, **Then** le résultat distingue retraite de base et complémentaire, trimestres validés, points acquis et estimation monétaire indicative de la pension annuelle produite par les seuls droits à points 2026; pour la retraite de base, le montant autonome est déclaré non calculable à partir de la seule année 2026, avec l'année et le statut de chaque paramètre.
2. **Given** une assiette insuffisante pour valider un trimestre, **When** la retraite est estimée, **Then** zéro trimestre est affiché; chaque franchissement exact d'un seuil ajoute le droit correspondant dans la limite annuelle réglementaire.
3. **Given** un horizon de projection et une hypothèse d'évolution, **When** la projection est consultée, **Then** les revenus cumulés des deux statuts sont présentés année par année et les hypothèses non réglementaires sont identifiées comme telles.

### Edge Cases

- Valeurs négatives, non numériques ou au-delà des maxima calendaires: refuser le calcul concerné et désigner le champ à corriger.
- Zéro jour travaillé: afficher le revenu annuel calculable, mais rendre la valeur par jour indéterminée plutôt que zéro ou infinie.
- Année bissextile, activité partielle et quotité inférieure à 100 %: ne jamais compter davantage de jours que le calendrier de travail retenu.
- Chiffre d'affaires au voisinage du plafond micro, ou franchissement sur plusieurs années: signaler que l'éligibilité dépend aussi de l'historique, qui n'est pas déduit d'une seule année.
- Revenu au voisinage d'un seuil de trimestre, d'une tranche de cotisation ou d'un plafond: appliquer la règle exacte au seuil et tester un centime en dessous et au-dessus.
- Plafond annuel proratisé en cas d'activité incomplète: demander la période d'activité avant d'affirmer l'éligibilité.
- Frais supérieurs au revenu micro: conserver le déficit économique dans le détail sans créer un déficit fiscal propre au régime micro.
- CFE inconnue ou exonération possible: ne pas inventer le montant; afficher le résultat comme incomplet ou estimatif.
- Paramètre 2026 absent, provisoire ou remplacé: empêcher son affichage comme résultat établi et indiquer le paramètre concerné.
- Arrondis: calculer sur les montants non arrondis, appliquer l'arrondi légal lorsqu'il existe, et n'arrondir l'affichage monétaire qu'à la fin.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Le comparateur MUST limiter le scénario de référence à une activité libérale BNC non réglementée relevant du régime micro-social et à un salarié de droit commun du secteur privé en France métropolitaine, hors régime local d'Alsace-Moselle; les autres situations MUST être déclarées hors périmètre.
- **FR-002**: Le comparateur MUST recueillir au minimum l'année, la période d'activité, le chiffre d'affaires hors taxes ou son équivalent taux journalier × jours facturés, les frais professionnels, la complémentaire santé, la CFE, le salaire brut réel correspondant déjà à la quotité choisie, le statut cadre ou non-cadre, la quotité de travail, les congés, les RTT et les avantages valorisés.
- **FR-003**: Le comparateur MUST présenter les résultats après les entrées, dans cet ordre: revenu disponible avant impôt, prélèvements et frais, valeur économique totale, jours travaillés, valeur par jour, retraite, puis écart entre statuts.
- **FR-004**: Le chiffre d'affaires micro MUST être calculé à partir des données saisies et ne MUST jamais être assimilé à un salaire ou à un bénéfice.
- **FR-005**: Les cotisations et contributions micro MUST être calculées à partir de leur assiette réglementaire 2026 et détaillées par nature; les frais réels saisis MUST être déduits seulement de la lecture économique.
- **FR-006**: Le revenu salarié disponible avant impôt MUST être présenté comme un net réglementaire de droit commun: il part du salaire brut réel correspondant déjà à la quotité choisie, sans appliquer une seconde proratisation, puis retranche les cotisations salariales générales applicables au statut cadre ou non-cadre renseigné; aucun taux agrégé approximatif ne MUST être présenté comme réglementaire.
- **FR-007**: Le comparateur MUST exclure de la comparaison principale l'impôt sur le revenu, le versement libératoire, l'assurance chômage facultative, les indemnités de maladie ou de congé, les frais employeur, le régime local d'Alsace-Moselle, les contrats d'apprentissage, les mandataires sociaux, les exonérations, les retenues de mutuelle ou prévoyance, les titres-restaurant, le transport, les particularités conventionnelles et toute société autre que la micro-entreprise; ces exclusions MUST être visibles.
- **FR-008**: Le comparateur MUST distinguer le revenu disponible, les avantages valorisés et les droits différés; l'estimation de pension MUST rester séparée du revenu disponible et de la valeur économique totale, et aucune cotisation retraite ne MUST être ajoutée comme si elle était encaissée.
- **FR-009**: Le décompte salarié MUST partir des jours ouvrés de la période et retrancher jours non travaillés, congés et RTT sans double comptage; le décompte micro MUST utiliser les jours facturés saisis.
- **FR-010**: Le comparateur MUST afficher les valeurs annuelles de référence et MAY en donner un équivalent mensuel égal à un douzième; le changement de période MUST préserver l'écart annuel sous-jacent.
- **FR-011**: Pour chaque résultat réglementaire, le comparateur MUST rendre consultables l'année d'application, l'organisme officiel, le lien vers la source, la date de vérification et le statut « connu », « provisoire » ou « estimatif ».
- **FR-012**: Toute règle sans paramètre 2026 officiellement vérifié MUST produire une estimation explicitement identifiée, jamais un montant présenté comme établi.
- **FR-013**: Les droits retraite MUST être exprimés au minimum en trimestres de base et points complémentaires acquis, dans leurs limites annuelles, puis accompagnés, pour les seuls régimes à points, d'une estimation monétaire indicative de la pension annuelle attribuable aux droits acquis en 2026; la retraite de base MUST afficher qu'un montant autonome n'est pas calculable à partir de la seule année 2026. Toute estimation MUST exclure les autres années de carrière et ne MUST pas être présentée comme la pension totale future.
- **FR-014**: Chaque seuil d'éligibilité, tranche, plafond, taux et règle d'arrondi MUST être vérifiable aux bornes: un centime en dessous, exactement à la borne et un centime au-dessus.
- **FR-015**: Une projection MUST séparer les paramètres réglementaires de départ des hypothèses choisies (horizon et évolution annuelle) et ne MUST pas faire passer une hypothèse constante pour une règle future.
- **FR-016**: Les résultats MUST être recalculés après chaque modification valide et MUST identifier précisément toute donnée manquante ou incohérente qui empêche un résultat fiable.
- **FR-017**: Le comparateur MUST utiliser uniquement les données de 2026 pour le calcul; faute de recueillir les chiffres d'affaires antérieurs, il MUST afficher que l'éligibilité au régime micro n'est pas confirmée et ne MUST pas déduire cette éligibilité du seul respect du plafond 2026.

### Règles conceptuelles pérennes

- **RC-001 — Comparabilité**: comparer une même période et séparer flux encaissables, coûts supportés, avantages et droits différés.
- **RC-002 — Micro-entreprise**: distinguer chiffre d'affaires, prélèvements réglementaires, frais réels et revenu économique; les frais réels ne modifient pas l'assiette micro-sociale.
- **RC-003 — Salariat**: distinguer salaire brut, cotisations salariales, salaire net avant impôt et avantages; la quotité ne doit pas être appliquée deux fois si le brut saisi la reflète déjà.
- **RC-004 — Retraite**: comparer des droits acquis selon les règles de chaque régime, non la seule somme des cotisations, plafonner les trimestres au maximum annuel légal et isoler toute estimation monétaire indicative de la pension annuelle produite par les droits 2026.
- **RC-005 — Traçabilité**: une règle conceptuelle peut rester stable, tandis que chacun de ses paramètres datés doit être confirmé pour l'année demandée.
- **RC-006 — Prudence**: un résultat dépendant d'une donnée inconnue ou d'une règle non confirmée doit être qualifié d'estimation et exposer la cause.

### Paramètres réglementaires propres à 2026

Aucun nombre ci-dessous n'est déduit d'un taux de démonstration existant. Les pages institutionnelles doivent être relues à la date de préparation du calcul; un statut « connu » signifie que la valeur est publiée pour 2026 par la source indiquée.

| PR     | Paramètre 2026                                                      | Valeur à retenir                                                                                                                                                                      | Application                   | Source institutionnelle                                                                                             | Statut au 2026-09-22                                                                            |
| ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| PR-001 | Taux micro-social, activité libérale BNC non réglementée hors Cipav | 25,6 % du chiffre d’affaires                                                                                                                                                          | À compter du 1er janvier 2026 | [Service Public Entreprendre — régime micro-social](https://entreprendre.service-public.gouv.fr/vosdroits/F37353)   | Connu — page vérifiée le 21 février 2026                                                        |
| PR-002 | Contribution à la formation professionnelle libérale                | 0,2 % du chiffre d’affaires annuel                                                                                                                                                    | 2026                          | [Service Public Entreprendre — CFP](https://entreprendre.service-public.gouv.fr/vosdroits/F23459)                   | Connu — page vérifiée le 1er janvier 2026                                                       |
| PR-003 | Plafond micro pour les prestations/libéraux                         | 83 600 € HT; première année: `plafond × jours d’existence / 365`; dépassement isolé sur une seule des deux années de référence sans sortie                                            | Revenus 2026                  | [Service Public Entreprendre — régime fiscal micro](https://entreprendre.service-public.gouv.fr/vosdroits/F23267)   | Connu — éligibilité individuelle non confirmée sans historique 2024–2025                        |
| PR-004 | Cotisations salariales générales                                    | Vieillesse 6,90 % plafonnée et 0,40 % déplafonnée; CSG 9,2 % et CRDS 0,5 % sur l’assiette publiée; Agirc-Arrco, CEG, CET et Apec selon les tranches du registre T003                  | Paies 2026                    | [Service Public Entreprendre — cotisations salariales](https://entreprendre.service-public.gouv.fr/vosdroits/F2302) | Connu dans le périmètre salarié privé général; arrondi au centime qualifié de règle applicative |
| PR-005 | Plafond de la Sécurité sociale                                      | 4 005 € mensuels; 48 060 € annuels                                                                                                                                                    | 2026                          | [Service Public Entreprendre — cotisations salariales](https://entreprendre.service-public.gouv.fr/vosdroits/F2302) | Connu — page vérifiée le 1er janvier 2026                                                       |
| PR-006 | Validation d’un trimestre de retraite de base                       | 1 803 € de revenu cotisé par trimestre; maximum 4 par an                                                                                                                              | Droits 2026                   | [Service Public Entreprendre — retraite micro](https://entreprendre.service-public.gouv.fr/vosdroits/F23369)        | Connu — page vérifiée le 1er avril 2026                                                         |
| PR-007 | Assiette retraite de base du micro libéral hors Cipav               | Cotisation globale 25,6 % × CA; part base 46,40 %; revenu cotisé = part base ÷ 17,87 %                                                                                                | Chiffre d’affaires 2026       | [Service Public Entreprendre — retraite micro](https://entreprendre.service-public.gouv.fr/vosdroits/F23369)        | Connu pour la retraite de base; arrondis intermédiaires exacts non publiés                      |
| PR-008 | Retraite complémentaire du salarié                                  | Formule générale connue; valeurs d’achat/service et arrondi 2026 non directement lisibles                                                                                             | Droits 2026                   | [Agirc-Arrco — paramètres utiles](https://www.agirc-arrco.fr/entreprises/declarer-et-payer/parametres-utiles/)      | Provisoire — résultat bloqué, aucune valeur mémorisée codée                                     |
| PR-009 | Retraite complémentaire du micro libéral hors Cipav                 | La publication renvoie la branche libérale vers la CNAVPL et un régime dépendant du groupe professionnel; les paramètres SSI publiés pour commerce/services ne sont pas transposables | Droits 2026                   | [Service Public Entreprendre — retraite micro](https://entreprendre.service-public.gouv.fr/vosdroits/F23369)        | Non résolu — résultat complémentaire bloqué                                                     |
| PR-010 | CFE et exonérations                                                 | Montant saisi selon la commune; exonération l’année de création et sous 5 000 € de CA N-2 selon les conditions publiées                                                               | CFE 2026                      | [Service Public Entreprendre — CFE](https://entreprendre.service-public.gouv.fr/vosdroits/F23547)                   | Principe connu; montant individuel estimatif tant que non saisi                                 |

> **Garde-fou de validation**: seules les règles marquées « Connu » peuvent produire un résultat établi. PR-008 et PR-009 restent bloquées; aucune valeur complémentaire mémorisée ou issue d'un autre périmètre ne peut être codée. Le MVP de revenu peut avancer avec les règles directement vérifiées, tandis que les résultats de retraite complémentaire doivent rester indisponibles.

### Key Entities

- **Scénario de comparaison**: année 2026, période d'activité, période d'affichage et hypothèses communes reliant exactement une option micro et une option salariée; il ne contient pas l'historique de chiffre d'affaires des années antérieures.
- **Option micro-entreprise**: activité BNC, chiffre d'affaires, jours facturés, frais réels, complémentaire santé, CFE, éligibilité et prélèvements.
- **Option salariée**: salaire brut réel correspondant déjà à la quotité choisie, statut cadre ou non-cadre, quotité, calendrier travaillé, cotisations salariales et avantages valorisés.
- **Paramètre réglementaire**: nom, valeur ou barème, unité, assiette, borne, règle d'arrondi, année d'application, source officielle, date de vérification et statut.
- **Résultat de statut**: revenu disponible avant impôt, charges détaillées, valeur économique totale, jours travaillés, valeur par jour et indicateur de fiabilité.
- **Droits retraite**: régime, assiette, trimestres, points, plafond annuel, paramètres datés et estimation monétaire indicative distincte pour les droits à points 2026 et état non calculable pour la valeur autonome des droits de base.
- **Projection**: suite annuelle de résultats construite à partir d'un résultat de référence et d'hypothèses explicitement non réglementaires.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100 % des scénarios de référence 2026 validés manuellement reproduisent chaque montant réglementaire au centime avant arrondi d'affichage et à un euro près après affichage.
- **SC-002**: 100 % des taux, seuils, plafonds et barèmes utilisés affichent une année, une source institutionnelle, une date de vérification et un statut; aucun paramètre non confirmé n'apparaît comme établi.
- **SC-003**: Pour chaque borne réglementaire, les trois cas « un centime en dessous », « à la borne » et « un centime au-dessus » donnent le régime, la tranche ou le droit attendu.
- **SC-004**: Au moins 90 % d'un panel de 10 utilisateurs cibles identifient en moins de 3 minutes le statut offrant le revenu disponible le plus élevé et l'écart annuel correspondant.
- **SC-005**: Au moins 90 % du même panel distinguent correctement, sans aide, revenu disponible, valeur des avantages et droits à la retraite.
- **SC-006**: Un scénario complet peut être saisi et comparé en moins de 5 minutes; un changement de montant valide met à jour tous les résultats concernés sans action supplémentaire et en moins de 100 ms dans les navigateurs cibles.
- **SC-007**: Dans 100 % des scénarios incomplets, hors périmètre ou fondés sur un paramètre provisoire, le résultat concerné est bloqué ou explicitement qualifié d'estimation avec sa cause.
- **SC-008**: Les totaux annuel et mensuel concordent dans 100 % des cas à l'arrondi d'affichage près, et la somme des composantes affichées explique l'écart entre statuts.

## Assumptions

- La cible est une personne physique fiscalement domiciliée en France métropolitaine, comparant une activité libérale BNC non réglementée en micro-entreprise avec un emploi salarié privé cadre ou non-cadre en 2026.
- Le salaire brut saisi correspond déjà à la quotité contractuelle; la quotité sert au décompte du temps et ne réduit pas une seconde fois ce salaire.
- Les montants sont exprimés en euros et le chiffre d'affaires micro est hors taxes; la TVA est hors comparaison économique.
- La comparaison principale est avant impôt sur le revenu, ce qui évite de supposer foyer fiscal, crédits, réductions et option de versement libératoire.
- Les frais micro et avantages salariés sont saisis par la personne; seuls leur classement et leur effet dans les totaux sont contrôlés.
- La CFE dépend de la commune, de la base et des exonérations: elle reste une donnée saisie, éventuellement nulle avec justification.
- La projection applique une hypothèse choisie aux montants de référence; elle ne prédit ni barèmes futurs ni rendement réel de droits à retraite.
- Les valeurs réglementaires dont le statut reste provisoire ou estimatif devront être confirmées avant toute implémentation des calculs réglementaires.
- Les chiffres d'affaires 2024 et 2025 ne sont pas recueillis; l'éligibilité au régime micro reste donc non confirmée même lorsque le chiffre d'affaires 2026 respecte son plafond.

## Out of Scope

- Calcul de l'impôt sur le revenu, du prélèvement à la source ou du versement fiscal libératoire.
- Reconstitution d'un bulletin de paie conventionnel ou individuel: régime local d'Alsace-Moselle, apprentissage, mandat social, exonérations, mutuelle, prévoyance, titres-restaurant, transport et particularités conventionnelles.
- TVA, aides à la création, exonération ACRE, allocations chômage, indemnités journalières et prévoyance.
- Coût total employeur, négociation d'un tarif commercial équivalent et sociétés commerciales.
- Professions libérales réglementées, rattachements retraite particuliers, salariés publics, expatriation et territoires dotés de règles distinctes.
- Liquidation de la pension totale future, prise en compte des autres années de carrière, âge de départ, décote, surcote, réversion et rendement financier garanti.
