# Phase 4: Turn Structure & Resources - Research

**Researched:** 2026-01-29
**Domain:** Turn-based multiplayer game mechanics with WebSocket state synchronization
**Confidence:** HIGH

## Summary

This phase implements core turn-based gameplay mechanics: dice rolling with animations, resource distribution based on board state, turn phase progression, and resource tracking. The research focused on animation patterns for dice and flying cards, WebSocket message patterns for real-time multiplayer synchronization, and established state management practices for turn-based games.

The standard approach for this phase involves server-authoritative game state with client-side animations, using Motion (Framer Motion) for coordinated UI animations, CSS 3D transforms for dice rolling, and Zustand with selective subscriptions for performant state updates. The most critical architectural decision is maintaining server authority for all game logic (dice rolls, resource distribution, turn advancement) while providing immediate visual feedback on the client.

**Primary recommendation:** Implement server-authoritative dice rolling and resource distribution with optimistic client-side animations coordinated via Motion's layout animations and animation callbacks. Use type-based WebSocket message routing with full state updates on turn changes to ensure synchronization across all clients.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Motion (Framer Motion) | v11 (latest) | React animation library | Industry-leading layout animation engine with FLIP animations, shared element transitions via layoutId, and hardware-accelerated performance. Already in use (v12.28.1 installed). |
| Zustand | 5.0+ | React state management | Minimal API, no Provider boilerplate, excellent performance with selective subscriptions via selectors. Already in use (v5.0.10 installed). |
| Mantine Notifications | 8.3+ | Toast notifications | Part of existing Mantine UI framework (v8.3.12 installed). Supports position, auto-close, callbacks, icons, and loading states for resource distribution feedback. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| useShallow (Zustand) | 5.0+ (included) | Prevent re-renders | When selecting multiple values from store to avoid re-renders on shallow-equal objects |
| CSS Modules / Inline Styles | N/A | Dice animations | 3D transforms and keyframes for dice rolling - no library needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Motion | react-spring | react-spring uses physics-based animations which can feel more natural but are harder to predict/coordinate. Motion's declarative API is better for sequenced game animations. |
| Server-side RNG | Client-side RNG | Client-side random generation opens door to cheating. Server-authoritative is industry standard for fair multiplayer games. |
| Delta updates | Full state sync | Delta updates are bandwidth-efficient but add complexity. For turn-based games with infrequent updates, full state on turn change is simpler and sufficient. |

**Installation:**
```bash
# All required packages already installed
# Verify with: npm list motion zustand @mantine/notifications
```

## Architecture Patterns

### Recommended Project Structure
```
apps/api/src/game/
├── GameManager.ts           # Existing - add dice rolling and turn phase logic
├── resource-distributor.ts  # NEW - calculate resource distribution based on dice roll
├── turn-manager.ts          # NEW - handle turn phase transitions and validation
└── types.ts                 # Extend with turn phase and dice roll types

apps/web/src/
├── components/
│   ├── DiceRoller/          # NEW - dice animation component
│   │   ├── DiceRoller.tsx
│   │   └── dice.module.css  # 3D transform animations
│   ├── ResourceHand/        # NEW - player's resource cards display
│   │   └── ResourceHand.tsx
│   ├── TurnControls/        # NEW - End Turn button and phase indicators
│   │   └── TurnControls.tsx
│   └── ResourceDistribution/ # NEW - animated cards flying from hexes
│       └── ResourceDistribution.tsx
├── stores/
│   └── gameStore.ts         # EXTEND - add turn phase, dice state, resources
└── hooks/
    └── useTurnPhase.ts      # NEW - encapsulate turn phase logic and actions
```

