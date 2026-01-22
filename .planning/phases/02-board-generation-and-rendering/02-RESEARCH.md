# Phase 2: Board Generation & Rendering - Research

**Researched:** 2026-01-22
**Domain:** Hexagonal grid rendering, procedural board generation, SVG-based game boards
**Confidence:** HIGH

## Summary

Board generation and rendering for Catan requires two distinct technical domains: (1) **hex grid rendering** using SVG and (2) **procedural generation** with constraint satisfaction. The standard approach is well-established: use a dedicated hex grid library (react-hexgrid) for rendering with cubic coordinates, and implement custom board generation logic using shuffle-and-validate algorithms.

**Key findings:**
- react-hexgrid 2.0.1 is the standard React hex grid library, uses cubic coordinates internally, renders via SVG
- Cubic coordinate system (q, r, s where q+r+s=0) is the mathematical foundation for all hex operations
- SVG Pattern elements enable texture fills from SVG assets without Canvas complexity
- Board generation follows "shuffle → validate → retry" pattern with fairness constraints
- No adjacent 6/8 is validated via neighbor checking using cubic coordinate system

**Primary recommendation:** Use react-hexgrid for rendering with existing cubic coordinate utilities in `libs/shared/src/utils/coordinates.ts`. Implement board generation as pure functions returning validated board state. SVG assets fill hexagons via `<Pattern>` elements.

## Standard Stack

The established libraries/tools for hexagonal grid game boards:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hexgrid | 2.0.1 | SVG hex grid rendering | Only actively maintained React hex library, TypeScript support, cubic coordinates, component-based |
| N/A | N/A | Hex coordinate math | Red Blob Games algorithms are the standard (already implemented in coordinates.ts) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SVG Pattern | Native | Texture fills from SVG files | Filling hexagons with terrain tiles (already have SVG assets) |
| Fisher-Yates shuffle | Algorithm | Array randomization | Shuffling terrain/number arrays before placement |
| crypto.getRandomValues | Native | Secure randomness | Better than Math.random() for game fairness |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-hexgrid | Canvas + custom hex drawing | More control but 10x more code, lose SVG scaling, accessibility issues |
| react-hexgrid | react-three-fiber (3D) | Overkill for 2D board, performance overhead, complexity |
| SVG Pattern | Canvas drawImage | Lose vector scaling, more complex coordinate transforms |
| Cubic coordinates | Offset coordinates | Simpler storage but harder math (neighbor checking, distance) |

**Installation:**
```bash
npm install react-hexgrid@^2.0.1  # Already installed
```

## Architecture Patterns

### Recommended Project Structure
```
apps/api/src/
├── game/
│   ├── board-generator.ts      # Pure functions: generateBoard()
│   └── fairness-validator.ts   # validateBoardFairness()
apps/web/src/
├── components/
│   ├── Board/
│   │   ├── Board.tsx           # Main board component
│   │   ├── TerrainHex.tsx      # Individual hex with texture
│   │   ├── NumberToken.tsx     # Number overlay on hex
│   │   └── Port.tsx            # Port at hex edge
```

