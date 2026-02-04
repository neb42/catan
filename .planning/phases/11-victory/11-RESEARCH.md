# Phase 11: Victory - Research

**Researched:** 2026-02-02
**Domain:** Victory point calculation, win detection, and victory announcement UI
**Confidence:** HIGH

## Summary

Phase 11 implements victory point (VP) calculation, win detection, and victory announcement. The phase builds directly on existing infrastructure from Phases 9 (Longest Road) and 10 (Largest Army), which already contribute 2 VP each. The remaining VP sources are settlements (1 VP), cities (2 VP), and VP development cards (1 VP each).

The core challenge is **win detection timing**: VP must be checked immediately after any VP-changing action, and a player CAN win during another player's turn (e.g., when opponent loses Longest Road to you). The CONTEXT.md decisions specify win triggers immediately even mid-action - if the first road of Road Building card gives Longest Road = 10 VP, the game ends and the second road is never placed.

The UI implementation requires a two-phase victory announcement: first a brief "reveal overlay" showing hidden VP cards flipping (1-2 seconds), then the victory modal with confetti celebration effects. The existing stack (Mantine modals, motion/react for animations) is sufficient. For confetti, **canvas-confetti** via **react-canvas-confetti** is the recommended library - it provides fireworks presets matching the CONTEXT.md requirement for "festive celebration effects".

**Primary recommendation:** Create server-side `calculateVictoryPoints()` function that sums all VP sources, call it after every VP-changing action, emit `victory` message when 10 VP reached. Use react-canvas-confetti for celebration effects.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native TypeScript | - | VP calculation logic | Simple arithmetic, no library needed |
| @mantine/core | 8.x | Victory modal, overlay | Already used for all modals |
| motion/react | 12.x | Modal and reveal animations | Already used for badges/transitions |
| react-canvas-confetti | ^1.4 | Confetti/fireworks effects | Lightweight, fireworks preset, canvas-based |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @mantine/hooks | existing | useTimeout for reveal overlay auto-dismiss | Auto-transition from reveal to victory |
| zustand | existing | Victory state management | Store game-over state, winner info |
| zod | existing | Message schema validation | VictoryMessage schema |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-canvas-confetti | react-confetti | react-confetti is canvas-based continuous rain; canvas-confetti is explosion/fireworks burst - better for one-time celebration |
| react-canvas-confetti | react-confetti-explosion | CSS-only, no fireworks preset; canvas-confetti offers more customization |
| Timed reveal overlay | Manual dismiss | CONTEXT.md specifies auto-transition after 1-2 seconds |

**Installation:**
```bash
npm install react-canvas-confetti
```

## Architecture Patterns

### Recommended File Structure
```
libs/shared/src/
  schemas/
    game.ts                    # ADD: GamePhase 'ended', winner field
    messages.ts                # ADD: VictoryMessageSchema, VictoryPointsUpdatedSchema

apps/api/src/
  game/
    victory-logic.ts           # NEW: calculateVictoryPoints(), checkForVictory()
    GameManager.ts             # MODIFY: call checkForVictory after VP-changing actions

apps/web/src/
  stores/
    gameStore.ts               # ADD: VictorySlice
  components/
    Victory/
      VPRevealOverlay.tsx      # NEW: Brief overlay showing hidden VP card reveal
      VictoryModal.tsx         # NEW: Winner announcement with confetti
      VPDisplay.tsx            # NEW: Inline VP breakdown for player list
      index.ts                 # Export all
    GamePlayerList.tsx         # MODIFY: Add inline VP display component
    Game.tsx                   # MODIFY: Render victory components
```

