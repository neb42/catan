---
phase: 15-add-sound-effects-during-gameplay
plan: 02
subsystem: ui
tags: [sound, howler, websocket-handlers, game-events]

# Dependency graph
requires:
  - phase: 15-add-sound-effects-during-gameplay (plan 01)
    provides: SoundService singleton with play(SoundName) API and 15 sound types
provides:
  - All 15 sound events integrated into WebSocket message handlers
  - Sound plays on every game event (dice, build, trade, robber, dev cards, victory)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'soundService.play() calls placed after state updates and before/after notifications'
    - 'yourTurn sound gated by myPlayerId check for local-player-only notification'
    - 'negative sound for discard only plays for affected player (not all players)'

key-files:
  created: []
  modified:
    - apps/web/src/handlers/turnHandlers.ts
    - apps/web/src/handlers/buildingHandlers.ts
    - apps/web/src/handlers/tradeHandlers.ts
    - apps/web/src/handlers/robberHandlers.ts
    - apps/web/src/handlers/devCardHandlers.ts
    - apps/web/src/handlers/victoryHandlers.ts

key-decisions:
  - 'All players hear all game events (no own vs opponent differentiation) except yourTurn'
  - 'Award handlers left silent — primary actions already have sounds'
  - 'devCardBuy plays in both private and public purchase handlers so all players hear it'
  - 'Discard negative sound only for affected player, robberWarning for all players'
  - 'resourceGain plays once per distribution event, not per resource type'

patterns-established:
  - 'Import soundService from @web/services/sound in handler files'
  - 'Place sound calls after state updates for consistent timing'

requirements-completed: [AUDIO-01]

# Metrics
duration: 4min
completed: 2026-02-20
---

# Phase 15 Plan 02: Sound Event Integration Summary

**All 15 sound types wired into 6 WebSocket handler files with 19 total soundService.play() calls covering dice, building, trading, robber, dev cards, and victory events**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-20T16:55:09Z
- **Completed:** 2026-02-20T16:59:13Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Integrated all 15 sound event types into appropriate WebSocket message handlers
- yourTurn sound properly gated to only play for the local player
- Negative tone plays for failed builds, failed dev card plays, and discard required events
- Award handlers intentionally left silent (sounds are secondary to primary action sounds)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add sounds to turn and building handlers** - `5219874` (feat)
2. **Task 2: Add sounds to trade and robber handlers** - `90269b1` (feat)
3. **Task 3: Add sounds to dev card and victory handlers** - `ec54b4c` (feat)

## Files Created/Modified

- `apps/web/src/handlers/turnHandlers.ts` - Added diceRoll, resourceGain, yourTurn sounds
- `apps/web/src/handlers/buildingHandlers.ts` - Added buildRoad, buildSettlement, buildCity, negative sounds
- `apps/web/src/handlers/tradeHandlers.ts` - Added tradeOffer, tradeComplete sounds
- `apps/web/src/handlers/robberHandlers.ts` - Added robberWarning, robberPlace, robberSteal, negative sounds
- `apps/web/src/handlers/devCardHandlers.ts` - Added devCardBuy, devCardPlay, negative sounds
- `apps/web/src/handlers/victoryHandlers.ts` - Added victory sound

## Sound Coverage Map

| Sound Name      | Handler File        | Handler Function(s)                                  |
| --------------- | ------------------- | ---------------------------------------------------- |
| diceRoll        | turnHandlers.ts     | handleDiceRolled                                     |
| resourceGain    | turnHandlers.ts     | handleDiceRolled (when resources distributed)        |
| yourTurn        | turnHandlers.ts     | handleTurnChanged (local player only)                |
| buildRoad       | buildingHandlers.ts | handleRoadBuilt                                      |
| buildSettlement | buildingHandlers.ts | handleSettlementBuilt                                |
| buildCity       | buildingHandlers.ts | handleCityBuilt                                      |
| negative        | buildingHandlers.ts | handleBuildFailed                                    |
| negative        | robberHandlers.ts   | handleDiscardRequired (affected player only)         |
| negative        | devCardHandlers.ts  | handleDevCardPlayFailed                              |
| tradeOffer      | tradeHandlers.ts    | handleTradeProposed                                  |
| tradeComplete   | tradeHandlers.ts    | handleTradeExecuted, handleBankTradeExecuted         |
| robberWarning   | robberHandlers.ts   | handleRobberTriggered                                |
| robberPlace     | robberHandlers.ts   | handleRobberMoved                                    |
| robberSteal     | robberHandlers.ts   | handleStolen                                         |
| devCardBuy      | devCardHandlers.ts  | handleDevCardPurchased, handleDevCardPurchasedPublic |
| devCardPlay     | devCardHandlers.ts  | handleDevCardPlayed                                  |
| victory         | victoryHandlers.ts  | handleVictory                                        |

## Decisions Made

- All players hear all game events (no own vs opponent differentiation) per CONTEXT.md
- yourTurn is the sole exception — only plays for the local player
- Award handlers (longestRoad, largestArmy) get no sounds — they're secondary to the primary action that triggered them
- devCardBuy plays in both private (handleDevCardPurchased) and public (handleDevCardPurchasedPublic) handlers so all players hear it regardless of which message they receive
- Discard negative sound only plays for the affected player (inside myPlayerId check), while robberWarning plays for all players
- resourceGain plays once per distribution event, gated on whether any resources were actually distributed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 15 is now complete — all sound infrastructure (Plan 01) and event integration (Plan 02) done
- Sound files need to be placed at `/public/sounds/*.mp3` for runtime playback (covered by Plan 01)
- No further phases planned

---

## Self-Check: PASSED

- All 7 modified/referenced files verified to exist
- All 3 task commits verified (5219874, 90269b1, ec54b4c)
- TypeScript typecheck passes
- Production build succeeds
- 19 soundService.play() calls confirmed across 6 handler files
- All 15 sound types covered

---

_Phase: 15-add-sound-effects-during-gameplay_
_Completed: 2026-02-20_
