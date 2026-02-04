---
phase: quick-019
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [apps/web/src/components/Trade/TradeButton.tsx]
autonomous: true

must_haves:
  truths:
    - "TradeButton matches ResourceHand's vintage card-game aesthetic"
    - 'TradeButton styling is consistent with the beige/brown theme'
    - 'Button remains functional with proper disabled states'
  artifacts:
    - path: 'apps/web/src/components/Trade/TradeButton.tsx'
      provides: 'Styled TradeButton matching ResourceHand design'
      min_lines: 40
  key_links:
    - from: 'apps/web/src/components/Trade/TradeButton.tsx'
      to: 'ResourceHand aesthetic (beige, brown, Fraunces font)'
      via: 'inline styles matching design system'
      pattern: 'background.*#fdf6e3|border.*#8d6e63|Fraunces'
---

<objective>
Restyle the TradeButton component to match the vintage card-game aesthetic of ResourceHand.

Purpose: Create visual consistency between the ResourceHand container and the TradeButton it contains, using the same beige/brown color scheme, serif typography, and overall design language.

Output: Updated TradeButton.tsx with custom styling that matches ResourceHand's aesthetic (beige background #fdf6e3, brown border #8d6e63, Fraunces font family, vintage button feel).
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/Trade/TradeButton.tsx
@apps/web/src/components/ResourceHand/ResourceHand.tsx
</context>

<tasks>

<task type="auto">
  <name>Restyle TradeButton to match ResourceHand aesthetic</name>
  <files>apps/web/src/components/Trade/TradeButton.tsx</files>
  <action>
    Replace the basic Mantine Button with a custom-styled button that matches the ResourceHand design language:
    
    1. Remove the Mantine Button component completely
    2. Create a native button element with inline styles matching ResourceHand:
       - Background: #fdf6e3 (beige/parchment) when enabled
       - Border: 3px solid #8d6e63 (brown)
       - Font: Fraunces, serif (matching "YOUR HAND" header)
       - Padding: 8px 16px for comfortable click target
       - Border radius: 8px (matching Paper radius="md")
       - Font weight: 600, size: 0.875rem (matching other text)
       - Color: #5d4037 (dark brown) for text
       - Box shadow: 0 2px 4px rgba(0,0,0,0.1) for subtle depth
       - Cursor: pointer when enabled, not-allowed when disabled
       - Transition: all 0.2s ease for smooth hover effects
    
    3. Add hover state (when not disabled):
       - Background: #f5ecd7 (slightly darker beige)
       - Transform: translateY(-1px)
       - Box shadow: 0 4px 8px rgba(0,0,0,0.15) (lifted effect)
    
    4. Add active/pressed state:
       - Transform: translateY(0)
       - Box shadow: 0 1px 2px rgba(0,0,0,0.1) (pressed effect)
    
    5. Add disabled state styles:
       - Opacity: 0.5
       - Background: #fdf6e3 (same as enabled, just dimmed via opacity)
       - Cursor: not-allowed
    
    6. Keep all existing logic (isMyTurn, turnPhase, isBlocked checks) unchanged
    7. Keep the onClick handler unchanged
    8. Ensure button text remains "Trade"
  </action>
  <verify>
    Run `npx nx typecheck web` to confirm no TypeScript errors.
    Visual verification: Start dev server `npx nx serve web` and check that TradeButton appears in ResourceHand with matching beige/brown styling, proper hover effects, and disabled state opacity.
  </verify>
  <done>
    TradeButton component uses custom inline styles matching ResourceHand aesthetic (beige #fdf6e3, brown border #8d6e63, Fraunces font), has proper hover/active/disabled states, and TypeScript compiles without errors.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Restyled TradeButton with vintage card-game aesthetic matching ResourceHand</what-built>
  <how-to-verify>
    1. Start the dev server: `npx nx serve web`
    2. Navigate to an active game where it's your turn during main phase
    3. Check the ResourceHand component in the bottom-left
    4. Verify TradeButton styling:
       - Beige background (#fdf6e3) matching the ResourceHand container
       - Brown border (~3px solid #8d6e63) matching container border style
       - Serif font (Fraunces) matching "YOUR HAND" header
       - Button has subtle shadow and vintage feel
    5. Test hover state (mouse over button):
       - Should lift slightly (translateY)
       - Background should darken slightly to #f5ecd7
       - Shadow should increase
    6. Test disabled state:
       - During robber phase or when not your turn
       - Button should appear dimmed (opacity 0.5)
       - Cursor should show not-allowed
    7. Verify button functionality:
       - Click should still open trade modal when enabled
  </how-to-verify>
  <resume-signal>Type "approved" to continue, or describe any styling issues</resume-signal>
</task>

</tasks>

<verification>
1. TypeScript compilation passes without errors
2. TradeButton visually matches ResourceHand aesthetic (beige, brown, Fraunces)
3. Hover effects work smoothly (lift, darken, shadow)
4. Disabled state shows proper opacity and cursor
5. Button functionality preserved (opens trade modal)
</verification>

<success_criteria>

- TradeButton uses beige background (#fdf6e3) and brown border (#8d6e63)
- Button uses Fraunces serif font matching ResourceHand typography
- Hover state provides visual feedback (lift, darken, shadow increase)
- Disabled state shows opacity 0.5 with not-allowed cursor
- All existing functionality remains intact
- User approves visual integration with ResourceHand container
  </success_criteria>

<output>
After completion, create `.planning/quick/019-restyle-the-tradebutton-to-make-it-match/019-SUMMARY.md`
</output>
