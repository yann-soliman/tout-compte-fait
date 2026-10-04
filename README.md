# Tout compte fait

Comparer en 2026 une activité libérale BNC non réglementée en micro-entreprise avec un emploi
salarié privé de droit commun, dans une interface compacte, puis projeter leur valeur économique.

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

Après les entrées du simulateur, trois volets repliables proposent le taux journalier minimum
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

L'impôt sur le revenu, une comparaison après impôt et les règles de SASU/EURL restent différés
tant que des règles 2026 officielles et validées ne sont pas intégrées. Aucun modèle fiscal
fictif n'est appliqué.

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
