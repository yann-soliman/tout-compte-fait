# Implementation Plan: Comparaison des statuts

**Branch**: `work` | **Date**: 2026-09-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-comparaison-statuts/spec.md`

## Summary

Replace the demonstration percentages with sourced 2026 rules for a non-regulated BNC
micro-entrepreneur and a French private employee. Model money and statutory parameters explicitly,
calculate each status in pure domain functions, preserve the compact input-first interface, and show
net income, economic value, time, eligibility warnings, and retirement rights with source metadata.

## Technical Context

**Language/Version**: TypeScript 6.0, React 19, ECMAScript 2022

**Primary Dependencies**: Existing React, Vite, Lucide React and Recharts dependencies; no new runtime dependency planned

**Storage**: In-memory browser state and versioned static 2026 rule data; no persistence

**Testing**: Vitest 5, Testing Library, Playwright 1.63 and axe-core

**Target Platform**: Current evergreen desktop and mobile browsers; static GitHub Pages deployment

**Project Type**: Static single-page web application

**Performance Goals**: Recalculate and present a valid scenario within 100 ms after an input change; retain warm-cache usability within 2 seconds

**Constraints**: Exact integer-cent monetary representation; deterministic browser-only calculations; no runtime network calls, server, database or secrets; 360 px minimum viewport; every statutory output exposes 2026 and its official source/status

**Scale/Scope**: One 2026 scenario, two compared statuses, up to 17 business requirements, one projection view, and a bounded catalogue of versioned regulatory rules

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Source-backed calculations**: PASS. `research.md` records the authority and effective year for
  each adopted rule; the rule catalogue carries source and verification metadata, and unconfirmed
  parameters cannot produce an established result.
- **Pure, testable domain core**: PASS. Money, thresholds, contribution bands, retirement rights and
  projections remain pure TypeScript functions outside React. Unit tests cover below/at/above every
  statutory boundary and rounding point.
- **Compact, numeric-first experience**: PASS. Inputs remain in top-to-bottom sections and results
  remain after inputs. Regulatory detail is available through concise disclosures.
- **Static-first architecture**: PASS. All rules ship as static, dated data and all computations run
  locally. No runtime service, secret, SSR or database is introduced.
- **Verification before delivery**: PASS by plan. Formatting, linting, type checking, unit tests,
  mobile/desktop end-to-end checks and production build remain required gates.

**Post-design review**: PASS WITH DELIVERY GATE. The data model keeps dated rules distinct from user
input, the UI contract keeps results after inputs, and the quickstart requires boundary,
accessibility and build checks. Institutional pages were unreachable during Phase 0, so no
provisional numeric lead may become an implementation constant until the source, effective date and
scope are directly verified and the regulatory checklist is completed. No constitutional exception
is granted.

## Project Structure

### Documentation (this feature)

```text
specs/002-comparaison-statuts/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── charts/
│   └── ui/
├── domain/
│   ├── rules/
│   │   └── 2026.ts
│   ├── calculate.ts
│   ├── defaults.ts
│   ├── eligibility.ts
│   ├── money.ts
│   ├── model.ts
│   ├── projection.ts
│   └── retirement.ts
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

**Structure Decision**: Extend the existing static client rather than create another application.
Keep dated rule data and all calculations under `src/domain/`; React components consume typed
results and never contain contribution, eligibility, rounding or retirement formulas. Keep Vitest
boundary tests in `tests/unit/` and user-flow/accessibility checks in `tests/e2e/`.

## Complexity Tracking

No constitution violations.