### Pattern 1: Server-Authoritative Game State
**What:** Server owns all game logic (dice rolls, resource calculation, turn advancement). Clients send actions, server validates and broadcasts state updates.
**When to use:** All multiplayer game logic to prevent cheating and ensure consistency.
**Example:**
```typescript
// Server (GameManager.ts)
rollDice(playerId: string): {
  success: boolean;
  diceValues?: [number, number];
  total?: number;
  resourceDistribution?: Array<{playerId: string, resources: ResourceGrant[]}>;
  error?: string;
} {
  // Validate it's player's turn and in roll phase
  if (this.getCurrentPlayerId() !== playerId) {
    return { success: false, error: 'Not your turn' };
  }
  if (this.gameState.turnPhase !== 'roll') {
    return { success: false, error: 'Not in roll phase' };
  }

  // Server generates random dice values
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const total = dice1 + dice2;

  // Calculate resource distribution
  const distribution = this.distributeResources(total);

  // Update server state
  this.gameState.lastDiceRoll = { dice1, dice2, total };
  this.gameState.turnPhase = 'main';

  return {
    success: true,
    diceValues: [dice1, dice2],
    total,
    resourceDistribution: distribution
  };
}
```

### Pattern 2: Type-Based WebSocket Message Routing
**What:** Messages carry a `type` field that determines handling logic. Consistent structure enables scalable message handling.
**When to use:** All WebSocket communication in multiplayer games.
**Example:**
```typescript
// Shared types
type GameMessage =
  | { type: 'ROLL_DICE' }
  | { type: 'DICE_ROLLED', diceValues: [number, number], total: number }
  | { type: 'RESOURCES_DISTRIBUTED', grants: Array<{playerId: string, resources: ResourceGrant[]}> }
  | { type: 'END_TURN' }
  | { type: 'TURN_CHANGED', newPlayerId: string, phase: TurnPhase, turnNumber: number };

// Client sends action
sendMessage({ type: 'ROLL_DICE' });

// Server broadcasts result to all clients
broadcast({
  type: 'DICE_ROLLED',
  diceValues: [3, 5],
  total: 8
});
```

### Pattern 3: Animation Sequencing with Motion Callbacks
**What:** Use `onAnimationComplete` callbacks to chain animations in sequence. Critical for coordinating dice roll → resource distribution → UI update.
**When to use:** Multi-step animations where timing matters (dice must finish before cards fly).
**Example:**
```typescript
// Source: Motion documentation and community patterns
function DiceRollSequence({ diceValues, onComplete }: Props) {
  const [showCards, setShowCards] = useState(false);

  return (
    <>
      <motion.div
        className="dice"
        animate={{
          rotateX: [0, 360, 720],
          rotateY: [0, 180, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onAnimationComplete={() => {
          // Dice animation done, now show resource cards
          setShowCards(true);
        }}
      >
        {diceValues[0]} {diceValues[1]}
      </motion.div>

      {showCards && (
        <ResourceCardAnimation
          onComplete={onComplete}
        />
      )}
    </>
  );
}
```

### Pattern 4: Optimistic UI with Server Reconciliation
**What:** Show animation immediately on client action, but revert if server rejects. Provides instant feedback while maintaining server authority.
**When to use:** User-initiated actions where server validation is required.
**Example:**
```typescript
function rollDice() {
  // Optimistic: start animation immediately
  setDiceAnimating(true);

  // Send to server
  sendMessage({ type: 'ROLL_DICE' });

  // Server responds with actual values
  // If rejected, show error and reset UI
}

// In message handler
if (message.type === 'DICE_ROLLED') {
  // Server confirmed, use official values
  setDiceResult(message.diceValues);
} else if (message.type === 'ERROR') {
  // Revert optimistic UI
  setDiceAnimating(false);
  showNotification({ message: message.error, color: 'red' });
}
```

### Pattern 5: Zustand Selective Subscriptions
**What:** Use selector functions to subscribe components only to needed state slices. Prevents unnecessary re-renders in turn-based games where many players' states update.
**When to use:** Always, especially for components that read from shared game state.
**Example:**
```typescript
// BAD: Subscribes to entire store, re-renders on any change
const gameState = useGameStore();

// GOOD: Subscribes only to specific values
const currentPlayerId = useGameStore(state => state.currentPlayerId);
const isMyTurn = useGameStore(state =>
  state.currentPlayerId === state.myPlayerId
);

// GOOD: Multiple values with useShallow to prevent re-render on shallow-equal objects
import { useShallow } from 'zustand/react/shallow';
const { dice, total } = useGameStore(
  useShallow(state => ({
    dice: state.lastDiceRoll?.diceValues,
    total: state.lastDiceRoll?.total
  }))
);
```

