---
phase: quick-010
plan: 01
subsystem: frontend-ui
tags: [react, css-grid, layout, refactor]

requires: [quick-009]
provides:
  - Grid-based layout structure in Game.tsx
  - Structured 2×3 grid replacing absolute positioning

affects: []

tech-stack:
  added: []
  patterns:
    - CSS Grid layout for game UI organization

key-files:
  created: []
  modified:
    - apps/web/src/components/Game.tsx

decisions:
  - decision: Use CSS Grid with 2 rows × 3 columns for Game layout
    rationale: More maintainable and structured than absolute positioning
  - decision: Keep placement overlays with absolute positioning
    rationale: They need to overlay the entire grid during setup phase
  - decision: Grid columns 1fr 2fr 1fr (left | center | right)
    rationale: Board needs more space in center, sidebars get equal space

metrics:
  duration: 78s
  completed: 2026-02-04
---

# Quick Task 010: Change Layout to CSS Grid Summary

**One-liner:** Refactored Game.tsx from absolute positioning to CSS Grid with 2 rows × 3 columns for structured layout management

## What Was Built

Replaced the absolute positioning layout system in Game.tsx with a CSS Grid structure:

**Grid Structure:**

- **Row 1:** Three columns (1fr | 2fr | 1fr)
  - Column 1: GamePlayerList
  - Column 2: Board (gets more space)
  - Column 3: TurnControls + DiceRoller (main game phase only)
- **Row 2:** Spans all 3 columns
  - Left side: ResourceHand + DevCardHand
  - Right side: TradeButton + BuildControls

**What was removed:**

- Absolute positioning from player list, board, turn controls, resource/build sections
- Scale/transform adjustments on GamePlayerList (no longer needed)
- Flex centering wrapper around Board (grid handles centering)

**What was preserved:**

- All conditional rendering logic (placement phase vs main game phase)
- Placement overlays (PlacementBanner, DraftOrderDisplay, PlacementControls) remain absolute
- All modals and overlays (they portal to root)
- DebugPanel, "Show Results" button, Victory overlays
- All game logic and state management

## Tasks Completed

| Task | Name                                              | Commit  | Files    |
| ---- | ------------------------------------------------- | ------- | -------- |
| 1    | Replace absolute positioning with CSS Grid layout | 1176090 | Game.tsx |

## Technical Implementation

### CSS Grid Configuration

```tsx
<Box
  style={{
    display: 'grid',
    gridTemplateRows: '1fr auto',  // First row fills space, second fits content
    gridTemplateColumns: '1fr 2fr 1fr',  // Left sidebar | Board | Right sidebar
    width: '100%',
    height: '100vh',
    gap: '16px',
    padding: '80px 16px 16px',  // Top padding for PlacementBanner space
    position: 'relative',  // For absolute overlays
    overflow: 'hidden',
  }}
>
```

### Grid Cell Placement

**Row 1, Column 1 (Player List):**

```tsx
<Box style={{ gridRow: 1, gridColumn: 1, padding: '16px' }}>
  <GamePlayerList players={players} />
</Box>
```

**Row 1, Column 2 (Board):**

```tsx
<Box
  style={{ gridRow: 1, gridColumn: 2, display: 'flex', alignItems: 'center' }}
>
  <Board board={board} />
</Box>
```

**Row 1, Column 3 (Turn Controls):**

```tsx
<Stack style={{ gridRow: 1, gridColumn: 3, padding: '16px' }}>
  <TurnControls />
  <DiceRoller />
</Stack>
```

**Row 2, Columns 1-3 (Cards & Building):**

```tsx
<Box
  style={{
    gridRow: 2,
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'space-between',
  }}
>
  {/* Left: Cards */}
  {/* Right: Trade & Build */}
</Box>
```

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Grid columns ratio 1fr:2fr:1fr** - Board needs significantly more space in center column, sidebars get equal space
2. **Row 2 uses 'auto' height** - Cards/building controls determine their own height based on content
3. **Removed GamePlayerList scale(0.85)** - No longer needed with proper grid sizing
4. **Placement overlays stay absolute** - They need to overlay the entire grid during setup, not participate in grid flow

## Key Patterns Established

- **CSS Grid for complex layouts** - More maintainable than absolute positioning
- **Semantic grid regions** - Each game UI area has its own clear grid cell
- **Hybrid approach** - Grid for structured layout, absolute for overlays/modals
- **Conditional grid children** - TurnControls/cards only render during main game phase

## Testing Notes

- ✅ TypeScript compilation passes
- ✅ Dev server runs without errors
- ✅ All components preserve their conditional rendering
- ✅ Phase transitions (placement → main game) logic intact

## Next Phase Readiness

**Blockers:** None

**Recommendations:**

- Test visual layout in browser to confirm spacing and alignment
- Verify layout works during both placement and main game phases
- Check responsive behavior if window is resized

**Learnings:**

- CSS Grid dramatically simplifies complex layouts compared to absolute positioning
- Grid gap property provides consistent spacing without manual calculations
- Removing scale transforms improves visual clarity and simplifies debugging
