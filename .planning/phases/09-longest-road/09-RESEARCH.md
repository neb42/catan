# Phase 9: Longest Road - Research

**Researched:** 2026-01-31
**Domain:** Graph traversal algorithm (DFS) for longest simple path in Catan road network
**Confidence:** HIGH

## Summary

Longest Road calculation in Catan requires finding the longest simple path in an undirected graph where roads are edges and vertices are intersections. The key insight is that this is NOT a standard longest path problem because:

1. **Nodes can be revisited** - A road network forming a loop is valid
2. **Edges cannot be reused** - Each road segment counts once
3. **Opponent settlements block traversal** - They break road continuity
4. **Own settlements do NOT block** - Per official Catan rules

The established algorithm is **DFS with edge-based backtracking**. For each road segment owned by a player, start DFS from both endpoints, track visited edges (not nodes), and find the maximum path length. The graph size in Catan is small (max 72 edges, 54 vertices), so brute-force DFS is efficient enough.

**Primary recommendation:** Implement DFS with edge-tracking backtracking. Recalculate longest road after every road/settlement placement. Block traversal at opponent settlements. Use existing `geometry-utils.ts` edge/vertex helpers.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native TypeScript | - | DFS algorithm implementation | No library needed; algorithm is simple, graph is small |
| Existing hexGeometry | - | Vertex/edge adjacency | Already provides `getAdjacentVertexIds`, edge parsing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | existing | Unit testing complex scenarios | Test loops, forks, blocking, ties |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom DFS | graphology library | Overkill for Catan's small fixed graph; adds unnecessary dependency |
| Full recalculation | Incremental updates | Incremental is bug-prone; full recalc is fast enough for 72 edges |

**Installation:**
```bash
# No new dependencies needed
# Uses existing shared library geometry utilities
```

## Architecture Patterns

### Recommended File Structure
```
libs/shared/src/
  utils/
    longestRoad.ts         # Core algorithm (shared for testing)
    longestRoad.spec.ts    # Comprehensive test suite

apps/api/src/
  game/
    longest-road-logic.ts  # Server-side calculation + award management
```

### Pattern 1: Edge-Based DFS with Backtracking
**What:** Track visited edges (not nodes) during traversal. Backtrack by unmarking edges after recursive call returns.
**When to use:** Finding longest path where edges cannot repeat but nodes can.
**Example:**
```typescript
// Source: UVA 539 programming challenge solution + Catan FAQ
function dfs(
  currentVertex: string,
  visitedEdges: Set<string>,
  playerRoads: Set<string>,
  blockedVertices: Set<string>, // Opponent settlement vertices
): number {
  let maxLength = 0;

  // Get all roads connected to this vertex that belong to player
  const connectedRoads = getPlayerRoadsAtVertex(currentVertex, playerRoads);

  for (const road of connectedRoads) {
    if (visitedEdges.has(road.edgeId)) continue;

    // Get the other endpoint of this road
    const otherVertex = getOtherEndpoint(road.edgeId, currentVertex);

    // Check if blocked by opponent settlement
    if (blockedVertices.has(otherVertex)) continue;

    // Mark edge as visited
    visitedEdges.add(road.edgeId);

    // Recurse and track max length
    const pathLength = 1 + dfs(otherVertex, visitedEdges, playerRoads, blockedVertices);
    maxLength = Math.max(maxLength, pathLength);

    // Backtrack - unmark edge
    visitedEdges.delete(road.edgeId);
  }

  return maxLength;
}
```

### Pattern 2: Calculate from Every Starting Point
**What:** Run DFS from every vertex that has player's roads, take maximum.
**When to use:** Finding the globally longest path, not from a specific start.
**Example:**
```typescript
// Source: Notre Dame CSE challenge + common Catan implementations
function calculateLongestRoad(
  playerRoads: Road[],
  allSettlements: Settlement[],
  playerId: string,
): number {
  const playerRoadSet = new Set(playerRoads.filter(r => r.playerId === playerId).map(r => r.edgeId));

  // Opponent settlements block traversal
  const blockedVertices = new Set(
    allSettlements
      .filter(s => s.playerId !== playerId)
      .map(s => s.vertexId)
  );

  // Get all vertices that have this player's roads
  const startVertices = getVerticesWithPlayerRoads(playerRoadSet);

  let longestPath = 0;
  for (const startVertex of startVertices) {
    const pathLength = dfs(startVertex, new Set(), playerRoadSet, blockedVertices);
    longestPath = Math.max(longestPath, pathLength);
  }

  return longestPath;
}
```

