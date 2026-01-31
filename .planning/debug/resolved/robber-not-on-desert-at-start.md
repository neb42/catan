---
status: resolved
trigger: 'robber-not-on-desert-at-start - The robber should start on the desert tile when a game begins, but it does not appear until it is first moved.'
created: 2026-01-31T00:00:00Z
updated: 2026-01-31T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - When setup completes and main game starts, the `turn_changed` message is broadcast but does NOT include `robberHexId`
test: Verified in websocket.ts lines 402-408
expecting: The message should include robberHexId from gameManager.getState()
next_action: Fix the turn_changed message to include robberHexId AND update the frontend handler to set it

## Symptoms

expected: Robber should be visible on the desert tile when the game board is first generated/displayed
actual: Robber does not appear on the board until a player moves it (presumably after rolling a 7)
errors: None reported
reproduction: Start a new game and observe the board - robber is not visible on the desert tile
started: Current behavior (unclear if it ever worked correctly)

## Eliminated

## Evidence

- timestamp: 2026-01-31T00:10:00Z
  checked: GameManager.ts constructor (line 85-106)
  found: robberHexId is initialized to null in GameState during setup
  implication: This is expected - robber isn't placed until main game starts

- timestamp: 2026-01-31T00:10:01Z
  checked: GameManager.ts startMainGame() (lines 349-364)
  found: When setup completes, startMainGame() finds the desert hex and sets robberHexId = "${desertHex.q},${desertHex.r}"
  implication: Backend correctly sets robberHexId when transitioning to main game

- timestamp: 2026-01-31T00:10:02Z
  checked: Board.tsx (lines 78-82, 111-118)
  found: Board uses useRobberHexId() hook and only renders RobberFigure if robberPosition is truthy
  implication: Frontend correctly conditionally renders based on robberHexId

- timestamp: 2026-01-31T00:10:04Z
  checked: websocket.ts lines 393-408 (setup complete handler)
  found: When setup completes, turn_changed is broadcast with only currentPlayerId, turnNumber, and phase - NO robberHexId is included
  implication: This is the root cause - the robberHexId is set on the backend but never sent to clients

- timestamp: 2026-01-31T00:10:05Z
  checked: Lobby.tsx lines 264-277 (turn_changed handler)
  found: Frontend handler only extracts phase, currentPlayerId, turnNumber - no handling for robberHexId
  implication: Even if server sent robberHexId, frontend wouldn't use it (but it doesn't send it)

- timestamp: 2026-01-31T00:10:06Z
  checked: Lobby.tsx lines 546-557 (robber_moved handler)
  found: This handler DOES call setRobberHexId - this is why it works when robber is moved after rolling 7
  implication: The pattern exists, just missing from initial state sync

## Resolution

root_cause: When setup phase completes and main game starts, the backend calls startMainGame() which sets robberHexId to the desert hex. The turn_changed message is then broadcast to all clients, but this message does NOT include the robberHexId. The frontend never receives the initial robber position, so robberHexId remains null in the gameStore, and the robber is not rendered until the first move_robber message is received (after rolling a 7).
fix: Added robberHexId to turn_changed message schema and updated backend to include it when transitioning from setup to main game. Updated frontend handler to set robberHexId from turn_changed message.
verification:
files_changed:

- libs/shared/src/schemas/messages.ts - Added optional robberHexId field to TurnChangedMessageSchema
- apps/api/src/handlers/websocket.ts - Include robberHexId in turn_changed message after setup complete
- apps/web/src/components/Lobby.tsx - Handle robberHexId in turn_changed message handler
