# Phase 3: Initial Placement - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement snake draft for initial settlements and roads (1→2→3→4→4→3→2→1). Players place two settlements and two roads each during setup. Second settlement grants starting resources from adjacent hexes. Setup phase completes and transitions to turn-based play.

</domain>

<decisions>
## Implementation Decisions

### Valid Location Highlighting

- Show valid placement locations as **dots with subtle glow** in the player's color
- Glow **enhances on hover** for clear feedback
- After settlement placed, **brief pause** with landing animation before road edges appear
- Invalid locations show **tooltip explanation on hover** (e.g., "Too close to blue settlement")

### Turn & Action Indication

- **Both banner and player list** indicate current player
- Banner shows action required ("Your turn: Place settlement")
- Player list highlights/glows for active player
- Waiting players see **spectator info** with draft order and who's next
- **Full snake order visible** (1→2→3→4→4→3→2→1) with current position highlighted
- **Only active player** sees valid placement locations

### Placement Interaction

- **Click to select** a valid location, shows preview
- **Confirm button** appears to commit the placement
- Can **click elsewhere** to move preview to different valid spot
- **Cancel button** available alongside confirm
- **Auto-advance** after road is placed — turn ends automatically
- **Soft timer** shows elapsed time (no auto-action, disconnect handling is Phase 8)

### Resource Feedback

- Second settlement resources shown with **triple feedback**:
  - Toast notification listing resources received
  - Card animation — resources visually fly into hand
  - Resource counts flash/pulse as they update
- **Full visibility** — all players see what each player receives
- **No feedback needed** for first settlement (no resources) — players know the rules
- **Dramatic transition** with animation/fanfare when setup completes, before first player's turn

### OpenCode's Discretion

- Exact animation timing and easing
- Toast positioning and styling
- Specific glow/pulse visual effects
- Draft order display layout
- Landing animation specifics

</decisions>

<specifics>
## Specific Ideas

- Resource feedback should feel "juicy" — multiple feedback channels reinforce the moment
- The setup-to-game transition should feel like a distinct shift, marking the start of real play
- Invalid placement tooltips help players learn Catan rules organically

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 03-initial-placement_
_Context gathered: 2026-01-27_
