# Tout compte fait Constitution

## Core Principles

### I. Source-Backed Calculations

Every rate, threshold, ceiling, entitlement and formula MUST be linked to a dated,
authoritative source. Calculation results MUST expose the applicable reference year.
Unverified assumptions MUST be labelled and MUST NOT be presented as statutory results.

### II. Pure, Testable Domain Core

Income, contribution, tax, retirement and projection calculations MUST live in pure
TypeScript modules independent from React. Monetary values MUST use integer cents or an
equivalent exact representation. Each business rule MUST have unit tests covering normal
cases, boundaries and rounding behaviour before it is considered implemented.

### III. Compact, Numeric-First Experience

The simulator MUST present inputs in a clear top-to-bottom sequence and results at the end.
The interface MUST prioritise figures, labels and comparisons over explanatory prose.
Additional detail MUST remain optional through concise information controls. Text MUST use
the infinitive or neutral labels and MUST avoid conversational second-person wording.

### IV. Static-First Architecture

The MVP MUST build as static HTML, CSS and JavaScript suitable for GitHub Pages. Runtime
server dependencies, secrets, server-side rendering and databases require a documented
need and an explicit architecture amendment. Browser-only state and calculations are the
default.

### V. Verification Before Delivery

Every change MUST pass formatting, linting, type checking, unit tests and a production
build. User-facing changes MUST also be checked at mobile and desktop widths. Failing
quality gates MUST be fixed or explicitly documented before review.

## Technical Constraints

- Use React, TypeScript and Vite for the client application.
- Keep dependencies minimal and remove unused generated components.
- Use native accessible controls before adding a component library abstraction.
- Keep the application usable by keyboard and preserve visible focus indicators.
- Use Lucide icons only when they improve scanning or identify an action.
- Use Recharts for projections when charts materially improve comparison.
- Do not commit generated build output, credentials or local agent data.
- Deploy the production `dist` artifact through GitHub Actions to GitHub Pages.

## Spec-Driven Workflow

Every functional increment MUST begin with `$speckit-specify`. Ambiguities affecting the
result MUST be resolved with `$speckit-clarify` before planning. Use `$speckit-plan`, then
`$speckit-tasks`, and implement only the resulting approved scope with
`$speckit-implement`. Keep commits atomic: project infrastructure, application shell,
functional increments and deployment configuration remain independently reviewable.
Business rules supplied later MUST replace demonstration calculations through a dedicated
specification rather than silent edits.

## Governance

This constitution overrides conflicting project guidance. Amendments require a documented
rationale, an impact review and semantic versioning: MAJOR for incompatible governance
changes, MINOR for new or materially expanded rules, and PATCH for clarifications. Every
plan and pull request MUST confirm compliance with these principles. Complexity beyond the
static-first MVP MUST be justified in the relevant specification and approved before
implementation.

**Version**: 1.0.0 | **Ratified**: 2026-09-20 | **Last Amended**: 2026-09-20
