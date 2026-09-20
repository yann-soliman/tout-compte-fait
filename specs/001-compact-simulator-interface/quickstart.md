# Quickstart: Validate the Compact Simulator

## Prerequisites

- Current Node.js LTS
- npm

## Install and run

```bash
npm ci
npm run dev
```

Open the local address shown by Vite.

## Quality gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Manual acceptance path

1. Open the simulator at 1280 pixels wide.
2. Confirm the four sections follow the order in [UI contract](contracts/ui-contract.md).
3. Change the daily rate and confirm result figures update immediately.
4. Switch annual/monthly and confirm the underlying annual field values do not change.
5. Open each information control using keyboard only, then dismiss it with Escape.
6. Open Projection, change the duration and confirm curves, totals and composition legends update.
7. Repeat the journey at 360 and 768 pixels and confirm there is no horizontal page scrolling.
8. Confirm the demonstration marker remains visible wherever provisional results are shown.

## Production preview

```bash
npm run build
npm run preview
```

Open the preview URL with the `/tout-compte-fait/` base path and verify that all assets load.
