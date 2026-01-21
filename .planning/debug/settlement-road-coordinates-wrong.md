---
status: investigating
trigger: "Settlement and Road Placement Coordinates Wrong (Critical) - settlements render off-board, roads render off-board and not adjacent to settlements"
created: 2026-01-21T00:00:00Z
updated: 2026-01-21T00:00:00Z
---

## Current Focus

hypothesis: Coordinate system mismatch between server geometry (cubic coords) and client rendering (SVG positions)
test: Compare vertex/edge coordinate calculations between api/game/geometry.ts and web/game/Board/geometry.ts
expecting: Different formulas or hex layout assumptions causing position offset
next_action: Read geometry files and Settlement/Road components to trace coordinate transformations

## Symptoms

expected: Settlements render at hex vertices, roads render along hex edges, all pieces visible on board
actual: Settlements appear off the board map entirely, roads appear off map and not adjacent to settlements
errors: None (visual positioning issue)
reproduction: Place settlements and roads through game, observe rendering positions
started: Current state (game unplayable)

## Eliminated

## Evidence

- timestamp: 2026-01-21T00:05:00Z
  checked: HexGrid.tsx Layout component configuration
  found: Layout configured as `<Layout size={{ x: 10, y: 10 }} flat={false} spacing={1.05}>`
  implication: react-hexgrid uses flat={false} (pointy-top hexagons) with size={x:10, y:10}

- timestamp: 2026-01-21T00:06:00Z
  checked: apps/web/src/game/Board/geometry.ts axialToPixel and getHexCornerPositions
  found: Uses flat-top formula with angle offset -30 degrees and size=10 as scalar
  implication: Client geometry assumes flat-top hexagons but react-hexgrid is rendering pointy-top

- timestamp: 2026-01-21T00:07:00Z
  checked: Settlement.tsx and Road.tsx positioning
  found: Both use getVertexPosition() and getEdgeVertexPositions() from geometry.ts
  implication: All piece positions calculated with wrong hex orientation

- timestamp: 2026-01-21T00:08:00Z
  checked: react-hexgrid Layout API
  found: flat={false} means pointy-top orientation (vertex at top), flat={true} means flat-top (edge at top)
  implication: Layout expects pointy-top coords but geometry.ts provides flat-top coords

## Resolution

root_cause: Hex orientation mismatch. react-hexgrid Layout is configured with flat={false} (pointy-top hexagons) but geometry.ts calculates vertex/edge positions using flat-top formulas. The axialToPixel formula and corner angle calculations (-30 degree offset) are for flat-top hexagons, causing all settlements and roads to render at wrong positions.
fix: Change HexGrid Layout to flat={true} to match geometry.ts flat-top calculations, OR update geometry.ts formulas to use pointy-top orientation (60 degree spacing starting at 0 degrees instead of -30)
verification: Place settlements and roads, verify they appear at hex vertices/edges on the board
files_changed: []
