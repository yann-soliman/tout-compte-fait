# Implementation Plan: Visuels de résultats

**Branch**: feat/005-result-visuals | **Date**: 2026-10-04 | **Spec**: [spec](spec.md)

## Summary

Signed common-scale money waterfalls and interactive annual opportunity map, integrated before numeric result detail. No monetary/statutory algorithm replacement.

## Technical Context

React/TypeScript/Vite, Node24; inline SVG and CSS using existing fonts/tokens (Stripe-inspired dense financial data, generous chrome). No remote fonts or new dependencies. Pure adapter in src/domain/result-visuals.ts, ResultVisuals.tsx, MoneyFlowChart.tsx and OpportunityMap.tsx. Existing calculateComparison/assessMicroEligibility/calculateBalance reused; retirement disabled for map computation. Bounded 13×13 sampled grid with adaptive extents, exact detail recalculation. Native range/number controls provide accessible alternatives to pointer selection. No new persisted schema.

## Constitution Check

Source-backed rates untouched; pure cent-based adapters, tests before implementation; results after inputs, French neutral labels; static/offline; full quality gates and visual screenshots. No violations, no complexity exception. Verified pre/post design.

## Project Structure

src/domain/result-visuals.ts; src/components/{ResultVisuals,MoneyFlowChart,OpportunityMap}.tsx; src/components/Results.tsx; src/App.tsx; src/styles.css; tests/unit/result-visuals.test.ts and ResultVisuals.test.tsx; tests/e2e/result-visuals.spec.ts.

## Phases

Vertical slices: financial adapter then waterfall UI; hypothesis calculation then map grid then interactive UI; integration and polish; accessibility/performance/full gates; parent code review, separate empirical oracle and convergence. Independent-agent review was attempted but unavailable (delegation provider unconfigured; no installed Codex CLI); no independent review claimed. Setup reuses installed stack. No hooks configured.
