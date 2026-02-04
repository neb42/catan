---
phase: quick-012
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/ResourceHand/ResourceHand.tsx
autonomous: true

must_haves:
  truths:
    - ResourceHand uses parchment background (#fdf6e3) instead of glassmorphism
    - ResourceHand has brown border (4px solid #8d6e63) matching GamePlayerList
    - Card fan animation and hover behavior still works
    - Header and resource counts have dashed border separator matching GamePlayerList
    - Empty state uses same parchment aesthetic
  artifacts:
    - path: apps/web/src/components/ResourceHand/ResourceHand.tsx
      provides: Styled ResourceHand with Catan parchment aesthetic
      min_lines: 240
  key_links:
    - from: ResourceHand.tsx
      to: GamePlayerList.tsx
      via: shared visual style
      pattern: "background: '#fdf6e3'|border: '4px solid #8d6e63'"
---

<objective>
Replace the ResourceHand component's Mantine Paper glassmorphism style with the parchment/Catan aesthetic from GamePlayerList.

Purpose: Create visual consistency between player cards and resource hand using the established parchment design language.
Output: ResourceHand component with parchment background, brown borders, and dashed separators while preserving card fan animations.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/GamePlayerList.tsx
@apps/web/src/components/ResourceHand/ResourceHand.tsx
</context>

<tasks>

<task type="auto">
  <name>Replace ResourceHand glassmorphism with parchment aesthetic</name>
  <files>apps/web/src/components/ResourceHand/ResourceHand.tsx</files>
  <action>
Update the ResourceHand component to match GamePlayerList styling:

**Main container (line 175-184):**

- Replace `backgroundColor: 'rgba(255, 255, 255, 0.9)'` with `background: '#fdf6e3'`
- Replace `backdropFilter: 'blur(8px)'` with `border: '4px solid #8d6e63'`
- Change `radius="lg"` to `radius="md"` (12px to match GamePlayerList)
- Replace `shadow="md"` with inline `boxShadow: '0 10px 20px rgba(0,0,0,0.3)'`

**Header separator (after line 194):**

- Add container div around header with styles:
  - `borderBottom: '2px dashed #d7ccc8'`
  - `paddingBottom: '8px'`
  - `marginBottom: '8px'`

**Resource counts section (line 197-213):**

- Already has good styling, keep as-is

**Empty state (line 149-171):**

- Replace `backgroundColor: 'rgba(255, 255, 255, 0.9)'` with `background: '#fdf6e3'`
- Replace `backdropFilter: 'blur(8px)'` with `border: '4px solid #8d6e63'`
- Change `radius="lg"` to `radius="md"`
- Replace `shadow="sm"` with inline `boxShadow: '0 10px 20px rgba(0,0,0,0.3)'`

**Individual resource cards (line 74-123):**

- Keep as-is - colorful cards are intentional contrast to parchment container

Do NOT modify:

- Card fan animation logic (rotation, yOffset, overlap)
- Card hover effects (whileHover scale and lift)
- Card colors and content
- Motion/AnimatePresence behavior
  </action>
  <verify>
  Run dev server and visually inspect:

```bash
npx nx serve web
```

Check:

1. ResourceHand has parchment background (#fdf6e3) not glassmorphism
2. Brown border (4px solid #8d6e63) visible on container
3. Dashed separator line between header and cards
4. Card fan animation still works (cards overlap, rotate, lift on hover)
5. Empty state has matching parchment style
6. Overall visual consistency with GamePlayerList cards
   </verify>
   <done>

- ResourceHand main container uses `background: '#fdf6e3'` and `border: '4px solid #8d6e63'`
- Header section has `borderBottom: '2px dashed #d7ccc8'` separator
- Box shadow matches GamePlayerList: `0 10px 20px rgba(0,0,0,0.3)`
- Empty state uses same parchment aesthetic
- Card fan behavior preserved (rotation, overlap, hover effects)
- Component renders without TypeScript or runtime errors
  </done>
  </task>

</tasks>

<verification>
Visual inspection confirms:
- ResourceHand visually matches GamePlayerList's parchment aesthetic
- Card animations (fan layout, hover lift) still function
- No glassmorphism or backdrop blur visible
- Brown border and dashed separator present
- Empty state styled consistently
</verification>

<success_criteria>

- ResourceHand component uses parchment background (#fdf6e3) instead of glassmorphism
- Brown border (4px solid #8d6e63) matches GamePlayerList
- Dashed separator (2px dashed #d7ccc8) between header and cards
- Card fan animation behavior unchanged
- Empty state uses same aesthetic
- Visual consistency with GamePlayerList established
  </success_criteria>

<output>
After completion, create `.planning/quick/012-apply-gameplayerlist-style-to-resourceha/012-SUMMARY.md`
</output>
