# UI Contract: Compact Simulator Interface

## Primary views

`Simulateur` and `Projection` form one tab set. Exactly one tab is active. Activating a tab reveals
its panel without losing the comparison scenario.

## Simulator order

1. Situation commune
2. Revenus à comparer
3. Retraite
4. Résultat

The result panel is never displayed before an input section in document order.

## Field contract

Every numeric field has a persistent visible label, unit, input constraints and an accessible error
association. Information controls name their subject and do not replace the visible label.

## Result contract

The two statuses use stable colours across result cards, charts and legends. Each result provides:

- revenu net;
- valeur totale;
- jours travaillés;
- valeur par jour;
- cotisations retraite.

The result includes a visible `Estimation de démonstration` marker until a later specification makes
the calculation authoritative.

## Projection contract

The projection panel contains a duration control, a cumulative comparison, two composition views and
exact legends. Colour is never the only way to identify a series.

## Responsive contract

- At wide widths, the two statuses may use parallel columns.
- At narrow widths, sections stack in source order.
- No control or result creates horizontal page scrolling at 360 pixels.
- Touch targets for icon-only actions are at least 40 by 40 pixels.
