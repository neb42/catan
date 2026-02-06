---
status: resolved
trigger: 'victory-condition-not-triggered'
created: 2026-02-06T00:00:00Z
updated: 2026-02-06T00:20:00Z
---

## Current Focus

hypothesis: Victory point calculation or check is not triggered when buying a victory point card
test: Examine game log and victory point logic in codebase
expecting: Find where VP cards are processed and where victory condition is checked
next_action: Read game log to understand exact sequence of events, then trace victory point logic

## Symptoms

expected: The game should end immediately as soon as any player reaches 10 VP
actual: Player bought a victory point card, reached 10 VP total, but the game continued without ending
errors: None reported - game just didn't end
reproduction: Only observed once in this game session. Issue may be intermittent.
started: Victory conditions used to work correctly before. This is a regression.
game_log: ./logs/PEAVDC-messages.log

## Eliminated

## Evidence

- timestamp: 2026-02-06T00:05:00Z
  checked: Game log line 278
  found: Player "bf6fbfef..." bought a victory point card (3d9a617d...) on turn 23 - this was their 2nd VP card
  implication: Player should have reached 10 VP at this point but game continued

- timestamp: 2026-02-06T00:08:00Z
  checked: GameManager.ts buyDevCard method (lines 1538-1601)
  found: buyDevCard method does NOT call checkVictory() after adding card to player's hand
  implication: Victory condition is never checked when buying a VP card

- timestamp: 2026-02-06T00:10:00Z
  checked: Other build methods (buildRoad, buildSettlement, buildCity)
  found: All other build methods DO call checkVictory() after their actions (lines 720, 799, 875)
  implication: The pattern is established everywhere else, just missing from buyDevCard

## Resolution

root_cause: GameManager.buyDevCard() does not check for victory after purchasing a development card. When a player buys a victory point card that brings them to 10+ VP, the game continues because checkVictory() is never called. All other actions that can change VP (buildRoad, buildSettlement, buildCity) properly check for victory, but buyDevCard was missing this check.
fix: Added checkVictory() call after successfully purchasing a development card in buyDevCard method, and added victoryResult to the return type. Updated handler to broadcast victory if victoryResult is present.
verification:

- Code review: Verified complete flow from buyDevCard -> checkVictory -> handler broadcasts victory
- Build test: npx nx build api - SUCCESS, no compilation errors
- Logic trace: In the failing game log, player had 9 VP before buying 2nd VP card. With fix, checkVictory() would be called after adding card to hand, detect 10 VP, return victoryResult, and handler would broadcast game_ended message
- Pattern consistency: Fix follows same pattern as buildRoad (line 720), buildSettlement (line 799), and buildCity (line 875) which all call checkVictory()
  files_changed:
- apps/api/src/game/GameManager.ts (added victoryResult to return type and checkVictory call)
- apps/api/src/handlers/dev-card-handlers.ts (added victory broadcast when victoryResult present)
