# Quick Task 009 Summary: Refactor Lobby.tsx handleMessage

**One-liner:** Extracted 893-line handleMessage switch statement into 47 modular handlers across 11 files, reducing Lobby.tsx by 70% (1258→380 lines)

**Status:** ✅ Complete  
**Date:** 2026-02-04  
**Duration:** 9 minutes  
**Commits:** 2

---

## What Was Built

Refactored the massive handleMessage function in Lobby.tsx into a clean, modular handler system organized by functionality.

### Files Created

**Handler Infrastructure (2 files)**

- `apps/web/src/handlers/types.ts` - HandlerContext interface and MessageHandler type
- `apps/web/src/handlers/index.ts` - Handler registry mapping all 47 message types

**Handler Modules (11 files, 47 handlers total)**

- `lobbyHandlers.ts` - 6 handlers (room_created, room_state, player_joined, player_left, player_ready, color_changed)
- `gameLifecycleHandlers.ts` - 3 handlers (game_starting, game_started, setup_complete)
- `placementHandlers.ts` - 3 handlers (placement_turn, settlement_placed, road_placed)
- `turnHandlers.ts` - 2 handlers (dice_rolled, turn_changed)
- `buildingHandlers.ts` - 4 handlers (road_built, settlement_built, city_built, build_failed)
- `tradeHandlers.ts` - 5 handlers (trade_proposed, trade_response, trade_executed, trade_cancelled, bank_trade_executed)
- `robberHandlers.ts` - 9 handlers (discard_required, discard_completed, all_discards_complete, robber_triggered, robber_move_required, robber_moved, steal_required, stolen, no_steal_possible)
- `devCardHandlers.ts` - 11 handlers (dev_card_purchased, dev_card_purchased_public, dev_card_played, dev_card_play_failed, year_of_plenty_required, year_of_plenty_completed, monopoly_required, monopoly_executed, road_building_required, road_building_placed, road_building_completed)
- `awardHandlers.ts` - 2 handlers (longest_road_updated, largest_army_updated)
- `victoryHandlers.ts` - 1 handler (victory)
- `errorHandlers.ts` - 1 handler (error)

### Files Modified

- `apps/web/src/components/Lobby.tsx` - Simplified from 1258 lines to 380 lines

## Code Metrics

**Before:**

- Lobby.tsx: 1258 lines
- handleMessage function: 893 lines (switch with 47 cases)
- All message handling logic embedded in single file

**After:**

- Lobby.tsx: 380 lines (70% reduction, 878 lines removed)
- handleMessage function: 37 lines (95% reduction)
- 13 handler files: 1103 lines total (types + registry + handlers)
- Net change: +225 lines across codebase (but massive improvement in organization)

## Technical Details

### Handler Architecture

**HandlerContext Interface:**

```typescript
interface HandlerContext {
  // State setters (10 setters)
  setRoom;
  setRoomId;
  setCurrentPlayerId;
  setPendingNickname;
  setCurrentView;
  setCreateError;
  setJoinError;
  setGeneralError;
  setCountdown;
  setLastAction;

  // Current state values (4 values)
  currentPlayerId;
  pendingNickname;
  lastAction;
  room;
}
```

**MessageHandler Type:**

```typescript
type MessageHandler<T extends WebSocketMessage = WebSocketMessage> = (
  message: T,
  ctx: HandlerContext,
) => void;
```

**Registry Pattern:**

```typescript
const handlerRegistry: Partial<
  Record<WebSocketMessage['type'], MessageHandler>
> = {
  room_created: handleRoomCreated,
  room_state: handleRoomState,
  // ... 45 more mappings
};

export function handleWebSocketMessage(
  message: WebSocketMessage,
  context: HandlerContext,
): void {
  const handler = handlerRegistry[message.type];
  if (handler) handler(message, context);
}
```

**Lobby.tsx Integration:**

```typescript
const handleMessage = useCallback(
  (message: WebSocketMessage) => {
    const context: HandlerContext = {
      setRoom,
      setRoomId,
      setCurrentPlayerId /* ... */,
      currentPlayerId,
      pendingNickname,
      lastAction,
      room,
    };
    handleWebSocketMessage(message, context);
  },
  [
    /* 14 dependencies */
  ],
);
```

### Functional Organization

Handlers grouped by game phase/concern:

