---
status: complete
phase: 07-robber
source:
  [
    07-01-SUMMARY.md,
    07-02-SUMMARY.md,
    07-03-SUMMARY.md,
    07-04-SUMMARY.md,
    07-05-SUMMARY.md,
    07-06-SUMMARY.md,
    07-07-SUMMARY.md,
  ]
started: 2026-01-30T18:30:00Z
updated: 2026-01-30T18:35:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Robber triggers on 7 roll - discard phase

expected: When a player rolls 7, any player with 8+ resource cards sees a modal forcing them to discard half (rounded down). The modal blocks all other actions until discards are complete. Other players see a "waiting for discards" overlay.
result: pass

### 2. Move robber to any land hex

expected: After discards complete (or if no one needs to discard), the rolling player sees a robber placement overlay. Clicking any land hex moves the robber there. The robber figure appears on the selected hex.
result: pass

### 3. Steal from adjacent player

expected: After moving the robber, if there are opponent settlements/cities adjacent to the new hex, a steal modal appears. Selecting a player steals one random resource from them. A notification shows what was stolen.
result: pass

### 4. Self-blocking allowed

expected: Player can move the robber to a hex where their own settlement/city is adjacent. This is valid - no error shown.
result: pass

### 5. Robber blocks resource production

expected: When a number is rolled that matches the hex where the robber sits, that hex produces NO resources for any player. Other hexes with the same number still produce normally.
result: pass

### 6. Opponent resource counts visible

expected: In the player list during the game, you can see the total resource card count for each opponent (not the breakdown, just the total number).
result: pass

### 7. Action feedback notifications

expected: Rolling dice, discarding cards, moving robber, and stealing all show toast notifications at the bottom of the screen confirming the action and relevant details.
result: pass

### 8. Game log shows history

expected: A collapsible game log panel exists showing timestamped entries for game actions. Can expand/collapse to see history.
result: pass

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
