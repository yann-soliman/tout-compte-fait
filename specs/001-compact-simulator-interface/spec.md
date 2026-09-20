# Feature Specification: Compact Simulator Interface

**Feature Branch**: `feat/rebuild-static-app`

**Created**: 2026-09-20

**Status**: Ready for planning

**Input**: User description: "Replace the Lovable prototype with a compact income comparison
interface. Make the required inputs and final results understandable at first glance, place the
result after the input sequence, provide concise information bubbles, and retain a projection view
with cumulative curves and composition charts. Do not establish definitive business rules yet."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Complete a compact comparison (Priority: P1)

A person enters common profile information, micro-enterprise values, salaried values and retirement
settings in a short sequence, then reaches a clearly separated comparison result at the bottom.

**Why this priority**: The primary value is understanding what to enter and seeing the comparison
without navigating several screens or reading explanatory paragraphs.

**Independent Test**: Open the simulator at desktop and mobile widths, fill every numbered section,
and verify that the final comparison follows the last input section.

**Acceptance Scenarios**:

1. **Given** the simulator is opened, **When** the page is scanned from top to bottom, **Then** the
   common profile, both status inputs, retirement inputs and final result appear in that order.
2. **Given** a value is changed, **When** the field loses focus or the value is confirmed, **Then**
   all visible result figures update without reloading the page.
3. **Given** the page is viewed on a phone, **When** every section is completed, **Then** no horizontal
   scrolling is required and the result remains readable.

---

### User Story 2 - Inspect only useful detail (Priority: P2)

A person sees concise labels and figures by default and can reveal definitions only where a field or
result needs clarification.

**Why this priority**: Optional detail keeps the interface compact without making unfamiliar values
ambiguous.

**Independent Test**: Navigate the page using mouse and keyboard, activate each information control,
and verify that its explanation can be opened and dismissed without changing a value.

**Acceptance Scenarios**:

1. **Given** a label needs explanation, **When** its information control is activated, **Then** a
   short definition is displayed next to the relevant context.
2. **Given** no explanation is open, **When** the result area is viewed, **Then** it contains figures,
   comparison labels and units without interpretive recommendation text.
3. **Given** annual values are displayed, **When** monthly display is selected, **Then** all eligible
   figures use the monthly period consistently.

---

### User Story 3 - Explore projections (Priority: P3)

A person switches to a projection view, chooses a duration, and compares cumulative values and the
composition of each status over time.

**Why this priority**: Projections extend the comparison beyond one year while remaining independent
from the data-entry journey.

**Independent Test**: Open projections, change the duration, and verify that the cumulative series
and both composition views update while the entered scenario is retained.

**Acceptance Scenarios**:

1. **Given** a completed comparison, **When** projections are opened, **Then** the existing scenario
   is reused without re-entry.
2. **Given** a projection duration is changed, **When** the selection is confirmed, **Then** the chart,
   cumulative totals and composition figures show the same period.
3. **Given** a chart cannot be interpreted visually, **When** its accessible description or legend is
   read, **Then** every series, category and value remains identifiable.

### Edge Cases

- Empty fields retain a usable default or show a local validation message without breaking results.
- Negative monetary values and percentages outside their permitted range are rejected.
- Large but valid monetary values remain readable without overflowing their containers.
- A zero-day or zero-income scenario displays zero values rather than invalid numbers.
- Switching between monthly and annual display does not alter the underlying scenario.
- Switching between simulator and projections preserves entered values.
- Narrow screens stack related fields without changing the logical order.
- Keyboard focus remains visible on tabs, segmented controls, fields and information controls.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The product MUST present one compact page with a header, primary view switcher,
  numbered input sections and a final result section.
- **FR-002**: The product MUST order the simulator sections as common profile, micro-enterprise,
  salaried employment, retirement and results.
- **FR-003**: The common profile MUST include the reference year and display period.
- **FR-004**: Status-specific inputs MUST appear side by side when space permits and in the same
  logical order when stacked.
- **FR-005**: Selection controls MUST use compact choices when the available values form a short,
  fixed list; long full-width selectors MUST not be the default.
- **FR-006**: Fields requiring explanation MUST provide an adjacent information control accessible by
  pointer and keyboard.
- **FR-007**: Result figures MUST update locally when scenario inputs change.
- **FR-008**: The result section MUST appear after all input sections and MUST be visually distinct
  from them.
- **FR-009**: The result section MUST compare net income, total value, worked days, value per worked
  day and retirement contribution indicators for both statuses.
- **FR-010**: Results MUST use figures and neutral labels without recommendations, conversational
  phrasing or claims that one status is universally better.
- **FR-011**: The display period control MUST switch eligible figures between annual and monthly
  representations without modifying stored annual inputs.
- **FR-012**: A projections view MUST reuse the current simulator scenario and allow selection of a
  multi-year duration.
- **FR-013**: The projections view MUST show cumulative values over time and a composition breakdown
  for each status.
- **FR-014**: Every chart MUST provide a legend and an equivalent textual identification of values.
- **FR-015**: Demonstration calculations MUST be visibly identified as provisional until the sourced
  business-rule specification replaces them.
- **FR-016**: The application MUST work without an account, remote storage or submission of entered
  financial values.
- **FR-017**: The interface MUST remain operable and readable from 360-pixel-wide screens upward.

### Key Entities

- **Comparison Scenario**: The complete set of common, micro-enterprise, salaried and retirement
  inputs for one comparison and one reference year.
- **Status Result**: The comparable annual and monthly figures produced for one employment status.
- **Projection**: A duration and ordered series of cumulative results derived from the current
  comparison scenario.
- **Result Composition**: Named value categories that together explain a status result.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A first-time user can identify where to start, the two compared statuses and the final
  result in under 10 seconds without opening help text.
- **SC-002**: A complete default comparison can be reviewed without navigating away from the page or
  opening more than two primary views.
- **SC-003**: All primary tasks can be completed at 360, 768 and 1280 pixel viewport widths without
  horizontal scrolling.
- **SC-004**: Every interactive control is reachable and operable using only a keyboard.
- **SC-005**: Changing any numeric input updates visible figures in under 100 milliseconds on a
  typical current mobile device.
- **SC-006**: The production page becomes usable within 2 seconds on a typical broadband connection
  with a warm browser cache.
- **SC-007**: The interface contains no unsolicited interpretive paragraph in input or result areas.

## Assumptions

- The first release compares one micro-enterprise scenario with one salaried scenario.
- The user supplies the authoritative business-rule specification separately; this feature uses
  clearly provisional demonstration figures only to validate interactions and layout.
- Entered values remain in the browser for the current session and are not sent to a remote service.
- Authentication, shared simulations, server persistence and downloadable reports are outside this
  feature.
- The reference language is French and monetary values use euros.
