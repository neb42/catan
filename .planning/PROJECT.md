# Catan Online

## What This Is

An online multiplayer implementation of the Settlers of Catan board game. Friends connect to a shared lobby, pick colors, ready up, and play real-time games together. Supports 3-6 players with base game plus 5-6 player expansion rules.

## Core Value

Friends can play Settlers of Catan together online with full base game rules and real-time turn-based gameplay.

## Requirements

### Validated

- ✓ Nx monorepo with apps/libs structure — existing
- ✓ Express 5.x HTTP server with middleware — existing
- ✓ WebSocket server attached to HTTP server — existing
- ✓ React 19 SPA with Mantine 8 UI — existing
- ✓ TanStack Router file-based routing — existing
- ✓ TanStack Query data fetching — existing
- ✓ TypeScript strict mode throughout — existing

### Active

- [ ] Single shared lobby for all players
- [ ] Nickname entry to join lobby
- [ ] Color selection for player pieces
- [ ] Ready button with player status display
- [ ] Auto-start with 10-second countdown when all ready
- [ ] Queue for players arriving during active game
- [ ] Random hex board generation (19 hexes)
- [ ] Number token placement per Catan rules
- [ ] Resource production on dice roll
- [ ] Building: roads, settlements, cities
- [ ] Development cards: knights, VP, road building, year of plenty, monopoly
- [ ] Trading: bank (4:1), ports (3:1, 2:1), player-to-player
- [ ] Robber mechanics on rolling 7
- [ ] Longest road / largest army tracking
- [ ] Victory point tracking (win at 10 VP)
- [ ] 5-6 player expansion: special building phase
- [ ] Round-robin turn order
- [ ] Game pause on player disconnect
- [ ] Reconnection support for disconnected players
- [ ] Post-game results screen
- [ ] New game / exit options after game ends

### Out of Scope

- Seafarers expansion — v2+
- Cities & Knights expansion — v2+
- Mobile app — web only for v1
- Spectator mode — not needed for friends-only play
- Multiple concurrent lobbies — single lobby sufficient
- User accounts — nicknames only, no persistence
- Public matchmaking — friends only via shared URL

## Context

This is a brownfield project building on an existing Nx monorepo skeleton:

**Backend (apps/api):**
- Express 5.x with CORS, logging, error handling middleware
- WebSocket server using `ws` library, attached to HTTP server via upgrade
- Feature-based directory structure ready for game logic

**Frontend (apps/web):**
- React 19 with Mantine 8 AppShell layout
- TanStack Router for type-safe file-based routing
- TanStack Query for server state management
- Vite dev server on port 4200

**Infrastructure:**
- TypeScript 5.9 with strict mode
- Yarn workspaces
- Nx for build orchestration and caching

The WebSocket infrastructure is scaffolded but only handles connect/disconnect logging. Game state management, message protocols, and game logic need to be built.

## Constraints

- **Tech stack**: Must use existing Express/React/Mantine stack — already invested
- **Real-time**: WebSocket required for game state sync — already available via ws
- **Players**: 3-6 players per game — affects board layout and special building phase
- **Browser**: Modern browsers only — no IE11 support needed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single lobby model | Friends-only use case, simplest architecture | — Pending |
| No user accounts | Reduces complexity, nicknames sufficient for friend groups | — Pending |
| Game pause on disconnect | Better UX than AI takeover for friend games | — Pending |
| 5-6 player expansion | User wants larger games, requires special building phase | — Pending |

---
*Last updated: 2026-01-17 after initialization*