### Pattern 3: Award Management with Tie Handling
**What:** Manage the Longest Road card with proper tie-breaking rules.
**When to use:** After any road or settlement placement.
**Example:**
```typescript
// Source: Official Catan FAQ + game rules
function updateLongestRoadAward(
  gameState: GameState,
  players: Player[],
): { holderId: string | null; newHolderId: string | null; length: number } {
  const currentHolder = gameState.longestRoadHolder;
  const currentLength = currentHolder ? gameState.longestRoadLength : 0;

  // Calculate for all players
  const roadLengths = new Map<string, number>();
  for (const player of players) {
    roadLengths.set(player.id, calculateLongestRoad(gameState.roads, gameState.settlements, player.id));
  }

  // Find max length
  const maxLength = Math.max(...roadLengths.values());

  // Must be at least 5 to qualify
  if (maxLength < 5) {
    return { holderId: null, newHolderId: null, length: 0 };
  }

  // Count how many players have the max length
  const playersWithMax = [...roadLengths.entries()].filter(([_, len]) => len === maxLength);

  // Tie handling: current holder keeps it if they still have max
  if (playersWithMax.length > 1) {
    const currentHolderStillHasMax = playersWithMax.some(([id]) => id === currentHolder);
    if (currentHolderStillHasMax) {
      return { holderId: currentHolder, newHolderId: null, length: maxLength };
    }
    // Multiple players tied, no one has it
    return { holderId: null, newHolderId: null, length: maxLength };
  }

  // Single player has longest
  const winnerId = playersWithMax[0][0];

  // Only award if strictly longer than current holder, or no current holder
  if (!currentHolder || roadLengths.get(winnerId)! > currentLength) {
    return { holderId: winnerId, newHolderId: winnerId !== currentHolder ? winnerId : null, length: maxLength };
  }

  // Current holder retains
  return { holderId: currentHolder, newHolderId: null, length: currentLength };
}
```

### Anti-Patterns to Avoid
- **Tracking visited nodes instead of edges:** Nodes CAN be revisited (loops); edges CANNOT. Tracking nodes breaks loop detection.
- **Using BFS instead of DFS:** BFS doesn't naturally explore all paths to find the longest one.
- **Blocking on own settlements:** Per official Catan rules, own settlements do NOT break road continuity.
- **Transferring on tie:** New player must EXCEED current holder's length, not match it.
- **Forgetting to recalculate after settlement placement:** Opponent settlements can break your road.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Edge adjacency parsing | Custom edge ID parser | Existing `edgeId.split('\|')` pattern | Already established in `geometry-utils.ts` |
| Vertex-to-roads lookup | Custom traversal | `getEdgesAtVertex()` from placement-validator | Tested and correct |
| Vertex adjacency | Custom graph walking | `getAdjacentVertexIds()` from geometry-utils | Already handles coordinate math |

**Key insight:** The existing codebase already has the graph primitives needed. The algorithm is the new part, not the graph representation.

## Common Pitfalls

### Pitfall 1: Tracking Visited Nodes Instead of Edges
**What goes wrong:** Algorithm fails on loops. A loop of 6 roads should count as 6, but tracking visited nodes prevents revisiting the start.
**Why it happens:** Standard DFS tutorials track visited nodes for cycle detection.
**How to avoid:** Use a `Set<string>` of edge IDs, not vertex IDs. Mark before recursing, unmark after.
**Warning signs:** Road loops count as less than expected length.

### Pitfall 2: Forgetting to Recalculate on Settlement Placement
**What goes wrong:** Opponent places settlement breaking your road, but you keep Longest Road award.
**Why it happens:** Only recalculating on road placement, not settlement placement.
**How to avoid:** Call `updateLongestRoadAward()` after both `PLACE_ROAD` and `PLACE_SETTLEMENT` actions.
**Warning signs:** Players keep Longest Road despite having broken chains.

### Pitfall 3: Blocking on Own Settlements
**What goes wrong:** Player's own settlements incorrectly break their road continuity.
**Why it happens:** Misreading the rules or overly simple blocking logic.
**How to avoid:** Only add opponent settlement vertices to `blockedVertices` set.
**Warning signs:** Players with settlements in the middle of their road network get lower road counts.

