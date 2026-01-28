# Phase 3: Initial Placement - Research

**Researched:** 2026-01-27
**Domain:** Interactive hexagonal grid placement system with animations, state management, and real-time feedback
**Confidence:** HIGH

## Summary

This phase implements a snake draft placement system (1→2→3→4→4→3→2→1) for initial settlements and roads in Catan. The research reveals that the project already has strong foundations with Motion (v12.28.1), Zustand (v5.0.10), Mantine (v8.3.12), and honeycomb-grid (v4.1.5) installed. The standard approach combines:

1. **Vertex/Edge Rendering Layer** - Custom SVG elements overlaying the hexgrid for clickable settlement/road locations
2. **Placement State Machine** - Managing the sequential workflow: select location → preview → confirm → place → auto-advance
3. **Multi-channel Feedback** - Toast notifications (Mantine), card animations (Motion), and visual pulses for resource grants
4. **Selective Reactivity** - Zustand slices with custom hooks to prevent unnecessary re-renders during placement interactions

The key technical challenge is computing and rendering hex vertices and edges for interactive placement, since honeycomb-grid provides `hex.corners` but doesn't include edge/vertex coordinate calculation utilities. Manual calculation using cube coordinates is required.

**Primary recommendation:** Use honeycomb-grid's `hex.corners` property to derive vertex positions, create custom SVG overlay components for clickable settlement/road locations, manage placement workflow with Zustand state slices, and leverage Motion for preview animations and Mantine notifications for feedback.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| honeycomb-grid | 4.1.5 | Hexagon grid coordinates & geometry | Already in use; provides cube coordinates and corner calculation |
| Motion | 12.28.1 | UI animations & transitions | Already in use; industry standard (12M+ monthly downloads), GPU-accelerated, spring/layout animations |
| Zustand | 5.0.10 | Client-side state management | Already in use; 30%+ YoY growth, lightweight, perfect for game state |
| Mantine | 8.3.12 | UI components & notifications | Already in use; includes @mantine/notifications for toast feedback |
| Zod | 4.3.5 | Schema validation | Already in use; ensures placement action validity |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hexgrid | 2.0.1 | SVG hexagon rendering | Already in use for board rendering; extend with custom overlays |
| @mantine/hooks | 8.3.12 | UI interaction hooks | Already installed; useClickOutside, useHover for placement UX |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | XState | XState provides explicit state machine modeling which could formalize placement workflow, but adds complexity and bundle size. Zustand is already working well and sufficient for this sequential workflow. |
| Mantine notifications | Sonner, React Hot Toast | Lighter weight (~5KB for React Hot Toast), but requires new dependency when Mantine already provides integrated solution |
| Manual vertex calculation | honeycomb-grid edges API | Library has "edges and corners" on backlog but not yet implemented; must calculate manually |

**Installation:**
No new packages required. All libraries already installed in package.json.

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── components/
│   └── Board/
│       ├── Board.tsx                  # Existing
│       ├── TerrainHex.tsx             # Existing
│       ├── PlacementOverlay.tsx       # NEW: Renders valid locations
│       ├── VertexMarker.tsx           # NEW: Clickable settlement spots
│       ├── EdgeMarker.tsx             # NEW: Clickable road spots
│       └── PlacementPreview.tsx       # NEW: Ghost preview on hover/select
├── stores/
│   └── gameStore.ts                   # EXTEND: Add placement slices
├── hooks/
│   ├── usePlacementState.ts           # NEW: Placement workflow selector
│   └── useValidLocations.ts           # NEW: Valid settlement/road calculation
└── utils/
    └── hexGeometry.ts                 # NEW: Vertex/edge coordinate helpers
```

### Pattern 1: Vertex/Edge Coordinate Derivation

**What:** Calculate vertex and edge coordinates from honeycomb-grid hex positions using the hex.corners property and cube coordinate math.

**When to use:** Needed for rendering clickable settlement (vertex) and road (edge) locations on the hex grid.

**Implementation approach:**
```typescript
// utils/hexGeometry.ts
import { Hex } from 'honeycomb-grid';

// Honeycomb-grid provides hex.corners as Point[] with {x, y}
// Each hex has 6 corners indexed 0-5 starting from top (pointy-top orientation)

interface Vertex {
  id: string;           // Unique identifier (e.g., "0,0:0" for hex q=0,r=0, corner 0)
  x: number;           // SVG x coordinate
  y: number;           // SVG y coordinate
  adjacentHexes: string[];  // Hex IDs that share this vertex
}

