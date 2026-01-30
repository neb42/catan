# Phase 6: Trading - Research

**Researched:** 2026-01-30
**Domain:** Trading system UI, WebSocket message handling, modal interactions, state management
**Confidence:** HIGH

## Summary

Phase 6 implements domestic trading (player-to-player) and maritime trading (bank/ports) for Catan. This builds directly on established patterns from the existing codebase: Zustand store with selector hooks, WebSocket message handling via Zod schemas, Mantine UI components, and the existing notification system.

The key implementation areas are:
1. **Trade state management** - New trade slice in gameStore tracking active proposals, responses, and modal visibility
2. **WebSocket message types** - New message schemas for propose/cancel/accept/decline/execute trade flows
3. **Trade modal UI** - Mantine Modal with tabs for "Players" and "Bank" trading modes
4. **Port access tracking** - Determine which ports a player has access to based on settlement/city positions
5. **Response coordination** - Real-time broadcast of player responses with proposer selection when multiple accept

The trading system is more complex than previous phases because it involves:
- Multi-player coordination (broadcast to all, collect responses)
- Blocking UI (recipients must respond before dismissing modal)
- Two distinct trade modes (domestic vs maritime) with different flows
- Rate calculation based on port ownership

**Primary recommendation:** Extend existing patterns (store slices, message handlers, Mantine components). Use Modal with `closeOnClickOutside={false}` and `closeOnEscape={false}` for blocking trade response modal. Track trade state in a dedicated store slice with clear state machine transitions.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^5.0.10 | Trade state management with selector hooks | Already used, extends existing pattern |
| @mantine/core | ^8.3.12 | Modal, Tabs, Button, NumberInput components | Already used throughout UI |
| @mantine/hooks | ^8.3.12 | useDisclosure for modal state | Already installed, official pattern for modal control |
| @mantine/notifications | ^8.3.13 | Toast notifications for trade completion | Already used for build notifications |
| zod | ^4.3.5 | WebSocket message validation | Already used for all message types |
| ws | ^8.19.0 | WebSocket server broadcast | Already used for all real-time communication |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion | ^12.28.1 | Animation for resource cards in trade UI | If animated transitions desired |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Mantine Modal | Custom modal/dialog | Modal has built-in accessibility, focus trapping, overlay |
| Store-based trade state | React context | Store provides cross-component access needed for modal + game coordination |
| Tabs for trade modes | Separate modals | Tabs cleaner UX, matches context decision |

**Installation:**
```bash
# All packages already installed, no new dependencies needed
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── components/
│   ├── Trade/
│   │   ├── TradeModal.tsx         # Main modal wrapper with tabs
│   │   ├── DomesticTrade.tsx      # Player-to-player trade composition
│   │   ├── MaritimeTrade.tsx      # Bank/port trade interface
│   │   ├── TradeResponseModal.tsx # Blocking modal for recipients
│   │   ├── TradeProposerView.tsx  # Proposer sees responses in real-time
│   │   ├── ResourceSelector.tsx   # +/- controls for resource amounts
│   │   └── TradeButton.tsx        # "Trade" button in game controls
│   └── ...
├── hooks/
│   ├── useTradeState.ts           # Trade state selectors
│   └── usePortAccess.ts           # Calculate player's port access
├── stores/
│   └── gameStore.ts               # Add trade slice

apps/api/src/
├── game/
│   ├── GameManager.ts             # Add trade methods
│   └── trade-validator.ts         # Trade validation logic
├── handlers/
│   └── websocket.ts               # Add trade message handlers

libs/shared/src/
├── schemas/
│   └── messages.ts                # Add trade message schemas
```

### Pattern 1: Trade State Slice
**What:** Dedicated slice in gameStore for trade state management
**When to use:** Tracking active trades, responses, modal visibility
**Example:**
```typescript
// Source: Existing gameStore pattern extended
interface TradeSlice {
  // Active trade proposal (null if none)
  activeTrade: {
    proposerId: string;
    offering: Record<ResourceType, number>;  // What proposer gives
    requesting: Record<ResourceType, number>; // What proposer wants
    responses: Record<string, 'pending' | 'accepted' | 'declined'>;
  } | null;

  // UI state
  tradeModalOpen: boolean;
  tradeResponseModalOpen: boolean;

  // Actions
  setActiveTrade: (trade: TradeSlice['activeTrade']) => void;
  updateTradeResponse: (playerId: string, response: 'accepted' | 'declined') => void;
  clearTrade: () => void;
  setTradeModalOpen: (open: boolean) => void;
  setTradeResponseModalOpen: (open: boolean) => void;
}

// Selector hooks
export const useActiveTrade = () => useGameStore((state) => state.activeTrade);
export const useTradeModalOpen = () => useGameStore((state) => state.tradeModalOpen);
export const useTradeResponseModalOpen = () => useGameStore((state) => state.tradeResponseModalOpen);
```

