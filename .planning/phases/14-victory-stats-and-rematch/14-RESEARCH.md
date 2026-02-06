# Phase 14: Victory Stats and Rematch - Research

**Researched:** 2026-02-06
**Domain:** React data visualization, game statistics tracking, multiplayer state management
**Confidence:** HIGH

## Summary

This phase enhances the victory modal with game statistics (dice rolls, dev cards, resources) using tabbed visualization and adds rematch functionality. Research reveals that Recharts is the standard React charting library for small-to-medium datasets (under 5,000 points) with its declarative component model matching React patterns. The project already uses Mantine UI (v8.3.x) which provides accessible tabs components that integrate with the existing parchment theme. Game statistics should be accumulated on the server as events occur rather than reconstructed post-game, following event sourcing patterns common in multiplayer games. Rematch requires a player agreement protocol where all players confirm before returning to lobby with reset game state.

The key technical challenges are: (1) adding statistics tracking to server-side game logic without reconstructing from events post-game, (2) integrating charts into a fixed-height scrollable modal, and (3) implementing all-player agreement flow for rematch that handles disconnections gracefully.

**Primary recommendation:** Use Recharts 3.7.0 for bar charts with memoized data/options, implement statistics accumulation in server-side message handlers (not post-game reconstruction), use Mantine Tabs with ScrollArea.Autosize for fixed-height scrollable content, and implement rematch as a ready-state pattern mirroring the existing lobby ready system.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | 3.7.0 | Bar chart visualization | Industry standard for React charts with declarative API, 9M+ weekly downloads, excellent for datasets under 5K points, matches React component model perfectly |
| Mantine Tabs | 8.3.12 | Tabbed interface | Already in project, WAI-ARIA compliant, consistent with parchment theme, supports custom styling |
| Mantine Modal | 8.3.12 | Modal container | Already in use for victory modal, supports ScrollArea for fixed-height scrollable content |
| React Icons | Latest | Trophy/crown icons | 46K+ icons from multiple libraries (Font Awesome, Material, etc.), tree-shakeable, standard icon solution for React |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Mantine ScrollArea | 8.3.12 | Scrollable content | Use ScrollArea.Autosize as scrollAreaComponent prop on Modal for fixed-height scrollable tabs |
| Motion (Framer) | 12.28.1 | Animations | Already in project for confetti animations, use for tab transitions and winner emphasis |
| Zustand | 5.0.10 | State management | Already in use, extend with StatisticsSlice for tracking game events |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Chart.js (react-chartjs-2) | Chart.js is 3x faster for 100K+ points but uses Canvas (not SVG), less React-native API. Recharts better for <5K points with better React integration |
| Recharts | Victory | Victory has React Native support but 32x fewer downloads, smaller community, similar API complexity |
| Recharts | Custom SVG | Custom SVG for simple bars seems easy but misses responsive tooltips, legends, animations, accessibility. Don't hand-roll charts |
| React Icons | Individual icon libraries | React Icons aggregates 46K+ icons vs managing multiple dependencies. Use unless bundle size critical |

**Installation:**
```bash
npm install recharts@3.7.0 react-icons@latest
```

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/
├── components/
│   └── Victory/
│       ├── VictoryModal.tsx           # Existing modal (enhance)
│       ├── StatisticsTabs.tsx         # New: tabbed statistics container
│       ├── DiceStatsTab.tsx           # New: dice roll distribution chart
│       ├── DevCardStatsTab.tsx        # New: dev card stats with per-player breakdown
│       ├── ResourceStatsTab.tsx       # New: resource collection/trade stats
│       └── ResultsBreakdown.tsx       # New: extracted rankings component
├── stores/
│   └── gameStore.ts
│       └── StatisticsSlice            # New: accumulate statistics as events occur
└── handlers/
    └── statisticsHandlers.ts          # New: handle statistics-related WebSocket messages