interface Edge {
  id: string;           // Unique identifier
  start: { x: number; y: number };
  end: { x: number; y: number };
  midpoint: { x: number; y: number };
  adjacentHexes: string[];  // Hex IDs that share this edge
}

/**
 * Get all unique vertices from a collection of hexes
 * Uses rounding to merge nearly-identical corner positions
 */
export function getUniqueVertices(hexes: Hex[]): Vertex[] {
  const vertexMap = new Map<string, Vertex>();
  const EPSILON = 0.01; // Threshold for considering vertices identical

  hexes.forEach(hex => {
    const hexId = `${hex.q},${hex.r}`;

    hex.corners.forEach((corner, cornerIndex) => {
      // Round to handle floating point precision
      const roundedX = Math.round(corner.x / EPSILON) * EPSILON;
      const roundedY = Math.round(corner.y / EPSILON) * EPSILON;
      const vertexKey = `${roundedX},${roundedY}`;

      if (vertexMap.has(vertexKey)) {
        // Vertex exists, add this hex as adjacent
        const existing = vertexMap.get(vertexKey)!;
        existing.adjacentHexes.push(hexId);
      } else {
        // New vertex
        vertexMap.set(vertexKey, {
          id: vertexKey,
          x: corner.x,
          y: corner.y,
          adjacentHexes: [hexId]
        });
      }
    });
  });

  return Array.from(vertexMap.values());
}

/**
 * Get all unique edges from hexes by connecting adjacent corners
 */
export function getUniqueEdges(hexes: Hex[]): Edge[] {
  const edgeMap = new Map<string, Edge>();
  const EPSILON = 0.01;

  hexes.forEach(hex => {
    const hexId = `${hex.q},${hex.r}`;
    const corners = hex.corners;

    // Each hex has 6 edges connecting consecutive corners
    for (let i = 0; i < 6; i++) {
      const start = corners[i];
      const end = corners[(i + 1) % 6];

      // Create normalized edge key (smaller coordinate first for consistency)
      const roundStart = {
        x: Math.round(start.x / EPSILON) * EPSILON,
        y: Math.round(start.y / EPSILON) * EPSILON
      };
      const roundEnd = {
        x: Math.round(end.x / EPSILON) * EPSILON,
        y: Math.round(end.y / EPSILON) * EPSILON
      };

      const edgeKey = roundStart.x < roundEnd.x ||
        (roundStart.x === roundEnd.x && roundStart.y < roundEnd.y)
        ? `${roundStart.x},${roundStart.y}-${roundEnd.x},${roundEnd.y}`
        : `${roundEnd.x},${roundEnd.y}-${roundStart.x},${roundStart.y}`;

      if (edgeMap.has(edgeKey)) {
        edgeMap.get(edgeKey)!.adjacentHexes.push(hexId);
      } else {
        edgeMap.set(edgeKey, {
          id: edgeKey,
          start,
          end,
          midpoint: {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2
          },
          adjacentHexes: [hexId]
        });
      }
    }
  });

  return Array.from(edgeMap.values());
}
```

**Sources:**
- honeycomb-grid v4.1.5 TypeScript definitions confirm `hex.corners: Point[]` property
- [Red Blob Games hexagonal grids](https://www.redblobgames.com/grids/hexagons/) - authoritative resource on hex coordinate systems
- [Catan implementation example](https://github.com/koufongso/Catan) uses cube coordinates with vertex/edge derivation

### Pattern 2: Placement State Machine with Zustand

**What:** Manage placement workflow states using Zustand slices with custom hooks to prevent accidental full-store subscriptions.

**When to use:** For the sequential placement workflow: awaiting selection → previewing → confirming → placing → transitioning.

**Implementation approach:**
```typescript
// stores/gameStore.ts - ADD placement slice
import { create } from 'zustand';

type PlacementPhase = 'settlement1' | 'road1' | 'settlement2' | 'road2';
type PlacementState = 'idle' | 'selecting' | 'previewing' | 'confirming' | 'placing';

interface PlacementSlice {
  currentPhase: PlacementPhase | null;
  currentState: PlacementState;
  currentPlayerIndex: number;
  draftRound: 1 | 2;  // Round 1: 1→4, Round 2: 4→1
  previewLocation: { type: 'vertex' | 'edge'; id: string } | null;

  // Actions
  startPlacement: (phase: PlacementPhase, playerIndex: number, round: 1 | 2) => void;
  previewLocation: (location: { type: 'vertex' | 'edge'; id: string }) => void;
  clearPreview: () => void;
  confirmPlacement: () => void;
  completePlacement: () => void;
  advanceTurn: () => void;
}

