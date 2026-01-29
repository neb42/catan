# Phase 5: Building - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable building roads, settlements, and cities with cost validation during the main phase of a turn. Players spend resources to place pieces on the board, with validation ensuring legal placements (roads connect, settlements 2 away, cities upgrade own settlements).

</domain>

<decisions>
## Implementation Decisions

### Build mode interaction

- Mode buttons approach: click Road/Settlement/City button, then click board location
- Explicit cancel button appears when in build mode (not click-away or escape)
- Disabled buttons with tooltip showing cost when player can't afford
- Single placement mode: after placing a piece, mode exits (must click button again for more)
- Buttons positioned near resource hand area
- Buttons show icon + text labels
- Buttons show remaining piece count (e.g., "Roads: 12 left")
- Buttons always visible but context-disabled when not player's turn or not main phase

### Cost reference display

- Costs shown via hover tooltip on build buttons
- Tooltip displays resource icons only (no text)
- Tooltip shows cost only, not affordability status
- Buildings only (Road, Settlement, City) — dev cards handled in Phase 8

### Placement feedback

- All valid locations highlighted when entering build mode
- Visual style matches Phase 3 initial placement (colored markers)
- Invalid locations are hidden (only valid spots visible)
- On successful placement: both toast notification and piece animation
- If no valid locations exist, button stays disabled (tooltip explains)

### Resource deduction timing

- Optimistic update: resources deduct immediately on click, revert if server rejects
- Silent revert on server rejection (rare edge case)
- Animated removal when spending resources (cards fly away/fade out)
- Other players see flash update on resource count changes

### Claude's Discretion

- Exact animation timing and easing
- Toast notification styling and duration
- Specific icon designs for build buttons
- Cancel button styling and positioning

</decisions>

<specifics>
## Specific Ideas

- Build buttons should feel integrated with the resource hand area, not separate
- Maintain consistency with Phase 3 placement markers for valid location highlighting
- Optimistic updates for snappy feel — server is authoritative but UI shouldn't feel laggy

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 05-building_
_Context gathered: 2026-01-29_
