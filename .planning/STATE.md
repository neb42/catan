# State

**Project:** Catan Online  
**Version:** v1  
**Last Updated:** 2026-02-08  
**Last activity:** 2026-02-08 - Completed 14-04-PLAN.md (Integrate statistics display into VictoryModal)

## Current Position

Phase: 14 of 14 (Victory Stats and Rematch)  
Plan: 4 of 6 in current phase  
Status: In progress  
Last activity: 2026-02-08 - Completed 14-04-PLAN.md

Progress: ████████████████████████████████████████████████████████████████████████████████████████████████████ (81/84 plans complete - 96.4%)

## Blockers/Concerns

- None

## Roadmap Evolution

- Phase 13 added: Deployment. Create a docker multi-stage docker image building the web and api apps. The api serves the web static content. Create terrform deployment to google cloud platform. Focus on cost reduction.
- Phase 14 added: Victory Stats and Rematch - Add statistics (dice roll, dev card, resource distributions) to victory modal, improve styling, and add rematch button

### Quick Tasks Completed

| #   | Description                                                            | Date       | Commit  | Directory                                                                                                 |
| --- | ---------------------------------------------------------------------- | ---------- | ------- | --------------------------------------------------------------------------------------------------------- |
| 002 | Decouple PlayerList component into separate lobby and game components  | 2026-01-28 | 6de8737 | [002-decouple-playerlist-component-into-separ](./quick/002-decouple-playerlist-component-into-separ/)     |
| 003 | Split Phase 5 into Building/Trading/Robber phases                      | 2026-01-29 | 6787c3d | [003-split-phase-5-into-building-trading-robber](./quick/003-split-phase-5-into-building-trading-robber/) |
| 004 | Split Phase 8 into Development Cards/Longest Road/Largest Army/Victory | 2026-01-29 | 6f16728 | [004-split-phase-8-into-4-phases](./quick/004-split-phase-8-into-4-phases/)                               |
| 005 | Add debug panel with current game state                                | 2026-01-30 | a2c5f89 | [005-add-debug-panel-with-current-game-state-](./quick/005-add-debug-panel-with-current-game-state-/)     |
| 007 | Log all WebSocket messages to per-room log files for debugging         | 2026-01-31 | 59dc82d | [007-api-log-websocket-messages-to-file](./quick/007-api-log-websocket-messages-to-file/)                 |
| 008 | Show true score with VP cards to card owner only                       | 2025-06-10 | b656938 | [008-show-true-score-with-vp-cards-to-card-ow](./quick/008-show-true-score-with-vp-cards-to-card-ow/)     |
| 009 | Refactor GamePlayerList to vertical card layout                        | 2026-02-04 | e3727f7 | [009-refactor-the-gameplayerlist-component-to](./quick/009-refactor-the-gameplayerlist-component-to/)     |
| 010 | Change layout to CSS Grid with 2 rows × 3 columns                      | 2026-02-04 | 1176090 | [010-change-the-layout-to-be-a-grid-with-two-](./quick/010-change-the-layout-to-be-a-grid-with-two-/)     |
| 011 | Make the board a fixed size and zoomable                               | 2026-02-04 | f8dd536 | [011-make-the-board-a-fixed-size-and-zoomable](./quick/011-make-the-board-a-fixed-size-and-zoomable/)     |
| 012 | Apply GamePlayerList style to ResourceHand                             | 2026-02-04 | e9617b1 | [012-apply-gameplayerlist-style-to-resourceha](./quick/012-apply-gameplayerlist-style-to-resourceha/)     |
| 013 | Replace emojis with tile icons                                         | 2026-02-04 | 8da2e9c | [013-replace-emojis-with-tile-icons](./quick/013-replace-emojis-with-tile-icons/)                         |
| 014 | Apply GamePlayerList style to BuildControls                            | 2026-02-04 | 251e2d6 | [014-apply-the-style-of-the-gameplayerlist-co](./quick/014-apply-the-style-of-the-gameplayerlist-co/)     |
| 015 | Merge DevCardHand into ResourceHand component                          | 2026-02-04 | 67129d6 | [015-move-the-development-cards-into-the-same](./quick/015-move-the-development-cards-into-the-same/)     |
| 016 | Apply GamePlayerList style to DiceRoller                               | 2026-02-04 | 719d548 | [016-apply-the-style-of-the-gameplayerlist-co](./quick/016-apply-the-style-of-the-gameplayerlist-co/)     |
| 017 | Apply GamePlayerList style to TurnControls                             | 2026-02-04 | f1466b5 | [017-apply-the-style-of-the-gameplayerlist-co](./quick/017-apply-the-style-of-the-gameplayerlist-co/)     |
| 018 | Redesign development cards to playing card aesthetic                   | 2026-02-04 | 9951acd | [018-redesign-the-development-cards-to-look-m](./quick/018-redesign-the-development-cards-to-look-m/)     |
| 019 | Restyle TradeButton to match ResourceHand aesthetic                    | 2026-02-04 | 9600171 | [019-restyle-the-tradebutton-to-make-it-match](./quick/019-restyle-the-tradebutton-to-make-it-match/)     |
| 020 | Apply parchment aesthetic to all modal components                      | 2026-02-04 | 2e99ddd | [020-apply-the-style-of-the-gameplayerlist-co](./quick/020-apply-the-style-of-the-gameplayerlist-co/)     |
| 021 | Apply parchment aesthetic to PlacementBanner and DraftOrderDisplay     | 2026-02-04 | 9427c3c | [021-apply-the-style-of-the-gameplayerlist-co](./quick/021-apply-the-style-of-the-gameplayerlist-co/)     |
| 022 | Restyle Dev Card button to match BuildButton design                    | 2026-02-04 | 8541676 | [022-restyle-dev-card-button-to-align-with-bu](./quick/022-restyle-dev-card-button-to-align-with-bu/)     |
| 023 | Apply parchment aesthetic to robber and victory modals                 | 2026-02-04 | 33c21a7 | [023-apply-the-style-of-the-gameplayerlist-co](./quick/023-apply-the-style-of-the-gameplayerlist-co/)     |
| 024 | Simplify the bank trade UI                                             | 2026-02-04 | 6190cf9 | [024-simplify-the-bank-trade-ui](./quick/024-simplify-the-bank-trade-ui/)                                 |
| 025 | Add land-colored background with rounded corners behind hexagons       | 2026-02-04 | 865606d | [025-add-a-land-coloured-background-to-the-he](./quick/025-add-a-land-coloured-background-to-the-he/)     |
| 026 | Refactor WebSocket handler into modular domain handlers                | 2026-02-05 | a3b2bc9 | [026-refactor-handlewebsocketconnection-into-](./quick/026-refactor-handlewebsocketconnection-into-/)     |
| 027 | Apply parchment aesthetic to GameLog component                         | 2026-02-05 | fbabeb5 | [027-apply-the-style-of-the-gameplayerlist-co](./quick/027-apply-the-style-of-the-gameplayerlist-co/)     |
| 028 | Persist player's last used color to localStorage                       | 2026-02-05 | 545b198 | [028-persist-a-players-last-used-color-to-loc](./quick/028-persist-a-players-last-used-color-to-loc/)     |
| 029 | Update terraform to use Cloud Build connected to repo                  | 2026-02-06 | 35193d2 | [029-update-terraform-to-use-cloud-build-con](./quick/029-update-terraform-to-use-cloud-build-con/)       |
| 031 | Change nickname field to be set while in lobby                         | 2026-02-06 | 86b4d8f | [031-change-nickname-field-to-be-set-while-in](./quick/031-change-nickname-field-to-be-set-while-in/)     |
| 032 | Remove nickname entry from landing page                                | 2026-02-06 | d19aefd | [032-remove-nickname-entry-from-landing-page-](./quick/032-remove-nickname-entry-from-landing-page-/)     |
| 033 | Use URLs for landing page and room joining (/ and /room/:roomId)       | 2026-02-06 | a5b46e1 | [033-use-urls-is-the-landing-page-room-roomid](./quick/033-use-urls-is-the-landing-page-room-roomid/)     |
| 034 | Fix URL routing navigation and player recognition                      | 2026-02-06 | 6edb200 | [034-fix-url-routing-navigate-to-room-roomid-](./quick/034-fix-url-routing-navigate-to-room-roomid-/)     |
| 035 | Fix duplicate player on room creation                                  | 2026-02-06 | bbad94f | [035-fix-duplicate-player-on-room-creation-by](./quick/035-fix-duplicate-player-on-room-creation-by/)     |

