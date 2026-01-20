# Features Research

> Research on features for online multiplayer Catan board games based on analysis of Colonist.io, Catan Universe, Board Game Arena, and general multiplayer game patterns.

---

## Table Stakes (Must Have)

### Lobby & Matchmaking

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| Room Creation | Host creates game room with shareable ID/link | Low | WebSocket infrastructure |
| Room Join | Players join via ID, link, or invite | Low | Room creation |
| Player Nicknames | Display name for each player (no auth required) | Low | None |
| Color Selection | Players pick their piece color before game | Low | Lobby UI |
| Ready Up System | All players must confirm ready before start | Low | Lobby state sync |
| Player Count Display | Show current/max players (3-4) | Low | Lobby state |
| Host Controls | Host can start game, kick players | Low | Player roles |

### Gameplay Core

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| Random Board Generation | Randomized hex tiles, number tokens, port placement | Medium | Board data model |
| Dice Roll | Animated 2d6 roll with resource distribution | Low | Game state, resource system |
| Resource Management | Track wood, brick, sheep, wheat, ore per player | Low | Player state |
| Building Actions | Place roads, settlements, cities with validation | Medium | Board state, resource checks |
| Initial Placement | Snake draft (1-2-3-4-4-3-2-1) for settlements/roads | Medium | Turn order, placement validation |
| Turn Structure | Roll → Trade → Build phases with clear indicators | Medium | Game state machine |
| Trading System | Player-to-player and bank (4:1, port) trades | High | Resource sync, UI for offers |
| Development Cards | Buy, hold, play knight/VP/road-building/monopoly/year-of-plenty | Medium | Card state, action handlers |
| Robber Mechanics | Move robber on 7, steal from adjacent player | Medium | Board interaction, player selection |
| Longest Road | Auto-calculate and track, transfer on ties | Medium | Graph traversal algorithm |
| Largest Army | Track knight cards played, auto-award | Low | Dev card tracking |
| Victory Detection | Detect 10 VP win, handle VP card reveals | Low | Score calculation |
| End Game | Clear winner announcement, game over state | Low | Victory detection |

### State Synchronization

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| Real-time Updates | All players see same state instantly | High | WebSocket architecture |
| Reconnection Handling | Player can rejoin after disconnect | Medium | Session persistence |
| Game Pause on Disconnect | Game waits for disconnected player | Medium | Connection monitoring |
| State Recovery | Restore full game state on reconnect | Medium | State serialization |
| Action Validation | Server validates all moves (anti-cheat) | Medium | Game rules engine |

### UX Essentials

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| Turn Indicator | Clear display of whose turn it is | Low | Turn state |
| Resource Display | See your own resources clearly | Low | Player state |
| Building Costs Reference | Always-visible cost card/legend | Low | Static UI |
| Action Feedback | Visual/audio confirmation of actions | Low | Event system |
| Error Messages | Clear feedback when action invalid | Low | Validation |
| Player List | See all players, colors, scores | Low | Game state |
| Victory Point Display | Show public VP for all players | Low | Score tracking |
| Dice Result Display | Show roll result prominently | Low | Dice system |
| Legal Move Highlighting | Show valid placement spots | Medium | Rules engine |
| Undo Last Action | Undo within same turn phase (pre-commit) | Medium | Action queue |

---

## Differentiators (Nice to Have)

### Enhanced UX

| Feature | Description | Complexity | Dependencies | Priority |
|---------|-------------|------------|--------------|----------|
| Resource Animations | Cards fly to players on harvest | Medium | Animation system | Low |
| Dice Roll Animation | 3D or satisfying 2D dice physics | Medium | Animation library | Medium |
| Sound Effects | Dice, building, trading, robber sounds | Low | Audio assets | Medium |
| Background Music | Ambient game music (toggleable) | Low | Audio system | Low |
| Trade History Log | Scrollable log of all trades | Low | Event logging | Medium |
| Game Log/History | All actions logged with timestamps | Medium | Event system | High |
| Spectator Mode | Watch games without playing | Medium | Read-only state sync | Low |
| Mobile Responsive | Playable on phone/tablet | High | Responsive design | Medium |
| Dark Mode | Alternative color scheme | Low | CSS theming | Low |
| Keyboard Shortcuts | Power-user controls | Low | Event handlers | Low |

### Social Features

| Feature | Description | Complexity | Dependencies | Priority |
|---------|-------------|------------|--------------|----------|
| In-Game Chat | Text chat between players | Medium | WebSocket, UI | High |
| Emote/Reactions | Quick reaction buttons (👍😠🎉) | Low | Chat system | Medium |
| Trade Counter-Offers | Modify incoming trade proposals | Medium | Trade system | High |
| Trade Requests | Ask "who has wheat?" | Low | Chat/trade system | Medium |

### Quality of Life

