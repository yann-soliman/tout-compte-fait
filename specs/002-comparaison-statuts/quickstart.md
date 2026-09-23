# Quickstart: Validate the 2026 Status Comparison

## Prerequisites

- Node.js compatible with the repository toolchain.
- Dependencies installed with the committed lockfile.
- The 2026 regulatory catalogue populated only from decisions recorded in [research.md](research.md).

## Install and run

```bash
npm ci
npm run dev
```

Open the local address printed by the development command. Keep browser network access disabled while
changing inputs to confirm that calculation does not depend on a runtime service.

## Automated quality gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

All commands must pass before review. Do not accept snapshots or rounded display assertions as a
substitute for exact unit assertions on underlying cent values.

## Validation scenario 1: micro income and eligibility

1. Enter a positive daily rate and billed-day count and verify the displayed turnover equals their
   product.
2. Enter expenses, health insurance and CFE and verify each is deducted once from economic income,
   never from the micro-social base.
3. Exercise turnover one cent below, exactly at and one cent above the 2026 ceiling.
4. Verify every case warns that historical eligibility is not confirmed; the last case also reports
   the ceiling excess.
5. Enter a mid-year activity start date and repeat the three boundary cases against the prorated
   ceiling.

Expected: each regulatory line identifies 2026, its official source and its verification status.

## Validation scenario 2: salary categories and quotity

1. Run the same gross salary once as `Cadre` and once as `Non-cadre`.
2. Verify the exact band calculations and contribution breakdown against independently calculated
   fixtures.
3. Change the work ratio without changing gross salary.

Expected: category-sensitive rules change when applicable; the gross salary is not prorated a second
time, while worked-day indicators reflect the selected ratio.

## Validation scenario 3: retirement boundaries

For both statuses, use fixtures one cent below, exactly at and one cent above every qualifying-income,
quarter, ceiling, tranche and point boundary documented in [research.md](research.md).

Expected:

- no more than four base-retirement quarters are awarded for 2026;
- acquired points follow the applicable 2026 rules and legal rounding;
- the indicative annual pension covers only point-based rights earned in 2026;
- the base regime reports quarters and explicitly declines a standalone monetary value;
- retirement value never changes net income or economic-value differences.

## Validation scenario 4: invalid and incomplete data

Check negative values, non-numeric values, zero days, unknown CFE, zero CFE without exemption
confirmation, unsupported activity and absent regulatory rule.

Expected: invalid values identify their field; zero days produce an indeterminate per-day value;
unknown required data downgrades or blocks only the affected result; unsupported cases are visibly
outside scope.

## Validation scenario 5: display and projection

1. Record annual results, switch to monthly and verify monetary flows equal annual values divided by
   twelve at display precision.
2. Verify days, quarters and points remain annual.
3. Project over 5, 10 and 20 years with zero, positive and negative growth.

Expected: projection labels growth as an assumption and never presents repeated 2026 parameters as
future statutory rules.

## Responsive and accessibility review

Use the Playwright desktop, tablet and mobile projects. At 1280 px, 768 px and 360 px verify:

- input sections precede results;
- no numeric result or source detail is clipped;
- keyboard focus remains visible and follows document order;
- validation and confidence changes are announced and understandable without color;
- chart summaries expose the exact comparison without requiring the graphic.

## Execution record — 2026-09-23

The five scenarios above are covered by the unit and Playwright suites, including statutory
boundaries, annual/monthly reconciliation, invalid data, 360/768/1280 px overflow, keyboard source
disclosures, live notices, chart text equivalents and projection assumptions. The automated quality
gate and production build are recorded in `tasks.md`.

The moderated usability protocol below requires target participants and cannot be replaced by an
automated browser run. Its execution is therefore a delivery follow-up rather than a fabricated
result.

## Moderated usability protocol (10 target participants)

### Participants and setup

- Recruit ten adults who currently compare or have recently compared salaried employment with a
  liberal micro-enterprise; do not recruit project contributors.
- Use the production build at 1280 px or the participant's usual mobile device at least 360 px wide.
- Start each session from the simulator with defaults and do not explain the result vocabulary.
- Record only an anonymous identifier (`P01`–`P10`), device class, durations and pass/fail outcomes.

### Script and measures

1. Give a fixed input sheet and ask the participant to complete the comparison without assistance.
   Record completion time; success is a correct completed scenario within five minutes.
2. Ask which status leads on economic value and why. Record answer time; success is the correct
   status within three minutes.
3. Ask the participant to identify separately net income, benefits or costs, and retirement rights.
   Success requires all three to be distinguished without adding retirement to present income.
4. Ask where a regulatory figure comes from and whether every retirement figure is available.
   Success requires opening a source disclosure and identifying the blocked complementary result.

### Acceptance and reporting

- SC-004 passes when at least 9/10 participants complete step 1 within five minutes and correctly
  identify the leading status in step 2 within three minutes.
- SC-005 passes when at least 9/10 distinguish the three value categories in step 3.
- Record anonymized raw outcomes in `usability-results.md`, plus totals, failures and observations.
- Do not mark the execution task complete until ten genuine moderated sessions have occurred.
