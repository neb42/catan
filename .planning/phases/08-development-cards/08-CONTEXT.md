# Phase 8: Development Cards - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the development card deck system: purchasing cards, shuffled 25-card deck (14 Knight, 5 VP, 2 Road Building, 2 Year of Plenty, 2 Monopoly), play restrictions (not same turn purchased, one per turn except VP), and all five card type implementations with their effects.

</domain>

<decisions>
## Implementation Decisions

### Card Hand Display

- Integrated row — Dev cards appear in same hand view as resources (above/below resource cards)
- Full card art — Each dev card shows its type with icon/illustration
- Grayed out — Unplayable cards dimmed with tooltip explaining why (bought this turn, already played one)
- Buy Dev Card in build controls — Alongside Road/Settlement/City buttons
- Deck count visible near buy button — Shows "X cards remaining" when considering purchase
- Opponent dev card counts always visible — Show count next to each player's info
- Card reveal animation — When dev card played, card flips/zooms showing what was played

### Card Play Interactions

- Road Building: Sequential mode — Enter road placement mode, stays active until 2 roads placed
- Year of Plenty: Resource picker modal — Opens modal to select 2 resources (same or different allowed)
- Monopoly: Resource picker modal — Modal with 5 resource options to pick one
- Monopoly feedback: Broadcast total — Everyone sees "[Player] collected X [resource] via Monopoly"
- No cancel once committed — Once you click to play a card, must complete the action
- Road Building edge case: Place what you can — If only 1 valid placement, place 1 and card consumed
- Year of Plenty bank check: Block selection — Gray out resources with 0 in bank
- Confirmation before playing — Always show confirmation dialog before playing any dev card

### Knight Card Flow

- Reuse robber UI entirely — Same robber placement overlay and steal modal as rolling 7
- No discards on Knight — Knight only moves robber and steals, skips discard phase
- Knight count always visible — Show played Knight count in player info area (for Largest Army)
- Turn continues after Knight — Playing Knight is one action, turn proceeds normally
- Knight always playable — Can move robber anywhere, steal if possible (not required)
- Animation before robber flow — Show "Knight played!" animation, then enter robber placement
- Distinct log entries — Log distinguishes "rolled 7, moved robber" vs "played Knight, moved robber"

### Victory Point Card Visibility

- Visually distinct — VP cards have different border/glow indicating "secret points"
- No click action — Clicking VP cards does nothing, they're automatic (no play button)
- Public VP excludes hidden — Opponents see only settlements, cities, longest road, largest army
- Win summary reveals — End game screen shows full VP breakdown including revealed VP cards

### Claude's Discretion

- Knight card timing — Claude follows standard Catan rules for when Knight can be played (before or after rolling)

</decisions>

<specifics>
## Specific Ideas

- Dev cards integrate into existing hand UI rather than separate panel
- Card animations should match the "card reveal" pattern for visual polish
- Monopoly announcement is public to all players (transparency over individual notifications)
- VP cards get special visual treatment to hint at their secret nature
- Knight count display sets up for Largest Army tracking in Phase 10

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 08-development-cards_
_Context gathered: 2026-01-30_
