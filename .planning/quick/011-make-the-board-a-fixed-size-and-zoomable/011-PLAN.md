---
phase: quick-011
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/Board/Board.tsx
  - apps/web/src/components/Game.tsx
autonomous: true

must_haves:
  truths:
    - 'Board maintains fixed dimensions instead of scaling to container'
    - 'User can zoom in/out on the board using mouse wheel'
    - 'User can pan the board by dragging'
  artifacts:
    - path: 'apps/web/src/components/Board/Board.tsx'
      provides: 'Board with fixed SVG viewBox and zoom/pan controls'
      min_lines: 150
  key_links:
    - from: 'apps/web/src/components/Board/Board.tsx'
      to: 'wheel event listener'
      via: 'onWheel handler for zoom'
      pattern: 'onWheel.*scale'
    - from: 'apps/web/src/components/Board/Board.tsx'
      to: 'mouse event listeners'
      via: 'onMouseDown/Move/Up for pan'
      pattern: 'onMouse(Down|Move|Up)'
---

<objective>
Make the Catan board a fixed size with zoom and pan capabilities for better control and visibility.

Purpose: Currently the board scales to fit its container, which can make pieces hard to click. A fixed-size board with zoom/pan gives users control over view scale and position.

Output: Board component with fixed dimensions, mouse wheel zoom, and drag-to-pan functionality.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/Board/Board.tsx
@apps/web/src/components/Game.tsx
</context>

<tasks>

<task type="auto">
  <name>Add zoom and pan state management to Board component</name>
  <files>apps/web/src/components/Board/Board.tsx</files>
  <action>
    Add state management for zoom and pan to Board component:
    
    1. Add useState hooks for:
       - scale: number (default 1, min 0.5, max 2)
       - offset: {x: number, y: number} (default {x: 0, y: 0})
       - isPanning: boolean (for drag state)
       - panStart: {x: number, y: number} | null (mouse position when drag starts)
    
    2. Add zoom handler:
       - onWheel event on wrapper div
       - Prevent default behavior
       - Calculate scale change: delta * -0.001 (invert direction)
       - Clamp scale between 0.5 and 2
       - Apply zoom centered on mouse position (adjust offset to zoom toward cursor)
    
    3. Add pan handlers:
       - onMouseDown: Set isPanning true, record panStart position
       - onMouseMove: If isPanning, calculate delta and update offset
       - onMouseUp: Set isPanning false, clear panStart
       - onMouseLeave: Same as onMouseUp (stop panning if mouse leaves)
       - Use cursor: 'grab' when not panning, 'grabbing' when panning
    
    4. Change HexGrid viewBox to fixed size:
       - Current: viewBox="-50 -50 100 100"
       - New: Calculate viewBox from scale and offset:
         - width/height in viewBox units: 100 / scale
         - x/y position: -50 - (offset.x / scale), -50 - (offset.y / scale)
       - This makes the board fixed size with user-controlled zoom/pan
    
    5. Remove width/height="100%" from HexGrid:
       - Use fixed dimensions (e.g., width={800} height={600})
       - This prevents auto-scaling to container
  </action>
  <verify>
    Start dev server with `npx nx serve web`, open browser:
    1. Verify board renders at fixed size (not filling full container)
    2. Test mouse wheel zoom - board should zoom in/out (0.5x to 2x)
    3. Test click-drag pan - board should move with mouse
    4. Verify cursor changes to grabbing hand during drag
    5. Verify zoom centers on mouse position (not corner)
  </verify>
  <done>
    Board displays at fixed size with:
    - Mouse wheel zoom (0.5x - 2x scale)
    - Click-drag pan
    - Proper cursor feedback (grab/grabbing)
    - Zoom centered on mouse position
  </done>
</task>

<task type="auto">
  <name>Update Game layout to accommodate fixed-size board</name>
  <files>apps/web/src/components/Game.tsx</files>
  <action>
    Update Game.tsx grid layout to center the fixed-size board:
    
    1. Change board cell (Row 1, Column 2) styling:
       - Add: overflow: 'auto' (for scrolling if board larger than container)
       - Keep: alignItems: 'center', justifyContent: 'center'
       - This allows board to be scrollable if zoomed large
    
    2. Optional: Add min/max constraints to grid columns:
       - Current: gridTemplateColumns: '1fr 2fr 1fr'
       - Consider: 'minmax(250px, 1fr) minmax(600px, 2fr) minmax(250px, 1fr)'
       - Ensures center column has minimum space for board
  </action>
  <verify>
    With dev server running:
    1. Verify board is centered in middle column
    2. Verify scrollbars appear if board zoomed larger than container
    3. Verify side columns (players, controls) remain visible
    4. Test at different window sizes (resize browser)
  </verify>
  <done>
    Game layout properly displays fixed-size board:
    - Board centered in middle column
    - Scrollable when zoomed beyond container
    - Side columns remain functional
    - Responsive to window resize
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Fixed-size board with zoom (mouse wheel) and pan (click-drag) controls
  </what-built>
  <how-to-verify>
    1. Start dev server: `npx nx serve web`
    2. Open http://localhost:4200
    3. Create/join a game room
    4. Once board loads, test interactions:
       - Mouse wheel up/down should zoom board (0.5x to 2x)
       - Click-drag on empty board space should pan the view
       - Cursor should change to grabbing hand during drag
       - Zoom should center on mouse cursor position
    5. Test edge cases:
       - Zoom fully out (0.5x) - board should remain visible
       - Zoom fully in (2x) - should see detail, no visual glitches
       - Pan to edges - board should move smoothly
       - Verify piece clicks still work (settlements, roads)
       - Verify placement overlay still works during setup
  </how-to-verify>
  <resume-signal>
    Type "approved" if zoom/pan works smoothly, or describe any issues with specific interactions
  </resume-signal>
</task>

</tasks>

<verification>
- Board renders at fixed size (not auto-scaling to container)
- Mouse wheel zooms board between 0.5x and 2x scale
- Click-drag pans board smoothly
- Cursor changes appropriately (grab/grabbing)
- Zoom centers on mouse cursor position
- Game layout accommodates fixed board with scrolling
- All existing interactions (placement, building, robber) work correctly
</verification>

<success_criteria>

- User can control board zoom with mouse wheel (0.5x - 2x)
- User can pan board by clicking and dragging
- Board maintains fixed dimensions instead of filling container
- Visual feedback (cursor change) during interactions
- No regression in existing game functionality
  </success_criteria>

<output>
After completion, create `.planning/quick/011-make-the-board-a-fixed-size-and-zoomable/011-SUMMARY.md`
</output>
