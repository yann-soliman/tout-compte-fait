# Tout compte fait

Comparer une activité en micro-entreprise avec un emploi salarié dans une interface compacte, puis
projeter les résultats sur plusieurs années.

## État du projet

Cette branche remplace le prototype Lovable par une application statique indépendante. Les calculs
actuels servent uniquement à valider l’interface : ils sont signalés comme démonstration et ne
constituent pas une simulation fiscale ou sociale fiable.

Les règles métier définitives feront l’objet d’une spécification Spec Kit séparée, documentée avec
des sources officielles et des tests de limites.

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

La première spécification se trouve dans `specs/001-compact-simulator-interface/`.

## Déploiement

Le workflow `deploy-pages.yml` compile le site et publie `dist/` sur GitHub Pages. Dans les paramètres
du dépôt, choisir **Settings → Pages → Source → GitHub Actions**.

L’application utilise automatiquement `/tout-compte-fait/` comme chemin de base pendant le build
GitHub Actions et `/` en développement local.
