---
status: resolved
trigger: "trade-response-accept-button-disabled - Accept button should be disabled when player doesn't have resources"
created: 2026-01-30T12:00:00Z
updated: 2026-01-30T12:02:00Z
---

## Current Focus

hypothesis: CONFIRMED - Accept button has no disabled prop
test: N/A - root cause found
expecting: N/A
next_action: Complete

## Symptoms

expected: Accept button should be disabled (grayed out and unclickable) when player doesn't have resources
actual: Button is enabled even when player lacks required resources
errors: No errors in console or UI
reproduction: Open any trade response modal - accept button is always enabled
started: Never implemented - this validation was never added

## Eliminated

## Evidence

- timestamp: 2026-01-30T12:00:30Z
  checked: TradeResponseModal.tsx line 85
  found: Accept button is `<Button color="green" onClick={handleAccept}>` with NO disabled prop
  implication: Button is always enabled - no resource check exists

- timestamp: 2026-01-30T12:00:45Z
  checked: useCanAfford hook in gameStore.ts
  found: Pattern for resource checking exists - compares player resources against a cost object
  implication: Can reuse this pattern for trade resource checking

- timestamp: 2026-01-30T12:01:00Z
  checked: Trade modal stores activeTrade with requesting resources
  found: `activeTrade.requesting` contains the resources the responder must give
  implication: Need to check if myPlayer resources >= activeTrade.requesting

## Resolution

root_cause: TradeResponseModal.tsx line 85 Accept button has no disabled prop. The modal displays what resources are requested but never checks if the responding player has those resources before allowing them to click Accept.

fix: Added `canAffordTrade` check that compares myPlayerId's resources against activeTrade.requesting, then uses it in disabled prop of Accept button. Added two new useGameStore selectors (myPlayerId and myResources), and computed canAffordTrade by checking that every resource in activeTrade.requesting is <= the player's owned amount.

verification: TypeScript compilation passes (npx nx typecheck web). Prettier formatting passes.

files_changed:

- apps/web/src/components/Trade/TradeResponseModal.tsx
