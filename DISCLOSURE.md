# dsh-meta-skills — DISCLOSURE

> **State: SOURCE PREVIEW — information-providing only.** Readable; NOT installable from source. An install arrives only with the published pre-release tarball on the `next` dist-tag.

## 1. What this package is

`dsh-meta-skills` (v0.9.0) is the **fused family entry** for the skills / tools evolution family, built under decision `D-0352`.
It presents skill **selection**, **recall** and **promotion** as one surface, plus the round and member controls the members already expose.
It does this with one route prefix (`/meta-skills`) and one sidebar row, composing five member plugins while every member stays installed, registered and loaded.
The five members are `dsh-skill-evolution`, `dsh-tools-skills-evolve`, `dsh-recall-console`, `dsh-evolution-console` and `dsh-skill-studio`.
Nothing is re-implemented: each family namespace forwards to the matching member prefix on the request `Host` authority and returns the member bytes untouched.

## 2. What it does today

**The measured harness count below is this package's own, run once for this disclosure; it is NOT inherited from a sibling package.**
Command `node verify/parity.mjs` (the `verify` script, `package.json:55`), census `2026-11-03T20:03:34.234Z`: **55 of 57 checks passed, 2 failed, exit code 1, `VERDICT: FAIL`.**
The denominator is the run's own arithmetic: the ledger closes at **46 capabilities — 40 route + 5 seat + 1 in-process**, and **45 of 46 are reachable or named-unmeasured as designed**, the one in-process gap (`skills.service.skillSelection`) UNMEASURED with a reason by construction.
Route capabilities driven through the fused surface: **40 of 40**. With the loopback fixture up, health answers **5 of 5** members; with it down, **0 of 5** answer and all five report `no-reading` with a reason rather than a zero.
**The two failures are named.** (i) `population: gate routes` — the ledger declares **5** gate routes while `dsh-tools-skills-evolve` dispatches **7** (`state`, `knobs`, `registry`, `metaControl`, `decide`, `toolControl`, `toolView`). (ii) `citations` — **5 unresolved** cited lines, at `dsh-tools-skills-evolve/src/host/routes.ts:218,223,234,239,251`, each of which no longer contains the token the ledger cites.
Both are member drift caught by this package's own census, and they are reported here rather than repaired in a disclosure pass.

**The one structural fact: this package registers exactly ONE `sidebar.panellist` nav row for the fused family.**
The row id is `dsh-meta-skills:skills`, equal to the keyed `main` panel key, at order `6.45`; no `priority` is registered anywhere, so the entry can only add a row and never take another plugin seat.
That is measured by the harness, not read from prose: `seat: the fused client registers exactly ONE sidebar entry, under its OWN keyed id — row id dsh-meta-skills:skills === main key; slots: main + sidebar.panellist; no priority`.
**It is served to the web client of the profile `personal-stable`.** `profiles-tree/personal-stable/package.json:13` carries `"dsh-meta-skills": "link:../../plugins-src/dsh-meta-skills"`, and line `33` lists `dsh-meta-skills` inside `dsh.profile.bundles`.
The client half declares `dsh.client.platform = "web"` (`package.json:45`), and the bundle patch `cordis.patch.yml` inserts exactly one loader row whose name equals the package name.

## 3. What it does NOT do — and the ownership problem, plainly

`dsh-meta-skills` owns **no selection, no recall, no promotion and no storage**. It serves none of those; it forwards.
**All four already live in `plugins-src/dsh-skill-evolution`**: `skill-select.mjs` (31,818 B), `skill-recall.mjs` (20,055 B), `skill-promote.mjs` (17,691 B) and `skill-store.mjs` (27,498 B), with a fifth file, the evolve loop `skill-evolve-loop.mjs` (33,417 B), owning the rounds.
**So this package must either DRIVE those files or be deleted.** There is no honest third option: a fused surface that re-implemented them would be a **second store holding a second set of rules for one decision**, and the two would diverge exactly where the decision is made.
The rule it is built to satisfy is stated in its own README: **it writes no file and owns no state; the members remain the only writers**.
**The two failures in section 2 are that risk arriving on time**: a ledger that copies a member route list goes stale the moment the member grows a route, which is the drift a forwarding surface exists to avoid. The answer is to recount, not to copy harder.

