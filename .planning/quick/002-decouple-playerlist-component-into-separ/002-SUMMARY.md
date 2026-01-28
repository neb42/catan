---
phase: quick-002
plan: 01
subsystem: ui-components
tags: [react, component-refactoring, separation-of-concerns]
completed: 2026-01-28
duration: 2m 21s

requires:
  - Phase 3 (Initial Placement) - Player list component with turn indicators

provides:
  - LobbyPlayerList component for interactive lobby phase
  - GamePlayerList component for display-only game phase
  - Cleaner component API with purpose-specific props

affects:
  - Future lobby UI changes isolated to LobbyPlayerList
  - Future game UI changes isolated to GamePlayerList

tech-stack:
  added: []
  patterns:
    - Component specialization by context
    - Separation of interactive vs display-only UI

key-files:
  created:
    - apps/web/src/components/LobbyPlayerList.tsx
    - apps/web/src/components/GamePlayerList.tsx
  modified:
    - apps/web/src/components/Lobby.tsx
    - apps/web/src/components/Game.tsx
  deleted:
    - apps/web/src/components/PlayerList.tsx

decisions: []
---

# Quick Task 002: Decouple PlayerList Component Summary

**One-liner:** Split PlayerList into LobbyPlayerList (interactive with color picker/ready toggle) and GamePlayerList (display-only with turn indicator)

## Objective

Split the shared PlayerList component into two purpose-specific variants to eliminate unused props and improve maintainability. The original PlayerList served both lobby (interactive) and game (display-only) contexts, requiring callbacks that were stubbed out during game phase.

## What Was Built

### LobbyPlayerList Component

- **Purpose:** Interactive player list for lobby phase
- **Features:**
  - 4-slot grid layout with empty slot rendering ("Waiting for player...")
  - Color picker for current player (8 color swatches)
  - Ready badge click to toggle ready state
  - Player avatars with initials
  - Motion animations
- **Props:** `players`, `currentPlayerId`, `onColorChange`, `onReadyToggle`
- **File:** `apps/web/src/components/LobbyPlayerList.tsx` (198 lines)

### GamePlayerList Component

- **Purpose:** Display-only player list for game phase
- **Features:**
  - 2x2 grid layout (no empty slots)
  - Turn indicator with pulse animation
  - "Taking Turn" badge for active player
  - Smaller, compact cards suitable for sidebar
  - Uses `useCurrentPlayer` hook for active player detection
- **Props:** `players` only (no callbacks)
- **File:** `apps/web/src/components/GamePlayerList.tsx` (122 lines)

### Integration

- **Lobby.tsx:** Updated to use `LobbyPlayerList` with all interactive props
- **Game.tsx:** Updated to use `GamePlayerList` with only `players` prop
- **PlayerList.tsx:** Removed (no longer needed)

## Technical Implementation

### Component Structure

Both components maintain visual consistency with the original design:

- Same color mapping and hex values
- Consistent avatar styling with initials
- Card-based layout with Mantine UI components
- Motion/React animations for visual feedback

### Key Differences

| Feature                 | LobbyPlayerList       | GamePlayerList              |
| ----------------------- | --------------------- | --------------------------- |
| Layout                  | 4-slot grid (1fr 1fr) | 2x2 grid (1fr 1fr)          |
| Empty slots             | Yes                   | No                          |
| Color picker            | Yes (for self)        | No                          |
| Ready toggle            | Yes (for self)        | No                          |
| Turn indicator          | No                    | Yes                         |
| Card size               | Large (220px min)     | Compact (140px min)         |
| Avatar size             | 80px                  | 60px                        |
| Active player detection | Via prop              | Via `useCurrentPlayer` hook |

### Type Safety

- Both components use strongly-typed props
- `LobbyPlayerList` requires callbacks for interactivity
- `GamePlayerList` has minimal surface area (single prop)

## Deviations from Plan

None - plan executed exactly as written.

## Test Results

### Build Verification

```bash
npx nx build web
✓ Built successfully in 2.24s
```

### Type Check

```bash
npx nx typecheck web
✓ Type check passed
```

### Import Verification

- ✓ Lobby.tsx imports and uses LobbyPlayerList
- ✓ Game.tsx imports and uses GamePlayerList
- ✓ No references to old PlayerList.tsx remain

## Commits

| Task | Commit  | Message                                                                             |
| ---- | ------- | ----------------------------------------------------------------------------------- |
| 1    | 16de152 | feat(quick-002): create LobbyPlayerList component                                   |
| 2    | aca6039 | feat(quick-002): create GamePlayerList component                                    |
| 3    | 36efc3e | refactor(quick-002): update Lobby/Game to use new components, remove old PlayerList |

## Next Phase Readiness

### Unblocks

- Future lobby UI enhancements (e.g., player stats, kick buttons) isolated to LobbyPlayerList
- Future game UI enhancements (e.g., resource counts, VP display) isolated to GamePlayerList

### Recommendations

- Consider adding tests for both components (visual regression or unit tests)
- GamePlayerList could be further optimized for sidebar placement (vertical stack layout)
- Color picker in LobbyPlayerList could be extracted to a shared component if reused elsewhere

### Blockers

None.

## Lessons Learned

1. **Component specialization improves maintainability:** Separate components with focused responsibilities are easier to modify and test than multi-purpose components with conditional logic.

2. **Prop drilling can be eliminated early:** GamePlayerList uses `useCurrentPlayer` hook directly rather than receiving `currentPlayerId` as a prop, reducing coupling.

3. **Stubbed callbacks are a code smell:** Empty function props (`() => {}`) in Game.tsx indicated the need for component separation.

## Metadata

- **Execution time:** 2 minutes 21 seconds
- **Lines added:** 320
- **Lines removed:** 229
- **Net change:** +91 lines (more focused code)
- **Files created:** 2
- **Files modified:** 2
- **Files deleted:** 1
