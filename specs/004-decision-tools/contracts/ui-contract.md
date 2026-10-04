# UI Contract: Outils de décision

## Order and visibility

1. Preserve all existing input sections first.
2. Place decision tools after the last input section and before the existing comparison result.
3. Present the balance calculator, stress calculator and saved scenarios as separate native
   disclosures, collapsed on initial load.
4. Keep current scenario edits in memory. Reading or reloading the saved library never loads
   a snapshot into current inputs automatically.
5. Keep the result numeric-first. Put compact assumptions, limitations, error messages and
   source/year context adjacent to the values they qualify.

## Balance panel

- Select employee annual net before income tax or annual economic value (net plus declared
  annual benefits).
- Recalculate results automatically when inputs or target change; do not show an inert calculate
  button. Announce updated balance results through a polite live region.
- Show current billed-days calculation and separate low/central/high 120/160/200-day hypotheses.
- Show annual target, eligible maximum, minimum daily rate to exact euro-cent display precision,
  projected annual turnover
  and an explicit eligible/unreachable/blocked state.
- Provide an “Appliquer ce taux” native button only for a reachable row. Applying changes only
  the current micro daily rate.
- State visibly that tax is not modeled, values exclude retirement and alternatives are
  hypotheses. Clarify that turnover below the ceiling does not establish eligibility without
  reviewing turnover in years N-1 and N-2.

## Stress panel

- Offer native preset buttons and editable labeled custom fields for days lost, rate decrease
  and extra annual costs.
- Reject euro expense values with more than cent precision visibly; accept valid cent amounts.
- Show current and stressed annual micro net/economic values and annual differences from the
  employee, preserving each calculation's confidence and warnings (including unknown CFE and
  ceiling excess); show the stressed daily rate to exact euro-cent precision and explain clamping
  at zero.
- State visibly that neither work nor unemployment protection is guaranteed and retirement is
  excluded.
- Invalid values display a local actionable error.

## Scenario library panel

- Save a complete current scenario with a required trimmed name (1–80 characters); disable
  additional saves at 20 entries and explain capacity.
- List saved names as text and expose separate native load, delete and compare selection
  controls. Loading changes current scenario only after its explicit button is activated.
- Comparison includes current scenario and selected saved rows: reference year, annual net
  before income tax, annual economic value and worked days for both micro and employee statuses.
  Retirement is not a column.
- Explicit export controls download collection JSON or comparison CSV.
- JSON import uses a native file input and rejects files larger than 100 KiB before reading.
  Errors identify rejection; the previous collection remains visible and active.
- Delete-all and current-form reset require native confirmation; deleting the library does not
  reset the form and resetting the form does not delete saved scenarios.
- Storage corruption/quota failures remain visible; rendering names uses text content, not HTML.
- Privacy note: local browser storage only; no automatic network transfer or URL sharing.

## Accessibility and responsive behavior

- Use native `button`, `label`, `input`, `details`/`summary`, `table`, and status/error semantics.
- Every field has an associated visible label; buttons have descriptive French accessible names.
- Keyboard focus stays visible; disclosures and file controls work without a pointer.
- No horizontal document overflow at viewport widths 360, 768 or 1280 pixels.
- Status/error messages are announced through a polite live region where updates are dynamic.