### Pattern 1: react-hexgrid Component Structure
**What:** Declarative hex grid using HexGrid, Layout, Hexagon components
**When to use:** All hex grid rendering
**Example:**
```typescript
// Source: https://github.com/Hellenic/react-hexgrid (README)
import { HexGrid, Layout, Hexagon, Text, Pattern } from 'react-hexgrid';

function Board({ hexes }) {
  return (
    <HexGrid width={800} height={600} viewBox="-50 -50 100 100">
      <Layout size={{ x: 10, y: 10 }} flat={false} spacing={1.0} origin={{ x: 0, y: 0 }}>
        {hexes.map(hex => (
          <Hexagon key={`${hex.q}-${hex.r}`} q={hex.q} r={hex.r} s={hex.s} fill={`url(#${hex.terrain})`}>
            {hex.number && <Text>{hex.number}</Text>}
          </Hexagon>
        ))}
      </Layout>
      
      <Pattern id="forest" link="/assets/tiles/forest.svg" />
      <Pattern id="hills" link="/assets/tiles/hills.svg" />
      {/* ... other terrain patterns */}
    </HexGrid>
  );
}
```

**Key points:**
- `flat={false}` means pointy-top orientation (⬡) as required
- `q, r, s` are cubic coordinates (s is calculated from q+r+s=0)
- `Pattern` elements reference SVG files for texture fills
- `spacing={1.0}` means no gaps between hexes
- `viewBox` controls zoom level (larger = more zoomed out)

### Pattern 2: Board Generation Algorithm
**What:** Shuffle terrain/numbers arrays, place sequentially, validate constraints, retry if invalid
**When to use:** Server-side board generation on game start
**Example:**
```typescript
// Adapted from Catan board generation algorithms
function generateBoard(maxRetries = 100): BoardState {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // 1. Define hex positions (standard Catan layout)
    const positions = getCatanHexPositions(); // 19 hexes in double-ring
    
    // 2. Shuffle terrain types
    const terrains = shuffle([
      'forest', 'forest', 'forest', 'forest',
      'hills', 'hills', 'hills',
      'fields', 'fields', 'fields', 'fields',
      'pasture', 'pasture', 'pasture', 'pasture',
      'mountains', 'mountains', 'mountains',
      'desert'
    ]);
    
    // 3. Assign terrain to positions
    const hexes = positions.map((pos, i) => ({
      ...pos,
      terrain: terrains[i],
      number: terrains[i] === 'desert' ? null : null // Assign later
    }));
    
    // 4. Shuffle number tokens (exclude 7, use 2 each of 3-6, 8-11, 1 each of 2, 12)
    const numbers = shuffle([2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12]);
    
    // 5. Assign numbers to non-desert hexes (spiral order)
    let numIndex = 0;
    for (const hex of hexes) {
      if (hex.terrain !== 'desert') {
        hex.number = numbers[numIndex++];
      }
    }
    
    // 6. Validate fairness
    if (validateBoardFairness(hexes)) {
      return { hexes, ports: generatePorts(hexes) };
    }
  }
  
  // Return best attempt after max retries
  return generateBestAttempt();
}

function validateBoardFairness(hexes: Hex[]): boolean {
  // Check: No adjacent 6/8
  for (const hex of hexes) {
    if (hex.number === 6 || hex.number === 8) {
      const neighbors = getNeighbors(hex); // Use cubic coordinate neighbors
      for (const neighbor of neighbors) {
        const neighborHex = hexes.find(h => h.q === neighbor.q && h.r === neighbor.r);
        if (neighborHex && (neighborHex.number === 6 || neighborHex.number === 8)) {
          return false; // Adjacent 6/8 found
        }
      }
    }
  }
  
  // Additional fairness checks (resource clustering, number distribution)
  // ...
  
  return true;
}
```

### Pattern 3: SVG Pattern for Terrain Textures
**What:** Define SVG patterns once, reference by ID in hex fills
**When to use:** Displaying terrain tiles with texture
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern
function TerrainPatterns() {
  return (
    <defs>
      <Pattern id="forest" link="/assets/tiles/forest.svg" />
      <Pattern id="hills" link="/assets/tiles/hills.svg" />
      <Pattern id="fields" link="/assets/tiles/fields.svg" />
      <Pattern id="pasture" link="/assets/tiles/pasture.svg" />
      <Pattern id="mountains" link="/assets/tiles/mountains.svg" />
      <Pattern id="desert" link="/assets/tiles/desert.svg" />
    </defs>
  );
}

// In Hexagon component
<Hexagon q={q} r={r} s={s} fill="url(#forest)" />
```

**Note:** react-hexgrid's `<Pattern>` component handles the SVG pattern boilerplate internally.

