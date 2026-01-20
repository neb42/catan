# Stack Research: Online Multiplayer Catan

> **Research Date**: January 2026  
> **Objective**: Identify additional libraries/tools needed for real-time multiplayer Settlers of Catan on existing React/Express/WebSocket stack

---

## Existing Stack (Keep As-Is)

| Category | Package | Version | Status |
|----------|---------|---------|--------|
| **Frontend Framework** | react | ^19.2.3 | ✅ Keep - Latest stable |
| **Build Tool** | vite | ^7.3.1 | ✅ Keep - Latest major |
| **UI Library** | @mantine/core | ^8.3.12 | ✅ Keep - Modern, complete |
| **State Management** | zustand | ^5.0.10 | ✅ Keep - Lightweight, perfect for game state |
| **Data Fetching** | @tanstack/react-query | ^5.90.19 | ✅ Keep - For REST API calls |
| **Routing** | @tanstack/react-router | ^1.153.1 | ✅ Keep - Type-safe routing |
| **Validation** | zod | ^4.3.5 | ✅ Keep - Schema validation |
| **Backend** | express | ^4.21.2 | ✅ Keep - Stable, mature |
| **WebSocket** | ws | ^8.19.0 | ✅ Keep - Native, lightweight |
| **TypeScript** | typescript | ^5.9.3 | ✅ Keep - Latest |

---

## Recommended Additions

### Game Board Rendering

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| **react-hexgrid** | ^2.0.1 | SVG-based hexagonal grid rendering | 🟢 HIGH |
| **honeycomb-grid** | ^4.1.5 | Hex math: coordinates, neighbors, pathfinding | 🟢 HIGH |

#### Rationale

**react-hexgrid** (Recommended):
- SVG-based → perfect for board games (crisp at any size, easy CSS styling)
- Built-in cubic coordinate system (q, r, s) matching Catan's hex layout
- TypeScript support, React Context API integration
- Lightweight (~96KB unpacked)
- Includes Pattern fills (for terrain textures), Path drawing, Text overlay
- Last publish: 3 years ago, but stable and no breaking changes needed

**honeycomb-grid** (Recommended Companion):
- Pure TypeScript hex math library
- Grid generation, neighbor finding, ring/spiral traversals
- A* pathfinding (useful for longest road calculation)
- Complements react-hexgrid for game logic calculations

**Why NOT PixiJS/Canvas**:
- PixiJS (v8.15.0) is powerful but overkill for static board game
- WebGL/WebGPU adds complexity without benefit for Catan's needs
- SVG is simpler to style, debug, and integrates naturally with React DOM events

---

### Game State & Logic

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| **immer** | ^11.1.3 | Immutable state updates with mutable syntax | 🟢 HIGH |
| **nanoid** | ^5.1.6 | Compact unique IDs for entities | 🟢 HIGH |

#### Rationale

**immer**:
- Already used internally by Zustand (middleware available)
- Makes complex nested game state updates readable
- "Breakthrough of the year" React award winner
- Essential for undo/redo, time-travel debugging
- Example: Updating a player's resources without mutation bugs

**nanoid**:
- 118 bytes minified (smallest ID generator)
- URL-safe IDs (`A-Za-z0-9_-`), 21 chars vs UUID's 36
- Perfect for: game room IDs, player session tokens, entity IDs
- Secure (uses crypto API)

**Why NOT uuid**:
- uuid v13 is 66KB vs nanoid's 12KB
- UUID format unnecessary for internal game entities
- uuid@12+ dropped CommonJS support (potential bundling issues)

---

### Real-time Sync Enhancements

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| **Custom (no addition)** | — | Keep native ws, build thin protocol | 🟢 HIGH |

#### Rationale

**Keep `ws` (native WebSocket)** - Do NOT add Socket.io or Colyseus:

1. **Current `ws` package is sufficient**:
   - Already installed (^8.19.0)
   - Catan is turn-based, not real-time physics
   - State sync happens on discrete events (roll, build, trade)
   - ~50-100 messages per game session, not thousands

2. **Build custom thin protocol**:
   ```typescript
   // Shared message types (apps/shared/types/messages.ts)
   type GameMessage = 
     | { type: 'ROOM_JOIN'; roomId: string; playerId: string }
     | { type: 'GAME_ACTION'; action: GameAction }
     | { type: 'STATE_SYNC'; state: GameState }
   ```

3. **Room management pattern**:
   - Express serves REST for room CRUD, auth
   - WebSocket handles real-time game actions
   - Zustand on client syncs from WebSocket messages

**Why NOT Socket.io** (v4.8.3):
- Adds 1.4MB unpacked size
- Auto-reconnection, namespaces, rooms are features you'll manually implement anyway for game logic control
- Long-polling fallback unnecessary for modern browsers
- Protocol overhead (packet type, namespace, ack id metadata)

