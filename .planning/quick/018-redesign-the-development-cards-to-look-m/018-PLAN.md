---
phase: quick-018
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/DevCard/DevCardButton.tsx
  - apps/web/src/components/ResourceHand/ResourceHand.tsx
autonomous: true

must_haves:
  truths:
    - 'Development cards display as card-shaped components with proper proportions'
    - 'Dev cards have distinct visual styling matching playing card aesthetic'
    - 'Dev cards animate and respond to hover interactions'
  artifacts:
    - path: 'apps/web/src/components/DevCard/DevCardButton.tsx'
      provides: 'Playing card styled dev card component'
      min_lines: 80
  key_links:
    - from: 'apps/web/src/components/ResourceHand/ResourceHand.tsx'
      to: 'DevCardButton'
      via: 'component import and render'
      pattern: 'DevCardButton'
---

<objective>
Redesign development cards to match the playing card aesthetic of resource cards

**Purpose:** Create visual consistency between resource cards and dev cards, making dev cards look like proper playing cards with distinct styling.

**Output:** Dev cards rendered as playing card-shaped components with animations and hover effects
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@apps/web/src/components/DevCard/DevCardButton.tsx
@apps/web/src/components/ResourceHand/ResourceHand.tsx
</context>

<tasks>

<task type="auto">
  <name>Redesign DevCardButton to playing card aesthetic</name>
  <files>apps/web/src/components/DevCard/DevCardButton.tsx</files>
  <action>
Transform DevCardButton from a Mantine Button to a playing card design:

1. **Card dimensions and structure:**
   - Use similar proportions to ResourceCard (width: 80px, height: 110px for slightly larger dev cards)
   - Replace Button component with motion.div from framer-motion for animations
   - Use Paper component with custom styling for card body

2. **Visual styling:**
   - Each card type gets distinct background color (use existing CARD_INFO colors)
   - Add white border (2px solid rgba(255, 255, 255, 0.3))
   - Add card pattern overlay (radial gradient like resource cards)
   - Add box-shadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
   - Border radius: 'md'

3. **Card layout:**
   - Icon at top (fontSize: 32, with drop-shadow filter)
   - Card name below icon (size: 'xs', fw: 600, white text with text-shadow)
   - Both centered with flexDirection: 'column'

4. **Animations:**
   - Add whileHover: scale 1.05, y: -8, transition: 0.15s
   - Add whileTap: scale 0.98 (if clickable)
   - transformOrigin: 'bottom center'

5. **Disabled state:**
   - Reduce opacity to 0.5 when !canPlay
   - Disable pointer-events when !canPlay
   - Keep Tooltip wrapper for disabled reasons

6. **VP card distinction:**
   - Use subtle gold shimmer overlay for VP cards (optional gradient animation)
   - Maintain existing logic for canPlay checks

**Why avoid Mantine Button:** Resource cards use motion.div + Paper for card-like appearance with custom animations. Buttons look like UI controls, not playing cards.
</action>
<verify>
npm run dev, navigate to game with dev cards, confirm:

- Dev cards display as rectangular cards with proper proportions
- Each card type has distinct color styling
- Cards animate on hover (lift up, scale slightly)
- Disabled cards show with reduced opacity
- Tooltips still work for disabled cards
  </verify>
  <done>DevCardButton renders as playing card-styled component with animations and proper visual styling</done>
  </task>

<task type="auto">
  <name>Adjust dev card layout in ResourceHand</name>
  <files>apps/web/src/components/ResourceHand/ResourceHand.tsx</files>
  <action>
Update dev card section layout to accommodate new card design:

1. **Spacing adjustments:**
   - Increase gap between dev cards from 'sm' to 'md' (line ~304)
   - Add minHeight to dev cards container for consistent spacing

2. **Alignment:**
   - Change align from 'flex-start' to 'center' for dev cards Stack
   - Ensure cards align properly with new dimensions

3. **Optional fan layout (if desired):**
   - Consider applying similar fan/overlap logic as resource cards
   - Use negative marginLeft for card overlap (-30px)
   - Calculate rotation based on card position (same algorithm as ResourceCard)
   - This is OPTIONAL - simple grid layout is also acceptable

**Important:** Keep existing logic for VP card separation (gold border, separate Box) and playableCards vs vpCards distinction intact.
</action>
<verify>
Visit game with dev cards, confirm:

- Dev cards layout looks balanced and not cramped
- Cards align properly in their section
- VP cards remain visually separated with gold border
- Both resource and dev card sections look cohesive together
  </verify>
  <done>Dev card section layout adjusted to properly display new card design</done>
  </task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Playing card-styled development cards with animations and proper layout</what-built>
  <how-to-verify>
1. Start game: `npx nx serve web` and `npx nx serve api`
2. Create/join game and purchase development cards
3. Check dev card appearance:
   - Cards look like playing cards (not buttons)
   - Each type has distinct color
   - Proper proportions (~80x110px)
   - Icons and text are centered and readable
4. Test interactions:
   - Hover over playable cards (should lift and scale)
   - Hover over disabled cards (should show tooltip)
   - Click playable card (should trigger play action)
5. Check VP cards:
   - Visually distinct from playable cards
   - Still shows tooltip explaining auto-scoring
6. Verify with resource cards:
   - Dev cards match aesthetic of resource cards
   - Both look like playing cards
   - Visual consistency across hand display
  </how-to-verify>
  <resume-signal>Type "approved" to continue, or describe any visual/interaction issues</resume-signal>
</task>

</tasks>

<verification>
- Dev cards render as playing card-shaped components
- Each card type has distinct visual styling with proper colors
- Hover animations work (lift, scale)
- Disabled state properly styled with tooltips
- Layout integrates smoothly with resource cards
- VP cards remain visually distinct
</verification>

<success_criteria>

- DevCardButton transformed from Button to playing card design
- Cards use motion.div with Paper for card aesthetic
- Hover animations implemented (scale, lift)
- Dev card section layout adjusted for new design
- Visual consistency with resource cards achieved
- All existing functionality preserved (play logic, tooltips, disabled states)
  </success_criteria>

<output>
After completion, create `.planning/quick/018-redesign-the-development-cards-to-look-m/018-SUMMARY.md`
</output>
