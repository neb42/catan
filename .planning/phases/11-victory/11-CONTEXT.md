# Phase 11: Victory - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Calculate victory points and detect game end. Player reaching 10 VP triggers immediate win with announcement. VP calculation includes settlements (1), cities (2), longest road (2), largest army (2), and VP cards (1 each).

</domain>

<decisions>
## Implementation Decisions

### VP Display Style

- Always show VP breakdown inline in player list (not separate panel)
- Use compact icon-only format: 🏠2 🏰1 🛤️2 (settlements, cities, longest road, etc.)
- Hidden VP cards completely invisible — do NOT show "? VP" or any placeholder
- Only public VP visible during gameplay

### Win Detection Timing

- Check for 10 VP immediately after any VP-changing action
- Actions that trigger check: build settlement, build city, gain/lose longest road, gain/lose largest army, play VP card
- Player CAN win during another player's turn (e.g., opponent builds road, loses longest road to you, you hit 10 VP)
- Win triggers immediately even mid-action — if first road of Road Building card gives you longest road = 10 VP, game ends, second road never placed
- VP cards auto-reveal when player hits 10 VP (no manual "reveal to win" action needed)

### Victory Announcement UX

- Large centered modal with board still visible (dimmed) behind
- Modal shows: winner highlighted, ALL players' final VP with full component breakdown
- Festive celebration effects: confetti, fireworks, or similar animation
- Two actions available: "Close" (dismiss modal to view final board state) and "Return to Lobby"

### Hidden VP Reveal Flow

- All hidden VP cards flip simultaneously (not sequenced)
- Dedicated reveal overlay appears BEFORE victory modal: "Revealed: X VP cards!"
- Brief overlay duration (1-2 seconds), then auto-transitions to victory modal
- Creates dramatic moment: reveal overlay → victory modal with confetti

### Claude's Discretion

- Exact confetti/celebration animation implementation
- Icon choices for VP components (emoji vs custom icons)
- Modal styling and transition animations
- How VP breakdown fits in player list layout

</decisions>

<specifics>
## Specific Ideas

- The reveal overlay → victory modal flow should feel like a dramatic "and the winner is..." moment
- Board visible behind modal so players can see the final state that led to victory
- Celebration should feel earned — this is the payoff for the whole game

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 11-victory_
_Context gathered: 2026-02-02_