```

### Pattern 1: Statistics Accumulation (Event Sourcing)

**What:** Track game statistics by accumulating events as they occur, not reconstructing post-game.

**When to use:** Always for game statistics. Reconstruction is error-prone and misses edge cases.

**Example:**
```typescript
// Source: Event sourcing pattern + multiplayer game state management
// https://microservices.io/patterns/data/event-sourcing.html

// StatisticsSlice in gameStore.ts
interface StatisticsSlice {
  diceRollHistory: Array<{ dice1: number; dice2: number; total: number; turnNumber: number }>;
  devCardsPurchased: Record<string, DevelopmentCardType[]>; // playerId -> card types
  resourcesCollectedFromDice: Record<string, PlayerResources>; // playerId -> resources
  resourcesGainedTotal: Record<string, PlayerResources>; // All sources
  resourcesSpentTotal: Record<string, PlayerResources>;
  tradeCount: number;

  // Accumulator actions
  recordDiceRoll: (roll: DiceRoll, turnNumber: number) => void;
  recordDevCardPurchase: (playerId: string, cardType: DevelopmentCardType) => void;
  recordResourcesCollected: (playerId: string, resources: PlayerResources) => void;
  recordResourcesSpent: (playerId: string, resources: PlayerResources) => void;
  recordTrade: () => void;
  resetStatistics: () => void;
}

// Accumulator implementation (fold pattern)
recordDiceRoll: (roll) =>
  set((state) => ({
    diceRollHistory: [...state.diceRollHistory, { ...roll, turnNumber: state.turnNumber }],
  })),
```

### Pattern 2: Memoized Chart Data

**What:** Wrap chart data transformations in useMemo to prevent re-renders on parent state changes.

**When to use:** Always for chart components. Charts are expensive to render.

**Example:**
```typescript
// Source: React performance optimization patterns
// https://react.dev/reference/react/useMemo

function DiceStatsTab() {
  const diceRollHistory = useGameStore((s) => s.diceRollHistory);

  // Memoize data transformation
  const chartData = useMemo(() => {
    const frequency = Array.from({ length: 11 }, (_, i) => ({
      roll: i + 2,
      count: 0
    }));

    diceRollHistory.forEach(({ total }) => {
      frequency[total - 2].count++;
    });

    return frequency;
  }, [diceRollHistory]);

  return (
    <BarChart width={600} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="roll" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#8d6e63" />
    </BarChart>
  );
}
```

### Pattern 3: Fixed-Height Scrollable Modal

**What:** Use Mantine Modal with ScrollArea.Autosize for fixed-height container with scrollable content.

**When to use:** When modal content exceeds viewport height (statistics tabs + results).

**Example:**
```typescript
// Source: Mantine Modal documentation
// https://mantine.dev/core/modal/

import { Modal, ScrollArea } from '@mantine/core';

<Modal
  opened={modalOpen}
  onClose={handleClose}
  size="xl"
  scrollAreaComponent={ScrollArea.Autosize}
  styles={{
    body: {
      maxHeight: '80vh', // Fixed height
    },
  }}
>
  <Stack>
    {/* Winner announcement - always visible */}
    <Text>Winner: {winnerNickname}</Text>

    {/* Scrollable statistics tabs */}
    <Tabs defaultValue="dice">
      <Tabs.List>...</Tabs.List>
      <Tabs.Panel value="dice">...</Tabs.Panel>
      {/* Long content scrolls */}
    </Tabs>
  </Stack>
</Modal>
```

### Pattern 4: Player Agreement Protocol (Rematch)

**What:** All-player confirmation pattern where each player must agree before action proceeds.

**When to use:** Rematch, game restart, or any action requiring unanimous consent.

**Example:**
```typescript
// Source: Multiplayer game state synchronization patterns
// https://medium.com/@qingweilim/how-do-multiplayer-games-sync-their-state-part-1-ab72d6a54043

// RematchSlice in gameStore.ts
interface RematchSlice {
  rematchRequested: boolean;
  rematchReadyPlayers: Set<string>; // Player IDs who confirmed

