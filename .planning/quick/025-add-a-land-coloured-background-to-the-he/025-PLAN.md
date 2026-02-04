---
phase: quick-025
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/Board/Board.tsx
  - apps/web/src/components/Board/CoastlineBackground.tsx
autonomous: true

must_haves:
  truths:
    - 'Visible land-colored background extends slightly beyond hexagons'
    - 'Background has wiggly coastline edge effect'
    - 'Hexagons render on top of coastline background'
  artifacts:
    - path: 'apps/web/src/components/Board/CoastlineBackground.tsx'
      provides: 'SVG path with wiggly edge simulating coastline'
      min_lines: 40
    - path: 'apps/web/src/components/Board/Board.tsx'
      provides: 'CoastlineBackground rendered before hexes'
      contains: 'CoastlineBackground'
  key_links:
    - from: 'apps/web/src/components/Board/Board.tsx'
      to: 'apps/web/src/components/Board/CoastlineBackground.tsx'
      via: 'import and render before hexes'
      pattern: 'import.*CoastlineBackground'
---

<objective>
Add a land-colored background behind the board hexagons with a wiggly coastline edge that extends slightly past the hexagons, creating a natural island appearance.

Purpose: Enhance visual appeal by making the board look like a land mass surrounded by water
Output: New CoastlineBackground component with SVG path rendering wiggly coastline
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@apps/web/src/components/Board/Board.tsx
@apps/web/src/components/Board/TerrainHex.tsx
</context>

<tasks>

<task type="auto">
  <name>Create CoastlineBackground component with wiggly SVG path</name>
  <files>apps/web/src/components/Board/CoastlineBackground.tsx</files>
  <action>
Create a new CoastlineBackground component that:
1. Calculates the outer boundary of all hexagons on the board
2. Generates an SVG path that extends ~15-20% beyond the hex edges
3. Uses SVG path commands with bezier curves or noise-based offsets to create a wiggly coastline effect
4. Fills the path with a sand/land color (#D4C4A8 or similar warm tan)
5. Adds subtle drop shadow for depth

Implementation approach:

- Accept board hexes as prop to calculate boundaries
- Use pointy-top hex geometry (vertices at 30° intervals from center)
- For each hex on the perimeter, calculate outer vertices
- Connect vertices with quadratic/cubic bezier curves with randomized control points
- Alternative: Use sine wave pattern along the perimeter for organic coastline feel
- Render as SVG path or polygon with fill before hexagons

The wiggly effect can be achieved by:

- Adding randomized perpendicular offsets to perimeter points (0.5-1.5 hex radius)
- Using sine/cosine functions based on angle around the perimeter
- Applying SVG filters like feTurbulence (computationally simpler than path manipulation)
  </action>
  <verify>Visual inspection: Background extends past hexagons with irregular wavy edge</verify>
  <done>CoastlineBackground component exists and renders land-colored background with wiggly coastline</done>
  </task>

<task type="auto">
  <name>Integrate CoastlineBackground into Board component</name>
  <files>apps/web/src/components/Board/Board.tsx</files>
  <action>
Import and render CoastlineBackground component inside the HexGrid Layout:
1. Import CoastlineBackground at top of Board.tsx
2. Render it BEFORE the hexes.map() call (so it appears behind hexagons)
3. Pass board.hexes as prop
4. Ensure it uses the same Layout coordinate system (inside Layout component)
5. The z-order should be: CoastlineBackground -> TerrainHexes -> Ports -> Robber -> PlacedPieces

Placement in render tree:

```tsx
<Layout ...>
  <CoastlineBackground hexes={board.hexes} />

  {board.hexes.map((hex) => (
    <TerrainHex key={`${hex.q}-${hex.r}`} hex={hex} />
  ))}
  {/* ... rest of components */}
</Layout>
```

Verify visual layering is correct with browser DevTools.
</action>
<verify>npm run dev and visually confirm land background appears behind all hexagons</verify>
<done>Coastline background renders behind hexagons with wiggly edge extending past board</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Land-colored background with wiggly coastline edge behind board hexagons</what-built>
  <how-to-verify>
1. Start dev server: `npm run dev`
2. Navigate to game board (create/join room, start game if needed)
3. Verify:
   - Land-colored background visible behind all hexagons
   - Background extends 15-20% past hex edges
   - Edge has irregular, wiggly coastline appearance (not perfectly circular)
   - Hexagons and all other elements render cleanly on top
   - Sea blue from Paper component visible beyond coastline edge
4. Test zoom/pan to confirm background scales correctly with board
  </how-to-verify>
  <resume-signal>Type "approved" to continue, or describe any visual issues</resume-signal>
</task>

</tasks>

<verification>
- CoastlineBackground.tsx exists and exports component
- Board.tsx imports and renders CoastlineBackground before hexes
- Visual inspection confirms land background with wiggly coastline edge
- Background extends past hexagons appropriately
- All board elements render correctly on top of background
</verification>

<success_criteria>

- Land-colored background visible behind board hexagons
- Background extends 15-20% beyond hex perimeter
- Coastline edge has wiggly, organic appearance
- Visual layering correct: background < hexes < other elements
- Zoom/pan functionality unaffected
  </success_criteria>

<output>
After completion, create `.planning/quick/025-add-a-land-coloured-background-to-the-he/025-SUMMARY.md`
</output>