### Anti-Patterns to Avoid
- **Client-side dice rolling:** Opens door to cheating, breaks synchronization. Always use server-authoritative RNG.
- **Blocking UI during animations:** Dice animations should not prevent message processing. Use non-blocking animation state.
- **Over-using will-change:** Applying `will-change: transform` to many elements causes excessive memory usage. Only use on actively animating elements.
- **State in URL/localStorage for turn state:** Turn state is ephemeral and owned by server. Don't persist locally or sync via URL.
- **Delta state updates in turn-based games:** Adds complexity for minimal bandwidth savings. Full state updates on turn changes are simpler and sufficient for Catan's turn frequency.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animation sequencing | Custom setTimeout chains | Motion's onAnimationComplete + state | setTimeout chains are fragile, don't pause/resume, and create callback hell. Motion handles cleanup and provides declarative API. |
| Toast notifications | Custom positioned divs with timers | @mantine/notifications | Already in project. Handles positioning, stacking, auto-dismiss, accessibility, and mobile layouts. |
| Dice probability distribution | Custom random() wrapper | Server-side Math.random() + cryptographic seed | Provably fair gaming requires cryptographic approaches. Math.random() is sufficient for casual games but document that it's not cryptographically secure. |
| WebSocket reconnection | Manual retry logic | Existing WebSocketClient class | Already implements exponential backoff. Extend with state resync on reconnect. |
| Resource card flying animation | Manual position calculation | Motion's layoutId for shared elements | Automatically calculates transform between positions, handles interruptions, and provides smooth FLIP animations. |
| Turn phase state machine | if/else chains | useReducer with explicit state transitions | Turn phases (roll → main → end) are a finite state machine. useReducer prevents invalid transitions and centralizes logic. |

**Key insight:** Animation coordination is the most complex aspect of this phase. Motion's callback system and layout animations eliminate the need for manual timing calculations and position tracking.

## Common Pitfalls

### Pitfall 1: Animation Performance Degradation
**What goes wrong:** Animating too many elements simultaneously causes janky animations, especially on mobile devices. Common when animating resource cards for all players.
**Why it happens:** GPU compositing layers consume memory. Creating layers for dozens of card animations exhausts GPU memory and forces fallback to CPU rendering.
**How to avoid:**
- Animate only visible player's resource cards (not opponents' cards which show only totals)
- Use `transform` and `opacity` only (GPU-accelerated properties)
- Limit concurrent animations to 10-15 elements max
- Avoid `will-change` except on actively animating elements
- Test on low-end mobile devices
**Warning signs:** Frame drops during resource distribution, browser DevTools showing yellow "Paint" warnings, increasing memory usage during animations.

### Pitfall 2: State Desynchronization After Reconnection
**What goes wrong:** Player reconnects mid-turn and sees stale game state (wrong current player, missing resources, incorrect turn phase).
**Why it happens:** WebSocket reconnection doesn't automatically fetch latest state. Client retains old state from before disconnect.
**How to avoid:**
- Send `SYNC_STATE` message immediately after WebSocket reconnect
- Server responds with complete current game state (not delta)
- Client replaces local state entirely with server state
- Show "Reconnecting..." overlay during sync
**Warning signs:** Players reporting "it's stuck on X's turn" after network issues, resource counts not matching between players.