  requestRematch: () => void; // Send rematch_request message
  setRematchReady: (playerId: string, ready: boolean) => void;
  resetRematchState: () => void;
}

// Server validates all players ready before transitioning to lobby
// Message: rematch_request (player) -> rematch_ready (broadcast) -> rematch_accepted (all ready)
```

### Pattern 5: Slice Organization in Zustand

**What:** Single store with logical slices, middlewares applied only to combined store.

**When to use:** Always for Zustand state management. Keeps related state co-located.

**Example:**
```typescript
// Source: Zustand slice pattern official guide
// https://zustand.docs.pmnd.rs/guides/slices-pattern

// Define slice creator
const createStatisticsSlice: StateCreator<GameStore, [], [], StatisticsSlice> = (set, get) => ({
  diceRollHistory: [],
  recordDiceRoll: (roll) => set((state) => ({
    diceRollHistory: [...state.diceRollHistory, roll]
  })),
  // ... other actions
});

// Combine in gameStore.ts
export const useGameStore = create<GameStore>()((...a) => ({
  ...createPlacementSlice(...a),
  ...createTurnSlice(...a),
  ...createStatisticsSlice(...a), // New slice
  // DO NOT apply middleware here - only in create() wrapper
}));

// Export typed hooks for specific slices
export const useStatistics = () =>
  useGameStore(useShallow((s) => ({
    diceRollHistory: s.diceRollHistory,
    // ... select only needed state
  })));
