---
phase: quick-010
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [apps/web/src/components/Game.tsx]
autonomous: true

must_haves:
  truths:
    - 'Layout uses CSS Grid with 2 rows and 3 columns'
    - 'First row shows player list, board, and turn controls in separate grid cells'
    - 'Second row shows cards and building controls spanning all 3 columns'
  artifacts:
    - path: 'apps/web/src/components/Game.tsx'
      provides: 'Grid-based layout structure'
      min_lines: 200
  key_links:
    - from: 'Game.tsx grid container'
      to: 'child components (GamePlayerList, Board, TurnControls)'
      via: 'CSS Grid cell placement'
      pattern: 'gridColumn|gridRow'
---

<objective>
Refactor Game.tsx layout from absolute positioning to CSS Grid with 2 rows × 3 columns.

Purpose: Create a more structured, maintainable layout that clearly defines regions for different UI components.

Output:

- First row: player list | board | turn controls (3 equal columns)
- Second row: cards & building controls spanning full width
  </objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/Game.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace absolute positioning with CSS Grid layout</name>
  <files>apps/web/src/components/Game.tsx</files>
  <action>
Replace the current absolute-positioned layout with a CSS Grid structure:

**Grid Structure:**

- Container: `display: 'grid'`, `gridTemplateRows: '1fr auto'`, `gridTemplateColumns: '1fr 2fr 1fr'`
- Row 1, Column 1: GamePlayerList (remove absolute positioning, scale, transforms)
- Row 1, Column 2: Board (remove flex centering wrapper)
- Row 1, Column 3: TurnControls + DiceRoller during main game phase (stack vertically)
- Row 2, Columns 1-3: Cards and building controls spanning full width (`gridColumn: '1 / -1'`)

**What to preserve:**

- Keep all conditional rendering logic (placementPhase checks, isMainGamePhase checks)
- Keep PlacementBanner, DraftOrderDisplay, PlacementControls for placement phase
- Keep all modals and overlays (they portal to root, not affected by grid)
- Keep DebugPanel
- Keep "Show Results" button positioning
- Keep Victory overlays/modals

**What to remove:**

- All `position: 'absolute'` styling from player list, board wrapper, turn controls, resource/build sections
- Remove transform/scale adjustments on GamePlayerList
- Remove explicit top/left/right/bottom positioning
- Remove the flex centering Box wrapper around Board

**Implementation approach:**

1. Change root Box to use CSS Grid with 2 rows × 3 columns
2. Place GamePlayerList in grid cell (row 1, col 1) with padding
3. Place Board directly in grid cell (row 1, col 2) - grid will handle centering
4. Place TurnControls/DiceRoller in grid cell (row 1, col 3) as a vertical Stack
5. Place ResourceHand, DevCardHand, TradeButton, BuildControls in grid cell (row 2, cols 1-3) as a horizontal layout
6. Keep placement phase UI (PlacementBanner, DraftOrderDisplay, PlacementControls) with absolute positioning OUTSIDE grid (they overlay during setup)
7. Keep all modals and overlays as-is (they're already independent)

**Specific CSS Grid properties:**

```tsx
// Root container
style={{
  display: 'grid',
  gridTemplateRows: '1fr auto',  // First row takes available space, second row fits content
  gridTemplateColumns: '1fr 2fr 1fr',  // Left sidebar | Board (larger) | Right sidebar
  width: '100%',
  height: '100vh',
  backgroundColor: '#F9F4EF',
  gap: '16px',
  padding: '80px 16px 16px',  // Top padding for PlacementBanner space
  position: 'relative',  // For absolute overlays
  overflow: 'hidden',
}}
```

  </action>
  <verify>
Run `npx nx serve web` and visually inspect:
1. Player list appears in left column
2. Board appears centered in middle column
3. Turn controls/dice appear in right column during main game
4. Cards and building controls appear in bottom row spanning full width
5. Placement phase UI still overlays correctly
6. No layout breaks during phase transitions
  </verify>
  <done>
Game.tsx uses CSS Grid with 2 rows × 3 columns. First row shows player list | board | turn controls. Second row shows cards/building spanning 3 columns. All components render in correct grid cells without absolute positioning (except placement overlays).
  </done>
</task>

</tasks>

<verification>
- [ ] Layout uses `display: 'grid'` with correct row/column template
- [ ] Player list, board, and turn controls occupy separate columns in row 1
- [ ] Cards and building controls span all 3 columns in row 2
- [ ] No absolute positioning on grid children (except placement overlays)
- [ ] All phase transitions (placement → main game) work correctly
- [ ] Visual appearance is clean and structured
</verification>

<success_criteria>

- Game.tsx root container uses CSS Grid layout
- First row has 3 columns: player list | board | turn controls
- Second row spans full width with cards and building controls
- All components render correctly in their grid cells
- Layout is responsive and maintains structure during gameplay
  </success_criteria>

<output>
After completion, create `.planning/quick/010-change-the-layout-to-be-a-grid-with-two-/010-SUMMARY.md`
</output>