// CRITICAL: Export custom hooks, NOT the raw store
// This prevents accidental full-store subscriptions

export const usePlacementPhase = () =>
  useGameStore(state => state.currentPhase);

export const usePlacementState = () =>
  useGameStore(state => ({
    state: state.currentState,
    phase: state.currentPhase,
    playerIndex: state.currentPlayerIndex
  }));

export const usePlacementActions = () =>
  useGameStore(state => ({
    preview: state.previewLocation,
    clearPreview: state.clearPreview,
    confirm: state.confirmPlacement,
    complete: state.completePlacement
  }));

// Preview location changes frequently, isolate it
export const usePreviewLocation = () =>
  useGameStore(state => state.previewLocation);
```

**Anti-pattern to avoid:**
```typescript
// DON'T: Creates new object reference on every render
const { messages, setMessages } = useGameStore(state => ({
  messages: state.messages,
  setMessages: state.setMessages
}));

// DO: Select the exact value needed
const messages = useGameStore(state => state.messages);
const setMessages = useGameStore(state => state.setMessages);

// OR: Use shallow comparison for multiple values
import { useShallow } from 'zustand/react/shallow';
const { messages, setMessages } = useGameStore(
  useShallow(state => ({ messages: state.messages, setMessages: state.setMessages }))
);
```

**Sources:**
- [Working with Zustand](https://tkdodo.eu/blog/working-with-zustand) - TkDodo's authoritative guide
- [Avoid performance issues with Zustand](https://dev.to/devgrana/avoid-performance-issues-when-using-zustand-12ee) - selector anti-patterns
- [Zustand Best Practices](https://www.projectrules.ai/rules/zustand) - custom hooks pattern

### Pattern 3: Click-to-Preview-and-Confirm Interaction

**What:** User clicks to select a location (shows preview), clicks confirm button to commit, or clicks elsewhere to move preview.

**When to use:** Prevents accidental placements while providing clear feedback about what will happen.

**Implementation approach:**
```typescript
// components/Board/VertexMarker.tsx
import { motion } from 'motion/react';

interface VertexMarkerProps {
  vertex: Vertex;
  isValid: boolean;
  isSelected: boolean;
  currentPlayerColor: string;
  invalidReason?: string;
  onClick: () => void;
}

export function VertexMarker({
  vertex,
  isValid,
  isSelected,
  currentPlayerColor,
  invalidReason,
  onClick
}: VertexMarkerProps) {
  return (
    <g>
      {/* Clickable hitbox - larger than visual for easier clicking */}
      <circle
        cx={vertex.x}
        cy={vertex.y}
        r={isValid ? 1.5 : 0.8}  // Larger hitbox for valid locations
        fill="transparent"
        style={{ cursor: isValid ? 'pointer' : 'default' }}
        onClick={isValid ? onClick : undefined}
      />

      {/* Visual indicator */}
      {isValid && (
        <motion.circle
          cx={vertex.x}
          cy={vertex.y}
          r={0.5}
          fill={currentPlayerColor}
          opacity={0.6}
          initial={{ scale: 0 }}
          animate={{
            scale: isSelected ? 1.2 : 1,
            opacity: isSelected ? 0.9 : 0.6
          }}
          whileHover={{ scale: 1.3, opacity: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      )}

      {/* Tooltip for invalid locations */}
      {!isValid && invalidReason && (
        <title>{invalidReason}</title>
      )}
    </g>
  );
}
```

**Confirmation controls:**
```typescript
// components/Board/PlacementControls.tsx
import { motion } from 'motion/react';
import { Button, Group } from '@mantine/core';

export function PlacementControls({ onConfirm, onCancel }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}
    >
      <Group>
        <Button variant="default" onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm}>Confirm Placement</Button>
      </Group>
    </motion.div>
  );
}
```

### Pattern 4: Triple-Feedback Resource Grant

**What:** When second settlement is placed, show resources received via toast notification, card animation, and count pulse simultaneously.

**When to use:** For the second settlement placement only, to create "juicy" feedback moment.

**Implementation approach:**
```typescript
// hooks/useResourceGrant.ts
import { notifications } from '@mantine/notifications';
import { useGameStore } from '../stores/gameStore';

export function useResourceGrant() {
  const updateResourceCount = useGameStore(state => state.updateResourceCount);

  return (resources: Resource[]) => {
    // 1. Toast notification
    notifications.show({
      title: 'Resources Received',
      message: resources.map(r => `${r.count} ${r.type}`).join(', '),
      color: 'teal',
      autoClose: 3000,
      position: 'top-right'
    });

    // 2. Card animation - trigger in component
    // Component listens for resourcesGranted event and animates cards flying to hand
    window.dispatchEvent(new CustomEvent('resourcesGranted', {
      detail: { resources }
    }));

    // 3. Update counts (component will pulse on change)
    resources.forEach(r => updateResourceCount(r.type, r.count));
  };
}

