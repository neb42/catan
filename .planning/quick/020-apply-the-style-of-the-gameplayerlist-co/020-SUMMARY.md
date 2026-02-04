---
phase: quick-020
plan: 01
subsystem: ui-theming
tags: [styling, modals, parchment-aesthetic, consistency, card-play, trade]
requires: [quick-009, quick-012, quick-014, quick-016, quick-017, quick-019]
provides:
  - Unified parchment aesthetic across all modal components
  - Custom styled card play modals (Monopoly, Year of Plenty)
  - Custom styled trade modals (TradeModal, TradeProposerView, TradeResponseModal)
  - Consistent color scheme and design language
affects: []
key-files:
  created: []
  modified:
    - apps/web/src/components/CardPlay/MonopolyModal.tsx
    - apps/web/src/components/CardPlay/ResourcePickerModal.tsx
    - apps/web/src/components/Trade/TradeModal.tsx
    - apps/web/src/components/Trade/TradeProposerView.tsx
    - apps/web/src/components/Trade/TradeResponseModal.tsx
tech-stack:
  added: []
  patterns:
    - Custom modal overlays with inline styles
    - Parchment card aesthetic (#fdf6e3, #8d6e63, #d7ccc8)
    - Consistent interactive element styling
    - Hover state animations with transform and shadow
decisions: []
metrics:
  duration: 5 minutes
  completed: 2026-02-04
---

# Quick Task 020: Apply GamePlayerList Style to Modal Components Summary

**One-liner:** Applied cohesive parchment/card aesthetic to all trade and card play modals using GamePlayerList design system

## What Was Built

Applied the established GamePlayerList parchment aesthetic to 5 modal components, creating a unified visual style across the entire game interface:

### 1. MonopolyModal (Monopoly Development Card)

- Replaced Mantine Modal with custom styled modal overlay
- Applied parchment background (#fdf6e3) with warm brown border (#8d6e63, 4px solid, 12px radius)
- Created custom resource selection buttons styled like GamePlayerList stat icons
- Resource buttons with white background, colored borders, hover effects with color fill
- Added ResourceIcon integration for consistent iconography
- Maintained blocking modal behavior (no close until selection made)

### 2. ResourcePickerModal (Year of Plenty Development Card)

- Applied same parchment modal styling as MonopolyModal
- Created custom "Selected" section with rgba(0,0,0,0.03) background and dashed border
- Replaced Mantine Badges with custom styled chips matching resource colors
- Clickable chips with remove functionality (✕ indicator)
- Custom resource selection buttons with ResourceIcon integration
- Submit button styled with warm brown theme (#5d4037 background, white text)
- Disabled states handled with opacity and cursor changes

### 3. TradeModal (Main Trade Interface)

- Applied custom modal styles to outer Modal component
- Parchment background (#fdf6e3) for modal content
- Styled header with rgba(0,0,0,0.03) background and 2px dashed #d7ccc8 separator
- Custom tab styling:
  - Tab list with rgba(0,0,0,0.03) background
  - Active tab: #5d4037 color with 3px solid #8d6e63 bottom border
  - Inactive tabs: #a1887f color
  - Hover effect: rgba(141, 110, 99, 0.1) background
- Badge for best rate (2:1/3:1/4:1) styled with #d35400 background
- Maintains ScrollArea for long content

### 4. TradeProposerView (Trade Proposal Status Card)

- Removed Mantine Paper, replaced with custom styled container
- Card-like design: #fdf6e3 background, 2px solid #8d6e63 border, 12px radius
- Box-shadow: 0 4px 8px rgba(0,0,0,0.15)
- Header section with rgba(0,0,0,0.03) background and dashed separator
- Custom status badges:
  - Pending: #808080 background, white text
  - Accepted: #27ae60 background, white text
  - Declined: #c0392b background, white text
- Player list items with white background, #d7ccc8 borders
- "Trade with" button: #5d4037 background with hover lift effect
- "Cancel Trade" button: #c0392b outline with hover fill

### 5. TradeResponseModal (Incoming Trade Offer)

- Applied full parchment modal styling
- Custom modal content: #fdf6e3 background
- Header: rgba(0,0,0,0.03) background, 2px dashed #d7ccc8 border
- Title styled with #5d4037 color and Fraunces serif font
- ResourceDisplay components styled as white cards:
  - White background with 1px solid #d7ccc8 border
  - 8px border-radius
  - Box-shadow: 0 2px 4px rgba(0,0,0,0.1)
- Accept button: #27ae60 background with hover darkening
- Decline button: #c0392b outline with hover fill
- Disabled state handling for insufficient resources

## Design System Consistency

All modal components now follow the GamePlayerList design patterns:

**Colors:**

- Parchment background: #fdf6e3
- Primary border: #8d6e63 (4px solid for modals, 2px for cards)
- Subtle border: #d7ccc8
- Primary text: #5d4037
- Secondary text: #a1887f
- Success: #27ae60
- Danger: #c0392b
- Badge accent: #d35400

**Separators:**

- 2px dashed #d7ccc8 for section divisions

**Section backgrounds:**

- rgba(0,0,0,0.03) for headers and grouped content

**Shadows:**

- Subtle: 0 2px 4px rgba(0,0,0,0.1)
- Card: 0 4px 8px rgba(0,0,0,0.15)
- Prominent: 0 10px 20px rgba(0,0,0,0.3)

**Interactive elements:**

- White backgrounds with colored borders
- Hover effects: translateY(-2px to -3px) with enhanced shadows
- Border-radius: 6-8px for buttons, 12px for cards
- Smooth transitions: all 0.2s

**Typography:**

- Headers: Fraunces serif font family
- Body: Inter sans-serif font family
- Weights: 600 for emphasis

## Technical Approach

### Replaced Mantine with Custom Styles

**MonopolyModal & ResourcePickerModal:**

- Full custom modal overlay (position: fixed, inset: 0)
- Removed all Mantine components (Modal, Button, Stack, Text, SimpleGrid, Group, Badge)
- Inline styles for all elements to ensure consistency
- Direct event handlers for hover effects (onMouseEnter/onMouseLeave)

**TradeModal:**

- Kept Mantine Modal shell, applied custom styles via styles prop
- Custom styling for Tabs.List and Tab elements
- Custom Badge styling with inline styles

**TradeProposerView:**

- Removed Mantine Paper, Button, Stack, Text, Group, Badge
- Pure HTML elements (div, button, span) with inline styles
- Manual flexbox layouts for spacing and alignment

**TradeResponseModal:**

- Kept Mantine Modal shell with custom styles
- Removed Mantine Paper, Button, Stack, Text, Group from ResourceDisplay
- Pure HTML elements with inline styles

### Why Inline Styles?

For this quick task, inline styles were chosen to:

1. Ensure exact color matching without CSS specificity issues
2. Avoid creating new CSS modules or styled components
3. Enable dynamic hover states with inline event handlers
4. Guarantee no Mantine theme overrides interfere
5. Keep all styling co-located with component logic

### Hover State Implementation

Used onMouseEnter/onMouseLeave pattern consistently:

```typescript
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-2px)';
  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
}}
```

This provides smooth, consistent hover effects across all interactive elements.

## Testing & Verification

**Build Status:** ✅ Passed

- `npx nx typecheck web` - No type errors
- `npx nx build web` - Built successfully in 2.34s

**Functional Testing:** ✅ Approved by user

- MonopolyModal: Resource selection working, parchment aesthetic applied
- ResourcePickerModal: Two-resource selection working, custom chips functional
- TradeModal: Tab navigation working, badge displays correct rate
- TradeProposerView: Response tracking working, status badges correct
- TradeResponseModal: Accept/Decline working, resource display correct

**Visual Consistency:** ✅ Verified

- All modals match GamePlayerList color scheme
- Dashed separators present in all appropriate locations
- Shadows and hover effects smooth and consistent
- No Mantine default styles breaking through

## Deviations from Plan

None - plan executed exactly as written.

## Impact & Benefits

### User Experience

- **Visual Cohesion:** All modals now feel like part of the same game world
- **Professional Polish:** Consistent design language elevates perceived quality
- **Clear Hierarchy:** Parchment aesthetic creates clear modal/overlay separation from game board
- **Intuitive Interactions:** Hover effects provide clear affordance for clickable elements

### Developer Experience

- **Design System:** Established clear patterns for future modal development
- **Maintainability:** Consistent styling makes future updates easier
- **No Dependencies:** Reduced reliance on Mantine theme configuration

### Technical

- **Performance:** Inline styles avoid CSS parsing overhead for these specific components
- **Bundle Size:** No impact (no new dependencies)
- **Type Safety:** Maintained full TypeScript type checking

## Files Changed

### Modified (5 files)

1. **apps/web/src/components/CardPlay/MonopolyModal.tsx** (70 → 150 lines)
   - Replaced Mantine Modal with custom overlay
   - Added ResourceIcon integration
   - Custom resource button grid with hover effects

2. **apps/web/src/components/CardPlay/ResourcePickerModal.tsx** (111 → 258 lines)
   - Replaced Mantine Modal with custom overlay
   - Custom selected resource chip display
   - Resource selection buttons with ResourceIcon
   - Custom styled submit button

3. **apps/web/src/components/Trade/TradeModal.tsx** (109 → 138 lines)
   - Applied custom styles to Mantine Modal
   - Styled Tabs component with warm brown theme
   - Custom badge styling for rate indicator

4. **apps/web/src/components/Trade/TradeProposerView.tsx** (74 → 159 lines)
   - Removed Mantine Paper
   - Custom card-like container
   - Custom status badges (Pending/Accepted/Declined)
   - Styled action buttons

5. **apps/web/src/components/Trade/TradeResponseModal.tsx** (107 → 167 lines)
   - Applied custom styles to Mantine Modal
   - Styled ResourceDisplay as white cards
   - Custom Accept/Decline buttons with hover effects

## Related Quick Tasks

This task completes the UI theming initiative started in previous quick tasks:

- **Quick 009:** Refactored GamePlayerList to vertical card layout (established parchment aesthetic)
- **Quick 012:** Applied GamePlayerList style to ResourceHand
- **Quick 014:** Applied GamePlayerList style to BuildControls
- **Quick 016:** Applied GamePlayerList style to DiceRoller
- **Quick 017:** Applied GamePlayerList style to TurnControls
- **Quick 018:** Redesigned development cards to playing card aesthetic
- **Quick 019:** Restyled TradeButton to match ResourceHand aesthetic
- **Quick 020 (this):** Applied GamePlayerList style to all modal components

The game UI now has complete visual consistency across all interactive components.

## Next Steps

All planned UI theming tasks are now complete. Possible future enhancements:

1. **Extract Design System:** Create shared constants/utilities for colors, shadows, etc.
2. **Animation Library:** Consider adding motion/react animations to modal transitions
3. **Accessibility:** Add ARIA labels and keyboard navigation to custom modals
4. **Responsive Design:** Optimize modal sizing for smaller screens
5. **Dark Mode:** Create alternate color palette for night play

## Lessons Learned

1. **Inline Styles for Quick Wins:** For small-scope styling tasks, inline styles provide rapid iteration without build tool overhead
2. **Hover State Pattern:** Consistent onMouseEnter/onMouseLeave pattern works well for simple animations
3. **Incremental Theming:** Breaking UI theming into multiple quick tasks allowed for focused, reviewable changes
4. **Design System Value:** Having established patterns (from GamePlayerList) made subsequent components much faster to style

## Commits

1. **836928e** - `feat(quick-020): apply parchment aesthetic to card play modals`
   - MonopolyModal.tsx, ResourcePickerModal.tsx
2. **2e99ddd** - `feat(quick-020): apply parchment aesthetic to trade components`
   - TradeModal.tsx, TradeProposerView.tsx, TradeResponseModal.tsx
