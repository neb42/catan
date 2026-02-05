---
phase: quick-027
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/Feedback/GameLog.tsx
autonomous: true

must_haves:
  truths:
    - GameLog component has parchment background matching GamePlayerList
    - GameLog entries have parchment-themed styling with borders and shadows
    - GameLog header uses the same brown color scheme as other parchment components
  artifacts:
    - path: apps/web/src/components/Feedback/GameLog.tsx
      provides: Parchment-styled game log component
      min_lines: 100
  key_links:
    - from: apps/web/src/components/Feedback/GameLog.tsx
      to: parchment aesthetic pattern
      via: inline styles matching GamePlayerList
      pattern: 'background.*#fdf6e3|border.*#8d6e63'
---

<objective>
Apply the parchment aesthetic from GamePlayerList to the GameLog component to maintain consistent visual theming across the game interface.

Purpose: Ensure all game UI components share the same medieval parchment design language established in GamePlayerList, BuildControls, ResourceHand, and other styled components.

Output: GameLog component with parchment background, medieval borders, and warm brown color scheme.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@apps/web/src/components/GamePlayerList.tsx
@apps/web/src/components/Feedback/GameLog.tsx
</context>

<tasks>

<task type="auto">
  <name>Apply parchment aesthetic to GameLog component</name>
  <files>apps/web/src/components/Feedback/GameLog.tsx</files>
  <action>
Update GameLog component styling to match the parchment aesthetic from GamePlayerList:

**Container (Paper) styling:**

- Background: `#fdf6e3` (warm parchment color)
- Border: `4px solid #8d6e63` (brown medieval border)
- borderRadius: `12px` (only on left side since right is edge of screen - use `borderTopLeftRadius` and `borderBottomLeftRadius`)
- boxShadow: `0 10px 20px rgba(0,0,0,0.3)` (depth shadow)

**Header section:**

- Background: `rgba(0,0,0,0.03)` (subtle tint)
- Border bottom: `2px dashed #d7ccc8` (dashed separator like GamePlayerList)
- Title color: `#5d4037` (brown text)
- Button styling: match warm brown theme

**Toggle button:**

- Keep the `›` and `‹` arrows
- Update colors to match brown theme (`#5d4037`)
- Use warm button hover states

**Log entry styling:**

- Remove alternating background pattern
- Use subtle borders between entries: `1px solid #d7ccc8` on bottom
- Text color: `#5d4037` (brown)
- Entry background: transparent or very subtle `rgba(0,0,0,0.02)` on hover
- Padding: `8px 12px` for better spacing
- borderRadius: `6px` for rounded entries

**Empty state:**

- Color: `#8d6e63` (warm gray-brown)
- Keep italic style

**ScrollArea:**

- Scrollbar colors should blend with parchment theme if possible (check Mantine ScrollArea props)

The component should feel like a medieval scroll or parchment log book, consistent with GamePlayerList's aesthetic.
</action>
<verify>

1. Visual inspection: `npm run dev` and view game with log panel
2. Check that colors match GamePlayerList (#fdf6e3 background, #8d6e63 border)
3. Verify border styling (4px solid, dashed separator)
4. Confirm text uses brown color scheme (#5d4037)
5. Test toggle button works and has consistent styling
6. Check that log entries have clean borders and spacing
   </verify>
   <done>

- GameLog has parchment background (#fdf6e3)
- Border uses medieval brown (#8d6e63, 4px solid)
- Header has dashed separator (#d7ccc8)
- All text uses brown color scheme (#5d4037)
- Log entries have subtle borders and proper spacing
- Toggle button matches brown theme
- Component visually consistent with GamePlayerList aesthetic
  </done>
  </task>

</tasks>

<verification>
**Visual consistency check:**
1. Open game in browser with GameLog visible
2. Compare GameLog styling side-by-side with GamePlayerList
3. Confirm matching:
   - Background color (#fdf6e3)
   - Border style (4px solid #8d6e63)
   - Text colors (#5d4037)
   - Separator style (dashed #d7ccc8)
   - Overall medieval parchment feel

**Functional check:**

- Toggle button still works (open/collapse)
- Log entries display correctly
- ScrollArea functions properly
- No visual regressions
  </verification>

<success_criteria>

- [ ] GameLog component uses #fdf6e3 parchment background
- [ ] Border is 4px solid #8d6e63 (brown)
- [ ] Header has dashed separator matching GamePlayerList pattern
- [ ] Text uses brown color scheme (#5d4037)
- [ ] Log entries have clean, subtle borders
- [ ] Toggle functionality preserved
- [ ] Visual consistency with other parchment-styled components achieved
      </success_criteria>

<output>
After completion, create `.planning/quick/027-apply-the-style-of-the-gameplayerlist-co/027-SUMMARY.md`
</output>
