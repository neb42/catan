# Phase 4: Turn Structure & Resources - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable turn-based gameplay with dice rolling and resource distribution. Players roll dice, receive resources based on settlements/cities adjacent to rolled numbers, and progress through structured turn phases (roll -> main -> end turn). Includes round-robin turn order and resource tracking for all players.

</domain>

<decisions>
## Implementation Decisions

### Dice Roll Experience

- Quick tumble animation (0.5-1s), then show result prominently
- Always-visible roll area, disabled when not your turn
- Center overlay displays dice result, then fades to side panel
- Show both individual dice and combined total
- Animation synchronized across all players
- Hexes with matching number pulse/glow briefly after roll
- Special visual emphasis for rolling a 7 (robber trigger)

### Resource Distribution Feedback

- Animated cards flying from hexes to player's hand
- See your own resource breakdown + only totals for others
- Text summary notification showing what you gained (e.g. "+2 wood, +1 wheat")
- Card hand layout with fanned overlapping cards
- Cards grouped by resource type in the fan
- Opponent resource counts shown as "Player X: 7 cards" in player list
- Explicit empty message when roll produces no resources

### Turn Phase Flow

- Phase indicated implicitly through available actions (no stepper/label)
- Prominent "End Turn" button always visible when available
- Manual end turn required (no auto-end or timeout)
- Show disabled build/trade buttons during roll phase
- "It's your turn!" banner + player highlight when turn begins
- Immediate end on click (no confirmation)
- Show turn counter (e.g. "Turn 5")
- Resource distribution happens immediately after dice animation

### Player Turn Indicators

- Glow/border highlight around current player's info
- Fixed turn order display (1-2-3-4) always visible in player list
- No waiting/thinking indicator for other players (highlight only)
- No turn timer — no time pressure

### Claude's Discretion

- Exact animation timing and easing
- Dice visual design (2D/3D style)
- Card artwork/styling
- Highlight colors and glow effects
- Layout of action buttons
- Turn counter placement

</decisions>

<specifics>
## Specific Ideas

- Dice result appears as center overlay first, then transitions to persistent display in side panel
- Resource cards should feel like physical Catan cards in a fanned hand
- The 7 roll should feel distinct/ominous since it triggers the robber

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 04-turn-structure-resources_
_Context gathered: 2026-01-28_
