# Catan Online

## What This Is

An online multiplayer implementation of the Settlers of Catan board game. Friends connect to a shared lobby, pick colors, ready up, and play real-time games together. Supports 3-6 players with base game plus 5-6 player expansion rules.

## Core Value

Friends can play Settlers of Catan together online with full base game rules and real-time turn-based gameplay.

## Current Milestone: v0.1 Lobby

**Goal:** Players can join a shared lobby, see each other in real-time, coordinate colors and ready status, and trigger game start.

**Target features:**
- Landing page with nickname entry (unique nicknames enforced)
- Real-time lobby with 3-4 player support
- Color selection with first-to-ready stealing mechanic
- Ready/countdown system with un-ready cancellation
- Placeholder game start screen when countdown completes
- Block late arrivals during active games

## Requirements

### Validated

- ✓ Nx monorepo with apps/libs structure — existing
- ✓ Express 5.x HTTP server with middleware — existing
- ✓ WebSocket server attached to HTTP server — existing
- ✓ React 19 SPA with Mantine 8 UI — existing
- ✓ TanStack Router file-based routing — existing
- ✓ TanStack Query data fetching — existing
- ✓ TypeScript strict mode throughout — existing

### Active (v0.1 - Lobby)

- [ ] Landing page with nickname entry
- [ ] Unique nickname validation (no duplicates in lobby)
- [ ] Single shared lobby with real-time player sync
- [ ] Player list showing nicknames and status (3-4 player cap)
- [ ] Color selection UI (standard Catan colors)
- [ ] Color stealing mechanic (first to ready locks the color)
- [ ] Ready button with visual status indicators
- [ ] All-ready triggers 10-second countdown
- [ ] Un-ready during countdown cancels it
- [ ] Countdown completion transitions to placeholder screen
- [ ] Block late arrivals when game in progress

### Future Milestones

**Game mechanics:**
- Random hex board generation (19 hexes)
- Number token placement per Catan rules
- Resource production on dice roll
- Building: roads, settlements, cities
- Development cards: knights, VP, road building, year of plenty, monopoly
- Trading: bank (4:1), ports (3:1, 2:1), player-to-player
- Robber mechanics on rolling 7
- Longest road / largest army tracking
- Victory point tracking (win at 10 VP)
- Round-robin turn order

**Reliability:**
- Game pause on player disconnect
- Reconnection support for disconnected players
- Post-game results screen
- New game / exit options after game ends

**Expansion:**
- 5-6 player support with special building phase

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
- **Players**: 3-4 players for v0.1 (base game), 5-6 player expansion deferred
- **Browser**: Modern browsers only — no IE11 support needed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single lobby model | Friends-only use case, simplest architecture | — Pending |
| No user accounts | Reduces complexity, nicknames sufficient for friend groups | — Pending |
| Block late arrivals | Simpler than queue/spectator for v0.1 | ✓ Good |
| Color stealing mechanic | First-to-ready gets priority, prevents conflicts | — Pending |
| 3-4 players only for v0.1 | Base game first, expansion later | ✓ Good |
| Placeholder game screen | Lobby complete before building actual game | ✓ Good |

---
*Last updated: 2026-01-18 after v0.1 milestone start*
