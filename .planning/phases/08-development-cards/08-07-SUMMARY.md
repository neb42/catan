---
phase: 08-development-cards
plan: 07
status: complete
started: 2026-01-30
completed: 2026-01-30
affects:
  - phase-08
subsystem: development-cards
tech-stack:
  added: []
  used:
    - TypeScript
    - React
    - Zustand
    - Mantine
decisions:
  - id: UI-01
    choice: VP cards separated visually with gold border in DevCardHand
    rationale: Distinguish secret VP cards from playable action cards
  - id: UI-02
    choice: BuyDevCardButton placed after build buttons in BuildControls
    rationale: Dev cards are a purchase action similar to building
  - id: UI-03
    choice: Dev card and knight counts shown as badges in GamePlayerList
    rationale: Visible info for Largest Army tracking and card counting
---

# Summary: Dev Card UI Components

## What Was Done

### Task 1: Create DevCardButton and DevCardHand components

**Created `apps/web/src/components/DevCard/DevCardButton.tsx`:**

- Displays card with icon, name, and color based on card type
- Validates playability (turn, phase, same-turn restriction, one-per-turn rule)
- VP cards styled with `variant="light"` and grayed out (never playable)
- Shows tooltip with disabled reason when not playable
- Sends `play_dev_card` message on click

**Created `apps/web/src/components/DevCard/DevCardHand.tsx`:**

- Displays all owned dev cards using DevCardButton
- Separates VP cards with gold border visual distinction
- Returns null when no cards owned (clean UI)

### Task 2: Create BuyDevCardButton and integrate with BuildControls

**Created `apps/web/src/components/DevCard/BuyDevCardButton.tsx`:**

- Uses `useCanBuyDevCard` hook for validation
- Shows deck remaining count in badge
- Tooltip shows reason when disabled
- Sends `buy_dev_card` message on click

**Updated `apps/web/src/components/BuildControls/BuildControls.tsx`:**

- Added import for BuyDevCardButton
- Rendered BuyDevCardButton after build buttons in controls group

### Task 3: Add opponent dev card counts and knight counts to GamePlayerList

**Updated `apps/web/src/components/GamePlayerList.tsx`:**

- Added state selectors for opponentDevCardCounts, knightsPlayed, myDevCards, myPlayerId
- Added dev card count badge (📜) for each player
  - Shows myDevCards.length for self, opponentDevCardCounts for others
- Added knight count badge (⚔️) when knightsPlayed > 0
- Both badges have tooltips explaining their meaning

**Updated `apps/web/src/components/Game.tsx`:**

- Added import for DevCardHand
- Rendered DevCardHand below ResourceHand in bottom-left panel

## Key Files

| File                                                      | Changes                                   |
| --------------------------------------------------------- | ----------------------------------------- |
| `apps/web/src/components/DevCard/DevCardButton.tsx`       | Created - card display with playability   |
| `apps/web/src/components/DevCard/DevCardHand.tsx`         | Created - hand display with VP separation |
| `apps/web/src/components/DevCard/BuyDevCardButton.tsx`    | Created - purchase button with deck count |
| `apps/web/src/components/BuildControls/BuildControls.tsx` | Added BuyDevCardButton                    |
| `apps/web/src/components/GamePlayerList.tsx`              | Added dev card and knight badges          |
| `apps/web/src/components/Game.tsx`                        | Added DevCardHand to layout               |

## Verification

- [x] `npx nx build web` passes
- [x] Dev cards display in hand with correct icons and names
- [x] Unplayable cards are grayed with tooltip
- [x] VP cards have distinct gold border/styling
- [x] Buy Dev Card button shows deck count
- [x] Opponent card counts visible in player list
- [x] Knight counts visible for Largest Army tracking

## Card Type Styling

| Card Type      | Icon | Color           | Playable         |
| -------------- | ---- | --------------- | ---------------- |
| Knight         | ⚔️   | #8B4513 (brown) | Yes              |
| Victory Point  | ⭐   | #FFD700 (gold)  | No (auto-scores) |
| Road Building  | 🛤️   | #654321 (brown) | Yes              |
| Year of Plenty | 🌾   | #228B22 (green) | Yes              |
| Monopoly       | 💰   | #4169E1 (blue)  | Yes              |