### Pattern 2: Trade WebSocket Message Flow
**What:** Request/response pattern for trade lifecycle
**When to use:** All trade operations
**Example:**
```typescript
// Source: Existing message schema pattern extended
// Client -> Server
const ProposeTradeMessageSchema = z.object({
  type: z.literal('propose_trade'),
  offering: z.record(ResourceTypeSchema, z.number()),
  requesting: z.record(ResourceTypeSchema, z.number()),
});

const RespondTradeMessageSchema = z.object({
  type: z.literal('respond_trade'),
  response: z.enum(['accept', 'decline']),
});

const SelectTradePartnerMessageSchema = z.object({
  type: z.literal('select_trade_partner'),
  partnerId: z.string(),
});

const CancelTradeMessageSchema = z.object({
  type: z.literal('cancel_trade'),
});

const ExecuteBankTradeMessageSchema = z.object({
  type: z.literal('execute_bank_trade'),
  giving: z.record(ResourceTypeSchema, z.number()),
  receiving: z.record(ResourceTypeSchema, z.number()),
});

// Server -> Client (broadcasts)
const TradeProposedMessageSchema = z.object({
  type: z.literal('trade_proposed'),
  proposerId: z.string(),
  offering: z.record(ResourceTypeSchema, z.number()),
  requesting: z.record(ResourceTypeSchema, z.number()),
});

const TradeResponseMessageSchema = z.object({
  type: z.literal('trade_response'),
  playerId: z.string(),
  response: z.enum(['accepted', 'declined']),
});

const TradeExecutedMessageSchema = z.object({
  type: z.literal('trade_executed'),
  proposerId: z.string(),
  partnerId: z.string(),
  proposerGave: z.record(ResourceTypeSchema, z.number()),
  partnerGave: z.record(ResourceTypeSchema, z.number()),
});

const TradeCancelledMessageSchema = z.object({
  type: z.literal('trade_cancelled'),
});

const BankTradeExecutedMessageSchema = z.object({
  type: z.literal('bank_trade_executed'),
  playerId: z.string(),
  gave: z.record(ResourceTypeSchema, z.number()),
  received: z.record(ResourceTypeSchema, z.number()),
});
```

### Pattern 3: Blocking Modal for Trade Response
**What:** Modal that cannot be dismissed without action
**When to use:** Trade response modal for non-proposing players
**Example:**
```typescript
// Source: Mantine Modal docs
import { Modal, Button, Group } from '@mantine/core';

function TradeResponseModal() {
  const activeTrade = useActiveTrade();
  const isOpen = useTradeResponseModalOpen();
  const myPlayerId = useMyPlayerId();
  const sendMessage = useSocket();

  // Don't show to proposer
  if (activeTrade?.proposerId === myPlayerId) return null;

  const handleAccept = () => {
    sendMessage?.({ type: 'respond_trade', response: 'accept' });
  };

  const handleDecline = () => {
    sendMessage?.({ type: 'respond_trade', response: 'decline' });
  };

  return (
    <Modal
      opened={isOpen && activeTrade !== null}
      onClose={() => {}} // No-op - cannot close without responding
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false} // No X button
      title="Trade Offer"
      centered
    >
      {/* Trade details */}
      <TradeDetails trade={activeTrade} />

      <Group justify="center" mt="lg">
        <Button color="green" onClick={handleAccept}>
          Accept
        </Button>
        <Button color="red" variant="outline" onClick={handleDecline}>
          Decline
        </Button>
      </Group>
    </Modal>
  );
}
```

