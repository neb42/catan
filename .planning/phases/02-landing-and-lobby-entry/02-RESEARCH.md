# Phase 2: Landing and Lobby Entry - Research

**Researched:** 2026-01-18
**Domain:** React form validation, TanStack Router navigation, WebSocket-based nickname validation
**Confidence:** HIGH

## Summary

Phase 2 implements a landing page with nickname input and WebSocket-based uniqueness validation before navigating to the lobby. The standard approach uses React controlled components with useState for form state management, TanStack Router's useNavigate hook for programmatic navigation, and CSS-only animations for visual feedback. Validation occurs on form submit (not live) to reduce server load, with the WebSocket connection established before the user submits their nickname.

The codebase already has robust WebSocket infrastructure from Phase 1 (ReconnectingWebSocket, Zod message schemas, ConnectionManager, RoomManager). The design system and component library provide complete UI patterns including the AnimatedBackground component, CSS variables for colors/spacing/animations, and specific animation keyframes for error states (shake) and page transitions (slide-up/fade).

Key architectural decisions from CONTEXT.md align well with React best practices: controlled components with validation on submit only, inline error display with slide-in/shake animations, loading states during async validation, and CSS-based page transitions. The 3-30 character nickname length with printable characters is standard for casual multiplayer games.

**Primary recommendation:** Use React controlled components with validation on submit, leverage existing WebSocket context, implement CSS-only animations matching the design mockup, and add new Zod message schemas for nickname validation flow (SET_NICKNAME client message, NICKNAME_ACCEPTED/NICKNAME_REJECTED server responses).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.0.0 | UI component framework | Already installed, latest stable version with improved hooks |
| TanStack Router | 1.151.0 | Type-safe routing and navigation | Already installed, file-based routing with useNavigate hook for programmatic navigation |
| Zod | 4.3.5 | Runtime validation schemas | Already installed for WebSocket messages, will extend for nickname validation |
| CSS (native) | N/A | Animations and styling | Zero dependencies, design system already defines keyframes and CSS variables |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Hook Form | 7.x | Complex form validation | NOT needed for single input field - controlled component is sufficient |
| Mantine Form | Built-in | Mantine-native form handling | NOT needed - simple controlled component more appropriate |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Controlled component | Uncontrolled component (ref-based) | Controlled gives real-time state access for character counter and loading states |
| useNavigate | Link component | Link is for declarative navigation; useNavigate needed for post-validation navigation |
| CSS animations | Framer Motion | CSS is zero-bundle-size and sufficient for simple slide/shake/fade effects per design system |
| Custom validation | React Hook Form | RHF adds 40kb for single input validation - controlled component is 0kb overhead |

**Installation:**
```bash
# No new dependencies needed - all requirements already installed
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── routes/
│   ├── index.tsx          # Landing page route (nickname form)
│   └── lobby.tsx          # Lobby page route (Phase 3)
├── components/
│   ├── AnimatedBackground.tsx  # Already exists (from design mockups)
│   ├── AnimatedBackground.css  # Already exists
│   └── (future components)
└── lib/
    ├── websocket.ts       # Already exists (ReconnectingWebSocket)
    └── websocket-context.tsx  # Already exists (WebSocketProvider)

apps/api/src/websocket/
├── schemas/
│   ├── client-messages.ts # Extend with SET_NICKNAME message
│   └── server-messages.ts # Extend with NICKNAME_ACCEPTED, NICKNAME_REJECTED
└── message-router.ts      # Add handler for SET_NICKNAME
```

### Pattern 1: Controlled Component with Submit Validation
**What:** Single useState for nickname, validation triggered on form submit only
**When to use:** Simple forms where live validation is not required (per CONTEXT decision)

