# Phase 5: Building - Research

**Researched:** 2026-01-29
**Domain:** Building mode UI, placement validation, optimistic updates
**Confidence:** HIGH

## Summary

Phase 5 implements the building system for roads, settlements, and cities during the main game phase. This builds directly on existing patterns from Phase 3 (initial placement) and Phase 4 (turn structure). The codebase already has the core infrastructure: placement validation logic, WebSocket message handling, Zustand store patterns, and marker components for valid locations.

The key implementation areas are:
1. **Build mode state management** - New "buildMode" state in the store (null | 'road' | 'settlement' | 'city')
2. **Resource cost validation** - Extend GameManager with cost checking before placement
3. **Extended placement validation** - Modify existing validators to handle main-game rules (road connectivity, settlement adjacency to roads)
4. **Build UI components** - Mode buttons with tooltips, cost display, cancel functionality
5. **Optimistic updates** - Immediate resource deduction with silent server-rejection rollback

**Primary recommendation:** Extend existing patterns rather than introducing new architecture. Use the established `useValidLocations` hook pattern, GameManager validator pattern, and store selector hook pattern. Add new buildMode state slice and extend placement validators for main-game rules.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^5.0.10 | Store for build mode state, resource tracking | Already used, selector hook pattern established |
| motion | ^12.28.1 | Animations for resource deduction, placement feedback | Already used for ResourceHand and markers |
| @mantine/core | ^8.3.12 | Button, Tooltip, Paper components for build UI | Already used throughout UI |
| @mantine/notifications | ^8.3.13 | Toast notifications for successful placements | Already installed, not yet used |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | ^4.3.5 | WebSocket message validation | New message types for build commands |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Store-based build mode | React state in component | Store provides cross-component access needed for board + controls coordination |
| Mantine Tooltip | Custom tooltip | Mantine has disabled-button tooltip pattern (`data-disabled`) |

**Installation:**
```bash
# All packages already installed, no new dependencies needed
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── components/
│   ├── BuildControls/
│   │   ├── BuildControls.tsx     # Build mode button group
│   │   ├── BuildButton.tsx       # Individual button with tooltip
│   │   └── CostTooltip.tsx       # Resource cost display
│   └── Board/
│       ├── PlacementOverlay.tsx  # Extend for build mode (reuse)
│       └── ...
├── hooks/
│   ├── useValidLocations.ts      # Extend for main-game rules
│   ├── useBuildMode.ts           # New: build mode state and actions
│   └── useCanAfford.ts           # New: resource cost checking
├── stores/
│   └── gameStore.ts              # Add buildMode slice

apps/api/src/
├── game/
│   ├── placement-validator.ts    # Extend for main-game road/settlement rules
│   ├── build-validator.ts        # New: cost validation
│   └── GameManager.ts            # Add buildRoad, buildSettlement, buildCity methods
```

### Pattern 1: Build Mode State Slice
**What:** Add buildMode state to existing gameStore
**When to use:** Tracking which building type is being placed
**Example:**
```typescript
// Source: Existing gameStore pattern extended
interface BuildSlice {
  buildMode: 'road' | 'settlement' | 'city' | null;

  // Actions
  setBuildMode: (mode: 'road' | 'settlement' | 'city' | null) => void;
  clearBuildMode: () => void;
}

// Selector hooks (prevent re-render anti-pattern per STATE.md decision)
export const useBuildMode = () => useGameStore((state) => state.buildMode);
export const useSetBuildMode = () => useGameStore((state) => state.setBuildMode);
```

### Pattern 2: Optimistic Resource Update with Rollback
**What:** Deduct resources immediately, revert if server rejects
**When to use:** All build actions
**Example:**
```typescript
// Source: Zustand optimistic update pattern
const handleBuild = async (type: 'road' | 'settlement' | 'city', locationId: string) => {
  const costs = BUILDING_COSTS[type];
  const store = useGameStore.getState();

  // 1. Capture current resources for rollback
  const previousResources = { ...store.playerResources[store.myPlayerId!] };

  // 2. Optimistically deduct resources
  store.deductResources(store.myPlayerId!, costs);

  // 3. Send to server
  store.sendMessage?.({
    type: type === 'road' ? 'build_road' : type === 'settlement' ? 'build_settlement' : 'build_city',
    locationId,
  });

  // 4. Server response handled in Lobby.tsx message handler:
  //    - Success: no action needed (already updated)
  //    - Error: rollback via store.restoreResources(previousResources)
};
```