| Feature | Description | Complexity | Dependencies | Priority |
|---------|-------------|------------|--------------|----------|
| Auto-Roll Option | Automatically roll dice on turn start | Low | Settings, dice | Low |
| Quick Trade Presets | One-click common trade offers | Low | Trade UI | Low |
| Resource Totals Display | See other players' resource counts (not types) | Low | Player state | Medium |
| Production Stats | "This hex has produced X times" | Low | Event tracking | Low |
| Probability Display | Show pip count on hover | Low | Static data | Medium |
| Rematch Button | Quick restart with same players | Low | Room reset | High |
| Share Game Link | Copy invite link easily | Low | URL generation | High |

### Advanced Features

| Feature | Description | Complexity | Dependencies | Priority |
|---------|-------------|------------|--------------|----------|
| Game Replay | Watch completed game playback | High | Full event log | Low |
| Statistics Tracking | Personal stats (wins, avg VP) | Medium | Persistence layer | Low |
| Custom Board Layouts | Preset or manual tile arrangements | Medium | Board generation | Low |
| House Rules Toggle | Optional rule variants | Medium | Rules engine flags | Low |

---

## Anti-Features (Explicitly Skip for v1)

### Monetization & Accounts

| Feature | Reason to Skip |
|---------|----------------|
| User Accounts/Auth | Adds complexity, unnecessary for casual play |
| Premium Features | Not a revenue goal for v1 |
| Cosmetic Purchases | Requires account system, asset work |
| Ads | Degrades experience, not needed |

### Competitive Features

| Feature | Reason to Skip |
|---------|----------------|
| ELO/Ranking System | Requires accounts, matchmaking complexity |
| Matchmaking Queue | Room-based is simpler, more social |
| Turn Timers | Casual experience, players can set house rules |
| Anti-AFK Kick | Pause-on-disconnect handles this |
| Tournaments | Massive scope increase |
| Leaderboards | Requires persistence, accounts |

### Expansions & Variants

| Feature | Reason to Skip |
|---------|----------------|
| Seafarers Expansion | Base game first |
| Cities & Knights | Base game first |
| 5-6 Player Extension | Complicates balance, board size |
| AI Players | Significant AI work, reduces social focus |
| Custom Maps | Nice-to-have, not essential |

### Infrastructure Complexity

| Feature | Reason to Skip |
|---------|----------------|
| Game Persistence (Long-term) | Games expected to finish in one session |
| Cross-Device Handoff | Single session focus |
| Multiple Concurrent Games | One game at a time per room |
| Admin Dashboard | Not needed at scale v1 targets |
| Analytics/Telemetry | Premature optimization |

### Communication

| Feature | Reason to Skip |
|---------|----------------|
| Voice Chat | Significant complexity, players use Discord |
| Video Chat | Huge complexity, third-party handles this |
| Friend Lists | Requires accounts |
| Private Messaging | Room-based chat sufficient |

---

## Feature Dependencies

```
Room System
├── Room Creation
│   └── Room Join
│       └── Player Nicknames
│           └── Color Selection
│               └── Ready Up System
│                   └── Host Controls (Start Game)

Game State Machine
├── Board Generation
│   └── Initial Placement (Snake Draft)
│       └── Turn Structure
│           ├── Dice Roll
│           │   ├── Resource Distribution
│           │   └── Robber (on 7)
│           │       └── Steal Mechanic
│           ├── Trading System
│           │   ├── Player-to-Player
│           │   └── Bank/Port Trades
│           ├── Building Actions
│           │   ├── Road Placement
│           │   ├── Settlement Placement
│           │   └── City Upgrade
│           └── Development Cards
│               ├── Buy Cards
│               └── Play Cards

Scoring System
├── Settlement/City VP
├── Longest Road
│   └── Road graph calculation
├── Largest Army
│   └── Knight card tracking
└── VP Cards
    └── Victory Detection

WebSocket Infrastructure
├── Real-time State Sync
│   └── Action Broadcasting
├── Connection Monitoring
│   ├── Disconnect Detection
│   │   └── Game Pause
│   └── Reconnection
│       └── State Recovery
└── Server-side Validation
```

---

## Complexity Summary

| Complexity | Count | Examples |
|------------|-------|----------|
| **Low** | ~20 | Nicknames, ready up, resource display, dice roll |
| **Medium** | ~15 | Board generation, initial placement, robber, dev cards |
| **High** | ~5 | Trading system, real-time sync, mobile responsive |

---

## Recommendations for v1 Scope

### Must Ship (Core Loop)
1. Room system with join/ready
2. Random board + initial placement
3. Complete turn structure (roll, trade, build)
4. All building types + development cards
5. Robber, longest road, largest army
6. Victory detection
7. Disconnect handling with pause

### Should Ship (Polish)
1. Game log/history
2. In-game chat
3. Trade counter-offers
4. Sound effects
5. Rematch button
6. Share game link

### Can Ship Later
1. Mobile responsive
2. Spectator mode
3. Game replay
4. Custom boards
