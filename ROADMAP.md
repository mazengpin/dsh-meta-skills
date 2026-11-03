# ROADMAP — dsh-meta-skills

**Version `0.9.0` is a PRE-RELEASE.** It is published on the `next` dist-tag and it is under active development: the surface below is what `1.0.0` still requires, not a wish list appended after the fact.

## What this package is

The skills half: the fused family entry that presents skill selection, recall and promotion as one surface rather than three.

## What is measured today

Pre-release metadata complete and mounted: the client half registers ONE `sidebar.panellist` nav row for the fused family, and the package is served to the web client of the profile `personal-stable`.
Its own harnesses are measured rather than inferred from a sibling: `node verify/parity.mjs` returns **64 of 64 checks, 46 of 46 route capabilities driven, exit 0**, and `node verify/engine.mjs` returns **10 of 10 checks, 2 of 2 mutants RED, exit 0** — both recorded with their census in [`research.md`](research.md) section 2, which is where these numbers are maintained.

## What 1.0.0 still requires — every row checkable

**The roadmap is what [`research.md`](research.md) tests.** A row states the command that decides it and the state that command returns today, so a reader re-runs the row rather than trusting it; a row with no deciding command is not on this roadmap.

| # | Requirement | Command that decides it | State today |
|---|---|---|---|
| 1 | State the package's own verify count, and make that count a gate rather than a report | `node verify/parity.mjs` then `node verify/engine.mjs` — a non-zero exit fails this row | **MET (ran)**: exit `0` twice, `64/64` and `10/10` |
| 2 | Name the owner of each of the four skill operations: selection, recall, promotion and storage | `grep -n "skill-select\|skill-recall\|skill-promote\|skill-store" src/host/engine.ts` — each operation must name one member file | **MET (ran)**: `skill-select.mjs`, `skill-recall.mjs`, `skill-promote.mjs`, `skill-store.mjs`, all owned by `dsh-skill-evolution`; this package owns none |
| 3 | A refusal when two families claim the same skill name, with both sources named | a `verify/parity.mjs` case staging one name under two roots and asserting the typed refusal | **NOT MET**: no such case exists, and the `64/64` above does not include it |
| 4 | One falsifier per fused row, so a fused surface that silently drops a member is caught | `node verify/engine.mjs` mutants, plus one driven falsifier per family row in `verify/parity.mjs` | **PARTIAL**: `2/2` engine mutants go RED; `verify/parity.mjs` names its four falsifiers in the module header but drives none of them as a check |

## Limits, stated rather than implied

The fused surface composes four operations that a sibling package already implements; a second store would be a second set of rules for one decision.
No row above claims a live mount: both harnesses run in-process over the built `lib/`, and `verify/parity.mjs --live` is not part of the census cited above.

## Compatibility seam

Neighbours `dsh-skill-evolution` (select/recall/promote/store plus an evolve loop) and rolebox`s skill loader — build on the seam, never beside it.

## How this roadmap is graded

An item is DONE only when a command proves it and the command is named here. An item that is only described is not done, and a roadmap whose items all read as prose is a plan, not a state.
