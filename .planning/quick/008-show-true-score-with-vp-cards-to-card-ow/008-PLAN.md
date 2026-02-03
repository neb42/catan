# Quick Plan 008: Show True Score with VP Cards to Card Owner

## Summary

When a player owns victory point development cards, display their true score in brackets next to the public VP badge on their player card. This should only be visible to the card owner, not to other players.

## Context

- `GamePlayerList.tsx` already calculates `publicVP` (settlements + cities + longest road + largest army)
- Component already has `myDevCards` and `myPlayerId` to identify current player's VP cards
- VP cards are filtered in `DevCardHand.tsx` with pattern: `myDevCards.filter((c) => c.type === 'victory_point')`
- Badge currently shows: `{publicVP} VP`

## Tasks

### Task 1: Add True Score Display for Card Owner

**File:** `apps/web/src/components/GamePlayerList.tsx`

**Changes:**

1. Calculate VP card count for current player:

   ```typescript
   const vpCardCount =
     player.id === myPlayerId
       ? myDevCards.filter((c) => c.type === 'victory_point').length
       : 0;
   ```

2. Calculate true score:

   ```typescript
   const trueVP = publicVP + vpCardCount;
   ```

3. Update Badge display to show true score in brackets when player has VP cards:

   ```typescript
   <Badge size="md" color="yellow" variant="filled" radius="sm">
     {publicVP} VP{player.id === myPlayerId && vpCardCount > 0 && ` [${trueVP}]`}
   </Badge>
   ```

4. Add tooltip explaining the bracket notation for the owner's card.

**Acceptance Criteria:**

- Player sees their public VP as before
- If player has VP cards, they see `[trueScore]` after their VP count
- Other players do NOT see the bracket notation on anyone's card
- Tooltip explains "Includes X hidden Victory Point cards"
