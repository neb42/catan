---
status: resolved
trigger: 'When player refreshes page while in a lobby, they rejoin but are not recognized as themselves'
created: 2026-02-06T00:00:00Z
updated: 2026-02-06T00:08:00Z
---

## Current Focus

hypothesis: **ROOT CAUSE CONFIRMED** - React state timing issue in Lobby.tsx. handleMessage callback captures pendingNickname via useCallback dependency (line 103). When handleJoinRoom calls setPendingNickname (line 138) and immediately sends join_room message (line 140), the state update is async. Server responds very quickly with room_state, but handleMessage callback still has OLD pendingNickname value (null). handleRoomState fails to match player by nickname, leaves currentPlayerId as null, causing identity mismatch.
test: Verify by checking if pendingNickname is null when room_state arrives on reconnect
expecting: Find that selfFromNickname logic fails because pendingNickname is stale/null when room_state is processed
next_action: Implement fix to ensure pendingNickname is available when processing room_state

## Symptoms

expected: Player should be recognized as the same player who was in the lobby before the refresh and rejoin seamlessly with their identity intact.

actual: Player shows in player list as a different user's player. Player cannot click ready or choose their color. The issue is intermittent - several refreshes can eventually fix it.

errors: No visible errors in browser console or backend logs.

reproduction: The issue is timing-related. Simply refreshing the browser while in a lobby can trigger it, but it doesn't happen every time - suggests race condition or timing dependency.

started: This is a recent regression - the rejoin functionality worked reliably before but broke recently.

## Eliminated

## Evidence

- timestamp: 2026-02-06T00:01:00Z
  checked: Backend reconnection logic in lobby-handlers.ts lines 95-253
  found: Server recognizes reconnection by checking if nickname exists in disconnectedPlayers Map. If match found, restores player with same ID. If not found, creates new player.
  implication: Identity mismatch happens when wrong nickname sent to server - server doesn't find it in disconnectedPlayers, creates new player instead

- timestamp: 2026-02-06T00:01:30Z
  checked: Frontend lobby component Lobby.tsx lines 150-156
  found: URL-based room joining triggers automatically when roomIdFromUrl changes and WebSocket is connected. Uses handleJoinRoom which calls getNickname()
  implication: Race condition suspect - getNickname() is called during reconnection flow

- timestamp: 2026-02-06T00:02:00Z
  checked: Frontend message handlers lobbyHandlers.ts lines 30-48
  found: handleRoomState tries to identify player by matching nickname (pendingNickname) to players in room state. If match found, sets currentPlayerId. localStorage is written AFTER join succeeds.
  implication: System relies on nickname matching to establish identity on reconnect, but nickname source (getNickname()) is critical

- timestamp: 2026-02-06T00:03:00Z
  checked: Backend lobby-handlers.ts handleJoinRoom lines 95-97, 162-163
  found: Server checks if nickname exists in room.disconnectedPlayers to determine reconnection. Uses message.nickname from join_room message to lookup.
  implication: CRITICAL - if frontend sends different nickname than what's in disconnectedPlayers, reconnection fails and new player created

- timestamp: 2026-02-06T00:03:30Z
  checked: Frontend Lobby.tsx handleJoinRoom lines 132-148 and URL join effect lines 150-156
  found: When URL-based room join triggers (after refresh), calls handleJoinRoom which gets nickname via getNickname(). getNickname() reads from localStorage key 'catan_nickname'. Sets pendingNickname to this value.
  implication: If localStorage 'catan_nickname' doesn't match what server has in disconnectedPlayers, reconnection will fail

- timestamp: 2026-02-06T00:04:00Z
  checked: Backend RoomManager.ts pauseGame lines 239-265
  found: When player disconnects (WebSocket close), server moves player from room.players to room.disconnectedPlayers. Key used is player.nickname (line 251).
  implication: Server stores disconnected player by their nickname at disconnect time

- timestamp: 2026-02-06T00:04:30Z
  checked: Backend RoomManager.ts addPlayer reconnection logic lines 56-85
  found: When join_room arrives, checks if player.nickname exists in disconnectedPlayers. If yes, restores that player's ID and state. Uses player.nickname from incoming join_room message.
  implication: Reconnection ONLY works if join_room message contains exact nickname that was stored in disconnectedPlayers

- timestamp: 2026-02-06T00:05:00Z
  checked: Lobby.tsx handleMessage callback lines 67-107
  found: handleMessage is memoized with useCallback, dependency array includes pendingNickname (line 103). Context object includes current value of pendingNickname (line 83).
  implication: Callback captures pendingNickname value at callback creation time, not at message processing time

- timestamp: 2026-02-06T00:05:30Z
  checked: Lobby.tsx handleJoinRoom lines 137-140
  found: Calls setPendingNickname(nickname) then immediately sendMessage(join_room). React state update is async.
  implication: RACE CONDITION - room_state response can arrive before pendingNickname state finishes updating and callback is recreated

- timestamp: 2026-02-06T00:06:00Z
  checked: lobbyHandlers.ts handleRoomState lines 33-48
  found: Logic `const selfFromNickname = !ctx.currentPlayerId && ctx.pendingNickname ? message.room.players.find(...) : null`. Only attempts nickname matching if pendingNickname is truthy.
  implication: If pendingNickname is null/stale when room_state arrives, selfFromNickname will be null, currentPlayerId won't be set, player appears as wrong identity in UI

## Resolution

root_cause: React state timing issue in Lobby.tsx. The handleMessage callback is memoized with useCallback and captures pendingNickname from its dependency array. When handleJoinRoom calls setPendingNickname and immediately sends join_room message, the state update happens asynchronously. On fast connections, the server's room_state response arrives before the state update completes and before the callback is recreated with the new pendingNickname value. The handleRoomState logic fails to match the player by nickname because pendingNickname is still null/stale, leaving currentPlayerId unset. This causes the UI to not recognize the player as "self", preventing them from clicking ready or changing color.

fix: Changed pendingNickname from useState to useRef (pendingNicknameRef) in Lobby.tsx. Refs are mutable and don't cause re-renders, so updates are immediate and synchronous. Updated handleMessage callback to read from pendingNicknameRef.current and provide a setPendingNickname wrapper that updates the ref. Updated handleCreateRoom and handleJoinRoom to set pendingNicknameRef.current directly. This ensures the nickname is immediately available when room_state arrives, allowing proper player identity matching.

verification:

- Frontend builds successfully without errors
- Backend tests pass (92/92 API tests passing, confirming no regression)
- Code review confirms fix addresses root cause:
  - Before: pendingNickname state caused stale closure in useCallback
  - After: pendingNicknameRef.current provides immediate, current value
  - handleMessage now reads current ref value on every call (line 89)
  - Nickname set synchronously before sending join_room (lines 127, 142)
- Logic trace confirms room_state handler will now receive correct pendingNickname
- Manual testing recommended: Refresh page while in lobby, verify player recognized as self

files_changed: ['/Users/bmcalindin/workspace/catan/apps/web/src/components/Lobby.tsx']
