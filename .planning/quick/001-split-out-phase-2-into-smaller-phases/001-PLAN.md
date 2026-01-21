---
phase: quick-001
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/ROADMAP.md
  - .planning/STATE.md
autonomous: true

must_haves:
  truths:
    - "Phase 2 is split into 3 logical phases"
    - "New phases have correct numbering (2, 3, 4)"
    - "Subsequent phases renumbered accordingly (old Phase 3→5, Phase 4→6, etc.)"
    - "All phase directory names match new numbering"
    - "All internal PLAN.md files reflect correct phase numbers"
  artifacts:
    - path: ".planning/ROADMAP.md"
      provides: "Updated roadmap with split phases"
      contains: "Phase 2: Board Generation"
    - path: ".planning/ROADMAP.md"
      provides: "Updated roadmap with split phases"
      contains: "Phase 3: Initial Placement"
    - path: ".planning/ROADMAP.md"
      provides: "Updated roadmap with split phases"
      contains: "Phase 4: Turn Structure"
  key_links:
    - from: ".planning/ROADMAP.md"
      to: ".planning/phases/"
      via: "Phase numbering consistency"
      pattern: "Phase [0-9]+"
---

<objective>
Split overly large Phase 2 (11 requirements, 9 plans) into 3 smaller, logically coherent phases and renumber all subsequent phases accordingly.

**Purpose:** Improve manageability and execution flow by creating atomic phases with clear boundaries.

**Output:** Updated ROADMAP.md and STATE.md with new phase structure, with phase directories and plan files properly renumbered.
</objective>

<execution_context>
@./.github/get-shit-done/workflows/execute-plan.md
@./.github/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

Current Phase 2 covers 4 distinct concerns:
1. Board generation (BOARD-01, BOARD-02, BOARD-03) - Pure generation logic
2. Initial placement (BOARD-04, BOARD-05) - Snake draft and starting resources
3. Turn structure (TURN-01, TURN-02, TURN-03, TURN-04) - Dice, resource distribution, phases
4. Resource tracking (RES-01, RES-02) - UI for viewing resources

Phase 2 plans distribution:
- Plans 01-03: Foundation and board generation
- Plans 04-07: Initial placement and board rendering
- Plans 08-09: Hex orientation fixes and ports

The split will group related concerns while maintaining dependencies.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Restructure ROADMAP.md with split phases</name>
  <files>.planning/ROADMAP.md</files>
  <action>
Split current Phase 2 into three phases and renumber all subsequent phases:

**New Phase 2: Board Generation & Rendering**
- Goal: "Generate random Catan board with hexes, numbers, and ports"
- Requirements: BOARD-01, BOARD-02, BOARD-03
- Plans: 02-01 (foundation), 02-03 (rendering), 02-08 (hex orientation), 02-09 (ports)
- Success criteria focused on board generation and visual rendering
- Duration: 1 week

**New Phase 3: Initial Placement**
- Goal: "Implement snake draft for initial settlements and roads"
- Requirements: BOARD-04, BOARD-05
- Plans: 02-02 (GameManager + placement), 02-06 (interactive placement), 02-07 (phase transitions)
- Success criteria focused on setup phase completion
- Duration: 1 week
- Dependencies: Phase 2

**New Phase 4: Turn Structure & Resources**
- Goal: "Enable turn-based gameplay with dice rolling and resource distribution"
- Requirements: TURN-01, TURN-02, TURN-03, TURN-04, RES-01, RES-02
- Plans: 02-04 (turn structure + dice), 02-05 (resource tracking UI)
- Success criteria focused on turn flow and resource management
- Duration: 1 week
- Dependencies: Phase 3

**Renumber subsequent phases:**
- Old Phase 3 (Client Rendering) → New Phase 5
- Old Phase 4 (Game Mechanics) → New Phase 6
- Old Phase 5 (Advanced Features) → New Phase 7
- Old Phase 6 (Polish) → New Phase 8

Update all phase cross-references, dependencies, and duration estimates. Maintain original success criteria within each split phase.
  </action>
  <verify>
Run: `grep -E "^## Phase [0-9]:" .planning/ROADMAP.md | wc -l`
Should show 9 phases (1, 1.1, 2, 3, 4, 5, 6, 7, 8)

Run: `grep "^## Phase 2:" .planning/ROADMAP.md`
Should show "Phase 2: Board Generation & Rendering"
  </verify>
  <done>ROADMAP.md contains 8 main phases (plus 1.1), Phase 2 covers board generation only, Phase 3 covers initial placement, Phase 4 covers turn structure, all subsequent phases renumbered correctly</done>