### Pattern 1: Centralized VP Calculation
**What:** Single pure function that calculates total VP from all sources
**When to use:** Every time VP might have changed
**Example:**
```typescript
// Source: Catan rules + existing codebase patterns
interface VPBreakdown {
  settlements: number;      // Count * 1
  cities: number;          // Count * 2
  longestRoad: number;     // 2 if holder, 0 otherwise
  largestArmy: number;     // 2 if holder, 0 otherwise
  victoryPointCards: number; // Count * 1
  total: number;
}

function calculateVictoryPoints(
  playerId: string,
  settlements: Settlement[],
  longestRoadHolderId: string | null,
  largestArmyHolderId: string | null,
  playerDevCards: OwnedDevCard[],
): VPBreakdown {
  const playerSettlements = settlements.filter(s => s.playerId === playerId);
  const settlementCount = playerSettlements.filter(s => !s.isCity).length;
  const cityCount = playerSettlements.filter(s => s.isCity).length;
  const vpCardCount = playerDevCards.filter(c => c.type === 'victory_point').length;

  return {
    settlements: settlementCount,          // 1 VP each
    cities: cityCount * 2,                 // 2 VP each
    longestRoad: longestRoadHolderId === playerId ? 2 : 0,
    largestArmy: largestArmyHolderId === playerId ? 2 : 0,
    victoryPointCards: vpCardCount,        // 1 VP each
    total: settlementCount + (cityCount * 2) +
           (longestRoadHolderId === playerId ? 2 : 0) +
           (largestArmyHolderId === playerId ? 2 : 0) +
           vpCardCount,
  };
}
```

### Pattern 2: Immediate Win Detection After Each Action
**What:** Check for victory immediately after any VP-changing action
**When to use:** After settlement/city build, longest road update, largest army update, VP card play
**Example:**
```typescript
// Source: CONTEXT.md decisions
interface VictoryResult {
  gameEnded: boolean;
  winnerId: string | null;
  winnerVP: VPBreakdown | null;
  allPlayerVP: Record<string, VPBreakdown>;
  revealedVPCards: OwnedDevCard[];  // VP cards that were hidden
}

function checkForVictory(
  playerIds: string[],
  settlements: Settlement[],
  longestRoadHolderId: string | null,
  largestArmyHolderId: string | null,
  getPlayerDevCards: (playerId: string) => OwnedDevCard[],
): VictoryResult {
  const allPlayerVP: Record<string, VPBreakdown> = {};
  let winnerId: string | null = null;
  let winnerVP: VPBreakdown | null = null;
  let revealedVPCards: OwnedDevCard[] = [];

  for (const playerId of playerIds) {
    const devCards = getPlayerDevCards(playerId);
    const vp = calculateVictoryPoints(
      playerId,
      settlements,
      longestRoadHolderId,
      largestArmyHolderId,
      devCards,
    );
    allPlayerVP[playerId] = vp;

    if (vp.total >= 10 && !winnerId) {
      winnerId = playerId;
      winnerVP = vp;
      // Collect revealed VP cards
      revealedVPCards = devCards.filter(c => c.type === 'victory_point');
    }
  }

  return {
    gameEnded: winnerId !== null,
    winnerId,
    winnerVP,
    allPlayerVP,
    revealedVPCards,
  };
}
```

### Pattern 3: VP Check Integration Points
**What:** Call checkForVictory at specific points in GameManager
**When to use:** After every VP-changing action
**Example:**
```typescript
// Source: CONTEXT.md decisions - comprehensive trigger list
// In GameManager, add victory check after these methods:

// 1. After buildSettlement (adds 1 VP)
// 2. After buildCity (adds 1 VP net: +2 city, -1 settlement)
// 3. After buildRoad (may trigger longest road change)
// 4. After placeRoad (setup phase - may trigger longest road)
// 5. After playKnight (may trigger largest army change)
// 6. After Road Building places a road (may trigger longest road mid-card)
// 7. After longestRoad updates (holder change)
// 8. After largestArmy updates (holder change)

// Note: VP cards don't need explicit play - they're auto-counted
// They only "reveal" when the player reaches 10 VP
```