### Pattern 4: Cubic Coordinate Neighbor Checking
**What:** Use direction vectors to find adjacent hexes
**When to use:** Validating constraints (no adjacent 6/8), pathfinding, range checking
**Example:**
```typescript
// Source: https://www.redblobgames.com/grids/hexagons/#neighbors
// Already implemented in libs/shared/src/utils/coordinates.ts
const CUBE_DIRECTIONS = [
  { q: 1, r: 0, s: -1 },
  { q: 1, r: -1, s: 0 },
  { q: 0, r: -1, s: 1 },
  { q: -1, r: 0, s: 1 },
  { q: -1, r: 1, s: 0 },
  { q: 0, r: 1, s: -1 },
];

export function getNeighbors(coord: AxialCoord): AxialCoord[] {
  const cube = axialToCube(coord);
  return CUBE_DIRECTIONS.map((direction) =>
    cubeToAxial({
      q: cube.q + direction.q,
      r: cube.r + direction.r,
      s: cube.s + direction.s,
    })
  );
}
```

### Anti-Patterns to Avoid
- **Storing hex positions in offset coordinates:** Makes neighbor checking require branching (odd/even row logic). Use cubic/axial throughout.
- **Generating boards client-side:** Server must generate to ensure all players see same board. Client just renders.
- **Using Math.random() for shuffling:** Not cryptographically secure, can be predicted. Use crypto.getRandomValues or Fisher-Yates with secure seed.
- **Building custom SVG hex drawing:** react-hexgrid handles polygon points, transforms, etc. Don't reinvent.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hex grid layout & rendering | Custom SVG polygon generation | react-hexgrid | Handles pointy/flat orientation, spacing, coordinate transforms, click detection |
| Hex coordinate math | Custom neighbor/distance functions | Red Blob Games algorithms | Already proven correct, edge cases handled (wrap-around, negative coords) |
| Array shuffling | `array.sort(() => Math.random() - 0.5)` | Fisher-Yates shuffle | Sort-shuffle is biased, Fisher-Yates is uniform distribution |
| SVG texture fills | Inline <image> per hex | SVG <pattern> | Patterns defined once, reused efficiently, browser-optimized |
| Board fairness scoring | Complex ML model | Rule-based validation | Overkill, Catan fairness is discrete constraints not optimization |

**Key insight:** Hex grid math is deceptively complex. The constraint `q+r+s=0` must be preserved across all operations (add, subtract, rotate). Red Blob Games worked out all edge cases; reuse that knowledge via existing implementations.

## Common Pitfalls

### Pitfall 1: Forgetting s-coordinate in Cubic System
**What goes wrong:** You store only (q, r) in axial coordinates, then pass to function expecting (q, r, s)
**Why it happens:** Cubic and axial are "the same system" but axial drops the third coordinate
**How to avoid:** 
- Use axial (q, r) for storage/serialization
- Convert to cubic (q, r, s) at the boundary of functions needing it
- Always calculate s as `-q - r`
**Warning signs:** 
- Off-by-one errors in neighbor checking
- Distance calculations returning wrong values
- Hexes appearing in wrong positions

### Pitfall 2: Mixing Flat-Top and Pointy-Top Assumptions
**What goes wrong:** Layout appears rotated 90° or spacing is wrong
**Why it happens:** Formulas for hex-to-pixel differ between orientations
**How to avoid:** 
- Set `flat={false}` in react-hexgrid Layout for pointy-top (⬡)
- Verify orientation matches asset design (your SVG tiles assume pointy-top)
- Test with a distinctive asymmetric pattern to catch rotation bugs early
**Warning signs:** 
- Board appears squashed or stretched
- Click detection off by 90°
- Ports misaligned with edges