### Pitfall 3: Race Conditions in Animation Sequences
**What goes wrong:** Dice animation starts, but resource distribution begins before dice finish. Or user clicks "End Turn" while cards are still flying, causing state confusion.
**Why it happens:** Asynchronous animations and state updates are not properly coordinated. Multiple sources of truth for "animation complete."
**How to avoid:**
- Use single source of truth for animation state in Zustand store
- Disable "End Turn" button while `animating: true`
- Chain animations explicitly: `onDiceComplete → setShowCards(true) → onCardsComplete → setAnimating(false)`
- Server ignores actions sent during animation phase (optional: track on server)
**Warning signs:** Visual glitches, cards flying mid-turn-change, duplicate resource grants, UI buttons clickable during animations.

### Pitfall 4: Implicit Compositing Memory Leak
**What goes wrong:** Memory usage increases over multiple turns, eventually causing browser slowdown or crash. More pronounced in long games.
**Why it happens:** Elements with `transform: translateZ(0)` or `will-change: transform` create GPU composite layers that aren't cleaned up. Implicit compositing promotes surrounding elements to layers too.
**How to avoid:**
- Remove `will-change` property after animation completes
- Don't use `transform: translateZ(0)` as a permanent style
- Use Chrome DevTools Layers panel to monitor layer count
- Aim for <20 composite layers total
**Warning signs:** Increasing memory usage in DevTools, composite layer count growing each turn, browser becoming sluggish after 10+ turns.

### Pitfall 5: Turn Phase Validation on Client Only
**What goes wrong:** Exploits where players can trigger actions out of phase (roll dice twice, end turn during roll phase, etc.).
**Why it happens:** Client-side validation without server enforcement. Client button disable doesn't prevent manual API calls.
**How to avoid:**
- Server validates EVERY action against current turn phase and player
- Return explicit error messages: `{ success: false, error: 'Not in roll phase' }`
- Client uses server errors to show feedback, not just disable buttons
- Log suspicious repeated validation failures (potential cheating)
**Warning signs:** Player reports "another player rolled twice," resources appearing without dice roll, turns advancing unexpectedly.

### Pitfall 6: Notification Spam During Multi-Player Resource Distribution
**What goes wrong:** When dice roll 8 affects 3 players, all 3 notifications stack and overlap, becoming unreadable.
**Why it happens:** Each resource grant triggers separate notification without coordination.
**How to avoid:**
- Show notification ONLY to current client's player (your resources granted)
- Batch multi-resource grants into single notification: "+2 wood, +1 wheat"
- Use Mantine's notification stacking/positioning system
- Consider silent update for opponents (just increment their total count)
**Warning signs:** Notification overflow, players reporting they can't read what they received, notification queue delays.

## Code Examples

Verified patterns from official sources:

### Dice Roll with 3D CSS Animation
```css
/* Source: CSS 3D transform tutorials - daily-dev-tips.com, medium.com/@jlucas5280 */
.dice-container {
  perspective: 1000px;
  /* Perspective creates 3D depth effect */
}

.dice {
  width: 60px;
  height: 60px;
  transform-style: preserve-3d;
  /* Enables children to exist in 3D space */
  transition: transform 0.8s ease-out;
}

.dice.rolling {
  animation: roll 0.8s ease-out;
}

@keyframes roll {
  0% {
    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  50% {
    transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg) scale(1.2);
  }
  100% {
    transform: rotateX(720deg) rotateY(360deg) rotateZ(0deg) scale(1);
  }
}
```

### Motion Layout Animation for Flying Cards
```typescript
// Source: Motion documentation - motion.dev/docs/react-layout-animations
import { motion } from 'motion/react';

function ResourceCard({ resource, isFlying }: Props) {
  return (
    <motion.div
      layoutId={`card-${resource.id}`}
      className="resource-card"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        layout: { duration: 0.6, ease: "easeOut" },
        opacity: { duration: 0.3 }
      }}
    >
      {/* Card content */}
    </motion.div>
  );
}

// Hex component has matching layoutId
function Hex({ resources }: Props) {
  return (
    <div className="hex">
      {resources.map(r => (
        <motion.div
          layoutId={`card-${r.id}`}
          className="resource-icon"
        />
      ))}
    </div>
  );
}
// Motion automatically animates between positions when layoutId matches
```

