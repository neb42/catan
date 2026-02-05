---
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/Lobby.tsx
  - apps/api/src/handlers/lobby-handlers.ts
  - libs/shared/src/schemas/messages.ts
autonomous: true

must_haves:
  truths:
    - Player's selected color is saved to localStorage when changed
    - Player's last color auto-fills when joining a room
    - When last color is taken, next available color is auto-selected
  artifacts:
    - path: 'apps/web/src/components/Lobby.tsx'
      provides: 'localStorage save/load for player color'
      min_lines: 428
    - path: 'apps/api/src/handlers/lobby-handlers.ts'
      provides: 'Server-side color selection logic with fallback'
      min_lines: 373
    - path: 'libs/shared/src/schemas/messages.ts'
      provides: 'Updated JoinRoomMessage schema with optional preferredColor'
      min_lines: 695
  key_links:
    - from: 'apps/web/src/components/Lobby.tsx'
      to: 'localStorage'
      via: 'handleColorChange saves, useEffect loads'
      pattern: "localStorage.(get|set)Item\\('catan_color'"
    - from: 'apps/web/src/components/Lobby.tsx'
      to: 'join_room message'
      via: 'includes preferredColor in WebSocket message'
      pattern: "type: 'join_room'.*preferredColor"
    - from: 'apps/api/src/handlers/lobby-handlers.ts'
      to: 'getAvailableColor'
      via: 'checks preferredColor availability, falls back to getAvailableColor'
      pattern: "message\\.preferredColor.*getAvailableColor"
---

<objective>
Persist a player's last used color to localStorage and intelligently select it when joining rooms.

**Purpose:** Improve UX by remembering player color preferences across sessions while gracefully handling conflicts when the preferred color is already taken.

**Output:**

- Color saved to localStorage on every color change
- Preferred color sent with join_room message
- Server selects preferred color if available, otherwise next available color
  </objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md

**Current color selection logic:**

- Frontend: User manually clicks color swatch in LobbyPlayerList component
- handleColorChange in Lobby.tsx sends change_color message to server
- Server validates color not taken, updates player.color, broadcasts to room

**Current storage:**

- localStorage already used for `catan_roomId` and `catan_nickname`
- Pattern: namespace with `catan_` prefix to avoid conflicts

**Color flow:**

1. **Create room:** Server calls `getAvailableColor(room)` which returns first available from ['red', 'blue', 'green', 'yellow']
2. **Join room:** Server calls `getAvailableColor(room)` same logic
3. **Change color:** Client sends change_color message, server validates and updates

**Colors available:**

- PLAYER_COLORS = ['red', 'blue', 'white', 'orange', 'green', 'yellow', 'purple', 'brown']
- Current getAvailableColor only checks ['red', 'blue', 'green', 'yellow']
  </context>

<tasks>

<task type="auto">
  <name>Update JoinRoomMessage schema to include optional preferredColor</name>
  <files>libs/shared/src/schemas/messages.ts</files>
  <action>
    1. Locate JoinRoomMessageSchema definition (around line 56-62)
    2. Add optional `preferredColor` field to schema:
       ```typescript
       preferredColor: z.enum(PLAYER_COLORS).optional(),
       ```
    3. Import PLAYER_COLORS at top if not already imported
    4. This allows client to send preferred color with join request without breaking existing messages
  </action>
  <verify>
    Run: `cd libs/shared && npx tsc --noEmit`
    No TypeScript errors in shared schemas
  </verify>
  <done>
    JoinRoomMessage type includes optional preferredColor field that accepts any valid player color
  </done>
</task>

