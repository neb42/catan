---
phase: quick-009
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/handlers/index.ts
  - apps/web/src/handlers/types.ts
  - apps/web/src/handlers/lobbyHandlers.ts
  - apps/web/src/handlers/gameLifecycleHandlers.ts
  - apps/web/src/handlers/placementHandlers.ts
  - apps/web/src/handlers/turnHandlers.ts
  - apps/web/src/handlers/buildingHandlers.ts
  - apps/web/src/handlers/tradeHandlers.ts
  - apps/web/src/handlers/robberHandlers.ts
  - apps/web/src/handlers/devCardHandlers.ts
  - apps/web/src/handlers/awardHandlers.ts
  - apps/web/src/handlers/victoryHandlers.ts
  - apps/web/src/handlers/errorHandlers.ts
  - apps/web/src/components/Lobby.tsx
autonomous: true

must_haves:
  truths:
    - 'All 36 message types handled exactly as before'
    - 'Lobby.tsx handleMessage function is under 50 lines'
    - 'Handler files are organized by functionality'
    - 'Type safety is maintained throughout'
  artifacts:
    - path: 'apps/web/src/handlers/index.ts'
      provides: 'Handler registry and dispatcher'
      exports: ['handleWebSocketMessage', 'HandlerContext']
    - path: 'apps/web/src/handlers/types.ts'
      provides: 'Shared handler types'
      exports: ['MessageHandler', 'HandlerContext']
    - path: 'apps/web/src/handlers/lobbyHandlers.ts'
      provides: '6 lobby/room management handlers'
      min_lines: 100
    - path: 'apps/web/src/handlers/robberHandlers.ts'
      provides: '9 robber phase handlers'
      min_lines: 150
    - path: 'apps/web/src/handlers/devCardHandlers.ts'
      provides: '11 development card handlers'
      min_lines: 200
    - path: 'apps/web/src/components/Lobby.tsx'
      provides: 'Simplified Lobby with handler delegation'
      max_lines: 400
  key_links:
    - from: 'apps/web/src/components/Lobby.tsx'
      to: 'apps/web/src/handlers/index.ts'
      via: 'handleWebSocketMessage import and call'
      pattern: "handleWebSocketMessage\\(message, context\\)"
    - from: 'apps/web/src/handlers/index.ts'
      to: 'apps/web/src/handlers/*Handlers.ts'
      via: 'handler registry mapping'
      pattern: 'const handlerRegistry.*Record.*WebSocketMessage'
---

<objective>
Refactor the 890-line handleMessage function in Lobby.tsx into modular, testable handler files organized by functionality.

Purpose: Improve maintainability and testability by breaking down a massive switch statement into focused, single-responsibility handler functions.

Output:

- 12 new handler files (types.ts + index.ts + 10 functional handlers)
- Simplified Lobby.tsx that delegates to handler registry
- Zero functional changes to message handling behavior
  </objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/Lobby.tsx
@AGENTS.md

# Current code shows handleMessage spans lines 55-945 (890 lines) with 36 message type cases

# Each case contains state updates, store calls, and notification logic

# Goal: Extract each case into a dedicated handler function while preserving exact behavior

</context>

<tasks>

<task type="auto">
  <name>Create handler type definitions and registry infrastructure</name>
  <files>
apps/web/src/handlers/types.ts
apps/web/src/handlers/index.ts
  </files>
  <action>
Create `apps/web/src/handlers/types.ts` with:
- `HandlerContext` interface containing all state setters and current values needed by handlers (setRoom, setRoomId, setCurrentPlayerId, currentPlayerId, pendingNickname, lastAction, room, plus any other state accessed in handleMessage cases)
- `MessageHandler<T extends WebSocketMessage>` generic type: `(message: T, ctx: HandlerContext) => void`

Create `apps/web/src/handlers/index.ts` with:

- Import all handler files (to be created in next task)
- `handlerRegistry: Partial<Record<WebSocketMessage['type'], MessageHandler>>` mapping all 36 message types to their handlers
- `handleWebSocketMessage(message: WebSocketMessage, context: HandlerContext): void` function that looks up and calls the appropriate handler, with default case for unhandled messages
- Export `handleWebSocketMessage` and `HandlerContext` type

Follow AGENTS.md conventions:

- Use single quotes
- PascalCase for types/interfaces
- camelCase for functions
- Path aliases (@web/\*)
  </action>
  <verify>
  TypeScript compiles without errors:

```bash
cd apps/web && npx nx typecheck web
```

Verify types.ts exports HandlerContext and MessageHandler:

```bash
grep -E "export (interface HandlerContext|type MessageHandler)" apps/web/src/handlers/types.ts
```