### Pattern 4: Two-Phase Victory Announcement
**What:** Brief reveal overlay followed by victory modal
**When to use:** When victory message received
**Example:**
```typescript
// Source: CONTEXT.md decisions
function VictoryAnnouncement() {
  const [phase, setPhase] = useState<'reveal' | 'modal'>('reveal');
  const { revealedVPCards, winner, allPlayerVP } = useVictoryState();

  // Auto-transition from reveal to modal after 1.5 seconds
  useEffect(() => {
    if (revealedVPCards.length > 0) {
      const timer = setTimeout(() => setPhase('modal'), 1500);
      return () => clearTimeout(timer);
    } else {
      // No hidden VP cards to reveal, skip to modal
      setPhase('modal');
    }
  }, [revealedVPCards]);

  if (phase === 'reveal' && revealedVPCards.length > 0) {
    return <VPRevealOverlay cards={revealedVPCards} />;
  }

  return <VictoryModal winner={winner} allPlayerVP={allPlayerVP} />;
}
```

### Pattern 5: Confetti/Fireworks Effect
**What:** canvas-confetti fireworks on victory modal
**When to use:** When victory modal opens
**Example:**
```typescript
// Source: react-canvas-confetti documentation
import Confetti from 'react-canvas-confetti';

function VictoryModal({ winner, allPlayerVP }: Props) {
  const refConfetti = useRef<CreateTypes>(null);

  // Fire fireworks when modal opens
  useEffect(() => {
    const duration = 5000;
    const end = Date.now() + duration;

    const frame = () => {
      if (Date.now() < end && refConfetti.current) {
        // Alternate origins for variety
        refConfetti.current({
          particleCount: 50,
          spread: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#FDD835'],
        });
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <>
      <Confetti refConfetti={refConfetti} />
      <Modal opened centered size="lg" withCloseButton={false}>
        {/* Victory content */}
      </Modal>
    </>
  );
}
```

### Anti-Patterns to Avoid
- **Checking VP only at turn end:** Player can win mid-turn. Check after EVERY VP-changing action.
- **Counting VP on client:** Server is authoritative. Client displays VP from server state.
- **Manual VP card reveal:** VP cards auto-reveal when player hits 10 VP, no action needed.
- **Blocking reveal overlay dismiss:** Auto-transition after 1-2 seconds per CONTEXT.md.
- **Separate VP display panel:** CONTEXT.md specifies inline VP breakdown in player list.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confetti animation | Custom particle system | react-canvas-confetti | Fireworks preset, battle-tested, canvas performance |
| Modal component | Custom overlay | @mantine/core Modal | Already used, centered, accessible |
| Timed transitions | Custom setTimeout management | useTimeout from @mantine/hooks | Clean lifecycle handling |
| VP card flip animation | Custom CSS keyframes | motion/react AnimatePresence | Consistent with existing animations |

**Key insight:** All required UI components already exist in the stack. The new work is primarily server-side VP calculation logic and one new dependency for confetti.

## Common Pitfalls

### Pitfall 1: Checking VP Only at Turn End
**What goes wrong:** Player wins during opponent's turn but game doesn't detect it
**Why it happens:** Only checking VP when `endTurn()` is called
**How to avoid:** Add victory check after EVERY VP-changing action (see Pattern 3)
**Warning signs:** Player with 10 VP doesn't trigger game end until their next turn

### Pitfall 2: Not Handling Mid-Action Win
**What goes wrong:** Road Building card places first road giving Longest Road = 10 VP, but game lets second road be placed
**Why it happens:** Victory check at end of card effect, not after each road
**How to avoid:** Check victory after EACH road placed in Road Building, abort if game ended
**Warning signs:** Player places roads/builds after game should have ended

### Pitfall 3: Incorrect VP Card Counting
**What goes wrong:** VP cards counted before player reveals them
**Why it happens:** Confusion about when VP cards count
**How to avoid:** VP cards ALWAYS count toward total (hidden to opponents, but counted). They "reveal" only for display when winner announced.
**Warning signs:** Player's displayed VP doesn't match their actual total

### Pitfall 4: Missing Longest Road Loss Trigger
**What goes wrong:** Player A loses Longest Road to Player B (who now has 10 VP), but no victory check
**Why it happens:** Victory check only on road build, not on longest road transfer
**How to avoid:** Victory check after recalculateLongestRoad returns a transfer
**Warning signs:** Player losing award triggers opponent win but game continues