### Pattern 4: Port Access Calculation
**What:** Determine which ports a player can use based on settlement/city positions
**When to use:** Calculating best trade rates for maritime trading
**Example:**
```typescript
// Source: Board schema + geometry utils
import { getPortVertices } from '@catan/shared';

interface PortAccess {
  generic3to1: boolean;
  specificPorts: ResourceType[]; // 2:1 ports the player has access to
}

function usePortAccess(): PortAccess {
  const board = useGameStore((state) => state.board);
  const settlements = useSettlements();
  const myPlayerId = useMyPlayerId();

  return useMemo(() => {
    const mySettlements = settlements.filter(s => s.playerId === myPlayerId);
    const myVertexIds = new Set(mySettlements.map(s => s.vertexId));

    const access: PortAccess = {
      generic3to1: false,
      specificPorts: [],
    };

    if (!board) return access;

    for (const port of board.ports) {
      // Get the two vertex IDs that touch this port
      const portVertexIds = getPortVertices(port.hexQ, port.hexR, port.edge);

      // Check if player has settlement/city on either vertex
      const hasAccess = portVertexIds.some(vid => myVertexIds.has(vid));

      if (hasAccess) {
        if (port.type === 'generic') {
          access.generic3to1 = true;
        } else {
          access.specificPorts.push(port.type as ResourceType);
        }
      }
    }

    return access;
  }, [board, settlements, myPlayerId]);
}

// Calculate best rate for a resource
function getBestRate(resource: ResourceType, access: PortAccess): number {
  if (access.specificPorts.includes(resource)) return 2;
  if (access.generic3to1) return 3;
  return 4;
}
```

### Pattern 5: Resource Selector Component
**What:** +/- controls for selecting resource quantities
**When to use:** Trade composition UI
**Example:**
```typescript
// Source: Context decision - "Resource quantities selected with +/- increment controls"
import { ActionIcon, Group, Text } from '@mantine/core';

interface ResourceSelectorProps {
  resource: ResourceType;
  value: number;
  max: number; // Player's owned amount for "give" side, unlimited for "want"
  onChange: (value: number) => void;
  label?: string; // Optional rate label like "(2:1)"
}

function ResourceSelector({ resource, value, max, onChange, label }: ResourceSelectorProps) {
  const RESOURCE_ICONS: Record<ResourceType, string> = {
    wood: '🪵', brick: '🧱', sheep: '🐑', wheat: '🌾', ore: '⛰️',
  };

  return (
    <Group gap="xs" align="center">
      <Text size="lg">{RESOURCE_ICONS[resource]}</Text>
      <Text size="sm" c="dimmed">{label}</Text>

      <ActionIcon
        variant="default"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
      >
        -
      </ActionIcon>

      <Text w={30} ta="center" fw={600}>{value}</Text>

      <ActionIcon
        variant="default"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        +
      </ActionIcon>
    </Group>
  );
}
```

### Anti-Patterns to Avoid
- **Allowing modal dismiss without response:** Use `closeOnClickOutside={false}` and `closeOnEscape={false}` for trade response modal
- **Optimistic trade execution:** Unlike building, trades require server confirmation since they affect multiple players
- **Storing trade history in component state:** Use gameStore for consistency across components
- **Allowing multiple active trades:** Context says "Only one active trade proposal at a time per player"
- **Showing trade modal to non-turn players:** Only current turn player can propose trades

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal blocking | Custom overlay blocking | Mantine Modal with closeOn* props | Built-in focus trap, accessibility, overlay |
| Modal tabs | Custom tab state | Mantine Tabs component | Keyboard navigation, aria labels built-in |
| Toast notifications | Custom toast system | @mantine/notifications | Already in use, consistent theming |
| WebSocket message validation | Manual type checking | Zod schemas with discriminated union | Already used, type-safe parsing |
| Port-vertex mapping | Manual geometry calculation | Extend shared hexGeometry utils | Existing coordinate system |

**Key insight:** The trading UI is complex but the infrastructure is already in place. Focus on wiring up existing patterns, not building new foundations.

## Common Pitfalls

### Pitfall 1: Race Condition in Trade Acceptance
**What goes wrong:** Multiple players accept simultaneously, both think they're trading
**Why it happens:** Server processes accepts sequentially but clients show optimistic state
**How to avoid:** Server tracks first acceptance; subsequent accepts are queued. When proposer selects partner, server validates that partner actually accepted.
**Warning signs:** "Trade failed" errors after clicking accept

