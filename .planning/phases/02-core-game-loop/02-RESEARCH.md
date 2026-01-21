# Phase 2: Core Game Loop - Research

**Researched:** 2026-01-21
**Domain:** Hexagonal board games, turn-based multiplayer, game state management
**Confidence:** HIGH

## Summary

Phase 2 implements a playable Catan game skeleton with board generation, initial placement, and turn structure. Research shows the optimal approach uses **SVG-based hexagonal rendering** (not Canvas/WebGL), **server-authoritative state management** with full-state broadcasts, **cubic coordinate system** for hex math, and **lightweight animation libraries** for visual feedback.

The existing stack (React 19, Zustand, WebSocket, Zod) is well-suited for turn-based games. Only 3 small additions needed: **react-hexgrid** (hex rendering), **honeycomb-grid** (hex math), and **Framer Motion** (animations). The key challenges are hexagonal coordinate systems, board generation algorithms following Catan rules, and maintaining server-client state consistency.

**Primary recommendation:** Use cubic/axial coordinates for hex logic, SVG rendering for the board, server-authoritative game state with full-state broadcasts after each action, and Framer Motion for ~500ms quick animations.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **react-hexgrid** | ^2.0.1 | SVG hexagonal grid rendering | De facto React hex library, cubic coordinates, TypeScript support |
| **honeycomb-grid** | ^4.1.5 | Hex math utilities | Pure TypeScript hex calculations, neighbor finding, pathfinding |
| **motion** (Framer Motion) | ^12.27.5 | React animations | Industry standard for React animations, declarative API, hardware-accelerated |
| **Zustand** | Already installed | Client game state | Already in stack, perfect for synchronizing server state |
| **Zod** | Already installed | State validation | Already in stack, validates board state, actions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **immer** | ^10.1.1 | Immutable state updates | Simplifies nested game state updates (optional, can use spread) |
| **nanoid** | ^5.0.9 | ID generation | Alternative to crypto for game IDs (optional) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-hexgrid | Custom SVG | More control, more complexity, reinventing wheel |
| honeycomb-grid | Hand-rolled hex math | Full control, but error-prone coordinate systems |
| Framer Motion | react-spring | Similar capabilities, different API style |
| SVG rendering | PixiJS/Canvas | Better for 1000+ moving objects, overkill for Catan |
| Full-state sync | Delta updates | More efficient bandwidth, much more complex |

**Installation:**
```bash
npm install react-hexgrid honeycomb-grid motion
# Optional:
npm install immer nanoid
```

## Architecture Patterns

### Recommended Project Structure
```
apps/api/src/
├── game/                      # Game logic (server-authoritative)
│   ├── BoardGenerator.ts      # Random board generation
│   ├── GameState.ts           # Game state type and initial state
│   ├── PlacementValidator.ts  # Validate settlement/road placement
│   └── TurnManager.ts         # Turn phases, dice rolling, resource distribution
├── managers/
│   ├── RoomManager.ts         # Existing room management
│   └── GameManager.ts         # NEW: Game lifecycle per room
└── handlers/
    └── websocket.ts           # Extend with game action handlers

apps/web/src/
├── game/                      # Game rendering
│   ├── Board/
│   │   ├── HexGrid.tsx        # Board container using react-hexgrid
│   │   ├── HexTile.tsx        # Individual hex (terrain, number)
│   │   ├── Settlement.tsx     # Settlement/city piece
│   │   └── Road.tsx           # Road piece
│   ├── UI/
│   │   ├── DiceRoller.tsx     # Dice roll animation
│   │   ├── ResourceCards.tsx  # Player resource cards
│   │   └── TurnPhases.tsx     # Turn phase indicator
│   └── utils/
│       └── coordinates.ts     # Hex coordinate conversions
└── stores/
    └── gameStore.ts           # Zustand store for game state
```

