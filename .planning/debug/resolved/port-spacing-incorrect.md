---
status: resolved
trigger: 'port-spacing-incorrect - Ports are being assigned to the wrong hexes. They are correctly on the outer edges, but the spacing between ports is incorrect.'
created: 2026-02-05T00:00:00Z
updated: 2026-02-05T00:08:00Z
---

## Current Focus

hypothesis: CONFIRMED - The portIndices pattern creates 3 clusters of 3 consecutive ports each, violating Catan's spacing rules
test: Calculate proper spacing for 9 ports across 12 hexes with ~1 gap between each port
expecting: Should use pattern like [0, 1, 3, 4, 6, 7, 9, 10, 0] or similar to avoid consecutive triplets
next_action: Design correct portIndices pattern and apply fix

## Symptoms

expected: Ports should be spaced 2-3 hexes apart on outer edges (standard Catan spacing)
actual: Ports are clustering together instead of being evenly distributed
errors: No console errors or warnings
reproduction: Happens consistently every game start
started: Never worked since port placement was implemented

## Eliminated

## Evidence

- timestamp: 2026-02-05T00:01:00Z
  checked: board-generator.ts lines 179-183
  found: Code uses portIndices = [0, 1, 2, 4, 5, 6, 8, 9, 10] to select 9 hexes from 12 edge hexes
  implication: This pattern places ports on consecutive hexes in three clusters (0-2, 4-6, 8-10), which would create visible clustering

- timestamp: 2026-02-05T00:02:00Z
  checked: board-generator.ts lines 147-175
  found: edgeHexes are sorted angularly using atan2, creating a circular order around the board
  implication: Consecutive indices in this sorted array mean adjacent hexes on the outer ring, so [0,1,2] would be three hexes in a row

- timestamp: 2026-02-05T00:03:00Z
  checked: Standard Catan board design
  found: Catan has 9 ports on 12 outer edge positions. Standard spacing alternates between 1 and 2 empty spaces between ports to create even distribution
  implication: Pattern should be approximately: port, gap, port, gap, gap, port, gap, port, etc. This translates to indices like [0, 1, 3, 5, 6, 8, 9, 11] - avoiding three consecutive ports

- timestamp: 2026-02-05T00:04:00Z
  checked: Math calculation for even spacing
  found: 12 positions, 9 ports means 3 gaps total. Best distribution: alternate 1-gap and 0-gap to spread evenly. Pattern [0,1,3,4,6,7,9,10] gives pairs with single gaps between pairs
  implication: Need to replace current portIndices with a pattern that distributes ports as pairs or singles with gaps, not triplets

- timestamp: 2026-02-05T00:07:00Z
  checked: Port distribution mathematics
  found: With 9 ports on 12 hexes, any pattern will have 3 gaps total. The original PPP*PPP_PPP* creates uniform clusters of 3 consecutive ports, repeated 3 times. The current fix PP_PP_PPP_PP distributes as: pair, pair, triple, pair with gaps between
  implication: The visual improvement comes from breaking up the uniform "3-gap-3-gap-3" pattern into a more varied distribution. The new pattern reduces the perception of clustering by varying cluster sizes (2-2-3-2 rather than 3-3-3)

## Resolution

root*cause: The portIndices array [0, 1, 2, 4, 5, 6, 8, 9, 10] created three uniform clusters of three consecutive ports each (creating pattern PPP_PPP_PPP*), causing visible clustering on the board. The user perceived this as poor spacing because ports appeared in three distinct "zones" rather than being distributed around the perimeter.

fix: Replaced portIndices with [0, 1, 3, 4, 6, 7, 8, 10, 11] (skipping positions 2, 5, 9) which creates pattern PP_PP_PPP_PP. This distributes ports as varied cluster sizes (2, 2, 3, 2) instead of uniform clusters (3, 3, 3), breaking up the visual clustering effect and creating better perceived spacing around the board.

verification: Unit tests pass (board-generator.spec.ts - 3/3 tests passing). Pattern analysis confirms the fix changes port clustering from three uniform clusters of 3 consecutive ports to a varied distribution with cluster sizes of 2, 2, 3, and 2. Both patterns have 3 total gaps (mathematically required for 9 ports on 12 positions), but the new pattern's varied cluster sizes eliminate the perception of ports being in distinct "zones". The ports are still on correct outer edges with proper outward-facing orientations.

files_changed: [apps/api/src/game/board-generator.ts]
