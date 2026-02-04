---
phase: quick-015
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/ResourceHand/ResourceHand.tsx
  - apps/web/src/components/Game.tsx
autonomous: true

must_haves:
  truths:
    - 'Resource cards and dev cards appear in the same Paper container'
    - 'Resources appear on the left, dev cards on the right'
    - 'A visual divider separates resources from dev cards'
  artifacts:
    - path: 'apps/web/src/components/ResourceHand/ResourceHand.tsx'
      provides: 'Combined hand component with resources and dev cards'
      exports: ['ResourceHand']
  key_links:
    - from: 'apps/web/src/components/Game.tsx'
      to: 'ResourceHand'
      via: 'single component import'
      pattern: 'import.*ResourceHand'
---

<objective>
Merge the DevCardHand component into the ResourceHand component, placing both resource cards and development cards in the same Paper container with a divider between them.

Purpose: Improve visual cohesion by grouping all hand cards together in a single container
Output: Single combined hand component with resources on left, dev cards on right, divided by a vertical separator
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/ResourceHand/ResourceHand.tsx
@apps/web/src/components/DevCard/DevCardHand.tsx
@apps/web/src/components/Game.tsx
</context>

<tasks>

<task type="auto">
  <name>Merge DevCardHand into ResourceHand component</name>
  <files>
    apps/web/src/components/ResourceHand/ResourceHand.tsx
    apps/web/src/components/Game.tsx
  </files>
  <action>
1. Update ResourceHand.tsx:
   - Import DevCardButton from '../DevCard/DevCardButton'
   - Import useGameStore to access myDevCards
   - Modify the Paper container's inner layout to use a horizontal flex/Group layout
   - Left side: Keep existing resource cards section with header and fanned cards
   - Add a Divider component (vertical) styled to match the paper aesthetic
   - Right side: Add dev cards section with "Development Cards" header and card buttons
   - For dev cards, separate VP cards with a subtle divider (like the existing gold border pattern)
   - Return null for dev cards section if myDevCards.length === 0 (don't show empty right side)
   - Keep empty state for when BOTH resources and dev cards are empty

2. Update Game.tsx:
   - Remove import of DevCardHand
   - Remove the <DevCardHand /> component from the JSX (line 154)
   - Keep only <ResourceHand /> which now contains both

Visual structure inside Paper:

```
┌─────────────────────────────────────────────────┐
│  YOUR HAND (combined header)                     │
├──────────────────────┬──────────────────────────┤
│  Resources (N)       │  Development Cards       │
│  [resource counts]   │  [playable cards]        │
│  [fanned cards]      │  [VP cards with divider] │
└──────────────────────┴──────────────────────────┘
```

Use Mantine's Divider with orientation="vertical" and style it with borderColor: '#d7ccc8' to match the paper aesthetic.
</action>
<verify>
Run `npx nx serve web` and verify:

1. Resources and dev cards appear in same Paper container
2. Vertical divider separates them
3. Resources on left, dev cards on right
4. Empty state works when no resources or dev cards
5. No console errors
6. Cards are interactive and functional as before
   </verify>
   <done>
   Single Paper container displays resources on left and dev cards on right with visual divider between them. DevCardHand component no longer imported in Game.tsx.
   </done>
   </task>

</tasks>

<verification>
- Visual inspection: Both card types in single container
- Layout: Resources left, dev cards right, divider between
- Functionality: All card interactions work as before
- Empty states: Handled gracefully
</verification>

<success_criteria>

- Resource cards and development cards appear together in the same Paper container
- Clear visual separation via vertical divider
- Existing card animations and interactions preserved
- Clean removal of separate DevCardHand component from Game.tsx
  </success_criteria>

<output>
After completion, create `.planning/quick/015-move-the-development-cards-into-the-same/015-SUMMARY.md`
</output>
