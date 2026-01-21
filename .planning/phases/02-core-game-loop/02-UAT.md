# Phase 02: Core Game Loop - User Acceptance Testing

**Phase:** 02-core-game-loop  
**Started:** 2026-01-21  
**Status:** In Progress

## Test Overview

Testing deliverables from 7 plans:
- 02-01: Board generation
- 02-02: Initial placement state machine
- 02-03: Board rendering
- 02-04: Turn mechanics (dice, resources)
- 02-05: Resource tracking UI
- 02-06: Interactive placement UI
- 02-07: End phase transitions

## Test Results

### Test 1: Board Generation
**Expected Behavior:**
- Start a new game with 4 players
- Board should generate with 19 hexes in standard Catan layout
- Should see 5 terrain types (wood, brick, sheep, wheat, ore) plus 1 desert
- Number tokens should appear on non-desert hexes
- No adjacent 6 and 8 tokens (high-probability numbers)
- 9 ports should be placed on coast edges

**Status:** ❌ Failed  
**Result:** Ports are missing from the board  
**Severity:** Major  
**Notes:** Board generates with hexes and number tokens, but ports not rendering

---

### Test 2: Initial Placement - Snake Draft Order
**Expected Behavior:**
- Game starts with player 1's turn for initial placement
- Order should follow: P1 → P2 → P3 → P4 → P4 → P3 → P2 → P1 (snake draft)
- Each player places one settlement then one road in first round
- Second round reverses order and repeats

**Status:** ❌ Failed  
**Result:** Placement rendering broken - settlements and roads appear in wrong positions, some off map  
**Severity:** Critical  
**Notes:** Cannot verify turn order due to broken placement coordinates

---

### Test 3: Settlement Placement Validation
**Expected Behavior:**
- Click on vertex (hex corner) to place settlement
- Valid placements should succeed
- Invalid placements (too close to other settlements, no adjacent roads after initial) should show error
- Settlement distance rule: must be at least 2 edges away from any other settlement

**Status:** 🚫 Blocked  
**Result:** Cannot test - blocked by Issue #2 (placement rendering broken)  
**Severity:** N/A  
**Notes:** Need to fix placement coordinates before validation can be tested

---

### Test 4: Road Placement Validation
**Expected Behavior:**
- Click on edge (between hexes) to place road
- During initial placement: road must connect to just-placed settlement
- Roads must connect to existing settlements or roads
- Invalid placements should show error message

**Status:** 🚫 Blocked  
**Result:** Cannot test - blocked by Issue #2 (placement rendering broken)  
**Severity:** N/A  
**Notes:** Need to fix placement coordinates before validation can be tested

---

### Test 5: Starting Resources from Second Settlement
**Expected Behavior:**
- After placing second settlement in snake draft
- Player should receive resource cards from all hexes adjacent to that settlement
- Resource counts should update in player's hand
- Example: Settlement on wheat/wood/sheep corner gives 1 wheat, 1 wood, 1 sheep

**Status:** 🚫 Blocked  
**Result:** Cannot test - blocked by Issue #2 (placement rendering broken)  
**Severity:** N/A  
**Notes:** Need to fix placement coordinates before resource distribution can be tested

---

### Test 6: Visual Board Rendering
**Expected Behavior:**
- Hexagonal board renders clearly with terrain textures/colors
- Number tokens visible on hexes with probability pips (dots)
- Settlements appear as colored houses on vertices
- Roads appear as colored bars on edges
- All pieces use player colors correctly

**Status:** ✅ Passed  
**Result:** Board hexes, terrain, and number tokens render correctly  
**Severity:** N/A  
**Notes:** Visual rendering works despite placement coordinate issues

---

### Test 7: Dice Roll Animation
**Expected Behavior:**
- Current player clicks "Roll Dice" button
- Two dice should animate/roll
- Result displays as sum (2-12)
- Result visible to all players

**Status:** 🚫 Blocked  
**Result:** Cannot test - blocked by Issue #2 (placement rendering broken)  
**Severity:** N/A  
**Notes:** Need to complete initial placement before reaching dice roll phase

---

### Test 8: Resource Distribution on Dice Roll
**Expected Behavior:**
- After dice roll (non-7)
- Players with settlements on hexes matching the rolled number receive resources
- Resource cards update for affected players
- Example: Roll 6, player with settlement on wood hex with 6 token gets 1 wood
- Cities give 2 resources (but not implemented in this phase)

**Status:** 🚫 Blocked  
**Result:** Cannot test - blocked by Issue #2 (placement rendering broken)  
**Severity:** N/A  
**Notes:** Need to complete initial placement before reaching dice roll phase
**Severity:**  
**Notes:**

---

### Test 9: Turn Phase Progression
**Expected Behavior:**
- Turn starts in "roll" phase - can only roll dice
- After rolling, enters "main" phase - can build/trade (not fully implemented yet)
- Click "End Turn" to enter "end" phase briefly (~1 second)
- Turn advances to next player automatically
- New player sees "roll" phase

**Status:** 🚫 Blocked  
**Result:** Cannot test - blocked by Issue #2 (placement rendering broken)  
**Severity:** N/A  
**Notes:** Need to complete initial placement before reaching turn phases

---