### Pattern 3: Extended Placement Validation for Main Game
**What:** Different validation rules for main game vs setup
**When to use:** validating road and settlement placements after setup phase
**Example:**
```typescript
// Source: Existing placement-validator.ts extended
// Setup: road must connect to just-placed settlement
// Main game: road must connect to own road OR own settlement/city

export function isValidRoadPlacementMainGame(
  edgeId: string,
  gameState: GameState,
  playerId: string,
  edges: Edge[],
): boolean {
  // Check edge exists and not occupied (same as setup)
  const edge = edges.find((e) => e.id === edgeId);
  if (!edge) return false;
  if (gameState.roads.some((r) => r.edgeId === edgeId)) return false;

  // Main game rule: must connect to player's existing road OR settlement/city
  const [v1, v2] = edgeId.split('|');

  // Check connection to own settlement/city
  const connectsToOwnBuilding = gameState.settlements.some(
    (s) => s.playerId === playerId && (s.vertexId === v1 || s.vertexId === v2)
  );

  // Check connection to own road
  const connectsToOwnRoad = gameState.roads.some((r) => {
    if (r.playerId !== playerId) return false;
    const [rv1, rv2] = r.edgeId.split('|');
    return rv1 === v1 || rv1 === v2 || rv2 === v1 || rv2 === v2;
  });

  return connectsToOwnBuilding || connectsToOwnRoad;
}
```

### Pattern 4: Tooltip on Disabled Button (Mantine)
**What:** Show cost tooltip even when button is disabled
**When to use:** Build buttons that player can't afford
**Example:**
```typescript
// Source: Mantine docs - data-disabled pattern
import { Button, Tooltip } from '@mantine/core';

function BuildButton({ type, canAfford, onClick }) {
  return (
    <Tooltip label={<CostDisplay type={type} />}>
      <Button
        data-disabled={!canAfford}
        onClick={(e) => {
          if (!canAfford) {
            e.preventDefault();
            return;
          }
          onClick();
        }}
      >
        Build {type}
      </Button>
    </Tooltip>
  );
}
```

### Anti-Patterns to Avoid
- **Direct store mutations:** Always use store actions, not direct state modification
- **Prop drilling for build mode:** Use selector hooks like existing patterns
- **Ignoring server rejection:** Always implement rollback for optimistic updates
- **Using `disabled` prop with Tooltip:** Use `data-disabled` instead per Mantine docs

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom toast system | @mantine/notifications | Already installed, integrates with theme |
| Disabled button tooltip | Conditional tooltip render | Mantine data-disabled pattern | Mouse events not triggered on disabled elements |
| Valid location calculation | Re-implement in build mode | Extend useValidLocations hook | Same geometry logic, different rules |
| Resource deduction animation | Custom animation | motion AnimatePresence with exit | ResourceHand already uses this pattern |
| Placement preview markers | New marker components | Reuse VertexMarker/EdgeMarker | Same visual pattern as Phase 3 |

**Key insight:** Phase 5 building shares ~80% of logic with Phase 3 placement. Extend existing validators and hooks rather than duplicating.

## Common Pitfalls

### Pitfall 1: Forgetting Road Connectivity Check in Main Game
**What goes wrong:** Roads can be placed anywhere on the board
**Why it happens:** Setup validation only checks connection to just-placed settlement, main game needs connection to existing roads/buildings
**How to avoid:** Create separate validation function for main game, or pass isSetupPhase flag
**Warning signs:** Players can place disconnected roads

### Pitfall 2: Race Condition in Optimistic Updates
**What goes wrong:** Multiple rapid clicks cause inconsistent state
**Why it happens:** Second click starts before first server response, both using same "previous" state
**How to avoid:** Disable build buttons while waiting for server response, or track pending operations
**Warning signs:** Resources go negative, or rollback restores wrong values

### Pitfall 3: Build Mode Not Clearing After Placement
**What goes wrong:** User stays in build mode after placing piece
**Why it happens:** Context decision says "Single placement mode: after placing a piece, mode exits"
**How to avoid:** Clear buildMode in success handler, not error handler
**Warning signs:** User can keep clicking to place multiple pieces

### Pitfall 4: Tooltip on Disabled Button Not Working
**What goes wrong:** Tooltip doesn't show when button is disabled
**Why it happens:** Disabled elements don't trigger mouse events in browsers
**How to avoid:** Use Mantine's `data-disabled` pattern instead of `disabled` prop
**Warning signs:** Tooltip works on enabled buttons but not disabled ones

### Pitfall 5: City Upgrade Targeting Wrong Settlement
**What goes wrong:** City placement validation fails or targets wrong settlement
**Why it happens:** City requires targeting existing settlement vertex, not arbitrary vertex
**How to avoid:** Filter valid locations to only player's own non-city settlements
**Warning signs:** "Invalid placement" errors when clicking own settlements

### Pitfall 6: Not Checking Remaining Piece Count
**What goes wrong:** Player can build unlimited pieces
**Why it happens:** Catan limits: 15 roads, 5 settlements, 4 cities per player
**How to avoid:** Track piece counts in state, disable button when limit reached
**Warning signs:** Context says buttons show "Roads: 12 left" - need this tracking

