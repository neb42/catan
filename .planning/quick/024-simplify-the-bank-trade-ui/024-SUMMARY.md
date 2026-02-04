---
phase: quick-024
plan: 01
subsystem: frontend-ui
tags: [react, mantine, trade, ux, parchment]
requires: []
provides:
  - Simplified bank trade interface with dropdown selectors
affects: []
tech-stack:
  added: []
  patterns: [Mantine Select component, dropdown-based selection]
key-files:
  created: []
  modified:
    - apps/web/src/components/Trade/MaritimeTrade.tsx
decisions: []
metrics:
  duration: 1 minute
  completed: 2026-02-04
---

# Quick Task 024: Simplify the Bank Trade UI

**One-liner:** Replace click-to-select layout with streamlined dropdown selectors, reducing UI from 10 rows to 2 compact Select components

## What Was Built

Refactored the MaritimeTrade component to use Mantine Select dropdowns instead of the previous two-column click-to-select layout with 10 resource rows (5 per column).

### Key Changes

1. **Dropdown-based selection:**
   - Give dropdown: Shows only affordable resources with rate info (e.g., "Wood (4:1) - have 8")
   - Receive dropdown: Shows all resources except selected giving resource
   - Receive dropdown disabled until giving resource selected

2. **Auto-calculation:**
   - Selecting giving resource auto-sets amount to trade rate (2, 3, or 4)
   - Selecting receiving resource auto-sets amount to 1

3. **Simplified handlers:**
   - Replaced `handleGiveSelect` with `handleGiveChange` for dropdown
   - Replaced `handleReceiveSelect` with `handleReceiveChange` for dropdown
   - Removed sequential selection notification (now enforced by UI state)

4. **Parchment aesthetic:**
   - Applied to Select inputs (#fdf6e3 background, #d7ccc8 border)
   - Applied to Alert components (port access info, trade summary)
   - Applied to Button component (#6d4c41 background, #5d4037 border)

5. **Removed dependencies:**
   - ResourceSelector component no longer used in this component
   - Group and Divider components no longer needed

### File Changes

**Modified: `apps/web/src/components/Trade/MaritimeTrade.tsx` (-136, +119 = -17 net lines)**

- Removed: Two-column Group layout with clickable resource rows
- Removed: Click handlers for visual selection
- Removed: Sequential selection notification
- Added: Two Select components with dynamic option filtering
- Added: Parchment aesthetic styling throughout
- Kept: All existing trade logic (rates, port access, canTrade validation, WebSocket)

## Deviations from Plan

None - plan executed exactly as written.

## Testing

- **TypeScript:** Passed `npx nx typecheck web`
- **Manual verification needed:**
  1. Open trade modal → Bank tab
  2. Verify dropdowns appear instead of 10-row layout
  3. Select giving resource → verify rate appears in label and amount auto-fills
  4. Select receiving resource → verify it excludes giving resource
  5. Click "Trade with Bank" → verify WebSocket message sent correctly

## Next Phase Readiness

### Ready for Next Phase

- UI simplification complete
- All trade functionality preserved
- Parchment aesthetic applied consistently

### Blockers/Concerns

None

## Decisions Made

None - straightforward UI refactoring using existing patterns.

## Knowledge Transfer

### For Future Developers

**Why dropdowns instead of click-to-select?**

- Reduces visual clutter (2 controls vs 10 rows)
- Standard UI pattern more intuitive for users
- Easier to show contextual info (rates, available amounts) in dropdown labels
- Still enforces valid selections through disabled states

**Port access info display:**
The Alert at the top shows which special trade rates the player has access to based on their settlements/cities adjacent to ports. This remains unchanged from previous implementation.

**Trade flow:**

1. Player selects giving resource from dropdown (filtered to affordable only)
2. Amount auto-set to rate (2:1, 3:1, or 4:1)
3. Player selects receiving resource from dropdown (excludes giving)
4. Amount auto-set to 1
5. Trade summary Alert appears showing "X resource → 1 resource"
6. Player clicks "Trade with Bank" button
7. WebSocket message sent: `execute_bank_trade` with giving/receiving resource maps

### Implementation Notes

- **Option filtering:** `giveOptions` filters to resources where `playerResources[resource] >= rate`
- **Dynamic receive options:** `receiveOptions` rebuilds when `giving.resource` changes
- **Label formatting:** Give dropdown shows `"Wood (4:1) - have 8"` for clarity
- **Disabled state:** Receive dropdown disabled until giving resource selected (enforces flow)

## Metrics

- **Duration:** 1 minute
- **Files modified:** 1
- **Lines changed:** -17 net (-136 removed, +119 added)
- **Components removed:** ResourceSelector usage (component still exists, just not used here)
- **New imports:** Select (Mantine)
- **Removed imports:** Divider, Group, ResourceSelector

## Commits

- `6190cf9`: feat(quick-024): simplify bank trade UI to dropdown selectors
