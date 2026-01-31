---
phase: quick-007
plan: 01
completed: 2026-01-31
duration: ~5 min
subsystem: api
tags: [websocket, logging, debugging]

requires: []
provides: [message-logger, debug-logging]
affects: []

tech-stack:
  added: []
  patterns: [file-logging, message-tracing]

key-files:
  created:
    - apps/api/src/utils/message-logger.ts
  modified:
    - apps/api/src/handlers/websocket.ts
    - apps/api/src/managers/RoomManager.ts
    - .gitignore

decisions:
  - id: sync-file-ops
    choice: Use synchronous appendFileSync for logging
    rationale: Debug logging, not production telemetry - simplicity over async

metrics:
  tasks-completed: 2
  tasks-total: 2
---

# Quick Task 007: API Log WebSocket Messages to File

**One-liner:** WebSocket message logging utility with recv/send tracing to per-room log files

## Summary

Added comprehensive WebSocket message logging for debugging and session replay:

1. Created `message-logger.ts` utility with `logMessage(roomId, direction, message)` function
2. Integrated logging into WebSocket handler for all message types
3. Logs stored at `./logs/<roomId>-messages.log`

## Implementation Details

### Message Logger Utility

- Uses synchronous file operations (`appendFileSync`) for simplicity
- Auto-creates `./logs/` directory if it doesn't exist
- Log format: `[ISO timestamp] [recv|send] <JSON message>`
- Wraps all file operations in try/catch to prevent logging failures from breaking the app

### WebSocket Integration

- **Received messages:** Logged after successful schema validation with `[recv]`
- **Sent messages:** Logged via updated `sendMessage` function and `broadcastToRoom`
- **Direct sends:** Added logging for targeted messages (discard_required, robber_move_required, steal_required, dev_card_purchased_public)

### Example Log Output

```
[2026-01-31T12:00:00.000Z] [recv] {"type":"create_room","nickname":"Player1"}
[2026-01-31T12:00:00.050Z] [send] {"type":"room_created","roomId":"ABC123",...}
[2026-01-31T12:00:01.000Z] [recv] {"type":"toggle_ready","playerId":"..."}
[2026-01-31T12:00:01.010Z] [send] {"type":"player_ready","playerId":"...","ready":true}
```

## Commits

| Hash    | Description                                                       |
| ------- | ----------------------------------------------------------------- |
| 459c5d7 | feat(quick-007): create message logger utility                    |
| 7478772 | feat(quick-007): integrate message logging into WebSocket handler |
| 59dc82d | chore(quick-007): add logs directory to gitignore                 |

## Deviations from Plan

### Auto-added Issues

**1. [Rule 2 - Missing Critical] Added logs/ to .gitignore**

- **Found during:** Post-implementation verification
- **Issue:** Log files would be committed to repository
- **Fix:** Added `logs` to `.gitignore`
- **Commit:** 59dc82d
