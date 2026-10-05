# Verification — 009 Navigation

## Scope and status

Implementation on `feat/009-navigation`. Publication authorized by « Continue (et pousse sur main quand fini) »; PR/CI/merge/Pages and production verification follow the local gates below.
Four views and guided comparison; no business formula, statutory source or stored schema change.
AppView changes are UI-only; parseTaxSettings is relocated unchanged from the tax component.

## Real execution

- Full unit suite: **327 passed**, 31 files, two workers.
- Full Playwright suite: **81 passed**, 360/768/1280 px, two workers.
- Format/lint/typecheck/production build and git diff --check: PASS.
- Axe checks across all views, native disclosures, tax/EI/retirement/offer details and print dialog.
- Actual touch navigation and map interaction, first Exploration entry after offline transition,
  preserved tax/EI/input/stress/projection/selected-offer state and explicit load/reset semantics.
- Actual viewport width asserted, not expanded innerWidth; mobile/desktop screenshots inspected.
- Actual PDF generated from the report, text extracted; six pages rasterized outside Git and
  representative pages 1/5/6 inspected (annual units, negative offer, dated sources and pagination).
- Vite still warns that the minified main bundle exceeds 500 kB; build succeeds. Projection is
  eagerly imported so first offline entry cannot fail; mounting remains deferred until Exploration.

## Regression fixes and test discipline

Targeted missing-behavior failures preceded source changes for navigation/synthesis/state/clavier.
Additional end-to-end coverage is not claimed as test-first. This final pass observed and fixed:

- Sub-cent current TJM blocked overview and projection but still allowed stale save/report:
  targeted new unit test failed, scenarioError guards added, test then passed.
- Applying balance reset fiscal/EI hypotheses: new unit test failed, exploration callback now
  changes only scenario/current-input error, test then passed.
- First offline Exploration crashed through dynamic import: new browser test failed with import
  error, static import introduced, offline test then passed.
- Independent view headings caused Axe heading-order failures; parent section headings added,
  full browser suite then passed without disabling rules.

Legacy single-page ordering assertions were updated to the approved separated views. Monetary,
source, boundary, import/export, library capacity, print/focus and performance assertions remain.
No skipped test or increased timeout. Earlier worker timeouts were reproduced in a clean sequential
parent run without changing assertions: all unit tests passed. Incomplete worker E2E edits were
finished and checked by the parent, not accepted as success.

## Spec Kit analysis and convergence

check-prerequisites.sh --json --require-spec --require-tasks --include-tasks selected exactly
`specs/009-navigation`. No extension hooks file. Constitution reviewed: source-backed rules,
pure exact domain, inputs preceding guided results, optional numeric-first detail, local/static
architecture and all quality gates preserved. No new dependency or source/year change.

Coverage: 8 buildable requirements, each mapped to implementation/test tasks; no uncovered
requirement, unmapped task, unresolved ambiguity or critical inconsistency. Mapping:

- FR-001: T002
- FR-002: T002, T004
- FR-003: T003
- FR-004: T003
- FR-005: T004
- FR-006: T005, T006
- FR-007: T006, T007
- FR-008: T001, T005, T008, T009

Convergence: implemented requirements verified against actual code/tests; no new work to append.
Independent review PASS: corrected complete-diff JSON parsed fail-closed, passed=true and empty
security_concerns/logic_errors. The initial truncated-diff rejection was resolved with full input.
The complete review then questioned invalid-TJM balance recovery: a third corrective context
added explicit replacement-hypothesis disclosure plus invariance/recovery tests. Supplied engine
code establishes that the replacement search/employee target is independent of retained TJM;
the corrected reviewer approved this explicit path. Saving/current results/stress/report remain
blocked until actual correction. No runtime execution is attributed to the independent reviewer.
One nonblocking suggestion remains: further direct engine-equivalence display tests beyond the
existing fixed fixtures, pure-domain tests and end-to-end cash assertions.

## Evidence

Execution logs and review input/output are outside the repository under the Hermes scratch
`tcf-009-*` paths. Browser artifacts under ignored `test-results/`. No production claim.
