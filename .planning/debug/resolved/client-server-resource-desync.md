---
status: resolved
trigger: 'client-server-resource-desync: After playing Year of Plenty, resource counts desynchronized between client and server'
created: 2026-01-31T10:46:00.000Z
updated: 2026-01-31T10:50:00.000Z
---

## Current Focus

hypothesis: CONFIRMED - year_of_plenty_completed handler in Lobby.tsx double-counts resources
test: Analyzed code path from year_of_plenty_completed message to updatePlayerResources
expecting: Client adds YoP resources, then passes ALL resources to updatePlayerResources which ADDS again
next_action: Fix the bug by only passing the YoP resources to updatePlayerResources

## Symptoms

expected: Player should be able to buy dev cards when they have sufficient resources (1 ore, 1 sheep, 1 wheat). The client and server resource counts should remain synchronized.

actual: At turn 41, player "aaa" (ID: 430a2f64-8960-455f-837b-01c1d15e8b34) received `dev_card_play_failed` with reason "Not enough wheat" when attempting to buy a dev card.

errors: Line 363 of logs/messages.log: `[send] {"type":"dev_card_play_failed","reason":"Not enough wheat"}`

reproduction:

1. Play a game with multiple turns
2. Use Year of Plenty card to gain resources
3. Continue playing and buying dev cards
4. Eventually client thinks they have resources but server disagrees

started: Observed at Turn 41, possibly originated at Turn 37 (Year of Plenty)

## Eliminated

## Evidence

- timestamp: 2026-01-31T10:46:00.000Z
  checked: Message log lines 317-324 (Year of Plenty sequence)
  found: |
  - Line 317: play_dev_card for year_of_plenty (card 3a4648fb-2d56-4f08-82ed-2aa02b5cb244)
  - Line 318-319: dev_card_played sent, year_of_plenty_required sent
  - Line 320: year_of_plenty_select received with ["ore","sheep"]
  - Line 321: year_of_plenty_completed sent with ["ore","sheep"]
  - Line 322: buy_dev_card received
  - Line 323-324: dev_card_purchased sent with resourcesSpent: {"ore":1,"sheep":1,"wheat":1}
    implication: Year of Plenty granted ore+sheep, NOT wheat. But dev card purchase requires wheat. Player must have had wheat from earlier. The purchase at Turn 37 succeeded.

- timestamp: 2026-01-31T10:46:00.000Z
  checked: Message log lines 353-363 (Turn 41 failure sequence)
  found: |
  - Line 353: turn_changed to player "aaa", turn 41
  - Line 354-355: dice rolled, 9, resources to "bbb" only (ore)
  - Line 356-361: Trade proposed and executed - "aaa" gave sheep, received ore
  - Line 362: buy_dev_card received from "aaa"
  - Line 363: dev_card_play_failed with "Not enough wheat"
    implication: Server believes player "aaa" does not have enough wheat at Turn 41

- timestamp: 2026-01-31T10:47:00.000Z
  checked: Client-side year_of_plenty_completed handler in Lobby.tsx (lines 686-718)
  found: |
  Handler does:
  1. Gets current resources from store
  2. Manually adds YoP resources to currentResources object
  3. Converts ENTIRE currentResources object to array format
  4. Calls updatePlayerResources(playerId, resourceUpdates)
     But updatePlayerResources ADDS the passed values to existing state!
     So resources get counted twice: once manually, once by updatePlayerResources.
     implication: Client doubles ALL resources every time Year of Plenty is played, causing client to have more resources than server

## Resolution

root_cause: year_of_plenty_completed and monopoly_executed handlers in Lobby.tsx incorrectly called updatePlayerResources with ALL player resources instead of just the delta. Since updatePlayerResources ADDS the provided values to existing state, this caused all resources to be doubled.

fix: Changed both handlers to only pass the delta (resources gained/lost) to updatePlayerResources:

- year_of_plenty_completed: Now only passes the 2 resources selected from bank (e.g., [{type:'ore',count:1},{type:'sheep',count:1}])
- monopoly_executed: Now passes negative delta for victims (e.g., [{type:'wheat',count:-3}]) and positive delta for monopoly player

verification: TypeScript compilation passes, Prettier formatting passes
files_changed:

- apps/web/src/components/Lobby.tsx