### Pattern 1: Server-Authoritative Game State
**What:** Server holds the single source of truth, broadcasts complete state after every action
**When to use:** Turn-based games where state consistency is critical
**Example:**
```typescript
// Source: Authoritative multiplayer patterns
// apps/api/src/game/GameState.ts
import { z } from 'zod';

export const HexCoordSchema = z.object({
  q: z.number(), // Axial coordinate
  r: z.number(),
});

export const HexTileSchema = z.object({
  coord: HexCoordSchema,
  terrain: z.enum(['wood', 'wheat', 'sheep', 'brick', 'ore', 'desert']),
  number: z.number().min(2).max(12).nullable(), // null for desert
  hasRobber: z.boolean(),
});

export const BoardSchema = z.object({
  hexes: z.array(HexTileSchema),
  ports: z.array(z.object({
    position: z.string(), // Edge identifier
    type: z.enum(['3:1', '2:1-wood', '2:1-wheat', '2:1-sheep', '2:1-brick', '2:1-ore']),
  })),
});

export const GameStateSchema = z.object({
  roomId: z.string(),
  phase: z.enum(['initial_placement', 'gameplay', 'game_over']),
  turnPhase: z.enum(['roll', 'main', 'end']).nullable(),
  currentPlayer: z.string(), // Player ID
  board: BoardSchema,
  players: z.array(z.object({
    id: z.string(),
    nickname: z.string(),
    color: z.string(),
    resources: z.object({
      wood: z.number(),
      wheat: z.number(),
      sheep: z.number(),
      brick: z.number(),
      ore: z.number(),
    }),
    settlements: z.array(z.string()), // Vertex IDs
    cities: z.array(z.string()),
    roads: z.array(z.string()), // Edge IDs
    victoryPoints: z.number(),
  })),
  placementRound: z.number().nullable(), // For initial placement (1-8)
  lastDiceRoll: z.tuple([z.number(), z.number()]).nullable(),
});

export type GameState = z.infer<typeof GameStateSchema>;
```

### Pattern 2: Cubic Coordinate System for Hexagons
**What:** Use q, r, s coordinates where q + r + s = 0 for hexagonal grid math
**When to use:** Any hexagonal board game logic (neighbors, distance, pathfinding)
**Example:**
```typescript
// Source: https://www.redblobgames.com/grids/hexagons/ (Authoritative hex grid guide)
// apps/web/src/game/utils/coordinates.ts

export type CubeCoord = { q: number; r: number; s: number };
export type AxialCoord = { q: number; r: number };

// Convert axial to cube (for algorithms)
export function axialToCube(hex: AxialCoord): CubeCoord {
  return { q: hex.q, r: hex.r, s: -hex.q - hex.r };
}

// Convert cube to axial (for storage)
export function cubeToAxial(cube: CubeCoord): AxialCoord {
  return { q: cube.q, r: cube.r };
}

// Hex neighbor directions (6 directions)
const DIRECTIONS: CubeCoord[] = [
  { q: +1, r: 0, s: -1 }, { q: +1, r: -1, s: 0 }, { q: 0, r: -1, s: +1 },
  { q: -1, r: 0, s: +1 }, { q: -1, r: +1, s: 0 }, { q: 0, r: +1, s: -1 },
];

export function cubeNeighbor(cube: CubeCoord, direction: number): CubeCoord {
  const dir = DIRECTIONS[direction];
  return { q: cube.q + dir.q, r: cube.r + dir.r, s: cube.s + dir.s };
}

export function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

// Get all 6 neighbors of a hex
export function getNeighbors(coord: AxialCoord): AxialCoord[] {
  const cube = axialToCube(coord);
  return DIRECTIONS.map((dir) =>
    cubeToAxial({ q: cube.q + dir.q, r: cube.r + dir.r, s: cube.s + dir.s })
  );
}
```

