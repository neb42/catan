# Phase 6: Trading - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable resource trading between players (domestic) and with the bank/ports (maritime). Current turn player can propose trades to all other players who accept or decline. Port access provides improved bank trade rates. This phase delivers TRADE-01 through TRADE-06.

</domain>

<decisions>
## Implementation Decisions

### Trade Proposal Flow

- Dedicated "Trade" button/action opens trade composition UI
- Trade UI appears as a modal overlay on the game board
- Trades are broadcast to all players (not targeted to specific player)
- Players compose offer first (give X for Y), then all players can respond
- Resource quantities selected with +/- increment controls
- Only one active trade proposal at a time per player
- Only the current turn player can propose trades
- Proposer can cancel their trade instantly (button click)
- No limit on re-proposing same trade after rejection
- Both sides of trade must have at least one resource (no gifts)
- UI prevents proposing trades you can't fulfill (send button disabled)
- All 5 resource types shown in trade UI with 0 as default
- "Give" side constrains to owned resources (can't increment beyond what you have)

### Trade Response Experience

- Incoming trades appear as blocking modal (demands attention)
- Recipients can only Accept or Decline (no counter-offers)
- If multiple players accept, proposer chooses who to trade with
- Proposer can choose as soon as at least one player accepts (doesn't wait for all)
- No timeout on trade responses (stays open until cancelled or turn ends)
- Players must respond to trade modal (cannot dismiss without accepting/declining)
- Proposer sees real-time updates as players respond ("Player A accepted", "Player B declined")
- Players can always decline even if they can't afford to accept

### Maritime Trade Interface

- Unified trade modal with mode switch (tab/toggle) between "Players" and "Bank"
- Auto-apply best available rate for each resource based on port access
- Inline rate labels next to each resource: "Wood (2:1)", "Brick (4:1)"
- Bank trades execute instantly (no confirmation step needed)
- Unlimited bank trades per turn
- Player info panel shows owned ports (outside of trade modal)
- UI prevents selecting resources the bank has run out of (edge case)

### Trade Visibility

- All players see full trade terms in their blocking modal
- Trade completion triggers toast notification + game log entry
- Trade history shows full details: who traded what with whom
- Bank/port trades logged same as domestic trades (toast + log)

### Claude's Discretion

- Exact modal layout and styling
- Animation/transitions for trade UI
- Toast notification duration and styling
- How "proposer chooses" UI works when multiple accept

</decisions>

<specifics>
## Specific Ideas

No specific product references mentioned — open to standard approaches that feel natural for a board game.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 06-trading_
_Context gathered: 2026-01-30_
