# Quickstart — validation 007

Depuis le dépôt autorisé, utiliser Node 24 :

    export PATH=/home/hermes/keepcool-morphe/tools/node-v24.20.0-linux-x64/bin:$PATH
    node --version
    npm test -- tests/unit/ei.test.ts tests/unit/EiComparison.test.tsx --maxWorkers=2
    npm run test:e2e -- tests/e2e/ei.spec.ts --workers=2

Défauts inchangés : CA 100 000 €, frais 2 400 €, CFE 600 €, mutuelle 25 €/mois. Attendre 30 141 € de cotisations, 66 859 € net avant mutuelle et 66 559 € disponible. Mensuel : 5 547 € disponible (arrondi d’affichage seulement). Passer CA à zéro : déficit visible, cotisations minimales 1 255 €. Retirer CFE : EI bloqué ; exonération micro seule sans effet sur EI ; confirmation EI débloque en utilisant zéro CFE.

Contrôler sources, périodes, avantages hors cash, date micro sans prorata EI, clavier et axe à 360/768/1280 px. Couper le réseau après chargement, modifier TJM et vérifier le calcul. Ne modifier aucun ancien snapshot.

Portes complètes, séquentielles :

    npm run format:check && npm run lint && npm run typecheck && npm test -- --maxWorkers=2 && npm run test:e2e -- --workers=2 && npm run build && git diff --check

Le rapport final `verification.md` doit préciser les résultats réellement exécutés. Oracles et données téléchargées restent sous `/home/hermes/.hermes/cache/scratch/tcf-007-research`, hors dépôt. Pas de commit ni publication.
