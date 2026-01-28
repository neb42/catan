---
status: resolved
trigger: 'Continue debugging road-outer-edge-placement - NEW SYMPTOM: placement circles wrong position'
created: 2026-01-28T08:00:00Z
updated: 2026-01-28T08:15:00Z
---

## Current Focus

hypothesis: ROOT CAUSE CONFIRMED - Placement circle uses unmodified `midpoint` while road preview uses offset `start/end`
test: Apply offset to midpoint or recalculate midpoint after offsetting start/end
expecting: Placement circles will appear at same position as the road preview line
next_action: Modify EdgeMarker.tsx to recalculate midpoint after applying boundary edge offset

## Symptoms

expected: Placement circles should appear on the outer edge (matching where the road renders)
actual: Placement circles appear in wrong position (inside tile) on outer edges for both hover preview and post-click states
errors: None
reproduction: Hover over or click on any outer board edge to place a road
started: Noticed after fixing the road rendering - circles weren't updated with same offset logic

## Eliminated

## Evidence

- timestamp: 2026-01-28T08:05:00Z
  checked: EdgeMarker.tsx component (lines 21-72, 95-114)
  found: Boundary edge offset logic only applies to `start` and `end` points when `isSelected` is true (lines 27-72). The placement circle at lines 95-114 uses `midpoint.x` and `midpoint.y` which are never updated with the offset.
  implication: The circle always renders at the original midpoint position, while the road preview renders at the offset position. This causes the visual mismatch on boundary edges.

- timestamp: 2026-01-28T08:07:00Z
  checked: EdgeMarker.tsx offset logic flow
  found: The offset calculation only happens inside `if (isBoundaryEdge && isSelected)` block and only modifies local `start` and `end` variables. The `midpoint` destructured at line 21 is never recalculated after the offset.
  implication: Need to recalculate midpoint after applying offset to start/end, OR apply the same offset to the midpoint directly.

## Resolution

root_cause: The placement circle uses the original `midpoint` position which is not updated when boundary edge offset is applied. The offset logic only modifies `start` and `end` points for the road preview line, but the circle at lines 95-114 still references the unmodified `midpoint.x` and `midpoint.y`. Additionally, the offset was only applied when `isSelected` was true, so hover previews were also misaligned.

fix:

1. Recalculate midpoint after applying offset to start/end points
2. Remove the `&& isSelected` condition so offset applies to both hover and selected states

verification:

- All unit tests pass (web: 2, api: 17, shared: 26)
- Build succeeds without errors
- Fix addresses both hover preview circles (not selected) and post-click circles (selected)
- Midpoint now correctly recalculated after offset applied to start/end
- Placement circles will now appear at the same position as the road preview line on boundary edges

files_changed:

- apps/web/src/components/Board/EdgeMarker.tsx
