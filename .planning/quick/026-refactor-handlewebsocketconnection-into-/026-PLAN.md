---
phase: quick-026
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/api/src/handlers/websocket.ts
  - apps/api/src/handlers/lobby-handlers.ts
  - apps/api/src/handlers/placement-handlers.ts
  - apps/api/src/handlers/turn-handlers.ts
  - apps/api/src/handlers/building-handlers.ts
  - apps/api/src/handlers/trading-handlers.ts
  - apps/api/src/handlers/robber-handlers.ts
  - apps/api/src/handlers/dev-card-handlers.ts
  - apps/api/src/handlers/handler-utils.ts
autonomous: true

must_haves:
  truths:
    - All existing WebSocket message types continue to work identically
    - Handler logic is separated by domain (lobby, placement, turn, building, trading, robber, dev cards)
    - Helper functions are extracted to shared utilities
  artifacts:
    - path: 'apps/api/src/handlers/handler-utils.ts'
      provides: 'Shared utilities (sendMessage, sendError, serializeRoom, etc.)'
      exports:
        [
          'sendMessage',
          'sendError',
          'serializePlayer',
          'serializeRoom',
          'getAvailableColor',
          'ErrorMessage',
        ]
    - path: 'apps/api/src/handlers/lobby-handlers.ts'
      provides: 'Lobby message handlers (create_room, join_room, toggle_ready, change_color)'
      exports:
        [
          'handleCreateRoom',
          'handleJoinRoom',
          'handleToggleReady',
          'handleChangeColor',
        ]
    - path: 'apps/api/src/handlers/placement-handlers.ts'
      provides: 'Setup phase handlers (place_settlement, place_road during setup)'
      exports: ['handlePlaceSettlement', 'handlePlaceRoad']
    - path: 'apps/api/src/handlers/turn-handlers.ts'
      provides: 'Turn management (roll_dice, end_turn)'
      exports: ['handleRollDice', 'handleEndTurn']
    - path: 'apps/api/src/handlers/building-handlers.ts'
      provides: 'Main game building (build_road, build_settlement, build_city)'
      exports: ['handleBuildRoad', 'handleBuildSettlement', 'handleBuildCity']
    - path: 'apps/api/src/handlers/trading-handlers.ts'
      provides: 'Trading logic (propose_trade, respond_trade, select_trade_partner, cancel_trade, execute_bank_trade)'
      exports:
        [
          'handleProposeTrade',
          'handleRespondTrade',
          'handleSelectTradePartner',
          'handleCancelTrade',
          'handleExecuteBankTrade',
        ]
    - path: 'apps/api/src/handlers/robber-handlers.ts'
      provides: 'Robber flow (discard_submitted, move_robber, steal_target)'
      exports:
        ['handleDiscardSubmitted', 'handleMoveRobber', 'handleStealTarget']
    - path: 'apps/api/src/handlers/dev-card-handlers.ts'
      provides: 'Development cards (buy_dev_card, play_dev_card, year_of_plenty_select, monopoly_select, road_building_place)'
      exports:
        [
          'handleBuyDevCard',
          'handlePlayDevCard',
          'handleYearOfPlentySelect',
          'handleMonopolySelect',
          'handleRoadBuildingPlace',
        ]
    - path: 'apps/api/src/handlers/websocket.ts'
      provides: 'Main WebSocket connection handler with clean routing to domain handlers'
      min_lines: 100
  key_links:
    - from: 'apps/api/src/handlers/websocket.ts'
      to: 'apps/api/src/handlers/*-handlers.ts'
      via: 'imports and function calls'
      pattern: 'import.*from.*handlers'
    - from: 'apps/api/src/handlers/*-handlers.ts'
      to: 'apps/api/src/handlers/handler-utils.ts'
      via: 'shared utility imports'
      pattern: 'import.*from.*handler-utils'
---

<objective>
Refactor the 1510-line `handleWebSocketConnection` function into separate, maintainable handler files organized by domain (lobby, placement, turn, building, trading, robber, dev cards).

**Purpose:** Improve code maintainability and readability by separating concerns into focused modules.

**Output:**

- 8 new handler files (7 domain handlers + 1 utilities file)
- Refactored websocket.ts that routes messages to appropriate handlers
  </objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/api/src/handlers/websocket.ts
</context>

<tasks>

<task type="auto">
  <name>Extract shared utilities to handler-utils.ts</name>
  <files>apps/api/src/handlers/handler-utils.ts</files>
  <action>
Create `apps/api/src/handlers/handler-utils.ts` containing:

1. **sendMessage function** (lines 30-41) - Send JSON message to WebSocket
2. **sendError function** (lines 73-79) - Send error message to WebSocket
3. **serializePlayer function** (lines 43-50) - Convert ManagedPlayer to Player
4. **serializeRoom function** (lines 52-58) - Convert ManagedRoom to Room
5. **getAvailableColor function** (lines 60-64) - Find available player color
6. **ErrorMessage type** (lines 66-71) - Error message union type
7. **broadcastLongestRoadIfTransferred function** (lines 84-98) - Broadcast longest road updates
8. **broadcastLargestArmyIfTransferred function** (lines 103-117) - Broadcast largest army updates
9. **broadcastVictory function** (lines 123-141) - Broadcast victory message

