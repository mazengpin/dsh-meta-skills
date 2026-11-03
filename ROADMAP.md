# ROADMAP — dsh-meta-skills

**Version `0.9.0` is a PRE-RELEASE.** It is published on the `next` dist-tag and it is under active development: the surface below is what `1.0.0` still requires, not a wish list appended after the fact.

## What this package is

The skills half: the fused family entry that presents skill selection, recall and promotion as one surface rather than three.

## What is measured today

Pre-release metadata complete and mounted: the client half registers ONE `sidebar.panellist` nav row for the fused family, and the package is served to the web client of the profile `personal-stable`. Its own harness count is NOT MEASURED in this round and is stated as such rather than inferred from a sibling.

## What 1.0.0 still requires

1. State the package`s own verify count, and make that count a gate rather than a report.
2. Name the owner of each of the four skill operations: selection, recall, promotion and storage already live in `dsh-skill-evolution`; this package must either drive them or be deleted.
3. A refusal when two families claim the same skill name, with both sources named.
4. One falsifier per fused row, so a fused surface that silently drops a member is caught.

## Limits, stated rather than implied

The fused surface composes four operations that a sibling package already implements; a second store would be a second set of rules for one decision.

## Compatibility seam

Neighbours `dsh-skill-evolution` (select/recall/promote/store plus an evolve loop) and rolebox`s skill loader — build on the seam, never beside it.

## How this roadmap is graded

An item is DONE only when a command proves it and the command is named here. An item that is only described is not done, and a roadmap whose items all read as prose is a plan, not a state.
