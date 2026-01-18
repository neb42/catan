# Phase 2: Landing and Lobby Entry - Context

**Gathered:** 2026-01-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can enter nicknames on a landing page and join the shared lobby with uniqueness validation. This phase delivers the entry point where users provide their identity before entering the multiplayer lobby. Single shared lobby only - no room selection or multiple lobbies.

</domain>

<decisions>
## Implementation Decisions

### Landing Page Design
- Use "Join the Game" as hero title (current mockup title)
- Full animated background: gradient mesh + floating geometric shapes as shown in mockup
- Match existing design system (Playful Geometry aesthetic from DESIGN-SYSTEM.md)
- Elements: title, subtitle ("Enter your nickname to get started"), nickname input, submit button, helper text ("3-4 players • Choose colors • Play together")
- No navigation buttons (landing page is entry point, nowhere to go back to)
- Full responsive design - support mobile, tablet, and desktop layouts

### Nickname Input UX
- Maximum length: 30 characters
- Minimum length: 3 characters
- Allowed characters: Any printable characters (letters, numbers, spaces, emoji, punctuation)
- Validation: On form submit only (not live as user types)
- Character counter: Always visible (show "X/30")
- Auto-focus input field on page load (as shown in mockup)

### Error Presentation
- Display style: Inline below input field (mockup style with slide-in animation and shake)
- Error messages:
  - Empty/too short: "Please enter a nickname"
  - Nickname taken: "This nickname is already taken. Try another!"
  - Additional validation: Follow same inline pattern with clear messages
- Auto-clear errors: Yes, clear as soon as user starts typing

### Join Flow
- Button behavior: Show loading state (spinner/loading indicator) while validating nickname
- Transition: Animated transition - fade out landing page, fade in lobby (smooth visual flow)
- Connection errors: Show error inline, stay on landing page, let user retry manually
- Success: Navigate to /lobby route after successful validation

### Claude's Discretion
- Exact animation timing and easing for page transitions
- Loading spinner style and placement
- Specific error message wording for edge cases not covered above
- Input field placeholder text details
- Focus management and accessibility enhancements

</decisions>

<specifics>
## Specific Ideas

**From design mockups:**
- Landing page HTML mockup exists at `.planning/design-mockups/landing-page.html`
- Design system fully documented in `DESIGN-SYSTEM.md` and `COMPONENT-LIBRARY.md`
- Use existing design tokens: colors, spacing, typography, animations
- AnimatedBackground component pattern from mockup/component library

**Visual references:**
- Input focus behavior: scale(1.02) with primary glow shadow (mockup line 206)
- Error shake animation: translateX keyframes with bounce easing (mockup line 214)
- Button pulse when valid: subtle scale + shadow animation (mockup line 296)

**Technical constraints:**
- WebSocket connection must be established before nickname submission
- Phase 1 WebSocket infrastructure already implemented with ReconnectingWebSocket
- Use existing WebSocket context from apps/web/src/contexts/WebSocketContext.tsx

</specifics>

<deferred>
## Deferred Ideas

**Room code/lobby selection** - User suggested adding room code input to landing page. This would enable multiple concurrent lobbies, which is explicitly out of scope for v0.1. PROJECT.md states: "Out of Scope: Multiple concurrent lobbies — single lobby sufficient" and "friends only via shared URL". This belongs in a future phase when multi-lobby support is needed.

Note for future: Could be implemented as optional room code in URL (e.g., /lobby?room=ABC123) rather than requiring input on landing page.

</deferred>

---

*Phase: 02-landing-and-lobby-entry*
*Context gathered: 2026-01-18*
