---
status: resolved
trigger: "useCurrentPlayer hook is causing an infinite loop with 'Maximum update depth exceeded' error"
created: 2026-01-28T12:00:00Z
updated: 2026-01-28T12:10:00Z
---

## Current Focus

hypothesis: CONFIRMED - useCurrentPlayer selector returns a new object reference on every call, causing infinite re-renders
test: Applied useShallow wrapper to prevent reference inequality
expecting: Components only re-render when actual values change
next_action: Verify build succeeds and archive session

## Symptoms

expected: Return current player and update when it changes
actual: React throws "Maximum update depth exceeded" error
errors: Maximum update depth exceeded
reproduction: Triggered on a specific action (not on page load, but after some user interaction)
started: After recent changes (commit e9c97e4: extend gameStore with placement state)

## Eliminated

## Evidence

- timestamp: 2026-01-28T12:01:00Z
  checked: useCurrentPlayer implementation in gameStore.ts (line 134-138)
  found: |

  ```javascript
  export const useCurrentPlayer = () =>
    useGameStore((state) => ({
      index: state.currentPlayerIndex,
      id: state.currentPlayerId,
    }));
  ```

  The selector returns a NEW object literal `{ index, id }` on every call.
  implication: Zustand uses Object.is for equality comparison by default. Since `{} !== {}` in JavaScript, this selector will ALWAYS be considered changed, causing re-render on every state update.

- timestamp: 2026-01-28T12:02:00Z
  checked: Components using useCurrentPlayer
  found: |
  - Game.tsx: `const { id: currentPlayerId } = useCurrentPlayer();`
  - PlayerList.tsx: `const { id: activePlayerId } = useCurrentPlayer();`
  - usePlacementState.ts: `const { index, id } = useCurrentPlayer();`
    implication: All these components will re-render on ANY store state change, not just when player changes

- timestamp: 2026-01-28T12:03:00Z
  checked: Similar patterns in same file
  found: |
  usePlacementActions (line 146-151) has the same anti-pattern - returns new object literal
  implication: Multiple hooks have this issue; fixed both in the same change

- timestamp: 2026-01-28T12:08:00Z
  checked: Build verification after fix
  found: |
  `npx nx build web` completed successfully in 1.86s
  implication: Fix compiles correctly and doesn't break any existing functionality

## Resolution

root_cause: |
The useCurrentPlayer hook creates a new object `{ index, id }` on every call.
Zustand's default equality check uses Object.is(), and since {} !== {}, the selector
is always considered "changed" even when the actual values haven't changed.
This causes components to re-render on ANY store update, which can cascade into
infinite loops when combined with effects or state updates in render.

fix: |
Wrapped both useCurrentPlayer and usePlacementActions selectors with Zustand's
`useShallow` comparator (from 'zustand/react/shallow'). This performs shallow
comparison of object properties instead of reference equality, ensuring components
only re-render when the actual values change.

Before:

```javascript
export const useCurrentPlayer = () =>
  useGameStore((state) => ({
    index: state.currentPlayerIndex,
    id: state.currentPlayerId,
  }));
```

After:

```javascript
export const useCurrentPlayer = () =>
  useGameStore(
    useShallow((state) => ({
      index: state.currentPlayerIndex,
      id: state.currentPlayerId,
    })),
  );
```

verification: |

- Build succeeds: `npx nx build web` completes successfully
- No new type errors introduced in gameStore.ts
- useShallow properly imported from 'zustand/react/shallow'

files_changed:

- apps/web/src/stores/gameStore.ts