</task>

<task type="auto">
  <name>Task 2: Update STATE.md with new phase structure</name>
  <files>.planning/STATE.md</files>
  <action>
Update the Phase Progress section to reflect the new phase split:

1. Keep Phase 1 and 1.1 unchanged
2. Split Phase 2 section into three sections:
   - **Phase 2: Board Generation & Rendering** (with BOARD-01, BOARD-02, BOARD-03)
   - **Phase 3: Initial Placement** (with BOARD-04, BOARD-05)
   - **Phase 4: Turn Structure & Resources** (with TURN-01 through TURN-04, RES-01, RES-02)
3. Renumber old Phase 3 → Phase 5, old Phase 4 → Phase 6, etc.

Update "Current Phase" section if it references Phase 2 - keep it as Phase 1 since Phase 2 work hasn't truly started yet (only 7/9 plans complete due to blockers).

Maintain completion status for each requirement exactly as before.
  </action>
  <verify>
Run: `grep -E "^### Phase [0-9]" .planning/STATE.md | wc -l`
Should show 8 phase sections (1, 1.1, 2, 3, 4, 5, 6, 7, 8)

Run: `grep "Phase 2: Board Generation" .planning/STATE.md`
Should find the new Phase 2 title
  </verify>
  <done>STATE.md phase structure matches ROADMAP.md, all requirements properly distributed across new phases, completion tracking preserved</done>
</task>

<task type="auto">
  <name>Task 3: Renumber phase directories and update internal plan files</name>
  <files>.planning/phases/</files>
  <action>
Renumber phase directories and update plan frontmatter to match new structure:

**Step 1: Keep existing phase 02 directory structure**
The current 02-core-game-loop directory will remain as-is since we're splitting conceptually but the plans are already distributed. Plans 02-01 through 02-09 stay in phase 02.

**Step 2: Create placeholder directories for new phases**
```bash
mkdir -p .planning/phases/03-initial-placement
mkdir -p .planning/phases/04-turn-structure-and-resources
```

**Step 3: Document the plan-to-phase mapping**
Create a README.md in .planning/phases/ explaining:
- Phase 2 contains plans 02-01, 02-03, 02-08, 02-09 (Board Generation)
- Phase 3 logically maps to plans 02-02, 02-06, 02-07 (Initial Placement)
- Phase 4 logically maps to plans 02-04, 02-05 (Turn Structure)

**Important:** Do NOT physically move or renumber the plan files. The 02-XX plans have already been executed and have SUMMARYs, git history, and references. Moving them would break references.

Instead, document the logical mapping so future execution understands which plans belong to which conceptual phase.

The actual physical reorganization would only happen for new phases going forward (phases 5-8 and beyond).
  </action>
  <verify>
Run: `ls -d .planning/phases/0[3-4]-*`
Should show the new placeholder directories

Run: `cat .planning/phases/README.md`
Should explain the plan-to-phase mapping for Phase 2-4
  </verify>
  <done>New phase directories created, README documents logical mapping, existing 02-XX plans remain in place with git history preserved</done>
</task>

</tasks>

<verification>
1. Run `cat .planning/ROADMAP.md` and verify 8 main phases exist with correct titles
2. Run `cat .planning/STATE.md` and verify phase structure matches roadmap
3. Run `ls .planning/phases/` and verify new directories exist
4. Run `cat .planning/phases/README.md` and verify plan mapping is documented
5. Verify Phase 2 now focuses only on board generation
6. Verify Phase 3 covers initial placement
7. Verify Phase 4 covers turn structure and resources
8. Verify old phases 3-6 are now phases 5-8
</verification>

<success_criteria>
- Phase 2 reduced from 11 requirements to 3 (BOARD-01, BOARD-02, BOARD-03)
- Phase 3 created with 2 requirements (BOARD-04, BOARD-05)
- Phase 4 created with 6 requirements (TURN-01 through TURN-04, RES-01, RES-02)
- All subsequent phases renumbered correctly (+3 offset)
- ROADMAP.md and STATE.md are consistent
- Plan-to-phase mapping documented for execution clarity
- No git history or references broken by physical file moves
</success_criteria>

<output>
After completion, create `.planning/quick/001-split-out-phase-2-into-smaller-phases/001-SUMMARY.md`
</output>
