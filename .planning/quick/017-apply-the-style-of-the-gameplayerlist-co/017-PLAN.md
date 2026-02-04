---
phase: quick-017
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/TurnControls/TurnControls.tsx
autonomous: true

must_haves:
  truths:
    - TurnControls has parchment background (#fdf6e3) matching GamePlayerList
    - TurnControls has brown border (#8d6e63) with rounded corners
    - TurnControls has shadow effects matching card-based design
    - All existing functionality remains intact (End Turn button, turn counter, phase indicator)
  artifacts:
    - path: apps/web/src/components/TurnControls/TurnControls.tsx
      provides: Styled TurnControls component with parchment aesthetic
      contains: "background: '#fdf6e3'"
  key_links:
    - from: TurnControls styling
      to: GamePlayerList card design
      via: matching color palette and shadow effects
      pattern: '#fdf6e3.*#8d6e63'
---

<objective>
Apply the visual styling from GamePlayerList (parchment card design with brown borders, rounded corners, and shadows) to the TurnControls component while preserving all existing functionality.

Purpose: Create visual consistency across game UI components by adopting the established parchment card aesthetic.

Output: TurnControls component with updated styling matching GamePlayerList design language.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/GamePlayerList.tsx
@apps/web/src/components/TurnControls/TurnControls.tsx
</context>

<tasks>

<task type="auto">
  <name>Apply parchment card styling to TurnControls</name>
  <files>apps/web/src/components/TurnControls/TurnControls.tsx</files>
  <action>
    Replace the current Paper component styling in TurnControls with the parchment card aesthetic from GamePlayerList:

    1. **Main container (Paper component):**
       - Change background from `rgba(255, 255, 255, 0.95)` to `#fdf6e3` (parchment)
       - Change border from none to `4px solid #8d6e63` (brown)
       - Change borderRadius from `lg` to `12px` (matching GamePlayerList)
       - Update boxShadow to `0 10px 20px rgba(0,0,0,0.3)` (matching card shadow)
       - Remove backdropFilter (not needed with opaque parchment background)

    2. **Turn counter Badge:**
       - Keep existing Fraunces font family
       - Update colors if needed to complement parchment background
       - Ensure good contrast on parchment

    3. **"It's your turn!" banner:**
       - Keep existing gradient and animation (this is a feature highlight, should stand out)
       - Ensure it visually pops against parchment background

    4. **Phase indicator text:**
       - Update text color to `#5d4037` (brown, matching GamePlayerList)
       - Keep existing size and alignment

    5. **End Turn button:**
       - Keep existing functionality and states
       - Consider adjusting colors to work with parchment card context
       - Maintain existing hover/disabled states

    **Key styling values from GamePlayerList:**
    - Background: `#fdf6e3`
    - Border: `4px solid #8d6e63`
    - Border radius: `12px`
    - Box shadow: `0 10px 20px rgba(0,0,0,0.3)`
    - Text color (headings): `#5d4037`

    **DO NOT:**
    - Remove any existing functionality (turn counter, phase indicator, End Turn button)
    - Change component logic or hooks
    - Modify animation behavior for "your turn" banner
    - Change width (keep at 200px to match layout)

  </action>
  <verify>
    ```bash
    # Run type check
    npx nx typecheck web

    # Start dev server and visually verify
    npx nx serve web
    # Navigate to game view and confirm:
    # 1. TurnControls has parchment background
    # 2. Brown border with rounded corners visible
    # 3. Shadow effect matches other card components
    # 4. All functionality works (End Turn, turn counter, phase text)
    # 5. Visual consistency with GamePlayerList cards
    ```

  </verify>
  <done>
    - TurnControls component has parchment background (#fdf6e3)
    - Component has brown border (4px solid #8d6e63) with 12px border radius
    - Box shadow matches GamePlayerList cards (0 10px 20px rgba(0,0,0,0.3))
    - Text colors updated for contrast on parchment
    - All existing functionality preserved (button works, turn counter displays, phase indicator shows)
    - TypeScript compiles without errors
    - Visual consistency achieved with GamePlayerList card design
  </done>
</task>

</tasks>

<verification>
Visual inspection in browser:
- TurnControls appears as parchment card matching GamePlayerList style
- Brown borders and shadows consistent with other cards
- Text readable with good contrast
- All interactive elements functional
- Design feels cohesive with rest of game UI
</verification>

<success_criteria>

- TurnControls visually matches GamePlayerList card aesthetic
- Component maintains all existing functionality
- No TypeScript errors
- Parchment background, brown borders, and shadow effects applied correctly
- Text colors provide good contrast on parchment background
  </success_criteria>

<output>
After completion, create `.planning/quick/017-apply-the-style-of-the-gameplayerlist-co/017-SUMMARY.md`
</output>