### Server-Side Resource Distribution
```typescript
// Source: Catan board game algorithms - GitHub repositories, board game analysis sites
distributeResources(diceTotal: number): Array<{playerId: string, resources: ResourceGrant[]}> {
  const distribution: Map<string, ResourceGrant[]> = new Map();

  // Find all hexes with matching number
  const matchingHexes = this.gameState.board.hexes.filter(
    hex => hex.number === diceTotal && hex.terrain !== 'desert'
  );

  for (const hex of matchingHexes) {
    // Find settlements/cities on this hex's vertices
    const adjacentVertices = this.getHexVertices(hex.q, hex.r);

    for (const vertexId of adjacentVertices) {
      const settlement = this.gameState.settlements.find(
        s => s.vertexId === vertexId
      );

      if (settlement) {
        const resourceType = this.terrainToResource(hex.terrain);
        const count = settlement.isCity ? 2 : 1; // Cities produce 2x

        // Add to player's distribution
        const grants = distribution.get(settlement.playerId) || [];
        const existing = grants.find(g => g.type === resourceType);
        if (existing) {
          existing.count += count;
        } else {
          grants.push({ type: resourceType, count });
        }
        distribution.set(settlement.playerId, grants);

        // Update server state
        this.gameState.playerResources[settlement.playerId][resourceType] += count;
      }
    }
  }

  return Array.from(distribution.entries()).map(([playerId, resources]) => ({
    playerId,
    resources
  }));
}
```

### Turn Phase State Machine with useReducer
```typescript
// Source: React finite state machine patterns - kyleshevlin.com, DEV Community tutorials
type TurnPhase = 'roll' | 'main' | 'end';
type TurnAction =
  | { type: 'DICE_ROLLED' }
  | { type: 'END_TURN' }
  | { type: 'NEXT_PLAYER', playerId: string, phase: TurnPhase };

interface TurnState {
  phase: TurnPhase;
  currentPlayerId: string;
  turnNumber: number;
}

const turnReducer = (state: TurnState, action: TurnAction): TurnState => {
  switch (action.type) {
    case 'DICE_ROLLED':
      // Can only roll in 'roll' phase
      if (state.phase !== 'roll') return state;
      return { ...state, phase: 'main' };

    case 'END_TURN':
      // Can only end turn in 'main' phase
      if (state.phase !== 'main') return state;
      return { ...state, phase: 'end' };

    case 'NEXT_PLAYER':
      // Server-driven transition to next player
      return {
        phase: action.phase,
        currentPlayerId: action.playerId,
        turnNumber: state.turnNumber + 1
      };

    default:
      return state;
  }
};

// Usage in component
const [turnState, dispatch] = useReducer(turnReducer, initialState);
```

### Mantine Notification for Resource Distribution
```typescript
// Source: Mantine documentation - mantine.dev/x/notifications
import { notifications } from '@mantine/notifications';

function showResourceGrant(resources: ResourceGrant[]) {
  const message = resources
    .map(r => `+${r.count} ${r.type}`)
    .join(', ');

  notifications.show({
    title: 'Resources received',
    message,
    color: 'green',
    icon: <IconCards />,
    autoClose: 3000,
    position: 'bottom-center',
  });
}

// For empty rolls
function showNoResources() {
  notifications.show({
    message: 'No resources from this roll',
    color: 'gray',
    autoClose: 2000,
    position: 'bottom-center',
  });
}
```