### Pitfall 2: Trade Modal Not Blocking
**What goes wrong:** Player can click outside modal to dismiss without responding
**Why it happens:** Forgot to set `closeOnClickOutside={false}` and `withCloseButton={false}`
**How to avoid:** Always test modal with click-outside and ESC key
**Warning signs:** Trade responses show as "pending" indefinitely

### Pitfall 3: Stale Trade State After Turn Change
**What goes wrong:** Trade proposal persists after turn ends
**Why it happens:** Context says "stays open until cancelled or turn ends" but turn change handler doesn't clear trade
**How to avoid:** In `turn_changed` message handler, also clear any active trade state
**Warning signs:** New turn player sees stale trade modal from previous turn

### Pitfall 4: Port Access Calculation Wrong Vertex IDs
**What goes wrong:** Player has settlement on port but doesn't get trade bonus
**Why it happens:** Port vertices calculated with wrong edge indexing or coordinate system mismatch
**How to avoid:** Use existing `getPortPosition` logic but extract vertex IDs instead of pixel positions. Verify with test cases.
**Warning signs:** Manual testing shows port bonuses not applying

### Pitfall 5: Bank Trade Without Resource Validation
**What goes wrong:** Player can trade resources they don't have
**Why it happens:** Frontend validation only, server doesn't verify
**How to avoid:** Server validates player has enough resources at best available rate before executing
**Warning signs:** Resources go negative after bank trade

### Pitfall 6: Missing "Both Sides Non-Empty" Validation
**What goes wrong:** Player proposes empty trade (gift) or requests something for nothing
**Why it happens:** Context says "Both sides of trade must have at least one resource (no gifts)"
**How to avoid:** Validate in UI (disable send button) AND on server (reject invalid proposals)
**Warning signs:** "Free resource" trades possible

### Pitfall 7: Proposer Selects Partner Who Didn't Accept
**What goes wrong:** Proposer tries to trade with player who declined or hasn't responded
**Why it happens:** UI allows selection before all responses received
**How to avoid:** Only enable partner selection buttons for players who have accepted
**Warning signs:** "Invalid trade partner" errors

## Code Examples

Verified patterns from official sources:

### Trade State Machine Transitions
```typescript
// Source: Context decisions mapped to state machine
type TradePhase =
  | 'idle'           // No active trade
  | 'composing'      // Proposer selecting resources
  | 'awaiting'       // Waiting for responses
  | 'selecting'      // Proposer choosing from multiple accepters
  | 'executing';     // Trade in progress

// Valid transitions:
// idle -> composing (open trade modal)
// composing -> awaiting (propose trade)
// composing -> idle (cancel/close modal)
// awaiting -> selecting (at least one accept)
// awaiting -> idle (cancel or turn ends)
// selecting -> executing (proposer selects partner)
// selecting -> idle (cancel)
// executing -> idle (trade complete)
```

### Maritime Trade with Rate Calculation
```typescript
// Source: Catan rules + context decisions
interface MaritimeTradeParams {
  playerId: string;
  giving: { resource: ResourceType; amount: number };
  receiving: { resource: ResourceType; amount: number };
}

function validateMaritimeTrade(
  params: MaritimeTradeParams,
  playerResources: PlayerResources,
  portAccess: PortAccess,
): { valid: boolean; error?: string } {
  const { giving, receiving } = params;

  // Calculate required rate
  const rate = getBestRate(giving.resource, portAccess);

  // Validate amounts match rate
  if (giving.amount !== rate * receiving.amount) {
    return { valid: false, error: `Must give ${rate} for 1 with current port access` };
  }

  // Validate player has resources
  if (playerResources[giving.resource] < giving.amount) {
    return { valid: false, error: 'Not enough resources' };
  }

  return { valid: true };
}
```

### Trade Notification Toast
```typescript
// Source: Mantine notifications (already used in codebase)
import { notifications } from '@mantine/notifications';

function showTradeNotification(
  type: 'domestic' | 'bank',
  partnerName?: string,
): void {
  if (type === 'domestic') {
    notifications.show({
      title: 'Trade Complete',
      message: `Successfully traded with ${partnerName}`,
      color: 'green',
      autoClose: 3000,
    });
  } else {
    notifications.show({
      message: 'Bank trade complete',
      color: 'blue',
      autoClose: 2000,
    });
  }
}
```