<task type="auto">
  <name>Add localStorage persistence for player color in frontend</name>
  <files>apps/web/src/components/Lobby.tsx</files>
  <action>
    1. In existing localStorage useEffect (lines 32-43), add load for saved color:
       ```typescript
       const savedColor = localStorage.getItem('catan_color');
       if (savedColor) {
         // Store in state to send with join_room
       }
       ```
    
    2. Add state to track saved color preference:
       ```typescript
       const [preferredColor, setPreferredColor] = useState<string | null>(null);
       ```
       Place with other useState declarations around line 30
    
    3. Update handleColorChange callback (around line 121) to save to localStorage:
       ```typescript
       const handleColorChange = useCallback(
         (color: Player['color']) => {
           if (!currentPlayerId) return;
           localStorage.setItem('catan_color', color);
           setPreferredColor(color);
           sendMessage({ type: 'change_color', playerId: currentPlayerId, color });
         },
         [currentPlayerId, sendMessage],
       );
       ```
    
    4. Update handleJoinRoom (around line 104) to include preferredColor in message:
       ```typescript
       sendMessage({
         type: 'join_room',
         roomId: roomCode,
         nickname: nickname.trim(),
         preferredColor: preferredColor || undefined,
       });
       ```
    
    5. Update handleCreateRoom (around line 94) to include preferredColor:
       ```typescript
       sendMessage({ 
         type: 'create_room', 
         nickname: nickname.trim(),
         preferredColor: preferredColor || undefined,
       });
       ```
       Note: create_room also needs preferredColor added to shared schema
  </action>
  <verify>
    Run: `cd apps/web && npx tsc --noEmit`
    No TypeScript errors in Lobby component
  </verify>
  <done>
    - Player color saved to localStorage on every color change
    - Saved color loaded on mount and stored in preferredColor state
    - preferredColor sent with join_room message (undefined if not set)
  </done>
</task>

<task type="auto">
  <name>Update server-side color selection to use preferredColor with fallback</name>
  <files>apps/api/src/handlers/lobby-handlers.ts</files>
  <action>
    1. Update handleCreateRoom (line 28) to check message.preferredColor:
       ```typescript
       // After creating room, before creating player (around line 39-40)
       let color = message.preferredColor;
       
       // Check if preferred color is available
       if (color) {
         const colorTaken = Array.from(room.players.values()).some(p => p.color === color);
         if (colorTaken) {
           color = getAvailableColor(room) ?? PLAYER_COLORS[0];
         }
       } else {
         color = getAvailableColor(room) ?? PLAYER_COLORS[0];
       }
       
       const player: ManagedPlayer = {
         id: randomUUID(),
         nickname: message.nickname,
         color,
         ready: false,
         ws,
       };
       ```
       Replace existing lines 40-47
    
    2. Update handleJoinRoom (line 69) new player logic to check message.preferredColor:
       ```typescript
       // In new player validation block (around line 96-100)
       let color = message.preferredColor;
       
       // Check if preferred color is available
       if (color) {
         const colorTaken = Array.from(room.players.values()).some(p => p.color === color);
         if (colorTaken) {
           color = getAvailableColor(room);
         }
       } else {
         color = getAvailableColor(room);
       }
       
       if (!color) {
         sendError(ws, 'Room is full');
         return;
       }
       
       const player: ManagedPlayer = { ... };
       ```
       Replace existing lines 96-108
    
    3. IMPORTANT: Do NOT change reconnection flow (lines 127-151) - reconnected players keep their original color
    
    4. Also need to update CreateRoomMessageSchema in libs/shared/src/schemas/messages.ts to include optional preferredColor field (same as JoinRoomMessage)
  </action>
  <verify>
    Run: `cd apps/api && npx tsc --noEmit`
    No TypeScript errors in lobby handlers
  </verify>
  <done>
    - Server checks preferredColor when provided in join_room or create_room
    - If preferred color available, assigns it to player
    - If preferred color taken, falls back to getAvailableColor logic
    - Reconnecting players keep their original color (no change to reconnection flow)
  </done>
</task>

</tasks>

<verification>
**Manual testing:**
1. Join a room, select a color (e.g., blue), refresh page
   - Expected: Blue is pre-selected when rejoining
2. Join room with blue, open second browser tab, join same room
   - Expected: Second player gets next available color (not blue)
3. Create room without having joined before
   - Expected: Gets default first available color

**Browser DevTools:**

- Check localStorage has `catan_color` key after color selection
- Network tab shows `preferredColor` in WebSocket join_room message
  </verification>

<success_criteria>

- [ ] Player's color choice persists to localStorage on every change
- [ ] Saved color is sent with join_room and create_room messages
- [ ] Server assigns preferred color when available
- [ ] Server falls back to next available color when preferred is taken
- [ ] TypeScript compiles without errors in all three packages
- [ ] Manual testing confirms behavior works as described
      </success_criteria>

<output>
After completion, create `.planning/quick/028-persist-a-players-last-used-color-to-loc/028-SUMMARY.md`
</output>
