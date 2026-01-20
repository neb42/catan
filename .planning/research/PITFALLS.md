# Pitfalls Research: Online Multiplayer Catan

> Common mistakes and critical gotchas when building real-time multiplayer board games, specifically Catan

---

## Critical Pitfalls

### 1. State Desynchronization (The Silent Killer)
**What goes wrong:**
Clients show different game states despite WebSocket updates. Player 1 sees a settlement that Player 2 doesn't see. Game becomes unplayable but no error messages appear.

**Warning signs:**
- "It works on my machine" during testing
- Players report actions not appearing for others
- Intermittent "invalid move" errors that don't make sense
- Reconnecting players see different state than active players

**Prevention:**
1. **Server is source of truth** — Never trust client state for validation
2. **Full state broadcasts** — Send complete game state after every action (not deltas)
3. **State versioning** — Include a `stateVersion` number, reject stale client actions
4. **Reconciliation on connect** — Always send full state when player connects/reconnects
5. **Atomic updates** — Use Immer to ensure state mutations are atomic

```typescript
// ❌ BAD: Delta updates
socket.emit('RESOURCE_UPDATE', { playerId: 'p1', wood: +1 })

// ✅ GOOD: Full state broadcast
socket.emit('STATE_UPDATE', { ...fullGameState, stateVersion: 42 })
```

**Phase relevance:** Phase 1-2 (WebSocket infrastructure, state sync)

---

### 2. Race Conditions in Turn Order
**What goes wrong:**
Two players click "End Turn" simultaneously, or player makes action just as their turn ends. Server processes messages out of order, causing invalid state transitions.

**Warning signs:**
- "Not your turn" errors appearing randomly
- Turn counter skipping players or going backwards
- Actions from previous turn applying to next turn

**Prevention:**
1. **Server-side turn queue** — Only process actions from current turn player
2. **Client-side disabling** — Disable all actions when not your turn (UX layer only)
3. **Turn lock** — Mutex/semaphore around turn transitions
4. **Action timestamps** — Reject actions with stale turn IDs

```typescript
// Server validates turn ownership
if (gameState.currentTurn !== action.playerId) {
  return { error: 'NOT_YOUR_TURN' }
}

// Include turn ID in actions
type GameAction = {
  type: 'BUILD_ROAD'
  turnId: number  // Must match gameState.turnNumber
  ...
}
```

**Phase relevance:** Phase 2 (Turn structure), every phase that adds actions

---

### 3. Longest Road Miscalculation
**What goes wrong:**
Longest road calculation gives wrong answer, especially with:
- Branching paths (choose longest branch)
- Opponent's settlement breaking your road
- Ties (original owner keeps it)

This is the most commonly broken rule in Catan implementations.

**Warning signs:**
- Players complain "I should have longest road"
- Longest road awarded to wrong player
- Longest road not transferring when someone surpasses
- Crashes when calculating complex road networks

**Prevention:**
1. **DFS with backtracking** — Don't use BFS, it doesn't handle branching
2. **Treat opponent settlements as blockers** — Can't traverse through them
3. **Recalculate on every road placement AND settlement placement** — Settlements break roads
4. **Tie handling** — If new player equals longest road length, original keeper retains it
5. **Test with complex scenarios** — Unit test branching, blocking, ties

```typescript
// Correct algorithm
function calculateLongestRoad(board: Board, playerId: string): number {
  // For each road segment owned by player
  //   DFS from that segment in both directions
  //   Track visited edges to avoid cycles
  //   Blocked by: board edge, opponent settlement, already visited
  //   Return max length found
}

// ❌ Common mistake: Not blocking on opponent settlements
// ❌ Common mistake: Using BFS instead of DFS (misses branching)
```

**Phase relevance:** Phase 5 (Longest Road implementation)

---

### 4. Resource Duplication on Disconnect/Reconnect
**What goes wrong:**
Player disconnects during resource distribution (dice roll). On reconnect, they get resources again. Or worse, they lose resources that were distributed.

