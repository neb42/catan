---
status: resolved 
trigger: 'Dice animation does not show for players who are not the active roller'
created: 2026-01-29T00:00:00Z
updated: 2026-01-29T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - The dice animation was only triggered for the active roller because isRolling state was only set when clicking the Roll button
test: Applied fix - added useEffect to detect new dice rolls and trigger animation for all players
expecting: All players should now see dice animation when anyone rolls
next_action: Manual verification - user needs to test with 2 browser tabs

## Symptoms

expected: All players should see the dice rolling animation when anyone rolls dice
actual: Non-active players see no animation - the dice result just appears instantly
errors: No console errors
reproduction: Open 2 browser tabs in same game, roll dice as one player, observe the other tab - no animation shows
started: Never worked - animation has never shown for non-active players

## Eliminated

## Evidence

- timestamp: 2026-01-29T00:01:00Z
  checked: DiceRoller.tsx - handleRoll function (lines 92-98)
  found: handleRoll sets isRolling=true and setAnimating=true, then sends 'roll_dice' message
  implication: Only the player who clicks "Roll Dice" triggers isRolling state

- timestamp: 2026-01-29T00:02:00Z
  checked: DiceRoller.tsx - animation effect (lines 64-83)
  found: Effect condition is `if (lastDiceRoll && isRolling)` - requires BOTH to be true
  implication: Observers have isRolling=false, so animation effect never triggers for them

- timestamp: 2026-01-29T00:03:00Z
  checked: DiceRoller.tsx - reconnection effect (lines 86-90)
  found: When `lastDiceRoll && !isRolling && displayValues === null`, values are shown immediately
  implication: This is why observers see instant result - they hit this branch instead of animation

- timestamp: 2026-01-29T00:04:00Z
  checked: Lobby.tsx - dice_rolled handler (lines 227-248)
  found: Handler only calls setDiceRoll and setTurnState, does NOT trigger animation state
  implication: No mechanism exists to start animation for non-rolling players

## Resolution

root_cause: The DiceRoller component uses local `isRolling` state to control animation. This state is only set to `true` when the local player clicks the "Roll Dice" button (line 95). When other players receive the `dice_rolled` WebSocket message, their `isRolling` is `false`, so:

1. The animation effect (lines 64-83) requires `lastDiceRoll && isRolling` - this never triggers for observers
2. Instead, the reconnection effect (lines 86-90) catches `lastDiceRoll && !isRolling && displayValues === null` and immediately shows the values

fix: Added a useEffect that detects when a NEW dice roll arrives (by comparing with the last processed roll key). When a new roll is detected and the player is not already rolling (i.e., they're an observer), it triggers the animation by setting isRolling=true and setAnimating(true). The lastProcessedRollRef is initialized with the current dice roll (if any) on mount to prevent animation on reconnection.

verification: TypeScript check passes. Manual testing needed: Open 2 browser tabs, roll dice as one player, verify other tab shows animation.
files_changed: [apps/web/src/components/DiceRoller/DiceRoller.tsx]
