# Phase 7: Robber - Research

**Researched:** 2026-01-30
**Domain:** Game mechanics (robber), React modal interactions, toast notifications
**Confidence:** HIGH

## Summary

This phase implements the robber mechanics triggered by rolling a 7, including the discard flow (players with 8+ cards), robber placement on hex, stealing from adjacent players, and blocking resource production. Additionally, this phase introduces the action feedback system using toast notifications and a game log.

The implementation leverages existing patterns from the codebase: Mantine UI for modals and notifications, Zustand for state management, WebSocket message patterns for client-server sync, and motion/react for animations. The standard approach uses Mantine's `@mantine/notifications` package for toasts (already installed) and existing modal patterns from TradeModal.

**Primary recommendation:** Extend existing game state with robber position, add new WebSocket message types for robber flow, use Mantine Notifications for toasts at bottom-center, and create a collapsible game log component using existing Card/Stack patterns.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mantine/notifications | ^8.3.13 | Toast notifications | Native Mantine integration, already in package.json |
| @mantine/core | ^8.3.12 | Modal, Card, Stack components | Project standard for UI |
| motion/react | ^12.28.1 | Animations for robber figure, hover effects | Already used in ResourceHand, GamePlayerList |
| zustand | ^5.0.10 | Client state for discard selection, robber placement mode | Project standard |
| zod | ^4.3.5 | WebSocket message validation | Project standard |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand/react/shallow | included | Prevent unnecessary re-renders | All selector hooks |
| @mantine/hooks | ^8.3.12 | useDisclosure for collapsible panel | Game log expand/collapse |

### No New Dependencies Required
All required libraries are already installed. No `npm install` needed.

## Architecture Patterns

### Recommended Project Structure

New/modified files:
```
apps/
├── api/src/
│   ├── game/
│   │   ├── GameManager.ts      # Add robber methods
│   │   └── resource-distributor.ts  # Add robber blocking
│   └── handlers/
│       └── websocket.ts        # Add robber message handlers
└── web/src/
    ├── components/
    │   ├── Robber/
    │   │   ├── DiscardModal.tsx      # Blocking discard selection
    │   │   ├── RobberPlacement.tsx   # Hex click overlay for robber
    │   │   ├── StealModal.tsx        # Victim selection modal
    │   │   └── RobberFigure.tsx      # SVG robber visual
    │   ├── Feedback/
    │   │   ├── GameLog.tsx           # Collapsible log panel
    │   │   └── ToastProvider.tsx     # Notification setup
    │   └── Game.tsx            # Integrate new components
    ├── stores/
    │   └── gameStore.ts        # Add robber state slice
    └── hooks/
        └── useRobberState.ts   # Robber-specific selectors
libs/
└── shared/src/
    └── schemas/
        ├── messages.ts         # Add robber message schemas
        └── game.ts             # Add robber position to GameState
```

### Pattern 1: Blocking Modal State Machine

**What:** Enforce discard completion before allowing any other action
**When to use:** When 7 is rolled and player has 8+ cards
**Example:**
```typescript
// In gameStore.ts - add to TurnSlice
interface RobberSlice {
  // Discard state
  discardRequired: boolean;
  discardTarget: number; // How many cards to discard
  selectedForDiscard: Record<ResourceType, number>; // Current selection

  // Robber placement state
  robberPlacementMode: boolean;
  robberPosition: string | null; // "q,r" format hex ID

  // Steal state
  stealModalOpen: boolean;
  stealCandidates: Array<{ playerId: string; cardCount: number }>;
}

// In DiscardModal.tsx
export function DiscardModal() {
  const { discardRequired, discardTarget, selectedForDiscard } = useDiscardState();

  // Calculate if selection is valid
  const selectedCount = Object.values(selectedForDiscard).reduce((a, b) => a + b, 0);
  const isValid = selectedCount === discardTarget;

  return (
    <Modal
      opened={discardRequired}
      onClose={() => {}} // Cannot close - blocking
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      centered
    >
      {/* Discard UI */}
    </Modal>
  );
}
```

### Pattern 2: Hex Hover Preview