### Test 10: Turn Order Enforcement
**Expected Behavior:**
- Only current player can roll dice or end turn
- Other players see whose turn it is but cannot perform turn actions
- Turn indicator shows current player name/color
- Turn advances in round-robin order (P1 → P2 → P3 → P4 → P1...)

**Status:** 🚫 Blocked  
**Result:** Cannot test - blocked by Issue #2 (placement rendering broken)  
**Severity:** N/A  
**Notes:** Need to complete initial placement before reaching turn phases

---

### Test 11: Resource Cards Display
**Expected Behavior:**
- Resource cards visible for local player
- Shows count of each resource type (wood, brick, sheep, wheat, ore)
- Counts update immediately when resources gained/spent
- Visual cards use icons/emoji for resource types
- Other players' total card counts visible but not breakdown

**Status:** 🚫 Blocked  
**Result:** Cannot test - blocked by Issue #2 (placement rendering broken)  
**Severity:** N/A  
**Notes:** Need to complete initial placement to gain resources

---

### Test 12: Player List Display
**Expected Behavior:**
- All players shown in list with colors and names
- Current player highlighted in list
- Victory points/scores visible (if tracking exists)
- List updates in real-time as turn changes

**Status:** 🚫 Blocked  
**Result:** Cannot test - blocked by Issue #2 (placement rendering broken)  
**Severity:** N/A  
**Notes:** Need to complete initial placement before reaching turn phases

---

### Test 13: Turn Indicator
**Expected Behavior:**
- Clear visual showing whose turn it is
- Shows current turn phase (roll/main/end)
- Updates immediately when turn changes
- Phase label matches available actions

**Status:** 🚫 Blocked  
**Result:** Cannot test - blocked by Issue #2 (placement rendering broken)  
**Severity:** N/A  
**Notes:** Need to complete initial placement before reaching turn phases

---

### Test 14: Multi-Player Real-Time Sync
**Expected Behavior:**
- Open game in 2+ browser windows/devices with different players
- All players see board updates in real-time
- Placement, dice rolls, resource changes sync across all clients
- No significant lag (< 500ms)

**Status:** 🚫 Blocked  
**Result:** Cannot test - blocked by Issue #2 (placement rendering broken)  
**Severity:** N/A  
**Notes:** Need working placement before testing sync

---

### Test 15: Complete Initial Placement to First Turn
**Expected Behavior:**
- Play through entire initial placement (8 rounds)
- After P1's second road placement, game should advance to first regular turn
- P1 should be able to roll dice
- Resources should distribute
- Turn should advance through all players

**Status:** 🚫 Blocked  
**Result:** Cannot test - blocked by Issue #2 (placement rendering broken)  
**Severity:** N/A  
**Notes:** This is the end-to-end test - requires all other functionality working

---

## Summary

**Total Tests:** 15  
**Passed:** 1  
**Failed:** 2  
**Blocked:** 12

**Issues Found:** 2
- Critical: 1
- Major: 1
- Minor: 0

## Issues Log

### Issue #1: Ports Missing from Board (Major)
**Test:** Test 1 - Board Generation  
**Description:** Board generates with 19 hexes and number tokens correctly, but the 9 ports are not rendering on coast edges  
**Impact:** Players cannot use port trading mechanics (2:1 or 3:1 trades)  
**Affected Components:** Board rendering, port placement  
**Found:** 2026-01-21

### Issue #2: Settlement and Road Placement Coordinates Wrong (Critical)
**Test:** Test 2 - Initial Placement  
**Description:** Settlement and road pieces render in incorrect positions. Some settlements appear off the board map entirely. Roads are not adjacent to their settlements - all appear off map  
**Impact:** Game is unplayable - cannot see or interact with placed pieces correctly  
**Affected Components:** Settlement.tsx, Road.tsx, geometry calculations for vertex/edge positions  
**Found:** 2026-01-21

---

*Testing started: 2026-01-21*  
*Last updated: 2026-01-21*  
*Status: Completed - Issues diagnosed, fix plans ready*

## Diagnosis & Fix Plans

### Issue #1: Ports Missing (Major)
**Root Cause:** HexGrid has no rendering logic for ports. Ports are generated server-side and included in game state, but not rendered by UI.

**Fix Plan:** 02-08-PLAN.md
- Create Port.tsx component to render port visuals
- Integrate port rendering into HexGrid
- Parse port position format: `"q,r:directionIndex"` (0-5)
- Display 3:1 generic and 2:1 resource-specific port types

**Status:** ✅ Fix plan approved and ready

---

### Issue #2: Placement Coordinates Wrong (Critical)
**Root Cause:** Hex orientation mismatch between react-hexgrid Layout (pointy-top with `flat={false}`) and custom geometry.ts calculations (flat-top formulas with -30° offset).

**Fix Plan:** 02-09-PLAN.md
- Change HexGrid Layout from `flat={false}` to `flat={true}` (one line)
- Aligns react-hexgrid orientation with geometry calculations
- Fixes all settlement and road placement coordinates

**Status:** ✅ Fix plan approved and ready

---

## Next Steps

Execute fix plans in order:
1. `/gsd-execute-phase 02 --start 09` - Fix hex orientation (critical)
2. `/gsd-execute-phase 02 --start 08` - Add port rendering (major)
3. Re-run UAT to verify all 15 tests pass

**Expected outcome:** All 15 tests passing, game fully playable