### Zustand Store Extension for Turn State
```typescript
// Source: Zustand best practices - GitHub discussions, pmndrs docs
interface TurnSlice {
  turnPhase: 'roll' | 'main' | 'end';
  currentPlayerId: string;
  turnNumber: number;
  lastDiceRoll: { dice1: number; dice2: number; total: number } | null;
  animating: boolean;

  setTurnPhase: (phase: TurnSlice['turnPhase']) => void;
  setDiceRoll: (roll: { dice1: number; dice2: number; total: number }) => void;
  setAnimating: (animating: boolean) => void;
  advanceTurn: (playerId: string, phase: TurnSlice['turnPhase']) => void;
}

// Extend existing gameStore
export const useGameStore = create<GameStore & TurnSlice>((set) => ({
  // ... existing state

  // Turn state
  turnPhase: 'roll',
  currentPlayerId: '',
  turnNumber: 0,
  lastDiceRoll: null,
  animating: false,

  setTurnPhase: (phase) => set({ turnPhase: phase }),
  setDiceRoll: (roll) => set({ lastDiceRoll: roll }),
  setAnimating: (animating) => set({ animating }),
  advanceTurn: (playerId, phase) => set(state => ({
    currentPlayerId: playerId,
    turnPhase: phase,
    turnNumber: state.turnNumber + 1,
    lastDiceRoll: null,
  })),
}));

// Selective hooks to prevent re-renders
export const useTurnPhase = () =>
  useGameStore(state => state.turnPhase);

export const useIsAnimating = () =>
  useGameStore(state => state.animating);

export const useCanRollDice = () =>
  useGameStore(state =>
    state.isMyTurn &&
    state.turnPhase === 'roll' &&
    !state.animating
  );
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Framer Motion | Motion (rebranded) | v11 (2025) | Same library, new name. Import from 'motion/react' instead of 'framer-motion'. API unchanged. |
| AnimateSharedLayout | layoutId prop + LayoutGroup | v6-7 (2021) | AnimateSharedLayout deprecated. Use layoutId for shared element transitions, wrap in LayoutGroup for scoping. |
| setTimeout chains | onAnimationComplete callbacks | Established pattern | Declarative animation sequencing vs imperative timing. More reliable and easier to reason about. |
| Peer-to-peer game sync | Server-authoritative + WebSocket | Industry standard (2020+) | Server authority prevents cheating and simplifies conflict resolution. P2P only for non-competitive games. |
| Redux for game state | Zustand with selectors | 2022-2025 trend | 30%+ YoY growth for Zustand. Less boilerplate, better performance with selective subscriptions, simpler mental model. |
| Math.random() + seed | Provably fair crypto RNG | 2024-2026 trend | Blockchain-inspired fairness in iGaming. For casual games, Math.random() still acceptable if server-controlled. |

**Deprecated/outdated:**
- **AnimateSharedLayout component**: Removed in Motion v6+. Replace with `LayoutGroup` component and `layoutId` prop.
- **useAnimationControls().start()**: Still works but `useAnimate()` hook is newer, more powerful pattern for imperative animations.
- **Client-side state reconciliation**: Delta patching with client prediction adds complexity. Full state sync on turn changes is modern best practice for turn-based games.
- **transform: translateZ(0) hack**: Was used to force GPU acceleration. Modern browsers auto-accelerate transform/opacity animations. Unnecessary and creates memory issues.

## Open Questions

Things that couldn't be fully resolved:

1. **Dice Animation: 2D vs 3D approach**
   - What we know: CSS 3D transforms (rotateX/Y/Z) create realistic tumbling effect. 2D sprite animations are simpler and more performant.
   - What's unclear: User preference for realism vs performance. Decision marked as "Claude's Discretion" in CONTEXT.md.
   - Recommendation: Start with 2D keyframe animation (rotate + wobble) for MVP. 3D CSS is well-documented if user requests more realism later.

2. **Animation timing synchronization across clients**
   - What we know: Server broadcasts dice result, all clients animate simultaneously. Network latency varies per client.
   - What's unclear: Whether to enforce synchronized timing (all animations finish together) or allow each client to animate at their own pace.
   - Recommendation: Let each client animate independently. Use animation duration as minimum delay before enabling "End Turn" button, but don't block other clients. Consider `min-width` loading state while any animation in progress.

3. **Resource card hand layout: fan vs grid**
   - What we know: CONTEXT.md specifies "fanned overlapping cards" grouped by resource type.
   - What's unclear: Exact layout algorithm for fan (fixed positions vs dynamic based on card count, fan angle, card overlap percentage).
   - Recommendation: Use CSS Grid with negative margins for overlap, fixed 5 columns (one per resource). Fan effect can be achieved with `transform: rotate()` on alternating cards. Investigate react-spring for physics-based fan if needed.

4. **Optimal WebSocket message granularity**
   - What we know: Type-based messages are standard. Server broadcasts state updates.
   - What's unclear: Whether to send separate messages for each step (DICE_ROLLED, then RESOURCES_DISTRIBUTED) or single composite message (TURN_UPDATE with all data).
   - Recommendation: Send separate messages to enable client-side animation sequencing. DICE_ROLLED triggers dice animation, RESOURCES_DISTRIBUTED triggers card animation. Allows clients to render steps progressively.

5. **Reconnection state sync: full state vs replay events**
   - What we know: Client needs current game state after reconnect.
   - What's unclear: Whether to send full current state snapshot or replay missed events since disconnect.
   - Recommendation: Send full state snapshot. Turn-based games have infrequent state changes, so snapshot is small. Event replay adds complexity and storage requirements on server.

## Sources

### Primary (HIGH confidence)
- Motion documentation - motion.dev/docs/react-layout-animations - Layout animations, layoutId, FLIP technique
- Zustand documentation - zustand.docs.pmnd.rs - Selectors, useShallow, re-render prevention
- Mantine documentation - mantine.dev/x/notifications - Notification system API
- MDN Web Docs - developer.mozilla.org - CSS animation-timing-function, easing functions, 3D transforms

### Secondary (MEDIUM confidence)
- [React dice roll animation patterns](https://github.com/AdamTyler/react-dice-complete) - Component architecture, CSS keyframe patterns
- [Framer Motion card flying animation tutorial](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/) - Advanced animation patterns
- [Turn-based multiplayer game state management](https://medium.com/@vaibhavkhushalani/building-a-real-time-multiplayer-tic-tac-toe-with-next-js-socket-io-open-source-fc0804a940a5) - Server-authoritative patterns, WebSocket communication
- [CSS dice animation wobble rotation](https://medium.com/@jlucas5280/rolling-dice-cfda66f2002d) - 3D transforms, perspective, CSS axis
- [Motion layout animations](https://blog.maximeheckel.com/posts/framer-motion-layout-animations/) - FLIP animations, shared elements
- [Server authoritative game state](https://www.gamesparks.com/blog/tips-for-writing-a-highly-scalable-server-authoritative-game-part-2/) - Architecture patterns
- [React animation performance](https://www.zigpoll.com/content/can-you-explain-the-best-practices-for-optimizing-web-performance-when-implementing-complex-animations-in-react) - requestAnimationFrame, will-change best practices
- [GPU compositing pitfalls](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) - Transform/opacity, implicit compositing, memory issues
- [State machines in React](https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/) - useReducer as FSM, turn phase management
- [WebSocket state synchronization](https://render.com/articles/building-real-time-applications-with-websockets) - Message patterns, reconnection strategies
- [Zustand re-render prevention](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow) - useShallow, selector optimization

### Tertiary (LOW confidence)
- WebSearch: "Catan resource distribution algorithm" - General board game strategy, not implementation-specific
- WebSearch: "provably fair dice rolling" - Blockchain/iGaming approaches may be overkill for casual game
- WebSearch: "turn-based desync issues" - Player forum discussions, not technical documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, official documentation verified
- Architecture: HIGH - Server-authoritative pattern is industry standard, verified with multiple sources
- Animation patterns: HIGH - Motion documentation and CSS 3D transforms well-established
- Pitfalls: MEDIUM - Based on general animation/multiplayer patterns, not Catan-specific
- WebSocket patterns: MEDIUM - Type-based messaging is standard, but specific message structure is project-dependent

**Research date:** 2026-01-29
**Valid until:** 2026-03-29 (60 days - stable technologies with infrequent breaking changes)
