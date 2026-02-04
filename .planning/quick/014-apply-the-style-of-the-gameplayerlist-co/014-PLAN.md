---
phase: quick-014
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/BuildControls/BuildControls.tsx
autonomous: true

must_haves:
  truths:
    - BuildControls uses warm parchment background matching GamePlayerList
    - Build buttons have card-style borders with shadows
    - Header text uses brown color palette consistent with GamePlayerList
  artifacts:
    - path: apps/web/src/components/BuildControls/BuildControls.tsx
      provides: Styled build controls matching GamePlayerList aesthetic
      min_lines: 200
  key_links:
    - from: BuildControls.tsx
      to: GamePlayerList styling
      via: shared color palette and border styles
      pattern: '#fdf6e3|#8d6e63|#5d4037'
---

<objective>
Apply the warm parchment card aesthetic from GamePlayerList to BuildControls component.

Purpose: Create visual consistency across game UI components by using the same design language (warm browns, parchment backgrounds, card-style borders with shadows).

Output: BuildControls component styled to match GamePlayerList's aesthetic.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/GamePlayerList.tsx
@apps/web/src/components/BuildControls/BuildControls.tsx
</context>

<tasks>

<task type="auto">
  <name>Apply GamePlayerList styling to BuildControls</name>
  <files>apps/web/src/components/BuildControls/BuildControls.tsx</files>
  <action>
Replace the Mantine Paper styling with GamePlayerList's aesthetic:

1. **Container styling** (replace Paper with styled div):
   - Background: `#fdf6e3` (parchment)
   - Border: `4px solid #8d6e63` (brown)
   - Border radius: `12px`
   - Box shadow: `0 10px 20px rgba(0,0,0,0.3)`
   - Padding: `15px`

2. **Header text** ("Build"):
   - Color: `#5d4037` (dark brown)
   - Keep Fraunces font family
   - Font size: `14px`
   - Font weight: `600`

3. **Build buttons**:
   - Replace Mantine Button styling with custom styled divs/buttons
   - Background: `white`
   - Border: `2px solid #d7ccc8` (light brown)
   - Border radius: `8px`
   - Box shadow: `0 2px 4px rgba(0,0,0,0.1)`
   - Active state: border `2px solid #f1c40f` (golden), box-shadow `0 4px 8px rgba(241,196,15,0.3)`
   - Disabled state: opacity `0.5`
   - Padding: `8px 12px`
   - Cursor: `pointer` when enabled

4. **Text colors**:
   - Primary text: `#5d4037` (dark brown)
   - Dimmed/secondary text: `#8d6e63` (medium brown)
   - Active/selected text: keep existing orange for contrast

5. **Cancel button**:
   - Background: `#ffe0e0` (light red)
   - Border: `1px solid #ffcccc`
   - Color: `#c0392b` (dark red)
   - Border radius: `6px`
   - Padding: `4px 12px`

6. **Mode indicator**:
   - Background: `#fff3cd` (light yellow)
   - Border: `1px solid #ffd966`
   - Border radius: `6px`
   - Color: `#856404` (dark yellow-brown)
   - Padding: `8px`
   - Font size: `12px`

Remove Mantine Paper, Button, Group, Stack components and replace with native HTML/styled divs. Keep Tooltip from Mantine for the build button tooltips.
</action>
<verify>
Visual inspection: BuildControls should have parchment background, brown borders, and card-style shadows matching GamePlayerList.

Run: `npx nx serve web` and navigate to game page, check that BuildControls visually matches GamePlayerList style.
</verify>
<done>
BuildControls component uses warm parchment background (#fdf6e3), brown borders (#8d6e63), card-style shadows, and brown text colors matching GamePlayerList aesthetic. Build buttons have white backgrounds with brown borders. Active states use golden borders. Component is visually consistent with GamePlayerList.
</done>
</task>

</tasks>

<verification>
1. Visual inspection: BuildControls has parchment card appearance
2. Color consistency: Same brown palette as GamePlayerList
3. Border and shadow: Card-style 3D effect matching other components
4. Functionality preserved: All build buttons still work
</verification>

<success_criteria>

- BuildControls uses `#fdf6e3` background and `#8d6e63` border
- Build buttons have white backgrounds with `#d7ccc8` borders
- Active build mode shows golden `#f1c40f` border
- Text uses brown color palette (`#5d4037`, `#8d6e63`)
- Box shadows create card depth effect
- Visual harmony with GamePlayerList component
  </success_criteria>

<output>
After completion, create `.planning/quick/014-apply-the-style-of-the-gameplayerlist-co/014-SUMMARY.md`
</output>