**Example:**
```tsx
// Source: React controlled component pattern + CONTEXT.md decisions
function LandingPage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { status, sendMessage } = useWebSocket();
  const navigate = useNavigate({ from: '/' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation (length, empty check)
    const trimmed = nickname.trim();

    if (trimmed.length < 3) {
      setError('Please enter a nickname');
      return;
    }

    if (trimmed.length > 30) {
      setError('Nickname too long (max 30 characters)');
      return;
    }

    // Check WebSocket connection before submitting
    if (status !== 'connected') {
      setError('Connection lost. Please wait...');
      return;
    }

    // Send to server for uniqueness validation
    setIsSubmitting(true);
    sendMessage({
      type: 'SET_NICKNAME',
      payload: { nickname: trimmed }
    });
  };

  // Clear error when user starts typing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    if (error) setError('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={nickname}
        onChange={handleChange}
        maxLength={30}
        autoFocus
        className={error ? 'error' : ''}
      />
      {error && <div className="error-message">{error}</div>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Joining...' : 'Enter Lobby'}
      </button>
      <div className="character-counter">{nickname.length}/30</div>
    </form>
  );
}
```

### Pattern 2: WebSocket Message Handler for Validation Response
**What:** Listen for server responses and navigate on success, show error on failure
**When to use:** Async validation requiring server-side checks (nickname uniqueness)

**Example:**
```tsx
// Source: WebSocket context pattern from Phase 1 + TanStack Router navigation
function LandingPage() {
  const { ws, status, sendMessage } = useWebSocket();
  const navigate = useNavigate({ from: '/' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (message: any) => {
      if (message.type === 'NICKNAME_ACCEPTED') {
        // Success - navigate to lobby
        navigate({ to: '/lobby' });
      } else if (message.type === 'NICKNAME_REJECTED') {
        // Failure - show error and reset loading state
        setError(message.payload.message || 'This nickname is already taken. Try another!');
        setIsSubmitting(false);
      }
    };

    ws.addMessageHandler(handleMessage);
    return () => ws.removeMessageHandler(handleMessage);
  }, [ws, navigate]);

  // ... rest of component
}
```

### Pattern 3: CSS Animation Triggers
**What:** Toggle CSS classes for slide-in errors and shake animation, use CSS keyframes
**When to use:** Visual feedback for validation errors and page transitions (per design mockup)

**Example:**
```css
/* Source: Landing page HTML mockup + DESIGN-SYSTEM.md */

/* Error shake animation */
.input.error {
  border-color: var(--color-error);
  animation: shake 0.4s var(--ease-bounce);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

/* Error message slide-in */
.error-message {
  display: none;
  animation: slide-in-left 0.3s var(--ease-smooth);
}

.error-message.visible {
  display: block;
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Page content slide-up on mount */
.landing-container {
  animation: slide-up 0.8s var(--ease-smooth);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Pattern 4: TanStack Router Navigation
**What:** Use useNavigate hook for post-validation navigation to lobby route
**When to use:** Programmatic navigation after async validation completes (cannot use Link)

**Example:**
```tsx
// Source: TanStack Router official documentation
import { useNavigate } from '@tanstack/react-router';

