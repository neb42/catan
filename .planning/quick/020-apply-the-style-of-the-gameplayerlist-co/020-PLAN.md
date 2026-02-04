---
phase: quick-020
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/CardPlay/MonopolyModal.tsx
  - apps/web/src/components/CardPlay/ResourcePickerModal.tsx
  - apps/web/src/components/Trade/TradeModal.tsx
  - apps/web/src/components/Trade/TradeProposerView.tsx
  - apps/web/src/components/Trade/TradeResponseModal.tsx
autonomous: true

must_haves:
  truths:
    - 'All modal components have GamePlayerList aesthetic styling'
    - 'Modals use #fdf6e3 background with #8d6e63 borders'
    - 'Modal content areas use rgba(0,0,0,0.03) background with dashed separators'
    - 'Buttons retain functionality while matching visual style'
  artifacts:
    - path: 'apps/web/src/components/CardPlay/MonopolyModal.tsx'
      provides: 'Styled Monopoly modal with parchment aesthetic'
      min_lines: 70
    - path: 'apps/web/src/components/CardPlay/ResourcePickerModal.tsx'
      provides: 'Styled Year of Plenty modal with parchment aesthetic'
      min_lines: 110
    - path: 'apps/web/src/components/Trade/TradeModal.tsx'
      provides: 'Styled trade modal container with parchment aesthetic'
      min_lines: 109
    - path: 'apps/web/src/components/Trade/TradeProposerView.tsx'
      provides: 'Styled trade proposer view with parchment aesthetic'
      min_lines: 74
    - path: 'apps/web/src/components/Trade/TradeResponseModal.tsx'
      provides: 'Styled trade response modal with parchment aesthetic'
      min_lines: 107
  key_links:
    - from: 'MonopolyModal.tsx'
      to: 'GamePlayerList style patterns'
      via: 'inline styles matching color scheme'
      pattern: "#fdf6e3|#8d6e63|rgba\\(0,0,0,0\\.03\\)"
    - from: 'ResourcePickerModal.tsx'
      to: 'GamePlayerList style patterns'
      via: 'inline styles matching color scheme'
      pattern: "#fdf6e3|#8d6e63|rgba\\(0,0,0,0\\.03\\)"
    - from: 'TradeModal.tsx'
      to: 'GamePlayerList style patterns'
      via: 'inline styles matching color scheme'
      pattern: "#fdf6e3|#8d6e63|rgba\\(0,0,0,0\\.03\\)"
---

<objective>
Apply the cohesive parchment/card aesthetic from GamePlayerList component to all trade and card play modals, creating a unified visual style across the game interface.

**Purpose:** Create visual consistency across all modal interactions by applying the established GamePlayerList design system (parchment background, warm borders, dashed separators, card-like sections).

**Output:** Five modal components styled to match the GamePlayerList aesthetic while maintaining all existing functionality.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/GamePlayerList.tsx
@apps/web/src/components/ResourceHand/ResourceHand.tsx
@apps/web/src/components/CardPlay/MonopolyModal.tsx
@apps/web/src/components/CardPlay/ResourcePickerModal.tsx
@apps/web/src/components/Trade/TradeModal.tsx
@apps/web/src/components/Trade/TradeProposerView.tsx
@apps/web/src/components/Trade/TradeResponseModal.tsx
</context>

<tasks>

<task type="auto">
<name>Apply GamePlayerList style to MonopolyModal and ResourcePickerModal</name>

<files>
apps/web/src/components/CardPlay/MonopolyModal.tsx
apps/web/src/components/CardPlay/ResourcePickerModal.tsx
</files>

<action>
Update both card play modals to match GamePlayerList aesthetic:

**MonopolyModal.tsx:**