```

### Anti-Patterns to Avoid

- **Post-game reconstruction:** Don't calculate statistics after game ends by iterating through game state. Track incrementally as events occur to avoid edge cases and performance issues.

- **Chart data in render:** Don't transform data inline in render function. Always use useMemo for data transformations to prevent unnecessary re-renders.

- **Inline object/array literals in props:** Don't pass `data={[...transform(state)]}` directly. This creates new reference every render, defeating React.memo.

- **Applying middleware to slices:** Don't apply devtools/persist middleware inside slice creators. Only apply at the create() level to avoid unexpected behavior.

- **SVG for large datasets:** Don't use SVG-based charts (Recharts) for >5,000 data points. Switch to Canvas (Chart.js) or virtualization for large datasets.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bar charts | Custom SVG with scales, axes, tooltips | Recharts BarChart | Missing: responsive sizing, animated updates, accessible tooltips, legend generation, data normalization, touch gestures. Edge cases: empty data, negative values, label overflow |
| Scrollable modal content | Custom overflow with scroll shadows | Mantine ScrollArea.Autosize | Missing: keyboard navigation, focus management, scroll-to-top, cross-browser consistency, mobile momentum scrolling, scroll position restoration |
| Icon components | SVG imports or inline paths | React Icons (react-icons) | Missing: tree-shaking, consistent sizing, accessibility labels, color theming, 46K icon library. Icon discovery and updates painful with manual SVG |
| Tab state management | useState with conditional renders | Mantine Tabs | Missing: keyboard navigation (arrow keys, Home/End), ARIA roles, focus management, URL synchronization, disabled state handling, controlled/uncontrolled modes |

**Key insight:** Data visualization and UI interaction patterns have mature, battle-tested solutions. Custom implementations underestimate accessibility, edge cases, and cross-browser quirks. In game development, focus effort on game logic, not reinventing UI primitives.

## Common Pitfalls

### Pitfall 1: Chart Re-rendering on Every Parent Update

**What goes wrong:** Chart component re-renders whenever any parent state changes, even if chart data hasn't changed, causing janky UI and dropped frames.

**Why it happens:** React re-renders all children by default when parent state updates. Charts are expensive (100s of DOM elements in SVG).

**How to avoid:**
1. Wrap chart components in React.memo()
2. Memoize data transformations with useMemo()
3. Memoize chart options/config objects with useMemo()
4. Use selective Zustand subscriptions (useShallow) to subscribe only to needed state

**Warning signs:**
- Victory modal feels sluggish when opening
- Browser DevTools Performance tab shows >16ms render times
- React DevTools Profiler shows chart re-rendering when other state changes

### Pitfall 2: Statistics Synchronization Mismatch

**What goes wrong:** Client-side statistics don't match server state due to optimistic updates, race conditions, or missed events.

**Why it happens:** Client accumulates statistics locally but WebSocket messages arrive out-of-order or are missed during reconnection.

**How to avoid:**
1. Server is source of truth for statistics (accumulate on server, broadcast to clients)
2. Send statistics snapshot with victory message (don't rely on accumulated client state)
3. Don't use optimistic updates for statistics (only for game actions)
4. Reset statistics on game_started message to handle rematch

**Warning signs:**
- Different players see different statistics in victory modal
- Statistics missing events that occurred during connection hiccups
- Rematch shows statistics from previous game

### Pitfall 3: Modal Height Breaking on Mobile

**What goes wrong:** Fixed-height modal with statistics tabs overflows viewport on mobile, content unreachable or awkward scrolling.

**Why it happens:** Desktop vh units don't account for mobile browser chrome (address bar), and nested scrollable regions confuse touch gestures.

**How to avoid:**
1. Use maxHeight with vh units (e.g., `maxHeight: '80vh'`) not fixed pixels
2. Test on actual mobile devices (iOS Safari, Chrome Android) not just browser DevTools
3. Use Mantine ScrollArea.Autosize which handles touch momentum and nested scroll
4. Set Modal size="xl" to use more width, reducing vertical scroll on mobile

**Warning signs:**
- Modal content cut off on iPhone with bottom tabs unreachable
- Two-finger scroll required to scroll tabs content
- Address bar doesn't hide when scrolling modal content

### Pitfall 4: Player State Not Reset on Rematch

**What goes wrong:** After rematch, players return to lobby but retain ready state, resources, or other game-specific state from previous game.

**Why it happens:** Rematch transitions to lobby but doesn't clear game-specific slices in client store.

**How to avoid:**
1. Server sends rematch_accepted message with clean room state (status='waiting', all players ready=false)
2. Client resets all game slices on rematch_accepted (except room/player identities)
3. Use a resetGameState() action that clears all game slices but preserves room
4. Test: Complete game -> rematch -> verify all players show not-ready, VP reset, resources cleared

**Warning signs:**
- Players appear ready immediately after rematch
- Victory points or resources persist into lobby
- Dice roller still visible in lobby after rematch

### Pitfall 5: All-Player Agreement Deadlock

**What goes wrong:** Rematch vote stuck waiting for disconnected player who can't respond, blocking all players.

**Why it happens:** Player disconnects after rematch initiated, server waits indefinitely for their confirmation.

**How to avoid:**
1. Cancel rematch vote if any player disconnects (server broadcasts rematch_cancelled)
2. Add timeout for rematch vote (30-60 seconds) then auto-cancel
3. Show "waiting for: [player names]" so players know who's blocking
4. Allow players to cancel their own rematch vote before all accept

**Warning signs:**
- Rematch stuck at "3/4 players ready" indefinitely
- No way to cancel rematch vote once initiated
- Players refreshing page to escape stuck rematch state

## Code Examples

Verified patterns from official sources and existing codebase:

### Simple Recharts BarChart

```typescript
// Source: Recharts official examples + existing VictoryModal patterns
// https://recharts.github.io/en-US/examples/SimpleBarChart/

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useMemo } from 'react';
import { useGameStore } from '../../stores/gameStore';

