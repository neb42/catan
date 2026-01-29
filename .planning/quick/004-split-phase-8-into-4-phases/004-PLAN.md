---
quick: 004
type: execute
autonomous: true
files_modified:
  - .planning/ROADMAP.md
  - .planning/STATE.md
---

<objective>
Split Phase 8 (Advanced Features - 19 requirements) into 4 focused phases:
- Phase 8: Development Cards (DEV-01 to DEV-09)
- Phase 9: Longest Road (SCORE-01 to SCORE-03)
- Phase 10: Largest Army (SCORE-04 to SCORE-06)
- Phase 11: Victory (SCORE-07 to SCORE-10)

Then renumber current Phase 9 (Resilience & Polish) to Phase 12.

Purpose: Smaller phases = more manageable scope, better parallelization of dev card vs scoring work.
Output: Updated ROADMAP.md with 12 phases total.
</objective>

<context>
@.planning/ROADMAP.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Split Phase 8 and renumber phases in ROADMAP.md</name>
  <files>.planning/ROADMAP.md</files>
  <action>
Edit ROADMAP.md to split Phase 8 into 4 phases and renumber:

**Phase 8: Development Cards** (Duration: 1 week)

- Goal: Implement development card deck and all card types
- Requirements: DEV-01 through DEV-09 (9 requirements)
- Dependencies: Phase 7
- Success Criteria:
  1. Dev cards work correctly — Buy card, can't play same turn, can play next turn, each card type works as specified
  2. VP cards stay hidden — Opponents can't see VP cards in hand, revealed only on win or game end
- Deliverables:
  - Development card deck system (shuffle, draw)
  - Dev card UI (hand display, play actions)
  - All 5 dev card implementations

**Phase 9: Longest Road** (Duration: 0.5 week)

- Goal: Track longest road and award bonus points
- Requirements: SCORE-01 through SCORE-03 (3 requirements)
- Dependencies: Phase 8 (needs Knight card for road blocking tests)
- Success Criteria:
  1. Longest road calculates correctly — Award at 5+ roads, transfers when surpassed, ties handled, opponent settlements block
- Deliverables:
  - Longest road algorithm (DFS with blocking)
  - Longest road card UI and tracking

**Phase 10: Largest Army** (Duration: 0.5 week)

- Goal: Track largest army and award bonus points
- Requirements: SCORE-04 through SCORE-06 (3 requirements)
- Dependencies: Phase 8 (needs Knight card to be implemented)
- Success Criteria:
  1. Largest army calculates correctly — Award at 3+ knights, transfers when surpassed, ties handled
- Deliverables:
  - Largest army tracking
  - Largest army card UI

**Phase 11: Victory** (Duration: 0.5 week)

- Goal: Calculate victory points and detect game end
- Requirements: SCORE-07 through SCORE-10 (4 requirements)
- Dependencies: Phase 9 and 10 (needs longest road/largest army for VP calculation)
- Success Criteria:
  1. Victory detection works — Player reaches 10 VP, game ends immediately, winner announced
- Deliverables:
  - Victory point calculation system
  - Win detection and end game UI

**Phase 12: Resilience & Polish** (same content as current Phase 9, just renumbered)

Update the Validation Matrix:

- Phase 8: Development Cards = 9 = 13%
- Phase 9: Longest Road = 3 = 4%
- Phase 10: Largest Army = 3 = 4%
- Phase 11: Victory = 4 = 6%
- Phase 12: Resilience & Polish = 10 = 15%

Update Phase Dependencies section to reflect new numbering.

Update overview to show "12-phase roadmap" and timeline "12-14 weeks".

Update "Last updated" footer to reflect this change.
</action>
<verify>Read ROADMAP.md and confirm 12 phases exist with correct requirement distribution</verify>
<done>ROADMAP.md contains Phase 8-12 with split requirements, validation matrix updated, dependencies updated</done>
</task>

<task type="auto">
  <name>Task 2: Update STATE.md with quick task entry</name>
  <files>.planning/STATE.md</files>
  <action>
Add entry to Quick Tasks Completed table:
| 004 | Split Phase 8 into Development Cards/Longest Road/Largest Army/Victory | {date} | {commit} | [004-split-phase-8-into-4-phases](./quick/004-split-phase-8-into-4-phases/) |

Update "Phase: 4 of 12" (was 4 of 9) in Current Position section.
Update Last activity line.
</action>
<verify>Read STATE.md and confirm quick task 004 entry exists and phase count is 12</verify>
<done>STATE.md reflects 12-phase project structure and documents quick task 004</done>
</task>

</tasks>

<verification>
- `grep -c "^## Phase" .planning/ROADMAP.md` returns 12 (or appropriate count including 1.1)
- Phase 8 section contains only DEV-* requirements
- Phase 9 section contains only SCORE-01 to SCORE-03
- Phase 10 section contains only SCORE-04 to SCORE-06
- Phase 11 section contains only SCORE-07 to SCORE-10
- Phase 12 contains resilience/polish requirements (SYNC-*, LOBBY-*, UX-*)
</verification>

<success_criteria>

- ROADMAP.md has 12 phases (plus Phase 1.1)
- Phase 8 = Development Cards (9 requirements)
- Phase 9 = Longest Road (3 requirements)
- Phase 10 = Largest Army (3 requirements)
- Phase 11 = Victory (4 requirements)
- Phase 12 = Resilience & Polish (10 requirements)
- Validation matrix totals still equal 68 requirements
- STATE.md updated with new phase count and quick task entry
  </success_criteria>

<output>
After completion, commit changes with message:
"docs(roadmap): split Phase 8 into 4 focused phases

- Phase 8: Development Cards (DEV-01 to DEV-09)
- Phase 9: Longest Road (SCORE-01 to SCORE-03)
- Phase 10: Largest Army (SCORE-04 to SCORE-06)
- Phase 11: Victory (SCORE-07 to SCORE-10)
- Renumber Resilience & Polish to Phase 12
- Now 12 phases total (was 9)"
  </output>