**What:** Show adjacent players when hovering hex during robber placement
**When to use:** Robber placement mode is active
**Example:**
```typescript
// In TerrainHex.tsx or RobberPlacement overlay
function HexWithRobberPreview({ hex, onPlace }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const adjacentPlayers = useAdjacentPlayers(hex);

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlace(hex)}
      style={{ cursor: 'pointer' }}
    >
      {/* Hex visual */}
      {isHovered && adjacentPlayers.length > 0 && (
        <foreignObject>
          <div className="hover-preview">
            {adjacentPlayers.map(p => (
              <span key={p.id}>{p.nickname}</span>
            ))}
          </div>
        </foreignObject>
      )}
    </g>
  );
}
```

### Pattern 3: Toast Notifications with Game Log

**What:** Show transient toasts AND persist to scrollable log
**When to use:** All game actions
**Example:**
```typescript
// In a new ToastProvider or useGameNotifications hook
import { notifications } from '@mantine/notifications';

export function showGameAction(message: string, type: 'info' | 'success' | 'warning') {
  // Show toast
  notifications.show({
    message,
    position: 'bottom-center',
    autoClose: 3000,
    withCloseButton: true,
  });

  // Also add to game log (via store)
  useGameStore.getState().addLogEntry({
    message,
    type,
    timestamp: new Date(),
  });
}
```

### Pattern 4: WebSocket Message Flow for Robber

**What:** Server-driven state machine for robber sequence
**When to use:** Rolling a 7 triggers multi-step flow

```typescript
// Server sends after 7 rolled:
// 1. dice_rolled (total: 7, no resources)
// 2. discard_required (for each player with 8+ cards)
// 3. After all discards: robber_move_required (to active player)
// 4. After placement: steal_required OR turn continues

// Message types to add:
DiscardRequiredMessageSchema = z.object({
  type: z.literal('discard_required'),
  playerId: z.string(),
  targetCount: z.number(), // How many to discard
});

DiscardSubmittedMessageSchema = z.object({
  type: z.literal('discard_submitted'),
  resources: ResourceRecordSchema,
});

DiscardCompletedMessageSchema = z.object({
  type: z.literal('discard_completed'),
  playerId: z.string(),
  discarded: ResourceRecordSchema,
});

RobberMoveRequiredMessageSchema = z.object({
  type: z.literal('robber_move_required'),
  currentHexId: z.string().nullable(),
});

MoveRobberMessageSchema = z.object({
  type: z.literal('move_robber'),
  hexId: z.string(),
});

RobberMovedMessageSchema = z.object({
  type: z.literal('robber_moved'),
  hexId: z.string(),
  playerId: z.string(),
});

StealRequiredMessageSchema = z.object({
  type: z.literal('steal_required'),
  candidates: z.array(z.object({
    playerId: z.string(),
    cardCount: z.number(),
  })),
});

StealTargetMessageSchema = z.object({
  type: z.literal('steal_target'),
  victimId: z.string(),
});

StolenMessageSchema = z.object({
  type: z.literal('stolen'),
  thiefId: z.string(),
  victimId: z.string(),
  resourceType: ResourceTypeSchema, // Revealed to all (optional)
});
```

### Anti-Patterns to Avoid
- **Client-side discard validation only:** Server MUST validate discard count and resource availability
- **Polling for discard completion:** Use WebSocket broadcast when all players complete
- **Storing robber position only on client:** Server is source of truth, affects resource distribution
- **Allowing actions during discard:** Block ALL other WebSocket messages until discard complete

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom div positioning | @mantine/notifications | Position, stacking, auto-close, accessibility |
| Blocking modal | Custom overlay + event prevention | Mantine Modal with closeOnClickOutside=false | Focus trap, escape handling, accessibility |
| Card selection toggle | Custom click tracking | Track in Zustand state with toggle action | Enables optimistic UI, undo support |
| Hex adjacency lookup | Manual coordinate math | Existing Vertex.adjacentHexes in hexGeometry.ts | Already handles edge cases |
| Animation on selection | Manual CSS transitions | motion/react AnimatePresence | Layout animations, exit animations |