## Decisions

| Phase  | Decision                          | Rationale                                                                          |
| ------ | --------------------------------- | ---------------------------------------------------------------------------------- |
| 03     | Rounded coordinate keys           | Use EPSILON=0.1 to handle floating point precision in vertex deduplication         |
| 03     | Sorted edge IDs                   | Sort endpoints to normalize edge direction (A->B equals B->A)                      |
| 03     | 0-based turn indexing             | Simplify turn math (Math.floor(turn/2)) vs tracking round/player separately        |
| 03     | Simplified messages               | Placement messages only send ID (vertex/edge), not raw hex coordinates             |
| 03     | Backend State Manager             | GameManager instance attached to Room controls logic, distinct from data           |
| 03     | Client-side validation            | Calculate valid locations on client for immediate UI feedback                      |
| 03     | Selector hooks pattern            | Use specific hooks to access store state to prevent re-render anti-patterns        |
| 026    | Domain handler organization       | Split WebSocket handlers by game domain (lobby, placement, turn, building, etc.)   |
| 03     | Split markers                     | Separate VertexMarker/EdgeMarker components for clean geometry handling            |
| 03     | Native SVG tooltips               | Use simple <title> tags for accessibility and performance                          |
| 03     | Store-based color                 | Derive player color from store nickname instead of prop drilling                   |
| 03     | Store Room State                  | Move room/player data into gameStore to avoid prop drilling in UI components       |
| 03     | UI Component Split                | Separate PlacementBanner and DraftOrderDisplay for cleaner Game layout             |
| 03     | Lobby owns WebSocket              | Lobby.tsx handles all WebSocket messages including gameplay during placement       |
| 03     | Phase transition                  | clearPlacementState() clears placement UI, enabling main game phase UI             |
| 03     | Resource state tracking           | Use Record<string, PlayerResources> for flexible per-player resource tracking      |
| 03     | Display all resources             | Show all 5 resource types even at 0 for consistent layout                          |
| 04     | TurnPhase enum                    | Uses 'roll' \| 'main' only - 'end' is a transition not a discrete state            |
| 04     | resourcesDistributed              | Include in DiceRolled message for client animation of all players                  |
| 04     | turnState nullable                | Null during placement phase, initialized when setup completes                      |
| 04     | Robber deferred                   | Dice roll 7 distributes resources normally until Phase 6                           |
| 04     | Separate turn player ID           | turnCurrentPlayerId distinct from placement currentPlayerId during transition      |
| 04     | TurnControls visibility           | Component returns null when turnPhase is null (during placement phase)             |
| 04     | Fan layout algorithm              | Cards overlap with -25px margin, rotation 4deg per card from center                |
| 04     | Dual-phase highlighting           | GamePlayerList uses turnCurrentPlayerId or placementPlayerId for highlighting      |
| 04     | State update ordering             | setTurnState must be called before setDiceRoll to preserve dice values             |
| 05     | Separate main-game validators     | Setup validators require just-placed settlement; main-game allows any network      |
| 05     | Reason-returning validators       | Functions return null or error string for clear user feedback                      |
| 05     | Build validation chain            | Turn → phase → limit → resources → placement order for specific errors             |
| 05     | Return resourcesSpent             | Build success includes spent resources for client animation                        |
| 05     | Main-game validators separate     | Different rules: connect to any owned network, not just last settlement            |
| 05     | useCanBuild returns reason        | Provides both canBuild boolean and disabledReason for clear UX                     |
| 05     | Single placement per mode         | Build mode exits after single click for clear UX                                   |
| 05     | Build overlay conditional         | PlacementOverlay renders for both placement phase AND build mode                   |
| 05     | City tower shape                  | Cities render with distinct tower/castle shape vs settlement house shape           |
| 06     | ResourceRecordSchema pattern      | Reusable z.record for trade offer resource maps                                    |
| 06     | ActiveTrade separate              | Managed by GameManager, not included in GameStateSchema                            |
| 06     | Trade methods in GameManager      | Implemented full methods since 06-02 runs in parallel                              |
| 06     | Basic 4:1 bank ratio              | Bank trade validates 4:1 ratio; port logic added later                             |
| 06     | TradeSlice interface              | Separate interface for trade state in gameStore                                    |
| 06     | Port access from shared           | Reuse getVertexFromCorner for port vertex calculation                              |
| 06     | Empty trade responses             | Responses start empty, filled as players respond (not pre-populated)               |
| 06     | Trade auto-cancel on turn end     | Active trade cleared in endTurn method for clean state management                  |
| 06     | Click-to-select maritime          | Maritime trade uses clickable rows instead of dropdowns for simpler UX             |
| 06     | ResourceSelector reusable         | Extracted quantity +/- controls for use in both trade types                        |
| 06     | Blocking modal pattern            | Use opened={true} with no-op onClose for modal that requires action                |
| 06     | Combined resource updates         | Single updatePlayerResources call with all changes for efficiency                  |
| 06     | Edge-to-corner mapping            | Edge i connects corners `(i+5)%6` and `i` for pointy-top hexes                     |
| 07     | robberHexId nullable              | Null during setup, set to desert hex ID when game starts                           |
| 07     | 11 robber message schemas         | Full flow: discard phase, move phase, steal phase messages                         |
| 07     | Robber blocking filter            | Hexes matching robberHexId excluded from resource distribution                     |
| 07     | Text chars for expand/collapse    | Used ▲/▼ instead of icon library to avoid new dependency                           |
| 07     | Dual notification API             | Standalone showGameNotification + useGameNotifications hook for flexibility        |
| 07     | Targeted WebSocket messages       | Use getPlayerWebSocket for player-specific messages (discard_required)             |
| 07     | Broadcast robber_triggered        | All clients receive notification when robber flow starts                           |
| 07     | RobberSlice in gameStore          | Separate interface for discard, placement, and steal state                         |
| 07     | Combined useDiscardState hook     | Multi-property selector prevents re-render anti-patterns                           |
| 07     | Blocking DiscardModal             | opened=true with no-op onClose forces completion                                   |
| 07     | StealModal reuses pattern         | Same blocking modal pattern as DiscardModal for consistent UX                      |
| 07     | Block all players during discard  | WaitingForDiscardsOverlay blocks non-discarding players during robber flow         |
| 08     | OwnedDevCard purchasedOnTurn      | Track purchase turn for same-turn play restriction (DEV-03)                        |
| 08     | Separate purchase messages        | DevCardPurchased vs DevCardPurchasedPublic hides VP cards from opponents           |
| 08     | YearOfPlentySelect uses tuple     | z.tuple enforces exactly 2 resources at type level                                 |
| 08     | RoadBuildingPlace per-road        | Single edge per message for sequential placement with UI updates                   |
| 08     | Index pointer for deck access     | Use deckIndex instead of mutating deck array for immutability                      |
| 08     | Pure function logic extraction    | Dev card validation in dev-card-logic.ts following robber-logic pattern            |
| 08     | DevCardSlice pattern              | Separate interface for dev card state in gameStore                                 |
| 08     | Knight before roll                | Knight cards can be played before rolling dice, other cards require main           |
| 08     | yearOfPlentyPending pattern       | Use boolean flags + pendingDevCardPlayerId for tracking card effect flow           |
| 08     | Blocking modal for card effects   | Consistent with DiscardModal - opened=true, no close button required               |
| 09     | Edge-based DFS tracking           | Track visited edges not nodes - nodes can be revisited for loops                   |
| 09     | Opponent blocking only            | Opponent settlements block traversal, own settlements do NOT (Catan rules)         |
| 09     | Multi-start DFS                   | Run DFS from every vertex in network for correct result with disconnected segments |
| 09     | LongestRoadSlice pattern          | Follows DevCardSlice/RobberSlice pattern with useShallow for Record selectors      |
| 10     | Mirror longest-road pattern       | Largest army logic mirrors longest-road-logic.ts structure for consistency         |
| 10     | LargestArmySlice minimal          | Only holderId and knights fields needed; knightsPlayed already exists in store     |
| 11     | GameLifecyclePhaseSchema naming   | Distinct from GamePhaseSchema (placement phases like setup_settlement1)            |
| 11     | victoryPhase state machine        | 'none' -> 'reveal' -> 'modal' for victory animation flow                           |
| 11     | victoryPhase dismissed state      | 'dismissed' tracks closed modal; enables "Show Results" reopen button              |
| 12-03  | Countdown duration: 5 seconds     | User preference for anticipation without excessive wait                            |
| 12-03  | Countdown signal: -1 cancels      | secondsRemaining: -1 signals frontend to hide countdown when player unreadies      |
| 12-05  | 100dvh for mobile viewport        | Use dynamic viewport height instead of vh for Safari address bar compatibility     |
| 12-05  | 44px touch target minimum         | W3C WCAG 2.1 AAA guideline for mobile accessibility                                |
| 12-05  | 60% board scale on mobile         | Allows full board visibility on small screens without horizontal scroll            |
| 12-05  | Horizontal player list scroll     | More natural touch interaction for mobile than vertical stacking                   |
| 11     | Auto-transition reveal            | VP reveal overlay auto-transitions to modal after 1.5 seconds                      |
| 12-04  | Simple string-based log entries   | No timestamps or turn numbers - keeps implementation simple and focused            |
| 12-04  | Notifications separate from log   | Toast notifications and log entries serve different purposes                       |
| 12-04  | Handlers call addLogEntry direct  | Each handler knows context and can format entries appropriately                    |
| 12-04  | Right-side panel positioning      | Follows common chat/log UI patterns and doesn't block main gameplay                |
| 12-01  | 30-second heartbeat interval      | Industry standard prevents network spam while detecting failures quickly           |
| 12-01  | Nickname-based reconnection       | Map disconnectedPlayers by nickname to allow same identity restoration             |
| 12-01  | No disconnect timeout             | Wait indefinitely for reconnection, room cleanup only when ALL players leave       |
| 12-01  | Separate pause state              | isPaused boolean and disconnectedPlayers map for clean state machine transitions   |
| 12-02  | 2-second reconnect delay          | Per user specification - balance awareness with automatic recovery                 |
| 12-02  | localStorage namespaced keys      | Use catan_roomId and catan_nickname to avoid conflicts with other apps             |
| 12-02  | Auto-fill not auto-reconnect      | Nickname auto-fills but user must click Join - prevents unwanted auto-join         |
| 12-02  | Full-screen blocking overlay      | z-index 10000, rgba background - strong visual block during disconnect             |
| 12-02  | Toast on reconnection             | Green notification, 3s auto-close - clear positive feedback                        |
| 027    | Left-side border radius only      | GameLog at right edge of screen needs rounded corners only on left side            |
| 027    | Transparent entry backgrounds     | Cleaner parchment look with subtle borders + hover instead of alternating rows     |
| 13-03  | EUR 5 default budget              | Aligns with cost optimization priority, reasonable threshold for demo project      |
| 13-03  | Four alert thresholds             | 50%, 80%, 100%, 120% provide progressive warnings with overspend protection        |
| 13-03  | Sensitive billing variables       | billing_account_id and alert_email marked sensitive to prevent log exposure        |
| 13-04  | Local-only deployment option      | Document Docker+Terraform validation without GCP costs for verification            |
| 13-04  | Dynamic WebSocket URL             | Use window.location for containerized environments instead of hardcoded localhost  |
| 033-01 | URL as source of truth            | Replace localStorage roomId auto-fill with URL-based routing for shareable links   |
| 033-02 | Navigate on join                  | LandingForm navigates to /room/:roomId instead of calling onJoin callback          |
| 033-03 | Auto-join on mount                | Lobby auto-joins room when roomIdFromUrl exists and WebSocket connected            |
| 14-02  | @mantine/charts for visualization | Native integration with Mantine UI, wraps Recharts for standard React charts       |
| 14-02  | Resource chart three subsections  | Distribution, net flow, trade activity per CONTEXT.md locked requirements          |
| 14-02  | Player colors in charts           | Use PLAYER_COLOR_HEX for visual player identification in all statistics            |
| 14-03  | New GameManager for rematch reset | Use new GameManager() instead of manual reset to prevent state leakage             |
| 14-03  | Unanimous rematch voting          | All players must vote for rematch to trigger game reset                            |
| 14-03  | Reset ready states on rematch     | Set all player.ready to false when rematch triggers for fresh countdown            |
| 14-01  | Server-side stats tracking        | GameStats in GameManager ensures data integrity and prevents client manipulation   |
| 14-01  | Separate gained/spent/traded      | Track production separately from trade activity to avoid inflating statistics      |
| 14-01  | Stats in victory broadcast        | Include stats in single atomic victory message for consistent client display       |
| 14-04  | Store gameStats in VictorySlice   | Keep victory-related data together in same slice for lifecycle management          |
| 14-04  | Conditional statistics rendering  | Only show StatisticsTabs if gameStats is not null for graceful handling            |
| 14-04  | Modal scroll capability           | maxHeight: 80vh and overflow: auto handles extensive statistics without breaking   |
| 035    | Set attemptedRoomId on creation   | Call setAttemptedRoomId in handleRoomCreated to prevent URL join useEffect trigger |

## Session Continuity

Last session: 2026-02-08T18:59:53Z
Stopped at: Completed 14-04-PLAN.md
Resume file: None
