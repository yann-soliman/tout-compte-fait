# Implementation Plan: Robustesse, offres et rapport

**Branch**: feat/006-decision-report | **Date**: 2026-10-04 | **Spec**: [spec](spec.md)

## Summary

Pure threshold adapter, numeric-first robustness cards, common-scale selected-offer chart and annual print preview using browser PDF support. Defaults updated independently of saved snapshots.

## Technical Context

React/TypeScript/Vite, Node24, Vitest/Playwright, local existing storage schema. No new dependencies/backend. Reuse calculateComparison, calculateBalance and existing rule references. Days threshold binary search 0..366; rate solver reused; expense effect exact in cents. All factor changes independent, retirement disabled. Three compact cards have independent labelled progress indicators (not a cross-unit monetary scale). Offer bars share one signed monetary scale, stable IDs, net/economic metric selector. Report is an in-page labelled preview, with print CSS hiding application chrome; window.print only on explicit request. Current plus selected snapshots computed live; no persistence changes.

## Constitution Check

Rates/sources untouched; calculations pure in cents; tests before each vertical slice; results after inputs; neutral French labels; static/offline; minimal dependencies; keyboard and real PDF validation. No architecture exceptions. Pre/post design compliant.

## Project Structure

src/domain/robustness.ts; src/domain/decision-report.ts; src/components/{Robustness,OfferComparison,DecisionReport}.tsx; src/components/DecisionTools.tsx; src/components/ResultVisuals.tsx; src/domain/defaults.ts; src/styles.css; tests/unit/{robustness,decision-report,DecisionReport,defaults}.test.ts[x]; tests/e2e/decision-report.spec.ts.

## Phases

Spec/clarify/design → tasks → vertical RED/GREEN defaults → days threshold → rate/expense/guards → robustness UI → selected offers → print preview → full sequential gates/screenshots/PDF → analysis/convergence → CI/publish.
