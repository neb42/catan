---
phase: 08-development-cards
plan: 05
status: complete
started: 2026-01-30
completed: 2026-01-30
affects:
  - phase-08
  - phase-09-longest-road
subsystem: development-cards
tech-stack:
  added: []
  used:
    - TypeScript
    - React
    - Zustand
    - WebSocket
    - Mantine
decisions:
  - id: ROAD-01
    choice: Road Building uses same validation as main-game road placement
    rationale: Consistent rules - only difference is no resource cost
  - id: ROAD-02
    choice: Edge overlay rendered inside Board SVG for consistent coordinate system
    rationale: EdgeMarker components require SVG Layout context for proper positioning
  - id: ROAD-03
    choice: Separate banner (RoadBuildingOverlay) and edge rendering (RoadBuildingEdgeOverlay)
    rationale: Banner is fixed-position HTML, edge markers are SVG within the board
---

# Summary: Road Building Card Implementation

## What Was Done

### Task 1: Add Road Building methods to GameManager

Added Road Building state and methods to `apps/api/src/game/GameManager.ts`:

**State added:**

- `roadBuildingRemaining` - tracks roads remaining to place (0, 1, or 2)
- `roadBuildingEdges` - tracks edges placed during current Road Building effect

**Methods added:**

- `playRoadBuilding(playerId, cardId)` - validates and initiates Road Building card effect
  - Validates turn, phase, card ownership, same-turn restriction, one-per-turn restriction
  - Calculates roads to place based on player's remaining road pieces (min of 2 or remaining)
  - Returns `{ success, roadsToPlace }` on success
- `placeRoadBuildingRoad(playerId, edgeId)` - places a road during Road Building mode
  - Uses `getInvalidMainGameRoadReason` for validation (same rules as normal road placement)
  - Places road without resource cost
  - Returns completion status and edges placed
- `isInRoadBuildingMode()` - getter for checking if Road Building is active
- `getRoadBuildingRemaining()` - getter for remaining roads to place

### Task 2: Add Road Building WebSocket handlers

Updated `apps/api/src/handlers/websocket.ts`:

**Updated `play_dev_card` handler:**

- Added `road_building` case that calls `gameManager.playRoadBuilding()`
- Broadcasts `dev_card_played` to all players
- Sends `road_building_required` to the card player with `roadsRemaining`

**Added `road_building_place` handler:**

- Validates room and game state
- Calls `gameManager.placeRoadBuildingRoad()`
- Broadcasts `road_building_placed` to all players (includes edgeId, playerId, roadsRemaining)
- On completion, broadcasts `road_building_completed` with all edges placed
- Otherwise sends updated `road_building_required` to player

### Task 3: Add Road Building frontend state and overlay

**Updated `apps/web/src/components/Lobby.tsx`:**

- Added handler for `road_building_required` - sets devCardPlayPhase to 'road_building'
- Added handler for `road_building_placed` - adds road to state, updates roadsPlacedThisCard
- Added handler for `road_building_completed` - clears Road Building mode, shows notification

**Created `apps/web/src/components/CardPlay/RoadBuildingOverlay.tsx`:**

- `RoadBuildingOverlay` - Fixed-position banner showing progress ("Place X more roads")
- `RoadBuildingEdgeOverlay` - SVG component rendering edge markers for valid road locations
  - Uses same validation logic as `useValidRoadLocationsMainGame`
  - Sends `road_building_place` message on edge click

**Updated `apps/web/src/components/Board/Board.tsx`:**

- Added import and render of `RoadBuildingEdgeOverlay` inside Layout

**Updated `apps/web/src/components/Game.tsx`:**

- Added imports for `RoadBuildingOverlay`, `ResourcePickerModal`, `MonopolyModal`
- Added render of all three dev card modals

## Key Files

| File                                                       | Changes                                                  |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| `apps/api/src/game/GameManager.ts`                         | Added Road Building state and methods                    |
| `apps/api/src/handlers/websocket.ts`                       | Added road_building case and road_building_place handler |
| `apps/web/src/components/Lobby.tsx`                        | Added road_building message handlers                     |
| `apps/web/src/components/CardPlay/RoadBuildingOverlay.tsx` | Created - banner and edge overlay                        |
| `apps/web/src/components/Board/Board.tsx`                  | Import and render RoadBuildingEdgeOverlay                |
| `apps/web/src/components/Game.tsx`                         | Import and render dev card modals                        |

## Verification

- [x] `npx nx build api` passes
- [x] `npx nx build web` passes
- [x] Playing Road Building enters mode with correct roads to place
- [x] Each road click validates, places road, decrements remaining
- [x] After all roads placed, broadcasts completion
- [x] Edge case: player with 1 road remaining places 1 and completes

## Patterns Established

- Road Building uses shared `pendingDevCardPlayerId` for tracking current effect
- Edge overlay pattern: separate HTML banner + SVG edge markers
- Same validation for free roads as paid roads (only cost differs)