1. **Lobby** - Room setup and player management
2. **Game Lifecycle** - Game start/end transitions
3. **Placement** - Initial settlement/road placement
4. **Turn** - Dice rolling and turn changes
5. **Building** - Road/settlement/city construction
6. **Trade** - Player-to-player and bank trades
7. **Robber** - Discard, move, and steal mechanics
8. **Dev Cards** - Card purchase, play, and effect resolution
9. **Awards** - Longest Road and Largest Army tracking
10. **Victory** - Game end and winner reveal
11. **Error** - Error message handling

### Preservation of Behavior

**CRITICAL:** Zero functional changes - all logic extracted verbatim:

- All state setter calls preserved
- All useGameStore interactions preserved
- All showGameNotification calls preserved
- All conditional logic preserved
- All room player lookups preserved
- Exact same dependencies in useCallback

## Decisions Made

| Decision                          | Rationale                                                        |
| --------------------------------- | ---------------------------------------------------------------- |
| 11 handler files (not 1 per type) | Logical grouping improves discoverability over 47 separate files |
| HandlerContext interface          | Type-safe dependency injection for all handler needs             |
| Generic MessageHandler<T> type    | Enables type-safe message handling per handler                   |
| Extract logic verbatim            | Zero risk of introducing regressions during refactor             |
| Import path `@web/handlers`       | Consistent with existing path alias pattern                      |
| Registry uses Partial<Record>     | Type-safe but allows incremental handler addition                |

## Benefits

### Maintainability

- Each handler is ~10-50 lines (vs 893-line switch)
- Single responsibility per handler function
- Easy to locate handler for specific message type
- Changes isolated to relevant handler file

### Testability

- Each handler can be unit tested independently
- Mock HandlerContext for testing
- No need to test entire Lobby component for message handling
- Clear inputs/outputs for each handler

### Extensibility

- Add new handler: create function + add to registry
- Modify behavior: edit single handler file
- No risk of breaking unrelated message handling

### Code Organization

- Clear functional grouping (lobby, game, trade, etc.)
- Flat handler structure (no deep nesting)
- Consistent patterns across all handlers
- Easy onboarding for new developers

## Patterns Established

### Adding New Message Handlers

**1. Create handler function in appropriate file:**

```typescript
export const handleNewMessage: MessageHandler = (message, ctx) => {
  if (message.type !== 'new_message') return;
  // ... handler logic
};
```

**2. Add to registry in index.ts:**

```typescript
const handlerRegistry = {
  // ...
  new_message: handleNewMessage,
};
```

**3. TypeScript ensures type safety:**

- Registry key must match WebSocketMessage['type']
- Handler receives correctly typed message
- Context provides all needed state/setters

### Handler Conventions

1. **Type guard first:** `if (message.type !== 'expected') return;`
2. **Access state via ctx:** Use `ctx.room`, `ctx.currentPlayerId`, etc.
3. **Import dependencies:** useGameStore, showGameNotification as needed
4. **Maintain exact logic:** Preserve all behavior from original switch case
5. **Group by concern:** Place handler in appropriate functional file

## Verification

### Static Analysis

- ✅ TypeScript compilation succeeds
- ✅ All 47 handlers exported
- ✅ Lobby.tsx handleMessage under 50 lines (37 lines)
- ✅ Full build succeeds (npx nx build web)

### Code Quality

- ✅ Follows AGENTS.md conventions (single quotes, camelCase, imports)
- ✅ Path aliases used correctly (@web/handlers)
- ✅ Consistent handler patterns across all files
- ✅ Clean separation of concerns

### Functional Testing Required

- Manual testing of all game flows recommended
- Verify lobby interactions (join, ready, color)
- Verify gameplay (placement, dice, building, trading)
- Verify robber flow (discard, move, steal)
- Verify dev cards (purchase, play, effects)
- Verify special awards (longest road, largest army)
- Verify victory detection

## Next Phase Readiness

### For Future Development

- ✅ Handler pattern established for new message types
- ✅ Clear structure for adding game features
- ✅ Testing infrastructure can target individual handlers
- ✅ No blockers for continuing game development

### Technical Debt Addressed

- ✅ Eliminated 893-line function anti-pattern
- ✅ Improved code organization and discoverability
- ✅ Established patterns for future WebSocket handlers

## Commits

| Hash    | Message                                                                | Files    | Lines    |
| ------- | ---------------------------------------------------------------------- | -------- | -------- |
| 8d6a446 | feat(quick-009): create handler infrastructure and extract 47 handlers | 13 files | +1103    |
| 3e1c11e | refactor(quick-009): simplify Lobby.tsx to use handler registry        | 1 file   | +36 -913 |

---

**Total Impact:** -878 lines in Lobby.tsx, +1103 lines in handlers, net +225 lines but massively improved maintainability and testability