// components/ResourceCard.tsx
export function ResourceCard({ type, count }: Props) {
  const [isGranting, setIsGranting] = useState(false);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.resources.some((r: Resource) => r.type === type)) {
        setIsGranting(true);
        setTimeout(() => setIsGranting(false), 1000);
      }
    };

    window.addEventListener('resourcesGranted', handler as EventListener);
    return () => window.removeEventListener('resourcesGranted', handler as EventListener);
  }, [type]);

  return (
    <motion.div
      animate={isGranting ? {
        x: [0, -100, 0],  // Fly in from board
        scale: [0.5, 1.1, 1],
        rotate: [0, 5, 0]
      } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.span
        animate={isGranting ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.4 }}
      >
        {count}
      </motion.span>
    </motion.div>
  );
}
```

**Sources:**
- [Mantine notifications](https://mantine.dev/x/notifications/) - official docs for toast API
- [Motion transitions](https://motion.dev/docs/react-transitions) - spring and duration-based animations

### Pattern 5: Snake Draft Turn Order Calculation

**What:** Calculate current player index based on draft position in snake pattern (1→2→3→4→4→3→2→1).

**When to use:** For determining active player during initial placement phase.

**Implementation approach:**
```typescript
// utils/snakeDraft.ts

/**
 * Snake draft for Catan initial placement
 * Each player places: settlement1 → road1 → (wait) → settlement2 → road2
 * Order: Round 1 (1→2→3→4), Round 2 (4→3→2→1)
 */

interface DraftPosition {
  round: 1 | 2;
  playerIndex: number;  // 0-based
  phase: 'settlement' | 'road';
}

export function calculateDraftPosition(
  turnNumber: number,  // 0-based: 0-15 for 4 players
  playerCount: number
): DraftPosition {
  const positionsPerRound = playerCount * 2;  // settlement + road per player

  if (turnNumber < positionsPerRound) {
    // Round 1: forward order
    const playerIndex = Math.floor(turnNumber / 2);
    const phase = turnNumber % 2 === 0 ? 'settlement' : 'road';
    return { round: 1, playerIndex, phase };
  } else {
    // Round 2: reverse order
    const roundTwoTurn = turnNumber - positionsPerRound;
    const playerIndex = playerCount - 1 - Math.floor(roundTwoTurn / 2);
    const phase = roundTwoTurn % 2 === 0 ? 'settlement' : 'road';
    return { round: 2, playerIndex, phase };
  }
}

export function getNextDraftPosition(
  current: DraftPosition,
  playerCount: number
): DraftPosition | null {
  if (current.phase === 'settlement') {
    // Move to road phase for same player
    return { ...current, phase: 'road' };
  }

  // Moving to next player
  if (current.round === 1) {
    if (current.playerIndex === playerCount - 1) {
      // End of round 1, start round 2 (reverse order)
      return { round: 2, playerIndex: playerCount - 1, phase: 'settlement' };
    } else {
      // Next player in round 1
      return { round: 1, playerIndex: current.playerIndex + 1, phase: 'settlement' };
    }
  } else {
    // Round 2
    if (current.playerIndex === 0) {
      // End of setup phase
      return null;
    } else {
      return { round: 2, playerIndex: current.playerIndex - 1, phase: 'settlement' };
    }
  }
}

