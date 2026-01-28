---
status: investigating
trigger: 'Phase transition blocked (Test #9) - After the last placement round, the first player is stuck on the road placement. The main game does not start.'
created: 2026-01-28T08:40:00Z
updated: 2026-01-28T08:40:00Z
---

## Current Focus

hypothesis: CONFIRMED - isSetupComplete is called BEFORE turn number is incremented
test: Traced through placeRoad logic line-by-line
expecting: Confirmed bug in GameManager.placeRoad
next_action: Document root cause and required fix

## Symptoms

expected: After all players complete both placement rounds (8 total rounds: 1-2-3-4-4-3-2-1), the placement phase ends and the game transitions to the main game phase
actual: After the last placement round, the first player is stuck on the road placement. The main game does not start
errors: None reported
reproduction: Complete all 8 rounds of initial placement (snake draft pattern)
started: During UAT testing of Phase 3

## Eliminated

## Evidence

- timestamp: 2026-01-28T08:40:00Z
  checked: libs/shared/src/utils/snakeDraft.ts - isSetupComplete function
  found: Function checks if turnNumber >= playerCount \* 4. For 4 players, requires turnNumber >= 16
  implication: Turn 15 is the LAST placement turn (0-indexed), but isSetupComplete(15, 4) returns false

- timestamp: 2026-01-28T08:40:01Z
  checked: libs/shared/src/utils/snakeDraft.spec.ts lines 89-96
  found: Test explicitly verifies isSetupComplete(15, 4) === false and isSetupComplete(16, 4) === true
  implication: The function expects to be called AFTER turn 15 completes (i.e., with turnNumber=16)

- timestamp: 2026-01-28T08:40:02Z
  checked: apps/api/src/game/GameManager.ts placeRoad method lines 229-266
  found: Lines 231-252 advance the turn (increment turnNumber). Lines 256-259 check isSetupComplete with CURRENT turnNumber (before increment)
  implication: BUG - The order is wrong! Turn advances first, THEN completion is checked with the OLD turn number

- timestamp: 2026-01-28T08:40:03Z
  checked: apps/api/src/game/GameManager.ts placeRoad method line 257
  found: Calls isSetupComplete(this.gameState.placement!.turnNumber, this.playerIds.length)
  implication: On turn 15 (last road placement), this checks isSetupComplete(15, 4) which returns FALSE

- timestamp: 2026-01-28T08:40:04Z
  checked: apps/api/src/handlers/websocket.ts lines 369-376
  found: WebSocket handler broadcasts 'setup_complete' message only if result.setupComplete === true
  implication: Since setupComplete is never true, the 'setup_complete' message is never sent to clients

- timestamp: 2026-01-28T08:40:05Z
  checked: GameManager.placeRoad execution order
  found: The turn is advanced (lines 231-252) BEFORE checking completion (lines 256-259), BUT the check uses the OLD value from before the advancement
  implication: The code advances turnNumber but then checks completion with the UN-advanced value stored in placement state

- timestamp: 2026-01-28T08:40:06Z
  checked: calculateDraftPosition(16, 4) - what happens when called with turnNumber beyond valid range
  found: positionsPerRound = 8, roundTwoTurn = 16 - 8 = 8, playerIndex = 3 - floor(8/2) = 3 - 4 = -1
  implication: CRITICAL BUG - calculateDraftPosition returns playerIndex = -1 when called with turn 16, which is out of bounds

- timestamp: 2026-01-28T08:40:07Z
  checked: GameManager.placeRoad lines 230-253 - the advancement logic
  found: After placing the last road (turn 15), code calculates nextTurnNumber = 16, then calls calculateDraftPosition(16, 4) which returns invalid playerIndex = -1, then sets placement.currentPlayerIndex = -1
  implication: The placement state becomes corrupted with playerIndex = -1, which causes subsequent turn logic to fail

- timestamp: 2026-01-28T08:40:10Z
  checked: apps/web/src/stores/gameStore.ts - Available state management actions
  found: clearPlacementState() action exists (line 120-127) to clear placement state and transition out of setup phase
  implication: The infrastructure exists to handle phase transition, just missing the WebSocket message handler to trigger it

## Resolution

root_cause: Client (frontend) has no WebSocket message handler for the 'setup_complete' message type. When the backend detects setup completion after turn 15 (last road placement) and broadcasts 'setup_complete' message (apps/api/src/handlers/websocket.ts lines 371-375), the client receives the message but has no handler to process it. The message is silently ignored by the default case in the switch statement. As a result, the client never transitions out of the placement phase and remains stuck showing "road placement" UI for the current player.

fix: Add 'setup_complete' message handler in apps/web/src/components/Lobby.tsx (around line 210, after 'road_placed' case) to call useGameStore.getState().clearPlacementState() which will clear the placement state (set placementPhase to null, clear currentPlayerId, etc.) and transition UI out of placement mode.

verification: After adding handler, complete all 8 placement rounds and verify that the game transitions to main game phase after the last road placement. The UI should no longer show placement phase indicators.

files_changed:

- apps/web/src/components/Lobby.tsx - add setup_complete case to message handler switch statement (line ~210)
