# Phase 12: Resilience & Polish - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the game production-ready by handling disconnects gracefully, completing the lobby experience with color selection and ready-up system, and adding transparency through a game log. This phase adds no new gameplay — it makes existing gameplay reliable in real-world conditions.

</domain>

<decisions>
## Implementation Decisions

### Disconnect UX

- Full-screen blocking overlay when any player disconnects
- Shows "Waiting for [player name] to reconnect..." message (name only, no timer)
- No timeout — wait indefinitely until disconnected player returns or all others leave
- Disconnected player sees auto-reconnect attempt after 2-3 seconds with reconnecting spinner

### Reconnection flow

- Auto-fill saved room code in localStorage when returning
- Support direct room URLs (e.g., /room/ABC123) for easy rejoining
- Nickname must match exactly — different nickname = rejected
- Game unpauses instantly when reconnection succeeds (no orientation pause or ready button)
- Other players see simple toast: "[Player] reconnected" for a few seconds

### Lobby ready system

- Color selection and ready status are independent — both visible from start, can change either anytime
- Players can unready after marking ready, which resets the countdown to full duration
- Countdown duration is 5 seconds when all players are ready
- Countdown displays as big number in center of screen (5... 4... 3... 2... 1...)

### Game log presentation

- Collapsible side panel (right or left side of board)
- Log everything: dice rolls, builds, trades, card plays, robber moves, disconnects, reconnects
- Oldest first (chat-style) — scroll down for latest events
- Each entry shows: player name + action (e.g., "Alice built a road")
- No timestamps or turn numbers in log entries

### Claude's Discretion

- Whether the log panel is on left or right side
- Exact styling of the disconnect overlay
- Auto-reconnect retry logic (how many attempts, backoff strategy)
- WebSocket heartbeat/ping interval for disconnect detection
- LocalStorage key naming and structure
- Game log panel animation (slide, fade, etc.)
- Mobile-specific adjustments (Phase 12 includes mobile responsiveness requirement, but we didn't discuss specific mobile treatments — Claude decides based on standard practices)

</decisions>

<specifics>
## Specific Ideas

- Direct room URLs feel like shareable game links (e.g., /room/ABC123)
- Auto-reconnect should feel seamless — player might not even realize they briefly disconnected
- Big center countdown creates anticipation before game starts
- Game log as side panel keeps it accessible but not intrusive

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 12-resilience-polish_
_Context gathered: 2026-02-05_
