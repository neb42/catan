---
status: complete
phase: 10-largest-army
source: 10-01-SUMMARY.md, 10-02-SUMMARY.md, 10-03-SUMMARY.md
started: 2026-02-02T14:00:00Z
updated: 2026-02-02T14:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Largest Army Not Awarded Below Threshold

expected: When a player has fewer than 3 knights played, no player should hold the Largest Army badge. The shield badge (🛡️) should not appear next to any player in the player list.
result: pass

### 2. Largest Army Awarded at Minimum Threshold

expected: When a player plays their 3rd knight card, they should receive the Largest Army badge. A red shield badge (🛡️) with "Largest Army (2 VP)" tooltip should appear next to their name with a spring animation.
result: pass

### 3. Largest Army Toast Notification on Award

expected: When a player earns Largest Army, a toast notification should appear announcing "[Player] earns Largest Army!"
result: pass

### 4. Largest Army Tie Favors Current Holder

expected: If another player reaches the same number of knights as the current holder, the current holder keeps the badge. The badge does not transfer on ties.
result: pass

### 5. Largest Army Transfers When Exceeded

expected: When a player exceeds the current holder's knight count, the badge transfers to them with a spring animation. A toast shows "[New Player] takes Largest Army from [Old Player]!"
result: pass

### 6. Knight Count Visible in Player List

expected: Each player's knight count should be visible in the player list, updating after each knight card is played.
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
