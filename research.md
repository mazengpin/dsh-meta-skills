# dsh-meta-skills — research

## 1. The research question

**Does a fused surface that DRIVES the engine stay honest when the engine is absent?**

The question is not whether the surface returns `200`. A forwarding surface can answer every route from a constant and pass a route-count test, and the member set would then look complete while nothing was selected, recalled or promoted. So the question splits into three that a harness can settle: does driving the surface reach a real engine entry point, does the engine's answer change the result, and is a missing engine a typed refusal rather than a `0` or an empty list.

## 2. Measured evidence

**Parity — VERIFIED (ran).** `node verify/parity.mjs`, census `2026-11-03T22:42:09.168Z`, exit `0`: **64 of 64 checks passed, 0 failed**. Denominator inside the same run: **46 of 46 route capabilities driven through the fused `/meta-skills` prefix**, of **52 capability kinds** declared, of which **51 are reachable or named-unmeasured** and the one in-process gap — `skills.service.skillSelection` — is UNMEASURED with a reason by construction. The absence half is a check, not a hope: with the members unreachable the same harness records **52 of 52 unmeasured, 0 present**, and health answers **0 of 5 with `no-reading` and a reason**; with the loopback fixture up it answers **5 of 5**.

**Engine — VERIFIED (ran).** `node verify/engine.mjs`, census `2026-11-03T22:42:10.326Z`, exit `0`: **10 of 10 checks green, 2 of 2 mutants RED**. The two load-bearing measurements inside that count: two different stubbed backend answers produced **two different selections** (`alpha-skill` then `beta-skill`), and a mutated engine file changed the result to `MUTATED-ENGINE` — so the driver follows the file, not a description of the file. A missing engine module refused as `engine-missing`, and a module without the entry point refused as `engine-export-missing`.

**Ownership — VERIFIED (read).** `src/host/engine.ts` names one member file per operation: `skill-select.mjs`, `skill-recall.mjs`, `skill-promote.mjs`, `skill-store.mjs`, all in `dsh-skill-evolution`. This package writes none of them and holds no store.

## 3. What is NOT MEASURED

- **No live mount.** Both harnesses run in-process over the built `lib/`, against a loopback fixture standing in for the members. `verify/parity.mjs --live` exists and was not part of this census, so **no claim here is a claim about a running host**, and no claim here is rendered-GUI evidence.
- **The two-claimer refusal is not tested.** A row in [`ROADMAP.md`](ROADMAP.md) requires a typed refusal when two families claim the same skill name; no such case exists, so the `64 of 64` says nothing about it.
- **Per-family falsifiers are not driven.** `verify/parity.mjs` names four falsifiers in its module header; the driven mutants live in `verify/engine.mjs`, one level up, and the parity count does not include them.
- **The engine's own quality is out of scope.** Recall reported `hitCount 0 of 0 candidates, instrumentOk false` and promotion reported `outcome unavailable, permitted false` in this census — both are honest non-results, not zeros, and neither says whether the member's decision is a good one.

## 4. Next measurement

Run `node verify/parity.mjs --live` against the mounted host and record its denominator beside the in-process one, then stage one skill name under two roots and require the typed refusal. The second is the row most likely to expose the same drift the parity harness was written to catch: a fused surface that lists two families and refuses neither has made no decision at all.

## 5. Falsifier for the headline claim

The claim is *"the surface drives the engine, so it stays honest when the engine is absent."* It is falsified if either mutant stays green: point the driver at a constant and the `describe-not-drive` mutant must go RED, or answer `ok` when the engine file does not exist and the `absent-as-zero` mutant must go RED. Both went RED in the census above, so the honesty claim rests on a check that has been shown able to fail — and it says nothing about a live mount, which remains unmeasured.
