---
quick_task: 013
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/ResourceIcon/ResourceIcon.tsx
  - apps/web/src/components/ResourceHand/ResourceHand.tsx
  - apps/web/src/components/Trade/ResourceSelector.tsx
  - apps/web/src/components/Trade/TradeResponseModal.tsx
  - apps/web/src/components/Trade/MaritimeTrade.tsx
  - apps/web/src/components/Trade/DomesticTrade.tsx
  - apps/web/src/components/BuildControls/BuildControls.tsx
  - apps/web/src/components/CardPlay/ResourcePickerModal.tsx
  - apps/web/src/components/CardPlay/MonopolyModal.tsx
  - apps/web/src/components/Robber/DiscardModal.tsx
  - apps/web/src/components/DevCard/DevCardButton.tsx
autonomous: true

must_haves:
  truths:
    - Resource icons render consistently across all UI components
    - Icons use existing SVG tile assets instead of emojis
    - Icon sizing adapts to context (small, medium, large)
  artifacts:
    - path: apps/web/src/components/ResourceIcon/ResourceIcon.tsx
      provides: Reusable ResourceIcon component
      exports: ['ResourceIcon']
  key_links:
    - from: apps/web/src/components/ResourceIcon/ResourceIcon.tsx
      to: /assets/tiles/*.svg
      via: img src attribute
      pattern: "src=.*\\/assets\\/tiles\\/"
---

<objective>
Replace emoji-based resource icons with SVG tile-based icons across all UI components.

Purpose: Improve visual consistency and quality by using the existing professional SVG tile assets instead of emojis for resource representation in UI elements (cards, selectors, modals, buttons).

Output: A reusable ResourceIcon component and updated components throughout the UI that display SVG-based resource icons.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/ResourceHand/ResourceHand.tsx
@apps/web/src/components/Trade/ResourceSelector.tsx
@apps/web/public/assets/tiles/forest.svg
@apps/web/public/assets/tiles/fields.svg
@apps/web/public/assets/tiles/hills.svg
@apps/web/public/assets/tiles/mountains.svg
@apps/web/public/assets/tiles/pasture.svg
@apps/web/public/assets/tiles/desert.svg
</context>

<tasks>

<task type="auto">
  <name>Create reusable ResourceIcon component</name>
  <files>apps/web/src/components/ResourceIcon/ResourceIcon.tsx</files>
  <action>
Create a new ResourceIcon component that:
- Accepts ResourceType ('wood' | 'brick' | 'sheep' | 'wheat' | 'ore') and optional size prop ('xs' | 'sm' | 'md' | 'lg')
- Maps resource types to SVG file paths:
  - wood → /assets/tiles/forest.svg
  - brick → /assets/tiles/hills.svg
  - sheep → /assets/tiles/pasture.svg
  - wheat → /assets/tiles/fields.svg
  - ore → /assets/tiles/mountains.svg
- Renders an img element with the appropriate SVG source
- Size mapping: xs=16px, sm=20px, md=28px, lg=40px (default: md)
- Include inline styles for consistent rendering (display: inline-block, vertical-align: middle)
- Add alt text for accessibility based on resource type

Implementation notes:

- Import ResourceType from @catan/shared
- Use Record<ResourceType, string> for the SVG path mapping
- Size should control both width and height equally (square icons)
- Keep component simple and focused (no Mantine dependencies needed)
  </action>
  <verify>
  Component compiles without errors:

```bash
npx nx typecheck web
```

  </verify>
  <done>ResourceIcon component exists, accepts ResourceType and size props, renders img elements with SVG sources from /assets/tiles/</done>
</task>

<task type="auto">
  <name>Replace emojis in ResourceHand component</name>
  <files>apps/web/src/components/ResourceHand/ResourceHand.tsx</files>
  <action>
Update ResourceHand.tsx to use ResourceIcon instead of emoji strings:

1. Import ResourceIcon from '../ResourceIcon/ResourceIcon'
2. Remove RESOURCE_CARDS config object (lines 6-15) - no longer needed
3. Update ResourceCard function (lines 28-126):
   - Change icon rendering (lines 101-109) to use `<ResourceIcon type={type as ResourceType} size="lg" />`
   - Keep the label rendering as-is (lines 111-122)
4. Update resource count display (lines 206-223):
   - Replace `RESOURCE_CARDS[type].icon` with `<ResourceIcon type={type as ResourceType} size="xs" />`
   - Keep existing Group/Text wrapper structure

Implementation notes:

- Cast type to ResourceType for type safety
- Keep all existing animation, styling, and layout logic
- Maintain card background colors (can be inline or separate config if needed)
- Label mapping can be inline: { wood: 'Wood', brick: 'Brick', sheep: 'Sheep', wheat: 'Wheat', ore: 'Ore' }
  </action>
  <verify>
  Component compiles and renders correctly:

```bash
npx nx typecheck web
npx nx build web
```

  </verify>
  <done>ResourceHand renders resource icons using ResourceIcon component instead of emojis, maintaining all existing functionality</done>
</task>

<task type="auto">
  <name>Replace emojis in all other UI components</name>
  <files>
apps/web/src/components/Trade/ResourceSelector.tsx
apps/web/src/components/Trade/TradeResponseModal.tsx
apps/web/src/components/Trade/MaritimeTrade.tsx
apps/web/src/components/Trade/DomesticTrade.tsx
apps/web/src/components/BuildControls/BuildControls.tsx
apps/web/src/components/CardPlay/ResourcePickerModal.tsx
apps/web/src/components/CardPlay/MonopolyModal.tsx
apps/web/src/components/Robber/DiscardModal.tsx
apps/web/src/components/DevCard/DevCardButton.tsx
  </files>
  <action>
For each component that uses resource emojis:

**ResourceSelector.tsx:**

- Remove RESOURCE_ICONS object (lines 4-10)
- Import ResourceIcon
- Replace `<Text size="lg">{RESOURCE_ICONS[resource]}</Text>` (line 41) with `<ResourceIcon type={resource} size="md" />`

**TradeResponseModal.tsx:**

- Find emoji usage in resource display
- Import ResourceIcon and replace emoji Text elements with ResourceIcon components
- Use size="sm" for compact display

**MaritimeTrade.tsx:**

- Find emoji usage in trade offer display
- Import ResourceIcon and replace emoji Text elements with ResourceIcon components
- Use size="md" for clear visibility

**DomesticTrade.tsx:**

- Find emoji usage in trade cards/displays
- Import ResourceIcon and replace emoji Text elements with ResourceIcon components
- Use size="md" for main display, size="sm" for compact areas

**BuildControls.tsx:**

- Find emoji usage in resource cost display
- Import ResourceIcon and replace emoji Text elements with ResourceIcon components
- Use size="sm" for cost indicators

**ResourcePickerModal.tsx, MonopolyModal.tsx, DiscardModal.tsx:**

- Find emoji usage in resource selection UI
- Import ResourceIcon and replace emoji Text elements with ResourceIcon components
- Use size="md" for selectable items

**DevCardButton.tsx:**

- Find emoji usage if any (check for resource-related displays)
- Import ResourceIcon if needed and replace with ResourceIcon components
- Use size="sm" for compact display

Pattern for all replacements:

1. Import: `import { ResourceIcon } from '../ResourceIcon/ResourceIcon';` (adjust path as needed)
2. Remove local emoji constants/objects
3. Replace `<Text>{emoji}</Text>` with `<ResourceIcon type={resourceType} size="sm|md|lg" />`
4. Maintain existing layout/spacing/Group wrappers
   </action>
   <verify>
   All components compile without errors:

```bash
npx nx typecheck web
npx nx build web
```

Run dev server and visually inspect each component type:

```bash
npx nx serve web
```

- ResourceSelector (in trade modals)
- Trade displays (domestic and maritime)
- Build controls cost display
- Discard modal
- Card effect modals
  </verify>
  <done>All UI components use ResourceIcon instead of emojis, rendering is consistent and visually cohesive, no emoji characters remain in resource displays</done>
  </task>

</tasks>

<verification>
Final checks:
1. No remaining emoji usage: `grep -r "🌾\|🧱\|🐑\|⛰️\|🌲\|🪵" apps/web/src --include="*.tsx"`
2. All components compile: `npx nx build web`
3. Manual visual testing:
   - Open a game and check resource hand display
   - Open trade modal and verify icons in selectors
   - Check build controls show icons for costs
   - Trigger discard modal (roll 7 with >7 cards)
   - Play Year of Plenty card to check ResourcePickerModal
</verification>

<success_criteria>

- ResourceIcon component exists and is reusable across the codebase
- All resource displays use SVG tile icons instead of emojis
- Icons render at appropriate sizes for their context
- No emoji characters remain in resource-related UI (except non-resource emojis like 🃏 for empty state)
- All TypeScript types are correct (no type errors)
- Visual consistency improved across all components
  </success_criteria>

<output>
After completion, create `.planning/quick/013-replace-emojis-with-tile-icons/013-SUMMARY.md`
</output>