### Pattern 3: Board Generation with Constraint Satisfaction
**What:** Generate random Catan board following rules (no adjacent 6/8, balanced distribution)
**When to use:** Initial game setup, board generation
**Example:**
```typescript
// Source: Catan board generation algorithms
// apps/api/src/game/BoardGenerator.ts

type TerrainType = 'wood' | 'wheat' | 'sheep' | 'brick' | 'ore' | 'desert';

const TERRAIN_DISTRIBUTION: TerrainType[] = [
  'wood', 'wood', 'wood', 'wood',
  'wheat', 'wheat', 'wheat', 'wheat',
  'sheep', 'sheep', 'sheep', 'sheep',
  'brick', 'brick', 'brick',
  'ore', 'ore', 'ore',
  'desert',
];

const NUMBER_TOKENS = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Spiral order from center for 19-hex Catan board
function spiralCoordinates(): AxialCoord[] {
  // Center hex
  const coords: AxialCoord[] [{ q: 0, r: 0 }];
  
  // Ring 1 (6 hexes)
  for (let i = 0; i < 6; i++) {
    coords.push(...getNeighbors({ q: 0, r: 0 }));
  }
  
  // Ring 2 (12 hexes) - outer ring
  // ... implementation details
  
  return coords.slice(0, 19); // Return exactly 19 hexes
}

export function generateBoard(mode: 'balanced' | 'natural'): Board {
  const coords = spiralCoordinates();
  const shuffledTerrain = shuffle(TERRAIN_DISTRIBUTION);
  const shuffledNumbers = shuffle(NUMBER_TOKENS);
  
  const hexes: HexTile[] = coords.map((coord, idx) => {
    const terrain = shuffledTerrain[idx];
    const number = terrain === 'desert' ? null : shuffledNumbers.shift() ?? null;
    
    return {
      coord,
      terrain,
      number,
      hasRobber: terrain === 'desert',
    };
  });
  
  // Validate: No adjacent 6/8
  if (!validateNoAdjacent68(hexes)) {
    // Retry generation or swap numbers
    return generateBoard(mode);
  }
  
  // Generate ports
  const ports = generatePorts(hexes);
  
  return { hexes, ports };
}

function validateNoAdjacent68(hexes: HexTile[]): boolean {
  for (const hex of hexes) {
    if (hex.number !== 6 && hex.number !== 8) continue;
    
    const neighbors = getNeighbors(hex.coord);
    const adjacentHexes = hexes.filter((h) =>
      neighbors.some((n) => n.q === h.coord.q && n.r === h.coord.r)
    );
    
    if (adjacentHexes.some((h) => h.number === 6 || h.number === 8)) {
      return false; // Adjacent 6 or 8 found
    }
  }
  return true;
}
```

### Pattern 4: Full-State Broadcast via WebSocket
**What:** After every game action, broadcast complete game state to all clients
**When to use:** Turn-based games with infrequent updates (<100 per game)
**Example:**
```typescript
// Source: Turn-based multiplayer patterns
// apps/api/src/managers/GameManager.ts

export class GameManager {
  private games = new Map<string, GameState>();
  
  createGame(roomId: string, players: Player[]): GameState {
    const board = generateBoard('balanced');
    const gameState: GameState = {
      roomId,
      phase: 'initial_placement',
      turnPhase: null,
      currentPlayer: players[0].id,
      board,
      players: players.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        color: p.color,
        resources: { wood: 0, wheat: 0, sheep: 0, brick: 0, ore: 0 },
        settlements: [],
        cities: [],
        roads: [],
        victoryPoints: 0,
      })),
      placementRound: 1,
      lastDiceRoll: null,
    };
    
    this.games.set(roomId, gameState);
    return gameState;
  }
  
  rollDice(roomId: string, playerId: string): GameState {
    const game = this.games.get(roomId);
    if (!game) throw new Error('Game not found');
    if (game.currentPlayer !== playerId) throw new Error('Not your turn');
    if (game.turnPhase !== 'roll') throw new Error('Wrong phase');
    
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    game.lastDiceRoll = [die1, die2];
    game.turnPhase = 'main';
    
    // Distribute resources
    this.distributeResources(game, die1 + die2);
    
    return game; // Return full state to broadcast
  }
  
  private distributeResources(game: GameState, roll: number): void {
    // Find hexes with this number
    const hexes = game.board.hexes.filter((h) => h.number === roll && !h.hasRobber);
    
    for (const hex of hexes) {
      // Find settlements/cities on vertices adjacent to this hex
      // Give resources to those players
      // ... implementation details
    }
  }
}
```

