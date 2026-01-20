# Catan Online

## What This Is

An online multiplayer implementation of Settlers of Catan (base game only) for 3-4 players. Players join games via room ID and nickname, select colors in a lobby, and play the classic board game in real-time through their browser.

## Core Value

Players can complete a full game of Catan together online with faithful rule implementation and reliable real-time synchronization.

## Requirements

### Validated

- ✓ NX monorepo with React web app and Express API — existing
- ✓ WebSocket infrastructure available — existing
- ✓ Mantine UI component library integrated — existing
- ✓ Zustand + TanStack Query state management — existing
- ✓ Zod validation on both client and server — existing

### Active

- [ ] Room system — join via room ID + nickname
- [ ] Lobby with color selection and ready-up
- [ ] Game start countdown when all players ready
- [ ] Random board generation (tiles, numbers, ports)
- [ ] Snake draft initial placement (1→2→3→4→4→3→2→1)
- [ ] Round-robin turn order
- [ ] Dice rolling with resource distribution
- [ ] Building (roads, settlements, cities)
- [ ] Domestic trading (player-to-player)
- [ ] Maritime trading (4:1, 3:1, 2:1 ports)
- [ ] Robber mechanics (7 roll, discard, move, steal)
- [ ] Development cards (full set: Knight, VP, Road Building, Year of Plenty, Monopoly)
- [ ] Largest Army tracking
- [ ] Longest Road tracking
- [ ] Victory point calculation
- [ ] Win detection (first to 10 VP)
- [ ] Disconnect handling (game pauses, wait for reconnect)
- [ ] Real-time game state sync across all players

### Out of Scope

- Expansions (Seafarers, Cities & Knights, etc.) — deferred to future
- User accounts and authentication — anonymous play only for v1
- Turn timers or game timers — untimed play
- AI players or bots — human players only
- Private/public room visibility toggle — all rooms accessed by ID
- Room creator privileges (kick, player limit) — all players equal
- Spectator mode — players only
- Game chat — deferred to future
- Mobile-specific UI — responsive web only
- Persistent game history/stats — no accounts

## Context

**Existing Codebase:**
- NX monorepo already scaffolded with React (Vite) web app and Express API
- WebSocket support via `ws` library on backend
- Mantine UI for components, Zustand for client state, TanStack Query for server state
- TypeScript strict mode, Zod for validation on both ends

**Game Rules Reference:**
- Standard Settlers of Catan base game (2020 edition rules)
- 19 land hexes (4 wood, 4 wheat, 4 sheep, 3 brick, 3 ore, 1 desert)
- Number tokens following standard distribution (avoiding 6/8 adjacent)
- 9 port hexes (4 generic 3:1, 5 specific 2:1)
- 25 development cards (14 Knight, 5 VP, 2 each of others)

## Constraints

- **Tech Stack**: Must use existing NX/React/Express setup — already invested, team familiarity
- **Players**: 3-4 players per game only — base game limitation
- **Browser**: Modern browsers only (Chrome, Firefox, Safari, Edge) — no IE11
- **Real-time**: WebSocket-based sync — HTTP polling insufficient for game state

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Random board layout | More replayability than fixed layout | — Pending |
| Snake draft for initial placement | Standard tournament rules, fair | — Pending |
| No turn timer | Casual play, avoid pressure | — Pending |
| Anonymous players (no accounts) | Faster to v1, lower friction | — Pending |
| Game pauses on disconnect | Prevents unfair advantage, respects all players' time | — Pending |
| Self-blocking with robber allowed | Follows official rules | — Pending |
| Player chooses discard cards | More strategic than random | — Pending |
| Both trade types (domestic + maritime) | Complete base game experience | — Pending |

---
*Last updated: 2026-01-20 after initialization*
