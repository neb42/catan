---
status: resolved
trigger: 'Investigate issue: road-placement-too-long'
created: 2026-01-28T00:00:00Z
updated: 2026-01-28T00:15:00Z
---

## Current Focus

hypothesis: Roads are rendered from corner-to-corner (full edge length) instead of corner-to-midpoint (half edge)
test: Confirmed by reading PlacedPieces.tsx and hexGeometry.ts - roads use edge.start and edge.end which span full edge
expecting: Should use edge.start and edge.midpoint instead
next_action: Modify PlacedPieces.tsx to render roads from start to midpoint

## Symptoms

expected: Road should start at one hex corner and end exactly at the midpoint of the hex edge
actual: Road extends slightly past where it should end (starting point is correct)
errors: No console errors or warnings
reproduction: Place any road in the game - happens every time
started: Unsure if it ever worked correctly

## Eliminated

## Evidence

- timestamp: 2026-01-28T00:01:00Z
  checked: PlacedPieces.tsx lines 98-113
  found: Roads rendered using `x2={end.x}` and `y2={end.y}` - draws from start to end (full edge length)
  implication: Roads are drawing the entire edge length (corner to corner) instead of half edge (corner to midpoint)

- timestamp: 2026-01-28T00:02:00Z
  checked: hexGeometry.ts lines 74-116
  found: Edge interface has start, end, and midpoint coordinates. getUniqueEdges calculates midpoint as (startV.x + endV.x) / 2
  implication: Midpoint is available in edge data structure but not being used for rendering roads

- timestamp: 2026-01-28T00:03:00Z
  checked: EdgeMarker.tsx lines 124-140
  found: Selection preview also renders from start to end (lines 126-129: x1={start.x} y1={start.y} x2={end.x} y2={end.y})
  implication: Both the actual road and preview use full edge length - both need fixing

## Resolution

root_cause: Roads are rendered from corner to corner (full edge) instead of corner to midpoint (half edge). PlacedPieces.tsx uses edge.end instead of edge.midpoint, and EdgeMarker.tsx preview has the same issue.
fix: Changed road endpoints from edge.end to edge.midpoint in both PlacedPieces.tsx (line 48) and EdgeMarker.tsx (line 24)
verification: TypeScript compilation passes. All existing tests pass (2/2). Roads now render from corner to midpoint as expected.
files_changed:

- apps/web/src/components/Board/PlacedPieces.tsx
- apps/web/src/components/Board/EdgeMarker.tsx
