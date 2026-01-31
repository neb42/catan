---
phase: quick-007
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/api/src/utils/message-logger.ts
  - apps/api/src/handlers/websocket.ts
autonomous: true

must_haves:
  truths:
    - 'Every WebSocket message received from a client is logged to file'
    - 'Every WebSocket message sent to a client is logged to file'
    - 'Log files are stored at ./logs/<room_id>-messages.log'
  artifacts:
    - path: 'apps/api/src/utils/message-logger.ts'
      provides: 'Message logging utility'
      exports: ['logMessage']
    - path: 'apps/api/src/handlers/websocket.ts'
      provides: 'WebSocket handler with logging'
      contains: 'logMessage'
  key_links:
    - from: 'apps/api/src/handlers/websocket.ts'
      to: 'apps/api/src/utils/message-logger.ts'
      via: 'import logMessage'
      pattern: 'logMessage.*roomId'
---

<objective>
Log all WebSocket messages (received and sent) for each game room to a file at `./logs/<room_id>-messages.log`.

Purpose: Enable debugging and replay of game sessions by capturing all message traffic.
Output: Message logger utility and integration with WebSocket handler.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/api/src/handlers/websocket.ts
@apps/api/src/main.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create message logger utility</name>
  <files>apps/api/src/utils/message-logger.ts</files>
  <action>
Create a message logger utility that:
1. Exports a `logMessage(roomId: string, direction: 'recv' | 'send', message: unknown)` function
2. Creates `./logs/` directory if it doesn't exist (use `fs.mkdirSync` with `recursive: true`)
3. Appends to `./logs/${roomId}-messages.log`
4. Log format: `[ISO timestamp] [direction] <JSON message>` (one line per message)
5. Use synchronous file operations (`fs.appendFileSync`) for simplicity - this is debug logging, not production telemetry

Example log line:

```
[2026-01-31T12:00:00.000Z] [recv] {"type":"create_room","nickname":"Player1"}
[2026-01-31T12:00:00.050Z] [send] {"type":"room_created","roomId":"ABC123",...}
```

  </action>
  <verify>File exists at apps/api/src/utils/message-logger.ts with logMessage export</verify>
  <done>Message logger utility created with appendFileSync to ./logs/<roomId>-messages.log</done>
</task>

<task type="auto">
  <name>Task 2: Integrate logging into WebSocket handler</name>
  <files>apps/api/src/handlers/websocket.ts</files>
  <action>
Modify websocket.ts to log all messages:

1. Import `logMessage` from `../utils/message-logger`

2. Log RECEIVED messages:
   - After successful `WebSocketMessageSchema.safeParse(parsed)`, call:
     `logMessage(currentRoomId || 'no-room', 'recv', message)`
   - Note: currentRoomId may be null for create_room/join_room - use 'no-room' or the roomId from message if available

3. Log SENT messages:
   - Wrap `sendMessage` to also log:
     ```typescript
     function sendMessage(
       socket: WebSocket,
       message: unknown,
       roomId?: string,
     ): void {
       if (socket.readyState === WebSocket.OPEN) {
         socket.send(JSON.stringify(message));
         if (roomId) {
           logMessage(roomId, 'send', message);
         }
       }
     }
     ```
   - Update all `sendMessage` calls to pass `currentRoomId` as third argument
   - For `roomManager.broadcastToRoom`, add logging in RoomManager OR wrap calls

4. Simpler approach: Add logging to RoomManager.broadcastToRoom method if cleaner

IMPORTANT: For messages sent before room is joined (create_room response), extract roomId from message if available.
</action>
<verify>
Run `npx nx build api` - should compile without errors.
Create a room via WebSocket client, verify ./logs/<roomId>-messages.log is created.
</verify>
<done>All WebSocket messages (recv/send) are logged to ./logs/<roomId>-messages.log</done>
</task>

</tasks>

<verification>
1. `npx nx build api` compiles successfully
2. Start API: `npx nx serve api`
3. Connect WebSocket client and create room
4. Check `./logs/` directory exists with `<roomId>-messages.log` file
5. Verify log contains both recv (from client) and send (to client) messages
</verification>

<success_criteria>

- Every message received from clients is logged with [recv] prefix
- Every message sent to clients is logged with [send] prefix
- Log files stored at ./logs/<room_id>-messages.log
- API builds and runs without errors
  </success_criteria>

<output>
After completion, create `.planning/quick/007-api-log-websocket-messages-to-file/007-SUMMARY.md`
</output>
