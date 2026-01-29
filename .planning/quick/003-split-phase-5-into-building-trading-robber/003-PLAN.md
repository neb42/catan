---
phase: quick
plan: 003
type: execute
wave: 1
depends_on: []
files_modified: [.planning/ROADMAP.md]
autonomous: true

must_haves:
  truths:
    - 'ROADMAP.md shows 9 phases instead of 7'
    - 'Phase 5 covers only Building requirements (BUILD-01 through BUILD-08)'
    - 'Phase 6 covers only Trading requirements (TRADE-01 through TRADE-06)'
    - 'Phase 7 covers only Robber requirements (ROBBER-01 through ROBBER-05)'
    - 'Phase 8 is Advanced Features (formerly Phase 6)'
    - 'Phase 9 is Resilience & Polish (formerly Phase 7)'
    - 'Validation Matrix shows correct requirement counts per phase'
  artifacts:
    - path: '.planning/ROADMAP.md'
      provides: 'Updated roadmap with 9-phase structure'
      contains: '9-phase roadmap'
  key_links:
    - from: 'Phase 6 dependency'
      to: 'Phase 5'
      via: 'depends_on'
    - from: 'Phase 7 dependency'
      to: 'Phase 6'
      via: 'depends_on'
---

<objective>
Split Phase 5 (Game Mechanics) into 3 focused phases and renumber existing phases 6-7 to 8-9.

Purpose: Phase 5 has 22 requirements — too large for a single phase. Splitting into Building/Trading/Robber creates manageable, focused phases aligned with GSD principles of ~2-3 tasks per plan.

Output: Updated ROADMAP.md with 9 phases total, correct requirement mappings, and updated validation matrix.
</objective>

<execution_context>
@~/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/ROADMAP.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Split Phase 5 into Building, Trading, and Robber phases</name>
  <files>.planning/ROADMAP.md</files>
  <action>
  Replace the current Phase 5: Game Mechanics section (lines 210-267) with three separate phases:

**Phase 5: Building**

- Goal: Enable building roads, settlements, and cities with cost validation
- Duration: 1 week
- Dependencies: Phase 4
- Requirements (8): BUILD-01 through BUILD-08 (lines 218-226)
- Success Criteria: Building system works end-to-end — Buy road/settlement/city, resources deducted, piece placed, validation prevents illegal moves
- Deliverables: Building system (costs, validation, placement), Building cost reference card UI

**Phase 6: Trading** (NEW)

- Goal: Enable domestic and maritime trading between players and bank
- Duration: 1 week
- Dependencies: Phase 5 (Building)
- Requirements (6): TRADE-01 through TRADE-06 (lines 228-235)
- Success Criteria: Domestic trading works (propose, accept, transfer), Maritime trading works (4:1 bank, 3:1 port, 2:1 specific port)
- Deliverables: Domestic trade UI (offer, accept/reject), Maritime trade UI (bank and port rates)

**Phase 7: Robber** (NEW)

- Goal: Implement robber mechanics for 7 rolls
- Duration: 0.5-1 week
- Dependencies: Phase 6 (Trading)
- Requirements (8): ROBBER-01 through ROBBER-05 PLUS the 3 supporting requirements (RES-03, UX-02, UX-03)
- Note: Move supporting requirements (RES-03, UX-02, UX-03) into Phase 7 since they're cross-cutting and fit naturally with robber's feedback requirements
- Success Criteria: Robber triggers on 7, discard UI appears for 8+ card players, robber moves, steal works, feedback system works
- Deliverables: Robber system (discard UI, move UI, steal logic), Action feedback system (toasts/notifications), Opponent resource count display

Each phase should follow the existing structure format with Requirements, Success Criteria, Plans (TBD), and Deliverables sections.
</action>
<verify>grep -c "## Phase [5-7]:" .planning/ROADMAP.md should return 3</verify>
<done>Phase 5 contains only BUILD-_ requirements, Phase 6 contains only TRADE-_ requirements, Phase 7 contains ROBBER-\* plus supporting requirements</done>
</task>

<task type="auto">
  <name>Task 2: Renumber Phase 6 → 8 and Phase 7 → 9</name>
  <files>.planning/ROADMAP.md</files>
  <action>
  Renumber existing phases:

1. Current "Phase 6: Advanced Features" becomes "Phase 8: Advanced Features"
   - Update "Dependencies: Phase 5" to "Dependencies: Phase 7"

2. Current "Phase 7: Resilience & Polish" becomes "Phase 9: Resilience & Polish"
   - Update "Dependencies: Phase 6" to "Dependencies: Phase 8"

3. Update Overview section (line 10):
   - "7-phase roadmap" → "9-phase roadmap"
   - "Delivery Strategy: Ship after Phase 7" → "Delivery Strategy: Ship after Phase 9"

4. Update Validation Matrix (lines 371-379):
   - Split Phase 5 row into three rows:
     - Phase 5: Building | 8 | 12%
     - Phase 6: Trading | 6 | 9%
     - Phase 7: Robber | 8 | 12% (5 ROBBER + 3 supporting)
   - Rename Phase 6: Advanced Features → Phase 8: Advanced Features
   - Rename Phase 7: Resilience & Polish → Phase 9: Resilience & Polish

5. Update Phase Dependencies section (lines 381-388):
   - Add: "Phase 6 depends on Phase 5 (needs building system)"
   - Add: "Phase 7 depends on Phase 6 (needs trading system for resource management context)"
   - Change: "Phase 5 depends on Phase 4" remains
   - Change: Phase 6 → "Phase 8 depends on Phase 7 (needs robber/complete mechanics)"
   - Change: Phase 7 → "Phase 9 depends on Phase 8 (needs complete game)"

6. Update Last updated line at bottom of file to current date and reflect the split.
   </action>
   <verify>grep "9-phase roadmap" .planning/ROADMAP.md && grep "Phase 8: Advanced Features" .planning/ROADMAP.md && grep "Phase 9: Resilience" .planning/ROADMAP.md</verify>
   <done>Overview says 9 phases, Advanced Features is Phase 8, Resilience & Polish is Phase 9, Validation Matrix has 9 rows, Dependencies chain is correct</done>
   </task>

</tasks>

<verification>
After both tasks complete:
1. `grep "## Phase" .planning/ROADMAP.md | wc -l` should return 9 (plus 1.1)
2. Phase numbers are sequential: 1, 1.1, 2, 3, 4, 5, 6, 7, 8, 9
3. Validation Matrix adds up to 68 requirements (6+3+2+6+8+6+8+19+10 = 68)
4. Dependency chain is unbroken: 1→2→3→4→5→6→7→8→9
</verification>

<success_criteria>

- ROADMAP.md reflects 9-phase structure
- Building (8 reqs), Trading (6 reqs), Robber (8 reqs) are separate phases 5/6/7
- Advanced Features is Phase 8, Resilience & Polish is Phase 9
- All cross-references updated (overview, validation matrix, dependencies)
- Total requirements still 68
  </success_criteria>

<output>
After completion, no summary needed for quick plans. Verify ROADMAP.md is correctly updated.
</output>
