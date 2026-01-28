---
phase: quick-002
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/LobbyPlayerList.tsx
  - apps/web/src/components/GamePlayerList.tsx
  - apps/web/src/components/Lobby.tsx
  - apps/web/src/components/Game.tsx
autonomous: true

must_haves:
  truths:
    - 'Lobby displays interactive player list with color picker and ready toggle'
    - 'Game displays simplified player list with turn indicator only'
    - 'Both components share visual styling but different interactivity'
  artifacts:
    - path: 'apps/web/src/components/LobbyPlayerList.tsx'
      provides: 'Interactive player list for lobby phase'
      min_lines: 150
      exports: ['LobbyPlayerList']
    - path: 'apps/web/src/components/GamePlayerList.tsx'
      provides: 'Display-only player list for game phase'
      min_lines: 80
      exports: ['GamePlayerList']
  key_links:
    - from: 'apps/web/src/components/Lobby.tsx'
      to: 'LobbyPlayerList'
      via: 'import and render'
      pattern: 'import.*LobbyPlayerList'
    - from: 'apps/web/src/components/Game.tsx'
      to: 'GamePlayerList'
      via: 'import and render'
      pattern: 'import.*GamePlayerList'
---

<objective>
Split PlayerList component into two purpose-specific variants to eliminate unused props and improve maintainability.

Purpose: Current PlayerList serves both lobby (interactive) and game (display-only) contexts, requiring callbacks that are stubbed out during game phase. Separate components clarify intent and remove unnecessary coupling.

Output: LobbyPlayerList.tsx (interactive) and GamePlayerList.tsx (display-only), with original PlayerList.tsx removed.
</objective>

<execution_context>
@~/.config/opencode/get-shit-done/workflows/execute-plan.md
@~/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@apps/web/src/components/PlayerList.tsx
@apps/web/src/components/Lobby.tsx
@apps/web/src/components/Game.tsx
@AGENTS.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create LobbyPlayerList component</name>
  <files>apps/web/src/components/LobbyPlayerList.tsx</files>
  <action>
    Create LobbyPlayerList.tsx by extracting lobby-specific functionality from PlayerList.tsx:
    
    - Accept props: players, currentPlayerId, onColorChange, onReadyToggle
    - Keep all interactive features: color picker, ready badge click, 4-slot grid layout
    - Keep empty slot rendering ("Waiting for player...")
    - Remove activePlayerId logic from useCurrentPlayer (not needed in lobby)
    - Remove "Taking Turn" badge (lobby has no turns)
    - Preserve all styling: motion animations, card layouts, avatar initials, color swatches
    - Use PLAYER_COLORS from @catan/shared for color picker
    - Export as named export: `export function LobbyPlayerList`
  </action>
  <verify>
    Build succeeds: `npx nx build web`
    Component exports correctly: `grep "export function LobbyPlayerList" apps/web/src/components/LobbyPlayerList.tsx`
  </verify>
  <done>
    LobbyPlayerList.tsx exists with full interactive lobby functionality (color picker, ready toggle, 4-slot layout) and no turn-related logic.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create GamePlayerList component</name>
  <files>apps/web/src/components/GamePlayerList.tsx</files>
  <action>
    Create GamePlayerList.tsx as simplified display-only variant:
    
    - Accept single prop: players (array only, no callbacks)
    - Use useCurrentPlayer hook to get activePlayerId for turn highlighting
    - Show only filled player slots (no empty slots during game)
    - Keep active turn indicator: motion animation with pulse, "Taking Turn" badge
    - Remove color picker (no color changes during game)
    - Remove ready toggle (no ready state during game)
    - Simplify layout: vertical stack or 2x2 grid, smaller cards suitable for sidebar
    - Preserve turn animation: pulsing border/shadow when isActiveTurn
    - Export as named export: `export function GamePlayerList`
  </action>
  <verify>
    Build succeeds: `npx nx build web`
    Component exports correctly: `grep "export function GamePlayerList" apps/web/src/components/GamePlayerList.tsx`
    Uses useCurrentPlayer: `grep "useCurrentPlayer" apps/web/src/components/GamePlayerList.tsx`
  </verify>
  <done>
    GamePlayerList.tsx exists with display-only game functionality (turn indicator, no interactivity) and uses useCurrentPlayer for active player detection.
  </done>
</task>

<task type="auto">
  <name>Task 3: Update Lobby and Game components, remove old PlayerList</name>
  <files>apps/web/src/components/Lobby.tsx, apps/web/src/components/Game.tsx, apps/web/src/components/PlayerList.tsx</files>
  <action>
    Update imports and usage:
    
    Lobby.tsx:
    - Replace `import PlayerList from './PlayerList'` with `import { LobbyPlayerList } from './LobbyPlayerList'`
    - Replace `<PlayerList ... />` with `<LobbyPlayerList ... />` (keep all props: players, currentPlayerId, onColorChange, onReadyToggle)
    
    Game.tsx:
    - Replace `import PlayerList from './PlayerList'` with `import { GamePlayerList } from './GamePlayerList'`
    - Replace `<PlayerList ... />` with `<GamePlayerList players={players} />` (remove currentPlayerId, onColorChange, onReadyToggle props)
    - Keep existing positioning/scaling styles on wrapper div
    
    Remove old PlayerList:
    - Delete apps/web/src/components/PlayerList.tsx
  </action>
  <verify>
    Build succeeds: `npx nx build web`
    Imports updated: `grep "LobbyPlayerList" apps/web/src/components/Lobby.tsx`
    Imports updated: `grep "GamePlayerList" apps/web/src/components/Game.tsx`
    Old file removed: `! test -f apps/web/src/components/PlayerList.tsx`
  </verify>
  <done>
    Lobby uses LobbyPlayerList, Game uses GamePlayerList, original PlayerList.tsx removed, project builds successfully.
  </done>
</task>

</tasks>

<verification>
1. Build succeeds: `npx nx build web`
2. Type check passes: `npx nx typecheck web`
3. Lobby displays interactive player list with color picker and ready toggle
4. Game displays simplified player list with turn indicator only
5. No references to old PlayerList.tsx remain in codebase
</verification>

<success_criteria>

- LobbyPlayerList.tsx created with full interactive features (color picker, ready toggle, empty slots)
- GamePlayerList.tsx created with display-only features (turn indicator, no interactivity)
- Lobby.tsx imports and uses LobbyPlayerList
- Game.tsx imports and uses GamePlayerList
- Original PlayerList.tsx deleted
- Project builds and type checks successfully
- Both components maintain visual consistency with original design
  </success_criteria>

<output>
After completion, create `.planning/quick/002-decouple-playerlist-component-into-separ/002-SUMMARY.md`
</output>
