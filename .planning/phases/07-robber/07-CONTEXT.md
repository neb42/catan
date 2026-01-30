# Phase 7: Robber - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement robber mechanics triggered by rolling 7:

- Players with 8+ cards must discard half (rounded down)
- Roller moves robber to any land hex
- Roller steals one random card from an adjacent player
- Hex with robber produces no resources when its number is rolled

Also includes: opponent resource count display (total only) and action feedback system (toasts/notifications).

</domain>

<decisions>
## Implementation Decisions

### Discard Flow

- Simultaneous discarding — all 8+ card players see discard UI at once, game waits for all
- Blocking modal — must complete discard before doing anything else
- Click to toggle — click individual cards to select/deselect for discard
- No timer — wait indefinitely for players to decide

### Robber Placement Interaction

- Direct click — click hex for immediate placement (no confirm step)
- Hover preview — show which players are adjacent when hovering on a hex
- Standing figure visual — dark semi-transparent figure standing on hex center
- Any land hex valid — per ROBBER-02, robber can stay on same hex

### Steal Victim Selection

- Modal selection — popup/modal with clickable player options
- Show card counts — display "(X cards)" next to each player name in modal
- Auto-select single victim — if only one player adjacent, auto-steal (no modal)
- Skip steal if no cards — if no adjacent players have cards, proceed without stealing

### Action Feedback System

- Toasts + game log — both toast notifications and scrollable log history
- Bottom center positioning — toasts appear at bottom center of screen
- 3 second duration — toasts auto-dismiss after 3 seconds
- Collapsible log panel — game log minimized by default, expandable

### Claude's Discretion

- Toast styling and animations
- Game log entry formatting
- Robber figure SVG design
- Discard modal layout specifics
- Hover preview visual treatment

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for the visual treatments and animations.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 07-robber_
_Context gathered: 2026-01-30_
