---
phase: quick-025
plan: 01
subsystem: ui
tags: [react, svg, geometry, board, visual-design]

# Dependency graph
requires:
  - phase: quick-011
    provides: Fixed-size zoomable board with pan controls
provides:
  - Land-colored background behind hexagons with adaptive extension
  - Straight-edge perimeter with rounded corners
  - Concave region detection for tight fitting in inward curves
affects: [board-rendering, visual-design]

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      concave-hull-detection,
      adaptive-geometry-extension,
      svg-path-rounded-corners,
    ]

key-files:
  created:
    - apps/web/src/components/Board/CoastlineBackground.tsx
  modified:
    - apps/web/src/components/Board/Board.tsx

key-decisions:
  - 'Use actual perimeter edges instead of convex hull for accurate boundary'
  - 'Adaptive extension: 5-8% in concave regions, 15-20% in convex regions'
  - 'Straight edges with rounded corners instead of organic wiggly coastline'
  - 'Corner radius adapts to edge length (max 3 units or 40% of edge)'

patterns-established:
  - 'Neighbor detection for perimeter edge identification using hex axial coordinates'
  - 'Interior angle calculation to detect concave vs convex vertices'
  - 'SVG path with L (line) commands and Q (quadratic bezier) for rounded corners'

# Metrics
duration: 8min
completed: 2026-02-04
---

# Quick Task 025: Add Land-Coloured Background to Hexagons

**Geometric sand-colored background with straight edges and rounded corners, extending adaptively beyond hexagon perimeter**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-04T22:41:04Z
- **Completed:** 2026-02-04T22:48:58Z
- **Tasks:** 3 (including 2 iteration fixes based on user feedback)
- **Files modified:** 2

## Accomplishments

- Created CoastlineBackground component rendering land-colored (#D4C4A8) background behind board
- Implemented perimeter edge detection by checking for missing hex neighbors
- Adaptive extension algorithm: tight in concave regions (5-8%), extended in convex regions (15-20%)
- Clean geometric appearance with straight edges and smooth rounded corners

## Task Commits

Each task/fix was committed atomically:

1. **Initial implementation** - `dae7ba3` (feat)
   - Created CoastlineBackground component with convex hull approach
   - Integrated into Board.tsx before hexes for proper z-ordering

2. **Iteration 1: Tighter concave regions** - `b61fdab` (fix)
   - Replaced convex hull with actual perimeter edge detection
   - Added interior angle calculation for concave vs convex detection
   - Implemented adaptive extension based on local curvature

3. **Iteration 2: Straight edges with rounded corners** - `865606d` (fix)
   - Removed wiggly/organic bezier curves with sine/cosine offsets
   - Changed to straight line segments (SVG L commands) between vertices
   - Added smooth rounded corners using quadratic bezier (SVG Q commands)

## Files Created/Modified

- `apps/web/src/components/Board/CoastlineBackground.tsx` - SVG path component for background with perimeter detection and adaptive extension
- `apps/web/src/components/Board/Board.tsx` - Integrated CoastlineBackground before hexes in Layout

## Decisions Made

**1. Use actual perimeter edges instead of convex hull**

- Rationale: Convex hull always bulges outward, ignoring concave regions where hexagons dip inward
- Implementation: Detect perimeter by checking for missing neighbors using hex axial coordinate offsets

**2. Adaptive extension based on interior angles**

- Rationale: User feedback "make it tighter where the hexagon dips in" required different extension for concave vs convex regions
- Concave regions (interior angle < π): 5-8% extension - hugs hexagons tightly
- Convex regions (interior angle > π): 15-20% extension - maintains island appearance

**3. Straight edges with rounded corners instead of wiggly coastline**

- Rationale: User feedback "dont use squiggly lines. straight hexagon with curved corners"
- Removed all sine/cosine wave offsets and irregular variations
- SVG path uses L (line) commands for straight edges, Q (quadratic bezier) for smooth corner transitions
- Result: Clean geometric outline, not organic coastline

**4. Adaptive corner radius**

- Rationale: Prevent corner radius from consuming entire short edges
- Formula: `min(3 units, 40% of edge length)`
- Ensures corners scale appropriately with perimeter geometry

## Deviations from Plan

None - plan executed as written, with iterative refinements based on user feedback during checkpoint verification loop.

## Issues Encountered

**User feedback iterations (2 cycles):**

1. First verification: "make it tighter where the hexagon dips in"
   - Solution: Replaced convex hull with concave-aware perimeter detection
2. Second verification: "dont use squiggly lines. straight hexagon with curved corners"
   - Solution: Removed organic bezier curves, implemented straight edges with rounded corners

Both iterations were part of normal checkpoint verification flow, not plan deviations.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Background renders correctly at all zoom levels (tested with board zoom/pan from quick-011)
- Z-ordering correct: background < hexes < ports < robber < pieces
- No performance impact observed (single SVG path element)
- Visual polish complete for board component

## Technical Implementation Details

**Perimeter Edge Detection:**

- For each hex, check 6 neighbors using axial coordinate offsets
- Neighbors array maps edge index to neighbor coordinates (pointy-top hex)
- Edge without neighbor is perimeter edge

**Interior Angle Calculation:**

- Uses atan2 to compute vectors from current vertex to previous/next
- Interior angle = angle2 - angle1 (normalized to 0-2π range)
- angle > π indicates convex (outward), angle < π indicates concave (inward)

**SVG Path Generation:**

- Calculate extension factor per vertex based on interior angle
- Extend vertices outward from centroid by calculated factor
- Draw straight lines (L) between extended vertices
- Insert quadratic bezier (Q) at each corner for rounding
- Corner control point is the original vertex position
- Before/after points offset from vertex by adaptive radius

---

_Phase: quick-025_
_Completed: 2026-02-04_
