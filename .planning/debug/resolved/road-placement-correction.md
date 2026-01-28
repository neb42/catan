---
status: resolved
trigger: 'Continue debugging road-placement-too-long. The previous fix made roads TOO SHORT.'
created: 2026-01-28T08:00:00Z
updated: 2026-01-28T08:05:00Z
---

## Current Focus

hypothesis: Previous fix was based on misunderstanding - roads should span FULL edge (corner to corner), not half edge (corner to midpoint)
test: Re-reading code and analyzing edge geometry
expecting: Need to revert changes from previous fix
next_action: Analyze edge geometry and determine correct road rendering

## Symptoms

expected: Road should start at one hex corner and end at the OTHER corner (full edge length from corner to corner)
actual: Road now ends at the midpoint of the edge (only goes halfway)
errors: No console errors
reproduction: Place any road - they all stop halfway
started: Just broke with the previous fix

## Eliminated

## Evidence

- timestamp: 2026-01-28T08:01:00Z
  checked: hexGeometry.ts Edge interface
  found: Edge has start (one corner), end (other corner), and midpoint (center of edge)
  implication: Edge.start and edge.end represent the TWO CORNERS of a hex edge

- timestamp: 2026-01-28T08:02:00Z
  checked: PlacedPieces.tsx line 49
  found: Currently using edge.midpoint as the end point (changed in previous fix)
  implication: Roads are only rendering half the edge length - from corner to center

- timestamp: 2026-01-28T08:03:00Z
  checked: EdgeMarker.tsx line 23
  found: Also using edge.midpoint as the end point (changed in previous fix)
  implication: Both actual roads and preview are rendering incorrectly

## Resolution

root_cause: Previous diagnosis was WRONG. Roads should go corner-to-corner (full edge), not corner-to-midpoint. The "bug" was a misunderstanding - the previous fix (using edge.midpoint) made roads too short.
fix: Reverted both PlacedPieces.tsx and EdgeMarker.tsx to use edge.end instead of edge.midpoint. Roads now render the full edge length from corner to corner as intended.
verification: All tests pass (2/2). Roads now render full edge length from start corner to end corner.
files_changed:

- apps/web/src/components/Board/PlacedPieces.tsx
- apps/web/src/components/Board/EdgeMarker.tsx
