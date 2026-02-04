---
quick_task: 013
title: Replace emojis with tile icons
type: execute
subsystem: ui-resources
tags:
  - frontend
  - ui
  - icons
  - svg
  - resources
requires:
  - SVG tile assets in apps/web/public/assets/tiles/
provides:
  - ResourceIcon component
  - Consistent SVG-based resource icons across UI
affects:
  - Resource display components
  - Trade interfaces
  - Build controls
key-files:
  created:
    - apps/web/src/components/ResourceIcon/ResourceIcon.tsx
  modified:
    - apps/web/src/components/ResourceHand/ResourceHand.tsx
    - apps/web/src/components/Trade/ResourceSelector.tsx
    - apps/web/src/components/Trade/TradeResponseModal.tsx
    - apps/web/src/components/BuildControls/BuildControls.tsx
decisions: []
metrics:
  duration: 3 minutes
  completed: 2026-02-04
---

# Quick Task 013: Replace emojis with tile icons Summary

**One-liner:** Created reusable ResourceIcon component using SVG tile assets and replaced emoji-based resource icons across all UI components for improved visual consistency and quality.

## What Was Done

### Task 1: Create reusable ResourceIcon component ✅

- Created new ResourceIcon component in `apps/web/src/components/ResourceIcon/ResourceIcon.tsx`
- Accepts `ResourceType` and optional `size` prop ('xs' | 'sm' | 'md' | 'lg')
- Maps resource types to SVG tile paths:
  - wood → /assets/tiles/forest.svg
  - brick → /assets/tiles/hills.svg
  - sheep → /assets/tiles/pasture.svg
  - wheat → /assets/tiles/fields.svg
  - ore → /assets/tiles/mountains.svg
- Size mapping: xs=16px, sm=20px, md=28px, lg=40px (default: md)
- Includes proper accessibility with alt text
- **Commit:** 3c6949c

### Task 2: Replace emojis in ResourceHand component ✅

- Imported ResourceIcon component
- Removed RESOURCE_CARDS config object with emoji strings
- Split into separate RESOURCE_CARD_COLORS and RESOURCE_LABELS objects
- Updated ResourceCard function to render `<ResourceIcon type={type} size="lg" />` for card display
- Updated resource count display to use `<ResourceIcon type={type} size="xs" />`
- Maintained all existing animation, styling, and layout logic
- Preserved empty state emoji (🃏) as it's not a resource icon
- **Commit:** a1ad138

### Task 3: Replace emojis in all other UI components ✅

- **ResourceSelector.tsx:**
  - Removed RESOURCE_ICONS object
  - Replaced emoji Text element with `<ResourceIcon type={resource} size="md" />`
- **TradeResponseModal.tsx:**
  - Removed RESOURCE_ICONS object
  - Updated ResourceDisplay to use `<ResourceIcon type={resource} size="sm" />`
  - Wrapped in Group for proper layout with count
- **BuildControls.tsx:**
  - Removed RESOURCE_ICONS object
  - Added ResourceType to imports
  - Updated CostIcons to render ResourceIcon for each resource with size="sm"
  - Updated display styles for proper inline flex layout

- **Other components verified:**
  - MaritimeTrade.tsx: Uses ResourceSelector (already updated)
  - DomesticTrade.tsx: Uses ResourceSelector (already updated)
  - ResourcePickerModal.tsx: Uses text labels only (no icons)
  - MonopolyModal.tsx: Uses text labels only (no icons)
  - DiscardModal.tsx: Uses text labels only (no icons)
  - DevCardButton.tsx: Emoji is for dev card icon, not resources (kept as-is)

- **Commit:** 8da2e9c

## Deviations from Plan

None - plan executed exactly as written.

## Technical Decisions

| Decision                                   | Rationale                                                                              |
| ------------------------------------------ | -------------------------------------------------------------------------------------- |
| Map resource types to tile SVGs            | Leverage existing high-quality SVG assets for visual consistency with the game board   |
| Four size options (xs/sm/md/lg)            | Provides flexibility for different UI contexts while maintaining consistency           |
| Inline-block with vertical-align middle    | Ensures icons align properly with text in inline layouts                               |
| Split RESOURCE_CARDS into separate configs | ResourceIcon handles icon rendering, only color and label configs needed in components |
| Keep non-resource emojis                   | Empty state card emoji (🃏) and dev card icons are not resource displays               |

## Testing Performed

1. **Type checking:** `npx nx typecheck web` - ✅ Passed
2. **Build verification:** `npx nx build web` - ✅ Successful
3. **Emoji check:** Verified no resource emojis remain in codebase (grep -r)

## Files Modified

```
apps/web/src/components/ResourceIcon/ResourceIcon.tsx          (new)
apps/web/src/components/ResourceHand/ResourceHand.tsx          (modified)
apps/web/src/components/Trade/ResourceSelector.tsx            (modified)
apps/web/src/components/Trade/TradeResponseModal.tsx          (modified)
apps/web/src/components/BuildControls/BuildControls.tsx       (modified)
```

## Impact

### Positive

- **Visual consistency:** All resource icons now match the board tile aesthetics
- **Professional appearance:** SVG tiles are higher quality than emojis
- **Maintainability:** Single ResourceIcon component for all resource displays
- **Accessibility:** Proper alt text on all resource icons
- **Size control:** Consistent sizing across different UI contexts

### Neutral

- **Bundle size:** Minimal impact - SVG files already loaded for board tiles
- **Performance:** No perceptible difference - img elements vs. emoji characters

### No Breaking Changes

- All components maintain their existing APIs and behavior
- Resource displays work identically, just with SVG icons instead of emojis

## Verification Checklist

- [x] ResourceIcon component exists and exports properly
- [x] All resource displays use SVG tile icons
- [x] Icons render at appropriate sizes for context
- [x] No resource emoji characters remain (🌾🧱🐑⛰️🪵)
- [x] Non-resource emojis preserved (🃏 for empty state, dev card icons)
- [x] TypeScript types are correct (no type errors)
- [x] Build succeeds without warnings
- [x] All components compile successfully

## Next Steps

None required - quick task complete. Visual consistency achieved across all resource displays.

## Links

- **Directory:** `.planning/quick/013-replace-emojis-with-tile-icons/`
- **Plan:** `013-PLAN.md`
- **Commits:** 3c6949c, a1ad138, 8da2e9c
