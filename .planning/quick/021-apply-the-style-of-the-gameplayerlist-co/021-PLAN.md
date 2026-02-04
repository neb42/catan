---
phase: quick-021
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/PlacementBanner.tsx
  - apps/web/src/components/DraftOrderDisplay.tsx
autonomous: true

must_haves:
  truths:
    - PlacementBanner uses parchment aesthetic (#fdf6e3 background, brown borders)
    - DraftOrderDisplay uses parchment aesthetic matching GamePlayerList
    - Both components removed Mantine Paper component in favor of inline styles
  artifacts:
    - path: apps/web/src/components/PlacementBanner.tsx
      provides: Setup phase banner with parchment styling
      min_lines: 70
    - path: apps/web/src/components/DraftOrderDisplay.tsx
      provides: Draft order display with parchment styling
      min_lines: 160
  key_links:
    - from: apps/web/src/components/PlacementBanner.tsx
      to: GamePlayerList aesthetic
      via: shared color palette and border styles
      pattern: 'background.*#fdf6e3.*border.*#8d6e63'
    - from: apps/web/src/components/DraftOrderDisplay.tsx
      to: GamePlayerList aesthetic
      via: shared color palette and border styles
      pattern: 'background.*#fdf6e3.*border.*#8d6e63'
---

<objective>
Apply the parchment aesthetic from GamePlayerList to PlacementBanner and DraftOrderDisplay components.

Purpose: Create visual consistency across all game UI components using the established parchment/medieval aesthetic (#fdf6e3 background, #8d6e63 brown borders, rounded corners, drop shadows).

Output: Two updated components with cohesive styling matching GamePlayerList's aesthetic.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@apps/web/src/components/GamePlayerList.tsx
@apps/web/src/components/PlacementBanner.tsx
@apps/web/src/components/DraftOrderDisplay.tsx
</context>

<tasks>

<task type="auto">
  <name>Apply parchment aesthetic to PlacementBanner</name>
  <files>apps/web/src/components/PlacementBanner.tsx</files>
  <action>
Replace Mantine Paper component with div using inline styles following GamePlayerList patterns:

**Container styling:**

- Background: #fdf6e3 (parchment)
- Border: 4px solid #8d6e63 (brown, matches non-active player cards)
- Border radius: 12px
- Box shadow: 0 10px 20px rgba(0,0,0,0.3)
- Add left border accent using current player color (4px solid ${colorHex})

**Text styling:**

- Heading colors: #5d4037 (dark brown for primary text)
- Use existing motion animation for "Your Turn" text
- Keep Badge but style to match parchment aesthetic

**Layout:**

- Remove Mantine Group, use flex display
- Maintain existing spacing and alignment
- Preserve motion animations

Follow the pattern from GamePlayerList: parchment background, brown border, drop shadow, rounded corners.
</action>
<verify>
npm run dev
Navigate to game with placement phase
Confirm PlacementBanner has parchment background, brown borders, matches GamePlayerList aesthetic
</verify>
<done>PlacementBanner displays with #fdf6e3 background, #8d6e63 borders, 12px radius, drop shadow, no Mantine Paper</done>
</task>

<task type="auto">
  <name>Apply parchment aesthetic to DraftOrderDisplay</name>
  <files>apps/web/src/components/DraftOrderDisplay.tsx</files>
  <action>
Replace Mantine Paper/Stack/Box components with divs using inline styles following GamePlayerList patterns:

**Container styling:**

- Background: #fdf6e3 (parchment)
- Border: 4px solid #8d6e63 (brown)
- Border radius: 12px
- Box shadow: 0 10px 20px rgba(0,0,0,0.3)
- Max width: 280px (keep existing)

**Section dividers:**

- Use 2px dashed #d7ccc8 borders between rounds (matches GamePlayerList header border)

**Text styling:**

- Header text: #5d4037 (dark brown)
- "Draft Order" heading: uppercase, small font (11px), letter-spacing
- Keep existing dimmed colors for labels

**Layout:**

- Replace Stack with div + flexDirection: 'column', gap: '15px'
- Replace Group with div + flexDirection: 'row', gap
- Replace Box with div
- Maintain all existing tooltips and motion animations
- Keep player color indicators and shapes (settlement squares, road circles)

**Legend styling:**

- Add subtle background: rgba(0,0,0,0.03) to match GamePlayerList header
- Border-top: 2px dashed #d7ccc8

Follow GamePlayerList's card structure: parchment base, brown borders, internal sections with dashed dividers.
</action>
<verify>
npm run dev
Navigate to game with placement phase
Confirm DraftOrderDisplay has parchment background, brown borders, dashed section dividers, matches GamePlayerList aesthetic
</verify>
<done>DraftOrderDisplay displays with #fdf6e3 background, #8d6e63 borders, dashed dividers, drop shadow, no Mantine Paper/Stack/Box</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Applied parchment aesthetic to PlacementBanner and DraftOrderDisplay components following GamePlayerList patterns</what-built>
  <how-to-verify>
**Visual verification:**
1. Start dev server: `npm run dev`
2. Create/join game and enter placement phase
3. Check PlacementBanner:
   - Parchment background (#fdf6e3)
   - Brown border (#8d6e63, 4px solid)
   - Player color accent on left border
   - Rounded corners (12px)
   - Drop shadow visible
   - Motion animation on "Your Turn" works
4. Check DraftOrderDisplay:
   - Parchment background (#fdf6e3)
   - Brown border (#8d6e63, 4px solid)
   - Dashed dividers between sections (#d7ccc8)
   - Rounded corners (12px)
   - Drop shadow visible
   - Player color indicators animate correctly
   - Legend has subtle background
5. Compare both components to GamePlayerList cards - should have visual consistency

**Expected result:** All three components (GamePlayerList, PlacementBanner, DraftOrderDisplay) share the same medieval parchment aesthetic with consistent colors, borders, shadows, and typography.
</how-to-verify>
<resume-signal>Type "approved" to continue, or describe any styling issues that need adjustment</resume-signal>
</task>

</tasks>

<verification>
- [ ] PlacementBanner uses #fdf6e3 background and #8d6e63 border
- [ ] DraftOrderDisplay uses #fdf6e3 background and #8d6e63 border
- [ ] Both components have 12px border radius and drop shadows
- [ ] Mantine Paper/Stack/Box components removed
- [ ] All existing functionality preserved (animations, tooltips, player colors)
- [ ] Visual consistency with GamePlayerList established
</verification>

<success_criteria>
**Measurable outcomes:**

1. PlacementBanner renders with parchment aesthetic matching GamePlayerList
2. DraftOrderDisplay renders with parchment aesthetic matching GamePlayerList
3. No Mantine Paper/Stack/Box components remain in either file
4. All motion animations and interactive features continue to work
5. Visual inspection confirms cohesive medieval aesthetic across all three components
   </success_criteria>

<output>
After completion, create `.planning/quick/021-apply-the-style-of-the-gameplayerlist-co/021-SUMMARY.md`
</output>