**Key insight:** This phase is primarily game logic and UI state management. The visual components are straightforward - the complexity is in the state machine and ensuring synchronization between all players during the discard phase.

## Common Pitfalls

### Pitfall 1: Race Condition in Simultaneous Discards

**What goes wrong:** Multiple players submit discards at similar times, server processes in wrong order
**Why it happens:** No locking on player discard state
**How to avoid:** Server tracks `pendingDiscards: Set<string>` and only processes discard from player in set
**Warning signs:** Player A's discard overwriting Player B's, or double-processing

### Pitfall 2: Stale Resource Count During Discard Selection

**What goes wrong:** Player selects cards but their count changed (e.g., trade completed just before)
**Why it happens:** Discard UI reads snapshot of resources, not live state
**How to avoid:** When `discard_required` received, server sends current resource snapshot; client uses THAT for selection, not store
**Warning signs:** "You don't have enough X" errors during discard

### Pitfall 3: Robber Blocking Not Applied Consistently

**What goes wrong:** Hex with robber sometimes produces resources
**Why it happens:** Resource distributor doesn't check robber position
**How to avoid:** Add `robberHexId` to distributeResources() parameters, filter matching hexes
**Warning signs:** Players receive resources from blocked hex

### Pitfall 4: Hover Preview Flicker on Board Edge

**What goes wrong:** Hover preview appears/disappears rapidly when moving mouse near hex edges
**Why it happens:** Mouse enters/leaves nested SVG elements rapidly
**How to avoid:** Add debounce to hover state, or use pointer-events: none on child elements
**Warning signs:** Visual flashing, performance issues

### Pitfall 5: Toast/Log Desync

**What goes wrong:** Toast shows action but log doesn't, or vice versa
**Why it happens:** Calling notification.show() without also calling addLogEntry()
**How to avoid:** Create single helper function `showGameFeedback()` that does both
**Warning signs:** Actions missing from log history

### Pitfall 6: Auto-Steal Triggering Modal Anyway

**What goes wrong:** Single valid victim but modal still shows
**Why it happens:** Not checking candidate count before showing modal
**How to avoid:** Server sends `stolen` directly if only one candidate with cards; client only shows modal if `steal_required` received
**Warning signs:** Unnecessary modal for obvious choice

## Code Examples

Verified patterns from existing codebase:

### Mantine Notifications Setup (from official docs)
```typescript
// In main.tsx - add to existing MantineProvider
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';

// Inside MantineProvider:
<Notifications position="bottom-center" autoClose={3000} />
```

### Mantine Blocking Modal (from existing TradeModal pattern)
```typescript
// Source: apps/web/src/components/Trade/TradeModal.tsx (adapted)
import { Modal } from '@mantine/core';

<Modal
  opened={discardRequired}
  onClose={() => {}} // No-op - cannot close
  closeOnClickOutside={false}
  closeOnEscape={false}
  withCloseButton={false}
  centered
  title="Discard Resources"
  size="md"
>
  {/* Content */}
</Modal>
```

### Zustand Selector Hook Pattern (from existing gameStore)
```typescript
// Source: apps/web/src/stores/gameStore.ts
export const useDiscardRequired = () =>
  useGameStore((state) => state.discardRequired);

export const useDiscardState = () =>
  useGameStore(
    useShallow((state) => ({
      required: state.discardRequired,
      target: state.discardTarget,
      selected: state.selectedForDiscard,
    })),
  );
```

### Resource Card Click Toggle (based on ResourceHand pattern)
```typescript
// Based on: apps/web/src/components/ResourceHand/ResourceHand.tsx
function DiscardableCard({ type, isSelected, onToggle }: Props) {
  return (
    <motion.div
      onClick={onToggle}
      animate={{
        y: isSelected ? -15 : 0,
        scale: isSelected ? 1.05 : 1,
      }}
      whileHover={{ scale: 1.1 }}
      style={{
        cursor: 'pointer',
        border: isSelected ? '2px solid #4CAF50' : 'none',
      }}
    >
      {/* Card visual */}
    </motion.div>
  );
}
```

