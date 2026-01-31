# Phase 9: Longest Road - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Track longest road and award bonus points. Calculate Longest Road (minimum 5 road segments) using graph traversal. Award Longest Road card (2 VP) to player with longest continuous road. Transfer card when another player surpasses length (ties favor current holder).

</domain>

<decisions>
## Implementation Decisions

### Blocking behavior

- Silent recalculation when opponent settlement breaks a road chain — no notification
- Recalculate longest road after every road/settlement placement by any player
- Visual distinction for broken road segments — different segments appear in subtly different shades or with gaps
- Claude decides whether settlements block own roads or opponents only (follow official Catan rules)

### Award display

- Badge on player — icon with road length number appears next to the player's name in the player list
- 2 VP bonus included in displayed score automatically (not shown as separate breakdown)
- No placeholder badge before award exists — only appears once someone reaches 5+ roads

### Length visibility

- Always show current road length for all players in the player list
- Road length appears in a stats section under each player entry (player stats row)
- Show road length only (e.g., "Roads: 7") — no gap-to-beat information
- Real-time updates as roads are placed — numbers change immediately

### Tie & transfer feedback

- Announce transfer to all players via toast/notification
- Animated transfer — brief highlight effect when badge moves between players
- Ties are silent — current holder keeps award with no special messaging
- Transfer narrative format: "Player X takes Longest Road from Player Y!"

### Claude's Discretion

- Whether settlements block own player's roads or only opponents (follow official rules)
- Exact animation/highlight effect for badge transfer
- Visual treatment for broken road segments (specific shades or gap styling)
- Algorithm implementation details (DFS, BFS, etc.)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches based on official Catan rules.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 09-longest-road_
_Context gathered: 2026-01-31_
