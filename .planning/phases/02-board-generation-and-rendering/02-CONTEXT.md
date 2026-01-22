# Phase 2: Board Generation & Rendering - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Generate random Catan board with hexes, numbers, and ports. Display the board visually in the browser with proper hex layout, terrain tiles, number tokens, and port indicators. Board generation follows Catan rules (19 land hexes, no adjacent 6/8, correct port placement).

</domain>

<decisions>
## Implementation Decisions

### Board Visualization & Layout
- **Balance with UI**: Board doesn't fill viewport — leave room for game controls
- **Layout structure**: Player info left | Player actions bottom | Action history right | Board center
- **Device support**: Tablets (iPad Mini 768px minimum), not mobile phones
- **Orientation**: Landscape only
- **Hex orientation**: Pointy-top hexes (⬡) following Catan convention
- **Ocean treatment**: Visible background for ocean with breathing room around playable area
- **View type**: Fixed view (no zoom/pan controls in Phase 2)
- **Board positioning**: Centered in available space

### Visual Hierarchy & Information Display
- **Number tokens**: Smaller subtle indicators (not large overlays)
- **Rare number emphasis**: 6 and 8 use different color to indicate higher probability
- **Terrain tiles**: Use SVG files from `./apps/web/src/assets/tiles`
- **Desert hex**: Use `./apps/web/src/assets/tiles/desert.svg`
- **Robber piece**: Use `./apps/web/src/assets/pieces/robber.svg` on desert hex
- **Port icons**: Located at hex edges from `./apps/web/src/assets/ports` (includes bridge)
- **Port placement**: Fixed orientation, sit in gaps between hexes (not overlapping)
- **Color palette**: Use colors from SVG files, ensure consistency with warm beige background (#F9F4EF)
- **Visual depth**: Add shadows and depth to hexes for 3D effect
- **Terrain differentiation**: SVG tiles provide instant recognizability

### Randomization & Board States
- **Generation timing**: Board generates after countdown finishes and game starts
- **Determinism**: Board can change between sessions (not seeded/deterministic)
- **Host controls**: No regeneration or preview options for host
- **Fairness validation**: Include checks to avoid obviously unfair boards
- **Fairness criteria**: No adjacent 6/8 (from requirements), plus other clustering checks
- **Retry behavior**: Use best attempt if fairness checks fail after multiple retries
- **State persistence**: Store board state in server memory (not database)
- **Debug modes**: Random only — no forced test boards in Phase 2

### Transition & Progressive Disclosure
- **Lobby-to-game**: Instant transition to game view (no intermediate message)
- **Board reveal**: Render instantly with all hexes visible (no animation sequence)
- **Loading state**: Show spinning loader if generation takes time due to fairness retries
- **First-time guidance**: No tooltips or callouts — let players explore naturally

### Copilot's Discretion
- Exact fairness criteria beyond "no adjacent 6/8" (resource clustering, port distribution, number diversity)
- Shadow styling and depth effects implementation
- Hex size calculations for optimal viewport fit
- Spinning loader design and placement
- Retry attempt limits for fairness validation
- Ocean background color and styling

</decisions>

<specifics>
## Specific Ideas

- SVG assets already exist at:
  - Terrain tiles: `./apps/web/src/assets/tiles`
  - Pieces (robber): `./apps/web/src/assets/pieces/robber.svg`
  - Ports (including bridge): `./apps/web/src/assets/ports`
- Use react-hexgrid library for hex grid rendering (mentioned in ROADMAP.md deliverables)
- Warm beige background (#F9F4EF) established in Phase 1.1 should continue
- Four-quadrant layout maintains consistency with lobby's centered card approach

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-board-generation-and-rendering*
*Context gathered: 2026-01-22*