Verify index.ts exports handleWebSocketMessage:

```bash
grep "export.*handleWebSocketMessage" apps/web/src/handlers/index.ts
```

  </verify>
  <done>
- types.ts exists with HandlerContext interface and MessageHandler generic type
- index.ts exists with handlerRegistry and handleWebSocketMessage function
- TypeScript compilation succeeds
  </done>
</task>

<task type="auto">
  <name>Extract all 36 message handlers into 10 functional handler files</name>
  <files>
apps/web/src/handlers/lobbyHandlers.ts
apps/web/src/handlers/gameLifecycleHandlers.ts
apps/web/src/handlers/placementHandlers.ts
apps/web/src/handlers/turnHandlers.ts
apps/web/src/handlers/buildingHandlers.ts
apps/web/src/handlers/tradeHandlers.ts
apps/web/src/handlers/robberHandlers.ts
apps/web/src/handlers/devCardHandlers.ts
apps/web/src/handlers/awardHandlers.ts
apps/web/src/handlers/victoryHandlers.ts
apps/web/src/handlers/errorHandlers.ts
  </files>
  <action>
For each handler file, extract the corresponding case logic from Lobby.tsx handleMessage (lines 55-945) into individual handler functions:

**lobbyHandlers.ts** (6 handlers):

- handleRoomCreated (line 58)
- handleRoomState (line 70)
- handlePlayerJoined (line 100)
- handlePlayerLeft (line 116)
- handlePlayerReady (line 131)
- handleColorChanged (line 155)

**gameLifecycleHandlers.ts** (3 handlers):

- handleGameStarting (line 173)
- handleGameStarted (line 185)
- handleSetupComplete (line 230)

**placementHandlers.ts** (3 handlers):

- handlePlacementTurn (line 192)
- handleSettlementPlaced (line 203)
- handleRoadPlaced (line 222)

**turnHandlers.ts** (2 handlers):

- handleDiceRolled (line 236)
- handleTurnChanged (line 265)

**buildingHandlers.ts** (4 handlers):

- handleRoadBuilt (line 284)
- handleSettlementBuilt (line 307)
- handleCityBuilt (line 330)
- handleBuildFailed (line 354)

**tradeHandlers.ts** (5 handlers):

- handleTradeProposed (line 360)
- handleTradeResponse (line 380)
- handleTradeExecuted (line 387)
- handleTradeCancelled (line 441)
- handleBankTradeExecuted (line 448)

**robberHandlers.ts** (9 handlers):

- handleDiscardRequired (line 484)
- handleDiscardCompleted (line 499)
- handleAllDiscardsComplete (line 528)
- handleRobberTriggered (line 535)
- handleRobberMoveRequired (line 546)
- handleRobberMoved (line 551)
- handleStealRequired (line 564)
- handleStolen (line 569)
- handleNoStealPossible (line 603)

**devCardHandlers.ts** (11 handlers):

- handleDevCardPurchased (line 613)
- handleDevCardPurchasedPublic (line 634)
- handleDevCardPlayed (line 657)
- handleDevCardPlayFailed (line 688)
- handleYearOfPlentyRequired (line 693)
- handleYearOfPlentyCompleted (line 699)
- handleMonopolyRequired (line 738)
- handleMonopolyExecuted (line 744)
- handleRoadBuildingRequired (line 787)
- handleRoadBuildingPlaced (line 795)
- handleRoadBuildingCompleted (line 808)

**awardHandlers.ts** (2 handlers):

- handleLongestRoadUpdated (line 830)
- handleLargestArmyUpdated (line 871)

**victoryHandlers.ts** (1 handler):

- handleVictory (line 916)

**errorHandlers.ts** (1 handler):

- handleError (line 928)

For each handler:

1. Import necessary types from @catan/shared and @mantine/notifications
2. Import HandlerContext and MessageHandler from './types'
3. Import useGameStore from '@web/stores/gameStore'
4. Import showGameNotification from '@web/components/Feedback'
5. Create handler function with exact logic from switch case
6. Access state via `ctx` parameter instead of closure variables
7. Export all handlers from each file

CRITICAL: Preserve EXACT behavior including:

- All state setter calls
- All store method calls (useGameStore.getState())
- All notification calls (showGameNotification)
- All conditional logic
- All room player lookups via ctx.room
- Error handling patterns
  </action>
  <verify>
  All handler files exist:

```bash
ls apps/web/src/handlers/*.ts | wc -l  # Should be 12 (types + index + 10 handlers)
```

All handlers are exported:

```bash
for file in apps/web/src/handlers/{lobby,gameLifecycle,placement,turn,building,trade,robber,devCard,award,victory,error}Handlers.ts; do
  echo "Checking $file:"
  grep -c "^export const handle" "$file"
done
```

