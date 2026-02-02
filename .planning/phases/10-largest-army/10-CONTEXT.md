# Phase 10: Largest Army - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Track largest army (knight cards played) and award 2 VP bonus to the player with most knights played. Minimum 3 knights required to earn the award. Card transfers when another player surpasses the count; ties favor current holder.

</domain>

<decisions>
## Implementation Decisions

### UI Display

- Largest Army indicator appears in player list only (badge/icon next to holder)
- Use icon badge style (small icon next to player name)
- Match Longest Road visual treatment for consistency
- Show knight count for all players in the player list

### Notification behavior

- Toast notification when Largest Army is earned or transferred
- Same notification treatment for first award and transfers (no distinction)
- Include knight count in notification: "[Player] earned Largest Army (3 knights)"
- Match Longest Road notification style

### Player visibility

- All knight counts are public (standard Catan rules)
- Show total count only (no distance-to-lead calculations)
- Always show count even for players with 0 knights played
- Display as icon with number (small shield icon with count)

### Claude's Discretion

- Exact icon design for Largest Army badge
- Animation/transition when award transfers
- Placement of knight count relative to other player stats

</decisions>

<specifics>
## Specific Ideas

- Consistent with Longest Road treatment — both special award cards should feel like part of the same family
- Knight count display should mirror road length display from Phase 9

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 10-largest-army_
_Context gathered: 2026-01-31_