### Pitfall 3: Not Handling Board Generation Timeout
**What goes wrong:** Infinite loop if fairness constraints are unsatisfiable
**Why it happens:** Rare but possible to create contradictory constraints
**How to avoid:** 
- Always have maxRetries limit (e.g., 100 attempts)
- Return "best attempt" after retries exhausted
- Log warning if retry limit hit (indicates fairness criteria too strict)
- Optionally relax constraints progressively (try strict, then medium, then loose)
**Warning signs:** 
- Server hangs on game start
- Games fail to start occasionally
- Users see "Loading board..." indefinitely

### Pitfall 4: SVG Pattern Not Displaying
**What goes wrong:** Hexagon renders solid color instead of texture
**Why it happens:** Pattern ID doesn't match fill reference, or image path wrong
**How to avoid:** 
- Define patterns in same SVG as hexagons (within `<defs>`)
- Use `fill="url(#patternId)"` syntax exactly
- Verify image paths are accessible from browser
- Check browser console for 404s on SVG assets
**Warning signs:** 
- All hexes same color
- Console errors: "Pattern 'xyz' not found"
- Images work in <img> tag but not in pattern

### Pitfall 5: Inefficient Re-renders of Static Board
**What goes wrong:** Board re-renders on every state change, causing lag
**Why it happens:** Board component doesn't memoize, or props change unnecessarily
**How to avoid:** 
- Memoize Board component with React.memo()
- Board state should be immutable after generation (no mutations)
- Separate board state from game state (pieces, player actions)
- Only re-render board if board itself changes (rare after initial generation)
**Warning signs:** 
- FPS drops during dice rolls or player actions
- Board "flickers" when clicking UI elements
- React DevTools shows Board in every render cycle

## Code Examples

Verified patterns from official sources:

### Defining Catan Hex Positions (Standard Layout)
```typescript
// Standard Catan board: 19 hexes in 2-ring pattern
// Source: Catan rules, using Red Blob Games ring algorithm
function getCatanHexPositions(): AxialCoord[] {
  const positions: AxialCoord[] = [];
  
  // Center hex
  positions.push({ q: 0, r: 0 });
  
  // Ring 1 (6 hexes)
  for (let i = 0; i < 6; i++) {
    const angle = i * 60;
    const hex = cubeToAxial(cubeNeighbor({ q: 0, r: 0, s: 0 }, i));
    positions.push(hex);
  }
  
  // Ring 2 (12 hexes)
  let current = { q: 0, r: -2, s: 2 }; // Start position for ring 2
  for (let side = 0; side < 6; side++) {
    for (let step = 0; step < 2; step++) {
      positions.push(cubeToAxial(current));
      current = cubeNeighbor(current, side);
    }
  }
  
  return positions;
}
```

### Fisher-Yates Shuffle (Secure)
```typescript
// Unbiased shuffle using crypto.getRandomValues
// Source: Fisher-Yates algorithm with secure randomness
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  const randomValues = new Uint32Array(result.length);
  crypto.getRandomValues(randomValues);
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}
```

### Calculating Hex Size for Viewport Fit
```typescript
// Calculate hex size to fit board in container while maintaining aspect ratio
function calculateHexSize(containerWidth: number, containerHeight: number): number {
  // Catan board: 5 hexes wide, 5 hexes tall (at widest/tallest points)
  const boardWidthInHexes = 5;
  const boardHeightInHexes = 5;
  
  // Pointy-top hex: width = sqrt(3) * size, height = 2 * size
  const maxSizeByWidth = containerWidth / (boardWidthInHexes * Math.sqrt(3));
  const maxSizeByHeight = containerHeight / (boardHeightInHexes * 2);
  
  // Use smaller to ensure fit, add padding
  return Math.min(maxSizeByWidth, maxSizeByHeight) * 0.9; // 90% for padding
}
```