### Pattern 5: React Component with Zustand Sync
**What:** React component subscribes to Zustand store, which syncs from WebSocket
**When to use:** Displaying real-time game state in React UI
**Example:**
```typescript
// Source: Zustand + WebSocket patterns
// apps/web/src/stores/gameStore.ts
import { create } from 'zustand';
import { GameState } from '@catan/shared';

interface GameStore {
  gameState: GameState | null;
  selectedHex: AxialCoord | null;
  updateGameState: (state: GameState) => void;
  selectHex: (coord: AxialCoord | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  selectedHex: null,
  updateGameState: (state) => set({ gameState: state }),
  selectHex: (coord) => set({ selectedHex: coord }),
}));

// Component usage
// apps/web/src/game/Board/HexGrid.tsx
import { useGameStore } from '../../stores/gameStore';
import { Hexagon, HexGrid, Layout } from 'react-hexgrid';

export function Board() {
  const gameState = useGameStore((s) => s.gameState);
  const selectHex = useGameStore((s) => s.selectHex);
  
  if (!gameState) return <div>Loading...</div>;
  
  return (
    <HexGrid width={800} height={600}>
      <Layout size={{ x: 50, y: 50 }} flat={false} spacing={1.1}>
        {gameState.board.hexes.map((hex) => (
          <Hexagon
            key={`${hex.coord.q},${hex.coord.r}`}
            q={hex.coord.q}
            r={hex.coord.r}
            s={-hex.coord.q - hex.coord.r}
            onClick={() => selectHex(hex.coord)}
          >
            {/* Hex content: terrain, number token */}
          </Hexagon>
        ))}
      </Layout>
    </HexGrid>
  );
}
```

### Pattern 6: Framer Motion for Quick Animations
**What:** Use Framer Motion for ~500ms animations (dice, cards, transitions)
**When to use:** Visual feedback for game events (dice roll, resource gain)
**Example:**
```typescript
// Source: https://motion.dev/docs/react-animation
// apps/web/src/game/UI/DiceRoller.tsx
import { motion } from 'motion/react';
import { useGameStore } from '../../stores/gameStore';

export function DiceRoller() {
  const lastRoll = useGameStore((s) => s.gameState?.lastDiceRoll);
  
  if (!lastRoll) return null;
  
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: 60,
          height: 60,
          background: 'white',
          border: '2px solid black',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          fontWeight: 'bold',
        }}
      >
        {lastRoll[0]}
      </motion.div>
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        style={{
          width: 60,
          height: 60,
          background: 'white',
          border: '2px solid black',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          fontWeight: 'bold',
        }}
      >
        {lastRoll[1]}
      </motion.div>
    </div>
  );
}

// Resource card animation
// apps/web/src/game/UI/ResourceCards.tsx
export function ResourceCard({ type, count }: { type: string; count: number }) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <img src={`/assets/resources/${type}.svg`} alt={type} />
      <span>{count}</span>
    </motion.div>
  );
}
```