**Warning signs:**
- Player resource counts don't match across clients
- Reconnecting players have wrong resource totals
- "Free" resources appearing from nowhere

**Prevention:**
1. **Event sourcing** — Log every resource change as an event, never duplicate
2. **Idempotent handlers** — Each event has unique ID, process once only
3. **Reconciliation check** — On reconnect, server sends definitive resource counts
4. **No client-side resource arithmetic** — Client displays server's count only

```typescript
// ❌ BAD: Client calculates resources
gameState.resources.wood += diceRoll.wood

// ✅ GOOD: Server sends new total
socket.emit('STATE_UPDATE', {
  resources: { wood: 5, brick: 2, ... }  // Absolute counts
})
```

**Phase relevance:** Phase 4 (Resource system), Phase 6 (Reconnection)

---

### 5. Robber Placement on Ocean/Invalid Hexes
**What goes wrong:**
Player drags robber to ocean hex, port hex, or non-existent coordinate. Game crashes or robber disappears.

**Warning signs:**
- Robber vanishes from board
- "Invalid hex coordinate" errors
- Robber appears on water

**Prevention:**
1. **Constrain interaction targets** — Only land hexes clickable for robber placement
2. **Validation in multiple layers** — Client disables invalid hexes, server validates hex is land
3. **Coordinate validation** — Ensure hex exists in board layout

```typescript
// Server validation
function validateRobberPlacement(board: Board, hex: HexCoord): boolean {
  return board.hexes.has(hex) && 
         board.hexes.get(hex).terrain !== 'OCEAN' &&
         hex !== board.robber  // Can't place where it already is
}
```

**Phase relevance:** Phase 4 (Robber mechanics)

---

### 6. Development Card Timing Violations
**What goes wrong:**
- Playing Victory Point card before winning (should stay hidden)
- Playing multiple dev cards in one turn (illegal except VPs)
- Playing newly bought dev card same turn (illegal except VP on winning turn)
- Playing cards during other players' turns

**Warning signs:**
- Players complaining about cheating
- VP cards visible before game end
- Multiple knights played in one turn

**Prevention:**
1. **Track purchase turn** — `DevCard { type, purchasedTurn, played }`
2. **Enforce one-per-turn rule** — `hasPlayedDevCardThisTurn` flag on player
3. **VP cards hidden** — Don't reveal VP cards in state sent to other players
4. **Phase gating** — Dev cards only playable in appropriate turn phases

```typescript
// Correct validation
function canPlayDevCard(card: DevCard, gameState: GameState): boolean {
  if (card.type === 'VICTORY_POINT') return false  // Never manually playable
  if (card.purchasedTurn === gameState.turnNumber) return false  // Can't play same turn
  if (gameState.currentPlayer.playedDevCardThisTurn) return false  // One per turn
  if (gameState.phase !== 'MAIN') return false  // Only in main phase
  return true
}
```

**Phase relevance:** Phase 5 (Development Cards)

---

## Common Mistakes

### Game Logic

#### Forgetting to Check Resource Availability
```typescript
// ❌ BAD: Just place the building
placeSettlement(player, location)

// ✅ GOOD: Validate resources first
if (!hasResources(player, BUILDING_COSTS.SETTLEMENT)) {
  return { error: 'INSUFFICIENT_RESOURCES' }
}
```

#### Distance Rule Violations (Settlements)
- Settlements must be 2 edges apart from any other settlement
- Common bug: Checking distance only from own settlements, not opponents'

```typescript
// ✅ GOOD: Check distance from ALL settlements
function isValidSettlementLocation(board: Board, vertex: Vertex): boolean {
  // Check all 3 adjacent vertices
  for (const neighbor of getAdjacentVertices(vertex)) {
    if (board.settlements.has(neighbor)) {
      return false  // Too close to existing settlement
    }
  }
  return true
}
```

#### Initial Placement Resource Distribution
- Second settlement in snake draft gives starting resources
- Common bug: Giving resources for first settlement too

---

### Real-time Sync

