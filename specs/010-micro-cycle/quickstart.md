# Validation

Node 24 depuis tools/node-v24.20.0-linux-x64/bin. `npm test -- --maxWorkers=2 tests/unit/micro-cycle.test.ts tests/unit/projection.test.ts tests/unit/MicroCycleView.test.tsx` puis `npm run test:e2e -- --workers=2 tests/e2e/micro-cycle.spec.ts`. Portes complètes : format:check, lint, typecheck, npm test deux workers, E2E deux workers, build, git diff --check. Résultats par défaut affichent moyenne64815,60 avec détail70900/58731,20 ; projection sans croissance 5années=330162,40 et années100000/83600/100000/83600/100000. Pas de publication implicite dans « Fais le ».