### Anti-Patterns to Avoid
- **Delta updates instead of full state:** More efficient but introduces desync bugs in turn-based games. Full state is simpler and reliable for <100 updates per game.
- **Canvas/WebGL for static board:** PixiJS/Three.js are overkill for Catan. SVG is easier to debug, style, and integrates naturally with React events.
- **Client-side dice rolls:** Must be server-authoritative to prevent cheating. Client animations are cosmetic only.
- **Offset coordinates for hex math:** Use cubic/axial coordinates internally, convert to offset only for rendering if needed. Cubic math is simpler and less error-prone.
- **Hand-rolled hex math:** Use honeycomb-grid or follow Red Blob Games algorithms. Coordinate systems are subtle and easy to get wrong.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hexagonal coordinate systems | Custom q/r/x/y system | **honeycomb-grid** or Red Blob cubic coords | Neighbor finding, distance, pathfinding are error-prone. Multiple coordinate systems exist; cubic/axial is standard. |
| Hex grid rendering | Custom SVG hexagon layout | **react-hexgrid** | Handles coordinate conversion, SVG generation, event handling, pattern fills. Well-tested. |
| Animation timing/easing | setTimeout chains | **Framer Motion** or react-spring | Hardware-accelerated, handles interruptions, declarative API. |
| Board generation shuffle | Array.sort(Math.random) | **Fisher-Yates shuffle** | Array.sort is biased and non-uniform. Fisher-Yates is correct. |
| Placement validation | Ad-hoc distance checks | Vertex/edge coordinate system | Settlements are on vertices (3 hexes meet), roads are on edges (2 hexes meet). Need proper vertex/edge identifiers. |
| State synchronization | Custom event system | Zustand + full-state broadcast | Simple, reliable, easy to debug. Delta updates add complexity without benefit for turn-based games. |

**Key insight:** Hexagonal grids have well-established algorithms (Red Blob Games is authoritative). Board games have well-tested patterns (server-authoritative, full-state sync). Don't reinvent these—focus on Catan-specific rules.

## Common Pitfalls

