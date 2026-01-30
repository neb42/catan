---
phase: quick
plan: 005
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/stores/gameStore.ts
  - apps/web/src/hooks/useWebSocket.ts
  - apps/web/src/components/Debug/DebugPanel.tsx
  - apps/web/src/components/Game.tsx
autonomous: true

must_haves:
  truths:
    - 'Developer can view current game state in a collapsible panel'
    - 'Developer can see a log of all WebSocket messages (sent and received)'
    - 'Panel can be toggled open/closed without disrupting gameplay'
  artifacts:
    - path: 'apps/web/src/components/Debug/DebugPanel.tsx'
      provides: 'Debug panel with state viewer and message log'
      min_lines: 80
    - path: 'apps/web/src/stores/gameStore.ts'
      provides: 'Debug message log state and actions'
      contains: 'debugMessages'
  key_links:
    - from: 'apps/web/src/hooks/useWebSocket.ts'
      to: 'gameStore.addDebugMessage'
      via: 'log messages on send/receive'
      pattern: 'addDebugMessage'
---

<objective>
Add a debug panel that displays current game state and WebSocket message log for development purposes.

Purpose: Aid debugging during development by providing visibility into game state and message traffic.
Output: Collapsible debug panel in Game view showing store state and message history.
</objective>

<execution_context>
@~/.config/opencode/get-shit-done/workflows/execute-plan.md
@~/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/stores/gameStore.ts
@apps/web/src/hooks/useWebSocket.ts
@apps/web/src/components/Game.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add debug message logging to gameStore and useWebSocket</name>
  <files>apps/web/src/stores/gameStore.ts, apps/web/src/hooks/useWebSocket.ts</files>
  <action>
1. In gameStore.ts, add a debug slice:
   - Add interface `DebugSlice` with `debugMessages: Array<{ direction: 'sent' | 'received'; type: string; data: unknown; timestamp: Date }>` and `debugPanelOpen: boolean`
   - Add to GameStore interface: `extends DebugSlice`
   - Initialize state: `debugMessages: []`, `debugPanelOpen: false`
   - Add actions: `addDebugMessage(direction, type, data)` - prepend to array, limit to 100 messages max
   - Add action: `setDebugPanelOpen(open: boolean)`
   - Add action: `clearDebugMessages()`
   - Export selector hooks: `useDebugMessages`, `useDebugPanelOpen`

2. In useWebSocket.ts:
   - Import `useGameStore`
   - In the onMessage handler (after successful parse), call `useGameStore.getState().addDebugMessage('received', result.data.type, result.data)`
   - In the sendMessage callback, call `useGameStore.getState().addDebugMessage('sent', message.type, message)` before sending
     </action>
     <verify>TypeScript compiles: `npx nx typecheck web`</verify>
     <done>Debug messages are logged to store on every WebSocket send/receive</done>
     </task>

<task type="auto">
  <name>Task 2: Create DebugPanel component</name>
  <files>apps/web/src/components/Debug/DebugPanel.tsx</files>
  <action>
Create a new component `apps/web/src/components/Debug/DebugPanel.tsx`:

1. Layout:
   - Fixed position at bottom-left of screen (above ResourceHand)
   - Collapsible via a toggle button showing "[Debug]" when closed, full panel when open
   - When open: 400px wide, 50vh max height, scrollable
   - Semi-transparent dark background with white text (monospace font)

2. Content when open:
   - Header with "Debug Panel" title and [X] close button
   - Two tabs/sections:
     a) **State** tab: JSON.stringify of key gameStore fields (turnPhase, turnCurrentPlayerId, turnNumber, placementPhase, currentPlayerId, buildMode, settlements count, roads count, playerResources, activeTrade)
     b) **Messages** tab: Scrollable list of debugMessages, most recent at top. Each entry shows:
     - Timestamp (HH:MM:SS.mmm)
     - Direction indicator: `<<` for received, `>>` for sent
     - Message type
     - Expandable JSON body (click to toggle)
   - "Clear" button to clear message log

3. Styling:
   - Use inline styles or Mantine components
   - z-index: 9999 to overlay everything
   - Compact, dev-focused UI (not polished game UI)

4. Only render in development mode: wrap entire component with `if (import.meta.env.MODE !== 'development') return null;`
   </action>
   <verify>Component renders: run `npx nx serve web`, navigate to game, see debug panel toggle in corner</verify>
   <done>DebugPanel component displays state and message log, can be toggled</done>
   </task>

<task type="auto">
  <name>Task 3: Integrate DebugPanel into Game component</name>
  <files>apps/web/src/components/Game.tsx</files>
  <action>
1. Import DebugPanel: `import { DebugPanel } from './Debug/DebugPanel';`

2. Add DebugPanel at the end of the Game component's JSX, after TradeResponseModal:
   ```tsx
   {
     /* Debug panel - development only */
   }
   <DebugPanel />;
   ```

The DebugPanel handles its own visibility and dev-mode check internally.
</action>
<verify>Run `npx nx serve web`, create a room, start game, verify debug panel appears and shows messages/state</verify>
<done>Debug panel visible in game, shows live state updates and message log</done>
</task>

</tasks>

<verification>
1. `npx nx typecheck web` passes
2. `npx nx build web` succeeds
3. Manual test: Create room with 3 players, start game, verify debug panel shows:
   - Current game state (turn phase, player, etc.)
   - WebSocket messages for room_created, game_started, placement_turn, etc.
</verification>

<success_criteria>

- Debug panel toggles open/closed without disrupting game
- State tab shows current gameStore values updated in real-time
- Messages tab shows full history of sent/received WebSocket messages
- Panel only renders in development mode
- No impact on production builds
  </success_criteria>

<output>
After completion, create `.planning/quick/005-add-debug-panel-with-current-game-state-/005-SUMMARY.md`
</output>
