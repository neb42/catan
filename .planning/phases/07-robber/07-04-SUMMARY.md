---
phase: 07-robber
plan: 04
subsystem: ui
tags: [zustand, mantine, react, robber, websocket]

# Dependency graph
requires:
  - phase: 07-01
    provides: Robber message schemas
  - phase: 07-02
    provides: GameManager robber state
  - phase: 07-03
    provides: Backend WebSocket handlers
provides:
  - Frontend robber state management in gameStore
  - WebSocket message handlers in Lobby.tsx
  - DiscardModal component for card discard UI
  - RobberPlacement overlay for hex selection
  - RobberFigure visual component
affects: [07-05, 07-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Combined useDiscardState hook for modal props
    - Blocking modal pattern (no close button)
    - SVG overlay for hex interaction

key-files:
  created:
    - apps/web/src/components/Robber/DiscardModal.tsx
    - apps/web/src/components/Robber/RobberPlacement.tsx
    - apps/web/src/components/Robber/RobberFigure.tsx
    - apps/web/src/components/Robber/index.ts
  modified:
    - apps/web/src/stores/gameStore.ts
    - apps/web/src/components/Lobby.tsx

key-decisions:
  - 'RobberSlice in gameStore for discard/placement/steal state'
  - 'Blocking modal pattern for DiscardModal'
  - 'SVG circle overlay for robber placement targets'

patterns-established:
  - 'useDiscardState combined hook for multi-property selection'
  - 'Blocking modal: opened=true, onClose=no-op'

# Metrics
duration: 2min
completed: 2026-01-30
---

# Phase 7 Plan 4: Frontend Robber State and UI Summary

**Robber state slice in gameStore with selector hooks, WebSocket handlers in Lobby.tsx, and three Robber UI components (DiscardModal, RobberPlacement, RobberFigure)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-30T16:00:41Z
- **Completed:** 2026-01-30T16:02:41Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Added complete RobberSlice to gameStore with discard, placement, and steal state
- Implemented all 8 robber message handlers in Lobby.tsx
- Created DiscardModal with blocking card selection UI
- Created RobberPlacement SVG overlay for hex clicking
- Created RobberFigure dark silhouette visual

## Task Commits

Each task was committed atomically:

1. **Task 1: Add robber state slice to gameStore** - `6af0fb0` (feat)
2. **Task 2: Add robber message handlers to Lobby.tsx** - `2589aa5` (feat)
3. **Task 3: Create Robber UI components** - `0c6d3e0` (feat)

## Files Created/Modified

- `apps/web/src/stores/gameStore.ts` - RobberSlice interface, state, actions, selector hooks
- `apps/web/src/components/Lobby.tsx` - 8 robber message handlers
- `apps/web/src/components/Robber/DiscardModal.tsx` - Blocking modal for card discard
- `apps/web/src/components/Robber/RobberPlacement.tsx` - SVG overlay for hex selection
- `apps/web/src/components/Robber/RobberFigure.tsx` - Dark silhouette visual
- `apps/web/src/components/Robber/index.ts` - Component exports

## Decisions Made

- Used combined useDiscardState hook to prevent re-render anti-patterns
- Blocking modal pattern (no close button) forces player to complete discard
- SVG circle overlay for robber placement targets with red stroke
- RobberFigure uses simple dark silhouette (ellipse body + circle head)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Frontend robber state ready for 07-05 (StealModal component)
- Board.tsx needs to integrate RobberFigure and RobberPlacement in 07-07
- All components compile and export correctly

---

_Phase: 07-robber_
_Completed: 2026-01-30_
