Phase 15: Add Sound Effects During Gameplay - Research

Researched: 2026-02-20
Domain: Browser audio playback (Web Audio API, event-driven sound effects)
Confidence: HIGH

<user_constraints>

User Constraints (from CONTEXT.md)

Locked Decisions

Sound coverage & events

- Comprehensive coverage — core actions plus turn notifications, trading, card purchases, robber sub-actions, and stealing
- Dice rolls: Single roll sound on result reveal (not a rolling animation sequence)
- All players hear all events — no differentiation between own vs opponent actions
- Your turn notification: Sound plays when it becomes your turn; no sound for others' turn changes
- Trading: Sound on incoming trade offer arrival and on trade completion
- Robber sequence: Distinct sounds per sub-action — 7-roll warning, robber placement, stealing a card
- Development cards: Generic buy sound + generic play sound (not per-card-type)
- Victory: Celebratory fanfare/jingle when someone wins (distinct from all other sounds)
- Building: Sounds for placing roads, settlements, and upgrading to cities
- Resource gain: One sound per distribution event (not per resource type)

Sound style & character

- Tabletop / physical aesthetic — wooden pieces clacking, dice on table, paper shuffling feel
- Noticeable & satisfying — sounds are part of the experience, not just subtle background texture
- Source files from free/open-source sound libraries (e.g., freesound.org, OpenGameArt)
- Distinct negative tone for negative events — getting robbed, discarding to a 7, losing longest road should sound different (lower pitch, darker) compared to positive events (building, gaining resources)

Volume & user controls

- Simple on/off toggle only — no volume slider
- Toggle lives in a settings menu/panel — not always visible in the main game UI
- Sounds on by default — players opt out if they want silence
- Preference persisted in localStorage — survives browser sessions

Playback behavior

- Allow overlapping sounds — if multiple events fire close together, sounds layer
- Resource distribution: One sound total per distribution event, not per resource type
- Always play sounds regardless of tab focus — important for "your turn" notifications when tabbed away
- Browser autoplay policy: Handle with an interaction prompt ("click to enable sounds") if audio context is blocked

Claude's Discretion

