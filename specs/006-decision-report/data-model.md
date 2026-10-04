# Data model

Threshold: state margin/effort/unreachable/unavailable; unit days/cents; optional amount and threshold; optional withinCeiling; reason. Nonnegative integer magnitudes; rate threshold cent minimal, days integer0..366; costs never negative.
Robustness: annual economic difference, three independent thresholds, warnings and theoretical flag. No retirement/multi-factor stress included.
ReportOffer: stable id, name, validated scenario, exact annual comparison result, robustness; source references deduplicated by canonical URL/effective date/title across results. Snapshot data derived, not mutated. Names rendered as React text, never HTML.
Report: current offer plus selected snapshot offers, metric netIncome/totalValue for chart only. Annual output independent of display period. Preview visibility ephemeral; no storage migration.