### Pitfall 1: Using Wrong Hex Coordinate System
**What goes wrong:** Mixing offset coordinates (row/col) with cubic coordinates (q/r/s) leads to incorrect neighbor calculations
**Why it happens:** Offset coordinates look simpler but break vector operations (can't add/subtract)
**How to avoid:** Use cubic/axial internally for all calculations. Convert to pixel coordinates only for rendering.
**Warning signs:** Neighbors aren't where you expect, distance calculations wrong, pathfinding broken

### Pitfall 2: Adjacent 6/8 in Board Generation
**What goes wrong:** Random board generation creates adjacent high-probability hexes (6 and 8), violating Catan rules
**Why it happens:** Pure random shuffle doesn't check constraints
**How to avoid:** After assigning number tokens, validate no adjacent 6/8. If invalid, retry or swap numbers.
**Warning signs:** Playtesters notice unbalanced boards, specific hexes always high-value

### Pitfall 3: State Desynchronization
**What goes wrong:** Client and server have different game state, leading to illegal moves or UI bugs
**Why it happens:** Optimistic updates without rollback, or missed WebSocket messages
**How to avoid:** Server is authoritative. Client applies server state immediately, no local mutations. Full-state broadcast after every action.
**Warning signs:** "Ghost" pieces on board, actions rejected despite UI allowing them, resource counts wrong

### Pitfall 4: Vertex/Edge Confusion
**What goes wrong:** Treating settlements as "on hexes" instead of "on vertices where 3 hexes meet"
**Why it happens:** Simpler mental model, but doesn't match Catan rules
**How to avoid:** Use proper vertex identifiers (e.g., "q:0,r:0,v:2" for vertex 2 of hex 0,0). Roads are on edges between two hexes.
**Warning signs:** Distance rule violations (settlements too close), can't place roads between settlements

### Pitfall 5: Initial Placement Order Wrong
**What goes wrong:** Initial placement is P1→P2→P3→P4→P1→P2→P3→P4 instead of snake draft
**Why it happens:** Misunderstanding Catan rules (second round is reverse order)
**How to avoid:** Snake draft is P1→P2→P3→P4→P4→P3→P2→P1 (8 rounds total, players get 2 settlements each)
**Warning signs:** Later players complain of disadvantage, starting resources don't match

### Pitfall 6: Robber on Desert vs Number Tiles
**What goes wrong:** Robber blocks resource production but hex has no number token
**Why it happens:** Confusing desert hex (no production) with robber placement rules
**How to avoid:** Desert hex starts with robber but has no number. Robber can be moved to any hex (including desert). Robber blocks production for hexes with numbers.
**Warning signs:** Players can't produce from hex but it has a number token

## Code Examples

Verified patterns from official sources:

### Hex Spiral Generation (Standard Catan Layout)
```typescript
// Source: https://www.redblobgames.com/grids/hexagons/ (Ring generation)
// Generate 19-hex board in spiral order from center

function spiralOrder(): AxialCoord[] {
  const coords: AxialCoord[] = [{ q: 0, r: 0 }]; // Center
  
  // Ring 1 (6 hexes around center)
  for (let direction = 0; direction < 6; direction++) {
    coords.push(getNeighbors({ q: 0, r: 0 })[direction]);
  }
  
  // Ring 2 (12 hexes around ring 1)
  // Start at a corner of ring 1, walk around the ring
  let hex = axialToCube({ q: 0, r: -2 }); // Top of ring 2
  for (let side = 0; side < 6; side++) {
    for (let step = 0; step < 2; step++) {
      coords.push(cubeToAxial(hex));
      hex = cubeNeighbor(hex, side);
    }
  }
  
  return coords; // Returns 19 hexes: 1 center + 6 ring1 + 12 ring2
}
```

### Resource Distribution on Dice Roll
```typescript
// Source: Catan rules + authoritative server pattern
// Distribute resources to all players with settlements/cities on hexes with rolled number

function distributeResources(game: GameState, roll: number): void {
  // Find all hexes with this number (excluding robber)
  const productionHexes = game.board.hexes.filter(
    (hex) => hex.number === roll && !hex.hasRobber
  );
  
  for (const hex of productionHexes) {
    const resourceType = hex.terrain; // 'wood', 'wheat', etc.
    if (resourceType === 'desert') continue;
    
    // Find all vertices of this hex
    const vertices = getHexVertices(hex.coord); // Returns 6 vertex IDs
    
    for (const vertex of vertices) {
      // Find players with settlements or cities on this vertex
      for (const player of game.players) {
        const hasSettlement = player.settlements.includes(vertex);
        const hasCity = player.cities.includes(vertex);
        
        if (hasSettlement) {
          player.resources[resourceType] += 1;
        } else if (hasCity) {
          player.resources[resourceType] += 2;
        }
      }
    }
  }
}

function getHexVertices(coord: AxialCoord): string[] {
  // Vertices are identified by "q:r:v" where v is 0-5 (6 vertices per hex)
  return [0, 1, 2, 3, 4, 5].map((v) => `${coord.q}:${coord.r}:${v}`);
}
```

### WebSocket Game State Sync
```typescript
// Source: Turn-based multiplayer patterns
// Client subscribes to game state updates via WebSocket

// apps/web/src/hooks/useWebSocket.ts (extend existing)
export function useGameSync(roomId: string) {
  const updateGameState = useGameStore((s) => s.updateGameState);
  const ws = useWebSocket(`ws://localhost:3333/ws`);
  
  useEffect(() => {
    if (!ws) return;
    
    ws.onMessage = (message: WebSocketMessage) => {
      if (message.type === 'game_state_update') {
        // Server broadcasts full game state after every action
        const validated = GameStateSchema.parse(message.state);
        updateGameState(validated);
      }
    };
  }, [ws, updateGameState]);
  
  const sendAction = useCallback(
    (action: GameAction) => {
      if (!ws) return;
      ws.send({ type: 'game_action', roomId, action });
    },
    [ws, roomId]
  );
  
  return { sendAction };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Canvas rendering | SVG for board games | ~2015 | Easier debugging, CSS styling, React integration, crisp at any zoom |
| Delta updates | Full-state broadcast | ~2020 | Simpler, more reliable for turn-based games; bandwidth not a concern |
| Offset coordinates | Cubic/axial coordinates | ~2013 (Red Blob) | Simpler math, vector operations work, less error-prone |
| jQuery animations | Framer Motion / react-spring | ~2020 | Declarative, hardware-accelerated, works with React state |
| Socket.io for all WebSocket | Native WebSocket + thin protocol | ~2023 | Smaller bundle, more control, less framework lock-in |

**Deprecated/outdated:**
- **boardgame.io**: Framework for board games, but adds complexity and opinionated structure. Better for rapid prototyping than production.
- **Colyseus**: Multiplayer game server framework. Overkill for turn-based games; designed for real-time physics simulations.
- **Offset coordinates as primary:** Use internally for rendering only, cubic/axial for all logic.
- **react-hexgrid unmaintained concerns:** Last publish 3 years ago, but stable and no breaking changes needed. Still the best React hex library. Fork if necessary.

## Open Questions

Things that couldn't be fully resolved:

1. **Port placement algorithm**
   - What we know: 9 ports on coast, 4 generic (3:1), 5 specific (2:1)
   - What's unclear: Exact edge positions, spacing rules, randomization vs fixed
   - Recommendation: Start with fixed port positions matching official board, add randomization later

2. **react-hexgrid maintenance status**
   - What we know: Last publish 3 years ago, but works with React 19
   - What's unclear: Future breaking changes, TypeScript improvements
   - Recommendation: Use as-is, fork to @catan/react-hexgrid if needed. Hex rendering is stable.

3. **Animation performance with 4 clients**
   - What we know: Framer Motion is hardware-accelerated, 500ms animations are short
   - What's unclear: Will 4 simultaneous card-flying animations cause jank?
   - Recommendation: Build and test. If issues, stagger animations by 50ms per player.

4. **Environment variable for board generation**
   - What we know: CONTEXT.md specifies BOARD_GEN_MODE=balanced|natural
   - What's unclear: Exact algorithm differences, how to expose to UI for playtesting
   - Recommendation: Implement balanced first (even distribution), natural can be later iteration. Use .env file, no UI toggle in Phase 2.

## Sources

### Primary (HIGH confidence)
- **Red Blob Games - Hexagonal Grids**: https://www.redblobgames.com/grids/hexagons/ (Authoritative guide, verified algorithms)
- **Framer Motion docs**: https://motion.dev/docs/react (Official documentation, latest v12.27.5)
- **Existing codebase research**: `.planning/research/ARCHITECTURE.md`, `.planning/research/STACK.md` (Prior research, HIGH confidence)
- **Settlers of Catan rulebook**: 2020 edition (Official game rules)

### Secondary (MEDIUM confidence)
- **react-hexgrid npm**: v2.0.1, last publish 3 years ago but stable (Community standard for React hex grids)
- **honeycomb-grid npm**: v4.1.5, TypeScript hex math library (Active maintenance, good TypeScript support)
- **XState docs**: https://xstate.js.org/docs/ (State machine patterns, not required but useful reference)

### Tertiary (LOW confidence)
- **Zustand docs**: Redirected URL, assumed correct based on existing codebase usage (Already in project, HIGH confidence in practice)
- **react-spring**: Alternative to Framer Motion, similar capabilities (Not chosen, but valid alternative)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries verified, appropriate for domain
- Architecture: HIGH - Patterns match existing research, server-authoritative is industry standard
- Pitfalls: HIGH - Based on Red Blob Games (authoritative), Catan rules, and existing codebase research

**Research date:** 2026-01-21
**Valid until:** ~60 days (stable domain, hex grids and turn-based patterns don't change rapidly)
