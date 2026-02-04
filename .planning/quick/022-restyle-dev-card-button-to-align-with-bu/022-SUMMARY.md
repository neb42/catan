---
phase: quick-022
plan: 01
type: summary
subsystem: ui-components
tags: [ui, styling, dev-cards, consistency]

requires:
  - quick-014: BuildControls parchment styling pattern
  - quick-018: Development card aesthetic foundation

provides:
  - Consistent build control button styling
  - Dev card button matching BuildButton design

affects:
  - Future UI component styling updates

tech-stack:
  added: []
  patterns:
    - Custom styled button matching BuildButton pattern
    - Inline ResourceIcon cost display
    - Tooltip-based feedback for disabled states

key-files:
  created: []
  modified:
    - apps/web/src/components/DevCard/BuyDevCardButton.tsx

decisions:
  - decision: Use custom styled button instead of Mantine Button
    rationale: Match BuildButton design exactly for visual consistency
    alternatives: Keep Mantine Button with custom styles
    chosen: Custom button element
  - decision: Show cost as inline ResourceIcon components
    rationale: Consistent with BuildButton pattern for all build actions
    alternatives: Keep Badge with number count
    chosen: ResourceIcon components
  - decision: Display deck count in parentheses after cost
    rationale: Match BuildButton "remaining pieces" display pattern
    alternatives: Keep Badge component for deck count
    chosen: Inline text with parentheses

metrics:
  duration: ~1 minute
  completed: 2026-02-04
---

# Quick Task 022: Restyle Dev Card Button to Align with BuildButton Summary

**One-liner:** White-background button with brown border and inline resource cost icons matching BuildButton aesthetic

## What Was Built

Restyled the `BuyDevCardButton` component to match the visual design established in `BuildButton` from `BuildControls`. Replaced all Mantine UI components (Button, Badge, Group) with a custom styled button element that uses white background, brown border, and inline ResourceIcon components for cost display.

## Tasks Completed

| Task | Description                                          | Status      | Commit  |
| ---- | ---------------------------------------------------- | ----------- | ------- |
| 1    | Restyle BuyDevCardButton to match BuildButton design | ✅ Complete | 8541676 |

## Technical Implementation

### Component Structure Changes

**Before:**

- Mantine Button with outline variant (violet color)
- Badge component for deck count
- Group component for layout
- Conditional Tooltip wrapper

**After:**

- Custom styled button element with explicit CSS properties
- White background (#ffffff)
- Brown border (#d7ccc8, 2px solid)
- Border radius 8px, box shadow for depth
- Flex column layout with 4px gap
- Two-row structure:
  1. Icon (🃏) + Label ("Dev Card")
  2. Cost icons (wheat, sheep, ore) + Deck count

### Styling Details

**Button base styles:**

```typescript
background: 'white',
border: '2px solid #d7ccc8',
borderRadius: '8px',
boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
padding: '8px 12px',
opacity: canBuy ? 1 : 0.5,
cursor: canBuy ? 'pointer' : 'not-allowed',
```

**Top row (icon + label):**

- 🃏 emoji at 18px size
- "Dev Card" label: 14px, weight 600, color #5d4037
- Flex layout with 6px gap

**Bottom row (cost + count):**

- Three ResourceIcon components (wheat, sheep, ore) at size="sm" (20px)
- Wrapped in span with inline-flex, gap 2, opacity 0.8, marginLeft 4
- Deck count: 11px, color #8d6e63, marginLeft 4px, format `(${deckRemaining})`

**Tooltip behavior:**

- Always present (wraps entire button)
- Enabled state: "Cost: 1 wheat, 1 sheep, 1 ore"
- Disabled state: Shows specific reason (e.g., "Not enough resources")
- Position: top, withArrow, w: 200, multiline
- Transition: pop animation, 200ms duration

### Code Quality

- Removed unused imports (Button, Badge, Group from Mantine)
- Added ResourceIcon import for cost display
- Maintained TypeScript type safety with ResourceType casting
- Preserved all existing hooks and state management
- Consistent with BuildButton code structure

## Deviations from Plan

None - plan executed exactly as written.

## Files Modified

### apps/web/src/components/DevCard/BuyDevCardButton.tsx

**Changes:**

- Replaced Mantine Button/Badge/Group with custom styled button element
- Added ResourceIcon imports and inline cost display
- Restructured layout to match BuildButton two-row pattern
- Updated Tooltip to always wrap button (removed conditional wrapper)
- Changed disabled state styling to match BuildButton (opacity + cursor)

**Lines changed:** 78 insertions, 24 deletions

## Verification Performed

✅ TypeScript compilation successful (nx typecheck web)
✅ Component structure matches BuildButton pattern
✅ Cost display uses ResourceIcon components inline
✅ Tooltip shows cost breakdown when enabled
✅ Disabled state uses opacity 0.5 and not-allowed cursor
✅ Visual styling consistent with BuildButton (white bg, brown border)

## Visual Consistency Achieved

The BuyDevCardButton now visually matches the BuildButton components:

1. **Color scheme:** White background with #d7ccc8 brown border
2. **Layout:** Two-row flex column (icon+label, cost+count)
3. **Typography:** Same font sizes, weights, and colors
4. **Spacing:** Same padding (8px 12px), gap (4px), border radius (8px)
5. **Interactive states:** Same opacity and cursor behavior when disabled
6. **Shadows:** Same box shadow for depth (0 2px 4px rgba(0,0,0,0.1))
7. **Tooltips:** Same position, arrow, width, and transition behavior

## Impact

### User Experience

- Consistent visual design across all build-related controls
- Clearer cost visualization with resource tile icons
- Better disabled state feedback with tooltip explanations

### Developer Experience

- Pattern established for future button styling
- Reduced dependency on Mantine styled components
- Easier to maintain consistent design system

## Decisions Made

### Use Custom Styled Button Element

- **Context:** BuildButton uses custom styled button, BuyDevCardButton used Mantine Button
- **Decision:** Replace Mantine Button with custom styled button element
- **Rationale:** Exact visual match requires full control over all CSS properties
- **Impact:** Complete visual consistency with BuildButton

### Display Cost as Inline ResourceIcon Components

- **Context:** Original design used Badge for deck count only, no cost visualization
- **Decision:** Show three ResourceIcon components (wheat, sheep, ore) inline
- **Rationale:** Matches BuildButton pattern of showing cost visually with icons
- **Impact:** Users can see exact cost at a glance without reading tooltip

### Show Deck Count in Parentheses

- **Context:** Original design used Badge component with colored background
- **Decision:** Display deck count as text with parentheses like BuildButton's remaining count
- **Rationale:** Consistent with "remaining pieces" display pattern in BuildButton
- **Impact:** Unified display pattern for all build-related counts

## Next Phase Readiness

**Ready for:** Continued UI consistency improvements across game interface

**Provides:**

- Established pattern for build-related button styling
- ResourceIcon usage example for cost displays
- Tooltip pattern for contextual feedback

**No blockers or concerns.**