function LandingPage() {
  const navigate = useNavigate({ from: '/' });

  // After successful validation
  const onNicknameAccepted = () => {
    // Optional: Add transition delay for visual feedback
    setTimeout(() => {
      navigate({ to: '/lobby' });
    }, 300); // Delay for fade-out animation
  };
}
```

### Anti-Patterns to Avoid
- **Live validation on every keystroke:** Sends excessive WebSocket messages; validate on submit only (per CONTEXT decision)
- **Uncontrolled inputs with refs:** Prevents real-time character counter display and loading state management
- **Inline style objects for animations:** Defeats design system CSS variables; use CSS classes with keyframes
- **Navigate without checking WebSocket status:** Can navigate before connection established; check status first
- **No loading state during validation:** User doesn't know async validation is happening; show spinner/disabled state

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Custom state reducer | useState (single field) | Single input doesn't justify reducer complexity; useState is sufficient and clear |
| Input validation | Custom regex functions | Zod schema + string length checks | Zod already installed, provides type safety and clear error messages |
| WebSocket message handling | Custom event emitter | Existing WebSocketContext with Set pattern | Phase 1 already implements handler registration, tested and working |
| Route navigation | window.location or history API | TanStack Router useNavigate | useNavigate provides type-safe navigation with proper route matching |
| CSS animations | JavaScript animation loops | CSS keyframes with animation property | Design system already defines animations; CSS is more performant and respects prefers-reduced-motion |

**Key insight:** Phase 1 WebSocket infrastructure and design system provide 90% of what's needed. Extending existing patterns (Zod schemas, message handlers, CSS keyframes) is faster and more maintainable than creating parallel systems.

## Common Pitfalls

### Pitfall 1: Validating Before WebSocket Connected
**What goes wrong:** Form submits before WebSocket connection established, message lost or fails
**Why it happens:** ReconnectingWebSocket connects on mount but may not be 'connected' yet
**How to avoid:** Check status === 'connected' before sendMessage, show connection status indicator
**Warning signs:** Nickname submissions failing silently, "Connection not open" warnings in console

### Pitfall 2: Not Handling Reconnection During Form Fill
**What goes wrong:** User fills form during brief disconnect, submits when 'reconnecting', message never sends
**Why it happens:** status changes to 'reconnecting' between form fill and submit
**How to avoid:** Disable submit button when status !== 'connected', show "Reconnecting..." message
**Warning signs:** Users report "nothing happens" when clicking submit, inconsistent behavior

### Pitfall 3: Memory Leak with Message Handlers
**What goes wrong:** Multiple handlers registered on component re-render, memory grows
**Why it happens:** useEffect without cleanup function, or dependency array triggering re-registration
**How to avoid:** Always removeMessageHandler in useEffect cleanup, stable ws dependency
**Warning signs:** Multiple navigation attempts on single validation, handlers firing multiple times

### Pitfall 4: Race Condition Between Message Types
**What goes wrong:** Handler listens for 'NICKNAME_ACCEPTED' but also receives 'ROOM_JOINED' from Phase 1
**Why it happens:** WebSocket handler receives all message types, not filtered by component
**How to avoid:** Check message.type explicitly in handler, ignore irrelevant messages
**Warning signs:** Unexpected navigation, error states triggered by wrong message types

### Pitfall 5: No Loading State Reset on Error
**What goes wrong:** Submit button stays disabled after validation error, user can't retry
**Why it happens:** setIsSubmitting(true) on submit but never set back to false on error
**How to avoid:** Set isSubmitting(false) in NICKNAME_REJECTED handler and client validation failures
**Warning signs:** Button permanently disabled after first error, form appears "broken"

### Pitfall 6: Character Counter Not Updating
**What goes wrong:** Counter shows 0/30 always, or doesn't update as user types
**Why it happens:** Using uncontrolled input (no value prop) or not deriving from state
**How to avoid:** Use controlled component pattern (value={nickname}), counter reads nickname.length
**Warning signs:** Counter doesn't change, displays wrong count

### Pitfall 7: Animation Doesn't Re-trigger on Subsequent Errors
**What goes wrong:** Shake animation plays on first error but not on second/third errors
**Why it happens:** CSS animation only fires when class is added, not when already present
**How to avoid:** Remove 'error' class briefly before re-adding (key change or setTimeout trick)
**Warning signs:** First validation error shakes, subsequent errors don't animate

### Pitfall 8: Special Characters Breaking Validation
**What goes wrong:** Nicknames with emoji or accented characters fail unexpectedly
**Why it happens:** String.length counts UTF-16 code units, not characters; emoji = 2+ units
**How to avoid:** Use Array.from(nickname).length or [...nickname].length for accurate count
**Warning signs:** 15-character emoji nickname rejected as "too long," counter shows wrong value

## Code Examples

Verified patterns from official sources and existing codebase:

### Complete Landing Page Component
```tsx
// Source: React controlled components + TanStack Router + existing WebSocketContext
import { useState, useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useWebSocket } from '../lib/websocket-context';
import { AnimatedBackground } from '../components/AnimatedBackground';
import './landing.css';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

