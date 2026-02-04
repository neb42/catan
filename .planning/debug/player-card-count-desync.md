# Debug: Player Card Count Desync

## Issue Summary

Player 1 sees a higher card count for Player 2 than Player 2's actual count. Player 2 sees their own count correctly.

## Symptoms

- **Expected:** All players should see the same card count for any player
- **Actual:** Player 1 sees a higher card count for Player 2 than Player 2's actual count
- **Errors:** None
- **Reproduction:** Seems to happen in relation to development cards
- **Timeline:** Unknown if regression or always broken

## Root Cause Analysis

### Investigation Steps

1. Traced the display logic in `GamePlayerList.tsx` which shows card counts
2. Found two card count displays: resource cards and development cards
3. Traced message flow for buying development cards
4. Identified desync in resource tracking between clients

### Root Cause Found

**The `dev_card_purchased_public` handler does not deduct resources from the buyer.**

When a player buys a development card:

1. **Buyer's client** receives `dev_card_purchased`:
   - Adds card to `myDevCards`
   - **Deducts resources** (1 ore, 1 sheep, 1 wheat = 3 resources)
2. **Other players' clients** receive `dev_card_purchased_public`:
   - Increments `opponentDevCardCounts[buyerId]`
   - **Does NOT deduct resources** from the buyer

This causes the desync: opponents see 3 extra resources for the buyer.

### Code Locations

**Server (websocket.ts lines 1091-1110):**

- Sends `dev_card_purchased_public` without `resourcesSpent` field

**Message Schema (messages.ts lines 406-410):**

- `DevCardPurchasedPublicMessageSchema` lacks `resourcesSpent` field

**Client handler (Lobby.tsx lines 633-645):**

- `dev_card_purchased_public` case does NOT deduct resources

**Contrast with buyer handler (Lobby.tsx lines 612-630):**

- `dev_card_purchased` case DOES deduct resources

## Fix

### Option 1: Use constant cost in client (Simpler)

Since dev card cost is always the same (1 ore, 1 sheep, 1 wheat), the client can use the `DEV_CARD_COST` constant from shared.

**Changes needed:**

- Update `dev_card_purchased_public` handler in `Lobby.tsx` to deduct `DEV_CARD_COST` from the buyer

### Option 2: Add resourcesSpent to message (More explicit)

Add `resourcesSpent` to both the message schema and the server-sent message.

**Changes needed:**

- Update `DevCardPurchasedPublicMessageSchema` to include optional `resourcesSpent`
- Update server to include `resourcesSpent` in `dev_card_purchased_public` message
- Update `dev_card_purchased_public` handler in `Lobby.tsx` to deduct resources

### Chosen Approach

Option 1 is simpler and sufficient since the cost is fixed. However, Option 2 provides more flexibility if costs ever change. Will implement Option 1.

## Fix Implementation

File: `apps/web/src/components/Lobby.tsx`

Update the `dev_card_purchased_public` handler to deduct resources from the buyer using the `DEV_CARD_COST` constant.
