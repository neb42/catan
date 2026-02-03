# Quick Task 008: Show True Score with VP Cards to Card Owner

## Summary

Added true score display to the player card VP badge when the player owns victory point development cards. Only the card owner can see their true score - other players only see the public VP count.

## Changes Made

### File: `apps/web/src/components/GamePlayerList.tsx`

1. **Added VP card count calculation** (lines 89-94):
   - Calculates `vpCardCount` for the current player by filtering their dev cards for `victory_point` type
   - Returns 0 for other players to maintain secrecy
   - Computes `trueVP = publicVP + vpCardCount`

2. **Updated VP Badge display** (lines 197-211):
   - Wrapped Badge in Tooltip component
   - Tooltip shows "Includes X hidden Victory Point card(s)" when player has VP cards
   - Shows "Victory Points" for all other cases
   - Badge now displays `{publicVP} VP [{trueVP}]` format when player has VP cards
   - Bracket notation only visible to the card owner

## Acceptance Criteria Met

- [x] Player sees their public VP as before
- [x] If player has VP cards, they see `[trueScore]` after their VP count
- [x] Other players do NOT see the bracket notation on anyone's card
- [x] Tooltip explains "Includes X hidden Victory Point cards"

## Commit

```
b656938 feat(quick-008): show true score with VP cards to card owner
```