Export all functions and types. Import necessary dependencies (WebSocket, types from @catan/shared, RoomManager, logMessage, etc.).

Add TSDoc comments for each function describing parameters and purpose.
</action>
<verify>
`npx prettier --check apps/api/src/handlers/handler-utils.ts` passes
File exports 9 functions/types successfully
</verify>
<done>handler-utils.ts exists with all shared utilities extracted and documented</done>
</task>

<task type="auto">
  <name>Create domain-specific handler files</name>
  <files>
apps/api/src/handlers/lobby-handlers.ts
apps/api/src/handlers/placement-handlers.ts
apps/api/src/handlers/turn-handlers.ts
apps/api/src/handlers/building-handlers.ts
apps/api/src/handlers/trading-handlers.ts
apps/api/src/handlers/robber-handlers.ts
apps/api/src/handlers/dev-card-handlers.ts
  </files>
  <action>
Create 7 handler files, each containing related message handlers:

**1. lobby-handlers.ts** - Extract lobby message handlers:

- `handleCreateRoom` (lines 178-213) - create_room case
- `handleJoinRoom` (lines 215-264) - join_room case
- `handleToggleReady` (lines 266-342) - toggle_ready case (includes game start logic)
- `handleChangeColor` (lines 344-384) - change_color case

**2. placement-handlers.ts** - Extract setup phase handlers:

- `handlePlaceSettlement` (lines 386-436) - place_settlement case
- `handlePlaceRoad` (lines 438-514) - place_road case (includes setup complete logic)

**3. turn-handlers.ts** - Extract turn management:

- `handleRollDice` (lines 516-592) - roll_dice case (includes robber trigger)
- `handleEndTurn` (lines 594-621) - end_turn case

**4. building-handlers.ts** - Extract building handlers:

- `handleBuildRoad` (lines 623-669) - build_road case
- `handleBuildSettlement` (lines 671-717) - build_settlement case
- `handleBuildCity` (lines 719-758) - build_city case

**5. trading-handlers.ts** - Extract trading handlers:

- `handleProposeTrade` (lines 764-792) - propose_trade case
- `handleRespondTrade` (lines 794-817) - respond_trade case
- `handleSelectTradePartner` (lines 819-844) - select_trade_partner case
- `handleCancelTrade` (lines 846-867) - cancel_trade case
- `handleExecuteBankTrade` (lines 869-897) - execute_bank_trade case

**6. robber-handlers.ts** - Extract robber flow handlers:

- `handleDiscardSubmitted` (lines 903-953) - discard_submitted case
- `handleMoveRobber` (lines 955-1016) - move_robber case
- `handleStealTarget` (lines 1018-1045) - steal_target case

**7. dev-card-handlers.ts** - Extract development card handlers:

- `handleBuyDevCard` (lines 1051-1111) - buy_dev_card case
- `handlePlayDevCard` (lines 1113-1331) - play_dev_card case (large switch with 5 card types)
- `handleYearOfPlentySelect` (lines 1333-1370) - year_of_plenty_select case
- `handleMonopolySelect` (lines 1372-1411) - monopoly_select case
- `handleRoadBuildingPlace` (lines 1413-1480) - road_building_place case

**Handler function signature pattern:**

```typescript
export function handleMessageName(
  ws: WebSocket,
  message: SpecificMessageType,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void;
```

Import utilities from `./handler-utils.ts` (sendMessage, sendError, serializeRoom, serializePlayer, broadcast functions).
Import types from @catan/shared and local modules as needed.
Preserve all logic exactly as in original switch cases.
</action>
<verify>
All 7 handler files exist and export their functions
`npx prettier --check apps/api/src/handlers/*.ts` passes
`npx nx typecheck api` passes
</verify>
<done>7 domain-specific handler files created with extracted message handlers</done>
</task>

<task type="auto">
  <name>Refactor websocket.ts to route to handlers</name>
  <files>apps/api/src/handlers/websocket.ts</files>
  <action>
Refactor `websocket.ts` to use the extracted handlers:

1. **Keep at top:**
   - All imports (lines 1-26)
   - GAME_START_COUNTDOWN constant (line 28)

2. **Add new imports:**

   ```typescript
   import * as LobbyHandlers from './lobby-handlers';
   import * as PlacementHandlers from './placement-handlers';
   import * as TurnHandlers from './turn-handlers';
   import * as BuildingHandlers from './building-handlers';
   import * as TradingHandlers from './trading-handlers';
   import * as RobberHandlers from './robber-handlers';
   import * as DevCardHandlers from './dev-card-handlers';
   import { sendError } from './handler-utils';
   ```

