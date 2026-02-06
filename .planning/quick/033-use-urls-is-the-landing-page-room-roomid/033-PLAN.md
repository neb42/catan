---
phase: quick-033
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/main.tsx
  - apps/web/src/app/app.tsx
  - apps/web/src/components/Lobby.tsx
  - apps/web/src/components/LandingForm.tsx
autonomous: true

must_haves:
  truths:
    - 'Navigating to / shows landing page with create/join options'
    - 'Navigating to /room/ABC123 attempts to join room ABC123'
    - 'In lobby state, /room/:roomId triggers normal lobby join flow'
    - 'In game state, /room/:roomId attempts rejoin using localStorage nickname'
    - 'If nickname not part of game, player cannot join and sees error'
  artifacts:
    - path: 'apps/web/src/main.tsx'
      provides: 'React Router Routes configuration'
      min_lines: 30
    - path: 'apps/web/src/app/app.tsx'
      provides: 'Route-aware component rendering logic'
      exports: ['App']
    - path: 'apps/web/src/components/Lobby.tsx'
      provides: 'URL parameter reading and auto-join logic'
      min_lines: 400
  key_links:
    - from: 'apps/web/src/main.tsx'
      to: 'react-router-dom'
      via: 'Routes, Route, useParams'
      pattern: "import.*Routes.*from 'react-router-dom'"
    - from: 'apps/web/src/components/Lobby.tsx'
      to: 'useParams'
      via: 'extract roomId from URL'
      pattern: 'useParams.*roomId'
---

<objective>
Implement URL-based routing for landing page and room joining.

Purpose: Enable shareable URLs that directly join rooms, supporting both lobby and in-game reconnection flows.
Output: Working routing with "/" as landing page and "/room/:roomId" for direct room access.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md

Current architecture:

- React Router DOM v7.12.0 is installed but only BrowserRouter is used
- Lobby.tsx currently manages state-based views ('create' | 'join' | 'lobby')
- Join flow already supports reconnection via nickname matching (lobby-handlers.ts lines 95-250)
- localStorage stores: catan_roomId, catan_nickname, catan_color
- Room state includes disconnectedPlayers Map for reconnection logic

Reconnection behavior (from Decision 12-01, 12-02):

- When joining with existing nickname in disconnectedPlayers, backend reconnects player
- If game started, backend sends full game state sync (lines 196-249)
- Frontend uses localStorage nickname for auto-fill
  </context>

<tasks>

<task type="auto">
  <name>Add React Router routes configuration</name>
  <files>apps/web/src/main.tsx</files>
  <action>
    Replace BrowserRouter wrapper with Routes and Route components:
    - Root route "/" renders App component without props (landing page)
    - Route "/room/:roomId" renders App component with roomId param accessible via useParams
    
    Keep existing MantineProvider, Notifications (commented), and StrictMode wrappers.
    
    Note: We're using react-router-dom v7, which has same API as v6 (Routes/Route components).
  </action>
  <verify>npx nx typecheck web</verify>
  <done>main.tsx contains Routes with "/" and "/room/:roomId" paths</done>
</task>

<task type="auto">
  <name>Update App component to read route params</name>
  <files>apps/web/src/app/app.tsx</files>
  <action>
    Modify App component to:
    1. Import useParams from react-router-dom
    2. Extract roomId from URL params: `const { roomId } = useParams<{ roomId?: string }>()`
    3. Pass roomId to Lobby component as prop
    
    Keep existing gameStarted logic and conditional rendering.
    
    Type: `useParams<{ roomId?: string }>()` to handle optional parameter.
  </action>
  <verify>npx nx typecheck web</verify>
  <done>App.tsx extracts roomId from URL and passes to Lobby</done>
</task>

<task type="auto">
  <name>Implement URL-based room joining in Lobby</name>
  <files>apps/web/src/components/Lobby.tsx, apps/web/src/components/LandingForm.tsx</files>
  <action>
    Lobby.tsx changes:
    1. Add roomIdFromUrl prop: `roomIdFromUrl?: string`
    2. On mount (useEffect with [roomIdFromUrl, isConnected] deps), if roomIdFromUrl exists and isConnected:
       - Load nickname from getNickname()
       - Call handleJoinRoom(roomIdFromUrl)
       - Set view to 'lobby'
    3. Remove existing localStorage roomId auto-fill logic (lines 52-62) - URL is now source of truth
    4. Keep localStorage color preference loading
    
    LandingForm.tsx changes:
    1. Import useNavigate from react-router-dom
    2. When user submits join form with roomId, navigate to `/room/${roomId.toUpperCase()}` instead of calling onJoin directly
    3. When user creates room, keep existing onCreate callback (backend assigns roomId, can't navigate yet)
    4. Remove roomId state and join form logic - navigation handles this now
    5. Simplify to show only "Start New Expedition" button (joining happens via URL)
    
    Flow:
    - User visits "/" → sees "Start New Expedition" button → creates room → backend returns roomId → needs URL update (separate task would handle this, for now keep existing flow)
    - User visits "/room/ABC123" → Lobby auto-joins ABC123 on mount
    - User on landing clicks friend's "/room/ABC123" link → navigates to route → auto-joins
    
    Reconnection flow (existing backend logic):
    - Backend checks if nickname in disconnectedPlayers (line 96)
    - If true, backend restores player state and sends full game state (lines 160-249)
    - Frontend receives game_state_sync and renders game
    - If nickname not in disconnectedPlayers and game started, backend returns error (room full or not part of game)
    
    Error handling:
    - If room not found, backend sends error message → show in UI
    - If nickname not part of game, backend sends error → show in UI
    - joinError state already exists for this
  </action>
  <verify>
    npm run dev (start dev server)
    1. Visit http://localhost:4200/ → should show landing page
    2. Visit http://localhost:4200/room/TESTID → should auto-attempt join
    3. Create room → note roomId → open /room/ROOMID in new tab → should join
    4. Verify console shows join_room message with correct roomId
  </verify>
  <done>
    - "/" shows landing page with create button only
    - "/room/:roomId" auto-joins room on mount if connected
    - Reconnection flow preserved (backend checks disconnectedPlayers)
    - Join errors display when room not found or player not allowed
  </done>
</task>

</tasks>

<verification>
Run dev server: `npm run dev`

Test flows:

1. **Landing page**: Visit "/" → see "Start New Expedition" button
2. **URL join (new player)**: Visit "/room/ABC123" (non-existent) → see room not found error
3. **URL join (lobby state)**: Create room → get roomId → open "/room/ROOMID" in new tab → should join lobby
4. **URL join (game state, valid player)**:
   - Start game with 2 players
   - Note one player's nickname
   - Close that player's tab (triggers disconnect)
   - Open "/room/ROOMID" in new tab with same nickname in localStorage → should rejoin game
5. **URL join (game state, invalid player)**:
   - Start game with 2 players
   - Open "/room/ROOMID" with different nickname → should see error (not part of game)

Check console for:

- join_room messages with correct roomId
- Backend responses (room_state or error)
- No duplicate join attempts
  </verification>

<success_criteria>

- Navigating to "/" shows landing page (create button only)
- Navigating to "/room/:roomId" triggers auto-join with roomId from URL
- Lobby state rooms allow new players to join via URL
- Game state rooms allow reconnection via URL if nickname matches disconnectedPlayers
- Game state rooms reject join via URL if nickname not part of game
- Errors display clearly when room not found or join rejected
- Type checking passes with no errors
  </success_criteria>

<output>
After completion, create `.planning/quick/033-use-urls-is-the-landing-page-room-roomid/033-SUMMARY.md`
</output>
