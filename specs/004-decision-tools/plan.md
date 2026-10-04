# Implementation Plan: Outils de décision

**Branch**: `feat/004-decision-tools` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

**Input**: Specification in `specs/004-decision-tools/spec.md`

## Summary

Extend the existing 2026 comparison with three pure-domain capabilities: solve the minimum
integer-cent micro daily rate against annual employee net/economic targets, calculate
deterministic annual stress cases, and manage validated named snapshots. Keep the existing
rules catalog and calculations intact. Compose the new tools below the existing inputs and
before their results as compact disclosures; persist snapshots only in browser-local storage
and expose import/export only through explicit user actions.

## Technical Context

- **Language/Version**: TypeScript, Node.js 24 (`.nvmrc`).
- **Primary Dependencies**: Existing React, Vite, Vitest and Playwright; no dependency changes.
- **Storage**: Browser `localStorage` for a version-1 snapshot envelope; no network or runtime service.
- **Testing**: Vitest domain boundaries, Testing Library UI flows, Playwright desktop/tablet/mobile
  journeys including axe and actual file download/import.
- **Target Platform**: Static GitHub Pages site, browser-only calculations.
- **Project Type**: Single React/TypeScript web client.
- **Performance Goals**: Balance-rate search bounded by binary search over a finite cent range;
  existing calculator interaction target remains 100 ms.
- **Constraints**: Money in integer cents; preserve all source-backed 2026 rules; keep retirement
  separate; no unsupported year fallback, runtime secrets, new network calls or URL sharing.
- **Scale/Scope**: At most 20 saved scenarios and 100 KiB per imported JSON file.

## Constitution Check

I. Source-backed calculations — PASS. The feature adds no legal rates or ceilings; it consumes
the existing dated 2026 catalog and exposes the reference year. The micro contribution,
training, turnover ceiling, payroll and CFE sources remain in `src/domain/rules/2026.ts`.

II. Pure domain core — PASS. Balance, stress and import-validation logic are pure TypeScript
modules with integer-cent arithmetic and boundary tests. The initial implementation's broad
feature RED gate is recorded separately from the review-correction regressions; follow-up
changes use target-specific failing cases before their smallest implementation fixes. React
only presents results and dispatches explicit user actions.

III. Compact numeric-first UX — PASS. Current fields remain first, optional decision panels
are collapsed, figures precede explanatory caveats, and all results follow inputs. Labels use
neutral French.

IV. Static-first architecture — PASS. No server, remote storage, account, runtime secret,
telemetry or new dependency is introduced.

V. Verification — GATE. Run existing format, lint, typecheck, unit, Playwright and production
build commands with Playwright worker count capped at two; document any unavailable browser
or unrelated failure rather than claim success.

**Post-design check**: PASS. The versioned local collection is isolated from current form
state until an explicit load, all imports are validated before one write, and all browser
downloads are user-triggered. No constitution exception or rule-engine change is required.

## Architecture and Data Flow

1. Validate the input scenario using existing `validateScenario` and dated 2026 catalog.
2. Balance solver computes an employee target from `calculateComparison`; binary-searches the
   micro rate in cents under the exact prorated ceiling; verifies candidate and previous cent.
   If no eligible rate reaches the target, it may compute a separately labeled indicative
   rate only within safe integer turnover limits; that value is never applicable or eligible.
3. Stress calculator clones only the micro inputs, clamps remaining days to zero, applies the
   decrease with explicit cent rounding, adds the extra economic cost once, and invokes the
   existing comparison engine. Retirement results never enter any target or value.
4. Scenario-library module parses a strict version-1 whitelist, validates every nested field
   and the domain scenario, then exposes immutable collection operations and CSV escaping.
5. Storage boundary reads/writes the envelope atomically. UI state updates only after a
   successful write; errors are visible. Corrupt persisted data does not silently overwrite
   itself; an explicit confirmed clear is required before saving a replacement.
6. App composes the disclosures before `Results`; saved data never initializes or overwrites
   the active scenario. Import replaces the collection, while loading one saved item is an
   explicit independent action.

## Project Structure

```text
src/
├── App.tsx
├── components/
│   └── DecisionTools.tsx
├── domain/
│   ├── balance.ts
│   ├── risk.ts
│   ├── scenario-library.ts
│   └── scenario-storage.ts
└── styles.css

tests/
├── unit/
│   ├── balance.test.ts
│   ├── risk.test.ts
│   ├── scenario-library.test.ts
│   ├── scenario-storage.test.ts
│   └── DecisionTools.test.tsx
└── e2e/
    └── decision-tools.spec.ts

specs/004-decision-tools/
├── checklists/requirements.md
├── contracts/ui-contract.md
├── data-model.md
├── analysis-results.md
├── convergence-results.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
├── tasks.md
└── tdd-results.md
```

## Key Decisions

- Use the existing 2026 calculator for each candidate instead of duplicating statutory
  deduction logic.
- Compute the exact maximum integer-cent rate that remains within the existing prorated
  turnover eligibility ceiling for the selected billed days. For higher targets, report no
  eligible rate and, only when safe integer limits permit, show a distinct out-of-ceiling
  indicative rate; never recommend or apply it.
- Compare annual amounts only. Existing monthly display does not alter solver or stress results.
- Accept valid hundredth-percent values despite binary floating-point representation using a
  bounded machine-epsilon tolerance, then retain integer-basis-point BigInt stress arithmetic.
  Reject additional-expense euro input that is not an exact cent amount within that tolerance.
- Treat confirmed CFE exemption with an omitted amount as known zero consistently in the engine;
  preserve uncertainty for non-exempt omitted or zero amounts. Do not alter statutory formulas.
- Keep balance rates and stressed rates visibly cent-precise, mark day scenarios low/central/high,
  and state that under-ceiling turnover is not eligibility confirmation without N-1/N-2 history.
- Carry current/stressed calculation confidence and warnings through the stress result. Keep
  strict exact-round-trip savedAt validation and regression-test both accepted ISO variants and
  impossible normalized dates.
- Use a fixed, versioned JSON envelope with exact allowed keys, maximum 20 scenarios, 100 KiB
  imports, unique ID rejection and complete validation before storage replacement.
- Keep storage errors and corruption explicit. Failed writes/imports do not change in-memory
  or persisted state; an explicit user-confirmed clear is the recovery path for corrupt data.
- Render names only as text; CSV protects leading formula characters after leading whitespace
  and quotes/escapes all string cells.
- Preserve the existing `rules2026` object, `calculateComparison`, retirement formulas and
  official references without edits.

## Complexity Tracking

No constitution violations. The extra storage and validation boundary is necessary for
explicitly requested offline scenario retention and hostile-file import, and is limited to
one client-side module pair without dependencies or server architecture.
