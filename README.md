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
- Les paramètres 2026 de retraite complémentaire non vérifiés restent bloqués : aucune valeur
  provisoire n’est présentée comme établie.
- La retraite de base ne peut pas être transformée en pension autonome à partir de la seule année 2026. L’application ne simule ni carrière complète, ni âge de départ, décote, surcote ou réversion.
- La projection repose sur une hypothèse économique saisie ; elle ne prédit pas les futurs barèmes.

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
`specs/002-comparaison-statuts/`.

## Déploiement

Le workflow `deploy-pages.yml` compile le site et publie `dist/` sur GitHub Pages. Dans les paramètres
du dépôt, choisir **Settings → Pages → Source → GitHub Actions**.

L’application utilise automatiquement `/tout-compte-fait/` comme chemin de base pendant le build
GitHub Actions et `/` en développement local.
