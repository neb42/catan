---
status: complete
phase: 06-trading
source:
  [
    06-01-SUMMARY.md,
    06-02-SUMMARY.md,
    06-03-SUMMARY.md,
    06-04-SUMMARY.md,
    06-05-SUMMARY.md,
    06-06-SUMMARY.md,
    06-07-SUMMARY.md,
  ]
started: 2026-01-30T15:00:00Z
updated: 2026-01-30T15:05:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Trade Button Visibility

expected: During your turn's main phase (after rolling dice), a "Trade" button appears in the game controls area.
result: pass

### 2. Trade Modal Opens with Tabs

expected: Clicking the Trade button opens a modal with two tabs: "Players" and "Bank". The Bank tab shows a badge with your best available rate (4:1, 3:1, or 2:1).
result: pass

### 3. Domestic Trade - Compose Offer

expected: On the Players tab, you can select resources to give and receive using +/- buttons. Select a target player from the list. Click "Propose Trade" to send the offer.
result: pass

### 4. Domestic Trade - Recipient Response

expected: The trade recipient sees a blocking modal (cannot close it) showing the offer details with Accept and Decline buttons.
result: pass

### 5. Domestic Trade - Proposer Waiting State

expected: While waiting for responses, the proposer sees "Waiting for responses..." with real-time status updates as players accept/decline.
result: pass

### 6. Domestic Trade - Execute Trade

expected: When a player accepts, the proposer can select them as partner. Trade executes: resources transfer correctly between both players (proposer gives what was offered, receives what was requested).
result: pass

### 7. Bank Trade 4:1

expected: On the Bank tab without any ports, you can trade 4 of one resource for 1 of any other resource. Resources transfer correctly after clicking "Trade with Bank".
result: pass

### 8. Port Trade 3:1

expected: If you have a settlement on a generic 3:1 port, the Bank tab shows 3:1 as your best rate for all resources. You can trade 3 of any resource for 1 of another.
result: pass

### 9. Port Trade 2:1

expected: If you have a settlement on a specific 2:1 port (e.g., wheat port), the Bank tab shows 2:1 rate for that resource type. You can trade 2 of that specific resource for 1 of any other.
result: pass

### 10. Trade Cancellation on Turn End

expected: If you have an active trade proposal when your turn ends (or you click End Turn), the trade is automatically cancelled and cleared.
result: pass

### 11. Trade Validation - Insufficient Resources

expected: Attempting to propose a trade offering resources you don't have shows an error or prevents the trade.
result: pass

## Summary

total: 11
passed: 11
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
