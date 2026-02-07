# Phase 14: Victory Stats and Rematch - Research

**Researched:** 2026-02-07
**Domain:** Game Statistics & Room Lifecycle
**Confidence:** HIGH

## Summary

This phase implements comprehensive game statistics (dice, resources, dev cards) displayed in the victory modal, and a "Rematch" workflow that resets the game state while keeping the party together.

**Primary recommendation:** Implement a server-side `GameStats` class to accumulate data throughout the game, and use `@mantine/charts` (Recharts wrapper) for frontend visualization. Handle rematch logic in `RoomManager` with a unanimous voting system.

## Standard Stack

### Visualization

| Library             | Version              | Purpose         | Why Standard                                                   |
| ------------------- | -------------------- | --------------- | -------------------------------------------------------------- |
| **@mantine/charts** | 7.x+ (v8 compatible) | Charts & Graphs | Native integration with project's UI framework; wraps Recharts |
| **Recharts**        | 2.x                  | Charting Engine | Underlying engine for Mantine charts; standard React choice    |

**Installation:**

```bash
npm install @mantine/charts recharts
```

## Architecture Patterns

### 1. Statistics Tracking (Server-Side)

Statistics must be accumulated incrementally on the server to ensuring data integrity and persistence across disconnects.

**File:** `apps/api/src/game/GameStats.ts` (New)

```typescript
export class GameStats {
  private diceRolls: Record<number, number> = {}; // 2-12 frequency
  private resourceStats: Record<string, {
    gained: Record<ResourceType, number>;
    spent: Record<ResourceType, number>;
    traded: Record<ResourceType, number>; // Net trade flow
  }> = {};
  private devCardStats: Record<string, DevelopmentCardType[]> = {};

  recordRoll(total: number) { ... }
  recordResourceTransfer(from: string, to: string | 'bank', resources: ResourceBlock) { ... }
  recordDevCard(playerId: string, card: DevelopmentCardType) { ... }

  getStats(): GameStatsPayload { ... }
}
```

**Integration:**

- Instantiate `GameStats` in `GameManager`.
- Call `stats.record...` methods inside `rollDice`, `distributeResources`, `build...`, `buyDevCard`.
- Include `stats` payload in the `victory` WebSocket message.

### 2. Rematch Flow (Room Lifecycle)

Rematch logic belongs in `RoomManager`, as it involves resetting the `GameManager` instance.

**Flow:**

1. **Vote:** Client sends `request_rematch`.
2. **State:** `RoomManager` tracks `rematchVotes: Set<string>`.
3. **Broadcast:** Server sends `rematch_update` (ready count / players).
4. **Trigger:** When `votes.size === room.players.size`, trigger reset.
5. **Reset:**
   - Create new `BoardState` (generate new map).
   - Create new `GameManager`.
   - Clear `rematchVotes`.
   - Broadcast `game_reset` event with new game state.

### 3. Frontend Visualization

Use Mantine's `BarChart` for dice stats and stacked bars for resources.

**Components:**

- `VictoryModal`: Main container (existing).
- `StatisticsTabs`: Tab container (parchment style).
- `DiceDistributionChart`: Simple BarChart.
- `ResourceFlowChart`: Stacked BarChart (Gained vs Spent).

## Don't Hand-Roll

| Problem        | Don't Build                   | Use Instead         | Why                                                         |
| -------------- | ----------------------------- | ------------------- | ----------------------------------------------------------- |
| **Charts**     | `<svg>` or `<canvas>` drawing | `@mantine/charts`   | Accessibility, tooltips, responsiveness, theme integration  |
| **Room Reset** | Manually clearing fields      | New `GameManager()` | Cleaner state, prevents leaking old game data (roads, etc.) |

## Common Pitfalls

### Pitfall 1: Resource "Churn" vs "Net"

**What goes wrong:** Counting resources traded back and forth as massive "gains".
**How to avoid:** Track _source_ of gain.

- "Gained" = from Board/Bank.
- "Traded" = Net flow (Received - Given).
- Separate these in the visualization so a player who traded 50 times doesn't look like they produced 50 cards.

### Pitfall 2: Rematch Desync

**What goes wrong:** A player disconnects _during_ the rematch vote.
**How to avoid:** In `RoomManager.removePlayer`, check if `votes.size` now equals the _new_ `players.size`. If so, trigger the reset immediately (or wait, depending on desired UX—usually better to wait for reconnect, but for "rematch", simpler to just require active players).

### Pitfall 3: Victory Modal Overlap

**What goes wrong:** Confetti or other overlays blocking interaction with the stats/rematch button.
**How to avoid:** Ensure `VictoryModal` z-index is handled correctly relative to `react-canvas-confetti`.

## Code Examples

### Dice Distribution Chart (Mantine)

```tsx
import { BarChart } from '@mantine/charts';

// Data format: [{ value: 2, count: 5 }, { value: 3, count: 8 }, ...]
<BarChart
  h={300}
  data={diceStats}
  dataKey="value"
  series={[{ name: 'count', color: 'blue.6' }]}
  tickLine="y"
/>;
```

### Rematch Handling (Backend)

```typescript
// RoomManager.ts
handleRematchVote(roomId: string, playerId: string) {
  const room = this.rooms.get(roomId);
  if (!room) return;

  room.rematchVotes.add(playerId);

  if (room.rematchVotes.size === room.players.size) {
    this.resetGame(roomId);
  } else {
    this.broadcastToRoom(roomId, {
      type: 'rematch_update',
      readyCount: room.rematchVotes.size
    });
  }
}
```

## State of the Art

- **Mantine v7/v8 Charts:** New standard for Mantine apps (replaces generic Recharts usage).
- **Server-Side Stats:** Moving away from client-computed stats ensures consistency for all observers/spectators.

## Open Questions

- **Persisting Stats:** Do we want to save these stats to a DB later? (Currently out of scope, but `GameStats` class makes it easy to add later).
- **Spectator Mode:** If spectators are added, do they see stats live? (Currently only victory modal, so safe).

## Sources

### Primary (HIGH confidence)

- Mantine Charts Docs: https://mantine.dev/charts/getting-started/
- Project Codebase: `apps/api/src/managers/RoomManager.ts`

### Metadata

**Confidence breakdown:**

- Standard stack: HIGH (Mantine Charts is standard)
- Architecture: HIGH (Server-side accumulation is robust)
- Rematch Flow: HIGH (Standard lobby pattern)
