# Research: Compact Simulator Interface

## Static application architecture

- **Decision**: Use a client-rendered single page and keep the Simulator/Projection choice in local
  state rather than introducing a URL router.
- **Rationale**: GitHub Pages serves static assets, the product has two closely related views, and
  eliminating routes avoids refresh fallback handling.
- **Alternatives considered**: TanStack Start adds a server-oriented runtime that is not needed;
  hash routing remains available when the product gains independently linkable pages.

## Styling and controls

- **Decision**: Use a project stylesheet with tokens, layout utilities and native accessible form
  controls. Use small local components for segmented controls, information popovers and cards.
- **Rationale**: The interface needs a distinctive compact layout, not a general-purpose component
  catalogue. Native controls reduce dependencies and accessibility risk.
- **Alternatives considered**: Retaining the full generated shadcn/Radix catalogue would preserve
  unused code; a utility CSS framework would add another build dependency for a small application.

## Charts

- **Decision**: Use Recharts for the cumulative line chart and composition donuts, with an adjacent
  value legend and accessible summary.
- **Rationale**: It integrates with React and handles responsive SVG charts while the textual summary
  preserves access to exact values.
- **Alternatives considered**: Hand-authored SVG reduces bundle size but increases interaction and
  accessibility work; a canvas chart weakens native semantics.

## Provisional calculations

- **Decision**: Keep demonstration formulas in one pure adapter and label every output as a visual
  prototype pending the sourced business specification.
- **Rationale**: Realistic changing values are necessary to validate interactions, but the interface
  must not imply legal or financial accuracy.
- **Alternatives considered**: Static figures would hide update and projection defects; implementing
  remembered rates now would bypass the planned business-rule specification.

## Deployment

- **Decision**: Build with the repository subpath as the asset base and deploy `dist` through the
  official GitHub Pages actions.
- **Rationale**: The project site will be served under `/tout-compte-fait/`; Actions keeps generated
  assets out of source history.
- **Alternatives considered**: A `gh-pages` branch stores build output; homelab hosting adds operations
  work with no MVP benefit.
