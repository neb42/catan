---
phase: quick-009
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/GamePlayerList.tsx
autonomous: true

must_haves:
  truths:
    - 'Players display in vertical single-column layout'
    - 'Active player card has golden border and scale animation'
    - 'Stats display as circular tokens with badges (settlements, cities, roads, knights, dev cards, VP)'
    - 'Resource card count appears below stats area'
    - 'Longest Road and Largest Army badges show with colored backgrounds'
  artifacts:
    - path: 'apps/web/src/components/GamePlayerList.tsx'
      provides: 'Refactored player list matching variation2_vertical.html design'
      min_lines: 280
  key_links:
    - from: 'GamePlayerList.tsx'
      to: 'gameStore hooks'
      via: 'useCurrentPlayer, useTurnCurrentPlayer, useLongestRoadHolder, useLargestArmyHolder'
      pattern: 'use[A-Z].*Player|Holder'
---

<objective>
Refactor GamePlayerList component to match the vertical layout design from variation2_vertical.html mockup.

Purpose: Improve visual hierarchy and readability by using a card-based vertical layout with circular stat tokens, achievement badges, and clearer active player indication.

Output: Updated GamePlayerList.tsx with parchment-style cards, circular stat badges, and vertical single-column layout.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@apps/web/src/components/GamePlayerList.tsx
@apps/web/src/mockups/variation2_vertical.html
</context>

<tasks>

<task type="auto">
  <name>Refactor GamePlayerList to vertical card layout</name>
  <files>apps/web/src/components/GamePlayerList.tsx</files>
  <action>
Replace the current GamePlayerList component implementation to match the variation2_vertical.html design:

**Layout changes:**

- Change from 2-column grid to single-column vertical stack (flexbox column with 30px gap)
- Set container width to 260px

**Card styling (parchment-style):**

- Background: #fdf6e3 (cream/parchment)
- Border: 4px solid #8d6e63 (brown)
- Border radius: 12px
- Box shadow: 0 10px 20px rgba(0,0,0,0.3)
- Active state: scale(1.05), golden border (#f1c40f), enhanced shadow

**Active turn marker:**

- Position absolute, top: -15px, right: 15px
- Golden background (#f1c40f)
- Text: "Your Turn" or "Current Turn"
- Opacity: 0 when inactive, 1 when active
- Border radius: 20px, padding: 4px 12px

**Player header:**

- Padding: 12px
- Border-bottom: 2px dashed #d7ccc8
- Background: rgba(0,0,0,0.03)
- Avatar: 40px × 40px, border-radius: 8px, with initials
- Name: font-size 16px, color #5d4037

**Stats area (circular tokens):**

- Grid layout: 3 columns, gap 10px, padding 15px
- Each stat token: white background, circular (36px × 36px), border 1px solid #d7ccc8
- Stat value badge: position absolute, bottom-right (-6px, -6px), min-width 16px, height 16px, background #5d4037, white text
- Icons: Use SVG icons from mockup (home for settlement, building for city, road, knight, card, star for VP)
- VP token special styling: orange badge (#e67e22), orange icon (#d35400)
- Display stats in this order (3×2 grid):
  - Row 1: Settlements, Cities, Roads
  - Row 2: Knights, Dev Cards, Victory Points

**Achievement badges (Longest Road, Largest Army):**

- Display below player name in header
- Longest Road: background #ffe0b2, color #e65100, border #ffcc80, text "Road"
- Largest Army: background #ffcdd2, color #b71c1c, border #ef9a9a, text "Army"
- Include mini icon from mockup (road or knight SVG)
- Font: Inter, 10px, font-weight 600

**Resource cards display:**

- Position: absolute, bottom -12px, left 50%, transform translateX(-50%)
- Background: white, border 1px solid #ccc, padding 4px 12px, border-radius 12px
- Display card icon (3 overlapping cards SVG) + count + " Cards"
- Font: Inter, 11px, font-weight 600

**Hidden VP indicator:**

- For current player with VP cards, show asterisk (\*) next to true score
- Green color (#27ae60), bold, font: Inter

**Preserve existing functionality:**

- Keep all existing hooks: useCurrentPlayer, useTurnCurrentPlayer, useLongestRoadHolder, useLargestArmyHolder
- Keep VP calculation logic (settlements, cities, longest road, largest army, hidden VP cards)
- Keep active player determination (turnCurrentPlayerId || placementPlayerId)
- Keep resource counting from playerResources
- Keep dev card and knight tracking

**Do NOT use Mantine components** - use plain div/span with inline styles to match mockup exactly. Remove imports for Card, Group, Stack, Badge, Tooltip, Text. Keep only Avatar for the player icon.

**Motion animation:**

- Keep Framer Motion for active player pulse animation
- Use the existing scale/shadow animation pattern but with new golden border color
  </action>
  <verify>

1. Run: `npx nx serve web` and navigate to game view
2. Verify layout is single-column vertical (not 2-column grid)
3. Verify cards have parchment background (#fdf6e3) with brown border
4. Verify active player has golden border and "Your Turn" marker
5. Verify stats display as 3×2 grid of circular tokens with badges
6. Verify Longest Road/Army badges show below player name when applicable
7. Verify resource card count appears below stats area
8. Verify hidden VP indicator (\*) shows for current player with VP cards
9. Run: `npx nx typecheck web` passes
10. Run: `npx nx build web` succeeds
    </verify>
    <done>
    GamePlayerList component displays players in vertical card layout matching variation2_vertical.html design with:

- Single-column layout (260px width)
- Parchment-style cards with brown borders
- Active player golden border and "Your Turn" marker
- Circular stat tokens in 3×2 grid
- Achievement badges (Longest Road, Largest Army)
- Resource card count display
- Hidden VP indicator for current player
- All existing functionality preserved
- TypeScript compiles without errors
  </done>
  </task>

</tasks>

<verification>
**Visual checks:**
- Players display in vertical single-column layout (not grid)
- Active player card has golden border (#f1c40f) and scale animation
- Stat tokens are circular with badge values in bottom-right corner
- Achievement badges appear below player name with correct colors
- Resource card count displays below stats with card icon
- Hidden VP shows asterisk next to true score for current player

**Functional checks:**

- Active player highlighting works during placement and main game phases
- Longest Road and Largest Army badges show/hide correctly
- VP calculation includes settlements, cities, achievements, and hidden VP cards
- Resource card counting sums all player resources correctly

**Code quality:**

- No Mantine components used (except Avatar)
- TypeScript type safety maintained
- Component compiles and builds successfully
  </verification>

<success_criteria>

- Component renders in vertical single-column layout
- Visual design matches variation2_vertical.html mockup
- All stats display as circular tokens with badges
- Active player indication uses golden border and marker
- Achievement badges show with correct styling
- No TypeScript errors
- Build succeeds
  </success_criteria>

<output>
After completion, create `.planning/quick/009-refactor-the-gameplayerlist-component-to/009-SUMMARY.md`
</output>
