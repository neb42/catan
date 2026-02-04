---
phase: quick-023
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/Robber/DiscardModal.tsx
  - apps/web/src/components/Robber/StealModal.tsx
  - apps/web/src/components/Robber/WaitingForDiscardsOverlay.tsx
  - apps/web/src/components/Victory/VictoryModal.tsx
autonomous: true

must_haves:
  truths:
    - 'DiscardModal uses parchment aesthetic matching GamePlayerList'
    - 'StealModal uses parchment aesthetic matching GamePlayerList'
    - 'WaitingForDiscardsOverlay uses parchment aesthetic matching GamePlayerList'
    - 'VictoryModal uses parchment aesthetic matching GamePlayerList'
    - 'All components maintain their existing functionality'
  artifacts:
    - path: 'apps/web/src/components/Robber/DiscardModal.tsx'
      provides: 'Parchment-styled discard modal'
      min_lines: 100
    - path: 'apps/web/src/components/Robber/StealModal.tsx'
      provides: 'Parchment-styled steal modal'
      min_lines: 60
    - path: 'apps/web/src/components/Robber/WaitingForDiscardsOverlay.tsx'
      provides: 'Parchment-styled waiting overlay'
      min_lines: 80
    - path: 'apps/web/src/components/Victory/VictoryModal.tsx'
      provides: 'Parchment-styled victory modal'
      min_lines: 190
  key_links:
    - from: 'All target components'
      to: 'GamePlayerList aesthetic'
      via: 'Shared color palette and styling patterns'
      pattern: '#fdf6e3|#8d6e63|#5d4037|Fraunces'
---

<objective>
Apply the parchment aesthetic from GamePlayerList to DiscardModal, StealModal, WaitingForDiscardsOverlay, and VictoryModal components for visual consistency.

Purpose: Create a cohesive medieval/board game aesthetic across all game UI components  
Output: Four components restyled with parchment background, brown borders, serif typography, and consistent visual language
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@apps/web/src/components/GamePlayerList.tsx
@apps/web/src/components/Robber/DiscardModal.tsx
@apps/web/src/components/Robber/StealModal.tsx
@apps/web/src/components/Robber/WaitingForDiscardsOverlay.tsx
@apps/web/src/components/Victory/VictoryModal.tsx
</context>

<tasks>

<task type="auto">
  <name>Apply parchment aesthetic to robber-related modals and overlay</name>
  <files>
    apps/web/src/components/Robber/DiscardModal.tsx
    apps/web/src/components/Robber/StealModal.tsx
    apps/web/src/components/Robber/WaitingForDiscardsOverlay.tsx
  </files>
  <action>
Update DiscardModal:
- Replace Modal with custom styling matching GamePlayerList parchment aesthetic
- Background: `#fdf6e3` (cream parchment)
- Border: `4px solid #8d6e63` (brown wood frame)
- Border radius: `12px`
- Box shadow: `0 10px 20px rgba(0,0,0,0.3)`
- Title text: Fraunces serif font, `#5d4037` color, larger size (20px), bold
- Body text: Keep Inter but use `#5d4037` for primary text
- Section dividers: `2px dashed #d7ccc8` borders
- Resource selection buttons: Style with parchment borders, brown hover states
- Submit button: Brown theme `#8d6e63` background, cream text when enabled

Update StealModal:

- Apply same parchment background and border treatment as DiscardModal
- Title: Fraunces serif, `#5d4037`, 20px, bold
- Candidate buttons: Parchment background with brown borders, hover effects
- Player badges: Keep existing colors but adjust to complement parchment

Update WaitingForDiscardsOverlay:

- Convert Paper to styled div with parchment aesthetic
- Background: `#fdf6e3` with `rgba(253, 246, 227, 0.98)` for slight transparency
- Border: `4px solid #E53935` (keep red for robber warning)
- Title emoji can stay but use Fraunces font for "Robber!" text
- Inner nested Paper (player list): Use `rgba(0,0,0,0.03)` background with `2px dashed #d7ccc8` border
- All text colors: `#5d4037` instead of default/dimmed

Keep all existing functionality, props, and logic unchanged.
</action>
<verify>
npx nx build web
Visual inspection: Open game, trigger robber flow (roll 7 with 8+ cards), verify all three components show parchment aesthetic
</verify>
<done>
DiscardModal, StealModal, and WaitingForDiscardsOverlay all display with cream parchment backgrounds, brown borders, serif headings, and match GamePlayerList visual style while maintaining full functionality
</done>
</task>

<task type="auto">
  <name>Apply parchment aesthetic to victory modal</name>
  <files>
    apps/web/src/components/Victory/VictoryModal.tsx
  </files>
  <action>
Update VictoryModal:
- Modal styles override: Set background to `#fdf6e3`, border `4px solid #8d6e63`, border radius `12px`
- Winner announcement: Keep Fraunces font but change color to `#5d4037` (brown instead of default)
- Badge backgrounds: Adjust yellow badge to use `#f1c40f` (golden) to match active turn indicator
- Final Standings section:
  - Title: Fraunces font, `#5d4037`, 18px, bold
  - Card borders: Change default `#EEE` to `#d7ccc8` (light brown)
  - Winner card background: Change `#FFF9E6` to `rgba(241, 196, 15, 0.1)` (subtle gold tint on parchment)
  - Non-winner cards: Background `white` with `1px solid #d7ccc8` border
- Action buttons:
  - "View Board": Brown outline style `#8d6e63`, parchment background on hover
  - "Return to Lobby": Brown filled style `#8d6e63` background

Note: VPRevealOverlay is a full-screen dark overlay with brief animation - keep as-is since parchment aesthetic doesn't apply to overlays that obscure the entire game board.

Keep all existing functionality, confetti effects, and component logic unchanged.
</action>
<verify>
npx nx build web
Visual inspection: Trigger victory condition (use debug panel if available), verify modal shows parchment aesthetic and confetti still works
</verify>
<done>
VictoryModal displays with parchment background, brown borders, serif typography, golden accents, and brown-themed buttons while maintaining confetti celebration effects and all functionality
</done>
</task>

</tasks>

<verification>
- [ ] All four target components build without TypeScript errors
- [ ] DiscardModal shows parchment aesthetic when robber triggered
- [ ] StealModal shows parchment aesthetic when choosing steal target
- [ ] WaitingForDiscardsOverlay shows parchment aesthetic while waiting
- [ ] VictoryModal shows parchment aesthetic at game end
- [ ] All components maintain existing functionality
- [ ] Visual consistency with GamePlayerList aesthetic achieved
</verification>

<success_criteria>
**Visual Consistency Achieved:**

- All components use `#fdf6e3` parchment background
- All components use `#8d6e63` brown borders with `12px` radius
- All headings use Fraunces serif font with `#5d4037` brown color
- All components maintain box shadows and depth
- Golden accents (`#f1c40f`) used for emphasis matching active turn indicator

**Functionality Preserved:**

- DiscardModal resource selection works correctly
- StealModal player selection works correctly
- WaitingForDiscardsOverlay blocks correctly during discards
- VictoryModal confetti and navigation work correctly
  </success_criteria>

<output>
After completion, create `.planning/quick/023-apply-the-style-of-the-gameplayerlist-co/023-SUMMARY.md`
</output>