function LandingPage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ws, status, sendMessage } = useWebSocket();
  const navigate = useNavigate({ from: '/' });

  // Handle server validation responses
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (message: any) => {
      if (message.type === 'NICKNAME_ACCEPTED') {
        // Success - navigate to lobby with transition
        setTimeout(() => {
          navigate({ to: '/lobby' });
        }, 300);
      } else if (message.type === 'NICKNAME_REJECTED') {
        // Show error and reset loading state
        setError(message.payload.message || 'This nickname is already taken. Try another!');
        setIsSubmitting(false);
      }
    };

    ws.addMessageHandler(handleMessage);
    return () => ws.removeMessageHandler(handleMessage);
  }, [ws, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = nickname.trim();

    // Client-side validation
    if (trimmed.length < 3) {
      setError('Please enter a nickname');
      return;
    }

    if (trimmed.length > 30) {
      setError('Nickname too long (max 30 characters)');
      return;
    }

    // Check connection status
    if (status !== 'connected') {
      setError('Connection lost. Please wait...');
      return;
    }

    // Send to server for uniqueness check
    setIsSubmitting(true);
    setError(''); // Clear any previous errors
    sendMessage({
      type: 'SET_NICKNAME',
      payload: { nickname: trimmed }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    if (error) setError(''); // Clear error on typing
  };

  // Accurate character count including emoji
  const charCount = Array.from(nickname).length;

  return (
    <>
      <AnimatedBackground />
      <div className="landing-container">
        <h1 className="landing-title">Join the Game</h1>
        <p className="landing-subtitle">Enter your nickname to get started</p>

        <form onSubmit={handleSubmit} className="landing-form">
          <div className="input-group">
            <input
              type="text"
              className={`landing-input ${error ? 'error' : ''}`}
              placeholder="Your nickname"
              value={nickname}
              onChange={handleChange}
              maxLength={30}
              autoFocus
              disabled={isSubmitting}
            />
            <div className="character-counter">{charCount}/30</div>
            {error && (
              <div className="error-message visible">
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`landing-button ${charCount >= 3 && !isSubmitting ? 'pulse' : ''}`}
            disabled={isSubmitting || status !== 'connected'}
          >
            {isSubmitting ? 'Joining...' : 'Enter Lobby'}
          </button>
        </form>

        <p className="helper-text">
          3-4 players • Choose colors • Play together
        </p>

        {status !== 'connected' && (
          <div className="connection-status">
            {status === 'connecting' && 'Connecting...'}
            {status === 'reconnecting' && 'Reconnecting...'}
            {status === 'disconnected' && 'Disconnected. Retrying...'}
          </div>
        )}
      </div>
    </>
  );
}
```

### Extended Zod Message Schemas
```typescript
// Source: Existing Phase 1 schemas + nickname validation requirements
// apps/api/src/websocket/schemas/client-messages.ts

import { z } from 'zod';

// Existing schemas (HANDSHAKE, JOIN_ROOM)...

/**
 * SET_NICKNAME - Set user's nickname in lobby
 *
 * Sent by client after entering nickname on landing page.
 * Server validates uniqueness and responds with NICKNAME_ACCEPTED or NICKNAME_REJECTED.
 */
export const SetNicknameMessageSchema = z.object({
  type: z.literal('SET_NICKNAME'),
  payload: z.object({
    nickname: z.string()
      .min(3, 'Nickname must be at least 3 characters')
      .max(30, 'Nickname must be at most 30 characters')
      .trim(),
  }),
});

export type SetNicknameMessage = z.infer<typeof SetNicknameMessageSchema>;

// Update discriminated union
export const ClientMessageSchema = z.discriminatedUnion('type', [
  HandshakeMessageSchema,
  JoinRoomMessageSchema,
  SetNicknameMessageSchema, // Add new message type
]);
```

```typescript
// apps/api/src/websocket/schemas/server-messages.ts

/**
 * NICKNAME_ACCEPTED - Nickname validation successful
 *
 * Sent when nickname is unique and valid.
 * Client should navigate to lobby after receiving this.
 */
export const NicknameAcceptedMessageSchema = z.object({
  type: z.literal('NICKNAME_ACCEPTED'),
  payload: z.object({
    nickname: z.string(),
  }),
  messageId: z.string(),
  timestamp: z.number(),
});

export type NicknameAcceptedMessage = z.infer<typeof NicknameAcceptedMessageSchema>;

/**
 * NICKNAME_REJECTED - Nickname validation failed
 *
 * Sent when nickname is already taken or invalid.
 */
export const NicknameRejectedMessageSchema = z.object({
  type: z.literal('NICKNAME_REJECTED'),
  payload: z.object({
    message: z.string(),
    reason: z.enum(['ALREADY_TAKEN', 'INVALID_FORMAT']),
  }),
  messageId: z.string(),
  timestamp: z.number(),
});

export type NicknameRejectedMessage = z.infer<typeof NicknameRejectedMessageSchema>;

// Update discriminated union
export const ServerMessageSchema = z.discriminatedUnion('type', [
  ClientIdMessageSchema,
  ErrorMessageSchema,
  RoomJoinedMessageSchema,
  NicknameAcceptedMessageSchema,   // Add new message type
  NicknameRejectedMessageSchema,   // Add new message type
]);
```

### Landing Page CSS Animations
```css
/* Source: Landing page mockup + DESIGN-SYSTEM.md */

/* Container slide-up animation on mount */
.landing-container {
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 600px;
  text-align: center;
  animation: slide-up 0.8s var(--ease-smooth);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Title gradient and animation */
.landing-title {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 5rem);
  line-height: 1.1;
  margin-bottom: var(--space-lg);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: slide-up 0.8s var(--ease-smooth) 0.1s backwards;
}

/* Input field styling and focus */
.landing-input {
  width: 100%;
  padding: var(--space-lg) var(--space-xl);
  font-size: 1.25rem;
  font-family: var(--font-body);
  font-weight: 500;
  background: var(--color-bg-surface);
  border: 3px solid transparent;
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  transition: all var(--duration-base) var(--ease-smooth);
  outline: none;
}

.landing-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-glow-primary),
              0 8px 32px rgba(0, 0, 0, 0.3);
  transform: scale(1.02);
}

