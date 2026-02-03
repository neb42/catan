---
phase: 11-victory
plan: 02
status: complete
completed: 2026-02-03
---

# Plan 11-02 Summary: Victory Detection Integration

## What Was Built

Integrated victory detection into GameManager at all VP-changing action points and added victory broadcast to WebSocket handlers.

## Deliverables

| Artifact                             | Description                                                           |
| ------------------------------------ | --------------------------------------------------------------------- |
| `apps/api/src/game/GameManager.ts`   | checkVictory() method and integration at all VP change points         |
| `apps/api/src/handlers/websocket.ts` | broadcastVictory() helper and victory checks in all relevant handlers |

## Key Implementation Details

### GameManager Changes

- Added `private gameEnded = false` flag to prevent actions after game ends
- Added `checkVictory()` method that calls `checkForVictory()` with current game state
- Added `isGameEnded()` getter for external game-over checks
- Modified VP-changing methods to guard against post-game actions and return victoryResult

### VP-Changing Methods Modified

| Method                    | VP Change                 | Notes                                          |
| ------------------------- | ------------------------- | ---------------------------------------------- |
| `placeSettlement()`       | +1 VP (setup phase)       | Settlement during setup                        |
| `placeRoad()`             | Longest road may transfer | Setup phase road placement                     |
| `buildRoad()`             | Longest road may transfer | Main phase road building                       |
| `buildSettlement()`       | +1 VP + may break road    | Main phase settlement building                 |
| `buildCity()`             | +1 VP net (2 - 1)         | Upgrade settlement to city                     |
| `playKnight()`            | Largest army may transfer | Knight card moves robber + army                |
| `placeRoadBuildingRoad()` | Longest road may transfer | Road building dev card, exits early if victory |

### WebSocket Handler Changes

Added `broadcastVictory()` helper function that:

- Gets winner nickname from room players
- Broadcasts `type: 'victory'` message with winnerId, winnerNickname, winnerVP, allPlayerVP, revealedVPCards

Victory checks added to handlers:

- `place_settlement` - setup phase settlements
- `place_road` - setup phase roads (longest road)
- `build_road` - main phase roads (longest road)
- `build_settlement` - main phase settlements
- `build_city` - city upgrades
- `play_dev_card` (knight case) - largest army
- `road_building_place` - road building dev card

### Mid-Action Victory

If a player wins during Road Building (first road triggers victory), the game ends immediately without prompting for the second road.

## Commits

| Task                                    | Commit    | Files          |
| --------------------------------------- | --------- | -------------- |
| Task 1: Add checkVictory to GameManager | `948e763` | GameManager.ts |
| Task 2: Broadcast victory in handlers   | `17c20b5` | websocket.ts   |

## Decisions

| Decision                            | Rationale                                                  |
| ----------------------------------- | ---------------------------------------------------------- |
| Guard all VP-changing actions       | Prevent any action after game ends                         |
| Check victory after bonus updates   | Longest road/largest army updates must complete first      |
| Early return on mid-action victory  | Road Building should not prompt for 2nd road if game ended |
| Follow broadcastLongestRoad pattern | Consistent helper function approach for victory broadcast  |

## Verification

- TypeScript compiles without errors (`npx tsc --noEmit`)
- All VP-changing methods return victoryResult
- WebSocket handlers broadcast victory message when game ends
