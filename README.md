# Tout compte fait

Comparer en 2026 une activité libérale BNC non réglementée en micro-entreprise ou en EI au réel
avec un emploi salarié privé de droit commun, dans une interface compacte. La projection
économique reste limitée à la micro et au salariat.

## Navigation

Quatre vues séparent la saisie de la décision :

- **Hypothèses** : cadre commun, activité indépendante/salariat et fiscalité optionnelle ;
  paramètres retraite avancés repliés. « Voir la comparaison » ouvre les résultats.
- **Résultats** : synthèse des trois cash avant IR et, sur activation, après IR ; avantages
  salariés hors cash, hypothèses résumées, détails sociaux/fiscaux et retraite repliables.
- **Exploration** : équilibre, aléas, décomposition, carte TJM × jours, robustesse et projection
  pluriannuelle. Ces outils restent avant IR et micro/salariat uniquement.
- **Scénarios** : sauvegarde, comparaison d’offres, import/export et rapport annuel local.

Navigation libre, clavier/flèches/Home/End et tactile ; les vues cachées conservent les
saisies, fiscalité, confirmation CFE EI, réglages et sélections. Charger une offre revient aux
hypothèses et réinitialise fiscalité/CFE EI comme auparavant ; la remise à zéro ne supprime
pas la bibliothèque. Appliquer une hypothèse d’exploration ne remet pas la fiscalité à zéro.
Une saisie invalide bloque ses résultats/rapport/sauvegarde, sans substituer l’ancien exemple.
La projection est incluse dans le code initial pour rester disponible lors de sa première
ouverture hors ligne après chargement. Aucun calcul ni format d’export n’est modifié.
Spécification et validation : `specs/009-navigation/`.

## EI au réel

Le calcul EI à IR estime le disponible après frais professionnels, CFE, neuf postes sociaux
et mutuelle personnelle, avant impôt du foyer. CA et frais sont communs à la micro ; une
confirmation d’exonération CFE EI distincte est nécessaire si aucun montant positif n’est saisi.
Les déficits et cotisations minimales restent visibles. Les règles officielles publiées
`modele-ti` 0.1.0 servent de référence sans moteur ni dépendance ajoutée au navigateur.

Périmètre : France métropolitaine, BNC non réglementé hors Cipav, année pleine 2026, hors ACRE,
Madelin et situations particulières. Les montants sociaux sont arrondis à l’euro selon le modèle
et le cash conserve les centimes saisis : estimation non opposable, non décompte réglementaire.
La période mensuelle est une moyenne annuelle, pas un échéancier.

Carte TJM, seuils, projection, retraite, offres et rapport restent micro/salariat uniquement.
La confirmation CFE EI du calcul courant n’est pas sauvegardée et se réinitialise au chargement
ou à la remise à zéro. Les anciens instantanés schema 1 restent compatibles.
La spécification et les preuves de validation figurent dans `specs/007-ei-real/`.

## Disponible après impôt — projection

Une option désactivée par défaut compare le cash après IR du salariat, de la micro et de
l’EI au réel. Le foyer simple peut être célibataire ou marié/pacsé imposé en commun, avec
0 à 6 enfants à charge exclusive et d’autres revenus déjà nets imposables au barème.
Le net salarial imposable de paie peut remplacer l’estimation CSG/CRDS ; les bases
fiscales sont distinctes du cash et des avantages.

Projection des revenus **2026** au barème de référence **2026 sur revenus 2025**, pas impôt
définitif ni barème 2027 adopté. Le calcul comprend tranches, quotient familial plafonné,
décote et seuil de recouvrement. Seul l’IR supplémentaire de l’activité est soustrait :
impôt du foyer avec activité moins impôt du même foyer sans activité. Ni cash du conjoint,
ni avantages salariés, ni seconde soustraction du prélèvement à la source.

CFE inconnue, déficit EI non traité, plage numérique dépassée ou hauts revenus bloquent
le résultat concerné ; une erreur dans la conversion commune des bases peut bloquer
les trois projections fiscales sans toucher aux résultats avant IR. Hors parent isolé,
garde alternée, réductions/crédits, versement libératoire, PER, CEHR/CDHR et autres
situations particulières. Le mensuel reste une moyenne annuelle, pas la trésorerie fiscale.
Les paramètres fiscaux ne sont ni enregistrés dans les offres schema 1 ni exportés ;
chargement/reset les réinitialisent. Carte, seuils, projection économique, offres et rapport
restent avant IR. Sources et vérifications : `specs/008-income-tax/`.

## État du projet

L’application statique calcule localement les cotisations, le revenu net avant impôt, la valeur
économique, le temps travaillé et les droits retraite que les sources institutionnelles permettent
d’établir pour 2026. Chaque résultat réglementaire expose sa source, sa date et son statut.

### Limites réglementaires

- Le revenu salarié couvre les cotisations générales de France métropolitaine, hors régime local
  d’Alsace-Moselle, conventions collectives, prévoyance et variations individuelles de fiche de paie.
- L’éligibilité micro ne peut pas être confirmée sans les chiffres d’affaires 2024 et 2025.
- La CFE dépend de la commune et de la situation saisie.
- Les points complémentaires Agirc-Arrco et RCI sont estimés avec les paramètres 2026 officiels.
  Le modèle annuel suppose les cotisations réglées, sans reproduire les déclarations périodiques,
  plafonds personnels proratisés et arrondis de caisse. Les points sont affichés au centième et
  l'indication annuelle au centime, calculée avant arrondi des points. Ce sont des conventions
  de présentation, pas des garanties de droits attribués. Un paramètre absent/provisoire bloque
  seulement le régime complémentaire concerné.
