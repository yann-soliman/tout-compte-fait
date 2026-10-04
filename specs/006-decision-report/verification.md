# Verification: decision-report

## Executed gates

Sequential final command: format:check, lint, typecheck, Vitest --maxWorkers=2, Playwright --workers=2, build, git diff --check. All exit 0. Vitest: 249 tests / 26 files. Playwright: 57 tests at 360/768/1280 px. No dependency, backend, rule-rate or storage-schema change.

## Functional evidence

- Defaults/reset: 500 €/day, 200 days, salary 50 000 €/year. Old imported 600/160/58 000 snapshot loads unchanged before and after reset. The initial illustrative turnover is above the 83 600 € ceiling; warnings remain visible.
- Independent Python integer half-up oracle: 2 160 cases (rates including 1 cent, days including 0, salaries, fees, CFE absence/zero/exemption, full/prorated ceiling). Ascending whole-day enumeration, cent-neighbor rate proof, expense equality and CFE/ceiling guard assertions agree. Employee target comes from the separately tested existing engine; this oracle independently validates the new micro thresholds, not the entire payroll model.
- Equality, zero-cost/zero-income, inability to cover deficit by fees, unknown CFE, zero days, prorated ceiling and safe-extreme daily rate have unit regressions. Day exploration capped before unsafe rate × days; valid indicators remain available.
- Selected comparisons retain signed values, common annual scale, separate net/economic metrics, modeled days and per-offer warnings. Duplicate names have stable IDs. A real 20-offer import yields 21 distinct current+saved identities; HTML-like names render as text, no injection, no library writes.
- Report remains annual in monthly display, includes only current + checked offers, refreshes after edits/reselection, lists hypotheses, results, robustness, warnings and dated sources. Portal modal uses inert root, initial/restored focus, Tab loop and Escape even after printing moves focus. Native printing is called only on explicit action.
- Axe audits pass both selected-offer screen and multi-offer modal. Responsive/no-overflow, keyboard, offline and original real-touch map tests pass. Mobile card crops, desktop offers and actual rendered PDF pages inspected.
- Three real A4 browser PDFs, each six pages for three offers: text extracted with pypdf confirms exact figures, dates, annual hypotheses, negative values and footer; no unselected offer or application controls; no footer-only page. Rendered pages checked using PDFium (tools outside repository).

## Test-first / review evidence

Initial defaults, whole-day threshold, rate threshold, expenses, CFE guard, unreachable fees, selected derivation, robustness UI, offers, report and application integration were exercised as failing slices before their implementations. Additional edge-case/20-offer/PDF checks exercise already-implemented behavior; no retrospective test-first claim. Actual accessibility failures (keyboard-scroll table, repeated modal landmarks), post-print Escape failure and safe-extreme day overflow were reproduced before corrections.

Built-in delegation unavailable due to unconfigured OpenRouter credentials. Independent review instead executed in a fresh, isolated Hermes one-shot process with explicit authenticated openai-codex provider, no rules/memory injection, no edits/configuration change and supplied code only. Initial reviewer raised a possible independently-rounded-deduction monotonicity issue. Exact integer enumeration over the full 500-cent period shows no decreases for actual 256000/2000 ppm half-up rules; the net increment per period is exactly 371 cents. Regression tests cover two complete periods. Reviewer re-evaluated this evidence, withdrew the finding and returned valid JSON PASS with empty security_concerns and logic_errors. The monotonic proof applies to these supported 2026 rates; changing the catalog requires revalidation. Review limited to supplied code, supplemented by parent-run gates/oracle and visual inspection.

## Spec Kit analysis / convergence

Prerequisite script resolves specs/006-decision-report; required artifacts present, extension hooks absent. Eight FRs and four buildable SCs mapped below. Three user stories and their nine acceptance scenarios checked against domain/UI/browser/PDF evidence. No uncovered requirement, ambiguity, duplicated artifact, constitution conflict, unmapped task or remaining implementation gap. Constitution I–V satisfied. Analyze is read-only; convergence appends nothing because no unbuilt work remains. No human panel requested or fabricated.

- FR-001: T003, T004, T005
- FR-002: T003, T004
- FR-003: T004, T005
- FR-004: T006, T007
- FR-005: T008, T009
- FR-006: T008, T009
- FR-007: T002, T010
- FR-008: T009, T010, T011
- SC-001: T003, T004, T011
- SC-002: T006, T008, T009, T010
- SC-003: T009, T010, T011
- SC-004: T002, T010

## Limits

Annual general-rule comparison before personal income tax, retirement excluded from these tools. Below ceiling does not confirm eligibility without historical turnover. No guarantee of future income or career pension. PDF generated by browser print rather than an embedded PDF library; actual dialog behavior may vary by browser/OS.