- Exact sound file selection and curation from free libraries
- Audio file format (mp3, ogg, wav) and optimization
- Sound effect duration and volume levels per event type
- Audio service/hook architecture (Web Audio API vs HTML5 Audio)
- Preloading strategy for sound files
- Interaction prompt UI design and placement
- Settings menu/panel design (if one doesn't already exist)

Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>

Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUDIO-01 | Game plays sound effects for dice rolls, building, robber, etc. | Howler.js singleton audio service triggered from WebSocket handler registry; ~12-15 sound events mapped to message types; webm+mp3 dual-format files in public/sounds/; Howler.js handles Web Audio API with HTML5 Audio fallback, cross-browser codec detection, and autoplay unlock |
| AUDIO-02 | User can toggle sound effects on/off | Zustand SoundSlice with soundEnabled boolean (default true); persisted to localStorage; settings panel UI with toggle; audio service checks soundEnabled before every play() call |

</phase_requirements>

Summary

This phase adds event-driven sound effects to the Catan web client. The project already has a well-structured WebSocket handler registry (apps/web/src/handlers/index.ts) with ~40 message types across 11 handler domains (lobby, placement, turn, building, trade, robber, dev cards, awards, victory, pause, error). Sound playback should integrate into this handler layer rather than into React component lifecycle, since game events arrive via WebSocket messages, not user interactions.

Howler.js v2.2.4 is the definitive standard for browser audio. It abstracts the Web Audio API (with HTML5 Audio fallback), handles cross-browser codec differences, manages autoplay policy unlock automatically, and supports overlapping playback out of the box. At 7kb gzipped with zero dependencies, it is lightweight and battle-tested (25k+ GitHub stars, MIT license). The use-sound React hook was considered but rejected: sounds in this project are triggered by WebSocket messages processed in handler functions outside React's render cycle, making a singleton service pattern more appropriate than hooks.

The user toggle (AUDIO-02) maps to a SoundSlice in the existing Zustand store with localStorage persistence. The audio service reads this flag before playing. Audio files should be sourced from freesound.org/OpenGameArt (per user decision), converted to webm (primary) + mp3 (fallback) format, and placed in public/sounds/ for static serving via Vite.

Primary recommendation: Use Howler.js v2.2.4 via a singleton SoundService class in apps/web/src/services/sound.ts, triggered from WebSocket message handlers, with a Zustand SoundSlice for the on/off toggle persisted to localStorage.

Standard Stack

Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| howler | 2.2.4 | Audio playback (Web Audio API + HTML5 Audio fallback) | 25k+ GitHub stars, MIT, handles autoplay unlock, codec detection, sprite support, overlapping playback. De facto standard for browser game audio. |
| @types/howler | 2.2.12 | TypeScript type definitions for Howler.js | Project uses strict TypeScript; provides full type coverage for Howl, Howler global, and all options |

Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | (already installed) | Sound preferences state (enabled/disabled toggle) | SoundSlice added to existing gameStore |

Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Howler.js | use-sound (React hook) | use-sound wraps Howler.js but ties audio to React component lifecycle; sounds here are triggered by WebSocket handlers outside React, making a service pattern better |
| Howler.js | Raw Web Audio API | 10x more code for codec detection, autoplay handling, mobile quirks, fallback — exactly what Howler.js solves |
| Howler.js | Tone.js | Designed for music synthesis/scheduling, massive overkill for playing short sound effects |

Installation:
npm install howler
npm install -D @types/howler

Architecture Patterns

Recommended Project Structure
apps/web/
├── public/
│   └── sounds/               # Static audio files served by Vite
│       ├── dice-roll.webm
│       ├── dice-roll.mp3
│       ├── build-road.webm
│       ├── build-road.mp3
│       └── ...               # ~12-15 sound pairs (webm + mp3)
└── src/
    ├── services/
    │   ├── websocket.ts       # Existing WebSocket service
    │   └── sound.ts           # NEW: Singleton SoundService wrapping Howler.js
    ├── stores/
    │   └── gameStore.ts       # MODIFIED: Add SoundSlice (soundEnabled + toggle)
    ├── handlers/
    │   └── *.ts               # MODIFIED: Add sound.play() calls in handlers
    └── components/
        └── Settings/          # NEW or MODIFIED: Sound toggle UI in settings panel

Pattern 1: Singleton Audio Service

What: A single SoundService instance that preloads all sound effects on initialization and exposes a play(soundName) method. The service checks the Zustand store's soundEnabled flag before playing.

When to use: When sounds are triggered by non-React code (WebSocket handlers, store subscriptions) and need to be available globally without React context.

Example:
// apps/web/src/services/sound.ts
import { Howl } from 'howler';
import { useGameStore } from '../stores/gameStore';

type SoundName =
  | 'diceRoll'
  | 'buildRoad'
  | 'buildSettlement'
  | 'buildCity'
  | 'resourceGain'
  | 'yourTurn'
  | 'tradeOffer'
  | 'tradeComplete'
  | 'robberWarning'
  | 'robberPlace'
  | 'robberSteal'
  | 'devCardBuy'
  | 'devCardPlay'
  | 'victory';

const SOUND_CONFIG: Record<SoundName, { src: string[]; volume: number }> = {
  diceRoll: { src: ['/sounds/dice-roll.webm', '/sounds/dice-roll.mp3'], volume: 0.7 },
  buildRoad: { src: ['/sounds/build-road.webm', '/sounds/build-road.mp3'], volume: 0.6 },
  // ... etc
};

class SoundService {
  private sounds: Map<SoundName, Howl> = new Map();
  private initialized = false;
  init(): void {
    if (this.initialized) return;
    for (const [name, config] of Object.entries(SOUND_CONFIG)) {
      this.sounds.set(name as SoundName, new Howl({
        src: config.src,
        volume: config.volume,
        preload: true,
      }));
    }
    this.initialized = true;
  }
  play(name: SoundName): void {
    const { soundEnabled } = useGameStore.getState();
    if (!soundEnabled) return;
    const sound = this.sounds.get(name);
    if (sound) sound.play();
  }
}

export const soundService = new SoundService();

Pattern 2: Handler Integration

What: Call soundService.play() directly inside WebSocket message handlers after state updates. This keeps sound triggering co-located with the game logic that processes each event.

When to use: For every sound-producing game event. Add the call at the end of the handler function, after state has been updated.

Example:
// In apps/web/src/handlers/turnHandlers.ts
import { soundService } from '../services/sound';

export const handleDiceRolled: MessageHandler = (message, ctx) => {
  // ... existing state update logic ...
  soundService.play('diceRoll');
};

export const handleTurnChanged: MessageHandler = (message, ctx) => {
  // ... existing state update logic ...
  // Only play sound when it becomes THIS player's turn
  if (message.payload.currentPlayerId === ctx.currentPlayerId) {
    soundService.play('yourTurn');
  }
};

Pattern 3: Zustand SoundSlice with localStorage

What: Add a SoundSlice to the existing Zustand store with a soundEnabled boolean and toggleSound action. Persist to localStorage on change, hydrate on store creation.

When to use: For the AUDIO-02 toggle requirement.

Example:
// Added to apps/web/src/stores/gameStore.ts
interface SoundSlice {
  soundEnabled: boolean;
  toggleSound: () => void;
}

// In store creation:
soundEnabled: localStorage.getItem('catan-sound-enabled') !== 'false', // default true
toggleSound: () => {
  set((state) => {
    const next = !state.soundEnabled;
    localStorage.setItem('catan-sound-enabled', String(next));
    return { soundEnabled: next };
  });
},

Anti-Patterns to Avoid

- Sound in React components via useEffect: Sounds triggered by WebSocket events would require syncing store state to component effects, adding unnecessary indirection and risking missed events if components unmount. Use the service directly in handlers instead.
- Creating new Howl instances on every play: Instantiate all Howl objects once at init time. Creating them per-play causes re-decoding, latency, and memory churn.
- Coupling sound names to message types 1:1: Some message types share the same sound (e.g., road_built and settlement_built might share a build sound, or have distinct ones). Map sounds by semantic meaning, not by message type string.

Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-browser audio playback | Custom Web Audio API wrapper | Howler.js | Codec detection, iOS Safari quirks, autoplay unlock, memory management — hundreds of edge cases across browsers |
| Autoplay policy unlock | Manual "click to unlock" + AudioContext.resume() | Howler.js autoUnlock (enabled by default) | Howler plays a silent buffer on first user interaction (touchend/click), automatically unlocking the AudioContext. Handles edge cases across Chrome, Safari, Firefox |
| Audio format detection | Manual canPlayType() checks | Howler.js src array with fallback ordering | Howler tries formats in order, falls back automatically. Handles codec negotiation internally |
| Sound preloading | Manual fetch + decodeAudioData | Howler.js preload: true option | Howler manages the decode pipeline, caches buffers, handles loading errors |

Key insight: Browser audio is a minefield of cross-browser inconsistencies, autoplay policies, and mobile quirks. Howler.js exists specifically because the raw APIs are insufficient for reliable cross-platform audio. Every "simple" custom audio wrapper eventually grows to re-implement what Howler.js already provides.

Common Pitfalls

Pitfall 1: Autoplay Policy Blocks Audio Silently
What goes wrong: Sounds never play because the AudioContext was created before any user interaction, and the browser silently blocks it. No error is thrown — audio just doesn't happen.
Why it happens: Chrome 71+, Safari 12+, and Firefox 66+ require a user gesture before audio can play. If the Howl instances are created at module load time (before any click/touch), the AudioContext starts in "suspended" state.
How to avoid: Howler.js has autoUnlock: true by default — it listens for the first user interaction and resumes the AudioContext. Call soundService.init() early (e.g., on app mount), but don't worry about timing — Howler queues plays and releases them after unlock. For extra safety, add a one-time banner ("Click to enable sounds") if Howler.ctx.state === 'suspended' after a reasonable delay.
Warning signs: Sounds work in dev (where you've already clicked) but not in fresh incognito tabs or on first page load.

Pitfall 2: Audio Files Not Loading in Production
What goes wrong: Sounds work in dev but 404 in production builds.
Why it happens: Vite handles public/ directory files as static assets copied to the build output root. But if you import audio files via ES module imports, Vite hashes the filenames. Using absolute paths like /sounds/dice-roll.webm from public/ avoids this — they're served as-is.
How to avoid: Place all audio files in public/sounds/ and reference them with absolute paths (e.g., /sounds/dice-roll.webm). Do NOT use relative imports or Vite's import for audio files.
Warning signs: Network tab shows 404s for sound file requests in production.

Pitfall 3: Memory Leaks from Howl Instances
What goes wrong: Creating new Howl instances per event play (instead of reusing preloaded ones) causes memory to grow unboundedly. Each Howl decodes and caches the audio buffer.
Why it happens: Treating new Howl() like a fire-and-forget call rather than a reusable object.
How to avoid: Create all Howl instances once in SoundService.init(). Store them in a Map. The play() method only calls .play() on existing instances.
Warning signs: Browser memory usage climbs steadily during a long game session.

Pitfall 4: Turn Notification Sound Fires for All Players
What goes wrong: The "your turn" notification sound plays for every player on every turn change, not just the active player.
Why it happens: The turn_changed message is broadcast to all players. If the handler blindly plays the sound, everyone hears it.
How to avoid: Compare message.payload.currentPlayerId against ctx.currentPlayerId (the local player's ID) before playing the turn notification sound. Only play when they match.
Warning signs: Players hear the turn notification constantly, even when it's not their turn.

Pitfall 5: Sound Preference Not Persisting Correctly
What goes wrong: User disables sounds, refreshes, and sounds are back on.
Why it happens: Reading from localStorage returns a string, and 'false' is truthy in JavaScript. Or the store doesn't hydrate from localStorage on creation.
How to avoid: Use explicit string comparison: localStorage.getItem('catan-sound-enabled') !== 'false' (defaults to true when key is absent). Set the store's initial value from this expression.
Warning signs: Toggle works during the session but resets on refresh.

Code Examples

Verified patterns from official sources:

Howl Instance with Format Fallback
// Source: https://github.com/goldfire/howler.js#documentation
import { Howl } from 'howler';

const diceRoll = new Howl({
  src: ['/sounds/dice-roll.webm', '/sounds/dice-roll.mp3'],
  volume: 0.7,
  preload: true,
});

// Play returns a unique sound ID (for overlapping playback)
diceRoll.play();

Sound Sprite (Optional Optimization)
// Source: https://github.com/goldfire/howler.js#sprite
// Combine multiple short sounds into one file to reduce HTTP requests
const sprites = new Howl({
  src: ['/sounds/sprites.webm', '/sounds/sprites.mp3'],
  sprite: {
    diceRoll: [0, 1200],       // start ms, duration ms
    buildRoad: [1200, 800],
    buildSettlement: [2000, 900],
    resourceGain: [2900, 600],
    // ... etc
  },
});

sprites.play('diceRoll');
sprites.play('buildRoad'); // Can overlap with diceRoll

Checking AudioContext State for Autoplay Banner
// Source: https://github.com/goldfire/howler.js#global-options
import { Howler } from 'howler';

// After a short delay, check if audio is still locked
function checkAudioUnlocked(): boolean {
  return Howler.ctx?.state === 'running';
}

// Howler.autoUnlock is true by default — it will unlock on first interaction.
// Only show a banner if the context is still suspended after user has been
// on the page for a few seconds without interacting.

Zustand Store Integration (Reading State Outside React)
// Source: Zustand docs — accessing state outside React
// https://zustand.docs.pmnd.rs/guides/practice-with-no-store-actions
import { useGameStore } from '../stores/gameStore';

// In the SoundService (not a React component):
const { soundEnabled } = useGameStore.getState(); // Synchronous read, no hook needed

Handler Integration Pattern
// Example: apps/web/src/handlers/buildingHandlers.ts
import { soundService } from '../services/sound';

export const handleRoadBuilt: MessageHandler = (message, ctx) => {
  // ... existing state update logic (unchanged) ...
  useGameStore.getState().addRoad(message.payload.road);

  soundService.play('buildRoad');
};

export const handleSettlementBuilt: MessageHandler = (message, ctx) => {
  // ... existing state update logic (unchanged) ...
  useGameStore.getState().addSettlement(message.payload.settlement);
  soundService.play('buildSettlement');
};

export const handleCityBuilt: MessageHandler = (message, ctx) => {
  // ... existing state update logic (unchanged) ...
  useGameStore.getState().upgradeToCity(message.payload.vertexId);
  soundService.play('buildCity');
};

Sound Event to Handler Mapping
// Complete mapping of sound events to WebSocket message types:
//
// Sound              | Handler Message Type(s)        | Handler File
// -------------------|-------------------------------|---------------------------
// diceRoll           | dice_rolled                    | turnHandlers.ts
// yourTurn           | turn_changed (self only)       | turnHandlers.ts
// buildRoad          | road_built                     | buildingHandlers.ts
// buildSettlement    | settlement_built               | buildingHandlers.ts
// buildCity          | city_built                     | buildingHandlers.ts
// resourceGain       | dice_rolled (when distribution) | turnHandlers.ts
// tradeOffer         | trade_proposed                 | tradeHandlers.ts
// tradeComplete      | trade_executed                 | tradeHandlers.ts
// robberWarning      | robber_triggered               | robberHandlers.ts
// robberPlace        | robber_moved                   | robberHandlers.ts
// robberSteal        | stolen                         | robberHandlers.ts
// devCardBuy         | dev_card_purchased             | devCardHandlers.ts
// devCardPlay        | dev_card_played                | devCardHandlers.ts
// victory            | victory                        | victoryHandlers.ts

State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HTMLAudioElement (new Audio()) | Web Audio API via Howler.js | 2018+ (Chrome 66 autoplay changes) | Raw HTMLAudioElement can't handle overlapping playback, has no sprite support, and doesn't manage autoplay unlock. Howler.js defaults to Web Audio API and falls back to HTML5 Audio only when needed. |
| Manual AudioContext management | Howler.js autoUnlock | Howler.js 2.1.0+ | Before autoUnlock, developers had to manually track user gestures and call AudioContext.resume(). Howler handles this transparently. |
| MP3 as primary format | WebM (Opus) as primary with MP3 fallback | 2020+ (broad Opus support) | WebM/Opus offers better compression at equivalent quality. All modern browsers support it. MP3 fallback covers legacy edge cases. |
| Importing audio as ES modules | Static files in public/ directory | Vite convention | For audio assets that don't need hashing or tree-shaking, public/ is simpler. Vite copies them as-is to build output. |

Deprecated/outdated:
- Flash-based audio fallback: Howler.js removed Flash fallback in v2.0 (2016). No longer relevant.
- use-sound for non-React contexts: The use-sound hook is useful when sounds are tied to UI interactions (button clicks, hover). For WebSocket-driven events, a service pattern is more appropriate.

Open Questions

1. Sound file sourcing and licensing
   - What we know: User specified freesound.org and OpenGameArt as sources. Files must be free/open-source licensed.
   - What's unclear: Exact files to use for each of the ~14 sound events. License compatibility (CC0, CC-BY, etc.) for each file.
   - Recommendation: Curate files during implementation. Prefer CC0 (public domain) to avoid attribution requirements. Keep a SOUND_CREDITS.md or comment block documenting sources and licenses for all files.

2. Sound sprite vs individual files
   - What we know: Sound sprites reduce HTTP requests (1 file vs 14). Howler.js has built-in sprite support with millisecond offsets.
   - What's unclear: Whether the overhead of creating a sprite (tooling, offset management) is worth it for ~14 small files that are preloaded once.
   - Recommendation: Start with individual files for simplicity and debuggability. Migrate to sprites later as an optimization if network performance is a concern. Individual files are easier to replace and adjust.

3. Settings panel existence
   - What we know: The toggle must live in a settings menu/panel (per user decision). The current UI may or may not already have a settings panel.
   - What's unclear: Whether a settings panel component already exists in the project.
   - Recommendation: Check during implementation. If no settings panel exists, create a minimal one with just the sound toggle. It can be expanded in future phases.

Sources

Primary (HIGH confidence)
- Howler.js GitHub README (https://github.com/goldfire/howler.js) — Full API documentation, configuration options, sprite support, autoUnlock behavior, format fallback chain. Verified v2.2.4 as latest stable.
- Vite Static Asset Handling docs (https://vite.dev/guide/assets.html) — Confirmed public/ directory behavior: files copied as-is to build root, referenced by absolute path.
- Chrome Autoplay Policy (https://developer.chrome.com/blog/autoplay/) — Confirmed Chrome 66+ autoplay restrictions and Chrome 71+ Web Audio API restrictions. AudioContext starts suspended without user gesture.
- MDN Web Audio API (https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) — Confirmed buffer-based playback recommended for short sound effects vs media elements for streaming.

Secondary (MEDIUM confidence)
- use-sound GitHub README (https://github.com/joshwcomeau/use-sound) — Evaluated and rejected for this use case. Confirmed it wraps Howler.js, provides React hooks, lazy-loads Howler.
- Project source code (apps/web/src/handlers/index.ts, handlers/types.ts, stores/gameStore.ts) — Confirmed handler registry pattern with ~40 message types, Zustand slice architecture, HandlerContext interface.

Metadata

Confidence breakdown:
- Standard stack: HIGH — Howler.js is the undisputed standard for browser game audio. 25k+ stars, actively maintained, MIT license, zero dependencies.
- Architecture: HIGH — Singleton service pattern is well-established for non-React audio. Project's handler registry provides clear integration points. Zustand getState() documented for use outside React.
- Pitfalls: HIGH — Autoplay policy is extensively documented by Chrome team and Howler.js. Format fallback, memory management, and localStorage gotchas are well-known patterns.

Research date: 2026-02-20
Valid until: 2026-03-20 (stable domain, Howler.js has not had a major release since 2023)