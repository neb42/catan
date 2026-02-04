---
phase: quick-016
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/DiceRoller/DiceRoller.tsx
  - apps/web/src/components/DiceRoller/dice.module.css
autonomous: true

must_haves:
  truths:
    - 'DiceRoller has parchment-style background and brown borders matching GamePlayerList'
    - 'Button styling follows GamePlayerList pattern'
    - 'Layout maintains width: 200px consistency'
  artifacts:
    - path: 'apps/web/src/components/DiceRoller/DiceRoller.tsx'
      provides: 'Updated DiceRoller with card-style layout'
      min_lines: 200
    - path: 'apps/web/src/components/DiceRoller/dice.module.css'
      provides: 'Updated styles matching GamePlayerList pattern'
      min_lines: 100
  key_links:
    - from: 'apps/web/src/components/DiceRoller/DiceRoller.tsx'
      to: 'dice.module.css classes'
      via: 'className references'
      pattern: "className.*styles\\["
---

<objective>
Apply the visual style of GamePlayerList to the DiceRoller component.

Purpose: Create consistent visual language across all game UI components with parchment-style backgrounds, brown borders, and cohesive styling.

Output: DiceRoller component with matching aesthetic (background: #fdf6e3, border: 4px solid #8d6e63, 200px width, card-style layout).
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md

# Reference components

@apps/web/src/components/GamePlayerList.tsx
@apps/web/src/components/BuildControls/BuildControls.tsx

# Target component

@apps/web/src/components/DiceRoller/DiceRoller.tsx
@apps/web/src/components/DiceRoller/dice.module.css
</context>

<tasks>

<task type="auto">
  <name>Update DiceRoller container styling to match GamePlayerList</name>
  <files>
    apps/web/src/components/DiceRoller/DiceRoller.tsx
    apps/web/src/components/DiceRoller/dice.module.css
  </files>
  <action>
Update the DiceRoller component to match the GamePlayerList visual style:

**In dice.module.css:**

1. Update `.diceContainer`:
   - Change background to: `#fdf6e3` (parchment background)
   - Change border to: `4px solid #8d6e63` (brown border)
   - Keep borderRadius: `12px`
   - Keep boxShadow: `0 10px 20px rgba(0,0,0,0.3)`
   - Keep width: `200px`
   - Keep padding and layout structure

2. Update `.rollButton`:
   - Remove gradient background
   - Change to solid color: `background: #f1c40f` (golden yellow)
   - Change text color to: `color: #333`
   - Update box-shadow to: `0 2px 4px rgba(0,0,0,0.2)`
   - Keep hover effects (translateY) but update shadow to: `0 4px 8px rgba(241,196,15,0.3)`
   - Disabled state: keep as is (`#9ca3af`)

3. Update `.result` styling:
   - Change color to: `#5d4037` (brown text)
   - Keep font sizes and layout

4. Keep dice, robber warning, and animation styles unchanged (they work well as-is)

**WHY these changes:**

- Parchment background (#fdf6e3) creates unified aesthetic with GamePlayerList/BuildControls
- Brown border (4px solid #8d6e63) matches the card-style borders
- Golden button (#f1c40f) matches the "Your Turn" badge style
- 200px width creates consistent column sizing in the grid layout
  </action>
  <verify>

```bash
# Visual verification needed
npm run dev
# Check: DiceRoller has parchment bg, brown border, golden button
# Check: Maintains 200px width in layout
# Check: Button hover states work correctly
```

  </verify>
  <done>
DiceRoller component has parchment background (#fdf6e3), 4px brown border (#8d6e63), golden button (#f1c40f), and 200px width matching GamePlayerList and BuildControls aesthetic
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
Updated DiceRoller with GamePlayerList-style parchment background, brown borders, golden button, and consistent 200px width
  </what-built>
  <how-to-verify>
1. Start the app: `npm run dev`
2. Navigate to an active game with dice rolling enabled
3. Visual checks:
   - DiceRoller has parchment background (#fdf6e3, light cream color)
   - Border is 4px solid brown (#8d6e63)
   - Border radius is 12px (rounded corners)
   - Width is 200px (same as GamePlayerList cards)
   - "Roll Dice" button is golden yellow (#f1c40f) with dark text
   - Box shadow creates card-like depth (0 10px 20px rgba(0,0,0,0.3))
4. Interaction checks:
   - Roll dice and confirm animation still works
   - Hover over button - should lift slightly with shadow
   - Button disabled state shows gray when not your turn
   - Robber warning (on roll of 7) still displays correctly
5. Layout check:
   - Compare visually with GamePlayerList and BuildControls
   - All three should have matching borders, backgrounds, and card-style appearance
  </how-to-verify>
  <resume-signal>
Type "approved" if styling matches GamePlayerList aesthetic, or describe any visual issues
  </resume-signal>
</task>

</tasks>

<verification>
- [ ] DiceRoller container has background: #fdf6e3 (parchment)
- [ ] DiceRoller container has border: 4px solid #8d6e63 (brown)
- [ ] DiceRoller container has width: 200px
- [ ] Roll button has background: #f1c40f (golden)
- [ ] Roll button has color: #333 (dark text)
- [ ] Visual consistency with GamePlayerList and BuildControls
- [ ] All dice rolling functionality still works (animation, display, robber warning)
</verification>

<success_criteria>
DiceRoller component visually matches GamePlayerList and BuildControls with parchment background, brown borders, golden button, and 200px width while maintaining all existing dice rolling functionality and animations.
</success_criteria>

<output>
After completion, create `.planning/quick/016-apply-the-style-of-the-gameplayerlist-co/016-SUMMARY.md`
</output>
