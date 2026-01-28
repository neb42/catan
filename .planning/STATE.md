# State

**Project:** Catan Online  
**Version:** v1  
**Last Updated:** 2026-01-28  
**Last activity:** 2026-01-28 - Completed quick task 002: Decouple PlayerList component into separate lobby and game components

## Current Position

Phase: 3 of 8 (Initial Placement)  
Plan: 7 of 7 in current phase  
Status: Phase complete + verified  
Last activity: 2026-01-28 - Completed 03-07-PLAN.md (WebSocket Message Handlers - Gap Closure)

Progress: ██████████ 100%

## Blockers/Concerns

- None - Phase 3 fully verified and complete. Ready for Phase 4 (Turn Structure & Resources).

### Quick Tasks Completed

| #   | Description                                                           | Date       | Commit  | Directory                                                                                             |
| --- | --------------------------------------------------------------------- | ---------- | ------- | ----------------------------------------------------------------------------------------------------- |
| 002 | Decouple PlayerList component into separate lobby and game components | 2026-01-28 | 6de8737 | [002-decouple-playerlist-component-into-separ](./quick/002-decouple-playerlist-component-into-separ/) |

## Decisions

| Phase | Decision                | Rationale                                                                    |
| ----- | ----------------------- | ---------------------------------------------------------------------------- |
| 03    | Rounded coordinate keys | Use EPSILON=0.1 to handle floating point precision in vertex deduplication   |
| 03    | Sorted edge IDs         | Sort endpoints to normalize edge direction (A->B equals B->A)                |
| 03    | 0-based turn indexing   | Simplify turn math (Math.floor(turn/2)) vs tracking round/player separately  |
| 03    | Simplified messages     | Placement messages only send ID (vertex/edge), not raw hex coordinates       |
| 03    | Backend State Manager   | GameManager instance attached to Room controls logic, distinct from data     |
| 03    | Client-side validation  | Calculate valid locations on client for immediate UI feedback                |
| 03    | Selector hooks pattern  | Use specific hooks to access store state to prevent re-render anti-patterns  |
| 03    | Split markers           | Separate VertexMarker/EdgeMarker components for clean geometry handling      |
| 03    | Native SVG tooltips     | Use simple <title> tags for accessibility and performance                    |
| 03    | Store-based color       | Derive player color from store nickname instead of prop drilling             |
| 03    | Store Room State        | Move room/player data into gameStore to avoid prop drilling in UI components |
| 03    | UI Component Split      | Separate PlacementBanner and DraftOrderDisplay for cleaner Game layout       |
| 03    | Lobby owns WebSocket    | Lobby.tsx handles all WebSocket messages including gameplay during placement |

## Session Continuity

Last session: 2026-01-27 23:22 UTC
Stopped at: Completed 03-07-PLAN.md
Resume file: none