### Pitfall 4: Incorrect Tie-Breaking
**What goes wrong:** New player with equal-length road takes Longest Road from current holder.
**Why it happens:** Using `>=` instead of `>` for comparison.
**How to avoid:** New player must STRICTLY exceed current length. On tie, current holder retains.
**Warning signs:** Longest Road bouncing between players on equal-length roads.

### Pitfall 5: Not Starting from All Possible Vertices
**What goes wrong:** Algorithm misses the true longest path because it started from wrong endpoint.
**Why it happens:** Only starting DFS from one arbitrary point.
**How to avoid:** Iterate through all vertices that have player's roads and take maximum.
**Warning signs:** Reported road length lower than actual visible chain.

### Pitfall 6: Circular Road Edge Case (Loop at End)
**What goes wrong:** A loop with a "tail" is counted incorrectly. A loop of 6 with 2 roads extending should give max 7 (one direction through loop + tail), not 8.
**Why it happens:** Confusion about whether loops count "both ways".
**How to avoid:** DFS with edge tracking naturally handles this. A road can only be traversed once.
**Warning signs:** Players with loops + extensions get inflated counts.

## Code Examples

### Full DFS Implementation
```typescript
// Source: Derived from official Catan rules + UVA 539 algorithm
interface LongestRoadResult {
  length: number;
  holderPlayerId: string | null;
}

// Get the other vertex of an edge given one vertex
function getOtherEndpoint(edgeId: string, fromVertex: string): string {
  const [v1, v2] = edgeId.split('|');
  return v1 === fromVertex ? v2 : v1;
}

// Get all road edges connected to a vertex for a specific player
function getPlayerRoadsAtVertex(
  vertexId: string,
  playerRoads: Road[],
): Road[] {
  return playerRoads.filter(road => {
    const [v1, v2] = road.edgeId.split('|');
    return v1 === vertexId || v2 === vertexId;
  });
}

// Core DFS with edge-based backtracking
function dfs(
  currentVertex: string,
  visitedEdges: Set<string>,
  playerRoads: Road[],
  blockedVertices: Set<string>,
): number {
  let maxLength = 0;
  const roadsHere = getPlayerRoadsAtVertex(currentVertex, playerRoads);

  for (const road of roadsHere) {
    if (visitedEdges.has(road.edgeId)) continue;

    const nextVertex = getOtherEndpoint(road.edgeId, currentVertex);

    // Skip if blocked by opponent settlement
    if (blockedVertices.has(nextVertex)) continue;

    visitedEdges.add(road.edgeId);
    const length = 1 + dfs(nextVertex, visitedEdges, playerRoads, blockedVertices);
    maxLength = Math.max(maxLength, length);
    visitedEdges.delete(road.edgeId); // Backtrack
  }

  return maxLength;
}

// Calculate longest road for a player
function calculatePlayerLongestRoad(
  allRoads: Road[],
  allSettlements: Settlement[],
  playerId: string,
): number {
  const playerRoads = allRoads.filter(r => r.playerId === playerId);
  if (playerRoads.length === 0) return 0;

  // Opponent settlements block traversal
  const blockedVertices = new Set(
    allSettlements
      .filter(s => s.playerId !== playerId)
      .map(s => s.vertexId)
  );

  // Get all unique vertices in player's road network
  const vertices = new Set<string>();
  for (const road of playerRoads) {
    const [v1, v2] = road.edgeId.split('|');
    vertices.add(v1);
    vertices.add(v2);
  }

  // Try DFS from each vertex
  let longest = 0;
  for (const startVertex of vertices) {
    const length = dfs(startVertex, new Set(), playerRoads, blockedVertices);
    longest = Math.max(longest, length);
  }

  return longest;
}
```