TypeScript compiles:

```bash
cd apps/web && npx nx typecheck web
```

  </verify>
  <done>
- 10 functional handler files exist with all 36 handlers extracted
- Each handler maintains exact logic from original switch case
- All handlers properly typed with MessageHandler<T>
- TypeScript compilation succeeds
  </done>
</task>

<task type="auto">
  <name>Refactor Lobby.tsx to use handler registry</name>
  <files>
apps/web/src/components/Lobby.tsx
  </files>
  <action>
Simplify Lobby.tsx handleMessage function (lines 55-945):

1. Add import at top of file:

```typescript
import { handleWebSocketMessage, HandlerContext } from '@web/handlers';
```

2. Replace the entire handleMessage useCallback (lines 55-947) with:

```typescript
const handleMessage = useCallback(
  (message: WebSocketMessage) => {
    const context: HandlerContext = {
      setRoom,
      setRoomId,
      setCurrentPlayerId,
      setPendingNickname,
      setCurrentView,
      setCreateError,
      setJoinError,
      setGeneralError,
      setCountdown,
      setLastAction,
      currentPlayerId,
      pendingNickname,
      lastAction,
      room,
    };
    handleWebSocketMessage(message, context);
  },
  [
    setRoom,
    setRoomId,
    setCurrentPlayerId,
    setPendingNickname,
    setCurrentView,
    setCreateError,
    setJoinError,
    setGeneralError,
    setCountdown,
    setLastAction,
    currentPlayerId,
    pendingNickname,
    lastAction,
    room,
  ],
);
```

3. Verify all state setters passed to HandlerContext match what handlers actually need

4. Remove any unused imports that were only needed by extracted handler logic (keep imports needed by Lobby UI)

CRITICAL: Do NOT change any other part of Lobby.tsx - only replace handleMessage function and adjust imports. All other functionality (UI rendering, WebSocket setup, button handlers) remains identical.
</action>
<verify>
Lobby.tsx compiles without errors:

```bash
cd apps/web && npx nx typecheck web
```

Verify handleMessage is now under 50 lines:

```bash
sed -n '/const handleMessage/,/^  }/p' apps/web/src/components/Lobby.tsx | wc -l
```

Verify import exists:

```bash
grep "import.*handleWebSocketMessage.*from '@web/handlers'" apps/web/src/components/Lobby.tsx
```

Run full build to ensure no breaking changes:

```bash
npx nx build web
```

  </verify>
  <done>
- Lobby.tsx handleMessage function reduced from 890 lines to ~30 lines
- Handler delegation working via handleWebSocketMessage
- All imports correctly updated
- TypeScript compilation and build succeed
- Zero functional changes to message handling behavior
  </done>
</task>

</tasks>

<verification>
**Functional verification:**
1. Start dev server: `npx nx serve web` and `npx nx serve api`
2. Create a room and verify all lobby interactions work (join, ready, color change)
3. Start game and verify placement phase works (settlement/road placement)
4. Verify dice rolling and turn progression works
5. Verify building works (road, settlement, city)
6. Verify trading works (player trade and bank trade)
7. Test robber flow (roll 7, discard, move robber, steal)
8. Test dev cards (purchase, play various types)
9. Verify longest road and largest army updates
10. Verify victory detection works

**Code quality verification:**

```bash
# Verify all handlers exported
grep -r "^export const handle" apps/web/src/handlers/ | wc -l  # Should be 36

# Verify Lobby.tsx is much smaller
wc -l apps/web/src/components/Lobby.tsx  # Should be ~400 lines (down from 1258)

# Run linter
npx eslint apps/web/src/handlers apps/web/src/components/Lobby.tsx

# Run formatter check
npx prettier --check apps/web/src/handlers apps/web/src/components/Lobby.tsx
```

</verification>

<success_criteria>

- [x] All 36 message handlers extracted into appropriate handler files
- [x] Handler registry correctly maps all message types to handlers
- [x] Lobby.tsx handleMessage function under 50 lines
- [x] Zero functional regressions in message handling
- [x] TypeScript compilation succeeds with no errors
- [x] Full build succeeds (npx nx build web)
- [x] Code follows AGENTS.md conventions (imports, naming, formatting)
- [x] All game flows work identically to before refactoring
      </success_criteria>

<output>
After completion, create `.planning/quick/009-refactor-lobby-tsx-handlemessage-into-se/009-SUMMARY.md` documenting:
- Files created (12 handler files)
- Lines of code reduced in Lobby.tsx (890 lines → ~30 lines in handleMessage)
- Handler organization structure (36 handlers across 10 functional files)
- Any patterns or conventions established for future handler additions
</output>