### Pitfall 5: Double Victory Check
**What goes wrong:** Performance degradation, multiple victory messages sent
**Why it happens:** Victory check called both in specific action and in generic post-action hook
**How to avoid:** Single clear location for victory check per action
**Warning signs:** Multiple victory messages, duplicate confetti triggers

### Pitfall 6: Reveal Overlay Without VP Cards
**What goes wrong:** Empty reveal overlay shown when winner had no VP cards
**Why it happens:** Always showing reveal overlay regardless of VP card count
**How to avoid:** Skip reveal phase if revealedVPCards.length === 0
**Warning signs:** Awkward pause with "Revealed: 0 VP cards!" message

## Code Examples

### Complete VP Calculation Logic
```typescript
// Source: Catan rules, existing codebase patterns
// File: apps/api/src/game/victory-logic.ts

export interface VPBreakdown {
  settlements: number;
  cities: number;
  longestRoad: number;
  largestArmy: number;
  victoryPointCards: number;
  total: number;
}

export interface VictoryResult {
  gameEnded: boolean;
  winnerId: string | null;
  winnerVP: VPBreakdown | null;
  allPlayerVP: Record<string, VPBreakdown>;
  revealedVPCards: { playerId: string; cardCount: number }[];
}

export const VICTORY_POINT_THRESHOLD = 10;

export function calculateVictoryPoints(
  playerId: string,
  settlements: Settlement[],
  longestRoadHolderId: string | null,
  largestArmyHolderId: string | null,
  playerDevCards: OwnedDevCard[],
): VPBreakdown {
  const playerSettlements = settlements.filter(s => s.playerId === playerId);

  const settlementCount = playerSettlements.filter(s => !s.isCity).length;
  const cityCount = playerSettlements.filter(s => s.isCity).length;
  const vpCardCount = playerDevCards.filter(c => c.type === 'victory_point').length;

  const longestRoadVP = longestRoadHolderId === playerId ? 2 : 0;
  const largestArmyVP = largestArmyHolderId === playerId ? 2 : 0;

  return {
    settlements: settlementCount,
    cities: cityCount * 2,
    longestRoad: longestRoadVP,
    largestArmy: largestArmyVP,
    victoryPointCards: vpCardCount,
    total: settlementCount + (cityCount * 2) + longestRoadVP + largestArmyVP + vpCardCount,
  };
}

export function checkForVictory(
  playerIds: string[],
  settlements: Settlement[],
  longestRoadHolderId: string | null,
  largestArmyHolderId: string | null,
  getPlayerDevCards: (playerId: string) => OwnedDevCard[],
): VictoryResult {
  const allPlayerVP: Record<string, VPBreakdown> = {};
  const revealedVPCards: { playerId: string; cardCount: number }[] = [];

  // Calculate VP for all players
  for (const playerId of playerIds) {
    const devCards = getPlayerDevCards(playerId);
    allPlayerVP[playerId] = calculateVictoryPoints(
      playerId,
      settlements,
      longestRoadHolderId,
      largestArmyHolderId,
      devCards,
    );

    // Track VP cards for reveal
    const vpCardCount = devCards.filter(c => c.type === 'victory_point').length;
    if (vpCardCount > 0) {
      revealedVPCards.push({ playerId, cardCount: vpCardCount });
    }
  }

  // Find winner (first player to reach 10)
  const winnerId = playerIds.find(id => allPlayerVP[id].total >= VICTORY_POINT_THRESHOLD) ?? null;

  return {
    gameEnded: winnerId !== null,
    winnerId,
    winnerVP: winnerId ? allPlayerVP[winnerId] : null,
    allPlayerVP,
    revealedVPCards: winnerId ? revealedVPCards : [],
  };
}
```

### WebSocket Message Schema
```typescript
// Source: Existing message patterns in messages.ts
// File: libs/shared/src/schemas/messages.ts

export const VictoryMessageSchema = z.object({
  type: z.literal('victory'),
  winnerId: z.string(),
  winnerVP: z.object({
    settlements: z.number(),
    cities: z.number(),
    longestRoad: z.number(),
    largestArmy: z.number(),
    victoryPointCards: z.number(),
    total: z.number(),
  }),
  allPlayerVP: z.record(z.string(), z.object({
    settlements: z.number(),
    cities: z.number(),
    longestRoad: z.number(),
    largestArmy: z.number(),
    victoryPointCards: z.number(),
    total: z.number(),
  })),
  revealedVPCards: z.array(z.object({
    playerId: z.string(),
    cardCount: z.number(),
  })),
});

export type VictoryMessage = z.infer<typeof VictoryMessageSchema>;
```

