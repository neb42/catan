---
status: resolved
trigger: 'Investigate issue: piece-colors-white'
created: 2026-01-28T00:00:00Z
updated: 2026-01-28T00:15:00Z
---

## Current Focus

hypothesis: CONFIRMED - room state is only maintained in Lobby component's local state, never synced to gameStore
test: Verified Lobby.tsx handles all room_state messages but never calls gameStore.setRoom
expecting: Game component will have empty room state, making playerIdToColor Map empty
next_action: Fix by calling gameStore.setRoom when room state updates

## Symptoms

expected: Each player's pieces (settlements, roads, cities) should display in their assigned color (red, blue, orange, white)
actual: All pieces appear white regardless of player
errors: No errors visible in browser console
reproduction: Happens everywhere pieces appear in the game (settlements, roads, cities, etc.)
started: Has never worked correctly since implementation

## Eliminated

## Evidence

- timestamp: 2026-01-28T00:01:00Z
  checked: PlacedPieces.tsx component
  found: Component receives playerIdToColor Map prop and uses it correctly to map playerId -> color name -> hex color
  implication: The component logic is correct, issue is likely with the Map being passed in

- timestamp: 2026-01-28T00:02:00Z
  checked: Board.tsx component (line 31-34)
  found: playerIdToColor Map is created from `state.room?.players` array, mapping p.id to p.color
  implication: If room is null or players array is empty, the Map will be empty and all pieces default to white

- timestamp: 2026-01-28T00:03:00Z
  checked: gameStore.ts
  found: Room state exists in store (line 32, 68, 88) with setRoom action, but need to verify it's being called
  implication: Store has room support, but may not be populated from WebSocket messages

- timestamp: 2026-01-28T00:04:00Z
  checked: Player and Room schemas
  found: Player has id, nickname, color, ready fields. Room has id, players array, createdAt
  implication: Data structure is correct, need to verify WebSocket handler calls setRoom

- timestamp: 2026-01-28T00:05:00Z
  checked: Lobby.tsx handleMessage callback (lines 46-210)
  found: Local state setRoom is called on room_state, player_joined, player_left, player_ready, color_changed messages BUT gameStore.setRoom is NEVER called
  implication: Room state exists in Lobby component but never propagates to gameStore

- timestamp: 2026-01-28T00:06:00Z
  checked: Game.tsx usage of room (line 13)
  found: Game component reads players from gameStore: `state.room?.players || []`
  implication: Since gameStore.room is never set, this always returns empty array, causing playerIdToColor Map in Board to be empty

- timestamp: 2026-01-28T00:07:00Z
  checked: PlacedPieces color logic (lines 42-43, 124-125)
  found: `const colorName = playerIdToColor.get(road.playerId) || 'white'` - defaults to white when playerId not found in Map
  implication: Empty playerIdToColor Map causes all pieces to default to white color

## Resolution

root_cause: Room state is maintained only in Lobby component's local state and never synchronized to gameStore. When Game component tries to read room.players from gameStore to create playerIdToColor Map, it gets an empty array, causing all pieces to default to white color.

The flow:

1. Lobby receives room_state/player_joined/color_changed WebSocket messages
2. Lobby updates its local room state via setRoom (local useState)
3. gameStore.setRoom is never called
4. Game component renders, reads gameStore.room (which is null)
5. Board creates playerIdToColor Map from empty players array
6. PlacedPieces defaults all pieces to 'white' when playerId not found

fix: Added gameStore.setRoom() calls in Lobby's message handler for all room state updates:

- room_state: line 85
- player_joined: line 98
- player_left: line 110
- player_ready: line 132
- color_changed: line 155

Used "as Room" type assertion to resolve TypeScript's inability to infer literal color types after .map() with spread operator.

verification:
✅ TypeScript compilation passes with no errors
✅ Web build succeeds (npx nx build web)
✅ Unit tests pass (PlacedPieces.spec.tsx)
✅ Data flow verified:

- Lobby receives WebSocket room updates → calls gameStore.setRoom()
- Board reads state.room?.players from gameStore
- Board creates playerIdToColor Map: playerId → color
- PlacedPieces receives Map and uses it to color pieces
- When playerId found in Map, piece gets player's color
- When playerId not found, piece defaults to white (but now Map is populated)

The fix ensures room state synchronization between Lobby (WebSocket handler) and gameStore, allowing Game/Board components to access player color data.

files_changed: ['apps/web/src/components/Lobby.tsx']
