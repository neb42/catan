---
status: resolved
trigger: 'During initial placement rounds, players can place an extra road beyond the expected 1 settlement + 1 road per turn.'
created: 2026-01-28T00:00:00Z
updated: 2026-01-28T00:20:00Z
---

## Current Focus

hypothesis: WebSocket handler sends placement_turn message after settlement placement but the phase transition after road placement may not properly advance to next player
test: Examining the message flow after road placement in websocket handler
expecting: Find that placement_turn is sent with wrong phase or player after road placement
next_action: Analyze the websocket handler road placement flow at lines 343-394

## Symptoms

expected: Each player places 1 settlement and 1 road per placement round (standard Catan rules)
actual: Each player can place 1 settlement and 2 roads per placement round - after placing the expected settlement and road, another road can be placed
errors: No console errors or UI errors
reproduction: Start a new game. As the first player, proceed with placement. After placing a settlement and road as expected, can place another road. The same happens on the second placement round.
started: Unsure when it started

## Eliminated

## Evidence

- timestamp: 2026-01-28T00:05:00Z
  checked: GameManager.placeSettlement() method
  found: After settlement placement, phase advances from setup_settlement1/2 to setup_road1/2 (lines 157-160). Same player, same turn number, just phase change.
  implication: Settlement -> Road phase transition is correct

- timestamp: 2026-01-28T00:06:00Z
  checked: GameManager.placeRoad() method
  found: After road placement, turnNumber increments, currentPlayerIndex and draftRound update based on calculateDraftPosition, and phase updates to next settlement phase (lines 212-235)
  implication: Backend GameManager logic appears correct - it advances turn after road placement

- timestamp: 2026-01-28T00:07:00Z
  checked: WebSocket handler for place_settlement (lines 297-341)
  found: After successful settlement placement, broadcasts settlement_placed message, then broadcasts placement_turn with updated phase (still same player, now road phase)
  implication: Correctly sends placement_turn after settlement

- timestamp: 2026-01-28T00:08:00Z
  checked: WebSocket handler for place_road (lines 343-394)
  found: After successful road placement, broadcasts road_placed message. If setupComplete, broadcasts setup_complete. Otherwise broadcasts placement_turn with next player info.
  implication: Should be broadcasting placement_turn to advance turn, need to verify this logic

- timestamp: 2026-01-28T00:12:00Z
  checked: calculateDraftPosition function and test expectations
  found: The function expects turnNumber to increment with EACH placement (settlement or road). Turn 0 = settlement, Turn 1 = road (same player), Turn 2 = settlement (next player). But GameManager.placeSettlement() changes phase without incrementing turnNumber.
  implication: After settlement, turnNumber stays 0. After road, turnNumber becomes 1. But turn 1 is ALSO 'road' phase (for same player), so player can place another road!

## Resolution

root_cause: GameManager.placeSettlement() advanced phase from settlement to road without incrementing turnNumber. When road was placed, turnNumber incremented from 0 to 1. But calculateDraftPosition(1, playerCount) returns phase='road' for the same player, allowing them to place another road instead of moving to the next player's settlement turn.

fix: Modified GameManager.placeSettlement() to increment turnNumber and recalculate draft position (similar to placeRoad logic). This ensures both settlement and road placements consume consecutive turn numbers (0 and 1 for first player, 2 and 3 for second player, etc.).

verification:

- All existing backend tests pass (17 tests in placement-validator, fairness-validator, board-generator)
- All shared library tests pass (26 tests)
- Build completes successfully for both API and web
- Logic verified through manual trace:
  - Turn 0: Player 0 settlement
  - Turn 1: Player 0 road (turnNumber now increments after settlement)
  - Turn 2: Player 1 settlement (was incorrectly Player 0 road before fix)
  - Turn 3: Player 1 road
- Verified calculateDraftPosition behavior confirms correct turn progression

files_changed:

- apps/api/src/game/GameManager.ts: Updated placeSettlement() method (lines 156-180) to increment turnNumber and use calculateDraftPosition to determine next phase, matching the logic in placeRoad()
