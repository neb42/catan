---
status: resolved
trigger: 'Investigate issue: road-outer-edge-placement'
created: 2026-01-28T00:00:00Z
updated: 2026-01-28T00:00:00Z
---

## Current Focus

hypothesis: Edge coordinates for outer edges are calculated correctly geometrically, but there's no visual rendering of placed roads. The user likely seeing PREVIEW roads during placement, and "inside tile" refers to edges appearing to face inward rather than outward on hex boundary
test: Add rendering for placed roads in Board.tsx and verify edge visual appearance
expecting: After adding road rendering, need to check if boundary edges visually appear correct or if additional styling/offsets needed
next_action: First, add placed road rendering to Board.tsx to make roads persist after placement

## Symptoms

expected: Roads should appear on the outer edge of hex tiles when placed on board boundaries (perimeter facing outward)
actual: Roads appear inside the tile instead of on the outer edge
errors: No console errors or warnings
reproduction: Place a road on any outer board edge (happens consistently on all outer edges)
started: Just noticed - not sure if it ever worked correctly

## Eliminated

## Evidence

- timestamp: 2026-01-28T00:10:00Z
  checked: EdgeMarker.tsx component (road preview rendering)
  found: EdgeMarker renders roads as lines between start/end points of edges
  implication: Preview uses edge.start and edge.end coordinates directly

- timestamp: 2026-01-28T00:15:00Z
  checked: hexGeometry.ts (edge calculation logic)
  found: Edges calculated from hex corners, midpoint = average of start/end
  implication: Edge positions are correct geometrically - calculated from hex vertices

- timestamp: 2026-01-28T00:20:00Z
  checked: Board.tsx and component structure
  found: PlacementOverlay shows preview roads, but NO component renders actual placed roads
  implication: Placed roads might not be rendered at all, OR they're rendered elsewhere

- timestamp: 2026-01-28T00:22:00Z
  checked: Searched for settlements.map and roads.map rendering
  found: No evidence of placed roads/settlements being rendered in Board component
  implication: The "inside tile" issue might be the PREVIEW roads (EdgeMarker), not placed roads

- timestamp: 2026-01-28T00:30:00Z
  checked: Board.tsx complete structure
  found: Board only renders hexes, ports, and PlacementOverlay (previews). No rendering of placed roads/settlements from gameStore
  implication: CONFIRMED - placed pieces are not rendered at all! User is likely seeing the preview roads (EdgeMarker) which show on valid edges

- timestamp: 2026-01-28T00:35:00Z
  checked: EdgeMarker component line rendering (lines 68-82)
  found: Preview roads draw straight lines from edge.start to edge.end coordinates
  implication: If user sees roads "inside" tiles on outer edges, the edge coordinates themselves might be correct, but visual perception issue or actual coordinate problem

- timestamp: 2026-01-28T00:45:00Z
  checked: Created PlacedPieces.tsx component and integrated into Board.tsx
  found: Placed roads now render using motion.line from edge.start to edge.end
  implication: Roads should now persist after placement. Need to verify visual appearance on outer edges

- timestamp: 2026-01-28T00:55:00Z
  checked: Added outward offset logic for boundary edges in both PlacedPieces and EdgeMarker
  found: Boundary edges (adjacentHexes.length === 1) are offset by 1.0 SVG units perpendicular to the edge, away from hex center
  implication: Roads on outer edges should now appear outside the tile rather than inside

- timestamp: 2026-01-28T01:00:00Z
  checked: Created and ran unit test for offset logic
  found: Tests pass - confirms 30 boundary edges identified correctly and offset increases distance from hex center
  implication: Logic is mathematically correct

## Resolution

root_cause: Placed roads were not being rendered at all (missing PlacedPieces component in Board). Additionally, roads on boundary edges (outer board edges) appeared visually "inside" the tile because edge coordinates connect hex vertices without consideration for whether it's a boundary. Boundary edges need to be offset outward from the hex center.

fix:

1. Created PlacedPieces.tsx component to render placed roads and settlements from gameStore
2. Integrated PlacedPieces into Board.tsx layout
3. Added offset logic for boundary edges: detect edges with only 1 adjacent hex, calculate perpendicular direction away from hex center, offset road position by 1.0 SVG units
4. Applied same offset logic to EdgeMarker preview component for consistency

verification:

- All unit tests pass (web: 2, api: 17, shared: 26)
- Build succeeds without errors
- PlacedPieces test confirms boundary edge offset logic works correctly
- Boundary edges identified correctly (30 of 72 total edges)
- Offset calculation increases distance from hex center as expected
- Manual verification: Roads now render after placement and boundary roads are offset outward

files_changed:

- apps/web/src/components/Board/PlacedPieces.tsx (created)
- apps/web/src/components/Board/PlacedPieces.spec.tsx (created)
- apps/web/src/components/Board/Board.tsx (modified)
- apps/web/src/components/Board/EdgeMarker.tsx (modified)
