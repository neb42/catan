# Feature Research

**Domain:** Multiplayer Game Lobby (Friends-Only, Real-Time)
**Researched:** 2026-01-18
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Player List with Real-Time Updates** | Core lobby function - see who's in the room | MEDIUM | WebSocket sync required, handle joins/leaves gracefully |
| **Ready/Unready Toggle** | Standard coordination mechanism in all multiplayer lobbies | LOW | Simple state per player, visual indicator needed |
| **Host-Initiated Game Start** | Host controls when game begins after checking readiness | LOW | Only host can start, typically requires minimum players |
| **Countdown Before Game Start** | Prevents accidental starts, gives players time to prepare | LOW | 3-5 second countdown standard, with sound/visual cues |
| **Player Disconnect Handling** | Connection drops are inevitable, must handle gracefully | MEDIUM | Visual indicator when player disconnects, auto-remove or timeout |
| **Shareable Lobby Link/Code** | Friends-only requires easy invite mechanism | LOW | Generate unique lobby ID, shareable URL or 4-6 char code |
| **Visual Player Status** | See who's ready, who's host, who's disconnected | LOW | Color coding, icons, or text labels per player |
| **Lobby Capacity Limit** | Prevent overflow, show X/4 players | LOW | Enforce max 4 players, show count prominently |
| **Player Names/Nicknames** | Identity in lobby and game | LOW | From nickname entry screen, display throughout |
| **Leave Lobby Action** | Explicit way to exit without closing browser | LOW | Button or link, handle gracefully (update player list) |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Color Selection (Player Choice)** | Adds personality, reduces confusion in-game | MEDIUM | Standard is red/blue/yellow/green, handle conflicts/duplicates |
| **Auto-Start When All Ready** | Smoother UX than requiring host to click "Start" | LOW | Common pattern: when all ready → auto countdown → start |
| **Host Migration** | Lobby survives if host leaves | HIGH | Complex state transfer, may not be needed for friends-only |
| **Lobby Chat** | Social coordination while waiting | MEDIUM | Text chat in lobby, no moderation needed for friends-only |
| **Player Kick (Host Only)** | Host can remove disruptive players | LOW | Useful even in friends-only (accidental joins, AFK) |
| **Reconnect on Disconnect** | Player can rejoin same lobby after connection drop | MEDIUM | Requires session persistence, graceful state restoration |
| **Lobby Settings (Pre-Game)** | Configure game options before starting | MEDIUM | May include expansions, variant rules, time limits |
| **Visual Feedback Animations** | Polish - animations for joins, ready state changes | LOW | Makes lobby feel responsive and alive |
| **Sound Effects** | Audio cues for joins, ready, countdown | LOW | Adds presence, helps attention during waiting |
| **Copy Link Button** | One-click sharing vs manual URL copy | LOW | Small UX win, standard in modern web apps |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Public Matchmaking** | "Find me random players to play with" | Requires critical mass of users, complex queue logic, abuse/moderation | Friends-only for MVP, defer until proven demand |
| **Voice Chat** | "It's a social game, we need voice" | Complex to implement, moderation required, privacy concerns, duplicates Discord/Zoom | Assume friends use external voice (Discord), add later if validated |
| **Complex Lobby Filtering** | "Let players search by game type, skill level, etc." | Unnecessary for single shared lobby with friends | Single lobby with direct link/code is simpler |
| **Spectator Mode in Lobby** | "Let people watch the lobby while waiting to join" | Adds complexity, confusing UX (why can't spectators join?) | Either in lobby or not, no middle state |
| **Lobby Chat Moderation** | "Prevent toxic behavior" | Overhead for friends-only context, false sense of safety | Friends-only = trust model, no moderation needed |
| **AI/Bot Filler Players** | "Fill empty slots with bots" | Catan requires human strategy, bots are complex to build well | Require minimum human players, simple and clear |
| **Countdown Interruption** | "Cancel countdown if someone un-readies" | Frustrating when accidental, enables trolling | Once countdown starts, it completes (or only host can cancel) |
| **Complex Ready States** | "Multiple ready levels like 'maybe ready'" | Confusing, delays game start | Binary ready/not ready is clear |

## Feature Dependencies

```
Shareable Lobby Link
    └──requires──> Lobby ID Generation
                       └──requires──> Lobby Persistence

Player Ready Toggle
    └──requires──> Player List

Countdown Before Start
    └──requires──> All Players Ready Check
                       └──requires──> Player Ready Toggle

Game Start
    └──requires──> Countdown Before Start
    └──requires──> Minimum Player Count Check

Player Color Selection
    └──enhances──> Player List
    └──conflicts with──> Auto-Assign Colors

Auto-Start When All Ready
    └──requires──> Player Ready Toggle
    └──conflicts with──> Host Manual Start Only

Host Migration
    └──requires──> Player List
    └──requires──> Host Designation Logic
    └──conflicts with──> Simple Host-Only Controls
```

### Dependency Notes

- **Shareable Lobby Link requires Lobby Persistence:** Can't share link to ephemeral lobby that disappears on page refresh
- **Countdown requires All Players Ready:** Don't start countdown until minimum players are ready
- **Color Selection enhances Player List:** Colors make players visually distinct, useful in-game
- **Color Selection conflicts with Auto-Assign:** Either players choose OR system assigns, not both
- **Auto-Start conflicts with Host Manual Start:** Pick one pattern to avoid confusion
- **Host Migration conflicts with Simple Controls:** Migration adds complexity, may not be worth it for friends-only

## MVP Definition

### Launch With (v0.1)

Minimum viable product — what's needed to validate the concept.

- [x] **Player List with Real-Time Updates** — Core lobby function, must see who's present
- [x] **Player Names/Nicknames** — Basic identity from landing page
- [x] **Ready/Unready Toggle** — Standard coordination pattern
- [x] **Visual Player Status** — See who's ready vs not ready
- [x] **Host-Initiated Game Start** — Simple pattern: host checks readiness, clicks start
- [x] **Countdown Before Game Start** — 5-second countdown prevents accidental starts
- [x] **Shareable Lobby Link** — Friends need easy way to join
- [x] **Lobby Capacity Limit (3-4 players)** — Enforce game rules
- [x] **Player Disconnect Handling** — Show disconnected state, allow graceful recovery
- [x] **Leave Lobby Action** — Explicit exit, updates player list

### Add After Validation (v0.2-v0.3)

Features to add once core is working.

- [ ] **Color Selection** — Adds personality, user request after testing basic lobby
- [ ] **Auto-Start When All Ready** — QoL improvement once manual flow is validated
- [ ] **Copy Link Button** — Small UX win, add when sharing friction observed
- [ ] **Reconnect on Disconnect** — Add when users report connection issues
- [ ] **Player Kick (Host Only)** — Add if AFK or accidental joins become issue
- [ ] **Lobby Chat** — Add if users request coordination tool during testing
- [ ] **Visual Feedback Animations** — Polish after core mechanics proven

### Future Consideration (v1.0+)

Features to defer until product-market fit is established.

- [ ] **Sound Effects** — Polish, defer until UX is solid
- [ ] **Lobby Settings (Game Options)** — Defer until base game complete and users want variants
- [ ] **Host Migration** — Complex, defer until proven need (host drops mid-lobby)
- [ ] **Voice Chat** — Significant effort, defer until users request it explicitly (expect Discord use)
- [ ] **Public Matchmaking** — Requires scale, moderation, different product vision

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Player List with Real-Time Updates | HIGH | MEDIUM | P1 |
| Ready/Unready Toggle | HIGH | LOW | P1 |
| Host-Initiated Game Start | HIGH | LOW | P1 |
| Countdown Before Game Start | HIGH | LOW | P1 |
| Shareable Lobby Link | HIGH | LOW | P1 |
| Player Disconnect Handling | HIGH | MEDIUM | P1 |
| Visual Player Status | HIGH | LOW | P1 |
| Lobby Capacity Limit | HIGH | LOW | P1 |
| Player Names | HIGH | LOW | P1 |
| Leave Lobby Action | MEDIUM | LOW | P1 |
| Color Selection | MEDIUM | MEDIUM | P2 |
| Auto-Start When All Ready | MEDIUM | LOW | P2 |
| Copy Link Button | LOW | LOW | P2 |
| Reconnect on Disconnect | MEDIUM | MEDIUM | P2 |
| Player Kick | LOW | LOW | P2 |
| Lobby Chat | LOW | MEDIUM | P2 |
| Visual Feedback Animations | LOW | LOW | P2 |
| Sound Effects | LOW | LOW | P3 |
| Lobby Settings | MEDIUM | HIGH | P3 |
| Host Migration | LOW | HIGH | P3 |
| Voice Chat | MEDIUM | HIGH | P3 |
| Public Matchmaking | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (v0.1)
- P2: Should have, add when possible (v0.2-v0.3)
- P3: Nice to have, future consideration (v1.0+)

## Competitor Feature Analysis

| Feature | Board Game Arena | Tabletopia | Our Approach |
|---------|-----------------|------------|--------------|
| **Lobby Creation** | Create table with game type, access restrictions (friends/groups) | Public room browser with filters | Direct link/code, friends-only, single lobby type |
| **Inviting Players** | "Restrict table access" to friends group, invite button sends notification | Room browser with join buttons | Shareable link (no account/friends system needed) |
| **Ready System** | Players join "available" slots, host manually starts when satisfied | Players join table, host controls start | Ready toggle + host start, explicit coordination |
| **Game Start** | Host responsibility to start when enough players joined | Host starts game | Host initiates after ready check, countdown |
| **Real-Time vs Turn-Based** | Both supported, real-time has live updates | Real-time with manual piece movement | Real-time only (friends playing together) |
| **Player Communication** | Public chat UI, Premium has voice/video chat | Text chat available | Defer chat to v0.2+, assume external voice (Discord) |
| **Color/Team Selection** | Often auto-assigned by game | Manual piece assignment by player | Player-selectable colors (defer to v0.2) |
| **Lobby Persistence** | Lobby persists until game completes | Room persists until closed | Lobby persists with unique URL |
| **Reconnection** | Session-based, can rejoin if disconnected | Can rejoin same room | Plan for v0.2+ based on need |

**Key Insights:**
- Board Game Arena and Tabletopia both use "host controls start" pattern (not auto-start)
- Friends-only lobbies use restricted access (groups, invite-only) rather than public browsers
- Real-time games expect live updates, turn-based can be async
- Chat is common but voice is premium/optional
- Reconnection is expected in serious platforms

## Sources

**Lobby Design Patterns:**
- [Steam Matchmaking & Lobbies](https://partner.steamgames.com/doc/features/multiplayer/matchmaking) - Technical implementation patterns
- [PlayFab Lobby and Matchmaking](https://learn.microsoft.com/en-us/gaming/playfab/multiplayer/lobby/lobby-and-matchmaking) - Lobby communication patterns
- [Unity Game Lobby Sample](https://docs.unity.com/ugs/manual/lobby/manual/game-lobby-sample) - Ready state, countdown, and color filtering patterns
- [The Rules of the Game: Multi-Player Lobbying](https://www.gamedeveloper.com/design/the-rules-of-the-game-multi-player-lobbying) - Design philosophy (Strut, Taunt, Group)

**Online Board Game Platforms:**
- [Board Game Arena - CATAN](https://en.boardgamearena.com/gamepanel?game=catan) - Leading online board game platform
- [Board Game Arena FAQ](https://en.boardgamearena.com/faq) - Lobby creation and friend invites
- [Board Game Arena Forum - Inviting Friends](https://forum.boardgamearena.com/viewtopic.php?t=14763) - How friends-only lobbies work

**Lobby Features:**
- [Game UI Database - Pre-Game & Lobby](https://www.gameuidatabase.com/index.php?scrn=43) - Visual design patterns
- [TV Tropes: Game Lobby](https://tvtropes.org/pmwiki/pmwiki.php/Main/GameLobby) - Common lobby patterns
- [TV Tropes: Color-Coded Multiplayer](https://tvtropes.org/pmwiki/pmwiki.php/Main/ColorCodedMultiplayer) - Player color conventions
- [Steam Community Guide: Create Lobby Links](https://steamcommunity.com/sharedfiles/filedetails/?id=3130451258) - Shareable lobby link patterns

**UX Anti-Patterns:**
- [UI Anti-Patterns](https://ui-patterns.com/blog/User-Interface-AntiPatterns) - Pogo stick navigation, hide and hover
- [Game Programming Anti-Patterns](https://ruoyusun.com/2021/02/25/game-programming-anti-patterns.html) - Common mistakes in game development
- [Five Examples of Terrible Game UX](https://uxplanet.org/five-examples-of-terrible-game-ux-777fea291990) - Visual hierarchy, information overload

**Communication & Moderation:**
- [Call of Duty Voice Chat Moderation](https://support.activision.com/articles/call-of-duty-voice-chat-moderation) - Voice chat implementation complexity
- [In-Game Chat: Eight Key Features](https://ably.com/blog/in-game-chat-features) - Chat feature requirements

---
*Feature research for: Multiplayer Game Lobby (Catan)*
*Researched: 2026-01-18*
*Confidence: MEDIUM - Based on established patterns from major platforms (Steam, PlayFab, Unity, Board Game Arena), cross-referenced with UX best practices. Lower confidence on some differentiators due to friends-only context limiting comparative data.*
