# Phase 15: Add Sound Effects During Gameplay - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Add sound effects for in-game events during Catan gameplay and provide users with a toggle to enable/disable sounds. Covers requirements AUDIO-01 (sound effects for dice rolls, building, robber, etc.) and AUDIO-02 (toggle on/off). No background music, no ambient soundscapes — strictly event-driven sound effects.

</domain>

<decisions>
## Implementation Decisions

### Sound coverage & events

- **Comprehensive coverage** — core actions plus turn notifications, trading, card purchases, robber sub-actions, and stealing
- **Dice rolls:** Single roll sound on result reveal (not a rolling animation sequence)
- **All players hear all events** — no differentiation between own vs opponent actions
- **Your turn notification:** Sound plays when it becomes your turn; no sound for others' turn changes
- **Trading:** Sound on incoming trade offer arrival and on trade completion
- **Robber sequence:** Distinct sounds per sub-action — 7-roll warning, robber placement, stealing a card
- **Development cards:** Generic buy sound + generic play sound (not per-card-type)
- **Victory:** Celebratory fanfare/jingle when someone wins (distinct from all other sounds)
- **Building:** Sounds for placing roads, settlements, and upgrading to cities
- **Resource gain:** One sound per distribution event (not per resource type)

### Sound style & character

- **Tabletop / physical aesthetic** — wooden pieces clacking, dice on table, paper shuffling feel
- **Noticeable & satisfying** — sounds are part of the experience, not just subtle background texture
- **Source files from free/open-source sound libraries** (e.g., freesound.org, OpenGameArt)
- **Distinct negative tone for negative events** — getting robbed, discarding to a 7, losing longest road should sound different (lower pitch, darker) compared to positive events (building, gaining resources)

### Volume & user controls

- **Simple on/off toggle only** — no volume slider
- **Toggle lives in a settings menu/panel** — not always visible in the main game UI
- **Sounds on by default** — players opt out if they want silence
- **Preference persisted in localStorage** — survives browser sessions

### Playback behavior

- **Allow overlapping sounds** — if multiple events fire close together, sounds layer
- **Resource distribution:** One sound total per distribution event, not per resource type
- **Always play sounds regardless of tab focus** — important for "your turn" notifications when tabbed away
- **Browser autoplay policy:** Handle with an interaction prompt ("click to enable sounds") if audio context is blocked

### Claude's Discretion

- Exact sound file selection and curation from free libraries
- Audio file format (mp3, ogg, wav) and optimization
- Sound effect duration and volume levels per event type
- Audio service/hook architecture (Web Audio API vs HTML5 Audio)
- Preloading strategy for sound files
- Interaction prompt UI design and placement
- Settings menu/panel design (if one doesn't already exist)

</decisions>

<specifics>
## Specific Ideas

- Tabletop board game feel — sounds should evoke sitting around a physical Catan board (wooden pieces, dice on table)
- Victory moment should feel celebratory — a fanfare or jingle, not just another chime
- Negative events (robbery, discard) should be tonally distinct from positive events (building, resource gain)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 15-add-sound-effects-during-gameplay_
_Context gathered: 2026-02-20_
