---
phase: quick-017
plan: 01
subsystem: frontend-ui
type: enhancement
status: complete
tags: [react, styling, ui, consistency, parchment-card]

requires: [quick-009, quick-012, quick-014, quick-016]
provides:
  - TurnControls with parchment card styling
  - Consistent card aesthetic across all game UI components
affects: []

tech-stack:
  added: []
  patterns: [parchment-card-design]

key-files:
  created: []
  modified:
    - apps/web/src/components/TurnControls/TurnControls.tsx

decisions:
  - decision: Apply parchment card styling to TurnControls
    rationale: Achieves visual consistency across all game UI components by using the established parchment card design language

metrics:
  duration: 52 seconds
  completed: 2026-02-04
---

# Quick Task 017: Apply GamePlayerList Style to TurnControls Summary

**One-liner:** Applied parchment card aesthetic (#fdf6e3 background, #8d6e63 border, matching shadows) to TurnControls component for visual consistency.

## Objective

Apply the visual styling from GamePlayerList (parchment card design with brown borders, rounded corners, and shadows) to the TurnControls component while preserving all existing functionality.

## What Was Built

### 1. Updated TurnControls Styling

Applied the parchment card aesthetic to match GamePlayerList and other recently styled components:

**Changes made:**

- **Background:** Changed from `rgba(255, 255, 255, 0.95)` to `#fdf6e3` (parchment)
- **Border:** Added `4px solid #8d6e63` (brown border)
- **Border radius:** Changed from Mantine `lg` prop to explicit `12px`
- **Box shadow:** Updated to `0 10px 20px rgba(0,0,0,0.3)` matching card design
- **Phase text color:** Changed from `dimmed` to `#5d4037` (brown) for better contrast on parchment
- **Removed backdrop filter:** Not needed with opaque parchment background

**Preserved functionality:**

- Turn counter badge with Fraunces font
- Animated "It's your turn!" banner with gradient and glow effect
- Phase indicator text (Roll the dice / Trade & Build)
- End Turn button with hover and disabled states
- All existing animations and transitions

## Technical Implementation

### Component Structure

The TurnControls component maintains its existing structure:

1. **Paper container** - Now styled with parchment card aesthetic
2. **Turn counter Badge** - Kept existing Fraunces font styling
3. **Your turn banner** - Kept existing gradient and animation (feature highlight)
4. **Phase indicator** - Updated text color for parchment background
5. **End Turn button** - Kept existing functionality and button styles

### Styling Consistency

**Parchment card design values used:**

```typescript
background: '#fdf6e3'; // Parchment background
border: '4px solid #8d6e63'; // Brown border
borderRadius: '12px'; // Rounded corners
boxShadow: '0 10px 20px rgba(0,0,0,0.3)'; // Card shadow
color: '#5d4037'; // Brown text for headings
```

These values match the established design language from:

- GamePlayerList (quick-009)
- ResourceHand (quick-012)
- BuildControls (quick-014)
- DiceRoller (quick-016)

## Testing & Verification

### Type Safety

✅ TypeScript compilation successful - no type errors

### Visual Verification Criteria

- TurnControls appears as parchment card matching GamePlayerList style
- Brown borders (4px solid #8d6e63) with 12px rounded corners visible
- Shadow effect (0 10px 20px rgba(0,0,0,0.3)) matches other card components
- Phase indicator text has good contrast (#5d4037 on #fdf6e3)
- All interactive elements remain functional
- Turn counter badge displays correctly
- "Your turn" banner animates as expected
- End Turn button responds to clicks and shows proper disabled state
- Design feels cohesive with rest of game UI

## Files Modified

| File                                                    | Changes                                                                     | Lines |
| ------------------------------------------------------- | --------------------------------------------------------------------------- | ----- |
| `apps/web/src/components/TurnControls/TurnControls.tsx` | Applied parchment card styling to Paper component, updated phase text color | ~8    |

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| Decision                           | Rationale                                                            |
| ---------------------------------- | -------------------------------------------------------------------- |
| Keep "Your turn" banner gradient   | Feature highlight should stand out against parchment background      |
| Update phase text color to #5d4037 | Provides better contrast on parchment than Mantine's "dimmed" color  |
| Remove backdrop filter             | Not needed with opaque parchment background                          |
| Maintain all existing animations   | Animations are part of component functionality, only styling changed |

## Lessons Learned

### What Went Well

- Styling changes were straightforward - only updated the Paper component styles
- Clear reference implementation in GamePlayerList made color values easy to extract
- TypeScript compilation confirmed no breaking changes
- All functionality preserved while achieving visual consistency

### Design Patterns Reinforced

- **Parchment card aesthetic:** Consistent use of #fdf6e3 background, #8d6e63 borders, and matching shadows
- **Explicit inline styles:** Used inline styles for critical visual properties to ensure consistency
- **Feature highlights preserved:** Kept gradient animations for important user feedback elements
- **Brown text on parchment:** #5d4037 provides good contrast for readable text

## Next Phase Readiness

### UI Consistency Status

With this task complete, the following components now share the parchment card aesthetic:

- ✅ GamePlayerList (quick-009)
- ✅ ResourceHand (quick-012)
- ✅ BuildControls (quick-014)
- ✅ DiceRoller (quick-016)
- ✅ TurnControls (quick-017)

This achieves a cohesive visual design across all major game UI components in the bottom section of the game board layout.

### Remaining UI Components

If further consistency is desired, consider:

- TradeButton (currently being styled but not part of this task)
- Game layout adjustments (Game.tsx changes observed but not committed)

### No Blockers

- No technical issues encountered
- No dependencies on other systems
- Component is production-ready

## Commits

| Commit  | Message                                                                       | Files            |
| ------- | ----------------------------------------------------------------------------- | ---------------- |
| f1466b5 | style(quick-017): apply GamePlayerList parchment card styling to TurnControls | TurnControls.tsx |

---

**Status:** ✅ Complete  
**Completed:** 2026-02-04  
**Duration:** 52 seconds
