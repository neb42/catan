# State

**Project:** Catan Online  
**Version:** v1  
**Last Updated:** 2026-01-30  
**Last activity:** 2026-01-30 - Completed 07-06-PLAN.md (Action feedback system)

## Current Position

Phase: 7 of 12 (Robber)  
Plan: 6 of 7 in current phase  
Status: In progress  
Last activity: 2026-01-30 - Completed 07-06-PLAN.md

Progress: ████████████████████████████████████████████████████░░░░ (Phase 7: 6/7 plans)

## Blockers/Concerns

- None

### Quick Tasks Completed

| #   | Description                                                            | Date       | Commit  | Directory                                                                                                 |
| --- | ---------------------------------------------------------------------- | ---------- | ------- | --------------------------------------------------------------------------------------------------------- |
| 002 | Decouple PlayerList component into separate lobby and game components  | 2026-01-28 | 6de8737 | [002-decouple-playerlist-component-into-separ](./quick/002-decouple-playerlist-component-into-separ/)     |
| 003 | Split Phase 5 into Building/Trading/Robber phases                      | 2026-01-29 | 6787c3d | [003-split-phase-5-into-building-trading-robber](./quick/003-split-phase-5-into-building-trading-robber/) |
| 004 | Split Phase 8 into Development Cards/Longest Road/Largest Army/Victory | 2026-01-29 | 6f16728 | [004-split-phase-8-into-4-phases](./quick/004-split-phase-8-into-4-phases/)                               |
| 005 | Add debug panel with current game state                                | 2026-01-30 | a2c5f89 | [005-add-debug-panel-with-current-game-state-](./quick/005-add-debug-panel-with-current-game-state-/)     |

## Decisions

| Phase | Decision                       | Rationale                                                                     |
| ----- | ------------------------------ | ----------------------------------------------------------------------------- |
| 03    | Rounded coordinate keys        | Use EPSILON=0.1 to handle floating point precision in vertex deduplication    |
| 03    | Sorted edge IDs                | Sort endpoints to normalize edge direction (A->B equals B->A)                 |
| 03    | 0-based turn indexing          | Simplify turn math (Math.floor(turn/2)) vs tracking round/player separately   |
| 03    | Simplified messages            | Placement messages only send ID (vertex/edge), not raw hex coordinates        |
| 03    | Backend State Manager          | GameManager instance attached to Room controls logic, distinct from data      |
| 03    | Client-side validation         | Calculate valid locations on client for immediate UI feedback                 |
| 03    | Selector hooks pattern         | Use specific hooks to access store state to prevent re-render anti-patterns   |
| 03    | Split markers                  | Separate VertexMarker/EdgeMarker components for clean geometry handling       |
| 03    | Native SVG tooltips            | Use simple <title> tags for accessibility and performance                     |
| 03    | Store-based color              | Derive player color from store nickname instead of prop drilling              |
| 03    | Store Room State               | Move room/player data into gameStore to avoid prop drilling in UI components  |
| 03    | UI Component Split             | Separate PlacementBanner and DraftOrderDisplay for cleaner Game layout        |
| 03    | Lobby owns WebSocket           | Lobby.tsx handles all WebSocket messages including gameplay during placement  |
| 03    | Phase transition               | clearPlacementState() clears placement UI, enabling main game phase UI        |
| 03    | Resource state tracking        | Use Record<string, PlayerResources> for flexible per-player resource tracking |
| 03    | Display all resources          | Show all 5 resource types even at 0 for consistent layout                     |
| 04    | TurnPhase enum                 | Uses 'roll' \| 'main' only - 'end' is a transition not a discrete state       |
| 04    | resourcesDistributed           | Include in DiceRolled message for client animation of all players             |
| 04    | turnState nullable             | Null during placement phase, initialized when setup completes                 |
| 04    | Robber deferred                | Dice roll 7 distributes resources normally until Phase 6                      |
| 04    | Separate turn player ID        | turnCurrentPlayerId distinct from placement currentPlayerId during transition |
| 04    | TurnControls visibility        | Component returns null when turnPhase is null (during placement phase)        |
| 04    | Fan layout algorithm           | Cards overlap with -25px margin, rotation 4deg per card from center           |
| 04    | Dual-phase highlighting        | GamePlayerList uses turnCurrentPlayerId or placementPlayerId for highlighting |
| 04    | State update ordering          | setTurnState must be called before setDiceRoll to preserve dice values        |
| 05    | Separate main-game validators  | Setup validators require just-placed settlement; main-game allows any network |
| 05    | Reason-returning validators    | Functions return null or error string for clear user feedback                 |
| 05    | Build validation chain         | Turn → phase → limit → resources → placement order for specific errors        |
| 05    | Return resourcesSpent          | Build success includes spent resources for client animation                   |
| 05    | Main-game validators separate  | Different rules: connect to any owned network, not just last settlement       |
| 05    | useCanBuild returns reason     | Provides both canBuild boolean and disabledReason for clear UX                |
| 05    | Single placement per mode      | Build mode exits after single click for clear UX                              |
| 05    | Build overlay conditional      | PlacementOverlay renders for both placement phase AND build mode              |
| 05    | City tower shape               | Cities render with distinct tower/castle shape vs settlement house shape      |
| 06    | ResourceRecordSchema pattern   | Reusable z.record for trade offer resource maps                               |
| 06    | ActiveTrade separate           | Managed by GameManager, not included in GameStateSchema                       |
| 06    | Trade methods in GameManager   | Implemented full methods since 06-02 runs in parallel                         |
| 06    | Basic 4:1 bank ratio           | Bank trade validates 4:1 ratio; port logic added later                        |
| 06    | TradeSlice interface           | Separate interface for trade state in gameStore                               |
| 06    | Port access from shared        | Reuse getVertexFromCorner for port vertex calculation                         |
| 06    | Empty trade responses          | Responses start empty, filled as players respond (not pre-populated)          |
| 06    | Trade auto-cancel on turn end  | Active trade cleared in endTurn method for clean state management             |
| 06    | Click-to-select maritime       | Maritime trade uses clickable rows instead of dropdowns for simpler UX        |
| 06    | ResourceSelector reusable      | Extracted quantity +/- controls for use in both trade types                   |
| 06    | Blocking modal pattern         | Use opened={true} with no-op onClose for modal that requires action           |
| 06    | Combined resource updates      | Single updatePlayerResources call with all changes for efficiency             |
| 06    | Edge-to-corner mapping         | Edge i connects corners `(i+5)%6` and `i` for pointy-top hexes                |
| 07    | robberHexId nullable           | Null during setup, set to desert hex ID when game starts                      |
| 07    | 11 robber message schemas      | Full flow: discard phase, move phase, steal phase messages                    |
| 07    | Robber blocking filter         | Hexes matching robberHexId excluded from resource distribution                |
| 07    | Text chars for expand/collapse | Used ▲/▼ instead of icon library to avoid new dependency                      |
| 07    | Dual notification API          | Standalone showGameNotification + useGameNotifications hook for flexibility   |

## Session Continuity

Last session: 2026-01-30
Stopped at: Completed 07-06-PLAN.md (Action feedback system)
Resume file: .planning/phases/07-robber/07-07-PLAN.md
