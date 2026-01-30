---
phase: 08-development-cards
plan: 04
subsystem: game-logic
tags: [knight, dev-cards, robber, websocket]

dependency_graph:
  requires: [08-02, 08-03]
  provides: [playKnight-method, knight-play-flow, robber-reuse]
  affects: [08-05, 08-06, 11-largest-army]

tech_stack:
  added: []
  patterns: [method-routing-by-type, flow-reuse]

file_tracking:
  key_files:
    created: []
    modified:
      - apps/api/src/game/GameManager.ts
      - apps/api/src/handlers/websocket.ts
      - apps/web/src/components/Lobby.tsx

decisions:
  - card-type-routing: WebSocket handler routes play_dev_card by card.type to appropriate method

metrics:
  duration: ~4 minutes
  completed: 2026-01-30
---

# Phase 08 Plan 04: Knight Card Play Logic Summary

Knight card play fully integrated, reusing existing robber flow for move + steal.

## What Was Built

1. **GameManager.playKnight method** - Core logic for playing Knight cards
   - Validates turn ownership and card existence
   - Enforces same-turn purchase restriction (DEV-03)
   - Enforces one-dev-card-per-turn restriction
   - Removes card from player's hand
   - Increments knight count for player
   - Enters robber 'moving' phase (skips discard phase)
   - Returns current robber hex for frontend state sync

2. **WebSocket play_dev_card handler** - Routes card play by type
   - Knight: calls playKnight(), broadcasts dev_card_played, sends robber_move_required
   - Victory point: returns error (VP cards auto-score)
   - Road building/year of plenty/monopoly: returns "not yet implemented"

3. **Frontend message handlers** - Dev card purchase and play messages
   - dev_card_purchased: add card to hand, update deck count
   - dev_card_purchased_public: update deck count, increment opponent card count
   - dev_card_played: remove from hand/decrement opponent, increment knights
   - dev_card_play_failed: show error notification

## Knight Flow

```
Player clicks Knight card → send play_dev_card
  ↓
GameManager.playKnight validates + enters robber phase
  ↓
Broadcast dev_card_played (all see knight increment)
  ↓
Send robber_move_required to player
  ↓
Existing robber UI activates (RobberPlacement overlay)
  ↓
Player moves robber → existing move_robber handler
  ↓
Steal phase → existing steal_required / stolen handlers
  ↓
Turn continues normally
```

## Key Implementation Details

- **Robber flow reuse**: Knight sets `robberPhase = 'moving'` and `robberMover = playerId`, then existing handlers take over
- **getAllKnightsPlayed getter**: Returns Record<string, number> for Largest Army tracking in Phase 11
- **Card type routing**: play_dev_card handler dispatches to different methods based on card.type

## Commits

| Hash    | Message                                                  |
| ------- | -------------------------------------------------------- |
| 6b729dd | feat(08-04): add playKnight method to GameManager        |
| 2a46f09 | feat(08-04): add play_dev_card WebSocket handler         |
| 99f1298 | feat(08-04): add frontend handlers for dev card messages |

## Verification

- [x] `npx nx build api` passes
- [x] `npx nx build web` passes
- [x] playKnight validates card ownership, same-turn rule, one-per-turn rule
- [x] playKnight removes card, increments knightsPlayed, sets robberPhase='moving'
- [x] WebSocket broadcasts dev_card_played to all, robber_move_required to player
- [x] Client reuses existing RobberPlacement and StealModal components

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Ready for:

- **08-05**: Road Building card play (places 2 free roads)
- **08-06**: Year of Plenty and Monopoly card play
- **11-largest-army**: Uses getAllKnightsPlayed() for largest army calculation