export function DiceStatsTab() {
  const diceRollHistory = useGameStore((s) => s.diceRollHistory);

  // Memoize data transformation
  const chartData = useMemo(() => {
    const frequency = Array.from({ length: 11 }, (_, i) => ({
      roll: i + 2,
      count: 0,
      name: `${i + 2}`, // For XAxis dataKey
    }));

    diceRollHistory.forEach(({ total }) => {
      frequency[total - 2].count++;
    });

    return frequency;
  }, [diceRollHistory]);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <BarChart width={600} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d7ccc8" />
        <XAxis
          dataKey="name"
          label={{ value: 'Dice Roll', position: 'insideBottom', offset: -5 }}
          style={{ fill: '#5d4037' }}
        />
        <YAxis
          label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
          style={{ fill: '#5d4037' }}
        />
        <Tooltip
          contentStyle={{
            background: '#fdf6e3',
            border: '2px solid #8d6e63',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="count" fill="#8d6e63" />
      </BarChart>
    </div>
  );
}
```

### Mantine Tabs with Parchment Styling

```typescript
// Source: Mantine Tabs documentation + existing VictoryModal theme
// https://mantine.dev/core/tabs/

import { Tabs } from '@mantine/core';

export function StatisticsTabs() {
  return (
    <Tabs
      defaultValue="dice"
      styles={{
        root: {
          background: 'transparent',
        },
        list: {
          borderBottom: '2px solid #8d6e63',
        },
        tab: {
          color: '#5d4037',
          fontFamily: 'Fraunces, serif',
          fontSize: '16px',
          '&[data-active]': {
            borderColor: '#8d6e63',
            color: '#8d6e63',
          },
          '&:hover': {
            background: 'rgba(141, 110, 99, 0.1)',
          },
        },
        panel: {
          paddingTop: '1rem',
        },
      }}
    >
      <Tabs.List>
        <Tabs.Tab value="dice">Dice Stats</Tabs.Tab>
        <Tabs.Tab value="devcards">Dev Cards</Tabs.Tab>
        <Tabs.Tab value="resources">Resources</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="dice">
        <DiceStatsTab />
      </Tabs.Panel>

      <Tabs.Panel value="devcards">
        <DevCardStatsTab />
      </Tabs.Panel>

      <Tabs.Panel value="resources">
        <ResourceStatsTab />
      </Tabs.Panel>
    </Tabs>
  );
}
```

### Statistics Slice with Event Accumulation

```typescript
// Source: Zustand slice pattern + Event sourcing accumulator pattern
// https://zustand.docs.pmnd.rs/guides/slices-pattern

import type { StateCreator } from 'zustand';
import type { DiceRoll, DevelopmentCardType, PlayerResources } from '@catan/shared';

interface StatisticsSlice {
  // Accumulated statistics
  diceRollHistory: Array<{ dice1: number; dice2: number; total: number; turnNumber: number }>;
  devCardsPurchased: Record<string, DevelopmentCardType[]>; // playerId -> card types
  resourcesCollectedFromDice: Record<string, PlayerResources>;
  resourcesGainedTotal: Record<string, PlayerResources>;
  resourcesSpentTotal: Record<string, PlayerResources>;
  tradeCount: number;

  // Actions
  recordDiceRoll: (roll: DiceRoll, turnNumber: number) => void;
  recordDevCardPurchase: (playerId: string, cardType: DevelopmentCardType) => void;
  recordResourcesCollected: (playerId: string, resources: PlayerResources, source: 'dice' | 'other') => void;
  recordResourcesSpent: (playerId: string, resources: PlayerResources) => void;
  recordTrade: () => void;
  resetStatistics: () => void;
}

const createStatisticsSlice: StateCreator<GameStore, [], [], StatisticsSlice> = (set) => ({
  diceRollHistory: [],
  devCardsPurchased: {},
  resourcesCollectedFromDice: {},
  resourcesGainedTotal: {},
  resourcesSpentTotal: {},
  tradeCount: 0,

  recordDiceRoll: (roll, turnNumber) =>
    set((state) => ({
      diceRollHistory: [...state.diceRollHistory, { ...roll, turnNumber }],
    })),

  recordDevCardPurchase: (playerId, cardType) =>
    set((state) => ({
      devCardsPurchased: {
        ...state.devCardsPurchased,
        [playerId]: [...(state.devCardsPurchased[playerId] || []), cardType],
      },
    })),

  recordResourcesCollected: (playerId, resources, source) =>
    set((state) => {
      const addResources = (existing: PlayerResources, toAdd: PlayerResources): PlayerResources => {
        return {
          wood: (existing.wood || 0) + (toAdd.wood || 0),
          brick: (existing.brick || 0) + (toAdd.brick || 0),
          sheep: (existing.sheep || 0) + (toAdd.sheep || 0),
          wheat: (existing.wheat || 0) + (toAdd.wheat || 0),
          ore: (existing.ore || 0) + (toAdd.ore || 0),
        };
      };

      const updates: any = {
        resourcesGainedTotal: {
          ...state.resourcesGainedTotal,
          [playerId]: addResources(
            state.resourcesGainedTotal[playerId] || { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
            resources
          ),
        },
      };

      if (source === 'dice') {
        updates.resourcesCollectedFromDice = {
          ...state.resourcesCollectedFromDice,
          [playerId]: addResources(
            state.resourcesCollectedFromDice[playerId] || { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
            resources
          ),
        };
      }

      return updates;
    }),

  recordResourcesSpent: (playerId, resources) =>
    set((state) => ({
      resourcesSpentTotal: {
        ...state.resourcesSpentTotal,
        [playerId]: {
          wood: (state.resourcesSpentTotal[playerId]?.wood || 0) + (resources.wood || 0),
          brick: (state.resourcesSpentTotal[playerId]?.brick || 0) + (resources.brick || 0),
          sheep: (state.resourcesSpentTotal[playerId]?.sheep || 0) + (resources.sheep || 0),
          wheat: (state.resourcesSpentTotal[playerId]?.wheat || 0) + (resources.wheat || 0),
          ore: (state.resourcesSpentTotal[playerId]?.ore || 0) + (resources.ore || 0),
        },
      },
    })),

  recordTrade: () =>
    set((state) => ({
      tradeCount: state.tradeCount + 1,
    })),

  resetStatistics: () =>
    set({
      diceRollHistory: [],
      devCardsPurchased: {},
      resourcesCollectedFromDice: {},
      resourcesGainedTotal: {},
      resourcesSpentTotal: {},
      tradeCount: 0,
    }),
});
```

### Rematch Ready State Pattern

```typescript
// Source: Existing lobby ready pattern + player agreement protocol
// apps/web/src/stores/gameStore.ts (mirror existing ready state)

interface RematchSlice {
  rematchRequested: boolean;
  rematchReadyPlayers: Set<string>;

  requestRematch: () => void;
  setRematchReady: (playerId: string, ready: boolean) => void;
  cancelRematch: () => void;
  resetRematchState: () => void;
}

const createRematchSlice: StateCreator<GameStore, [], [], RematchSlice> = (set, get) => ({
  rematchRequested: false,
  rematchReadyPlayers: new Set(),

  requestRematch: () => {
    const { socket, room } = get();
    if (!socket || !room) return;

    // Send request to server
    socket.send(JSON.stringify({ type: 'rematch_request' }));

    set({ rematchRequested: true });
  },

  setRematchReady: (playerId, ready) =>
    set((state) => {
      const newReady = new Set(state.rematchReadyPlayers);
      if (ready) {
        newReady.add(playerId);
      } else {
        newReady.delete(playerId);
      }
      return { rematchReadyPlayers: newReady };
    }),

  cancelRematch: () =>
    set({ rematchRequested: false, rematchReadyPlayers: new Set() }),

  resetRematchState: () =>
    set({ rematchRequested: false, rematchReadyPlayers: new Set() }),
});

// Handler for rematch messages
export function handleRematchReady(
  message: { type: 'rematch_ready'; playerId: string; ready: boolean },
  store: ReturnType<typeof useGameStore.getState>
) {
  const { setRematchReady, room } = store;

  setRematchReady(message.playerId, message.ready);

  // Check if all players ready
  const allReady = room?.players.every((p) =>
    store.rematchReadyPlayers.has(p.id)
  );

  if (allReady) {
    // Server will handle transition, just show notification
    showGameNotification({
      type: 'success',
      message: 'All players ready! Returning to lobby...',
    });
  }
}
```

### Trophy Icon with React Icons

```typescript
// Source: React Icons library + existing VictoryModal winner emphasis
// https://react-icons.github.io/react-icons/

import { FaTrophy } from 'react-icons/fa'; // Font Awesome trophy
import { GiCrown } from 'react-icons/gi'; // Game Icons crown

// In ResultsBreakdown.tsx (winner card)
<Card
  padding="lg"
  radius="md"
  style={{
    border: `3px solid #f1c40f`, // Gold border
    backgroundColor: 'rgba(241, 196, 15, 0.15)', // Gold tint
    boxShadow: '0 4px 12px rgba(241, 196, 15, 0.3)', // Gold glow
  }}
>
  <Group justify="space-between">
    <Group gap="xs">
      <FaTrophy size={32} color="#f1c40f" /> {/* Trophy icon */}
      <Avatar size="lg" style={{ backgroundColor: PLAYER_COLOR_HEX[player.color] }}>
        {player.nickname.slice(0, 2).toUpperCase()}
      </Avatar>
      <Stack gap={0}>
        <Group gap="xs">
          <Text size="xl" fw={700} style={{ color: '#5d4037' }}>
            {player.nickname}
          </Text>
          <GiCrown size={24} color="#f1c40f" /> {/* Crown icon */}
        </Group>
        <Badge
          size="lg"
          styles={{
            root: {
              background: '#f1c40f',
              color: '#333',
            },
          }}
        >
          WINNER - {vp.total} VP
        </Badge>
      </Stack>
    </Group>
  </Group>
</Card>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pure SVG rendering | Canvas/WebGL for large datasets | 2024-2025 | Charts with >5K points now use Canvas (Chart.js) or WebGL (LightningChart) for performance. Recharts still best for <5K points |
| Global chart libraries (D3, Chart.js) | React-native libraries (Recharts, Victory) | 2019-2020 | React charts now use declarative components matching React patterns instead of imperative D3 |
| Tab state with useState | Component library tabs (Mantine, Radix) | 2022-2023 | Accessibility (keyboard nav, ARIA) now expected. Don't build custom tabs |
| Post-game statistics calculation | Event sourcing accumulation | Industry standard | Games track events as they occur, not reconstruct from final state. Matches multiplayer architectures |
| CSS overflow for scrollable content | Library scroll components (Mantine ScrollArea) | 2023-2024 | Cross-browser scroll behavior (momentum, gestures) too complex to hand-roll |

**Deprecated/outdated:**
- **react-chartjs-2 v3:** Replaced by v4+ with better TypeScript support and tree-shaking
- **Victory v35:** Current v36+ has performance improvements for React 18
- **Mantine v6:** Project uses v8.3.12 (current stable). V6 patterns deprecated (theme API changed)
- **Custom SVG charts:** Don't build for modern React apps unless extreme customization needed

## Open Questions

Things that couldn't be fully resolved:

1. **Server-side statistics tracking**
   - What we know: Server should accumulate statistics and send snapshot with victory message
   - What's unclear: Current server architecture (handlers, state storage). Need to examine server codebase to determine where to add statistics accumulation
   - Recommendation: Examine `apps/api/src/handlers/` for existing patterns. Add statistics field to Room state, accumulate in message handlers (diceRollHandler, buildHandler, tradeHandler)

2. **Rematch message protocol**
   - What we know: All players must confirm, server validates, transitions to lobby with reset state
   - What's unclear: Exact message sequence (rematch_request -> rematch_ready -> rematch_accepted?) and timeout/cancellation protocol
   - Recommendation: Mirror existing lobby ready protocol. Define messages in `libs/shared/src/schemas/messages.ts`, implement server validation in new rematchHandler

3. **Chart responsive sizing**
   - What we know: Recharts BarChart takes explicit width/height props
   - What's unclear: How to make charts responsive within modal tabs (container query? useResizeObserver?)
   - Recommendation: Use fixed width (600px) for desktop, wrap in responsive container with useElementSize from Mantine hooks for mobile scaling. Or use ResponsiveContainer from Recharts

4. **Development card statistics detail level**
   - What we know: Show overall totals AND per-player breakdown
   - What's unclear: Should we show which specific VP card types each player drew, or just counts? Should we show when cards were played vs just purchased?
   - Recommendation: Start with purchase counts per player (simpler). Can enhance to show played vs unplayed if time permits. Don't track specific VP card identities (Victory Point, Chapel, etc.) as that reveals hidden information

## Sources

### Primary (HIGH confidence)

- [Mantine Tabs Documentation](https://mantine.dev/core/tabs/) - Official Mantine v8 component API
- [Mantine Modal Documentation](https://mantine.dev/core/modal/) - Official modal and ScrollArea integration
- [Zustand Slice Pattern Guide](https://zustand.docs.pmnd.rs/guides/slices-pattern) - Official state organization pattern
- [React useMemo Documentation](https://react.dev/reference/react/useMemo) - Official React performance optimization
- [Recharts NPM Package](https://www.npmjs.com/package/recharts) - Version 3.7.0 (latest as of Feb 2026)
- [React Icons NPM Package](https://www.npmjs.com/package/react-icons) - Official icon library for React
- [Recharts GitHub Repository](https://github.com/recharts/recharts) - Official examples and issue tracking

### Secondary (MEDIUM confidence)

- [Recharts vs Chart.js Performance Analysis](https://www.oreateai.com/blog/recharts-vs-chartjs-navigating-the-performance-maze-for-big-data-visualizations/) - Third-party benchmarks verified against LogRocket analysis
- [Top React Chart Libraries 2026](https://www.syncfusion.com/blogs/post/top-5-react-chart-libraries) - Industry trends and ecosystem overview
- [Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/) - LogRocket's comprehensive comparison
- [Multiplayer Game State Synchronization](https://medium.com/@qingweilim/how-do-multiplayer-games-sync-their-state-part-1-ab72d6a54043) - Authoritative server pattern
- [WebSocket Room State Management](https://dev.to/dowerdev/building-a-real-time-multiplayer-game-server-with-socketio-and-redis-architecture-and-583m) - Multiplayer architecture patterns
- [Event Sourcing Pattern](https://microservices.io/patterns/data/event-sourcing.html) - Authoritative pattern documentation
- [React Performance Optimization](https://medium.com/@agamkakkar/react-performance-optimization-techniques-memoization-lazy-loading-and-more-88e26a70e3cd) - Practical memoization patterns

### Tertiary (LOW confidence - requires validation)

- [Game Statistics Tracking Patterns](https://www.costcenter.net/post/importance-of-events-tracking-for-mobile-games) - General mobile game analytics (not specific to web)
- [React Chart Components Common Mistakes](https://www.geeksforgeeks.org/most-common-mistakes-that-react-developers-make/) - General React mistakes (not chart-specific)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Recharts and Mantine verified through official documentation, npm download stats, and existing project dependencies
- Architecture: HIGH - Patterns verified through official Zustand and Mantine docs, existing codebase patterns (VictoryModal, gameStore slices)
- Pitfalls: MEDIUM - Based on React performance best practices and multiplayer game patterns, but specific to this implementation context
- Server-side integration: LOW - Server codebase not examined during research phase, requires implementation investigation

**Research date:** 2026-02-06
**Valid until:** 30 days (stable technologies, but fast-moving ecosystem for versions)
**Codebase examined:** Yes (client-side web app, existing VictoryModal, gameStore patterns)
**Server codebase examined:** No (requires follow-up during planning)