### WebSocket Handler Pattern (from existing websocket.ts)
```typescript
// Source: apps/api/src/handlers/websocket.ts (pattern)
case 'discard_submitted': {
  if (!currentRoomId || !playerId) {
    sendError(ws, 'Room not found');
    return;
  }

  const gameManager = roomManager.getGameManager(currentRoomId);
  if (!gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  const result = gameManager.submitDiscard(playerId, message.resources);

  if (!result.success) {
    sendError(ws, result.error || 'Invalid discard');
    return;
  }

  // Broadcast discard completion
  roomManager.broadcastToRoom(currentRoomId, {
    type: 'discard_completed',
    playerId,
    discarded: message.resources,
  });

  // Check if all discards complete
  if (result.allDiscardsDone) {
    roomManager.broadcastToRoom(currentRoomId, {
      type: 'robber_move_required',
      currentHexId: gameManager.getRobberPosition(),
    });
  }
  break;
}
```

### Adjacent Players Calculation
```typescript
// Based on hexGeometry.ts patterns
function getAdjacentPlayers(
  hexId: string,
  settlements: Settlement[],
  vertices: Vertex[],
  players: Player[],
): Player[] {
  // Find vertices adjacent to this hex
  const adjacentVertexIds = vertices
    .filter(v => v.adjacentHexes.includes(hexId))
    .map(v => v.id);

  // Find settlements on those vertices
  const adjacentSettlements = settlements
    .filter(s => adjacentVertexIds.includes(s.vertexId));

  // Get unique players
  const playerIds = [...new Set(adjacentSettlements.map(s => s.playerId))];

  return players.filter(p => playerIds.includes(p.id));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom toast libraries (react-toastify) | Native Mantine notifications | Mantine 7+ (2023) | Single UI library, consistent styling |
| Redux for game state | Zustand | Project inception | Simpler API, less boilerplate |
| CSS animations | motion/react (Framer Motion) | motion v12 (2024) | Better layout animations, gesture support |

**Deprecated/outdated:**
- framer-motion: Renamed to motion/react in v12, old import paths still work but deprecated

## Open Questions

Things that couldn't be fully resolved:

1. **Robber figure SVG design**
   - What we know: CONTEXT.md specifies "dark semi-transparent figure standing on hex center"
   - What's unclear: Exact SVG path, whether to use emoji or custom SVG
   - Recommendation: Start with simple dark circle, iterate on design. Claude has discretion here.

2. **Discard modal card layout**
   - What we know: Click to toggle individual cards
   - What's unclear: How to display when player has many cards (20+)
   - Recommendation: Use existing fanned card pattern from ResourceHand, but in scrollable container

3. **Game log max entries**
   - What we know: Collapsible panel with scrollable history
   - What's unclear: Memory limits, whether to persist to localStorage
   - Recommendation: Start with 100 entries like debugMessages, no persistence

## Sources

### Primary (HIGH confidence)
- Existing codebase: `apps/web/src/stores/gameStore.ts` - state management patterns
- Existing codebase: `apps/web/src/components/Trade/TradeModal.tsx` - modal patterns
- Existing codebase: `libs/shared/src/schemas/messages.ts` - WebSocket message patterns
- Existing codebase: `apps/api/src/game/resource-distributor.ts` - resource distribution logic
- [Mantine Notifications](https://mantine.dev/x/notifications/) - official documentation

### Secondary (MEDIUM confidence)
- [Material UI Modal docs](https://mui.com/material-ui/react-modal/) - blocking modal patterns (applicable to Mantine)
- [React Aria useModalOverlay](https://react-spectrum.adobe.com/react-aria/useModalOverlay.html) - accessibility patterns

### Tertiary (LOW confidence)
- General Catan game rules for robber mechanics (validated against CONTEXT.md requirements)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and patterns established
- Architecture: HIGH - Follows existing codebase patterns exactly
- Pitfalls: MEDIUM - Based on general React/WebSocket experience, some specific to this codebase

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (30 days - stable patterns, no library changes expected)
