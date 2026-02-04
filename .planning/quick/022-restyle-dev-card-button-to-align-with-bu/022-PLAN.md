---
phase: quick-022
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/DevCard/BuyDevCardButton.tsx
autonomous: true

must_haves:
  truths:
    - 'Dev Card button visual style matches BuildButton style'
    - 'Button shows cost icons inline like BuildButton'
    - 'Button is disabled when cannot buy with clear reason in tooltip'
  artifacts:
    - path: apps/web/src/components/DevCard/BuyDevCardButton.tsx
      provides: 'Restyled dev card button matching BuildButton aesthetic'
      min_lines: 80
  key_links:
    - from: apps/web/src/components/DevCard/BuyDevCardButton.tsx
      to: apps/web/src/components/ResourceIcon/ResourceIcon.tsx
      via: 'imports ResourceIcon for cost display'
      pattern: 'import.*ResourceIcon'
---

<objective>
Restyle the BuyDevCardButton component to match the visual design of BuildButton in BuildControls.

Purpose: Create consistent UI styling between all build-related controls
Output: BuyDevCardButton with white background, cost icons, and parchment-aligned styling
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

# Reference files for styling patterns

@apps/web/src/components/BuildControls/BuildControls.tsx
@apps/web/src/components/DevCard/BuyDevCardButton.tsx
@apps/web/src/components/ResourceIcon/ResourceIcon.tsx
</context>

<tasks>

<task type="auto">
  <name>Restyle BuyDevCardButton to match BuildButton design</name>
  <files>apps/web/src/components/DevCard/BuyDevCardButton.tsx</files>
  <action>
Replace the Mantine Button component with a custom styled button element matching BuildButton design:

1. Import ResourceIcon component for cost display
2. Replace Button/Badge/Group with custom styled button element:
   - Background: white
   - Border: 2px solid #d7ccc8 (same as BuildButton)
   - BorderRadius: 8px
   - BoxShadow: 0 2px 4px rgba(0,0,0,0.1)
   - Padding: 8px 12px
   - Display: flex column, center aligned, gap 4px
   - Opacity: 0.5 when disabled, 1 when enabled
   - Cursor: not-allowed when disabled, pointer when enabled
3. Create top row with icon + label:
   - Icon: 🃏 (playing card emoji, 18px)
   - Label: "Dev Card" (14px, 600 weight, #5d4037 color)
   - Display: flex, align center, gap 6px
4. Create bottom row with cost icons + deck count:
   - Cost: Display 3 ResourceIcon components (wheat, sheep, ore) inline
   - Each icon: size="sm", wrapped in span with inline-flex
   - Container: marginLeft 4px, opacity 0.8, display inline-flex, gap 2
   - Deck count: `(${deckRemaining})` in 11px, #8d6e63 color, marginLeft 4px
5. Wrap button in Tooltip:
   - Show cost breakdown when enabled: "Cost: 1 wheat, 1 sheep, 1 ore"
   - Show disabled reason when cannot buy
   - Position: top, withArrow, w: 200, multiline
   - TransitionProps: { transition: 'pop', duration: 200 }
6. Remove all Mantine Button/Badge/Group imports

Match BuildButton structure exactly for visual consistency.
</action>
<verify>
Run `npx nx serve web` and navigate to game board. Verify:

- Dev Card button has white background with brown border
- Button shows 🃏 icon + "Dev Card" label
- Cost shows as 3 inline resource icons (wheat, sheep, ore)
- Deck count shown in parentheses after cost
- Button disabled state shows opacity 0.5 and not-allowed cursor
- Tooltip shows cost when enabled, reason when disabled
- Visual style matches Road/Settlement/City buttons above it
  </verify>
  <done>
  BuyDevCardButton uses custom styled button element matching BuildButton design with white background, cost icons inline, and deck count display
  </done>
  </task>

</tasks>

<verification>
Visual consistency check:
- Dev Card button styling matches BuildButton (white background, brown border, same padding/radius)
- Cost display uses ResourceIcon components inline like BuildButton
- Button disabled state and cursor behavior matches BuildButton
- Tooltip behavior matches BuildButton pattern
</verification>

<success_criteria>

- BuyDevCardButton renders with white background and brown border
- Cost shows as 3 inline resource icons (wheat, sheep, ore)
- Button disabled state has opacity 0.5 and not-allowed cursor
- Button enabled state has opacity 1 and pointer cursor
- Tooltip shows cost breakdown or disabled reason
- Visual style is consistent with BuildButton components
  </success_criteria>

<output>
After completion, create `.planning/quick/022-restyle-dev-card-button-to-align-with-bu/022-SUMMARY.md`
</output>