### Award Management
```typescript
// Source: Official Catan FAQ
interface LongestRoadState {
  holderId: string | null;
  length: number;
}

function recalculateLongestRoad(
  roads: Road[],
  settlements: Settlement[],
  players: Player[],
  currentState: LongestRoadState,
): { newState: LongestRoadState; transferred: boolean; fromPlayerId?: string; toPlayerId?: string } {
  // Calculate for all players
  const lengths = new Map<string, number>();
  for (const player of players) {
    lengths.set(player.id, calculatePlayerLongestRoad(roads, settlements, player.id));
  }

  const maxLength = Math.max(...lengths.values(), 0);

  // No one qualifies
  if (maxLength < 5) {
    if (currentState.holderId) {
      return {
        newState: { holderId: null, length: 0 },
        transferred: true,
        fromPlayerId: currentState.holderId,
      };
    }
    return { newState: { holderId: null, length: 0 }, transferred: false };
  }

  // Find all players with max length
  const playersAtMax = [...lengths.entries()]
    .filter(([_, len]) => len === maxLength)
    .map(([id]) => id);

  // Multiple players tied
  if (playersAtMax.length > 1) {
    // Current holder keeps if still at max
    if (currentState.holderId && playersAtMax.includes(currentState.holderId)) {
      return {
        newState: { holderId: currentState.holderId, length: maxLength },
        transferred: false,
      };
    }
    // No one gets it (tie with no current holder at max)
    if (currentState.holderId) {
      return {
        newState: { holderId: null, length: 0 },
        transferred: true,
        fromPlayerId: currentState.holderId,
      };
    }
    return { newState: { holderId: null, length: 0 }, transferred: false };
  }

  // Single player has max
  const winnerId = playersAtMax[0];

  // New player must exceed, not just match
  if (currentState.holderId && currentState.holderId !== winnerId) {
    if (maxLength <= currentState.length) {
      // Current holder retains (winner didn't exceed)
      return { newState: currentState, transferred: false };
    }
  }

  // Award to winner
  if (winnerId !== currentState.holderId) {
    return {
      newState: { holderId: winnerId, length: maxLength },
      transferred: true,
      fromPlayerId: currentState.holderId ?? undefined,
      toPlayerId: winnerId,
    };
  }

  return {
    newState: { holderId: winnerId, length: maxLength },
    transferred: false,
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| BFS for path finding | DFS with backtracking | Always was DFS | DFS naturally explores all paths for longest |
| Node-based visited tracking | Edge-based visited tracking | Standard for Catan | Correctly handles loops |
| Calculate on demand | Recalculate on every placement | Standard | Catches settlement breaks |

**Deprecated/outdated:**
- None - the DFS algorithm for this problem is stable and well-understood.

## Open Questions

1. **Edge ID parsing consistency**
   - What we know: Edge IDs use `|` delimiter, format is `"vertex1|vertex2"` (sorted)
   - What's unclear: Whether we need null checks or edge validation
   - Recommendation: Trust existing edge IDs from `hexGeometry.ts`; they're already validated

2. **Performance with many recalculations**
   - What we know: Max 15 roads per player, 4 players = 60 roads max. DFS is O(V+E) per player.
   - What's unclear: If frequent recalculation causes UI lag
   - Recommendation: Calculate on server only, broadcast result. Should be instant.

## Sources

### Primary (HIGH confidence)
- [Official Catan FAQ](https://www.catan.com/faq/basegame) - Confirms own settlements don't block, tie rules, minimum 5 requirement
- [Catan Fandom Wiki](https://catan.fandom.com/wiki/Longest_Road) - Minimum length, transfer rules
- [Notre Dame CSE Challenge 16](https://www3.nd.edu/~pbui/teaching/cse.34872.su21/challenge16.html) - Algorithm specification, complexity analysis
- Existing codebase `geometry-utils.ts`, `placement-validator.ts` - Graph primitives

### Secondary (MEDIUM confidence)
- [UltraBoardGames Catan FAQ](https://www.ultraboardgames.com/catan/faq.php) - Settlement blocking rules verification
- [Wikipedia Longest Path Problem](https://en.wikipedia.org/wiki/Longest_path_problem) - NP-hardness context, DAG special case
- [GeeksforGeeks DFS](https://www.geeksforgeeks.org/dsa/depth-first-search-or-dfs-for-a-graph/) - DFS implementation reference

### Tertiary (LOW confidence)
- Various WebSearch results - Implementation patterns corroborated with official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No libraries needed; algorithm is well-documented
- Architecture: HIGH - DFS with edge-tracking is the established approach
- Pitfalls: HIGH - Based on official rules, documented bugs in other implementations, and existing PITFALLS.md

**Research date:** 2026-01-31
**Valid until:** Indefinite - Catan rules are stable; algorithm is mathematically sound
