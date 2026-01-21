# Phase 2: Core Game Loop - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Playable game skeleton with board generation, initial placement, and turn structure. Users can generate a random Catan board, complete snake draft setup (8 rounds of settlement+road placement), roll dice, and progress through turn phases with resource distribution. No trading, building during play, or robber mechanics — those are Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Board Generation & Visual Identity

- **Dual generation modes**: Implement both balanced (even resource distribution) and natural clustering (ore-rich vs wood-heavy areas) algorithms. Toggle via environment variable `BOARD_GEN_MODE=balanced|natural`
- **Illustrated terrain**: Use existing SVG tiles in `./apps/web/src/assets/tiles` (forest, mountains, hills, fields, pasture, desert). SVGs are production-ready with hexagonal backgrounds and stylized illustrations
- **Number tokens**: Display with color-coded dots (pips) to visualize probability. 6 and 8 emphasized in red/bold, other numbers neutral
- **Board reveal**: Animate board entrance when first generated (hexes fade/slide into position)

### Initial Placement Flow & Feedback

- **Turn status display**: Show simple "Your Turn" or "Waiting for [Player Name]" messages. Do NOT show full 8-round snake draft timeline
- **Placement highlighting**: Auto-highlight all valid placement locations immediately when turn starts (no button click required)
- **Settlement → Road transition**: After settlement placement, require user confirmation before road placement ("Settlement placed! Now place your road" message/button)
- **Starting resources**: When second settlement placed, animate resource cards flying from board to player's hand. Show explicit notification of what was received ("Received 2 wood, 1 brick")

### Dice Rolling Experience

- **Server-authoritative rolls**: Dice roll calculated on server, instant broadcast of final result to all clients (everyone sees same numbers simultaneously)
- **Resource distribution feedback**: Show both explicit text log ("Player 1 got 2 wood, Player 3 got 1 ore") AND animated cards flying to respective players
- **Zero-resource rolls**: Display "No resources this roll" message when roll produces nothing (desert number, no settlements on that number, etc.)
- **Animation timing**: Quick and efficient (~500ms total) — not dramatic/suspenseful

### Turn Phase Transitions & Control

- **Post-roll flow**: Automatically enter main phase after dice roll and resource distribution (no "Continue" button required)
- **Main phase flexibility**: Players can freely switch between trading and building actions without locking into one mode
- **End turn transition**: Include brief transition animation when turn ends (~1 second with "Player X's turn ending..." → "Player Y's turn")
- **Turn timer**: No turn timer or timeout in Phase 2 (may be added in later phases)

### Copilot's Discretion

- Exact animation easing functions and timings (within ~500ms guideline)
- Hex grid layout library choice (react-hexgrid or custom SVG)
- Resource card visual design (size, styling, animation paths)
- Message/notification positioning and styling
- Placement validation error messages (specific wording)
- Board generation algorithm details (within balanced/natural modes)

</decisions>

<specifics>
## Specific Ideas

- Tile SVGs already exist at `./apps/web/src/assets/tiles` with 6 terrain types: forest.svg, mountains.svg, hills.svg, fields.svg, pasture.svg, desert.svg
- Number token dots should follow classic Catan style (1 dot for 2/12, 2 dots for 3/11, etc.)
- Environment variable `BOARD_GEN_MODE` controls generation strategy for playtesting different approaches
- Starting resource animation should "fly" from the specific hex tiles to player's hand area

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. Trading, building during play, robber mechanics, and victory conditions are explicitly Phase 4+.

</deferred>

---

*Phase: 02-core-game-loop*
*Context gathered: 2026-01-21*
