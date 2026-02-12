# Phase 14: Victory Stats and Rematch - Context

**Gathered:** 2026-02-06  
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhance the existing victory modal with game statistics display (dice rolls, dev cards, resources) and add rematch functionality that returns all players to lobby with reset game state. Victory detection and win announcement already exist — this phase adds post-game insights and replay capability.

</domain>

<decisions>
## Implementation Decisions

### Statistics presentation

- **Organization:** Tabbed interface with three tabs (Dice Stats, Dev Card Stats, Resource Stats)
- **Dice statistics:** Frequency distribution (how many times each number 2-12 was rolled) with bar chart visualization
- **Dev card statistics:** Both overall totals AND per-player breakdown (ability to see which players drew which cards)
- **Resource statistics:** Comprehensive tracking in one tab showing:
  - Resources collected from dice rolls (distribution)
  - Resources gained vs resources spent (net flow)
  - Trade activity (resources traded)

### Visual layout and styling

- **Integration:** Statistics appear as additional content within the existing victory modal (after confetti/VP reveal)
- **Tabs:** Use Mantine tabs component styled with parchment aesthetic to match game theme
- **Visualizations:** Bar charts for distributions and comparisons
- **Colors:** Use player colors from the game for their data in charts/stats (not parchment neutrals)
- **Modal height:** Fixed height modal with scroll for long statistics content
- **Content order:** Winner announcement at top, then statistics tabs below
- **Aesthetic:** Maintain parchment background and medieval theme throughout

### Rematch flow and behavior

- **Trigger mechanism:** All players must agree to rematch (request + acceptance flow)
- **Visibility:** Show ready count ("Ready for rematch: 2/4 players") with checkmarks next to player names
- **Lobby return:** Open room — same room ID, but players can re-join (allows different players to join)
- **State reset:** Keep player identities (nicknames/colors if they stay), clear all game state (board, resources, VP, etc.)
- **Previous game stats:** Not preserved after rematch — each game is independent

### Results breakdown improvements

- **Display scope:** Full rankings showing all players ranked by final score
- **VP breakdown:** Detailed breakdown per player showing: Settlements (X pts), Cities (X pts), Longest Road (2 pts), Largest Army (2 pts), VP cards (X pts)
- **Layout style:** Card-based layout with each player as a card showing their stats
- **Winner distinction:** All visual indicators:
  - Trophy/crown icon next to winner's card
  - Larger/emphasized winner card
  - Gold/special background styling for winner

### Claude's Discretion

- Exact chart library choice for bar charts (Recharts, Victory, custom SVG)
- Spacing and typography within statistics tabs
- Animation/transitions between tabs
- Loading states while calculating statistics
- Exact rematch button placement and styling
- Edge case handling (what if player disconnects during rematch vote)

</decisions>

<specifics>
## Specific Ideas

- Resource stats should be comprehensive: "dice roll distribution, gained vs spent, and trades - all separate in one tab"
- Rematch returns to "open room" state, not locked to original players
- Winner gets "all visual indicators" — don't be subtle about the win

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 14-victory-stats-and-rematch_  
_Context gathered: 2026-02-06_