3. **Replace switch statement** (lines 177-1485) with clean routing:

   ```typescript
   const context = { currentRoomId, playerId };

   switch (message.type) {
     // Lobby
     case 'create_room':
       LobbyHandlers.handleCreateRoom(ws, message, roomManager, context);
       break;
     case 'join_room':
       LobbyHandlers.handleJoinRoom(ws, message, roomManager, context);
       break;
     case 'toggle_ready':
       LobbyHandlers.handleToggleReady(ws, message, roomManager, context);
       break;
     case 'change_color':
       LobbyHandlers.handleChangeColor(ws, message, roomManager, context);
       break;

     // Placement
     case 'place_settlement':
       PlacementHandlers.handlePlaceSettlement(
         ws,
         message,
         roomManager,
         context,
       );
       break;
     case 'place_road':
       PlacementHandlers.handlePlaceRoad(ws, message, roomManager, context);
       break;

     // Turn management
     case 'roll_dice':
       TurnHandlers.handleRollDice(ws, message, roomManager, context);
       break;
     case 'end_turn':
       TurnHandlers.handleEndTurn(ws, message, roomManager, context);
       break;

     // Building
     case 'build_road':
       BuildingHandlers.handleBuildRoad(ws, message, roomManager, context);
       break;
     case 'build_settlement':
       BuildingHandlers.handleBuildSettlement(
         ws,
         message,
         roomManager,
         context,
       );
       break;
     case 'build_city':
       BuildingHandlers.handleBuildCity(ws, message, roomManager, context);
       break;

     // Trading
     case 'propose_trade':
       TradingHandlers.handleProposeTrade(ws, message, roomManager, context);
       break;
     case 'respond_trade':
       TradingHandlers.handleRespondTrade(ws, message, roomManager, context);
       break;
     case 'select_trade_partner':
       TradingHandlers.handleSelectTradePartner(
         ws,
         message,
         roomManager,
         context,
       );
       break;
     case 'cancel_trade':
       TradingHandlers.handleCancelTrade(ws, message, roomManager, context);
       break;
     case 'execute_bank_trade':
       TradingHandlers.handleExecuteBankTrade(
         ws,
         message,
         roomManager,
         context,
       );
       break;

     // Robber
     case 'discard_submitted':
       RobberHandlers.handleDiscardSubmitted(ws, message, roomManager, context);
       break;
     case 'move_robber':
       RobberHandlers.handleMoveRobber(ws, message, roomManager, context);
       break;
     case 'steal_target':
       RobberHandlers.handleStealTarget(ws, message, roomManager, context);
       break;

     // Development cards
     case 'buy_dev_card':
       DevCardHandlers.handleBuyDevCard(ws, message, roomManager, context);
       break;
     case 'play_dev_card':
       DevCardHandlers.handlePlayDevCard(ws, message, roomManager, context);
       break;
     case 'year_of_plenty_select':
       DevCardHandlers.handleYearOfPlentySelect(
         ws,
         message,
         roomManager,
         context,
       );
       break;
     case 'monopoly_select':
       DevCardHandlers.handleMonopolySelect(ws, message, roomManager, context);
       break;
     case 'road_building_place':
       DevCardHandlers.handleRoadBuildingPlace(
         ws,
         message,
         roomManager,
         context,
       );
       break;

     default:
       sendError(ws, 'Invalid room ID', currentRoomId || undefined);
   }
   ```

4. **Keep unchanged:**
   - ws.on('close') handler (lines 1488-1504)
   - ws.on('error') handler (lines 1506-1508)

5. **Update context assignment:** Handler functions that modify `currentRoomId` or `playerId` (create_room, join_room) need to update context. Pass context as object to allow mutation, or return updated values.

6. **Remove now-unused helper functions** (moved to handler-utils.ts or handler files).
   </action>
   <verify>
   `npx prettier --write apps/api/src/handlers/websocket.ts`
   `npx nx typecheck api` passes
   `npx nx build api` succeeds
   File is under 300 lines (down from 1510)
   </verify>
   <done>websocket.ts refactored to cleanly route messages to domain handlers</done>
   </task>

</tasks>

<verification>
1. Run typecheck: `npx nx typecheck api`
2. Run build: `npx nx build api`
3. Run tests: `npx nx test api`
4. Verify file structure: `ls apps/api/src/handlers/` shows 8 new files
5. Check line count: `wc -l apps/api/src/handlers/websocket.ts` (should be ~200-300 lines)
</verification>

<success_criteria>

- [ ] websocket.ts reduced from 1510 lines to ~200-300 lines
- [ ] 8 new files created (7 domain handlers + 1 utilities)
- [ ] All existing WebSocket message types still handled
- [ ] No TypeScript errors
- [ ] API builds successfully
- [ ] All existing tests pass
- [ ] Clean separation of concerns by domain
      </success_criteria>

<output>
After completion, create `.planning/quick/026-refactor-handlewebsocketconnection-into-/026-SUMMARY.md`
</output>
