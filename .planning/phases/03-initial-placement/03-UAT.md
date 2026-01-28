---
status: diagnosed
phase: 03-initial-placement
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md, 03-05-SUMMARY.md, 03-06-SUMMARY.md, 03-07-SUMMARY.md
started: 2026-01-28T08:25:00Z
updated: 2026-01-28T08:35:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Snake draft turn order

expected: After game starts (countdown completes), placement phase begins with player 1's turn. The turn order follows the snake draft pattern: 1→2→3→4 (first settlement round), then 4→3→2→1 (second settlement round), with each player placing a settlement then a road in sequence. The UI should clearly show whose turn it is and which action is required (settlement or road).
result: pass

### 2. Settlement placement validation

expected: When it's your turn to place a settlement, clicking a valid vertex (intersection of hexes) highlights it and allows placement. Invalid locations (too close to existing settlements - within 2 vertices) show a tooltip or visual indicator explaining why they're invalid. Settlements cannot be placed in ocean areas or off the board.
result: pass

### 3. Road placement validation

expected: After placing a settlement, you must place a road. Valid road locations (edges) connect to your just-placed settlement. Clicking a valid edge highlights it and allows placement. Invalid edges (not connected to your settlement) are not selectable or show why they're invalid.
result: pass

### 4. Placement confirmation flow

expected: After clicking a valid location (vertex or edge), a confirmation UI appears (e.g., "Confirm Placement" button). You can confirm to commit the placement, or cancel to select a different location. The placement only broadcasts to other players after confirmation.
result: pass

### 5. Real-time placement sync

expected: When another player places a settlement or road, it appears on your board immediately (within ~500ms) without needing to refresh. The turn indicator updates to show the next player's turn.
result: pass

### 6. Visual feedback for current turn

expected: The active player is clearly highlighted in the player list (e.g., with a glowing border or pulsing animation). A banner or text prominently shows "Your Turn: Place Settlement" or "Player X's Turn" for spectators. The draft order display shows the full snake draft sequence with the current turn marked.
result: pass

### 7. Starting resources from second settlement

expected: After placing your second settlement (during the reverse order round 4→3→2→1), you immediately receive resources based on the adjacent hexes. For example, if your second settlement touches wood, wheat, and sheep hexes, you receive 1 wood, 1 wheat, and 1 sheep. Your resource count updates visibly in the UI.
result: issue
reported: "There is no UI for displaying resource counts. Unclear if resources are being allocated on the backend."
severity: major

### 8. Placement restrictions enforce distance rule

expected: Attempting to place a settlement adjacent to (or one vertex away from) an existing settlement is blocked. The UI should prevent selection or show clear error feedback. Only vertices at least 2 edges away from any existing settlement are valid.
result: pass

### 9. Phase transition after placement complete

expected: After all players complete both placement rounds (8 total rounds: 1-2-3-4-4-3-2-1), the placement phase ends and the game transitions to the main game phase. The UI updates to show turn-based gameplay indicators (e.g., "Roll Dice" button or similar).
result: issue
reported: "After the last placement round, the first player is stuck on the road placement. The main game does not start."
severity: blocker

### 10. Settlement and road rendering

expected: Placed settlements appear as distinct colored markers at vertex positions (intersections of hexes). Roads appear as colored lines along edges connecting hexes. Each player's pieces use their selected color from the lobby.
result: pass

## Summary

total: 10
passed: 8
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "After placing your second settlement (during the reverse order round 4→3→2→1), you immediately receive resources based on the adjacent hexes and your resource count updates visibly in the UI"
  status: failed
  reason: "User reported: There is no UI for displaying resource counts. Unclear if resources are being allocated on the backend."
  severity: major
  test: 7
  root_cause: "Frontend has no implementation for resource state management or UI display. While backend correctly calculates and broadcasts resources via WebSocket, the client: (1) ignores resourcesGranted field in settlement_placed message handler, (2) has no playerResources state in gameStore, (3) has no UI component to display resource counts"
  artifacts:
  - path: "apps/web/src/components/Lobby.tsx"
    issue: "Lines 194-200 - settlement_placed handler ignores resourcesGranted field from backend message"
  - path: "apps/web/src/stores/gameStore.ts"
    issue: "Missing playerResources state and update actions"
  - path: "apps/web/src/components/GamePlayerList.tsx"
    issue: "Only displays avatar, nickname, and turn indicator - no resource counts displayed"
    missing:
  - "Add playerResources state to gameStore (Record<string, PlayerResources>)"
  - "Add updatePlayerResources action to gameStore"
  - "Update settlement_placed handler in Lobby.tsx to process resourcesGranted"
  - "Extend GamePlayerList to display resource counts with icons"
    debug_session: ".planning/debug/resource-ui-missing.md"

- truth: "After all players complete both placement rounds (8 total rounds: 1-2-3-4-4-3-2-1), the placement phase ends and the game transitions to the main game phase"
  status: failed
  reason: "User reported: After the last placement round, the first player is stuck on the road placement. The main game does not start."
  severity: blocker
  test: 9
  root_cause: "Client has no WebSocket message handler for 'setup_complete' message type. Backend correctly sends setup_complete after turn 15, but client ignores it. No handler exists in Lobby.tsx to process this message and trigger phase transition."
  artifacts:
  - path: "apps/web/src/components/Lobby.tsx"
    issue: "Missing 'setup_complete' case in WebSocket message handler switch statement (lines 183-225)"
  - path: "apps/api/src/handlers/websocket.ts"
    issue: "Backend sends 'setup_complete' message (lines 371-375) but no client handler exists"
    missing:
  - "Add 'setup_complete' case handler in Lobby.tsx that calls clearPlacementState()"
    debug_session: ".planning/debug/phase-transition-blocked.md"