- Les valeurs de service de référence (Agirc-Arrco depuis le 1er novembre 2025, RCI au
  1er janvier 2026) ne garantissent pas la valeur future à la liquidation.
- La retraite de base ne peut pas être transformée en pension autonome à partir de la seule année 2026. L’application ne simule ni carrière complète, ni âge de départ, décote, surcote ou réversion.
- La projection repose sur une hypothèse économique saisie ; elle ne prédit pas les futurs barèmes.

## Visuels de résultats

Deux décompositions à échelle monétaire commune montrent le passage du chiffre d’affaires ou
du salaire brut à la valeur économique, avec prélèvements, frais ou avantages séparés. Les
déficits restent visibles; les montants suivent le sélecteur annuel/mensuel.

Une carte annuelle TJM × jours facturés compare la valeur économique au salariat. Les couleurs
et la ligne d’équilibre sont indicatives entre points échantillonnés; une hypothèse sélectionnée
est recalculée exactement, au centime. Les hachures signalent les zones hors plafond proratisé.
Des commandes clavier/tactiles permettent l’exploration; une action explicite applique le TJM
et les jours ensemble. Zéro jour, CFE inconnue et dépassement du plafond bloquent l’application.
Le respect du plafond ne confirme pas l’éligibilité sans historique. Aucun impôt ni revenu
de retraite n’est ajouté à cette comparaison.

## Outils de décision

Dans Exploration et Scénarios, trois volets repliables proposent le taux journalier minimum
pour rejoindre le revenu net salarié annuel avant impôt ou sa valeur économique (avantages
inclus), une sensibilité hypothétique aux jours perdus/baisse de taux/frais supplémentaires,
et une bibliothèque de scénarios nommés conservée dans le stockage local du navigateur. Le taux
est calculé au centime par le moteur 2026 existant; le plafond de première année utilise le
prorata actuel et le résultat précise que l'éligibilité micro reste à confirmer à partir des
chiffres d'affaires antérieurs. Un taux hors plafond n'est ni recommandé ni applicable.

Les instantanés complets se chargent uniquement après action explicite. Import JSON versionné
est validé intégralement avant remplacement; export JSON/CSV est déclenché manuellement.
Comparaisons et téléchargements sont locaux, avant impôt et hors retraite. Les hypothèses de
jours ne sont pas des prévisions, et ni mission, emploi ni indemnisation chômage ne sont
garantis. La remise à zéro des entrées ne supprime pas les scénarios enregistrés.

Une projection après IR optionnelle et séparée est décrite ci-dessus ; les outils de décision
ne l’utilisent pas. La fiscalité définitive des revenus 2026 et les règles SASU/EURL restent
hors périmètre. Aucun futur barème fictif n’est appliqué.

## Robustesse, offres et rapport

Les trois marges indiquent séparément les jours perdables, la baisse de TJM possible et les
frais professionnels supplémentaires absorbables avant de rejoindre la valeur économique
du salariat. Une micro derrière affiche l’effort nécessaire ou l’impossibilité par ce facteur
seul. Les seuils annuels sont recalculés exactement; ils ne s’additionnent pas. CFE inconnue,
plafond et absence d’historique restent explicités.

Cocher des scénarios enregistrés affiche une comparaison visuelle avec le scénario courant,
sur une échelle annuelle commune et signée, en revenu net ou valeur économique. Les
instantanés restent inchangés. Prévisualiser le rapport puis choisir « Imprimer / Enregistrer
en PDF » conserve hypothèses, résultats, seuils, limites et sources datées, sans envoyer les
données. Le rapport reste annuel même si le simulateur affiche des montants mensuels.

L’exemple initial et la réinitialisation utilisent 500 €/jour, 200 jours et 50 000 € brut/an.
Le chiffre d’affaires de cet exemple dépasse le plafond micro 2026: l’avertissement est
conservé et ne constitue pas une recommandation d’éligibilité. Les sauvegardes antérieures
conservent leurs propres valeurs.

## Développer

Prérequis : Node.js 24 et npm.

```bash
npm ci
npm run dev
```

## Vérifier

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Spec Kit

Le projet contient Spec Kit dans `.specify/` et les compétences Codex dans `.agents/skills/`.
Le flux retenu est :

```text
$speckit-specify
$speckit-clarify
$speckit-plan
$speckit-tasks
$speckit-implement
```

Les spécifications se trouvent dans `specs/`, notamment la comparaison 2026 dans
`specs/002-comparaison-statuts/`. La finalisation complémentaire et ses conventions figurent
dans `specs/003-retraite-complementaire/`. Les outils de décision et leurs contrats sont documentés
dans `specs/004-decision-tools/`. Les visuels figurent dans `specs/005-result-visuals/`.
La robustesse, les offres et le rapport figurent dans `specs/006-decision-report/`.

## Déploiement

Le workflow `deploy-pages.yml` compile le site et publie `dist/` sur GitHub Pages. Dans les paramètres
du dépôt, choisir **Settings → Pages → Source → GitHub Actions**.

L’application utilise automatiquement `/tout-compte-fait/` comme chemin de base pendant le build
GitHub Actions et `/` en développement local.
