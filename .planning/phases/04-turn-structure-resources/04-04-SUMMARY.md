---
phase: 04-turn-structure-resources
plan: 04
subsystem: ui
tags: [react, zustand, motion, mantine, turn-controls, resource-cards]

# Dependency graph
requires:
  - phase: 04-turn-structure-resources
    plan: 02
    provides: Turn state slice in gameStore with hooks (useCanEndTurn, useTurnNumber, useTurnCurrentPlayer)
provides:
  - TurnControls component with End Turn button and turn counter
  - ResourceHand component with fanned card display
  - Current player highlighting in GamePlayerList
affects: [04-05-integration, 05-building, 06-trading]

# Tech tracking
tech-stack:
  added: []
  patterns: [fanned-card-layout, motion-layout-animation]

key-files:
  created:
    - apps/web/src/components/TurnControls/TurnControls.tsx
    - apps/web/src/components/ResourceHand/ResourceHand.tsx
  modified:
    - apps/web/src/components/GamePlayerList.tsx

key-decisions:
  - 'TurnControls hidden during placement phase (turnPhase === null)'
  - 'ResourceHand uses fan layout with overlapping cards via negative margins'
  - 'GamePlayerList uses turnCurrentPlayerId for main game, falls back to placementPlayerId'

patterns-established:
  - 'Fanned card layout: negative margins + rotation transform based on card index'
  - 'Conditional UI: null turnPhase hides main game phase components'

# Metrics
duration: 3min
completed: 2026-01-29
---

# Phase 04 Plan 04: Turn Controls, Resource Hand, Player Highlighting Summary

**TurnControls component with End Turn button and turn counter, ResourceHand with fanned card display, and current player highlighting in GamePlayerList**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-29T13:08:00Z
- **Completed:** 2026-01-29T13:11:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- TurnControls component with turn counter, "It's your turn!" banner, and End Turn button
- ResourceHand component displays player's resources as fanned, overlapping cards with hover effects
- GamePlayerList now highlights current player for both placement and main game phases

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TurnControls component** - `c3877f0` (feat)
2. **Task 2: Create ResourceHand component** - `22ff9c6` (feat)
3. **Task 3: Add current player highlighting to GamePlayerList** - `17ca716` (feat)

## Files Created/Modified

- `apps/web/src/components/TurnControls/TurnControls.tsx` - End Turn button, turn counter, "It's your turn!" banner with glow animation
- `apps/web/src/components/ResourceHand/ResourceHand.tsx` - Fanned resource card hand with hover lift effect, empty state handling
- `apps/web/src/components/GamePlayerList.tsx` - Added useTurnCurrentPlayer hook integration for main game phase highlighting

## Decisions Made

- **TurnControls visibility**: Component returns null when turnPhase is null (during placement), appearing only during main game
- **Fan layout algorithm**: Cards overlap with negative left margin (-25px), rotation based on distance from center (4deg per card), parabolic y-offset
- **Dual-phase highlighting**: GamePlayerList derives activePlayerId from turnCurrentPlayerId || placementPlayerId to support both phases seamlessly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - plan executed smoothly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- TurnControls ready for integration into Game component layout
- ResourceHand ready for integration at bottom of game screen
- All components use established gameStore hooks
- Ready for Plan 04-05: Integration and end-to-end verification

---

_Phase: 04-turn-structure-resources_
_Plan: 04_
_Completed: 2026-01-29_
