---
phase: 09-longest-road
plan: 03
subsystem: ui
tags: [zustand, react, websocket, mantine, motion]

# Dependency graph
requires:
  - phase: 09-02
    provides: longest_road_updated WebSocket message and backend integration
provides:
  - LongestRoadSlice state management in gameStore
  - Road length display in player list
  - Longest Road badge with animation
  - Toast notifications on award transfer
affects: [10-largest-army, 11-victory-points]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - LongestRoadSlice follows DevCardSlice/RobberSlice pattern
    - useShallow for Record state selectors

key-files:
  created: []
  modified:
    - apps/web/src/stores/gameStore.ts
    - apps/web/src/components/Lobby.tsx
    - apps/web/src/components/GamePlayerList.tsx

key-decisions:
  - 'Selector hooks pattern: useLongestRoadHolder and usePlayerRoadLengths for optimized re-renders'
  - 'Spring animation for badge appearance'

patterns-established:
  - 'Award badge pattern: conditional render with motion.div animation for VP awards'

# Metrics
duration: 3min
completed: 2026-01-31
---

# Phase 9 Plan 3: Frontend Longest Road UI Summary

**LongestRoadSlice added to gameStore with road lengths displayed in player list and animated badge for holder**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-31T22:14:39Z
- **Completed:** 2026-01-31T22:17:44Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Added LongestRoadSlice interface and state to gameStore
- Implemented longest_road_updated message handler with transfer notifications
- Display road lengths for all players in GamePlayerList
- Animated Longest Road badge appears on holder with 2 VP tooltip

## Task Commits

Each task was committed atomically:

1. **Task 1: Add LongestRoadSlice to gameStore** - `34eff5f` (feat)
2. **Task 2: Handle longest_road_updated message and show toast** - `8b557db` (feat)
3. **Task 3: Display road lengths and badge in GamePlayerList** - `1559ca7` (feat)

## Files Created/Modified

- `apps/web/src/stores/gameStore.ts` - Added LongestRoadSlice, setLongestRoadState action, selector hooks
- `apps/web/src/components/Lobby.tsx` - Added longest_road_updated message handler
- `apps/web/src/components/GamePlayerList.tsx` - Display road lengths and Longest Road badge

## Decisions Made

- Used useShallow for playerRoadLengths selector since it's a Record type (prevents unnecessary re-renders)
- Added spring animation to badge appearance for polish
- Display road length for all players even at 0 for consistent layout

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Frontend Longest Road display complete
- Ready for 09-04-PLAN.md (edge cases and tiebreaker tests)

---

_Phase: 09-longest-road_
_Completed: 2026-01-31_