**Why NOT Colyseus** (v0.16.5):
- Full multiplayer framework with its own server, state sync, matchmaking
- Would require architectural changes to existing Express setup
- Learning curve for schema-based state sync
- Overkill for 3-4 player turn-based game
- Better suited for action games with authoritative physics

**Why NOT boardgame.io** (v0.50.2):
- Last publish: 3 years ago (maintenance concerns)
- Opinionated framework - conflicts with existing Zustand/Express patterns
- Built-in lobby/AI/phases are nice but lock you into its architecture
- Designed for framework-first approach, not brownfield integration

---

### Shared Types Library

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| **Create `libs/shared`** | — | Shared TypeScript types, Zod schemas, game constants | 🟢 HIGH |

#### Rationale

Create an NX library for code shared between web and api:

```
libs/
  shared/
    src/
      types/           # GameState, Player, Hex, Resource, etc.
      schemas/         # Zod schemas for validation
      constants/       # Game rules (VICTORY_POINTS_TO_WIN, etc.)
      utils/           # Pure functions (dice roll, resource calc)
```

This keeps frontend/backend in sync and enables Zod validation on both ends.

---

### Development & Testing

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| **@faker-js/faker** | ^9.x | Generate test game states | 🟡 MEDIUM |

#### Rationale

**@faker-js/faker** (Optional):
- Useful for generating random player names, test scenarios
- Not critical - can use simple hardcoded test data initially

---

## Not Recommended

| Package | Reason to Avoid |
|---------|-----------------|
| **boardgame.io** | 3 years stale; opinionated framework conflicts with existing architecture; designed for greenfield projects |
| **colyseus** | Full framework requiring server replacement; overkill for turn-based 3-4 player game |
| **socket.io** | 1.4MB overhead; features you don't need; protocol incompatible with raw WebSocket clients |
| **pixi.js / @pixi/react** | WebGL overkill for static board; adds 65MB unpacked; complexity without benefit |
| **phaser** | Full game engine; wrong tool for React-based board game |
| **konva / react-konva** | Canvas-based; SVG is better for board game aesthetics and CSS styling |
| **three.js / react-three-fiber** | 3D engine; 2D hexgrid is simpler and sufficient |
| **rambda / lodash** | Native ES2025 methods sufficient; avoid bundle bloat |

---

## Key Rationale

### Why This Stack Works for Catan

1. **SVG over Canvas/WebGL**:
   - Catan board is static geometry with occasional updates
   - SVG integrates with React's event system naturally
   - CSS styling for hover states, selection highlights
   - Crisp rendering at any zoom level
   - Easier debugging (inspect elements in DevTools)

2. **Thin WebSocket Protocol over Frameworks**:
   - Turn-based games have simple sync requirements
   - You control reconnection, room lifecycle, message queuing
   - No framework lock-in
   - Smaller bundle size
   - Zod schemas validate messages on both ends

3. **Zustand + Immer for Game State**:
   - Single source of truth on client
   - Server is authoritative; client subscribes to state pushes
   - Immer makes nested updates (player.resources.wheat++) safe
   - Built-in devtools for state inspection

4. **Shared Library Pattern**:
   - TypeScript types used in both web and api
   - Zod schemas validate at network boundaries
   - Game logic can be unit tested in isolation
   - NX handles build dependencies automatically

---

## Version Summary

```bash
# Already installed - no changes
react@^19.2.3
zustand@^5.0.10
zod@^4.3.5
ws@^8.19.0
express@^4.21.2
@mantine/core@^8.3.12

# Add these
npm install react-hexgrid@^2.0.1       # Hex grid rendering
npm install honeycomb-grid@^4.1.5      # Hex math utilities  
npm install immer@^11.1.3              # Immutable updates
npm install nanoid@^5.1.6              # Compact unique IDs
```

---

## Confidence Legend

- 🟢 **HIGH**: Well-tested, actively maintained, clear fit for use case
- 🟡 **MEDIUM**: Good option but alternatives exist or optional
- 🔴 **LOW**: Experimental or uncertain fit

---

## Sources Consulted

| Source | Date Verified |
|--------|---------------|
| npmjs.com/package/react-hexgrid | Jan 2026 |
| npmjs.com/package/honeycomb-grid | Jan 2026 |
| npmjs.com/package/immer | Jan 2026 |
| npmjs.com/package/nanoid | Jan 2026 |
| npmjs.com/package/boardgame.io | Jan 2026 |
| npmjs.com/package/colyseus | Jan 2026 |
| npmjs.com/package/socket.io | Jan 2026 |
| npmjs.com/package/pixi.js | Jan 2026 |
| boardgame.io/documentation | Jan 2026 |
| redblobgames.com/grids/hexagons | Reference |
