# UI Contract: Comparaison des statuts

## Page order

The simulator remains a single compact, numeric-first flow:

1. Common 2026 context.
2. Micro-enterprise inputs.
3. Employee inputs.
4. Retirement and projection options.
5. Validation and eligibility notices.
6. Comparison results.
7. Optional regulatory detail and projection.

Results never precede the inputs that determine them.

## Inputs

### Common context

- Reference year fixed and visibly labelled `2026`.
- Activity start date when the 2026 ceiling may require proration.
- Annual/monthly display selector; annual remains the calculation reference.

### Micro-enterprise

- Daily rate excluding tax and billed days, with derived turnover.
- Annual professional expenses, monthly health insurance and annual CFE.
- Explicit confirmation when a zero CFE relies on an exemption.
- Fixed visible scope: non-regulated liberal BNC.

### Employment

- Actual annual gross salary already corresponding to the selected work ratio.
- Required `Cadre` / `Non-cadre` choice.
- Work ratio, paid leave, RTT and annual benefits.
- Concise help text stating that work ratio is not applied to salary a second time.

### Retirement and projection

- Include/hide retirement rights.
- Projection horizon and annual growth assumption.
- An explicit label identifies growth as a non-regulatory assumption.

## Validation states

- Reject negative, non-numeric, unsafe or calendar-impossible input values next to the field.
- Do not replace invalid input silently with a boundary value.
- When billed or worked days are zero, show value per day as `Indéterminée`.
- Require either a CFE amount or confirmation of a zero/exempt amount; otherwise mark the economic
  result estimated.
- If a required 2026 rule is unavailable or not verified, label the affected result `Estimation` or
  block it; never label it established.

## Eligibility notice

- Within the 2026 ceiling: display `Éligibilité micro non confirmée — historique 2024–2025 non
renseigné`.
- Above the applicable 2026 ceiling: display the exceeded amount and retain the historical warning.
- For a partial year: display the prorated ceiling and the dates used.
- Never display `Éligible` because the feature does not collect prior-year turnover.

## Results

For both statuses, display in the following order:

1. Net income before income tax.
2. Detailed statutory contributions and entered costs/benefits.
3. Economic value total.
4. Worked days.
5. Value per worked day.
6. Retirement rights and indicative pension attributable to 2026 rights.
7. Difference between statuses.

Annual and monthly modes change display only. Monthly monetary flows equal annual values divided by
12 using the shared display-rounding rule. Counts of days, quarters and points remain annual.

## Retirement presentation

- Split base and complementary regimes.
- Display qualifying base, validated quarters and acquired points where applicable.
- Display an indicative annual pension only for additive point-based rights earned in 2026.
- For the base regime, display qualifying income and quarters with `Montant non calculable sur la seule année 2026`.
- Keep every pension estimate outside net income, economic value and their differences.
- Show a permanent concise warning that it is not the complete future pension.

## Regulatory traceability

Each statutory line exposes an optional detail containing:

- rule label and 2026 application year;
- exact base/rate/threshold or band used;
- official authority and document title;
- source link and verification date;
- status: `Connu`, `Provisoire` or `Estimatif`.

The visible result confidence is the least certain status among the rules and required inputs used.

## Accessibility and responsive behavior

- Preserve native labels, keyboard operation, focus visibility and semantic tab relationships.
- Notices are text, not color-only signals, and are announced when a result status changes.
- Tables or charts have adjacent textual summaries containing the same decision-relevant values.
- Preserve the complete input-before-result sequence at 360 px, 768 px and 1280 px widths.
