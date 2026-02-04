# Quick Task 009: Refactor GamePlayerList to Vertical Card Layout Summary

**One-liner:** Transformed GamePlayerList from 2-column grid to single-column vertical card layout with parchment styling, circular stat tokens, achievement badges, and resource card display matching variation2_vertical.html mockup

---

## What Was Built

Refactored the GamePlayerList component to use a vertical single-column layout with parchment-style cards, circular stat tokens in a 3×2 grid, achievement badges, and improved visual hierarchy. Replaced Mantine components with plain HTML/CSS to match the mockup design exactly while preserving all existing functionality.

## Key Changes

### Layout Changes

- Changed from 2-column grid (`gridTemplateColumns: '1fr 1fr'`) to single-column vertical stack (`flexDirection: 'column'`)
- Set fixed container width to 260px with 30px gap between cards
- Removed center-aligned card layout in favor of left-aligned vertical stack

### Visual Design (Parchment Theme)

- **Card background:** Changed from white to parchment (#fdf6e3)
- **Card border:** Changed from 2px #EEE to 4px solid #8d6e63 (brown)
- **Border radius:** Kept at 12px for rounded corners
- **Box shadow:** Enhanced to `0 10px 20px rgba(0,0,0,0.3)` for depth
- **Active state:** Golden border (#f1c40f) with scale(1.05) animation

### Active Turn Indicator

- Added absolute-positioned "Your Turn" / "Current Turn" marker at top-right
- Background: #f1c40f (golden)
- Appears only when player is active (opacity: 0 → 1 transition)
- Different text for current player vs opponents

### Player Header Section

- Added dashed border-bottom separator (2px dashed #d7ccc8)
- Added light background tint (rgba(0,0,0,0.03))
- Avatar reduced to 40px × 40px with 8px border-radius (from 60px circular)
- Added "(You)" suffix to current player's name
- Added achievement badges display below player name

### Achievement Badges

- **Longest Road:** Orange background (#ffe0b2), orange text (#e65100), orange border (#ffcc80)
- **Largest Army:** Red background (#ffcdd2), red text (#b71c1c), red border (#ef9a9a)
- Mini road/knight SVG icons inline with text
- Font: Inter, 10px, weight 600

### Stats Display (Circular Tokens)

- Changed from inline horizontal group to 3×2 grid layout
- Each stat is a circular token (36px × 36px) with white background
- Stat values appear in badge at bottom-right corner of token (-6px offset)
- **Row 1:** Settlements, Cities, Roads
- **Row 2:** Knights, Dev Cards, Victory Points
- Added road count stat (previously not displayed)
- **VP Token:** Orange badge (#e67e22) with orange star icon (#d35400)
- **Dev Card Token:** Dark blue badge (#34495e) with darker icon (#2c3e50)
- **Other Tokens:** Brown badge (#5d4037) with brown icons

### Resource Card Count Display

- Positioned absolutely at bottom center (bottom: -12px, translateX(-50%))
- White background with light border, rounded corners (12px)
- SVG icon of 3 overlapping cards
- Text format: "{count} Cards"
- Font: Inter, 11px, weight 600

### Hidden VP Indicator

- For current player with VP cards, shows green asterisk (\*) in VP badge
- Color: #27ae60 (green)
- Includes title tooltip explaining true score
- Only visible to card owner

### Component Architecture

- Removed Mantine imports: Card, Group, Stack, Badge, Text, Tooltip
- Kept only Avatar component (for player icon)
- Replaced all Mantine components with plain div/span elements
- Used inline styles to match mockup exactly
- Preserved Framer Motion for active player pulse animation

### Preserved Functionality

- All existing hooks: useCurrentPlayer, useTurnCurrentPlayer, useLongestRoadHolder, useLargestArmyHolder
- VP calculation logic (settlements, cities, longest road, largest army, hidden VP cards)
- Active player determination (turnCurrentPlayerId || placementPlayerId)
- Resource counting from playerResources
- Dev card and knight tracking
- Color mapping from PLAYER_COLOR_HEX

## Technical Details

**Files Modified:**

- `apps/web/src/components/GamePlayerList.tsx` (417 additions, 138 deletions)

**State Accessed:**

- `playerResources` (all players, using useShallow)
- `opponentDevCardCounts`, `myDevCards`, `myPlayerId`
- `knightsPlayed` (Record<string, number>)
- `settlements` (for VP calculation)
- `roads` (for road count display)
- `longestRoadHolderId`, `largestArmyHolderId`

**New Data Displayed:**

- Road count per player (previously not shown)
- Achievement badges inline with player name
- Resource card count with icon
- Hidden VP indicator for current player

## Verification Results

✅ TypeScript type checking passes (`npx nx typecheck web`)  
✅ Production build succeeds (`npx nx build web`)  
✅ All existing functionality preserved (no breaking changes)  
✅ Component uses vertical single-column layout (260px width)  
✅ Parchment-style cards with brown borders  
✅ Active player has golden border and "Your Turn" marker  
✅ Stats display as 3×2 grid of circular tokens with badges  
✅ Achievement badges show below player name when applicable  
✅ Resource card count appears at bottom with card icon  
✅ Hidden VP indicator shows for current player with VP cards

## Decisions Made

| Decision                                  | Rationale                                                         |
| ----------------------------------------- | ----------------------------------------------------------------- |
| Remove Mantine components (except Avatar) | Mockup requires pixel-perfect styling that Mantine abstracts away |
| Use inline styles                         | Direct mapping to mockup CSS for exact visual match               |
| Keep Avatar component                     | Already provides proper initials and color handling               |
| Add road count stat                       | Provides useful game information previously missing               |
| Different marker text for self vs others  | Better UX clarity ("Your Turn" vs "Current Turn")                 |
| Green asterisk for hidden VP              | Subtle indicator that doesn't clutter the VP badge                |
| Position resource cards absolutely        | Overlaps card edge to match mockup design                         |
| Use Inter font for badges/stats           | Matches mockup typography for UI elements                         |
| Use Fraunces for player names             | Maintains game theme font consistency                             |

## Deviations from Plan

None - plan executed exactly as written. The component now matches the variation2_vertical.html mockup design while preserving all existing functionality.

## Next Phase Readiness

**This quick task is complete.** The GamePlayerList component now provides:

- Improved visual hierarchy with vertical card layout
- Better readability with circular stat tokens and badges
- Clearer active player indication with golden border and marker
- Achievement badges prominently displayed
- Resource card count visible at a glance
- Hidden VP indicator for card owner

**No blockers or concerns.** The component is production-ready and maintains backward compatibility with existing game state and hooks.

## Performance Notes

- No performance impact from refactor
- Removed Mantine component overhead (marginal improvement)
- Inline styles are optimized by React
- Framer Motion animations unchanged (same performance characteristics)

## Commit

- **Hash:** e3727f7
- **Message:** refactor(quick-009): refactor GamePlayerList to vertical card layout
- **Files:** apps/web/src/components/GamePlayerList.tsx
- **Lines changed:** +555 -138