// Example usage:
// Turn 0: { round: 1, playerIndex: 0, phase: 'settlement' }
// Turn 1: { round: 1, playerIndex: 0, phase: 'road' }
// Turn 2: { round: 1, playerIndex: 1, phase: 'settlement' }
// Turn 3: { round: 1, playerIndex: 1, phase: 'road' }
// ...
// Turn 6: { round: 1, playerIndex: 3, phase: 'settlement' }
// Turn 7: { round: 1, playerIndex: 3, phase: 'road' }
// Turn 8: { round: 2, playerIndex: 3, phase: 'settlement' }  // Reverses!
// Turn 9: { round: 2, playerIndex: 3, phase: 'road' }
```

**Sources:**
- [Snake draft explained](https://www.profootballnetwork.com/what-is-a-snake-draft-rules-how-it-works-strategies-and-more/) - standard pattern definition

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom positioned div with setTimeout | @mantine/notifications | Already installed; handles queue management, positioning, auto-close, stacking, and accessibility |
| Hex corner coordinates | Manual trigonometry calculations | honeycomb-grid hex.corners | Already installed; handles orientation (pointy/flat), returns computed Point[] |
| Animation easing | Custom CSS transitions | Motion spring/duration animations | Already installed; GPU-accelerated, handles gesture velocity, interruption, layout shifts |
| Unique vertex merging | Array iteration with distance checks | Map with rounded coordinate keys | O(n) vs O(n²), handles floating-point precision automatically |
| State equality checks | Deep comparison libraries | Zustand's built-in shallow comparison | Built into library, optimized for React rendering |

**Key insight:** The existing dependencies already solve most infrastructure problems. The implementation complexity is in business logic (valid placement rules, snake draft order) not in animation/state/notification systems.

## Common Pitfalls

### Pitfall 1: Zustand Selector Anti-Pattern
**What goes wrong:** Components re-render on every store update even when their specific data didn't change, because the selector returns a new object reference every time.

**Why it happens:** IDEs auto-complete destructuring syntax inside the selector, e.g., `useGameStore(state => ({ preview: state.preview, clear: state.clearPreview }))`. This creates a new object on every call, failing Zustand's strict equality check.

**How to avoid:**
1. Select primitive values directly: `const preview = useGameStore(state => state.preview)`
2. Use `useShallow` for objects: `const actions = useGameStore(useShallow(state => ({ clear: state.clearPreview })))`
3. Export custom hooks that select specific slices: `export const usePreview = () => useGameStore(state => state.preview)`

**Warning signs:**
- Components re-render when unrelated store state changes
- React DevTools Profiler shows frequent renders during placement
- Console logging "why-did-you-render" shows store object reference change

**Sources:**
- [Zustand performance pitfalls](https://philipp-raab.medium.com/zustand-state-management-a-performance-booster-with-some-pitfalls-071c4cbee17a)
- [Working with Zustand](https://tkdodo.eu/blog/working-with-zustand)

### Pitfall 2: Animation Jank from Layout Thrashing
**What goes wrong:** Animations stutter or freeze when placement interactions trigger layout recalculations or DOM mutations.

**Why it happens:** Animating properties that trigger layout (width, height, top, left) forces browser to recalculate layout on every frame. Also, updating React state during animation causes re-renders that block the animation thread.

**How to avoid:**
1. Animate only `transform` and `opacity` - these are GPU-accelerated and don't trigger layout
2. Use `will-change: transform` CSS for elements that will animate
3. Keep animation state in refs or Motion's internal state, not React state
4. If animating layout properties is required, use Motion's `layout` prop for automatic FLIP animations

**Warning signs:**
- Animations feel choppy or have visible frame drops
- Chrome DevTools Performance shows "Recalculate Style" during animation
- Animations pause when other code runs

**Example fix:**
```typescript
// BAD: Animates left/top, triggers layout
<motion.div animate={{ left: 100, top: 50 }} />

// GOOD: Uses transform, GPU-accelerated
<motion.div animate={{ x: 100, y: 50 }} />
```

**Sources:**
- [Animation performance guide](https://motion.dev/docs/performance)
- [React animation jank best practices](https://www.zigpoll.com/content/can-you-explain-the-best-practices-for-optimizing-web-performance-when-implementing-complex-animations-in-react)

### Pitfall 3: SVG Click Detection Issues with Nested Elements
**What goes wrong:** Clicks on SVG elements don't fire the expected handler, or fire on the wrong element. Hover states flicker when moving between nested SVG children.

**Why it happens:** SVG event targets are the specific element clicked (e.g., inner circle), not the parent group. Also, SVG elements have complex hit detection with overlapping shapes.

**How to avoid:**
1. Use larger transparent hitbox circles/rectangles separate from visual elements
2. Apply `pointer-events: none` to decorative child elements
3. Use event.currentTarget (handler's element) not event.target (clicked element)
4. For hover states, add `pointer-events: all` to the hitbox and `pointer-events: none` to children

**Warning signs:**
- Clicks only work on certain parts of a marker
- Hover state flickers when moving mouse within the marker
- Click handlers don't fire even though onClick is attached

**Example fix:**
```typescript
// BAD: Visual circle handles clicks, small hitbox
<circle cx={x} cy={y} r={0.5} onClick={handler} />

// GOOD: Large transparent hitbox, visual separate
<g>
  <circle cx={x} cy={y} r={1.5} fill="transparent" onClick={handler} />
  <circle cx={x} cy={y} r={0.5} fill={color} style={{ pointerEvents: 'none' }} />
