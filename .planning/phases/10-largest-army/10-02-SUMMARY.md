---
phase: 10-largest-army
plan: 02
status: complete
completed: 2026-02-02
---

# Plan 10-02 Summary: WebSocket Message Handling and Frontend State

## What Was Built

Added WebSocket message schema for largest army updates, server-side broadcast function, and frontend state management to enable real-time largest army transfer notifications.

## Deliverables

| Artifact                              | Description                                                |
| ------------------------------------- | ---------------------------------------------------------- |
| `libs/shared/src/schemas/messages.ts` | Added `LargestArmyUpdatedMessageSchema` with type export   |
| `apps/api/src/handlers/websocket.ts`  | Added `broadcastLargestArmyIfTransferred()` function       |
| `apps/web/src/stores/gameStore.ts`    | Added `LargestArmySlice`, `setLargestArmyState`, selectors |
| `apps/web/src/components/Lobby.tsx`   | Added `largest_army_updated` WebSocket message handler     |

## Key Implementation Details

### Message Schema

```typescript
LargestArmyUpdatedMessageSchema = z.object({
  type: z.literal('largest_army_updated'),
  holderId: z.string().nullable(),
  holderKnights: z.number(),
  playerKnightCounts: z.record(z.string(), z.number()),
  transferredFrom: z.string().nullable(),
});
```

### Server Broadcast

- `broadcastLargestArmyIfTransferred()` mirrors `broadcastLongestRoadIfTransferred()`
- Only broadcasts when `result.transferred === true`
- Called after knight card plays in websocket.ts

### Frontend State

- Added `largestArmyHolderId: string | null` and `largestArmyKnights: number`
- `setLargestArmyState()` action updates holder + merges `knightsPlayed` counts
- `useLargestArmyHolder()` selector hook exported

### Lobby Handler

- Shows toast on transfer: "[Player] takes Largest Army from [Player]!"
- Shows warning toast when award lost: "[Player] loses Largest Army!"

## Commits

| Task                             | Commit    | Files                   |
| -------------------------------- | --------- | ----------------------- |
| Task 1: Message schema           | `656fdb1` | messages.ts             |
| Task 2: Broadcast function       | `d4d0417` | websocket.ts            |
| Task 3: Frontend state + handler | `c80b2d4` | gameStore.ts, Lobby.tsx |

## Decisions

| Decision                                          | Rationale                                             |
| ------------------------------------------------- | ----------------------------------------------------- |
| Mirror longest road pattern                       | Consistent code organization                          |
| Merge knightCounts into existing state            | `knightsPlayed` already exists, avoid duplicate state |
| Field mapping: knightCounts -> playerKnightCounts | Match message schema naming convention                |

## Verification

- TypeScript compiles for both API and web packages
- Message schema added to WebSocketMessageSchema union
- Broadcast wired after knight card plays
- Frontend handler updates state and shows toast notifications