- Replace Mantine Modal with custom styled modal overlay using inline styles
- Apply parchment background (#fdf6e3) with warm brown border (#8d6e63, 4px solid, 12px radius)
- Style instruction text with warm brown color (#5d4037)
- Create custom resource selection buttons with:
  - White background with subtle border (#d7ccc8)
  - Circular or rounded design matching GamePlayerList stat icons
  - Resource-specific colors on hover
  - Box shadow: 0 2px 4px rgba(0,0,0,0.1)
- Add dashed separator (2px dashed #d7ccc8) between instructions and buttons
- Maintain blocking modal behavior (opened={true}, no close)

**ResourcePickerModal.tsx:**

- Apply same parchment modal styling as MonopolyModal
- Style "Selected" section with:
  - Background: rgba(0,0,0,0.03)
  - Border-bottom: 2px dashed #d7ccc8
  - Padding: 12px
- Replace Mantine Badge with custom styled chips matching GamePlayerList achievement badges
- Style resource selection buttons similar to MonopolyModal
- Style submit button with warm brown theme (#5d4037 background, white text)
- Remove Mantine dependencies where inline styles can replace them

**Design principles from GamePlayerList:**

- Card-like container: #fdf6e3 background, #8d6e63 border, 12px radius, box-shadow: 0 10px 20px rgba(0,0,0,0.3)
- Section headers: rgba(0,0,0,0.03) background
- Separators: 2px dashed #d7ccc8
- Text colors: #5d4037 for headers, dimmed for secondary
- Interactive elements: white background, hover lift effect, subtle shadows
  </action>

<verify>
1. Run `npx nx serve web` and navigate to game
2. Test Monopoly card play - modal displays with parchment aesthetic
3. Test Year of Plenty card play - modal displays with parchment aesthetic and styled selection
4. Verify all buttons remain functional (resource selection, submission, cancellation)
5. Check visual consistency with GamePlayerList component styling
</verify>

<done>
- MonopolyModal uses parchment background (#fdf6e3) with warm brown border (#8d6e63)
- ResourcePickerModal uses same styling with custom selected resource chips
- Both modals have dashed separators and consistent color scheme
- Resource selection buttons styled like GamePlayerList stat icons
- All modal interactions remain functional
</done>
</task>

<task type="auto">
<name>Apply GamePlayerList style to TradeModal, TradeProposerView, and TradeResponseModal</name>

<files>
apps/web/src/components/Trade/TradeModal.tsx
apps/web/src/components/Trade/TradeProposerView.tsx
apps/web/src/components/Trade/TradeResponseModal.tsx
</files>

<action>
Update all three trade components to match GamePlayerList aesthetic:

**TradeModal.tsx:**

- Apply custom modal styles to outer Modal component:
  - styles.content: backgroundColor: '#fdf6e3'
  - styles.header: borderBottom: '2px dashed #d7ccc8', background: 'rgba(0,0,0,0.03)'
  - styles.body: maintain padding: 0 for tabs
- Style Tabs component:
  - Tabs.List: background: 'rgba(0,0,0,0.03)', border-bottom: '2px dashed #d7ccc8'
  - Active tab: color: '#5d4037', border-bottom: '3px solid #8d6e63'
  - Inactive tabs: color: '#a1887f'
- Update badge colors to match warm brown theme (#d35400 for rate indicators)
- Ensure ScrollArea has no conflicting styles

**TradeProposerView.tsx:**

- Replace Mantine Paper with custom styled container:
  - Background: #fdf6e3
  - Border: 2px solid #8d6e63
  - Border-radius: 12px
  - Box-shadow: 0 4px 8px rgba(0,0,0,0.15)
  - Padding: 16px
- Style header with rgba(0,0,0,0.03) background and bottom border
- Create custom badge styling for response status:
  - Pending: #808080 background
  - Accepted: #27ae60 background
  - Declined: #c0392b background
  - White text, 2px 6px padding, 4px radius
- Style "Trade with" button: #5d4037 background, white text, hover lift effect
- Style "Cancel Trade" button: #c0392b outline

**TradeResponseModal.tsx:**

- Apply full parchment modal styling like MonopolyModal
- Style ResourceDisplay Paper components:
  - Background: white
  - Border: 1px solid #d7ccc8
  - Border-radius: 8px
  - Padding: 12px
  - Box-shadow: 0 2px 4px rgba(0,0,0,0.1)
- Section labels: color #5d4037, font-weight 600
- Style Accept button: #27ae60 background, white text
- Style Decline button: #c0392b outline, hover to filled
- Maintain blocking modal behavior

**Consistent styling patterns:**

- Container backgrounds: #fdf6e3
- Borders: #8d6e63 (primary), #d7ccc8 (subtle)
- Section separators: 2px dashed #d7ccc8
- Section backgrounds: rgba(0,0,0,0.03)
- Primary text: #5d4037
- Success: #27ae60
- Danger: #c0392b
- Shadows: 0 2px 4px rgba(0,0,0,0.1) for subtle, 0 10px 20px rgba(0,0,0,0.3) for prominent
  </action>

<verify>
1. Run `npx nx serve web` and test trade flow:
   - Open trade modal from TradeButton - verify parchment styling on modal and tabs
   - Propose a domestic trade - verify TradeProposerView uses parchment card styling
   - Receive a trade offer (as another player) - verify TradeResponseModal parchment styling
2. Verify all trade actions work correctly (propose, accept, decline, cancel, maritime)
3. Check visual consistency across all three trade components
4. Verify badges, buttons, and status indicators match GamePlayerList aesthetic
</verify>

<done>
- TradeModal has parchment styling with warm brown tabs and borders
- TradeProposerView uses card-like container with #fdf6e3 background and custom badges
- TradeResponseModal applies full parchment aesthetic with styled resource displays
- All trade interactions remain functional
- All five modal components now share consistent GamePlayerList styling
</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
<what-built>
Applied GamePlayerList parchment aesthetic to 5 modal components:
1. MonopolyModal - resource selection with card-like design
2. ResourcePickerModal - Year of Plenty with custom selection chips
3. TradeModal - tabbed trade interface with warm styling
4. TradeProposerView - trade proposal status card
5. TradeResponseModal - incoming trade offer modal
</what-built>

<how-to-verify>
**Visual Consistency Check:**
1. Start the web app: `npx nx serve web`
2. Join/create a game and advance to main gameplay

**Test MonopolyModal:** 3. Play a Monopoly development card 4. Verify modal has parchment background (#fdf6e3) with brown border 5. Verify resource buttons styled like GamePlayerList stat icons 6. Select a resource and confirm functionality works

**Test ResourcePickerModal:** 7. Play a Year of Plenty development card 8. Verify modal matches MonopolyModal styling 9. Verify selected resources display with custom styled chips (not Mantine badges) 10. Select 2 resources and submit - verify functionality

**Test TradeModal:** 11. Click the Trade button 12. Verify modal has parchment styling with warm brown tabs 13. Switch between "Players" and "Bank" tabs - verify tab styling 14. Verify badge shows best rate (2:1, 3:1, or 4:1) with warm colors 15. Check DomesticTrade and MaritimeTrade panels display correctly

**Test TradeProposerView:** 16. Propose a domestic trade to another player 17. Verify the proposal view card has #fdf6e3 background and #8d6e63 border 18. Verify status badges (Pending/Accepted/Declined) use custom styling 19. Wait for response and verify "Trade with" button styling

**Test TradeResponseModal:** 20. As another player, receive the trade offer 21. Verify modal has parchment styling matching other modals 22. Verify resource displays use white cards with #d7ccc8 borders 23. Verify Accept (green) and Decline (red) buttons styled appropriately 24. Accept or decline and verify functionality

**Overall consistency:** 25. Compare all modals side-by-side with GamePlayerList component 26. Verify consistent use of colors: #fdf6e3, #8d6e63, #d7ccc8, #5d4037 27. Verify all dashed separators (2px dashed #d7ccc8) are present 28. Verify shadows and hover effects work smoothly

**Expected results:**

- All 5 modals share the parchment/card aesthetic of GamePlayerList
- Visual consistency across the entire game interface
- No Mantine default styles breaking through
- All interactive functionality preserved
  </how-to-verify>

<resume-signal>
Type "approved" if styling is consistent and functional, or describe any visual issues to fix
</resume-signal>
</task>

</tasks>

<verification>
**Build Check:**
```bash
npx nx build web
```

**Type Check:**

```bash
npx nx typecheck web
```

**Lint Check:**

```bash
npx eslint apps/web/src/components/CardPlay/*.tsx apps/web/src/components/Trade/*.tsx
```

**Visual Verification:**
All five modal components should:

- Use #fdf6e3 parchment background
- Have #8d6e63 warm brown borders (4px solid, 12px radius)
- Include 2px dashed #d7ccc8 separators where appropriate
- Use rgba(0,0,0,0.03) for section backgrounds
- Display #5d4037 text for primary content
- Show consistent shadows and hover effects
- Match the overall aesthetic of GamePlayerList component
  </verification>

<success_criteria>

- All 5 modal components successfully styled with GamePlayerList aesthetic
- Parchment background (#fdf6e3) and warm borders (#8d6e63) applied consistently
- Dashed separators (2px dashed #d7ccc8) used for content sections
- Custom styled buttons, badges, and interactive elements match GamePlayerList stat icons
- All modal functionality remains intact (card play, trade proposal, trade response)
- No TypeScript or ESLint errors introduced
- Visual consistency verified through human testing of all modal interactions
  </success_criteria>

<output>
After completion, create `.planning/quick/020-apply-the-style-of-the-gameplayerlist-co/020-SUMMARY.md`
</output>