### GameManager Integration
```typescript
// Source: Existing GameManager patterns
// File: apps/api/src/game/GameManager.ts (additions)

// Add method to check victory and return result
private checkVictoryAndBroadcast(): VictoryResult | null {
  const result = checkForVictory(
    this.playerIds,
    this.gameState.settlements,
    this.gameState.longestRoadHolderId,
    this.gameState.largestArmyHolderId,
    (playerId) => this.getPlayerDevCards(playerId),
  );

  if (result.gameEnded) {
    // Update game state to ended
    this.gameState.winner = result.winnerId;
    this.gameState.gamePhase = 'ended';
  }

  return result.gameEnded ? result : null;
}

// Example: Modify buildSettlement to check victory
buildSettlement(vertexId: string, playerId: string): BuildResult {
  // ... existing validation and placement logic ...

  // After successful placement:
  const longestRoadResult = this.updateLongestRoad();

  // NEW: Check for victory
  const victoryResult = this.checkVictoryAndBroadcast();

  return {
    success: true,
    resourcesSpent: { ...cost },
    longestRoadResult,
    victoryResult,  // NEW: Include in return
  };
}
```

### Victory Modal Component
```typescript
// Source: Existing modal patterns, react-canvas-confetti docs
// File: apps/web/src/components/Victory/VictoryModal.tsx

import { Modal, Stack, Text, Group, Badge, Button, Paper } from '@mantine/core';
import { motion } from 'motion/react';
import Confetti from 'react-canvas-confetti';
import type { CreateTypes } from 'canvas-confetti';
import { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { PLAYER_COLOR_HEX } from '@catan/shared';

export function VictoryModal() {
  const victory = useGameStore(s => s.victory);
  const room = useGameStore(s => s.room);
  const refConfetti = useRef<CreateTypes | null>(null);

  const getInstance = useCallback((instance: CreateTypes | null) => {
    refConfetti.current = instance;
  }, []);

  // Fire confetti fireworks
  useEffect(() => {
    if (!victory?.winnerId || !refConfetti.current) return;

    const duration = 5000;
    const end = Date.now() + duration;

    const frame = () => {
      if (Date.now() < end && refConfetti.current) {
        refConfetti.current({
          particleCount: 30,
          spread: 70,
          startVelocity: 30,
          origin: {
            x: 0.2 + Math.random() * 0.6,
            y: Math.random() - 0.2
          },
          colors: Object.values(PLAYER_COLOR_HEX),
        });
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [victory?.winnerId]);

  if (!victory) return null;

  const winner = room?.players.find(p => p.id === victory.winnerId);
  const winnerColor = winner ? PLAYER_COLOR_HEX[winner.color] : '#43A047';

  return (
    <>
      <Confetti
        refConfetti={getInstance}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1001,
        }}
      />
      <Modal
        opened={true}
        onClose={() => {}}  // Cannot close until action taken
        withCloseButton={false}
        centered
        size="lg"
        overlayProps={{ blur: 3, opacity: 0.5 }}
        zIndex={1000}
      >
        <Stack align="center" gap="lg" p="md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Text
              size="2rem"
              fw={900}
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Victory!
            </Text>
          </motion.div>

          <Paper
            p="lg"
            radius="md"
            style={{
              backgroundColor: winnerColor + '20',
              border: `3px solid ${winnerColor}`,
              width: '100%',
            }}
          >
            <Text
              size="xl"
              fw={700}
              ta="center"
              style={{ color: winnerColor }}
            >
              {winner?.nickname} Wins!
            </Text>
            <Text ta="center" c="dimmed" size="sm" mt="xs">
              {victory.winnerVP?.total} Victory Points
            </Text>
          </Paper>

          {/* All players VP breakdown */}
          <Stack w="100%" gap="sm">
            {room?.players.map(player => {
              const vp = victory.allPlayerVP[player.id];
              const isWinner = player.id === victory.winnerId;
              return (
                <Paper
                  key={player.id}
                  p="sm"
                  radius="sm"
                  style={{
                    backgroundColor: isWinner ? winnerColor + '10' : '#f5f5f5',
                    border: isWinner ? `2px solid ${winnerColor}` : 'none',
                  }}
                >
                  <Group justify="space-between">
                    <Text fw={isWinner ? 700 : 500}>{player.nickname}</Text>
                    <Group gap="xs">
                      {vp?.settlements > 0 && <Badge size="sm" color="gray">S:{vp.settlements}</Badge>}
                      {vp?.cities > 0 && <Badge size="sm" color="blue">C:{vp.cities}</Badge>}
                      {vp?.longestRoad > 0 && <Badge size="sm" color="green">LR:2</Badge>}
                      {vp?.largestArmy > 0 && <Badge size="sm" color="red">LA:2</Badge>}
                      {vp?.victoryPointCards > 0 && <Badge size="sm" color="violet">VP:{vp.victoryPointCards}</Badge>}
                      <Badge size="md" color={isWinner ? 'green' : 'gray'} variant="filled">
                        {vp?.total} VP
                      </Badge>
                    </Group>
                  </Group>
                </Paper>
              );
            })}
          </Stack>

          <Group mt="md">
            <Button
              variant="outline"
              onClick={() => useGameStore.getState().setVictoryDismissed(true)}
            >
              Close
            </Button>
            <Button
              color="green"
              onClick={() => {/* Return to lobby logic */}}
            >
              Return to Lobby
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| End-of-turn VP check | Immediate check after each action | Standard Catan rules | Correct win timing |
| CSS confetti | Canvas-based confetti | 2020+ | Better performance, fireworks effects |
| Manual VP card play | Auto-reveal on win | Standard Catan rules | Cleaner UX, no extra action |

**Deprecated/outdated:**
- None - VP calculation is straightforward, and the UI patterns follow existing Mantine/motion conventions

## Open Questions

1. **Return to Lobby flow**
   - What we know: CONTEXT.md says button should be "Return to Lobby"
   - What's unclear: Does this reset room to pre-game state? Kick players? Create new room?
   - Recommendation: Implement as redirect to home/lobby page; room cleanup is separate concern (Phase 12)

2. **Game state after victory**
   - What we know: Board should remain visible behind dimmed modal
   - What's unclear: Can players still view board details (hover for resource info, etc.)?
   - Recommendation: Keep board interactive but disable all game actions

3. **Spectator mode if player disconnects**
   - What we know: Victory can happen during disconnected player's "turn"
   - What's unclear: How to handle victory message delivery to reconnecting player
   - Recommendation: Store victory state in GameManager; send on reconnect

## Sources

### Primary (HIGH confidence)
- Existing codebase: `longest-road-logic.ts`, `largest-army-logic.ts` patterns
- Existing codebase: `GameManager.ts` action structure
- Existing codebase: `gameStore.ts` state management patterns
- Existing codebase: `TradeModal.tsx`, `WaitingForDiscardsOverlay.tsx` UI patterns
- CONTEXT.md: User decisions on VP display, win timing, victory UX

### Secondary (MEDIUM confidence)
- [react-canvas-confetti](https://github.com/ulitcos/react-canvas-confetti) - Fireworks preset documentation
- [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) - Underlying library, 3M+ weekly downloads
- Mantine Modal documentation - Modal patterns

### Tertiary (LOW confidence)
- General web search: Confetti library comparison (verified with GitHub stars, npm downloads)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Builds entirely on existing dependencies plus one well-known confetti library
- Architecture: HIGH - Direct extension of Phase 9/10 patterns, simple VP arithmetic
- Pitfalls: HIGH - Based on explicit CONTEXT.md decisions and Catan rules

**Research date:** 2026-02-02
**Valid until:** 90+ days - Catan rules are stable; libraries are mature
