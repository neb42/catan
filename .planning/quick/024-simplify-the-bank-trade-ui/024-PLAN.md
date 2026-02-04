---
phase: quick-024
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/Trade/MaritimeTrade.tsx
autonomous: true

must_haves:
  truths:
    - User can select giving resource from dropdown/select
    - User can select receiving resource from dropdown/select
    - Trade rates (2:1, 3:1, 4:1) are displayed clearly
    - Trade executes immediately when both resources selected
  artifacts:
    - path: apps/web/src/components/Trade/MaritimeTrade.tsx
      provides: Simplified bank trade interface
      min_lines: 100
  key_links:
    - from: apps/web/src/components/Trade/MaritimeTrade.tsx
      to: execute_bank_trade WebSocket message
      via: sendMessage call
      pattern: "type: 'execute_bank_trade'"
---

<objective>
Simplify the bank trade UI from a two-column click-to-select layout to a streamlined dropdown-based interface.

Purpose: Reduce visual clutter and interaction complexity in the maritime trade flow
Output: Cleaner bank trade interface with resource dropdowns instead of 10-row selection lists
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@apps/web/src/components/Trade/MaritimeTrade.tsx
@apps/web/src/components/Trade/TradeModal.tsx
</context>

<tasks>

<task type="auto">
  <name>Replace click-to-select layout with dropdown selectors</name>
  <files>apps/web/src/components/Trade/MaritimeTrade.tsx</files>
  <action>
Replace the current two-column layout showing all 10 resource rows with a cleaner dropdown-based interface:

**Remove:**

- Two-column Group layout with 5 resources each side
- Click-to-select interaction handlers (handleGiveSelect, handleReceiveSelect)
- Disabled ResourceSelector components used just for display
- Sequential selection requirement notification

**Add:**

- Mantine Select components for giving/receiving resource selection
- Display trade rate next to "Give" selector based on selected resource
- Auto-calculate giving amount based on rate when resource selected
- Simple "Trade with Bank" button (keep existing button logic)
- Keep port access Alert at top (lines 143-155)
- Keep trade summary Alert (lines 242-249)

**Structure:**

```tsx
<Stack gap="md">
  {/* Port access info - keep existing */}

  {/* Give selector */}
  <Select
    label={`Give (Rate: ${rate})`}
    data={resourceOptions} // Only show resources player can afford
    value={giving.resource}
    onChange={handleGiveChange}
  />

  {/* Receive selector */}
  <Select
    label="Receive"
    data={resourceOptions} // Exclude selected giving resource
    value={receiving.resource}
    onChange={handleReceiveChange}
  />

  {/* Trade summary - keep existing */}

  {/* Trade button - keep existing */}
</Stack>
```

**Behavior:**

- When giving resource selected, auto-set giving.amount to the rate (2, 3, or 4)
- When receiving resource selected, auto-set receiving.amount to 1
- Disable giving options where playerResources[resource] < rate
- Disable receiving option matching currently selected giving resource
- Keep existing handleTrade logic (lines 110-134)

**Style:**

- Apply parchment aesthetic to match other modals
- Select dropdown styles: backgroundColor '#fdf6e3', border '#d7ccc8', color '#5d4037'
- Keep existing Alert and Button styles
  </action>
  <verify>
  npm test apps/web -- MaritimeTrade.spec.tsx (if test exists) or manual verification:

1. Open trade modal, switch to Bank tab
2. Verify dropdowns appear instead of 10-row layout
3. Select giving resource - verify rate updates and amount auto-fills
4. Select receiving resource - verify it excludes giving resource
5. Click Trade with Bank - verify WebSocket message sent
   </verify>
   <done>
   Bank trade UI uses dropdown selectors instead of click-to-select layout, reducing interface from 10 rows to 2 compact dropdowns while maintaining all functionality
   </done>
   </task>

</tasks>

<verification>
1. Trade modal Bank tab displays simplified dropdown interface
2. Giving dropdown shows only affordable resources with rates
3. Receiving dropdown excludes selected giving resource
4. Trade executes correctly when both resources selected
5. Port access info still displays at top when applicable
</verification>

<success_criteria>

- MaritimeTrade.tsx uses Select components instead of two-column click layout
- UI reduced from ~10 visible rows to 2 dropdown selectors
- All existing trade logic (rates, port access, WebSocket) preserved
- Parchment aesthetic applied to dropdown components
  </success_criteria>

<output>
After completion, create `.planning/quick/024-simplify-the-bank-trade-ui/024-SUMMARY.md`
</output>
