---
phase: 08-development-cards
plan: 06
subsystem: development-cards
tags: [year-of-plenty, monopoly, dev-cards, modals, websocket]
depends_on:
  requires: ['08-02', '08-03']
  provides:
    ['Year of Plenty card effect', 'Monopoly card effect', 'blocking modals']
  affects: ['08-07', '08-08']
tech-stack:
  added: []
  patterns: ['blocking modal pattern', 'pending state pattern']
key-files:
  created:
    - apps/web/src/components/CardPlay/ResourcePickerModal.tsx
    - apps/web/src/components/CardPlay/MonopolyModal.tsx
  modified:
    - apps/api/src/game/GameManager.ts
    - apps/api/src/handlers/websocket.ts
    - apps/web/src/components/Lobby.tsx
    - libs/shared/src/schemas/messages.ts
decisions:
  - 'yearOfPlentyPending pattern for tracking card effect state'
  - 'pendingDevCardPlayerId tracks which player is completing card effect'
  - 'Blocking modals with no close button for required actions'
  - 'Simplified bank resources (assume 19 of each)'
metrics:
  duration: '~25 min'
  completed: '2026-01-30'
---

# Phase 08 Plan 06: Year of Plenty and Monopoly Card Effects Summary

Year of Plenty grants 2 free resources from bank via ResourcePickerModal; Monopoly takes all of one resource type from all players via MonopolyModal with blocking modal pattern.

## What Was Built

### Task 1: GameManager Methods (9a44afd)

Added Year of Plenty and Monopoly card effect methods to GameManager:

**New Properties:**

- `yearOfPlentyPending: boolean` - tracks if Year of Plenty effect is active
- `monopolyPending: boolean` - tracks if Monopoly effect is active
- `pendingDevCardPlayerId: string | null` - tracks which player is completing effect

**New Methods:**

- `playYearOfPlenty(playerId, cardId)` - validates and initiates Year of Plenty effect
- `completeYearOfPlenty(playerId, resources)` - grants 2 selected resources to player
- `playMonopoly(playerId, cardId)` - validates and initiates Monopoly effect
- `completeMonopoly(playerId, resourceType)` - takes all of resource type from all players

### Task 2: WebSocket Handlers (0a523f7)

Added WebSocket handlers for Year of Plenty and Monopoly card effects:

**play_dev_card switch cases:**

- `year_of_plenty` - calls playYearOfPlenty, broadcasts dev_card_played, sends year_of_plenty_required
- `monopoly` - calls playMonopoly, broadcasts dev_card_played, sends monopoly_required

**New message handlers:**

- `year_of_plenty_select` - completes effect, broadcasts year_of_plenty_completed
- `monopoly_select` - completes effect, broadcasts monopoly_executed with totalCollected

### Task 3: Frontend Modals and Handlers (aa316c8)

Created blocking modals and message handlers:

**ResourcePickerModal.tsx:**

- Modal for selecting 2 resources from bank
- Allows selecting same resource twice
- Blocking pattern (no close button, no escape)
- Sends year_of_plenty_select message on submit

**MonopolyModal.tsx:**

- Modal for selecting resource type to steal
- Shows 5 resource buttons in grid
- Blocking pattern (no close button, no escape)
- Sends monopoly_select message on selection

**Lobby.tsx handlers:**

- `year_of_plenty_required` - sets devCardPlayPhase to 'year_of_plenty'
- `year_of_plenty_completed` - updates resources, shows notification
- `monopoly_required` - sets devCardPlayPhase to 'monopoly'
- `monopoly_executed` - updates all affected player resources, shows notification

**Shared library:**

- Added MonopolyRequiredMessageSchema to messages.ts

## Key Decisions Made

| Decision                  | Rationale                                                                |
| ------------------------- | ------------------------------------------------------------------------ |
| Pending state pattern     | Use boolean flags + pendingDevCardPlayerId for tracking card effect flow |
| Simplified bank resources | Assume 19 of each (full bank) - bank depletion tracking deferred         |
| Blocking modal pattern    | Consistent with DiscardModal - opened=true, no close button              |
| Complete methods separate | playX initiates, completeX finishes for async modal interaction          |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added MonopolyRequiredMessageSchema**

- **Found during:** Task 3
- **Issue:** monopoly_required message type not in shared schema union
- **Fix:** Added schema and included in WebSocketMessageSchema union
- **Files modified:** libs/shared/src/schemas/messages.ts
- **Commit:** aa316c8

## Verification Performed

1. ✅ `npx nx build api` passes
2. ✅ `npx nx build web` passes
3. ✅ Year of Plenty flow: play → year_of_plenty_required → modal → select 2 → complete
4. ✅ Monopoly flow: play → monopoly_required → modal → select type → execute
5. ✅ Both modals are blocking (no close button, no escape)

## Commits

| Hash    | Type | Description                                            |
| ------- | ---- | ------------------------------------------------------ |
| 9a44afd | feat | Add Year of Plenty and Monopoly methods to GameManager |
| 0a523f7 | feat | Add Year of Plenty and Monopoly WebSocket handlers     |
| aa316c8 | feat | Add Year of Plenty and Monopoly frontend modals        |

## Next Phase Readiness

**Ready for:**

- 08-07: Road Building implementation (same pending pattern)
- 08-08: Card display and integration (cards now playable)

**No blockers identified.**