#### Not Handling Connection Loss Gracefully
```typescript
// ❌ BAD: Assume connection is always alive
socket.send(message)

// ✅ GOOD: Handle disconnects
socket.send(message, (error) => {
  if (error) {
    gameState.pauseGame()
    notifyPlayers({ type: 'PLAYER_DISCONNECTED', playerId })
  }
})
```

#### Forgetting to Clean Up Disconnected Players
- Memory leak: Rooms stay in memory forever if players don't properly disconnect
- Solution: Timeout mechanism, clean up after 5 minutes offline

---

### UX/UI

#### Not Highlighting Legal Moves
- Players shouldn't have to guess where they can build
- Show available spots with visual indicators

#### Unclear Turn Indicators
- Make it VERY obvious whose turn it is
- Use: player name in large text, colored border, animation, "Your Turn" message

#### No "Undo" Within Turn
- Players fat-finger clicks, need undo before committing turn
- Implement action queue with undo before "End Turn" button

#### Overwhelming New Players
- Catan has complex rules, surfacing costs/rules inline helps
- Building cost reference card should be always visible

---

## Catan-Specific Gotchas

### Port Trading Edge Cases
- **3:1 Generic Port**: Can trade any 3 of one resource for any 1 other
- **2:1 Specific Port**: Only for that specific resource (e.g., 2 wheat → 1 other)
- Common bug: Allowing 2:1 trade of wrong resource at specific port

### Number Token Distribution
- No two 6's or 8's can be adjacent (high probability hexes)
- Common approach: Generate, check, regenerate if invalid
- Better approach: Constrained generation algorithm

### Robber on Desert at Start
- Robber starts on desert hex
- Common bug: Random placement at game start

### Dice Roll of 7 Special Handling
- No resources distributed
- Players with 8+ cards discard half (rounded down)
- Active player moves robber and may steal
- Common bug: Distributing resources on 7

### Development Card Draw Timing
- Draw from randomized deck
- Common bug: Letting player choose card type
- Correct: Shuffle deck at game start, draw from top

### Victory Point Cards Never Announced
- VP cards stay hidden until win
- Common bug: Showing VP cards in player's hand
- Only reveal at moment of victory (10 VP reached)

### Longest Road Tie Goes to Original Owner
- If Player A has longest road (5) and Player B builds to 5, Player A keeps it
- Player B must reach 6 to take it
- Common bug: Transferring on tie

### Largest Army Requires Minimum 3 Knights
- Can't claim Largest Army with 2 knights
- Common bug: Awarding with <3 knights

---

## Testing Strategies to Catch These

### Unit Tests for Rules
- Test every validation function with edge cases
- Test longest road with complex graphs
- Test resource distribution with all number combinations

### Integration Tests for State Sync
- Simulate multiple clients
- Introduce artificial latency
- Force disconnects mid-action

### Fuzz Testing
- Random game actions in random order
- Catch state machine bugs

### Playtesting Scenarios
- **The 7 Spam**: Roll 7 repeatedly, test discard logic
- **The Builder**: Place roads/settlements rapidly, test placement validation
- **The Disconnector**: Disconnect/reconnect at every phase
- **The Trader**: Spam trade requests, test race conditions
- **The Edge Case**: Try to place on ocean, steal from self, etc.

---

## Phase-Specific Risks

| Phase | Highest Risk Pitfall | Mitigation |
|-------|----------------------|------------|
| Phase 1 (Foundation) | WebSocket connection handling | Implement reconnection from day 1 |
| Phase 2 (Core Loop) | Turn order race conditions | Turn lock + action validation |
| Phase 3 (Rendering) | Board coordinate mismatches | Use cubic coordinates consistently |
| Phase 4 (Mechanics) | Resource duplication | Event sourcing + reconciliation |
| Phase 5 (Advanced) | Longest road miscalculation | DFS with comprehensive tests |
| Phase 6 (Resilience) | State corruption on reconnect | Full state sync on connect |

---

*Research based on post-mortems of multiplayer game implementations and common bug reports from Catan clone projects.*