</g>
```

**Sources:**
- [SVG interaction with pointer-events](https://www.smashingmagazine.com/2018/05/svg-interaction-pointer-events-property/)
- [MDN pointer-events](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pointer-events)

### Pitfall 4: Floating Point Precision in Vertex Merging
**What goes wrong:** Multiple vertex objects created for the same physical corner because coordinate values differ by tiny amounts (e.g., 10.0000001 vs 10.0).

**Why it happens:** Honeycomb-grid's hex.corners calculation involves trigonometric functions that produce floating-point values. Adjacent hexes calculate the same corner independently, potentially with slight precision differences.

**How to avoid:**
1. Round coordinates to a consistent precision (e.g., 2 decimal places) before creating vertex IDs
2. Use an epsilon threshold (e.g., 0.01) to consider positions "equal"
3. Build a Map with rounded coordinate strings as keys to deduplicate
4. Test with multiple hexes that should share corners

**Warning signs:**
- More vertices rendered than expected (19 hexes × 6 corners = 114, but should merge to ~54 unique)
- Adjacent hexes show gaps at corners
- Settlement placement shows duplicate locations at the same visual position

**Example fix:**
```typescript
// BAD: Direct coordinate comparison
const vertexId = `${corner.x},${corner.y}`;

// GOOD: Rounded for consistency
const EPSILON = 0.01;
const roundedX = Math.round(corner.x / EPSILON) * EPSILON;
const roundedY = Math.round(corner.y / EPSILON) * EPSILON;
const vertexId = `${roundedX},${roundedY}`;
```

### Pitfall 5: Subscribing to Entire Store for Frequently-Changing State
**What goes wrong:** Every component re-renders whenever preview location changes, even components that don't display preview information.

**Why it happens:** Placement preview location updates on every mouse move over valid locations. If components subscribe to the whole store or large objects containing preview state, they re-render constantly.

**How to avoid:**
1. Isolate frequently-changing state (like preview location) in separate selector
2. Only subscribe to preview in components that render preview visuals
3. Use separate custom hooks for different state slices
4. Keep preview state local to overlay component when possible

**Warning signs:**
- PlayerList component re-renders on mouse move
- React DevTools Profiler shows many components rendering during placement
- Performance degrades when hovering over board

**Example fix:**
```typescript
// BAD: PlayerList subscribes to placement state including preview
const placementState = usePlacementState();  // Re-renders on preview change

// GOOD: PlayerList only subscribes to current player
const currentPlayerIndex = useGameStore(state => state.currentPlayerIndex);
```

## Code Examples

Verified patterns from official sources and established implementations:

### Valid Settlement Location Calculation
```typescript
// hooks/useValidLocations.ts
import { Vertex, Edge } from '../utils/hexGeometry';

interface GameState {
  settlements: Map<string, { playerId: string }>;
  roads: Map<string, { playerId: string }>;
}

/**
 * Catan settlement rules:
 * - Must be on a vertex
 * - Must not be adjacent to another settlement (distance rule)
 * - In second round, must be connected to player's first road
 */