### Port Vertex ID Calculation
```typescript
// Source: Existing hexGeometry patterns
// Ports connect to two vertices on the hex edge
// Edge 0 = top-right edge (vertices 0 and 1)
// Edge 1 = right edge (vertices 1 and 2)
// etc. (pointy-top hex, clockwise from top)

function getPortVertexIndices(edgeIndex: number): [number, number] {
  // Each edge connects two adjacent vertices
  return [edgeIndex, (edgeIndex + 1) % 6];
}

function getPortVertices(
  hexQ: number,
  hexR: number,
  edge: number,
): [string, string] {
  // Get the two vertex indices for this edge
  const [v1, v2] = getPortVertexIndices(edge);

  // Convert to global vertex IDs using existing coordinate system
  // Vertex ID format matches existing pattern from hexGeometry
  // This needs to match the format used in settlements
  const vertexId1 = getVertexId(hexQ, hexR, v1);
  const vertexId2 = getVertexId(hexQ, hexR, v2);

  return [vertexId1, vertexId2];
}
```

### Server-Side Trade Handler Pattern
```typescript
// Source: Existing websocket.ts handler pattern
case 'propose_trade': {
  if (!currentRoomId || !playerId) {
    sendError(ws, 'Room not found');
    return;
  }

  const gameManager = roomManager.getGameManager(currentRoomId);
  if (!gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  // Validate proposer is current turn player
  if (gameManager.getCurrentPlayerId() !== playerId) {
    sendError(ws, 'Only current turn player can propose trades');
    return;
  }

  // Validate trade has resources on both sides
  const { offering, requesting } = message;
  const hasOffering = Object.values(offering).some(v => v > 0);
  const hasRequesting = Object.values(requesting).some(v => v > 0);
  if (!hasOffering || !hasRequesting) {
    sendError(ws, 'Trade must include resources on both sides');
    return;
  }

  // Validate proposer has the offered resources
  if (!gameManager.hasResources(playerId, offering)) {
    sendError(ws, 'Not enough resources to offer');
    return;
  }

  // Set active trade in game state
  gameManager.setActiveTrade(playerId, offering, requesting);

  // Broadcast to all players
  roomManager.broadcastToRoom(currentRoomId, {
    type: 'trade_proposed',
    proposerId: playerId,
    offering,
    requesting,
  });
  break;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Uncontrolled modal | Controlled with useDisclosure | Mantine v7+ | Predictable state, callbacks |
| Prop drilling for trade state | Zustand selector hooks | Already in codebase | Cross-component consistency |
| Manual WebSocket typing | Zod discriminated unions | Already in codebase | Type-safe message handling |

**Deprecated/outdated:**
- None relevant - the codebase uses current patterns

## Open Questions

Things that couldn't be fully resolved:

1. **Port vertex ID format**
   - What we know: Settlements use vertexId format from hexGeometry
   - What's unclear: Exact format for matching port edges to settlement vertices
   - Recommendation: Examine existing `getUniqueVertices` output format, create matching function for ports

2. **Turn end trade cancellation UX**
   - What we know: Trade should cancel when turn ends
   - What's unclear: Should there be a warning before turn ends with active trade?
   - Recommendation: Auto-cancel silently with toast "Trade cancelled - turn ended"

3. **Multiple accepter selection UI**
   - What we know: Proposer chooses from accepting players
   - What's unclear: Exact UI for selection (buttons? dropdown? click on player?)
   - Recommendation: Show accepting players as clickable cards/buttons in proposer view

## Sources

### Primary (HIGH confidence)
- Existing codebase: gameStore.ts, websocket.ts, messages.ts, board-generator.ts
- Mantine Modal docs: https://mantine.dev/core/modal/
- Mantine useDisclosure docs: https://mantine.dev/hooks/use-disclosure/
- Catan trading rules: https://www.catan.com/understand-catan/game-rules

### Secondary (MEDIUM confidence)
- WebSearch: "Zustand React state management real-time multiplayer game patterns 2026"
- WebSearch: "multiplayer game trading system architecture WebSocket broadcast patterns 2026"

### Tertiary (LOW confidence)
- WebSearch: "React game UI trade modal design pattern" - general patterns only

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use
- Architecture: HIGH - extends existing patterns with well-defined state machine
- Pitfalls: MEDIUM - some based on multiplayer game patterns, needs validation during implementation

**Research date:** 2026-01-30
**Valid until:** 30 days (stable patterns, no fast-moving dependencies)
