# Implementation Plan: Compact Simulator Interface

**Branch**: `feat/rebuild-static-app` | **Date**: 2026-09-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-compact-simulator-interface/spec.md`

## Summary

Replace the generated Lovable/TanStack Start prototype with a small static client application.
Build a top-to-bottom simulator with compact controls and a result section at the end, plus a
projection view using the same local scenario. Keep provisional calculations isolated behind a
domain adapter so that the later sourced business specification can replace them without changing
the interface.

## Technical Context

**Language/Version**: TypeScript 7, React 19, modern ECMAScript

**Primary Dependencies**: Vite 8, React, Lucide React, Recharts

**Storage**: In-memory browser state only

**Testing**: Vitest, Testing Library, Playwright, axe-core

**Target Platform**: Current evergreen desktop and mobile browsers; GitHub Pages

**Project Type**: Static single-page web application

**Performance Goals**: Input-to-result update below 100 ms; warm-cache usability below 2 seconds

**Constraints**: No runtime server, no secrets, no remote data submission, 360 px minimum width

**Scale/Scope**: One simulator, one projection view, four input groups, two compared statuses

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Source-backed calculations**: PASS for this scope. Demo formulas are explicitly provisional and
  isolated; statutory claims are excluded.
- **Pure domain core**: PASS. Scenario calculation and projection functions remain independent from
  components and have unit tests.
- **Compact numeric-first UX**: PASS. Inputs follow numbered sections and results remain last.
- **Static-first architecture**: PASS. Vite emits static assets and no server runtime is included.
- **Verification before delivery**: PASS. CI runs format, lint, type-check, unit, accessibility,
  end-to-end smoke and build checks.

Post-design review: PASS. The data model, UI contract and validation guide preserve every gate.

## Project Structure

### Documentation (this feature)

```text
specs/001-compact-simulator-interface/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── charts/
│   └── ui/
├── domain/
│   ├── calculate.ts
│   ├── defaults.ts
│   ├── model.ts
│   └── projection.ts
├── App.tsx
├── main.tsx
└── styles.css

tests/
├── e2e/
└── unit/

.github/workflows/
├── deploy-pages.yml
└── quality.yml
```

**Structure Decision**: Use one static client package. Domain files own scenario data and pure
calculations; components own presentation only. Keep small reusable controls local rather than
bringing across the generated component catalogue.

## Complexity Tracking

No constitution violations.