/* Error state with shake animation */
.landing-input.error {
  border-color: var(--color-error);
  animation: shake 0.4s var(--ease-bounce);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

/* Error message slide-in */
.error-message {
  display: none;
  margin-top: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(252, 92, 101, 0.1);
  border-left: 3px solid var(--color-error);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: 0.9rem;
  text-align: left;
}

.error-message.visible {
  display: block;
  animation: slide-in-left 0.3s var(--ease-smooth);
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Button pulse when valid nickname entered */
.landing-button {
  width: 100%;
  padding: var(--space-lg) var(--space-xl);
  font-size: 1.25rem;
  font-family: var(--font-body);
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary) 0%, #FF4081 100%);
  border: none;
  border-radius: var(--radius-full);
  color: white;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-smooth);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(255, 107, 157, 0.3);
}

.landing-button.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 4px 16px rgba(255, 107, 157, 0.3); }
  50% { box-shadow: 0 4px 32px rgba(255, 107, 157, 0.6); }
}

.landing-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Character counter */
.character-counter {
  margin-top: var(--space-xs);
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  text-align: right;
}

/* Connection status indicator */
.connection-status {
  position: fixed;
  top: var(--space-lg);
  right: var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  color: var(--color-warning);
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  animation: slide-in-left 0.3s var(--ease-smooth);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Form libraries for all forms | Native controlled components for simple forms | Ongoing (2024-2026) | Reduced bundle size, simpler code for single-input forms |
| React Router | TanStack Router | TanStack Router v1 (2024+) | Type-safe routing, better DX with file-based routes |
| JavaScript animations | CSS-only animations | Always preferred, reinforced 2025+ | Better performance, respects prefers-reduced-motion, smaller bundles |
| regex for string validation | Zod with schema validation | Zod 3.x+ (2023+) | Runtime type safety, better error messages, composable schemas |
| String.length for emoji | Array.from(str).length | ECMAScript 2015+ awareness | Accurate character counting for Unicode/emoji (emoji = single character, not 2+ units) |

**Deprecated/outdated:**
- **React Hook Form for single inputs:** Overkill for simple forms; use native controlled components (0 bytes vs 40kb)
- **window.location for SPA navigation:** Breaks SPA model; use router's navigate function
- **Inline styles for animations:** Defeats design systems and CSS variable benefits; use CSS classes
- **setTimeout for animation delays without cleanup:** Memory leaks on unmount; use proper useEffect cleanup

## Open Questions

Things that couldn't be fully resolved:

1. **Nickname uniqueness scope: per-lobby or global?**
   - What we know: Single lobby model for v0.1, RoomManager tracks clients per room
   - What's unclear: If nicknames are unique within lobby only, or across all potential future lobbies
   - Recommendation: Implement per-lobby uniqueness (check room.clients nicknames) for simplicity; global uniqueness requires separate data structure

2. **Persist nickname in client state or rely on server?**
   - What we know: Server will need to track nickname for each client (lobby display)
   - What's unclear: Whether client should store nickname locally (localStorage/state) for reconnection
   - Recommendation: Store in WebSocket context state after NICKNAME_ACCEPTED; server restores on reconnection via clientId

3. **Handle nickname change after joining lobby?**
   - What we know: CONTEXT.md doesn't mention nickname editing in lobby
   - What's unclear: If users can change nicknames in lobby, or if it's locked after entry
   - Recommendation: Assume locked for v0.1 (simpler); nickname change can be Phase 4+ feature

4. **Error animation re-trigger timing**
   - What we know: CSS animation only fires when class added, not when already present
   - What's unclear: Best pattern to re-trigger - key prop change, class removal timeout, or animation-iteration-count
   - Recommendation: Use key={error} on error div to force re-mount and re-animate on each new error

## Sources

### Primary (HIGH confidence)
- [TanStack Router Navigation Documentation](https://tanstack.com/router/v1/docs/framework/react/guide/navigation) - Official docs for useNavigate hook
- [TanStack Router useNavigate API](https://tanstack.com/router/v1/docs/framework/react/api/router/useNavigateHook) - navigate function parameters and options
- [React Forms Best Practices (daily.dev)](https://daily.dev/blog/form-on-react-best-practices) - Controlled components, validation patterns
- Existing codebase Phase 1 implementation - WebSocketContext, ReconnectingWebSocket, Zod schemas (HIGH confidence)
- Landing page HTML mockup (.planning/design-mockups/landing-page.html) - Animation keyframes, CSS structure
- Design System (.planning/DESIGN-SYSTEM.md) - CSS variables, animation timing, color tokens
- Component Library (.planning/COMPONENT-LIBRARY.md) - Component patterns, CSS examples

### Secondary (MEDIUM confidence)
- [WebSockets in React 2026 Guide (oneuptime.com)](https://oneuptime.com/blog/post/2026-01-15-websockets-react-real-time-applications/view) - Recent patterns for WebSocket error handling in React
- [React WebSocket High-Load Platform Guide (maybe.works)](https://maybe.works/blogs/react-websocket) - Production patterns with state management
- [React Form Validation Guide (formspree.io)](https://formspree.io/blog/react-form-validation/) - Validation patterns and error display
- [Handling Form Loading States in React 2024 (Medium)](https://medium.com/@ryangan.dev/handling-form-loading-states-in-next-js-react-2024-33da2dae11ce) - isSubmitting patterns
- [CSS Shake Animation (30secondsofcode.org)](https://www.30secondsofcode.org/css/s/shake-invalid-input/) - Shake animation keyframes
- [Input Error Shake Animation (codehim.com)](https://codehim.com/text-input/input-error-shake-animation-in-css/) - Alternative shake patterns

### Tertiary (LOW confidence - for context only)
- [Username Validation Regex Best Practices (mkyong.com)](https://mkyong.com/regular-expressions/how-to-validate-username-with-regular-expression/) - Regex patterns (using Zod instead)
- [Name Validation Regex (andrewwoods.net)](https://andrewwoods.net/blog/2018/name-validation-regex/) - Character validation considerations
- [React Transition Group](https://reactcommunity.org/react-transition-group/transition/) - Complex animation library (not needed for CSS-only approach)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already installed (React 19, TanStack Router 1.151, Zod 4.3.5)
- Architecture: HIGH - Patterns verified from existing Phase 1 code and official TanStack Router docs
- Pitfalls: MEDIUM-HIGH - Cross-referenced from recent 2026 WebSocket/React articles and common React form issues
- CSS Animations: HIGH - Verified from landing page mockup and DESIGN-SYSTEM.md

**Research date:** 2026-01-18
**Valid until:** ~30 days (React 19 and TanStack Router 1.x are stable; patterns unlikely to change rapidly)
