---
phase: 15-add-sound-effects-during-gameplay
plan: 01
subsystem: ui
tags: [howler, audio, sound-effects, settings, zustand, mantine]

# Dependency graph
requires:
  - phase: 14-victory-stats-and-rematch
    provides: Complete game UI with victory modal and rematch flow
provides:
  - SoundService singleton wrapping Howler.js with 15 named sounds
  - SoundSlice in gameStore with localStorage-persisted toggle
  - Settings UI panel with sound on/off switch
  - public/sounds/ directory structure for MP3 files
affects: [15-02-handler-integration]

# Tech tracking
tech-stack:
  added: [howler, '@types/howler']
  patterns:
    [SoundService singleton, SoundSlice store pattern, Settings panel component]

key-files:
  created:
    - apps/web/src/services/sound.ts
    - apps/web/src/components/Settings/SettingsButton.tsx
    - apps/web/src/components/Settings/SettingsPanel.tsx
    - apps/web/src/components/Settings/index.ts
    - apps/web/public/sounds/
  modified:
    - package.json
    - package-lock.json
    - apps/web/src/stores/gameStore.ts
    - apps/web/src/components/Game.tsx

key-decisions:
  - 'Root package.json install with --legacy-peer-deps due to @mantine/charts peer conflict'
  - 'SoundService checks useGameStore.getState().soundEnabled before playing'
  - "localStorage key 'catan-sound-enabled' with !== 'false' comparison for default-on behavior"
  - 'Settings gear button positioned top-right with z-index 25 (below modals)'
  - 'Parchment-styled modal for settings panel matching existing StealModal aesthetic'

patterns-established:
  - "SoundService singleton: import soundService, call soundService.play('soundName')"
  - 'SoundSlice pattern: follows existing RobberSlice/DevCardSlice interface convention'
  - 'Settings component pattern: SettingsButton triggers modal, reusable for future settings'

requirements-completed: [AUDIO-01, AUDIO-02]

# Metrics
duration: 5min
completed: 2026-02-20
---

# Phase 15 Plan 01: Sound Infrastructure Summary

**Howler.js SoundService singleton with 15 named sounds, gameStore sound toggle with localStorage persistence, and parchment-styled Settings UI panel**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-20T16:46:02Z
- **Completed:** 2026-02-20T16:51:02Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Installed Howler.js and created SoundService singleton with init()/play() API for 15 game sound events
- Added SoundSlice to gameStore with soundEnabled boolean (default true) and localStorage persistence
- Built Settings UI with gear button and parchment-styled modal containing sound toggle switch
- Integrated Settings components into Game.tsx with proper z-indexing

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Howler.js and create SoundService** - `462b891` (feat)
2. **Task 2: Add SoundSlice to gameStore with localStorage persistence** - `4e96a62` (feat)
3. **Task 3: Create Settings UI with sound toggle** - `b8961d0` (feat)

**Plan metadata:** `8460e1b` (docs: complete plan)

## Files Created/Modified

- `apps/web/src/services/sound.ts` - SoundService singleton wrapping Howler.js with SoundName type, SOUND_CONFIG, init(), play()
- `apps/web/src/components/Settings/SettingsButton.tsx` - Gear icon ActionIcon button for opening settings
- `apps/web/src/components/Settings/SettingsPanel.tsx` - Modal with Mantine Switch for sound toggle, parchment styling
- `apps/web/src/components/Settings/index.ts` - Barrel exports for Settings components
- `apps/web/public/sounds/` - Directory for MP3 sound effect files (15 files to be sourced)
- `package.json` - Added howler dependency
- `package-lock.json` - Updated lock file
- `apps/web/src/stores/gameStore.ts` - Added SoundSlice interface, soundEnabled state, toggleSound action, useSoundEnabled hook
- `apps/web/src/components/Game.tsx` - Added settingsOpen state, SettingsButton + SettingsPanel renders

## Decisions Made

- Used root `package.json` with `--legacy-peer-deps` flag since this is a single-root NX monorepo (no `apps/web/package.json`)
- SoundService reads `useGameStore.getState().soundEnabled` at play-time rather than subscribing to store changes
- Used `localStorage.getItem('catan-sound-enabled') !== 'false'` comparison to default sounds ON when key is absent
- Positioned settings gear button at top-right with z-index 25 (below modal z-indexes) to not interfere with gameplay modals
- Used text/emoji gear icon (⚙) consistent with project convention of no icon library
- Styled settings panel with parchment aesthetic matching StealModal pattern (background #fdf6e3, border #8d6e63)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Root-level npm install instead of apps/web**

- **Found during:** Task 1 (Install Howler.js)
- **Issue:** Plan specified `cd apps/web && npm install` but no `apps/web/package.json` exists — this is a single-root monorepo
- **Fix:** Ran `npm install howler && npm install -D @types/howler` at root with `--legacy-peer-deps` flag
- **Files modified:** package.json, package-lock.json
- **Verification:** `npx nx typecheck web` passes
- **Committed in:** 462b891 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary fix for monorepo structure. No scope creep.

## Issues Encountered

- `@mantine/charts` peer dependency conflict required `--legacy-peer-deps` flag for npm install — known project issue

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Sound infrastructure complete — Plan 02 can wire `soundService.play()` calls into all game event handlers
- MP3 sound files need to be sourced/created and placed in `apps/web/public/sounds/` — Plan 02 or manual step
- Settings UI is extensible for future settings (volume control, notification preferences, etc.)

---

## Self-Check: PASSED

All 8 created/modified files verified present. All 3 task commit hashes confirmed in git log.

---

_Phase: 15-add-sound-effects-during-gameplay_
_Completed: 2026-02-20_