## 4. Data it reads and writes, with paths

**This package reads no skill root and writes no skill root — 0 of 0 paths.** Measured: **0 of 11** source files under `src/` (`src/host/` 5, `src/shared/` 1, `src/client/` 5) import `node:fs`; the only Node builtin imported anywhere is `node:http`.
It reads the **network**, not the disk: the member HTTP responses, forwarded byte for byte.
**The skill root belongs to the members, so the ordering question has this answer: there is no fallback chain here to order.** `dsh-skill-studio` names exactly ONE scanned root as a named export, `ACTIVE_SKILL_ROOT = <workspace>/.agents/skills` (`plugins-src/dsh-skill-studio/src/host/config.ts:39`).
Its siblings in that same file: `PROMOTION_ROOT` is the same directory, `STAGING_ROOT = <workspace>/state/skill-staging`, `LEDGER_PATH = <workspace>/research/skill-studio-ledger.jsonl`, and `<workspace>` is `C:/Users/0000/Projects/deepseek-root/profiles-tree/personal-dev/dsh-meta-evolve_INIT_WORKSPACE` (`config.ts:32`).
The derived candidates the harness would otherwise try (`<workspace>/.dsh/skills`, then `<workspace>/.agents/skills`) are **not** scanned by the studio; `config.ts:12-16` records why — a derived root is selection that does not select, the defect that member exists to prevent.

## 5. Network

**No model call. No GPU.** This package holds no inference client, no embedding call and no device handle.
It opens one outbound HTTP request per forwarded call, to a member on the same host, and nothing else.
The card is reached only through `llama.cpp` and its controlling scripts; there is no Cordis-to-GPU connection here, and this package adds none.
The members may call models; if they do, that is theirs to declare and theirs to disclose.

## 6. Security posture

**An installed skill is executable instruction**, so the trust boundary is the skill root, not this package.
**Who can write to the root:** the root is a plain directory (`<workspace>/.agents/skills`), and the only writer is the member store, running as the **same OS user** as the host process. There is no privilege separation, no signing step and no per-skill permission model in front of it, so anyone who can write as that user can install a skill the loader will later execute as instruction.
**Whether a write is atomic and validated: it is both, and that is measured rather than claimed.** `dsh-skill-evolution/skill-store.mjs:464` `writeSkillFileAtomic` validates the **rendered** skill before anything touches the disk (`:477`, `:484` — it refuses, it does not warn), writes `SKILL.md.<pid>.tmp`, reads the staged file back and refuses a torn write when the bytes differ (`:514`), then publishes with `renameSync(temp, SKILL.md)` as the atomicity primitive (`:521`).
The Windows caveat is recorded at that source rather than hidden: `renameSync` is not unconditional there, the `EPERM` retry was **measured on this host** by `runner/t6-atomic-observation.mjs`, and the failed shape — validated, then not published — is the one the code guards.
**This package widens none of that**: it writes no file, adds no route outside `/meta-skills`, and forwards `cookie` deliberately because a member runs `ctx.connection.admit(req)` before it inspects the method.

## 7. Licence and engines

**Licence: MIT** — `LICENSE` (1,070 B), `package.json:16`. **`engines`** (`package.json:18-21`): `"node": ">=22"`, `"dsh": ">=0.2.0-rc.2"`.
**There is no `repository` field, and this disclosure does not invent one.** The release owner sets it at publish time, together with the `next` dist-tag already declared at `package.json:66-68`.

## 8. State: SOURCE PREVIEW — information-providing only

**Readable. NOT installable from source.**
A clone, a build and a relative `link:` are steps for **developing** this package; they are not an install path for a consumer.
A consumer installs the **published pre-release only** — `dsh-meta-skills@next` — and that tarball is what replaces this source preview.
No install spec is written here from memory, and that tarball does not exist yet: this is `0.9.0`, `"status": "pre-release"` (`package.json:69`).