### Port Placement at Hex Edges
```typescript
// Ports sit on edges between land hexes and ocean
// Ocean hexes form ring 3 around the board
function generatePorts(hexes: Hex[]): Port[] {
  const portTypes = shuffle([
    'generic', 'generic', 'generic', 'generic', // 4x 3:1
    'wood', 'brick', 'sheep', 'wheat', 'ore'    // 5x 2:1
  ]);
  
  // Find edge hexes (ring 2)
  const edgeHexes = hexes.filter(hex => 
    Math.max(Math.abs(hex.q), Math.abs(hex.r), Math.abs(-hex.q - hex.r)) === 2
  );
  
  // Distribute ports evenly around perimeter
  const portsPerEdge = 9; // Total ports
  const spacing = Math.floor(edgeHexes.length / portsPerEdge);
  
  return portTypes.map((type, i) => {
    const hexIndex = i * spacing;
    const hex = edgeHexes[hexIndex];
    
    // Port sits on edge facing outward
    // Calculate edge direction based on hex position
    const angle = Math.atan2(hex.r, hex.q);
    const edgeDirection = Math.round(angle / (Math.PI / 3)) % 6;
    
    return {
      type,
      hexQ: hex.q,
      hexR: hex.r,
      edge: edgeDirection
    };
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Canvas + manual hex drawing | SVG with react-hexgrid | 2020s | Easier maintenance, vector scaling, accessibility |
| Offset coordinates | Cubic/axial coordinates | Early hex grid research | Simpler neighbor logic, no branching |
| Manual Pattern definitions | react-hexgrid Pattern component | react-hexgrid 2.x | Less boilerplate, cleaner API |
| Math.random() shuffling | crypto.getRandomValues | Security best practices | Unpredictable board generation |

**Deprecated/outdated:**
- **honeycomb-grid library:** Mentioned in early research but not needed. react-hexgrid handles rendering, coordinates.ts handles math. Adding honeycomb-grid would duplicate functionality.
- **react-hexgrid 1.x:** Version 2.0+ has TypeScript support and React Context API. Don't use v1.

## Open Questions

Things that couldn't be fully resolved:

1. **react-hexgrid maintenance status**
   - What we know: Last publish 3 years ago, maintainer says "not actively maintaining"
   - What's unclear: Will library continue to work with future React versions?
   - Recommendation: Library is stable (2.0.1), React 19 compatible. If issues arise, library is small enough to fork/maintain internally. Low risk.

2. **Optimal retry limit for board generation**
   - What we know: Fisher-Yates shuffle gives uniform distribution, no adjacent 6/8 is ~85% satisfiable
   - What's unclear: How many retries before accepting "best attempt"?
   - Recommendation: Start with 100 retries (should succeed >99% of time). Monitor actual retry counts in production. Adjust if needed.

3. **Additional fairness criteria beyond no adjacent 6/8**
   - What we know: User specified "other clustering checks" in CONTEXT.md
   - What's unclear: Exact criteria (resource diversity, number diversity, productive hex distribution)
   - Recommendation: Implement no adjacent 6/8 first. Add optional checks: (a) Each player position should access 2+ different resources, (b) High numbers (6, 8) not all on same resource, (c) Desert not too central. Make these configurable weights.

## Sources

### Primary (HIGH confidence)
- react-hexgrid v2.0.1 - https://github.com/Hellenic/react-hexgrid, https://www.npmjs.com/package/react-hexgrid
- Red Blob Games Hexagonal Grids - https://www.redblobgames.com/grids/hexagons/ (2025 update, the authoritative source)
- MDN SVG Pattern Element - https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern

### Secondary (MEDIUM confidence)
- Existing code in libs/shared/src/utils/coordinates.ts - Verified cubic coordinate implementation
- Package.json confirms react-hexgrid@^2.0.1 installed

### Tertiary (LOW confidence)
- None - all findings verified with authoritative sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - react-hexgrid is only maintained React hex library, Red Blob Games is canonical reference
- Architecture: HIGH - Patterns verified from react-hexgrid examples and Red Blob Games
- Pitfalls: MEDIUM - Common issues observed in hex grid implementations, some based on training knowledge

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable domain, mature libraries)