## Code Examples

Verified patterns from official sources:

### Building Costs Constants
```typescript
// Source: Catan official rules
export const BUILDING_COSTS = {
  road: { wood: 1, brick: 1, sheep: 0, wheat: 0, ore: 0 },
  settlement: { wood: 1, brick: 1, sheep: 1, wheat: 1, ore: 0 },
  city: { wood: 0, brick: 0, sheep: 0, wheat: 2, ore: 3 },
} as const;

export const BUILDING_LIMITS = {
  road: 15,
  settlement: 5,
  city: 4,
} as const;
```

### Can Afford Check Hook
```typescript
// Source: Pattern derived from existing usePlayerResources
export function useCanAfford(type: 'road' | 'settlement' | 'city'): boolean {
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const resources = usePlayerResources(myPlayerId || '');
  const costs = BUILDING_COSTS[type];

  return (
    resources.wood >= costs.wood &&
    resources.brick >= costs.brick &&
    resources.sheep >= costs.sheep &&
    resources.wheat >= costs.wheat &&
    resources.ore >= costs.ore
  );
}
```

### Resource Deduction Store Action
```typescript
// Source: Extend existing updatePlayerResources pattern
deductResources: (playerId: string, costs: Record<ResourceType, number>) =>
  set((state) => {
    const current = state.playerResources[playerId];
    if (!current) return state;

    return {
      playerResources: {
        ...state.playerResources,
        [playerId]: {
          wood: current.wood - costs.wood,
          brick: current.brick - costs.brick,
          sheep: current.sheep - costs.sheep,
          wheat: current.wheat - costs.wheat,
          ore: current.ore - costs.ore,
        },
      },
    };
  }),
```

### Mantine Notification for Successful Build
```typescript
// Source: Mantine notifications docs
import { notifications } from '@mantine/notifications';

const showBuildSuccess = (type: 'road' | 'settlement' | 'city') => {
  notifications.show({
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Built`,
    message: `Successfully placed a ${type}`,
    color: 'green',
    autoClose: 3000,
  });
};
```

### Valid Locations for City (Own Settlements Only)
```typescript
// Source: Extend useValidLocations pattern
export function useValidCityLocations(): Vertex[] {
  const settlements = useSettlements();
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const allVertices = useAllVertices();

  return useMemo(() => {
    // Cities can only upgrade own non-city settlements
    return settlements
      .filter((s) => s.playerId === myPlayerId && !s.isCity)
      .map((s) => allVertices.find((v) => v.id === s.vertexId))
      .filter((v): v is Vertex => v !== undefined);
  }, [settlements, myPlayerId, allVertices]);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prop drilling for build state | Zustand selector hooks | Already in use | Prevents re-render issues |
| Direct disabled prop | data-disabled for tooltips | Mantine v7+ | Tooltip works on "disabled" buttons |
| Manual toast system | @mantine/notifications | Already installed | Consistent theming, queue management |

**Deprecated/outdated:**
- React 19 useOptimistic: Could be used but Zustand pattern is more explicit and matches existing codebase patterns. Don't introduce new state paradigm.

## Open Questions

Things that couldn't be fully resolved:

1. **Piece count tracking location**
   - What we know: Need to track remaining pieces (15 roads, 5 settlements, 4 cities)
   - What's unclear: Should this be computed from settlements/roads arrays, or tracked separately?
   - Recommendation: Compute from arrays - count settlements/roads by playerId and subtract from limits

2. **Animation timing for resource card removal**
   - What we know: Context says "Animated removal when spending resources (cards fly away/fade out)"
   - What's unclear: Exact animation timing not specified (Claude's discretion)
   - Recommendation: Use motion AnimatePresence exit animation, ~300ms, match ResourceHand's existing card animations

## Sources

### Primary (HIGH confidence)
- Existing codebase: gameStore.ts, useValidLocations.ts, placement-validator.ts, GameManager.ts
- Catan official rules PDF for building costs and limits

### Secondary (MEDIUM confidence)
- [Mantine Button docs](https://mantine.dev/core/button/) - data-disabled pattern
- [Mantine Notifications docs](https://mantine.dev/x/notifications/) - showNotification API
- [Zustand optimistic updates discussion](https://github.com/pmndrs/zustand/discussions/2497) - rollback pattern

### Tertiary (LOW confidence)
- WebSearch results on optimistic update patterns - general patterns, not library-specific

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use
- Architecture: HIGH - extends existing patterns, minimal new concepts
- Pitfalls: MEDIUM - some based on general patterns, not codebase-specific

**Research date:** 2026-01-29
**Valid until:** 30 days (stable patterns, no fast-moving dependencies)
