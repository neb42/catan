# Phase 2 Plan 3: Board Generation & Rendering Summary

**One-liner:** Implemented SVG-based board rendering with react-hexgrid and wired end-to-end game start flow.

## Execution Stats
- **Date:** 2026-01-27
- **Duration:** ~15 minutes
- **Plan:** 02-03
- **Phase:** Board Generation & Rendering

## Deliverables

### Board Rendering System
- Implemented `Board`, `TerrainHex`, `NumberToken`, and `Port` components
- Integrated `react-hexgrid` for hexagonal layout
- Used SVG patterns for terrain textures (referencing `/assets/tiles`)
- Implemented 6/8 highlighting for valid number tokens

### Game View Integration
- Created `Game` component with 4-quadrant layout
- Integrated `Board` component into the game view
- Updated `gameStore` to manage board state and game status

### End-to-End Game Start
- Updated `websocket` handler to generate board after countdown
- Updated `Lobby` to handle `game_started` message and populate store
- Updated `App` to transition from Lobby to Game view (persisting connection)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Restored GameStartingMessageSchema**
- **Found during:** Task 3 (Wiring game start)
- **Issue:** The API (`websocket.ts`) and Client (`Lobby.tsx`) both used `game_starting` message for the countdown, but this message type was missing from `libs/shared/src/schemas/messages.ts` (implied removed in Plan 02). This would cause schema validation failures.
- **Fix:** Restored `GameStartingMessageSchema` and added it to the `WebSocketMessageSchema` union.
- **Files modified:** `libs/shared/src/schemas/messages.ts`

**2. [Rule 3 - Blocking] Preserved Lobby connection during view switch**
- **Found during:** Task 3 (Wiring game start)
- **Issue:** `Lobby` component manages the WebSocket connection via `useWebSocket`. Standard conditional rendering (unmounting `Lobby` to show `Game`) would close the connection, breaking the game.
- **Fix:** Used CSS toggling (`display: none`) in `App.tsx` instead of conditional unmounting. This keeps `Lobby` (and its WebSocket) active while showing the `Game` view.
- **Files modified:** `apps/web/src/app/app.tsx`

## Decisions Made
- **Client-Side View Management:** Decided to manage view state (Lobby vs Game) in `gameStore` (`gameStarted` flag) rather than URL routing for this phase, to simplify connection management.
- **Timer Logic:** Implemented the game start timer on the server side (`setTimeout` in `websocket.ts`) to ensure authoritative start timing.

## Next Steps
- Implement client-side move validation
- Build the initial placement interface (Phase 3)
- Refactor WebSocket management to a global context or service to allow cleaner view transitions (Phase 8/Refactor)
