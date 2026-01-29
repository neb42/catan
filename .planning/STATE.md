# State

**Project:** Catan Online  
**Version:** v1  
**Last Updated:** 2026-01-29  
**Last activity:** 2026-01-29 - Completed 05-04-PLAN.md (Build mode overlay integration)

## Current Position

Phase: 5 of 12 (Building)  
Plan: 4 of 5 in current phase  
Status: In progress  
Last activity: 2026-01-29 - Completed 05-04-PLAN.md

Progress: █████████████████████████████░░░░░░░ 70% (Phase 5 plan 4/5)

## Blockers/Concerns

- None

### Quick Tasks Completed

| #   | Description                                                            | Date       | Commit  | Directory                                                                                                 |
| --- | ---------------------------------------------------------------------- | ---------- | ------- | --------------------------------------------------------------------------------------------------------- |
| 002 | Decouple PlayerList component into separate lobby and game components  | 2026-01-28 | 6de8737 | [002-decouple-playerlist-component-into-separ](./quick/002-decouple-playerlist-component-into-separ/)     |
| 003 | Split Phase 5 into Building/Trading/Robber phases                      | 2026-01-29 | 6787c3d | [003-split-phase-5-into-building-trading-robber](./quick/003-split-phase-5-into-building-trading-robber/) |
| 004 | Split Phase 8 into Development Cards/Longest Road/Largest Army/Victory | 2026-01-29 | 6f16728 | [004-split-phase-8-into-4-phases](./quick/004-split-phase-8-into-4-phases/)                               |

## Decisions

| Phase | Decision                      | Rationale                                                                     |
| ----- | ----------------------------- | ----------------------------------------------------------------------------- |
| 03    | Rounded coordinate keys       | Use EPSILON=0.1 to handle floating point precision in vertex deduplication    |
| 03    | Sorted edge IDs               | Sort endpoints to normalize edge direction (A->B equals B->A)                 |
| 03    | 0-based turn indexing         | Simplify turn math (Math.floor(turn/2)) vs tracking round/player separately   |
| 03    | Simplified messages           | Placement messages only send ID (vertex/edge), not raw hex coordinates        |
| 03    | Backend State Manager         | GameManager instance attached to Room controls logic, distinct from data      |
| 03    | Client-side validation        | Calculate valid locations on client for immediate UI feedback                 |
| 03    | Selector hooks pattern        | Use specific hooks to access store state to prevent re-render anti-patterns   |
| 03    | Split markers                 | Separate VertexMarker/EdgeMarker components for clean geometry handling       |
| 03    | Native SVG tooltips           | Use simple <title> tags for accessibility and performance                     |
| 03    | Store-based color             | Derive player color from store nickname instead of prop drilling              |
| 03    | Store Room State              | Move room/player data into gameStore to avoid prop drilling in UI components  |
| 03    | UI Component Split            | Separate PlacementBanner and DraftOrderDisplay for cleaner Game layout        |
| 03    | Lobby owns WebSocket          | Lobby.tsx handles all WebSocket messages including gameplay during placement  |
| 03    | Phase transition              | clearPlacementState() clears placement UI, enabling main game phase UI        |
| 03    | Resource state tracking       | Use Record<string, PlayerResources> for flexible per-player resource tracking |
| 03    | Display all resources         | Show all 5 resource types even at 0 for consistent layout                     |
| 04    | TurnPhase enum                | Uses 'roll' \| 'main' only - 'end' is a transition not a discrete state       |
| 04    | resourcesDistributed          | Include in DiceRolled message for client animation of all players             |
| 04    | turnState nullable            | Null during placement phase, initialized when setup completes                 |
| 04    | Robber deferred               | Dice roll 7 distributes resources normally until Phase 6                      |
| 04    | Separate turn player ID       | turnCurrentPlayerId distinct from placement currentPlayerId during transition |
| 04    | TurnControls visibility       | Component returns null when turnPhase is null (during placement phase)        |
| 04    | Fan layout algorithm          | Cards overlap with -25px margin, rotation 4deg per card from center           |
| 04    | Dual-phase highlighting       | GamePlayerList uses turnCurrentPlayerId or placementPlayerId for highlighting |
| 04    | State update ordering         | setTurnState must be called before setDiceRoll to preserve dice values        |
| 05    | Separate main-game validators | Setup validators require just-placed settlement; main-game allows any network |
| 05    | Reason-returning validators   | Functions return null or error string for clear user feedback                 |
| 05    | Build validation chain        | Turn → phase → limit → resources → placement order for specific errors        |
| 05    | Return resourcesSpent         | Build success includes spent resources for client animation                   |
| 05    | Main-game validators separate | Different rules: connect to any owned network, not just last settlement       |
| 05    | useCanBuild returns reason    | Provides both canBuild boolean and disabledReason for clear UX                |
| 05    | Single placement per mode     | Build mode exits after single click for clear UX                              |
| 05    | Build overlay conditional     | PlacementOverlay renders for both placement phase AND build mode              |

## Session Continuity

Last session: 2026-01-29
Stopped at: Completed 05-04-PLAN.md (Build mode overlay integration)
Resume file: none