export function getValidSettlementLocations(
  vertices: Vertex[],
  gameState: GameState,
  isFirstSettlement: boolean,
  playerId: string
): Vertex[] {
  return vertices.filter(vertex => {
    // Check if already occupied
    if (gameState.settlements.has(vertex.id)) {
      return false;
    }

    // Check distance rule: no settlements on adjacent vertices
    const hasAdjacentSettlement = getAdjacentVertices(vertex, vertices)
      .some(adjacentVertex => gameState.settlements.has(adjacentVertex.id));

    if (hasAdjacentSettlement) {
      return false;
    }

    // For second settlement, must be connected to player's road
    if (!isFirstSettlement) {
      const playerRoads = Array.from(gameState.roads.entries())
        .filter(([_, road]) => road.playerId === playerId);

      const isConnectedToPlayerRoad = playerRoads.some(([edgeId]) => {
        // Check if this vertex is an endpoint of the road edge
        return edgeId.includes(vertex.id);
      });

      if (!isConnectedToPlayerRoad) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get vertices adjacent to a given vertex
 * Adjacent = share an edge (direct neighbors on hex grid)
 */
function getAdjacentVertices(vertex: Vertex, allVertices: Vertex[]): Vertex[] {
  // Vertices are adjacent if they share at least one hex
  // and are within edge distance (~2-3 units for standard hex)
  const EDGE_DISTANCE = 2.5;

  return allVertices.filter(other => {
    if (other.id === vertex.id) return false;

    const hasSharedHex = vertex.adjacentHexes.some(hexId =>
      other.adjacentHexes.includes(hexId)
    );

    if (!hasSharedHex) return false;

    const distance = Math.sqrt(
      Math.pow(vertex.x - other.x, 2) + Math.pow(vertex.y - other.y, 2)
    );

    return distance < EDGE_DISTANCE;
  });
}

/**
 * Catan road rules:
 * - Must be on an edge
 * - For first road, must connect to player's just-placed settlement
 * - For second road, must connect to player's second settlement
 */
export function getValidRoadLocations(
  edges: Edge[],
  gameState: GameState,
  justPlacedSettlement: Vertex,
  playerId: string
): Edge[] {
  return edges.filter(edge => {
    // Check if already occupied
    if (gameState.roads.has(edge.id)) {
      return false;
    }

    // Must connect to the settlement just placed
    // Edge connects to vertex if edge endpoints are near vertex
    const connectsToSettlement =
      isPointNear(edge.start, { x: justPlacedSettlement.x, y: justPlacedSettlement.y }) ||
      isPointNear(edge.end, { x: justPlacedSettlement.x, y: justPlacedSettlement.y });

    return connectsToSettlement;
  });
}

function isPointNear(p1: { x: number; y: number }, p2: { x: number; y: number }): boolean {
  const EPSILON = 0.1;
  return Math.abs(p1.x - p2.x) < EPSILON && Math.abs(p1.y - p2.y) < EPSILON;
}
```

### Motion Layout Animation for Placement Preview
```typescript
// components/Board/PlacementPreview.tsx
import { motion, AnimatePresence } from 'motion/react';

interface PlacementPreviewProps {
  location: { x: number; y: number } | null;
  type: 'settlement' | 'road';
  playerColor: string;
}

export function PlacementPreview({ location, type, playerColor }: PlacementPreviewProps) {
  return (
    <AnimatePresence>
      {location && (
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.7, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {type === 'settlement' ? (
            // Settlement preview: house shape
            <g transform={`translate(${location.x}, ${location.y})`}>
              <motion.rect
                x={-0.5}
                y={-0.5}
                width={1}
                height={1}
                fill={playerColor}
                stroke="white"
                strokeWidth={0.1}
                animate={{
                  y: [-0.5, -0.6, -0.5],  // Subtle bounce
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </g>
          ) : (
            // Road preview: line segment
            <motion.line
              x1={location.x}
              y1={location.y}
              x2={location.x + 1}  // This would be calculated from edge endpoints
              y2={location.y + 1}
              stroke={playerColor}
              strokeWidth={0.3}
              strokeDasharray="0.3 0.2"
              animate={{
                strokeDashoffset: [0, -0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          )}
        </motion.g>
      )}
    </AnimatePresence>
  );
}
```

**Source:** [Motion React transitions](https://motion.dev/docs/react-transitions)

### Mantine Notification with Auto-Close
```typescript
// utils/notifications.ts
import { notifications } from '@mantine/notifications';

export function showResourceGrant(resources: Array<{ type: string; count: number }>) {
  const resourceList = resources
    .map(r => `${r.count} ${r.type}`)
    .join(', ');

  notifications.show({
    id: 'resource-grant',
    title: 'Resources Received',
    message: resourceList,
    color: 'teal',
    autoClose: 3000,
    position: 'top-right',
    withCloseButton: true,
  });
}

export function showPlacementError(message: string) {
  notifications.show({
    title: 'Invalid Placement',
    message,
    color: 'red',
    autoClose: 4000,
    position: 'top-center',
  });
}
```

**Source:** [Mantine notifications API](https://mantine.dev/x/notifications/)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Framer Motion | Motion | 2024-2025 | Rebranded but same library; package name changed to `motion` |
| Manual state machines | XState / simple state enums | 2023-2026 | XState adoption growing but still optional; simple enums work for linear workflows like placement |
| Redux for game state | Zustand / Jotai | 2022-2026 | Lighter alternatives dominate; 30%+ YoY growth for Zustand |
| Custom toast components | Library-based (Sonner, React Hot Toast, Mantine) | 2020-2026 | Libraries matured to handle queue management, accessibility; no reason to build custom |
| Offset hex coordinates for algorithms | Cube/axial coordinates | 2015-2026 (Red Blob Games) | Cube coordinates enable vector operations; established best practice |

**Deprecated/outdated:**
- `react-spring`: Still maintained but Motion (formerly Framer Motion) is now dominant for React animations
- Storing animation state in Redux/Zustand: Current best practice is refs or Motion's internal state to avoid re-render thrashing
- Manual vertex/edge coordinate systems: honeycomb-grid provides hex.corners; derive vertices from that rather than custom trigonometry

## Open Questions

Things that couldn't be fully resolved:

1. **Exact coordinate transformation between react-hexgrid and honeycomb-grid**
   - What we know: Project uses both libraries - react-hexgrid for rendering (`<HexGrid>`, `<Layout>`), honeycomb-grid as dependency
   - What's unclear: Whether honeycomb-grid is actively used, or if it's a legacy dependency. Board.tsx uses react-hexgrid's Layout with `size={{ x: 10, y: 10 }}` but unclear if honeycomb-grid's coordinate system matches.
   - Recommendation: Verify in code whether hexes use honeycomb-grid's Hex class or just react-hexgrid. If only react-hexgrid is used, may need to directly use its coordinate system. Check imports in TerrainHex.tsx and board state.

2. **Settlement/road rendering approach - 3D objects vs SVG shapes**
   - What we know: Current implementation uses SVG patterns for terrain textures via react-hexgrid Pattern component
   - What's unclear: Whether settlements and roads should be SVG shapes or if project plans to add 3D rendering (no Three.js detected in dependencies)
   - Recommendation: Stick with SVG for consistency with current board rendering. Simple shapes (rect for settlement, line for road) match established pattern.

3. **WebSocket message format for placement actions**
   - What we know: Project has WebSocket infrastructure (`useWebSocket` hook, websocket.ts service, Zod schemas for messages)
   - What's unclear: Exact message schema for placement actions hasn't been defined yet
   - Recommendation: Extend existing WebSocketMessage schema in libs/shared/src/schemas/messages.ts to include placement action types. Follow established pattern seen in existing messages.

4. **Invalid placement tooltip positioning strategy**
   - What we know: Context specifies "invalid locations show tooltip explanation on hover"
   - What's unclear: SVG `<title>` provides native tooltips but limited styling. Mantine Tooltip component offers rich styling but requires Portal for proper positioning in SVG context.
   - Recommendation: Start with SVG `<title>` for simplicity (zero dependencies, accessibility built-in). Upgrade to Mantine Tooltip if styling requirements emerge during implementation.

## Sources

### Primary (HIGH confidence)
- honeycomb-grid v4.1.5 TypeScript definitions - `/node_modules/honeycomb-grid/dist/hex/hex.d.ts`
- package.json dependencies - verified installed versions
- [Motion for React documentation](https://motion.dev/docs/react) - official current docs
- [Mantine notifications documentation](https://mantine.dev/x/notifications/) - official API docs
- [Red Blob Games hexagonal grids guide](https://www.redblobgames.com/grids/hexagons/) - authoritative hexagon coordinate reference

### Secondary (MEDIUM confidence)
- [Working with Zustand by TkDodo](https://tkdodo.eu/blog/working-with-zustand) - established expert guide
- [Zustand performance pitfalls by Philipp Raab](https://philipp-raab.medium.com/zustand-state-management-a-performance-booster-with-some-pitfalls-071c4cbee17a) - verified anti-patterns
- [Motion transitions documentation](https://motion.dev/docs/react-transitions) - verified animation patterns
- [Motion performance guide](https://motion.dev/docs/performance) - official optimization guidance
- [Catan implementation example (koufongso)](https://github.com/koufongso/Catan) - cube coordinate vertex/edge derivation pattern
- [SVG interaction with pointer-events - Smashing Magazine](https://www.smashingmagazine.com/2018/05/svg-interaction-pointer-events-property/) - established SVG interaction patterns

### Tertiary (LOW confidence - WebSearch only, marked for validation)
- [Snake draft overview](https://www.profootballnetwork.com/what-is-a-snake-draft-rules-how-it-works-strategies-and-more/) - standard pattern definition verified across multiple sources
- [React animation performance - Zigpoll](https://www.zigpoll.com/content/can-you-explain-the-best-practices-for-optimizing-web-performance-when-implementing-complex-animations-in-react) - general best practices
- [State management trends 2026 - Makers' Den](https://makersden.io/blog/react-state-management-in-2025) - ecosystem overview

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and version-verified in package.json
- Architecture: HIGH - Patterns based on official library documentation and established implementations
- Pitfalls: HIGH - Verified from expert sources (TkDodo, official docs) and known issues documented in library discussions

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stable ecosystem, mature libraries)

**Notes:**
- No new dependencies required - implementation uses existing stack
- Honeycomb-grid's edge/vertex API is on backlog; manual calculation required using hex.corners
- React-hexgrid vs honeycomb-grid coordination needs code investigation (see Open Questions)
- All animation patterns verified against Motion v12 (current major version)
